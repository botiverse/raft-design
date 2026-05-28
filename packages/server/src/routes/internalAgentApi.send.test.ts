import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { afterEach, beforeEach } from "node:test";

import argon2 from "argon2";
import { desc, eq } from "drizzle-orm";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";

import { getDb } from "../db/index.js";
import { attestedSendEvents, channels, messages, threadFollows, users } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { createServer } from "../services/serverService.js";
import { createAgent } from "../services/agentService.js";
import { createChannel, addAgent, addHuman, markAgentRead, getAgentReadCursor, getOrCreateThread, findOrCreateDM } from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import { mintAgentCredential } from "../services/agentCredentialService.js";
import * as attestedSendService from "../services/attestedSendService.js";

type Fixture = {
  serverId: string;
  channelId: string;
  channelName: string;
  agentId: string;
  ownerId: string;
  ownerName: string;
  agentApiKey: string;
};

const originalAttestedSendMode = process.env.SLOCK_ATTESTED_SEND_MODE;

beforeEach(() => {
  process.env.SLOCK_ATTESTED_SEND_MODE = "force";
});

afterEach(() => {
  attestedSendService.__resetAttestedSendStateForTest();
  if (originalAttestedSendMode === undefined) {
    delete process.env.SLOCK_ATTESTED_SEND_MODE;
  } else {
    process.env.SLOCK_ATTESTED_SEND_MODE = originalAttestedSendMode;
  }
});

function agentHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function seedFixture(): Promise<Fixture> {
  const db = getDb();
  const suffix = randomUUID();
  const [owner] = await db.insert(users).values({
    email: `agent-api-send-${suffix}@slock.test`,
    name: `agent-api-send-${suffix}`,
    displayName: "Agent API Send Owner",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();

  const server = await createServer("Agent API Send Test", `agent-api-send-${suffix}`, owner.id);
  const agent = await createAgent(server.id, "AgentApiSendBot", { runtime: "claude", model: "sonnet" });
  const channel = await createChannel(server.id, "agent-api-send-room");
  await addHuman(channel.id, owner.id);
  await addAgent(channel.id, agent.id);

  const minted = await mintAgentCredential({
    agentId: agent.id,
    scopes: ["send", "read"],
    name: "agent-api-send-test",
    createdByUserId: null,
  });

  return {
    serverId: server.id,
    channelId: channel.id,
    channelName: channel.name,
    agentId: agent.id,
    ownerId: owner.id,
    ownerName: owner.name,
    agentApiKey: minted.apiKey,
  };
}

async function sendHumanMessage(fixture: Fixture, content: string) {
  return createMessage(fixture.channelId, "user", fixture.ownerId, content);
}

async function sendViaAgentApi(baseUrl: string, fixture: Fixture, body: Record<string, unknown>, apiKey = fixture.agentApiKey) {
  const res = await fetch(`${baseUrl}/internal/agent-api/send`, {
    method: "POST",
    headers: agentHeaders(apiKey),
    body: JSON.stringify(body),
  });
  return {
    status: res.status,
    body: await res.json() as any,
  };
}

async function getMessageChannel(messageId: string) {
  const [row] = await getDb()
    .select({
      messageId: messages.id,
      seq: messages.seq,
      channelId: messages.channelId,
      channelType: channels.type,
      content: messages.content,
    })
    .from(messages)
    .innerJoin(channels, eq(channels.id, messages.channelId))
    .where(eq(messages.id, messageId))
    .limit(1);
  return row;
}

async function latestChannelMessages(channelId: string, limit = 10) {
  return getDb()
    .select({ id: messages.id, seq: messages.seq, content: messages.content })
    .from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.seq))
    .limit(limit);
}

test("agent-api first reply to a fresh channel thread creates the thread and sends", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const parent = await sendHumanMessage(fixture, "fresh thread parent");
    const threadTarget = `#${fixture.channelName}:${parent.id.slice(0, 8)}`;

    const sent = await sendViaAgentApi(app.baseUrl, fixture, {
      target: threadTarget,
      content: "agent-api first thread reply",
      seenUpToSeq: parent.seq,
    });

    assert.equal(sent.status, 200);
    assert.equal(sent.body.state, "sent");
    assert.ok(sent.body.messageId);

    const sentMessage = await getMessageChannel(sent.body.messageId);
    assert.ok(sentMessage, "expected sent message to be persisted");
    assert.equal(sent.body.messageSeq, sentMessage.seq);
    assert.equal(sentMessage.content, "agent-api first thread reply");
    assert.equal(sentMessage.channelType, "thread");
    assert.notEqual(sentMessage.channelId, fixture.channelId);
  } finally {
    await app.close();
  }
});

test("agent-api send records route breakdown trace events", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    app.app.set("serverTracer", new BasicTracer({ sink }));
    const fixture = await seedFixture();
    const parent = await sendHumanMessage(fixture, "trace thread parent");
    const threadTarget = `#${fixture.channelName}:${parent.id.slice(0, 8)}`;

    const sent = await sendViaAgentApi(app.baseUrl, fixture, {
      target: threadTarget,
      content: "agent-api trace reply",
      seenUpToSeq: parent.seq,
    });

    assert.equal(sent.status, 200);
    assert.equal(sent.body.state, "sent");

    const span = sink.getAllSpans().find((candidate) =>
      candidate.name === "server.http.request"
      && candidate.attrs?.route_pattern === "/internal/agent-api/send"
    );
    assert.ok(span, "expected POST /internal/agent-api/send root span");

    const eventNames = span.events
      .map((event) => event.name)
      .filter((name) => name !== "http.response.finished");
    assert.deepEqual(eventNames, [
      "agent_api_send.request.started",
      "agent_api_send.agent.loaded",
      "agent_api_send.target.resolved",
      "agent_api_send.archive.checked",
      "agent_api_send.freshness.evaluated",
      "agent_api_send.commit.finished",
      "response.ready",
    ]);

    const started = span.events.find((event) => event.name === "agent_api_send.request.started");
    assert.ok(started);
    assert.equal(started.attrs?.target_kind, "channel_thread");
    assert.equal(started.attrs?.attachment_count, 0);
    assert.equal(started.attrs?.freshness_requested, true);
    assert.equal("target" in (started.attrs ?? {}), false);
    assert.equal("content" in (started.attrs ?? {}), false);

    const resolved = span.events.find((event) => event.name === "agent_api_send.target.resolved");
    assert.ok(resolved);
    assert.equal(resolved.attrs?.outcome, "resolved");
    assert.equal(resolved.attrs?.target_type, "thread");

    const freshness = span.events.find((event) => event.name === "agent_api_send.freshness.evaluated");
    assert.ok(freshness);
    assert.equal(freshness.attrs?.outcome, "passed");
    assert.equal(freshness.attrs?.boundary_source, "client_seen");
    assert.equal(freshness.attrs?.new_message_count, 0);

    const commit = span.events.find((event) => event.name === "agent_api_send.commit.finished");
    assert.ok(commit);
    assert.equal(commit.attrs?.target_type, "thread");
    assert.equal(commit.attrs?.message_seq_present, true);
  } finally {
    await app.close();
  }
});

test("agent-api first reply reuses an existing empty thread channel", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const parent = await sendHumanMessage(fixture, "opened thread parent");
    const thread = await getOrCreateThread(parent.id, fixture.ownerId, "user");
    const threadTarget = `#${fixture.channelName}:${parent.id.slice(0, 8)}`;

    const sent = await sendViaAgentApi(app.baseUrl, fixture, {
      target: threadTarget,
      content: "agent-api reply in opened empty thread",
      seenUpToSeq: parent.seq,
    });

    assert.equal(sent.status, 200);
    assert.equal(sent.body.state, "sent");

    const sentMessage = await getMessageChannel(sent.body.messageId);
    assert.equal(sentMessage?.channelId, thread.id);
    const [latest] = await latestChannelMessages(thread.id, 1);
    assert.equal(latest?.id, sent.body.messageId);
  } finally {
    await app.close();
  }
});

test("agent-api first reply to a channel thread requires parent channel membership", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const outsider = await createAgent(fixture.serverId, "AgentApiSendOutsider", { runtime: "claude", model: "sonnet" });
    const minted = await mintAgentCredential({
      agentId: outsider.id,
      scopes: ["send", "read"],
      name: "agent-api-send-outsider-test",
      createdByUserId: null,
    });
    const parent = await sendHumanMessage(fixture, "members only thread parent");
    const threadTarget = `#${fixture.channelName}:${parent.id.slice(0, 8)}`;

    const denied = await sendViaAgentApi(app.baseUrl, fixture, {
      target: threadTarget,
      content: "should not send",
      seenUpToSeq: parent.seq,
    }, minted.apiKey);

    assert.equal(denied.status, 403);
    assert.match(denied.body.error, /not a member of the parent channel/);
  } finally {
    await app.close();
  }
});

test("agent-api first reply to a fresh DM thread creates the thread and sends", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const db = getDb();
    const dm = await findOrCreateDM(fixture.serverId, fixture.ownerId, fixture.agentId);
    assert.ok(dm, "expected owner-agent DM to exist");
    const parent = await createMessage(dm.id, "user", fixture.ownerId, "fresh DM thread parent");
    const threadTarget = `dm:@${fixture.ownerName}:${parent.id.slice(0, 8)}`;

    const sent = await sendViaAgentApi(app.baseUrl, fixture, {
      target: threadTarget,
      content: "agent-api first DM thread reply",
      seenUpToSeq: parent.seq,
    });

    assert.equal(sent.status, 200);
    assert.equal(sent.body.state, "sent");

    const sentMessage = await getMessageChannel(sent.body.messageId);
    assert.equal(sentMessage?.channelType, "thread");
    assert.notEqual(sentMessage?.channelId, dm.id);

    const rows = await db
      .select()
      .from(threadFollows)
      .where(eq(threadFollows.threadChannelId, sentMessage!.channelId));
    const agentFollow = rows.find((row) => row.followerType === "agent" && row.followerId === fixture.agentId);
    assert.equal(agentFollow?.reason, "replied", "agent sender should follow the DM thread after first reply");
    const ownerFollow = rows.find((row) => row.followerType === "user" && row.followerId === fixture.ownerId);
    assert.equal(ownerFollow?.reason, "authored", "parent human author should follow the DM thread after first agent reply");
  } finally {
    await app.close();
  }
});

test("agent-api thread-target 404 explains unresolved reply target", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const missing = await sendViaAgentApi(app.baseUrl, fixture, {
      target: `#${fixture.channelName}:deadbeef`,
      content: "missing parent",
      seenUpToSeq: 0,
    });

    assert.equal(missing.status, 404);
    assert.match(missing.body.error, /Thread target not found or not replyable/);
    assert.match(missing.body.error, /parent message must exist/);
  } finally {
    await app.close();
  }
});

test("agent-api send holds stale draft and returns inline held context", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const baseline = await sendHumanMessage(fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    const freshUnread = await sendHumanMessage(fixture, "fresh unread before agent-api send");

    const held = await sendViaAgentApi(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "agent-api draft",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.newMessageCount, 1);
    assert.equal(held.body.shownMessageCount, 1);
    assert.equal(held.body.omittedMessageCount, 0);
    assert.equal(held.body.heldMessages[0].id, freshUnread.id);
    assert.equal(held.body.seenUpToSeq, freshUnread.seq);
    assert.equal(await getAgentReadCursor(fixture.agentId, fixture.channelId), freshUnread.seq);

    const events = await getDb().select().from(attestedSendEvents);
    assert.equal(events.filter((event) => event.eventType === "gate_triggered").length, 1);
  } finally {
    await app.close();
  }
});

test("agent-api send ignores read cursor as freshness proof", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const baseline = await sendHumanMessage(fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    const freshUnread = await sendHumanMessage(fixture, "fresh unread before read cursor advance");
    await markAgentRead(fixture.agentId, fixture.channelId, freshUnread.seq);

    const held = await sendViaAgentApi(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "agent-api draft with stale model state",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.newMessageCount, 1);
    assert.equal(held.body.heldMessages[0].id, freshUnread.id);
    assert.equal(held.body.seenUpToSeq, freshUnread.seq);
  } finally {
    await app.close();
  }
});

test("agent-api held response returns latest bounded context with omitted count", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const baseline = await sendHumanMessage(fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    const unread: Awaited<ReturnType<typeof sendHumanMessage>>[] = [];
    for (let i = 0; i < 5; i += 1) {
      unread.push(await sendHumanMessage(fixture, `fresh unread ${i + 1}`));
    }
    const latestUnread = unread[unread.length - 1]!;

    const held = await sendViaAgentApi(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "agent-api draft with many unread messages",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.newMessageCount, 5);
    assert.equal(held.body.shownMessageCount, 3);
    assert.equal(held.body.omittedMessageCount, 2);
    assert.equal(held.body.heldMessages.length, 3);
    assert.equal(held.body.seenUpToSeq, latestUnread.seq);
  } finally {
    await app.close();
  }
});

test("agent-api direct send without freshness boundary returns bounded first-touch context", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const history: Awaited<ReturnType<typeof sendHumanMessage>>[] = [];
    for (let i = 0; i < 5; i += 1) {
      history.push(await sendHumanMessage(fixture, `history message ${i + 1}`));
    }

    const held = await sendViaAgentApi(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "agent-api draft without boundary",
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.newMessageCount, 3);
    assert.equal(held.body.shownMessageCount, 3);
    assert.equal(held.body.omittedMessageCount, 0);
    assert.deepEqual(
      held.body.heldMessages.map((message: { content: string }) => message.content),
      ["history message 3", "history message 4", "history message 5"],
    );
    assert.equal(held.body.seenUpToSeq, history[history.length - 1]!.seq);

    const events = await getDb().select().from(attestedSendEvents);
    const gate = events.find((event) => event.eventType === "gate_triggered");
    assert.equal(gate?.newMessageCount, 3);
    assert.equal((gate?.metadata as Record<string, unknown> | undefined)?.boundary_source, "none");
  } finally {
    await app.close();
  }
});

test("agent-api send-draft commits once seenUpToSeq reaches latest state", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const baseline = await sendHumanMessage(fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    const freshUnread = await sendHumanMessage(fixture, "fresh unread");

    const held = await sendViaAgentApi(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "agent-api draft",
      seenUpToSeq: baseline.seq,
    });
    assert.equal(held.body.state, "held");

    const committed = await sendViaAgentApi(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
      content: "agent-api draft",
      seenUpToSeq: freshUnread.seq,
    });

    assert.equal(committed.status, 200);
    assert.equal(committed.body.state, "sent");
    const [latest] = await latestChannelMessages(fixture.channelId, 1);
    assert.equal(latest?.id, committed.body.messageId);
    assert.equal(latest?.content, "agent-api draft");

    const events = await getDb().select().from(attestedSendEvents);
    const continueEvent = events.find((event) => event.eventType === "continue");
    assert.ok(continueEvent, "expected continue event for send-draft commit");
    assert.equal(continueEvent?.messageId, committed.body.messageId);
  } finally {
    await app.close();
  }
});

test("agent-api events consumes exactly the returned inbox batch", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const inbox = [
      {
        id: randomUUID(),
        seq: 101,
        channelId: fixture.channelId,
        channelName: fixture.channelName,
        channelType: "channel",
        senderType: "user",
        senderId: fixture.ownerId,
        senderName: "Owner",
        messageType: "message",
        content: "queued event",
        createdAt: new Date().toISOString(),
      },
    ];
    const orchestrator = app.app.get("agentOrchestrator") as any;
    orchestrator.receiveMessages = async () => [...inbox];
    orchestrator.acknowledgeDeliveredMessages = (_agentId: string, seqs: number[]) => {
      const seqSet = new Set(seqs);
      const before = inbox.length;
      for (let index = inbox.length - 1; index >= 0; index -= 1) {
        if (seqSet.has(inbox[index]!.seq)) inbox.splice(index, 1);
      }
      return { removedCount: before - inbox.length };
    };

    const first = await fetch(`${app.baseUrl}/internal/agent-api/events?since=latest`, {
      headers: agentHeaders(fixture.agentApiKey),
    });
    assert.equal(first.status, 200);
    const firstBody = await first.json() as { events?: Array<{ seq: number }> };
    assert.deepEqual(firstBody.events?.map((event) => event.seq), [101]);

    const second = await fetch(`${app.baseUrl}/internal/agent-api/events?since=latest`, {
      headers: agentHeaders(fixture.agentApiKey),
    });
    assert.equal(second.status, 200);
    const secondBody = await second.json() as { events?: Array<{ seq: number }> };
    assert.deepEqual(secondBody.events, []);
  } finally {
    await app.close();
  }
});
