import assert from "node:assert/strict";
import test from "node:test";
import { and, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { channelAgents, channelHumans, channels, users } from "../db/schema.js";
import { createAgent } from "./agentService.js";
import {
  findOrCreateAgentDM,
  findOrCreateDM,
  findOrCreateUserDM,
} from "./channelService.js";
import { createServer } from "./serverService.js";

test("findOrCreateDM creates one human-agent DM under concurrent calls", async () => {
  await initDatabase("pglite://");
  try {
    const owner = await seedUser("dm-agent-owner@slock.test", "dm-agent-owner");
    const server = await createServer("DM Agent Lock", "dm-agent-lock", owner.id);
    const agent = await createAgent(server.id, "dm-agent-peer", { runtime: "codex" });

    const dms = await Promise.all(
      Array.from({ length: 12 }, () => findOrCreateDM(server.id, owner.id, agent.id)),
    );

    const ids = dms.map((dm) => dm?.id);
    assert.equal(new Set(ids).size, 1);
    assert.equal(await countHumanAgentDms(server.id, owner.id, agent.id), 1);
  } finally {
    await closeDatabase();
  }
});

test("findOrCreateUserDM creates one user-user DM under concurrent reversed calls", async () => {
  await initDatabase("pglite://");
  try {
    const owner = await seedUser("dm-user-owner@slock.test", "dm-user-owner");
    const peer = await seedUser("dm-user-peer@slock.test", "dm-user-peer");
    const server = await createServer("DM User Lock", "dm-user-lock", owner.id);

    const dms = await Promise.all(
      Array.from({ length: 12 }, (_, index) => (
        index % 2 === 0
          ? findOrCreateUserDM(server.id, owner.id, peer.id)
          : findOrCreateUserDM(server.id, peer.id, owner.id)
      )),
    );

    const ids = dms.map((dm) => dm?.id);
    assert.equal(new Set(ids).size, 1);
    assert.equal(await countUserDms(server.id, owner.id, peer.id), 1);
  } finally {
    await closeDatabase();
  }
});

test("findOrCreateAgentDM creates one agent-agent DM under concurrent reversed calls", async () => {
  await initDatabase("pglite://");
  try {
    const owner = await seedUser("dm-aa-owner@slock.test", "dm-aa-owner");
    const server = await createServer("DM Agent Agent Lock", "dm-aa-lock", owner.id);
    const agentA = await createAgent(server.id, "dm-aa-a", { runtime: "codex" });
    const agentB = await createAgent(server.id, "dm-aa-b", { runtime: "codex" });

    const dms = await Promise.all(
      Array.from({ length: 12 }, (_, index) => (
        index % 2 === 0
          ? findOrCreateAgentDM(server.id, agentA.id, agentB.id)
          : findOrCreateAgentDM(server.id, agentB.id, agentA.id)
      )),
    );

    const ids = dms.map((dm) => dm?.id);
    assert.equal(new Set(ids).size, 1);
    assert.equal(await countAgentDms(server.id, agentA.id, agentB.id), 1);
  } finally {
    await closeDatabase();
  }
});

async function seedUser(email: string, name: string) {
  const [user] = await getDb().insert(users).values({
    email,
    name,
    displayName: name,
    passwordHash: "test-password-hash",
    emailVerified: true,
  }).returning();
  return user;
}

async function countHumanAgentDms(serverId: string, userId: string, agentId: string): Promise<number> {
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(channels)
    .innerJoin(channelHumans, and(eq(channels.id, channelHumans.channelId), eq(channelHumans.userId, userId)))
    .innerJoin(channelAgents, and(eq(channels.id, channelAgents.channelId), eq(channelAgents.agentId, agentId)))
    .where(and(
      eq(channels.serverId, serverId),
      eq(channels.type, "dm"),
      isNull(channels.deletedAt),
    ));
  return row?.count ?? 0;
}

async function countUserDms(serverId: string, userId1: string, userId2: string): Promise<number> {
  const ch2 = alias(channelHumans, "ch2");
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(channels)
    .innerJoin(channelHumans, and(eq(channels.id, channelHumans.channelId), eq(channelHumans.userId, userId1)))
    .innerJoin(ch2, and(eq(channels.id, ch2.channelId), eq(ch2.userId, userId2)))
    .leftJoin(channelAgents, eq(channels.id, channelAgents.channelId))
    .where(and(
      eq(channels.serverId, serverId),
      eq(channels.type, "dm"),
      isNull(channels.deletedAt),
      isNull(channelAgents.agentId),
    ));
  return row?.count ?? 0;
}

async function countAgentDms(serverId: string, agentId1: string, agentId2: string): Promise<number> {
  const ca2 = alias(channelAgents, "ca2");
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(channels)
    .innerJoin(channelAgents, and(eq(channels.id, channelAgents.channelId), eq(channelAgents.agentId, agentId1)))
    .innerJoin(ca2, and(eq(channels.id, ca2.channelId), eq(ca2.agentId, agentId2)))
    .leftJoin(channelHumans, eq(channels.id, channelHumans.channelId))
    .where(and(
      eq(channels.serverId, serverId),
      eq(channels.type, "dm"),
      isNull(channels.deletedAt),
      isNull(channelHumans.userId),
    ));
  return row?.count ?? 0;
}
