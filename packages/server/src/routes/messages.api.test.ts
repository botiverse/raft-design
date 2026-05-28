import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import { getDb } from "../db/index.js";
import { attachments, channelAgents, channelHumans, messageReactions, messages, serverMembers, users } from "../db/schema.js";
import { assignMachine, createAgent } from "../services/agentService.js";
import { addHuman, archiveChannel, createChannel, findOrCreateUserDM, getOrCreateThread } from "../services/channelService.js";
import { registerMachine } from "../services/machineService.js";
import { createMessage } from "../services/messageService.js";
import { createServer } from "../services/serverService.js";
import { startTestApp } from "../test/testAppHarness.js";

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

function authHeaders(token: string, serverId: string) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Server-Id": serverId,
  };
}

function machineHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

test("GET /messages/channel/:channelId records page-load phases and constant query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "2".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const db = getDb();
    const owner = await seedUser("messages-trace-owner@slock.test", "messages-trace-owner");
    const server = await createServer("Messages Trace Server", "messages-trace-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "messages-trace-channel");
    const agent = await createAgent(server.id, "messages-trace-agent", { runtime: "codex" });

    const userMessage = await createMessage(channel.id, "user", owner.id, "user message");
    await createMessage(channel.id, "agent", agent.id, "agent message");
    await createMessage(channel.id, "user", "system", "system message", "system");
    await db.insert(attachments).values({
      messageId: userMessage.id,
      channelId: channel.id,
      uploaderId: owner.id,
      uploaderType: "user",
      filename: "trace.png",
      mimeType: "image/png",
      sizeBytes: 128,
      storageKey: "trace/trace.png",
    });

    const ownerToken = await login(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/messages/channel/${channel.id}?limit=50`, {
      headers: {
        ...authHeaders(ownerToken, server.id),
        "X-Agent-Id": agent.id,
      },
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { messages: Array<{ id: string; attachments: unknown[] }>; historyLimited: boolean };
    assert.equal(body.messages.length, 3);
    assert.equal(body.messages.some((message) => message.attachments.length === 1), true);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/messages/channel/:channelId",
    );
    assert.ok(span, "expected GET /api/messages/channel/:channelId root span");
    assert.equal(span.attrs?.caller_kind, "agent");
    assert.equal(span.attrs?.agent_id_present, true);
    assert.equal(Object.values(span.attrs ?? {}).includes(agent.id), false);

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "messages.page.started",
      "channel.loaded",
      "channel.access.checked",
      "history.policy.checked",
      "messages.paged",
      "history.limit.skipped",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "messages.attachments_by_messages",
        "messages.channel.loaded_page",
        "messages.mentions_by_messages",
        "messages.reactions_by_messages",
        "messages.senders.agent_profiles",
        "messages.senders.channels_by_messages",
        "messages.senders.server_members",
        "messages.senders.user_profiles",
      ],
    );
    assert.equal(dbEvents.length, 8);
    assert.ok(dbEvents.length <= 8, "message page query count should stay constant for mixed senders/attachments/reactions");

    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("messages.channel.loaded_page")?.attrs?.phase, "messages.paged");
    assert.equal(dbEventByQuery.get("messages.channel.loaded_page")?.attrs?.row_count, 3);
    assert.equal(dbEventByQuery.get("messages.channel.loaded_page")?.attrs?.limit, 50);
    assert.equal(dbEventByQuery.get("messages.senders.user_profiles")?.attrs?.input_count, 1);
    assert.equal(dbEventByQuery.get("messages.senders.agent_profiles")?.attrs?.row_count, 1);
    assert.equal(dbEventByQuery.get("messages.attachments_by_messages")?.attrs?.input_count, 3);
    assert.equal(dbEventByQuery.get("messages.attachments_by_messages")?.attrs?.attachments_count, 1);

    const accessEvent = span.events.find((event) => event.name === "channel.access.checked");
    assert.ok(accessEvent);
    assert.equal(accessEvent.attrs?.allowed, true);
    assert.equal(accessEvent.attrs?.channel_type, "channel");

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.messages_count, 3);
    assert.equal(readyEvent.attrs?.history_limited, false);
  } finally {
    await app.close();
  }
});

test("public channel permalink preview resolves short message ids for non-joined users", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("public-link-owner@slock.test", "public-link-owner");
    const sender = await seedUser("public-link-sender@slock.test", "public-link-sender");
    const recipient = await seedUser("public-link-recipient@slock.test", "public-link-recipient");
    const server = await createServer("Public Link Server", "public-link-server", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: owner.id, role: "owner" },
      { serverId: server.id, userId: sender.id, role: "member" },
      { serverId: server.id, userId: recipient.id, role: "member" },
    ]).onConflictDoNothing();

    const targetChannel = await createChannel(server.id, "public-link-target");
    const shareChannel = await createChannel(server.id, "public-link-share");
    await db.insert(channelHumans).values([
      { channelId: shareChannel.id, userId: sender.id },
      { channelId: shareChannel.id, userId: recipient.id },
    ]).onConflictDoNothing();

    const targetMessage = await createMessage(
      targetChannel.id,
      "user",
      owner.id,
      "public channel permalink target",
    );
    const targetShortId = targetMessage.id.slice(0, 8);
    const permalink = `https://app.slock.ai/s/${server.slug}/channel/${targetChannel.id}?msg=${targetShortId}`;

    const senderToken = await login(app.baseUrl, sender.email);
    const sendRes = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: {
        ...authHeaders(senderToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId: shareChannel.id,
        content: `please read ${permalink}`,
      }),
    });
    assert.equal(sendRes.status, 200);
    const sentMessage = await sendRes.json() as { content: string; channelId: string };
    assert.equal(sentMessage.channelId, shareChannel.id);
    assert.match(sentMessage.content, /please read https:\/\/app\.slock\.ai/);

    const recipientToken = await login(app.baseUrl, recipient.email);
    const contextUrl = new URL(`${app.baseUrl}/api/messages/context/${targetShortId}`);
    contextUrl.searchParams.set("channelId", targetChannel.id);
    const contextRes = await fetch(contextUrl, {
      headers: authHeaders(recipientToken, server.id),
    });
    assert.equal(contextRes.status, 200);
    const context = await contextRes.json() as {
      channelId: string;
      targetMessageId: string;
      messages: Array<{ id: string; content: string }>;
    };
    assert.equal(context.channelId, targetChannel.id);
    assert.equal(context.targetMessageId, targetMessage.id);
    assert.ok(
      context.messages.some((message) =>
        message.id === targetMessage.id
        && message.content === "public channel permalink target"
      ),
      "recipient should resolve the target message without joining the public channel",
    );
  } finally {
    await app.close();
  }
});

test("message reactions add idempotently, enrich messages, and remove cleanly", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("reaction-owner@slock.test", "reaction-owner");
    const server = await createServer("Reaction Server", "reaction-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "reaction-channel");
    await db.insert(channelHumans).values({ channelId: channel.id, userId: owner.id }).onConflictDoNothing();
    const message = await createMessage(channel.id, "user", owner.id, "reactable message");
    const token = await login(app.baseUrl, owner.email);

    const add = async () => fetch(`${app.baseUrl}/api/messages/${message.id}/reactions`, {
      method: "POST",
      headers: {
        ...authHeaders(token, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji: "👍" }),
    });

    const first = await add();
    assert.equal(first.status, 200);
    const firstBody = await first.json() as { reactions: Array<{ emoji: string; count: number; reactorIds: string[]; reactorNames: string[] }> };
    assert.deepEqual(firstBody.reactions, [{
      emoji: "👍",
      count: 1,
      reactorIds: [owner.id],
      reactorNames: [owner.displayName],
    }]);

    const second = await add();
    assert.equal(second.status, 200);
    const secondBody = await second.json() as { reactions: Array<{ emoji: string; count: number; reactorIds: string[] }> };
    assert.equal(secondBody.reactions.find((reaction) => reaction.emoji === "👍")?.count, 1);

    const list = await fetch(`${app.baseUrl}/api/messages/channel/${channel.id}`, {
      headers: authHeaders(token, server.id),
    });
    assert.equal(list.status, 200);
    const listBody = await list.json() as { messages: Array<{ id: string; reactions: Array<{ emoji: string; count: number }> }> };
    assert.equal(listBody.messages.find((row) => row.id === message.id)?.reactions[0]?.count, 1);

    const remove = await fetch(`${app.baseUrl}/api/messages/${message.id}/reactions`, {
      method: "DELETE",
      headers: {
        ...authHeaders(token, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(remove.status, 200);
    const removeBody = await remove.json() as { reactions: Array<{ emoji: string }> };
    assert.deepEqual(removeBody.reactions, []);

    const persisted = await db
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, message.id));
    assert.deepEqual(persisted, []);
  } finally {
    await app.close();
  }
});

test("POST /messages rejects channel ids outside the active server context", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("messages-cross-owner@slock.test", "messages-cross-owner");
    const serverA = await createServer("Messages Cross Server A", "messages-cross-server-a", owner.id);
    const serverB = await createServer("Messages Cross Server B", "messages-cross-server-b", owner.id);
    const channelB = await createChannel(serverB.id, "messages-cross-channel-b", undefined, "private");
    await addHuman(channelB.id, owner.id);

    const ownerToken = await login(app.baseUrl, owner.email);
    const sendRes = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, serverA.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelId: channelB.id,
        content: "cross-server send should not land",
      }),
    });
    assert.equal(sendRes.status, 404, `expected cross-server send 404, got ${sendRes.status}`);

    const leakedRows = await db
      .select({ id: messages.id })
      .from(messages)
      .where(and(eq(messages.channelId, channelB.id), eq(messages.content, "cross-server send should not land")));
    assert.equal(leakedRows.length, 0, "message must not be written to a channel outside the active server");
  } finally {
    await app.close();
  }
});

test("agent reactions aggregate with human reactions without delivery side effects", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("agent-reaction-owner@slock.test", "agent-reaction-owner");
    const server = await createServer("Agent Reaction Server", "agent-reaction-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "agent-reaction-channel");
    await db.insert(channelHumans).values({ channelId: channel.id, userId: owner.id }).onConflictDoNothing();

    const agent = await createAgent(server.id, "reaction-agent", { runtime: "codex" });
    const { machine, apiKey } = await registerMachine(server.id, owner.id, "reaction-machine");
    await assignMachine(agent.id, machine.id);
    await db.insert(channelAgents).values({ channelId: channel.id, agentId: agent.id }).onConflictDoNothing();

    const message = await createMessage(channel.id, "user", owner.id, "agent reactable message");
    const ownerToken = await login(app.baseUrl, owner.email);

    const addAgent = async () => fetch(`${app.baseUrl}/internal/agent/${agent.id}/messages/${message.id}/reactions`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ emoji: "👀" }),
    });

    const first = await addAgent();
    assert.equal(first.status, 200);
    const firstBody = await first.json() as { reactions: Array<{ emoji: string; count: number; reactorIds: string[]; reactorNames: string[] }> };
    assert.deepEqual(firstBody.reactions, [{
      emoji: "👀",
      count: 1,
      reactorIds: [agent.id],
      reactorNames: [agent.displayName],
    }]);

    const second = await addAgent();
    assert.equal(second.status, 200);
    const secondBody = await second.json() as { reactions: Array<{ emoji: string; count: number }> };
    assert.equal(secondBody.reactions.find((reaction) => reaction.emoji === "👀")?.count, 1);

    const humanAdd = await fetch(`${app.baseUrl}/api/messages/${message.id}/reactions`, {
      method: "POST",
      headers: {
        ...authHeaders(ownerToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(humanAdd.status, 200);
    const humanBody = await humanAdd.json() as { reactions: Array<{ emoji: string; count: number; reactorIds: string[] }> };
    const combined = humanBody.reactions.find((reaction) => reaction.emoji === "👀");
    assert.equal(combined?.count, 2);
    assert.deepEqual(new Set(combined?.reactorIds), new Set([agent.id, owner.id]));

    const persisted = await db
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, message.id));
    assert.equal(persisted.some((row) => row.reactorType === "agent" && row.reactorId === agent.id), true);
    assert.equal(persisted.some((row) => row.reactorType === "user" && row.reactorId === owner.id), true);

    const removeAgent = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/messages/${message.id}/reactions`, {
      method: "DELETE",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(removeAgent.status, 200);
    const removeBody = await removeAgent.json() as { reactions: Array<{ emoji: string; count: number; reactorIds: string[] }> };
    const afterRemove = removeBody.reactions.find((reaction) => reaction.emoji === "👀");
    assert.equal(afterRemove?.count, 1);
    assert.deepEqual(afterRemove?.reactorIds, [owner.id]);
  } finally {
    await app.close();
  }
});

test("message reactions reject system messages and archived channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("reaction-guard-owner@slock.test", "reaction-guard-owner");
    const nonMember = await seedUser("reaction-guard-non-member@slock.test", "reaction-guard-non-member");
    const server = await createServer("Reaction Guard Server", "reaction-guard-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" }).onConflictDoNothing();
    await db.insert(serverMembers).values({ serverId: server.id, userId: nonMember.id, role: "member" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "reaction-guard-channel");
    await db.insert(channelHumans).values({ channelId: channel.id, userId: owner.id }).onConflictDoNothing();
    const systemMessage = await createMessage(channel.id, "user", "system", "system event", "system");
    const chatMessage = await createMessage(channel.id, "user", owner.id, "archived message");
    const token = await login(app.baseUrl, owner.email);
    const nonMemberToken = await login(app.baseUrl, nonMember.email);

    const systemRes = await fetch(`${app.baseUrl}/api/messages/${systemMessage.id}/reactions`, {
      method: "POST",
      headers: {
        ...authHeaders(token, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(systemRes.status, 400);
    assert.match((await systemRes.json() as { error: string }).error, /System messages/);

    const nonMemberRes = await fetch(`${app.baseUrl}/api/messages/${chatMessage.id}/reactions`, {
      method: "POST",
      headers: {
        ...authHeaders(nonMemberToken, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(nonMemberRes.status, 403);

    await archiveChannel(channel.id, owner.id);
    const archivedRes = await fetch(`${app.baseUrl}/api/messages/${chatMessage.id}/reactions`, {
      method: "POST",
      headers: {
        ...authHeaders(token, server.id),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(archivedRes.status, 409);
    const archivedBody = await archivedRes.json() as { code: string };
    assert.equal(archivedBody.code, "channel_archived");
  } finally {
    await app.close();
  }
});

test("message reactions cloak private message existence from non-members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-reaction-owner@slock.test", "private-reaction-owner");
    const outsider = await seedUser("private-reaction-outsider@slock.test", "private-reaction-outsider");
    const server = await createServer("Private Reaction Server", "private-reaction-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: outsider.id, role: "member" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "private-reaction-channel", undefined, "private");
    await db.insert(channelHumans).values({ channelId: channel.id, userId: owner.id }).onConflictDoNothing();
    const chatMessage = await createMessage(channel.id, "user", owner.id, "private reactable message");
    const systemMessage = await createMessage(channel.id, "user", "system", "private system event", "system");
    const outsiderToken = await login(app.baseUrl, outsider.email);
    const headers = {
      ...authHeaders(outsiderToken, server.id),
      "Content-Type": "application/json",
    };

    const addChat = await fetch(`${app.baseUrl}/api/messages/${chatMessage.id}/reactions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(addChat.status, 404, `expected private add 404, got ${addChat.status}`);

    const removeChat = await fetch(`${app.baseUrl}/api/messages/${chatMessage.id}/reactions`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(removeChat.status, 404, `expected private remove 404, got ${removeChat.status}`);

    const addSystem = await fetch(`${app.baseUrl}/api/messages/${systemMessage.id}/reactions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(addSystem.status, 404, `expected private system add 404, got ${addSystem.status}`);
  } finally {
    await app.close();
  }
});

test("DM message context resolves short message ids for a DM participant", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("dm-link-owner@slock.test", "dm-link-owner");
    const recipient = await seedUser("dm-link-recipient@slock.test", "dm-link-recipient");
    const server = await createServer("DM Link Server", "dm-link-server", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: owner.id, role: "owner" },
      { serverId: server.id, userId: recipient.id, role: "member" },
    ]).onConflictDoNothing();

    const dm = await findOrCreateUserDM(server.id, owner.id, recipient.id);
    assert.ok(dm);
    const targetMessage = await createMessage(
      dm.id,
      "user",
      owner.id,
      "dm short id context target",
    );
    const targetShortId = targetMessage.id.slice(0, 8);

    const recipientToken = await login(app.baseUrl, recipient.email);
    const contextUrl = new URL(`${app.baseUrl}/api/messages/context/${targetShortId}`);
    contextUrl.searchParams.set("channelId", dm.id);
    const contextRes = await fetch(contextUrl, {
      headers: authHeaders(recipientToken, server.id),
    });
    assert.equal(contextRes.status, 200);
    const context = await contextRes.json() as {
      channelId: string;
      targetMessageId: string;
      messages: Array<{ id: string; content: string }>;
    };
    assert.equal(context.channelId, dm.id);
    assert.equal(context.targetMessageId, targetMessage.id);
    assert.ok(
      context.messages.some((message) =>
        message.id === targetMessage.id
        && message.content === "dm short id context target"
      ),
      "DM participant should resolve the parent message by short id",
    );
  } finally {
    await app.close();
  }
});

test("message context canonicalizes parent-channel links that point at thread replies", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("thread-context-owner@slock.test", "thread-context-owner");
    const server = await createServer("Thread Context Server", "thread-context-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" }).onConflictDoNothing();
    const parentChannel = await createChannel(server.id, "thread-context-parent");
    await db.insert(channelHumans).values({ channelId: parentChannel.id, userId: owner.id }).onConflictDoNothing();
    const parentMessage = await createMessage(
      parentChannel.id,
      "user",
      owner.id,
      "thread parent",
    );
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    await db.insert(channelHumans).values({ channelId: thread.id, userId: owner.id }).onConflictDoNothing();
    const threadReply = await createMessage(
      thread.id,
      "user",
      owner.id,
      "thread reply",
    );

    const ownerToken = await login(app.baseUrl, owner.email);
    const contextUrl = new URL(`${app.baseUrl}/api/messages/context/${threadReply.id.slice(0, 8)}`);
    contextUrl.searchParams.set("channelId", parentChannel.id);
    const contextRes = await fetch(contextUrl, {
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(contextRes.status, 200);
    const context = await contextRes.json() as {
      channelId: string;
      targetMessageId: string;
      canonicalTarget?: {
        kind: string;
        channelId: string;
        messageId: string;
        threadParentMessageId?: string;
        threadChannelId?: string;
      };
      messages: Array<{ id: string; channelId: string; content: string }>;
    };
    assert.equal(context.channelId, thread.id);
    assert.equal(context.targetMessageId, threadReply.id);
    assert.deepEqual(context.canonicalTarget, {
      kind: "thread",
      channelId: parentChannel.id,
      messageId: threadReply.id,
      threadParentMessageId: parentMessage.id,
      threadChannelId: thread.id,
    });
    assert.ok(
      context.messages.every((message) => message.channelId === thread.id),
      "context should return thread messages, not splice thread replies into the parent channel timeline",
    );
  } finally {
    await app.close();
  }
});

test("GET /messages/search supports explicit recent sort without changing relevance default", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("search-sort-owner@slock.test", "search-sort-owner");
    const server = await createServer("Search Sort Server", "search-sort-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "search-sort-channel");

    const oldHighRelevance = await createMessage(
      channel.id,
      "user",
      owner.id,
      "chronos chronos chronos chronos chronos older high relevance",
    );
    const newLowRelevance = await createMessage(
      channel.id,
      "user",
      owner.id,
      "chronos newer low relevance",
    );

    await db.update(messages)
      .set({ createdAt: new Date("2026-05-01T00:00:00.000Z") })
      .where(eq(messages.id, oldHighRelevance.id));
    await db.update(messages)
      .set({ createdAt: new Date("2026-05-02T00:00:00.000Z") })
      .where(eq(messages.id, newLowRelevance.id));

    const ownerToken = await login(app.baseUrl, owner.email);
    const relevanceRes = await fetch(
      `${app.baseUrl}/api/messages/search?q=chronos&limit=2`,
      { headers: authHeaders(ownerToken, server.id) },
    );
    assert.equal(relevanceRes.status, 200);
    const relevanceBody = await relevanceRes.json() as { results: Array<{ id: string }> };
    assert.equal(relevanceBody.results[0]?.id, oldHighRelevance.id, "default relevance sort should still rank the stronger text match first");

    const recentRes = await fetch(
      `${app.baseUrl}/api/messages/search?q=chronos&sort=recent&limit=2`,
      { headers: authHeaders(ownerToken, server.id) },
    );
    assert.equal(recentRes.status, 200);
    const recentBody = await recentRes.json() as { results: Array<{ id: string }> };
    assert.equal(recentBody.results[0]?.id, newLowRelevance.id, "recent sort should order by created_at first");

    const invalidRes = await fetch(
      `${app.baseUrl}/api/messages/search?q=chronos&sort=fancy`,
      { headers: authHeaders(ownerToken, server.id) },
    );
    assert.equal(invalidRes.status, 400);
  } finally {
    await app.close();
  }
});

test("GET /messages/search supports filter-only browse without keyword query", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("search-filter-only-owner@slock.test", "search-filter-only-owner");
    const other = await seedUser("search-filter-only-other@slock.test", "search-filter-only-other");
    const server = await createServer("Search Filter Only Server", "search-filter-only-server", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: owner.id, role: "owner" },
      { serverId: server.id, userId: other.id, role: "member" },
    ]).onConflictDoNothing();
    const channel = await createChannel(server.id, "search-filter-only-channel");
    const otherChannel = await createChannel(server.id, "search-filter-only-other-channel");

    const oldOwnerMessage = await createMessage(channel.id, "user", owner.id, "old owner filter-only message");
    const newOwnerMessage = await createMessage(channel.id, "user", owner.id, "new owner filter-only message");
    const otherUserMessage = await createMessage(channel.id, "user", other.id, "other user filter-only message");
    const ownerOtherChannelMessage = await createMessage(otherChannel.id, "user", owner.id, "owner in another channel");

    await db.update(messages)
      .set({ createdAt: new Date("2026-05-01T00:00:00.000Z") })
      .where(eq(messages.id, oldOwnerMessage.id));
    await db.update(messages)
      .set({ createdAt: new Date("2026-05-02T00:00:00.000Z") })
      .where(eq(messages.id, newOwnerMessage.id));
    await db.update(messages)
      .set({ createdAt: new Date("2026-05-03T00:00:00.000Z") })
      .where(eq(messages.id, otherUserMessage.id));
    await db.update(messages)
      .set({ createdAt: new Date("2026-05-04T00:00:00.000Z") })
      .where(eq(messages.id, ownerOtherChannelMessage.id));

    const ownerToken = await login(app.baseUrl, owner.email);
    const emptyRes = await fetch(
      `${app.baseUrl}/api/messages/search?limit=2`,
      { headers: authHeaders(ownerToken, server.id) },
    );
    assert.equal(emptyRes.status, 200);
    const emptyBody = await emptyRes.json() as { results: unknown[]; hasMore: boolean };
    assert.deepEqual(emptyBody, { results: [], hasMore: false });

    const filterOnlyUrl = new URL(`${app.baseUrl}/api/messages/search`);
    filterOnlyUrl.searchParams.set("senderId", owner.id);
    filterOnlyUrl.searchParams.set("channelId", channel.id);
    filterOnlyUrl.searchParams.set("limit", "2");
    const filterOnlyRes = await fetch(filterOnlyUrl, {
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(filterOnlyRes.status, 200);
    const filterOnlyBody = await filterOnlyRes.json() as {
      results: Array<{ id: string; senderId: string; channelId: string; content: string; snippet: string }>;
      hasMore: boolean;
    };
    assert.deepEqual(filterOnlyBody.results.map((result) => result.id), [
      newOwnerMessage.id,
      oldOwnerMessage.id,
    ]);
    assert.equal(filterOnlyBody.hasMore, false);
    assert.ok(filterOnlyBody.results.every((result) => result.senderId === owner.id));
    assert.ok(filterOnlyBody.results.every((result) => result.channelId === channel.id));
    assert.equal(filterOnlyBody.results[0]?.snippet, "new owner filter-only message");
  } finally {
    await app.close();
  }
});
