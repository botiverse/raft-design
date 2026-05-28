import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { eq } from "drizzle-orm";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { agents, channelAgents, channels, messages, reminderEvents, servers, threadFollows, users } from "../db/schema.js";
import {
  cancelReminder,
  createReminder,
  deliverFireWake,
  fireReminder,
  getReminderById,
  listReminders,
  toReminderSummaries,
  type TimeProvider,
} from "./reminderService.js";

afterEach(async () => {
  await closeDatabase();
});

const FIXED_NOW = new Date("2026-04-20T12:00:00.000Z");
const FIXED_CLOCK: TimeProvider = { now: () => FIXED_NOW };

async function seedServerAndAgent() {
  const db = getDb();

  const [user] = await db
    .insert(users)
    .values({
      id: "11111111-1111-1111-1111-111111111111",
      email: "owner@example.com",
      name: "Owner",
      passwordHash: "hash",
      emailVerified: true,
    })
    .returning();

  const [server] = await db
    .insert(servers)
    .values({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Acme",
      slug: "acme",
      ownerId: user.id,
    })
    .returning();

  const [agent] = await db
    .insert(agents)
    .values({
      id: "33333333-3333-3333-3333-333333333333",
      serverId: server.id,
      name: "applepi",
      status: "active",
      model: "sonnet",
      runtime: "claude",
      executionMode: "byoc",
    })
    .returning();

  return { user, server, agent };
}

async function seedAnchor(serverId: string, senderId: string, agentId?: string) {
  const db = getDb();
  const [channel] = await db
    .insert(channels)
    .values({
      id: "44444444-4444-4444-4444-444444444444",
      serverId,
      name: "general",
      type: "channel",
    })
    .returning();

  if (agentId) {
    await db.insert(channelAgents).values({ channelId: channel.id, agentId: agentId }).onConflictDoNothing();
  }

  const [message] = await db
    .insert(messages)
    .values({
      id: "55555555-5555-4555-8555-555555555555",
      channelId: channel.id,
      senderType: "user",
      senderId,
      content: "anchor message",
    })
    .returning();

  return { channel, message };
}

async function seedThreadAnchor(serverId: string, senderId: string, agentId: string) {
  const db = getDb();
  const { channel: parentChannel, message: parentMessage } = await seedAnchor(serverId, senderId);

  const [threadChannel] = await db
    .insert(channels)
    .values({
      id: "66666666-6666-4666-8666-666666666666",
      serverId,
      name: "general:55555555",
      type: "thread",
      parentMessageId: parentMessage.id,
    })
    .returning();

  const [threadMessage] = await db
    .insert(messages)
    .values({
      id: "77777777-7777-4777-8777-777777777777",
      channelId: threadChannel.id,
      senderType: "user",
      senderId,
      content: "thread anchor message",
    })
    .returning();

  await db.insert(threadFollows).values({
    threadChannelId: threadChannel.id,
    followerType: "agent",
    followerId: agentId,
    parentMessageId: parentMessage.id,
    reason: "manual",
  });

  return { parentChannel, parentMessage, threadChannel, threadMessage };
}

test("R1: fire transition is atomic and exactly-once for the same reminder/version pair", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: null,
    title: "wake up",
    fireAt: new Date("2026-04-20T13:00:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const [first, second] = await Promise.all([
    fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK }),
    fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK }),
  ]);

  const winners = [first, second].filter((row): row is NonNullable<typeof row> => row !== null);
  const losers = [first, second].filter((row) => row === null);

  assert.equal(winners.length, 1);
  assert.equal(losers.length, 1);
  assert.equal(winners[0].fired, true);
  assert.equal(winners[0].catchup, false);
  assert.equal(winners[0].nextFireAt, null);
  assert.equal(winners[0].row.status, "fired");
  assert.equal(winners[0].row.version, 2);
  assert.equal(winners[0].row.firedAt?.toISOString(), FIXED_NOW.toISOString());

  const persisted = await getReminderById(reminder.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "fired");
  assert.equal(persisted.version, 2);
  assert.equal(persisted.firedAt?.toISOString(), FIXED_NOW.toISOString());
});

test("R1: fire transition rejects stale expectedVersion after the first winner bumps the row", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: null,
    title: "wake up later",
    fireAt: new Date("2026-04-20T13:00:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const fired = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.ok(fired);
  assert.equal(fired.row.version, 2);

  const staleRetry = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.equal(staleRetry, null);

  const persisted = await getReminderById(reminder.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "fired");
  assert.equal(persisted.version, 2);
});

test("listReminders accepts multi-status filters and returns only matching rows", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();

  const scheduled = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: null,
    title: "scheduled reminder",
    fireAt: new Date("2026-04-20T13:00:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const firedBase = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: null,
    title: "fired reminder",
    fireAt: new Date("2026-04-20T13:05:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });
  const fired = await fireReminder(firedBase.id, firedBase.version, { clock: FIXED_CLOCK });
  assert.ok(fired);

  const canceledBase = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: null,
    title: "canceled reminder",
    fireAt: new Date("2026-04-20T13:10:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });
  const canceled = await cancelReminder(canceledBase.id, { clock: FIXED_CLOCK });
  assert.ok(canceled);

  const allRows = await listReminders({
    serverId: server.id,
    ownerAgentId: agent.id,
    status: ["scheduled", "fired", "canceled"],
  });
  assert.deepEqual(allRows.map((r) => r.id), [scheduled.id, fired.row.id, canceled.id]);

  const firedAndCanceled = await listReminders({
    serverId: server.id,
    ownerAgentId: agent.id,
    status: ["fired", "canceled"],
  });
  assert.deepEqual(firedAndCanceled.map((r) => r.id), [fired.row.id, canceled.id]);
});

test("toReminderSummaries returns anchored summaries without crashing on anchor resolution", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const { message } = await seedAnchor(server.id, user.id, agent.id);

  const anchored = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "anchored reminder",
    fireAt: new Date("2026-04-20T13:15:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const [summary] = await toReminderSummaries([anchored], server.id);
  assert.ok(summary);
  assert.equal(summary.reminderId, anchored.id);
  assert.equal(summary.msgRef, "#general:55555555");
});

test("listReminders multi-status + anchored row can be summarized without malformed array binding", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const { message } = await seedAnchor(server.id, user.id);

  const scheduled = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: null,
    title: "scheduled reminder",
    fireAt: new Date("2026-04-20T13:00:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const anchoredBase = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "anchored fired reminder",
    fireAt: new Date("2026-04-20T13:05:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });
  const anchoredFiredResult = await fireReminder(anchoredBase.id, anchoredBase.version, { clock: FIXED_CLOCK });
  assert.ok(anchoredFiredResult);
  const anchoredFired = anchoredFiredResult.row;

  const canceledBase = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: null,
    title: "canceled reminder",
    fireAt: new Date("2026-04-20T13:10:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });
  const canceled = await cancelReminder(canceledBase.id, { clock: FIXED_CLOCK });
  assert.ok(canceled);

  const rows = await listReminders({
    serverId: server.id,
    ownerAgentId: agent.id,
    status: ["scheduled", "fired", "canceled"],
  });
  const summaries = await toReminderSummaries(rows, server.id);
  assert.deepEqual(summaries.map((s) => s.reminderId), [scheduled.id, anchoredFired.id, canceled.id]);
  assert.equal(
    summaries.find((s) => s.reminderId === anchoredFired.id)?.msgRef,
    "#general:55555555",
  );
});

// ── deliverFireWake contract: owner-only push, no chat surface ──────────────
//
// Per stdrc directive in #proj-task msg=dfaebc8c + msg=c580faed:
//
//   - Reminder fire is the owner agent's private alarm.
//   - It must NOT write a chat message into any surface (channel/thread/DM).
//   - It must NOT alert any non-owner human or agent.
//   - Owner is woken via a synthetic AgentMessage push; everyone else only
//     observes the audit trail in `reminder_events` via the agent reminder tab.
//
// These tests pin that contract.

test("deliverFireWake wakes the owner agent for a channel-anchored reminder, with channel context, but writes no chat surface system message", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const { channel, message } = await seedAnchor(server.id, user.id, agent.id);

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "wake anchored reminder",
    fireAt: new Date("2026-04-20T13:20:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const emitted: Array<{ room: string; event: string; payload: any }> = [];
  const delivered: Array<{ agentId: string; payload: any; transient?: boolean }> = [];
  const roomChain = (room: string) => ({
    in() {
      return {
        in() {
          return { socketsJoin() {} };
        },
        socketsJoin() {},
      };
    },
    emit(event: string, payload: any) {
      emitted.push({ room, event, payload });
    },
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, payload: any, options?: any) => {
      delivered.push({ agentId, payload, transient: options?.transient });
    },
  } as any;

  await deliverFireWake(io, orchestrator, reminder);

  // Wake: exactly the owner, with channel context.
  assert.deepEqual(delivered.map((d) => d.agentId), [agent.id]);
  assert.equal(delivered[0].payload.channel_id, channel.id);
  assert.equal(delivered[0].payload.channel_type, "channel");
  assert.equal(delivered[0].payload.sender_type, "system");
  // Agent envelope contains both visible content + agent-only hint.
  assert.match(delivered[0].payload.content, /^🔔 Reminder #[a-f0-9]{8} \(one-time\) — #general:55555555 — "wake anchored reminder"\n\(to snooze\/cancel: slock reminder --help\)$/);

  // No chat surface noise: no `message:new` / `dm:new` emits.
  const surfaceEvents = emitted.filter((e) => e.event === "message:new" || e.event === "dm:new");
  assert.deepEqual(surfaceEvents, [], `expected no surface emits, got ${JSON.stringify(surfaceEvents)}`);

  // No fire system message persisted in the channel.
  const db = getDb();
  const chatMsgs = await db.select({ id: messages.id }).from(messages).where(eq(messages.channelId, channel.id));
  assert.equal(chatMsgs.length, 1, "only the seeded anchor msg should exist; no fire system message");
  assert.equal(chatMsgs[0].id, message.id);

  // Synthetic envelope — no DB row → no `message_id`.
  assert.equal(delivered[0].payload.message_id, undefined);
  // `transient: true` keeps the synthetic wake out of the replayable inbox
  // (would otherwise re-fire on every receive/reconnect since
  // `partitionAcknowledgedMessages` requires a truthy seq to remove).
  assert.equal(delivered[0].transient, true);
});

test("deliverFireWake wakes the owner agent for a thread-anchored reminder, with thread channel context, but writes no chat surface system message", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const { threadChannel, threadMessage } = await seedThreadAnchor(server.id, user.id, agent.id);

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: threadMessage.id,
    title: "wake thread owner",
    fireAt: new Date("2026-04-20T13:25:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const emitted: Array<{ event: string }> = [];
  const delivered: Array<{ agentId: string; payload: any; transient?: boolean }> = [];
  const roomChain = (_room: string) => ({
    in() {
      return {
        in() {
          return { socketsJoin() {} };
        },
        socketsJoin() {},
      };
    },
    emit(event: string, _payload: any) { emitted.push({ event }); },
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, payload: any, options?: any) => {
      delivered.push({ agentId, payload, transient: options?.transient });
    },
  } as any;

  await deliverFireWake(io, orchestrator, reminder);

  assert.deepEqual(delivered.map((d) => d.agentId), [agent.id]);
  assert.equal(delivered[0].payload.channel_id, threadChannel.id);
  assert.equal(delivered[0].payload.channel_type, "thread");
  assert.equal(delivered[0].payload.sender_type, "system");
  assert.match(delivered[0].payload.content, /^🔔 Reminder #[a-f0-9]{8} \(one-time\) — #thread:77777777 — "wake thread owner"\n\(to snooze\/cancel: slock reminder --help\)$/);
  // No chat surface noise.
  assert.deepEqual(emitted.filter((e) => e.event === "message:new" || e.event === "dm:new"), []);
  const db = getDb();
  const threadMsgs = await db.select({ id: messages.id }).from(messages).where(eq(messages.channelId, threadChannel.id));
  assert.equal(threadMsgs.length, 1);
  assert.equal(threadMsgs[0].id, threadMessage.id);
  assert.equal(delivered[0].payload.message_id, undefined);
  assert.equal(delivered[0].transient, true);
});

test("deliverFireWake wakes only the owner agent — bystander channel members are NOT woken", async () => {
  await initDatabase("pglite://");
  const { server, agent: owner, user } = await seedServerAndAgent();
  const db = getDb();
  const [bystander] = await db
    .insert(agents)
    .values({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      serverId: server.id,
      name: "bystander",
      status: "active",
      model: "sonnet",
      runtime: "claude",
      executionMode: "byoc",
    })
    .returning();
  const { channel, message } = await seedAnchor(server.id, user.id, owner.id);
  await db.insert(channelAgents).values({ channelId: channel.id, agentId: bystander.id });

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: owner.id,
    msgId: message.id,
    title: "owner-only wake",
    fireAt: new Date("2026-04-20T13:35:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const delivered: Array<{ agentId: string; transient?: boolean }> = [];
  const roomChain = (_room: string) => ({
    in() {
      return { in() { return { socketsJoin() {} }; }, socketsJoin() {} };
    },
    emit(_e: string, _p: any) {},
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, _payload: any, options?: any) => { delivered.push({ agentId, transient: options?.transient }); },
  } as any;

  await deliverFireWake(io, orchestrator, reminder);

  assert.deepEqual(delivered.map((d) => d.agentId), [owner.id]);
  assert.ok(!delivered.some((d) => d.agentId === bystander.id), "bystander must not be woken");
});

test("deliverFireWake wakes only the owner — bystander thread followers are NOT woken", async () => {
  await initDatabase("pglite://");
  const { server, agent: owner, user } = await seedServerAndAgent();
  const { threadChannel, parentMessage, threadMessage } = await seedThreadAnchor(server.id, user.id, owner.id);
  const db = getDb();
  const [follower] = await db
    .insert(agents)
    .values({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      serverId: server.id,
      name: "thread-follower",
      status: "active",
      model: "sonnet",
      runtime: "claude",
      executionMode: "byoc",
    })
    .returning();
  await db.insert(threadFollows).values({
    threadChannelId: threadChannel.id,
    followerType: "agent",
    followerId: follower.id,
    parentMessageId: parentMessage.id,
    reason: "manual",
  });

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: owner.id,
    msgId: threadMessage.id,
    title: "thread owner-only wake",
    fireAt: new Date("2026-04-20T13:40:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const delivered: Array<{ agentId: string; transient?: boolean }> = [];
  const roomChain = (_room: string) => ({
    in() { return { in() { return { socketsJoin() {} }; }, socketsJoin() {} }; },
    emit(_e: string, _p: any) {},
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, _payload: any, options?: any) => { delivered.push({ agentId, transient: options?.transient }); },
  } as any;

  await deliverFireWake(io, orchestrator, reminder);

  assert.deepEqual(delivered.map((d) => d.agentId), [owner.id]);
  assert.ok(!delivered.some((d) => d.agentId === follower.id), "non-owner thread follower must not be woken");
});

test("deliverFireWake wakes the owner even when not a member of the anchor channel", async () => {
  await initDatabase("pglite://");
  const { server, agent: owner, user } = await seedServerAndAgent();
  // Anchor in a channel the owner does NOT belong to (Akko-style bug).
  const { channel, message } = await seedAnchor(server.id, user.id);
  const db = getDb();
  const memberRows = await db.select({ agentId: channelAgents.agentId }).from(channelAgents).where(eq(channelAgents.channelId, channel.id));
  assert.ok(!memberRows.some((r) => r.agentId === owner.id));

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: owner.id,
    msgId: message.id,
    title: "owner not in channel",
    fireAt: new Date("2026-04-20T13:45:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const delivered: Array<{ agentId: string; transient?: boolean }> = [];
  const roomChain = (_room: string) => ({
    in() { return { in() { return { socketsJoin() {} }; }, socketsJoin() {} }; },
    emit(_e: string, _p: any) {},
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, _payload: any, options?: any) => { delivered.push({ agentId, transient: options?.transient }); },
  } as any;

  await deliverFireWake(io, orchestrator, reminder);
  assert.deepEqual(delivered.map((d) => d.agentId), [owner.id]);
});

test("deliverFireWake wakes the owner even when not a follower of the anchor thread", async () => {
  await initDatabase("pglite://");
  const { server, agent: owner, user } = await seedServerAndAgent();
  const db = getDb();
  // Build a thread anchor without putting the owner into thread_follows.
  const { message: parentMessage } = await seedAnchor(server.id, user.id);
  const [threadChannel] = await db
    .insert(channels)
    .values({
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      serverId: server.id,
      name: "general:55555555",
      type: "thread",
      parentMessageId: parentMessage.id,
    })
    .returning();
  const [threadMessage] = await db
    .insert(messages)
    .values({
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      channelId: threadChannel.id,
      senderType: "user",
      senderId: user.id,
      content: "thread anchor",
    })
    .returning();
  const followRows = await db.select({ id: threadFollows.followerId }).from(threadFollows).where(eq(threadFollows.threadChannelId, threadChannel.id));
  assert.equal(followRows.length, 0);

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: owner.id,
    msgId: threadMessage.id,
    title: "owner not in thread_follows",
    fireAt: new Date("2026-04-20T13:50:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const delivered: Array<{ agentId: string; transient?: boolean }> = [];
  const roomChain = (_room: string) => ({
    in() { return { in() { return { socketsJoin() {} }; }, socketsJoin() {} }; },
    emit(_e: string, _p: any) {},
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, _payload: any, options?: any) => { delivered.push({ agentId, transient: options?.transient }); },
  } as any;

  await deliverFireWake(io, orchestrator, reminder);
  assert.deepEqual(delivered.map((d) => d.agentId), [owner.id]);
});

test("deliverFireWake records the fired event and writes no chat surface message even with no agent listeners", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const { channel, message } = await seedAnchor(server.id, user.id, agent.id);

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "audit-only fire",
    fireAt: new Date("2026-04-20T13:55:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const fired = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.ok(fired);

  const emitted: Array<{ event: string }> = [];
  const delivered: Array<{ agentId: string; transient?: boolean }> = [];
  const roomChain = (_room: string) => ({
    in() { return { in() { return { socketsJoin() {} }; }, socketsJoin() {} }; },
    emit(event: string, _p: any) { emitted.push({ event }); },
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, _payload: any, options?: any) => { delivered.push({ agentId, transient: options?.transient }); },
  } as any;

  await deliverFireWake(io, orchestrator, fired.row);

  assert.deepEqual(delivered.map((d) => d.agentId), [agent.id]);
  assert.deepEqual(emitted.filter((e) => e.event === "message:new" || e.event === "dm:new"), []);

  const db = getDb();
  const chatMsgs = await db.select({ id: messages.id }).from(messages).where(eq(messages.channelId, channel.id));
  assert.equal(chatMsgs.length, 1, "no fire system message should be persisted in the channel");

  const events = await db
    .select({ kind: reminderEvents.eventType, reminderId: reminderEvents.reminderId })
    .from(reminderEvents)
    .where(eq(reminderEvents.reminderId, reminder.id))
    .orderBy(reminderEvents.occurredAt);
  const kinds = events.map((e) => e.kind);
  assert.ok(kinds.includes("scheduled"), `expected scheduled in events, got ${kinds.join(",")}`);
  assert.ok(kinds.includes("fired"), `expected fired in events, got ${kinds.join(",")}`);
});

test("deliverFireWake collapses multi-line title and clips overlong title to one line", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  // Anchor needed so the synthetic envelope can resolve a surface — title
  // formatting itself is independent of anchor.
  const { message } = await seedAnchor(server.id, user.id, agent.id);

  const longTitle =
    "Line one of a very long reminder\nline two with details\n\nline three\nLine four padded out so the whole thing exceeds eighty characters once we collapse newlines.";

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: longTitle,
    fireAt: new Date("2026-04-20T13:30:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const delivered: Array<{ agentId: string; payload: any; transient?: boolean }> = [];
  const roomChain = (_room: string) => ({
    in() {
      return {
        in() {
          return { socketsJoin() {} };
        },
        socketsJoin() {},
      };
    },
    emit(_event: string, _payload: any) {},
  });
  const io = { to: roomChain, in: roomChain } as any;
  const orchestrator = {
    deliverMessage: async (agentId: string, payload: any, options?: any) => {
      delivered.push({ agentId, payload, transient: options?.transient });
    },
  } as any;

  await deliverFireWake(io, orchestrator, reminder);

  const wake = delivered.find((d) => d.agentId === agent.id);
  assert.ok(wake);
  const content = wake.payload.content as string;
  const [header, footer] = content.split("\n");
  assert.equal(footer, "(to snooze/cancel: slock reminder --help)");
  // Title segment is clipped to <=80 chars + ellipsis; anchor msgRef appears
  // between prefix and title.
  assert.match(header, /^🔔 Reminder #[a-f0-9]{8} \(one-time\) — #general:55555555 — ".+…"$/);
  assert.ok(header.startsWith("🔔 Reminder #"));
});

// Regression: full deliver -> receive -> ack path against a real
// `AgentOrchestrator` instance. Pin Cody's review concern (PR #1242) — the
// synthetic wake has no `seq` from `messages.seq`; the inbox would never be
// able to ack/remove it, so re-delivery on every receive/reconnect would
// effectively re-fire stale reminders. The fix is `transient: true` on
// `deliverMessage`, which skips the replayable inbox.
test("deliverFireWake transient delivery keeps the agent inbox empty (does not enqueue for replay)", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const { message } = await seedAnchor(server.id, user.id, agent.id);

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "transient regression",
    fireAt: new Date("2026-04-20T14:00:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  // Real orchestrator, no replica state store available so we exercise the
  // local-inbox path. We don't attach a machine connection, so the ws send
  // is a no-op — inbox state is what we need to assert here.
  const { AgentOrchestrator } = await import("./agentOrchestrator.js");
  const replicaStateStore = {
    isAvailable() { return false; },
  } as any;
  const orchestrator = new AgentOrchestrator(replicaStateStore);

  // Stub getCachedAgent so deliverMessage finds the agent in active state.
  (orchestrator as any).getCachedAgent = async () => ({
    id: agent.id,
    serverId: server.id,
    machineId: null,
    status: "active",
  });
  // Stub reset state so deliverMessage takes the direct-delivery path.
  (orchestrator as any).getResetMode = () => null;

  // Stub send-to-machine so we don't actually try to dial a daemon.
  (orchestrator as any).sendBestEffortToMachine = () => {};

  const ioStub = {
    to: () => ({ in() { return { in() { return { socketsJoin() {} } }, socketsJoin() {} } }, emit() {} }),
    in: () => ({ in() { return { in() { return { socketsJoin() {} } }, socketsJoin() {} } }, emit() {} }),
  } as any;

  await deliverFireWake(ioStub, orchestrator, reminder);

  // KEY ASSERTION: inbox stays empty. If `transient: true` were not honored,
  // the synthetic wake would sit in `agentInboxes` forever (no ackable seq).
  const inbox = (orchestrator as any).agentInboxes.get(agent.id);
  assert.ok(!inbox || inbox.inbox.length === 0, `expected empty inbox, got ${JSON.stringify(inbox?.inbox ?? [])}`);

  // receiveMessages also returns empty — no buffered wake.
  const buffered = await orchestrator.receiveMessages(agent.id, false, 0);
  assert.deepEqual(buffered, []);
});

// Legacy migration rows must not turn transient reminder wakes into durable
// inbox entries. Runtime Profile switches now reset sessions without gating.
test("deliverFireWake transient delivery is not replayed by legacy migration rows", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const { message } = await seedAnchor(server.id, user.id, agent.id);
  const db = getDb();

  // Seed a legacy pending migration row. Reset-session mode must ignore this
  // for delivery gating while still preserving the no-replay transient wake
  // invariant.
  const { machines, agentRuntimeProfiles } = await import("../db/schema.js");
  const [machine] = await db.insert(machines).values({
    serverId: server.id,
    userId: user.id,
    name: "test-machine",
    apiKeyHash: "hash",
  }).returning();
  await db.insert(agentRuntimeProfiles).values({
    agentId: agent.id,
    serverId: server.id,
    machineId: machine.id,
    runtimeProfileFingerprint: "fp-current",
    runtime: "claude",
    model: "sonnet",
    executionMode: "byoc",
    migrationStatus: "pending",
    pendingKind: "migration",
    pendingKey: "test-key",
    baselineRuntimeProfileFingerprint: "fp-baseline",
    baselineMachineId: machine.id,
    baselineRuntime: "claude",
    baselineModel: "sonnet",
    baselineExecutionMode: "byoc",
  });

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "gated transient",
    fireAt: new Date("2026-04-20T14:05:00.000Z"),
    payload: null,
    createdBy: { type: "human", id: user.id },
  }, { clock: FIXED_CLOCK });

  const { AgentOrchestrator } = await import("./agentOrchestrator.js");
  const replicaStateStore = { isAvailable() { return false; } } as any;
  const orchestrator = new AgentOrchestrator(replicaStateStore);

  // Stub the cached agent lookup (the orchestrator caches go through
  // agentService normally).
  (orchestrator as any).getCachedAgent = async () => ({
    id: agent.id,
    serverId: server.id,
    machineId: machine.id,
    status: "active",
  });
  // Stub the migration nudge so we don't try to dial daemon ws.
  (orchestrator as any).maybePiggybackRuntimeProfileMigrationNudge = async () => {};

  const ioStub = {
    to: () => ({ in() { return { in() { return { socketsJoin() {} } }, socketsJoin() {} } }, emit() {} }),
    in: () => ({ in() { return { in() { return { socketsJoin() {} } }, socketsJoin() {} } }, emit() {} }),
  } as any;

  await deliverFireWake(ioStub, orchestrator, reminder);

  // KEY ASSERTION: transient wake doesn't enqueue/replay even when stale
  // migration metadata exists.
  const inbox = (orchestrator as any).agentInboxes.get(agent.id);
  assert.ok(!inbox || inbox.inbox.length === 0, `expected empty inbox, got ${JSON.stringify(inbox?.inbox ?? [])}`);

  const buffered = await orchestrator.receiveMessages(agent.id, false, 0);
  assert.deepEqual(buffered, []);
});
