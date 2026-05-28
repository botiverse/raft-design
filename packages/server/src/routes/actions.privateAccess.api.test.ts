import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";

import { getDb } from "../db/index.js";
import { channelAgents, channelHumans, messages, serverMembers, threadFollows, users } from "../db/schema.js";
import { assignMachine, createAgent } from "../services/agentService.js";
import { addAgent, addHuman, createChannel, getOrCreateThread, removeHuman } from "../services/channelService.js";
import { ActionCardError, markActionCardExecuted, prepareActionCard } from "../services/actionCardsService.js";
import { registerMachine } from "../services/machineService.js";
import { createMessage, getMaxSeq } from "../services/messageService.js";
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
    "Content-Type": "application/json",
    "X-Server-Id": serverId,
  };
}

interface EmittedEvent {
  room: string;
  event: string;
  payload: unknown;
}

function installFakeIo(): { io: any; events: EmittedEvent[] } {
  const events: EmittedEvent[] = [];
  const makeRoomChain = (rooms: string[]) => ({
    in(room: string) {
      return makeRoomChain([...rooms, room]);
    },
    socketsJoin(room: string) {
      events.push({ room: rooms.join(" "), event: "socketsJoin", payload: { room } });
    },
  });
  return {
    events,
    io: {
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
    },
  };
}

test("action card execute and mark-executed cloak private carrier messages from non-members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-card-owner@slock.test", "private-card-owner");
    const outsider = await seedUser("private-card-outsider@slock.test", "private-card-outsider");
    const server = await createServer("Private Action Card Server", "private-action-card-server", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: outsider.id, role: "member" }).onConflictDoNothing();
    const agent = await createAgent(server.id, "private-card-agent", { runtime: "codex" });
    const privateChannel = await createChannel(server.id, "private-card-channel", undefined, "private");
    await addHuman(privateChannel.id, owner.id);
    await addAgent(privateChannel.id, agent.id);

    const card = await prepareActionCard({
      serverId: server.id,
      requesterAgentId: agent.id,
      targetChannelId: privateChannel.id,
      action: {
        type: "channel:create",
        name: "private-card-created-channel",
        visibility: "public",
      },
    });

    const outsiderToken = await login(app.baseUrl, outsider.email);
    const outsiderHeaders = authHeaders(outsiderToken, server.id);

    const executeRes = await fetch(`${app.baseUrl}/api/actions/${card.messageId}/execute`, {
      method: "POST",
      headers: outsiderHeaders,
      body: JSON.stringify({ expectedState: "prepared" }),
    });
    assert.equal(executeRes.status, 404, `expected outsider execute 404, got ${executeRes.status}`);

    const markRes = await fetch(`${app.baseUrl}/api/actions/${card.messageId}/mark-executed`, {
      method: "POST",
      headers: outsiderHeaders,
      body: JSON.stringify({
        result: { kind: "channel", id: privateChannel.id, name: "fake-result" },
      }),
    });
    assert.equal(markRes.status, 404, `expected outsider mark-executed 404, got ${markRes.status}`);
  } finally {
    await app.close();
  }
});

test("action card prepare rejects private thread targets without parent access", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("private-card-thread-owner@slock.test", "private-card-thread-owner");
    const server = await createServer("Private Action Thread", "private-action-thread", owner.id);
    const agent = await createAgent(server.id, "private-card-thread-agent", { runtime: "codex" });
    const privateChannel = await createChannel(server.id, "private-card-thread-parent", undefined, "private");
    await addHuman(privateChannel.id, owner.id);
    const parentMessage = await createMessage(privateChannel.id, "user", owner.id, "private parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");

    await assert.rejects(
      () => prepareActionCard({
        serverId: server.id,
        requesterAgentId: agent.id,
        targetChannelId: thread.id,
        action: {
          type: "channel:create",
          name: "private-card-thread-created",
          visibility: "public",
        },
      }),
      (err: unknown) => err instanceof ActionCardError
        && err.status === 403
        && err.code === "TARGET_NOT_ACCESSIBLE",
    );
  } finally {
    await app.close();
  }
});

test("action card prepare into private thread does not leak through stale thread rooms", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-card-thread-delivery-owner@slock.test", "private-card-thread-delivery-owner");
    const removed = await seedUser("private-card-thread-delivery-removed@slock.test", "private-card-thread-delivery-removed");
    const server = await createServer("Private Action Thread Delivery", "private-action-thread-delivery", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: removed.id, role: "member" }).onConflictDoNothing();
    const agent = await createAgent(server.id, "private-card-thread-agent-b", { runtime: "codex" });
    const privateChannel = await createChannel(server.id, "private-card-thread-delivery-parent", undefined, "private");
    await addHuman(privateChannel.id, owner.id);
    await addHuman(privateChannel.id, removed.id);
    await addAgent(privateChannel.id, agent.id);
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
        followerId: removed.id,
        parentMessageId: parentMessage.id,
        reason: "manual",
      },
    ]);

    await removeHuman(privateChannel.id, removed.id);
    const { io, events } = installFakeIo();

    await prepareActionCard({
      serverId: server.id,
      requesterAgentId: agent.id,
      targetChannelId: thread.id,
      action: {
        type: "channel:create",
        name: "private-card-thread-delivery-created",
        visibility: "public",
      },
      io,
    });

    assert.ok(
      events.some((event) => event.event === "message:new" && event.room === `user:${owner.id}`),
      "remaining private parent member should receive prepared action cards in the thread",
    );
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === `user:${removed.id}`),
      "removed private parent member must not receive prepared action cards directly",
    );
    assert.ok(
      !events.some((event) => event.event === "message:new" && event.room === `channel:${thread.id}`),
      "prepared action cards must not broadcast to stale thread rooms",
    );
  } finally {
    await app.close();
  }
});

test("action card channel:create rejects cross-server UUID initial members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const ownerA = await seedUser("action-card-cross-owner-a@slock.test", "action-card-cross-owner-a");
    const ownerB = await seedUser("action-card-cross-owner-b@slock.test", "action-card-cross-owner-b");
    const serverA = await createServer("Action Card Cross A", "action-card-cross-a", ownerA.id);
    const serverB = await createServer("Action Card Cross B", "action-card-cross-b", ownerB.id);
    const agentA = await createAgent(serverA.id, "action-card-cross-agent-a", { runtime: "codex" });
    const agentB = await createAgent(serverB.id, "action-card-cross-agent-b", { runtime: "codex" });
    const carrier = await createChannel(serverA.id, "action-card-cross-carrier", undefined, "private");
    const foreignChannel = await createChannel(serverB.id, "action-card-cross-foreign-channel", undefined, "private");
    await addHuman(carrier.id, ownerA.id);
    await addAgent(carrier.id, agentA.id);

    await assert.rejects(
      () => prepareActionCard({
        serverId: serverA.id,
        requesterAgentId: agentA.id,
        targetChannelId: carrier.id,
        action: {
          type: "channel:create",
          name: "action-card-cross-created-agent",
          visibility: "private",
          initialAgents: [agentB.id],
        },
      }),
      /initialAgents\[0\]/,
    );

    await assert.rejects(
      () => prepareActionCard({
        serverId: serverA.id,
        requesterAgentId: agentA.id,
        targetChannelId: carrier.id,
        action: {
          type: "channel:create",
          name: "action-card-cross-created-human",
          visibility: "private",
          initialHumans: [ownerB.id],
        },
      }),
      /initialHumans\[0\]/,
    );

    await assert.rejects(
      () => prepareActionCard({
        serverId: serverA.id,
        requesterAgentId: agentA.id,
        targetChannelId: carrier.id,
        action: {
          type: "channel:add_member",
          channel: foreignChannel.id,
          agents: [agentA.id],
        },
      }),
      /channel/,
    );

    const prepared = await prepareActionCard({
      serverId: serverA.id,
      requesterAgentId: agentA.id,
      targetChannelId: carrier.id,
      action: {
        type: "channel:create",
        name: "action-card-cross-created-safe",
        visibility: "private",
        initialAgents: [agentA.id],
        initialHumans: [ownerA.id],
      },
    });
    assert.equal(prepared.metadata.action.type, "channel:create");
  } finally {
    await app.close();
  }
});

test("action card agent:create resolves structured computer constraints", async () => {
  const app = await startTestApp("pglite://");
  try {
    const ownerA = await seedUser("action-card-computer-owner-a@slock.test", "action-card-computer-owner-a");
    const ownerB = await seedUser("action-card-computer-owner-b@slock.test", "action-card-computer-owner-b");
    const serverA = await createServer("Action Card Computer A", "action-card-computer-a", ownerA.id);
    const serverB = await createServer("Action Card Computer B", "action-card-computer-b", ownerB.id);
    const agentA = await createAgent(serverA.id, "action-card-computer-agent-a", { runtime: "codex" });
    const carrier = await createChannel(serverA.id, "action-card-computer-carrier", undefined, "private");
    await addHuman(carrier.id, ownerA.id);
    await addAgent(carrier.id, agentA.id);
    const { machine: localMachine } = await registerMachine(serverA.id, ownerA.id, "tygg-ec2");
    const { machine: foreignMachine } = await registerMachine(serverB.id, ownerB.id, "other-ec2");

    const prepared = await prepareActionCard({
      serverId: serverA.id,
      requesterAgentId: agentA.id,
      targetChannelId: carrier.id,
      action: {
        type: "agent:create",
        name: "action-card-computer-created",
        description: "must run on the requested computer",
        requiredComputer: "tygg-ec2",
      },
    });

    assert.equal(prepared.metadata.action.type, "agent:create");
    if (prepared.metadata.action.type === "agent:create") {
      assert.equal(prepared.metadata.action.requiredComputer, localMachine.id);
    }

    await assert.rejects(
      () => prepareActionCard({
        serverId: serverA.id,
        requesterAgentId: agentA.id,
        targetChannelId: carrier.id,
        action: {
          type: "agent:create",
          name: "action-card-computer-foreign",
          requiredComputer: foreignMachine.id,
        },
      }),
      /requiredComputer/,
    );
  } finally {
    await app.close();
  }
});

test("agent:create action card required computer blocks mark-executed mismatch", async () => {
  const app = await startTestApp("pglite://");
  try {
    const owner = await seedUser("action-card-required-owner@slock.test", "action-card-required-owner");
    const server = await createServer("Action Card Required Computer", "action-card-required-computer", owner.id);
    const requester = await createAgent(server.id, "action-card-required-requester", { runtime: "codex" });
    const carrier = await createChannel(server.id, "action-card-required-carrier", undefined, "private");
    await addHuman(carrier.id, owner.id);
    await addAgent(carrier.id, requester.id);
    const { machine: requiredMachine } = await registerMachine(server.id, owner.id, "required-ec2");
    const { machine: wrongMachine } = await registerMachine(server.id, owner.id, "wrong-ec2");
    const created = await createAgent(server.id, "action-card-required-created", { runtime: "codex" });
    await assignMachine(created.id, wrongMachine.id);

    const card = await prepareActionCard({
      serverId: server.id,
      requesterAgentId: requester.id,
      targetChannelId: carrier.id,
      action: {
        type: "agent:create",
        name: "action-card-required-created",
        requiredComputer: requiredMachine.id,
      },
    });
    await assert.rejects(
      () => markActionCardExecuted({
        messageId: card.messageId,
        serverId: server.id,
        userId: owner.id,
        result: { kind: "agent", id: created.id, name: created.name },
      }),
      (err: unknown) => err instanceof ActionCardError
        && err.status === 409
        && err.code === "REQUIRED_COMPUTER_MISMATCH",
    );
  } finally {
    await app.close();
  }
});

test("agent:create action card rejects incompatible mark-executed result kind", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("action-card-kind-owner@slock.test", "action-card-kind-owner");
    const server = await createServer("Action Card Result Kind", "action-card-result-kind", owner.id);
    const requester = await createAgent(server.id, "action-card-kind-requester", { runtime: "codex" });
    const carrier = await createChannel(server.id, "action-card-kind-carrier", undefined, "private");
    await addHuman(carrier.id, owner.id);
    await addAgent(carrier.id, requester.id);
    const { machine: requiredMachine } = await registerMachine(server.id, owner.id, "kind-required-ec2");

    const card = await prepareActionCard({
      serverId: server.id,
      requesterAgentId: requester.id,
      targetChannelId: carrier.id,
      action: {
        type: "agent:create",
        name: "action-card-kind-created",
        requiredComputer: requiredMachine.id,
      },
    });

    await assert.rejects(
      () => markActionCardExecuted({
        messageId: card.messageId,
        serverId: server.id,
        userId: owner.id,
        result: { kind: "channel", id: carrier.id, name: carrier.name },
      }),
      (err: unknown) => err instanceof ActionCardError
        && err.status === 400
        && err.code === "ACTION_RESULT_KIND_MISMATCH",
    );

    const [row] = await db
      .select({ actionMetadata: messages.actionMetadata })
      .from(messages)
      .where(eq(messages.id, card.messageId));
    const metadata = row?.actionMetadata as { state?: string } | null | undefined;
    assert.equal(metadata?.state, "prepared");
  } finally {
    await app.close();
  }
});

test("channel membership helpers reject cross-server principals", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const ownerA = await seedUser("membership-cross-owner-a@slock.test", "membership-cross-owner-a");
    const ownerB = await seedUser("membership-cross-owner-b@slock.test", "membership-cross-owner-b");
    const serverA = await createServer("Membership Cross A", "membership-cross-a", ownerA.id);
    const serverB = await createServer("Membership Cross B", "membership-cross-b", ownerB.id);
    const channelA = await createChannel(serverA.id, "membership-cross-channel-a", undefined, "private");
    const agentB = await createAgent(serverB.id, "membership-cross-agent-b", { runtime: "codex" });

    await assert.rejects(() => addHuman(channelA.id, ownerB.id), /server/);
    await assert.rejects(() => addAgent(channelA.id, agentB.id), /server/);

    const humanRows = await db
      .select({ userId: channelHumans.userId })
      .from(channelHumans)
      .where(and(eq(channelHumans.channelId, channelA.id), eq(channelHumans.userId, ownerB.id)));
    assert.equal(humanRows.length, 0);

    const agentRows = await db
      .select({ agentId: channelAgents.agentId })
      .from(channelAgents)
      .where(and(eq(channelAgents.channelId, channelA.id), eq(channelAgents.agentId, agentB.id)));
    assert.equal(agentRows.length, 0);
  } finally {
    await app.close();
  }
});

test("prepared action cards advance realtime gap recovery seq", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("action-card-seq-owner@slock.test", "action-card-seq-owner");
    const server = await createServer("Action Card Seq Server", "action-card-seq-server", owner.id);
    const agent = await createAgent(server.id, "action-card-seq-agent", { runtime: "codex" });
    const channel = await createChannel(server.id, "action-card-seq-channel", undefined, "channel");
    await addHuman(channel.id, owner.id);
    await addAgent(channel.id, agent.id);

    const card = await prepareActionCard({
      serverId: server.id,
      requesterAgentId: agent.id,
      targetChannelId: channel.id,
      action: {
        type: "channel:create",
        name: "action-card-seq-created-channel",
        visibility: "public",
      },
    });

    const [message] = await db
      .select({ seq: messages.seq })
      .from(messages)
      .where(eq(messages.id, card.messageId));

    assert.ok(message?.seq, "prepared action card should create a message row");
    assert.ok(
      getMaxSeq(server.id) >= message.seq,
      "prepared action card message must advance max seq so missed socket events self-heal",
    );
  } finally {
    await app.close();
  }
});
