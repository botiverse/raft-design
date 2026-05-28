import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { CURRENT_LEGAL_ACCEPTANCE } from "@slock-ai/shared";

import { getDb } from "../db/index.js";
import { userLegalAcceptances, users } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { createSocialAuthCompletion } from "../services/socialAuthService.js";

const ONE_BY_ONE_GIF = Buffer.from(
  "R0lGODdhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
  "base64",
);

async function seedUser(email: string, name: string) {
  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({
      email,
      name,
      displayName: name,
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();
  return user;
}

async function login(baseUrl: string, email: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  assert.equal(res.status, 200, `login failed for ${email}`);
  const data = await res.json() as { accessToken: string };
  return data.accessToken;
}

async function findUserByEmail(email: string) {
  const [user] = await getDb().select().from(users).where(eq(users.email, email));
  return user;
}

async function getLegalAcceptanceForUser(userId: string) {
  const [acceptance] = await getDb()
    .select()
    .from(userLegalAcceptances)
    .where(eq(userLegalAcceptances.userId, userId));
  return acceptance;
}

test("POST /api/auth/login returns a stable code for incorrect credentials", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await seedUser("wrong-password@slock.test", "wrong-password");

    const res = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: "not-the-password" }),
    });

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), {
      code: "AUTH_INVALID_CREDENTIALS",
      error: "Invalid email or password",
    });
  } finally {
    await app.close();
  }
});

test("PATCH /api/auth/me returns a stable code for incorrect current password", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await seedUser("current-password@slock.test", "current-password");
    const token = await login(app.baseUrl, user.email);

    const res = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword: "wrong-password", newPassword: "new-password-123" }),
    });

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), {
      code: "AUTH_CURRENT_PASSWORD_INCORRECT",
      error: "Current password is incorrect",
    });
  } finally {
    await app.close();
  }
});

test("POST /api/auth/register requires legal acceptance", async () => {
  const app = await startTestApp("pglite://");
  try {
    const res = await fetch(`${app.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "legal-missing@slock.test",
        password: "password123",
        name: "legal-missing",
      }),
    });
    assert.equal(res.status, 422);
    const body = await res.json() as { error: string; legal: { termsVersion: string; privacyVersion: string } };
    assert.equal(body.error, "LEGAL_ACCEPTANCE_REQUIRED");
    assert.equal(body.legal.termsVersion, CURRENT_LEGAL_ACCEPTANCE.termsVersion);
    assert.equal(await findUserByEmail("legal-missing@slock.test"), undefined);
  } finally {
    await app.close();
  }
});

test("POST /api/auth/register writes append-only legal acceptance for current versions", async () => {
  const app = await startTestApp("pglite://");
  try {
    const res = await fetch(`${app.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "legal-test-agent",
        "Accept-Language": "en-US",
      },
      body: JSON.stringify({
        email: "legal-ok@slock.test",
        password: "password123",
        name: "legal-ok",
        acceptTerms: true,
        termsVersion: CURRENT_LEGAL_ACCEPTANCE.termsVersion,
        privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { user: { id: string } };

    const acceptance = await getLegalAcceptanceForUser(body.user.id);
    assert.equal(acceptance?.termsVersion, CURRENT_LEGAL_ACCEPTANCE.termsVersion);
    assert.equal(acceptance?.privacyVersion, CURRENT_LEGAL_ACCEPTANCE.privacyVersion);
    assert.equal(acceptance?.termsUrl, CURRENT_LEGAL_ACCEPTANCE.termsUrl);
    assert.equal(acceptance?.privacyUrl, CURRENT_LEGAL_ACCEPTANCE.privacyUrl);
    assert.equal(acceptance?.source, "signup");
    assert.ok(acceptance?.userAgentHash, "user agent evidence is hashed, not stored raw");
    assert.equal(acceptance?.locale, "en-US");
  } finally {
    await app.close();
  }
});

test("POST /api/auth/register records invite source for invite account creation", async () => {
  const app = await startTestApp("pglite://");
  try {
    const res = await fetch(`${app.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "legal-invite@slock.test",
        password: "password123",
        name: "legal-invite",
        acceptTerms: true,
        termsVersion: CURRENT_LEGAL_ACCEPTANCE.termsVersion,
        privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
        legalAcceptanceSource: "invite",
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { user: { id: string } };
    const acceptance = await getLegalAcceptanceForUser(body.user.id);
    assert.equal(acceptance?.source, "invite");
  } finally {
    await app.close();
  }
});

test("POST /api/auth/register rejects stale legal versions before creating user", async () => {
  const app = await startTestApp("pglite://");
  try {
    const res = await fetch(`${app.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "legal-stale@slock.test",
        password: "password123",
        name: "legal-stale",
        acceptTerms: true,
        termsVersion: "old-terms",
        privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
      }),
    });
    assert.equal(res.status, 409);
    const body = await res.json() as { error: string };
    assert.equal(body.error, "TERMS_CHANGED");
    assert.equal(await findUserByEmail("legal-stale@slock.test"), undefined);
  } finally {
    await app.close();
  }
});

test("social first-login account creation requires legal acceptance", async () => {
  const app = await startTestApp("pglite://");
  try {
    const code = await createSocialAuthCompletion({
      provider: "google",
      mode: "login",
      intendedAction: "login",
      providerUserId: "google-legal-user",
      providerEmail: "google-legal@slock.test",
      providerDisplayName: "Google Legal",
      providerAvatarUrl: "https://example.test/avatar.png",
      returnTo: "/",
    });

    const missing = await fetch(`${app.baseUrl}/api/auth/google/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    assert.equal(missing.status, 422);
    assert.equal(await findUserByEmail("google-legal@slock.test"), undefined);

    const accepted = await fetch(`${app.baseUrl}/api/auth/google/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        acceptTerms: true,
        termsVersion: CURRENT_LEGAL_ACCEPTANCE.termsVersion,
        privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
      }),
    });
    assert.equal(accepted.status, 200);
    const body = await accepted.json() as { accessToken: string; refreshToken: string };
    assert.ok(body.accessToken);
    assert.ok(body.refreshToken);

    const user = await findUserByEmail("google-legal@slock.test");
    assert.ok(user);
    const [acceptance] = await getDb()
      .select()
      .from(userLegalAcceptances)
      .where(and(
        eq(userLegalAcceptances.userId, user.id),
        eq(userLegalAcceptances.source, "oauth"),
      ));
    assert.equal(acceptance?.termsVersion, CURRENT_LEGAL_ACCEPTANCE.termsVersion);
  } finally {
    await app.close();
  }
});

test("POST /api/auth/me/avatar uploads current user avatar", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await seedUser("human-avatar@slock.test", "human-avatar");
    const token = await login(app.baseUrl, user.email);

    const formData = new FormData();
    formData.set("avatar", new Blob([ONE_BY_ONE_GIF], { type: "image/gif" }), "avatar.gif");

    const res = await fetch(`${app.baseUrl}/api/auth/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { avatarUrl: string | null };
    assert.match(body.avatarUrl ?? "", /^\/api\/avatars\/users\/[0-9a-f]+\.webp$/);

    const getRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json() as { avatarUrl: string | null };
    assert.equal(getBody.avatarUrl, body.avatarUrl);
  } finally {
    await app.close();
  }
});

test("GET /api/auth/me returns current user's gravatar hash", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await seedUser("gravatar-self@slock.test", "gravatar-self");
    const token = await login(app.baseUrl, user.email);

    const res = await fetch(`${app.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { gravatarHash: string };
    assert.equal(
      body.gravatarHash,
      createHash("sha256").update(user.email.trim().toLowerCase()).digest("hex"),
    );
  } finally {
    await app.close();
  }
});
