import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { channelAgents, users } from "../db/schema.js";
import { createServer } from "./serverService.js";
import { createAgent, deleteAgent, getAgent, updateAgentStatus, updateAgentStatusFromSignal } from "./agentService.js";
import { addAgent, createChannel, findOrCreateAgentDM } from "./channelService.js";

async function seedAgent(name: string) {
  const db = getDb();
  const [owner] = await db.insert(users).values({
    email: `${name}@slock.test`,
    name,
    displayName: "Owner",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();

  const server = await createServer(`${name} server`, `${name}-server`, owner.id);
  const agent = await createAgent(server.id, `${name}-agent`, { runtime: "codex" });
  return agent;
}

test("updateAgentStatus keeps manually stopped status sticky against inactive updates", async () => {
  const app = await startTestApp("pglite://");
  try {
    const agent = await seedAgent("status-sticky");

    await updateAgentStatus(agent.id, "stopped");
    await updateAgentStatus(agent.id, "inactive");

    const updated = await getAgent(agent.id);
    assert.equal(updated?.status, "stopped");
  } finally {
    await app.close();
  }
});

test("updateAgentStatus still allows active updates after a stopped state", async () => {
  const app = await startTestApp("pglite://");
  try {
    const agent = await seedAgent("status-active-after-stop");

    await updateAgentStatus(agent.id, "stopped");
    await updateAgentStatus(agent.id, "active");

    const updated = await getAgent(agent.id);
    assert.equal(updated?.status, "active");
  } finally {
    await app.close();
  }
});

test("updateAgentStatusFromSignal keeps stopped sticky against active signals", async () => {
  const app = await startTestApp("pglite://");
  try {
    const agent = await seedAgent("status-signal-active");

    await updateAgentStatus(agent.id, "stopped");
    await updateAgentStatusFromSignal(agent.id, "active", "session-late");

    const updated = await getAgent(agent.id);
    assert.equal(updated?.status, "stopped");
    // sessionId must not leak through either — late session bound to stopped is stale.
    assert.equal(updated?.sessionId, null);
  } finally {
    await app.close();
  }
});

test("updateAgentStatusFromSignal keeps stopped sticky against inactive signals", async () => {
  const app = await startTestApp("pglite://");
  try {
    const agent = await seedAgent("status-signal-inactive");

    await updateAgentStatus(agent.id, "stopped");
    await updateAgentStatusFromSignal(agent.id, "inactive");

    const updated = await getAgent(agent.id);
    assert.equal(updated?.status, "stopped");
  } finally {
    await app.close();
  }
});

test("updateAgentStatusFromSignal still applies when the agent is not stopped", async () => {
  const app = await startTestApp("pglite://");
  try {
    const agent = await seedAgent("status-signal-applies");

    await updateAgentStatusFromSignal(agent.id, "active", "session-fresh");
    const afterActive = await getAgent(agent.id);
    assert.equal(afterActive?.status, "active");
    assert.equal(afterActive?.sessionId, "session-fresh");

    await updateAgentStatusFromSignal(agent.id, "inactive");
    const afterInactive = await getAgent(agent.id);
    assert.equal(afterInactive?.status, "inactive");
  } finally {
    await app.close();
  }
});

test("deleteAgent removes channel membership rows for the soft-deleted agent", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const [owner] = await db.insert(users).values({
      email: "delete-membership-owner@slock.test",
      name: "delete-membership-owner",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    }).returning();

    const server = await createServer("Delete Membership", "delete-membership", owner.id);
    const agentA = await createAgent(server.id, "delete-membership-a", { runtime: "codex" });
    const agentB = await createAgent(server.id, "delete-membership-b", { runtime: "codex" });
    const channel = await createChannel(server.id, "delete-membership-channel");
    await addAgent(channel.id, agentA.id);
    const dm = await findOrCreateAgentDM(server.id, agentA.id, agentB.id);
    assert.ok(dm, "expected an agent-to-agent DM");

    const beforeDelete = await db
      .select({ channelId: channelAgents.channelId })
      .from(channelAgents)
      .where(eq(channelAgents.agentId, agentA.id));
    assert.ok(beforeDelete.length >= 3, "agent should be in #all, the channel, and its DM before deletion");

    await deleteAgent(agentA.id);

    const afterDelete = await db
      .select({ channelId: channelAgents.channelId })
      .from(channelAgents)
      .where(eq(channelAgents.agentId, agentA.id));
    assert.deepEqual(afterDelete, []);
  } finally {
    await app.close();
  }
});
