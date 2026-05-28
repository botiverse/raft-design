import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import argon2 from "argon2";

import { users } from "../db/schema.js";
import { getDb } from "../db/index.js";
import { startTestApp } from "../test/testAppHarness.js";
import { addMember, createServer } from "../services/serverService.js";
import { createOAuthClient } from "../services/oauthService.js";

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

test("PATCH /api/integrations/clients/:clientId updates registered app metadata", async () => {
  const app = await startTestApp("pglite://");
  try {
    const suffix = randomUUID();
    const owner = await seedUser(`integrations-owner-${suffix}@slock.test`, `integrations-owner-${suffix}`);
    const member = await seedUser(`integrations-member-${suffix}@slock.test`, `integrations-member-${suffix}`);
    const server = await createServer("Integrations Settings", `integrations-settings-${suffix}`, owner.id);
    await addMember(server.id, member.id, "member");
    const { client } = await createOAuthClient({
      serverId: server.id,
      createdByUserId: owner.id,
      clientId: `integrations-${suffix.slice(0, 8)}`,
      name: "Original App",
      description: "Original description",
      homepageUrl: "https://old.example.test",
      returnUrl: "https://old.example.test/callback",
    });

    const ownerToken = await login(app.baseUrl, owner.email);
    const memberToken = await login(app.baseUrl, member.email);
    const patch = (token: string, body: unknown) => fetch(`${app.baseUrl}/api/integrations/clients/${client.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const memberRes = await patch(memberToken, { name: "Member Edit" });
    assert.equal(memberRes.status, 403);

    const ownerRes = await patch(ownerToken, {
      name: "Updated App",
      description: "Updated description",
      homepageUrl: "https://new.example.test",
      returnUrl: "https://new.example.test/oauth/callback",
    });
    assert.equal(ownerRes.status, 200);
    const updated = await ownerRes.json() as {
      clientId: string;
      clientSecret?: string;
      name: string;
      description: string | null;
      homepageUrl: string | null;
      returnUrl: string | null;
    };
    assert.equal(updated.clientId, client.clientId);
    assert.equal(updated.clientSecret, undefined);
    assert.equal(updated.name, "Updated App");
    assert.equal(updated.description, "Updated description");
    assert.equal(updated.homepageUrl, "https://new.example.test");
    assert.equal(updated.returnUrl, "https://new.example.test/oauth/callback");

    const listRes = await fetch(`${app.baseUrl}/api/integrations/clients`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(listRes.status, 200);
    const clients = await listRes.json() as Array<{ id: string; name: string; returnUrl: string | null }>;
    const listed = clients.find((item) => item.id === client.id);
    assert.ok(listed);
    assert.equal(listed.name, "Updated App");
    assert.equal(listed.returnUrl, "https://new.example.test/oauth/callback");

    const invalidRes = await patch(ownerToken, { name: " " });
    assert.equal(invalidRes.status, 400);
  } finally {
    await app.close();
  }
});
