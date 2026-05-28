import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { afterEach, beforeEach } from "node:test";

import argon2 from "argon2";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import { desc, eq } from "drizzle-orm";

import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { attestedSendEvents, messages, users } from "../db/schema.js";
import { createAgent, assignMachine } from "../services/agentService.js";
import {
  addAgent,
  addHuman,
  createChannel,
  getAgentReadCursor,
  getOrCreateThread,
  markAgentRead,
} from "../services/channelService.js";
import { registerMachine } from "../services/machineService.js";
import * as attestedSendService from "../services/attestedSendService.js";
import { listRecentAgentTrajectory } from "../services/agentActivityLogService.js";
import { createServer } from "../services/serverService.js";

type Fixture = {
  serverId: string;
  channelId: string;
  channelName: string;
  agentId: string;
  ownerId: string;
  ownerToken: string;
  apiKey: string;
  machineId: string;
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

async function seedFixture(baseUrl: string): Promise<Fixture> {
  const db = getDb();
  const suffix = randomUUID();

  const [owner] = await db.insert(users).values({
    email: `attested-owner-${suffix}@slock.test`,
    name: `attested-owner-${suffix}`,
    displayName: "Attested Owner",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();

  const server = await createServer("Attested Send Test", "attested-send-test", owner.id);

  const agent = await createAgent(server.id, "AttestedBot", { runtime: "claude", model: "sonnet" });
  const channel = await createChannel(server.id, "attested-room");
  await addHuman(channel.id, owner.id);
  await addAgent(channel.id, agent.id);

  const { machine, apiKey } = await registerMachine(server.id, owner.id, "attested-send-daemon");
  await assignMachine(agent.id, machine.id);

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `attested-owner-${suffix}@slock.test`, password: "password123" }),
  });
  assert.equal(loginRes.status, 200, "owner login must succeed");
  const loginBody = await loginRes.json() as { accessToken: string };

  return {
    serverId: server.id,
    channelId: channel.id,
    channelName: channel.name,
    agentId: agent.id,
    ownerId: owner.id,
    ownerToken: loginBody.accessToken,
    apiKey,
    machineId: machine.id,
  };
}

function userHeaders(token: string, serverId: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Server-Id": serverId,
  };
}

function agentHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

async function sendHumanMessage(baseUrl: string, fixture: Fixture, content: string) {
  const res = await fetch(`${baseUrl}/api/messages`, {
    method: "POST",
    headers: userHeaders(fixture.ownerToken, fixture.serverId),
    body: JSON.stringify({ channelId: fixture.channelId, content }),
  });
  assert.equal(res.status, 200, `human send must succeed (${content})`);
  return await res.json() as { id: string; seq: number; content: string };
}

async function createJoinedChannel(fixture: Fixture, name: string) {
  const channel = await createChannel(fixture.serverId, name);
  await addHuman(channel.id, fixture.ownerId);
  await addAgent(channel.id, fixture.agentId);
  return channel;
}

async function sendHumanMessageToChannel(
  baseUrl: string,
  fixture: Fixture,
  channelId: string,
  content: string,
) {
  const res = await fetch(`${baseUrl}/api/messages`, {
    method: "POST",
    headers: userHeaders(fixture.ownerToken, fixture.serverId),
    body: JSON.stringify({ channelId, content }),
  });
  assert.equal(res.status, 200, `human send must succeed (${content})`);
  return await res.json() as { id: string; seq: number; content: string };
}

async function sendAgent(baseUrl: string, fixture: Fixture, body: Record<string, unknown>) {
  return sendAgentAs(baseUrl, fixture, fixture.agentId, body);
}

async function sendAgentAs(baseUrl: string, fixture: Fixture, agentId: string, body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}/internal/agent/${agentId}/send`, {
    method: "POST",
    headers: agentHeaders(fixture.apiKey),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, body: json as any };
}

async function createPeerAgent(fixture: Fixture, name = "AttestedPeer") {
  const peer = await createAgent(fixture.serverId, name, { runtime: "claude", model: "sonnet" });
  await addAgent(fixture.channelId, peer.id);
  await assignMachine(peer.id, fixture.machineId);
  return peer;
}

async function latestChannelMessages(channelId: string, limit = 10) {
  return getDb()
    .select({ id: messages.id, seq: messages.seq, content: messages.content })
    .from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.seq))
    .limit(limit);
}

async function recentActivitySlockActionEntries(agentId: string) {
  const trajectory = await listRecentAgentTrajectory(agentId, 50);
  return trajectory
    .map((item) => item.entry)
    .filter((entry): entry is { kind: "slock_action"; title: string; text: string } => entry.kind === "slock_action");
}

function attestedFreshnessEvents(sink: MemoryTraceSink) {
  return sink.getAllSpans()
    .flatMap((span) => span.events)
    .filter((event) => event.name === "attested_send.freshness.evaluated");
}

function assertActivityContains(
  entries: Array<{ title: string; text: string }>,
  title: string,
  text: string,
) {
  assert.ok(
    entries.some((entry) => entry.title.includes(title) && entry.text.includes(text)),
    `expected activity log entry with title "${title}" and text "${text}"`,
  );
}

test("attested send: default-off mode preserves normal send behavior", async () => {
  process.env.SLOCK_ATTESTED_SEND_MODE = "off";
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    await sendHumanMessage(app.baseUrl, fixture, "unread before send");

    const sent = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "public staging send",
    });
    assert.equal(sent.status, 200);
    assert.equal(sent.body.state, "sent");

    const explicitFreshnessAttempt = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
      content: "freshness-gated draft",
    });
    assert.equal(explicitFreshnessAttempt.status, 403);
    assert.match(explicitFreshnessAttempt.body.error, /not enabled/);

    const events = await getDb().select().from(attestedSendEvents);
    assert.equal(events.length, 0);
  } finally {
    await app.close();
  }
});

test("attested send: default-on interface does not gate legacy sends without a freshness marker", async () => {
  delete process.env.SLOCK_ATTESTED_SEND_MODE;
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    await sendHumanMessage(app.baseUrl, fixture, "unread before send");

    const publicSend = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "public send does not opt in",
    });
    assert.equal(publicSend.status, 200);
    assert.equal(publicSend.body.state, "sent");
    const [publicSendRow] = await latestChannelMessages(fixture.channelId, 1);
    assert.equal(publicSendRow?.id, publicSend.body.messageId);
    const freshUnread = await sendHumanMessage(app.baseUrl, fixture, "unread before freshness send");

    const freshnessAttempt = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "send opts in with a freshness marker",
      seenUpToSeq: publicSendRow!.seq,
    });
    assert.equal(freshnessAttempt.status, 200);
    assert.equal(freshnessAttempt.body.state, "held");
    assert.equal(freshnessAttempt.body.heldMessages[0].id, freshUnread.id);
    const activityEntries = await recentActivitySlockActionEntries(fixture.agentId);
    assertActivityContains(activityEntries, "Send held by freshness check", "new messages: 1 newer message");
  } finally {
    await app.close();
  }
});

test("attested send: E1 formal @handle mention bypasses stale hold and records e1_exempt", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    const mention = await sendHumanMessage(app.baseUrl, fixture, "please review this @AttestedBot");
    const res = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "bot reply after mention",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.state, "sent");

    const events = await getDb().select().from(attestedSendEvents);
    const exempt = events.find((event) => event.eventType === "e1_exempt");
    assert.ok(exempt, "expected attested_send.e1_exempt");
    assert.equal(exempt?.messageId, mention.id);
    assert.equal((exempt?.metadata as Record<string, unknown>).mentioned_handle, "AttestedBot");
    const activityEntries = await recentActivitySlockActionEntries(fixture.agentId);
    assertActivityContains(activityEntries, "Send freshness check passed by mention", "reason: direct @AttestedBot mention");
  } finally {
    await app.close();
  }
});

test("attested send: E1 range is left-exclusive, so mention at last_seen does not exempt", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const mention = await sendHumanMessage(app.baseUrl, fixture, "@AttestedBot old mention");
    await markAgentRead(fixture.agentId, fixture.channelId, mention.seq);
    await sendHumanMessage(app.baseUrl, fixture, "later non-mention chatter");

    const res = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "bot reply should hold",
      seenUpToSeq: mention.seq,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.state, "held");
    assert.equal(res.body.newMessageCount, 1);

    const events = await getDb().select().from(attestedSendEvents);
    assert.equal(events.filter((event) => event.eventType === "e1_exempt").length, 0);
    const gate = events.find((event) => event.eventType === "gate_triggered");
    assert.ok(gate, "expected gate_triggered event");
    assert.equal((gate?.metadata as Record<string, unknown>).last_seen_msg_id, mention.id);
  } finally {
    await app.close();
  }
});

test("attested send: channel send without a model-seen boundary returns bounded first-touch context", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const unreadMessages = [];
    for (let i = 1; i <= 5; i += 1) {
      unreadMessages.push(await sendHumanMessage(app.baseUrl, fixture, `unread before first agent send ${i}`));
    }

    const res = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "first agent message must hold without seen boundary",
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.state, "held");
    assert.equal(res.body.newMessageCount, 3);
    assert.equal(res.body.shownMessageCount, 3);
    assert.equal(res.body.omittedMessageCount, 0);
    assert.deepEqual(
      res.body.heldMessages.map((message: { content: string }) => message.content),
      [
        "unread before first agent send 3",
        "unread before first agent send 4",
        "unread before first agent send 5",
      ],
    );
    assert.equal(res.body.seenUpToSeq, unreadMessages[4]!.seq);

    const gateEvents = await getDb().select().from(attestedSendEvents);
    const gate = gateEvents.find((event) => event.eventType === "gate_triggered");
    assert.ok(gate, "expected no-boundary channel send to trigger freshness gate");
    assert.equal(gate.newMessageCount, 3);
    const metadata = gate.metadata as Record<string, unknown>;
    assert.equal(metadata.boundary_source, "none");
    assert.equal(metadata.boundary_seq, 0);
  } finally {
    await app.close();
  }
});

test("attested send: delivery read cursor is not a model-seen boundary", async () => {
  const app = await startTestApp("pglite://");
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

    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "model saw this baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    const unread = await sendHumanMessage(app.baseUrl, fixture, "delivered after model context");

    // Simulate daemon delivery ack / inbox clear advancing the read cursor
    // beyond the model's current turn context. This must not make the send fresh.
    await markAgentRead(fixture.agentId, fixture.channelId, unread.seq);

    const held = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "stale turn reply",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.newMessageCount, 1);
    assert.equal(held.body.heldMessages[0].id, unread.id);
    assert.equal(await getAgentReadCursor(fixture.agentId, fixture.channelId), unread.seq);

    const events = await getDb().select().from(attestedSendEvents);
    const gate = events.find((event) => event.eventType === "gate_triggered");
    assert.ok(gate, "expected stale model boundary to trigger freshness gate");
    const metadata = gate.metadata as Record<string, unknown>;
    assert.equal(metadata.boundary_source, "client_seen");
    assert.equal(metadata.boundary_seq, baseline.seq);
    assert.equal(metadata.latest_seq, unread.seq);

    const freshnessEvents = attestedFreshnessEvents(sink);
    assert.ok(freshnessEvents.length > 0, "expected freshness trace event");
    assert.ok(
      freshnessEvents.every((event) => event.attrs?.boundary_source !== "read_cursor"),
      "read cursor must never be emitted as an accepted freshness boundary",
    );
    const heldTrace = freshnessEvents.find((event) => event.attrs?.outcome === "held");
    assert.ok(heldTrace, "expected held freshness trace event");
    assert.equal(heldTrace.attrs?.boundary_source, "client_seen");
    assert.equal(heldTrace.attrs?.boundary_seq, baseline.seq);
    assert.equal(heldTrace.attrs?.latest_seq, unread.seq);
    assert.equal(heldTrace.attrs?.new_message_count, 1);
  } finally {
    await app.close();
  }
});

test("attested send: explicit seenUpToSeq freshness claim can satisfy the stateless gate", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    const unread = await sendHumanMessage(app.baseUrl, fixture, "agent has seen this locally");

    const res = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "reply with explicit freshness claim",
      seenUpToSeq: unread.seq,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.state, "sent");
    const events = await getDb().select().from(attestedSendEvents);
    assert.equal(events.filter((event) => event.eventType === "gate_triggered").length, 0);
  } finally {
    await app.close();
  }
});

test("attested send: first send to a new thread seeds freshness from the parent message", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const parent = await sendHumanMessage(app.baseUrl, fixture, "please reply in this thread");
    await markAgentRead(fixture.agentId, fixture.channelId, parent.seq);
    await getOrCreateThread(parent.id, fixture.ownerId, "user");

    const peer = await createPeerAgent(fixture);
    const threadTarget = `#${fixture.channelName}:${parent.id.slice(0, 8)}`;
    const firstReply = await sendAgentAs(app.baseUrl, fixture, peer.id, {
      target: threadTarget,
      content: "peer got here first",
    });
    assert.equal(firstReply.status, 200);
    assert.equal(firstReply.body.state, "sent");

    const held = await sendAgent(app.baseUrl, fixture, {
      target: threadTarget,
      content: "second reply should reconsider",
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.newMessageCount, 1);
    assert.equal(held.body.heldMessages.length, 1);
    assert.equal(held.body.heldMessages[0].id, firstReply.body.messageId);
    assert.equal(held.body.heldMessages[0].content, "peer got here first");

    const events = await getDb().select().from(attestedSendEvents);
    const gate = events.find((event) => event.eventType === "gate_triggered");
    assert.ok(gate, "expected parent-seeded thread gate");
    const metadata = gate?.metadata as Record<string, unknown>;
    assert.equal(metadata.last_seen_msg_id, parent.id);
    assert.equal(metadata.latest_msg_id, firstReply.body.messageId);
    assert.equal(metadata.boundary_source, "thread_parent");
    assert.equal(metadata.boundary_seq, parent.seq);
  } finally {
    await app.close();
  }
});

test("attested send: concurrent first replies to a new thread are freshness-gated", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const parent = await sendHumanMessage(app.baseUrl, fixture, "count in this thread");
    const peerOne = await createPeerAgent(fixture, "AttestedPeerOne");
    const peerTwo = await createPeerAgent(fixture, "AttestedPeerTwo");
    const threadTarget = `#${fixture.channelName}:${parent.id.slice(0, 8)}`;

    const [one, two] = await Promise.all([
      sendAgentAs(app.baseUrl, fixture, peerOne.id, {
        target: threadTarget,
        content: "1",
      }),
      sendAgentAs(app.baseUrl, fixture, peerTwo.id, {
        target: threadTarget,
        content: "1",
      }),
    ]);

    assert.equal(one.status, 200);
    assert.equal(two.status, 200);
    const results = [one.body, two.body];
    assert.equal(results.filter((body) => body.state === "sent").length, 1);
    assert.equal(results.filter((body) => body.state === "held").length, 1);

    const sent = results.find((body) => body.state === "sent");
    const held = results.find((body) => body.state === "held");
    assert.ok(sent?.messageId);
    assert.equal(held?.newMessageCount, 1);
    assert.equal(held?.heldMessages?.[0]?.id, sent.messageId);
    assert.equal(held?.heldMessages?.[0]?.content, "1");

    const thread = await getOrCreateThread(parent.id, fixture.ownerId, "user");
    const messagesInThread = await latestChannelMessages(thread.id, 10);
    assert.deepEqual(messagesInThread.map((message) => message.content), ["1"]);

    const events = await getDb().select().from(attestedSendEvents);
    const gates = events.filter((event) => event.eventType === "gate_triggered");
    assert.equal(gates.length, 1);
    const metadata = gates[0]!.metadata as Record<string, unknown>;
    assert.equal(metadata.boundary_source, "thread_parent");
    assert.equal(metadata.last_seen_msg_id, parent.id);
    assert.equal(metadata.latest_msg_id, sent.messageId);
  } finally {
    await app.close();
  }
});

test("attested send: deprecated continue is rejected and normal send replaces local draft", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const parent = await sendHumanMessage(app.baseUrl, fixture, "count in this thread");
    await markAgentRead(fixture.agentId, fixture.channelId, parent.seq);
    const thread = await getOrCreateThread(parent.id, fixture.ownerId, "user");

    const peer = await createPeerAgent(fixture);
    const threadTarget = `#${fixture.channelName}:${parent.id.slice(0, 8)}`;
    const firstReply = await sendAgentAs(app.baseUrl, fixture, peer.id, {
      target: threadTarget,
      content: "1",
    });
    assert.equal(firstReply.status, 200);
    assert.equal(firstReply.body.state, "sent");

    const held = await sendAgent(app.baseUrl, fixture, {
      target: threadTarget,
      content: "1",
    });
    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.heldMessages[0].content, "1");

    const rejectedContinue = await sendAgent(app.baseUrl, fixture, {
      target: threadTarget,
      continue: true,
      content: "2",
    });
    assert.equal(rejectedContinue.status, 400);
    assert.match(rejectedContinue.body.error, /--continue is no longer supported/);

    const [latestAfterRejectedContinue] = await latestChannelMessages(thread.id, 1);
    assert.equal(latestAfterRejectedContinue?.id, firstReply.body.messageId);
    assert.equal(latestAfterRejectedContinue?.content, "1");

    const replacement = await sendAgent(app.baseUrl, fixture, {
      target: threadTarget,
      content: "2",
      seenUpToSeq: held.body.seenUpToSeq,
    });
    assert.equal(replacement.status, 200);
    assert.equal(replacement.body.state, "sent");

    const [latest] = await latestChannelMessages(thread.id, 1);
    assert.equal(latest?.id, replacement.body.messageId);
    assert.equal(latest?.content, "2");
  } finally {
    await app.close();
  }
});

test("attested send: send-draft requires local draft content in the send attempt", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const empty = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
    });

    assert.equal(empty.status, 400);
    assert.match(empty.body.error, /Content is required/);
  } finally {
    await app.close();
  }
});

test("attested send: send-draft commits current draft unchanged when freshness is still clean", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    await sendHumanMessage(app.baseUrl, fixture, "unread");
    const held = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft X",
      seenUpToSeq: baseline.seq,
    });
    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");

    const sentDraft = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
      content: "draft X",
      seenUpToSeq: held.body.seenUpToSeq,
    });
    assert.equal(sentDraft.status, 200);
    assert.equal(sentDraft.body.state, "sent");

    const [latest] = await latestChannelMessages(fixture.channelId, 1);
    assert.equal(latest?.id, sentDraft.body.messageId);
    assert.equal(latest?.content, "draft X");
  } finally {
    await app.close();
  }
});

test("attested send: non-formal mentions like @everyone do not trigger E1 exemption", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    await sendHumanMessage(app.baseUrl, fixture, "@everyone take a look");

    const res = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "bot reply should still hold",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.state, "held");

    const events = await getDb().select().from(attestedSendEvents);
    assert.equal(events.filter((event) => event.eventType === "e1_exempt").length, 0);
  } finally {
    await app.close();
  }
});

test("attested send: send-draft re-checks freshness and re-holds only incremental messages", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    const firstUnread = await sendHumanMessage(app.baseUrl, fixture, "first unread");
    const firstHold = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft one",
      seenUpToSeq: baseline.seq,
    });
    assert.equal(firstHold.status, 200);
    assert.equal(firstHold.body.state, "held");
    assert.equal(firstHold.body.newMessageCount, 1);
    assert.equal(firstHold.body.heldMessages.length, 1);
    assert.equal(firstHold.body.heldMessages[0].id, firstUnread.id);

    const cursorAfterFirstHold = await getAgentReadCursor(fixture.agentId, fixture.channelId);
    assert.equal(cursorAfterFirstHold, firstUnread.seq);

    const secondUnread = await sendHumanMessage(app.baseUrl, fixture, "second unread");
    const secondHold = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
      content: "draft one",
      draftReholdCount: 1,
      seenUpToSeq: firstHold.body.seenUpToSeq,
    });
    assert.equal(secondHold.status, 200);
    assert.equal(secondHold.body.state, "held");
    assert.equal(secondHold.body.newMessageCount, 1);
    assert.equal(secondHold.body.heldMessages.length, 1);
    assert.equal(secondHold.body.heldMessages[0].id, secondUnread.id);

    const events = await getDb().select().from(attestedSendEvents);
    const gateEvents = events.filter((event) => event.eventType === "gate_triggered");
    assert.equal(gateEvents.length, 2);
  } finally {
    await app.close();
  }
});

test("attested send: held response is target-scoped and does not drain other-target inbox", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const sideChannel = await createJoinedChannel(fixture, "side-room");
    const acknowledged: Array<{ agentId: string; channelId: string; seqs: number[] }> = [];
    app.app.set("agentOrchestrator", {
      deliverMessage: async () => {},
      receiveMessages: async () => {
        throw new Error("send path must not drain the global inbox");
      },
      acknowledgeDeliveredMessages: () => {
        throw new Error("held context must use target-scoped delivery suppression");
      },
      acknowledgeDeliveredMessagesForChannel: () => {
        throw new Error("held context should suppress target delivery by latest seen seq");
      },
      acknowledgeDeliveredMessagesForChannelUpToSeq: (agentId: string, channelId: string, maxSeq: number) => {
        const seqs = [targetUnread.seq].filter((seq) => seq <= maxSeq);
        acknowledged.push({ agentId, channelId, seqs });
        return { removedCount: seqs.length };
      },
      getActivity: async () => ({ activity: "offline", activityDetail: "" }),
      getMachineStatus: async () => "offline",
      getMachineStatusVersion: async () => 0,
      getMachineDaemonVersion: () => null,
      evictCache: () => {},
      shutdown: () => {},
      setIO: () => {},
    });

    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    const sideMessage = await sendHumanMessageToChannel(app.baseUrl, fixture, sideChannel.id, "side target should stay inbox-owned");
    const targetUnread = await sendHumanMessage(app.baseUrl, fixture, "target unread");

    const held = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft should hold",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.recentUnread, undefined, "send response must not expose global inbox messages");
    assert.deepEqual(
      held.body.heldMessages.map((message: { id: string; content: string }) => ({ id: message.id, content: message.content })),
      [{ id: targetUnread.id, content: "target unread" }],
      "held context only includes the send target delta",
    );
    assert.ok(!held.body.heldMessages.some((message: { id: string }) => message.id === sideMessage.id));
    assert.deepEqual(acknowledged, [
      { agentId: fixture.agentId, channelId: fixture.channelId, seqs: [targetUnread.seq] },
    ]);
  } finally {
    await app.close();
  }
});

test("attested send: send-draft re-hold suppresses only target messages and leaves other targets alone", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const sideChannel = await createJoinedChannel(fixture, "side-room");
    const acknowledged: Array<{ agentId: string; channelId: string; seqs: number[] }> = [];
    const targetSeqs: number[] = [];
    const removedTargetSeqs = new Set<number>();
    app.app.set("agentOrchestrator", {
      deliverMessage: async () => {},
      receiveMessages: async () => {
        throw new Error("send path must not drain the global inbox");
      },
      acknowledgeDeliveredMessages: () => {
        throw new Error("held context must use target-scoped delivery suppression");
      },
      acknowledgeDeliveredMessagesForChannel: () => {
        throw new Error("held context should suppress target delivery by latest seen seq");
      },
      acknowledgeDeliveredMessagesForChannelUpToSeq: (agentId: string, channelId: string, maxSeq: number) => {
        const seqs = targetSeqs.filter((seq) => seq <= maxSeq && !removedTargetSeqs.has(seq));
        for (const seq of seqs) removedTargetSeqs.add(seq);
        acknowledged.push({ agentId, channelId, seqs });
        return { removedCount: seqs.length };
      },
      getActivity: async () => ({ activity: "offline", activityDetail: "" }),
      getMachineStatus: async () => "offline",
      getMachineStatusVersion: async () => 0,
      getMachineDaemonVersion: () => null,
      evictCache: () => {},
      shutdown: () => {},
      setIO: () => {},
    });

    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    const firstUnread = await sendHumanMessage(app.baseUrl, fixture, "first target unread");
    targetSeqs.push(firstUnread.seq);
    const firstHeld = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft should hold",
      seenUpToSeq: baseline.seq,
    });
    assert.equal(firstHeld.body.state, "held");

    const sideMessage = await sendHumanMessageToChannel(app.baseUrl, fixture, sideChannel.id, "side update during reconsideration");
    const secondUnread = await sendHumanMessage(app.baseUrl, fixture, "second target unread");
    targetSeqs.push(secondUnread.seq);
    const reheld = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
      content: "draft should hold",
      draftReholdCount: 1,
      seenUpToSeq: firstHeld.body.seenUpToSeq,
    });

    assert.equal(reheld.status, 200);
    assert.equal(reheld.body.state, "held");
    assert.equal(reheld.body.recentUnread, undefined);
    assert.deepEqual(
      reheld.body.heldMessages.map((message: { id: string; content: string }) => ({ id: message.id, content: message.content })),
      [{ id: secondUnread.id, content: "second target unread" }],
      "re-hold context only includes target delta since attestation",
    );
    assert.ok(!reheld.body.heldMessages.some((message: { id: string }) => message.id === sideMessage.id));
    assert.deepEqual(acknowledged, [
      { agentId: fixture.agentId, channelId: fixture.channelId, seqs: [firstUnread.seq] },
      { agentId: fixture.agentId, channelId: fixture.channelId, seqs: [secondUnread.seq] },
    ]);
  } finally {
    await app.close();
  }
});

test("attested send: held response shows only the latest bounded context and suppresses the full held batch", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const acknowledged: Array<{ agentId: string; channelId: string; maxSeq: number }> = [];
    app.app.set("agentOrchestrator", {
      deliverMessage: async () => {},
      receiveMessages: async () => {
        throw new Error("send path must not drain the global inbox");
      },
      acknowledgeDeliveredMessages: () => {
        throw new Error("held context must use target-scoped delivery suppression");
      },
      acknowledgeDeliveredMessagesForChannel: () => {
        throw new Error("held context should suppress target delivery by latest seen seq");
      },
      acknowledgeDeliveredMessagesForChannelUpToSeq: (agentId: string, channelId: string, maxSeq: number) => {
        acknowledged.push({ agentId, channelId, maxSeq });
        return { removedCount: 5 };
      },
      getActivity: async () => ({ activity: "offline", activityDetail: "" }),
      getMachineStatus: async () => "offline",
      getMachineStatusVersion: async () => 0,
      getMachineDaemonVersion: () => null,
      evictCache: () => {},
      shutdown: () => {},
      setIO: () => {},
    });

    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);
    const unreadMessages = [];
    for (let i = 1; i <= 5; i += 1) {
      unreadMessages.push(await sendHumanMessage(app.baseUrl, fixture, `unread-${i}`));
    }

    const held = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft should hold",
      seenUpToSeq: baseline.seq,
    });

    assert.equal(held.status, 200);
    assert.equal(held.body.state, "held");
    assert.equal(held.body.newMessageCount, 5);
    assert.equal(held.body.shownMessageCount, 3);
    assert.equal(held.body.omittedMessageCount, 2);
    assert.deepEqual(
      held.body.heldMessages.map((message: { content: string }) => message.content),
      ["unread-3", "unread-4", "unread-5"],
    );
    assert.deepEqual(acknowledged, [
      { agentId: fixture.agentId, channelId: fixture.channelId, maxSeq: unreadMessages[4]!.seq },
    ]);
  } finally {
    await app.close();
  }
});

test("attested send: send-draft re-check uses explicit seenUpToSeq instead of old draft attestation", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    await sendHumanMessage(app.baseUrl, fixture, "first unread");
    const firstHold = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft one",
      seenUpToSeq: baseline.seq,
    });
    assert.equal(firstHold.status, 200);
    assert.equal(firstHold.body.state, "held");

    const secondUnread = await sendHumanMessage(app.baseUrl, fixture, "second unread");
    await markAgentRead(fixture.agentId, fixture.channelId, secondUnread.seq);
    const continued = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
      content: "draft one",
      seenUpToSeq: secondUnread.seq,
    });

    assert.equal(continued.status, 200);
    assert.equal(continued.body.state, "sent");

    const [latest] = await latestChannelMessages(fixture.channelId, 1);
    assert.equal(latest?.id, continued.body.messageId);
    assert.equal(latest?.content, "draft one");
  } finally {
    await app.close();
  }
});

test("attested send: replacement metadata is client-declared and event-only", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    await sendHumanMessage(app.baseUrl, fixture, "first unread");
    const firstHold = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft one",
      seenUpToSeq: baseline.seq,
    });
    assert.equal(firstHold.body.state, "held");

    await sendHumanMessage(app.baseUrl, fixture, "second unread");
    const secondHold = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft two",
      draftReplacedExisting: true,
      seenUpToSeq: firstHold.body.seenUpToSeq,
    });
    assert.equal(secondHold.body.state, "held");

    const events = await getDb().select().from(attestedSendEvents);
    assert.ok(events.some((event) => event.eventType === "gate_triggered" && event.metadata && (event.metadata as Record<string, unknown>).draft_replaced_existing === true));
  } finally {
    await app.close();
  }
});

test("attested send: send-draft --anyway is suggested after 3 reholds and commits stale draft", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture(app.baseUrl);
    const baseline = await sendHumanMessage(app.baseUrl, fixture, "baseline");
    await markAgentRead(fixture.agentId, fixture.channelId, baseline.seq);

    await sendHumanMessage(app.baseUrl, fixture, "unread-1");
    let held = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      content: "draft one",
      seenUpToSeq: baseline.seq,
    });
    assert.equal(held.body.state, "held");
    assert.equal(held.body.continueAnywaySuggested, false);

    for (let i = 0; i < 3; i += 1) {
      await sendHumanMessage(app.baseUrl, fixture, `extra-unread-${i + 2}`);
      held = await sendAgent(app.baseUrl, fixture, {
        target: `#${fixture.channelName}`,
        sendDraft: true,
        content: "draft one",
        draftReholdCount: i + 1,
        seenUpToSeq: held.body.seenUpToSeq,
      });
      assert.equal(held.body.state, "held");
      if (i < 2) {
        assert.equal(held.body.continueAnywaySuggested, false);
      }
    }

    assert.equal(held.body.continueAnywaySuggested, true, "escape hatch appears after 3 consecutive reholds");

    await sendHumanMessage(app.baseUrl, fixture, "freshness would still fail");
    const committed = await sendAgent(app.baseUrl, fixture, {
      target: `#${fixture.channelName}`,
      sendDraft: true,
      continueAnyway: true,
      content: "draft one",
      draftReholdCount: 4,
      seenUpToSeq: held.body.seenUpToSeq,
    });
    assert.equal(committed.status, 200);
    assert.equal(committed.body.state, "sent");
    const [latest] = await latestChannelMessages(fixture.channelId, 1);
    assert.equal(latest?.id, committed.body.messageId);
    assert.equal(latest?.content, "draft one");
    const events = await getDb().select().from(attestedSendEvents);
    assert.ok(events.some((event) => event.eventType === "continue" && event.result === "committed_anyway"));
    const activityEntries = await recentActivitySlockActionEntries(fixture.agentId);
    assertActivityContains(activityEntries, "Send draft held", "new messages: 1 newer message");
    assertActivityContains(activityEntries, "Send draft sent anyway", "decision: sent anyway after reviewing newer messages");
  } finally {
    await app.close();
  }
});
