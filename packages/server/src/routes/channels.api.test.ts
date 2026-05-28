import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import argon2 from "argon2";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import {
  users,
  servers as serversTable,
  serverMembers,
  channels,
  channelHumans,
  channelAgents,
  messages,
  messageMentions,
  threadFollows,
  userChannelReadCursors,
  tasks,
  jointChannels,
  jointChannelServers,
  jointChannelInvites,
} from "../db/schema.js";
import { addMember, createServer, removeMember } from "../services/serverService.js";
import { createAgent } from "../services/agentService.js";
import { createChannel, getOrCreateThread, addHuman, addAgent, removeHuman, removeAgent, findOrCreateDM, findOrCreateUserDM, canAgentAccessChannel, resolveChannelByName, archiveChannel, resolveChannelAccess, getChannel, createJointChannelInvite } from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import * as taskService from "../services/taskService.js";
import { registerMachine } from "../services/machineService.js";
import { assignMachine } from "../services/agentService.js";

type Fixtures = {
  serverId: string;
  parentChannelId: string;
  threadId: string;
  parentMessageId: string;
  ownerToken: string;
  followerToken: string;
  memberBToken: string;
  outsiderToken: string;
  ownerId: string;
  memberBId: string;
  followerId: string;
  outsiderId: string;
  agentAId: string;
  agentBId: string;
};

interface EmittedEvent {
  room: string;
  event: string;
  payload: unknown;
}

function installFakeIo(app: { set: (key: string, value: unknown) => void }): EmittedEvent[] {
  const events: EmittedEvent[] = [];
  const makeRoomChain = (rooms: string[]) => ({
    in(room: string) {
      return makeRoomChain([...rooms, room]);
    },
    socketsJoin(room: string) {
      events.push({ room: rooms.join(" "), event: "socketsJoin", payload: { room } });
    },
  });
  app.set("io", {
    to(room: string) {
      return {
        emit(event: string, payload: unknown) {
          events.push({ room, event, payload });
        },
      };
    },
    in(room: string) {
      return makeRoomChain([room]);
    },
  });
  return events;
}

/**
 * Seed a minimal fixture that separates "parent channel membership" from
 * "thread_follows". Parent members ≠ followers so we can prove the two
 * lists are distinct.
 *
 *   parent channel members: owner + memberB + agentA
 *   thread_follows:         owner + follower (user) + agentB (agent)
 */
async function seedThreadFixture(baseUrl: string): Promise<Fixtures> {
  const db = getDb();

  const [owner] = await db.insert(users).values({
    email: "owner@slock.test",
    name: "owner",
    displayName: "Owner",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  const [memberB] = await db.insert(users).values({
    email: "member-b@slock.test",
    name: "member-b",
    displayName: "Member B",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  const [follower] = await db.insert(users).values({
    email: "follower@slock.test",
    name: "follower",
    displayName: "Follower",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  const [outsider] = await db.insert(users).values({
    email: "outsider@slock.test",
    name: "outsider",
    displayName: "Outsider",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();

  const server = await createServer("Contract Test Server", "contract-test", owner.id);
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: memberB.id, role: "member" },
    { serverId: server.id, userId: follower.id, role: "member" },
    { serverId: server.id, userId: outsider.id, role: "member" },
  ]);

  const agentA = await createAgent(server.id, "agent-a", { runtime: "codex" });
  const agentB = await createAgent(server.id, "agent-b", { runtime: "codex" });

  const parentChannel = await createChannel(server.id, "parent-room");
  await addHuman(parentChannel.id, owner.id);
  await addHuman(parentChannel.id, memberB.id);
  await addAgent(parentChannel.id, agentA.id);

  const parentMessage = await createMessage(parentChannel.id, "user", owner.id, "parent message");

  // getOrCreateThread does NOT write any thread_follows row — opening a thread
  // must never auto-follow (that is the bug this contract fixes). The fixture
  // simulates the post-first-reply state by manually inserting follow rows for:
  //   owner     → 'authored' (parent-message author, written by the reply path)
  //   follower  → 'manual'   (a user NOT in the parent channel, to prove that
  //                           follow lists are distinct from parent membership)
  //   agentB    → 'manual'   (an agent NOT in the parent channel, same reason)
  const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");

  await db.insert(threadFollows).values({
    threadChannelId: thread.id,
    followerType: "user",
    followerId: owner.id,
    parentMessageId: parentMessage.id,
    reason: "authored",
  }).onConflictDoNothing();
  await db.insert(threadFollows).values({
    threadChannelId: thread.id,
    followerType: "user",
    followerId: follower.id,
    parentMessageId: parentMessage.id,
    reason: "manual",
  }).onConflictDoNothing();
  await db.insert(threadFollows).values({
    threadChannelId: thread.id,
    followerType: "agent",
    followerId: agentB.id,
    parentMessageId: parentMessage.id,
    reason: "manual",
  }).onConflictDoNothing();

  async function login(email: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "password123" }),
    });
    assert.equal(res.status, 200, `login failed for ${email}`);
    const data = await res.json() as { accessToken: string };
    return data.accessToken;
  }

  return {
    serverId: server.id,
    parentChannelId: parentChannel.id,
    threadId: thread.id,
    parentMessageId: parentMessage.id,
    ownerToken: await login("owner@slock.test"),
    followerToken: await login("follower@slock.test"),
    memberBToken: await login("member-b@slock.test"),
    outsiderToken: await login("outsider@slock.test"),
    ownerId: owner.id,
    memberBId: memberB.id,
    followerId: follower.id,
    outsiderId: outsider.id,
    agentAId: agentA.id,
    agentBId: agentB.id,
  };
}

function headers(token: string, serverId: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Server-Id": serverId,
  };
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

test("GET /api/channels records restore-list phases and constant query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "4".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const db = getDb();
    const owner = await seedUser("channels-trace-owner@slock.test", "channels-trace-owner");
    const member = await seedUser("channels-trace-member@slock.test", "channels-trace-member");
    const server = await createServer("Channels Trace Server", "channels-trace-server", owner.id);
    await addMember(server.id, member.id);
    const joinedChannel = await createChannel(server.id, "joined-channel");
    await addHuman(joinedChannel.id, owner.id);
    const joinedMessage = await createMessage(joinedChannel.id, "user", owner.id, "joined latest message");
    const notJoinedChannel = await createChannel(server.id, "not-joined-channel");
    const notJoinedMessage = await createMessage(notJoinedChannel.id, "user", owner.id, "not joined latest message");

    const ownerToken = await login(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as Array<{ id: string; name: string; joined: boolean; lastMessageAt: string | null }>;
    assert.equal(body.length, 3);
    assert.equal(body.find((channel) => channel.name === "all")?.joined, true);
    assert.equal(body.find((channel) => channel.name === "joined-channel")?.joined, true);
    assert.equal(body.find((channel) => channel.name === "not-joined-channel")?.joined, false);
    assert.equal(body.find((channel) => channel.id === joinedChannel.id)?.lastMessageAt, joinedMessage.createdAt.toISOString());
    assert.equal(body.find((channel) => channel.id === notJoinedChannel.id)?.lastMessageAt, notJoinedMessage.createdAt.toISOString());

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/channels/",
    );
    assert.ok(span, "expected GET /api/channels root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "channels.list.started",
      "channels.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "channels.all_membership.humans_count",
        "channels.all_membership.server_members_count",
        "channels.last_messages_by_channels",
        "channels.list_by_server",
        "channels.memberships_by_user",
      ],
    );
    assert.equal(dbEvents.length, 5);
    assert.ok(dbEvents.length <= 5, "channel list query count should stay constant for common restore path");

    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("channels.list_by_server")?.attrs?.phase, "channels.loaded");
    assert.equal(dbEventByQuery.get("channels.list_by_server")?.attrs?.archived_filter, "exclude");
    assert.equal(dbEventByQuery.get("channels.list_by_server")?.attrs?.row_count, 3);
    assert.equal(dbEventByQuery.get("channels.memberships_by_user")?.attrs?.phase, "channels.loaded");
    assert.equal(dbEventByQuery.get("channels.memberships_by_user")?.attrs?.memberships_count, 2);
    assert.equal(dbEventByQuery.get("channels.last_messages_by_channels")?.attrs?.phase, "channels.loaded");
    assert.equal(dbEventByQuery.get("channels.last_messages_by_channels")?.attrs?.channels_count, 3);
    assert.equal(dbEventByQuery.get("channels.last_messages_by_channels")?.attrs?.channels_with_messages_count, 2);
    assert.equal(dbEventByQuery.get("channels.all_membership.humans_count")?.attrs?.count, 2);
    assert.equal(dbEventByQuery.get("channels.all_membership.server_members_count")?.attrs?.count, 2);

    const loadedEvent = span.events.find((event) => event.name === "channels.loaded");
    assert.ok(loadedEvent);
    assert.equal(loadedEvent.attrs?.archived_filter, "exclude");
    assert.equal(loadedEvent.attrs?.channels_count, 3);
    assert.equal(loadedEvent.attrs?.joined_channels_count, 2);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.channels_count, 3);
    assert.equal(readyEvent.attrs?.joined_channels_count, 2);
    assert.equal(Object.values(span.attrs ?? {}).includes(owner.id), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(joinedChannel.id), false);
  } finally {
    await app.close();
  }
});

test("GET /api/channels default restore list excludes archived channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("channels-archived-owner@slock.test", "channels-archived-owner");
    const server = await createServer("Archived List Server", "archived-list-server", owner.id);
    const activeChannel = await createChannel(server.id, "active-list-channel");
    const archivedChannel = await createChannel(server.id, "archived-list-channel");
    await addHuman(activeChannel.id, owner.id);
    await addHuman(archivedChannel.id, owner.id);
    await archiveChannel(archivedChannel.id, owner.id);

    const ownerToken = await login(app.baseUrl, owner.email);

    const defaultRes = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(defaultRes.status, 200);
    const defaultBody = await defaultRes.json() as Array<{ id: string; name: string; archivedAt: string | null }>;
    assert.ok(defaultBody.some((channel) => channel.id === activeChannel.id));
    assert.ok(!defaultBody.some((channel) => channel.id === archivedChannel.id), "normal channel list must not expose archived channels");

    const includeRes = await fetch(`${app.baseUrl}/api/channels?archived=include`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(includeRes.status, 200);
    const includeBody = await includeRes.json() as Array<{ id: string; name: string; archivedAt: string | null }>;
    assert.ok(includeBody.some((channel) => channel.id === archivedChannel.id && channel.archivedAt), "explicit archived include remains available for dedicated archived-channel surfaces");
  } finally {
    await app.close();
  }
});

test("GET /api/channels/dm records DM list phases and constant query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "5".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const owner = await seedUser("dm-trace-owner@slock.test", "dm-trace-owner");
    const peer = await seedUser("dm-trace-peer@slock.test", "dm-trace-peer");
    const server = await createServer("DM Trace Server", "dm-trace-server", owner.id);
    await addMember(server.id, peer.id);
    const agent = await createAgent(server.id, "dm-trace-agent", { runtime: "codex" });
    const agentDm = await findOrCreateDM(server.id, owner.id, agent.id);
    const userDm = await findOrCreateUserDM(server.id, owner.id, peer.id);
    const selfDm = await findOrCreateUserDM(server.id, owner.id, owner.id);
    assert.ok(agentDm);
    assert.ok(userDm);
    assert.ok(selfDm);
    const agentDmMessage = await createMessage(agentDm.id, "user", owner.id, "agent dm message");
    const userDmMessage = await createMessage(userDm.id, "user", peer.id, "user dm message");

    const ownerToken = await login(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/channels/dm`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as Array<{ id: string; peerType: "agent" | "user"; lastMessageAt: string | null }>;
    assert.equal(body.length, 3);
    assert.equal(body.filter((channel) => channel.peerType === "agent").length, 1);
    assert.equal(body.filter((channel) => channel.peerType === "user").length, 2);
    assert.equal(body.find((channel) => channel.id === agentDm.id)?.lastMessageAt, agentDmMessage.createdAt.toISOString());
    assert.equal(body.find((channel) => channel.id === userDm.id)?.lastMessageAt, userDmMessage.createdAt.toISOString());
    assert.equal(body.find((channel) => channel.id === selfDm.id)?.lastMessageAt, null);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/channels/dm",
    );
    assert.ok(span, "expected GET /api/channels/dm root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "dm_channels.list.started",
      "dm_channels.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "dm_channels.agent_dms_by_user",
        "dm_channels.last_messages_by_channels",
        "dm_channels.self_dms_by_user",
        "dm_channels.user_dms_by_user",
      ],
    );
    assert.equal(dbEvents.length, 4);
    assert.ok(dbEvents.length <= 4, "DM list query count should stay constant for mixed peer types");

    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("dm_channels.agent_dms_by_user")?.attrs?.phase, "dm_channels.loaded");
    assert.equal(dbEventByQuery.get("dm_channels.agent_dms_by_user")?.attrs?.row_count, 1);
    assert.equal(dbEventByQuery.get("dm_channels.user_dms_by_user")?.attrs?.row_count, 3);
    assert.equal(dbEventByQuery.get("dm_channels.self_dms_by_user")?.attrs?.row_count, 1);
    assert.equal(dbEventByQuery.get("dm_channels.last_messages_by_channels")?.attrs?.dm_channels_count, 3);
    assert.equal(dbEventByQuery.get("dm_channels.last_messages_by_channels")?.attrs?.channels_with_messages_count, 2);

    const loadedEvent = span.events.find((event) => event.name === "dm_channels.loaded");
    assert.ok(loadedEvent);
    assert.equal(loadedEvent.attrs?.dm_channels_count, 3);
    assert.equal(loadedEvent.attrs?.agent_dm_channels_count, 1);
    assert.equal(loadedEvent.attrs?.user_dm_channels_count, 2);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.dm_channels_count, 3);
    assert.equal(Object.values(span.attrs ?? {}).includes(owner.id), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(agentDm.id), false);
  } finally {
    await app.close();
  }
});

test("GET /api/channels/unread records unread-count phases and query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "6".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const db = getDb();
    const owner = await seedUser("unread-trace-owner@slock.test", "unread-trace-owner");
    const peer = await seedUser("unread-trace-peer@slock.test", "unread-trace-peer");
    const server = await createServer("Unread Trace Server", "unread-trace-server", owner.id);
    await addMember(server.id, peer.id);
    const channel = await createChannel(server.id, "unread-channel");
    await addHuman(channel.id, owner.id);
    const dm = await findOrCreateUserDM(server.id, owner.id, peer.id);
    assert.ok(dm);
    const channelReadMessage = await createMessage(channel.id, "user", owner.id, "already read");
    await createMessage(channel.id, "user", owner.id, "unread channel message");
    await createMessage(dm.id, "user", peer.id, "unread dm message");
    await db.insert(userChannelReadCursors).values({
      userId: owner.id,
      channelId: channel.id,
      lastReadSeq: channelReadMessage.seq,
      updatedAt: new Date(),
    });

    const ownerToken = await login(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/channels/unread`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as Record<string, number>;
    assert.equal(body[channel.id], 1);
    assert.equal(body[dm.id], 1);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/channels/unread",
    );
    assert.ok(span, "expected GET /api/channels/unread root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "unread_counts.load.started",
      "history.policy.checked",
      "inbox.backend.selected",
      "unread_counts.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(dbEvents.map((event) => event.attrs?.query_name), ["channels.unread_counts_by_user"]);
    assert.equal(dbEvents.length, 1);
    assert.equal(dbEvents[0]?.attrs?.phase, "unread_counts.loaded");
    assert.equal(dbEvents[0]?.attrs?.unread_channels_count, 2);
    assert.equal(dbEvents[0]?.attrs?.history_cutoff_present, false);
    assert.equal(dbEvents[0]?.attrs?.["inbox.backend"], "pg_legacy");
    assert.equal(dbEvents[0]?.attrs?.["inbox.route"], "channel_unread");
    assert.equal(dbEvents[0]?.attrs?.["inbox.fallback_reason"], "pglite_dev");
    assert.equal(dbEvents[0]?.attrs?.["inbox.contract_version"], 1);

    const backendEvent = span.events.find((event) => event.name === "inbox.backend.selected");
    assert.ok(backendEvent);
    assert.equal(backendEvent.attrs?.["inbox.backend"], "pg_legacy");
    assert.equal(backendEvent.attrs?.["inbox.route"], "channel_unread");
    assert.equal(backendEvent.attrs?.["inbox.fallback_reason"], "pglite_dev");
    assert.equal(backendEvent.attrs?.["inbox.contract_version"], 1);

    const loadedEvent = span.events.find((event) => event.name === "unread_counts.loaded");
    assert.ok(loadedEvent);
    assert.equal(loadedEvent.attrs?.unread_channels_count, 2);
    assert.equal(loadedEvent.attrs?.history_cutoff_present, false);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.unread_channels_count, 2);
    assert.equal(Object.values(span.attrs ?? {}).includes(owner.id), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(channel.id), false);
  } finally {
    await app.close();
  }
});

test("GET /api/channels/threads/followed records followed-thread phases and query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "7".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const db = getDb();
    const owner = await seedUser("followed-trace-owner@slock.test", "followed-trace-owner");
    const claimant = await seedUser("followed-trace-claimant@slock.test", "followed-trace-claimant");
    const server = await createServer("Followed Trace Server", "followed-trace-server", owner.id);
    await addMember(server.id, claimant.id);
    const channel = await createChannel(server.id, "followed-trace-channel");
    await addHuman(channel.id, owner.id);
    const parentMessage = await createMessage(channel.id, "user", owner.id, "parent task");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    const readReply = await createMessage(thread.id, "user", owner.id, "already read reply");
    await createMessage(thread.id, "user", claimant.id, "unread reply");
    await db.insert(threadFollows).values({
      threadChannelId: thread.id,
      followerType: "user",
      followerId: owner.id,
      parentMessageId: parentMessage.id,
      reason: "manual",
    });
    await db.insert(userChannelReadCursors).values({
      userId: owner.id,
      channelId: thread.id,
      lastReadSeq: readReply.seq,
      updatedAt: new Date(),
    });
    await db.insert(tasks).values({
      channelId: channel.id,
      taskNumber: 1,
      title: "parent task",
      status: "in_progress",
      createdByType: "user",
      createdById: owner.id,
      claimedByType: "user",
      claimedById: claimant.id,
      messageId: parentMessage.id,
    });

    const ownerToken = await login(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { threads: Array<{ threadChannelId: string; unreadCount: number; taskClaimedByName: string | null }> };
    assert.equal(body.threads.length, 1);
    assert.equal(body.threads[0]?.threadChannelId, thread.id);
    assert.equal(body.threads[0]?.unreadCount, 1);
    assert.equal(body.threads[0]?.taskClaimedByName, "followed-trace-claimant");

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/channels/threads/followed",
    );
    assert.ok(span, "expected GET /api/channels/threads/followed root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "followed_threads.load.started",
      "history.policy.checked",
      "followed_threads.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "channels.followed_joint_threads_by_user",
        "channels.followed_threads.user_claimants",
        "channels.followed_threads_by_user",
        "channels.followed_threads_stats_by_threads",
      ],
    );
    assert.equal(dbEvents.length, 4);
    assert.ok(dbEvents.length <= 4, "followed threads query count should stay constant for task-claimant enrichment");

    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("channels.followed_threads_by_user")?.attrs?.phase, "followed_threads.loaded");
    assert.equal(dbEventByQuery.get("channels.followed_threads_by_user")?.attrs?.row_count, 1);
    assert.equal(dbEventByQuery.get("channels.followed_threads_stats_by_threads")?.attrs?.followed_threads_count, 1);
    assert.equal(dbEventByQuery.get("channels.followed_threads_stats_by_threads")?.attrs?.stats_rows_count, 1);
    assert.equal(dbEventByQuery.get("channels.followed_threads.user_claimants")?.attrs?.input_count, 1);
    assert.equal(dbEventByQuery.get("channels.followed_threads.user_claimants")?.attrs?.claimants_count, 1);

    const loadedEvent = span.events.find((event) => event.name === "followed_threads.loaded");
    assert.ok(loadedEvent);
    assert.equal(loadedEvent.attrs?.followed_threads_count, 1);
    assert.equal(loadedEvent.attrs?.unread_threads_count, 1);
    assert.equal(loadedEvent.attrs?.history_cutoff_present, false);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.followed_threads_count, 1);
    assert.equal(readyEvent.attrs?.unread_threads_count, 1);
    assert.equal(Object.values(span.attrs ?? {}).includes(owner.id), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(thread.id), false);
  } finally {
    await app.close();
  }
});

test("GET /api/channels/:id/threads records thread-summary phases and constant query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "9".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const owner = await seedUser("thread-summary-trace-owner@slock.test", "thread-summary-trace-owner");
    const replier = await seedUser("thread-summary-trace-replier@slock.test", "thread-summary-trace-replier");
    const server = await createServer("Thread Summary Trace Server", "thread-summary-trace-server", owner.id);
    await addMember(server.id, replier.id);
    const channel = await createChannel(server.id, "thread-summary-trace-channel");
    await addHuman(channel.id, owner.id);

    const parentOne = await createMessage(channel.id, "user", owner.id, "parent one");
    const threadOne = await getOrCreateThread(parentOne.id, owner.id, "user");
    await createMessage(threadOne.id, "user", owner.id, "reply one");
    await createMessage(threadOne.id, "user", replier.id, "reply two");

    const parentTwo = await createMessage(channel.id, "user", replier.id, "parent two");
    const threadTwo = await getOrCreateThread(parentTwo.id, replier.id, "user");
    await createMessage(threadTwo.id, "user", replier.id, "reply three");

    const ownerToken = await login(app.baseUrl, owner.email);
    sink.clear();

    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}/threads`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as Record<string, { threadChannelId: string; replyCount: number; participantIds: string[] }>;
    assert.equal(Object.keys(body).length, 2);
    assert.equal(body[parentOne.id]?.threadChannelId, threadOne.id);
    assert.equal(body[parentOne.id]?.replyCount, 2);
    assert.equal(body[parentOne.id]?.participantIds.length, 2);
    assert.equal(body[parentTwo.id]?.threadChannelId, threadTwo.id);
    assert.equal(body[parentTwo.id]?.replyCount, 1);
    assert.equal(body[parentTwo.id]?.participantIds.length, 1);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/channels/:id/threads",
    );
    assert.ok(span, "expected GET /api/channels/:id/threads root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "channel_threads.load.started",
      "channel.loaded",
      "channel.access.checked",
      "channel_threads.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(
      dbEvents.map((event) => event.attrs?.query_name).sort(),
      [
        "channel_threads.list_by_channel",
        "channel_threads.participants_by_threads",
        "channel_threads.unread_by_threads",
      ],
    );
    assert.equal(dbEvents.length, 3);

    const dbEventByQuery = new Map(dbEvents.map((event) => [event.attrs?.query_name, event]));
    assert.equal(dbEventByQuery.get("channel_threads.list_by_channel")?.attrs?.phase, "channel_threads.loaded");
    assert.equal(dbEventByQuery.get("channel_threads.list_by_channel")?.attrs?.row_count, 2);
    assert.equal(dbEventByQuery.get("channel_threads.participants_by_threads")?.attrs?.input_count, 2);
    assert.equal(dbEventByQuery.get("channel_threads.participants_by_threads")?.attrs?.participant_rows_count, 3);
    assert.equal(dbEventByQuery.get("channel_threads.unread_by_threads")?.attrs?.input_count, 2);
    assert.equal(dbEventByQuery.get("channel_threads.unread_by_threads")?.attrs?.unread_threads_count, 0);

    const loadedEvent = span.events.find((event) => event.name === "channel_threads.loaded");
    assert.ok(loadedEvent);
    assert.equal(loadedEvent.attrs?.thread_summaries_count, 2);
    assert.equal(loadedEvent.attrs?.total_replies_count, 3);
    assert.equal(loadedEvent.attrs?.total_unread_replies_count, 0);
    assert.equal(loadedEvent.attrs?.participant_links_count, 3);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.thread_summaries_count, 2);
    assert.equal(Object.values(span.attrs ?? {}).includes(owner.id), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(threadOne.id), false);
    assert.equal(
      dbEvents.some((event) => Object.values(event.attrs ?? {}).includes(parentOne.id)),
      false,
    );
  } finally {
    await app.close();
  }
});

test("GET /api/channels/:id/threads includes viewer-specific unread reply counts for followed threads", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("summary-unread-owner@slock.test", "summary-unread-owner");
    const replier = await seedUser("summary-unread-replier@slock.test", "summary-unread-replier");
    const server = await createServer("Summary Unread Server", "summary-unread-server", owner.id);
    await addMember(server.id, replier.id);
    const channel = await createChannel(server.id, "summary-unread-channel");
    await addHuman(channel.id, owner.id);

    const followedParent = await createMessage(channel.id, "user", owner.id, "followed parent");
    const followedThread = await getOrCreateThread(followedParent.id, owner.id, "user");
    const readReply = await createMessage(followedThread.id, "user", replier.id, "already read reply");
    const unreadReply = await createMessage(followedThread.id, "user", replier.id, "unread reply");
    await db.insert(threadFollows).values({
      threadChannelId: followedThread.id,
      followerType: "user",
      followerId: owner.id,
      parentMessageId: followedParent.id,
      reason: "manual",
    });
    await db.insert(userChannelReadCursors).values({
      userId: owner.id,
      channelId: followedThread.id,
      lastReadSeq: readReply.seq,
      updatedAt: new Date(),
    });

    const unfollowedParent = await createMessage(channel.id, "user", owner.id, "unfollowed parent");
    const unfollowedThread = await getOrCreateThread(unfollowedParent.id, owner.id, "user");
    await createMessage(unfollowedThread.id, "user", replier.id, "not a followed-thread unread");

    const ownerToken = await login(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}/threads`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as Record<string, { threadChannelId: string; replyCount: number; unreadCount: number; firstUnreadMessageId: string | null }>;

    assert.equal(body[followedParent.id]?.threadChannelId, followedThread.id);
    assert.equal(body[followedParent.id]?.replyCount, 2);
    assert.equal(body[followedParent.id]?.unreadCount, 1);
    assert.equal(body[followedParent.id]?.firstUnreadMessageId, unreadReply.id);
    assert.equal(body[unfollowedParent.id]?.threadChannelId, unfollowedThread.id);
    assert.equal(body[unfollowedParent.id]?.replyCount, 1);
    assert.equal(body[unfollowedParent.id]?.unreadCount, 0);
    assert.equal(body[unfollowedParent.id]?.firstUnreadMessageId, null);
  } finally {
    await app.close();
  }
});

test("getOrCreateThread creates a single active thread channel under concurrent opens", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("thread-race-owner@slock.test", "thread-race-owner");
    const server = await createServer("Thread Race Server", "thread-race-server", owner.id);
    const channel = await createChannel(server.id, "thread-race-parent");
    await addHuman(channel.id, owner.id);

    const parent = await createMessage(channel.id, "user", owner.id, "race parent");
    const results = await Promise.all(
      Array.from({ length: 8 }, () => getOrCreateThread(parent.id, owner.id, "user")),
    );

    const uniqueThreadIds = new Set(results.map((result) => result.id));
    assert.equal(uniqueThreadIds.size, 1, "all concurrent callers should converge on one thread id");

    const activeThreads = await getDb()
      .select({ id: channels.id })
      .from(channels)
      .where(and(
        eq(channels.parentMessageId, parent.id),
        eq(channels.type, "thread"),
        isNull(channels.deletedAt),
      ));
    assert.equal(activeThreads.length, 1, "only one active thread channel should exist for the parent");

    const [parentRow] = await getDb()
      .select({ threadId: messages.threadId })
      .from(messages)
      .where(eq(messages.id, parent.id))
      .limit(1);
    assert.equal(parentRow?.threadId, activeThreads[0]?.id, "parent message should point at the canonical thread");
  } finally {
    await app.close();
  }
});

test("thread read paths prefer the canonical thread when historical duplicates exist", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("thread-dedup-owner@slock.test", "thread-dedup-owner");
    const replier = await seedUser("thread-dedup-replier@slock.test", "thread-dedup-replier");
    const server = await createServer("Thread Dedup Server", "thread-dedup-server", owner.id);
    await addMember(server.id, replier.id);
    const channel = await createChannel(server.id, "thread-dedup-parent");
    await addHuman(channel.id, owner.id);
    await addHuman(channel.id, replier.id);

    const parent = await createMessage(channel.id, "user", owner.id, "dedup parent");
    await db.execute(sql`DROP INDEX IF EXISTS "idx_channels_active_thread_parent"`);

    const [staleThread] = await db.insert(channels).values({
      serverId: server.id,
      name: "thread-stale-parent",
      type: "thread",
      parentMessageId: parent.id,
    }).returning();
    await createMessage(staleThread.id, "user", owner.id, "stale reply");

    const [activeThread] = await db.insert(channels).values({
      serverId: server.id,
      name: "thread-active-parent",
      type: "thread",
      parentMessageId: parent.id,
    }).returning();
    await createMessage(activeThread.id, "user", owner.id, "active reply one");
    await createMessage(activeThread.id, "user", replier.id, "active reply two");

    await db.update(messages)
      .set({ threadId: staleThread.id })
      .where(eq(messages.id, parent.id));

    const ownerToken = await login(app.baseUrl, owner.email);

    const summariesRes = await fetch(`${app.baseUrl}/api/channels/${channel.id}/threads`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(summariesRes.status, 200);
    const summaries = await summariesRes.json() as Record<string, {
      threadChannelId: string;
      replyCount: number;
      participantIds: string[];
    }>;
    assert.equal(summaries[parent.id]?.threadChannelId, activeThread.id, "summary route should prefer the canonical thread");
    assert.equal(summaries[parent.id]?.replyCount, 2);
    assert.deepEqual(summaries[parent.id]?.participantIds.sort(), [owner.id, replier.id].sort());

    const infoRes = await fetch(`${app.baseUrl}/api/channels/${channel.id}/threads/${parent.id}`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(infoRes.status, 200);
    const info = await infoRes.json() as {
      threadChannelId: string;
      replyCount: number;
      participantIds: string[];
    };
    assert.equal(info.threadChannelId, activeThread.id, "single-thread lookup should also prefer the canonical thread");
    assert.equal(info.replyCount, 2);
    assert.deepEqual(info.participantIds.sort(), [owner.id, replier.id].sort());
  } finally {
    await app.close();
  }
});

test("message payload carries authoritative sender membership status", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const [owner] = await db.insert(users).values({
      email: "membership-owner@slock.test",
      name: "membership-owner",
      displayName: "Membership Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [newcomer] = await db.insert(users).values({
      email: "newcomer@slock.test",
      name: "newcomer",
      displayName: "Newcomer",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Membership Status Server", "membership-status", owner.id);
    await addMember(server.id, newcomer.id);

    const [allChannel] = await db
      .select({ id: channels.id })
      .from(channels)
      .where(and(eq(channels.serverId, server.id), eq(channels.name, "all")));
    assert.ok(allChannel, "expected #all channel");

    const message = await createMessage(allChannel.id, "user", newcomer.id, "hello right after joining");

    const login = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "membership-owner@slock.test", password: "password123" }),
    });
    assert.equal(login.status, 200);
    const { accessToken } = await login.json() as { accessToken: string };

    async function list() {
      const res = await fetch(`${app.baseUrl}/api/messages/channel/${allChannel.id}`, {
        headers: headers(accessToken, server.id),
      });
      assert.equal(res.status, 200);
      const body = await res.json() as { messages: Array<{ id: string; senderMembershipStatus?: string | null }> };
      return body.messages.find((m) => m.id === message.id);
    }

    assert.equal((await list())?.senderMembershipStatus, "active");

    await removeMember(server.id, newcomer.id);

    assert.equal((await list())?.senderMembershipStatus, "removed");
  } finally {
    await app.close();
  }
});

test("POST /api/channels broadcasts channel:updated for newly created channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const [owner] = await db.insert(users).values({
      email: "channel-create-owner@slock.test",
      name: "channel-create-owner",
      displayName: "Channel Create Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const server = await createServer("Channel Create Socket", "channel-create-socket", owner.id);
    const events = installFakeIo(app.app);

    const login = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: owner.email, password: "password123" }),
    });
    assert.equal(login.status, 200);
    const { accessToken } = await login.json() as { accessToken: string };

    const res = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(accessToken, server.id),
      body: JSON.stringify({ name: "new-live-channel", description: "created during realtime test" }),
    });
    assert.equal(res.status, 200);
    const channel = await res.json() as { id: string; name: string; description: string | null; joined: boolean };
    assert.equal(channel.name, "new-live-channel");
    assert.equal(channel.joined, true);

    assert.equal(events.length, 1);
    assert.equal(events[0].room, `server:${server.id}`);
    assert.equal(events[0].event, "channel:updated");
    const payload = events[0].payload as { channel: { id: string; name: string; description: string | null; joined: boolean } };
    assert.equal(payload.channel.id, channel.id);
    assert.equal(payload.channel.name, "new-live-channel");
    assert.equal(payload.channel.description, "created during realtime test");
    assert.equal(payload.channel.joined, true);
  } finally {
    await app.close();
  }
});

test("renaming a channel writes a persistent system message and delivers old/new names to agents", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("rename-notice-owner@slock.test", "rename-notice-owner");
    const server = await createServer("Rename Notice Server", "rename-notice-server", owner.id);
    const channel = await createChannel(server.id, "rename-before");
    await addHuman(channel.id, owner.id);
    const agent = await createAgent(server.id, "rename-notice-bot", { runtime: "codex" });
    await addAgent(channel.id, agent.id);
    const ownerToken = await login(app.baseUrl, owner.email);
    const deliveries: Array<{ agentId: string; message: { channel_name: string; content: string; sender_type: string; seq?: number } }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (agentId: string, message: { channel_name: string; content: string; sender_type: string; seq?: number }) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message) => {
      deliveries.push({ agentId, message });
    };

    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ name: "rename-after" }),
    });
    assert.equal(res.status, 200);

    const [systemMessage] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.channelId, channel.id), eq(messages.messageType, "system")))
      .orderBy(desc(messages.createdAt));
    assert.ok(systemMessage, "expected a persistent rename system message");
    assert.equal(systemMessage.content, "@rename-notice-owner renamed this channel from #rename-before to #rename-after.");
    assert.equal(systemMessage.senderId, "system");

    const delivery = deliveries.find((item) => item.agentId === agent.id);
    assert.ok(delivery, "agent in the channel should receive the rename system message");
    assert.equal(delivery.message.sender_type, "system");
    assert.equal(delivery.message.content, "@rename-notice-owner renamed this channel from #rename-before to #rename-after.");
    assert.equal(delivery.message.channel_name, "rename-after");
    assert.ok(delivery.message.seq, "delivery should carry the persisted message seq");
  } finally {
    await app.close();
  }
});

test("updating channel description does not write a rename system message", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("description-update-owner@slock.test", "description-update-owner");
    const server = await createServer("Description Update Server", "description-update-server", owner.id);
    const channel = await createChannel(server.id, "description-only");
    await addHuman(channel.id, owner.id);
    const agent = await createAgent(server.id, "description-update-bot", { runtime: "codex" });
    await addAgent(channel.id, agent.id);
    const ownerToken = await login(app.baseUrl, owner.email);
    const deliveries: Array<{ agentId: string; message: { content: string } }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (agentId: string, message: { content: string }) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message) => {
      deliveries.push({ agentId, message });
    };

    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ description: "updated description" }),
    });
    assert.equal(res.status, 200);

    const systemMessages = await db
      .select()
      .from(messages)
      .where(and(eq(messages.channelId, channel.id), eq(messages.messageType, "system")));
    assert.equal(systemMessages.length, 0, "description-only update should not write a system message");
    assert.equal(deliveries.length, 0, "description-only update should not deliver an agent system notice");
  } finally {
    await app.close();
  }
});

test("private channels are visible/readable only to invited members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("private-owner@slock.test", "private-owner");
    const invited = await seedUser("private-invited@slock.test", "private-invited");
    const outsider = await seedUser("private-outsider@slock.test", "private-outsider");
    const adminOutsider = await seedUser("private-admin-outsider@slock.test", "private-admin-outsider");
    const server = await createServer("Private Channel Server", "private-channel-server", owner.id);
    await addMember(server.id, invited.id);
    await addMember(server.id, outsider.id);
    await addMember(server.id, adminOutsider.id, "admin");
    const invitedAgent = await createAgent(server.id, "private-agent", { runtime: "codex" });
    const outsiderAgent = await createAgent(server.id, "private-outsider-agent", { runtime: "codex" });
    const events = installFakeIo(app.app);

    const ownerToken = await login(app.baseUrl, owner.email);
    const invitedToken = await login(app.baseUrl, invited.email);
    const outsiderToken = await login(app.baseUrl, outsider.email);
    const adminOutsiderToken = await login(app.baseUrl, adminOutsider.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({
        name: "secret-room",
        description: "invite only",
        visibility: "private",
        userIds: [invited.id],
        agentIds: [invitedAgent.id],
      }),
    });
    assert.equal(createRes.status, 200);
    const privateChannel = await createRes.json() as { id: string; name: string; type: string; joined: boolean };
    assert.equal(privateChannel.name, "secret-room");
    assert.equal(privateChannel.type, "private");
    assert.equal(privateChannel.joined, true);
    assert.ok(!events.some((event) => event.room === `server:${server.id}`), "private create must not broadcast channel details to the whole server");
    assert.ok(events.some((event) => event.room === `user:${invited.id}` && event.event === "channel:updated"), "invited human should receive a targeted channel update");

    async function list(token: string) {
      const res = await fetch(`${app.baseUrl}/api/channels`, {
        headers: headers(token, server.id),
      });
      assert.equal(res.status, 200);
      return await res.json() as Array<{ id: string; name: string; type: string; joined: boolean }>;
    }

    assert.ok((await list(ownerToken)).some((channel) => channel.id === privateChannel.id && channel.type === "private" && channel.joined));
    assert.ok((await list(invitedToken)).some((channel) => channel.id === privateChannel.id && channel.type === "private" && channel.joined));
    assert.ok(!(await list(outsiderToken)).some((channel) => channel.id === privateChannel.id), "non-invited server member must not see private channel in channel list");
    assert.ok(!(await list(adminOutsiderToken)).some((channel) => channel.id === privateChannel.id), "server admin must not see private channel in channel list without channel membership");

    const outsiderDetails = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(outsiderDetails.status, 404);

    const adminDetails = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      headers: headers(adminOutsiderToken, server.id),
    });
    assert.equal(adminDetails.status, 404, "server admin must not inspect private channel details without channel membership");

    const adminMembers = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/members`, {
      headers: headers(adminOutsiderToken, server.id),
    });
    assert.equal(adminMembers.status, 404, "server admin must not inspect private channel members without channel membership");

    const adminAgents = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/agents`, {
      headers: headers(adminOutsiderToken, server.id),
    });
    assert.equal(adminAgents.status, 404, "server admin must not inspect private channel agents without channel membership");

    const adminAddSelf = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/members`, {
      method: "POST",
      headers: headers(adminOutsiderToken, server.id),
      body: JSON.stringify({ userId: adminOutsider.id }),
    });
    assert.equal(adminAddSelf.status, 404, "server admin must not add themselves to a private channel without an invite");

    const adminAddAgent = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/agents`, {
      method: "POST",
      headers: headers(adminOutsiderToken, server.id),
      body: JSON.stringify({ agentId: outsiderAgent.id }),
    });
    assert.equal(adminAddAgent.status, 404, "server admin must not add agents to a private channel without channel membership");

    const adminRemoveHuman = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/members/user/${invited.id}`, {
      method: "DELETE",
      headers: headers(adminOutsiderToken, server.id),
    });
    assert.equal(adminRemoveHuman.status, 404, "server admin must not remove private channel humans without channel membership");

    const adminRemoveAgent = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/agents/${invitedAgent.id}`, {
      method: "DELETE",
      headers: headers(adminOutsiderToken, server.id),
    });
    assert.equal(adminRemoveAgent.status, 404, "server admin must not remove private channel agents without channel membership");

    const adminArchive = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/archive`, {
      method: "POST",
      headers: headers(adminOutsiderToken, server.id),
    });
    assert.equal(adminArchive.status, 404, "server admin must not archive an invisible private channel");

    const adminPatch = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      method: "PATCH",
      headers: headers(adminOutsiderToken, server.id),
      body: JSON.stringify({ description: "should stay hidden" }),
    });
    assert.equal(adminPatch.status, 404, "server admin must not patch an invisible private channel");

    const invitedDelete = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      method: "DELETE",
      headers: headers(invitedToken, server.id),
    });
    assert.equal(invitedDelete.status, 403, "private channel members without manageChannels must not delete the channel");

    const joinRes = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/join`, {
      method: "POST",
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(joinRes.status, 403);

    const invitedMessage = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(invitedToken, server.id),
      body: JSON.stringify({ channelId: privateChannel.id, content: "hello private" }),
    });
    assert.equal(invitedMessage.status, 200);
    const invitedMessageBody = await invitedMessage.json() as { id: string };

    const outsiderMessages = await fetch(`${app.baseUrl}/api/messages/channel/${privateChannel.id}`, {
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(outsiderMessages.status, 403);

    const outsiderPost = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(outsiderToken, server.id),
      body: JSON.stringify({ channelId: privateChannel.id, content: "should not send" }),
    });
    assert.equal(outsiderPost.status, 403);

    const invitedSync = await fetch(`${app.baseUrl}/api/messages/sync?since_seq=0`, {
      headers: headers(invitedToken, server.id),
    });
    assert.equal(invitedSync.status, 200);
    const invitedSyncBody = await invitedSync.json() as Array<{ id: string }>;
    assert.ok(invitedSyncBody.some((message) => message.id === invitedMessageBody.id));

    const outsiderSync = await fetch(`${app.baseUrl}/api/messages/sync?since_seq=0`, {
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(outsiderSync.status, 200);
    const outsiderSyncBody = await outsiderSync.json() as Array<{ id: string }>;
    assert.ok(!outsiderSyncBody.some((message) => message.id === invitedMessageBody.id), "gap sync must not leak private messages to non-members");

    assert.equal(await canAgentAccessChannel(privateChannel.id, invitedAgent.id), true);
    assert.equal(await canAgentAccessChannel(privateChannel.id, outsiderAgent.id), false);
    assert.deepEqual(await resolveChannelByName(server.id, invitedAgent.id, "#secret-room"), {
      channelId: privateChannel.id,
      type: "private",
    });
    assert.equal(await resolveChannelByName(server.id, outsiderAgent.id, "#secret-room"), null);

    const ownerDelete = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      method: "DELETE",
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerDelete.status, 200, "private channel owner/admin can still delete a visible private channel");
  } finally {
    await app.close();
  }
});

test("public/private visibility conversion preserves membership rows and updates visibility surfaces", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("visibility-owner@slock.test", "visibility-owner");
    const member = await seedUser("visibility-member@slock.test", "visibility-member");
    const server = await createServer("Visibility Toggle Server", "visibility-toggle-server", owner.id);
    await addMember(server.id, member.id);
    const agent = await createAgent(server.id, "visibility-agent", { runtime: "codex" });
    const channel = await createChannel(server.id, "toggle-room", "convert me");
    await addHuman(channel.id, owner.id);
    await addAgent(channel.id, agent.id);
    const message = await createMessage(channel.id, "user", owner.id, "toggle room message");
    const events = installFakeIo(app.app);

    const ownerToken = await login(app.baseUrl, owner.email);
    const memberToken = await login(app.baseUrl, member.email);

    async function list(token: string) {
      const res = await fetch(`${app.baseUrl}/api/channels`, {
        headers: headers(token, server.id),
      });
      assert.equal(res.status, 200);
      return await res.json() as Array<{ id: string; name: string; type: string; joined: boolean }>;
    }

    assert.ok((await list(memberToken)).some((item) => item.id === channel.id && item.type === "channel" && item.joined === false), "public channel is visible to non-joined server members");
    const publicMessages = await fetch(`${app.baseUrl}/api/messages/channel/${channel.id}`, {
      headers: headers(memberToken, server.id),
    });
    assert.equal(publicMessages.status, 200, "non-joined server members can read public channel history");

    events.length = 0;
    const toPrivate = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ visibility: "private" }),
    });
    assert.equal(toPrivate.status, 200);
    const privateBody = await toPrivate.json() as { id: string; type: string; name: string };
    assert.equal(privateBody.type, "private");

    assert.ok((await list(ownerToken)).some((item) => item.id === channel.id && item.type === "private" && item.joined === true), "existing joined human stays a private member");
    assert.ok(!(await list(memberToken)).some((item) => item.id === channel.id), "non-joined server member loses channel-list visibility after public -> private");
    const hiddenDetails = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      headers: headers(memberToken, server.id),
    });
    assert.equal(hiddenDetails.status, 404, "non-member permalink/details stop resolving after public -> private");
    const hiddenMessages = await fetch(`${app.baseUrl}/api/messages/channel/${channel.id}`, {
      headers: headers(memberToken, server.id),
    });
    assert.equal(hiddenMessages.status, 403, "non-members cannot read history after public -> private");
    assert.equal(await canAgentAccessChannel(channel.id, agent.id), true, "existing joined agent stays a private member");

    const privateServerEvent = events.find((event) => event.room === `server:${server.id}` && event.event === "channel:updated");
    assert.ok(privateServerEvent, "public -> private must notify the server room so non-members reload and drop the channel");
    assert.deepEqual(privateServerEvent.payload, { channelId: channel.id }, "public -> private must not broadcast private channel details server-wide");

    const membershipRowsAfterPrivate = await getDb()
      .select({ userId: channelHumans.userId })
      .from(channelHumans)
      .where(eq(channelHumans.channelId, channel.id));
    assert.deepEqual(membershipRowsAfterPrivate.map((row) => row.userId), [owner.id], "public -> private snapshots existing joined humans only");
    const agentRowsAfterPrivate = await getDb()
      .select({ agentId: channelAgents.agentId })
      .from(channelAgents)
      .where(eq(channelAgents.channelId, channel.id));
    assert.deepEqual(agentRowsAfterPrivate.map((row) => row.agentId), [agent.id], "public -> private preserves existing joined agents");

    const systemMessagesAfterPrivate = await getDb()
      .select({ id: messages.id })
      .from(messages)
      .where(and(eq(messages.channelId, channel.id), eq(messages.messageType, "system")));
    assert.deepEqual(systemMessagesAfterPrivate, [], "visibility conversion must not broadcast system messages");

    events.length = 0;
    const toPublic = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ visibility: "public" }),
    });
    assert.equal(toPublic.status, 200);
    const publicBody = await toPublic.json() as { id: string; type: string };
    assert.equal(publicBody.type, "channel");

    assert.ok((await list(memberToken)).some((item) => item.id === channel.id && item.type === "channel" && item.joined === false), "private -> public restores visibility without joining non-members");
    const restoredMessages = await fetch(`${app.baseUrl}/api/messages/channel/${channel.id}`, {
      headers: headers(memberToken, server.id),
    });
    assert.equal(restoredMessages.status, 200);
    const restoredBody = await restoredMessages.json() as { messages: Array<{ id: string }> };
    assert.ok(restoredBody.messages.some((item) => item.id === message.id), "private -> public restores read access to existing history");

    const publicServerEvent = events.find((event) => event.room === `server:${server.id}` && event.event === "channel:updated");
    assert.ok(publicServerEvent, "private -> public must notify the server room");
    assert.equal((publicServerEvent.payload as { channel?: { id?: string; type?: string } }).channel?.id, channel.id);
    assert.equal((publicServerEvent.payload as { channel?: { type?: string } }).channel?.type, "channel");

    const membershipRowsAfterPublic = await getDb()
      .select({ userId: channelHumans.userId })
      .from(channelHumans)
      .where(eq(channelHumans.channelId, channel.id));
    assert.deepEqual(membershipRowsAfterPublic.map((row) => row.userId), [owner.id], "private -> public preserves member rows");
  } finally {
    await app.close();
  }
});

test("private -> public restores thread permalink access for non-members (task #417)", async () => {
  // Repro of #engineering task #417: opening a thread permalink in a channel
  // that was converted private -> public left the channel pane on
  // "Select a channel" and the thread pane stuck on "Loading...". The web
  // thread-permalink flow makes exactly three calls for a non-member:
  //   1. GET  /channels/:id                 (ChannelRoute -> ensureChannel)
  //   2. POST /channels/:id/threads         (threadStore.openThread)
  //   3. GET  /messages/channel/:threadId   (ThreadPanel reply load)
  // All three must succeed against the parent channel's *current* (public)
  // visibility, not its historical private state. This pins the backend half
  // of the invariant; the client recovery half is covered by the threadStore
  // unit test (openThreadError / retryOpenThread).
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("perma-owner@slock.test", "perma-owner");
    const outsider = await seedUser("perma-outsider@slock.test", "perma-outsider");
    const server = await createServer("Perma Server", "perma-server", owner.id);
    await addMember(server.id, outsider.id);

    // Channel born private, with a parent message + a thread reply, mirroring
    // a thread that accumulated history while the channel was invite-only.
    const channel = await createChannel(server.id, "mcdonalds-club", "born private", "private");
    await addHuman(channel.id, owner.id);
    const parent = await createMessage(channel.id, "user", owner.id, "parent message");
    const thread = await getOrCreateThread(parent.id, owner.id, "user");
    await createMessage(thread.id, "user", owner.id, "reply while private");

    const ownerToken = await login(app.baseUrl, owner.email);
    const outsiderToken = await login(app.baseUrl, outsider.email);

    // Sanity: while still private, the outsider's permalink resolution fails.
    const preDetails = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(preDetails.status, 404, "non-member cannot resolve channel while private");

    // Owner flips it public.
    const toPublic = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ visibility: "public" }),
    });
    assert.equal(toPublic.status, 200);
    assert.equal((await toPublic.json() as { type: string }).type, "channel");

    // 1. ChannelRoute -> ensureChannel: GET /channels/:id must now resolve so
    //    the pane stops showing "Select a channel".
    const details = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(details.status, 200, "non-member resolves channel details after private -> public (no 'Select a channel')");
    assert.equal((await details.json() as { type: string }).type, "channel");

    // 2. threadStore.openThread: POST /channels/:id/threads must return a
    //    threadChannelId so ThreadPanel leaves the "Loading..." shell.
    const openThread = await fetch(`${app.baseUrl}/api/channels/${channel.id}/threads`, {
      method: "POST",
      headers: headers(outsiderToken, server.id),
      body: JSON.stringify({ parentMessageId: parent.id }),
    });
    assert.equal(openThread.status, 200, "non-member can open the thread after private -> public");
    const threadBody = await openThread.json() as { threadChannelId?: string };
    assert.equal(threadBody.threadChannelId, thread.id, "openThread returns the existing thread channel id");

    // 3. ThreadPanel reply load: history written while private must be readable.
    const threadMessages = await fetch(`${app.baseUrl}/api/messages/channel/${thread.id}`, {
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(threadMessages.status, 200, "non-member reads thread replies after private -> public");
    const replyBody = await threadMessages.json() as { messages: Array<{ content: string }> };
    assert.ok(
      replyBody.messages.some((m) => m.content === "reply while private"),
      "thread history from the private era is restored on private -> public",
    );
  } finally {
    await app.close();
  }
});

test("public -> private conversion prunes historical thread follows outside the private snapshot", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("visibility-thread-owner@slock.test", "visibility-thread-owner");
    const historicalFollower = await seedUser("visibility-thread-follower@slock.test", "visibility-thread-follower");
    const server = await createServer("Visibility Thread Server", "visibility-thread-server", owner.id);
    await addMember(server.id, historicalFollower.id);
    const historicalAgent = await createAgent(server.id, "visibility-thread-agent", { runtime: "codex" });
    const channel = await createChannel(server.id, "thread-toggle-room", "convert me");
    await addHuman(channel.id, owner.id);
    const parentMessage = await createMessage(channel.id, "user", owner.id, "thread parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    const publicReply = await createMessage(thread.id, "user", owner.id, "public reply");
    await db.insert(threadFollows).values([
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: owner.id,
        parentMessageId: parentMessage.id,
        reason: "authored",
      },
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: historicalFollower.id,
        parentMessageId: parentMessage.id,
        reason: "manual",
      },
      {
        threadChannelId: thread.id,
        followerType: "agent",
        followerId: historicalAgent.id,
        parentMessageId: parentMessage.id,
        reason: "manual",
      },
    ]).onConflictDoNothing();

    const ownerToken = await login(app.baseUrl, owner.email);
    const followerToken = await login(app.baseUrl, historicalFollower.email);

    const followedBefore = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(followerToken, server.id),
    });
    assert.equal(followedBefore.status, 200);
    const followedBeforeBody = await followedBefore.json() as { threads: Array<{ threadChannelId: string }> };
    assert.ok(
      followedBeforeBody.threads.some((item) => item.threadChannelId === thread.id),
      "historical follower sees the followed thread while the parent is public",
    );

    const toPrivate = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ visibility: "private" }),
    });
    assert.equal(toPrivate.status, 200);

    const rowsAfterPrivate = await db
      .select({
        followerType: threadFollows.followerType,
        followerId: threadFollows.followerId,
      })
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, thread.id));
    assert.deepEqual(
      rowsAfterPrivate,
      [{ followerType: "user", followerId: owner.id }],
      "public -> private must automatically unfollow historical thread subscribers outside the private snapshot",
    );

    const ownerReply = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ channelId: thread.id, content: "private reply" }),
    });
    assert.equal(ownerReply.status, 200, "private-channel member can continue replying in the thread");
    const ownerReplyBody = await ownerReply.json() as { id: string };

    const hiddenThread = await fetch(`${app.baseUrl}/api/messages/channel/${thread.id}`, {
      headers: headers(followerToken, server.id),
    });
    assert.equal(hiddenThread.status, 403, "unfollowed non-member cannot read thread history after public -> private");

    const followedAfter = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(followerToken, server.id),
    });
    assert.equal(followedAfter.status, 200);
    const followedAfterBody = await followedAfter.json() as { threads: Array<{ threadChannelId: string }> };
    assert.ok(
      !followedAfterBody.threads.some((item) => item.threadChannelId === thread.id),
      "unfollowed non-member must not keep seeing the thread in followed threads",
    );

    const inboxAfter = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(followerToken, server.id),
    });
    assert.equal(inboxAfter.status, 200);
    const inboxAfterBody = await inboxAfter.json() as { items: Array<{ threadChannelId?: string | null; parentChannelId?: string | null }> };
    assert.ok(
      !inboxAfterBody.items.some((item) => item.threadChannelId === thread.id || item.parentChannelId === channel.id),
      "unfollowed non-member must not keep seeing the thread in Inbox",
    );

    const unreadAfter = await fetch(`${app.baseUrl}/api/channels/unread`, {
      headers: headers(followerToken, server.id),
    });
    assert.equal(unreadAfter.status, 200);
    const unreadAfterBody = await unreadAfter.json() as Record<string, number>;
    assert.equal(unreadAfterBody[thread.id], undefined, "unfollowed non-member must not get unread for the thread");

    const syncAfter = await fetch(`${app.baseUrl}/api/messages/sync?since_seq=${publicReply.seq}`, {
      headers: headers(followerToken, server.id),
    });
    assert.equal(syncAfter.status, 200);
    const syncAfterBody = await syncAfter.json() as Array<{ id: string }>;
    assert.ok(
      !syncAfterBody.some((message) => message.id === ownerReplyBody.id),
      "gap sync must not leak new private-thread replies to historical followers",
    );
  } finally {
    await app.close();
  }
});

test("channel visibility conversion requires manageChannels and never applies to #all", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("visibility-guard-owner@slock.test", "visibility-guard-owner");
    const member = await seedUser("visibility-guard-member@slock.test", "visibility-guard-member");
    const server = await createServer("Visibility Guard Server", "visibility-guard-server", owner.id);
    await addMember(server.id, member.id);
    const channel = await createChannel(server.id, "guard-room");
    await addHuman(channel.id, member.id);

    const ownerToken = await login(app.baseUrl, owner.email);
    const memberToken = await login(app.baseUrl, member.email);

    const memberToggle = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(memberToken, server.id),
      body: JSON.stringify({ visibility: "private" }),
    });
    assert.equal(memberToggle.status, 403, "ordinary channel members cannot change visibility");

    const invalidToggle = await fetch(`${app.baseUrl}/api/channels/${channel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ visibility: "secret" }),
    });
    assert.equal(invalidToggle.status, 400);

    const channelsRes = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(channelsRes.status, 200);
    const allChannel = (await channelsRes.json() as Array<{ id: string; name: string }>).find((item) => item.name === "all");
    assert.ok(allChannel);

    const allToggle = await fetch(`${app.baseUrl}/api/channels/${allChannel.id}`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ visibility: "private" }),
    });
    assert.equal(allToggle.status, 403, "#all must stay public");
  } finally {
    await app.close();
  }
});

test("private channel creator can leave and then loses all visibility surfaces", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("private-leave-owner@slock.test", "private-leave-owner");
    const invited = await seedUser("private-leave-invited@slock.test", "private-leave-invited");
    const outsider = await seedUser("private-leave-outsider@slock.test", "private-leave-outsider");
    const server = await createServer("Private Leave Server", "private-leave-server", owner.id);
    await addMember(server.id, invited.id);
    await addMember(server.id, outsider.id);

    const ownerToken = await login(app.baseUrl, owner.email);
    const invitedToken = await login(app.baseUrl, invited.email);
    const outsiderToken = await login(app.baseUrl, outsider.email);
    const marker = "private leave marker 20260504";

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({
        name: "creator-can-leave",
        visibility: "private",
        userIds: [invited.id],
      }),
    });
    assert.equal(createRes.status, 200);
    const privateChannel = await createRes.json() as { id: string; type: string };
    assert.equal(privateChannel.type, "private");

    const messageRes = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ channelId: privateChannel.id, content: marker }),
    });
    assert.equal(messageRes.status, 200);

    const ownerSearchBefore = await fetch(`${app.baseUrl}/api/messages/search?q=${encodeURIComponent(marker)}`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerSearchBefore.status, 200);
    const ownerSearchBeforeBody = await ownerSearchBefore.json() as { results: Array<{ channelId: string }> };
    assert.ok(ownerSearchBeforeBody.results.some((result) => result.channelId === privateChannel.id));

    const leaveRes = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/leave`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
    });
    assert.equal(leaveRes.status, 200, "creator must be able to leave their private channel");

    const ownerList = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerList.status, 200);
    const ownerListBody = await ownerList.json() as Array<{ id: string }>;
    assert.ok(!ownerListBody.some((channel) => channel.id === privateChannel.id), "left creator must not see the private channel in channel list");

    const ownerDetails = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerDetails.status, 404, "left creator must not be able to inspect private channel details");

    const ownerMembers = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/members`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerMembers.status, 404, "left creator must not be able to inspect private channel membership");

    const ownerReinvite = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/members`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ userId: owner.id }),
    });
    assert.equal(ownerReinvite.status, 404, "left creator must not be able to use admin mutation routes to re-enter without an invite");

    const ownerArchive = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/archive`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerArchive.status, 404, "left creator must not be able to archive an invisible private channel");

    const ownerSearchAfter = await fetch(`${app.baseUrl}/api/messages/search?q=${encodeURIComponent(marker)}`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerSearchAfter.status, 200);
    const ownerSearchAfterBody = await ownerSearchAfter.json() as { results: Array<{ channelId: string }> };
    assert.ok(!ownerSearchAfterBody.results.some((result) => result.channelId === privateChannel.id), "left creator must not see private channel messages in search");

    const ownerInbox = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerInbox.status, 200);
    const ownerInboxBody = await ownerInbox.json() as { items: Array<{ kind: string; channelId?: string | null; parentChannelId?: string | null }> };
    assert.ok(!ownerInboxBody.items.some((item) => item.channelId === privateChannel.id || item.parentChannelId === privateChannel.id), "left creator must not see private channel in Inbox");

    const invitedDetails = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      headers: headers(invitedToken, server.id),
    });
    assert.equal(invitedDetails.status, 200, "other invited members should retain access after creator leaves");

    const outsiderLeave = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/leave`, {
      method: "POST",
      headers: headers(outsiderToken, server.id),
    });
    assert.equal(outsiderLeave.status, 404, "non-members must not be able to probe private channel existence through leave");
  } finally {
    await app.close();
  }
});

test("private channel soft-deletes when the last member leaves", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-empty-owner@slock.test", "private-empty-owner");
    const server = await createServer("Private Empty Server", "private-empty-server", owner.id);
    const ownerToken = await login(app.baseUrl, owner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({
        name: "empty-after-leave",
        visibility: "private",
      }),
    });
    assert.equal(createRes.status, 200);
    const privateChannel = await createRes.json() as { id: string; type: string };
    assert.equal(privateChannel.type, "private");

    const leaveRes = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}/leave`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
    });
    assert.equal(leaveRes.status, 200);

    const [deleted] = await db
      .select({ deletedAt: channels.deletedAt })
      .from(channels)
      .where(eq(channels.id, privateChannel.id));
    assert.ok(deleted?.deletedAt, "empty private channel should be soft-deleted");

    const details = await fetch(`${app.baseUrl}/api/channels/${privateChannel.id}`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(details.status, 404);
  } finally {
    await app.close();
  }
});

test("private channel remains active with an agent member and soft-deletes after the last agent leaves", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-agent-empty-owner@slock.test", "private-agent-empty-owner");
    const server = await createServer("Private Agent Empty Server", "private-agent-empty-server", owner.id);
    const agent = await createAgent(server.id, "private-agent-last-member", { runtime: "codex" });
    const privateChannel = await createChannel(server.id, "agent-only-after-human-leaves", undefined, "private");
    await addHuman(privateChannel.id, owner.id);
    await addAgent(privateChannel.id, agent.id);

    await removeHuman(privateChannel.id, owner.id);

    const [stillActive] = await db
      .select({ deletedAt: channels.deletedAt })
      .from(channels)
      .where(eq(channels.id, privateChannel.id));
    assert.equal(stillActive?.deletedAt, null, "agent membership should keep a private channel active");
    assert.equal(await canAgentAccessChannel(privateChannel.id, agent.id), true);

    await removeAgent(privateChannel.id, agent.id);

    const [deleted] = await db
      .select({ deletedAt: channels.deletedAt })
      .from(channels)
      .where(eq(channels.id, privateChannel.id));
    assert.ok(deleted?.deletedAt, "private channel should soft-delete after the last agent leaves");
    assert.equal(await canAgentAccessChannel(privateChannel.id, agent.id), false);
  } finally {
    await app.close();
  }
});

test("adding an agent to a channel writes a persistent system message and delivers it to the agent", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("agent-add-notice-owner@slock.test", "agent-add-notice-owner");
    const server = await createServer("Agent Add Notice Server", "agent-add-notice-server", owner.id);
    const channel = await createChannel(server.id, "agent-add-notice");
    await addHuman(channel.id, owner.id);
    const agent = await createAgent(server.id, "agent-add-notice-bot", { runtime: "codex" });
    const ownerToken = await login(app.baseUrl, owner.email);
    const deliveries: Array<{ agentId: string; message: { content: string; sender_type: string; seq?: number } }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (agentId: string, message: { content: string; sender_type: string; seq?: number }) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message) => {
      deliveries.push({ agentId, message });
    };

    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}/members`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ agentId: agent.id }),
    });
    assert.equal(res.status, 200);

    const [systemMessage] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.channelId, channel.id), eq(messages.messageType, "system")))
      .orderBy(desc(messages.createdAt));
    assert.ok(systemMessage, "expected a persistent channel system message");
    assert.equal(systemMessage.content, "@agent-add-notice-bot was added to this channel.");
    assert.equal(systemMessage.senderId, "system");

    const delivery = deliveries.find((item) => item.agentId === agent.id);
    assert.ok(delivery, "added agent should receive the channel system message");
    assert.equal(delivery.message.sender_type, "system");
    assert.equal(delivery.message.content, "@agent-add-notice-bot was added to this channel.");
    assert.ok(delivery.message.seq, "delivery should carry the persisted message seq");
  } finally {
    await app.close();
  }
});

test("removing an agent from a channel delivers the persistent system message before removing membership", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("agent-remove-notice-owner@slock.test", "agent-remove-notice-owner");
    const server = await createServer("Agent Remove Notice Server", "agent-remove-notice-server", owner.id);
    const channel = await createChannel(server.id, "agent-remove-notice");
    await addHuman(channel.id, owner.id);
    const agent = await createAgent(server.id, "agent-remove-notice-bot", { runtime: "codex" });
    await addAgent(channel.id, agent.id);
    const ownerToken = await login(app.baseUrl, owner.email);
    const deliveries: Array<{
      agentId: string;
      message: { content: string; sender_type: string; seq?: number };
      memberAtDelivery: boolean;
    }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (agentId: string, message: { content: string; sender_type: string; seq?: number }) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message) => {
      const [membershipAtDelivery] = await db
        .select({ agentId: channelAgents.agentId })
        .from(channelAgents)
        .where(and(eq(channelAgents.channelId, channel.id), eq(channelAgents.agentId, agentId)));
      deliveries.push({
        agentId,
        message,
        memberAtDelivery: Boolean(membershipAtDelivery),
      });
    };

    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}/members/agent/${agent.id}`, {
      method: "DELETE",
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 200);

    const [systemMessage] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.channelId, channel.id), eq(messages.messageType, "system")))
      .orderBy(desc(messages.createdAt));
    assert.ok(systemMessage, "expected a persistent channel system message");
    assert.equal(systemMessage.content, "@agent-remove-notice-bot was removed from this channel.");
    assert.equal(systemMessage.senderId, "system");

    const delivery = deliveries.find((item) => item.agentId === agent.id);
    assert.ok(delivery, "removed agent should receive the channel system message");
    assert.equal(delivery.message.sender_type, "system");
    assert.equal(delivery.message.content, "@agent-remove-notice-bot was removed from this channel.");
    assert.ok(delivery.message.seq, "delivery should carry the persisted message seq");
    assert.equal(delivery.memberAtDelivery, true, "removal notice should be delivered before membership is removed");
    const [membership] = await db
      .select()
      .from(channelAgents)
      .where(and(eq(channelAgents.channelId, channel.id), eq(channelAgents.agentId, agent.id)));
    assert.equal(membership, undefined, "agent membership row should be removed");
  } finally {
    await app.close();
  }
});

test("attempting to remove an agent from #all writes no membership system message and delivers no agent notice", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("all-remove-notice-owner@slock.test", "all-remove-notice-owner");
    const server = await createServer("All Remove Notice Server", "all-remove-notice-server", owner.id);
    const [allChannel] = await db
      .select()
      .from(channels)
      .where(and(eq(channels.serverId, server.id), eq(channels.name, "all")));
    assert.ok(allChannel, "createServer should create #all");
    const agent = await createAgent(server.id, "all-remove-notice-bot", { runtime: "codex" });
    await addAgent(allChannel.id, agent.id);
    const ownerToken = await login(app.baseUrl, owner.email);
    const deliveries: Array<{ agentId: string; message: { content: string } }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (agentId: string, message: { content: string }) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message) => {
      deliveries.push({ agentId, message });
    };

    const res = await fetch(`${app.baseUrl}/api/channels/${allChannel.id}/members/agent/${agent.id}`, {
      method: "DELETE",
      headers: headers(ownerToken, server.id),
    });
    assert.equal(res.status, 403);

    const systemMessages = await db
      .select()
      .from(messages)
      .where(and(eq(messages.channelId, allChannel.id), eq(messages.messageType, "system")));
    assert.equal(systemMessages.length, 0, "failed #all removal must not write a persistent system message");
    assert.equal(deliveries.length, 0, "failed #all removal must not deliver an agent notice");
    const [membership] = await db
      .select()
      .from(channelAgents)
      .where(and(eq(channelAgents.channelId, allChannel.id), eq(channelAgents.agentId, agent.id)));
    assert.ok(membership, "agent should remain in #all");
  } finally {
    await app.close();
  }
});

test("self join/leave broadcasts channel:members-updated so other clients refresh joined state", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const [owner, member] = await db.insert(users).values([
      {
        email: "channel-join-owner@slock.test",
        name: "channel-join-owner",
        displayName: "Channel Join Owner",
        passwordHash: await argon2.hash("password123"),
        emailVerified: true,
      },
      {
        email: "channel-join-member@slock.test",
        name: "channel-join-member",
        displayName: "Channel Join Member",
        passwordHash: await argon2.hash("password123"),
        emailVerified: true,
      },
    ]).returning();
    const server = await createServer("Channel Join Socket", "channel-join-socket", owner.id);
    await addMember(server.id, member.id, "member");
    const channel = await createChannel(server.id, "join-live-channel");
    await addHuman(channel.id, owner.id);

    const events = installFakeIo(app.app);

    const login = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: member.email, password: "password123" }),
    });
    assert.equal(login.status, 200);
    const { accessToken } = await login.json() as { accessToken: string };

    const join = await fetch(`${app.baseUrl}/api/channels/${channel.id}/join`, {
      method: "POST",
      headers: headers(accessToken, server.id),
    });
    assert.equal(join.status, 200);

    assert.equal(events.length, 1);
    assert.equal(events[0].room, `server:${server.id}`);
    assert.equal(events[0].event, "channel:members-updated");
    assert.deepEqual(events[0].payload, { channelId: channel.id });

    events.length = 0;
    const leave = await fetch(`${app.baseUrl}/api/channels/${channel.id}/leave`, {
      method: "POST",
      headers: headers(accessToken, server.id),
    });
    assert.equal(leave.status, 200);

    assert.equal(events.length, 1);
    assert.equal(events[0].room, `server:${server.id}`);
    assert.equal(events[0].event, "channel:members-updated");
    assert.deepEqual(events[0].payload, { channelId: channel.id });
  } finally {
    await app.close();
  }
});

test("GET /channels/:threadId/members returns parent channel members, not thread_follows", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);

    const res = await fetch(`${app.baseUrl}/api/channels/${f.threadId}/members`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { agents: Array<{ id: string }>; humans: Array<{ id: string }> };

    const humanIds = body.humans.map((h) => h.id).sort();
    const agentIds = body.agents.map((a) => a.id).sort();

    // Parent channel membership is the source of truth for /members
    assert.deepEqual(humanIds, [f.ownerId, f.memberBId].sort());
    assert.deepEqual(agentIds, [f.agentAId]);

    // follower and agentB are in thread_follows only — they MUST NOT leak
    // into the members endpoint, otherwise we've re-merged join/follow.
    assert.ok(!humanIds.includes(f.followerId), "follower (follows-only) must not appear in /members");
    assert.ok(!agentIds.includes(f.agentBId), "agentB (follows-only) must not appear in /members");
  } finally {
    await app.close();
  }
});

test("GET /channels/:id/members hides only #all human membership from ordinary members when configured", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("hide-channel-members-owner@slock.test", "hide-channel-members-owner");
    const member = await seedUser("hide-channel-members-member@slock.test", "hide-channel-members-member");
    const other = await seedUser("hide-channel-members-other@slock.test", "hide-channel-members-other");
    const server = await createServer("Hide Channel Members Server", "hide-channel-members-server", owner.id);
    await db.update(serversTable).set({ hideHumansFromMembers: true }).where(eq(serversTable.id, server.id));
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: member.id, role: "member" },
      { serverId: server.id, userId: other.id, role: "member" },
    ]);
    const channel = await createChannel(server.id, "hide-channel-members");
    await addHuman(channel.id, owner.id);
    await addHuman(channel.id, member.id);
    await addHuman(channel.id, other.id);
    const agent = await createAgent(server.id, "hide-channel-members-agent", { runtime: "codex" });
    await addAgent(channel.id, agent.id);
    const [allChannel] = await db
      .select()
      .from(channels)
      .where(and(eq(channels.serverId, server.id), eq(channels.name, "all")));
    assert.ok(allChannel, "expected #all channel");
    await addHuman(allChannel.id, member.id);
    await addHuman(allChannel.id, other.id);

    const memberToken = await login(app.baseUrl, member.email);
    const memberRes = await fetch(`${app.baseUrl}/api/channels/${channel.id}/members`, {
      headers: headers(memberToken, server.id),
    });
    assert.equal(memberRes.status, 200);
    const memberBody = await memberRes.json() as { agents: Array<{ id: string }>; humans: Array<{ id: string }> };
    assert.deepEqual(memberBody.humans.map((human) => human.id).sort(), [owner.id, member.id, other.id].sort(), "ordinary channel member lists should remain visible");
    assert.ok(memberBody.agents.some((candidate) => candidate.id === agent.id), "human-directory setting must not hide agents");

    const allMemberRes = await fetch(`${app.baseUrl}/api/channels/${allChannel.id}/members`, {
      headers: headers(memberToken, server.id),
    });
    assert.equal(allMemberRes.status, 200);
    const allMemberBody = await allMemberRes.json() as { humans: Array<{ id: string }> };
    assert.deepEqual(allMemberBody.humans.map((human) => human.id), [member.id], "#all must not remain a human directory for ordinary members");

    const dm = await findOrCreateUserDM(server.id, member.id, other.id);
    assert.ok(dm, "DM creation should succeed for two server members");
    const dmRes = await fetch(`${app.baseUrl}/api/channels/${dm.id}/members`, {
      headers: headers(memberToken, server.id),
    });
    assert.equal(dmRes.status, 200);
    const dmBody = await dmRes.json() as { humans: Array<{ id: string }> };
    assert.deepEqual(dmBody.humans.map((human) => human.id).sort(), [member.id, other.id].sort(), "DM member context should remain visible to participants");

    const ownerToken = await login(app.baseUrl, owner.email);
    const ownerRes = await fetch(`${app.baseUrl}/api/channels/${channel.id}/members`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(ownerRes.status, 200);
    const ownerBody = await ownerRes.json() as { humans: Array<{ id: string }> };
    assert.deepEqual(ownerBody.humans.map((human) => human.id).sort(), [owner.id, member.id, other.id].sort());

    const allOwnerRes = await fetch(`${app.baseUrl}/api/channels/${allChannel.id}/members`, {
      headers: headers(ownerToken, server.id),
    });
    assert.equal(allOwnerRes.status, 200);
    const allOwnerBody = await allOwnerRes.json() as { humans: Array<{ id: string }> };
    assert.deepEqual(allOwnerBody.humans.map((human) => human.id).sort(), [owner.id, member.id, other.id].sort());
  } finally {
    await app.close();
  }
});

test("GET /channels/:id/members shows community admins in #all when human directory is hidden", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    for (const slug of ["community", "community-cn"] as const) {
      const owner = await seedUser(`hidden-${slug}-owner@slock.test`, `hidden-${slug}-owner`);
      const admin = await seedUser(`hidden-${slug}-admin@slock.test`, `hidden-${slug}-admin`);
      const member = await seedUser(`hidden-${slug}-member@slock.test`, `hidden-${slug}-member`);
      const other = await seedUser(`hidden-${slug}-other@slock.test`, `hidden-${slug}-other`);
      const server = await createServer(`Hidden ${slug}`, slug, owner.id);
      await db.update(serversTable).set({ hideHumansFromMembers: true }).where(eq(serversTable.id, server.id));
      await db.insert(serverMembers).values([
        { serverId: server.id, userId: admin.id, role: "admin" },
        { serverId: server.id, userId: member.id, role: "member" },
        { serverId: server.id, userId: other.id, role: "member" },
      ]);
      const [allChannel] = await db
        .select()
        .from(channels)
        .where(and(eq(channels.serverId, server.id), eq(channels.name, "all")));
      assert.ok(allChannel, `expected #all channel for /${slug}`);
      await addHuman(allChannel.id, admin.id);
      await addHuman(allChannel.id, member.id);
      await addHuman(allChannel.id, other.id);

      const memberToken = await login(app.baseUrl, member.email);
      const res = await fetch(`${app.baseUrl}/api/channels/${allChannel.id}/members`, {
        headers: headers(memberToken, server.id),
      });
      assert.equal(res.status, 200);
      const body = await res.json() as { humans: Array<{ id: string; role: string; serverSlug: string }> };
      assert.deepEqual(
        body.humans.map((human) => human.id).sort(),
        [owner.id, admin.id, member.id].sort(),
        `/${slug} #all should show admins plus the requester, but not ordinary members`,
      );
      assert.ok(body.humans.some((human) => human.id === owner.id && human.role === "owner" && human.serverSlug === slug));
      assert.ok(body.humans.some((human) => human.id === admin.id && human.role === "admin" && human.serverSlug === slug));
      assert.ok(!body.humans.some((human) => human.id === other.id), `/${slug} #all must not become a full human directory`);
    }
  } finally {
    await app.close();
  }
});

test("GET /internal/agent/:id/channel-members returns parent-channel members for both channel and thread targets", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);
    const { machine, apiKey } = await registerMachine(f.serverId, f.ownerId, "members-daemon");

    await assignMachine(f.agentAId, machine.id);
    await assignMachine(f.agentBId, machine.id);

    const shortId = f.parentMessageId.slice(0, 8);
    const threadTarget = `#parent-room:${shortId}`;

    async function agentMembers(agentId: string, target: string) {
      const res = await fetch(
        `${app.baseUrl}/internal/agent/${agentId}/channel-members?channel=${encodeURIComponent(target)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );
      assert.equal(res.status, 200, `expected 200 for ${target}, got ${res.status}`);
      return await res.json() as {
        channel: { ref: string; type: string };
        agents: Array<{ id?: string; name: string }>;
        humans: Array<{ id?: string; name: string; role?: string }>;
      };
    }

    const channelBody = await agentMembers(f.agentAId, "#parent-room");
    const threadBody = await agentMembers(f.agentAId, threadTarget);

    assert.deepEqual(channelBody.channel, { ref: "#parent-room", type: "channel" });
    assert.deepEqual(threadBody.channel, { ref: threadTarget, type: "thread" });

    const expectedHumans = ["member-b", "owner"].sort();
    const expectedAgents = ["agent-a"];

    assert.deepEqual(channelBody.humans.map((h) => h.name).sort(), expectedHumans);
    assert.deepEqual(channelBody.agents.map((a) => a.name).sort(), expectedAgents);
    assert.equal(channelBody.humans.find((h) => h.name === "owner")?.role, "owner");
    assert.equal(channelBody.humans.find((h) => h.name === "member-b")?.role, "member");

    assert.deepEqual(threadBody.humans.map((h) => h.name).sort(), expectedHumans);
    assert.deepEqual(threadBody.agents.map((a) => a.name).sort(), expectedAgents);
    assert.equal(threadBody.humans.find((h) => h.name === "owner")?.role, "owner");
    assert.equal(threadBody.humans.find((h) => h.name === "member-b")?.role, "member");

    assert.ok(
      !threadBody.humans.some((h) => h.name === "follower"),
      "thread followers-only human must not leak into channel-members",
    );
    assert.ok(
      !threadBody.agents.some((a) => a.name === "agent-b"),
      "thread followers-only agent must not leak into channel-members",
    );
  } finally {
    await app.close();
  }
});

test("thread channels reject all legacy member-mutation routes with 400", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);
    const h = headers(f.ownerToken, f.serverId);

    const mutations: Array<{ method: "POST" | "DELETE"; path: string; body?: unknown }> = [
      { method: "POST", path: `/api/channels/${f.threadId}/agents`, body: { agentId: f.agentAId } },
      { method: "DELETE", path: `/api/channels/${f.threadId}/agents/${f.agentAId}` },
      { method: "POST", path: `/api/channels/${f.threadId}/members`, body: { memberId: f.memberBId, memberType: "user" } },
      { method: "DELETE", path: `/api/channels/${f.threadId}/members/agent/${f.agentAId}` },
      { method: "DELETE", path: `/api/channels/${f.threadId}/members/user/${f.memberBId}` },
      { method: "POST", path: `/api/channels/${f.threadId}/join` },
      { method: "POST", path: `/api/channels/${f.threadId}/leave` },
    ];

    for (const m of mutations) {
      const res = await fetch(`${app.baseUrl}${m.path}`, {
        method: m.method,
        headers: h,
        body: m.body ? JSON.stringify(m.body) : undefined,
      });
      assert.equal(res.status, 400, `${m.method} ${m.path} should return 400 on thread`);
      const errBody = await res.json() as { error: string };
      assert.match(errBody.error, /follow\/unfollow/i,
        `${m.method} ${m.path} error should mention follow/unfollow (got: ${errBody.error})`);
    }

    // Sanity: runtime did not write any new thread rows to the legacy tables.
    const db = getDb();
    const [{ humanRows, agentRows }] = await Promise.all([
      Promise.resolve().then(async () => ({
        humanRows: await db.select().from(channelHumans).where(eq(channelHumans.channelId, f.threadId)),
        agentRows: await db.select().from(channelAgents).where(eq(channelAgents.channelId, f.threadId)),
      })),
    ]);
    assert.equal(humanRows.length, 0, "thread must not acquire channel_humans rows at runtime");
    assert.equal(agentRows.length, 0, "thread must not acquire channel_agents rows at runtime");
  } finally {
    await app.close();
  }
});

test("follow/done/unfollow only read thread_follows — parent membership does not leak into followed list", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);

    // memberB is in the parent channel but NOT in thread_follows yet.
    // followed list must be empty for them — parent membership alone must
    // not make them appear as following.
    let res = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(f.memberBToken, f.serverId),
    });
    assert.equal(res.status, 200);
    let body = await res.json() as { threads: Array<{ threadChannelId: string }> };
    assert.equal(body.threads.length, 0, "parent member without follow must see empty followed list");

    // Manually follow — now the thread should appear.
    res = await fetch(`${app.baseUrl}/api/channels/threads/follow`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ parentMessageId: f.parentMessageId }),
    });
    assert.equal(res.status, 200);

    res = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(f.memberBToken, f.serverId),
    });
    body = await res.json() as { threads: Array<{ threadChannelId: string }> };
    assert.equal(body.threads.length, 1, "followed thread must appear after follow");
    assert.equal(body.threads[0].threadChannelId, f.threadId);

    // Done hides from the active list; undone restores.
    res = await fetch(`${app.baseUrl}/api/channels/threads/done`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ threadChannelId: f.threadId }),
    });
    assert.equal(res.status, 200);

    res = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(f.memberBToken, f.serverId),
    });
    body = await res.json() as { threads: Array<{ threadChannelId: string }> };
    assert.equal(body.threads.length, 0, "done thread must not appear in followed list");

    res = await fetch(`${app.baseUrl}/api/channels/threads/undone`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ threadChannelId: f.threadId }),
    });
    assert.equal(res.status, 200);

    res = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(f.memberBToken, f.serverId),
    });
    body = await res.json() as { threads: Array<{ threadChannelId: string }> };
    assert.equal(body.threads.length, 1, "undone thread must reappear in followed list");

    // Unfollow removes from the follows list without touching membership.
    res = await fetch(`${app.baseUrl}/api/channels/threads/unfollow`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ threadChannelId: f.threadId }),
    });
    assert.equal(res.status, 200);

    res = await fetch(`${app.baseUrl}/api/channels/threads/followed`, {
      headers: headers(f.memberBToken, f.serverId),
    });
    body = await res.json() as { threads: Array<{ threadChannelId: string }> };
    assert.equal(body.threads.length, 0, "unfollowed thread must not appear in followed list");

    // Unfollow must not touch parent-channel membership (post authority).
    const db = getDb();
    const parentHumans = await db.select({ userId: channelHumans.userId })
      .from(channelHumans)
      .where(eq(channelHumans.channelId, f.parentChannelId));
    assert.ok(
      parentHumans.some((row) => row.userId === f.memberBId),
      "unfollow must not remove memberB from parent channel membership",
    );
  } finally {
    await app.close();
  }
});

test("human/web unfollow suppresses parent-author reactivation but direct mention restores Inbox", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);
    const db = getDb();

    // Owner currently follows the thread as the parent-message author.
    // Unfollow is an explicit attention opt-out, not just a transient delete.
    let res = await fetch(`${app.baseUrl}/api/channels/threads/unfollow`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
      body: JSON.stringify({ threadChannelId: f.threadId }),
    });
    assert.equal(res.status, 200);

    let rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, f.threadId));
    const ownerSuppressed = rows.find((r) => r.followerType === "user" && r.followerId === f.ownerId);
    assert.ok(ownerSuppressed?.unfollowedAt, "unfollow should persist a suppressed follow row");

    // A later reply would previously re-insert/re-activate the parent author
    // with reason='authored', which made the thread re-enter Inbox.
    res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ channelId: f.threadId, content: "reply after owner unfollow" }),
    });
    assert.equal(res.status, 200);

    async function getOwnerInbox(filter: "all" | "unread" | "mentions" = "all") {
      const url = new URL(`${app.baseUrl}/api/channels/inbox`);
      url.searchParams.set("filter", filter);
      const inboxRes = await fetch(url, { headers: headers(f.ownerToken, f.serverId) });
      assert.equal(inboxRes.status, 200);
      return await inboxRes.json() as {
        items: Array<{
          kind: string;
          threadChannelId?: string;
          firstUnreadMessageId?: string | null;
          unreadCount?: number;
        }>;
      };
    }

    const afterOrdinaryReplyInbox = await getOwnerInbox();
    assert.ok(
      !afterOrdinaryReplyInbox.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId),
      "unfollowed thread must stay out of Inbox after ordinary new replies",
    );

    // A direct @mention is a new attention signal and should override the
    // unfollow suppression. The unread count should start at the mention, not
    // backfill ordinary replies from the muted window.
    res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ channelId: f.threadId, content: "ping @owner after unfollow" }),
    });
    assert.equal(res.status, 200);
    const mentionMessage = await res.json() as { id: string };

    rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, f.threadId));
    const ownerAfter = rows.find((r) => r.followerType === "user" && r.followerId === f.ownerId);
    assert.equal(ownerAfter?.unfollowedAt, null, "direct mention should clear unfollowedAt");

    const allInbox = await getOwnerInbox();
    const allThreadItem = allInbox.items.find((item) => item.kind === "thread" && item.threadChannelId === f.threadId);
    assert.ok(allThreadItem, "direct mention should restore the thread to Inbox");
    assert.equal(allThreadItem.unreadCount, 1, "unread count should start at the mention message");
    assert.equal(allThreadItem.firstUnreadMessageId, mentionMessage.id);

    const mentionsInbox = await getOwnerInbox("mentions");
    const mentionThreadItem = mentionsInbox.items.find((item) => item.kind === "thread" && item.threadChannelId === f.threadId);
    assert.ok(mentionThreadItem, "direct mention should restore the thread to Mentions filter");

    res = await fetch(`${app.baseUrl}/api/channels/threads/follow`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
      body: JSON.stringify({ parentMessageId: f.parentMessageId }),
    });
    assert.equal(res.status, 200);

    rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, f.threadId));
    const ownerRefollowed = rows.find((r) => r.followerType === "user" && r.followerId === f.ownerId);
    assert.equal(ownerRefollowed?.unfollowedAt, null, "manual follow should clear the suppression marker");

    const refollowedInbox = await getOwnerInbox();
    assert.ok(
      refollowedInbox.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId),
      "manual follow should restore the thread to Inbox",
    );
  } finally {
    await app.close();
  }
});

test("human/web unfollow suppresses ordinary replies for non-author followers until mentioned", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);

    let res = await fetch(`${app.baseUrl}/api/channels/threads/unfollow`, {
      method: "POST",
      headers: headers(f.followerToken, f.serverId),
      body: JSON.stringify({ threadChannelId: f.threadId }),
    });
    assert.equal(res.status, 200);

    res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ channelId: f.threadId, content: "ordinary reply after non-author unfollow" }),
    });
    assert.equal(res.status, 200);

    async function getFollowerInbox(filter: "all" | "unread" | "mentions" = "all") {
      const url = new URL(`${app.baseUrl}/api/channels/inbox`);
      url.searchParams.set("filter", filter);
      const inboxRes = await fetch(url, { headers: headers(f.followerToken, f.serverId) });
      assert.equal(inboxRes.status, 200);
      return await inboxRes.json() as {
        items: Array<{
          kind: string;
          threadChannelId?: string;
          firstUnreadMessageId?: string | null;
          unreadCount?: number;
        }>;
      };
    }

    const ordinaryInbox = await getFollowerInbox();
    assert.ok(
      !ordinaryInbox.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId),
      "ordinary replies must not restore a non-author follower after unfollow",
    );

    res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ channelId: f.threadId, content: "ping @follower after unfollow" }),
    });
    assert.equal(res.status, 200);
    const mentionMessage = await res.json() as { id: string };

    const mentionInbox = await getFollowerInbox("mentions");
    const mentionThreadItem = mentionInbox.items.find((item) => item.kind === "thread" && item.threadChannelId === f.threadId);
    assert.ok(mentionThreadItem, "direct mention should restore non-author follower to Mentions filter");
    assert.equal(mentionThreadItem.unreadCount, 1, "muted ordinary replies should not be backfilled into unread count");
    assert.equal(mentionThreadItem.firstUnreadMessageId, mentionMessage.id);
  } finally {
    await app.close();
  }
});

test("post authority = parent membership — following a thread does NOT grant permission to send", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);

    async function send(token: string, channelId: string, content: string) {
      return fetch(`${app.baseUrl}/api/messages`, {
        method: "POST",
        headers: headers(token, f.serverId),
        body: JSON.stringify({ channelId, content }),
      });
    }

    // follower is in thread_follows but NOT in the parent channel.
    // Listening to the thread must NOT grant posting permission.
    let res = await send(f.followerToken, f.threadId, "hello from a follower-only user");
    assert.equal(res.status, 403, "follower-only user must not be able to post to thread");

    // Same user also cannot post to the parent channel directly — proves
    // that the 403 above is coming from parent-membership, not from some
    // thread-specific quirk.
    res = await send(f.followerToken, f.parentChannelId, "hello from a follower-only user");
    assert.equal(res.status, 403, "follower-only user must not be able to post to parent channel");

    // outsider is in neither parent nor follows — also rejected.
    res = await send(f.outsiderToken, f.threadId, "hello from an outsider");
    assert.equal(res.status, 403, "outsider must not be able to post to thread");

    // Positive control: owner is in parent channel → thread post succeeds.
    res = await send(f.ownerToken, f.threadId, "hello from the owner");
    assert.equal(res.status, 200, "parent-channel member should be able to post to thread");

    // memberB is a parent member but has not followed the thread.
    // Post authority must still allow them to send — listening ≠ posting
    // applies symmetrically in both directions.
    res = await send(f.memberBToken, f.threadId, "hello from memberB");
    assert.equal(res.status, 200, "parent-channel member can post to thread without following");
  } finally {
    await app.close();
  }
});

test("agent post authority: /internal/agent/:id/send to thread requires parent-channel membership", async () => {
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

    const f = await seedThreadFixture(app.baseUrl);
    const { machine, apiKey } = await registerMachine(f.serverId, f.ownerId, "test-daemon");

    // Both agents must be assigned to this machine for /internal auth to accept them.
    // agentA is in the parent channel; agentB is in thread_follows only.
    await assignMachine(f.agentAId, machine.id);
    await assignMachine(f.agentBId, machine.id);

    // Thread target in the format the daemon uses: #<channel-name>:<8-hex short id>.
    const shortId = f.parentMessageId.slice(0, 8);
    const threadTarget = `#parent-room:${shortId}`;

    async function agentSend(agentId: string, target: string, content: string) {
      return fetch(`${app.baseUrl}/internal/agent/${agentId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ target, content }),
      });
    }

    // agentB is in thread_follows but NOT in the parent channel.
    // Following a thread must not grant post permission.
    let res = await agentSend(f.agentBId, threadTarget, "bot wants to reply");
    assert.equal(res.status, 403, "agent in follows-only must not post to thread");
    const errBody = await res.json() as { error: string };
    assert.match(
      errBody.error,
      /parent channel/i,
      `403 error must mention parent channel (got: ${errBody.error})`,
    );

    // Positive control: agentA is in the parent channel → thread post succeeds.
    sink.clear();
    res = await agentSend(f.agentAId, threadTarget, "agent in parent posts to thread");
    assert.equal(res.status, 200, "parent-channel agent can post to thread");

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/internal/agent/:id/send",
    );
    assert.ok(span, "expected POST /internal/agent/:id/send root span");
    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "agent_send.request.started",
      "agent.ownership.checked",
      "target.resolved",
      "message.sent",
      "response.ready",
      "http.response.finished",
    ]);

    const targetEvent = span.events.find((event) => event.name === "target.resolved");
    assert.ok(targetEvent);
    assert.equal(targetEvent.attrs?.target_kind, "thread");
    assert.equal(targetEvent.attrs?.outcome, "resolved");
    assert.equal(targetEvent.attrs?.channel_type, "thread");

    const sentEvent = span.events.find((event) => event.name === "message.sent");
    assert.ok(sentEvent);
    assert.equal(sentEvent.attrs?.channel_type, "thread");
    assert.equal(sentEvent.attrs?.message_id_present, true);
    assert.equal(sentEvent.attrs?.attachments_count, 0);

    assert.equal(Object.values(span.attrs ?? {}).includes(f.agentAId), false);
    assert.equal(Object.values(targetEvent.attrs ?? {}).includes(f.threadId), false);
    assert.equal(Object.values(sentEvent.attrs ?? {}).includes(f.parentMessageId), false);
  } finally {
    await app.close();
  }
});

test("mention in thread auto-follows the mentioned user and agent (reason='mentioned')", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);
    const db = getDb();

    // Sanity: memberB (human) and agentA (agent) are parent-channel members
    // but NOT yet thread_follows entries.
    const beforeRows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, f.threadId));
    assert.ok(
      !beforeRows.some((r) => r.followerType === "user" && r.followerId === f.memberBId),
      "precondition: memberB should not yet follow the thread",
    );
    assert.ok(
      !beforeRows.some((r) => r.followerType === "agent" && r.followerId === f.agentAId),
      "precondition: agentA should not yet follow the thread",
    );

    // Owner (parent member + thread follower via creation) posts a reply
    // mentioning both memberB and agentA.
    const res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
      body: JSON.stringify({
        channelId: f.threadId,
        content: "pinging @member-b and @agent-a here",
      }),
    });
    assert.equal(res.status, 200, "mention-bearing message should send");

    const afterRows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, f.threadId));

    const memberBFollow = afterRows.find(
      (r) => r.followerType === "user" && r.followerId === f.memberBId,
    );
    assert.ok(memberBFollow, "mentioned human must be auto-added to thread_follows");
    assert.equal(
      memberBFollow!.reason,
      "mentioned",
      "mention-follow for user must record reason='mentioned'",
    );

    const agentAFollow = afterRows.find(
      (r) => r.followerType === "agent" && r.followerId === f.agentAId,
    );
    assert.ok(agentAFollow, "mentioned agent must be auto-added to thread_follows");
    assert.equal(
      agentAFollow!.reason,
      "mentioned",
      "mention-follow for agent must record reason='mentioned'",
    );

    // Outsider (not in the parent channel, not followed) was not mentioned.
    // Must NOT appear in thread_follows — mentions are the only trigger tested here.
    assert.ok(
      !afterRows.some((r) => r.followerType === "user" && r.followerId === f.outsiderId),
      "unmentioned outsider must not be auto-followed",
    );
  } finally {
    await app.close();
  }
});

test("opening a thread (view-only) writes NO thread_follows rows", async () => {
  // This test nails down the contract invariant: a user who merely opens a
  // thread panel must not start following it. Before PR threads-contract the
  // open path POSTed to /channels/:id/threads, which called getOrCreateThread
  // with the caller as "creator" and auto-followed them — that polluted the
  // Threads list with threads the user never participated in.
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [author] = await db.insert(users).values({
      email: "author@slock.test",
      name: "author",
      displayName: "Author",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [viewer] = await db.insert(users).values({
      email: "viewer@slock.test",
      name: "viewer",
      displayName: "Viewer",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Lazy Open", "lazy-open", author.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: viewer.id, role: "member" });

    const parent = await createChannel(server.id, "room");
    await addHuman(parent.id, author.id);
    await addHuman(parent.id, viewer.id);

    const parentMessage = await createMessage(parent.id, "user", author.id, "original");

    // Viewer opens the thread (simulated by calling getOrCreateThread, which
    // is the shared path for both real replies and lazy creates).
    const thread = await getOrCreateThread(parentMessage.id, viewer.id, "user");

    const rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, thread.id));

    assert.equal(
      rows.length,
      0,
      "opening a thread must not write any thread_follows rows — view is not participation",
    );
  } finally {
    await app.close();
  }
});

test("POST /api/channels/:id/threads opens an empty thread without auto-following the viewer", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    const [author] = await db.insert(users).values({
      email: "author-open@slock.test",
      name: "author-open",
      displayName: "Author Open",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [viewer] = await db.insert(users).values({
      email: "viewer-open@slock.test",
      name: "viewer-open",
      displayName: "Viewer Open",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Open Thread Route", "open-thread-route", author.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: viewer.id, role: "member" });

    const parent = await createChannel(server.id, "room");
    await addHuman(parent.id, author.id);
    await addHuman(parent.id, viewer.id);

    const parentMessage = await createMessage(parent.id, "user", author.id, "original");

    const login = await fetch(`${app.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "viewer-open@slock.test", password: "password123" }),
    });
    assert.equal(login.status, 200);
    const viewerToken = (await login.json() as { accessToken: string }).accessToken;

    const res = await fetch(`${app.baseUrl}/api/channels/${parent.id}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${viewerToken}`,
        "X-Server-Id": server.id,
      },
      body: JSON.stringify({ parentMessageId: parentMessage.id }),
    });
    assert.equal(res.status, 200);
    const data = await res.json() as {
      threadChannelId: string;
      replyCount: number;
      lastReplyAt: string | null;
      participantIds: string[];
    };

    assert.ok(data.threadChannelId, "route must return a threadChannelId for first-reply UX");
    assert.equal(data.replyCount, 0);
    assert.equal(data.lastReplyAt, null);
    assert.deepEqual(data.participantIds, []);

    const rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, data.threadChannelId));

    assert.equal(rows.length, 0, "open-only POST must not auto-follow the viewer");
  } finally {
    await app.close();
  }
});

test("first reply in a thread writes sender='replied' and parent author='authored'", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const events = installFakeIo(app.app);

    const [author] = await db.insert(users).values({
      email: "author@slock.test",
      name: "author",
      displayName: "Author",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    const [replier] = await db.insert(users).values({
      email: "replier@slock.test",
      name: "replier",
      displayName: "Replier",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Reply Follow", "reply-follow", author.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: replier.id, role: "member" });

    const parent = await createChannel(server.id, "room");
    await addHuman(parent.id, author.id);
    await addHuman(parent.id, replier.id);

    const parentMessage = await createMessage(parent.id, "user", author.id, "original");

    async function login(email: string): Promise<string> {
      const res = await fetch(`${app.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      });
      assert.equal(res.status, 200);
      return (await res.json() as { accessToken: string }).accessToken;
    }
    const replierToken = await login("replier@slock.test");

    // Replier sends the first reply in one atomic call — creates the thread
    // and posts the first message via the reply-broadcast path.
    const res = await fetch(`${app.baseUrl}/api/channels/${parent.id}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${replierToken}`,
        "X-Server-Id": server.id,
      },
      body: JSON.stringify({ parentMessageId: parentMessage.id, content: "first reply" }),
    });
    assert.equal(res.status, 200, "first reply should succeed");
    const threadData = await res.json() as { threadChannelId: string };

    const rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, threadData.threadChannelId));

    const replierRow = rows.find((r) => r.followerType === "user" && r.followerId === replier.id);
    assert.ok(replierRow, "reply sender must be auto-followed");
    assert.equal(replierRow!.reason, "replied", "sender follow reason should be 'replied'");

    const authorRow = rows.find((r) => r.followerType === "user" && r.followerId === author.id);
    assert.ok(authorRow, "parent-message author must be auto-followed on first reply");
    assert.equal(authorRow!.reason, "authored", "parent-author follow reason should be 'authored'");

    const threadRoom = `channel:${threadData.threadChannelId}`;
    const authorJoinIndex = events.findIndex(
      (event) =>
        event.event === "socketsJoin" &&
        event.room.includes(`user:${author.id}`) &&
        event.room.includes(`server:${server.id}`) &&
        (event.payload as { room?: string }).room === threadRoom,
    );
    const messageNewIndex = events.findIndex(
      (event) => event.event === "message:new" && event.room === `user:${author.id}`,
    );
    assert.ok(authorJoinIndex >= 0, "parent author must be joined to the thread room for the first reply broadcast");
    assert.ok(messageNewIndex >= 0, "first reply must be emitted directly to the parent author");
    assert.ok(authorJoinIndex < messageNewIndex, "parent author follow must be established before message:new is emitted");
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === threadRoom),
      "thread replies must not broadcast to a stale channel room without re-checking parent access",
    );
  } finally {
    await app.close();
  }
});

test("new thread message clears doneAt for existing followers (unread reactivation)", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);
    const db = getDb();

    // Owner marks the thread done.
    let res = await fetch(`${app.baseUrl}/api/channels/threads/done`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
      body: JSON.stringify({ threadChannelId: f.threadId }),
    });
    assert.equal(res.status, 200);

    const doneRow = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, f.threadId));
    const ownerDone = doneRow.find(
      (r) => r.followerType === "user" && r.followerId === f.ownerId,
    );
    assert.ok(ownerDone?.doneAt, "owner's thread follow should have doneAt set after /done");

    // memberB (parent member) sends a new message to the thread.
    res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(f.memberBToken, f.serverId),
      body: JSON.stringify({ channelId: f.threadId, content: "new activity" }),
    });
    assert.equal(res.status, 200, "parent member should be able to post to thread");

    // doneAt must be cleared — the follower is unread again.
    const afterRow = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, f.threadId));
    const ownerAfter = afterRow.find(
      (r) => r.followerType === "user" && r.followerId === f.ownerId,
    );
    assert.equal(
      ownerAfter?.doneAt,
      null,
      "new activity must clear doneAt for existing followers",
    );
  } finally {
    await app.close();
  }
});

test("DM thread mention auto-follow is private-scoped: outsiders cannot be pulled in", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();

    // DM participants
    const [dmUser] = await db.insert(users).values({
      email: "dm-user@slock.test",
      name: "dm-user",
      displayName: "DM User",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();
    // Outsiders — on the server but NOT in the DM.
    const [outsiderUser] = await db.insert(users).values({
      email: "dm-outsider@slock.test",
      name: "dm-outsider",
      displayName: "DM Outsider",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("DM Mention Scope", "dm-mention", dmUser.id);
    await db.insert(serverMembers).values({
      serverId: server.id, userId: outsiderUser.id, role: "member",
    });

    const dmAgent = await createAgent(server.id, "dm-agent", { runtime: "codex" });
    const outsiderAgent = await createAgent(server.id, "dm-outsider-agent", { runtime: "codex" });

    const dm = await findOrCreateDM(server.id, dmUser.id, dmAgent.id);
    assert.ok(dm, "DM should be created");

    // Parent message in the DM, thread derived from it.
    const parentMessage = await createMessage(dm!.id, "user", dmUser.id, "private hi");
    const thread = await getOrCreateThread(parentMessage.id, dmUser.id, "user");

    async function login(email: string): Promise<string> {
      const res = await fetch(`${app.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      });
      assert.equal(res.status, 200);
      const data = await res.json() as { accessToken: string };
      return data.accessToken;
    }

    const dmUserToken = await login("dm-user@slock.test");

    // DM participant mentions both an outsider human and an outsider agent
    // inside the DM thread. Neither is in the parent DM — private scope must
    // hold: they should NOT be auto-followed into thread_follows.
    const res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dmUserToken}`,
        "X-Server-Id": server.id,
      },
      body: JSON.stringify({
        channelId: thread.id,
        content: "trying to pull in @dm-outsider and @dm-outsider-agent",
      }),
    });
    assert.equal(res.status, 200, "DM participant should be able to post to their own DM thread");

    const rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, thread.id));

    assert.ok(
      !rows.some((r) => r.followerType === "user" && r.followerId === outsiderUser.id),
      "outsider human must not be auto-followed into a DM thread",
    );
    assert.ok(
      !rows.some((r) => r.followerType === "agent" && r.followerId === outsiderAgent.id),
      "outsider agent must not be auto-followed into a DM thread",
    );

    // Positive control: the DM agent (a parent DM participant) IS a valid
    // mention target — but we didn't mention them here, so they remain
    // followed only via the creation path (reason='authored' if applicable),
    // not via mention.
    const outsiderRows = rows.filter(
      (r) =>
        (r.followerType === "user" && r.followerId === outsiderUser.id) ||
        (r.followerType === "agent" && r.followerId === outsiderAgent.id),
    );
    assert.equal(
      outsiderRows.length,
      0,
      "no outsider rows at all — DM threads are a closed private scope for mention auto-follow",
    );
  } finally {
    await app.close();
  }
});

test("private channel thread mention auto-follow is bounded by parent private membership", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-thread-owner@slock.test", "private-thread-owner");
    const outsider = await seedUser("private-thread-outsider@slock.test", "private-thread-outsider");
    const server = await createServer("Private Thread Mention Scope", "private-thread-mention", owner.id);
    await addMember(server.id, outsider.id);
    const outsiderAgent = await createAgent(server.id, "private-thread-outsider-agent", { runtime: "codex" });
    const privateChannel = await createChannel(server.id, "private-thread-parent", "invite-only parent", "private");
    await addHuman(privateChannel.id, owner.id);

    const parentMessage = await createMessage(privateChannel.id, "user", owner.id, "private parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({
        channelId: thread.id,
        content: "trying to pull in @private-thread-outsider and @private-thread-outsider-agent",
      }),
    });
    assert.equal(res.status, 200, "private channel member should be able to post to its thread");

    const rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, thread.id));

    assert.ok(
      !rows.some((r) => r.followerType === "user" && r.followerId === outsider.id),
      "outsider human must not be auto-followed into a private-channel thread",
    );
    assert.ok(
      !rows.some((r) => r.followerType === "agent" && r.followerId === outsiderAgent.id),
      "outsider agent must not be auto-followed into a private-channel thread",
    );
  } finally {
    await app.close();
  }
});

test("manual thread follow cloaks private parent messages from non-members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("manual-private-thread-owner@slock.test", "manual-private-thread-owner");
    const outsider = await seedUser("manual-private-thread-outsider@slock.test", "manual-private-thread-outsider");
    const server = await createServer("Manual Private Thread Scope", "manual-private-thread-scope", owner.id);
    await addMember(server.id, outsider.id);
    const privateChannel = await createChannel(server.id, "manual-private-thread-parent", "invite-only parent", "private");
    await addHuman(privateChannel.id, owner.id);
    const parentMessage = await createMessage(privateChannel.id, "user", owner.id, "private parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");

    const outsiderToken = await (async () => {
      const res = await fetch(`${app.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: outsider.email, password: "password123" }),
      });
      assert.equal(res.status, 200);
      const data = await res.json() as { accessToken: string };
      return data.accessToken;
    })();

    let res = await fetch(`${app.baseUrl}/api/channels/threads/follow`, {
      method: "POST",
      headers: headers(outsiderToken, server.id),
      body: JSON.stringify({ parentMessageId: parentMessage.id }),
    });
    assert.equal(res.status, 404, "private parent message must be cloaked from non-members");

    for (const path of ["unfollow", "done", "undone"]) {
      res = await fetch(`${app.baseUrl}/api/channels/threads/${path}`, {
        method: "POST",
        headers: headers(outsiderToken, server.id),
        body: JSON.stringify({ threadChannelId: thread.id }),
      });
      assert.equal(res.status, 404, `private thread ${path} must be cloaked from non-members`);
    }

    const rows = await db
      .select()
      .from(threadFollows)
      .where(and(eq(threadFollows.threadChannelId, thread.id), eq(threadFollows.followerId, outsider.id)));
    assert.equal(rows.length, 0, "manual follow must not create private-thread follow rows for non-members");
  } finally {
    await app.close();
  }
});

test("removing a private parent member prunes thread follows and blocks stale socket delivery", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const events = installFakeIo(app.app);
    const owner = await seedUser("private-thread-remove-owner@slock.test", "private-thread-remove-owner");
    const member = await seedUser("private-thread-remove-member@slock.test", "private-thread-remove-member");
    const server = await createServer("Private Thread Remove", "private-thread-remove", owner.id);
    await addMember(server.id, member.id);
    const privateChannel = await createChannel(server.id, "private-thread-remove-parent", "invite-only parent", "private");
    await addHuman(privateChannel.id, owner.id);
    await addHuman(privateChannel.id, member.id);
    const parentMessage = await createMessage(privateChannel.id, "user", owner.id, "private parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    await db.insert(threadFollows).values([
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: owner.id,
        parentMessageId: parentMessage.id,
        reason: "authored",
      },
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: member.id,
        parentMessageId: parentMessage.id,
        reason: "manual",
      },
    ]);

    await removeHuman(privateChannel.id, member.id);

    const memberFollowRows = await db
      .select()
      .from(threadFollows)
      .where(and(eq(threadFollows.threadChannelId, thread.id), eq(threadFollows.followerId, member.id)));
    assert.equal(memberFollowRows.length, 0, "removing a private parent member should prune their thread follow rows");

    const ownerToken = await login(app.baseUrl, owner.email);
    const res = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ channelId: thread.id, content: "private reply after removal" }),
    });
    assert.equal(res.status, 200);

    assert.ok(
      events.some((event) => event.event === "message:new" && event.room === `user:${owner.id}`),
      "remaining private parent member should still receive thread replies",
    );
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === `user:${member.id}`),
      "removed private parent member must not receive thread replies through a stale follow or socket room",
    );
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === `channel:${thread.id}`),
      "private thread replies must not broadcast to the thread room where stale sockets may remain",
    );
  } finally {
    await app.close();
  }
});

test("removing public parent members prunes their human and agent thread follows", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("public-thread-remove-owner@slock.test", "public-thread-remove-owner");
    const member = await seedUser("public-thread-remove-member@slock.test", "public-thread-remove-member");
    const server = await createServer("Public Thread Remove", "public-thread-remove", owner.id);
    await addMember(server.id, member.id);
    const agent = await createAgent(server.id, "public-thread-remove-agent", { runtime: "codex" });
    const publicChannel = await createChannel(server.id, "public-thread-remove-parent", "public parent");
    await addHuman(publicChannel.id, owner.id);
    await addHuman(publicChannel.id, member.id);
    await addAgent(publicChannel.id, agent.id);
    const parentMessage = await createMessage(publicChannel.id, "user", owner.id, "public parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    await db.insert(threadFollows).values([
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: owner.id,
        parentMessageId: parentMessage.id,
        reason: "authored",
      },
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: member.id,
        parentMessageId: parentMessage.id,
        reason: "manual",
      },
      {
        threadChannelId: thread.id,
        followerType: "agent",
        followerId: agent.id,
        parentMessageId: parentMessage.id,
        reason: "manual",
      },
    ]);

    await removeHuman(publicChannel.id, member.id);
    await removeAgent(publicChannel.id, agent.id);

    const rows = await db
      .select({
        followerType: threadFollows.followerType,
        followerId: threadFollows.followerId,
      })
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, thread.id));

    assert.deepEqual(
      rows,
      [{ followerType: "user", followerId: owner.id }],
      "leaving a public parent channel should remove stale human and agent child-thread follows",
    );
  } finally {
    await app.close();
  }
});

test("private task thread system messages do not leak through stale thread rooms", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const events = installFakeIo(app.app);
    const owner = await seedUser("private-task-system-owner@slock.test", "private-task-system-owner");
    const member = await seedUser("private-task-system-member@slock.test", "private-task-system-member");
    const server = await createServer("Private Task System", "private-task-system", owner.id);
    await addMember(server.id, member.id);
    const privateChannel = await createChannel(server.id, "private-task-system-parent", "invite-only tasks", "private");
    await addHuman(privateChannel.id, owner.id);
    await addHuman(privateChannel.id, member.id);
    const [task] = await taskService.createTasks(privateChannel.id, "user", owner.id, [{ title: "private task" }]);
    const thread = await getOrCreateThread(task.id, owner.id, "user");
    await db.insert(threadFollows).values([
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: owner.id,
        parentMessageId: task.id,
        reason: "authored",
      },
      {
        threadChannelId: thread.id,
        followerType: "user",
        followerId: member.id,
        parentMessageId: task.id,
        reason: "manual",
      },
    ]);

    await removeHuman(privateChannel.id, member.id);
    events.length = 0;

    const ownerToken = await login(app.baseUrl, owner.email);
    const statusRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}/status`, {
      method: "PATCH",
      headers: headers(ownerToken, server.id),
      body: JSON.stringify({ status: "in_progress" }),
    });
    assert.equal(statusRes.status, 200);

    assert.ok(
      events.some((event) => event.event === "message:new" && event.room === `user:${owner.id}`),
      "remaining private parent member should receive task lifecycle system messages",
    );
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === `user:${member.id}`),
      "removed private parent member must not receive task lifecycle system messages directly",
    );
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === `channel:${thread.id}`),
      "thread system messages must not broadcast to the stale thread room",
    );
  } finally {
    await app.close();
  }
});

test("removing a server member prunes their private thread follows", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("server-remove-thread-owner@slock.test", "server-remove-thread-owner");
    const member = await seedUser("server-remove-thread-member@slock.test", "server-remove-thread-member");
    const server = await createServer("Server Remove Thread", "server-remove-thread", owner.id);
    await addMember(server.id, member.id);
    const privateChannel = await createChannel(server.id, "server-remove-thread-parent", "invite-only parent", "private");
    await addHuman(privateChannel.id, owner.id);
    await addHuman(privateChannel.id, member.id);
    const parentMessage = await createMessage(privateChannel.id, "user", owner.id, "private parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    await db.insert(threadFollows).values({
      threadChannelId: thread.id,
      followerType: "user",
      followerId: member.id,
      parentMessageId: parentMessage.id,
      reason: "manual",
    });

    await removeMember(server.id, member.id);

    const rows = await db
      .select()
      .from(threadFollows)
      .where(and(eq(threadFollows.threadChannelId, thread.id), eq(threadFollows.followerId, member.id)));
    assert.equal(rows.length, 0, "server removal should prune private thread follows for that user");
  } finally {
    await app.close();
  }
});

test("GET /api/channels/inbox records inbox phases and query shape", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "8".repeat(32),
      spanIdGenerator: (() => {
        let next = 1;
        return () => String(next++).padStart(16, "0");
      })(),
    });
    app.app.set("serverTracer", tracer);

    const f = await seedThreadFixture(app.baseUrl);
    const dm = await findOrCreateUserDM(f.serverId, f.ownerId, f.memberBId);
    assert.ok(dm);
    await createMessage(f.parentChannelId, "user", f.memberBId, "inbox channel latest");
    await createMessage(f.threadId, "user", f.followerId, "inbox thread latest");
    await createMessage(dm.id, "user", f.memberBId, "inbox dm latest");

    sink.clear();
    const res = await fetch(`${app.baseUrl}/api/channels/inbox?filter=all&limit=10`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as {
      items: Array<{ kind: "channel" | "dm" | "thread" }>;
      totalCount: number;
      totalUnreadCount: number;
      hasMore: boolean;
    };
    assert.ok(body.items.some((item) => item.kind === "channel"));
    assert.ok(body.items.some((item) => item.kind === "dm"));
    assert.ok(body.items.some((item) => item.kind === "thread"));
    assert.equal(body.hasMore, false);

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/api/channels/inbox",
    );
    assert.ok(span, "expected GET /api/channels/inbox root span");

    const processEventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "db.query.finished");
    assert.deepEqual(processEventNames, [
      "inbox.load.started",
      "history.policy.checked",
      "inbox.backend.selected",
      "inbox.loaded",
      "response.ready",
      "http.response.finished",
    ]);

    const dbEvents = span.events.filter((event) => event.name === "db.query.finished");
    assert.deepEqual(dbEvents.map((event) => event.attrs?.query_name), ["channels.inbox_items_by_user"]);
    assert.equal(dbEvents.length, 1);
    assert.equal(dbEvents[0]?.attrs?.phase, "inbox.loaded");
    assert.equal(dbEvents[0]?.attrs?.filter, "all");
    assert.equal(dbEvents[0]?.attrs?.limit, 10);
    assert.equal(dbEvents[0]?.attrs?.history_cutoff_present, false);
    assert.equal(dbEvents[0]?.attrs?.row_count, body.items.length);
    assert.equal(dbEvents[0]?.attrs?.["inbox.backend"], "pg_legacy");
    assert.equal(dbEvents[0]?.attrs?.["inbox.route"], "all");
    assert.equal(dbEvents[0]?.attrs?.["inbox.fallback_reason"], "pglite_dev");
    assert.equal(dbEvents[0]?.attrs?.["inbox.contract_version"], 1);

    const backendEvent = span.events.find((event) => event.name === "inbox.backend.selected");
    assert.ok(backendEvent);
    assert.equal(backendEvent.attrs?.["inbox.backend"], "pg_legacy");
    assert.equal(backendEvent.attrs?.["inbox.route"], "all");
    assert.equal(backendEvent.attrs?.["inbox.fallback_reason"], "pglite_dev");
    assert.equal(backendEvent.attrs?.["inbox.contract_version"], 1);

    const loadedEvent = span.events.find((event) => event.name === "inbox.loaded");
    assert.ok(loadedEvent);
    assert.equal(loadedEvent.attrs?.filter, "all");
    assert.equal(loadedEvent.attrs?.inbox_items_count, body.items.length);
    assert.equal(loadedEvent.attrs?.total_count, body.totalCount);
    assert.equal(loadedEvent.attrs?.total_unread_count, body.totalUnreadCount);
    assert.equal(loadedEvent.attrs?.channel_items_count, body.items.filter((item) => item.kind === "channel").length);
    assert.equal(loadedEvent.attrs?.dm_items_count, body.items.filter((item) => item.kind === "dm").length);
    assert.equal(loadedEvent.attrs?.thread_items_count, body.items.filter((item) => item.kind === "thread").length);

    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.ok(readyEvent);
    assert.equal(readyEvent.attrs?.inbox_items_count, body.items.length);
    assert.equal(Object.values(span.attrs ?? {}).includes(f.ownerId), false);
    assert.equal(Object.values(readyEvent.attrs ?? {}).includes(dm.id), false);
  } finally {
    await app.close();
  }
});

test("GET /channels/inbox mixes channels and followed threads with unread as a filter", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);

    const channelLatestMessage = await createMessage(f.parentChannelId, "user", f.memberBId, "channel latest message");
    const threadReplyMessage = await createMessage(f.threadId, "user", f.followerId, "thread reply message");
    const emptyChannel = await createChannel(f.serverId, "empty-inbox-room");
    await addHuman(emptyChannel.id, f.ownerId);
    const systemOnlyChannel = await createChannel(f.serverId, "system-inbox-room");
    await addHuman(systemOnlyChannel.id, f.ownerId);
    await createMessage(systemOnlyChannel.id, "user", "system", "system-only inbox activity", "system");

    // Insert a mention on the latest channel message so we can exercise the
    // mentions filter (source-of-truth = message_mentions table; the inbox
    // filter only looks at this table, never re-scans bodies).
    await getDb().insert(messageMentions).values({
      messageId: channelLatestMessage.id,
      messageSeq: channelLatestMessage.seq,
      serverId: f.serverId,
      channelId: f.parentChannelId,
      targetType: "user",
      targetId: f.ownerId,
      handleAtSendTime: "Owner",
    });

    async function getInbox(filter: "all" | "unread" | "mentions" = "all", limit?: number) {
      const url = new URL(`${app.baseUrl}/api/channels/inbox`);
      url.searchParams.set("filter", filter);
      if (limit != null) url.searchParams.set("limit", String(limit));
      const res = await fetch(url, {
        headers: headers(f.ownerToken, f.serverId),
      });
      assert.equal(res.status, 200);
      return await res.json() as {
        items: Array<
          | { kind: "channel"; channelId: string; lastMessageId: string; firstUnreadMessageId: string | null; unreadCount: number; hasMention: boolean }
          | { kind: "thread"; threadChannelId: string; latestActivityMessageId: string; firstUnreadMessageId: string | null; unreadCount: number; hasMention: boolean }
        >;
        totalCount: number;
        totalUnreadCount: number;
      };
    }
    async function getUnreadCounts() {
      const res = await fetch(`${app.baseUrl}/api/channels/unread`, {
        headers: headers(f.ownerToken, f.serverId),
      });
      assert.equal(res.status, 200);
      return await res.json() as Record<string, number>;
    }

    const initial = await getInbox();
    const limitedInitial = await getInbox("all", 1);
    assert.equal(limitedInitial.items.length, 1);
    assert.equal(limitedInitial.totalCount, initial.totalCount, "Inbox total count should not depend on the loaded page size");
    assert.equal(limitedInitial.totalUnreadCount, initial.totalUnreadCount, "Inbox unread total should not depend on the loaded page size");
    assert.equal(initial.totalCount, initial.items.length, "unpaginated fixture should report exact active Inbox row count");
    assert.equal(initial.totalUnreadCount, initial.items.reduce((sum, item) => sum + item.unreadCount, 0));
    assert.ok(
      initial.items.some((item) => item.kind === "channel" && item.channelId === f.parentChannelId),
      "joined regular channel should be an Inbox item",
    );
    const parentInboxItem = initial.items.find((item) => item.kind === "channel" && item.channelId === f.parentChannelId);
    assert.ok(parentInboxItem?.kind === "channel");
    assert.equal(parentInboxItem.lastMessageId, channelLatestMessage.id, "channel Inbox item should carry the latest message id for permalink navigation");
    assert.equal(parentInboxItem.firstUnreadMessageId, f.parentMessageId, "channel Inbox item should carry the earliest unread message id as the click target");
    assert.ok(
      !initial.items.some((item) => item.kind === "channel" && item.channelId === emptyChannel.id),
      "joined regular channel with no messages should not be an Inbox item",
    );
    assert.ok(
      initial.items.some((item) => item.kind === "channel" && item.channelId === systemOnlyChannel.id),
      "system messages count as channel activity for Inbox eligibility",
    );
    assert.ok(
      initial.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId),
      "followed non-done thread should be an Inbox item",
    );
    const threadInboxItem = initial.items.find((item) => item.kind === "thread" && item.threadChannelId === f.threadId);
    assert.ok(threadInboxItem?.kind === "thread");
    assert.equal(threadInboxItem.latestActivityMessageId, threadReplyMessage.id, "thread Inbox item should carry the latest reply id for permalink navigation");
    assert.equal(threadInboxItem.firstUnreadMessageId, threadReplyMessage.id, "thread Inbox item should carry the earliest unread reply id as the click target");
    const followerRes = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(f.followerToken, f.serverId),
    });
    assert.equal(followerRes.status, 200);
    const followerBody = await followerRes.json() as { items: Array<{ kind: string; threadChannelId?: string }> };
    assert.ok(
      followerBody.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId),
      "existing thread participant should see the followed thread in Inbox",
    );
    const memberBRes = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(f.memberBToken, f.serverId),
    });
    assert.equal(memberBRes.status, 200);
    const memberBBody = await memberBRes.json() as { items: Array<{ kind: string; threadChannelId?: string }> };
    assert.ok(
      !memberBBody.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId),
      "parent channel membership without thread participation must not surface the thread in Inbox",
    );

    const unread = await getInbox("unread");
    assert.ok(unread.items.length > 0, "unread filter should be separate from active Inbox state");
    assert.ok(unread.items.every((item) => item.unreadCount > 0));

    // Plan A semantics: mentions filter = "every channel/thread where I've
    // been @mentioned, read or unread". Aggregation stays per channel/thread.
    const mentionsBeforeRead = await getInbox("mentions");
    assert.ok(
      mentionsBeforeRead.items.some((item) => item.kind === "channel" && item.channelId === f.parentChannelId),
      "mentions filter should include the channel that contains an @mention of the user",
    );
    assert.ok(
      !mentionsBeforeRead.items.some((item) => item.kind === "channel" && item.channelId === systemOnlyChannel.id),
      "mentions filter should exclude channels with no @mention",
    );
    assert.equal(mentionsBeforeRead.totalCount, mentionsBeforeRead.items.length, "mentions total should count filtered rows");

    // Read the mentioning channel — Plan A: row stays in mentions filter.
    const readRes = await fetch(`${app.baseUrl}/api/channels/${f.parentChannelId}/read-all`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(readRes.status, 200);

    const mentionsAfterRead = await getInbox("mentions");
    assert.ok(
      mentionsAfterRead.items.some((item) => item.kind === "channel" && item.channelId === f.parentChannelId),
      "Plan A: a row stays in the mentions filter even after the @mention is read",
    );

    const doneRes = await fetch(`${app.baseUrl}/api/channels/inbox/done`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
      body: JSON.stringify({ channelId: f.parentChannelId }),
    });
    assert.equal(doneRes.status, 200);

    const afterDone = await getInbox();
    assert.ok(
      !afterDone.items.some((item) => item.kind === "channel" && item.channelId === f.parentChannelId),
      "done channel should be hidden from Inbox",
    );
    assert.ok(
      afterDone.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId),
      "marking a channel done must not hide a followed thread item",
    );
    const afterChannelDoneUnread = await getUnreadCounts();
    assert.equal(afterChannelDoneUnread[f.parentChannelId], undefined, "marking a channel done should also mark it read");

    const threadDoneRes = await fetch(`${app.baseUrl}/api/channels/threads/done`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
      body: JSON.stringify({ threadChannelId: f.threadId }),
    });
    assert.equal(threadDoneRes.status, 200);
    const afterThreadDoneUnread = await getUnreadCounts();
    assert.equal(afterThreadDoneUnread[f.threadId], undefined, "marking a thread done should also mark it read");

    await createMessage(f.parentChannelId, "user", f.memberBId, "new activity reopens channel");
    const afterNewActivity = await getInbox();
    assert.ok(
      afterNewActivity.items.some((item) => item.kind === "channel" && item.channelId === f.parentChannelId),
      "new channel activity should clear the channel done marker",
    );
  } finally {
    await app.close();
  }
});

test("GET /channels/inbox excludes top-level joint channel activity", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);
    const db = getDb();

    const canonical = await createChannel(f.serverId, "joint-storage-inbox-activity", undefined, "joint");
    const projection = await createChannel(f.serverId, "joint-inbox-activity", undefined, "joint");
    await addHuman(projection.id, f.ownerId);
    await addHuman(projection.id, f.memberBId);
    const [joint] = await db.insert(jointChannels).values({
      canonicalChannelId: canonical.id,
      createdByServerId: f.serverId,
      createdByUserId: f.ownerId,
    }).returning();
    await db.insert(jointChannelServers).values({
      jointChannelId: joint.id,
      serverId: f.serverId,
      localChannelId: projection.id,
      role: "host",
      joinedByUserId: f.ownerId,
    });
    const latest = await createMessage(canonical.id, "user", f.memberBId, "joint inbox latest message");

    const inboxRes = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(inboxRes.status, 200);
    const inboxBody = await inboxRes.json() as {
      items: Array<{ kind: string; channelId?: string; channelType?: string; lastMessageId?: string; firstUnreadMessageId?: string | null; unreadCount?: number }>;
    };
    const jointItem = inboxBody.items.find((item) => item.kind === "channel" && item.channelId === projection.id);
    assert.equal(jointItem, undefined, "top-level joint channel messages should not appear in Activity/Inbox yet");

    const unreadUrl = new URL(`${app.baseUrl}/api/channels/inbox`);
    unreadUrl.searchParams.set("filter", "unread");
    const unreadRes = await fetch(unreadUrl, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(unreadRes.status, 200);
    const unreadBody = await unreadRes.json() as {
      items: Array<{ kind: string; channelId?: string; unreadCount?: number }>;
    };
    assert.equal(
      unreadBody.items.some((item) => item.kind === "channel" && item.channelId === projection.id),
      false,
      "unread Activity filter should also exclude top-level joint channel messages",
    );

    const readRes = await fetch(`${app.baseUrl}/api/channels/${projection.id}/read-all`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(readRes.status, 200);
    const readBody = await readRes.json() as { seq: number };
    assert.equal(readBody.seq, latest.seq, "mark-read for a joint projection should advance to canonical storage seq");

    const afterReadRes = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(afterReadRes.status, 200);
    const afterReadBody = await afterReadRes.json() as {
      items: Array<{ kind: string; channelId?: string; firstUnreadMessageId?: string | null; unreadCount?: number }>;
    };
    const afterReadJointItem = afterReadBody.items.find((item) => item.kind === "channel" && item.channelId === projection.id);
    assert.equal(afterReadJointItem, undefined, "read top-level joint projection should stay out of Activity/Inbox");
  } finally {
    await app.close();
  }
});

test("POST /channels/inbox/read-all marks every active Inbox row read", async () => {
  const app = await startTestApp("pglite://");
  try {
    const f = await seedThreadFixture(app.baseUrl);

    await createMessage(f.parentChannelId, "user", f.memberBId, "channel unread for mark all");
    await createMessage(f.threadId, "user", f.followerId, "thread unread for mark all");
    const db = getDb();
    const canonical = await createChannel(f.serverId, "joint-storage-mark-all-hidden", undefined, "joint");
    const projection = await createChannel(f.serverId, "joint-mark-all-hidden", undefined, "joint");
    await addHuman(projection.id, f.ownerId);
    const [joint] = await db.insert(jointChannels).values({
      canonicalChannelId: canonical.id,
      createdByServerId: f.serverId,
      createdByUserId: f.ownerId,
    }).returning();
    await db.insert(jointChannelServers).values({
      jointChannelId: joint.id,
      serverId: f.serverId,
      localChannelId: projection.id,
      role: "host",
      joinedByUserId: f.ownerId,
    });
    await createMessage(canonical.id, "user", f.memberBId, "hidden joint unread for mark all");

    const beforeUnread = await fetch(`${app.baseUrl}/api/channels/inbox?filter=unread`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(beforeUnread.status, 200);
    const beforeBody = await beforeUnread.json() as {
      items: Array<
        | { kind: "channel"; channelId: string; unreadCount: number }
        | { kind: "thread"; threadChannelId: string; unreadCount: number }
      >;
      totalUnreadCount: number;
    };
    assert.ok(
      beforeBody.items.some((item) => item.kind === "channel" && item.channelId === f.parentChannelId && item.unreadCount > 0),
      "channel row should start unread",
    );
    assert.ok(
      beforeBody.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId && item.unreadCount > 0),
      "thread row should start unread",
    );
    assert.equal(
      beforeBody.items.some((item) => item.kind === "channel" && item.channelId === projection.id),
      false,
      "hidden top-level joint channel should not be an Inbox row",
    );
    assert.ok(beforeBody.totalUnreadCount > 0);

    const readAll = await fetch(`${app.baseUrl}/api/channels/inbox/read-all`, {
      method: "POST",
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(readAll.status, 200);
    const readAllBody = await readAll.json() as { markedCount: number };
    assert.ok(readAllBody.markedCount >= 2, "should update channel and thread read cursors");

    const afterUnread = await fetch(`${app.baseUrl}/api/channels/inbox?filter=unread`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(afterUnread.status, 200);
    const afterUnreadBody = await afterUnread.json() as { items: unknown[]; totalUnreadCount: number };
    assert.deepEqual(afterUnreadBody.items, []);
    assert.equal(afterUnreadBody.totalUnreadCount, 0);

    const afterAll = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(afterAll.status, 200);
    const afterAllBody = await afterAll.json() as {
      items: Array<
        | { kind: "channel"; channelId: string; unreadCount: number }
        | { kind: "thread"; threadChannelId: string; unreadCount: number }
      >;
    };
    assert.ok(
      afterAllBody.items.some((item) => item.kind === "channel" && item.channelId === f.parentChannelId && item.unreadCount === 0),
      "mark all read should not mark channel done",
    );
    assert.ok(
      afterAllBody.items.some((item) => item.kind === "thread" && item.threadChannelId === f.threadId && item.unreadCount === 0),
      "mark all read should not mark thread done",
    );
    const jointCursorRows = await db
      .select({ lastReadSeq: userChannelReadCursors.lastReadSeq })
      .from(userChannelReadCursors)
      .where(and(
        eq(userChannelReadCursors.userId, f.ownerId),
        eq(userChannelReadCursors.channelId, projection.id),
      ));
    assert.equal(jointCursorRows.length, 0, "Activity mark-all must not advance hidden top-level joint channel cursors");
    const unreadCounts = await fetch(`${app.baseUrl}/api/channels/unread`, {
      headers: headers(f.ownerToken, f.serverId),
    });
    assert.equal(unreadCounts.status, 200);
    const unreadCountsBody = await unreadCounts.json() as Record<string, number>;
    assert.ok(
      (unreadCountsBody[projection.id] ?? 0) > 0,
      "/channels/unread should keep reporting hidden top-level joint channel unread after Activity mark-all",
    );
  } finally {
    await app.close();
  }
});

test("joint channel resolver requires an active local projection in the caller server", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const hostOwner = await seedUser("joint-host-owner@slock.test", "joint-host-owner");
    const guestOwner = await seedUser("joint-guest-owner@slock.test", "joint-guest-owner");
    const hostServer = await createServer("Joint Host", "joint-host", hostOwner.id);
    const guestServer = await createServer("Joint Guest", "joint-guest", guestOwner.id);

    const hostProjection = await createChannel(hostServer.id, "partner-room", undefined, "joint");
    const guestProjection = await createChannel(guestServer.id, "partner-room", undefined, "joint");
    await addHuman(hostProjection.id, hostOwner.id);
    await addHuman(guestProjection.id, guestOwner.id);

    const [joint] = await db.insert(jointChannels).values({
      canonicalChannelId: hostProjection.id,
      createdByServerId: hostServer.id,
      createdByUserId: hostOwner.id,
    }).returning();
    await db.insert(jointChannelServers).values([
      {
        jointChannelId: joint.id,
        serverId: hostServer.id,
        localChannelId: hostProjection.id,
        role: "host",
        joinedByUserId: hostOwner.id,
      },
      {
        jointChannelId: joint.id,
        serverId: guestServer.id,
        localChannelId: guestProjection.id,
        role: "participant",
        joinedByUserId: guestOwner.id,
      },
    ]);

    const hostResolved = await resolveChannelAccess({ serverId: hostServer.id, channelId: hostProjection.id });
    assert.equal(hostResolved?.kind, "joint");
    assert.equal(hostResolved?.canonicalChannelId, hostProjection.id);
    assert.equal(hostResolved?.role, "host");

    const guestResolved = await resolveChannelAccess({ serverId: guestServer.id, channelId: guestProjection.id });
    assert.equal(guestResolved?.kind, "joint");
    assert.equal(guestResolved?.canonicalChannelId, hostProjection.id);
    assert.equal(guestResolved?.role, "participant");

    assert.equal(
      await resolveChannelAccess({ serverId: hostServer.id, channelId: guestProjection.id }),
      null,
      "a projection id from another server must not grant access",
    );

    await db.update(jointChannelServers)
      .set({ status: "disconnected" })
      .where(and(eq(jointChannelServers.jointChannelId, joint.id), eq(jointChannelServers.serverId, guestServer.id)));
    assert.equal(
      await resolveChannelAccess({ serverId: guestServer.id, channelId: guestProjection.id }),
      null,
      "a disconnected projection must not resolve",
    );
  } finally {
    await app.close();
  }
});

test("joint channels are listed and fetched only for explicit members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("joint-list-owner@slock.test", "joint-list-owner");
    const joined = await seedUser("joint-list-joined@slock.test", "joint-list-joined");
    const nonMember = await seedUser("joint-list-nonmember@slock.test", "joint-list-nonmember");
    const server = await createServer("Joint List", "joint-list", owner.id);
    await addMember(server.id, joined.id);
    await addMember(server.id, nonMember.id);
    const jointProjection = await createChannel(server.id, "shared-room", undefined, "joint");
    await addHuman(jointProjection.id, owner.id);
    await addHuman(jointProjection.id, joined.id);
    await createMessage(jointProjection.id, "user", owner.id, "joint secret");
    const [joint] = await db.insert(jointChannels).values({
      canonicalChannelId: jointProjection.id,
      createdByServerId: server.id,
      createdByUserId: owner.id,
    }).returning();
    await db.insert(jointChannelServers).values({
      jointChannelId: joint.id,
      serverId: server.id,
      localChannelId: jointProjection.id,
      role: "host",
      joinedByUserId: owner.id,
    });

    const joinedToken = await login(app.baseUrl, joined.email);
    const nonMemberToken = await login(app.baseUrl, nonMember.email);

    const joinedList = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(joinedToken, server.id),
    });
    assert.equal(joinedList.status, 200);
    const joinedBody = await joinedList.json() as Array<{ id: string; type: string; joined?: boolean }>;
    assert.ok(
      joinedBody.some((channel) => channel.id === jointProjection.id && channel.type === "joint" && channel.joined === true),
      "joined members should see the joint channel projection",
    );

    const nonMemberList = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(nonMemberToken, server.id),
    });
    assert.equal(nonMemberList.status, 200);
    const nonMemberBody = await nonMemberList.json() as Array<{ id: string }>;
    assert.ok(!nonMemberBody.some((channel) => channel.id === jointProjection.id), "non-members should not see joint channels");

    const joinedDetail = await fetch(`${app.baseUrl}/api/channels/${jointProjection.id}`, {
      headers: headers(joinedToken, server.id),
    });
    assert.equal(joinedDetail.status, 200);
    const detailBody = await joinedDetail.json() as { id: string; type: string; joined?: boolean };
    assert.equal(detailBody.id, jointProjection.id);
    assert.equal(detailBody.type, "joint");
    assert.equal(detailBody.joined, true);

    const nonMemberDetail = await fetch(`${app.baseUrl}/api/channels/${jointProjection.id}`, {
      headers: headers(nonMemberToken, server.id),
    });
    assert.equal(nonMemberDetail.status, 404);

    const nonMemberRead = await fetch(`${app.baseUrl}/api/channels/${jointProjection.id}/read`, {
      method: "POST",
      headers: headers(nonMemberToken, server.id),
      body: JSON.stringify({ seq: 1 }),
    });
    assert.equal(nonMemberRead.status, 404, "non-members must not mark known joint channels read");

    const nonMemberReadAll = await fetch(`${app.baseUrl}/api/channels/${jointProjection.id}/read-all`, {
      method: "POST",
      headers: headers(nonMemberToken, server.id),
    });
    assert.equal(nonMemberReadAll.status, 404, "non-members must not learn latest seq via joint read-all");

    const [nonMemberCursor] = await db
      .select()
      .from(userChannelReadCursors)
      .where(and(
        eq(userChannelReadCursors.userId, nonMember.id),
        eq(userChannelReadCursors.channelId, jointProjection.id),
      ));
    assert.equal(nonMemberCursor, undefined, "non-member read attempts must not create read cursor side effects");
  } finally {
    await app.close();
  }
});

test("joint channel create uses directed person invites and target invitee accept creates a local projection", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const hostOwner = await seedUser("joint-create-host@slock.test", "joint-create-host");
    const targetOwner = await seedUser("joint-create-target-owner@slock.test", "joint-create-target-owner");
    const targetAdmin = await seedUser("joint-create-target-admin@slock.test", "joint-create-target-admin");
    const targetSecondAdmin = await seedUser("joint-create-target-second-admin@slock.test", "joint-create-target-second-admin");
    const targetMember = await seedUser("joint-create-target-member@slock.test", "joint-create-target-member");
    const hostServer = await createServer("Joint Create Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Create Target", "joint-create-target", targetOwner.id);
    await addMember(targetServer.id, targetAdmin.id, "admin");
    await addMember(targetServer.id, targetSecondAdmin.id, "admin");
    await addMember(targetServer.id, targetMember.id);

    const hostToken = await login(app.baseUrl, hostOwner.email);
    const targetOwnerToken = await login(app.baseUrl, targetOwner.email);
    const targetSecondAdminToken = await login(app.baseUrl, targetSecondAdmin.email);
    const targetMemberToken = await login(app.baseUrl, targetMember.email);

    const emailLogs: string[] = [];
    const originalConsoleLog = console.log;
    console.log = (...args: unknown[]) => {
      emailLogs.push(args.map(String).join(" "));
    };
    let createRes: Response;
    try {
      createRes = await fetch(`${app.baseUrl}/api/channels`, {
        method: "POST",
        headers: headers(hostToken, hostServer.id),
        body: JSON.stringify({
          name: "partner-room",
          description: "shared partner work",
          visibility: "joint",
          targetServerSlug: targetServer.slug,
          invitedPeople: [targetOwner.email, `@${targetSecondAdmin.name}`],
        }),
      });
    } finally {
      console.log = originalConsoleLog;
    }
    assert.equal(createRes.status, 200);
    assert.ok(emailLogs.some((log) => log.includes(`To: ${targetOwner.email}`)), "directly invited target user should receive the joint-channel invite email");
    assert.ok(emailLogs.some((log) => log.includes(`To: ${targetSecondAdmin.email}`)), "second directly invited admin should receive the joint-channel invite email");
    assert.ok(!emailLogs.some((log) => log.includes(`To: ${targetAdmin.email}`)), "uninvited target admins should not receive a person-scoped invite email");
    assert.ok(!emailLogs.some((log) => log.includes(`To: ${targetMember.email}`)), "uninvited target members should not receive a person-scoped invite email");
    const hostProjection = await createRes.json() as {
      id: string;
      type: string;
      joined: boolean;
      jointPeerServerSlug?: string;
      jointPeerStatus?: string;
      jointInvite?: { id: string; toServerId: string };
      jointInvites?: Array<{ id: string; toServerId: string; invitedUserId: string }>;
    };
    assert.equal(hostProjection.type, "joint");
    assert.equal(hostProjection.joined, true);
    assert.equal(hostProjection.jointPeerServerSlug, targetServer.slug);
    assert.equal(hostProjection.jointPeerStatus, "pending");
    assert.equal(hostProjection.jointInvite?.toServerId, targetServer.id);
    assert.deepEqual(hostProjection.jointInvites?.map((invite) => invite.invitedUserId), [targetOwner.id, targetSecondAdmin.id]);
    const secondInvite = hostProjection.jointInvites?.find((invite) => invite.invitedUserId === targetSecondAdmin.id);
    assert.ok(secondInvite, "second invited admin should get a separate pending invite");

    const [hostProjectionRow] = await db.select().from(jointChannelServers).where(eq(jointChannelServers.localChannelId, hostProjection.id));
    assert.ok(hostProjectionRow, "host projection should be registered separately from canonical storage");
    const [joint] = await db.select().from(jointChannels).where(eq(jointChannels.id, hostProjectionRow.jointChannelId));
    assert.ok(joint, "joint channel authority row should be created");
    assert.notEqual(joint.canonicalChannelId, hostProjection.id, "canonical storage must not be the host-side local projection");
    const hostResolved = await resolveChannelAccess({ serverId: hostServer.id, channelId: hostProjection.id });
    assert.equal(hostResolved?.kind, "joint");
    assert.equal(hostResolved?.canonicalChannelId, joint.canonicalChannelId);
    const canonicalResolved = await resolveChannelAccess({ serverId: hostServer.id, channelId: joint.canonicalChannelId });
    assert.equal(canonicalResolved, null, "canonical storage channel must not be directly routable");
    const canonicalFetch = await fetch(`${app.baseUrl}/api/channels/${joint.canonicalChannelId}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(canonicalFetch.status, 404, "canonical storage channel must not be fetchable as a local channel");
    const [inviteRow] = await db.select().from(jointChannelInvites).where(eq(jointChannelInvites.id, hostProjection.jointInvite!.id));
    assert.equal(inviteRow.status, "pending");
    assert.equal(inviteRow.fromServerId, hostServer.id);
    assert.equal(inviteRow.toServerId, targetServer.id);
    assert.equal(inviteRow.invitedUserId, targetOwner.id);

    const targetMemberInvites = await fetch(`${app.baseUrl}/api/channels/joint-invites`, {
      headers: headers(targetMemberToken, targetServer.id),
    });
    assert.equal(targetMemberInvites.status, 200);
    const targetMemberInvitesBody = await targetMemberInvites.json() as { invites: unknown[] };
    assert.deepEqual(targetMemberInvitesBody.invites, [], "uninvited target members should not see someone else's joint-channel invite");

    const targetInvites = await fetch(`${app.baseUrl}/api/channels/joint-invites`, {
      headers: headers(targetOwnerToken, targetServer.id),
    });
    assert.equal(targetInvites.status, 200);
    const targetInvitesBody = await targetInvites.json() as { invites: Array<{ id: string; fromServerSlug: string; channelName: string }> };
    assert.deepEqual(targetInvitesBody.invites.map((invite) => invite.id), [hostProjection.jointInvite!.id]);
    assert.equal(targetInvitesBody.invites[0].fromServerSlug, hostServer.slug);
    assert.equal(targetInvitesBody.invites[0].channelName, "partner-room");

    const targetAdminToken = await login(app.baseUrl, targetAdmin.email);
    const targetAdminInvites = await fetch(`${app.baseUrl}/api/channels/joint-invites`, {
      headers: headers(targetAdminToken, targetServer.id),
    });
    assert.equal(targetAdminInvites.status, 200);
    const targetAdminInvitesBody = await targetAdminInvites.json() as { invites: unknown[] };
    assert.deepEqual(targetAdminInvitesBody.invites, [], "target admins do not see directed invites unless they are explicitly invited");
    const targetAdminAccept = await fetch(`${app.baseUrl}/api/channels/joint-invites/${hostProjection.jointInvite!.id}/accept`, {
      method: "POST",
      headers: headers(targetAdminToken, targetServer.id),
    });
    assert.equal(targetAdminAccept.status, 404, "uninvited target admins cannot accept someone else's joint-channel invite");

    const events = installFakeIo(app.app);
    const acceptRes = await fetch(`${app.baseUrl}/api/channels/joint-invites/${hostProjection.jointInvite!.id}/accept`, {
      method: "POST",
      headers: headers(targetOwnerToken, targetServer.id),
    });
    assert.equal(acceptRes.status, 200);
    const targetProjection = await acceptRes.json() as {
      id: string;
      type: string;
      joined: boolean;
      name: string;
      description: string | null;
      jointPeerServerSlug?: string;
      jointPeerStatus?: string;
    };
    assert.equal(targetProjection.type, "joint");
    assert.equal(targetProjection.name, "partner-room");
    assert.equal(targetProjection.description, "shared partner work");
    assert.equal(targetProjection.joined, true);
    assert.equal(targetProjection.jointPeerServerSlug, hostServer.slug);
    assert.equal(targetProjection.jointPeerStatus, "active");
    assert.notEqual(targetProjection.id, hostProjection.id);
    assert.ok(
      !events.some((event) => event.room === `server:${targetServer.id}` && typeof event.payload === "object" && event.payload !== null && "channel" in event.payload),
      "accepting a joint invite must not broadcast full joint channel metadata to every target-server member",
    );
    assert.ok(
      events.some((event) => event.room === `user:${targetOwner.id}` && event.event === "channel:updated"),
      "accepting invitee should receive the new joint channel metadata directly",
    );

    const secondAcceptRes = await fetch(`${app.baseUrl}/api/channels/joint-invites/${secondInvite.id}/accept`, {
      method: "POST",
      headers: headers(targetSecondAdminToken, targetServer.id),
    });
    assert.equal(secondAcceptRes.status, 200);
    const secondAcceptBody = await secondAcceptRes.json() as { id: string; joined?: boolean };
    assert.equal(secondAcceptBody.id, targetProjection.id, "second invitee should join the existing target projection");
    assert.equal(secondAcceptBody.joined, true);
    const secondAdminList = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(targetSecondAdminToken, targetServer.id),
    });
    assert.equal(secondAdminList.status, 200);
    const secondAdminListBody = await secondAdminList.json() as Array<{ id: string; joined?: boolean }>;
    assert.ok(
      secondAdminListBody.some((channel) => channel.id === targetProjection.id && channel.joined),
      "second invitee must get real channel membership when accepting an existing projection",
    );

    const acceptedInvite = await db.select().from(jointChannelInvites).where(eq(jointChannelInvites.id, hostProjection.jointInvite!.id));
    assert.equal(acceptedInvite[0]?.status, "accepted");
    const targetResolved = await resolveChannelAccess({ serverId: targetServer.id, channelId: targetProjection.id });
    assert.equal(targetResolved?.kind, "joint");
    assert.equal(targetResolved?.canonicalChannelId, joint.canonicalChannelId);
    assert.equal(targetResolved?.role, "participant");

    const targetMemberList = await fetch(`${app.baseUrl}/api/channels`, {
      headers: headers(targetMemberToken, targetServer.id),
    });
    assert.equal(targetMemberList.status, 200);
    const targetMemberListBody = await targetMemberList.json() as Array<{ id: string }>;
    assert.ok(!targetMemberListBody.some((channel) => channel.id === targetProjection.id), "accepting a server invite does not auto-add all target server members");
    const targetMemberJoin = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/join`, {
      method: "POST",
      headers: headers(targetMemberToken, targetServer.id),
    });
    assert.equal(targetMemberJoin.status, 403, "ordinary target server members cannot self-join a joint channel by id");

    const targetAgent = await createAgent(targetServer.id, "joint-target-agent", {
      runtime: "codex",
      creatorType: "user",
      creatorId: targetOwner.id,
    });
    const hostJointAgent = await createAgent(hostServer.id, "joint-host-agent", { runtime: "codex" });
    const hostWideAgent = await createAgent(hostServer.id, "joint-host-wide-agent", { runtime: "codex" });
    await addAgent(targetProjection.id, targetAgent.id);
    await addAgent(hostProjection.id, hostJointAgent.id);

    const hostMembers = await fetch(`${app.baseUrl}/api/channels/${hostProjection.id}/members`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(hostMembers.status, 200);
    const hostMembersBody = await hostMembers.json() as {
      agents: Array<{ id: string; serverId?: string; serverName?: string; serverSlug?: string; name: string; status?: string }>;
      humans: Array<{ id: string; serverId?: string; serverName?: string; serverSlug?: string; name: string }>;
    };
    assert.deepEqual(
      hostMembersBody.humans.map((human) => human.id).sort(),
      [hostOwner.id, targetOwner.id, targetSecondAdmin.id].sort(),
      "host-side joint member list should aggregate human members from all active projections",
    );
    assert.deepEqual(
      hostMembersBody.agents.map((agent) => agent.id).sort(),
      [hostJointAgent.id, targetAgent.id].sort(),
      "host-side joint member list should aggregate agent members from all active projections",
    );
    assert.ok(!hostMembersBody.agents.some((agent) => agent.id === hostWideAgent.id), "host-side joint member list must exclude same-server agents outside the joint projection");
    assert.ok(
      hostMembersBody.humans.some((human) => (
        human.id === targetOwner.id
        && human.serverId === targetServer.id
        && human.serverName === targetServer.name
        && human.serverSlug === targetServer.slug
      )),
      "host-side joint member list should include the target admin with peer server metadata",
    );
    assert.ok(
      hostMembersBody.agents.some((agent) => (
        agent.id === targetAgent.id
        && agent.serverId === targetServer.id
        && agent.serverName === targetServer.name
        && agent.serverSlug === targetServer.slug
        && typeof agent.status === "string"
      )),
      "host-side joint member list should include agents added from the target server projection with profile/status metadata",
    );

    const targetMembers = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/members`, {
      headers: headers(targetOwnerToken, targetServer.id),
    });
    assert.equal(targetMembers.status, 200);
    const targetMembersBody = await targetMembers.json() as {
      agents: Array<{ id: string; serverId?: string; serverName?: string; serverSlug?: string; name: string; status?: string }>;
      humans: Array<{ id: string; serverId?: string; serverName?: string; serverSlug?: string; name: string }>;
    };
    assert.deepEqual(
      targetMembersBody.humans.map((human) => human.id).sort(),
      [hostOwner.id, targetOwner.id, targetSecondAdmin.id].sort(),
      "target-side joint member list should aggregate human members from all active projections",
    );
    assert.deepEqual(
      targetMembersBody.agents.map((agent) => agent.id).sort(),
      [hostJointAgent.id, targetAgent.id].sort(),
      "target-side joint member list should aggregate agent members from all active projections",
    );
    assert.ok(!targetMembersBody.humans.some((human) => human.id === targetMember.id), "target-side joint member list must exclude same-server humans outside the joint projection");
    assert.ok(
      targetMembersBody.agents.some((agent) => (
        agent.id === hostJointAgent.id
        && agent.serverId === hostServer.id
        && agent.serverName === hostServer.name
        && agent.serverSlug === hostServer.slug
        && typeof agent.status === "string"
      )),
      "target-side joint member list should include agents added from the host server projection with profile/status metadata",
    );

    const peerAgentProfile = await fetch(`${app.baseUrl}/api/agents/${targetAgent.id}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(peerAgentProfile.status, 200, "joint channel members can open peer-server agent profiles");
    const peerAgentProfileBody = await peerAgentProfile.json() as Record<string, unknown>;
    assert.equal(peerAgentProfileBody.id, targetAgent.id);
    assert.equal(peerAgentProfileBody.serverId, targetServer.id);
    assert.equal(peerAgentProfileBody.serverName, targetServer.name);
    assert.equal(peerAgentProfileBody.serverSlug, targetServer.slug);
    assert.equal(peerAgentProfileBody.name, "joint-target-agent");
    assert.equal(typeof peerAgentProfileBody.status, "string");
    assert.equal(peerAgentProfileBody.activityDetail, "", "remote joint profile must not expose private activity detail");
    assert.equal("machineId" in peerAgentProfileBody, false, "remote joint profile must not expose machine binding");
    assert.equal("runtimeProfile" in peerAgentProfileBody, false, "remote joint profile must not expose runtime profile");
    assert.equal("envVars" in peerAgentProfileBody, false, "remote joint profile must not expose env vars");
    assert.equal("createdAgents" in peerAgentProfileBody, false, "remote joint profile must not expose created-agent graph");
    assert.equal("model" in peerAgentProfileBody, false, "remote joint profile must not expose model config");
    assert.equal("runtime" in peerAgentProfileBody, false, "remote joint profile must not expose runtime config");

    const peerAgentScopes = await fetch(`${app.baseUrl}/api/agents/${targetAgent.id}/scopes`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(peerAgentScopes.status, 404, "joint visibility must not expose peer-server agent permissions");

    const peerAgentActivityLog = await fetch(`${app.baseUrl}/api/agents/${targetAgent.id}/activity-log`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(peerAgentActivityLog.status, 404, "joint visibility must not expose peer-server agent activity logs");

    const peerAgentWorkspace = await fetch(`${app.baseUrl}/api/agents/${targetAgent.id}/workspace-files`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(peerAgentWorkspace.status, 404, "joint visibility must not expose peer-server agent workspace");

    const peerAgentReminders = await fetch(`${app.baseUrl}/api/reminders?ownerAgentId=${targetAgent.id}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(peerAgentReminders.status, 404, "joint visibility must not expose peer-server agent reminders");

    const peerHumanProfile = await fetch(`${app.baseUrl}/api/servers/${hostServer.id}/members/${targetOwner.id}/profile`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(peerHumanProfile.status, 200, "joint channel members can open peer-server human profiles");
    const peerHumanProfileBody = await peerHumanProfile.json() as {
      serverId: string;
      serverName: string;
      serverSlug: string;
      email: string | null;
      joinedAt: string | null;
      gravatarHash: string;
      role: string | null;
      membershipStatus: string;
      createdAgents: unknown[];
    };
    assert.equal(peerHumanProfileBody.serverId, targetServer.id);
    assert.equal(peerHumanProfileBody.serverName, targetServer.name);
    assert.equal(peerHumanProfileBody.serverSlug, targetServer.slug);
    assert.equal(peerHumanProfileBody.email, null, "remote joint human profile must not expose peer-server email");
    assert.equal(peerHumanProfileBody.gravatarHash, "", "remote joint human profile must not expose email-derived gravatar hash");
    assert.equal(peerHumanProfileBody.role, null, "remote joint human profile must not expose peer-server role");
    assert.equal(peerHumanProfileBody.joinedAt, null, "remote joint human profile must not expose peer-server join date");
    assert.equal(peerHumanProfileBody.membershipStatus, "active", "remote joint human profile only reports active visibility on the shared channel");
    assert.deepEqual(peerHumanProfileBody.createdAgents, [], "remote joint human profile must not expose peer-server created-agent graph");

    const targetMessage = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(targetOwnerToken, targetServer.id),
      body: JSON.stringify({ channelId: targetProjection.id, content: "hello from target server @joint-target-agent @joint-host-wide-agent" }),
    });
    assert.equal(targetMessage.status, 200);
    const targetMessageBody = await targetMessage.json() as { id: string; channelId: string; content: string };
    assert.equal(targetMessageBody.channelId, targetProjection.id, "sender receives their local projection id");
    assert.ok(
      events.some((event) => event.event === "message:new" && event.room === `channel:${hostProjection.id}`),
      "joint message socket fanout should use the host local projection room",
    );
    assert.ok(
      events.some((event) => event.event === "message:new" && event.room === `channel:${targetProjection.id}`),
      "joint message socket fanout should use the target local projection room",
    );
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === `channel:${joint.canonicalChannelId}`),
      "joint message socket fanout must not expose the canonical storage room",
    );
    const mentionRows = await db.select().from(messageMentions).where(eq(messageMentions.messageId, targetMessageBody.id));
    assert.ok(
      mentionRows.some((row) => row.targetType === "agent" && row.targetId === targetAgent.id),
      "joint mentions should resolve active peer projection agents",
    );
    assert.ok(
      !mentionRows.some((row) => row.targetType === "agent" && row.targetId === hostWideAgent.id),
      "joint mentions must not resolve host server-wide agents outside the joint channel",
    );

    const hostMessages = await fetch(`${app.baseUrl}/api/messages/channel/${hostProjection.id}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(hostMessages.status, 200);
    const hostMessagesBody = await hostMessages.json() as { messages: Array<{ id: string; channelId: string; content: string; senderMembershipStatus: "active" | "removed" | null }> };
    assert.ok(
      hostMessagesBody.messages.some((message) => message.channelId === hostProjection.id && message.content === targetMessageBody.content),
      "host-side projection should read messages sent from the target-side projection",
    );
    const projectedTargetMessage = hostMessagesBody.messages.find((message) => message.id === targetMessageBody.id);
    assert.equal(
      projectedTargetMessage?.senderMembershipStatus,
      "active",
      "peer-server joint human senders must not be marked removed just because they are not members of the canonical host server",
    );
    const peerHumanProfileAfterMessage = await fetch(`${app.baseUrl}/api/servers/${hostServer.id}/members/${targetOwner.id}/profile`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(peerHumanProfileAfterMessage.status, 200);
    const peerHumanProfileAfterMessageBody = await peerHumanProfileAfterMessage.json() as {
      serverId: string;
      email: string | null;
      joinedAt: string | null;
      role: string | null;
      membershipStatus: string;
      createdAgents: unknown[];
    };
    assert.equal(peerHumanProfileAfterMessageBody.serverId, targetServer.id);
    assert.equal(peerHumanProfileAfterMessageBody.email, null, "remote joint human profile must stay identity-only after they have sent a shared message");
    assert.equal(peerHumanProfileAfterMessageBody.role, null, "remote joint human profile must not fall back to current-server removed-member details");
    assert.equal(peerHumanProfileAfterMessageBody.joinedAt, null);
    assert.equal(peerHumanProfileAfterMessageBody.membershipStatus, "active");
    assert.deepEqual(peerHumanProfileAfterMessageBody.createdAgents, []);

    const hostMessage = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({ channelId: hostProjection.id, content: "hello from host server" }),
    });
    assert.equal(hostMessage.status, 200);

    const targetMessages = await fetch(`${app.baseUrl}/api/messages/channel/${targetProjection.id}`, {
      headers: headers(targetOwnerToken, targetServer.id),
    });
    assert.equal(targetMessages.status, 200);
    const targetMessagesBody = await targetMessages.json() as { messages: Array<{ channelId: string; content: string }> };
    assert.ok(
      targetMessagesBody.messages.some((message) => message.channelId === targetProjection.id && message.content === "hello from host server"),
      "target-side projection should read messages sent from the host-side projection",
    );

    const renameRes = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}`, {
      method: "PATCH",
      headers: headers(targetOwnerToken, targetServer.id),
      body: JSON.stringify({ name: "renamed-partner-room", description: "shared updated description" }),
    });
    assert.equal(renameRes.status, 200);

    const hostAfterRename = await fetch(`${app.baseUrl}/api/channels/${hostProjection.id}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(hostAfterRename.status, 200);
    const hostAfterRenameBody = await hostAfterRename.json() as { name: string; description: string | null };
    assert.equal(hostAfterRenameBody.name, "renamed-partner-room");
    assert.equal(hostAfterRenameBody.description, "shared updated description");

    const rejectVisibility = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}`, {
      method: "PATCH",
      headers: headers(targetOwnerToken, targetServer.id),
      body: JSON.stringify({ visibility: "private" }),
    });
    assert.equal(rejectVisibility.status, 403, "joint channels cannot be converted to private/public visibility");

    const archiveRes = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/archive`, {
      method: "POST",
      headers: headers(targetOwnerToken, targetServer.id),
    });
    assert.equal(archiveRes.status, 200, "joint channel archive should be a shared operation");
    const hostArchived = await getChannel(hostProjection.id);
    const targetArchived = await getChannel(targetProjection.id);
    assert.ok(hostArchived?.archivedAt, "host projection should be archived when target side archives the joint channel");
    assert.ok(targetArchived?.archivedAt, "target projection should be archived when target side archives the joint channel");

    const unarchiveRes = await fetch(`${app.baseUrl}/api/channels/${hostProjection.id}/unarchive`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(unarchiveRes.status, 200, "joint channel unarchive should be a shared operation");
    const hostUnarchived = await getChannel(hostProjection.id);
    const targetUnarchived = await getChannel(targetProjection.id);
    assert.equal(hostUnarchived?.archivedAt, null, "host projection should be unarchived");
    assert.equal(targetUnarchived?.archivedAt, null, "target projection should be unarchived");

    const deleteJoint = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}`, {
      method: "DELETE",
      headers: headers(targetOwnerToken, targetServer.id),
    });
    assert.equal(deleteJoint.status, 400, "joint channels do not support ordinary delete");

    const disconnectRes = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/disconnect`, {
      method: "POST",
      headers: headers(targetOwnerToken, targetServer.id),
    });
    assert.equal(disconnectRes.status, 200, "target server admin can disconnect its local joint projection");
    assert.equal(
      await resolveChannelAccess({ serverId: targetServer.id, channelId: targetProjection.id }),
      null,
      "disconnected projection should no longer resolve",
    );
    const disconnectedTargetProjection = await getChannel(targetProjection.id);
    assert.equal(disconnectedTargetProjection, null, "disconnected projection should be removed from ordinary channel fetches");
    const hostStillResolved = await resolveChannelAccess({ serverId: hostServer.id, channelId: hostProjection.id });
    assert.equal(hostStillResolved?.kind, "joint", "disconnecting one server should not delete the other projection");
  } finally {
    await app.close();
  }
});

test("joint storage drain migration closes legacy host-display canonical rows only", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const hostOwner = await seedUser("joint-migration-host@slock.test", "joint-migration-host");
    const targetOwner = await seedUser("joint-migration-target@slock.test", "joint-migration-target");
    const hostServer = await createServer("Joint Migration Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Migration Target", "joint-migration-target", targetOwner.id);

    const legacyHostProjection = await createChannel(hostServer.id, "legacy-joint", undefined, "joint");
    const legacyTargetProjection = await createChannel(targetServer.id, "legacy-joint", undefined, "joint");
    await addHuman(legacyHostProjection.id, hostOwner.id);
    await addHuman(legacyTargetProjection.id, targetOwner.id);
    const [legacyJoint] = await db.insert(jointChannels).values({
      canonicalChannelId: legacyHostProjection.id,
      createdByServerId: hostServer.id,
      createdByUserId: hostOwner.id,
    }).returning();
    await db.insert(jointChannelServers).values([
      {
        jointChannelId: legacyJoint.id,
        serverId: hostServer.id,
        localChannelId: legacyHostProjection.id,
        role: "host",
        joinedByUserId: hostOwner.id,
      },
      {
        jointChannelId: legacyJoint.id,
        serverId: targetServer.id,
        localChannelId: legacyTargetProjection.id,
        role: "participant",
        joinedByUserId: targetOwner.id,
      },
    ]);

    const storageChannel = await createChannel(hostServer.id, "joint-storage-test", undefined, "joint");
    const newHostProjection = await createChannel(hostServer.id, "new-shape-joint", undefined, "joint");
    await addHuman(newHostProjection.id, hostOwner.id);
    const [newShapeJoint] = await db.insert(jointChannels).values({
      canonicalChannelId: storageChannel.id,
      createdByServerId: hostServer.id,
      createdByUserId: hostOwner.id,
    }).returning();
    await db.insert(jointChannelServers).values({
      jointChannelId: newShapeJoint.id,
      serverId: hostServer.id,
      localChannelId: newHostProjection.id,
      role: "host",
      joinedByUserId: hostOwner.id,
    });

    const migrationSql = readFileSync(new URL("../../drizzle/0093_joint_storage_drain.sql", import.meta.url), "utf8");
    await db.execute(sql.raw(migrationSql));

    const [drainedLegacyJoint] = await db.select().from(jointChannels).where(eq(jointChannels.id, legacyJoint.id));
    assert.equal(drainedLegacyJoint.status, "closed", "legacy joint authority row should be closed");
    const legacyServerRows = await db.select().from(jointChannelServers).where(eq(jointChannelServers.jointChannelId, legacyJoint.id));
    assert.ok(legacyServerRows.every((row) => row.status === "disconnected"), "legacy local projections should be disconnected");
    const [deletedHostProjection] = await db.select().from(channels).where(eq(channels.id, legacyHostProjection.id));
    const [deletedTargetProjection] = await db.select().from(channels).where(eq(channels.id, legacyTargetProjection.id));
    assert.ok(deletedHostProjection.deletedAt, "legacy host projection should be soft-deleted");
    assert.ok(deletedTargetProjection.deletedAt, "legacy peer projection should be soft-deleted");

    const [untouchedNewJoint] = await db.select().from(jointChannels).where(eq(jointChannels.id, newShapeJoint.id));
    const [untouchedProjection] = await db.select().from(channels).where(eq(channels.id, newHostProjection.id));
    assert.equal(untouchedNewJoint.status, "active", "storage-only canonical rows should remain active");
    assert.equal(untouchedProjection.deletedAt, null, "new-shape local projections must not be drained");
  } finally {
    await app.close();
  }
});

test("joint channel threads use per-server local thread projections over canonical storage", async () => {
  const app = await startTestApp("pglite://");
  const previousRisingWaveDatabaseUrl = process.env.RISINGWAVE_DATABASE_URL;
  try {
    const db = getDb();
    const hostOwner = await seedUser("joint-thread-host@slock.test", "joint-thread-host");
    const targetOwner = await seedUser("joint-thread-target@slock.test", "joint-thread-target");
    const targetMember = await seedUser("joint-thread-target-member@slock.test", "joint-thread-target-member");
    const hostServer = await createServer("Joint Thread Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Thread Target", "joint-thread-target", targetOwner.id);
    await addMember(targetServer.id, targetMember.id, "member");
    const hostAgent = await createAgent(hostServer.id, "joint-thread-host-agent", { runtime: "codex" });
    const targetAgent = await createAgent(targetServer.id, "joint-thread-target-agent", { runtime: "codex" });
    const hostToken = await login(app.baseUrl, hostOwner.email);
    const targetToken = await login(app.baseUrl, targetOwner.email);
    const targetMemberToken = await login(app.baseUrl, targetMember.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        name: "threaded-partner-room",
        visibility: "joint",
        targetServerSlug: targetServer.slug,
        invitedPeople: [`@${targetOwner.name}`],
      }),
    });
    assert.equal(createRes.status, 200);
    const hostProjection = await createRes.json() as { id: string; jointInvite: { id: string } };

    const acceptRes = await fetch(`${app.baseUrl}/api/channels/joint-invites/${hostProjection.jointInvite.id}/accept`, {
      method: "POST",
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(acceptRes.status, 200);
    const targetProjection = await acceptRes.json() as { id: string };
    await addAgent(hostProjection.id, hostAgent.id);
    await addAgent(targetProjection.id, targetAgent.id);
    const agentOrchestratorForMembers = app.app.get("agentOrchestrator") as {
      getActivity: (agentId: string, opts?: unknown) => Promise<{ activity: string; activityDetail: string }>;
    };
    const originalGetActivity = agentOrchestratorForMembers.getActivity.bind(agentOrchestratorForMembers);
    agentOrchestratorForMembers.getActivity = async (agentId, opts) => {
      if (agentId === hostAgent.id) {
        return { activity: "working", activityDetail: "Responding from host" };
      }
      return originalGetActivity(agentId, opts);
    };

    const targetMembers = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/members`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetMembers.status, 200);
    const targetMembersBody = await targetMembers.json() as { agents: Array<{ id: string; activity?: string; activityDetail?: string }> };
    const visibleHostAgent = targetMembersBody.agents.find((agent) => agent.id === hostAgent.id);
    assert.equal(
      visibleHostAgent?.activity,
      "working",
      "peer-side joint member list should include live activity for remote origin agents",
    );
    assert.equal(visibleHostAgent?.activityDetail, "Responding from host");
    const [parentJointProjection] = await db
      .select({ jointChannelId: jointChannelServers.jointChannelId })
      .from(jointChannelServers)
      .where(eq(jointChannelServers.localChannelId, hostProjection.id));
    assert.ok(parentJointProjection, "host parent projection should resolve to the parent joint channel");

    const parentRes = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({ channelId: hostProjection.id, content: "parent visible on both sides" }),
    });
    assert.equal(parentRes.status, 200);
    const parent = await parentRes.json() as { id: string };

    const deniedPermalink = await fetch(`${app.baseUrl}/api/messages/context/${parent.id}?channelId=${targetProjection.id}`, {
      headers: headers(targetMemberToken, targetServer.id),
    });
    assert.equal(deniedPermalink.status, 404, "joint permalink access for non-members should degrade to neutral not found");
    assert.deepEqual(await deniedPermalink.json(), { error: "Message not found" });

    const events = installFakeIo(app.app);
    const createThreadRes = await fetch(`${app.baseUrl}/api/channels/${hostProjection.id}/threads`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({ parentMessageId: parent.id, content: "host thread reply" }),
    });
    assert.equal(createThreadRes.status, 200);
    const createdThread = await createThreadRes.json() as { threadChannelId: string; replyCount: number };
    assert.equal(createdThread.replyCount, 1);

    const [hostThreadProjection] = await db
      .select({
        jointThreadId: jointChannelServers.jointChannelId,
        canonicalThreadChannelId: jointChannels.canonicalChannelId,
      })
      .from(jointChannelServers)
      .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
      .where(eq(jointChannelServers.localChannelId, createdThread.threadChannelId));
    assert.ok(hostThreadProjection, "creating a joint thread should register a host local projection");
    assert.notEqual(
      hostThreadProjection.canonicalThreadChannelId,
      createdThread.threadChannelId,
      "thread API should return the local thread projection, not canonical storage",
    );

    const [targetThreadProjection] = await db
      .select({ localChannelId: jointChannelServers.localChannelId })
      .from(jointChannelServers)
      .where(and(
        eq(jointChannelServers.jointChannelId, hostThreadProjection.jointThreadId),
        eq(jointChannelServers.serverId, targetServer.id),
      ));
    assert.ok(targetThreadProjection, "creating a joint thread should create the peer local thread projection");

    assert.ok(
      events.some((event) => (
        event.room === `channel:${hostProjection.id}`
        && event.event === "thread:updated"
        && (event.payload as any).threadChannelId === createdThread.threadChannelId
      )),
      "host parent room should receive thread updates with the host local thread id",
    );
    assert.ok(
      events.some((event) => (
        event.room === `channel:${targetProjection.id}`
        && event.event === "thread:updated"
        && (event.payload as any).threadChannelId === targetThreadProjection.localChannelId
      )),
      "target parent room should receive thread updates with the target local thread id",
    );
    assert.ok(
      !events.some((event) => event.room === `channel:${hostThreadProjection.canonicalThreadChannelId}`),
      "canonical joint thread storage room must not be used for frontend socket delivery",
    );

    const hostParentMessages = await fetch(`${app.baseUrl}/api/messages/channel/${hostProjection.id}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(hostParentMessages.status, 200);
    const hostParentMessagesBody = await hostParentMessages.json() as { messages: Array<{ id: string; threadId: string | null }> };
    assert.equal(
      hostParentMessagesBody.messages.find((message) => message.id === parent.id)?.threadId,
      createdThread.threadChannelId,
      "host parent timeline should expose the host local thread projection id",
    );

    const targetParentMessages = await fetch(`${app.baseUrl}/api/messages/channel/${targetProjection.id}`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetParentMessages.status, 200);
    const targetParentMessagesBody = await targetParentMessages.json() as { messages: Array<{ id: string; threadId: string | null }> };
    assert.equal(
      targetParentMessagesBody.messages.find((message) => message.id === parent.id)?.threadId,
      targetThreadProjection.localChannelId,
      "target parent timeline should expose the target local thread projection id",
    );

    const targetSummaries = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/threads`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetSummaries.status, 200);
    const targetSummariesBody = await targetSummaries.json() as Record<string, { threadChannelId: string; replyCount: number }>;
    assert.equal(
      targetSummariesBody[parent.id]?.threadChannelId,
      targetThreadProjection.localChannelId,
      "peer summaries should expose the peer local thread projection id",
    );

    const targetThreadMessages = await fetch(`${app.baseUrl}/api/messages/channel/${targetThreadProjection.localChannelId}`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetThreadMessages.status, 200);
    const targetThreadMessagesBody = await targetThreadMessages.json() as { messages: Array<{ channelId: string; content: string }> };
    assert.ok(
      targetThreadMessagesBody.messages.some((message) => message.channelId === targetThreadProjection.localChannelId && message.content === "host thread reply"),
      "peer local thread projection should read canonical replies projected to its local id",
    );

    const deliveries: Array<{
      agentId: string;
      message: { channel_id?: string; parent_channel_id?: string; parent_channel_type?: string; content: string; thread_join_context?: unknown };
      options?: { adminAuthority?: boolean };
    }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (
        agentId: string,
        message: { channel_id?: string; parent_channel_id?: string; parent_channel_type?: string; content: string; thread_join_context?: unknown },
        options?: { adminAuthority?: boolean },
      ) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message, options) => {
      deliveries.push({ agentId, message, options });
    };

    const mentionReply = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        channelId: createdThread.threadChannelId,
        content: `hello @${targetAgent.name} @${targetOwner.name}`,
        mentions: [
          { type: "agent", id: targetAgent.id, name: targetAgent.name },
          { type: "user", id: targetOwner.id, name: targetOwner.name },
        ],
      }),
    });
    assert.equal(mentionReply.status, 200);
    await mentionReply.json();
    const targetAgentMentionDelivery = deliveries.find((delivery) => (
      delivery.agentId === targetAgent.id
      && delivery.message.content === `hello @${targetAgent.name} @${targetOwner.name}`
    ));
    assert.ok(targetAgentMentionDelivery, "mentioning a peer projection agent in a joint thread should deliver to that agent");
    assert.equal(
      targetAgentMentionDelivery.message.channel_id,
      targetThreadProjection.localChannelId,
      "peer agent delivery should target the peer local thread projection id",
    );
    assert.equal(
      targetAgentMentionDelivery.message.parent_channel_id,
      targetProjection.id,
      "peer agent delivery should identify the peer local parent projection id",
    );
    assert.equal(targetAgentMentionDelivery.message.parent_channel_type, "joint");
    assert.ok(targetAgentMentionDelivery.message.thread_join_context, "first mention delivery should include thread join context");
    const [targetAgentFollow] = await db
      .select({ followerId: threadFollows.followerId })
      .from(threadFollows)
      .where(and(
        eq(threadFollows.threadChannelId, targetThreadProjection.localChannelId),
        eq(threadFollows.followerType, "agent"),
        eq(threadFollows.followerId, targetAgent.id),
        isNull(threadFollows.unfollowedAt),
      ))
      .limit(1);
    assert.ok(targetAgentFollow, "peer agent follow should be recorded against the peer local thread projection");

    const targetMentionInbox = await fetch(`${app.baseUrl}/api/channels/inbox?filter=mentions`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetMentionInbox.status, 200);
    const targetMentionInboxBody = await targetMentionInbox.json() as {
      items: Array<{ kind: string; threadChannelId?: string; parentChannelId?: string; unreadCount?: number; hasMention?: boolean }>;
    };
    const targetMentionThreadItem = targetMentionInboxBody.items.find((item) => item.threadChannelId === targetThreadProjection.localChannelId);
    assert.equal(targetMentionThreadItem, undefined, "joint local thread mentions should stay out of Activity/Mentions until joint Activity semantics are enabled");

    deliveries.length = 0;
    events.length = 0;
    const followupReply = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({ channelId: createdThread.threadChannelId, content: "ordinary joint thread follow-up" }),
    });
    assert.equal(followupReply.status, 200);
    const targetAgentFollowupDelivery = deliveries.find((delivery) => (
      delivery.agentId === targetAgent.id
      && delivery.message.content === "ordinary joint thread follow-up"
    ));
    assert.ok(targetAgentFollowupDelivery, "a peer agent that follows a joint thread should receive later ordinary replies");
    assert.equal(targetAgentFollowupDelivery.message.channel_id, targetThreadProjection.localChannelId);
    assert.equal(targetAgentFollowupDelivery.message.parent_channel_id, targetProjection.id);
    assert.ok(
      events.some((event) => (
        event.room === `user:${targetOwner.id}`
        && event.event === "message:new"
        && (event.payload as any).channelId === targetThreadProjection.localChannelId
        && (event.payload as any).content === "ordinary joint thread follow-up"
      )),
      "peer human followers should receive live joint thread replies through their local thread projection",
    );

    const targetAllInbox = await fetch(`${app.baseUrl}/api/channels/inbox`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetAllInbox.status, 200);
    const targetAllInboxBody = await targetAllInbox.json() as {
      items: Array<{ kind: string; threadChannelId?: string; parentChannelId?: string }>;
    };
    assert.equal(
      targetAllInboxBody.items.some((item) => item.threadChannelId === targetThreadProjection.localChannelId || item.parentChannelId === targetProjection.id),
      false,
      "joint local threads should also stay out of all Activity",
    );
    const targetReadAll = await fetch(`${app.baseUrl}/api/channels/inbox/read-all`, {
      method: "POST",
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetReadAll.status, 200);
    const targetThreadCursorRows = await db
      .select({ lastReadSeq: userChannelReadCursors.lastReadSeq })
      .from(userChannelReadCursors)
      .where(and(
        eq(userChannelReadCursors.userId, targetOwner.id),
        eq(userChannelReadCursors.channelId, targetThreadProjection.localChannelId),
      ));
    assert.equal(targetThreadCursorRows.length, 0, "Activity mark-all must not advance hidden joint local thread cursors");

    // The RisingWave v1 unread/sidebar MVs do not yet understand joint
    // local-projection -> canonical-storage split. A configured RW env must
    // therefore fail closed to the inline Postgres path for those surfaces.
    process.env.RISINGWAVE_DATABASE_URL = "postgres://127.0.0.1:9/slock_rw_guard_should_not_connect";

    const targetUnread = await fetch(`${app.baseUrl}/api/channels/unread`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetUnread.status, 200);
    const targetUnreadBody = await targetUnread.json() as Record<string, number>;
    assert.ok(
      (targetUnreadBody[targetProjection.id] ?? 0) > 0,
      "peer reload unread counts should read top-level joint messages from canonical storage but return the peer parent projection id",
    );
    assert.ok(
      (targetUnreadBody[targetThreadProjection.localChannelId] ?? 0) > 0,
      "peer reload unread counts should read joint thread replies from canonical storage but return the peer local thread id",
    );

    const targetUnreadSummary = await fetch(`${app.baseUrl}/api/servers/unread-summary`, {
      headers: { Authorization: `Bearer ${targetToken}` },
    });
    assert.equal(targetUnreadSummary.status, 200);
    const targetUnreadSummaryBody = await targetUnreadSummary.json() as Array<{ serverId: string; unreadCount: number }>;
    assert.ok(
      (targetUnreadSummaryBody.find((item) => item.serverId === targetServer.id)?.unreadCount ?? 0) > 0,
      "sidebar unread summary should count top-level joint projection unread from canonical storage",
    );

    const targetSummariesAfterUnread = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/threads`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetSummariesAfterUnread.status, 200);
    const targetSummariesAfterUnreadBody = await targetSummariesAfterUnread.json() as Record<string, { threadChannelId: string; unreadCount: number; firstUnreadMessageId: string | null; participantIds: string[] }>;
    assert.equal(targetSummariesAfterUnreadBody[parent.id]?.threadChannelId, targetThreadProjection.localChannelId);
    assert.ok(
      targetSummariesAfterUnreadBody[parent.id]?.unreadCount > 0,
      "peer parent thread summary unread count should read canonical thread storage",
    );
    assert.ok(
      targetSummariesAfterUnreadBody[parent.id]?.firstUnreadMessageId,
      "peer parent thread summary first unread id should come from canonical thread storage",
    );
    assert.ok(
      targetSummariesAfterUnreadBody[parent.id]?.participantIds.includes(hostOwner.id),
      "peer parent thread summary participants should read canonical thread storage",
    );

    const targetReply = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(targetToken, targetServer.id),
      body: JSON.stringify({ channelId: targetThreadProjection.localChannelId, content: "target thread reply" }),
    });
    assert.equal(targetReply.status, 200);
    const targetReplyBody = await targetReply.json() as { channelId: string };
    assert.equal(targetReplyBody.channelId, targetThreadProjection.localChannelId);

    const hostThreadMessages = await fetch(`${app.baseUrl}/api/messages/channel/${createdThread.threadChannelId}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(hostThreadMessages.status, 200);
    const hostThreadMessagesBody = await hostThreadMessages.json() as { messages: Array<{ channelId: string; content: string; senderId: string; senderMembershipStatus?: string | null }> };
    assert.ok(
      hostThreadMessagesBody.messages.some((message) => message.channelId === createdThread.threadChannelId && message.content === "target thread reply"),
      "host local thread projection should read peer replies projected to its local id",
    );
    assert.ok(
      hostThreadMessagesBody.messages.some((message) => (
        message.content === "target thread reply"
        && message.senderId === targetOwner.id
        && message.senderMembershipStatus === "active"
      )),
      "peer human senders in joint thread replies should stay active through parent projection membership",
    );

    const targetCanonicalFetch = await fetch(`${app.baseUrl}/api/messages/channel/${hostThreadProjection.canonicalThreadChannelId}`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetCanonicalFetch.status, 404, "peer server must not access canonical thread storage by id");
    const hostCanonicalFetch = await fetch(`${app.baseUrl}/api/messages/channel/${hostThreadProjection.canonicalThreadChannelId}`, {
      headers: headers(hostToken, hostServer.id),
    });
    assert.equal(hostCanonicalFetch.status, 403, "host server must not use canonical thread storage as a routable thread surface");
  } finally {
    if (previousRisingWaveDatabaseUrl === undefined) {
      delete process.env.RISINGWAVE_DATABASE_URL;
    } else {
      process.env.RISINGWAVE_DATABASE_URL = previousRisingWaveDatabaseUrl;
    }
    await app.close();
  }
});

test("joint channel peer-side top-level sends use the sender projection authority for agent delivery", async () => {
  const app = await startTestApp("pglite://");
  try {
    const hostOwner = await seedUser("joint-peer-delivery-host@slock.test", "joint-peer-delivery-host");
    const targetOwner = await seedUser("joint-peer-delivery-target@slock.test", "joint-peer-delivery-target");
    const hostServer = await createServer("Joint Peer Delivery Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Peer Delivery Target", "joint-peer-delivery-target", targetOwner.id);
    const hostAgent = await createAgent(hostServer.id, "joint-peer-delivery-host-agent", { runtime: "codex" });
    const hostToken = await login(app.baseUrl, hostOwner.email);
    const targetToken = await login(app.baseUrl, targetOwner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        name: "peer-delivery-room",
        visibility: "joint",
        targetServerSlug: targetServer.slug,
        invitedPeople: [`@${targetOwner.name}`],
      }),
    });
    assert.equal(createRes.status, 200);
    const hostProjection = await createRes.json() as { id: string; jointInvite: { id: string } };

    const acceptRes = await fetch(`${app.baseUrl}/api/channels/joint-invites/${hostProjection.jointInvite.id}/accept`, {
      method: "POST",
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(acceptRes.status, 200);
    const targetProjection = await acceptRes.json() as { id: string };
    await addAgent(hostProjection.id, hostAgent.id);

    const deliveries: Array<{
      agentId: string;
      message: { channel_id?: string; content: string };
      options?: { adminAuthority?: boolean };
    }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (
        agentId: string,
        message: { channel_id?: string; content: string },
        options?: { adminAuthority?: boolean },
      ) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message, options) => {
      deliveries.push({ agentId, message, options });
    };

    const peerTopLevelMention = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(targetToken, targetServer.id),
      body: JSON.stringify({
        channelId: targetProjection.id,
        content: `peer top-level hello @${hostAgent.name}`,
        mentions: [
          { type: "agent", id: hostAgent.id, name: hostAgent.name },
        ],
      }),
    });
    assert.equal(peerTopLevelMention.status, 200);
    await peerTopLevelMention.json();

    const hostAgentDelivery = deliveries.find((delivery) => (
      delivery.agentId === hostAgent.id
      && delivery.message.content === `peer top-level hello @${hostAgent.name}`
    ));
    assert.ok(hostAgentDelivery, "peer-side joint top-level mention should deliver to host-side agents");
    assert.equal(
      hostAgentDelivery.message.channel_id,
      hostProjection.id,
      "host agent delivery should target the host local joint projection id",
    );
    assert.deepEqual(
      hostAgentDelivery.options,
      { adminAuthority: true },
      "peer-side owner/admin sends should use the sender's local projection authority instead of canonical storage server authority",
    );
  } finally {
    await app.close();
  }
});

test("late joint invite accept backfills existing local thread projections for the second server", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const hostOwner = await seedUser("joint-thread-backfill-host@slock.test", "joint-thread-backfill-host");
    const targetOwner = await seedUser("joint-thread-backfill-target@slock.test", "joint-thread-backfill-target");
    const hostServer = await createServer("Joint Thread Backfill Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Thread Backfill Target", "joint-thread-backfill-target", targetOwner.id);
    const hostToken = await login(app.baseUrl, hostOwner.email);
    const targetToken = await login(app.baseUrl, targetOwner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        name: "thread-backfill-room",
        visibility: "joint",
        targetServerSlug: targetServer.slug,
        invitedPeople: [`@${targetOwner.name}`],
      }),
    });
    assert.equal(createRes.status, 200);
    const hostProjection = await createRes.json() as { id: string; jointInvite: { id: string } };

    const [parentJointProjection] = await db
      .select({
        jointChannelId: jointChannelServers.jointChannelId,
        canonicalChannelId: jointChannels.canonicalChannelId,
      })
      .from(jointChannelServers)
      .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
      .where(eq(jointChannelServers.localChannelId, hostProjection.id));
    assert.ok(parentJointProjection, "host parent projection should resolve to the parent joint channel");

    const parentRes = await fetch(`${app.baseUrl}/api/messages`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({ channelId: hostProjection.id, content: "parent before second server accepts" }),
    });
    assert.equal(parentRes.status, 200);
    const parent = await parentRes.json() as { id: string };

    const createThreadRes = await fetch(`${app.baseUrl}/api/channels/${hostProjection.id}/threads`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({ parentMessageId: parent.id, content: "thread before second server accepts" }),
    });
    assert.equal(createThreadRes.status, 200);
    const createdThread = await createThreadRes.json() as { threadChannelId: string };
    const [hostThreadProjection] = await db
      .select({ jointThreadId: jointChannelServers.jointChannelId })
      .from(jointChannelServers)
      .where(eq(jointChannelServers.localChannelId, createdThread.threadChannelId));
    assert.ok(hostThreadProjection, "host thread projection should exist before peer accept");

    const acceptRes = await fetch(`${app.baseUrl}/api/channels/joint-invites/${hostProjection.jointInvite.id}/accept`, {
      method: "POST",
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(acceptRes.status, 200);
    const targetProjection = await acceptRes.json() as { id: string };

    const [targetThreadProjection] = await db
      .select({ localChannelId: jointChannelServers.localChannelId })
      .from(jointChannelServers)
      .where(and(
        eq(jointChannelServers.jointChannelId, hostThreadProjection.jointThreadId),
        eq(jointChannelServers.serverId, targetServer.id),
      ));
    assert.ok(targetThreadProjection, "second server accept should backfill local projections for existing joint threads");

    const targetSummaries = await fetch(`${app.baseUrl}/api/channels/${targetProjection.id}/threads`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetSummaries.status, 200);
    const targetSummariesBody = await targetSummaries.json() as Record<string, { threadChannelId: string; replyCount: number }>;
    assert.equal(
      targetSummariesBody[parent.id]?.threadChannelId,
      targetThreadProjection.localChannelId,
      "second server summaries should expose the backfilled local thread projection id",
    );
    const targetThreadMessages = await fetch(`${app.baseUrl}/api/messages/channel/${targetThreadProjection.localChannelId}`, {
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(targetThreadMessages.status, 200);
    const targetThreadMessagesBody = await targetThreadMessages.json() as { messages: Array<{ channelId: string; content: string }> };
    assert.ok(
      targetThreadMessagesBody.messages.some((message) => (
        message.channelId === targetThreadProjection.localChannelId
        && message.content === "thread before second server accepts"
      )),
      "second server should read existing canonical thread replies through its local projection",
    );
  } finally {
    await app.close();
  }
});

test("joint channel invites reject a third active server", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const hostOwner = await seedUser("joint-two-host@slock.test", "joint-two-host");
    const targetOwner = await seedUser("joint-two-target@slock.test", "joint-two-target");
    const thirdOwner = await seedUser("joint-two-third@slock.test", "joint-two-third");
    const fourthOwner = await seedUser("joint-two-fourth@slock.test", "joint-two-fourth");
    const hostServer = await createServer("Joint Two Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Two Target", "joint-two-target", targetOwner.id);
    const thirdServer = await createServer("Joint Two Third", "joint-two-third", thirdOwner.id);
    const fourthServer = await createServer("Joint Two Fourth", "joint-two-fourth", fourthOwner.id);
    const hostToken = await login(app.baseUrl, hostOwner.email);
    const targetToken = await login(app.baseUrl, targetOwner.email);
    const thirdToken = await login(app.baseUrl, thirdOwner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        name: "two-server-only-room",
        visibility: "joint",
        targetServerSlug: targetServer.slug,
        invitedPeople: [`@${targetOwner.name}`],
      }),
    });
    assert.equal(createRes.status, 200);
    const hostProjection = await createRes.json() as { id: string; jointInvite: { id: string } };
    const [parentJointProjection] = await db
      .select({ jointChannelId: jointChannelServers.jointChannelId })
      .from(jointChannelServers)
      .where(eq(jointChannelServers.localChannelId, hostProjection.id));
    assert.ok(parentJointProjection, "host projection should resolve to the parent joint channel");

    const pendingThirdInvite = await createJointChannelInvite({
      jointChannelId: parentJointProjection.jointChannelId,
      fromServerId: hostServer.id,
      targetServerId: thirdServer.id,
      invitedUserId: thirdOwner.id,
      invitedByUserId: hostOwner.id,
    });

    const acceptTargetRes = await fetch(`${app.baseUrl}/api/channels/joint-invites/${hostProjection.jointInvite.id}/accept`, {
      method: "POST",
      headers: headers(targetToken, targetServer.id),
    });
    assert.equal(acceptTargetRes.status, 200);

    await assert.rejects(
      createJointChannelInvite({
        jointChannelId: parentJointProjection.jointChannelId,
        fromServerId: hostServer.id,
        targetServerId: fourthServer.id,
        invitedUserId: fourthOwner.id,
        invitedByUserId: hostOwner.id,
      }),
      /support exactly two servers/,
    );

    const acceptThirdRes = await fetch(`${app.baseUrl}/api/channels/joint-invites/${pendingThirdInvite.id}/accept`, {
      method: "POST",
      headers: headers(thirdToken, thirdServer.id),
    });
    assert.equal(acceptThirdRes.status, 409);
    assert.deepEqual(await acceptThirdRes.json(), { error: "Joint channels currently support exactly two servers" });
  } finally {
    await app.close();
  }
});

test("joint channel create requires an invite server slug", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("joint-required-host@slock.test", "joint-required-host");
    const server = await createServer("Joint Required Host", "joint-required-host", owner.id);
    const token = await login(app.baseUrl, owner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(token, server.id),
      body: JSON.stringify({
        name: "missing-server",
        visibility: "joint",
      }),
    });
    assert.equal(createRes.status, 400);
    const body = await createRes.json() as { error: string };
    assert.equal(body.error, "Invite server slug is required");
  } finally {
    await app.close();
  }
});

test("joint channel create requires at least one invited person", async () => {
  const app = await startTestApp("pglite://");
  try {
    const hostOwner = await seedUser("joint-required-person-host@slock.test", "joint-required-person-host");
    const targetOwner = await seedUser("joint-required-person-target@slock.test", "joint-required-person-target");
    const hostServer = await createServer("Joint Required Person Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Required Person Target", "joint-required-person-target", targetOwner.id);
    const hostToken = await login(app.baseUrl, hostOwner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        name: "missing-person",
        visibility: "joint",
        targetServerSlug: targetServer.slug,
      }),
    });
    assert.equal(createRes.status, 400);
    const body = await createRes.json() as { error: string };
    assert.equal(body.error, "At least one invited person is required");
  } finally {
    await app.close();
  }
});

test("joint channel create only allows target server admins as invited people", async () => {
  const app = await startTestApp("pglite://");
  try {
    const hostOwner = await seedUser("joint-admin-only-host@slock.test", "joint-admin-only-host");
    const targetOwner = await seedUser("joint-admin-only-target-owner@slock.test", "joint-admin-only-target-owner");
    const targetMember = await seedUser("joint-admin-only-target-member@slock.test", "joint-admin-only-target-member");
    const hostServer = await createServer("Joint Admin Only Host", "botiverse", hostOwner.id);
    const targetServer = await createServer("Joint Admin Only Target", "joint-admin-only-target", targetOwner.id);
    await addMember(targetServer.id, targetMember.id);
    const hostToken = await login(app.baseUrl, hostOwner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        name: "member-invite-blocked",
        visibility: "joint",
        targetServerSlug: targetServer.slug,
        invitedPeople: [targetMember.email],
      }),
    });
    assert.equal(createRes.status, 400);
    const body = await createRes.json() as { error: string };
    assert.match(body.error, /target server admin/);
  } finally {
    await app.close();
  }
});

test("joint channel create is dogfood-gated to the botiverse server", async () => {
  const app = await startTestApp("pglite://");
  try {
    const hostOwner = await seedUser("joint-gated-host@slock.test", "joint-gated-host");
    const targetOwner = await seedUser("joint-gated-target@slock.test", "joint-gated-target");
    const hostServer = await createServer("Joint Gated Host", "joint-gated-host", hostOwner.id);
    const targetServer = await createServer("Joint Gated Target", "joint-gated-target", targetOwner.id);
    const hostToken = await login(app.baseUrl, hostOwner.email);

    const createRes = await fetch(`${app.baseUrl}/api/channels`, {
      method: "POST",
      headers: headers(hostToken, hostServer.id),
      body: JSON.stringify({
        name: "blocked-joint",
        visibility: "joint",
        targetServerSlug: targetServer.slug,
        invitedPeople: [targetOwner.email],
      }),
    });
    assert.equal(createRes.status, 403);
    const body = await createRes.json() as { error: string };
    assert.match(body.error, /currently limited to \/botiverse/);
  } finally {
    await app.close();
  }
});
