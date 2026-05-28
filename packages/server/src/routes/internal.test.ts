import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { channels, messages, servers, users } from "../db/schema.js";
import { classifyHistoryAroundCursor } from "./historyCursor.js";
import { applyHistoryThreadMetadata, getHistoryThreadParentMessageIds } from "./historyThreadMetadata.js";
import { resolveReminderMsgId } from "./internal.js";

afterEach(async () => {
  await closeDatabase();
});

async function seedReminderMsgIdFixtures() {
  const db = getDb();

  const [owner] = await db.insert(users).values({
    id: "11111111-1111-1111-1111-111111111111",
    email: "owner@example.com",
    name: "owner",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  const [server] = await db.insert(servers).values({
    id: "22222222-2222-2222-2222-222222222222",
    name: "Acme",
    slug: "acme",
    ownerId: owner.id,
  }).returning();

  const [channel] = await db.insert(channels).values({
    id: "33333333-3333-3333-3333-333333333333",
    serverId: server.id,
    name: "general",
    type: "channel",
  }).returning();

  await db.insert(messages).values([
    {
      id: "943de343-1111-4111-8111-111111111111",
      channelId: channel.id,
      senderType: "user",
      senderId: owner.id,
      content: "anchored one",
    },
    {
      id: "aaaaaaaa-1111-4111-8111-111111111111",
      channelId: channel.id,
      senderType: "user",
      senderId: owner.id,
      content: "ambiguous one",
    },
    {
      id: "aaaaaaaa-2222-4222-8222-222222222222",
      channelId: channel.id,
      senderType: "user",
      senderId: owner.id,
      content: "ambiguous two",
    },
  ]);

  return { server };
}

test("classifyHistoryAroundCursor distinguishes seq, short message ids, and full ids", () => {
  assert.equal(classifyHistoryAroundCursor("12345"), "seq");
  assert.equal(classifyHistoryAroundCursor("12345678"), "short_id");
  assert.equal(classifyHistoryAroundCursor("b648e174"), "short_id");
  assert.equal(classifyHistoryAroundCursor("B648E174"), "short_id");
  assert.equal(classifyHistoryAroundCursor("b2c23a3e-d0de-4dcd-98a5-573b61d0603d"), "message_id");
});

test("getHistoryThreadParentMessageIds only keeps parent messages that already have a thread", () => {
  const ids = getHistoryThreadParentMessageIds([
    { id: "m1", threadId: "thread-1" },
    { id: "m2", threadId: null },
    { id: "m3" },
    { id: "m1", threadId: "thread-1" },
  ]);

  assert.deepEqual(ids, ["m1"]);
});

test("applyHistoryThreadMetadata adds replyCount while preserving existing thread ids", () => {
  const messages = applyHistoryThreadMetadata(
    [
      { id: "m1", threadId: "thread-1", content: "parent" },
      { id: "m2", threadId: null, content: "plain" },
    ],
    {
      m1: { threadChannelId: "thread-1", replyCount: 3 },
    },
  );

  assert.deepEqual(messages, [
    { id: "m1", threadId: "thread-1", content: "parent", replyCount: 3 },
    { id: "m2", threadId: null, content: "plain", replyCount: 0 },
  ]);
});

test("resolveReminderMsgId accepts a full UUID anchor", async () => {
  await initDatabase("pglite://");
  const { server } = await seedReminderMsgIdFixtures();

  const resolved = await resolveReminderMsgId(server.id, "943de343-1111-4111-8111-111111111111");
  assert.deepEqual(resolved, {
    ok: true,
    messageId: "943de343-1111-4111-8111-111111111111",
  });
});

test("resolveReminderMsgId accepts an 8-char short id anchor", async () => {
  await initDatabase("pglite://");
  const { server } = await seedReminderMsgIdFixtures();

  const resolved = await resolveReminderMsgId(server.id, "943de343");
  assert.deepEqual(resolved, {
    ok: true,
    messageId: "943de343-1111-4111-8111-111111111111",
  });
});

test("resolveReminderMsgId returns not found for an unknown short id", async () => {
  await initDatabase("pglite://");
  const { server } = await seedReminderMsgIdFixtures();

  const resolved = await resolveReminderMsgId(server.id, "deadbeef");
  assert.deepEqual(resolved, {
    ok: false,
    status: 404,
    error: "message not found",
  });
});

test("resolveReminderMsgId rejects ambiguous short ids", async () => {
  await initDatabase("pglite://");
  const { server } = await seedReminderMsgIdFixtures();

  const resolved = await resolveReminderMsgId(server.id, "aaaaaaaa");
  assert.deepEqual(resolved, {
    ok: false,
    status: 400,
    error: "msgId short id is ambiguous",
  });
});
