import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test, { afterEach } from "node:test";
import { and, eq } from "drizzle-orm";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { serverInvites, serverMembers, servers, users } from "../db/schema.js";
import { acceptInvite, createInvite } from "./inviteService.js";

afterEach(async () => {
  await closeDatabase();
});

test("createInvite canonicalizes email and dedupes case-insensitively", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [owner] = await db.insert(users).values({
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    email: "owner@example.com",
    name: "owner",
    displayName: "owner",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  const [server] = await db.insert(servers).values({
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "Acme",
    slug: "acme-email-case",
    ownerId: owner.id,
  }).returning();

  const created = await createInvite(server.id, "Invitee@Example.COM", owner.id);
  assert.equal(created.invitedEmail, "invitee@example.com");

  const [stored] = await db
    .select({ invitedEmail: serverInvites.invitedEmail })
    .from(serverInvites);
  assert.equal(stored?.invitedEmail, "invitee@example.com");

  await assert.rejects(
    createInvite(server.id, "INVITEE@example.com", owner.id),
    /already been sent/i,
  );
});

test("createInvite rejects malformed email addresses before storing an invite", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [owner] = await db.insert(users).values({
    id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    email: "owner-invalid-invite@example.com",
    name: "ownerinvalidinvite",
    displayName: "ownerinvalidinvite",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  const [server] = await db.insert(servers).values({
    id: "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
    name: "Acme Invalid Invite",
    slug: "acme-invalid-invite",
    ownerId: owner.id,
  }).returning();

  await assert.rejects(
    createInvite(server.id, "not-an-email", owner.id),
    /valid email address/i,
  );

  const rows = await db.select({ id: serverInvites.id }).from(serverInvites);
  assert.deepEqual(rows, []);
});

test("createInvite detects existing member after input normalization", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [owner] = await db.insert(users).values({
    id: "f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4",
    email: "owner-member-check@example.com",
    name: "ownermembercheck",
    displayName: "ownermembercheck",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  const [member] = await db.insert(users).values({
    id: "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5",
    email: "existingmember@example.com",
    name: "existingmember",
    displayName: "existingmember",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  const [server] = await db.insert(servers).values({
    id: "f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6",
    name: "Acme Existing Member",
    slug: "acme-existing-member",
    ownerId: owner.id,
  }).returning();

  await db.insert(serverMembers).values([
    { serverId: server.id, userId: owner.id, role: "owner" },
    { serverId: server.id, userId: member.id, role: "member" },
  ]);

  await assert.rejects(
    createInvite(server.id, "ExistingMember@Example.COM", owner.id),
    /already a member/i,
  );
});

test("acceptInvite compares invite email case-insensitively for legacy mixed-case rows", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [owner] = await db.insert(users).values({
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    email: "owner2@example.com",
    name: "owner2",
    displayName: "owner2",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  const [invitee] = await db.insert(users).values({
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    email: "invitee@example.com",
    name: "invitee",
    displayName: "invitee",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  const [server] = await db.insert(servers).values({
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    name: "Acme Legacy",
    slug: "acme-legacy-invite",
    ownerId: owner.id,
  }).returning();

  const token = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [invite] = await db.insert(serverInvites).values({
    serverId: server.id,
    invitedByUserId: owner.id,
    invitedEmail: "Invitee@Example.COM",
    tokenHash,
    status: "pending",
    expiresAt,
  }).returning();

  const result = await acceptInvite(token, invitee.id);
  assert.equal(result.serverId, server.id);
  assert.equal(result.serverName, server.name);

  const [memberRow] = await db
    .select()
    .from(serverMembers)
    .where(and(eq(serverMembers.serverId, server.id), eq(serverMembers.userId, invitee.id)));
  assert.ok(memberRow);

  const [updatedInvite] = await db
    .select({ status: serverInvites.status })
    .from(serverInvites)
    .where(eq(serverInvites.id, invite.id));
  assert.equal(updatedInvite?.status, "accepted");
});
