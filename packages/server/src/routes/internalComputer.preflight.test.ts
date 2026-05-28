import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import argon2 from "argon2";

import { getDb } from "../db/index.js";
import { computers, users, agentCredentials } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { createServer } from "../services/serverService.js";
import { createAgent } from "../services/agentService.js";
import { mintAgentCredential } from "../services/agentCredentialService.js";
import { generateComputerApiKeyMaterial } from "../services/computerCredentialService.js";
import { routeAuthPolicy } from "../middleware/routeAuthPolicy.js";

// task #30 PR-A regression guard — the 3-piece binding gate for the
// synthetic attach/login preflight (RFC v0.8 §9):
//   1. preflight output is DERIVED from the live `routeAuthPolicy` registry
//      (no static/parallel `EXPECTED_PRINCIPALS` list) AND it is
//      side-effect-free (no credential minted / no write);
//   2. a wrong principal fail-closes with the literal `invalid_principal`;
//   3. an unregistered sibling under the claimed `/internal/computer/`
//      prefix fail-closes with the literal `auth_policy_unregistered_path`.

function jsonHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
}

async function seedFixture(): Promise<{
  computerApiKey: string;
  agentApiKey: string;
}> {
  const db = getDb();
  const suffix = randomUUID();
  const [owner] = await db
    .insert(users)
    .values({
      email: `preflight-${suffix}@slock.test`,
      name: `preflight-${suffix}`,
      displayName: "Preflight Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();
  const server = await createServer("Preflight Test", `preflight-${suffix}`, owner.id);
  const agent = await createAgent(server.id, "PreflightBot", { runtime: "claude", model: "sonnet" });

  const computerMaterial = await generateComputerApiKeyMaterial();
  await db.insert(computers).values({
    serverId: server.id,
    name: "preflight-computer",
    apiKeyHash: computerMaterial.apiKeyHash,
    apiKeyPrefix: computerMaterial.apiKeyPrefix,
    attachedByUserId: owner.id,
  });
  const agentMinted = await mintAgentCredential({
    agentId: agent.id,
    scopes: ["read"],
    name: "preflight-agent",
    createdByUserId: null,
  });
  return { computerApiKey: computerMaterial.apiKey, agentApiKey: agentMinted.apiKey };
}

test("preflight: derived-from-registry + side-effect-free under Computer principal", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { computerApiKey } = await seedFixture();
    const db = getDb();

    const before = await db.select({ id: agentCredentials.id }).from(agentCredentials);

    const res = await fetch(`${app.baseUrl}/internal/computer/preflight`, {
      method: "POST",
      headers: jsonHeaders(computerApiKey),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      ok: boolean;
      surfaceVersion: string;
      claimedPrefixes: string[];
      registeredPrincipals: string[];
      computerSurface: Array<{ method: string; path: string; principal: string }>;
      principal: { kind: string | null };
    };

    assert.equal(body.ok, true);
    assert.equal(typeof body.surfaceVersion, "string");
    assert.ok(body.surfaceVersion.length > 0);
    // Principal split was actually enforced for this request.
    assert.equal(body.principal.kind, "computer");

    // DERIVED, not static: preflight's computerSurface must equal exactly
    // what we independently derive from the imported live registry — so a
    // registry change (or gap) is reflected, never masked by a parallel list.
    const expectedSurface = routeAuthPolicy
      .filter((e) => e.path.startsWith("/internal/computer/"))
      .map((e) => ({ method: e.method, path: e.path, principal: e.principal }));
    assert.deepEqual(body.computerSurface, expectedSurface);
    assert.deepEqual(
      body.registeredPrincipals,
      [...new Set(routeAuthPolicy.map((e) => e.principal))].sort(),
    );
    // The preflight route reflects ITSELF from the registry (proves the
    // derivation walks the real policy, not a hardcoded subset).
    assert.ok(
      body.computerSurface.some(
        (e) => e.path === "/internal/computer/preflight" && e.principal === "sk_computer",
      ),
    );

    // Side-effect-free: no credential minted / nothing written.
    const after = await db.select({ id: agentCredentials.id }).from(agentCredentials);
    assert.equal(after.length, before.length);
  } finally {
    await app.close();
  }
});

test("preflight: source contains no static/parallel principal list (derives from routeAuthPolicy)", () => {
  const src = readFileSync(
    fileURLToPath(new URL("./internalComputer.ts", import.meta.url)),
    "utf8",
  );
  // Binding constraint: the handler must derive from the imported registry,
  // not copy a static `EXPECTED_PRINCIPALS = [...]`-style parallel list.
  assert.ok(
    /from\s+["']\.\.\/middleware\/routeAuthPolicy\.js["']/.test(src),
    "preflight handler must import routeAuthPolicy",
  );
  assert.ok(
    !/EXPECTED_PRINCIPALS\s*[:=]/.test(src),
    "no static EXPECTED_PRINCIPALS parallel list allowed",
  );
});

test("preflight: wrong principal fail-closes with literal invalid_principal", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agentApiKey } = await seedFixture();
    const res = await fetch(`${app.baseUrl}/internal/computer/preflight`, {
      method: "POST",
      headers: jsonHeaders(agentApiKey),
    });
    assert.equal(res.status, 401);
    assert.equal((await res.json() as { code?: string }).code, "invalid_principal");
  } finally {
    await app.close();
  }
});

test("preflight: unregistered sibling under /internal/computer/ fail-closes (auth_policy_unregistered_path)", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { computerApiKey } = await seedFixture();
    const res = await fetch(`${app.baseUrl}/internal/computer/preflight-not-registered`, {
      method: "POST",
      headers: jsonHeaders(computerApiKey),
    });
    assert.equal(res.status, 401);
    assert.equal(
      (await res.json() as { code?: string }).code,
      "auth_policy_unregistered_path",
    );
  } finally {
    await app.close();
  }
});
