import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { users } from "../db/schema.js";
import { createServer } from "../services/serverService.js";
import { signAccessToken } from "../middleware/auth.js";
import { verifyScopeAttestation } from "../lib/scopeAttestation.js";

async function seedOwner() {
  const db = getDb();
  const [owner] = await db.insert(users).values({
    email: "web-trace-owner@slock.test",
    name: "web-trace-owner",
    displayName: "Web Trace Owner",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  const server = await createServer("Web Trace Server", "web-trace-server", owner.id);
  return { owner, server };
}

test("POST /api/servers/:id/scope-attestation signs web trace batch capability for server members", async () => {
  const previousSecret = process.env.SCOPE_ATTESTATION_SECRET;
  process.env.SCOPE_ATTESTATION_SECRET = "web-trace-scope-test-secret";
  const app = await startTestApp("pglite://");
  try {
    const { owner, server } = await seedOwner();
    const token = signAccessToken(owner.id);

    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/scope-attestation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Server-Id": server.id,
      },
      body: JSON.stringify({ scope: "web-trace-batch:create" }),
    });

    assert.equal(res.status, 200);
    const body = await res.json() as {
      attestation: string;
      scope: string;
      audience: string;
      resource: string;
      expiresAt: string;
    };
    assert.equal(body.scope, "web-trace-batch:create");
    assert.equal(body.audience, "trace-ingest-worker");
    assert.equal(body.resource, `servers/${server.id}/web-traces`);
    assert.ok(Date.parse(body.expiresAt) > Date.now());

    const claims = verifyScopeAttestation(body.attestation);
    assert.ok(claims);
    assert.equal(claims.scope, "web-trace-batch:create");
    assert.equal(claims.actorType, "user");
    assert.equal(claims.sub, owner.id);
    assert.equal(claims.serverId, server.id);
    assert.equal(claims.aud, "trace-ingest-worker");
    assert.equal(claims.resource, `servers/${server.id}/web-traces`);
  } finally {
    if (previousSecret === undefined) delete process.env.SCOPE_ATTESTATION_SECRET;
    else process.env.SCOPE_ATTESTATION_SECRET = previousSecret;
    await app.close();
  }
});
