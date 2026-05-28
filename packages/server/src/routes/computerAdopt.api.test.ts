import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";

import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { getDb } from "../db/index.js";
import { users, machines } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { signAccessToken } from "../middleware/auth.js";
import { createServer, addMember } from "../services/serverService.js";
import { extractApiKeyPrefix, registerMachine } from "../services/machineService.js";

// task #39 PR-J1 regression guard — legacy daemon adoption surface
// (RFC v0.8 v8.2 §5.11 / §10.13).
//
// Acceptance matrix from Jianwei (#wg-slock-computer:6f7ff4d2):
//   A. valid key + first call → 201 with sk_computer_* + legacyKeyMigratedAt set
//   B. same key reused → 409 legacy_machine_key_migrated
//   C. invalid/unknown key → 401 legacy_key_invalid
//   D. non-member of server → 403 not_authorized
//   E. feature flag off → 404 computer_adopt_disabled
//   F. cache invalidation: legacy sk_machine_* fails immediately post-adoption
//   G. concurrent: two parallel POSTs → exactly one 201, the other 409

function jsonHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { "Content-Type": "application/json", ...extra };
}

async function withEnv<T>(
  enabled: boolean,
  fn: (app: Awaited<ReturnType<typeof startTestApp>>) => Promise<T>,
): Promise<T> {
  const oldGate = process.env.SLOCK_DEVICE_LOGIN_ENABLED;
  if (enabled) delete process.env.SLOCK_DEVICE_LOGIN_ENABLED;
  else process.env.SLOCK_DEVICE_LOGIN_ENABLED = "false";
  const app = await startTestApp("pglite://");
  try {
    return await fn(app);
  } finally {
    await app.close();
    if (oldGate === undefined) delete process.env.SLOCK_DEVICE_LOGIN_ENABLED;
    else process.env.SLOCK_DEVICE_LOGIN_ENABLED = oldGate;
  }
}

async function seedUser(label = "adopt"): Promise<{ id: string; bearer: string }> {
  const db = getDb();
  const suffix = randomUUID();
  const [u] = await db
    .insert(users)
    .values({
      email: `${label}-${suffix}@slock.test`,
      name: `${label}-${suffix}`,
      displayName: "Adopt Tester",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();
  return { id: u.id, bearer: signAccessToken(u.id) };
}

test("adopt-legacy: surface 404 when gate explicitly disabled", async () => {
  await withEnv(false, async (app) => {
    const { bearer } = await seedUser();
    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: `sk_machine_${"a".repeat(64)}` }),
    });
    // When the gate is off the entire /api/computer router isn't mounted, so
    // Express's default HTML 404 handler fires (not a JSON body from us).
    assert.equal(res.status, 404);
  });
});

test("adopt-legacy: requires user auth — unauthenticated rejected", async () => {
  await withEnv(true, async (app) => {
    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ legacyApiKey: `sk_machine_${"a".repeat(64)}` }),
    });
    assert.equal(res.status, 401);
    assert.equal((await res.json() as { code?: string }).code, "auth_required");
  });
});

test("adopt-legacy: missing legacyApiKey → 400 legacy_api_key_required", async () => {
  await withEnv(true, async (app) => {
    const { bearer } = await seedUser();
    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ name: "slock-computer" }),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json() as { code?: string }).code, "legacy_api_key_required");
  });
});

test("adopt-legacy A: valid key + first call → 201 sk_computer_* and machine row marked migrated", async () => {
  await withEnv(true, async (app) => {
    const { id: userId, bearer } = await seedUser();
    const server = await createServer("Adopt Co", `adopt-${randomUUID()}`, userId);
    const { machine, apiKey: legacyKey } = await registerMachine(server.id, userId, "legacy-daemon");

    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: legacyKey, name: "adopted-computer" }),
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as {
      apiKey: string;
      computerId: string;
      machineId: string;
      serverId: string;
      resumed: boolean;
    };
    assert.ok(body.apiKey.startsWith("sk_computer_"));
    assert.equal(body.machineId, machine.id);
    assert.equal(body.serverId, server.id);
    assert.equal(body.resumed, false);

    const db = getDb();
    const [row] = await db
      .select({ legacyKeyMigratedAt: machines.legacyKeyMigratedAt })
      .from(machines)
      .where(eq(machines.id, machine.id));
    assert.notEqual(row.legacyKeyMigratedAt, null);

    // End-to-end: fresh sk_computer_* authenticates the §9 preflight surface.
    const pre = await fetch(`${app.baseUrl}/internal/computer/preflight`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${body.apiKey}` }),
      body: "{}",
    });
    assert.equal(pre.status, 200);
    const pj = (await pre.json()) as { ok?: boolean; principal?: { kind?: string } };
    assert.equal(pj.ok, true);
    assert.equal(pj.principal?.kind, "computer");
  });
});

test("adopt-legacy B: same key reused → 409 legacy_machine_key_migrated", async () => {
  await withEnv(true, async (app) => {
    const { id: userId, bearer } = await seedUser();
    const server = await createServer("Adopt Co", `adopt-${randomUUID()}`, userId);
    const { apiKey: legacyKey } = await registerMachine(server.id, userId, "legacy-daemon");

    const first = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: legacyKey }),
    });
    assert.equal(first.status, 201);

    const second = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: legacyKey }),
    });
    assert.equal(second.status, 409);
    assert.equal((await second.json() as { code?: string }).code, "legacy_machine_key_migrated");
  });
});

test("adopt-legacy C: unknown sk_machine_* → 401 legacy_key_invalid", async () => {
  await withEnv(true, async (app) => {
    const { bearer } = await seedUser();
    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: `sk_machine_${"f".repeat(64)}` }),
    });
    assert.equal(res.status, 401);
    assert.equal((await res.json() as { code?: string }).code, "legacy_key_invalid");
  });
});

test("adopt-legacy: sk_daemon_* legacy key is accepted (auth middleware prefix parity)", async () => {
  await withEnv(true, async (app) => {
    const { id: userId, bearer } = await seedUser();
    const server = await createServer("Adopt Daemon Co", `adopt-${randomUUID()}`, userId);

    // The legacy auth middleware (packages/server/src/middleware/auth.ts)
    // accepts both `sk_machine_*` and the older `sk_daemon_*` prefix. Seed a
    // machine row with a `sk_daemon_*` key to confirm adopt-legacy doesn't
    // silently exclude that slice of legacy daemons.
    const legacyKey = `sk_daemon_${randomBytes(32).toString("hex")}`;
    const apiKeyHash = await argon2.hash(legacyKey);
    const apiKeyPrefix = extractApiKeyPrefix(legacyKey);
    const db = getDb();
    const [machine] = await db
      .insert(machines)
      .values({
        serverId: server.id,
        userId,
        name: "legacy-sk-daemon",
        apiKeyHash,
        apiKeyPrefix,
      })
      .returning();

    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: legacyKey }),
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as {
      apiKey: string;
      machineId: string;
      serverId: string;
    };
    assert.ok(body.apiKey.startsWith("sk_computer_"));
    assert.equal(body.machineId, machine.id);
    assert.equal(body.serverId, server.id);

    // And the machine row is now marked migrated, just like the sk_machine_* path.
    const [row] = await db
      .select({ legacyKeyMigratedAt: machines.legacyKeyMigratedAt })
      .from(machines)
      .where(eq(machines.id, machine.id));
    assert.notEqual(row.legacyKeyMigratedAt, null);
  });
});

test("adopt-legacy C: non-machine prefix → 401 legacy_key_invalid", async () => {
  await withEnv(true, async (app) => {
    const { bearer } = await seedUser();
    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: `sk_computer_${"a".repeat(64)}` }),
    });
    assert.equal(res.status, 401);
    assert.equal((await res.json() as { code?: string }).code, "legacy_key_invalid");
  });
});

test("adopt-legacy D: caller not member of machine's server → 403 not_authorized", async () => {
  await withEnv(true, async (app) => {
    const owner = await seedUser("owner");
    const stranger = await seedUser("stranger");
    const server = await createServer("Closed Co", `closed-${randomUUID()}`, owner.id);
    const { apiKey: legacyKey } = await registerMachine(server.id, owner.id, "legacy-daemon");

    const res = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${stranger.bearer}` }),
      body: JSON.stringify({ legacyApiKey: legacyKey }),
    });
    assert.equal(res.status, 403);
    assert.equal((await res.json() as { code?: string }).code, "not_authorized");

    // Once added as a member, the SAME request succeeds — proves the 403 was
    // authorization (not malformed key + not enumeration).
    await addMember(server.id, stranger.id, "member");
    const ok = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${stranger.bearer}` }),
      body: JSON.stringify({ legacyApiKey: legacyKey }),
    });
    assert.equal(ok.status, 201);
  });
});

test("adopt-legacy F: post-adoption the legacy sk_machine_* fails immediately on /internal/machine/*", async () => {
  await withEnv(true, async (app) => {
    const { id: userId, bearer } = await seedUser();
    const server = await createServer("Adopt Co", `adopt-${randomUUID()}`, userId);
    const { apiKey: legacyKey } = await registerMachine(server.id, userId, "legacy-daemon");

    // Warm the auth cache by exercising the legacy key on a machine-authed route.
    const warm = await fetch(`${app.baseUrl}/internal/machine/agents`, {
      method: "GET",
      headers: { Authorization: `Bearer ${legacyKey}` },
    });
    assert.notEqual(warm.status, 401, "legacy key must work before adoption");

    const adopt = await fetch(`${app.baseUrl}/api/computer/adopt-legacy`, {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${bearer}` }),
      body: JSON.stringify({ legacyApiKey: legacyKey }),
    });
    assert.equal(adopt.status, 201);

    // Immediately after adoption — no TTL window — legacy key must be rejected.
    const post = await fetch(`${app.baseUrl}/internal/machine/agents`, {
      method: "GET",
      headers: { Authorization: `Bearer ${legacyKey}` },
    });
    assert.equal(post.status, 401);
    const pj = (await post.json().catch(() => ({}))) as { code?: string };
    assert.equal(pj.code, "legacy_machine_key_migrated");
  });
});

test("adopt-legacy G: concurrent requests with same key → exactly one 201, the other 409", async () => {
  await withEnv(true, async (app) => {
    const { id: userId, bearer } = await seedUser();
    const server = await createServer("Adopt Co", `adopt-${randomUUID()}`, userId);
    const { machine, apiKey: legacyKey } = await registerMachine(server.id, userId, "legacy-daemon");

    const headers = jsonHeaders({ Authorization: `Bearer ${bearer}` });
    const body = JSON.stringify({ legacyApiKey: legacyKey });
    const [a, b] = await Promise.all([
      fetch(`${app.baseUrl}/api/computer/adopt-legacy`, { method: "POST", headers, body }),
      fetch(`${app.baseUrl}/api/computer/adopt-legacy`, { method: "POST", headers, body }),
    ]);
    const statuses = [a.status, b.status].sort();
    assert.deepEqual(statuses, [201, 409], `expected exactly one winner; got ${statuses.join(",")}`);

    const loser = a.status === 409 ? a : b;
    assert.equal((await loser.json() as { code?: string }).code, "legacy_machine_key_migrated");

    // DB invariant: machine row marked migrated exactly once.
    const db = getDb();
    const [row] = await db
      .select({ legacyKeyMigratedAt: machines.legacyKeyMigratedAt })
      .from(machines)
      .where(eq(machines.id, machine.id));
    assert.notEqual(row.legacyKeyMigratedAt, null);
  });
});
