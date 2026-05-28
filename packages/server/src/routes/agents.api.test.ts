import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { users, serverMembers } from "../db/schema.js";
import { createServer } from "../services/serverService.js";
import { createAgent, deleteAgent } from "../services/agentService.js";
import { createMessage } from "../services/messageService.js";
import { findOrCreateAgentDM, findOrCreateDM } from "../services/channelService.js";

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

async function seedUser(email: string, name: string) {
  const db = getDb();
  const [user] = await db.insert(users).values({
    email,
    name,
    displayName: name,
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  return user;
}

function authHeaders(token: string, serverId: string) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Server-Id": serverId,
  };
}

test("agent create persists structured runtimeConfig and strips it from non-admin list responses", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("runtime-config-owner@slock.test", "runtime-config-owner");
    const member = await seedUser("runtime-config-member@slock.test", "runtime-config-member");
    const server = await createServer("Runtime Config Server", "runtime-config-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: member.id, role: "member" });
    const ownerToken = await login(app.baseUrl, owner.email);
    const memberToken = await login(app.baseUrl, member.email);

    const createRes = await fetch(`${app.baseUrl}/api/agents`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "runtime-config-agent",
        runtimeConfig: {
          version: 1,
          runtime: "claude",
          provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
          model: { kind: "custom", name: "claude-opus-4-6" },
          envVars: { TEAM_FLAG: "enabled" },
        },
      }),
    });
    assert.equal(createRes.status, 200);
    const created = await createRes.json() as {
      id: string;
      runtime: string;
      model: string;
      envVars: Record<string, string>;
      runtimeConfig: Record<string, unknown>;
    };
    assert.equal(created.runtime, "claude");
    assert.equal(created.model, "claude-opus-4-6");
    assert.deepEqual(created.envVars, {
      TEAM_FLAG: "enabled",
      ANTHROPIC_BASE_URL: "https://gateway.example.test/v1",
      ANTHROPIC_API_KEY: "sk-ant-test",
      ANTHROPIC_CUSTOM_MODEL_OPTION: "claude-opus-4-6",
    });
    assert.deepEqual(created.runtimeConfig, {
      version: 1,
      runtime: "claude",
      provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
      model: { kind: "custom", name: "claude-opus-4-6" },
      mode: { kind: "default" },
      reasoningEffort: null,
      envVars: { TEAM_FLAG: "enabled" },
    });

    const patchRes = await fetch(`${app.baseUrl}/api/agents/${created.id}`, {
      method: "PATCH",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        envVars: {
          TEAM_FLAG: "changed",
          ANTHROPIC_BASE_URL: "https://should-strip.example.test",
          ANTHROPIC_API_KEY: "should-strip",
        },
      }),
    });
    assert.equal(patchRes.status, 200);
    const patched = await patchRes.json() as {
      envVars: Record<string, string>;
      runtimeConfig: Record<string, unknown>;
    };
    assert.deepEqual(patched.runtimeConfig, {
      version: 1,
      runtime: "claude",
      provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
      model: { kind: "custom", name: "claude-opus-4-6" },
      mode: { kind: "default" },
      reasoningEffort: null,
      envVars: { TEAM_FLAG: "changed" },
    });
    assert.deepEqual(patched.envVars, {
      TEAM_FLAG: "changed",
      ANTHROPIC_BASE_URL: "https://gateway.example.test/v1",
      ANTHROPIC_API_KEY: "sk-ant-test",
      ANTHROPIC_CUSTOM_MODEL_OPTION: "claude-opus-4-6",
    });

    const memberListRes = await fetch(`${app.baseUrl}/api/agents`, {
      headers: authHeaders(memberToken, server.id),
    });
    assert.equal(memberListRes.status, 200);
    const memberList = await memberListRes.json() as Array<Record<string, unknown>>;
    const visibleAgent = memberList.find((agent) => agent.id === created.id);
    assert.ok(visibleAgent);
    assert.equal("envVars" in visibleAgent, false);
    assert.equal("runtimeConfig" in visibleAgent, false);
  } finally {
    await app.close();
  }
});

test("POST /agents rejects provider config for Cursor because current Cursor CLI has no API URL contract", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("runtime-config-cursor-provider@slock.test", "runtime-config-cursor-provider");
    const server = await createServer("Runtime Config Cursor Provider", "runtime-config-cursor-provider", owner.id);
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await fetch(`${app.baseUrl}/api/agents`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "cursor-provider-agent",
        runtimeConfig: {
          version: 1,
          runtime: "cursor",
          provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
          model: { kind: "custom", name: "custom-cursor-model" },
        },
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json() as { error: string };
    assert.equal(body.error, "runtimeConfig.provider is only supported for Claude Code");
  } finally {
    await app.close();
  }
});

test("POST /agents rejects malformed structured runtimeConfig", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("runtime-config-invalid@slock.test", "runtime-config-invalid");
    const server = await createServer("Runtime Config Invalid", "runtime-config-invalid", owner.id);
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await fetch(`${app.baseUrl}/api/agents`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "bad-runtime-config-agent",
        runtimeConfig: {
          version: 1,
          runtime: "claude",
          model: { kind: "custom" },
        },
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json() as { error: string };
    assert.equal(body.error, "runtimeConfig.model.name is required");

    const missingProviderKeyRes = await fetch(`${app.baseUrl}/api/agents`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "bad-provider-key-agent",
        runtimeConfig: {
          version: 1,
          runtime: "claude",
          provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1" },
          model: { kind: "preset", id: "sonnet" },
        },
      }),
    });
    assert.equal(missingProviderKeyRes.status, 400);
    const missingProviderKeyBody = await missingProviderKeyRes.json() as { error: string };
    assert.equal(missingProviderKeyBody.error, "runtimeConfig.provider.apiKey is required");
  } finally {
    await app.close();
  }
});

test("POST /agents rejects unsupported runtimeConfig launch axes", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("runtime-config-unsupported@slock.test", "runtime-config-unsupported");
    const server = await createServer("Runtime Config Unsupported", "runtime-config-unsupported", owner.id);
    const ownerToken = await login(app.baseUrl, owner.email);

    const providerUnsupportedRuntimes = ["codex", "antigravity", "kimi", "copilot", "cursor", "gemini", "opencode"];
    const fastUnsupportedRuntimes = ["antigravity", "kimi", "copilot", "cursor", "gemini", "opencode"];
    const reasoningUnsupportedRuntimes = ["antigravity", "kimi", "cursor", "gemini", "opencode"];

    const cases = [
      ...providerUnsupportedRuntimes.map((runtime) => ({
        name: `${runtime}-provider-agent`,
        runtimeConfig: {
          version: 1,
          runtime,
          provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
          model: { kind: "preset", id: "default" },
        },
        error: "runtimeConfig.provider is only supported for Claude Code",
      })),
      ...fastUnsupportedRuntimes.map((runtime) => ({
        name: `${runtime}-fast-agent`,
        runtimeConfig: {
          version: 1,
          runtime,
          model: { kind: "preset", id: "default" },
          mode: { kind: "fast" },
        },
        error: `runtimeConfig.mode is not supported for runtime: ${runtime}`,
      })),
      ...reasoningUnsupportedRuntimes.map((runtime) => ({
        name: `${runtime}-reasoning-agent`,
        runtimeConfig: {
          version: 1,
          runtime,
          model: { kind: "preset", id: "default" },
          reasoningEffort: "high",
        },
        error: `runtimeConfig.reasoningEffort is not supported for runtime: ${runtime}`,
      })),
    ];

    for (const item of cases) {
      const res = await fetch(`${app.baseUrl}/api/agents`, {
        method: "POST",
        headers: {
          ...authHeaders(ownerToken, server.id),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });
      assert.equal(res.status, 400, item.name);
      const body = await res.json() as { error: string };
      assert.equal(body.error, item.error);
    }
  } finally {
    await app.close();
  }
});

test("GET /agents/:id/agent-dms returns only agent-to-agent DMs for that agent", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "owner-agent-dm@slock.test",
      name: "owner-agent-dm",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [member] = await db.insert(users).values({
      email: "member-agent-dm@slock.test",
      name: "member-agent-dm",
      displayName: "Member",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Agent DM Test", "agent-dm-test", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: member.id, role: "member" });

    const agentA = await createAgent(server.id, "agent-a", { runtime: "codex" });
    const agentB = await createAgent(server.id, "agent-b", { runtime: "codex" });

    const a2aDm = await findOrCreateAgentDM(server.id, agentA.id, agentB.id);
    assert.ok(a2aDm, "expected an agent-to-agent DM");
    await createMessage(a2aDm.id, "agent", agentA.id, "agent to agent preview");

    const humanDm = await findOrCreateDM(server.id, member.id, agentA.id);
    assert.ok(humanDm, "expected a human DM");
    await createMessage(humanDm.id, "user", member.id, "human private message");

    const ownerToken = await login(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/agents/${agentA.id}/agent-dms`, {
      headers: authHeaders(ownerToken, server.id),
    });

    assert.equal(res.status, 200);
    const body = await res.json() as Array<{
      id: string;
      peerId: string;
      peerName: string;
      lastMessagePreview: string | null;
    }>;

    assert.equal(body.length, 1);
    assert.equal(body[0].id, a2aDm.id);
    assert.equal(body[0].peerId, agentB.id);
    assert.equal(body[0].peerName, "agent-b");
    assert.equal(body[0].lastMessagePreview, "agent to agent preview");
  } finally {
    await app.close();
  }
});

test("GET /agents/:id/agent-dms preview ignores trailing system messages", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "owner-agent-dm-system@slock.test",
      name: "owner-agent-dm-system",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Agent DM System Preview", "agent-dm-system", owner.id);

    const agentA = await createAgent(server.id, "agent-system-a", { runtime: "codex" });
    const agentB = await createAgent(server.id, "agent-system-b", { runtime: "codex" });

    const a2aDm = await findOrCreateAgentDM(server.id, agentA.id, agentB.id);
    assert.ok(a2aDm, "expected an agent-to-agent DM");
    await createMessage(a2aDm.id, "agent", agentA.id, "real chat preview");
    await createMessage(a2aDm.id, "agent", agentA.id, "ACTIVITY ONLY", "system");

    const ownerToken = await login(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/agents/${agentA.id}/agent-dms`, {
      headers: authHeaders(ownerToken, server.id),
    });

    assert.equal(res.status, 200);
    const body = await res.json() as Array<{
      id: string;
      lastMessagePreview: string | null;
    }>;

    assert.equal(body.length, 1);
    assert.equal(body[0].id, a2aDm.id);
    assert.equal(body[0].lastMessagePreview, "real chat preview");
  } finally {
    await app.close();
  }
});

test("POST /agents rejects a handle already used by an active agent in the server", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("principal-api-owner@slock.test", "principal-api-owner");
    const server = await createServer("Principal API", "principal-api", owner.id);
    await createAgent(server.id, "principal-api-agent", { runtime: "codex" });

    const ownerToken = await login(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/agents`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "principal-api-agent", runtime: "codex" }),
    });

    assert.equal(res.status, 409);
    const body = await res.json() as { error?: string };
    assert.match(body.error ?? "", /already taken/i);
  } finally {
    await app.close();
  }
});

test("POST /agents rejects reserved mention-like handles", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("reserved-agent-owner@slock.test", "reserved-agent-owner");
    const server = await createServer("Reserved Agent API", "reserved-agent-api", owner.id);
    const ownerToken = await login(app.baseUrl, owner.email);

    for (const name of ["all", "Human", "HUMANS", "agent", "Agents", "here", "Idle", "BUSY", "system"]) {
      const res = await fetch(`${app.baseUrl}/api/agents`, {
        method: "POST",
        headers: {
          ...authHeaders(ownerToken, server.id),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, runtime: "codex" }),
      });

      assert.equal(res.status, 400, name);
      const body = await res.json() as { error?: string };
      assert.match(body.error ?? "", /is reserved\. Choose another name\./i);
    }

    const validRes = await fetch(`${app.baseUrl}/api/agents`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "agent-helper", runtime: "codex" }),
    });
    assert.equal(validRes.status, 200);
    const validBody = await validRes.json() as { name?: string };
    assert.equal(validBody.name, "agent-helper");
  } finally {
    await app.close();
  }
});

test("agent creator is set at creation and cannot be changed", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("creator-owner@slock.test", "creator-owner");
    const member = await seedUser("creator-member@slock.test", "creator-member");
    const server = await createServer("Creator Server", "creator-server", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: member.id, role: "member" },
    ]);

    const ownerToken = await login(app.baseUrl, owner.email);
    const memberToken = await login(app.baseUrl, member.email);

    const createRes = await fetch(`${app.baseUrl}/api/agents`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "creator-agent", runtime: "codex" }),
    });
    assert.equal(createRes.status, 200);
    const created = await createRes.json() as { id: string; creator: { type: string; id: string } | null };
    assert.equal(created.creator?.type, "human");
    assert.equal(created.creator?.id, owner.id);

    const ownerProfileRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/members/${owner.id}/profile`, {
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(ownerProfileRes.status, 200);
    const ownerProfile = await ownerProfileRes.json() as { createdAgents: Array<{ id: string }> };
    assert.deepEqual(ownerProfile.createdAgents.map((m) => m.id), [created.id]);

    const forbiddenRes = await fetch(`${app.baseUrl}/api/agents/${created.id}/creator`, {
      method: "PATCH",
      headers: {
        ...authHeaders(memberToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ creatorType: "user", creatorId: member.id }),
    });
    assert.equal(forbiddenRes.status, 404);

    const getRes = await fetch(`${app.baseUrl}/api/agents/${created.id}`, {
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(getRes.status, 200);
    const afterPatch = await getRes.json() as { creator: { id: string } | null };
    assert.equal(afterPatch.creator?.id, owner.id);
  } finally {
    await app.close();
  }
});

test("agent private surfaces (workspace, skills, activity, agent-DMs, reminders) are limited to creator or server admin", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-surface-owner@slock.test", "private-surface-owner");
    const creator = await seedUser("private-surface-creator@slock.test", "private-surface-creator");
    const admin = await seedUser("private-surface-admin@slock.test", "private-surface-admin");
    const viewer = await seedUser("private-surface-viewer@slock.test", "private-surface-viewer");
    const server = await createServer("Agent Private Surface Server", "agent-private-surface", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: creator.id, role: "member" },
      { serverId: server.id, userId: admin.id, role: "admin" },
      { serverId: server.id, userId: viewer.id, role: "member" },
    ]);
    const agent = await createAgent(server.id, "private-surface-agent", {
      runtime: "codex",
      creatorType: "user",
      creatorId: creator.id,
    });

    Object.assign(app.app.get("agentOrchestrator"), {
      listRecentActivityLog: async () => [{ activity: "working", detail: "secret work" }],
      getAgentFileTree: async () => [{ name: "MEMORY.md", path: "MEMORY.md", type: "file" }],
      readAgentFile: async () => ({
        content: "secret",
        binary: false,
        size: 6,
        mimeType: "text/plain",
        encoding: "utf8",
      }),
      getAgentSkills: async () => ({
        global: [],
        workspace: [{ name: "secret-skill", path: "skills/secret-skill/SKILL.md" }],
      }),
    });

    const creatorToken = await login(app.baseUrl, creator.email);
    const adminToken = await login(app.baseUrl, admin.email);
    const viewerToken = await login(app.baseUrl, viewer.email);
    const routes = [
      `/api/agents/${agent.id}/activity-log`,
      `/api/agents/${agent.id}/workspace-files`,
      `/api/agents/${agent.id}/workspace-files/read?path=MEMORY.md`,
      `/api/agents/${agent.id}/skills`,
      `/api/agents/${agent.id}/agent-dms`,
      `/api/reminders?ownerAgentId=${agent.id}`,
    ];

    for (const route of routes) {
      const viewerRes = await fetch(`${app.baseUrl}${route}`, {
        headers: authHeaders(viewerToken, server.id),
      });
      assert.equal(viewerRes.status, 403, `${route} should reject non-creator members`);

      const creatorRes = await fetch(`${app.baseUrl}${route}`, {
        headers: authHeaders(creatorToken, server.id),
      });
      assert.equal(creatorRes.status, 200, `${route} should allow the agent creator`);

      const adminRes = await fetch(`${app.baseUrl}${route}`, {
        headers: authHeaders(adminToken, server.id),
      });
      assert.equal(adminRes.status, 200, `${route} should allow server admins`);
    }
  } finally {
    await app.close();
  }
});

test("GET /agents records restore-path trace phases with batched creator enrichment", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "1".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const db = getDb();
    const owner = await seedUser("agents-trace-owner@slock.test", "agents-trace-owner");
    const server = await createServer("Agents Trace Server", "agents-trace-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" }).onConflictDoNothing();
    const rootAgent = await createAgent(server.id, "root-agent", {
      runtime: "codex",
      creatorType: "user",
      creatorId: owner.id,
    });
    await createAgent(server.id, "child-agent", {
      runtime: "codex",
      creatorType: "agent",
      creatorId: rootAgent.id,
    });

    const ownerToken = await login(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/agents`, {
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as Array<{ id: string; createdAgents: Array<{ id: string }> }>;
    assert.equal(body.length, 2);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/agents/",
    );
    assert.ok(span, "expected GET /api/agents root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "agents.list.started",
      "agent.permissions.checked",
      "agents.loaded",
      "runtime_profiles.loaded",
      "activities.loaded",
      "creators.enriched",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "agents.batch_creator_enrich.agent_creators",
        "agents.batch_creator_enrich.created_agents",
        "agents.batch_creator_enrich.user_creators",
        "agents.list_by_server",
        "agents.runtime_profiles_by_agents",
      ],
    );
    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("agents.list_by_server")?.attrs?.phase, "agents.loaded");
    assert.equal(dbEventByQuery.get("agents.list_by_server")?.attrs?.row_count, 2);
    assert.equal(dbEventByQuery.get("agents.list_by_server")?.attrs?.include_deleted, true);
    assert.equal(dbEventByQuery.get("agents.runtime_profiles_by_agents")?.attrs?.phase, "runtime_profiles.loaded");
    assert.equal(dbEventByQuery.get("agents.runtime_profiles_by_agents")?.attrs?.input_count, 2);
    assert.equal(dbEventByQuery.get("agents.batch_creator_enrich.user_creators")?.attrs?.phase, "creators.enriched");
    assert.equal(dbEventByQuery.get("agents.batch_creator_enrich.user_creators")?.attrs?.row_count, 1);
    assert.equal(dbEventByQuery.get("agents.batch_creator_enrich.agent_creators")?.attrs?.row_count, 1);
    assert.equal(dbEventByQuery.get("agents.batch_creator_enrich.created_agents")?.attrs?.row_count, 1);

    const creatorsEvent = span.events.find((event) => event.name === "creators.enriched");
    assert.ok(creatorsEvent);
    assert.equal(creatorsEvent.attrs?.batched, true);
    assert.equal(creatorsEvent.attrs?.agents_count, 2);
    assert.equal(creatorsEvent.attrs?.creator_user_count, 1);
    assert.equal(creatorsEvent.attrs?.creator_agent_count, 1);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.agents_count, 2);
    assert.equal(readyEvent.attrs?.env_vars_stripped, false);
  } finally {
    await app.close();
  }
});

test("agent-to-agent DM channels are readable by any server member", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "owner-a2a-read@slock.test",
      name: "owner-a2a-read",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [member] = await db.insert(users).values({
      email: "member-a2a-read@slock.test",
      name: "member-a2a-read",
      displayName: "Member",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Agent DM Visibility", "agent-dm-visibility", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: member.id, role: "member" });

    const agentA = await createAgent(server.id, "agent-reader-a", { runtime: "codex" });
    const agentB = await createAgent(server.id, "agent-reader-b", { runtime: "codex" });
    const a2aDm = await findOrCreateAgentDM(server.id, agentA.id, agentB.id);
    assert.ok(a2aDm, "expected an agent-to-agent DM");

    await createMessage(a2aDm.id, "agent", agentA.id, "visible to the whole server");

    const memberToken = await login(app.baseUrl, member.email);
    const res = await fetch(`${app.baseUrl}/api/messages/channel/${a2aDm.id}`, {
      headers: authHeaders(memberToken, server.id),
    });

    assert.equal(res.status, 200);
    const body = await res.json() as { messages: Array<{ content: string }> };
    assert.equal(body.messages[0]?.content, "visible to the whole server");
  } finally {
    await app.close();
  }
});

test("user-to-agent DMs keep conversation actions after the peer agent is deleted", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("owner-deleted-agent-dm@slock.test", "owner-deleted-agent-dm");
    const server = await createServer("Deleted Agent DM", "deleted-agent-dm", owner.id);
    const agent = await createAgent(server.id, "deleted-dm-peer", { runtime: "codex" });
    const dm = await findOrCreateDM(server.id, owner.id, agent.id);
    assert.ok(dm, "expected a user-to-agent DM");
    await createMessage(dm.id, "user", owner.id, "historical deleted-agent DM message");

    await deleteAgent(agent.id);

    const ownerToken = await login(app.baseUrl, owner.email);
    const unreadRes = await fetch(`${app.baseUrl}/api/channels/${dm.id}/unread`, {
      method: "POST",
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(unreadRes.status, 200);
    assert.equal((await unreadRes.json() as { unreadCount: number }).unreadCount, 1);

    const readRes = await fetch(`${app.baseUrl}/api/channels/${dm.id}/read-all`, {
      method: "POST",
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(readRes.status, 200);

    const orderRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/sidebar-order`, {
      method: "PATCH",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinnedChannelIds: [dm.id],
        pinnedOrder: [dm.id],
        hiddenDmIds: [dm.id],
      }),
    });
    assert.equal(orderRes.status, 200);
    const order = await orderRes.json() as {
      pinnedChannelIds: string[];
      pinnedOrder: string[];
      hiddenDmIds: string[];
    };
    assert.deepEqual(order.pinnedChannelIds, [dm.id]);
    assert.deepEqual(order.pinnedOrder, [dm.id]);
    assert.deepEqual(order.hiddenDmIds, [dm.id]);
  } finally {
    await app.close();
  }
});
