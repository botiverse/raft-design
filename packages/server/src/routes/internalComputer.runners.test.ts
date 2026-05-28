import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { getDb } from "../db/index.js";
import { computers, users, agents } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { createServer } from "../services/serverService.js";
import { createAgent } from "../services/agentService.js";
import { mintAgentCredential } from "../services/agentCredentialService.js";
import { generateComputerApiKeyMaterial } from "../services/computerCredentialService.js";

// task #30 PR-C regression guard — GET /internal/computer/runners.
//
// The locked, sign-reviewed contract item is the §12 control-plane
// whitelist enforced SERVER-SIDE (defense-in-depth, NOT a client
// filter). The decisive test: seed an agent whose raw row carries
// recognizable SECRETS (sessionId, envVars), then prove that NO request
// to this endpoint — with a perfectly valid Computer credential — can
// ever surface them. A client-output-only check would false-green a
// future server dump bug; this asserts the server query itself.

const SECRET_SESSION = "session-RESUME-SECRET-do-not-leak-zzz";
const SECRET_ENV_VALUE = "ENVVAR-SECRET-do-not-leak-qqq";
const WHITELIST = ["agentId", "name", "status", "model", "runtime"];

function authHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
}

async function seedComputerWithAgent(): Promise<{
  computerApiKey: string;
  agentApiKey: string;
  agentId: string;
  serverId: string;
  otherServerAgentId: string;
}> {
  const db = getDb();
  const suffix = randomUUID();
  const [owner] = await db
    .insert(users)
    .values({
      email: `runners-${suffix}@slock.test`,
      name: `runners-${suffix}`,
      displayName: "Runners Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();
  const server = await createServer("Runners Test", `runners-${suffix}`, owner.id);
  const agent = await createAgent(server.id, "RunnerBot", { runtime: "claude", model: "sonnet" });

  // Inject recognizable secrets into the raw agents row. They must NEVER
  // appear in the §12 whitelisted response.
  await db
    .update(agents)
    .set({ sessionId: SECRET_SESSION, envVars: { OPENAI_API_KEY: SECRET_ENV_VALUE } })
    .where(eq(agents.id, agent.id));

  // A DIFFERENT server's agent — must not appear (cross-server isolation).
  const otherServer = await createServer("Other Co", `other-${suffix}`, owner.id);
  const otherAgent = await createAgent(otherServer.id, "OtherBot", { runtime: "claude", model: "sonnet" });

  const computerMaterial = await generateComputerApiKeyMaterial();
  await db.insert(computers).values({
    serverId: server.id,
    name: "runners-computer",
    apiKeyHash: computerMaterial.apiKeyHash,
    apiKeyPrefix: computerMaterial.apiKeyPrefix,
    attachedByUserId: owner.id,
  });
  const agentMinted = await mintAgentCredential({
    agentId: agent.id,
    scopes: ["read"],
    name: "runners-agent",
    createdByUserId: null,
  });
  return {
    computerApiKey: computerMaterial.apiKey,
    agentApiKey: agentMinted.apiKey,
    agentId: agent.id,
    serverId: server.id,
    otherServerAgentId: otherAgent.id,
  };
}

test("runners list: §12 whitelist enforced server-side — secrets in the raw row NEVER surface", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedComputerWithAgent();
    const res = await fetch(`${app.baseUrl}/internal/computer/runners`, {
      method: "GET",
      headers: authHeaders(f.computerApiKey),
    });
    assert.equal(res.status, 200);
    const raw = await res.text();
    // Hard redline: the injected secrets cannot appear ANYWHERE in the
    // serialized payload, regardless of structure.
    assert.ok(!raw.includes(SECRET_SESSION), "response leaked sessionId");
    assert.ok(!raw.includes(SECRET_ENV_VALUE), "response leaked an envVars secret");

    const body = JSON.parse(raw) as {
      whitelist: string[];
      runners: Array<Record<string, unknown>>;
    };
    assert.deepEqual(body.whitelist, WHITELIST);

    const mine = body.runners.find((r) => r.agentId === f.agentId);
    assert.ok(mine, "the Computer's own server agent should be listed");
    // The runner object's keys are EXACTLY the whitelist — no extras.
    assert.deepEqual(Object.keys(mine).sort(), [...WHITELIST].sort());
    assert.equal(mine.name, "RunnerBot");

    // Cross-server isolation: another server's agent is not listed.
    assert.ok(
      !body.runners.some((r) => r.agentId === f.otherServerAgentId),
      "cross-server agent must not be listed",
    );
  } finally {
    await app.close();
  }
});

test("runners stop: same-server runner → 200; cross-server → uniform 404 agent_missing", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedComputerWithAgent();

    const ok = await fetch(`${app.baseUrl}/internal/computer/runners/${f.agentId}/stop`, {
      method: "POST",
      headers: authHeaders(f.computerApiKey),
      body: "{}",
    });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json() as { agentId?: string }).agentId, f.agentId);

    // Another server's agent must NOT be stoppable by this Computer —
    // same 404 shape as a genuinely missing agent (no existence leak).
    const cross = await fetch(`${app.baseUrl}/internal/computer/runners/${f.otherServerAgentId}/stop`, {
      method: "POST",
      headers: authHeaders(f.computerApiKey),
      body: "{}",
    });
    assert.equal(cross.status, 404);
    assert.equal((await cross.json() as { code?: string }).code, "agent_missing");
  } finally {
    await app.close();
  }
});

test("runners stop: wrong principal (sk_agent_*) fail-closes upstream", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedComputerWithAgent();
    const res = await fetch(`${app.baseUrl}/internal/computer/runners/${f.agentId}/stop`, {
      method: "POST",
      headers: authHeaders(f.agentApiKey),
      body: "{}",
    });
    assert.notEqual(res.status, 200);
    assert.ok(res.status === 401 || res.status === 403);
  } finally {
    await app.close();
  }
});

test("runners list: wrong principal (sk_agent_*) fail-closes upstream (registry-enforced)", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedComputerWithAgent();
    const res = await fetch(`${app.baseUrl}/internal/computer/runners`, {
      method: "GET",
      headers: authHeaders(f.agentApiKey),
    });
    // The authFromRegistry dispatcher rejects a non-Computer principal
    // before the handler runs — same invariant the preflight test pins.
    assert.notEqual(res.status, 200);
    assert.ok(res.status === 401 || res.status === 403);
  } finally {
    await app.close();
  }
});
