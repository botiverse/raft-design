import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildPushTargetsFromContext, broadcastAndDeliver, __resetMessageServiceDepsForTests, __setMessageServiceDepsForTests } from "./messageService.js";
import { __resetAgentSendReplayDbForTests, __setAgentSendReplayDbForTests } from "./agentSendReplayService.js";
import { attachments, messages } from "../db/schema.js";

afterEach(() => {
  __resetMessageServiceDepsForTests();
  __resetAgentSendReplayDbForTests();
});

function createAgentSendReplayDb() {
  let seq = 100;
  let insertAttempts = 0;
  let insertedRows = 0;
  const byKey = new Map<string, any>();

  const tx = {
    insert(table: unknown) {
      return {
        values(values: Record<string, unknown>) {
          return {
            onConflictDoNothing() {
              return {
                returning() {
                  insertAttempts += 1;
                  if (table !== messages) return Promise.resolve([]);
                  const senderId = String(values.senderId);
                  const agentSendKey = String(values.agentSendKey);
                  const key = `${senderId}:${agentSendKey}`;
                  const existing = byKey.get(key);
                  if (existing) return Promise.resolve([]);

                  const createdAt = new Date(`2026-04-17T00:00:${String(seq - 99).padStart(2, "0")}.000Z`);
                  const row = {
                    id: `msg-${seq}`,
                    seq,
                    channelId: values.channelId,
                    senderType: "agent",
                    senderId,
                    agentSendKey,
                    messageType: "chat",
                    content: values.content,
                    searchText: values.searchText ?? values.content,
                    searchVector: null,
                    threadId: null,
                    taskStatus: null,
                    taskNumber: null,
                    taskAssigneeType: null,
                    taskAssigneeId: null,
                    taskClaimedAt: null,
                    taskCompletedAt: null,
                    createdAt,
                    updatedAt: createdAt,
                  };
                  byKey.set(key, row);
                  seq += 1;
                  insertedRows += 1;
                  return Promise.resolve([row]);
                },
              };
            },
          };
        },
      };
    },
    update(table: unknown) {
      return {
        set() {
          return {
            where() {
              return {
                returning() {
                  if (table === attachments) return Promise.resolve([]);
                  return Promise.resolve([]);
                },
              };
            },
          };
        },
      };
    },
    select() {
      return {
        from(table: unknown) {
          return {
            where() {
              const rows = table === messages ? [...byKey.values()] : [];
              const afterWhere: any = {
                limit() {
                  return Promise.resolve(rows);
                },
                then(resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) {
                  return Promise.resolve(rows).then(resolve, reject);
                },
              };
              return afterWhere;
            },
          };
        },
      };
    },
  };

  return {
    db: {
      transaction: async (fn: (tx: any) => Promise<unknown>) => fn(tx),
    },
    stats() {
      return { insertAttempts, insertedRows };
    },
  };
}

function createIoRecorder() {
  const events: { room: string; event: string; payload: any }[] = [];
  const io = {
    to(room: string) {
      return {
        emit(event: string, payload: any) {
          events.push({ room, event, payload });
        },
      };
    },
    in() {
      return {
        in() {
          return {
            socketsJoin() {},
          };
        },
        socketsJoin() {},
      };
    },
  };
  return { io: io as any, events };
}

test("buildPushTargetsFromContext builds DM pushes and excludes the sender", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    serverName: "Acme Workspace",
    channel: { id: "dm-1", type: "dm", name: "ray", parentMessageId: null },
    messageId: "msg-1",
    senderId: "user-1",
    senderType: "user",
    senderName: "Ray",
    body: "hello",
    dmHumans: [
      { id: "user-1", name: "ray" },
      { id: "user-2", name: "tygg" },
    ],
  });

  assert.deepEqual([...targets.entries()], [[
    "user-2",
    {
      title: "DM · Acme Workspace",
      body: "Ray: hello",
      tag: "message:msg-1",
      url: "/s/acme/dm/dm-1?msg=msg-1",
    },
  ]]);
});

test("buildPushTargetsFromContext pushes channel messages to all joined humans and uses mention-specific titles", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    serverName: "Acme Workspace",
    channel: { id: "channel-1", type: "channel", name: "engineering", parentMessageId: null },
    messageId: "msg-2",
    senderId: "user-1",
    senderType: "user",
    senderName: "Ray",
    body: "hi @tygg",
    mentionNames: new Set(["tygg"]),
    humanScopeMembers: [
      { id: "user-1", name: "ray" },
      { id: "user-2", name: "tygg" },
      { id: "user-3", name: "applepi" },
    ],
  });

  assert.deepEqual([...targets.entries()], [
    [
      "user-2",
      {
        title: "#engineering · Acme Workspace",
        body: "Ray mentioned you: hi @tygg",
        tag: "message:msg-2",
        url: "/s/acme/channel/channel-1?msg=msg-2",
      },
    ],
    [
      "user-3",
      {
        title: "#engineering · Acme Workspace",
        body: "Ray: hi @tygg",
        tag: "message:msg-2",
        url: "/s/acme/channel/channel-1?msg=msg-2",
      },
    ],
  ]);
});

test("buildPushTargetsFromContext excludes users who muted the server", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    serverName: "Acme Workspace",
    channel: { id: "channel-1", type: "channel", name: "engineering", parentMessageId: null },
    messageId: "msg-muted",
    senderId: "user-1",
    senderType: "user",
    senderName: "Ray",
    body: "hi @tygg",
    mentionNames: new Set(["tygg"]),
    mutedUserIds: new Set(["user-2"]),
    humanScopeMembers: [
      { id: "user-1", name: "ray" },
      { id: "user-2", name: "tygg" },
      { id: "user-3", name: "applepi" },
    ],
  });

  assert.deepEqual([...targets.entries()], [[
    "user-3",
    {
      title: "#engineering · Acme Workspace",
      body: "Ray: hi @tygg",
      tag: "message:msg-muted",
      url: "/s/acme/channel/channel-1?msg=msg-muted",
    },
  ]]);
});

test("buildPushTargetsFromContext also notifies visible non-joined humans when they are mentioned in a public channel", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    serverName: "Acme Workspace",
    channel: { id: "channel-1", type: "channel", name: "engineering", parentMessageId: null },
    messageId: "msg-2b",
    senderId: "user-1",
    senderType: "user",
    senderName: "Ray",
    body: "hi @tygg and @applepi",
    mentionNames: new Set(["tygg", "applepi"]),
    humanScopeMembers: [
      { id: "user-1", name: "ray" },
      { id: "user-2", name: "tygg" },
    ],
    humanMentionOnlyMembers: [{ id: "user-3", name: "applepi" }],
  });

  assert.deepEqual([...targets.entries()], [
    [
      "user-2",
      {
        title: "#engineering · Acme Workspace",
        body: "Ray mentioned you: hi @tygg and @applepi",
        tag: "message:msg-2b",
        url: "/s/acme/channel/channel-1?msg=msg-2b",
      },
    ],
    [
      "user-3",
      {
        title: "#engineering · Acme Workspace",
        body: "Ray mentioned you: hi @tygg and @applepi",
        tag: "message:msg-2b",
        url: "/s/acme/channel/channel-1?msg=msg-2b",
      },
    ],
  ]);
});

test("buildPushTargetsFromContext does not notify non-members mentioned in a private channel", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    serverName: "Acme Workspace",
    channel: { id: "private-1", type: "private", name: "secret", parentMessageId: null },
    messageId: "msg-private",
    senderId: "user-1",
    senderType: "user",
    senderName: "Ray",
    body: "hi @tygg and @applepi",
    mentionNames: new Set(["tygg", "applepi"]),
    humanScopeMembers: [
      { id: "user-1", name: "ray" },
      { id: "user-2", name: "tygg" },
    ],
    humanMentionOnlyMembers: [{ id: "user-3", name: "applepi" }],
  });

  assert.deepEqual([...targets.entries()], [[
    "user-2",
    {
      title: "#secret · Acme Workspace",
      body: "Ray mentioned you: hi @tygg and @applepi",
      tag: "message:msg-private",
      url: "/s/acme/channel/private-1?msg=msg-private",
    },
  ]]);
});

test("buildPushTargetsFromContext pushes thread replies only to followed humans", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    serverName: "Acme Workspace",
    channel: { id: "thread-1", type: "thread", name: "thread-1", parentMessageId: "parent-1" },
    messageId: "msg-3",
    senderId: "agent-1",
    senderType: "agent",
    senderName: "Ray",
    body: "please take a look",
    parentChannel: { id: "channel-1", type: "channel", name: "engineering" },
    followedUserIds: ["user-1"],
    mentionNames: new Set(["tygg"]),
    humanScopeMembers: [{ id: "user-1", name: "tygg" }],
  });

  assert.deepEqual([...targets.entries()], [[
    "user-1",
    {
      title: "Thread in #engineering · Acme Workspace",
      body: "Ray: please take a look",
      tag: "message:msg-3",
      url: "/s/acme/channel/channel-1?thread=channel-1%3Aparent-1&msg=msg-3",
    },
  ]]);
});

test("buildPushTargetsFromContext excludes muted users from followed thread reply pushes", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    serverName: "Acme Workspace",
    channel: { id: "thread-1", type: "thread", name: "thread-1", parentMessageId: "parent-1" },
    messageId: "msg-thread-muted",
    senderId: "agent-1",
    senderType: "agent",
    senderName: "Ray",
    body: "please take a look",
    parentChannel: { id: "channel-1", type: "channel", name: "engineering" },
    followedUserIds: ["user-1", "user-2"],
    mutedUserIds: new Set(["user-1"]),
  });

  assert.deepEqual([...targets.entries()], [[
    "user-2",
    {
      title: "Thread in #engineering · Acme Workspace",
      body: "Ray: please take a look",
      tag: "message:msg-thread-muted",
      url: "/s/acme/channel/channel-1?thread=channel-1%3Aparent-1&msg=msg-thread-muted",
    },
  ]]);
});

test("buildPushTargetsFromContext does not push thread replies to non-followed mentions", () => {
  const targets = buildPushTargetsFromContext({
    serverSlug: "acme",
    channel: { id: "thread-2", type: "thread", name: "thread-2", parentMessageId: "parent-2" },
    messageId: "msg-4",
    senderId: "user-1",
    senderType: "user",
    senderName: "Ray",
    body: "ping",
    parentChannel: { id: "dm-2", type: "dm", name: "ray" },
    mentionNames: new Set(["tygg"]),
    humanScopeMembers: [{ id: "user-2", name: "tygg" }],
  });

  assert.deepEqual([...targets.entries()], []);
});

test("broadcastAndDeliver replays the original persisted agent send and re-broadcasts the same message on retry", async () => {
  const replayDb = createAgentSendReplayDb();
  __setAgentSendReplayDbForTests(() => replayDb.db as any);

  const markAgentReadCalls: { senderId: string; channelId: string; seq: number }[] = [];
  __setMessageServiceDepsForTests({
    getChannel: async (channelId: string) => ({
      id: channelId,
      serverId: "server-1",
      type: "channel",
      name: "engineering",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [],
    getChannelHumans: async () => [],
    assertChannelNotArchived: async () => undefined,
    markAgentRead: async (senderId: string, channelId: string, seq: number) => {
      markAgentReadCalls.push({ senderId, channelId, seq });
    },
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    buildPushTargets: async () => new Map(),
  });

  const { io, events } = createIoRecorder();
  const agentOrchestrator = { deliverMessage: async () => undefined } as any;
  const sendOpts = {
    channelId: "channel-1",
    senderType: "agent" as const,
    senderId: "agent-1",
    senderName: "Agent One",
    content: "hello from retry-safe send",
    agentSendKey: "send-key-1",
  };

  const first = await broadcastAndDeliver(io, agentOrchestrator, sendOpts);
  const second = await broadcastAndDeliver(io, agentOrchestrator, sendOpts);

  assert.equal(first.id, second.id);
  assert.equal(first.seq, second.seq);
  assert.equal(replayDb.stats().insertedRows, 1);
  assert.equal(replayDb.stats().insertAttempts, 2);
  assert.equal(markAgentReadCalls.length, 1);

  const newMessageEvents = events.filter((entry) => entry.event === "message:new");
  assert.equal(newMessageEvents.length, 2);
  assert.deepEqual(
    newMessageEvents.map((entry) => ({
      room: entry.room,
      messageId: entry.payload.id,
      seq: entry.payload.seq,
      senderName: entry.payload.senderName,
    })),
    [
      { room: "channel:channel-1", messageId: first.id, seq: first.seq, senderName: "Agent One" },
      { room: "channel:channel-1", messageId: first.id, seq: first.seq, senderName: "Agent One" },
    ],
  );
});

test("broadcastAndDeliver keeps keyless agent sends on the legacy non-idempotent path", async () => {
  const replayDb = createAgentSendReplayDb();
  __setAgentSendReplayDbForTests(() => replayDb.db as any);

  let nextSeq = 200;
  __setMessageServiceDepsForTests({
    createMessage: async (channelId, senderType, senderId, content, messageType = "chat") => {
      const createdAt = new Date(`2026-04-17T00:01:${String(nextSeq - 199).padStart(2, "0")}.000Z`);
      return {
        id: `legacy-msg-${nextSeq}`,
        seq: nextSeq++,
        channelId,
        senderType,
        senderId,
        agentSendKey: null,
        messageType,
        content,
        searchText: content,
        searchVector: null,
        threadId: null,
        taskStatus: null,
        taskNumber: null,
        taskAssigneeType: null,
        taskAssigneeId: null,
        taskClaimedAt: null,
        taskCompletedAt: null,
        createdAt,
        updatedAt: createdAt,
      } as any;
    },
    getChannel: async (channelId: string) => ({
      id: channelId,
      serverId: "server-1",
      type: "channel",
      name: "engineering",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [],
    getChannelHumans: async () => [],
    assertChannelNotArchived: async () => undefined,
    markAgentRead: async () => undefined,
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    buildPushTargets: async () => new Map(),
  });
  const { io, events } = createIoRecorder();
  const agentOrchestrator = { deliverMessage: async () => undefined } as any;
  const sendOpts = {
    channelId: "channel-1",
    senderType: "agent" as const,
    senderId: "agent-1",
    senderName: "Agent One",
    content: "legacy send path",
  };

  const first = await broadcastAndDeliver(io, agentOrchestrator, sendOpts);
  const second = await broadcastAndDeliver(io, agentOrchestrator, sendOpts);

  assert.notEqual(first.id, second.id);
  assert.notEqual(first.seq, second.seq);
  assert.equal(replayDb.stats().insertAttempts, 0);

  const newMessageEvents = events.filter((entry) => entry.event === "message:new");
  assert.equal(newMessageEvents.length, 2);
  assert.deepEqual(
    newMessageEvents.map((entry) => ({ id: entry.payload.id, seq: entry.payload.seq })),
    [
      { id: first.id, seq: first.seq },
      { id: second.id, seq: second.seq },
    ],
  );
});

test("broadcastAndDeliver lets tests stub the archive gate without initializing the real DB", async () => {
  let archiveChecks = 0;
  let createCalls = 0;
  __setMessageServiceDepsForTests({
    assertChannelNotArchived: async () => {
      archiveChecks += 1;
    },
    createMessage: async (channelId, senderType, senderId, content, messageType = "chat") => {
      createCalls += 1;
      const createdAt = new Date("2026-04-21T00:00:01.000Z");
      return {
        id: "stub-msg-1",
        seq: 1,
        channelId,
        senderType,
        senderId,
        agentSendKey: null,
        messageType,
        content,
        searchText: content,
        searchVector: null,
        threadId: null,
        taskStatus: null,
        taskNumber: null,
        taskAssigneeType: null,
        taskAssigneeId: null,
        taskClaimedAt: null,
        taskCompletedAt: null,
        createdAt,
        updatedAt: createdAt,
      } as any;
    },
    getChannel: async (channelId: string) => ({
      id: channelId,
      serverId: "server-1",
      type: "channel",
      name: "engineering",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [],
    getChannelHumans: async () => [],
    markRead: async () => undefined,
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    buildPushTargets: async () => new Map(),
    sendPushNotifications: async () => undefined,
  });

  const { io } = createIoRecorder();
  const agentOrchestrator = { deliverMessage: async () => undefined } as any;

  const message = await broadcastAndDeliver(io, agentOrchestrator, {
    channelId: "channel-1",
    senderType: "user",
    senderId: "user-1",
    senderName: "Ray",
    content: "archive seam stays mockable",
  });

  assert.equal(archiveChecks, 1);
  assert.equal(createCalls, 1);
  assert.equal(message.id, "stub-msg-1");
});

test("broadcastAndDeliver delivers a public-channel mention to a visible agent that has not joined", async () => {
  const deliveries: { agentId: string; payload: any }[] = [];
  __setMessageServiceDepsForTests({
    createMessage: async () => ({
      id: "msg-mention",
      seq: 42,
      channelId: "channel-1",
      senderType: "user",
      senderId: "user-1",
      content: "hello @applepi",
      searchText: "hello @applepi",
      messageType: "chat",
      threadId: null,
      taskStatus: null,
      taskNumber: null,
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      taskCompletedAt: null,
      createdAt: new Date("2026-04-19T12:00:00.000Z"),
      updatedAt: new Date("2026-04-19T12:00:00.000Z"),
      actionMetadata: null,
    } as any),
    getChannel: async () => ({
      id: "channel-1",
      serverId: "server-1",
      type: "channel",
      name: "engineering",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [{ id: "agent-joined", name: "joined-agent" }] as any,
    listAgents: async () => [
      { id: "agent-joined", name: "joined-agent" },
      { id: "agent-mentioned", name: "applepi" },
    ] as any,
    getChannelHumans: async () => [],
    assertChannelNotArchived: async () => undefined,
    markRead: async () => undefined,
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    buildPushTargets: async () => new Map(),
    getServerMembers: async () => [],
    insertMentionRows: async () => undefined,
  });

  const { io } = createIoRecorder();
  const agentOrchestrator = {
    deliverMessage: async (agentId: string, payload: any) => {
      deliveries.push({ agentId, payload });
    },
  } as any;

  await broadcastAndDeliver(io, agentOrchestrator, {
    channelId: "channel-1",
    senderType: "user",
    senderId: "user-1",
    senderName: "Ray",
    content: "hello @applepi",
  });

  assert.deepEqual(deliveries.map((entry) => entry.agentId), ["agent-joined", "agent-mentioned"]);
  assert.equal(deliveries[1]?.payload.channel_type, "channel");
  assert.equal(deliveries[1]?.payload.channel_name, "engineering");
  assert.equal(deliveries[1]?.payload.content, "hello @applepi");
});

test("broadcastAndDeliver does not deliver ordinary public-channel traffic to non-joined agents", async () => {
  const deliveries: { agentId: string; payload: any }[] = [];
  __setMessageServiceDepsForTests({
    createMessage: async () => ({
      id: "msg-ordinary",
      seq: 43,
      channelId: "channel-1",
      senderType: "user",
      senderId: "user-1",
      content: "hello everyone",
      searchText: "hello everyone",
      messageType: "chat",
      threadId: null,
      taskStatus: null,
      taskNumber: null,
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      taskCompletedAt: null,
      createdAt: new Date("2026-04-19T12:01:00.000Z"),
      updatedAt: new Date("2026-04-19T12:01:00.000Z"),
      actionMetadata: null,
    } as any),
    getChannel: async () => ({
      id: "channel-1",
      serverId: "server-1",
      type: "channel",
      name: "engineering",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [{ id: "agent-joined", name: "joined-agent" }] as any,
    listAgents: async () => [
      { id: "agent-joined", name: "joined-agent" },
      { id: "agent-unjoined", name: "applepi" },
    ] as any,
    getChannelHumans: async () => [],
    assertChannelNotArchived: async () => undefined,
    markRead: async () => undefined,
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    buildPushTargets: async () => new Map(),
  });

  const { io } = createIoRecorder();
  const agentOrchestrator = {
    deliverMessage: async (agentId: string, payload: any) => {
      deliveries.push({ agentId, payload });
    },
  } as any;

  await broadcastAndDeliver(io, agentOrchestrator, {
    channelId: "channel-1",
    senderType: "user",
    senderId: "user-1",
    senderName: "Ray",
    content: "hello everyone",
  });

  assert.deepEqual(deliveries.map((entry) => entry.agentId), ["agent-joined"]);
});

test("broadcastAndDeliver marks owner/admin sender delivery as admin authority", async () => {
  const deliveries: { agentId: string; payload: any; options: any }[] = [];
  __setMessageServiceDepsForTests({
    createMessage: async () => ({
      id: "msg-owner",
      seq: 45,
      channelId: "channel-1",
      senderType: "user",
      senderId: "owner-1",
      content: "please wake",
      searchText: "please wake",
      messageType: "chat",
      threadId: null,
      taskStatus: null,
      taskNumber: null,
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      taskCompletedAt: null,
      createdAt: new Date("2026-04-19T12:02:00.000Z"),
      updatedAt: new Date("2026-04-19T12:02:00.000Z"),
      actionMetadata: null,
    } as any),
    getChannel: async () => ({
      id: "channel-1",
      serverId: "server-1",
      type: "channel",
      name: "engineering",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [{ id: "agent-joined", name: "joined-agent" }] as any,
    listAgents: async () => [{ id: "agent-joined", name: "joined-agent" }] as any,
    getChannelHumans: async () => [],
    assertChannelNotArchived: async () => undefined,
    markRead: async () => undefined,
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    getMemberRole: async () => "owner",
    buildPushTargets: async () => new Map(),
    insertMentionRows: async () => undefined,
  });

  const { io } = createIoRecorder();
  const agentOrchestrator = {
    deliverMessage: async (agentId: string, payload: any, options: any) => {
      deliveries.push({ agentId, payload, options });
    },
  } as any;

  await broadcastAndDeliver(io, agentOrchestrator, {
    channelId: "channel-1",
    senderType: "user",
    senderId: "owner-1",
    senderName: "Owner",
    content: "please wake",
  });

  assert.deepEqual(deliveries.map((entry) => entry.agentId), ["agent-joined"]);
  assert.deepEqual(deliveries[0]?.options, { adminAuthority: true });
});

test("broadcastAndDeliver leaves member sender delivery subject to inbox receive scope", async () => {
  const deliveries: { agentId: string; payload: any; options: any }[] = [];
  __setMessageServiceDepsForTests({
    createMessage: async () => ({
      id: "msg-member",
      seq: 46,
      channelId: "channel-1",
      senderType: "user",
      senderId: "member-1",
      content: "please wake",
      searchText: "please wake",
      messageType: "chat",
      threadId: null,
      taskStatus: null,
      taskNumber: null,
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      taskCompletedAt: null,
      createdAt: new Date("2026-04-19T12:03:00.000Z"),
      updatedAt: new Date("2026-04-19T12:03:00.000Z"),
      actionMetadata: null,
    } as any),
    getChannel: async () => ({
      id: "channel-1",
      serverId: "server-1",
      type: "channel",
      name: "engineering",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [{ id: "agent-joined", name: "joined-agent" }] as any,
    listAgents: async () => [{ id: "agent-joined", name: "joined-agent" }] as any,
    getChannelHumans: async () => [],
    assertChannelNotArchived: async () => undefined,
    markRead: async () => undefined,
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    getMemberRole: async () => "member",
    buildPushTargets: async () => new Map(),
    insertMentionRows: async () => undefined,
  });

  const { io } = createIoRecorder();
  const agentOrchestrator = {
    deliverMessage: async (agentId: string, payload: any, options: any) => {
      deliveries.push({ agentId, payload, options });
    },
  } as any;

  await broadcastAndDeliver(io, agentOrchestrator, {
    channelId: "channel-1",
    senderType: "user",
    senderId: "member-1",
    senderName: "Member",
    content: "please wake",
  });

  assert.deepEqual(deliveries.map((entry) => entry.agentId), ["agent-joined"]);
  assert.deepEqual(deliveries[0]?.options, {});
});

test("broadcastAndDeliver does not deliver private-channel mentions to non-member agents", async () => {
  const deliveries: { agentId: string; payload: any }[] = [];
  __setMessageServiceDepsForTests({
    createMessage: async () => ({
      id: "msg-private-mention",
      seq: 44,
      channelId: "private-1",
      senderType: "user",
      senderId: "user-1",
      content: "hello @applepi",
      searchText: "hello @applepi",
      messageType: "chat",
      threadId: null,
      taskStatus: null,
      taskNumber: null,
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      taskCompletedAt: null,
      createdAt: new Date("2026-04-19T12:02:00.000Z"),
      updatedAt: new Date("2026-04-19T12:02:00.000Z"),
      actionMetadata: null,
    } as any),
    getChannel: async () => ({
      id: "private-1",
      serverId: "server-1",
      type: "private",
      name: "secret",
      parentMessageId: null,
    } as any),
    getChannelAgents: async () => [{ id: "agent-joined", name: "joined-agent" }] as any,
    getChannelMembers: async () => ({
      humans: [],
      agents: [{ id: "agent-joined", name: "joined-agent" }],
    }) as any,
    listAgents: async () => [
      { id: "agent-joined", name: "joined-agent" },
      { id: "agent-mentioned", name: "applepi" },
    ] as any,
    getChannelHumans: async () => [],
    assertChannelNotArchived: async () => undefined,
    markRead: async () => undefined,
    renderAgentReadablePermalinks: async (content: string) => content,
    getSenderIdentity: async (_senderType, _senderId, fallbackName) => ({
      uniqueName: fallbackName,
      description: null,
    }),
    buildPushTargets: async () => new Map(),
    insertMentionRows: async () => undefined,
  });

  const { io } = createIoRecorder();
  const agentOrchestrator = {
    deliverMessage: async (agentId: string, payload: any) => {
      deliveries.push({ agentId, payload });
    },
  } as any;

  await broadcastAndDeliver(io, agentOrchestrator, {
    channelId: "private-1",
    senderType: "user",
    senderId: "user-1",
    senderName: "Ray",
    content: "hello @applepi",
  });

  assert.deepEqual(deliveries.map((entry) => entry.agentId), ["agent-joined"]);
});
