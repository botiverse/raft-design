import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { servers, users, agents, channels, channelHumans, channelAgents, serverMembers, messages, messageMentions } from "../db/schema.js";
import { broadcastAndDeliver, MentionValidationError, __setMessageServiceDepsForTests, __resetMessageServiceDepsForTests } from "./messageService.js";
import { getInboxItems, markRead } from "./channelService.js";
import { eq, and } from "drizzle-orm";

afterEach(async () => {
  __resetMessageServiceDepsForTests();
  await closeDatabase();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createIo() {
  return {
    to() {
      return { emit() {} };
    },
    in() {
      return { in() { return { socketsJoin() {} }; }, socketsJoin() {} };
    },
  } as any;
}

const noopOrchestrator = { deliverMessage: async () => undefined } as any;

async function seedPublicChannel() {
  const db = getDb();

  const [user] = await db.insert(users).values({
    email: "alice@test.com", name: "Alice", passwordHash: "x", emailVerified: true,
  }).returning();

  const [user2] = await db.insert(users).values({
    email: "bob@test.com", name: "Bob", passwordHash: "x", emailVerified: true,
  }).returning();

  const [server] = await db.insert(servers).values({
    name: "TestServer", slug: "test", ownerId: user.id,
  }).returning();

  await db.insert(serverMembers).values([
    { serverId: server.id, userId: user.id, role: "owner" },
    { serverId: server.id, userId: user2.id, role: "member" },
  ]);

  const [agent] = await db.insert(agents).values({
    serverId: server.id, name: "TestBot", status: "active", model: "sonnet", runtime: "claude", executionMode: "byoc",
  }).returning();
// PLACEHOLDER_SEED_CONTINUE

  const [channel] = await db.insert(channels).values({
    serverId: server.id, name: "general", type: "channel",
  }).returning();

  await db.insert(channelHumans).values([
    { channelId: channel.id, userId: user.id },
    { channelId: channel.id, userId: user2.id },
  ]);

  await db.insert(channelAgents).values({ channelId: channel.id, agentId: agent.id });

  return { db, user, user2, server, agent, channel };
}

async function seedPrivateChannel() {
  const { db, user, user2, server, agent, channel: publicChannel } = await seedPublicChannel();

  // user3 is a server member but NOT in the private channel
  const [user3] = await db.insert(users).values({
    email: "carol@test.com", name: "Carol", passwordHash: "x", emailVerified: true,
  }).returning();
  await db.insert(serverMembers).values({ serverId: server.id, userId: user3.id, role: "member" });

  const [privateChannel] = await db.insert(channels).values({
    serverId: server.id, name: "secret", type: "private",
  }).returning();

  // Only user and user2 are in the private channel
  await db.insert(channelHumans).values([
    { channelId: privateChannel.id, userId: user.id },
    { channelId: privateChannel.id, userId: user2.id },
  ]);

  return { db, user, user2, user3, server, agent, publicChannel, privateChannel };
}

function setupDepsForIntegration(serverId: string) {
  // We need to override deps that don't use getDb() or that need special handling.
  // writeMentionFacts uses getDb() directly, so it will use PGlite.
  // But broadcastAndDeliver also calls deps.getChannel, getChannelAgents, etc.
  // For integration tests, we use the real implementations by NOT overriding them.
  // However, we need to stub io-related and push-related deps.
  __setMessageServiceDepsForTests({
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    buildPushTargets: async () => new Map(),
    sendPushNotifications: async () => undefined,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("mention write: resolves user and agent @handles in public channel (server-wide scope)", async () => {
  await initDatabase("pglite://");
  const { db, user, user2, agent, channel, server } = await seedPublicChannel();
  setupDepsForIntegration(server.id);

  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: channel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @Bob and @TestBot check this out",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, channel.id));
  assert.equal(rows.length, 2);

  const userMention = rows.find((r) => r.targetType === "user");
  const agentMention = rows.find((r) => r.targetType === "agent");

  assert.ok(userMention);
  assert.equal(userMention.targetId, user2.id);
  assert.equal(userMention.handleAtSendTime, "Bob"); // raw case preserved
  assert.equal(userMention.source, "send_path");
  assert.equal(userMention.confidence, "exact");

  assert.ok(agentMention);
  assert.equal(agentMention.targetId, agent.id);
  assert.equal(agentMention.handleAtSendTime, "TestBot"); // raw case preserved
});

test("mention write: stores message_seq from the created message", async () => {
  await initDatabase("pglite://");
  const { db, user, user2, channel, server } = await seedPublicChannel();
  setupDepsForIntegration(server.id);

  const enriched = await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: channel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "ping @Bob",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, channel.id));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].messageSeq, enriched.seq);
});
// PLACEHOLDER_TESTS_CONTINUE

test("mention write: private channel scopes resolution to channel members only", async () => {
  await initDatabase("pglite://");
  const { db, user, user2, user3, privateChannel, server } = await seedPrivateChannel();
  setupDepsForIntegration(server.id);

  // user3 (Carol) is a server member but NOT in the private channel.
  // Mentioning @Carol should NOT produce a mention row.
  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: privateChannel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @Bob and @Carol",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, privateChannel.id));
  // Only Bob should be mentioned (he's in the private channel); Carol should not.
  assert.equal(rows.length, 1);
  assert.equal(rows[0].targetId, user2.id);
  assert.equal(rows[0].handleAtSendTime, "Bob");
});

test("mention write: replay (duplicate agentSendKey) does not duplicate mention facts", async () => {
  await initDatabase("pglite://");
  const { db, user, user2, agent, channel, server } = await seedPublicChannel();
  setupDepsForIntegration(server.id);

  const opts = {
    channelId: channel.id,
    senderType: "agent" as const,
    senderId: agent.id,
    senderName: "TestBot",
    content: "hello @Bob",
    agentSendKey: "idempotent-key-1",
  };

  // First send
  await broadcastAndDeliver(createIo(), noopOrchestrator, opts);
  // Replay (same agentSendKey)
  await broadcastAndDeliver(createIo(), noopOrchestrator, opts);

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, channel.id));
  // Should have exactly 1 mention row, not 2
  assert.equal(rows.length, 1);
  assert.equal(rows[0].targetId, user2.id);
});

test("mention write: preserves raw handle case (rename-immune audit)", async () => {
  await initDatabase("pglite://");
  const { db, user, user2, channel, server } = await seedPublicChannel();
  setupDepsForIntegration(server.id);

  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: channel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @BOB are you there?",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, channel.id));
  assert.equal(rows.length, 1);
  // Should store "BOB" (raw from message), not "bob" (lowercase)
  assert.equal(rows[0].handleAtSendTime, "BOB");
});

test("mention write: no rows written when no @handles match any member", async () => {
  await initDatabase("pglite://");
  const { db, user, channel, server } = await seedPublicChannel();
  setupDepsForIntegration(server.id);

  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: channel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @nonexistent_user check this",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, channel.id));
  assert.equal(rows.length, 0);
});

test("mention write: DM scopes resolution to DM participants only", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [user] = await db.insert(users).values({
    email: "alice@test.com", name: "Alice", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user2] = await db.insert(users).values({
    email: "bob@test.com", name: "Bob", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user3] = await db.insert(users).values({
    email: "carol@test.com", name: "Carol", passwordHash: "x", emailVerified: true,
  }).returning();
  const [server] = await db.insert(servers).values({
    name: "TestServer", slug: "test", ownerId: user.id,
  }).returning();
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: user.id, role: "owner" },
    { serverId: server.id, userId: user2.id, role: "member" },
    { serverId: server.id, userId: user3.id, role: "member" },
  ]);
  // DM channel with only Alice and Bob
  const [dmChannel] = await db.insert(channels).values({
    serverId: server.id, name: "dm-alice-bob", type: "dm",
  }).returning();
  await db.insert(channelHumans).values([
    { channelId: dmChannel.id, userId: user.id },
    { channelId: dmChannel.id, userId: user2.id },
  ]);

  setupDepsForIntegration(server.id);

  // Mention @Carol who is a server member but NOT in this DM
  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: dmChannel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @Carol and @Bob",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, dmChannel.id));
  // Only Bob should be mentioned (DM participant); Carol should not
  assert.equal(rows.length, 1);
  assert.equal(rows[0].targetId, user2.id);
  assert.equal(rows[0].handleAtSendTime, "Bob");
});

test("mention write: thread resolves via parent public channel (server-wide scope)", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [user] = await db.insert(users).values({
    email: "alice@test.com", name: "Alice", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user2] = await db.insert(users).values({
    email: "bob@test.com", name: "Bob", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user3] = await db.insert(users).values({
    email: "carol@test.com", name: "Carol", passwordHash: "x", emailVerified: true,
  }).returning();
  const [server] = await db.insert(servers).values({
    name: "TestServer", slug: "test", ownerId: user.id,
  }).returning();
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: user.id, role: "owner" },
    { serverId: server.id, userId: user2.id, role: "member" },
    { serverId: server.id, userId: user3.id, role: "member" },
  ]);
  const [parentChannel] = await db.insert(channels).values({
    serverId: server.id, name: "general", type: "channel",
  }).returning();
  await db.insert(channelHumans).values([
    { channelId: parentChannel.id, userId: user.id },
    { channelId: parentChannel.id, userId: user2.id },
  ]);
  // Create a parent message for the thread
  const [parentMsg] = await db.insert(messages).values({
    channelId: parentChannel.id, senderType: "user", senderId: user.id,
    content: "parent message", messageType: "chat", searchText: "parent message",
  }).returning();
  // Thread channel
  const [threadChannel] = await db.insert(channels).values({
    serverId: server.id, name: `thread-${parentMsg.id.slice(0, 8)}`, type: "thread",
    parentMessageId: parentMsg.id,
  }).returning();
  // Only Alice is in the thread channel (as a follower)
  await db.insert(channelHumans).values({ channelId: threadChannel.id, userId: user.id });

  setupDepsForIntegration(server.id);

  // Mention @Carol in thread — parent is public channel, so server-wide scope applies.
  // Carol is a server member, so she should be resolved even though she's not in the thread.
  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: threadChannel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @Carol check this thread",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, threadChannel.id));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].targetId, user3.id);
  assert.equal(rows[0].handleAtSendTime, "Carol");
});
// PLACEHOLDER_MORE_TESTS

test("mention write: thread under DM resolves via DM participants only", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [user] = await db.insert(users).values({
    email: "alice@test.com", name: "Alice", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user2] = await db.insert(users).values({
    email: "bob@test.com", name: "Bob", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user3] = await db.insert(users).values({
    email: "carol@test.com", name: "Carol", passwordHash: "x", emailVerified: true,
  }).returning();
  const [server] = await db.insert(servers).values({
    name: "TestServer", slug: "test", ownerId: user.id,
  }).returning();
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: user.id, role: "owner" },
    { serverId: server.id, userId: user2.id, role: "member" },
    { serverId: server.id, userId: user3.id, role: "member" },
  ]);
  // DM between Alice and Bob
  const [dmChannel] = await db.insert(channels).values({
    serverId: server.id, name: "dm-alice-bob", type: "dm",
  }).returning();
  await db.insert(channelHumans).values([
    { channelId: dmChannel.id, userId: user.id },
    { channelId: dmChannel.id, userId: user2.id },
  ]);
  // Parent message in the DM
  const [parentMsg] = await db.insert(messages).values({
    channelId: dmChannel.id, senderType: "user", senderId: user.id,
    content: "DM parent", messageType: "chat", searchText: "DM parent",
  }).returning();
  // Thread under the DM
  const [threadChannel] = await db.insert(channels).values({
    serverId: server.id, name: `thread-${parentMsg.id.slice(0, 8)}`, type: "thread",
    parentMessageId: parentMsg.id,
  }).returning();
  await db.insert(channelHumans).values({ channelId: threadChannel.id, userId: user.id });

  setupDepsForIntegration(server.id);

  // Mention @Carol in DM thread — parent is DM, so only DM participants are in scope.
  // Carol is a server member but NOT a DM participant.
  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: threadChannel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @Carol and @Bob",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, threadChannel.id));
  // Only Bob (DM participant) should be mentioned; Carol should NOT
  assert.equal(rows.length, 1);
  assert.equal(rows[0].targetId, user2.id);
});

test("mention write: ambiguous handle writes both user and agent edges", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [user] = await db.insert(users).values({
    email: "alice@test.com", name: "Alice", passwordHash: "x", emailVerified: true,
  }).returning();
  // Human named "applepi"
  const [user2] = await db.insert(users).values({
    email: "applepi@test.com", name: "applepi", passwordHash: "x", emailVerified: true,
  }).returning();
  const [server] = await db.insert(servers).values({
    name: "TestServer", slug: "test", ownerId: user.id,
  }).returning();
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: user.id, role: "owner" },
    { serverId: server.id, userId: user2.id, role: "member" },
  ]);
  // Agent also named "applepi"
  const [agent] = await db.insert(agents).values({
    serverId: server.id, name: "applepi", status: "active", model: "sonnet", runtime: "claude", executionMode: "byoc",
  }).returning();
  const [channel] = await db.insert(channels).values({
    serverId: server.id, name: "general", type: "channel",
  }).returning();
  await db.insert(channelHumans).values([
    { channelId: channel.id, userId: user.id },
    { channelId: channel.id, userId: user2.id },
  ]);
  await db.insert(channelAgents).values({ channelId: channel.id, agentId: agent.id });

  setupDepsForIntegration(server.id);

  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: channel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @applepi",
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, channel.id));
  // Should have TWO rows: one for user "applepi" and one for agent "applepi"
  assert.equal(rows.length, 2);
  const types = rows.map((r) => r.targetType).sort();
  assert.deepEqual(types, ["agent", "user"]);
});

test("mention write: structured mention selects one same-handle entity", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [user] = await db.insert(users).values({
    email: "alice@test.com", name: "Alice", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user2] = await db.insert(users).values({
    email: "applepi@test.com", name: "applepi", passwordHash: "x", emailVerified: true,
  }).returning();
  const [server] = await db.insert(servers).values({
    name: "TestServer", slug: "structured-mention", ownerId: user.id,
  }).returning();
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: user.id, role: "owner" },
    { serverId: server.id, userId: user2.id, role: "member" },
  ]);
  const [agent] = await db.insert(agents).values({
    serverId: server.id, name: "applepi", status: "active", model: "sonnet", runtime: "claude", executionMode: "byoc",
  }).returning();
  const [channel] = await db.insert(channels).values({
    serverId: server.id, name: "general", type: "channel",
  }).returning();
  await db.insert(channelHumans).values([
    { channelId: channel.id, userId: user.id },
    { channelId: channel.id, userId: user2.id },
  ]);
  await db.insert(channelAgents).values({ channelId: channel.id, agentId: agent.id });

  setupDepsForIntegration(server.id);

  await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: channel.id,
    senderType: "user",
    senderId: user.id,
    senderName: "Alice",
    content: "hey @applepi",
    mentions: [{ type: "user", id: user2.id, name: "applepi" }],
  });

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, channel.id));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].targetType, "user");
  assert.equal(rows[0].targetId, user2.id);
});

test("mention write: structured mention rejects invisible target even when handle text matches", async () => {
  await initDatabase("pglite://");
  const { db, user, user3, privateChannel, server } = await seedPrivateChannel();
  setupDepsForIntegration(server.id);

  await assert.rejects(
    () => broadcastAndDeliver(createIo(), noopOrchestrator, {
      channelId: privateChannel.id,
      senderType: "user",
      senderId: user.id,
      senderName: "Alice",
      content: "hey @Carol",
      mentions: [{ type: "user", id: user3.id, name: "Carol" }],
    }),
    MentionValidationError,
  );

  const rows = await db.select().from(messageMentions).where(eq(messageMentions.channelId, privateChannel.id));
  assert.equal(rows.length, 0);
});

test("inbox: hasMention is true for unread mentions and false after markRead", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [user] = await db.insert(users).values({
    email: "alice@test.com", name: "Alice", passwordHash: "x", emailVerified: true,
  }).returning();
  const [user2] = await db.insert(users).values({
    email: "bob@test.com", name: "Bob", passwordHash: "x", emailVerified: true,
  }).returning();
  const [server] = await db.insert(servers).values({
    name: "TestServer", slug: "test", ownerId: user.id,
  }).returning();
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: user.id, role: "owner" },
    { serverId: server.id, userId: user2.id, role: "member" },
  ]);
  const [channel] = await db.insert(channels).values({
    serverId: server.id, name: "general", type: "channel",
  }).returning();
  await db.insert(channelHumans).values([
    { channelId: channel.id, userId: user.id },
    { channelId: channel.id, userId: user2.id },
  ]);

  setupDepsForIntegration(server.id);

  // Bob sends a message mentioning Alice
  const enriched = await broadcastAndDeliver(createIo(), noopOrchestrator, {
    channelId: channel.id,
    senderType: "user",
    senderId: user2.id,
    senderName: "Bob",
    content: "hey @Alice check this",
  });

  // Alice's inbox should show hasMention=true (she hasn't read yet)
  const before = await getInboxItems(server.id, user.id);
  const channelItem = before.items.find((i) => i.kind === "channel" && i.channelId === channel.id);
  assert.ok(channelItem, "channel should appear in inbox");
  assert.equal(channelItem.hasMention, true, "hasMention should be true before markRead");

  // Alice reads up to the mention message
  await markRead(user.id, channel.id, enriched.seq);

  // Alice's inbox should now show hasMention=false
  const after = await getInboxItems(server.id, user.id);
  const channelItemAfter = after.items.find((i) => i.kind === "channel" && i.channelId === channel.id);
  // After reading, either the item is gone (no unread) or hasMention is false
  if (channelItemAfter) {
    assert.equal(channelItemAfter.hasMention, false, "hasMention should be false after markRead");
  }
  // If item is absent that's also correct — no unread items means no mention badge

  // Plan A (#proj-uiux:6beb878c msg=691ade99): the Mentions filter must keep
  // the row even after the @mention has been read — the user's mental model is
  // "show every channel/thread where someone has @-mentioned me", not "show
  // every channel/thread where there's an unread @mention".
  const mentionsAfter = await getInboxItems(server.id, user.id, { filter: "mentions" });
  assert.ok(
    mentionsAfter.items.some((i) => i.kind === "channel" && i.channelId === channel.id),
    "mentions filter should keep the row after the @mention is read (Plan A)",
  );
});
