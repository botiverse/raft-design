import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import argon2 from "argon2";
import { and, eq } from "drizzle-orm";

import { getDb } from "../db/index.js";
import { attachments, channelAgents, computers, messageReactions, oauthAccessRequests, oauthGrants, users } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { createServer } from "../services/serverService.js";
import { createAgent } from "../services/agentService.js";
import { createChannel, addAgent, addHuman, getOrCreateThread } from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import { registerMachine } from "../services/machineService.js";
import { mintAgentCredential, type AgentCapability } from "../services/agentCredentialService.js";
import { generateComputerApiKeyMaterial } from "../services/computerCredentialService.js";
import { createOAuthClient } from "../services/oauthService.js";
import { resetStorageForTests } from "../services/storageService.js";

type AuthFixture = {
  ownerId: string;
  serverId: string;
  agentId: string;
  channelId: string;
  channelName: string;
  joinOnlyChannelId: string;
  machineApiKey: string;
  computerApiKey: string;
  agentApiKey: string;
  readOnlyApiKey: string;
};

function jsonHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function mintAgentKey(agentId: string, scopes: readonly AgentCapability[]): Promise<string> {
  const minted = await mintAgentCredential({
    agentId,
    scopes,
    name: `test-${scopes.join("-")}`,
    createdByUserId: null,
  });
  return minted.apiKey;
}

async function seedAuthFixture(): Promise<AuthFixture> {
  const db = getDb();
  const suffix = randomUUID();
  const [owner] = await db.insert(users).values({
    email: `agent-api-auth-${suffix}@slock.test`,
    name: `agent-api-auth-${suffix}`,
    displayName: "Agent API Auth Owner",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();

  const server = await createServer("Agent API Auth Test", `agent-api-auth-${suffix}`, owner.id);
  const agent = await createAgent(server.id, "AgentApiAuthBot", { runtime: "claude", model: "sonnet" });
  const channel = await createChannel(server.id, "agent-api-auth-room");
  const joinOnlyChannel = await createChannel(server.id, "agent-api-auth-join-room");
  await addHuman(channel.id, owner.id);
  await addAgent(channel.id, agent.id);

  const { apiKey: machineApiKey } = await registerMachine(server.id, owner.id, "agent-api-auth-machine");
  const computerMaterial = await generateComputerApiKeyMaterial();
  await db.insert(computers).values({
    serverId: server.id,
    name: "agent-api-auth-computer",
    apiKeyHash: computerMaterial.apiKeyHash,
    apiKeyPrefix: computerMaterial.apiKeyPrefix,
    attachedByUserId: owner.id,
  });
  const agentApiKey = await mintAgentKey(agent.id, ["send", "read", "mentions", "tasks", "reactions", "server", "channels"]);
  const readOnlyApiKey = await mintAgentKey(agent.id, ["read"]);

  return {
    ownerId: owner.id,
    serverId: server.id,
    agentId: agent.id,
    channelId: channel.id,
    channelName: channel.name,
    joinOnlyChannelId: joinOnlyChannel.id,
    machineApiKey,
    computerApiKey: computerMaterial.apiKey,
    agentApiKey,
    readOnlyApiKey,
  };
}

test("agent-api and computer surfaces reject wrong principals with stable errors", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const machineOnAgentApi = await fetch(`${app.baseUrl}/internal/agent-api`, {
      headers: jsonHeaders(fixture.machineApiKey),
    });
    assert.equal(machineOnAgentApi.status, 401);
    assert.equal((await machineOnAgentApi.json() as { code?: string }).code, "invalid_principal");

    const computerOnAgentApi = await fetch(`${app.baseUrl}/internal/agent-api`, {
      headers: jsonHeaders(fixture.computerApiKey),
    });
    assert.equal(computerOnAgentApi.status, 401);
    assert.equal((await computerOnAgentApi.json() as { code?: string }).code, "invalid_principal");

    const agentOnComputer = await fetch(`${app.baseUrl}/internal/computer/runners/${fixture.agentId}/credentials`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ scopes: ["read"] }),
    });
    assert.equal(agentOnComputer.status, 401);
    assert.equal((await agentOnComputer.json() as { code?: string }).code, "invalid_principal");
  } finally {
    await app.close();
  }
});

test("agent-api server info and channel membership use the bound runner identity", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const serverInfo = await fetch(`${app.baseUrl}/internal/agent-api/server`, {
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(serverInfo.status, 200);
    const serverBody = await serverInfo.json() as { runtimeContext?: { agentId?: string }; channels?: Array<{ id: string; joined: boolean }> };
    assert.equal(serverBody.runtimeContext?.agentId, fixture.agentId);
    assert.equal(serverBody.channels?.find((channel) => channel.id === fixture.channelId)?.joined, true);
    assert.equal(serverBody.channels?.find((channel) => channel.id === fixture.joinOnlyChannelId)?.joined, false);

    const join = await fetch(`${app.baseUrl}/internal/agent-api/channels/${fixture.joinOnlyChannelId}/join`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(join.status, 200);

    const leave = await fetch(`${app.baseUrl}/internal/agent-api/channels/${fixture.channelId}/leave`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(leave.status, 200);
  } finally {
    await app.close();
  }
});

test("agent-api integrations discovery and login use the bound runner identity", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();
    const { client } = await createOAuthClient({
      serverId: fixture.serverId,
      createdByUserId: fixture.ownerId,
      clientId: "orbital-notes-demo",
      name: "Orbital Notes",
      description: "Demo app",
      homepageUrl: "https://demo.example.test",
      returnUrl: "https://demo.example.test/login/callback",
    });

    const list = await fetch(`${app.baseUrl}/internal/agent-api/integrations`, {
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(list.status, 200);
    const listBody = await list.json() as {
      services?: Array<{ id: string; clientId: string; name: string }>;
      activeLogins?: unknown[];
    };
    assert.equal(listBody.services?.length, 1);
    assert.equal(listBody.services?.[0]?.id, client.id);
    assert.equal(listBody.services?.[0]?.clientId, "orbital-notes-demo");
    assert.deepEqual(listBody.activeLogins, []);

    const login = await fetch(`${app.baseUrl}/internal/agent-api/integrations/login`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ service: "orbital-notes-demo" }),
    });
    assert.equal(login.status, 200);
    const loginBody = await login.json() as {
      status?: string;
      service?: { id: string; clientId: string };
      scopes?: string[];
    };
    assert.equal(loginBody.status, "logged_in");
    assert.equal(loginBody.service?.id, client.id);
    assert.deepEqual(loginBody.scopes, ["identity", "openid", "profile"]);

    const rows = await getDb()
      .select({
        requestStatus: oauthAccessRequests.status,
        remember: oauthAccessRequests.remember,
        grantId: oauthGrants.id,
      })
      .from(oauthAccessRequests)
      .innerJoin(oauthGrants, and(
        eq(oauthGrants.serverId, oauthAccessRequests.serverId),
        eq(oauthGrants.agentId, oauthAccessRequests.agentId),
        eq(oauthGrants.clientId, oauthAccessRequests.clientId),
      ))
      .where(and(
        eq(oauthAccessRequests.agentId, fixture.agentId),
        eq(oauthAccessRequests.clientId, client.id),
      ));
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.requestStatus, "approved");
    assert.equal(rows[0]?.remember, true);
    assert.ok(rows[0]?.grantId);

    const afterLogin = await fetch(`${app.baseUrl}/internal/agent-api/integrations`, {
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(afterLogin.status, 200);
    const afterLoginBody = await afterLogin.json() as { activeLogins?: Array<{ clientId: string }> };
    assert.deepEqual(afterLoginBody.activeLogins?.map((login) => login.clientId), ["orbital-notes-demo"]);

    const repeatLogin = await fetch(`${app.baseUrl}/internal/agent-api/integrations/login`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ service: "orbital-notes-demo" }),
    });
    assert.equal(repeatLogin.status, 200);
    const repeatBody = await repeatLogin.json() as { status?: string };
    assert.equal(repeatBody.status, "already_logged_in");
  } finally {
    await app.close();
  }
});

test("agent-api cannot self-join joint channels", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();
    const jointChannel = await createChannel(
      fixture.serverId,
      `agent-api-joint-invite-only-${randomUUID()}`,
      "joint invite only",
      "joint",
    );

    const join = await fetch(`${app.baseUrl}/internal/agent-api/channels/${jointChannel.id}/join`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(join.status, 403, `expected 403, got ${join.status}`);
    const body = (await join.json()) as { error?: string };
    assert.match(body.error ?? "", /Joint channels require an invitation/);

    const rows = await getDb()
      .select({ channelId: channelAgents.channelId })
      .from(channelAgents)
      .where(and(eq(channelAgents.channelId, jointChannel.id), eq(channelAgents.agentId, fixture.agentId)));
    assert.equal(rows.length, 0, "agent-api join must not add channel_agents rows for joint channels");
  } finally {
    await app.close();
  }
});

test("agent-api attachment download serves unicode pdf filenames", async () => {
  const previousUploadsDir = process.env.UPLOADS_DIR;
  const previousUploadsLocal = process.env.UPLOADS_LOCAL;
  const uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-api-attachments-"));
  process.env.UPLOADS_DIR = uploadsDir;
  process.env.UPLOADS_LOCAL = "true";
  resetStorageForTests();

  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();
    const pdfId = "00000000-0000-4000-8000-000000000099";
    const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n");
    const storageDir = path.join(uploadsDir, fixture.serverId);
    fs.mkdirSync(storageDir, { recursive: true });
    fs.writeFileSync(path.join(storageDir, `${pdfId}.pdf`), pdfBuffer);

    const db = getDb();
    await db.insert(attachments).values({
      id: pdfId,
      channelId: fixture.channelId,
      uploaderId: fixture.agentId,
      uploaderType: "agent",
      filename: "这文件里有什么.pdf",
      mimeType: "application/pdf",
      sizeBytes: pdfBuffer.length,
      storageKey: `${fixture.serverId}/${pdfId}.pdf`,
      thumbnailKey: null,
      contentHash: "hash-agent-unicode-pdf",
    });

    const res = await fetch(`${app.baseUrl}/internal/agent-api/attachments/${pdfId}`, {
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "application/pdf");
    assert.match(res.headers.get("content-disposition") ?? "", /^attachment; filename="/);
    assert.match(res.headers.get("content-disposition") ?? "", /filename\*=UTF-8''/);
    assert.deepEqual(Buffer.from(await res.arrayBuffer()), pdfBuffer);
  } finally {
    await app.close();
    resetStorageForTests();
    if (previousUploadsDir === undefined) delete process.env.UPLOADS_DIR;
    else process.env.UPLOADS_DIR = previousUploadsDir;
    if (previousUploadsLocal === undefined) delete process.env.UPLOADS_LOCAL;
    else process.env.UPLOADS_LOCAL = previousUploadsLocal;
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  }
});

test("route auth registry fails closed for unregistered new-surface siblings", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const unregisteredAgentApi = await fetch(`${app.baseUrl}/internal/agent-api/not-registered`, {
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(unregisteredAgentApi.status, 401);
    assert.equal((await unregisteredAgentApi.json() as { code?: string }).code, "auth_policy_unregistered_path");

    const unregisteredComputer = await fetch(`${app.baseUrl}/internal/computer/not-registered`, {
      headers: jsonHeaders(fixture.machineApiKey),
    });
    assert.equal(unregisteredComputer.status, 401);
    assert.equal((await unregisteredComputer.json() as { code?: string }).code, "auth_policy_unregistered_path");
  } finally {
    await app.close();
  }
});

test("computer surface accepts phase-one machine alias for runner credential mint", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const res = await fetch(`${app.baseUrl}/internal/computer/runners/${fixture.agentId}/credentials`, {
      method: "POST",
      headers: jsonHeaders(fixture.machineApiKey),
      body: JSON.stringify({ scopes: ["read"], name: "machine-alias-mint" }),
    });
    assert.equal(res.status, 201);
    assert.equal(res.headers.get("Sec-Slock-Api-Version"), "1");
    const body = await res.json() as { apiKey?: string; scopes?: string[]; agentId?: string };
    assert.ok(body.apiKey?.startsWith("sk_agent_"));
    assert.deepEqual(body.scopes, ["read"]);
    assert.equal(body.agentId, fixture.agentId);
  } finally {
    await app.close();
  }
});

test("computer surface revokes managed-runner credential and raw sk_agent stops authenticating", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const mint = await fetch(`${app.baseUrl}/internal/computer/runners/${fixture.agentId}/credentials`, {
      method: "POST",
      headers: jsonHeaders(fixture.machineApiKey),
      body: JSON.stringify({ scopes: ["server"], name: "managed-runner-test" }),
    });
    assert.equal(mint.status, 201);
    const minted = await mint.json() as { apiKey?: string; credentialId?: string };
    assert.ok(minted.apiKey?.startsWith("sk_agent_"));
    assert.ok(minted.credentialId);

    const beforeRevoke = await fetch(`${app.baseUrl}/internal/agent-api/server`, {
      headers: jsonHeaders(minted.apiKey!),
    });
    assert.equal(beforeRevoke.status, 200);

    const revoke = await fetch(
      `${app.baseUrl}/internal/computer/runners/${fixture.agentId}/credentials/${minted.credentialId}`,
      {
        method: "DELETE",
        headers: jsonHeaders(fixture.machineApiKey),
      },
    );
    assert.equal(revoke.status, 204);

    const afterRevoke = await fetch(`${app.baseUrl}/internal/agent-api/server`, {
      headers: jsonHeaders(minted.apiKey!),
    });
    assert.equal(afterRevoke.status, 401);
    assert.equal((await afterRevoke.json() as { error?: string }).error, "Invalid agent credential");
  } finally {
    await app.close();
  }
});

test("computer surface accepts canonical computer credentials for runner credential mint", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const res = await fetch(`${app.baseUrl}/internal/computer/runners/${fixture.agentId}/credentials`, {
      method: "POST",
      headers: jsonHeaders(fixture.computerApiKey),
      body: JSON.stringify({ scopes: ["read", "server"], name: "computer-mint" }),
    });
    assert.equal(res.status, 201);
    const body = await res.json() as { apiKey?: string; scopes?: string[]; agentId?: string };
    assert.ok(body.apiKey?.startsWith("sk_agent_"));
    assert.deepEqual(body.scopes, ["read", "server"]);
    assert.equal(body.agentId, fixture.agentId);
  } finally {
    await app.close();
  }
});

test("experimental internal surfaces return version header on agent-api responses", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const res = await fetch(`${app.baseUrl}/internal/agent-api`, {
      headers: jsonHeaders(fixture.agentApiKey),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Sec-Slock-Api-Version"), "1");
    const body = await res.json() as { agentId?: string };
    assert.equal(body.agentId, fixture.agentId);
  } finally {
    await app.close();
  }
});

test("read-only agent credential is denied on mutating agent-api routes", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const send = await fetch(`${app.baseUrl}/internal/agent-api/send`, {
      method: "POST",
      headers: jsonHeaders(fixture.readOnlyApiKey),
      body: JSON.stringify({ target: `#${fixture.channelName}`, content: "should not send" }),
    });
    assert.equal(send.status, 403);
    assert.equal((await send.json() as { code?: string; requiredCapability?: string }).code, "capability_not_authorized");

    const taskClaim = await fetch(`${app.baseUrl}/internal/agent-api/tasks/claim`, {
      method: "POST",
      headers: jsonHeaders(fixture.readOnlyApiKey),
      body: JSON.stringify({ channel: `#${fixture.channelName}`, task_numbers: [1] }),
    });
    assert.equal(taskClaim.status, 403);
    assert.equal((await taskClaim.json() as { requiredCapability?: string }).requiredCapability, "tasks");

    const reaction = await fetch(`${app.baseUrl}/internal/agent-api/messages/${randomUUID()}/reactions`, {
      method: "POST",
      headers: jsonHeaders(fixture.readOnlyApiKey),
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(reaction.status, 403);
    assert.equal((await reaction.json() as { requiredCapability?: string }).requiredCapability, "reactions");
  } finally {
    await app.close();
  }
});

test("agent-api reactions cloak private message existence before system-message checks", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const privateChannel = await createChannel(
      fixture.serverId,
      `agent-api-private-reactions-${randomUUID()}`,
      "private reaction probe target",
      "private",
    );
    await addHuman(privateChannel.id, fixture.ownerId);

    const privateChatMessage = await createMessage(
      privateChannel.id,
      "user",
      fixture.ownerId,
      "private chat reaction probe",
    );
    const privateSystemMessage = await createMessage(
      privateChannel.id,
      "user",
      "system",
      "private system reaction probe",
      "system",
    );

    const addChat = await fetch(`${app.baseUrl}/internal/agent-api/messages/${privateChatMessage.id}/reactions`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(addChat.status, 404, `expected private chat add 404, got ${addChat.status}`);

    const removeChat = await fetch(`${app.baseUrl}/internal/agent-api/messages/${privateChatMessage.id}/reactions`, {
      method: "DELETE",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(removeChat.status, 404, `expected private chat remove 404, got ${removeChat.status}`);

    const addSystem = await fetch(`${app.baseUrl}/internal/agent-api/messages/${privateSystemMessage.id}/reactions`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(addSystem.status, 404, `expected private system add 404, got ${addSystem.status}`);

    const removeSystem = await fetch(`${app.baseUrl}/internal/agent-api/messages/${privateSystemMessage.id}/reactions`, {
      method: "DELETE",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👍" }),
    });
    assert.equal(removeSystem.status, 404, `expected private system remove 404, got ${removeSystem.status}`);
  } finally {
    await app.close();
  }
});

test("agent-api reactions add idempotently and remove for the bound runner agent", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();
    const message = await createMessage(
      fixture.channelId,
      "user",
      fixture.ownerId,
      "agent-api reaction target",
    );

    const add = async () => fetch(`${app.baseUrl}/internal/agent-api/messages/${message.id}/reactions`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👀" }),
    });

    const first = await add();
    assert.equal(first.status, 200);
    const firstBody = await first.json() as {
      reactions: Array<{ emoji: string; count: number; reactorIds: string[]; reactorNames: string[] }>;
    };
    assert.deepEqual(firstBody.reactions, [{
      emoji: "👀",
      count: 1,
      reactorIds: [fixture.agentId],
      reactorNames: ["AgentApiAuthBot"],
    }]);

    const second = await add();
    assert.equal(second.status, 200);
    const secondBody = await second.json() as { reactions: Array<{ emoji: string; count: number }> };
    assert.equal(secondBody.reactions.find((reaction) => reaction.emoji === "👀")?.count, 1);

    const persisted = await getDb()
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, message.id));
    assert.equal(persisted.length, 1);
    assert.equal(persisted[0]?.reactorType, "agent");
    assert.equal(persisted[0]?.reactorId, fixture.agentId);

    const remove = await fetch(`${app.baseUrl}/internal/agent-api/messages/${message.id}/reactions`, {
      method: "DELETE",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(remove.status, 200);
    const removeBody = await remove.json() as { reactions: Array<{ emoji: string }> };
    assert.deepEqual(removeBody.reactions, []);
  } finally {
    await app.close();
  }
});

test("agent-api reactions work on thread replies", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();
    const parent = await createMessage(
      fixture.channelId,
      "user",
      fixture.ownerId,
      "agent-api reaction thread parent",
    );
    const thread = await getOrCreateThread(parent.id, fixture.ownerId, "user");
    const reply = await createMessage(
      thread.id,
      "user",
      fixture.ownerId,
      "agent-api reaction thread reply",
    );

    const add = await fetch(`${app.baseUrl}/internal/agent-api/messages/${reply.id.slice(0, 8)}/reactions`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(add.status, 200);
    const addBody = await add.json() as {
      reactions: Array<{ emoji: string; count: number; reactorIds: string[] }>;
    };
    assert.deepEqual(addBody.reactions, [{
      emoji: "👀",
      count: 1,
      reactorIds: [fixture.agentId],
      reactorNames: ["AgentApiAuthBot"],
    }]);

    const remove = await fetch(`${app.baseUrl}/internal/agent-api/messages/${reply.id.slice(0, 8)}/reactions`, {
      method: "DELETE",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(remove.status, 200);
    const removeBody = await remove.json() as { reactions: Array<{ emoji: string }> };
    assert.deepEqual(removeBody.reactions, []);
  } finally {
    await app.close();
  }
});

test("agent-api reactions reject malformed message ids without a server error", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const res = await fetch(`${app.baseUrl}/internal/agent-api/messages/not-a-message-id/reactions`, {
      method: "POST",
      headers: jsonHeaders(fixture.agentApiKey),
      body: JSON.stringify({ emoji: "👀" }),
    });
    assert.equal(res.status, 400);
    const body = await res.json() as { error?: string };
    assert.equal(body.error, "Message id must be a full UUID or 8-character short id");
  } finally {
    await app.close();
  }
});

test("agent-api denies capabilities absent from the active runner session", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedAuthFixture();

    const res = await fetch(`${app.baseUrl}/internal/agent-api/tasks/claim`, {
      method: "POST",
      headers: {
        ...jsonHeaders(fixture.agentApiKey),
        "X-Slock-Agent-Active-Capabilities": "read,server",
      },
      body: JSON.stringify({ channel: `#${fixture.channelName}`, task_numbers: [1] }),
    });
    assert.equal(res.status, 501);
    const body = await res.json() as { code?: string; requiredCapability?: string };
    assert.equal(body.code, "unsupported_capability");
    assert.equal(body.requiredCapability, "tasks");
  } finally {
    await app.close();
  }
});
