import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { users } from "../db/schema.js";
import * as announcementService from "../services/announcementService.js";

async function login(baseUrl: string, email: string, password = "password123"): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200, `login failed for ${email}`);
  const data = await res.json() as { accessToken: string };
  return data.accessToken;
}

async function createVerifiedUser(email: string) {
  const db = getDb();
  const [user] = await db.insert(users).values({
    email,
    name: email.split("@")[0],
    displayName: email.split("@")[0],
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  return user;
}

test("GET /active returns only the latest announcement (older rows are not surfaced)", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await createVerifiedUser("ann-latest@slock.test");

    await announcementService.publish({ title: "First", pages: [{ body: "page one" }] });
    const second = await announcementService.publish({
      title: "Second",
      pages: [{ title: "p1", body: "body1" }, { body: "body2" }],
    });

    const token = await login(app.baseUrl, user.email);
    const res = await fetch(`${app.baseUrl}/api/announcements/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json() as { announcements: Array<{ id: string; title: string; pages: unknown[] }> };
    assert.equal(data.announcements.length, 1, "only one announcement is ever surfaced");
    assert.equal(data.announcements[0].id, second.id, "the most recently published row wins");
    assert.equal(data.announcements[0].pages.length, 2, "pages payload survives round-trip");
  } finally {
    await app.close();
  }
});

test("dismissed latest announcement disappears for that user; re-publishing surfaces a new row", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await createVerifiedUser("ann-dismiss@slock.test");

    const first = await announcementService.publish({ title: "First", pages: [{ body: "a" }] });

    const token = await login(app.baseUrl, user.email);
    const authHeader = { Authorization: `Bearer ${token}` };

    // Dismiss it.
    const dismissRes = await fetch(`${app.baseUrl}/api/announcements/${first.id}/dismiss`, {
      method: "POST",
      headers: authHeader,
    });
    assert.equal(dismissRes.status, 200);

    // Now /active is empty for this user.
    const afterDismiss = await fetch(`${app.baseUrl}/api/announcements/active`, { headers: authHeader });
    const afterData = await afterDismiss.json() as { announcements: Array<{ id: string }> };
    assert.deepEqual(afterData.announcements, [], "dismissed latest no longer surfaces");

    // Publishing a new row replaces the latest — user sees the new one.
    const second = await announcementService.publish({ title: "Second", pages: [{ body: "b" }] });
    const afterRepublish = await fetch(`${app.baseUrl}/api/announcements/active`, { headers: authHeader });
    const republishData = await afterRepublish.json() as { announcements: Array<{ id: string }> };
    assert.deepEqual(republishData.announcements.map((x) => x.id), [second.id]);

    // Double-dismissing is idempotent (no 500).
    const dismissAgain = await fetch(`${app.baseUrl}/api/announcements/${first.id}/dismiss`, {
      method: "POST",
      headers: authHeader,
    });
    assert.equal(dismissAgain.status, 200);
  } finally {
    await app.close();
  }
});

test("a user's dismissal does not affect other users (account-scoped, per-user)", async () => {
  const app = await startTestApp("pglite://");
  try {
    const alice = await createVerifiedUser("ann-alice@slock.test");
    const bob = await createVerifiedUser("ann-bob@slock.test");

    const a = await announcementService.publish({ title: "Global notice", pages: [{ body: "hi" }] });

    const aliceToken = await login(app.baseUrl, alice.email);
    const bobToken = await login(app.baseUrl, bob.email);

    await fetch(`${app.baseUrl}/api/announcements/${a.id}/dismiss`, {
      method: "POST",
      headers: { Authorization: `Bearer ${aliceToken}` },
    });

    // Alice should no longer see it.
    const aliceRes = await fetch(`${app.baseUrl}/api/announcements/active`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert.deepEqual(
      (await aliceRes.json() as { announcements: Array<{ id: string }> }).announcements,
      [],
    );

    // Bob still sees it — dismissal is per-user, not global.
    const bobRes = await fetch(`${app.baseUrl}/api/announcements/active`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    const bobData = await bobRes.json() as { announcements: Array<{ id: string }> };
    assert.deepEqual(bobData.announcements.map((x) => x.id), [a.id]);
  } finally {
    await app.close();
  }
});

test("dismissing a nonexistent announcement returns 404", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await createVerifiedUser("ann-404@slock.test");
    const token = await login(app.baseUrl, user.email);

    const res = await fetch(`${app.baseUrl}/api/announcements/00000000-0000-0000-0000-000000000000/dismiss`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 404);
  } finally {
    await app.close();
  }
});

test("GET /active requires authentication", async () => {
  const app = await startTestApp("pglite://");
  try {
    const res = await fetch(`${app.baseUrl}/api/announcements/active`);
    assert.equal(res.status, 401);
  } finally {
    await app.close();
  }
});

test("POST / (publish) is not exposed — campaigns are created via DB INSERT only", async () => {
  const app = await startTestApp("pglite://");
  try {
    const res = await fetch(`${app.baseUrl}/api/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "X", pages: [{ body: "x" }] }),
    });
    // Express returns 404 for an unmounted POST handler.
    assert.equal(res.status, 404, "no public publish endpoint should exist");
  } finally {
    await app.close();
  }
});

