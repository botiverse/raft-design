import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import { startTestApp } from "../test/testAppHarness.js";
import { seedPlaywrightScenario } from "../test/seedPlaywrightScenario.js";
import { getDb } from "../db/index.js";
import { agentRuntimeProfiles, agents, channelAgents, channelHumans, channels as channelsTable, machines, serverInvites, serverJoinLinks, serverMembers, servers as serversTable, users } from "../db/schema.js";
import { createServer, updateMemberSidebarOrder } from "../services/serverService.js";
import { addAgent, addHuman, archiveChannel, createChannel, findOrCreateDM } from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import { createAgent, deleteAgent } from "../services/agentService.js";
import { registerMachine } from "../services/machineService.js";

interface EmittedEvent {
  room: string;
  event: string;
  payload: unknown;
}

function installFakeIo(app: { set: (key: string, value: unknown) => void }): EmittedEvent[] {
  const events: EmittedEvent[] = [];
  app.set("io", {
    to(room: string) {
      return {
        emit(event: string, payload: unknown) {
          events.push({ room, event, payload });
        },
      };
    },
  });
  return events;
}

test("pglite-backed API app can login and list seeded servers without docker", async () => {
  const app = await startTestApp("pglite://");
  try {
    const seed = await seedPlaywrightScenario();

    const loginResponse = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: seed.user.email,
        password: seed.user.password,
      }),
    });
    assert.equal(loginResponse.status, 200);
    const loginData = await loginResponse.json() as { accessToken: string };
    assert.ok(loginData.accessToken);

    const serversResponse = await fetch(`${app.baseUrl}/api/servers`, {
      headers: {
        Authorization: `Bearer ${loginData.accessToken}`,
      },
    });
    assert.equal(serversResponse.status, 200);
    const servers = await serversResponse.json() as Array<{ slug: string }>;
    assert.deepEqual(
      servers.map((server) => server.slug),
      [seed.server.slug],
    );
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/members hides other members' emails from non-admin members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "owner-email@slock.test",
      name: "owner-email",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [admin] = await db.insert(users).values({
      email: "admin-email@slock.test",
      name: "admin-email",
      displayName: "Admin",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [member] = await db.insert(users).values({
      email: "member-email@slock.test",
      name: "member-email",
      displayName: "Member",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [other] = await db.insert(users).values({
      email: "other-email@slock.test",
      name: "other-email",
      displayName: "Other",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Email Visibility Server", "email-visibility-server", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: admin.id, role: "admin" },
      { serverId: server.id, userId: member.id, role: "member" },
      { serverId: server.id, userId: other.id, role: "member" },
    ]);

    async function login(email: string) {
      const res = await fetch(`${app.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      });
      assert.equal(res.status, 200);
      const data = await res.json() as { accessToken: string };
      return data.accessToken;
    }

    async function listMembers(token: string) {
      const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/members`, {
        headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
      });
      assert.equal(res.status, 200);
      return await res.json() as Array<{ userId: string; email: string | null }>;
    }

    const ownerToken = await login(owner.email);
    const ownerView = await listMembers(ownerToken);
    for (const row of ownerView) {
      assert.ok(row.email && row.email.length > 0, `owner should see email for ${row.userId}`);
    }

    const adminToken = await login(admin.email);
    const adminView = await listMembers(adminToken);
    for (const row of adminView) {
      assert.ok(row.email && row.email.length > 0, `admin should see email for ${row.userId}`);
    }

    const memberToken = await login(member.email);
    const memberView = await listMembers(memberToken);
    for (const row of memberView) {
      if (row.userId === member.id) {
        assert.equal(row.email, member.email, "member sees own email");
      } else {
        assert.equal(row.email, null, `member must not see email for ${row.userId}`);
      }
    }

    const memberViewJson = JSON.stringify(memberView);
    assert.ok(!memberViewJson.includes(owner.email), "owner email must not leak in member view");
    assert.ok(!memberViewJson.includes(admin.email), "admin email must not leak in member view");
    assert.ok(!memberViewJson.includes(other.email), "other member email must not leak in member view");
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/members hides the human directory from ordinary members when configured", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "hide-directory-owner@slock.test",
      name: "hide-directory-owner",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [member] = await db.insert(users).values({
      email: "hide-directory-member@slock.test",
      name: "hide-directory-member",
      displayName: "Member",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [other] = await db.insert(users).values({
      email: "hide-directory-other@slock.test",
      name: "hide-directory-other",
      displayName: "Other",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Hide Directory Server", "hide-directory-server", owner.id);
    await db.update(serversTable).set({ hideHumansFromMembers: true }).where(eq(serversTable.id, server.id));
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: member.id, role: "member" },
      { serverId: server.id, userId: other.id, role: "member" },
    ]);

    const memberToken = await loginHelper(app.baseUrl, member.email);
    const memberRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/members`, {
      headers: { Authorization: `Bearer ${memberToken}`, "X-Server-Id": server.id },
    });
    assert.equal(memberRes.status, 200);
    const memberBody = await memberRes.json() as Array<{ userId: string }>;
    assert.deepEqual(memberBody.map((row) => row.userId), [member.id]);
    assert.ok(!JSON.stringify(memberBody).includes(owner.name), "owner must not leak into ordinary member directory response");
    assert.ok(!JSON.stringify(memberBody).includes(other.name), "other member must not leak into ordinary member directory response");

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const ownerRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/members`, {
      headers: { Authorization: `Bearer ${ownerToken}`, "X-Server-Id": server.id },
    });
    assert.equal(ownerRes.status, 200);
    const ownerBody = await ownerRes.json() as Array<{ userId: string }>;
    assert.deepEqual(ownerBody.map((row) => row.userId).sort(), [owner.id, member.id, other.id].sort());
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/member-graph returns visible channel membership edges only", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "member-graph-owner@slock.test",
      name: "member-graph-owner",
      displayName: "Graph Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [member] = await db.insert(users).values({
      email: "member-graph-member@slock.test",
      name: "member-graph-member",
      displayName: "Graph Member",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Member Graph Server", "member-graph-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: member.id, role: "member" });
    const agent = await createAgent(server.id, "GraphBot", {
      runtime: "claude",
      model: "sonnet",
      envVars: { GRAPH_SECRET: "graph-secret-should-not-leak" },
    });
    const deletedAgent = await createAgent(server.id, "DeletedGraphBot", { runtime: "claude", model: "sonnet" });
    await db.update(agents).set({ deletedAt: new Date() }).where(eq(agents.id, deletedAgent.id));
    const publicChannel = await createChannel(server.id, "graph-public");
    const privateChannel = await createChannel(server.id, "graph-private", undefined, "private");
    const archivedChannel = await createChannel(server.id, "graph-archived");
    const [dmChannel] = await db.insert(channelsTable).values({ serverId: server.id, name: "graph-dm", type: "dm" }).returning();
    const [threadChannel] = await db.insert(channelsTable).values({ serverId: server.id, name: "graph-thread", type: "thread" }).returning();
    await addHuman(publicChannel.id, owner.id);
    await addHuman(publicChannel.id, member.id);
    await addAgent(publicChannel.id, agent.id);
    await db.insert(channelAgents).values({ channelId: publicChannel.id, agentId: deletedAgent.id });
    await addHuman(privateChannel.id, owner.id);
    await addHuman(privateChannel.id, member.id);
    await addAgent(privateChannel.id, agent.id);
    await addHuman(archivedChannel.id, owner.id);
    await addHuman(archivedChannel.id, member.id);
    await archiveChannel(archivedChannel.id, owner.id);
    await db.insert(channelHumans).values([
      { channelId: dmChannel.id, userId: owner.id },
      { channelId: dmChannel.id, userId: member.id },
      { channelId: threadChannel.id, userId: owner.id },
      { channelId: threadChannel.id, userId: member.id },
    ]);
    await db.insert(channelAgents).values([
      { channelId: dmChannel.id, agentId: agent.id },
      { channelId: threadChannel.id, agentId: agent.id },
    ]);

    const memberToken = await loginHelper(app.baseUrl, member.email);
    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/member-graph`, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(res.status, 200);
    const body = await res.json() as {
      humans: Array<{ id: string; channelIds: string[] }>;
      agents: Array<{ id: string; channelIds: string[] }>;
      channels: Array<{ id: string; name: string; memberCount: number }>;
      edges: Array<{ channelId: string; memberType: string; memberId: string }>;
    };

    assert.ok(body.humans.some((human) => human.id === owner.id));
    assert.ok(body.humans.some((human) => human.id === member.id));
    assert.ok(body.agents.some((candidate) => candidate.id === agent.id));
    assert.ok(!body.agents.some((candidate) => candidate.id === deletedAgent.id), "deleted agents must not be exposed");
    assert.ok(body.channels.some((channel) => channel.id === publicChannel.id && channel.memberCount === 3));
    assert.ok(!body.channels.some((channel) => channel.id === privateChannel.id), "private channel must not be exposed");
    assert.ok(!body.channels.some((channel) => channel.id === archivedChannel.id), "archived channel must not be exposed");
    assert.ok(!body.channels.some((channel) => channel.id === dmChannel.id), "DM channel must not be exposed");
    assert.ok(!body.channels.some((channel) => channel.id === threadChannel.id), "thread channel must not be exposed");
    assert.ok(body.edges.some((edge) => edge.channelId === publicChannel.id && edge.memberType === "agent" && edge.memberId === agent.id));
    assert.ok(!body.edges.some((edge) => edge.memberId === deletedAgent.id), "deleted agent edges must not leak");
    assert.ok(!body.edges.some((edge) => edge.channelId === privateChannel.id), "private channel edges must not leak");
    assert.ok(!body.edges.some((edge) => edge.channelId === archivedChannel.id), "archived channel edges must not leak");
    assert.ok(!body.edges.some((edge) => edge.channelId === dmChannel.id), "DM channel edges must not leak");
    assert.ok(!body.edges.some((edge) => edge.channelId === threadChannel.id), "thread channel edges must not leak");
    const serialized = JSON.stringify(body);
    assert.ok(!serialized.includes(owner.email), "member graph must not expose emails");
    assert.ok(!serialized.includes(member.email), "member graph must not expose emails");
    assert.ok(!serialized.includes("graph-secret-should-not-leak"), "member graph must not expose agent env vars");
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/member-graph is unavailable to ordinary members when the human directory is hidden", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "graph-hidden-owner@slock.test",
      name: "graph-hidden-owner",
      displayName: "Graph Hidden Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [member] = await db.insert(users).values({
      email: "graph-hidden-member@slock.test",
      name: "graph-hidden-member",
      displayName: "Graph Hidden Member",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [other] = await db.insert(users).values({
      email: "graph-hidden-other@slock.test",
      name: "graph-hidden-other",
      displayName: "Graph Hidden Other",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Graph Hidden Server", "graph-hidden-server", owner.id);
    await db.update(serversTable).set({ hideHumansFromMembers: true }).where(eq(serversTable.id, server.id));
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: member.id, role: "member" },
      { serverId: server.id, userId: other.id, role: "member" },
    ]);

    const memberToken = await loginHelper(app.baseUrl, member.email);
    const memberRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/member-graph`, {
      headers: { Authorization: `Bearer ${memberToken}`, "X-Server-Id": server.id },
    });
    assert.equal(memberRes.status, 403);
    assert.deepEqual(await memberRes.json(), { error: "Member graph is not available" });

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const ownerRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/member-graph`, {
      headers: { Authorization: `Bearer ${ownerToken}`, "X-Server-Id": server.id },
    });
    assert.equal(ownerRes.status, 200);
    const ownerBody = await ownerRes.json() as { humans: Array<{ id: string }> };
    assert.deepEqual(ownerBody.humans.map((human) => human.id).sort(), [owner.id, member.id, other.id].sort());
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/member-graph enforces server membership and X-Server-Id", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "member-graph-gate-owner@slock.test",
      name: "member-graph-gate-owner",
      displayName: "Graph Gate Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [outsider] = await db.insert(users).values({
      email: "member-graph-gate-outsider@slock.test",
      name: "member-graph-gate-outsider",
      displayName: "Graph Gate Outsider",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [otherOwner] = await db.insert(users).values({
      email: "member-graph-gate-other-owner@slock.test",
      name: "member-graph-gate-other-owner",
      displayName: "Graph Gate Other Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Member Graph Gate Server", "member-graph-gate-server", owner.id);
    const otherServer = await createServer("Member Graph Gate Other Server", "member-graph-gate-other-server", otherOwner.id);
    const outsiderToken = await loginHelper(app.baseUrl, outsider.email);

    const missingHeader = await fetch(`${app.baseUrl}/api/servers/${server.id}/member-graph`, {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(missingHeader.status, 400);

    const mismatchedHeader = await fetch(`${app.baseUrl}/api/servers/${server.id}/member-graph`, {
      headers: {
        Authorization: `Bearer ${outsiderToken}`,
        "X-Server-Id": otherServer.id,
      },
    });
    assert.equal(mismatchedHeader.status, 400);

    const outsiderResponse = await fetch(`${app.baseUrl}/api/servers/${server.id}/member-graph`, {
      headers: {
        Authorization: `Bearer ${outsiderToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(outsiderResponse.status, 403);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/members/:memberId/profile hides email from non-admin members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "owner-profile@slock.test",
      name: "owner-profile",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [admin] = await db.insert(users).values({
      email: "admin-profile@slock.test",
      name: "admin-profile",
      displayName: "Admin",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [member] = await db.insert(users).values({
      email: "member-profile@slock.test",
      name: "member-profile",
      displayName: "Member",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [other] = await db.insert(users).values({
      email: "other-profile@slock.test",
      name: "other-profile",
      displayName: "Other",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Profile Visibility Server", "profile-visibility-server", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: admin.id, role: "admin" },
      { serverId: server.id, userId: member.id, role: "member" },
      { serverId: server.id, userId: other.id, role: "member" },
    ]);

    async function login(email: string) {
      const res = await fetch(`${app.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      });
      assert.equal(res.status, 200);
      const data = await res.json() as { accessToken: string };
      return data.accessToken;
    }

    async function fetchProfile(token: string, targetId: string) {
      const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/members/${targetId}/profile`, {
        headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
      });
      assert.equal(res.status, 200);
      return await res.json() as { userId: string; email: string | null };
    }

    const ownerToken = await login(owner.email);
    assert.equal((await fetchProfile(ownerToken, member.id)).email, member.email);
    assert.equal((await fetchProfile(ownerToken, other.id)).email, other.email);

    const adminToken = await login(admin.email);
    assert.equal((await fetchProfile(adminToken, member.id)).email, member.email);
    assert.equal((await fetchProfile(adminToken, owner.id)).email, owner.email);

    const memberToken = await login(member.email);
    const selfProfile = await fetchProfile(memberToken, member.id);
    assert.equal(selfProfile.email, member.email, "member can see own email");

    const ownerProfile = await fetchProfile(memberToken, owner.id);
    assert.equal(ownerProfile.email, null, "member must not see owner's email");
    const adminProfile = await fetchProfile(memberToken, admin.id);
    assert.equal(adminProfile.email, null, "member must not see admin's email");
    const otherProfile = await fetchProfile(memberToken, other.id);
    assert.equal(otherProfile.email, null, "member must not see other member's email");

    const combined = JSON.stringify([ownerProfile, adminProfile, otherProfile]);
    assert.ok(!combined.includes(owner.email), "owner email must not leak in member-viewed profile");
    assert.ok(!combined.includes(admin.email), "admin email must not leak in member-viewed profile");
    assert.ok(!combined.includes(other.email), "other member email must not leak in member-viewed profile");
  } finally {
    await app.close();
  }
});

/**
 * Regression tests for #proj-security task #10 (2026-04-19):
 *
 * stdrc's contract (msg=256c4eda): "所有 authenticated API 都必须带
 * X-Server-Id 且限定到那个 server". Prior to the fix, `/api/servers/:id/*`
 * handlers only ran their own `isMember(req.params.id, req.userId)` check,
 * which returned true for any server the user happened to belong to — so
 * a user on server A holding X-Server-Id=A could fetch
 * `/api/servers/B/members` (or any other resource under server B) as long
 * as they were also a member of B, silently crossing the scope the header
 * claimed. `requireServerMatchesParam` refuses that before the handler.
 */

async function loginHelper(baseUrl: string, email: string, password = "password123") {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200, `login for ${email} expected 200`);
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}

async function withTranslationEnv(
  overrides: Record<string, string | undefined>,
  fn: () => Promise<void>,
) {
  const keys = [
    "TRANSLATION_PROVIDER",
    "TRANSLATION_AZURE_ENDPOINT",
    "TRANSLATION_AZURE_API_KEY",
    "TRANSLATION_AZURE_REGION",
    "TRANSLATION_VOLCENGINE_ACCESS_KEY_ID",
    "TRANSLATION_VOLCENGINE_SECRET_ACCESS_KEY",
    "TRANSLATION_VOLCENGINE_ENDPOINT",
    "TRANSLATION_VOLCENGINE_REGION",
    "TRANSLATION_GOOGLE_PROJECT_ID",
    "TRANSLATION_GOOGLE_LOCATION",
    "TRANSLATION_GOOGLE_ACCESS_TOKEN",
    "TRANSLATION_GOOGLE_SERVICE_ACCOUNT_JSON",
    "TRANSLATION_GOOGLE_CLIENT_EMAIL",
    "TRANSLATION_GOOGLE_PRIVATE_KEY",
    "TRANSLATION_GOOGLE_QUOTA_PROJECT_ID",
    "TRANSLATION_GOOGLE_ENDPOINT",
  ];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    await fn();
  } finally {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function seedTwoServerFixture() {
  const db = getDb();

  const [userAB] = await db
    .insert(users)
    .values({
      email: "two-server-ab@slock.test",
      name: "two-server-ab",
      displayName: "AB",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();

  // userAB is an owner of serverA AND a member of serverB — this is the
  // exact shape that made the pre-fix bug exploitable (the user's isMember
  // check passes for both, so the URL :id alone decided scope).
  const serverA = await createServer("Alpha", "two-alpha", userAB.id);
  const serverB = await createServer("Bravo", "two-bravo", userAB.id);

  return { userAB, serverA, serverB };
}

test("GET /api/servers/:id/members rejects when X-Server-Id doesn't match :id", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userAB, serverA, serverB } = await seedTwoServerFixture();
    const token = await loginHelper(app.baseUrl, userAB.email);

    // Caller claims server A (valid) but fetches server B. The user is a
    // legitimate member of both — pre-fix this returned 200 because the
    // per-handler `isMember(:id, userId)` check passed. Post-fix it must
    // 400 (header mismatch) before the handler runs.
    const res = await fetch(`${app.baseUrl}/api/servers/${serverB.id}/members`, {
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": serverA.id },
    });
    assert.equal(res.status, 400, `expected 400 on scope mismatch, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/members rejects missing X-Server-Id", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userAB, serverA } = await seedTwoServerFixture();
    const token = await loginHelper(app.baseUrl, userAB.email);

    const res = await fetch(`${app.baseUrl}/api/servers/${serverA.id}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 400, `expected 400 on missing header, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/members accepts matching X-Server-Id", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userAB, serverA } = await seedTwoServerFixture();
    const token = await loginHelper(app.baseUrl, userAB.email);

    const res = await fetch(`${app.baseUrl}/api/servers/${serverA.id}/members`, {
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": serverA.id },
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id rejects non-member even when X-Server-Id matches", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [outsider] = await db.insert(users).values({
      email: "outsider@slock.test",
      name: "outsider",
      displayName: "Outsider",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [owner] = await db.insert(users).values({
      email: "owner-outsider@slock.test",
      name: "owner-outsider",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Closed", "closed-server", owner.id);
    const token = await loginHelper(app.baseUrl, outsider.email);

    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}`, {
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
    });
    assert.equal(res.status, 403, `expected 403 for non-member, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/unread-summary does not require X-Server-Id (cross-server endpoint)", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userAB } = await seedTwoServerFixture();
    const token = await loginHelper(app.baseUrl, userAB.email);

    // unread-summary aggregates across all the user's servers — intentionally
    // user-scoped, not server-scoped. The `requireServerMatchesParam`
    // middleware is registered on `/:id` only, so this no-`:id` route skips
    // the scope check entirely.
    const res = await fetch(`${app.baseUrl}/api/servers/unread-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200, `expected 200 without X-Server-Id, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/unread-summary ignores unread from non-joined regular channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [owner] = await db.insert(users).values({
      email: "owner-unread@slock.test",
      name: "owner-unread",
      displayName: "Owner Unread",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const [member] = await db.insert(users).values({
      email: "member-unread@slock.test",
      name: "member-unread",
      displayName: "Member Unread",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Unread Summary Server", "unread-summary-server", owner.id);
    await db.insert(serverMembers).values({
      serverId: server.id,
      userId: member.id,
      role: "member",
    });

    const joinedChannel = await createChannel(server.id, "joined-room");
    await addHuman(joinedChannel.id, member.id);
    await addHuman(joinedChannel.id, owner.id);

    const nonJoinedChannel = await createChannel(server.id, "hidden-room");
    await addHuman(nonJoinedChannel.id, owner.id);

    await createMessage(joinedChannel.id, "user", owner.id, "joined unread 1");
    await createMessage(joinedChannel.id, "user", owner.id, "joined unread 2");
    await createMessage(nonJoinedChannel.id, "user", owner.id, "hidden unread 1");
    await createMessage(nonJoinedChannel.id, "user", owner.id, "hidden unread 2");
    await createMessage(nonJoinedChannel.id, "user", owner.id, "hidden unread 3");

    const loginResponse = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: member.email,
        password: "password123",
      }),
    });
    assert.equal(loginResponse.status, 200);
    const loginData = await loginResponse.json() as { accessToken: string };
    assert.ok(loginData.accessToken);

    const summaryResponse = await fetch(`${app.baseUrl}/api/servers/unread-summary`, {
      headers: {
        Authorization: `Bearer ${loginData.accessToken}`,
      },
    });
    assert.equal(summaryResponse.status, 200);
    const summary = await summaryResponse.json() as Array<{ serverId: string; unreadCount: number }>;

    assert.deepEqual(summary, [
      {
        serverId: server.id,
        unreadCount: 2,
      },
    ]);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/unread-summary records phases and batched query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "b".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const { userAB, serverA, serverB } = await seedTwoServerFixture();
    const channelA = await createChannel(serverA.id, "summary-trace-a");
    await addHuman(channelA.id, userAB.id);
    await createMessage(channelA.id, "user", userAB.id, "server a unread 1");
    await createMessage(channelA.id, "user", userAB.id, "server a unread 2");

    const channelB = await createChannel(serverB.id, "summary-trace-b");
    await addHuman(channelB.id, userAB.id);
    await createMessage(channelB.id, "user", userAB.id, "server b unread 1");
    await createMessage(channelB.id, "user", userAB.id, "server b unread 2");
    await createMessage(channelB.id, "user", userAB.id, "server b unread 3");

    const token = await loginHelper(app.baseUrl, userAB.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/servers/unread-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const summary = await res.json() as Array<{ serverId: string; unreadCount: number }>;
    assert.deepEqual(
      summary.map((item) => [item.serverId, item.unreadCount]).sort(),
      [
        [serverA.id, 2],
        [serverB.id, 3],
      ].sort(),
    );

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/servers/unread-summary",
    );
    assert.ok(span, "expected GET /api/servers/unread-summary root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "unread_summary.load.started",
      "server_memberships.loaded",
      "inbox.backend.selected",
      "unread_summary.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "servers.memberships_by_user",
        "servers.sidebar_unread_counts_by_user",
      ],
    );
    assert.equal(dbEvents.length, 2);

    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("servers.memberships_by_user")?.attrs?.phase, "server_memberships.loaded");
    assert.equal(dbEventByQuery.get("servers.memberships_by_user")?.attrs?.servers_count, 2);
    assert.equal(dbEventByQuery.get("servers.sidebar_unread_counts_by_user")?.attrs?.phase, "unread_summary.loaded");
    assert.equal(dbEventByQuery.get("servers.sidebar_unread_counts_by_user")?.attrs?.servers_count, 2);
    assert.equal(dbEventByQuery.get("servers.sidebar_unread_counts_by_user")?.attrs?.servers_with_unread_count, 2);
    assert.equal(dbEventByQuery.get("servers.sidebar_unread_counts_by_user")?.attrs?.["inbox.backend"], "pg_legacy");
    assert.equal(dbEventByQuery.get("servers.sidebar_unread_counts_by_user")?.attrs?.["inbox.route"], "sidebar_summary");
    assert.equal(dbEventByQuery.get("servers.sidebar_unread_counts_by_user")?.attrs?.["inbox.fallback_reason"], "pglite_dev");
    assert.equal(dbEventByQuery.get("servers.sidebar_unread_counts_by_user")?.attrs?.["inbox.contract_version"], 1);

    const backendEvent = span.events.find((event) => event.name === "inbox.backend.selected");
    assert.ok(backendEvent);
    assert.equal(backendEvent.attrs?.["inbox.backend"], "pg_legacy");
    assert.equal(backendEvent.attrs?.["inbox.route"], "sidebar_summary");
    assert.equal(backendEvent.attrs?.["inbox.fallback_reason"], "pglite_dev");
    assert.equal(backendEvent.attrs?.["inbox.contract_version"], 1);

    const loadedEvent = span.events.find((event) => event.name === "unread_summary.loaded");
    assert.ok(loadedEvent);
    assert.equal(loadedEvent.attrs?.servers_count, 2);
    assert.equal(loadedEvent.attrs?.servers_with_unread_count, 2);
    assert.equal(loadedEvent.attrs?.total_unread_count, 5);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.servers_count, 2);
    assert.equal(readyEvent.attrs?.total_unread_count, 5);
    assert.equal(Object.values(span.attrs ?? {}).includes(userAB.id), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(serverA.id), false);
    assert.equal(
      dbEvents.some((event) => Object.values(event.attrs ?? {}).includes(serverB.id)),
      false,
    );
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/sidebar-order sanitizes saved ids without rebuilding allowed ids", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "c".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const { userAB, serverA } = await seedTwoServerFixture();
    const channel = await createChannel(serverA.id, "sidebar-order-trace");
    await addHuman(channel.id, userAB.id);
    const privateChannel = await createChannel(serverA.id, "sidebar-order-private", undefined, "private");
    await addHuman(privateChannel.id, userAB.id);
    const nonMemberPrivateChannel = await createChannel(serverA.id, "sidebar-order-private-hidden", undefined, "private");
    const agent = await createAgent(serverA.id, "sidebar-order-agent", { runtime: "codex" });
    const dm = await findOrCreateDM(serverA.id, userAB.id, agent.id);
    assert.ok(dm, "expected agent DM");
    await createMessage(dm.id, "user", userAB.id, "sidebar order trace dm");
    const staleId = "not-a-valid-id";
    await updateMemberSidebarOrder(serverA.id, userAB.id, {
      channelOrder: [staleId, channel.id, privateChannel.id, nonMemberPrivateChannel.id],
      agentOrder: [agent.id, staleId],
      dmOrder: [staleId, dm.id],
      channelSortMode: "recent",
      dmSortMode: "az",
      pinnedSortMode: "recent",
      pinnedChannelIds: [staleId, channel.id, privateChannel.id, nonMemberPrivateChannel.id, dm.id],
      pinnedAgentIds: [staleId, agent.id],
      pinnedOrder: [staleId, channel.id, privateChannel.id, nonMemberPrivateChannel.id, agent.id, dm.id],
      hiddenDmIds: [dm.id, staleId],
      channelPanelTabOrder: ["files", "not-a-tab", "chat"],
      agentPanelTabOrder: ["activity", "workspace", "not-a-tab", "profile"],
    });

    const token = await loginHelper(app.baseUrl, userAB.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/servers/${serverA.id}/sidebar-order`, {
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": serverA.id },
    });
    assert.equal(res.status, 200);
    const body = await res.json() as {
      channelOrder: string[];
      agentOrder: string[];
      dmOrder: string[];
      channelSortMode: string;
      dmSortMode: string;
      pinnedSortMode: string;
      pinnedChannelIds: string[];
      pinnedAgentIds: string[];
      pinnedOrder: string[];
      hiddenDmIds: string[];
      channelPanelTabOrder: string[];
      agentPanelTabOrder: string[];
    };
    assert.deepEqual(body.channelOrder, [channel.id, privateChannel.id]);
    assert.deepEqual(body.agentOrder, [agent.id]);
    assert.deepEqual(body.dmOrder, [dm.id]);
    assert.equal(body.channelSortMode, "recent");
    assert.equal(body.dmSortMode, "az");
    assert.equal(body.pinnedSortMode, "recent");
    assert.deepEqual(body.pinnedChannelIds, [channel.id, privateChannel.id, dm.id]);
    assert.deepEqual(body.pinnedAgentIds, [agent.id]);
    assert.deepEqual(body.pinnedOrder, [channel.id, privateChannel.id, agent.id, dm.id]);
    assert.deepEqual(body.hiddenDmIds, [dm.id]);
    assert.deepEqual(body.channelPanelTabOrder, ["files", "chat"]);
    assert.deepEqual(body.agentPanelTabOrder, ["activity", "workspace", "profile"]);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/servers/:id/sidebar-order",
    );
    assert.ok(span, "expected GET /api/servers/:id/sidebar-order root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "sidebar_order.load.started",
      "server.membership.checked",
      "sidebar_order.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.equal(dbEvents.length, 2);
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "servers.member_by_user",
        "servers.sidebar_order_by_member_sanitized",
      ],
    );

    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("servers.member_by_user")?.attrs?.phase, "server.membership.checked");
    assert.equal(dbEventByQuery.get("servers.sidebar_order_by_member_sanitized")?.attrs?.phase, "sidebar_order.loaded");

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.channel_order_count, 2);
    assert.equal(readyEvent.attrs?.agent_order_count, 1);
    assert.equal(readyEvent.attrs?.dm_order_count, 1);
    assert.equal(Object.values(span.attrs ?? {}).includes(serverA.id), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(channel.id), false);
    assert.equal(
      dbEvents.some((event) => Object.values(event.attrs ?? {}).includes(agent.id)),
      false,
    );
  } finally {
    await app.close();
  }
});

test("PATCH /api/servers/:id/sidebar-order persists sidebar sort modes", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userAB, serverA } = await seedTwoServerFixture();
    const token = await loginHelper(app.baseUrl, userAB.email);

    async function patch(body: unknown) {
      return fetch(`${app.baseUrl}/api/servers/${serverA.id}/sidebar-order`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Server-Id": serverA.id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    const updateRes = await patch({
      channelSortMode: "recent",
      dmSortMode: "az",
      pinnedSortMode: "recent",
      channelPanelTabOrder: ["files", "tasks", "chat"],
      agentPanelTabOrder: ["activity", "profile"],
    });
    assert.equal(updateRes.status, 200);
    const updateBody = await updateRes.json() as {
      channelSortMode: string;
      dmSortMode: string;
      pinnedSortMode: string;
      channelPanelTabOrder: string[];
      agentPanelTabOrder: string[];
    };
    assert.equal(updateBody.channelSortMode, "recent");
    assert.equal(updateBody.dmSortMode, "az");
    assert.equal(updateBody.pinnedSortMode, "recent");
    assert.deepEqual(updateBody.channelPanelTabOrder, ["files", "tasks", "chat"]);
    assert.deepEqual(updateBody.agentPanelTabOrder, ["activity", "profile"]);

    const getRes = await fetch(`${app.baseUrl}/api/servers/${serverA.id}/sidebar-order`, {
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": serverA.id },
    });
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json() as {
      channelSortMode: string;
      dmSortMode: string;
      pinnedSortMode: string;
      channelPanelTabOrder: string[];
      agentPanelTabOrder: string[];
    };
    assert.equal(getBody.channelSortMode, "recent");
    assert.equal(getBody.dmSortMode, "az");
    assert.equal(getBody.pinnedSortMode, "recent");
    assert.deepEqual(getBody.channelPanelTabOrder, ["files", "tasks", "chat"]);
    assert.deepEqual(getBody.agentPanelTabOrder, ["activity", "profile"]);

    const invalidRes = await patch({ channelSortMode: "newest" });
    assert.equal(invalidRes.status, 400);
    const invalidPinnedRes = await patch({ pinnedSortMode: "newest" });
    assert.equal(invalidPinnedRes.status, 400);
    const invalidPanelTabRes = await patch({ channelPanelTabOrder: "files" });
    assert.equal(invalidPanelTabRes.status, 400);
  } finally {
    await app.close();
  }
});

async function seedRoleFixture(serverSlug: string) {
  const db = getDb();
  const seed = async (email: string) => {
    const [row] = await db.insert(users).values({
      email,
      name: email.split("@")[0],
      displayName: email.split("@")[0],
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    return row;
  };
  const owner = await seed(`owner-${serverSlug}@slock.test`);
  const admin = await seed(`admin-${serverSlug}@slock.test`);
  const member = await seed(`member-${serverSlug}@slock.test`);
  const server = await createServer(`Role ${serverSlug}`, serverSlug, owner.id);
  await getDb().insert(serverMembers).values([
    { serverId: server.id, userId: admin.id, role: "admin" },
    { serverId: server.id, userId: member.id, role: "member" },
  ]);
  return { owner, admin, member, server };
}

async function getServerMemberRole(serverId: string, userId: string) {
  const [row] = await getDb()
    .select({ role: serverMembers.role })
    .from(serverMembers)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)));
  return row?.role;
}

test("PATCH /api/servers/:id/members/:memberId lets owners grant and revoke owner role while preserving a remaining owner", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, admin, member, server } = await seedRoleFixture("multi-owner-roles");
    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const adminToken = await loginHelper(app.baseUrl, admin.email);

    const patchRole = (token: string, targetId: string, role: string) => fetch(`${app.baseUrl}/api/servers/${server.id}/members/${targetId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    const adminOwnerRes = await patchRole(adminToken, member.id, "owner");
    assert.equal(adminOwnerRes.status, 403, "admin cannot grant owner");

    const promoteOwnerRes = await patchRole(ownerToken, member.id, "owner");
    assert.equal(promoteOwnerRes.status, 200);
    assert.equal(await getServerMemberRole(server.id, member.id), "owner");

    const revokeOwnerRes = await patchRole(ownerToken, member.id, "member");
    assert.equal(revokeOwnerRes.status, 200);
    assert.equal(await getServerMemberRole(server.id, member.id), "member");

    const selfDemoteRes = await patchRole(ownerToken, owner.id, "member");
    assert.equal(selfDemoteRes.status, 400, "owners still cannot change their own role through the member route");
  } finally {
    await app.close();
  }
});

test("POST /api/servers/:id/members lets owners add another owner directly", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, admin, server } = await seedRoleFixture("multi-owner-add");
    const [ownerInvitee, adminInvitee] = await getDb().insert(users).values([
      {
        email: "owner-invitee-multi-owner-add@slock.test",
        name: "owner-invitee-multi-owner-add",
        displayName: "Owner Invitee",
        passwordHash: await argon2.hash("password123"),
        emailVerified: true,
      },
      {
        email: "admin-invitee-multi-owner-add@slock.test",
        name: "admin-invitee-multi-owner-add",
        displayName: "Admin Invitee",
        passwordHash: await argon2.hash("password123"),
        emailVerified: true,
      },
    ]).returning();

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const adminToken = await loginHelper(app.baseUrl, admin.email);

    const addMember = (token: string, userId: string, role: string) => fetch(`${app.baseUrl}/api/servers/${server.id}/members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role }),
    });

    const ownerAddOwnerRes = await addMember(ownerToken, ownerInvitee.id, "owner");
    assert.equal(ownerAddOwnerRes.status, 200);
    assert.equal(await getServerMemberRole(server.id, ownerInvitee.id), "owner");

    const adminAddOwnerRes = await addMember(adminToken, adminInvitee.id, "owner");
    assert.equal(adminAddOwnerRes.status, 403, "admin cannot add another owner");
    assert.equal(await getServerMemberRole(server.id, adminInvitee.id), undefined);
  } finally {
    await app.close();
  }
});

test("DELETE /api/servers/:id/members/:memberId allows removing a non-last owner only by another owner", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, admin, member, server } = await seedRoleFixture("multi-owner-remove");
    await getDb()
      .update(serverMembers)
      .set({ role: "owner" })
      .where(eq(serverMembers.userId, member.id));

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const adminToken = await loginHelper(app.baseUrl, admin.email);

    const remove = (token: string, targetId: string) => fetch(`${app.baseUrl}/api/servers/${server.id}/members/${targetId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Server-Id": server.id,
      },
    });

    const adminRemoveOwnerRes = await remove(adminToken, member.id);
    assert.equal(adminRemoveOwnerRes.status, 403, "admin cannot remove owner");

    const ownerRemoveOwnerRes = await remove(ownerToken, member.id);
    assert.equal(ownerRemoveOwnerRes.status, 200);
    assert.equal(await getServerMemberRole(server.id, member.id), undefined);

    const removeLastOwnerRes = await remove(ownerToken, owner.id);
    assert.equal(removeLastOwnerRes.status, 400, "last owner cannot be removed");
  } finally {
    await app.close();
  }
});

test("POST /api/servers/:id/leave lets an owner leave only when another owner remains", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, member, server } = await seedRoleFixture("multi-owner-leave");
    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const memberToken = await loginHelper(app.baseUrl, member.email);

    const leave = (token: string) => fetch(`${app.baseUrl}/api/servers/${server.id}/leave`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
    });

    const onlyOwnerRes = await leave(ownerToken);
    assert.equal(onlyOwnerRes.status, 405);

    await getDb()
      .update(serverMembers)
      .set({ role: "owner" })
      .where(eq(serverMembers.userId, member.id));

    const secondOwnerRes = await leave(memberToken);
    assert.equal(secondOwnerRes.status, 200);
  } finally {
    await app.close();
  }
});

test("PATCH /api/servers/:id lets owner and admin rename, rejects member", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, admin, member, server } = await seedRoleFixture("patch-profile");

    async function patch(token: string, body: unknown) {
      return fetch(`${app.baseUrl}/api/servers/${server.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Server-Id": server.id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const ownerRes = await patch(ownerToken, { name: "Renamed by Owner", hideHumansFromMembers: true });
    assert.equal(ownerRes.status, 200);
    const ownerBody = await ownerRes.json() as { name: string; hideHumansFromMembers: boolean };
    assert.equal(ownerBody.name, "Renamed by Owner");
    assert.equal(ownerBody.hideHumansFromMembers, true);

    const [storedAfterOwner] = await getDb()
      .select({ hideHumansFromMembers: serversTable.hideHumansFromMembers })
      .from(serversTable)
      .where(eq(serversTable.id, server.id));
    assert.equal(storedAfterOwner.hideHumansFromMembers, true);

    const adminToken = await loginHelper(app.baseUrl, admin.email);
    const adminRes = await patch(adminToken, { name: "Renamed by Admin", hideHumansFromMembers: false });
    assert.equal(adminRes.status, 200);
    const adminBody = await adminRes.json() as { name: string; hideHumansFromMembers: boolean };
    assert.equal(adminBody.name, "Renamed by Admin");
    assert.equal(adminBody.hideHumansFromMembers, false);

    const memberToken = await loginHelper(app.baseUrl, member.email);
    const memberRes = await patch(memberToken, { hideHumansFromMembers: true });
    assert.equal(memberRes.status, 403);

    const emptyRes = await patch(ownerToken, { name: "   " });
    assert.equal(emptyRes.status, 400);

    const invalidPrivacyRes = await patch(ownerToken, { hideHumansFromMembers: "yes" });
    assert.equal(invalidPrivacyRes.status, 400);
  } finally {
    await app.close();
  }
});

test("POST /api/servers/:id/invites rejects invalid email addresses", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, server } = await seedRoleFixture("invite-invalid-email");
    const ownerToken = await loginHelper(app.baseUrl, owner.email);

    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/invites`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "not-an-email" }),
    });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "Enter a valid email address" });
  } finally {
    await app.close();
  }
});

test("PATCH /api/servers/:id/onboarding-settings lets owner/admin set onboarding agent and keeps member limited to reminder prefs", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, admin, member, server } = await seedRoleFixture("onboarding-settings");
    const ownerAgent = await createAgent(server.id, "owner-onboarding-agent", { runtime: "codex" });
    const adminAgent = await createAgent(server.id, "admin-onboarding-agent", { runtime: "codex" });

    async function patch(token: string, body: unknown) {
      return fetch(`${app.baseUrl}/api/servers/${server.id}/onboarding-settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Server-Id": server.id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const initialRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/onboarding-settings`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(initialRes.status, 200);
    const initialBody = await initialRes.json() as {
      agentAllChannelGreetingEnabled: boolean;
      dismissedAddComputerStepAt: string | null;
      dismissedCreateAgentStepAt: string | null;
      dismissedInviteStepAt: string | null;
      dismissedCommunityStepAt: string | null;
      dismissedNotificationStepAt: string | null;
      onboardingWizardCurrentStep: string | null;
    };
    assert.equal(initialBody.agentAllChannelGreetingEnabled, true);
    assert.equal(initialBody.dismissedAddComputerStepAt, null);
    assert.equal(initialBody.dismissedCreateAgentStepAt, null);
    assert.equal(initialBody.dismissedInviteStepAt, null);
    assert.equal(initialBody.dismissedCommunityStepAt, null);
    assert.equal(initialBody.dismissedNotificationStepAt, null);
    assert.equal(initialBody.onboardingWizardCurrentStep, null);

    const ownerRes = await patch(ownerToken, { onboardingAgentId: ownerAgent.id, agentAllChannelGreetingEnabled: false });
    assert.equal(ownerRes.status, 200);
    const ownerBody = await ownerRes.json() as { onboardingAgentId: string | null; agentAllChannelGreetingEnabled: boolean };
    assert.equal(ownerBody.onboardingAgentId, ownerAgent.id);
    assert.equal(ownerBody.agentAllChannelGreetingEnabled, false);

    const adminToken = await loginHelper(app.baseUrl, admin.email);
    const adminRes = await patch(adminToken, { onboardingAgentId: adminAgent.id, agentAllChannelGreetingEnabled: true });
    assert.equal(adminRes.status, 200);
    const adminBody = await adminRes.json() as { onboardingAgentId: string | null; agentAllChannelGreetingEnabled: boolean };
    assert.equal(adminBody.onboardingAgentId, adminAgent.id);
    assert.equal(adminBody.agentAllChannelGreetingEnabled, true);

    const memberToken = await loginHelper(app.baseUrl, member.email);
    const memberReminderRes = await patch(memberToken, {
      setupModalReminderOptOut: true,
      dismissedAddComputerStep: true,
      dismissedCreateAgentStep: true,
      dismissedInviteStep: true,
      dismissedCommunityStep: true,
      dismissedNotificationStep: true,
      onboardingWizardCurrentStep: "invite-teammates",
    });
    assert.equal(memberReminderRes.status, 200);
    const memberReminderBody = await memberReminderRes.json() as {
      setupModalReminderOptOut: boolean;
      dismissedAddComputerStepAt: string | null;
      dismissedCreateAgentStepAt: string | null;
      dismissedInviteStepAt: string | null;
      dismissedCommunityStepAt: string | null;
      dismissedNotificationStepAt: string | null;
      onboardingWizardCurrentStep: string | null;
    };
    assert.equal(memberReminderBody.setupModalReminderOptOut, true);
    assert.ok(memberReminderBody.dismissedAddComputerStepAt);
    assert.ok(memberReminderBody.dismissedCreateAgentStepAt);
    assert.ok(memberReminderBody.dismissedInviteStepAt);
    assert.ok(memberReminderBody.dismissedCommunityStepAt);
    assert.ok(memberReminderBody.dismissedNotificationStepAt);
    assert.equal(memberReminderBody.onboardingWizardCurrentStep, "invite-teammates");

    const memberClearStepRes = await patch(memberToken, { onboardingWizardCurrentStep: null });
    assert.equal(memberClearStepRes.status, 200);
    const memberClearStepBody = await memberClearStepRes.json() as { onboardingWizardCurrentStep: string | null };
    assert.equal(memberClearStepBody.onboardingWizardCurrentStep, null);

    const memberAgentRes = await patch(memberToken, { onboardingAgentId: ownerAgent.id });
    assert.equal(memberAgentRes.status, 403);
    const memberAgentBody = await memberAgentRes.json() as { error: string };
    assert.equal(memberAgentBody.error, "Only server owners and admins can update onboarding settings");

    const memberGreetingRes = await patch(memberToken, { agentAllChannelGreetingEnabled: false });
    assert.equal(memberGreetingRes.status, 403);

    const invalidGreetingRes = await patch(ownerToken, { agentAllChannelGreetingEnabled: "nope" });
    assert.equal(invalidGreetingRes.status, 400);

    const invalidStepRes = await patch(memberToken, { onboardingWizardCurrentStep: "bogus" });
    assert.equal(invalidStepRes.status, 400);
  } finally {
    await app.close();
  }
});

test("GET/PATCH /api/servers/:id/translation-settings is server-scoped and owner/admin managed", async () => {
  await withTranslationEnv({ TRANSLATION_PROVIDER: "fake" }, async () => {
    const app = await startTestApp("pglite://");
    try {
      const { owner, admin, member, server } = await seedRoleFixture("translation-settings");

      const request = (token: string, method: "GET" | "PATCH", body?: unknown) => fetch(`${app.baseUrl}/api/servers/${server.id}/translation-settings`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Server-Id": server.id,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const ownerToken = await loginHelper(app.baseUrl, owner.email);
      const adminToken = await loginHelper(app.baseUrl, admin.email);
      const memberToken = await loginHelper(app.baseUrl, member.email);
      const getRes = await request(ownerToken, "GET");
      assert.equal(getRes.status, 200);
      assert.deepEqual(await getRes.json(), {
        translationEnabled: false,
        translationAvailable: true,
        canManageTranslation: true,
      });

      const memberGet = await request(memberToken, "GET");
      assert.equal(memberGet.status, 200);
      assert.deepEqual(await memberGet.json(), {
        translationEnabled: false,
        translationAvailable: true,
        canManageTranslation: false,
      });

      const memberPatch = await request(memberToken, "PATCH", { translationEnabled: true });
      assert.equal(memberPatch.status, 403);
      assert.deepEqual(await memberPatch.json(), { error: "Only server owners and admins can update translation settings" });

      const invalidPatch = await request(ownerToken, "PATCH", { translationEnabled: "yes" });
      assert.equal(invalidPatch.status, 400);
      assert.deepEqual(await invalidPatch.json(), { error: "translationEnabled must be a boolean" });

      const adminPatch = await request(adminToken, "PATCH", { translationEnabled: true });
      assert.equal(adminPatch.status, 200);
      assert.deepEqual(await adminPatch.json(), {
        translationEnabled: true,
        translationAvailable: true,
        canManageTranslation: true,
      });

      const patchRes = await request(ownerToken, "PATCH", { translationEnabled: false });
      assert.equal(patchRes.status, 200);
      assert.deepEqual(await patchRes.json(), {
        translationEnabled: false,
        translationAvailable: true,
        canManageTranslation: true,
      });
    } finally {
      await app.close();
    }
  });
});

test("GET /api/servers/:id/translation-settings reports Volcengine provider availability from credentials", async () => {
  await withTranslationEnv({
    TRANSLATION_PROVIDER: "volcengine",
    TRANSLATION_VOLCENGINE_ACCESS_KEY_ID: "ak-test",
    TRANSLATION_VOLCENGINE_SECRET_ACCESS_KEY: "sk-test",
  }, async () => {
    const app = await startTestApp("pglite://");
    try {
      const { owner, server } = await seedRoleFixture("translation-volcengine-available");
      const ownerToken = await loginHelper(app.baseUrl, owner.email);

      const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/translation-settings`, {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          "X-Server-Id": server.id,
        },
      });

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        translationEnabled: false,
        translationAvailable: true,
        canManageTranslation: true,
      });
    } finally {
      await app.close();
    }
  });
});

test("GET /api/servers/:id/translation-settings reports Volcengine unavailable without credentials", async () => {
  await withTranslationEnv({ TRANSLATION_PROVIDER: "volcengine" }, async () => {
    const app = await startTestApp("pglite://");
    try {
      const { owner, server } = await seedRoleFixture("translation-volcengine-unavailable");
      const ownerToken = await loginHelper(app.baseUrl, owner.email);

      const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/translation-settings`, {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          "X-Server-Id": server.id,
        },
      });

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        translationEnabled: false,
        translationAvailable: false,
        canManageTranslation: true,
      });
    } finally {
      await app.close();
    }
  });
});

test("GET /api/servers/:id/translation-settings reports Google provider availability from credentials", async () => {
  await withTranslationEnv({
    TRANSLATION_PROVIDER: "google",
    TRANSLATION_GOOGLE_PROJECT_ID: "slock-test",
    TRANSLATION_GOOGLE_ACCESS_TOKEN: "ya29.test",
  }, async () => {
    const app = await startTestApp("pglite://");
    try {
      const { owner, server } = await seedRoleFixture("translation-google-available");
      const ownerToken = await loginHelper(app.baseUrl, owner.email);

      const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/translation-settings`, {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          "X-Server-Id": server.id,
        },
      });

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        translationEnabled: false,
        translationAvailable: true,
        canManageTranslation: true,
      });
    } finally {
      await app.close();
    }
  });
});

test("GET /api/servers/:id/translation-settings reports Google unavailable without auth", async () => {
  await withTranslationEnv({
    TRANSLATION_PROVIDER: "google",
    TRANSLATION_GOOGLE_PROJECT_ID: "slock-test",
  }, async () => {
    const app = await startTestApp("pglite://");
    try {
      const { owner, server } = await seedRoleFixture("translation-google-unavailable");
      const ownerToken = await loginHelper(app.baseUrl, owner.email);

      const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/translation-settings`, {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          "X-Server-Id": server.id,
        },
      });

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        translationEnabled: false,
        translationAvailable: false,
        canManageTranslation: true,
      });
    } finally {
      await app.close();
    }
  });
});

test("GET /api/servers/:id/translation-settings reports translation unavailable when provider is unconfigured", async () => {
  await withTranslationEnv({}, async () => {
    const app = await startTestApp("pglite://");
    try {
      const { owner, server } = await seedRoleFixture("translation-unavailable");
      const ownerToken = await loginHelper(app.baseUrl, owner.email);

      const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/translation-settings`, {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          "X-Server-Id": server.id,
        },
      });

      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        translationEnabled: false,
        translationAvailable: false,
        canManageTranslation: true,
      });
    } finally {
      await app.close();
    }
  });
});

test("GET/PATCH /api/servers/:id/notification-settings lets each member mute only their own server notifications", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, member, server } = await seedRoleFixture("notification-settings");
    const memberToken = await loginHelper(app.baseUrl, member.email);
    const ownerToken = await loginHelper(app.baseUrl, owner.email);

    const getSettings = (token: string) => fetch(`${app.baseUrl}/api/servers/${server.id}/notification-settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Server-Id": server.id,
      },
    });
    const patchSettings = (token: string, body: unknown) => fetch(`${app.baseUrl}/api/servers/${server.id}/notification-settings`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const initialRes = await getSettings(memberToken);
    assert.equal(initialRes.status, 200);
    const initialBody = await initialRes.json() as { serverPushMuted: boolean };
    assert.equal(initialBody.serverPushMuted, false);

    const invalidRes = await patchSettings(memberToken, { serverPushMuted: "yes" });
    assert.equal(invalidRes.status, 400);

    const mutedRes = await patchSettings(memberToken, { serverPushMuted: true });
    assert.equal(mutedRes.status, 200);
    const mutedBody = await mutedRes.json() as { serverPushMuted: boolean };
    assert.equal(mutedBody.serverPushMuted, true);

    const ownerRes = await getSettings(ownerToken);
    assert.equal(ownerRes.status, 200);
    const ownerBody = await ownerRes.json() as { serverPushMuted: boolean };
    assert.equal(ownerBody.serverPushMuted, false);

    const unmutedRes = await patchSettings(memberToken, { serverPushMuted: false });
    assert.equal(unmutedRes.status, 200);
    const unmutedBody = await unmutedRes.json() as { serverPushMuted: boolean };
    assert.equal(unmutedBody.serverPushMuted, false);
  } finally {
    await app.close();
  }
});

test("POST /api/servers/:id/leave removes admin and member, rejects owner", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, admin, member, server } = await seedRoleFixture("leave-server");

    async function leave(token: string) {
      return fetch(`${app.baseUrl}/api/servers/${server.id}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
      });
    }

    const memberToken = await loginHelper(app.baseUrl, member.email);
    const memberRes = await leave(memberToken);
    assert.equal(memberRes.status, 200);

    const adminToken = await loginHelper(app.baseUrl, admin.email);
    const adminRes = await leave(adminToken);
    assert.equal(adminRes.status, 200);

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const ownerRes = await leave(ownerToken);
    assert.equal(ownerRes.status, 405);
  } finally {
    await app.close();
  }
});

test("DELETE /api/servers/:id broadcasts deleted server removal to all active members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, admin, member, server } = await seedRoleFixture("delete-server-socket");
    const events = installFakeIo(app.app);

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(res.status, 200);

    assert.deepEqual(
      events.filter((event) => event.event === "server:deleted"),
      [
        {
          room: `server:${server.id}`,
          event: "server:deleted",
          payload: {
            serverId: server.id,
          },
        },
      ],
    );

    const removalRooms = events
      .filter((event) => event.event === "server:membership-removed")
      .map((event) => event.room)
      .sort();
    assert.deepEqual(
      removalRooms,
      [`user:${owner.id}`, `user:${admin.id}`, `user:${member.id}`].sort(),
    );
    for (const event of events.filter((event) => event.event === "server:membership-removed")) {
      assert.deepEqual(event.payload, { serverId: server.id });
    }
  } finally {
    await app.close();
  }
});

test("POST /api/servers/:id/members broadcasts server:member-added to active server clients", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, server } = await seedRoleFixture("member-added-socket");
    const [newMember] = await getDb().insert(users).values({
      email: "new-member-added-socket@slock.test",
      name: "new-member-added-socket",
      displayName: "New Member Added Socket",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const events = installFakeIo(app.app);

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: newMember.id }),
    });
    assert.equal(res.status, 200);

    assert.deepEqual(events, [{
      room: `server:${server.id}`,
      event: "server:member-added",
      payload: {
        serverId: server.id,
        userId: newMember.id,
      },
    }]);
  } finally {
    await app.close();
  }
});

test("PATCH /api/servers/:id/members/:memberId broadcasts server:member-updated to refresh member roles", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, member, server } = await seedRoleFixture("member-updated-socket");
    const events = installFakeIo(app.app);

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/members/${member.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "admin" }),
    });
    assert.equal(res.status, 200);

    assert.deepEqual(events, [{
      room: `server:${server.id}`,
      event: "server:member-updated",
      payload: {
        serverId: server.id,
        userId: member.id,
      },
    }]);
  } finally {
    await app.close();
  }
});

test("DELETE /api/servers/:id/members/:memberId broadcasts server member removal to active server clients", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, member, server } = await seedRoleFixture("member-removed-socket");
    const events = installFakeIo(app.app);

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/members/${member.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(res.status, 200);

    assert.deepEqual(events, [
      {
        room: `server:${server.id}`,
        event: "server:member-removed",
        payload: {
          serverId: server.id,
          userId: member.id,
        },
      },
      {
        room: `user:${member.id}`,
        event: "server:membership-removed",
        payload: {
          serverId: server.id,
        },
      },
    ]);
  } finally {
    await app.close();
  }
});

test("server machine mutations broadcast machine:updated to active server clients", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, server } = await seedRoleFixture("machine-updated-socket");
    const events = installFakeIo(app.app);
    const ownerToken = await loginHelper(app.baseUrl, owner.email);

    const createRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "socket-machine" }),
    });
    assert.equal(createRes.status, 200);
    const createBody = await createRes.json() as { machine: { id: string } };
    const machineId = createBody.machine.id;

    const renameRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machineId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "renamed-socket-machine" }),
    });
    assert.equal(renameRes.status, 200);

    const deleteRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machineId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(deleteRes.status, 200);

    assert.deepEqual(events, [
      {
        room: `server:${server.id}`,
        event: "machine:updated",
        payload: { serverId: server.id, machineId },
      },
      {
        room: `server:${server.id}`,
        event: "machine:updated",
        payload: { serverId: server.id, machineId },
      },
      {
        room: `server:${server.id}`,
        event: "machine:updated",
        payload: { serverId: server.id, machineId },
      },
    ]);
  } finally {
    await app.close();
  }
});

async function seedMachineDeleteFixture(slug: string) {
  const db = getDb();
  const [owner] = await db.insert(users).values({
    email: `${slug}@slock.test`,
    name: slug,
    displayName: slug,
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  const server = await createServer(`Machine Delete ${slug}`, `machine-delete-${slug}`, owner.id);
  const { machine } = await registerMachine(server.id, owner.id, `${slug}-machine`);
  const agent = await createAgent(server.id, `${slug}-agent`, { runtime: "codex", machineId: machine.id });
  await db.insert(agentRuntimeProfiles).values({
    agentId: agent.id,
    serverId: server.id,
    machineId: machine.id,
    runtimeProfileFingerprint: `${slug}-fingerprint`,
    runtime: "codex",
    model: "gpt-5.3-codex",
    executionMode: "byoc",
    baselineRuntimeProfileFingerprint: `${slug}-baseline-fingerprint`,
    baselineMachineId: machine.id,
    baselineRuntime: "codex",
    baselineModel: "gpt-5.3-codex",
    baselineExecutionMode: "byoc",
  });
  return { owner, server, machine, agent };
}

test("DELETE /api/servers/:id/machines/:machineId cleans deleted-agent runtime profiles before deleting machine", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const { owner, server, machine, agent } = await seedMachineDeleteFixture("deleted-profile");
    await deleteAgent(agent.id);

    const token = await loginHelper(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
    });
    assert.equal(res.status, 200);

    const machineRows = await db.select({ id: machines.id }).from(machines).where(eq(machines.id, machine.id));
    assert.deepEqual(machineRows, []);
    const profileRows = await db
      .select({ agentId: agentRuntimeProfiles.agentId })
      .from(agentRuntimeProfiles)
      .where(eq(agentRuntimeProfiles.agentId, agent.id));
    assert.deepEqual(profileRows, []);
  } finally {
    await app.close();
  }
});

test("DELETE /api/servers/:id/machines/:machineId returns 409 when an active runtime profile references machine", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const { owner, server, machine, agent } = await seedMachineDeleteFixture("active-profile");
    await db.update(agents).set({ machineId: null }).where(eq(agents.id, agent.id));

    const token = await loginHelper(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
    });
    assert.equal(res.status, 409);
    const body = await res.json() as { error: string };
    assert.match(body.error, /runtime profiles still reference active agents/);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/machines records restore-route phases and machine query shape", async () => {
  const app = await startTestApp("pglite://");
  const originalFetch = globalThis.fetch;
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "3".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const { owner, server } = await seedRoleFixture("machines-trace");
    const db = getDb();
    const [onlineMachine, offlineMachine] = await db.insert(machines).values([
      {
        serverId: server.id,
        userId: owner.id,
        name: "online-machine",
        apiKeyHash: "unused-hash-online",
        runtimes: ["codex"],
        daemonVersion: "0.42.0",
      },
      {
        serverId: server.id,
        userId: owner.id,
        name: "offline-machine",
        apiKeyHash: "unused-hash-offline",
        runtimes: ["claude"],
      },
    ]).returning();
    app.app.set("agentOrchestrator", {
      getMachineStatus: async (machineId: string) => machineId === onlineMachine.id ? "online" : "offline",
      getMachineStatusVersion: async (machineId: string) => machineId === onlineMachine.id ? 7 : 0,
      getMachineDaemonVersion: (machineId: string) => machineId === onlineMachine.id ? "0.43.0" : null,
    });
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url === "https://registry.npmjs.org/@slock-ai/daemon/latest") {
        return new Response(JSON.stringify({ version: "0.43.1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return originalFetch(input, init);
    }) as typeof fetch;

    const ownerToken = await loginHelper(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { machines: Array<{ id: string; status: string; daemonVersion: string | null }>; latestDaemonVersion: string | null };
    assert.equal(body.machines.length, 2);
    assert.equal(body.machines.find((machine) => machine.id === onlineMachine.id)?.status, "online");
    assert.equal(body.machines.find((machine) => machine.id === onlineMachine.id)?.daemonVersion, "0.43.0");
    assert.equal(body.machines.find((machine) => machine.id === offlineMachine.id)?.status, "offline");
    assert.equal(body.latestDaemonVersion, null);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/servers/:id/machines",
    );
    assert.ok(span, "expected GET /api/servers/:id/machines root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "machines.list.started",
      "server.membership.checked",
      "machines.loaded",
      "machines.read_models.built",
      "latest_daemon_version.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(dbEvents.map((event) => event.attrs?.query_name), ["machines.list_by_server"]);
    assert.equal(dbEvents[0]?.attrs?.phase, "machines.loaded");
    assert.equal(dbEvents[0]?.attrs?.row_count, 2);

    const readModelEvent = span.events.find((event) => event.name === "machines.read_models.built");
    assert.ok(readModelEvent);
    assert.equal(readModelEvent.attrs?.machines_count, 2);
    assert.equal(readModelEvent.attrs?.online_machines_count, 1);
    assert.equal(readModelEvent.attrs?.daemon_version_present_count, 1);

    const latestVersionEvent = span.events.find((event) => event.name === "latest_daemon_version.loaded");
    assert.ok(latestVersionEvent);
    assert.equal(latestVersionEvent.attrs?.daemon_version_present, false);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.machines_count, 2);
    assert.equal(readyEvent.attrs?.online_machines_count, 1);
    assert.equal(readyEvent.attrs?.daemon_version_present_count, 1);
    assert.equal(readyEvent.attrs?.latest_daemon_version_present, false);
    assert.equal(Object.values(span.attrs ?? {}).includes(onlineMachine.id), false);
  } finally {
    globalThis.fetch = originalFetch;
    await app.close();
  }
});

test("machine workspace scan and runtime model detect require admin machine privileges", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, member, server } = await seedRoleFixture("machine-privilege-gate");
    const [machine] = await getDb().insert(machines).values({
      serverId: server.id,
      userId: owner.id,
      name: "privileged-machine",
      apiKeyHash: "unused-machine-privilege-hash",
      runtimes: ["codex"],
    }).returning();
    const memberToken = await loginHelper(app.baseUrl, member.email);
    const ownerToken = await loginHelper(app.baseUrl, owner.email);

    let workspaceScanCalls = 0;
    let runtimeDetectCalls = 0;
    app.app.set("agentOrchestrator", {
      hasMachineLocally: () => true,
      scanMachineWorkspaces: async () => {
        workspaceScanCalls += 1;
        return [{
          directoryName: "orphan-workspace",
          totalSizeBytes: 42,
          lastModified: new Date(0).toISOString(),
          fileCount: 1,
        }];
      },
      detectMachineRuntimeModels: async () => {
        runtimeDetectCalls += 1;
        return { models: [{ id: "gpt-5.4", label: "GPT 5.4" }], default: "gpt-5.4" };
      },
    });

    const memberWorkspaceRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}/workspaces`, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(memberWorkspaceRes.status, 403);
    assert.equal(workspaceScanCalls, 0, "member must not trigger daemon workspace scan");

    const memberRuntimeRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}/runtime-models/codex`, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(memberRuntimeRes.status, 403);
    assert.equal(runtimeDetectCalls, 0, "member must not trigger daemon runtime detection");

    const ownerWorkspaceRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}/workspaces`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(ownerWorkspaceRes.status, 200);
    assert.equal(workspaceScanCalls, 1);

    const ownerRuntimeRes = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}/runtime-models/codex`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(ownerRuntimeRes.status, 200);
    assert.equal(runtimeDetectCalls, 1);
  } finally {
    await app.close();
  }
});

test("GET /api/servers/:id/machines/:machineId/runtime-models/:runtime records detect phases and failures", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "d".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const { owner, server } = await seedRoleFixture("runtime-models-trace");
    const db = getDb();
    const [machine] = await db.insert(machines).values({
      serverId: server.id,
      userId: owner.id,
      name: "runtime-model-machine",
      apiKeyHash: "unused-runtime-model-hash",
      runtimes: ["codex"],
      daemonVersion: "0.44.0",
    }).returning();
    const ownerToken = await loginHelper(app.baseUrl, owner.email);

    app.app.set("agentOrchestrator", {
      hasMachineLocally: () => true,
      detectMachineRuntimeModels: async () => ({ models: [{ id: "gpt-5.4", label: "GPT 5.4" }], default: "gpt-5.4" }),
    });
    sink.clear();
    let res = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}/runtime-models/codex`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(res.status, 200);
    let span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/servers/:id/machines/:machineId/runtime-models/:runtime",
    );
    assert.ok(span, "expected runtime-models root span");
    assert.deepEqual(
      span.events.map((event) => event.name),
      [
        "runtime_models.detect.started",
        "server.membership.checked",
        "machine.loaded",
        "machine.routing.checked",
        "runtime_models.detected",
        "response.ready",
        "http.response.finished",
      ],
    );
    const detectedEvent = span.events.find((event) => event.name === "runtime_models.detected");
    assert.ok(detectedEvent);
    assert.equal(detectedEvent.attrs?.runtime, "codex");
    assert.equal(detectedEvent.attrs?.models_count, 1);
    assert.equal(detectedEvent.attrs?.default_model_present, true);
    assert.equal(Object.values(span.attrs ?? {}).includes(machine.id), false);

    app.app.set("agentOrchestrator", {
      hasMachineLocally: () => true,
      detectMachineRuntimeModels: async () => {
        throw new Error("daemon detect failed");
      },
    });
    sink.clear();
    res = await fetch(`${app.baseUrl}/api/servers/${server.id}/machines/${machine.id}/runtime-models/codex`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        "X-Server-Id": server.id,
      },
    });
    assert.equal(res.status, 503);
    span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/servers/:id/machines/:machineId/runtime-models/:runtime",
    );
    assert.ok(span, "expected failed runtime-models root span");
    const failedEvent = span.events.find((event) => event.name === "runtime_models.detect.failed");
    assert.ok(failedEvent);
    assert.equal(failedEvent.attrs?.runtime, "codex");
    assert.equal(failedEvent.attrs?.error_class, "Error");
    assert.equal(Object.values(failedEvent.attrs ?? {}).includes(machine.id), false);
  } finally {
    await app.close();
  }
});
