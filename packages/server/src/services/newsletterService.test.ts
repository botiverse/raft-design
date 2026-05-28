import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { CURRENT_LEGAL_ACCEPTANCE } from "@slock-ai/shared";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { newsletterAudienceContacts, newsletterWebhookEvents, users } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import {
  backfillNewsletterAudience,
  resetNewsletterTestOverrides,
  setNewsletterConfigForTest,
  setNewsletterContactClientForTest,
  syncNewsletterSignup,
} from "./newsletterService.js";

const SEGMENT_ID = "78261eea-8f8b-4381-83c6-79fa7120f1cf";
const WEBHOOK_SECRET = `whsec_${Buffer.from("newsletter-webhook-secret").toString("base64")}`;

function signPayload(payload: Buffer, id = "msg_test") {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", Buffer.from(WEBHOOK_SECRET.slice("whsec_".length), "base64"))
    .update(`${id}.${timestamp}.${payload.toString("utf8")}`)
    .digest("base64");
  return {
    id,
    timestamp,
    signature: `v1,${signature}`,
  };
}

async function seedUser(email: string, name: string) {
  const [user] = await getDb().insert(users).values({
    email,
    name,
    displayName: name,
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  return user;
}

test.afterEach(async () => {
  resetNewsletterTestOverrides();
  await closeDatabase().catch(() => {});
});

test("signup newsletter sync is fail-open and records local sync failure", async () => {
  setNewsletterConfigForTest({ apiKey: "re_test", segmentId: SEGMENT_ID });
  setNewsletterContactClientForTest({
    syncContact: async () => {
      throw new Error("resend unavailable");
    },
  });
  const app = await startTestApp();

  try {
    const res = await fetch(`${app.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "signup-fail-open@example.com",
        password: "password123",
        name: "signup-fail-open",
        acceptTerms: true,
        termsVersion: CURRENT_LEGAL_ACCEPTANCE.termsVersion,
        privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
      }),
    });

    assert.equal(res.status, 200);
    const [row] = await getDb()
      .select()
      .from(newsletterAudienceContacts)
      .where(eq(newsletterAudienceContacts.email, "signup-fail-open@example.com"));
    assert.equal(row?.status, "sync_failed");
    assert.match(row?.lastSyncError ?? "", /resend unavailable/);
  } finally {
    await app.close();
  }
});

test("successful signup sync creates a subscribed Resend contact and stores its id", async () => {
  await initDatabase("pglite://");
  const calls: unknown[] = [];
  setNewsletterConfigForTest({ apiKey: "re_test", segmentId: SEGMENT_ID });
  setNewsletterContactClientForTest({
    syncContact: async (input) => {
      calls.push(input);
      return { id: "contact_123" };
    },
  });
  const user = await seedUser("newsletter-user@example.com", "newsletter-user");

  const result = await syncNewsletterSignup(user);

  assert.deepEqual(result, { status: "synced", contactId: "contact_123" });
  assert.deepEqual(calls, [{
    segmentId: SEGMENT_ID,
    email: "newsletter-user@example.com",
    firstName: "newsletter-user",
    unsubscribed: false,
  }]);
  const [row] = await getDb()
    .select()
    .from(newsletterAudienceContacts)
    .where(eq(newsletterAudienceContacts.email, "newsletter-user@example.com"));
  assert.equal(row?.status, "synced");
  assert.equal(row?.resendContactId, "contact_123");
});

test("default Resend client creates a global contact with segment membership", async () => {
  await initDatabase("pglite://");
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; method?: string; body?: unknown }> = [];
  setNewsletterConfigForTest({ apiKey: "re_test", segmentId: SEGMENT_ID, resendMinIntervalMs: 0 });
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({
      url: input.toString(),
      method: init?.method,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    return new Response(JSON.stringify({ id: "contact_global" }), { status: 200 });
  }) as typeof fetch;

  try {
    const user = await seedUser("global-contact@example.com", "global-contact");
    const result = await syncNewsletterSignup(user, { rateLimited: true });

    assert.deepEqual(result, { status: "synced", contactId: "contact_global" });
    assert.deepEqual(requests, [{
      url: "https://api.resend.com/contacts",
      method: "POST",
      body: {
        email: "global-contact@example.com",
        firstName: "global-contact",
        unsubscribed: false,
        segments: [{ id: SEGMENT_ID }],
      },
    }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("default Resend client updates existing contact and idempotently adds it to the segment", async () => {
  await initDatabase("pglite://");
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; method?: string; body?: unknown }> = [];
  setNewsletterConfigForTest({ apiKey: "re_test", segmentId: SEGMENT_ID, resendMinIntervalMs: 0 });
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({
      url: input.toString(),
      method: init?.method,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    if (requests.length === 1) {
      return new Response(JSON.stringify({ message: "contact already exists" }), { status: 409 });
    }
    if (requests.length === 2) {
      return new Response(JSON.stringify({ id: "contact_existing" }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: "segment_membership" }), { status: 200 });
  }) as typeof fetch;

  try {
    const user = await seedUser("existing@example.com", "existing-user");
    const result = await syncNewsletterSignup(user, { rateLimited: true });

    assert.deepEqual(result, { status: "synced", contactId: "contact_existing" });
    assert.deepEqual(requests, [
      {
        url: "https://api.resend.com/contacts",
        method: "POST",
        body: {
          email: "existing@example.com",
          firstName: "existing-user",
          unsubscribed: false,
          segments: [{ id: SEGMENT_ID }],
        },
      },
      {
        url: "https://api.resend.com/contacts/existing%40example.com",
        method: "PATCH",
        body: {
          unsubscribed: false,
        },
      },
      {
        url: `https://api.resend.com/contacts/existing%40example.com/segments/${SEGMENT_ID}`,
        method: "POST",
        body: undefined,
      },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("default Resend client retries retryable Resend rate limits before recording success", async () => {
  await initDatabase("pglite://");
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  setNewsletterConfigForTest({
    apiKey: "re_test",
    segmentId: SEGMENT_ID,
    resendMinIntervalMs: 0,
    resendMaxRetries: 2,
    resendRetryBaseMs: 0,
  });
  globalThis.fetch = (async () => {
    attempts++;
    if (attempts === 1) {
      return new Response(JSON.stringify({ message: "Too many requests" }), { status: 429 });
    }
    return new Response(JSON.stringify({ id: "contact_after_retry" }), { status: 200 });
  }) as typeof fetch;

  try {
    const user = await seedUser("retry-contact@example.com", "retry-contact");
    const result = await syncNewsletterSignup(user, { rateLimited: true });

    assert.equal(attempts, 2);
    assert.deepEqual(result, { status: "synced", contactId: "contact_after_retry" });
    const [row] = await getDb()
      .select()
      .from(newsletterAudienceContacts)
      .where(eq(newsletterAudienceContacts.email, "retry-contact@example.com"));
    assert.equal(row?.status, "synced");
    assert.equal(row?.lastSyncError, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("default Resend client records sync failure after retry budget is exhausted", async () => {
  await initDatabase("pglite://");
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  setNewsletterConfigForTest({
    apiKey: "re_test",
    segmentId: SEGMENT_ID,
    resendMinIntervalMs: 0,
    resendMaxRetries: 1,
    resendRetryBaseMs: 0,
  });
  globalThis.fetch = (async () => {
    attempts++;
    return new Response(JSON.stringify({ message: "Too many requests" }), { status: 429 });
  }) as typeof fetch;

  try {
    const user = await seedUser("retry-exhausted@example.com", "retry-exhausted");
    const result = await syncNewsletterSignup(user, { rateLimited: true });

    assert.equal(attempts, 2);
    assert.equal(result.status, "failed");
    const [row] = await getDb()
      .select()
      .from(newsletterAudienceContacts)
      .where(eq(newsletterAudienceContacts.email, "retry-exhausted@example.com"));
    assert.equal(row?.status, "sync_failed");
    assert.match(row?.lastSyncError ?? "", /Too many requests/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("realtime signup sync records retryable rate limits without blocking for retries", async () => {
  await initDatabase("pglite://");
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  setNewsletterConfigForTest({
    apiKey: "re_test",
    segmentId: SEGMENT_ID,
    resendMinIntervalMs: 0,
    resendMaxRetries: 2,
    resendRetryBaseMs: 0,
  });
  globalThis.fetch = (async () => {
    attempts++;
    return new Response(JSON.stringify({ message: "Too many requests" }), { status: 429 });
  }) as typeof fetch;

  try {
    const user = await seedUser("realtime-429@example.com", "realtime-429");
    const result = await syncNewsletterSignup(user);

    assert.equal(attempts, 1);
    assert.equal(result.status, "failed");
    const [row] = await getDb()
      .select()
      .from(newsletterAudienceContacts)
      .where(eq(newsletterAudienceContacts.email, "realtime-429@example.com"));
    assert.equal(row?.status, "sync_failed");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Resend unsubscribe webhook persists local opt-out state idempotently", async () => {
  setNewsletterConfigForTest({ segmentId: SEGMENT_ID, webhookSecret: WEBHOOK_SECRET });
  const app = await startTestApp();

  try {
    const user = await seedUser("unsubscribe@example.com", "unsubscribe-user");
    const payload = Buffer.from(JSON.stringify({
      type: "contact.updated",
      data: {
        email: "unsubscribe@example.com",
        unsubscribed: true,
      },
    }));
    const headers = signPayload(payload, "msg_unsubscribe");

    const first = await fetch(`${app.baseUrl}/api/webhooks/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": headers.id,
        "svix-timestamp": headers.timestamp,
        "svix-signature": headers.signature,
      },
      body: payload,
    });
    const second = await fetch(`${app.baseUrl}/api/webhooks/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": headers.id,
        "svix-timestamp": headers.timestamp,
        "svix-signature": headers.signature,
      },
      body: payload,
    });

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal((await first.json() as { processed: boolean }).processed, true);
    assert.equal((await second.json() as { duplicate: boolean }).duplicate, true);
    const [row] = await getDb()
      .select()
      .from(newsletterAudienceContacts)
      .where(and(
        eq(newsletterAudienceContacts.audienceId, SEGMENT_ID),
        eq(newsletterAudienceContacts.email, "unsubscribe@example.com"),
      ));
    assert.equal(row?.userId, user.id);
    assert.equal(row?.status, "unsubscribed");
    assert.ok(row?.optedOutAt);
    const events = await getDb().select().from(newsletterWebhookEvents).where(eq(newsletterWebhookEvents.id, "msg_unsubscribe"));
    assert.equal(events.length, 1);
  } finally {
    await app.close();
  }
});

test("newsletter backfill skips existing local opt-outs", async () => {
  await initDatabase("pglite://");
  setNewsletterConfigForTest({ apiKey: "re_test", segmentId: SEGMENT_ID });
  const calls: string[] = [];
  setNewsletterContactClientForTest({
    syncContact: async (input) => {
      calls.push(input.email);
      return { id: `contact-${calls.length}` };
    },
  });
  const included = await seedUser("included@example.com", "included-user");
  const optedOut = await seedUser("opted-out@example.com", "opted-out-user");
  await getDb().insert(newsletterAudienceContacts).values({
    userId: optedOut.id,
    email: optedOut.email,
    audienceId: SEGMENT_ID,
    status: "unsubscribed",
    optedOutAt: new Date(),
  });

  const result = await backfillNewsletterAudience({ batchSize: 10 });

  assert.equal(result.scanned, 1);
  assert.equal(result.synced, 1);
  assert.deepEqual(calls, [included.email]);
});
