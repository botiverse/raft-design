import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import argon2 from "argon2";
import { and, desc, eq } from "drizzle-orm";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { channelAgents, channels, messages, threadFollows, users } from "../db/schema.js";
import { createServer } from "../services/serverService.js";
import { createAgent, assignMachine } from "../services/agentService.js";
import { registerMachine } from "../services/machineService.js";
import * as channelService from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import * as taskService from "../services/taskService.js";

const execFileAsync = promisify(execFile);
const cliEntry = fileURLToPath(new URL("../../../cli/src/index.ts", import.meta.url));

interface EmittedEvent {
  room: string;
  event: string;
  payload: unknown;
}

function installFakeIo(app: { set: (k: string, v: unknown) => void }): EmittedEvent[] {
  const events: EmittedEvent[] = [];
  const fakeIo = {
    to(room: string) {
      return {
        emit(event: string, payload: unknown) {
          events.push({ room, event, payload });
        },
      };
    },
  };
  app.set("io", fakeIo);
  return events;
}

async function seed() {
  const db = getDb();
  const [owner] = await db
    .insert(users)
    .values({
      email: "internal-channel-owner@slock.test",
      name: "internal-channel-owner",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();
  const server = await createServer("Internal Channel", "internal-channel", owner.id);
  const agent = await createAgent(server.id, "channel-agent", { runtime: "claude" });
  const { machine, apiKey } = await registerMachine(server.id, owner.id, "channel-machine");
  await assignMachine(agent.id, machine.id);
  const channel = await channelService.createChannel(server.id, "focus-room", "Agent can leave this channel");
  await channelService.addAgent(channel.id, agent.id);
  const joinOnlyChannel = await channelService.createChannel(server.id, "join-public", "Agent can self-join this visible public channel");
  const [allChannel] = (await channelService.listChannels(server.id)).filter((candidate) => candidate.name === "all");
  return { server, agent, machine, apiKey, channel, joinOnlyChannel, allChannel, owner };
}

function machineHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function installReceiveOrchestrator(
  app: { set: (k: string, v: unknown) => void },
  receiveMessages: (signal?: AbortSignal) => Promise<never[]>,
): void {
  app.set("agentOrchestrator", {
    deliverMessage: async () => {},
    receiveMessages: async (_agentId: string, _block: boolean, _timeoutMs: number, signal?: AbortSignal) =>
      receiveMessages(signal),
    hasMachineLocally: () => true,
    getActivity: async () => ({ activity: "offline", activityDetail: "" }),
    getMachineStatus: async () => "offline",
    getMachineStatusVersion: async () => 0,
    getMachineDaemonVersion: () => null,
    evictCache: () => {},
    shutdown: () => {},
    setIO: () => {},
  });
}

async function isAgentInChannel(channelId: string, agentId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ channelId: channelAgents.channelId })
    .from(channelAgents)
    .where(and(eq(channelAgents.channelId, channelId), eq(channelAgents.agentId, agentId)));
  return !!row;
}

async function createFollowedThread(channelId: string, ownerId: string, agentId: string) {
  const db = getDb();
  const parentMessage = await createMessage(channelId, "user", ownerId, "parent message");
  const thread = await channelService.getOrCreateThread(parentMessage.id, ownerId, "user");
  await db.insert(threadFollows).values({
    threadChannelId: thread.id,
    followerType: "agent",
    followerId: agentId,
    parentMessageId: parentMessage.id,
    reason: "manual",
  }).onConflictDoNothing();
  return { thread, parentMessage };
}

async function isAgentFollowingThread(threadChannelId: string, agentId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ threadChannelId: threadFollows.threadChannelId })
    .from(threadFollows)
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      eq(threadFollows.followerType, "agent"),
      eq(threadFollows.followerId, agentId),
    ));
  return !!row;
}

async function runSlockCli(
  args: string[],
  env: Record<string, string>,
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(process.execPath, ["--import", "tsx", cliEntry, ...args], {
    env: {
      ...process.env,
      SLOCK_AGENT_TOKEN_FILE: "",
      ...env,
    },
  });
}

test("agent receive long-poll records semantic phases without raw ids", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey } = await seed();
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "1".repeat(32),
      spanIdGenerator: () => "2".repeat(16),
    });
    app.app.set("serverTracer", tracer);
    installReceiveOrchestrator(app.app, async () => []);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/receive?block=false&timeout=1`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    assert.deepEqual(await res.json(), { messages: [] });

    const [span] = sink.getAllSpans();
    assert.equal(span.name, "server.http.request");
    assert.equal(span.attrs?.route_pattern, "/internal/agent/:id/receive");
    assert.equal(span.attrs?.caller_kind, "agent");
    assert.equal(span.attrs?.agent_id_present, true);
    assert.deepEqual(
      span.events.map((event) => event.name),
      [
        "agent_receive.request.started",
        "agent.ownership.checked",
        "machine.routing.checked",
        "agent_receive.wait.started",
        "agent_receive.messages.received",
        "messages.rendered",
        "response.ready",
        "http.response.finished",
      ],
    );

    const receivedEvent = span.events.find((event) => event.name === "agent_receive.messages.received");
    assert.equal(receivedEvent?.attrs?.messages_count, 0);
    assert.equal(receivedEvent?.attrs?.outcome, "empty");
    const readyEvent = span.events.find((event) => event.name === "response.ready");
    assert.equal(readyEvent?.attrs?.messages_count, 0);
    assert.equal(Object.values(span.attrs ?? {}).includes(agent.id), false);
    assert.equal(span.events.some((event) => Object.values(event.attrs ?? {}).includes(agent.id)), false);
  } finally {
    await app.close();
  }
});

test("agent receive long-poll records timeout and failure outcomes", async () => {
  const timeoutApp = await startTestApp("pglite://");
  try {
    const { agent, apiKey } = await seed();
    const sink = new MemoryTraceSink();
    timeoutApp.app.set("serverTracer", new BasicTracer({
      sink,
      traceIdGenerator: () => "7".repeat(32),
      spanIdGenerator: () => "8".repeat(16),
    }));
    installReceiveOrchestrator(timeoutApp.app, async () => []);

    const res = await fetch(`${timeoutApp.baseUrl}/internal/agent/${agent.id}/receive?block=true&timeout=1`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    const [span] = sink.getAllSpans();
    const receivedEvent = span.events.find((event) => event.name === "agent_receive.messages.received");
    assert.equal(receivedEvent?.attrs?.outcome, "timeout");
  } finally {
    await timeoutApp.close();
  }

  const failureApp = await startTestApp("pglite://");
  const originalConsoleError = console.error;
  try {
    console.error = () => {};
    const { agent, apiKey } = await seed();
    const sink = new MemoryTraceSink();
    failureApp.app.set("serverTracer", new BasicTracer({
      sink,
      traceIdGenerator: () => "9".repeat(32),
      spanIdGenerator: () => "a".repeat(16),
    }));
    installReceiveOrchestrator(failureApp.app, async () => {
      throw new Error("receive failed");
    });

    const res = await fetch(`${failureApp.baseUrl}/internal/agent/${agent.id}/receive?block=true&timeout=1`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 500, `expected 500, got ${res.status}`);
    const [span] = sink.getAllSpans();
    assert.equal(span.status, "error");
    const failedEvent = span.events.find((event) => event.name === "agent_receive.request.failed");
    assert.equal(failedEvent?.attrs?.error_class, "Error");
    assert.equal(Object.values(failedEvent?.attrs ?? {}).includes("receive failed"), false);
  } finally {
    console.error = originalConsoleError;
    await failureApp.close();
  }
});

test("agent receive long-poll closes the HTTP span exactly once on client abort", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey } = await seed();
    const sink = new MemoryTraceSink();
    const tracer = new BasicTracer({
      sink,
      traceIdGenerator: () => "3".repeat(32),
      spanIdGenerator: () => "4".repeat(16),
    });
    app.app.set("serverTracer", tracer);

    let markReceiveStarted!: () => void;
    const receiveStarted = new Promise<void>((resolve) => {
      markReceiveStarted = resolve;
    });
    let abortObserved!: Promise<void>;
    installReceiveOrchestrator(app.app, async (signal) => {
      markReceiveStarted();
      abortObserved = new Promise<void>((resolve) => {
        if (signal?.aborted) {
          resolve();
          return;
        }
        signal?.addEventListener("abort", () => resolve(), { once: true });
      });
      await abortObserved;
      return [];
    });

    const abort = new AbortController();
    const request = fetch(`${app.baseUrl}/internal/agent/${agent.id}/receive?block=true&timeout=10000`, {
      headers: machineHeaders(apiKey),
      signal: abort.signal,
    });
    await receiveStarted;
    abort.abort();
    await assert.rejects(request, { name: "AbortError" });
    await abortObserved;
    await new Promise((resolve) => setTimeout(resolve, 20));

    const spans = sink.getAllSpans();
    assert.equal(spans.length, 1);
    const [span] = spans;
    assert.equal(span.status, "cancelled");
    assert.equal(span.events.filter((event) => event.name === "http.response.closed").length, 1);
    assert.equal(span.events.filter((event) => event.name === "http.response.finished").length, 0);
    assert.equal(
      span.events.filter((event) => event.name === "agent_receive.request.closed").length,
      1,
      JSON.stringify(span.events.map((event) => event.name)),
    );
    assert.equal(Object.values(span.attrs ?? {}).includes(agent.id), false);
  } finally {
    await app.close();
  }
});

test("agent internal route can leave its own regular channel without admin permissions", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, channel } = await seed();
    const events = installFakeIo(app.app);
    assert.equal(await isAgentInChannel(channel.id, agent.id), true);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/channels/${channel.id}/leave`, {
      method: "POST",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    assert.equal(await isAgentInChannel(channel.id, agent.id), false);
    assert.deepEqual(events, [
      {
        room: `server:${agent.serverId}`,
        event: "channel:members-updated",
        payload: { channelId: channel.id },
      },
    ]);
  } finally {
    await app.close();
  }
});

test("agent internal route can leave private channel and empty private channel is deleted", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const { agent, apiKey, server } = await seed();
    const privateChannel = await channelService.createChannel(server.id, "agent-private-leave", undefined, "private");
    await channelService.addAgent(privateChannel.id, agent.id);
    const events = installFakeIo(app.app);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/channels/${privateChannel.id}/leave`, {
      method: "POST",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    assert.equal(await isAgentInChannel(privateChannel.id, agent.id), false);
    assert.deepEqual(events, [
      {
        room: `channel:${privateChannel.id}`,
        event: "channel:members-updated",
        payload: { channelId: privateChannel.id },
      },
    ]);

    const [deleted] = await db
      .select({ deletedAt: channels.deletedAt })
      .from(channels)
      .where(eq(channels.id, privateChannel.id));
    assert.ok(deleted?.deletedAt, "agent-only private channel should be deleted when the agent leaves");
  } finally {
    await app.close();
  }
});

test("agent server info includes current runtime machine context", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, machine, apiKey, server } = await seed();

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/server`, {
      method: "GET",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    const data = await res.json() as any;
    assert.deepEqual(data.runtimeContext, {
      agentId: agent.id,
      serverId: server.id,
      machineId: machine.id,
      machineName: machine.name,
      machineHostname: null,
      machineOs: null,
      daemonVersion: null,
      workspacePath: null,
    });
  } finally {
    await app.close();
  }
});

test("agent server info hides archived channels and non-member private channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server, owner } = await seed();
    const archivedChannel = await channelService.createChannel(server.id, "archived-agent-list", "hidden from list_server");
    await channelService.addAgent(archivedChannel.id, agent.id);
    await channelService.archiveChannel(archivedChannel.id, owner.id);
    const privateMemberChannel = await channelService.createChannel(server.id, "agent-private-member", undefined, "private");
    await channelService.addAgent(privateMemberChannel.id, agent.id);
    await channelService.createChannel(server.id, "agent-private-outsider", undefined, "private");

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/server`, {
      method: "GET",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    const data = await res.json() as { channels: Array<{ name: string; type: string; joined: boolean; archivedAt?: string | null }> };
    const channelNames = data.channels.map((channel) => channel.name);
    const byName = new Map(data.channels.map((channel) => [channel.name, channel]));
    assert.ok(channelNames.includes("focus-room"), "agent should still see active regular channels");
    assert.ok(channelNames.includes("join-public"), "agent should still see public channels it has not joined");
    assert.ok(channelNames.includes("agent-private-member"), "agent should see private channels it belongs to");
    assert.equal(byName.get("focus-room")?.type, "channel", "agent list_server must identify public channels");
    assert.equal(byName.get("agent-private-member")?.type, "private", "agent list_server must identify private channels");
    assert.ok(!channelNames.includes("agent-private-outsider"), "agent must not see private channels it does not belong to");
    assert.ok(!channelNames.includes("archived-agent-list"), "agent list_server must not include archived channels");
  } finally {
    await app.close();
  }
});

test("agent internal route can unfollow its own thread attention row", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, channel, owner } = await seed();
    const { thread, parentMessage } = await createFollowedThread(channel.id, owner.id, agent.id);
    assert.equal(await isAgentFollowingThread(thread.id, agent.id), true);
    assert.equal(await isAgentInChannel(channel.id, agent.id), true);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/threads/unfollow`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ thread: `#focus-room:${parentMessage.id.slice(0, 8)}` }),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    assert.equal(await isAgentFollowingThread(thread.id, agent.id), false);
    assert.equal(await isAgentInChannel(channel.id, agent.id), true);
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock thread unfollow removes agent attention without leaving parent channel", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, channel, owner, server } = await seed();
    const { thread, parentMessage } = await createFollowedThread(channel.id, owner.id, agent.id);
    const threadTarget = `#focus-room:${parentMessage.id.slice(0, 8)}`;
    assert.equal(await isAgentFollowingThread(thread.id, agent.id), true);
    assert.equal(await isAgentInChannel(channel.id, agent.id), true);

    const { stdout, stderr } = await runSlockCli(
      ["thread", "unfollow", "--target", threadTarget],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    assert.match(stdout, /^Unfollowed #focus-room:[0-9a-f]{8}\./);
    assert.equal(await isAgentFollowingThread(thread.id, agent.id), false);
    assert.equal(await isAgentInChannel(channel.id, agent.id), true);
  } finally {
    await app.close();
  }
});

test("agent internal route can unfollow a followed thread without parent membership", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { server, machine, apiKey, channel, owner } = await seed();
    const listener = await createAgent(server.id, "thread-listener", { runtime: "claude" });
    await assignMachine(listener.id, machine.id);
    const { thread } = await createFollowedThread(channel.id, owner.id, listener.id);
    assert.equal(await isAgentFollowingThread(thread.id, listener.id), true);
    assert.equal(await isAgentInChannel(channel.id, listener.id), false);

    const res = await fetch(`${app.baseUrl}/internal/agent/${listener.id}/threads/unfollow`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ thread: thread.id }),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    assert.equal(await isAgentFollowingThread(thread.id, listener.id), false);
    assert.equal(await isAgentInChannel(channel.id, listener.id), false);
  } finally {
    await app.close();
  }
});

test("agent internal route rejects non-thread unfollow targets", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey } = await seed();
    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/threads/unfollow`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ thread: "#focus-room" }),
    });
    assert.equal(res.status, 400, `expected 400, got ${res.status}`);
    const body = (await res.json()) as { error?: string };
    assert.match(body.error ?? "", /Target must be a thread/);
  } finally {
    await app.close();
  }
});

test("agent internal route can join a visible public channel", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const { agent, apiKey, joinOnlyChannel } = await seed();
    const events = installFakeIo(app.app);
    const deliveries: Array<{ agentId: string; message: { content: string; sender_type: string; seq?: number } }> = [];
    const agentOrchestrator = app.app.get("agentOrchestrator") as {
      deliverMessage: (agentId: string, message: { content: string; sender_type: string; seq?: number }) => Promise<void>;
    };
    agentOrchestrator.deliverMessage = async (agentId, message) => {
      deliveries.push({ agentId, message });
    };
    assert.equal(await isAgentInChannel(joinOnlyChannel.id, agent.id), false);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/channels/${joinOnlyChannel.id}/join`, {
      method: "POST",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    assert.equal(await isAgentInChannel(joinOnlyChannel.id, agent.id), true);
    const [systemMessage] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.channelId, joinOnlyChannel.id), eq(messages.messageType, "system")))
      .orderBy(desc(messages.createdAt));
    assert.ok(systemMessage, "expected a persistent self-join system message");
    assert.equal(systemMessage.content, "@channel-agent joined this channel.");
    assert.equal(systemMessage.senderId, "system");

    const delivery = deliveries.find((item) => item.agentId === agent.id);
    assert.ok(delivery, "joining agent should receive the channel system message");
    assert.equal(delivery.message.sender_type, "system");
    assert.equal(delivery.message.content, "@channel-agent joined this channel.");
    assert.ok(delivery.message.seq, "delivery should carry the persisted message seq");
    assert.deepEqual(events.at(-1), {
      room: `server:${agent.serverId}`,
      event: "channel:members-updated",
      payload: { channelId: joinOnlyChannel.id },
    });
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock channel join adds agent to a visible public channel", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, joinOnlyChannel, server } = await seed();
    assert.equal(await isAgentInChannel(joinOnlyChannel.id, agent.id), false);

    const { stdout, stderr } = await runSlockCli(
      ["channel", "join", "--target", "#join-public"],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    assert.equal(stdout, "Joined #join-public. You can now send messages there and receive ordinary channel delivery.\n");
    assert.equal(await isAgentInChannel(joinOnlyChannel.id, agent.id), true);
  } finally {
    await app.close();
  }
});

test("agent internal route cannot self-join private channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();
    const privateChannel = await channelService.createChannel(server.id, "agent-private-invite-only", undefined, "private");

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/channels/${privateChannel.id}/join`, {
      method: "POST",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 403, `expected 403, got ${res.status}`);
    const body = (await res.json()) as { error?: string };
    assert.match(body.error ?? "", /Private channels require an invitation/);
    assert.equal(await isAgentInChannel(privateChannel.id, agent.id), false);
  } finally {
    await app.close();
  }
});

test("agent internal route cannot self-join joint channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();
    const jointChannel = await channelService.createChannel(server.id, "agent-joint-invite-only", undefined, "joint");

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/channels/${jointChannel.id}/join`, {
      method: "POST",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 403, `expected 403, got ${res.status}`);
    const body = (await res.json()) as { error?: string };
    assert.match(body.error ?? "", /Joint channels require an invitation/);
    assert.equal(await isAgentInChannel(jointChannel.id, agent.id), false);
  } finally {
    await app.close();
  }
});

test("agent internal route cannot join archived public channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, joinOnlyChannel, owner } = await seed();
    await channelService.archiveChannel(joinOnlyChannel.id, owner.id);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/channels/${joinOnlyChannel.id}/join`, {
      method: "POST",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 409, `expected 409, got ${res.status}`);
    const body = (await res.json()) as { code?: string; error?: string };
    assert.equal(body.code, "channel_archived");
    assert.equal(await isAgentInChannel(joinOnlyChannel.id, agent.id), false);
  } finally {
    await app.close();
  }
});

test("agent reactions cloak private message existence from non-member agents", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { server, agent, machine, apiKey, owner } = await seed();
    const outsiderAgent = await createAgent(server.id, "reaction-outsider-agent", { runtime: "claude" });
    await assignMachine(outsiderAgent.id, machine.id);
    const privateChannel = await channelService.createChannel(server.id, "agent-reaction-private", undefined, "private");
    await channelService.addAgent(privateChannel.id, agent.id);
    const chatMessage = await createMessage(privateChannel.id, "user", owner.id, "private agent reaction target");
    const systemMessage = await createMessage(privateChannel.id, "user", "system", "private system event", "system");
    const headers = machineHeaders(apiKey);

    const addChat = await fetch(`${app.baseUrl}/internal/agent/${outsiderAgent.id}/messages/${chatMessage.id}/reactions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(addChat.status, 404, `expected private add 404, got ${addChat.status}`);

    const removeChat = await fetch(`${app.baseUrl}/internal/agent/${outsiderAgent.id}/messages/${chatMessage.id}/reactions`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(removeChat.status, 404, `expected private remove 404, got ${removeChat.status}`);

    const addSystem = await fetch(`${app.baseUrl}/internal/agent/${outsiderAgent.id}/messages/${systemMessage.id}/reactions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(addSystem.status, 404, `expected private system add 404, got ${addSystem.status}`);
  } finally {
    await app.close();
  }
});

test("agent internal task mutations require parent channel membership even when public channel is readable", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, joinOnlyChannel, owner } = await seed();
    assert.equal(await isAgentInChannel(joinOnlyChannel.id, agent.id), false);
    const [task] = await taskService.createTasks(joinOnlyChannel.id, "user", owner.id, [{ title: "visible but read-only task" }]);

    const listRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/tasks?channel=${encodeURIComponent("#join-public")}`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(listRes.status, 200, `expected list 200, got ${listRes.status}`);
    const listBody = await listRes.json() as { tasks: Array<{ messageId: string }> };
    assert.equal(listBody.tasks.some((candidate) => candidate.messageId === task.id), true);

    const claimRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/tasks/claim`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ channel: "#join-public", task_numbers: [task.taskNumber] }),
    });
    assert.equal(claimRes.status, 403, `expected claim 403, got ${claimRes.status}`);

    const updateRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/tasks/update-status`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ channel: "#join-public", task_number: task.taskNumber, status: "in_progress" }),
    });
    assert.equal(updateRes.status, 403, `expected update 403, got ${updateRes.status}`);

    const createRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/tasks`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ channel: "#join-public", tasks: [{ title: "should not create" }] }),
    });
    assert.equal(createRes.status, 403, `expected create 403, got ${createRes.status}`);
  } finally {
    await app.close();
  }
});

test("agent internal route cannot leave #all", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, allChannel } = await seed();
    assert.ok(allChannel);
    assert.equal(await isAgentInChannel(allChannel.id, agent.id), true);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/channels/${allChannel.id}/leave`, {
      method: "POST",
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 403, `expected 403, got ${res.status}`);
    const body = (await res.json()) as { error?: string };
    assert.match(body.error ?? "", /#all channel/);
    assert.equal(await isAgentInChannel(allChannel.id, agent.id), true);
  } finally {
    await app.close();
  }
});
