import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";

import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { servers, users, serverMembers } from "../db/schema.js";
import { signAccessToken } from "../middleware/auth.js";
import { createChannel, addHuman, findOrCreateUserDM } from "../services/channelService.js";

/**
 * Contract test for `GET /api/channels/:id` `joined` field.
 *
 * Provenance:
 *   #engineering:e4f52605 — @xxchan reported a staging-only regression where
 *   refreshing the page briefly shows a `Join channel` CTA on already-joined
 *   channels. Root cause (@哭哭 + @Leiysky audits): `ChannelRoute`'s
 *   first-paint hydration via `GET /api/channels/:id` (added by PR #1549) was
 *   missing the `joined` field that `/channels` list emits; web treated
 *   `joined === undefined` as not-joined → wrong CTA.
 *
 * This test pins:
 *   1. Member on a regular channel → `joined: true`
 *   2. Member on a private channel → `joined: true`
 *   3. Same server, non-member on a regular channel → `joined: false`
 *      (channel is still visible because regular channels are server-wide)
 *   4. DM recipient → `joined: true` (DM membership is implicit)
 */

async function seed() {
  const db = getDb();
  const [owner] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      email: `owner-${randomUUID()}@example.com`,
      name: "owner",
      passwordHash: "hash",
      emailVerified: true,
    })
    .returning();
  const [other] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      email: `other-${randomUUID()}@example.com`,
      name: "other",
      passwordHash: "hash",
      emailVerified: true,
    })
    .returning();
  const [server] = await db
    .insert(servers)
    .values({
      id: randomUUID(),
      name: "join-test",
      slug: `join-${randomUUID()}`,
      ownerId: owner.id,
    })
    .returning();
  // Both users are server members (so regular channels are visible to both)
  await db.insert(serverMembers).values({ serverId: server.id, userId: owner.id, role: "owner" });
  await db.insert(serverMembers).values({ serverId: server.id, userId: other.id, role: "member" });
  return { owner, other, server };
}

async function fetchChannel(baseUrl: string, channelId: string, userId: string, serverId: string) {
  const res = await fetch(`${baseUrl}/api/channels/${channelId}`, {
    headers: {
      Authorization: `Bearer ${signAccessToken(userId)}`,
      "X-Server-Id": serverId,
    },
  });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

test("GET /channels/:id returns joined:true for a regular-channel member", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, server } = await seed();
    const channel = await createChannel(server.id, "general", undefined, "channel");
    await addHuman(channel.id, owner.id);
    const { status, body } = await fetchChannel(app.baseUrl, channel.id, owner.id, server.id);
    assert.equal(status, 200);
    assert.equal(body.joined, true);
    assert.equal(body.id, channel.id);
  } finally {
    await app.close();
  }
});

test("GET /channels/:id returns joined:true for a private-channel member", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, server } = await seed();
    const channel = await createChannel(server.id, "secret", undefined, "private");
    await addHuman(channel.id, owner.id);
    const { status, body } = await fetchChannel(app.baseUrl, channel.id, owner.id, server.id);
    assert.equal(status, 200);
    assert.equal(body.joined, true);
  } finally {
    await app.close();
  }
});

test("GET /channels/:id returns joined:false for a non-member on a regular channel", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, other, server } = await seed();
    const channel = await createChannel(server.id, "shared", undefined, "channel");
    await addHuman(channel.id, owner.id);
    // `other` is server-member but NOT joined to this channel.
    const { status, body } = await fetchChannel(app.baseUrl, channel.id, other.id, server.id);
    assert.equal(status, 200);
    assert.equal(body.joined, false, "non-member must NOT be treated as joined; was the regression source");
  } finally {
    await app.close();
  }
});

test("GET /channels/:id returns joined:true for the recipient of a DM", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, other, server } = await seed();
    const dm = await findOrCreateUserDM(server.id, owner.id, other.id);
    assert.ok(dm, "DM creation should succeed for two server members");
    const { status, body } = await fetchChannel(app.baseUrl, dm.id, owner.id, server.id);
    assert.equal(status, 200);
    assert.equal(body.joined, true, "DM membership is implicit by participation");
    assert.equal(body.type, "dm");
  } finally {
    await app.close();
  }
});

test("GET /channels/:id computes joined per-requester (owner true, other true after addHuman)", async () => {
  // Sanity: the same channel returns different `joined` per requester. Pins
  // that the response is computed per-request, not memoized to a single user.
  const app = await startTestApp("pglite://");
  try {
    const { owner, other, server } = await seed();
    const channel = await createChannel(server.id, "shared-after-add", undefined, "channel");
    await addHuman(channel.id, owner.id);
    await addHuman(channel.id, other.id);
    const ownerView = await fetchChannel(app.baseUrl, channel.id, owner.id, server.id);
    const otherView = await fetchChannel(app.baseUrl, channel.id, other.id, server.id);
    assert.equal(ownerView.body.joined, true);
    assert.equal(otherView.body.joined, true);
  } finally {
    await app.close();
  }
});
