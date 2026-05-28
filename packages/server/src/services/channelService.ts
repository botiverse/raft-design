import { createHash, randomUUID } from "crypto";
import { eq, and, isNull, isNotNull, sql, inArray, asc, desc, max, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, getPool, type DatabaseExecutor } from "../db/index.js";
import { getRisingWavePool, RISINGWAVE_UNREAD_INBOX_CONTRACT_VERSION } from "../db/risingwave.js";
import { channels, channelAgents, channelHumans, agents, users, serverMembers, messages, userChannelReadCursors, userChannelInboxStates, agentChannelReadCursors, servers, threadFollows, tasks, jointChannels, jointChannelServers, jointChannelInvites } from "../db/schema.js";
import { gt } from "drizzle-orm";
import { withServerLock, withServerResourceLock } from "./planService.js";
import { PLAN_CONFIG, getEffectiveLimits, type ServerPlan, type TraceAttributes } from "@slock-ai/shared";
import { untracedDbQuery, type DbQueryTracer } from "../tracing/dbQueryTrace.js";
import { addTraceEvent } from "../tracing/semanticTrace.js";
import { sendJointChannelInviteEmail } from "./emailService.js";
import { normalizeEmail } from "./emailNormalization.js";

interface ChannelServiceOptions {
  executor?: DatabaseExecutor;
}

export type RegularChannelType = "channel" | "private";
export type ListableChannelType = RegularChannelType | "joint";
export type ChannelRefType = ListableChannelType | "dm" | "thread";

export type JointChannelMetadata = {
  jointChannelId?: string | null;
  jointRole?: "host" | "participant" | null;
  jointPeerServerId?: string | null;
  jointPeerServerName?: string | null;
  jointPeerServerSlug?: string | null;
  jointPeerStatus?: "pending" | "active" | null;
};

export type JointChannelProjection = {
  jointChannelId: string;
  localChannelId: string;
  canonicalChannelId: string;
  serverId: string;
  role: "host" | "participant";
  channel: typeof channels.$inferSelect;
};

export type JointThreadProjection = {
  jointThreadId: string;
  localThreadChannelId: string;
  canonicalThreadChannelId: string;
  localServerId: string;
  localParentChannelId: string;
  canonicalParentChannelId: string;
  canonicalParentMessageId: string;
  role: "host" | "participant";
  threadChannel: typeof channels.$inferSelect;
};

const REGULAR_CHANNEL_TYPES: RegularChannelType[] = ["channel", "private"];
const LISTABLE_CHANNEL_TYPES: ListableChannelType[] = ["channel", "private", "joint"];
const DM_LOCK_NAMESPACE = 5;
export const JOINT_CHANNEL_CREATOR_SERVER_SLUG = "botiverse";

function requiresExplicitMembership(type: string): boolean {
  return type === "private" || type === "joint";
}

export async function createChannel(
  serverId: string,
  name: string,
  description?: string,
  type: ListableChannelType = "channel",
) {
  // Atomic quota check + insert under advisory lock (namespace 3 = channels)
  return withServerLock(serverId, 3, (tx) => createChannelWithExecutor(tx, serverId, name, description, type));
}

async function createChannelWithExecutor(
  executor: DatabaseExecutor,
  serverId: string,
  name: string,
  description: string | undefined,
  type: ListableChannelType,
) {
  // Check plan quota. Joint projections are intentionally not counted against
  // ordinary public/private channel quota; they are invite-mediated shared
  // surfaces, not local channels a workspace can freely create.
  const [serverRow] = await executor.select({ plan: servers.plan }).from(servers).where(eq(servers.id, serverId));
  const plan = (serverRow?.plan as ServerPlan) || "free";
  const limits = getEffectiveLimits(plan);
  if (type !== "joint" && limits.maxChannels !== -1) {
    const [countRow] = await executor
      .select({ count: sql<number>`count(*)::int` })
      .from(channels)
      .where(and(eq(channels.serverId, serverId), inArray(channels.type, REGULAR_CHANNEL_TYPES), isNull(channels.deletedAt)));
    const count = countRow?.count ?? 0;
    if (count >= limits.maxChannels) {
      throw new Error(`Channel limit reached (${count}/${limits.maxChannels} on ${PLAN_CONFIG[plan].displayName} plan). Upgrade for more.`);
    }
  }

  const [existing] = await executor
    .select({ id: channels.id, archivedAt: channels.archivedAt })
    .from(channels)
    .where(and(
      eq(channels.serverId, serverId),
      inArray(channels.type, LISTABLE_CHANNEL_TYPES),
      eq(channels.name, name),
      isNull(channels.deletedAt)
    ));
  if (existing) {
    if (existing.archivedAt) {
      throw new ArchivedNameCollisionError(name, existing.id);
    }
    throw new Error(`Channel name "${name}" is already taken`);
  }

  const [channel] = await executor.insert(channels).values({
    serverId,
    name,
    description,
    type,
  }).returning();
  return channel;
}

const JOINT_CHANNEL_INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export interface CreateJointChannelInput {
  hostServerId: string;
  createdByUserId: string;
  name: string;
  description?: string;
  userIds?: string[];
  agentIds?: string[];
  targetServerSlug: string;
  invitedPeople: string[];
}

type JointInvitee = {
  userId: string;
  email: string;
  name: string;
  displayName: string | null;
  role: "owner" | "admin";
};

export async function createJointChannel(input: CreateJointChannelInput) {
  const targetSlug = input.targetServerSlug.trim();
  if (!targetSlug) {
    throw new Error("Target server slug is required");
  }
  const invitedPeople = normalizeJointInvitePeople(input.invitedPeople);
  if (invitedPeople.length === 0) {
    throw new Error("At least one invited person is required");
  }
  const db = getDb();
  const [hostServer] = await db
    .select({ slug: servers.slug })
    .from(servers)
    .where(and(eq(servers.id, input.hostServerId), isNull(servers.deletedAt)));
  if (hostServer?.slug !== JOINT_CHANNEL_CREATOR_SERVER_SLUG) {
    throw new Error(`Joint Channel creation is currently limited to /${JOINT_CHANNEL_CREATOR_SERVER_SLUG}`);
  }

  const result = await withServerLock(input.hostServerId, 3, async (tx) => {
    const targetServer = await getJointInviteTargetServer(tx, targetSlug, input.hostServerId);
    const invitees = await resolveJointInvitees(tx, targetServer.id, invitedPeople);
    const storageChannel = await createChannelWithExecutor(
      tx,
      input.hostServerId,
      `joint-storage-${randomUUID()}`,
      undefined,
      "joint",
    );
    const channel = await createChannelWithExecutor(tx, input.hostServerId, input.name, input.description, "joint");
    await tx.insert(channelHumans)
      .values([
        { channelId: channel.id, userId: input.createdByUserId },
        ...(input.userIds ?? []).map((userId) => ({ channelId: channel.id, userId })),
      ])
      .onConflictDoNothing();
    if (input.agentIds?.length) {
      await tx.insert(channelAgents)
        .values(input.agentIds.map((agentId) => ({ channelId: channel.id, agentId })))
        .onConflictDoNothing();
    }

    const [joint] = await tx.insert(jointChannels).values({
      canonicalChannelId: storageChannel.id,
      createdByServerId: input.hostServerId,
      createdByUserId: input.createdByUserId,
    }).returning();
    await tx.insert(jointChannelServers).values({
      jointChannelId: joint.id,
      serverId: input.hostServerId,
      localChannelId: channel.id,
      role: "host",
      joinedByUserId: input.createdByUserId,
    });

    const invites = [];
    for (const invitee of invitees) {
      const invite = await createJointChannelInvite({
        jointChannelId: joint.id,
        fromServerId: input.hostServerId,
        targetServerId: targetServer.id,
        invitedUserId: invitee.userId,
        invitedByUserId: input.createdByUserId,
        executor: tx,
      });
      invites.push(invite);
    }

    return { channel, jointChannel: joint, invites };
  });

  await sendJointChannelInviteEmails(result.invites.map((invite) => invite.id));
  return result;
}

function normalizeJointInvitePeople(invitedPeople: string[] | undefined): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const raw of invitedPeople ?? []) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.startsWith("@") && !value.includes("@", 1)
      ? value.slice(1).toLowerCase()
      : value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(value);
  }
  return normalized;
}

async function getJointInviteTargetServer(executor: DatabaseExecutor, targetServerSlug: string, fromServerId: string) {
  const [targetServer] = await executor
    .select({ id: servers.id, slug: servers.slug, deletedAt: servers.deletedAt })
    .from(servers)
    .where(eq(servers.slug, targetServerSlug));
  if (!targetServer || targetServer.deletedAt) {
    throw new Error("Target server not found");
  }
  if (targetServer.id === fromServerId) {
    throw new Error("Cannot invite the current server");
  }
  return targetServer;
}

async function resolveJointInvitees(executor: DatabaseExecutor, targetServerId: string, invitedPeople: string[]): Promise<JointInvitee[]> {
  const invitees: JointInvitee[] = [];
  const seenUserIds = new Set<string>();
  for (const invitedPerson of invitedPeople) {
    const token = invitedPerson.trim();
    const isEmail = token.includes("@") && !token.startsWith("@");
    const lookup = isEmail ? normalizeEmail(token) : token.replace(/^@/, "");
    if (!lookup) continue;
    const [invitee] = await executor
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        displayName: users.displayName,
        role: serverMembers.role,
      })
      .from(serverMembers)
      .innerJoin(users, eq(users.id, serverMembers.userId))
      .where(and(
        eq(serverMembers.serverId, targetServerId),
        isEmail ? eq(users.email, lookup) : eq(users.name, lookup),
      ));
    if (!invitee) {
      throw new Error(`Invited person not found in target server: ${invitedPerson}`);
    }
    if (invitee.role !== "owner" && invitee.role !== "admin") {
      throw new Error(`invited person must be a target server admin: ${invitedPerson}`);
    }
    if (seenUserIds.has(invitee.userId)) continue;
    seenUserIds.add(invitee.userId);
    invitees.push({ ...invitee, role: invitee.role });
  }
  if (invitees.length === 0) {
    throw new Error("At least one invited person is required");
  }
  return invitees;
}

async function sendJointChannelInviteEmails(inviteIds: string[]) {
  if (inviteIds.length === 0) return;
  const db = getDb();
  const fromServer = alias(servers, "joint_email_from_server");
  const toServer = alias(servers, "joint_email_to_server");
  const fromProjection = alias(jointChannelServers, "joint_email_from_projection");
  const displayChannel = alias(channels, "joint_email_display_channel");
  const inviter = alias(users, "joint_email_inviter");
  const invitees = await db
    .select({
      inviteId: jointChannelInvites.id,
      fromServerName: fromServer.name,
      toServerName: toServer.name,
      toServerSlug: toServer.slug,
      channelName: displayChannel.name,
      inviterName: inviter.displayName,
      inviterHandle: inviter.name,
      recipientEmail: users.email,
      recipientName: users.displayName,
      recipientHandle: users.name,
    })
    .from(jointChannelInvites)
    .innerJoin(jointChannels, eq(jointChannels.id, jointChannelInvites.jointChannelId))
    .innerJoin(fromServer, eq(fromServer.id, jointChannelInvites.fromServerId))
    .innerJoin(toServer, eq(toServer.id, jointChannelInvites.toServerId))
    .innerJoin(fromProjection, and(
      eq(fromProjection.jointChannelId, jointChannelInvites.jointChannelId),
      eq(fromProjection.serverId, jointChannelInvites.fromServerId),
      eq(fromProjection.status, "active"),
    ))
    .innerJoin(displayChannel, eq(displayChannel.id, fromProjection.localChannelId))
    .innerJoin(inviter, eq(inviter.id, jointChannelInvites.invitedByUserId))
    .innerJoin(users, eq(users.id, jointChannelInvites.invitedUserId))
    .where(inArray(jointChannelInvites.id, inviteIds));

  await Promise.all(invitees.map((invitee) => sendJointChannelInviteEmail(invitee.recipientEmail, {
    recipientName: invitee.recipientName || invitee.recipientHandle,
    inviterName: invitee.inviterName || invitee.inviterHandle,
    fromServerName: invitee.fromServerName,
    toServerName: invitee.toServerName,
    toServerSlug: invitee.toServerSlug,
    channelName: invitee.channelName,
    inviteId: invitee.inviteId,
  })));
}

export async function createJointChannelInvite(input: {
  jointChannelId: string;
  fromServerId: string;
  targetServerId: string;
  invitedUserId: string;
  invitedByUserId: string;
  executor?: DatabaseExecutor;
}) {
  const db = input.executor ?? getDb();
  const [existing] = await db
    .select()
    .from(jointChannelServers)
    .where(and(
      eq(jointChannelServers.jointChannelId, input.jointChannelId),
      eq(jointChannelServers.serverId, input.targetServerId),
      eq(jointChannelServers.status, "active"),
    ));
  if (existing) {
    throw new Error("Target server is already in this joint channel");
  }
  const activeProjectionCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jointChannelServers)
    .where(and(
      eq(jointChannelServers.jointChannelId, input.jointChannelId),
      eq(jointChannelServers.status, "active"),
    ));
  if ((activeProjectionCount[0]?.count ?? 0) >= 2) {
    throw new Error("Joint channels currently support exactly two servers");
  }

  const [invite] = await db.insert(jointChannelInvites).values({
    jointChannelId: input.jointChannelId,
    fromServerId: input.fromServerId,
    toServerId: input.targetServerId,
    invitedUserId: input.invitedUserId,
    invitedByUserId: input.invitedByUserId,
    expiresAt: new Date(Date.now() + JOINT_CHANNEL_INVITE_TTL_MS),
  }).onConflictDoUpdate({
    target: [jointChannelInvites.jointChannelId, jointChannelInvites.toServerId, jointChannelInvites.invitedUserId],
    targetWhere: sql`status = 'pending'`,
    set: {
      invitedByUserId: input.invitedByUserId,
      expiresAt: new Date(Date.now() + JOINT_CHANNEL_INVITE_TTL_MS),
      createdAt: new Date(),
    },
  }).returning();
  return invite;
}

export async function listPendingJointChannelInvites(serverId: string, userId: string) {
  const db = getDb();
  const fromServer = alias(servers, "joint_invite_from_server");
  const fromProjection = alias(jointChannelServers, "joint_invite_from_projection");
  const displayChannel = alias(channels, "joint_invite_display_channel");
  const rows = await db
    .select({
      id: jointChannelInvites.id,
      jointChannelId: jointChannelInvites.jointChannelId,
      fromServerId: jointChannelInvites.fromServerId,
      fromServerName: fromServer.name,
      fromServerSlug: fromServer.slug,
      channelName: displayChannel.name,
      channelDescription: displayChannel.description,
      invitedByUserId: jointChannelInvites.invitedByUserId,
      invitedUserId: jointChannelInvites.invitedUserId,
      expiresAt: jointChannelInvites.expiresAt,
      createdAt: jointChannelInvites.createdAt,
    })
    .from(jointChannelInvites)
    .innerJoin(jointChannels, eq(jointChannels.id, jointChannelInvites.jointChannelId))
    .innerJoin(fromServer, eq(fromServer.id, jointChannelInvites.fromServerId))
    .innerJoin(fromProjection, and(
      eq(fromProjection.jointChannelId, jointChannelInvites.jointChannelId),
      eq(fromProjection.serverId, jointChannelInvites.fromServerId),
      eq(fromProjection.status, "active"),
    ))
    .innerJoin(displayChannel, eq(displayChannel.id, fromProjection.localChannelId))
    .where(and(
      eq(jointChannelInvites.toServerId, serverId),
      eq(jointChannelInvites.invitedUserId, userId),
      eq(jointChannelInvites.status, "pending"),
      eq(jointChannels.status, "active"),
      isNull(displayChannel.deletedAt),
    ))
    .orderBy(desc(jointChannelInvites.createdAt));
  const now = Date.now();
  return rows.filter((row) => row.expiresAt.getTime() > now);
}

export async function acceptJointChannelInvite(input: {
  inviteId: string;
  targetServerId: string;
  acceptedByUserId: string;
}) {
  return withServerLock(input.targetServerId, 3, async (tx) => {
    const fromProjection = alias(jointChannelServers, "joint_accept_from_projection");
    const displayChannel = alias(channels, "joint_accept_display_channel");
    const [invite] = await tx
      .select({
        id: jointChannelInvites.id,
        jointChannelId: jointChannelInvites.jointChannelId,
        fromServerId: jointChannelInvites.fromServerId,
        toServerId: jointChannelInvites.toServerId,
        invitedUserId: jointChannelInvites.invitedUserId,
        status: jointChannelInvites.status,
        expiresAt: jointChannelInvites.expiresAt,
        canonicalChannelId: jointChannels.canonicalChannelId,
        channelName: displayChannel.name,
        channelDescription: displayChannel.description,
      })
      .from(jointChannelInvites)
      .innerJoin(jointChannels, eq(jointChannels.id, jointChannelInvites.jointChannelId))
      .innerJoin(fromProjection, and(
        eq(fromProjection.jointChannelId, jointChannelInvites.jointChannelId),
        eq(fromProjection.serverId, jointChannelInvites.fromServerId),
        eq(fromProjection.status, "active"),
      ))
      .innerJoin(displayChannel, eq(displayChannel.id, fromProjection.localChannelId))
      .where(and(
        eq(jointChannelInvites.id, input.inviteId),
        eq(jointChannelInvites.toServerId, input.targetServerId),
        eq(jointChannelInvites.invitedUserId, input.acceptedByUserId),
        eq(jointChannelInvites.status, "pending"),
        eq(jointChannels.status, "active"),
        isNull(displayChannel.deletedAt),
      ));
    if (!invite) {
      throw new Error("Joint channel invite not found");
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      await tx.update(jointChannelInvites)
        .set({ status: "expired" })
        .where(eq(jointChannelInvites.id, input.inviteId));
      throw new Error("Joint channel invite expired");
    }
    const [acceptingMember] = await tx
      .select({ role: serverMembers.role })
      .from(serverMembers)
      .where(and(
        eq(serverMembers.serverId, input.targetServerId),
        eq(serverMembers.userId, input.acceptedByUserId),
      ));
    if (!acceptingMember || (acceptingMember.role !== "owner" && acceptingMember.role !== "admin")) {
      throw new Error("Only target server admins can accept joint channel invites");
    }

    const [existingProjection] = await tx
      .select({ localChannelId: jointChannelServers.localChannelId })
      .from(jointChannelServers)
      .where(and(
        eq(jointChannelServers.jointChannelId, invite.jointChannelId),
        eq(jointChannelServers.serverId, input.targetServerId),
        eq(jointChannelServers.status, "active"),
      ));
    if (existingProjection) {
      await tx.insert(channelHumans)
        .values({ channelId: existingProjection.localChannelId, userId: input.acceptedByUserId })
        .onConflictDoNothing();
      await tx.update(jointChannelInvites)
        .set({
          status: "accepted",
          acceptedByUserId: input.acceptedByUserId,
          acceptedAt: new Date(),
        })
        .where(eq(jointChannelInvites.id, input.inviteId));
      const [existingChannel] = await tx
        .select()
        .from(channels)
        .where(and(
          eq(channels.id, existingProjection.localChannelId),
          isNull(channels.deletedAt),
        ));
      if (!existingChannel) throw new Error("Joint channel projection not found");
      return existingChannel;
    }

    const activeProjectionCount = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(jointChannelServers)
      .where(and(
        eq(jointChannelServers.jointChannelId, invite.jointChannelId),
        eq(jointChannelServers.status, "active"),
      ));
    if ((activeProjectionCount[0]?.count ?? 0) >= 2) {
      throw new Error("Joint channels currently support exactly two servers");
    }

    const projection = await createChannelWithExecutor(
      tx,
      input.targetServerId,
      invite.channelName,
      invite.channelDescription ?? undefined,
      "joint",
    );
    await tx.insert(channelHumans)
      .values({ channelId: projection.id, userId: input.acceptedByUserId })
      .onConflictDoNothing();
    await tx.insert(jointChannelServers).values({
      jointChannelId: invite.jointChannelId,
      serverId: input.targetServerId,
      localChannelId: projection.id,
      role: "participant",
      joinedByUserId: input.acceptedByUserId,
    });
    await backfillJointThreadProjectionsForLocalParent(tx, {
      jointChannelId: invite.jointChannelId,
      canonicalParentChannelId: invite.canonicalChannelId,
      localParentProjection: {
        serverId: input.targetServerId,
        localChannelId: projection.id,
        role: "participant",
      },
      joinedByUserId: input.acceptedByUserId,
    });
    await tx.update(jointChannelInvites)
      .set({
        status: "accepted",
        acceptedByUserId: input.acceptedByUserId,
        acceptedAt: new Date(),
      })
      .where(eq(jointChannelInvites.id, input.inviteId));
    return projection;
  });
}

export type ArchivedFilter = "exclude" | "include" | "only";

interface ChannelListOptions {
  archived?: ArchivedFilter;
  traceQuery?: DbQueryTracer;
}

function dmPairKey(kind: "human-agent" | "user-user" | "agent-agent", participantIds: string[]): string {
  return `${kind}:${participantIds.slice().sort().join(":")}`;
}

interface UnreadCountOptions {
  traceQuery?: DbQueryTracer;
}

interface SidebarUnreadSummaryOptions {
  traceQuery?: DbQueryTracer;
}

type SidebarUnreadSummaryInput = {
  serverId: string;
  historyCutoff?: Date;
};

async function attachLastMessageAt<T extends { id: string }>(
  rows: T[],
  traceQuery: DbQueryTracer,
  queryName: string,
  countAttrName: string,
): Promise<Array<T & { lastMessageAt?: Date | null }>> {
  if (rows.length === 0) return [];

  const channelIds = rows.map((row) => row.id);
  const lastMessages = await traceQuery(
    queryName,
    () => getDb()
      .select({
        channelId: messages.channelId,
        lastMessageAt: max(messages.createdAt),
      })
      .from(messages)
      .where(inArray(messages.channelId, channelIds))
      .groupBy(messages.channelId),
    (latestRows) => ({
      [countAttrName]: channelIds.length,
      channels_with_messages_count: latestRows.length,
    }),
  );
  const lastMessageMap = new Map(lastMessages.map((row) => [row.channelId, row.lastMessageAt]));
  return rows.map((row) => ({
    ...row,
    lastMessageAt: lastMessageMap.get(row.id) ?? null,
  }));
}

export async function attachJointChannelMetadata<T extends { id: string; type: string; serverId: string }>(
  rows: T[],
): Promise<Array<T & JointChannelMetadata>> {
  const jointRows = rows.filter((row) => row.type === "joint");
  if (jointRows.length === 0) {
    return rows.map((row) => ({
      ...row,
      jointChannelId: null,
      jointRole: null,
      jointPeerServerId: null,
      jointPeerServerName: null,
      jointPeerServerSlug: null,
      jointPeerStatus: null,
    }));
  }

  const db = getDb();
  const localIds = jointRows.map((row) => row.id);
  const projections = await db
    .select({
      localChannelId: jointChannelServers.localChannelId,
      jointChannelId: jointChannelServers.jointChannelId,
      serverId: jointChannelServers.serverId,
      role: jointChannelServers.role,
    })
    .from(jointChannelServers)
    .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
    .where(and(
      inArray(jointChannelServers.localChannelId, localIds),
      eq(jointChannelServers.status, "active"),
      eq(jointChannels.status, "active"),
    ));
  const projectionByLocalId = new Map(projections.map((projection) => [projection.localChannelId, projection]));
  const jointIds = [...new Set(projections.map((projection) => projection.jointChannelId))];

  if (jointIds.length === 0) {
    return rows.map((row) => ({
      ...row,
      jointChannelId: null,
      jointRole: null,
      jointPeerServerId: null,
      jointPeerServerName: null,
      jointPeerServerSlug: null,
      jointPeerStatus: null,
    }));
  }

  const activeServers = await db
    .select({
      jointChannelId: jointChannelServers.jointChannelId,
      serverId: jointChannelServers.serverId,
      serverName: servers.name,
      serverSlug: servers.slug,
    })
    .from(jointChannelServers)
    .innerJoin(servers, eq(servers.id, jointChannelServers.serverId))
    .where(and(
      inArray(jointChannelServers.jointChannelId, jointIds),
      eq(jointChannelServers.status, "active"),
    ));

  const pendingInvites = await db
    .select({
      jointChannelId: jointChannelInvites.jointChannelId,
      fromServerId: jointChannelInvites.fromServerId,
      toServerId: jointChannelInvites.toServerId,
      serverName: servers.name,
      serverSlug: servers.slug,
    })
    .from(jointChannelInvites)
    .innerJoin(servers, eq(servers.id, jointChannelInvites.toServerId))
    .where(and(
      inArray(jointChannelInvites.jointChannelId, jointIds),
      eq(jointChannelInvites.status, "pending"),
    ));

  return rows.map((row) => {
    if (row.type !== "joint") {
      return {
        ...row,
        jointChannelId: null,
        jointRole: null,
        jointPeerServerId: null,
        jointPeerServerName: null,
        jointPeerServerSlug: null,
        jointPeerStatus: null,
      };
    }

    const projection = projectionByLocalId.get(row.id);
    const activePeer = projection
      ? activeServers.find((server) => server.jointChannelId === projection.jointChannelId && server.serverId !== row.serverId)
      : null;
    const pendingPeer = projection
      ? pendingInvites.find((invite) => invite.jointChannelId === projection.jointChannelId && invite.fromServerId === row.serverId)
      : null;

    return {
      ...row,
      jointChannelId: projection?.jointChannelId ?? null,
      jointRole: projection?.role ?? null,
      jointPeerServerId: activePeer?.serverId ?? pendingPeer?.toServerId ?? null,
      jointPeerServerName: activePeer?.serverName ?? pendingPeer?.serverName ?? null,
      jointPeerServerSlug: activePeer?.serverSlug ?? pendingPeer?.serverSlug ?? null,
      jointPeerStatus: activePeer ? "active" : pendingPeer ? "pending" : null,
    };
  });
}

interface FollowedThreadsOptions {
  traceQuery?: DbQueryTracer;
}

interface ThreadSummaryOptions {
  traceQuery?: DbQueryTracer;
  userId?: string;
}

export async function listChannels(
  serverId: string,
  userId?: string,
  opts?: ChannelListOptions,
) {
  const db = getDb();
  const archivedFilter = opts?.archived ?? "exclude";
  const traceQuery = opts?.traceQuery ?? untracedDbQuery;
  const conditions = [
    eq(channels.serverId, serverId),
    inArray(channels.type, LISTABLE_CHANNEL_TYPES),
    isNull(channels.deletedAt),
  ];
  if (archivedFilter === "exclude") conditions.push(isNull(channels.archivedAt));
  else if (archivedFilter === "only") conditions.push(isNotNull(channels.archivedAt));
  const list = await traceQuery(
    "channels.list_by_server",
    () => db.select().from(channels)
      .where(and(...conditions))
      .orderBy(asc(channels.createdAt)),
    (rows) => ({
      archived_filter: archivedFilter,
      channels_count: rows.length,
    }),
  );

  // Ensure #all channel exists for this server (lazy init for pre-existing servers).
  // Skip in "only" mode — the archived view should not create channels.
  if (archivedFilter === "only") {
    if (userId) {
      const memberships = await traceQuery(
        "channels.memberships_by_user",
        () => db
          .select({ channelId: channelHumans.channelId })
          .from(channelHumans)
          .where(eq(channelHumans.userId, userId)),
        (rows) => ({
          channels_count: list.length,
          memberships_count: rows.length,
        }),
      );
      const joinedSet = new Set(memberships.map((m) => m.channelId));
      const visibleChannels = list
        .filter((ch) => !requiresExplicitMembership(ch.type) || joinedSet.has(ch.id))
        .map((ch) => ({ ...ch, joined: joinedSet.has(ch.id) }));
      return attachJointChannelMetadata(
        await attachLastMessageAt(visibleChannels, traceQuery, "channels.last_messages_by_channels", "channels_count"),
      );
    }
    const visibleChannels = list.filter((ch) => ch.type === "channel");
    return attachJointChannelMetadata(
      await attachLastMessageAt(visibleChannels, traceQuery, "channels.last_messages_by_channels", "channels_count"),
    );
  }

  let allChannel = list.find((c) => c.name === "all");
  if (!allChannel) {
    const result = await db.insert(channels).values({
      serverId,
      name: "all",
      description: "General channel for all members",
      type: "channel",
    }).onConflictDoNothing().returning();

    if (result.length > 0) {
      allChannel = result[0];
    } else {
      // Another request created it concurrently — fetch it
      const [existing] = await db.select().from(channels).where(and(
        eq(channels.serverId, serverId),
        eq(channels.name, "all"),
        eq(channels.type, "channel"),
      ));
      allChannel = existing;
    }

    // Auto-add all existing agents in this server to #all
    const serverAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.serverId, serverId), isNull(agents.deletedAt)));
    if (serverAgents.length > 0) {
      await db.insert(channelAgents)
        .values(serverAgents.map((a) => ({ channelId: allChannel!.id, agentId: a.id })))
        .onConflictDoNothing();
    }

    list.push(allChannel);
  }

  // Lazy backfill: ensure #all has all server humans
  await ensureAllChannelHumans(serverId, allChannel.id, traceQuery);

  // If userId provided, compute joined status for each channel
  if (userId) {
    const memberships = await traceQuery(
      "channels.memberships_by_user",
      () => db
        .select({ channelId: channelHumans.channelId })
        .from(channelHumans)
        .where(eq(channelHumans.userId, userId)),
      (rows) => ({
        channels_count: list.length,
        memberships_count: rows.length,
      }),
    );
    const joinedSet = new Set(memberships.map((m) => m.channelId));

    const visibleChannels = list
      .filter((ch) => !requiresExplicitMembership(ch.type) || joinedSet.has(ch.id))
      .map((ch) => ({
        ...ch,
        joined: joinedSet.has(ch.id),
      }));
    return attachJointChannelMetadata(
      await attachLastMessageAt(visibleChannels, traceQuery, "channels.last_messages_by_channels", "channels_count"),
    );
  }

  const visibleChannels = list.filter((ch) => ch.type === "channel");
  return attachJointChannelMetadata(
    await attachLastMessageAt(visibleChannels, traceQuery, "channels.last_messages_by_channels", "channels_count"),
  );
}

export async function updateChannel(channelId: string, updates: { name?: string; description?: string; type?: RegularChannelType }) {
  const db = getDb();
  const channel = await getChannel(channelId);
  if (!channel) throw new Error("Channel not found");
  if (!REGULAR_CHANNEL_TYPES.includes(channel.type as RegularChannelType) && channel.type !== "joint") {
    throw new Error("Cannot edit DM channels");
  }
  if (channel.type === "joint" && updates.type !== undefined) {
    throw new Error("Cannot change visibility for joint channels");
  }
  if (channel.name === "all" && updates.name && updates.name !== "all") {
    throw new Error("Cannot rename the #all channel");
  }
  if (channel.name === "all" && updates.type !== undefined && updates.type !== channel.type) {
    throw new Error("Cannot change visibility for the #all channel");
  }

  const jointProjections = channel.type === "joint"
    ? await getActiveJointChannelProjectionsByLocalChannel(channelId)
    : [];

  // If renaming, check uniqueness. Joint channel names are shared metadata, so
  // every active projection's server must be able to accept the new local name
  // before any projection is updated.
  if (updates.name && updates.name !== channel.name) {
    const projectionChannels = jointProjections.length > 0
      ? jointProjections.map((projection) => projection.channel)
      : [channel];
    for (const projectionChannel of projectionChannels) {
      const [existing] = await db
        .select({ id: channels.id })
        .from(channels)
        .where(and(
          eq(channels.serverId, projectionChannel.serverId),
          inArray(channels.type, LISTABLE_CHANNEL_TYPES),
          eq(channels.name, updates.name),
          ne(channels.id, projectionChannel.id),
          isNull(channels.deletedAt)
        ));
      if (existing) {
        throw new Error(`Channel name "${updates.name}" is already taken`);
      }
    }
  }

  const setValues: Record<string, unknown> = {};
  if (updates.name !== undefined) setValues.name = updates.name;
  if (updates.description !== undefined) setValues.description = updates.description || null;
  if (updates.type !== undefined && updates.type !== channel.type) setValues.type = updates.type;

  if (Object.keys(setValues).length === 0) return channel;

  return db.transaction(async (tx) => {
    const projectionIds = channel.type === "joint" && jointProjections.length > 0
      ? jointProjections.map((projection) => projection.localChannelId)
      : [channelId];

    await tx.update(channels)
      .set(setValues)
      .where(inArray(channels.id, projectionIds));

    const [updated] = await tx.select().from(channels).where(eq(channels.id, channelId));

    if (channel.type === "channel" && updated.type === "private") {
      await pruneThreadFollowsOutsideParentMembership(channelId, tx);
    }

    return updated;
  });
}

export async function getActiveJointChannelProjectionsByLocalChannel(channelId: string): Promise<JointChannelProjection[]> {
  const db = getDb();
  const [projection] = await db
    .select({ jointChannelId: jointChannelServers.jointChannelId })
    .from(jointChannelServers)
    .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
    .where(and(
      eq(jointChannelServers.localChannelId, channelId),
      eq(jointChannelServers.status, "active"),
      eq(jointChannels.status, "active"),
    ));
  let jointChannelId = projection?.jointChannelId ?? null;
  if (!jointChannelId) {
    const [storage] = await db
      .select({ jointChannelId: jointChannels.id })
      .from(jointChannels)
      .where(and(
        eq(jointChannels.canonicalChannelId, channelId),
        eq(jointChannels.status, "active"),
      ));
    jointChannelId = storage?.jointChannelId ?? null;
  }
  if (!jointChannelId) return [];

  const rows = await db
    .select({
      jointChannelId: jointChannelServers.jointChannelId,
      localChannelId: jointChannelServers.localChannelId,
      canonicalChannelId: jointChannels.canonicalChannelId,
      serverId: jointChannelServers.serverId,
      role: jointChannelServers.role,
      channel: channels,
    })
    .from(jointChannelServers)
    .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
    .innerJoin(channels, eq(channels.id, jointChannelServers.localChannelId))
    .where(and(
      eq(jointChannelServers.jointChannelId, jointChannelId),
      eq(jointChannelServers.status, "active"),
      eq(jointChannels.status, "active"),
      isNull(channels.deletedAt),
    ))
    .orderBy(asc(jointChannelServers.joinedAt));

  return rows.map((row) => ({
    ...row,
    role: row.role as "host" | "participant",
  }));
}

async function ensureJointThreadProjectionForLocalParent(
  executor: DatabaseExecutor,
  input: {
    jointThreadId: string;
    localParentProjection: Pick<JointChannelProjection, "serverId" | "localChannelId" | "role">;
    parentMessageId: string;
    joinedByUserId: string | null;
  },
): Promise<{ localThreadChannelId: string; created: boolean }> {
  const [existingLocal] = await executor
    .select({ localChannelId: jointChannelServers.localChannelId })
    .from(jointChannelServers)
    .where(and(
      eq(jointChannelServers.jointChannelId, input.jointThreadId),
      eq(jointChannelServers.serverId, input.localParentProjection.serverId),
      eq(jointChannelServers.status, "active"),
    ))
    .limit(1);

  if (existingLocal?.localChannelId) {
    return { localThreadChannelId: existingLocal.localChannelId, created: false };
  }

  const [threadProjection] = await executor.insert(channels).values({
    serverId: input.localParentProjection.serverId,
    name: `thread-${input.parentMessageId.slice(0, 8)}`,
    type: "thread",
    parentMessageId: null,
  }).returning();

  await executor.insert(jointChannelServers).values({
    jointChannelId: input.jointThreadId,
    serverId: input.localParentProjection.serverId,
    localChannelId: threadProjection.id,
    role: input.localParentProjection.role,
    status: "active",
    joinedByUserId: input.joinedByUserId,
  }).onConflictDoNothing();

  return { localThreadChannelId: threadProjection.id, created: true };
}

async function backfillJointThreadProjectionsForLocalParent(
  executor: DatabaseExecutor,
  input: {
    jointChannelId: string;
    canonicalParentChannelId: string;
    localParentProjection: Pick<JointChannelProjection, "serverId" | "localChannelId" | "role">;
    joinedByUserId: string | null;
  },
): Promise<void> {
  const canonicalThread = alias(channels, "joint_backfill_canonical_thread");
  const parentMessage = alias(messages, "joint_backfill_parent_message");
  const rows = await executor
    .select({
      jointThreadId: jointChannels.id,
      parentMessageId: canonicalThread.parentMessageId,
    })
    .from(jointChannels)
    .innerJoin(canonicalThread, eq(canonicalThread.id, jointChannels.canonicalChannelId))
    .innerJoin(parentMessage, eq(parentMessage.id, canonicalThread.parentMessageId))
    .where(and(
      eq(parentMessage.channelId, input.canonicalParentChannelId),
      eq(canonicalThread.type, "thread"),
      eq(jointChannels.status, "active"),
      isNull(canonicalThread.deletedAt),
    ));

  for (const row of rows) {
    if (!row.parentMessageId) continue;
    await ensureJointThreadProjectionForLocalParent(executor, {
      jointThreadId: row.jointThreadId,
      localParentProjection: input.localParentProjection,
      parentMessageId: row.parentMessageId,
      joinedByUserId: input.joinedByUserId,
    });
  }
}

async function listActiveJointThreadProjectionRows(
  input: { localThreadChannelId?: string; canonicalThreadChannelId?: string; serverId?: string },
): Promise<JointThreadProjection[]> {
  const db = getDb();
  const localThread = alias(channels, "joint_thread_local_thread");
  const canonicalThread = alias(channels, "joint_thread_canonical_thread");
  const parentMessage = alias(messages, "joint_thread_parent_message");
  const parentJoint = alias(jointChannels, "joint_thread_parent_joint");
  const parentProjection = alias(jointChannelServers, "joint_thread_parent_projection");

  const filters = [
    eq(jointChannels.status, "active"),
    eq(jointChannelServers.status, "active"),
    eq(parentJoint.status, "active"),
    eq(parentProjection.status, "active"),
    eq(localThread.type, "thread"),
    eq(canonicalThread.type, "thread"),
    isNull(localThread.deletedAt),
    isNull(canonicalThread.deletedAt),
  ];
  if (input.localThreadChannelId) filters.push(eq(jointChannelServers.localChannelId, input.localThreadChannelId));
  if (input.canonicalThreadChannelId) filters.push(eq(jointChannels.canonicalChannelId, input.canonicalThreadChannelId));
  if (input.serverId) filters.push(eq(jointChannelServers.serverId, input.serverId));

  const rows = await db
    .select({
      jointThreadId: jointChannels.id,
      localThreadChannelId: jointChannelServers.localChannelId,
      canonicalThreadChannelId: jointChannels.canonicalChannelId,
      localServerId: jointChannelServers.serverId,
      localParentChannelId: parentProjection.localChannelId,
      canonicalParentChannelId: parentMessage.channelId,
      canonicalParentMessageId: canonicalThread.parentMessageId,
      role: jointChannelServers.role,
      threadChannel: localThread,
    })
    .from(jointChannelServers)
    .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
    .innerJoin(localThread, eq(localThread.id, jointChannelServers.localChannelId))
    .innerJoin(canonicalThread, eq(canonicalThread.id, jointChannels.canonicalChannelId))
    .innerJoin(parentMessage, eq(parentMessage.id, canonicalThread.parentMessageId))
    .innerJoin(parentJoint, eq(parentJoint.canonicalChannelId, parentMessage.channelId))
    .innerJoin(parentProjection, and(
      eq(parentProjection.jointChannelId, parentJoint.id),
      eq(parentProjection.serverId, jointChannelServers.serverId),
    ))
    .where(and(...filters))
    .orderBy(asc(jointChannelServers.joinedAt));

  return rows
    .filter((row): row is typeof row & { canonicalParentMessageId: string } => Boolean(row.canonicalParentMessageId))
    .map((row) => ({ ...row, role: row.role as "host" | "participant" }));
}

export async function getJointThreadProjectionByLocalThread(
  localThreadChannelId: string,
  serverId?: string,
): Promise<JointThreadProjection | null> {
  const [projection] = await listActiveJointThreadProjectionRows({ localThreadChannelId, serverId });
  return projection ?? null;
}

export async function getActiveJointThreadProjectionsByCanonicalThread(
  canonicalThreadChannelId: string,
): Promise<JointThreadProjection[]> {
  return listActiveJointThreadProjectionRows({ canonicalThreadChannelId });
}

export async function getJointThreadProjectionForMember(
  canonicalThreadChannelId: string,
  followerType: "user" | "agent",
  followerId: string,
): Promise<JointThreadProjection | null> {
  const projections = await getActiveJointThreadProjectionsByCanonicalThread(canonicalThreadChannelId);
  for (const projection of projections) {
    const isMember = followerType === "user"
      ? await isChannelHuman(projection.localParentChannelId, followerId)
      : await isChannelAgent(projection.localParentChannelId, followerId);
    if (isMember) return projection;
  }
  return null;
}

export async function canUserSeeAgentThroughJointChannel(serverId: string, userId: string, agentId: string): Promise<boolean> {
  const db = getDb();
  const localProjection = alias(jointChannelServers, "joint_profile_local_projection");
  const peerProjection = alias(jointChannelServers, "joint_profile_peer_projection");
  const [row] = await db
    .select({ jointChannelId: localProjection.jointChannelId })
    .from(localProjection)
    .innerJoin(peerProjection, eq(peerProjection.jointChannelId, localProjection.jointChannelId))
    .innerJoin(jointChannels, eq(jointChannels.id, localProjection.jointChannelId))
    .innerJoin(channelHumans, and(
      eq(channelHumans.channelId, localProjection.localChannelId),
      eq(channelHumans.userId, userId),
    ))
    .innerJoin(channelAgents, and(
      eq(channelAgents.channelId, peerProjection.localChannelId),
      eq(channelAgents.agentId, agentId),
    ))
    .where(and(
      eq(localProjection.serverId, serverId),
      eq(localProjection.status, "active"),
      eq(peerProjection.status, "active"),
      eq(jointChannels.status, "active"),
    ))
    .limit(1);
  return !!row;
}

export async function getJointVisibleHumanServerId(serverId: string, requesterId: string, targetUserId: string): Promise<string | null> {
  const db = getDb();
  const localProjection = alias(jointChannelServers, "joint_human_profile_local_projection");
  const peerProjection = alias(jointChannelServers, "joint_human_profile_peer_projection");
  const peerHumans = alias(channelHumans, "joint_human_profile_peer_humans");
  const [row] = await db
    .select({ serverId: peerProjection.serverId })
    .from(localProjection)
    .innerJoin(peerProjection, eq(peerProjection.jointChannelId, localProjection.jointChannelId))
    .innerJoin(jointChannels, eq(jointChannels.id, localProjection.jointChannelId))
    .innerJoin(channelHumans, and(
      eq(channelHumans.channelId, localProjection.localChannelId),
      eq(channelHumans.userId, requesterId),
    ))
    .innerJoin(peerHumans, and(
      eq(peerHumans.channelId, peerProjection.localChannelId),
      eq(peerHumans.userId, targetUserId),
    ))
    .where(and(
      eq(localProjection.serverId, serverId),
      eq(localProjection.status, "active"),
      eq(peerProjection.status, "active"),
      eq(jointChannels.status, "active"),
    ))
    .limit(1);
  return row?.serverId ?? null;
}

export async function canUserSeeHumanThroughJointChannel(serverId: string, requesterId: string, targetUserId: string): Promise<boolean> {
  return !!await getJointVisibleHumanServerId(serverId, requesterId, targetUserId);
}

// Thread follows are delivery/inbox state, not access grants. When parent
// membership changes, remove stale child-thread follows for humans/agents that
// no longer belong to the parent surface. The same helper also powers the
// public->private snapshot cleanup.
async function pruneThreadFollowsOutsideParentMembership(
  parentChannelId: string,
  executor: DatabaseExecutor,
) {
  await executor.execute(sql`
    DELETE FROM ${threadFollows}
    WHERE ${threadFollows.followerType} = 'user'
      AND EXISTS (
        SELECT 1
        FROM ${channels} parent_threads
        INNER JOIN ${messages} parent_messages
          ON parent_messages.id = parent_threads.parent_message_id
        WHERE parent_threads.id = ${threadFollows.threadChannelId}
          AND parent_threads.type = 'thread'
          AND parent_threads.deleted_at IS NULL
          AND parent_messages.channel_id = ${parentChannelId}
      )
      AND NOT EXISTS (
        SELECT 1
        FROM ${channelHumans}
        WHERE ${channelHumans.channelId} = ${parentChannelId}
          AND ${channelHumans.userId} = ${threadFollows.followerId}
      )
  `);

  await executor.execute(sql`
    DELETE FROM ${threadFollows}
    WHERE ${threadFollows.followerType} = 'agent'
      AND EXISTS (
        SELECT 1
        FROM ${channels} parent_threads
        INNER JOIN ${messages} parent_messages
          ON parent_messages.id = parent_threads.parent_message_id
        WHERE parent_threads.id = ${threadFollows.threadChannelId}
          AND parent_threads.type = 'thread'
          AND parent_threads.deleted_at IS NULL
          AND parent_messages.channel_id = ${parentChannelId}
      )
      AND NOT EXISTS (
        SELECT 1
        FROM ${channelAgents}
        WHERE ${channelAgents.channelId} = ${parentChannelId}
          AND ${channelAgents.agentId} = ${threadFollows.followerId}
      )
  `);
}

export async function getChannel(channelId: string, opts?: { includeDeleted?: boolean }) {
  const db = getDb();
  const conditions = [eq(channels.id, channelId)];
  if (!opts?.includeDeleted) {
    conditions.push(isNull(channels.deletedAt));
  }
  const [channel] = await db.select().from(channels).where(and(...conditions));
  return channel || null;
}

export type ChannelAccessResolution =
  | {
      kind: "local";
      localChannelId: string;
      canonicalChannelId: string;
      serverId: string;
      channel: typeof channels.$inferSelect;
    }
  | {
      kind: "joint";
      localChannelId: string;
      canonicalChannelId: string;
      jointChannelId: string;
      localServerId: string;
      role: "host" | "participant";
      channel: typeof channels.$inferSelect;
    };

/**
 * Resolve a request-scoped channel id into its storage authority.
 *
 * For ordinary channels this is identity. For joint channels, the caller must
 * present the local projection id that belongs to their active server. The
 * canonical channel is storage-only and never grants cross-server access on
 * its own.
 */
export async function resolveChannelAccess(input: {
  serverId: string;
  channelId: string;
  includeDeleted?: boolean;
}): Promise<ChannelAccessResolution | null> {
  const channel = await getChannel(input.channelId, { includeDeleted: input.includeDeleted });
  if (!channel) return null;
  if (channel.serverId !== input.serverId) return null;

  if (channel.type !== "joint") {
    return {
      kind: "local",
      localChannelId: channel.id,
      canonicalChannelId: channel.id,
      serverId: channel.serverId,
      channel,
    };
  }

  const db = getDb();
  const [projection] = await db
    .select({
      jointChannelId: jointChannelServers.jointChannelId,
      localChannelId: jointChannelServers.localChannelId,
      localServerId: jointChannelServers.serverId,
      role: jointChannelServers.role,
      projectionStatus: jointChannelServers.status,
      canonicalChannelId: jointChannels.canonicalChannelId,
      jointStatus: jointChannels.status,
    })
    .from(jointChannelServers)
    .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
    .where(and(
      eq(jointChannelServers.localChannelId, channel.id),
      eq(jointChannelServers.serverId, input.serverId),
      eq(jointChannelServers.status, "active"),
      eq(jointChannels.status, "active"),
    ));

  if (!projection) return null;

  return {
    kind: "joint",
    localChannelId: projection.localChannelId,
    canonicalChannelId: projection.canonicalChannelId,
    jointChannelId: projection.jointChannelId,
    localServerId: projection.localServerId,
    role: projection.role,
    channel,
  };
}

/**
 * For a thread channel, return the parent channel's type ("channel" | "private" | "joint" | "dm").
 * Returns null if the channel is not a thread or the parent can't be found.
 */
export async function getThreadParentChannelType(channel: { type: string; parentMessageId: string | null }): Promise<"channel" | "private" | "joint" | "dm" | null> {
  if (channel.type !== "thread" || !channel.parentMessageId) return null;
  const db = getDb();
  const [parentMsg] = await db
    .select({ channelId: messages.channelId })
    .from(messages)
    .where(eq(messages.id, channel.parentMessageId));
  if (!parentMsg) return null;
  const parentChannel = await getChannel(parentMsg.channelId);
  return (parentChannel?.type as "channel" | "private" | "joint" | "dm") ?? null;
}

/**
 * Archive a channel. Freezes writes but preserves read access and the name.
 * Idempotent: archiving an already-archived channel is a no-op and returns
 * the current row.
 * Refuses to archive the #all channel, DMs, and threads.
 */
export async function archiveChannel(channelId: string, archivedByUserId: string) {
  const db = getDb();
  const channel = await getChannel(channelId);
  if (!channel) throw new Error("Channel not found");
  if (!REGULAR_CHANNEL_TYPES.includes(channel.type as RegularChannelType) && channel.type !== "joint") throw new Error("Only regular channels can be archived");
  if (channel.name === "all") throw new Error("The #all channel cannot be archived");
  if (channel.archivedAt) return channel;

  if (channel.type === "joint") {
    const projections = await getActiveJointChannelProjectionsByLocalChannel(channelId);
    const projectionIds = projections.length > 0
      ? projections.map((projection) => projection.localChannelId)
      : [channelId];
    const [updated] = await db.update(channels)
      .set({ archivedAt: new Date(), archivedByUserId })
      .where(inArray(channels.id, projectionIds))
      .returning();
    return updated ?? channel;
  }

  const [updated] = await db.update(channels)
    .set({ archivedAt: new Date(), archivedByUserId })
    .where(eq(channels.id, channelId))
    .returning();
  return updated;
}

/**
 * Unarchive a channel. Idempotent on already-active channels.
 */
export async function unarchiveChannel(channelId: string) {
  const db = getDb();
  const channel = await getChannel(channelId);
  if (!channel) throw new Error("Channel not found");
  if (!REGULAR_CHANNEL_TYPES.includes(channel.type as RegularChannelType) && channel.type !== "joint") throw new Error("Only regular channels can be unarchived");
  if (!channel.archivedAt) return channel;

  if (channel.type === "joint") {
    const projections = await getActiveJointChannelProjectionsByLocalChannel(channelId);
    const projectionIds = projections.length > 0
      ? projections.map((projection) => projection.localChannelId)
      : [channelId];
    const [updated] = await db.update(channels)
      .set({ archivedAt: null, archivedByUserId: null })
      .where(inArray(channels.id, projectionIds))
      .returning();
    return updated ?? channel;
  }

  const [updated] = await db.update(channels)
    .set({ archivedAt: null, archivedByUserId: null })
    .where(eq(channels.id, channelId))
    .returning();
  return updated;
}

/**
 * Source of truth for the archive write-gate. Returns true if the channel
 * exists and is archived. Threads inherit their parent's archived state, so
 * archiving a channel also freezes all of its threads.
 */
export async function isChannelArchived(channelId: string): Promise<boolean> {
  const channel = await getChannel(channelId);
  if (!channel) return false;
  if (channel.archivedAt) return true;
  if (channel.type === "thread") {
    const jointThread = await getJointThreadProjectionByLocalThread(channelId, channel.serverId);
    if (jointThread) {
      return isChannelArchived(jointThread.localParentChannelId);
    }
  }

  if (channel.type === "thread" && channel.parentMessageId) {
    const db = getDb();
    const [parentMsg] = await db
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId));
    if (!parentMsg) return false;
    return isChannelArchived(parentMsg.channelId);
  }
  return false;
}

export class ChannelArchivedError extends Error {
  constructor(public readonly channelId: string) {
    super("Channel is archived");
    this.name = "ChannelArchivedError";
  }
}

export class ArchivedNameCollisionError extends Error {
  constructor(public readonly channelName: string, public readonly archivedChannelId: string) {
    super(`Channel name "${channelName}" is held by an archived channel`);
    this.name = "ArchivedNameCollisionError";
  }
}

/**
 * Throws ChannelArchivedError if the channel (or its parent, for threads) is
 * archived. Call from write-path code to freeze all mutations on archived
 * channels.
 */
export async function assertChannelNotArchived(channelId: string): Promise<void> {
  if (await isChannelArchived(channelId)) {
    throw new ChannelArchivedError(channelId);
  }
}

export async function deleteChannel(channelId: string) {
  const db = getDb();
  const channel = await getChannel(channelId, { includeDeleted: true });

  if (!channel) return;

  // Prevent deletion of the built-in #all channel
  if (channel.type === "channel" && channel.name === "all") {
    throw new Error("The #all channel cannot be deleted");
  }

  const now = new Date();

  // Channel is soft-deleted, so the FK `onDelete: cascade` never fires.
  // If we leave open tasks behind, users see them in the Tasks panel but
  // `PATCH /tasks/:id/status` 404s because `getChannel()` filters by
  // `deletedAt IS NULL`. Auto-close open tasks to the terminal `closed`
  // state so the panel shows them as "🚫 Closed" instead of stuck open.
  // Done/closed tasks are left as-is (already terminal).
  await db.transaction(async (tx) => {
    await tx.update(messages)
      .set({
        taskStatus: "closed",
        taskCompletedAt: now,
        updatedAt: now,
      })
      .where(and(
        eq(messages.channelId, channelId),
        inArray(messages.taskStatus, ["todo", "in_progress", "in_review"]),
      ));

    await tx.update(channels)
      .set({ deletedAt: now })
      .where(eq(channels.id, channelId));
  });
}

export async function disconnectJointChannel(channelId: string, disconnectedByUserId: string) {
  const db = getDb();
  const channel = await getChannel(channelId);
  if (!channel) throw new Error("Channel not found");
  if (channel.type !== "joint") throw new Error("Only joint channels can be disconnected");

  const now = new Date();
  await db.transaction(async (tx) => {
    const [projection] = await tx
      .select({ jointChannelId: jointChannelServers.jointChannelId })
      .from(jointChannelServers)
      .where(and(
        eq(jointChannelServers.localChannelId, channelId),
        eq(jointChannelServers.status, "active"),
      ));
    if (!projection) throw new Error("Joint channel not found");

    await tx.update(jointChannelServers)
      .set({
        status: "disconnected",
        disconnectedByUserId,
        disconnectedAt: now,
      })
      .where(and(
        eq(jointChannelServers.jointChannelId, projection.jointChannelId),
        eq(jointChannelServers.localChannelId, channelId),
      ));

    await tx.update(channels)
      .set({ deletedAt: now })
      .where(eq(channels.id, channelId));
  });
}

async function deletePrivateChannelIfEmpty(channelId: string, db: DatabaseExecutor = getDb()) {
  const [channel] = await db
    .select({ type: channels.type, deletedAt: channels.deletedAt })
    .from(channels)
    .where(eq(channels.id, channelId));
  if (!channel || channel.type !== "private" || channel.deletedAt) return;

  const result = await db.execute(sql`
    SELECT
      (SELECT count(*)::int FROM channel_humans WHERE channel_id = ${channelId}) AS "humanCount",
      (SELECT count(*)::int FROM channel_agents WHERE channel_id = ${channelId}) AS "agentCount"
  `);
  const [row] = result.rows as Array<{ humanCount?: number; agentCount?: number }>;
  const humanCount = row?.humanCount ?? 0;
  const agentCount = row?.agentCount ?? 0;
  if (humanCount + agentCount > 0) return;

  await db.update(channels)
    .set({ deletedAt: new Date() })
    .where(and(eq(channels.id, channelId), eq(channels.type, "private"), isNull(channels.deletedAt)));
}

export async function addAgent(channelId: string, agentId: string) {
  const db = getDb();
  const channel = await getChannel(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }
  if (channel?.type === "thread") {
    throw new Error("Thread membership is managed via follow/unfollow, not channel_agents");
  }
  const [agent] = await db
    .select({ serverId: agents.serverId })
    .from(agents)
    .where(eq(agents.id, agentId));
  if (!agent || agent.serverId !== channel.serverId) {
    throw new Error("Agent is not a member of this channel's server");
  }
  await db.insert(channelAgents).values({ channelId, agentId }).onConflictDoNothing();
}

export async function removeAgent(channelId: string, agentId: string) {
  const db = getDb();
  const channel = await getChannel(channelId);
  if (channel?.type === "thread") {
    throw new Error("Thread membership is managed via follow/unfollow, not channel_agents");
  }
  // Protect #all channel
  if (channel?.name === "all" && channel?.type === "channel") {
    throw new Error("Cannot remove members from the #all channel");
  }
  await db.delete(channelAgents).where(
    and(eq(channelAgents.channelId, channelId), eq(channelAgents.agentId, agentId))
  );
  if (channel) {
    await pruneThreadFollowsOutsideParentMembership(channelId, db);
  }
  await deletePrivateChannelIfEmpty(channelId, db);
}

export async function getChannelAgents(channelId: string) {
  const db = getDb();
  return db
    .select({
      id: agents.id,
      serverId: agents.serverId,
      serverName: servers.name,
      serverSlug: servers.slug,
      name: agents.name,
      displayName: agents.displayName,
      status: agents.status,
      avatarUrl: agents.avatarUrl,
    })
    .from(channelAgents)
    .innerJoin(agents, eq(channelAgents.agentId, agents.id))
    .innerJoin(servers, eq(servers.id, agents.serverId))
    .where(and(eq(channelAgents.channelId, channelId), isNull(agents.deletedAt)))
    .orderBy(asc(channelAgents.addedAt));
}

export async function getAgentChannels(agentId: string) {
  const db = getDb();
  return db
    .select({ id: channels.id, name: channels.name, description: channels.description })
    .from(channelAgents)
    .innerJoin(channels, eq(channelAgents.channelId, channels.id))
    .where(
      and(
        eq(channelAgents.agentId, agentId),
        inArray(channels.type, LISTABLE_CHANNEL_TYPES),
        isNull(channels.deletedAt)
      )
    );
}

export async function listChannelsForAgent(serverId: string, agentId: string) {
  const db = getDb();
  const memberships = await db
    .select({ channelId: channelAgents.channelId })
    .from(channelAgents)
    .where(eq(channelAgents.agentId, agentId));
  const joinedSet = new Set(memberships.map((m) => m.channelId));
  const list = await db
    .select()
    .from(channels)
    .where(and(
      eq(channels.serverId, serverId),
      inArray(channels.type, LISTABLE_CHANNEL_TYPES),
      isNull(channels.deletedAt),
      isNull(channels.archivedAt),
    ))
    .orderBy(asc(channels.createdAt));

  return list
    .filter((ch) => !requiresExplicitMembership(ch.type) || joinedSet.has(ch.id))
    .map((ch) => ({
      ...ch,
      joined: joinedSet.has(ch.id),
    }));
}

// DM support — unified peer model for both agent-DMs and user-DMs

/** Peer info returned for DMs (agent or user) */
export interface DMPeer {
  peerType: "agent" | "user";
  peerId: string;
  peerName: string;
  peerDisplayName: string | null;
  peerDescription: string | null;
  peerGravatarHash: string | null;
  peerAvatarUrl: string | null;
}

/** DM channel with peer info */
export type DMChannel = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  createdAt: Date;
  lastMessageAt?: Date | null;
} & DMPeer;

interface DMChannelListOptions {
  traceQuery?: DbQueryTracer;
}

/**
 * Select a DM channel with its peer info (agent-DM).
 */
async function selectDMWithAgentPeer(channelId: string): Promise<DMChannel | null> {
  const db = getDb();
  const [result] = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      description: channels.description,
      createdAt: channels.createdAt,
      peerId: agents.id,
      peerName: agents.name,
      peerDisplayName: agents.displayName,
      peerDescription: agents.description,
      peerGravatarHash: sql<string | null>`null`,
      peerAvatarUrl: agents.avatarUrl,
    })
    .from(channels)
    .innerJoin(channelAgents, eq(channels.id, channelAgents.channelId))
    .innerJoin(agents, eq(channelAgents.agentId, agents.id))
    .where(and(eq(channels.id, channelId), isNull(agents.deletedAt)));
  if (!result) return null;
  return { ...result, peerType: "agent" as const };
}

/**
 * Select a DM channel with its peer info (user-DM, peer = the other user).
 */
async function selectDMWithUserPeer(channelId: string, currentUserId: string): Promise<DMChannel | null> {
  const db = getDb();

  // Find the peer user in this DM (for self-DM, peer is the user themselves)
  const allHumans = await db
    .select({ userId: channelHumans.userId })
    .from(channelHumans)
    .where(eq(channelHumans.channelId, channelId));
  const otherUserId = allHumans.find(h => h.userId !== currentUserId)?.userId ?? currentUserId;
  if (!otherUserId) return null;

  const [peer] = await db
    .select({ id: users.id, name: users.name, displayName: users.displayName, description: users.description, email: users.email, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, otherUserId));
  if (!peer) return null;

  const [ch] = await db.select().from(channels).where(eq(channels.id, channelId));
  if (!ch) return null;

  return {
    id: ch.id,
    name: ch.name,
    type: ch.type,
    description: ch.description,
    createdAt: ch.createdAt,
    peerType: "user",
    peerId: peer.id,
    peerName: peer.name,
    peerDisplayName: peer.displayName,
    peerDescription: peer.description,
    peerAvatarUrl: peer.avatarUrl,
    peerGravatarHash: createHash("sha256").update(peer.email.trim().toLowerCase()).digest("hex"),
  };
}

/**
 * Find or create a DM channel between a user and an agent.
 * Returns unified peer format.
 */
export async function findOrCreateDM(serverId: string, userId: string, agentId: string): Promise<DMChannel | null> {
  const dmChannelId = await withServerResourceLock(
    serverId,
    DM_LOCK_NAMESPACE,
    dmPairKey("human-agent", [userId, agentId]),
    async (tx) => {
      const [agent] = await tx
        .select({ id: agents.id, name: agents.name, displayName: agents.displayName })
        .from(agents)
        .where(and(
          eq(agents.id, agentId),
          eq(agents.serverId, serverId),
          isNull(agents.deletedAt),
        ));
      if (!agent) return null;

      // Look for existing DM with this agent + user (including soft-deleted).
      const [existing] = await tx
        .select({ id: channels.id, deletedAt: channels.deletedAt })
        .from(channels)
        .innerJoin(channelAgents, eq(channels.id, channelAgents.channelId))
        .innerJoin(channelHumans, eq(channels.id, channelHumans.channelId))
        .where(and(
          eq(channels.serverId, serverId),
          eq(channels.type, "dm"),
          eq(channelAgents.agentId, agentId),
          eq(channelHumans.userId, userId),
        ));

      if (existing) {
        if (existing.deletedAt) {
          await tx.update(channels).set({ deletedAt: null }).where(eq(channels.id, existing.id));
        }
        return existing.id;
      }

      // DM channel name = unique name (identity); display name resolved at read time.
      const dmName = agent.name || "Agent";
      const [dmChannel] = await tx.insert(channels).values({
        serverId,
        name: dmName,
        type: "dm",
      }).returning();

      await tx.insert(channelAgents).values({ channelId: dmChannel.id, agentId });
      await tx.insert(channelHumans).values({ channelId: dmChannel.id, userId });
      return dmChannel.id;
    },
  );

  return dmChannelId ? selectDMWithAgentPeer(dmChannelId) : null;
}

/**
 * Find or create a DM channel between two users (human-to-human DM).
 * Returns unified peer format (peer = the other user).
 */
export async function findOrCreateUserDM(serverId: string, userId1: string, userId2: string): Promise<DMChannel | null> {
  const isSelf = userId1 === userId2;

  if (isSelf) {
    // Self-DM: channel with exactly one human member (the user) and no agent.
    const dmChannelId = await withServerResourceLock(
      serverId,
      DM_LOCK_NAMESPACE,
      dmPairKey("user-user", [userId1]),
      async (tx) => {
        const existing = await tx
          .select({ id: channels.id, deletedAt: channels.deletedAt })
          .from(channels)
          .innerJoin(channelHumans, and(eq(channels.id, channelHumans.channelId), eq(channelHumans.userId, userId1)))
          .leftJoin(channelAgents, eq(channels.id, channelAgents.channelId))
          .where(and(
            eq(channels.serverId, serverId),
            eq(channels.type, "dm"),
            isNull(channelAgents.agentId),
            sql`(SELECT count(*) FROM channel_humans WHERE channel_id = ${channels.id}) = 1`,
          ));

        if (existing.length > 0) {
          const dm = existing[0];
          if (dm.deletedAt) {
            await tx.update(channels).set({ deletedAt: null }).where(eq(channels.id, dm.id));
          }
          return dm.id;
        }

        const [selfUser] = await tx.select({ name: users.name }).from(users).where(eq(users.id, userId1));
        const [dmChannel] = await tx.insert(channels).values({
          serverId,
          name: selfUser?.name || "User",
          type: "dm",
        }).returning();

        await tx.insert(channelHumans).values({ channelId: dmChannel.id, userId: userId1 });
        return dmChannel.id;
      },
    );
    return selectDMWithUserPeer(dmChannelId, userId1);
  }

  const dmChannelId = await withServerResourceLock(
    serverId,
    DM_LOCK_NAMESPACE,
    dmPairKey("user-user", [userId1, userId2]),
    async (tx) => {
      const cm2 = alias(channelHumans, "cm2");

      // Look for existing user-DM between these two users (no agent attached).
      const existing = await tx
        .select({ id: channels.id, deletedAt: channels.deletedAt })
        .from(channels)
        .innerJoin(channelHumans, and(eq(channels.id, channelHumans.channelId), eq(channelHumans.userId, userId1)))
        .innerJoin(cm2, and(eq(channels.id, cm2.channelId), eq(cm2.userId, userId2)))
        .leftJoin(channelAgents, eq(channels.id, channelAgents.channelId))
        .where(and(
          eq(channels.serverId, serverId),
          eq(channels.type, "dm"),
          isNull(channelAgents.agentId), // No agent = user-DM
        ));

      if (existing.length > 0) {
        const dm = existing[0];
        if (dm.deletedAt) {
          await tx.update(channels).set({ deletedAt: null }).where(eq(channels.id, dm.id));
        }
        return dm.id;
      }

      // DM channel name = unique name (identity); display name resolved at read time.
      const [otherUser] = await tx
        .select({ name: users.name, displayName: users.displayName })
        .from(users)
        .where(eq(users.id, userId2));
      const dmName = otherUser?.name || "User";
      const [dmChannel] = await tx.insert(channels).values({
        serverId,
        name: dmName,
        type: "dm",
      }).returning();

      await tx.insert(channelHumans).values([
        { channelId: dmChannel.id, userId: userId1 },
        { channelId: dmChannel.id, userId: userId2 },
      ]);

      return dmChannel.id;
    },
  );

  return selectDMWithUserPeer(dmChannelId, userId1);
}

/**
 * Find or create a DM channel between two agents (agent-to-agent DM).
 * Both agents are stored in channelAgents; no human membership is written.
 */
export async function findOrCreateAgentDM(serverId: string, agentId1: string, agentId2: string): Promise<DMChannel | null> {
  if (agentId1 === agentId2) {
    throw new Error("Cannot create a DM with yourself");
  }

  const dmChannelId = await withServerResourceLock(
    serverId,
    DM_LOCK_NAMESPACE,
    dmPairKey("agent-agent", [agentId1, agentId2]),
    async (tx) => {
      const [agent2] = await tx
        .select({ id: agents.id, name: agents.name, displayName: agents.displayName, avatarUrl: agents.avatarUrl })
        .from(agents)
        .where(and(eq(agents.id, agentId2), eq(agents.serverId, serverId), isNull(agents.deletedAt)));
      if (!agent2) return null;

      const ca2 = alias(channelAgents, "ca2");

      const existing = await tx
        .select({ id: channels.id, deletedAt: channels.deletedAt })
        .from(channels)
        .innerJoin(channelAgents, and(eq(channels.id, channelAgents.channelId), eq(channelAgents.agentId, agentId1)))
        .innerJoin(ca2, and(eq(channels.id, ca2.channelId), eq(ca2.agentId, agentId2)))
        .leftJoin(channelHumans, eq(channels.id, channelHumans.channelId))
        .where(and(
          eq(channels.serverId, serverId),
          eq(channels.type, "dm"),
          isNull(channelHumans.userId),
        ));

      if (existing.length > 0) {
        const dm = existing[0];
        if (dm.deletedAt) {
          await tx.update(channels).set({ deletedAt: null }).where(eq(channels.id, dm.id));
        }
        return dm.id;
      }

      const dmName = agent2.name || "Agent";
      const [dmChannel] = await tx.insert(channels).values({
        serverId,
        name: dmName,
        type: "dm",
      }).returning();

      await tx.insert(channelAgents).values([
        { channelId: dmChannel.id, agentId: agentId1 },
        { channelId: dmChannel.id, agentId: agentId2 },
      ]);

      return dmChannel.id;
    },
  );

  return dmChannelId ? selectDMWithAgentPeer(dmChannelId) : null;
}

/**
 * List all DM channels for a user — both agent-DMs and user-DMs.
 * Returns unified peer format.
 */
export async function listDMChannels(
  serverId: string,
  userId: string,
  opts?: DMChannelListOptions,
): Promise<DMChannel[]> {
  const db = getDb();
  const traceQuery = opts?.traceQuery ?? untracedDbQuery;

  // Query 1: Agent-DMs (channel has entry in channelAgents)
  const agentDMs = await traceQuery(
    "dm_channels.agent_dms_by_user",
    () => db
      .select({
        id: channels.id,
        name: channels.name,
        type: channels.type,
        description: channels.description,
        createdAt: channels.createdAt,
        peerId: agents.id,
        peerName: agents.name,
        peerDisplayName: agents.displayName,
        peerDescription: agents.description,
        peerGravatarHash: sql<string | null>`null`,
        peerAvatarUrl: agents.avatarUrl,
      })
      .from(channels)
      .innerJoin(channelAgents, eq(channels.id, channelAgents.channelId))
      .innerJoin(agents, eq(channelAgents.agentId, agents.id))
      .innerJoin(channelHumans, eq(channels.id, channelHumans.channelId))
      .where(and(
        eq(channels.serverId, serverId),
        eq(channels.type, "dm"),
        eq(channelHumans.userId, userId),
        isNull(channels.deletedAt),
        isNull(agents.deletedAt),
      )),
  );

  // Query 2: User-DMs (channel has NO entry in channelAgents, peer = other user)
  const otherHuman = alias(channelHumans, "other_human");
  const userDMRows = await traceQuery(
    "dm_channels.user_dms_by_user",
    () => db
      .select({
        id: channels.id,
        name: channels.name,
        type: channels.type,
        description: channels.description,
        createdAt: channels.createdAt,
        peerId: users.id,
        peerName: users.name,
        peerDisplayName: users.displayName,
        peerDescription: users.description,
        peerEmail: users.email,
        peerAvatarUrl: users.avatarUrl,
      })
      .from(channels)
      .innerJoin(channelHumans, and(eq(channels.id, channelHumans.channelId), eq(channelHumans.userId, userId)))
      .innerJoin(otherHuman, and(eq(channels.id, otherHuman.channelId)))
      .innerJoin(users, eq(otherHuman.userId, users.id))
      .leftJoin(channelAgents, eq(channels.id, channelAgents.channelId))
      .where(and(
        eq(channels.serverId, serverId),
        eq(channels.type, "dm"),
        isNull(channels.deletedAt),
        isNull(channelAgents.agentId), // No agent = user-DM
        // other_human must not be current user
      )),
  );
  const userDMs = userDMRows
    .filter(r => r.peerId !== userId)
    .map(({ peerEmail, ...row }) => ({
      ...row,
      peerGravatarHash: createHash("sha256").update(peerEmail.trim().toLowerCase()).digest("hex"),
    }));

  // Query 3: Self-DMs (channel with exactly 1 human member = current user, no agent)
  const selfDMRows = await traceQuery(
    "dm_channels.self_dms_by_user",
    () => db
      .select({
        id: channels.id,
        name: channels.name,
        type: channels.type,
        description: channels.description,
        createdAt: channels.createdAt,
        peerId: users.id,
        peerName: users.name,
        peerDisplayName: users.displayName,
        peerDescription: users.description,
        peerEmail: users.email,
        peerAvatarUrl: users.avatarUrl,
      })
      .from(channels)
      .innerJoin(channelHumans, and(eq(channels.id, channelHumans.channelId), eq(channelHumans.userId, userId)))
      .innerJoin(users, eq(users.id, channelHumans.userId))
      .leftJoin(channelAgents, eq(channels.id, channelAgents.channelId))
      .where(and(
        eq(channels.serverId, serverId),
        eq(channels.type, "dm"),
        isNull(channels.deletedAt),
        isNull(channelAgents.agentId),
        sql`(SELECT count(*) FROM channel_humans WHERE channel_id = ${channels.id}) = 1`,
      )),
  );
  const selfDMs = selfDMRows.map(({ peerEmail, ...row }) => ({
    ...row,
    peerGravatarHash: createHash("sha256").update(peerEmail.trim().toLowerCase()).digest("hex"),
  }));

  const allDMs: DMChannel[] = [
    ...agentDMs.map(dm => ({ ...dm, peerType: "agent" as const })),
    ...userDMs.map(dm => ({ ...dm, peerType: "user" as const })),
    ...selfDMs.map(dm => ({ ...dm, peerType: "user" as const })),
  ];

  // Sort by most recent message first, then by createdAt for DMs with no messages
  if (allDMs.length === 0) return allDMs;

  const allDmsWithLastMessageAt = await attachLastMessageAt(
    allDMs,
    traceQuery,
    "dm_channels.last_messages_by_channels",
    "dm_channels_count",
  );

  return allDmsWithLastMessageAt.sort((a, b) => {
    const aLast = a.lastMessageAt;
    const bLast = b.lastMessageAt;
    // DMs with messages come first, sorted by most recent
    if (aLast && bLast) return bLast.getTime() - aLast.getTime();
    if (aLast && !bLast) return -1;
    if (!aLast && bLast) return 1;
    // Both have no messages — sort by creation date ascending
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

/**
 * List DM channel ids the user still participates in, including soft-deleted
 * or peer-removed DMs. Used only for conversation-level sidebar state so stale
 * removed-peer rows can still be closed/pinned without resurrecting them in
 * the normal DM list.
 */
export async function listUserDMChannelIdsIncludingRemoved(
  serverId: string,
  userId: string,
  opts: { traceQuery?: DbQueryTracer } = {},
): Promise<string[]> {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const rows = await traceQuery(
    "dm_channels.removed_peer_dms_by_user",
    () => db
      .select({ id: channels.id })
      .from(channels)
      .innerJoin(channelHumans, and(eq(channels.id, channelHumans.channelId), eq(channelHumans.userId, userId)))
      .where(and(
        eq(channels.serverId, serverId),
        eq(channels.type, "dm"),
      )),
  );
  return rows.map((row) => row.id);
}

export interface AgentConversationSummary {
  id: string;
  createdAt: Date;
  peerId: string;
  peerName: string;
  peerDisplayName: string | null;
  peerAvatarUrl: string | null;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
}

/**
 * List agent-to-agent DM channels for one agent.
 * Human DMs are explicitly excluded.
 */
export async function listAgentToAgentDMsForAgent(serverId: string, agentId: string): Promise<AgentConversationSummary[]> {
  const db = getDb();
  const otherAgentMembership = alias(channelAgents, "other_agent_membership");

  const rows = await db
    .select({
      id: channels.id,
      createdAt: channels.createdAt,
      peerId: agents.id,
      peerName: agents.name,
      peerDisplayName: agents.displayName,
      peerAvatarUrl: agents.avatarUrl,
    })
    .from(channels)
    .innerJoin(channelAgents, and(eq(channels.id, channelAgents.channelId), eq(channelAgents.agentId, agentId)))
    .innerJoin(otherAgentMembership, eq(channels.id, otherAgentMembership.channelId))
    .innerJoin(agents, eq(otherAgentMembership.agentId, agents.id))
    .leftJoin(channelHumans, eq(channels.id, channelHumans.channelId))
    .where(and(
      eq(channels.serverId, serverId),
      eq(channels.type, "dm"),
      isNull(channels.deletedAt),
      isNull(channelHumans.userId),
      isNull(agents.deletedAt),
      sql`${otherAgentMembership.agentId} <> ${agentId}`,
    ));

  if (rows.length === 0) return [];

  const lastMessages = await db
    .select({
      channelId: messages.channelId,
      content: messages.content,
      createdAt: messages.createdAt,
      messageType: messages.messageType,
    })
    .from(messages)
    .where(inArray(messages.channelId, rows.map((row) => row.id)))
    .orderBy(desc(messages.createdAt));

  const latestByChannel = new Map<string, { content: string; createdAt: Date }>();
  for (const message of lastMessages) {
    if (message.messageType === "system") continue;
    if (!latestByChannel.has(message.channelId)) {
      latestByChannel.set(message.channelId, { content: message.content, createdAt: message.createdAt });
    }
  }

  return rows
    .map((row) => {
      const latest = latestByChannel.get(row.id);
      return {
        id: row.id,
        createdAt: row.createdAt,
        peerId: row.peerId,
        peerName: row.peerName,
        peerDisplayName: row.peerDisplayName,
        peerAvatarUrl: row.peerAvatarUrl,
        lastMessageAt: latest?.createdAt ?? null,
        lastMessagePreview: latest?.content ?? null,
      };
    })
    .sort((a, b) => {
      const aTime = a.lastMessageAt?.getTime() ?? a.createdAt.getTime();
      const bTime = b.lastMessageAt?.getTime() ?? b.createdAt.getTime();
      return bTime - aTime;
    });
}



/**
 * Check if a human user can access (view) a channel within the active server.
 *
 * The `serverId` argument is mandatory and pins the check to the active server
 * in the request. This prevents cross-server IDOR: passing a channel/attachment
 * UUID from server B while authenticated against server A must always be
 * rejected, even when `canUserAccessChannel` is called from a route that uses
 * `requireFlexAuth` instead of `requireServer` (e.g. attachment downloads).
 *
 * Why: prior versions trusted middleware to constrain scope, but mounts like
 * `/api/attachments/:id` on the public router did not carry `req.serverId` for
 * user-auth paths. Callers must now assert the active server explicitly.
 * See #proj-security task #10 (2026-04-19).
 */
export async function canUserAccessChannel(
  channelId: string,
  userId: string,
  serverId: string,
  opts?: { includeDeleted?: boolean },
): Promise<boolean> {
  const channel = await getChannel(channelId, opts);
  if (!channel) return false;

  // Cross-server guard: the channel must live in the caller's active server.
  if (channel.serverId !== serverId) return false;

  // Public channels are viewable by all server humans.
  if (channel.type === "channel") return true;

  if (channel.type === "joint" && !await resolveChannelAccess({ serverId, channelId, includeDeleted: opts?.includeDeleted })) {
    return false;
  }

  if (channel.type === "thread") {
    const jointThread = await getJointThreadProjectionByLocalThread(channelId, serverId);
    if (jointThread) {
      return canUserAccessChannel(jointThread.localParentChannelId, userId, serverId, opts);
    }
  }

  if (channel.type === "thread" && channel.parentMessageId) {
    const db2 = getDb();
    const [parentMsg] = await db2
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId));
    if (!parentMsg) return false;
    return canUserAccessChannel(parentMsg.channelId, userId, serverId, opts);
  }

  // Agent-to-agent DMs are server-visible conversation records: humans in the
  // server can inspect them even though no human participant row exists. DMs
  // with human participants remain participant-scoped.
  const db = getDb();
  if (channel.type === "dm") {
    const humanParticipants = await db
      .select({ userId: channelHumans.userId })
      .from(channelHumans)
      .where(eq(channelHumans.channelId, channelId));
    if (humanParticipants.length === 0) return true;
    return humanParticipants.some((participant) => participant.userId === userId);
  }

  // Private channels are invite-only, so human users need explicit membership.
  const [row] = await db
    .select({ userId: channelHumans.userId })
    .from(channelHumans)
    .where(and(eq(channelHumans.channelId, channelId), eq(channelHumans.userId, userId)));
  if (row) return true;

  return false;
}

/**
 * Add a human user to a channel (inserts into channelHumans).
 */
export async function addHuman(channelId: string, userId: string, options: ChannelServiceOptions = {}) {
  const db = options.executor ?? getDb();
  const [channel] = await db
    .select({ id: channels.id, serverId: channels.serverId, type: channels.type })
    .from(channels)
    .where(eq(channels.id, channelId));
  if (!channel) {
    throw new Error("Channel not found");
  }
  if (channel?.type === "thread") {
    throw new Error("Thread membership is managed via follow/unfollow, not channel_humans");
  }
  const [member] = await db
    .select({ userId: serverMembers.userId })
    .from(serverMembers)
    .where(and(eq(serverMembers.serverId, channel.serverId), eq(serverMembers.userId, userId)));
  if (!member) {
    throw new Error("Human is not a member of this channel's server");
  }
  await db.insert(channelHumans).values({ channelId, userId }).onConflictDoNothing();
}

/**
 * Remove a human from a channel. Protected: cannot remove from #all.
 */
export async function removeHuman(channelId: string, userId: string) {
  const db = getDb();
  const channel = await getChannel(channelId);
  if (channel?.type === "thread") {
    throw new Error("Thread membership is managed via follow/unfollow, not channel_humans");
  }
  if (channel?.name === "all" && channel?.type === "channel") {
    throw new Error("Cannot leave or remove from the #all channel");
  }
  await db.delete(channelHumans).where(
    and(eq(channelHumans.channelId, channelId), eq(channelHumans.userId, userId))
  );
  if (channel) {
    await pruneThreadFollowsOutsideParentMembership(channelId, db);
  }
  await deletePrivateChannelIfEmpty(channelId, db);
}

/**
 * Get humans in a channel.
 */
export async function getChannelHumans(channelId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      serverId: channels.serverId,
      serverName: servers.name,
      serverSlug: servers.slug,
      name: users.name,
      displayName: users.displayName,
      description: users.description,
      avatarUrl: users.avatarUrl,
      email: users.email,
      role: serverMembers.role,
    })
    .from(channelHumans)
    .innerJoin(channels, eq(channelHumans.channelId, channels.id))
    .innerJoin(servers, eq(servers.id, channels.serverId))
    .innerJoin(users, eq(channelHumans.userId, users.id))
    .innerJoin(serverMembers, and(
      eq(serverMembers.serverId, channels.serverId),
      eq(serverMembers.userId, users.id),
    ))
    .where(eq(channelHumans.channelId, channelId))
    .orderBy(asc(channelHumans.joinedAt));

  return rows.map(({ email, ...rest }) => ({
    ...rest,
    gravatarHash: createHash("sha256").update(email.trim().toLowerCase()).digest("hex"),
  }));
}

/**
 * Members = join/post authority (see thread contract in schema.ts).
 * Regular channels: read channel_humans + channel_agents directly.
 * Thread channels:  delegate to the parent channel/DM's members.
 * For "who gets notified" use getThreadFollowers instead.
 * For #all channels, lazy-backfills humans if empty.
 */
export async function getChannelMembers(channelId: string) {
  const channel = await getChannel(channelId);

  // Threads delegate join/membership to their parent channel (or DM).
  // Followers of a thread are exposed separately via getThreadFollowers.
  if (channel?.type === "thread") {
    const jointThread = await getJointThreadProjectionByLocalThread(channelId, channel.serverId);
    if (jointThread) {
      return getChannelMembers(jointThread.localParentChannelId);
    }
  }

  if (channel?.type === "thread" && channel.parentMessageId) {
    const db2 = getDb();
    const [parentMsg] = await db2
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId));
    if (!parentMsg) return { agents: [], humans: [] };
    return getChannelMembers(parentMsg.channelId);
  }

  // Lazy backfill #all channel humans
  if (channel && channel.name === "all" && channel.type === "channel") {
    await ensureAllChannelHumans(channel.serverId, channelId);
  }

  if (channel?.type === "joint") {
    const db = getDb();
    const [projection] = await db
      .select({ jointChannelId: jointChannelServers.jointChannelId })
      .from(jointChannelServers)
      .innerJoin(jointChannels, eq(jointChannels.id, jointChannelServers.jointChannelId))
      .where(and(
        eq(jointChannelServers.localChannelId, channelId),
        eq(jointChannelServers.status, "active"),
        eq(jointChannels.status, "active"),
      ));
    if (projection) {
      const projections = await db
        .select({ localChannelId: jointChannelServers.localChannelId })
        .from(jointChannelServers)
        .innerJoin(channels, eq(channels.id, jointChannelServers.localChannelId))
        .where(and(
          eq(jointChannelServers.jointChannelId, projection.jointChannelId),
          eq(jointChannelServers.status, "active"),
          isNull(channels.deletedAt),
        ));
      const agentsById = new Map<string, Awaited<ReturnType<typeof getChannelAgents>>[number]>();
      const humansById = new Map<string, Awaited<ReturnType<typeof getChannelHumans>>[number]>();
      for (const row of projections) {
        for (const agent of await getChannelAgents(row.localChannelId)) {
          agentsById.set(agent.id, agent);
        }
        for (const human of await getChannelHumans(row.localChannelId)) {
          humansById.set(human.id, human);
        }
      }
      return { agents: [...agentsById.values()], humans: [...humansById.values()] };
    }
  }

  const agentList = await getChannelAgents(channelId);
  const humanList = await getChannelHumans(channelId);

  return { agents: agentList, humans: humanList };
}

/**
 * Followers = attention/notification authority (see thread contract in
 * schema.ts). Reads thread_follows and is the source of truth for
 * notifications, unread, done, and follow/unfollow. Never use this to decide
 * whether someone may post — that is governed by getChannelMembers and
 * canUserPostToChannel / canAgentPostToChannel.
 */
export async function getThreadFollowers(threadChannelId: string) {
  const db = getDb();

  const agentList = await db
    .select({
      id: agents.id,
      name: agents.name,
      displayName: agents.displayName,
      status: agents.status,
      avatarUrl: agents.avatarUrl,
    })
    .from(threadFollows)
    .innerJoin(agents, eq(agents.id, threadFollows.followerId))
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      eq(threadFollows.followerType, "agent"),
      isNull(threadFollows.unfollowedAt),
      isNull(agents.deletedAt),
    ))
    .orderBy(asc(threadFollows.createdAt));

  const humanRows = await db
    .select({
      id: users.id,
      name: users.name,
      displayName: users.displayName,
      description: users.description,
      avatarUrl: users.avatarUrl,
      email: users.email,
    })
    .from(threadFollows)
    .innerJoin(users, eq(users.id, threadFollows.followerId))
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      eq(threadFollows.followerType, "user"),
      isNull(threadFollows.unfollowedAt),
    ))
    .orderBy(asc(threadFollows.createdAt));

  const humanList = humanRows.map(({ email, ...rest }) => ({
    ...rest,
    gravatarHash: createHash("sha256").update(email.trim().toLowerCase()).digest("hex"),
  }));

  return { agents: agentList, humans: humanList };
}

/**
 * Add a user to the #all channel of a server.
 * Called when a new user joins a server.
 */
export async function addHumanToAllChannel(serverId: string, userId: string, options: ChannelServiceOptions = {}) {
  const db = options.executor ?? getDb();
  const [allChannel] = await db
    .select({ id: channels.id })
    .from(channels)
    .where(and(
      eq(channels.serverId, serverId),
      eq(channels.type, "channel"),
      eq(channels.name, "all"),
      isNull(channels.deletedAt)
    ));
  if (allChannel) {
    await db.insert(channelHumans).values({ channelId: allChannel.id, userId }).onConflictDoNothing();
  }
}

/**
 * Check if a human user is in a channel (in channelHumans).
 */
export async function isChannelHuman(channelId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ userId: channelHumans.userId })
    .from(channelHumans)
    .where(and(eq(channelHumans.channelId, channelId), eq(channelHumans.userId, userId)));
  return !!row;
}

/**
 * Check if an agent is in a channel (in channelAgents).
 */
export async function isChannelAgent(channelId: string, agentId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ agentId: channelAgents.agentId })
    .from(channelAgents)
    .where(and(eq(channelAgents.channelId, channelId), eq(channelAgents.agentId, agentId)));
  return !!row;
}

/**
 * Check if an agent can access (view) a channel.
 * Public channels: all server agents can view.
 * Private, joint channels, and DMs: only participating agents can view.
 */
export async function canAgentAccessChannel(channelId: string, agentId: string): Promise<boolean> {
  const channel = await getChannel(channelId);
  if (!channel) return false;

  if (channel.type === "channel") return true;

  if (channel.type === "joint" && !await resolveChannelAccess({ serverId: channel.serverId, channelId })) {
    return false;
  }

  if (channel.type === "thread") {
    const jointThread = await getJointThreadProjectionByLocalThread(channelId, channel.serverId);
    if (jointThread) {
      return canAgentAccessChannel(jointThread.localParentChannelId, agentId);
    }
  }

  if (channel.type === "thread" && channel.parentMessageId) {
    const db = getDb();
    const [parentMsg] = await db
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId));
    if (!parentMsg) return false;
    return canAgentAccessChannel(parentMsg.channelId, agentId);
  }

  return isChannelAgent(channelId, agentId);
}

/**
 * Post authority for a human (see thread contract in schema.ts).
 * Threads recurse to parent channel/DM membership; following a thread never
 * grants post permission.
 */
export async function canUserPostToChannel(channelId: string, userId: string): Promise<boolean> {
  const channel = await getChannel(channelId);
  if (!channel) return false;

  if (channel.type === "thread") {
    const jointThread = await getJointThreadProjectionByLocalThread(channelId, channel.serverId);
    if (jointThread) {
      return canUserPostToChannel(jointThread.localParentChannelId, userId);
    }
  }

  if (channel.type === "thread" && channel.parentMessageId) {
    const db = getDb();
    const [parentMsg] = await db
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId));
    if (!parentMsg) return false;
    return canUserPostToChannel(parentMsg.channelId, userId);
  }

  return isChannelHuman(channelId, userId);
}

/**
 * Post authority for an agent (see thread contract in schema.ts).
 * Threads recurse to parent channel/DM membership; being in thread_follows
 * never grants post permission.
 */
export async function canAgentPostToChannel(channelId: string, agentId: string): Promise<boolean> {
  const channel = await getChannel(channelId);
  if (!channel) return false;

  if (channel.type === "thread") {
    const jointThread = await getJointThreadProjectionByLocalThread(channelId, channel.serverId);
    if (jointThread) {
      return canAgentPostToChannel(jointThread.localParentChannelId, agentId);
    }
  }

  if (channel.type === "thread" && channel.parentMessageId) {
    const db = getDb();
    const [parentMsg] = await db
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId));
    if (!parentMsg) return false;
    return canAgentPostToChannel(parentMsg.channelId, agentId);
  }

  return isChannelAgent(channelId, agentId);
}

/**
 * Resolve a unified target identifier to a channel ID.
 * Accepts:
 *   - "#channel" for channels
 *   - "#channel:shortid" for threads in channels
 *   - "dm:@peer" or "DM:@peer" (legacy uppercase) for DMs
 *   - "dm:@peer:shortid" for threads in DMs
 * For DMs, the agentId is needed to find the DM channel between the agent and the peer.
 */
export async function resolveChannelByName(
  serverId: string,
  agentId: string,
  channelRef: string
): Promise<{ channelId: string; type: ChannelRefType } | null> {
  const db = getDb();

  // DM or DM thread: dm:@peer or dm:@peer:shortid (also legacy DM:@)
  if (channelRef.startsWith("DM:@") || channelRef.startsWith("dm:@")) {
    const rest = channelRef.slice(4); // strip "dm:@" or "DM:@"
    // Check for thread shortid suffix: dm:@peer:shortid
    const lastColon = rest.lastIndexOf(":");
    if (lastColon > 0) {
      const shortId = rest.slice(lastColon + 1);
      if (/^[0-9a-f]+$/i.test(shortId)) {
        return resolveThreadByShortId(serverId, shortId);
      }
    }
    return resolveDMByPeerName(serverId, agentId, rest);
  }

  // Channel or channel thread: #name or #name:shortid
  if (channelRef.startsWith("#")) {
    const rest = channelRef.slice(1);
    // Check for thread shortid suffix: #channel:shortid
    const lastColon = rest.lastIndexOf(":");
    if (lastColon > 0) {
      const shortId = rest.slice(lastColon + 1);
      if (/^[0-9a-f]+$/i.test(shortId)) {
        return resolveThreadByShortId(serverId, shortId);
      }
    }
    // Plain channel lookup
    const [channel] = await db
      .select({ id: channels.id, type: channels.type })
      .from(channels)
      .where(
        and(
          eq(channels.serverId, serverId),
          inArray(channels.type, LISTABLE_CHANNEL_TYPES),
          eq(channels.name, rest),
          isNull(channels.deletedAt)
        )
      );
    if (!channel) return null;
    if (requiresExplicitMembership(channel.type) && !await isChannelAgent(channel.id, agentId)) {
      return null;
    }
    if (channel.type === "joint" && !await resolveChannelAccess({ serverId, channelId: channel.id })) {
      return null;
    }
    return { channelId: channel.id, type: channel.type as ListableChannelType };
  }

  return null;
}

/** Resolve a thread channel by its short ID (first 8 chars of parent message UUID). */
async function resolveThreadByShortId(
  serverId: string,
  shortId: string
): Promise<{ channelId: string; type: "thread" } | null> {
  const db = getDb();
  const threadName = `thread-${shortId}`;
  const [channel] = await db
    .select({ id: channels.id })
    .from(channels)
    .where(
      and(
        eq(channels.serverId, serverId),
        eq(channels.type, "thread"),
        eq(channels.name, threadName),
        isNull(channels.deletedAt)
      )
    );
  return channel ? { channelId: channel.id, type: "thread" } : null;
}

/**
 * Resolve a DM channel by peer name (for agents).
 * Searches for an existing DM between the agent and a user/agent with this name.
 */
async function resolveDMByPeerName(
  serverId: string,
  agentId: string,
  peerName: string
): Promise<{ channelId: string; type: "dm" } | null> {
  const db = getDb();

  // Try user peer first: find user with matching name in this server
  const userResults = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(serverMembers, eq(serverMembers.userId, users.id))
    .where(and(eq(serverMembers.serverId, serverId), eq(users.name, peerName)));

  for (const user of userResults) {
    // Find DM channel between this agent and this user
    const [dm] = await db
      .select({ id: channels.id })
      .from(channels)
      .innerJoin(channelAgents, eq(channels.id, channelAgents.channelId))
      .innerJoin(channelHumans, eq(channels.id, channelHumans.channelId))
      .where(
        and(
          eq(channels.serverId, serverId),
          eq(channels.type, "dm"),
          eq(channelAgents.agentId, agentId),
          eq(channelHumans.userId, user.id),
          isNull(channels.deletedAt)
        )
      );
    if (dm) return { channelId: dm.id, type: "dm" };
  }

  const agentResults = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.serverId, serverId), eq(agents.name, peerName), isNull(agents.deletedAt)));

  const otherAgentMembership = alias(channelAgents, "other_agent_membership");
  for (const peerAgent of agentResults) {
    if (peerAgent.id === agentId) continue;
    const [dm] = await db
      .select({ id: channels.id })
      .from(channels)
      .innerJoin(channelAgents, and(eq(channels.id, channelAgents.channelId), eq(channelAgents.agentId, agentId)))
      .innerJoin(otherAgentMembership, and(eq(channels.id, otherAgentMembership.channelId), eq(otherAgentMembership.agentId, peerAgent.id)))
      .leftJoin(channelHumans, eq(channels.id, channelHumans.channelId))
      .where(and(
        eq(channels.serverId, serverId),
        eq(channels.type, "dm"),
        isNull(channels.deletedAt),
        isNull(channelHumans.userId),
      ));
    if (dm) return { channelId: dm.id, type: "dm" };
  }

  return null;
}

/**
 * Resolve a user by @name within a server. Returns userId or null.
 */
export async function resolveUserByName(serverId: string, name: string): Promise<string | null> {
  const db = getDb();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(serverMembers, eq(serverMembers.userId, users.id))
    .where(and(eq(serverMembers.serverId, serverId), eq(users.name, name)));
  return user?.id || null;
}

export async function resolveAgentByName(serverId: string, name: string): Promise<string | null> {
  const db = getDb();
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.serverId, serverId), eq(agents.name, name), isNull(agents.deletedAt)));
  return agent?.id || null;
}

/**
 * Ensure the #all channel has all server humans as members (lazy backfill).
 */
async function ensureAllChannelHumans(
  serverId: string,
  allChannelId: string,
  traceQuery: DbQueryTracer = untracedDbQuery,
) {
  const db = getDb();

  // Check if there are any humans in the #all channel
  const [humanCount] = await traceQuery(
    "channels.all_membership.humans_count",
    () => db
      .select({ count: sql<number>`count(*)::int` })
      .from(channelHumans)
      .where(eq(channelHumans.channelId, allChannelId)),
    (rows) => ({
      count: rows[0]?.count ?? 0,
    }),
  );

  const [memberCount] = await traceQuery(
    "channels.all_membership.server_members_count",
    () => db
      .select({ count: sql<number>`count(*)::int` })
      .from(serverMembers)
      .where(eq(serverMembers.serverId, serverId)),
    (rows) => ({
      count: rows[0]?.count ?? 0,
    }),
  );

  // If humans count is less than server members, backfill
  if ((humanCount?.count ?? 0) < (memberCount?.count ?? 0)) {
    const members = await traceQuery(
      "channels.all_membership.members_for_backfill",
      () => db
        .select({ userId: serverMembers.userId })
        .from(serverMembers)
        .where(eq(serverMembers.serverId, serverId)),
      (rows) => ({
        members_count: rows.length,
      }),
    );
    if (members.length > 0) {
      await traceQuery(
        "channels.all_membership.backfill_insert",
        () => db.insert(channelHumans)
          .values(members.map((m) => ({ channelId: allChannelId, userId: m.userId })))
          .onConflictDoNothing(),
        () => ({
          members_count: members.length,
        }),
      );
    }
  }
}

export async function getMessage(messageId: string) {
  const db = getDb();
  const [msg] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  return msg ?? null;
}

export type ChannelFileEntry = {
  id: string;
  messageId: string;
  channelId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  thumbnailKey: string | null;
  createdAt: string;
  uploaderType: "user" | "agent";
  uploaderId: string;
  uploaderName: string | null;
  uploaderDisplayName: string | null;
  source: {
    type: "channel" | "thread";
    channelId: string;
    parentMessageId: string | null;
    parentMessageShortId: string | null;
  };
};

export type ChannelFilesCursor = {
  createdAt: string;
  id: string;
};

export async function listChannelFiles(
  channelId: string,
  opts: { historyCutoff?: Date | null; limit?: number; cursor?: ChannelFilesCursor | null } = {},
): Promise<ChannelFileEntry[]> {
  const db = getDb();
  const limit = Math.max(1, Math.min(opts.limit ?? 500, 500));
  const historyCutoff = opts.historyCutoff ?? null;
  const historyFilter = historyCutoff ? sql`AND m.created_at >= ${historyCutoff}` : sql``;
  const cursor = opts.cursor ?? null;
  const cursorFilter = cursor
    ? sql`AND (a.created_at < ${cursor.createdAt}::timestamptz OR (a.created_at = ${cursor.createdAt}::timestamptz AND a.id < ${cursor.id}))`
    : sql``;
  const rows = await db.execute(sql`
    WITH candidate_files AS (
      (
        SELECT
          a.id,
          a.message_id,
          a.channel_id,
          a.filename,
          a.mime_type,
          a.size_bytes,
          a.width,
          a.height,
          a.thumbnail_key,
          a.created_at,
          a.uploader_type,
          a.uploader_id,
          m.channel_id AS source_channel_id,
          CASE WHEN source_channel.type = 'thread' THEN 'thread' ELSE 'channel' END AS source_type,
          source_channel.parent_message_id
        FROM attachments a
        INNER JOIN messages m
          ON m.id = a.message_id
         AND m.channel_id = a.channel_id
        INNER JOIN channels source_channel
          ON source_channel.id = a.channel_id
         AND source_channel.deleted_at IS NULL
        WHERE a.message_id IS NOT NULL
          AND a.channel_id = ${channelId}
          ${historyFilter}
          ${cursorFilter}
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT ${limit}
      )
      UNION ALL
      (
        SELECT
          a.id,
          a.message_id,
          a.channel_id,
          a.filename,
          a.mime_type,
          a.size_bytes,
          a.width,
          a.height,
          a.thumbnail_key,
          a.created_at,
          a.uploader_type,
          a.uploader_id,
          m.channel_id AS source_channel_id,
          'thread'::text AS source_type,
          source_channel.parent_message_id
        FROM messages parent_message
        INNER JOIN channels source_channel
          ON source_channel.parent_message_id = parent_message.id
         AND source_channel.type = 'thread'
         AND source_channel.deleted_at IS NULL
        INNER JOIN attachments a
          ON a.channel_id = source_channel.id
         AND a.message_id IS NOT NULL
        INNER JOIN messages m
          ON m.id = a.message_id
         AND m.channel_id = source_channel.id
        WHERE parent_message.channel_id = ${channelId}
          ${historyFilter}
          ${cursorFilter}
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT ${limit}
      )
    )
    SELECT
      cf.id::text AS "id",
      cf.message_id::text AS "messageId",
      cf.channel_id::text AS "channelId",
      cf.filename AS "filename",
      cf.mime_type AS "mimeType",
      cf.size_bytes::int AS "sizeBytes",
      cf.width::int AS "width",
      cf.height::int AS "height",
      cf.thumbnail_key AS "thumbnailKey",
      cf.created_at::text AS "createdAt",
      cf.uploader_type AS "uploaderType",
      cf.uploader_id::text AS "uploaderId",
      CASE
        WHEN cf.uploader_type = 'user' THEN u.name
        WHEN cf.uploader_type = 'agent' THEN ag.name
        ELSE NULL
      END AS "uploaderName",
      CASE
        WHEN cf.uploader_type = 'user' THEN u.display_name
        WHEN cf.uploader_type = 'agent' THEN ag.display_name
        ELSE NULL
      END AS "uploaderDisplayName",
      cf.source_channel_id::text AS "sourceChannelId",
      cf.source_type AS "sourceType",
      cf.parent_message_id::text AS "parentMessageId"
    FROM candidate_files cf
    LEFT JOIN users u
      ON cf.uploader_type = 'user'
     AND u.id::text = cf.uploader_id
    LEFT JOIN agents ag
      ON cf.uploader_type = 'agent'
     AND ag.id::text = cf.uploader_id
    ORDER BY cf.created_at DESC, cf.id DESC
    LIMIT ${limit}
  `);

  return rows.rows.map((row) => {
    const r = row as Record<string, unknown>;
    const parentMessageId = typeof r.parentMessageId === "string" ? r.parentMessageId : null;
    return {
      id: String(r.id),
      messageId: String(r.messageId),
      channelId: String(r.channelId),
      filename: String(r.filename),
      mimeType: String(r.mimeType),
      sizeBytes: Number(r.sizeBytes),
      width: r.width == null ? null : Number(r.width),
      height: r.height == null ? null : Number(r.height),
      thumbnailKey: typeof r.thumbnailKey === "string" ? r.thumbnailKey : null,
      createdAt: String(r.createdAt),
      uploaderType: r.uploaderType === "agent" ? "agent" : "user",
      uploaderId: String(r.uploaderId),
      uploaderName: typeof r.uploaderName === "string" ? r.uploaderName : null,
      uploaderDisplayName: typeof r.uploaderDisplayName === "string" ? r.uploaderDisplayName : null,
      source: {
        type: r.sourceType === "thread" ? "thread" : "channel",
        channelId: String(r.sourceChannelId),
        parentMessageId,
        parentMessageShortId: parentMessageId ? parentMessageId.slice(0, 8) : null,
      },
    };
  });
}

// ── Thread support ───────────────────────────────────────

type CanonicalThreadRow = {
  threadChannelId: string;
  storageThreadChannelId: string;
  parentMessageId: string;
  replyCount: number;
  lastReplyAt: string | null;
};

async function listCanonicalThreadsForParentMessages(
  parentMessageIds: string[],
): Promise<CanonicalThreadRow[]> {
  const dedupedParentMessageIds = [...new Set(parentMessageIds.filter(Boolean))];
  if (dedupedParentMessageIds.length === 0) return [];

  const db = getDb();
  const rows = await db.execute(sql`
    SELECT DISTINCT ON (c.parent_message_id)
      c.id::text AS "threadChannelId",
      c.id::text AS "storageThreadChannelId",
      c.parent_message_id::text AS "parentMessageId",
      COALESCE(stats.reply_count, 0)::int AS "replyCount",
      stats.last_reply_at::text AS "lastReplyAt"
    FROM channels c
    LEFT JOIN LATERAL (
      SELECT
        count(*)::int AS reply_count,
        max(m.created_at) AS last_reply_at
      FROM messages m
      WHERE m.channel_id = c.id
    ) stats ON TRUE
    WHERE c.type = 'thread'
      AND c.deleted_at IS NULL
      AND c.parent_message_id IN (${sql.join(dedupedParentMessageIds.map((id) => sql`${id}`), sql`, `)})
    ORDER BY
      c.parent_message_id,
      stats.last_reply_at DESC NULLS LAST,
      COALESCE(stats.reply_count, 0) DESC,
      c.created_at ASC,
      c.id ASC
  `);

  return rows.rows as CanonicalThreadRow[];
}

async function listCanonicalThreadsForChannel(channelId: string): Promise<CanonicalThreadRow[]> {
  const db = getDb();
  const rows = await db.execute(sql`
    SELECT DISTINCT ON (c.parent_message_id)
      c.id::text AS "threadChannelId",
      c.id::text AS "storageThreadChannelId",
      c.parent_message_id::text AS "parentMessageId",
      COALESCE(stats.reply_count, 0)::int AS "replyCount",
      stats.last_reply_at::text AS "lastReplyAt"
    FROM channels c
    INNER JOIN messages pm ON pm.id = c.parent_message_id
    LEFT JOIN LATERAL (
      SELECT
        count(*)::int AS reply_count,
        max(m.created_at) AS last_reply_at
      FROM messages m
      WHERE m.channel_id = c.id
    ) stats ON TRUE
    WHERE c.type = 'thread'
      AND c.deleted_at IS NULL
      AND pm.channel_id = ${channelId}
    ORDER BY
      c.parent_message_id,
      stats.last_reply_at DESC NULLS LAST,
      COALESCE(stats.reply_count, 0) DESC,
      c.created_at ASC,
      c.id ASC
  `);

  return rows.rows as CanonicalThreadRow[];
}

async function getCanonicalThreadForParentMessage(parentMessageId: string): Promise<CanonicalThreadRow | null> {
  const [row] = await listCanonicalThreadsForParentMessages([parentMessageId]);
  return row ?? null;
}

async function listThreadRowsForChannelView(channelId: string): Promise<CanonicalThreadRow[]> {
  const channel = await getChannel(channelId);
  if (channel?.type !== "joint") {
    return listCanonicalThreadsForChannel(channelId);
  }

  const resolved = await resolveChannelAccess({ serverId: channel.serverId, channelId });
  if (!resolved || resolved.kind !== "joint") return [];

  const canonicalThreads = await listCanonicalThreadsForChannel(resolved.canonicalChannelId);
  if (canonicalThreads.length === 0) return [];

  const projections = await Promise.all(
    canonicalThreads.map(async (thread) => ({
      thread,
      localProjection: (await listActiveJointThreadProjectionRows({
        canonicalThreadChannelId: thread.threadChannelId,
        serverId: channel.serverId,
      }))[0] ?? null,
    })),
  );

  return projections
    .filter((entry): entry is typeof entry & { localProjection: JointThreadProjection } => Boolean(entry.localProjection))
    .map(({ thread, localProjection }) => ({
      ...thread,
      threadChannelId: localProjection.localThreadChannelId,
      storageThreadChannelId: thread.threadChannelId,
    }));
}

// Stamps the thread CHANNEL id onto the PARENT message's `messages.thread_id`
// column. This is the single writer of that column: a thread parent gains its
// `thread_id` reference once its thread channel is resolved. Reply messages
// *inside* a thread keep `thread_id = null` and live in the thread channel
// itself (see `schema.ts` `messages.threadId` comment for the contract).
async function syncParentMessageThreadId(parentMessageId: string, threadChannelId: string) {
  const db = getDb();
  await db.update(messages)
    .set({ threadId: threadChannelId })
    .where(eq(messages.id, parentMessageId));
}

/**
 * Find or create a thread channel for a parent message.
 * Thread = channel with type="thread" and parentMessageId set.
 *
 * This function never writes thread_follows rows. Follow rows are written only by:
 *   - the reply-broadcast path in messageService (sender → 'replied', parent author → 'authored')
 *   - mention handling in messageService (mentioned → 'mentioned')
 *   - explicit manual follow via the /channels/threads/follow route
 *
 * Rationale: opening a thread panel must not auto-follow — pollution of the
 * Threads list by view-only opens was the bug this contract fixes.
 */
export async function getOrCreateThread(
  parentMessageId: string,
  _creatorId: string,
  _creatorType: "user" | "agent",
): Promise<{ id: string; serverId: string; parentMessageId: string; created: boolean }> {
  const db = getDb();

  const existing = await getCanonicalThreadForParentMessage(parentMessageId);
  if (existing) {
    await syncParentMessageThreadId(parentMessageId, existing.threadChannelId);
    const [parentThread] = await db
      .select({ serverId: channels.serverId })
      .from(channels)
      .where(eq(channels.id, existing.threadChannelId))
      .limit(1);
    if (!parentThread) throw new Error("Canonical thread channel not found");
    return {
      id: existing.threadChannelId,
      serverId: parentThread.serverId,
      parentMessageId,
      created: false,
    };
  }

  // Get parent message to find its channel and author
  const [parentMsg] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, parentMessageId));
  if (!parentMsg) throw new Error("Parent message not found");

  // Get parent channel to find serverId
  const [parentChannel] = await db
    .select({ serverId: channels.serverId })
    .from(channels)
    .where(eq(channels.id, parentMsg.channelId));
  if (!parentChannel) throw new Error("Parent channel not found");

  // Create thread channel
  const threadName = `thread-${parentMessageId.slice(0, 8)}`;
  const [threadChannel] = await db.insert(channels).values({
    serverId: parentChannel.serverId,
    name: threadName,
    type: "thread",
    parentMessageId,
  }).onConflictDoNothing().returning();

  if (threadChannel) {
    await syncParentMessageThreadId(parentMessageId, threadChannel.id);
    return { id: threadChannel.id, serverId: parentChannel.serverId, parentMessageId, created: true };
  }

  const canonical = await getCanonicalThreadForParentMessage(parentMessageId);
  if (!canonical) throw new Error("Thread creation conflicted but no canonical thread was found");
  await syncParentMessageThreadId(parentMessageId, canonical.threadChannelId);
  return { id: canonical.threadChannelId, serverId: parentChannel.serverId, parentMessageId, created: false };
}

export async function getOrCreateThreadForChannel(
  parentChannelId: string,
  parentMessageId: string,
  creatorId: string,
  creatorType: "user" | "agent",
): Promise<{ id: string; serverId: string; parentMessageId: string; created: boolean; canonicalThreadChannelId: string }> {
  const parentChannel = await getChannel(parentChannelId);
  if (!parentChannel) throw new Error("Parent channel not found");

  if (parentChannel.type !== "joint") {
    const thread = await getOrCreateThread(parentMessageId, creatorId, creatorType);
    return { ...thread, canonicalThreadChannelId: thread.id };
  }

  const parentProjection = await resolveChannelAccess({ serverId: parentChannel.serverId, channelId: parentChannelId });
  if (!parentProjection || parentProjection.kind !== "joint") {
    throw new Error("Parent channel not found");
  }

  const db = getDb();
  const [parentMsg] = await db
    .select({ id: messages.id, channelId: messages.channelId })
    .from(messages)
    .where(eq(messages.id, parentMessageId));
  if (!parentMsg || parentMsg.channelId !== parentProjection.canonicalChannelId) {
    throw new Error("Parent message not found");
  }

  const canonicalThread = await getOrCreateThread(parentMessageId, creatorId, creatorType);

  const [existingJointThread] = await db
    .select({ id: jointChannels.id })
    .from(jointChannels)
    .where(and(
      eq(jointChannels.canonicalChannelId, canonicalThread.id),
      eq(jointChannels.status, "active"),
    ))
    .limit(1);

  const jointThreadId = existingJointThread?.id ?? (await db.insert(jointChannels).values({
    canonicalChannelId: canonicalThread.id,
    createdByServerId: parentChannel.serverId,
    createdByUserId: creatorType === "user" ? creatorId : null,
    status: "active",
  }).returning({ id: jointChannels.id }))[0].id;

  const parentProjections = await getActiveJointChannelProjectionsByLocalChannel(parentChannelId);
  let localThreadId: string | null = null;
  let createdLocalProjection = false;

  for (const projection of parentProjections) {
    const projectionThread = await ensureJointThreadProjectionForLocalParent(db, {
      jointThreadId,
      localParentProjection: projection,
      parentMessageId,
      joinedByUserId: creatorType === "user" && projection.serverId === parentChannel.serverId ? creatorId : null,
    });
    createdLocalProjection = createdLocalProjection || projectionThread.created;

    if (projection.localChannelId === parentChannelId) {
      localThreadId = projectionThread.localThreadChannelId;
    }
  }

  if (!localThreadId) throw new Error("Thread projection not found");
  return {
    id: localThreadId,
    serverId: parentChannel.serverId,
    parentMessageId,
    created: canonicalThread.created || createdLocalProjection,
    canonicalThreadChannelId: canonicalThread.id,
  };
}

type ThreadSummaryResult = {
  threadChannelId: string;
  replyCount: number;
  lastReplyAt: string | null;
  participantIds: string[];
  unreadCount: number;
  firstUnreadMessageId: string | null;
};

/**
 * Get thread summary info for messages in a channel.
 * Returns map of parentMessageId → viewer-aware thread summary metadata.
 */
export async function getThreadSummaries(channelId: string): Promise<
  Record<string, ThreadSummaryResult>
>;
export async function getThreadSummaries(
  channelId: string,
  opts?: ThreadSummaryOptions,
): Promise<
  Record<string, ThreadSummaryResult>
>;
export async function getThreadSummaries(
  channelId: string,
  opts?: ThreadSummaryOptions,
): Promise<
  Record<string, ThreadSummaryResult>
> {
  const traceQuery = opts?.traceQuery ?? untracedDbQuery;

  const threads = await traceQuery(
    "channel_threads.list_by_channel",
    () => listThreadRowsForChannelView(channelId),
  );

  if (threads.length === 0) return {};

  const db = getDb();
  const result: Record<string, ThreadSummaryResult> = {};
  const threadChannelIds = threads.map(thread => thread.threadChannelId);
  const threadStorageRows = threads.map(thread => sql`(${thread.threadChannelId}::uuid, ${thread.storageThreadChannelId}::uuid)`);

  // Batch-fetch unique participants (senders in each thread)
  const participantRows = await traceQuery(
    "channel_threads.participants_by_threads",
    () => db.execute(sql`
      SELECT
        input_threads.thread_id::text AS "threadChannelId",
        m.sender_id AS "senderId"
      FROM (VALUES ${sql.join(threadStorageRows, sql`, `)}) AS input_threads(thread_id, storage_thread_id)
      INNER JOIN messages m
        ON m.channel_id = input_threads.storage_thread_id
      GROUP BY input_threads.thread_id, m.sender_id
    `),
    (rows) => ({
      input_count: threadChannelIds.length,
      participant_rows_count: rows.rows.length,
    }),
  );
  const participantsByThreadId = new Map<string, string[]>();
  for (const row of participantRows.rows as Array<{ threadChannelId: string; senderId: string }>) {
    const list = participantsByThreadId.get(row.threadChannelId) ?? [];
    list.push(row.senderId);
    participantsByThreadId.set(row.threadChannelId, list);
  }

  const unreadByThreadId = new Map<string, { unreadCount: number; firstUnreadMessageId: string | null }>();
  if (opts?.userId) {
    const unreadRows = await traceQuery(
      "channel_threads.unread_by_threads",
      () => db.execute(sql`
        SELECT
          input_threads.thread_id::text AS "threadChannelId",
          (array_agg(m.id ORDER BY m.seq ASC) FILTER (
            WHERE tf.thread_channel_id IS NOT NULL
              AND m.seq > COALESCE(rc.last_read_seq, 0)
          ))[1]::text AS "firstUnreadMessageId",
          count(*) FILTER (
            WHERE tf.thread_channel_id IS NOT NULL
              AND m.seq > COALESCE(rc.last_read_seq, 0)
          )::int AS "unreadCount"
        FROM (VALUES ${sql.join(threadStorageRows, sql`, `)}) AS input_threads(thread_id, storage_thread_id)
        LEFT JOIN thread_follows tf
          ON tf.thread_channel_id = input_threads.thread_id
          AND tf.follower_type = 'user'
          AND tf.follower_id = ${opts.userId}
          AND tf.done_at IS NULL
          AND tf.unfollowed_at IS NULL
        LEFT JOIN user_channel_read_cursors rc
          ON rc.channel_id = input_threads.thread_id
          AND rc.user_id = ${opts.userId}
        LEFT JOIN messages m
          ON m.channel_id = input_threads.storage_thread_id
        GROUP BY input_threads.thread_id
      `),
      (rows) => ({
        input_count: threadChannelIds.length,
        unread_rows_count: rows.rows.length,
        unread_threads_count: (rows.rows as Array<{ unreadCount: number }>).filter((row) => row.unreadCount > 0).length,
      }),
    );
    for (const row of unreadRows.rows as Array<{ threadChannelId: string; unreadCount: number; firstUnreadMessageId: string | null }>) {
      unreadByThreadId.set(row.threadChannelId, {
        unreadCount: row.unreadCount,
        firstUnreadMessageId: row.firstUnreadMessageId ?? null,
      });
    }
  }

  for (const thread of threads) {
    if (!thread.parentMessageId) continue;
    const unread = unreadByThreadId.get(thread.threadChannelId);
    result[thread.parentMessageId] = {
      threadChannelId: thread.threadChannelId,
      replyCount: thread.replyCount,
      lastReplyAt: thread.lastReplyAt ?? null,
      participantIds: participantsByThreadId.get(thread.threadChannelId) ?? [],
      unreadCount: unread?.unreadCount ?? 0,
      firstUnreadMessageId: unread?.firstUnreadMessageId ?? null,
    };
  }

  return result;
}

export async function getThreadSummariesForParentMessages(parentMessageIds: string[]): Promise<
  Record<string, { threadChannelId: string; replyCount: number }>
> {
  const threads = await listCanonicalThreadsForParentMessages(parentMessageIds);
  if (threads.length === 0) return {};

  const result: Record<string, { threadChannelId: string; replyCount: number }> = {};
  for (const thread of threads) {
    if (!thread.parentMessageId) continue;
    result[thread.parentMessageId] = {
      threadChannelId: thread.threadChannelId,
      replyCount: thread.replyCount,
    };
  }

  return result;
}

/**
 * Get thread info for a single parent message.
 */
export async function getThreadInfo(parentMessageId: string): Promise<{
  threadChannelId: string;
  replyCount: number;
  lastReplyAt: string | null;
  participantIds: string[];
} | null> {
  const db = getDb();
  const thread = await getCanonicalThreadForParentMessage(parentMessageId);
  if (!thread) return null;

  const participants = await db
    .select({ senderId: messages.senderId })
    .from(messages)
    .where(eq(messages.channelId, thread.threadChannelId))
    .groupBy(messages.senderId);

  return {
    threadChannelId: thread.threadChannelId,
    replyCount: thread.replyCount,
    lastReplyAt: thread.lastReplyAt ?? null,
    participantIds: participants.map(p => p.senderId),
  };
}

export async function getThreadInfoForChannel(channelId: string, parentMessageId: string): Promise<{
  threadChannelId: string;
  replyCount: number;
  lastReplyAt: string | null;
  participantIds: string[];
} | null> {
  const channel = await getChannel(channelId);
  if (channel?.type !== "joint") {
    return getThreadInfo(parentMessageId);
  }

  const resolved = await resolveChannelAccess({ serverId: channel.serverId, channelId });
  if (!resolved || resolved.kind !== "joint") return null;
  const canonicalThread = await getCanonicalThreadForParentMessage(parentMessageId);
  if (!canonicalThread) return null;
  const [localProjection] = await listActiveJointThreadProjectionRows({
    canonicalThreadChannelId: canonicalThread.threadChannelId,
    serverId: channel.serverId,
  });
  if (!localProjection) return null;
  const info = await getThreadInfo(parentMessageId);
  if (!info) return null;
  return {
    ...info,
    threadChannelId: localProjection.localThreadChannelId,
  };
}

// ── Followed threads ─────────────────────────────────────

/** Get all threads a user participates in, with unread counts and parent message info. */
export async function getFollowedThreads(
  serverId: string,
  userId: string,
  historyCutoff?: Date,
  opts?: FollowedThreadsOptions,
): Promise<Array<{
  threadChannelId: string;
  parentMessageId: string;
  parentChannelId: string;
  parentChannelName: string;
  parentChannelType: string;
  parentMessagePreview: string;
  parentMessageSenderType: string;
  parentMessageSenderId: string;
  latestActivityPreview: string;
  latestActivitySenderType: string;
  latestActivitySenderId: string;
  latestActivityMessageId: string;
  firstUnreadMessageId: string | null;
  lastActivityAt: string;
  replyCount: number;
  lastReplyAt: string | null;
  unreadCount: number;
  taskNumber: number | null;
  taskStatus: string | null;
  taskClaimedByName: string | null;
}>> {
  const db = getDb();
  const traceQuery = opts?.traceQuery ?? untracedDbQuery;

  // Find thread channels the user follows (via threadFollows)
  const parentMessages = alias(messages, "parent_msg");
  const parentChannels = alias(channels, "parent_ch");
  const parentChannelHumans = alias(channelHumans, "parent_channel_humans");

  const regularThreads = await traceQuery(
    "channels.followed_threads_by_user",
    () => db
      .select({
        threadChannelId: channels.id,
        storageThreadChannelId: channels.id,
        parentMessageId: channels.parentMessageId,
        parentChannelId: parentMessages.channelId,
        parentChannelName: parentChannels.name,
        parentChannelType: parentChannels.type,
        parentMessageContent: parentMessages.content,
        parentMessageCreatedAt: parentMessages.createdAt,
        parentMessageSenderType: parentMessages.senderType,
        parentMessageSenderId: parentMessages.senderId,
        taskNumber: tasks.taskNumber,
        taskStatus: tasks.status,
        taskClaimedByType: tasks.claimedByType,
        taskClaimedById: tasks.claimedById,
      })
      .from(threadFollows)
      .innerJoin(channels, and(
        eq(threadFollows.threadChannelId, channels.id),
        eq(channels.type, "thread"),
        eq(channels.serverId, serverId),
        isNull(channels.deletedAt),
      ))
      .innerJoin(parentMessages, eq(channels.parentMessageId, parentMessages.id))
      .innerJoin(parentChannels, eq(parentMessages.channelId, parentChannels.id))
      .leftJoin(parentChannelHumans, and(
        eq(parentChannelHumans.channelId, parentChannels.id),
        eq(parentChannelHumans.userId, userId),
      ))
      .leftJoin(tasks, eq(tasks.messageId, parentMessages.id))
      .where(and(
        eq(threadFollows.followerType, "user"),
        eq(threadFollows.followerId, userId),
        isNull(threadFollows.doneAt),
        isNull(threadFollows.unfollowedAt),
        isNull(parentChannels.archivedAt),
        sql`(${parentChannels.type} = 'channel' OR ${parentChannelHumans.userId} IS NOT NULL)`,
      )),
  );
  const jointThreadRows = await traceQuery(
    "channels.followed_joint_threads_by_user",
    () => db.execute(sql`
      SELECT
        local_thread.id::text AS "threadChannelId",
        canonical_thread.id::text AS "storageThreadChannelId",
        canonical_thread.parent_message_id::text AS "parentMessageId",
        local_parent.id::text AS "parentChannelId",
        local_parent.name AS "parentChannelName",
        local_parent.type AS "parentChannelType",
        parent_msg.content AS "parentMessageContent",
        parent_msg.created_at AS "parentMessageCreatedAt",
        parent_msg.sender_type AS "parentMessageSenderType",
        parent_msg.sender_id AS "parentMessageSenderId",
        legacy_task.task_number AS "taskNumber",
        legacy_task.status AS "taskStatus",
        legacy_task.claimed_by_type AS "taskClaimedByType",
        legacy_task.claimed_by_id AS "taskClaimedById"
      FROM ${threadFollows} tf
      INNER JOIN ${channels} local_thread
        ON local_thread.id = tf.thread_channel_id
       AND local_thread.type = 'thread'
       AND local_thread.server_id = ${serverId}
       AND local_thread.deleted_at IS NULL
      INNER JOIN ${jointChannelServers} thread_projection
        ON thread_projection.local_channel_id = local_thread.id
       AND thread_projection.server_id = ${serverId}
       AND thread_projection.status = 'active'
      INNER JOIN ${jointChannels} thread_joint
        ON thread_joint.id = thread_projection.joint_channel_id
       AND thread_joint.status = 'active'
      INNER JOIN ${channels} canonical_thread
        ON canonical_thread.id = thread_joint.canonical_channel_id
       AND canonical_thread.type = 'thread'
       AND canonical_thread.deleted_at IS NULL
      INNER JOIN ${messages} parent_msg
        ON parent_msg.id = canonical_thread.parent_message_id
      INNER JOIN ${jointChannels} parent_joint
        ON parent_joint.canonical_channel_id = parent_msg.channel_id
       AND parent_joint.status = 'active'
      INNER JOIN ${jointChannelServers} parent_projection
        ON parent_projection.joint_channel_id = parent_joint.id
       AND parent_projection.server_id = ${serverId}
       AND parent_projection.status = 'active'
      INNER JOIN ${channels} local_parent
        ON local_parent.id = parent_projection.local_channel_id
       AND local_parent.type = 'joint'
       AND local_parent.archived_at IS NULL
       AND local_parent.deleted_at IS NULL
      INNER JOIN ${channelHumans} parent_member
        ON parent_member.channel_id = local_parent.id
       AND parent_member.user_id = ${userId}
      LEFT JOIN ${tasks} legacy_task
        ON legacy_task.message_id = parent_msg.id
      WHERE tf.follower_type = 'user'
        AND tf.follower_id = ${userId}
        AND tf.done_at IS NULL
        AND tf.unfollowed_at IS NULL
    `),
  );
  const threads = [
    ...regularThreads,
    ...(jointThreadRows.rows as any[]).map((row) => ({
      ...row,
      parentMessageCreatedAt: new Date(row.parentMessageCreatedAt),
    })),
  ];

  if (threads.length === 0) return [];

  const threadIds = threads.map(t => t.threadChannelId);
  const cutoffCondition = historyCutoff ? sql` AND m.created_at > ${historyCutoff}` : sql``;

  // Batch-fetch reply counts, last reply times, and unread counts.
  const statsRows = await traceQuery(
    "channels.followed_threads_stats_by_threads",
    () => db.execute(sql`
      SELECT
        input_threads.thread_id::text AS "threadChannelId",
        COALESCE(counts.reply_count, 0)::int AS "replyCount",
        latest.created_at::text AS "lastReplyAt",
        latest.id::text AS "lastReplyMessageId",
        latest.content AS "lastReplyContent",
        latest.sender_type AS "lastReplySenderType",
        latest.sender_id AS "lastReplySenderId",
        first_unread.id::text AS "firstUnreadMessageId",
        COALESCE(counts.unread_count, 0)::int AS "unreadCount"
      FROM (VALUES ${sql.join(threads.map(t => sql`(${t.threadChannelId}::uuid, ${t.storageThreadChannelId}::uuid)`), sql`, `)}) AS input_threads(thread_id, storage_thread_id)
      LEFT JOIN user_channel_read_cursors rc
        ON rc.channel_id = input_threads.thread_id AND rc.user_id = ${userId}
      -- Keep the channel_id predicate inside a per-thread LATERAL so Postgres
      -- does small idx_messages_channel_seq scans instead of building one huge
      -- bitmap for hundreds of followed thread IDs.
      LEFT JOIN LATERAL (
        SELECT
          count(*)::int AS reply_count,
          count(*) FILTER (WHERE m.seq > COALESCE(rc.last_read_seq, 0))::int AS unread_count
        FROM messages m
        WHERE m.channel_id = input_threads.storage_thread_id
          ${cutoffCondition}
      ) counts ON true
      LEFT JOIN LATERAL (
        SELECT m.id, m.content, m.sender_type, m.sender_id, m.created_at
        FROM messages m
        WHERE m.channel_id = input_threads.storage_thread_id
          ${cutoffCondition}
        ORDER BY m.seq DESC
        LIMIT 1
      ) latest ON true
      LEFT JOIN LATERAL (
        SELECT m.id
        FROM messages m
        WHERE m.channel_id = input_threads.storage_thread_id
          AND m.seq > COALESCE(rc.last_read_seq, 0)
          ${cutoffCondition}
        ORDER BY m.seq ASC
        LIMIT 1
      ) first_unread ON true
    `),
    (result) => ({
      followed_threads_count: threadIds.length,
      stats_rows_count: result.rows.length,
      history_cutoff_present: Boolean(historyCutoff),
    }),
  );

  const statsMap = new Map<string, {
    replyCount: number;
    lastReplyAt: string | null;
    lastReplyMessageId: string | null;
    lastReplyContent: string | null;
    lastReplySenderType: string | null;
    lastReplySenderId: string | null;
    firstUnreadMessageId: string | null;
    unreadCount: number;
  }>();
  for (const row of statsRows.rows as any[]) {
    statsMap.set(row.threadChannelId, {
      replyCount: row.replyCount,
      lastReplyAt: row.lastReplyAt,
      lastReplyMessageId: row.lastReplyMessageId ?? null,
      lastReplyContent: row.lastReplyContent ?? null,
      lastReplySenderType: row.lastReplySenderType ?? null,
      lastReplySenderId: row.lastReplySenderId ?? null,
      firstUnreadMessageId: row.firstUnreadMessageId ?? null,
      unreadCount: row.unreadCount,
    });
  }

  // Batch-resolve task claimant names
  const claimantNameMap = new Map<string, string>();
  const agentClaimantIds = threads.filter(t => t.taskClaimedByType === "agent" && t.taskClaimedById).map(t => t.taskClaimedById!);
  const userClaimantIds = threads.filter(t => t.taskClaimedByType === "user" && t.taskClaimedById).map(t => t.taskClaimedById!);
  if (agentClaimantIds.length > 0) {
    const agentRows = await traceQuery(
      "channels.followed_threads.agent_claimants",
      () => db.select({ id: agents.id, name: agents.name }).from(agents).where(sql`${agents.id} IN (${sql.join(agentClaimantIds.map(id => sql`${id}`), sql`, `)})`),
      (rows) => ({
        input_count: agentClaimantIds.length,
        claimants_count: rows.length,
      }),
    );
    for (const a of agentRows) claimantNameMap.set(a.id, a.name);
  }
  if (userClaimantIds.length > 0) {
    const userRows = await traceQuery(
      "channels.followed_threads.user_claimants",
      () => db.select({ id: users.id, name: users.name, displayName: users.displayName }).from(users).where(sql`${users.id} IN (${sql.join(userClaimantIds.map(id => sql`${id}`), sql`, `)})`),
      (rows) => ({
        input_count: userClaimantIds.length,
        claimants_count: rows.length,
      }),
    );
    for (const u of userRows) claimantNameMap.set(u.id, u.displayName || u.name);
  }

  const result = threads.map(t => {
    const stats = statsMap.get(t.threadChannelId);
    const latestActivityContent = stats?.lastReplyContent ?? t.parentMessageContent;
    return {
      threadChannelId: t.threadChannelId,
      parentMessageId: t.parentMessageId!,
      parentChannelId: t.parentChannelId,
      parentChannelName: t.parentChannelName,
      parentChannelType: t.parentChannelType,
      parentMessagePreview: t.parentMessageContent.length > 100
        ? t.parentMessageContent.slice(0, 100) + "…"
        : t.parentMessageContent,
      parentMessageSenderType: t.parentMessageSenderType,
      parentMessageSenderId: t.parentMessageSenderId,
      latestActivityPreview: latestActivityContent.length > 140
        ? latestActivityContent.slice(0, 140) + "…"
        : latestActivityContent,
      latestActivitySenderType: stats?.lastReplySenderType ?? t.parentMessageSenderType,
      latestActivitySenderId: stats?.lastReplySenderId ?? t.parentMessageSenderId,
      latestActivityMessageId: stats?.lastReplyMessageId ?? t.parentMessageId!,
      firstUnreadMessageId: stats?.firstUnreadMessageId ?? null,
      lastActivityAt: stats?.lastReplyAt ?? t.parentMessageCreatedAt.toISOString(),
      replyCount: stats?.replyCount ?? 0,
      lastReplyAt: stats?.lastReplyAt ?? null,
      unreadCount: stats?.unreadCount ?? 0,
      taskNumber: t.taskNumber,
      taskStatus: t.taskStatus,
      taskClaimedByName: t.taskClaimedById ? (claimantNameMap.get(t.taskClaimedById) ?? null) : null,
    };
  });

  // Sort by lastReplyAt descending (most recently active first)
  result.sort((a, b) => {
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });

  return result;
}

export type InboxFilter = "all" | "unread" | "mentions";

// CONTRACT: InboxItem is the API-visible row shape that both the canonical
// inline Postgres SQL below and rw_inbox_items_v1 must produce after
// page-bounded enrichment. SYNC REQUIRED: if any field name, type, nullability,
// or semantics changes here, update the inline SQL in getInboxItems,
// docs/engineering/risingwave-unread-inbox-full-materialized.sql, and run:
// pnpm --filter @slock-ai/server risingwave:verify-inbox-parity
export type InboxItem =
  | {
      kind: "channel" | "dm";
      channelId: string;
      channelName: string;
      channelType: "channel" | "private" | "joint" | "dm";
      lastMessageId: string;
      firstUnreadMessageId: string | null;
      lastMessageAt: string;
      lastMessagePreview: string;
      lastMessageSenderType: string;
      lastMessageSenderId: string;
      lastMessageSenderName: string | null;
      unreadCount: number;
      hasMention: boolean;
    }
  | {
      kind: "thread";
      threadChannelId: string;
      parentMessageId: string;
      parentChannelId: string;
      parentChannelName: string;
      parentChannelType: string;
      parentMessagePreview: string;
      parentMessageSenderType: string;
      parentMessageSenderId: string;
      latestActivityPreview: string;
      latestActivitySenderType: string;
      latestActivitySenderId: string;
      latestActivityMessageId: string;
      firstUnreadMessageId: string | null;
      lastActivityAt: string;
      lastReplyAt: string | null;
      replyCount: number;
      unreadCount: number;
      hasMention: boolean;
      taskNumber: number | null;
      taskStatus: string | null;
      taskClaimedByName: string | null;
    };

type InboxQueryResult = { rows: any[] };

const UUID_TEXT_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type InboxTraceBackend = "rw_mv" | "pg_legacy";
type InboxTraceRoute = "all" | "unread" | "mentions" | "sidebar_summary" | "channel_unread";
type InboxFallbackReason = "none" | "no_rw_env" | "history_cutoff" | "joint_storage" | "rw_error" | "pglite_dev";

type QueryClient = {
  query: (queryText: string, values?: unknown[]) => Promise<{ rows: any[] }>;
};

type InboxBackendSelection = {
  backend: InboxTraceBackend;
  fallbackReason: InboxFallbackReason;
};

function inboxTraceAttrs(
  backend: InboxTraceBackend,
  route: InboxTraceRoute,
  fallbackReason: InboxFallbackReason,
): TraceAttributes {
  return {
    "inbox.backend": backend,
    "inbox.route": route,
    "inbox.fallback_reason": fallbackReason,
    "inbox.contract_version": RISINGWAVE_UNREAD_INBOX_CONTRACT_VERSION,
  };
}

function recordInboxBackendSelected(
  backend: InboxTraceBackend,
  route: InboxTraceRoute,
  fallbackReason: InboxFallbackReason,
) {
  addTraceEvent("inbox.backend.selected", inboxTraceAttrs(backend, route, fallbackReason));
}

function recordInboxBackendFailed(
  backend: InboxTraceBackend,
  route: InboxTraceRoute,
  error: unknown,
) {
  addTraceEvent("inbox.backend.failed", {
    ...inboxTraceAttrs(backend, route, "rw_error"),
    error_class: error instanceof Error ? error.name : typeof error,
  });
}

function getLegacyInboxFallbackReason(historyCutoff?: Date): InboxFallbackReason {
  if (historyCutoff) return "history_cutoff";
  try {
    getPool();
    return "no_rw_env";
  } catch {
    return "pglite_dev";
  }
}

async function getJointStorageServerIdsForUser(serverIds: string[], userId: string): Promise<Set<string>> {
  const uniqueServerIds = [...new Set(serverIds.filter(Boolean))];
  if (uniqueServerIds.length === 0) return new Set();

  const db = getDb();
  const result = await db.execute(sql`
    SELECT DISTINCT c.server_id::text AS "serverId"
    FROM joint_channel_servers jcs
    INNER JOIN joint_channels jc
      ON jc.id = jcs.joint_channel_id
     AND jc.status = 'active'
    INNER JOIN channels c
      ON c.id = jcs.local_channel_id
     AND c.server_id IN (${sql.join(uniqueServerIds.map((id) => sql`${id}`), sql`, `)})
     AND c.deleted_at IS NULL
     AND c.archived_at IS NULL
    LEFT JOIN channel_humans ch
      ON ch.channel_id = c.id
     AND ch.user_id = ${userId}
    LEFT JOIN thread_follows tf
      ON tf.thread_channel_id = c.id
     AND tf.follower_type = 'user'
     AND tf.follower_id = ${userId}
     AND tf.done_at IS NULL
     AND tf.unfollowed_at IS NULL
    WHERE jcs.status = 'active'
      AND jcs.server_id = c.server_id
      AND (
        (c.type = 'joint' AND ch.user_id IS NOT NULL)
        OR (c.type = 'thread' AND tf.thread_channel_id IS NOT NULL)
      )
  `);

  return new Set((result.rows as Array<{ serverId: string }>).map((row) => row.serverId));
}

async function hasJointStorageSurfaceForUser(serverId: string, userId: string): Promise<boolean> {
  return (await getJointStorageServerIdsForUser([serverId], userId)).has(serverId);
}

function buildRisingWaveInboxItemsServingQuery(limit: number, offset: number) {
  const inboxItems = "rw_inbox_items_v1";
  // CONTRACT: RW serving must stay behavior-compatible with the inline Postgres
  // SQL in getInboxItems below. SYNC REQUIRED: any field, filter, unread-count,
  // mention, ordering, pagination, or total-count semantic changed here or in
  // the PG SQL must be mirrored in the other side and in:
  // docs/engineering/risingwave-unread-inbox-full-materialized.sql
  // Then run: pnpm --filter @slock-ai/server risingwave:verify-inbox-parity
  // PG and RW stringify timestamptz with slightly different timezone/fractional
  // formatting. Keep the shared serving query byte-comparable at the API layer.
  const timestampText = (expr: string) => `to_char((${expr}) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || '+00'`;

  return `
    WITH filtered AS (
      SELECT
        i.kind AS "kind",
        i.channel_id AS "channelId",
        i.channel_name AS "channelName",
        i.channel_type AS "channelType",
        i.last_message_id AS "lastMessageId",
        i.first_unread_message_id AS "firstUnreadMessageId",
        i.last_message_at AS "lastMessageAtRaw",
        i.last_message_preview AS "lastMessagePreview",
        i.last_message_sender_type AS "lastMessageSenderType",
        i.last_message_sender_id AS "lastMessageSenderId",
        NULL::text AS "lastMessageSenderName",
        i.unread_count::int AS "unreadCount",
        i.thread_channel_id AS "threadChannelId",
        i.parent_message_id AS "parentMessageId",
        i.parent_channel_id AS "parentChannelId",
        i.parent_channel_name AS "parentChannelName",
        i.parent_channel_type AS "parentChannelType",
        i.parent_message_preview AS "parentMessagePreview",
        i.parent_message_sender_type AS "parentMessageSenderType",
        i.parent_message_sender_id AS "parentMessageSenderId",
        i.latest_activity_preview AS "latestActivityPreview",
        i.latest_activity_sender_type AS "latestActivitySenderType",
        i.latest_activity_sender_id AS "latestActivitySenderId",
        i.latest_activity_message_id AS "latestActivityMessageId",
        i.last_activity_at AS "lastActivityAtRaw",
        i.last_reply_at AS "lastReplyAtRaw",
        i.reply_count::int AS "replyCount",
        i.task_number AS "taskNumber",
        i.task_status AS "taskStatus",
        i.task_claimed_by_type AS "taskClaimedByType",
        i.task_claimed_by_id AS "taskClaimedById",
        NULL::text AS "taskClaimedByName",
        i.has_mention AS "hasMention",
        i.last_read_seq AS "lastReadSeq",
        i.activity_at AS "activityAt",
        i.has_any_mention AS "hasAnyMention"
      FROM ${inboxItems} i
      WHERE i.server_id = $1
        AND i.user_id = $2
        AND (i.kind <> 'thread' OR i.parent_channel_type <> 'joint')
        AND (i.kind = 'thread' OR i.channel_type <> 'joint')
        AND ($3::text <> 'all' OR i.kind = 'thread' OR i.channel_type IN ('channel', 'dm'))
        AND (
          $3::text = 'all'
          OR ($3::text = 'unread' AND i.unread_count > 0)
          OR ($3::text = 'mentions' AND i.has_any_mention)
        )
    ),
    totals AS (
      SELECT
        count(*)::int AS "totalCount",
        COALESCE(sum("unreadCount"), 0)::int AS "totalUnreadCount"
      FROM filtered
    ),
    page AS (
      SELECT *
      FROM filtered
      ORDER BY "activityAt" DESC NULLS LAST
      LIMIT ${limit}
      OFFSET ${offset}
    ),
    page_enriched AS (
      SELECT
        p."kind",
        p."channelId",
        p."channelName",
        p."channelType",
        p."lastMessageId"::text AS "lastMessageId",
        p."firstUnreadMessageId"::text AS "firstUnreadMessageId",
        ${timestampText('p."lastMessageAtRaw"')} AS "lastMessageAt",
        p."lastMessagePreview",
        p."lastMessageSenderType",
        p."lastMessageSenderId",
        p."lastMessageSenderName",
        p."unreadCount" AS "unreadCount",
        p."threadChannelId"::text AS "threadChannelId",
        p."parentMessageId"::text AS "parentMessageId",
        p."parentChannelId"::text AS "parentChannelId",
        p."parentChannelName",
        p."parentChannelType",
        p."parentMessagePreview",
        p."parentMessageSenderType",
        p."parentMessageSenderId",
        p."latestActivityPreview",
        p."latestActivitySenderType",
        p."latestActivitySenderId",
        p."latestActivityMessageId"::text AS "latestActivityMessageId",
        ${timestampText('p."lastActivityAtRaw"')} AS "lastActivityAt",
        CASE WHEN p."lastReplyAtRaw" IS NULL THEN NULL::text ELSE ${timestampText('p."lastReplyAtRaw"')} END AS "lastReplyAt",
        p."replyCount",
        p."taskNumber",
        p."taskStatus",
        p."taskClaimedByType",
        p."taskClaimedById",
        p."taskClaimedByName",
        p."hasMention" AS "hasMention",
        p."lastReadSeq" AS "lastReadSeq",
        p."activityAt"
      FROM page p
    )
    SELECT page_enriched.*, totals."totalCount", totals."totalUnreadCount"
    FROM totals
    LEFT JOIN page_enriched ON true
    ORDER BY page_enriched."activityAt" DESC NULLS LAST
  `;
}

async function getInboxItemsFromRisingWave(
  serverId: string,
  userId: string,
  opts: {
    filter: InboxFilter;
    limit: number;
    offset: number;
    historyCutoff?: Date;
    traceQuery: DbQueryTracer;
  },
): Promise<InboxQueryResult | null> {
  const client = getRisingWavePool();
  // CONTRACT: This is the only env-gated RW Inbox backend. No-env and
  // history_cutoff traffic intentionally use the inline Postgres SQL in
  // getInboxItems. SYNC REQUIRED: fallback/error behavior changes here must be
  // reflected in tracing expectations and parity verification.
  // The v1 RW MV contract covers the full retained history. Per-plan
  // history_cutoff requests and no-RW-env requests keep using legacy Postgres SQL.
  if (!client || opts.historyCutoff) return null;

  const pageLimit = Math.trunc(opts.limit + 1);
  const pageOffset = Math.trunc(opts.offset);
  // Limit/offset are clamped by getInboxItems before this point and truncated
  // again here. Keep them as SQL literals because RisingWave does not accept
  // bound parameters in LIMIT/OFFSET in this shared serving query shape.
  const result = await opts.traceQuery(
    "channels.inbox_items_by_user",
    () => client.query(buildRisingWaveInboxItemsServingQuery(pageLimit, pageOffset), [serverId, userId, opts.filter]),
    (queryResult) => ({
      ...inboxTraceAttrs("rw_mv", opts.filter, "none"),
      backend: "risingwave",
      contract_version: RISINGWAVE_UNREAD_INBOX_CONTRACT_VERSION,
      filter: opts.filter,
      limit: opts.limit,
      offset: opts.offset,
      history_cutoff_present: false,
      row_count: queryResult.rows.length,
    }),
  );
  return { rows: result.rows };
}

async function enrichInboxRowsWithProfileNames(rows: any[], traceQuery: DbQueryTracer) {
  // CONTRACT: RW intentionally does not materialize user/agent profile tables.
  // Both PG legacy rows and RW rows pass through this page-bounded enrichment
  // for lastMessageSenderName/taskClaimedByName. SYNC REQUIRED: if those fields
  // move into either backend query, update the other backend and parity script.
  if (rows.length === 0) return;
  const db = getDb();

  const senderUserIds = new Set<string>();
  const senderAgentIds = new Set<string>();
  const claimantUserIds = new Set<string>();
  const claimantAgentIds = new Set<string>();

  for (const row of rows) {
    if (!row.lastMessageSenderName && row.lastMessageSenderId) {
      if (row.lastMessageSenderType === "user" && UUID_TEXT_RE.test(row.lastMessageSenderId)) senderUserIds.add(row.lastMessageSenderId);
      if (row.lastMessageSenderType === "agent" && UUID_TEXT_RE.test(row.lastMessageSenderId)) senderAgentIds.add(row.lastMessageSenderId);
    }
    if (!row.taskClaimedByName && row.taskClaimedById) {
      if (row.taskClaimedByType === "user" && UUID_TEXT_RE.test(row.taskClaimedById)) claimantUserIds.add(row.taskClaimedById);
      if (row.taskClaimedByType === "agent" && UUID_TEXT_RE.test(row.taskClaimedById)) claimantAgentIds.add(row.taskClaimedById);
    }
  }

  const userIds = [...new Set([...senderUserIds, ...claimantUserIds])];
  const agentIds = [...new Set([...senderAgentIds, ...claimantAgentIds])];
  const userNameMap = new Map<string, string>();
  const agentNameMap = new Map<string, string>();

  if (userIds.length > 0) {
    const userRows = await traceQuery(
      "channels.inbox_profile_names.users",
      () => db
        .select({ id: users.id, name: users.name, displayName: users.displayName })
        .from(users)
        .where(inArray(users.id, userIds)),
      (result) => ({ input_count: userIds.length, result_count: result.length }),
    );
    for (const user of userRows) userNameMap.set(user.id, user.displayName || user.name);
  }

  if (agentIds.length > 0) {
    const agentRows = await traceQuery(
      "channels.inbox_profile_names.agents",
      () => db
        .select({ id: agents.id, name: agents.name, displayName: agents.displayName })
        .from(agents)
        .where(inArray(agents.id, agentIds)),
      (result) => ({ input_count: agentIds.length, result_count: result.length }),
    );
    for (const agent of agentRows) agentNameMap.set(agent.id, agent.displayName || agent.name);
  }

  for (const row of rows) {
    if (!row.lastMessageSenderName && row.lastMessageSenderId) {
      if (row.lastMessageSenderType === "user") row.lastMessageSenderName = userNameMap.get(row.lastMessageSenderId) ?? null;
      if (row.lastMessageSenderType === "agent") row.lastMessageSenderName = agentNameMap.get(row.lastMessageSenderId) ?? null;
    }
    if (!row.taskClaimedByName && row.taskClaimedById) {
      if (row.taskClaimedByType === "user") row.taskClaimedByName = userNameMap.get(row.taskClaimedById) ?? null;
      if (row.taskClaimedByType === "agent") row.taskClaimedByName = agentNameMap.get(row.taskClaimedById) ?? null;
    }
  }
}

async function getSidebarUnreadSummaryCountsFromRisingWave(
  servers: SidebarUnreadSummaryInput[],
  userId: string,
  traceQuery: DbQueryTracer,
): Promise<Record<string, number> | null> {
  const client = getRisingWavePool();
  // CONTRACT: rw_sidebar_unread_summary_v1 must match the inline Postgres SQL
  // in getSidebarUnreadSummaryCounts below. SYNC REQUIRED: membership,
  // channel-type, archived/deleted, history-cutoff, or count semantic changes
  // must be mirrored in docs/engineering/risingwave-unread-inbox-full-materialized.sql
  // and verified with risingwave:verify-inbox-parity.
  if (!client) return null;

  const counts: Record<string, number> = {};
  for (const server of servers) counts[server.serverId] = 0;

  const serverIds = servers.map((server) => server.serverId);
  const rows = await traceQuery(
    "servers.sidebar_unread_counts_by_user",
    () => client.query(`
      SELECT server_id::text AS "serverId", unread_count::int AS "count"
      FROM rw_sidebar_unread_summary_v1
      WHERE user_id = $1
        AND server_id = ANY($2::varchar[])
    `, [userId, serverIds]),
    (result) => ({
      ...inboxTraceAttrs("rw_mv", "sidebar_summary", "none"),
      backend: "risingwave",
      contract_version: RISINGWAVE_UNREAD_INBOX_CONTRACT_VERSION,
      servers_count: servers.length,
      servers_with_unread_count: result.rows.length,
      history_cutoff_present_count: 0,
    }),
  );

  for (const row of rows.rows as { serverId: string; count: number }[]) {
    counts[row.serverId] = row.count;
  }
  return counts;
}

async function getUnreadCountsFromRisingWave(
  serverId: string,
  userId: string,
  historyCutoff: Date | undefined,
  traceQuery: DbQueryTracer,
): Promise<Record<string, number> | null> {
  // CONTRACT: rw_channel_unread_counts_v1 is the dedicated serving MV for
  // GET /api/channels/unread. It is intentionally separate from Inbox/sidebar
  // MVs because this endpoint also includes non-joined public channel unread
  // and followed thread unread. SYNC REQUIRED: if the Postgres SQL in
  // getUnreadCounts changes membership, thread parent access, archived/deleted,
  // history-cutoff, or count semantics, update the RW MV in
  // docs/engineering/risingwave-unread-inbox-full-materialized.sql and rerun
  // risingwave:verify-inbox-parity.
  //
  // The v1 RW MV covers full retained history. Per-plan history_cutoff requests
  // use Postgres until a cutoff-aware RW contract is designed.
  if (historyCutoff) return null;

  const client = getRisingWavePool();
  if (!client) return null;

  const rows = await traceQuery(
    "channels.unread_counts_by_user",
    () => client.query(`
      SELECT channel_id AS "channelId", unread_count::int AS "count"
      FROM rw_channel_unread_counts_v1
      WHERE server_id = $1
        AND user_id = $2
      ORDER BY channel_id
    `, [serverId, userId]),
    (result) => ({
      ...inboxTraceAttrs("rw_mv", "channel_unread", "none"),
      backend: "risingwave",
      contract_version: RISINGWAVE_UNREAD_INBOX_CONTRACT_VERSION,
      unread_channels_count: result.rows.length,
      history_cutoff_present: false,
    }),
  );

  const counts: Record<string, number> = {};
  for (const row of rows.rows as { channelId: string; count: number }[]) {
    counts[row.channelId] = row.count;
  }
  return counts;
}

async function tryGetInboxItemsFromRisingWave(
  serverId: string,
  userId: string,
  opts: {
    filter: InboxFilter;
    limit: number;
    offset: number;
    historyCutoff?: Date;
    traceQuery: DbQueryTracer;
  },
): Promise<InboxQueryResult | null> {
  try {
    return await getInboxItemsFromRisingWave(serverId, userId, {
      ...opts,
    });
  } catch (error) {
    recordInboxBackendFailed("rw_mv", opts.filter, error);
    throw error;
  }
}

async function tryGetUnreadCountsFromRisingWave(
  serverId: string,
  userId: string,
  historyCutoff: Date | undefined,
  traceQuery: DbQueryTracer,
): Promise<Record<string, number> | null> {
  try {
    return await getUnreadCountsFromRisingWave(serverId, userId, historyCutoff, traceQuery);
  } catch (error) {
    recordInboxBackendFailed("rw_mv", "channel_unread", error);
    throw error;
  }
}

async function tryGetSidebarUnreadSummaryCountsFromRisingWave(
  servers: SidebarUnreadSummaryInput[],
  userId: string,
  traceQuery: DbQueryTracer,
): Promise<Record<string, number> | null> {
  try {
    return await getSidebarUnreadSummaryCountsFromRisingWave(servers, userId, traceQuery);
  } catch (error) {
    recordInboxBackendFailed("rw_mv", "sidebar_summary", error);
    throw error;
  }
}

export async function getInboxItems(
  serverId: string,
  userId: string,
  opts: { filter?: InboxFilter; limit?: number; offset?: number; historyCutoff?: Date; traceQuery?: DbQueryTracer } = {},
): Promise<{ items: InboxItem[]; hasMore: boolean; totalCount: number; totalUnreadCount: number }> {
  const db = getDb();
  const filter = opts.filter ?? "all";
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);
  const historyCutoff = opts.historyCutoff;
  const messageCutoff = historyCutoff ? sql` AND m.created_at > ${historyCutoff}` : sql``;
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const legacyFallbackReason = getLegacyInboxFallbackReason(historyCutoff);

  // Default production path remains the legacy inline Postgres SQL unless the
  // RisingWave env var is explicitly configured. Do not route no-env traffic
  // through the PG logical views: their CTE/UNION shape can block predicate
  // pushdown and make light users slow.
  const risingWaveResult = await tryGetInboxItemsFromRisingWave(serverId, userId, {
    filter,
    limit,
    offset,
    historyCutoff,
    traceQuery,
  });
  const selection: InboxBackendSelection = risingWaveResult
    ? { backend: "rw_mv", fallbackReason: "none" }
    : { backend: "pg_legacy", fallbackReason: legacyFallbackReason };

  const result = risingWaveResult ?? (filter === "all"
    ? await traceQuery("channels.inbox_items_by_user", () => db.execute(sql`
    -- Canonical no-env Inbox behavior lives in this inline Postgres SQL.
    -- If you change selected fields, filters, unread/mention semantics,
    -- ordering, pagination, or totals here, update rw_inbox_items_v1 in
    -- docs/engineering/risingwave-unread-inbox-full-materialized.sql and rerun
    -- pnpm --filter @slock-ai/server risingwave:verify-inbox-parity.
    WITH eligible_chats AS (
      SELECT
        c.id,
        c.name,
        c.type,
        COALESCE(joint_storage.canonical_channel_id, c.id) AS storage_channel_id,
        COALESCE(rc.last_read_seq, 0) AS last_read_seq
      FROM channels c
      INNER JOIN channel_humans ch
        ON ch.channel_id = c.id
       AND ch.user_id = ${userId}
      LEFT JOIN joint_channel_servers joint_projection
        ON joint_projection.local_channel_id = c.id
       AND joint_projection.server_id = c.server_id
       AND joint_projection.status = 'active'
      LEFT JOIN joint_channels joint_storage
        ON joint_storage.id = joint_projection.joint_channel_id
       AND joint_storage.status = 'active'
      LEFT JOIN user_channel_read_cursors rc
        ON rc.channel_id = c.id
       AND rc.user_id = ${userId}
      LEFT JOIN user_channel_inbox_states inbox
        ON inbox.channel_id = c.id
       AND inbox.user_id = ${userId}
      WHERE c.server_id = ${serverId}
        AND c.type IN ('channel', 'dm')
        AND c.deleted_at IS NULL
        AND c.archived_at IS NULL
        AND inbox.done_at IS NULL
    ),
    followed_threads AS (
      SELECT
        t.id AS source_channel_id,
        t.id AS storage_channel_id,
        t.parent_message_id AS parent_message_id,
        pm.channel_id AS parent_channel_id,
        parent_ch.name AS parent_channel_name,
        parent_ch.type::text AS parent_channel_type,
        pm.content AS parent_message_preview,
        pm.sender_type AS parent_message_sender_type,
        pm.sender_id AS parent_message_sender_id,
        pm.created_at AS parent_message_created_at,
        COALESCE(rc.last_read_seq, 0) AS last_read_seq
      FROM thread_follows tf
      INNER JOIN channels t
        ON t.id = tf.thread_channel_id
       AND t.type = 'thread'
       AND t.server_id = ${serverId}
       AND t.deleted_at IS NULL
      INNER JOIN messages pm
        ON pm.id = t.parent_message_id
      INNER JOIN channels parent_ch
        ON parent_ch.id = pm.channel_id
       AND parent_ch.archived_at IS NULL
      LEFT JOIN user_channel_read_cursors rc
        ON rc.channel_id = t.id
       AND rc.user_id = ${userId}
        WHERE tf.follower_type = 'user'
          AND tf.follower_id = ${userId}
          AND tf.done_at IS NULL
          AND tf.unfollowed_at IS NULL
    ),
    activity AS MATERIALIZED (
      SELECT
        CASE WHEN c.type = 'dm' THEN 'dm' ELSE 'channel' END AS "kind",
        c.id AS "sourceChannelId",
        c.storage_channel_id AS "storageChannelId",
        c.name AS "channelName",
        c.type::text AS "channelType",
        NULL::uuid AS "parentMessageId",
        NULL::uuid AS "parentChannelId",
        NULL::text AS "parentChannelName",
        NULL::text AS "parentChannelType",
        NULL::text AS "parentMessagePreview",
        NULL::text AS "parentMessageSenderType",
        NULL::text AS "parentMessageSenderId",
        NULL::timestamptz AS "parentMessageCreatedAt",
        c.last_read_seq AS "lastReadSeq",
        lm.created_at AS "activityAt"
      FROM eligible_chats c
      INNER JOIN LATERAL (
        SELECT m.created_at
        FROM messages m
        WHERE m.channel_id = c.storage_channel_id
          ${messageCutoff}
        ORDER BY m.seq DESC
        LIMIT 1
      ) lm ON true
      UNION ALL
      SELECT
        'thread' AS "kind",
        t.source_channel_id AS "sourceChannelId",
        t.storage_channel_id AS "storageChannelId",
        NULL::text AS "channelName",
        NULL::text AS "channelType",
        t.parent_message_id AS "parentMessageId",
        t.parent_channel_id AS "parentChannelId",
        t.parent_channel_name AS "parentChannelName",
        t.parent_channel_type AS "parentChannelType",
        t.parent_message_preview AS "parentMessagePreview",
        t.parent_message_sender_type AS "parentMessageSenderType",
        t.parent_message_sender_id AS "parentMessageSenderId",
        t.parent_message_created_at AS "parentMessageCreatedAt",
        t.last_read_seq AS "lastReadSeq",
        COALESCE(latest_reply.created_at, t.parent_message_created_at) AS "activityAt"
      FROM followed_threads t
      LEFT JOIN LATERAL (
        SELECT m.created_at
        FROM messages m
        WHERE m.channel_id = t.storage_channel_id
          ${messageCutoff}
        ORDER BY m.seq DESC
        LIMIT 1
      ) latest_reply ON true
    ),
    totals AS (
      SELECT count(*)::int AS "totalCount"
      FROM activity
    ),
    unread_totals AS (
      SELECT count(m.id)::int AS "totalUnreadCount"
      FROM activity a
      INNER JOIN messages m
        ON m.channel_id = a."storageChannelId"
       AND m.seq > a."lastReadSeq"
       ${messageCutoff}
    ),
    page AS (
      SELECT *
      FROM activity
      ORDER BY "activityAt" DESC
      LIMIT ${limit + 1}
      OFFSET ${offset}
    ),
    page_enriched AS (
      SELECT
        p."kind",
        CASE WHEN p."kind" = 'thread' THEN NULL::text ELSE p."sourceChannelId"::text END AS "channelId",
        p."channelName",
        p."channelType",
        latest_message.id::text AS "lastMessageId",
        first_unread.id::text AS "firstUnreadMessageId",
        to_char((latest_message.created_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || '+00' AS "lastMessageAt",
        latest_message.content AS "lastMessagePreview",
        latest_message.sender_type AS "lastMessageSenderType",
        latest_message.sender_id AS "lastMessageSenderId",
        COALESCE(su.display_name, su.name, sa.display_name, sa.name) AS "lastMessageSenderName",
        COALESCE(unread.unread_count, 0)::int AS "unreadCount",
        CASE WHEN p."kind" = 'thread' THEN p."sourceChannelId"::text ELSE NULL::text END AS "threadChannelId",
        p."parentMessageId"::text AS "parentMessageId",
        p."parentChannelId"::text AS "parentChannelId",
        p."parentChannelName",
        p."parentChannelType",
        p."parentMessagePreview",
        p."parentMessageSenderType",
        p."parentMessageSenderId",
        COALESCE(latest_message.content, p."parentMessagePreview") AS "latestActivityPreview",
        COALESCE(latest_message.sender_type, p."parentMessageSenderType") AS "latestActivitySenderType",
        COALESCE(latest_message.sender_id, p."parentMessageSenderId") AS "latestActivitySenderId",
        COALESCE(latest_message.id, p."parentMessageId")::text AS "latestActivityMessageId",
        to_char((COALESCE(latest_message.created_at, p."parentMessageCreatedAt")) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || '+00' AS "lastActivityAt",
        CASE WHEN p."kind" = 'thread' THEN to_char((latest_message.created_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || '+00' ELSE NULL::text END AS "lastReplyAt",
        CASE WHEN p."kind" = 'thread' THEN COALESCE(reply_count.reply_count, 0)::int ELSE NULL::int END AS "replyCount",
        legacy_task.task_number AS "taskNumber",
        legacy_task.status AS "taskStatus",
        COALESCE(claimant_user.display_name, claimant_user.name, claimant_agent.display_name, claimant_agent.name) AS "taskClaimedByName",
        COALESCE(has_mention.found, false) AS "hasMention",
        p."activityAt"
      FROM page p
      LEFT JOIN LATERAL (
        SELECT m.id, m.content, m.sender_type, m.sender_id, m.created_at, m.seq
        FROM messages m
        WHERE m.channel_id = p."storageChannelId"
          ${messageCutoff}
        ORDER BY m.seq DESC
        LIMIT 1
      ) latest_message ON true
      LEFT JOIN LATERAL (
        SELECT m.id
        FROM messages m
        WHERE m.channel_id = p."storageChannelId"
          AND m.seq > p."lastReadSeq"
          ${messageCutoff}
        ORDER BY m.seq ASC
        LIMIT 1
      ) first_unread ON true
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS unread_count
        FROM messages m
        WHERE m.channel_id = p."storageChannelId"
          AND m.seq > p."lastReadSeq"
          ${messageCutoff}
      ) unread ON true
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS reply_count
        FROM messages m
        WHERE p."kind" = 'thread'
          AND m.channel_id = p."storageChannelId"
          ${messageCutoff}
      ) reply_count ON true
      LEFT JOIN LATERAL (
        SELECT true AS found
        FROM message_mentions mm
        WHERE mm.target_type = 'user'
          AND mm.target_id = ${userId}::uuid
          AND (
            mm.channel_id = p."sourceChannelId"
            OR EXISTS (
              SELECT 1
              FROM joint_channel_servers base_projection
              INNER JOIN joint_channel_servers sibling_projection
                ON sibling_projection.joint_channel_id = base_projection.joint_channel_id
               AND sibling_projection.status = 'active'
              WHERE base_projection.local_channel_id = p."sourceChannelId"
                AND base_projection.status = 'active'
                AND sibling_projection.local_channel_id = mm.channel_id
            )
          )
          AND mm.message_seq > p."lastReadSeq"
        LIMIT 1
      ) has_mention ON true
      LEFT JOIN tasks legacy_task
        ON legacy_task.message_id = p."parentMessageId"
      LEFT JOIN agents claimant_agent
        ON legacy_task.claimed_by_type = 'agent'
       AND claimant_agent.id::text = legacy_task.claimed_by_id
      LEFT JOIN users claimant_user
        ON legacy_task.claimed_by_type = 'user'
       AND claimant_user.id::text = legacy_task.claimed_by_id
      LEFT JOIN users su
        ON latest_message.sender_type = 'user'
       AND su.id::text = latest_message.sender_id
      LEFT JOIN agents sa
        ON latest_message.sender_type = 'agent'
       AND sa.id::text = latest_message.sender_id
    )
    SELECT page_enriched.*, totals."totalCount", unread_totals."totalUnreadCount"
    FROM totals
    CROSS JOIN unread_totals
    LEFT JOIN page_enriched ON true
    ORDER BY page_enriched."activityAt" DESC NULLS LAST
  `), (queryResult) => ({
    ...inboxTraceAttrs("pg_legacy", filter, legacyFallbackReason),
    filter,
    limit,
    offset,
    history_cutoff_present: Boolean(historyCutoff),
    row_count: queryResult.rows.length,
  }))
    : await traceQuery("channels.inbox_items_by_user", () => db.execute(sql`
    -- Canonical no-env Inbox behavior lives in this inline Postgres SQL.
    -- If you change selected fields, filters, unread/mention semantics,
    -- ordering, pagination, or totals here, update rw_inbox_items_v1 in
    -- docs/engineering/risingwave-unread-inbox-full-materialized.sql and rerun
    -- pnpm --filter @slock-ai/server risingwave:verify-inbox-parity.
    WITH eligible_chats AS (
      SELECT
        c.id,
        c.name,
        c.type,
        COALESCE(joint_storage.canonical_channel_id, c.id) AS storage_channel_id,
        COALESCE(rc.last_read_seq, 0) AS last_read_seq
      FROM channels c
      INNER JOIN channel_humans ch
        ON ch.channel_id = c.id
       AND ch.user_id = ${userId}
      LEFT JOIN joint_channel_servers joint_projection
        ON joint_projection.local_channel_id = c.id
       AND joint_projection.server_id = c.server_id
       AND joint_projection.status = 'active'
      LEFT JOIN joint_channels joint_storage
        ON joint_storage.id = joint_projection.joint_channel_id
       AND joint_storage.status = 'active'
      LEFT JOIN user_channel_read_cursors rc
        ON rc.channel_id = c.id
       AND rc.user_id = ${userId}
      LEFT JOIN user_channel_inbox_states inbox
        ON inbox.channel_id = c.id
       AND inbox.user_id = ${userId}
      WHERE c.server_id = ${serverId}
        AND c.type IN ('channel', 'private', 'dm')
        AND c.deleted_at IS NULL
        AND c.archived_at IS NULL
        AND inbox.done_at IS NULL
    ),
    followed_threads AS (
      SELECT
        t.id AS source_channel_id,
        t.id AS storage_channel_id,
        t.parent_message_id AS parent_message_id,
        pm.channel_id AS parent_channel_id,
        parent_ch.name AS parent_channel_name,
        parent_ch.type AS parent_channel_type,
        pm.content AS parent_message_preview,
        pm.sender_type AS parent_message_sender_type,
        pm.sender_id AS parent_message_sender_id,
        pm.created_at AS parent_message_created_at,
        legacy_task.task_number AS task_number,
        legacy_task.status AS task_status,
        legacy_task.claimed_by_type AS task_claimed_by_type,
        legacy_task.claimed_by_id AS task_claimed_by_id
      FROM thread_follows tf
      INNER JOIN channels t
        ON t.id = tf.thread_channel_id
       AND t.type = 'thread'
       AND t.server_id = ${serverId}
       AND t.deleted_at IS NULL
      INNER JOIN messages pm
        ON pm.id = t.parent_message_id
      INNER JOIN channels parent_ch
        ON parent_ch.id = pm.channel_id
       AND parent_ch.archived_at IS NULL
      LEFT JOIN channel_humans parent_member
        ON parent_member.channel_id = parent_ch.id
       AND parent_member.user_id = ${userId}
      LEFT JOIN tasks legacy_task
        ON legacy_task.message_id = pm.id
      WHERE tf.follower_type = 'user'
        AND tf.follower_id = ${userId}
        AND tf.done_at IS NULL
        AND tf.unfollowed_at IS NULL
        AND (parent_ch.type = 'channel' OR parent_member.user_id IS NOT NULL)
    ),
    chat_items AS (
      SELECT
        CASE WHEN c.type = 'dm' THEN 'dm' ELSE 'channel' END AS "kind",
        c.id::text AS "channelId",
        c.name AS "channelName",
        c.type::text AS "channelType",
        lm.id::text AS "lastMessageId",
        first_unread.id::text AS "firstUnreadMessageId",
        to_char((lm.created_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || '+00' AS "lastMessageAt",
        lm.content AS "lastMessagePreview",
        lm.sender_type AS "lastMessageSenderType",
        lm.sender_id AS "lastMessageSenderId",
        COALESCE(su.display_name, su.name, sa.display_name, sa.name) AS "lastMessageSenderName",
        COALESCE(unread.unread_count, 0)::int AS "unreadCount",
        NULL::text AS "threadChannelId",
        NULL::text AS "parentMessageId",
        NULL::text AS "parentChannelId",
        NULL::text AS "parentChannelName",
        NULL::text AS "parentChannelType",
        NULL::text AS "parentMessagePreview",
        NULL::text AS "parentMessageSenderType",
        NULL::text AS "parentMessageSenderId",
        NULL::text AS "latestActivityPreview",
        NULL::text AS "latestActivitySenderType",
        NULL::text AS "latestActivitySenderId",
        NULL::text AS "latestActivityMessageId",
        NULL::text AS "lastActivityAt",
        NULL::text AS "lastReplyAt",
        NULL::int AS "replyCount",
        NULL::int AS "taskNumber",
        NULL::text AS "taskStatus",
        NULL::text AS "taskClaimedByName",
        COALESCE(has_mention.found, false) AS "hasMention",
        c.id::text AS "mentionSourceChannelId",
        lm.created_at AS "activityAt"
      FROM eligible_chats c
      INNER JOIN LATERAL (
        SELECT m.id, m.content, m.sender_type, m.sender_id, m.created_at, m.seq
        FROM messages m
        WHERE m.channel_id = c.storage_channel_id
          ${messageCutoff}
        ORDER BY m.seq DESC
        LIMIT 1
      ) lm ON true
      LEFT JOIN LATERAL (
        SELECT m.id
        FROM messages m
        WHERE m.channel_id = c.storage_channel_id
          AND m.seq > c.last_read_seq
          ${messageCutoff}
        ORDER BY m.seq ASC
        LIMIT 1
      ) first_unread ON true
      LEFT JOIN LATERAL (
        SELECT count(*)::int AS unread_count
        FROM messages m
        WHERE m.channel_id = c.storage_channel_id
          AND m.seq > c.last_read_seq
          ${messageCutoff}
      ) unread ON true
      LEFT JOIN LATERAL (
        SELECT true AS found
        FROM message_mentions mm
        WHERE mm.target_type = 'user'
          AND mm.target_id = ${userId}::uuid
          AND mm.channel_id = c.id
          AND mm.message_seq > c.last_read_seq
        LIMIT 1
      ) has_mention ON true
      LEFT JOIN users su
        ON lm.sender_type = 'user'
       AND su.id::text = lm.sender_id
      LEFT JOIN agents sa
        ON lm.sender_type = 'agent'
       AND sa.id::text = lm.sender_id
    ),
    thread_items AS (
      SELECT
        'thread' AS "kind",
        NULL::text AS "channelId",
        NULL::text AS "channelName",
        NULL::text AS "channelType",
        NULL::text AS "lastMessageId",
        stats.first_unread_message_id::text AS "firstUnreadMessageId",
        NULL::text AS "lastMessageAt",
        NULL::text AS "lastMessagePreview",
        NULL::text AS "lastMessageSenderType",
        NULL::text AS "lastMessageSenderId",
        NULL::text AS "lastMessageSenderName",
        COALESCE(stats.unread_count, 0)::int AS "unreadCount",
        t.source_channel_id::text AS "threadChannelId",
        t.parent_message_id::text AS "parentMessageId",
        t.parent_channel_id::text AS "parentChannelId",
        t.parent_channel_name AS "parentChannelName",
        t.parent_channel_type AS "parentChannelType",
        t.parent_message_preview AS "parentMessagePreview",
        t.parent_message_sender_type AS "parentMessageSenderType",
        t.parent_message_sender_id AS "parentMessageSenderId",
        COALESCE(stats.latest_preview, t.parent_message_preview) AS "latestActivityPreview",
        COALESCE(stats.latest_sender_type, t.parent_message_sender_type) AS "latestActivitySenderType",
        COALESCE(stats.latest_sender_id, t.parent_message_sender_id) AS "latestActivitySenderId",
        COALESCE(stats.latest_message_id, t.parent_message_id)::text AS "latestActivityMessageId",
        to_char((COALESCE(stats.last_reply_at, t.parent_message_created_at)) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || '+00' AS "lastActivityAt",
        CASE WHEN stats.last_reply_at IS NULL THEN NULL::text ELSE to_char((stats.last_reply_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || '+00' END AS "lastReplyAt",
        COALESCE(stats.reply_count, 0)::int AS "replyCount",
        t.task_number AS "taskNumber",
        t.task_status AS "taskStatus",
        COALESCE(claimant_user.display_name, claimant_user.name, claimant_agent.display_name, claimant_agent.name) AS "taskClaimedByName",
        COALESCE(has_mention.found, false) AS "hasMention",
        t.source_channel_id::text AS "mentionSourceChannelId",
        COALESCE(stats.last_reply_at, t.parent_message_created_at) AS "activityAt"
      FROM followed_threads t
      LEFT JOIN user_channel_read_cursors rc
        ON rc.channel_id = t.source_channel_id
       AND rc.user_id = ${userId}
      LEFT JOIN LATERAL (
        SELECT
          count(*)::int AS reply_count,
          max(m.created_at) AS last_reply_at,
          (array_agg(m.id ORDER BY m.seq DESC))[1] AS latest_message_id,
          (array_agg(m.content ORDER BY m.seq DESC))[1] AS latest_preview,
          (array_agg(m.sender_type ORDER BY m.seq DESC))[1] AS latest_sender_type,
          (array_agg(m.sender_id ORDER BY m.seq DESC))[1] AS latest_sender_id,
          (array_agg(m.id ORDER BY m.seq ASC) FILTER (WHERE m.seq > COALESCE(rc.last_read_seq, 0)))[1] AS first_unread_message_id,
          count(*) FILTER (WHERE m.seq > COALESCE(rc.last_read_seq, 0))::int AS unread_count
        FROM messages m
        WHERE m.channel_id = t.storage_channel_id
          ${messageCutoff}
      ) stats ON true
      LEFT JOIN LATERAL (
        SELECT true AS found
        FROM message_mentions mm
        WHERE mm.target_type = 'user'
          AND mm.target_id = ${userId}::uuid
          AND (
            mm.channel_id = t.source_channel_id
            OR EXISTS (
              SELECT 1
              FROM joint_channel_servers base_projection
              INNER JOIN joint_channel_servers sibling_projection
                ON sibling_projection.joint_channel_id = base_projection.joint_channel_id
               AND sibling_projection.status = 'active'
              WHERE base_projection.local_channel_id = t.source_channel_id
                AND base_projection.status = 'active'
                AND sibling_projection.local_channel_id = mm.channel_id
            )
          )
          AND mm.message_seq > COALESCE(rc.last_read_seq, 0)
        LIMIT 1
      ) has_mention ON true
      LEFT JOIN agents claimant_agent
        ON t.task_claimed_by_type = 'agent'
       AND claimant_agent.id::text = t.task_claimed_by_id
      LEFT JOIN users claimant_user
        ON t.task_claimed_by_type = 'user'
       AND claimant_user.id::text = t.task_claimed_by_id
    ),
    combined AS (
      SELECT * FROM chat_items
      UNION ALL
      SELECT * FROM thread_items
    ),
    filtered AS (
      -- Filter semantics:
      --   all      → every active inbox item (done_at IS NULL is enforced upstream
      --              via eligible_chats / thread_follows joins above).
      --   unread   → only items with unread messages.
      --   mentions → only items where the user has been @-mentioned in this
      --              channel/thread, regardless of read state. Plan A from
      --              #proj-uiux:6beb878c msg=691ade99 ("aggregated by
      --              thread/channel, includes read mentions").
      --
      -- The existing per-row "hasMention" column is unread-scoped (used by the
      -- frontend @ badge — only shows when there's an unread mention). The
      -- mentions filter intentionally does NOT reuse that column: it runs an
      -- independent EXISTS against message_mentions so reading a mentioned
      -- message does not drop the row from the Mentions tab.
      SELECT *
      FROM combined
      WHERE ${filter} = 'all'
        OR (${filter} = 'unread' AND "unreadCount" > 0)
        OR (${filter} = 'mentions' AND EXISTS (
          SELECT 1 FROM message_mentions mm
          WHERE mm.target_type = 'user'
            AND mm.target_id = ${userId}::uuid
            AND (
              mm.channel_id::text = combined."mentionSourceChannelId"
              OR EXISTS (
                SELECT 1
                FROM joint_channel_servers base_projection
                INNER JOIN joint_channel_servers sibling_projection
                  ON sibling_projection.joint_channel_id = base_projection.joint_channel_id
                 AND sibling_projection.status = 'active'
                WHERE base_projection.local_channel_id::text = combined."mentionSourceChannelId"
                  AND base_projection.status = 'active'
                  AND sibling_projection.local_channel_id = mm.channel_id
              )
            )
        ))
    ),
    totals AS (
      SELECT
        count(*)::int AS "totalCount",
        COALESCE(sum("unreadCount"), 0)::int AS "totalUnreadCount"
      FROM filtered
    ),
    page AS (
      SELECT *
      FROM filtered
      ORDER BY "activityAt" DESC
      LIMIT ${limit + 1}
      OFFSET ${offset}
    )
    SELECT page.*, totals."totalCount", totals."totalUnreadCount"
    FROM totals
    LEFT JOIN page ON true
    ORDER BY page."activityAt" DESC NULLS LAST
  `), (queryResult) => ({
    ...inboxTraceAttrs("pg_legacy", filter, legacyFallbackReason),
    filter,
    limit,
    offset,
    history_cutoff_present: Boolean(historyCutoff),
    row_count: queryResult.rows.length,
  })));

  const rawRows = result.rows as any[];
  const rows = rawRows.filter((row) => row.kind != null);
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const totalCount = rawRows[0]?.totalCount ?? 0;
  const totalUnreadCount = rawRows[0]?.totalUnreadCount ?? 0;

  await enrichInboxRowsWithProfileNames(pageRows, traceQuery);
  recordInboxBackendSelected(selection.backend, filter, selection.fallbackReason);

  const items: InboxItem[] = pageRows.map((row) => {
    if (row.kind === "thread") {
      const parentMessagePreview = row.parentMessagePreview ?? "";
      const latestActivityPreview = row.latestActivityPreview ?? parentMessagePreview;
      return {
        kind: "thread",
        threadChannelId: row.threadChannelId,
        parentMessageId: row.parentMessageId,
        parentChannelId: row.parentChannelId,
        parentChannelName: row.parentChannelName,
        parentChannelType: row.parentChannelType,
        parentMessagePreview: parentMessagePreview.length > 100
          ? parentMessagePreview.slice(0, 100) + "…"
          : parentMessagePreview,
        parentMessageSenderType: row.parentMessageSenderType,
        parentMessageSenderId: row.parentMessageSenderId,
        latestActivityPreview: latestActivityPreview.length > 140
          ? latestActivityPreview.slice(0, 140) + "…"
          : latestActivityPreview,
        latestActivitySenderType: row.latestActivitySenderType,
        latestActivitySenderId: row.latestActivitySenderId,
        latestActivityMessageId: row.latestActivityMessageId,
        firstUnreadMessageId: row.firstUnreadMessageId ?? null,
        lastActivityAt: row.lastActivityAt,
        lastReplyAt: row.lastReplyAt ?? null,
        replyCount: row.replyCount ?? 0,
        unreadCount: row.unreadCount ?? 0,
        hasMention: row.hasMention === true,
        taskNumber: row.taskNumber ?? null,
        taskStatus: row.taskStatus ?? null,
        taskClaimedByName: row.taskClaimedByName ?? null,
      };
    }

    const preview = row.lastMessagePreview ?? "";
    return {
      kind: row.kind,
      channelId: row.channelId,
      channelName: row.channelName,
      channelType: row.channelType,
      lastMessageId: row.lastMessageId,
      firstUnreadMessageId: row.firstUnreadMessageId ?? null,
      lastMessageAt: row.lastMessageAt,
      lastMessagePreview: preview.length > 140
        ? preview.slice(0, 140) + "…"
        : preview,
      lastMessageSenderType: row.lastMessageSenderType,
      lastMessageSenderId: row.lastMessageSenderId,
      lastMessageSenderName: row.lastMessageSenderName ?? null,
      unreadCount: row.unreadCount ?? 0,
      hasMention: row.hasMention === true,
    };
  });

  return {
    items,
    hasMore,
    totalCount,
    totalUnreadCount,
  };
}

export async function markChannelInboxDone(userId: string, channelId: string) {
  const db = getDb();
  await db.insert(userChannelInboxStates)
    .values({ userId, channelId, doneAt: new Date(), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [userChannelInboxStates.userId, userChannelInboxStates.channelId],
      set: { doneAt: new Date(), updatedAt: new Date() },
    });
  await markReadLatest(userId, channelId);
}

/** Mark every active Inbox row read, including rows not loaded by the current page. */
export async function markInboxReadLatest(serverId: string, userId: string): Promise<number> {
  const db = getDb();
  const result = await db.execute(sql`
    WITH inbox_channels AS (
      SELECT c.id AS channel_id, max(m.seq)::int AS latest_seq
      FROM channels c
      LEFT JOIN joint_channel_servers joint_projection
        ON joint_projection.local_channel_id = c.id
       AND joint_projection.server_id = c.server_id
       AND joint_projection.status = 'active'
      LEFT JOIN joint_channels joint_storage
        ON joint_storage.id = joint_projection.joint_channel_id
       AND joint_storage.status = 'active'
      INNER JOIN messages m ON m.channel_id = COALESCE(joint_storage.canonical_channel_id, c.id)
      LEFT JOIN user_channel_inbox_states inbox
        ON inbox.channel_id = c.id AND inbox.user_id = ${userId}
      WHERE c.server_id = ${serverId}
        AND c.type IN ('channel', 'private', 'dm')
        AND c.deleted_at IS NULL
        AND c.archived_at IS NULL
        AND inbox.done_at IS NULL
        AND EXISTS (
          SELECT 1 FROM channel_humans ch
          WHERE ch.channel_id = c.id AND ch.user_id = ${userId}
        )
      GROUP BY c.id
    ),
    inbox_threads AS (
      SELECT c.id AS channel_id, max(m.seq)::int AS latest_seq
      FROM thread_follows tf
      INNER JOIN channels c
        ON c.id = tf.thread_channel_id
        AND c.server_id = ${serverId}
        AND c.type = 'thread'
        AND c.deleted_at IS NULL
      INNER JOIN messages pm ON pm.id = c.parent_message_id
      INNER JOIN channels parent_ch
        ON parent_ch.id = pm.channel_id
        AND parent_ch.archived_at IS NULL
      LEFT JOIN channel_humans parent_member
        ON parent_member.channel_id = parent_ch.id
       AND parent_member.user_id = ${userId}
      INNER JOIN messages m ON m.channel_id = c.id
      WHERE tf.follower_type = 'user'
        AND tf.follower_id = ${userId}
        AND tf.done_at IS NULL
        AND tf.unfollowed_at IS NULL
        AND (parent_ch.type = 'channel' OR parent_member.user_id IS NOT NULL)
      GROUP BY c.id
    ),
    readable AS (
      SELECT channel_id, latest_seq FROM inbox_channels WHERE latest_seq > 0
      UNION ALL
      SELECT channel_id, latest_seq FROM inbox_threads WHERE latest_seq > 0
    ),
    upserted AS (
      INSERT INTO user_channel_read_cursors (user_id, channel_id, last_read_seq, updated_at)
      SELECT ${userId}, channel_id, latest_seq, now()
      FROM readable
      ON CONFLICT (user_id, channel_id) DO UPDATE SET
        last_read_seq = GREATEST(user_channel_read_cursors.last_read_seq, EXCLUDED.last_read_seq),
        updated_at = now()
      RETURNING channel_id
    )
    SELECT count(*)::int AS "markedCount" FROM upserted
  `);

  const [row] = result.rows as Array<{ markedCount?: number }>;
  return row?.markedCount ?? 0;
}

export type ThreadFollowReason = "replied" | "authored" | "mentioned" | "manual";

/**
 * Write thread attention state. Ordinary auto-follow callers intentionally do
 * not override an explicit human unfollow; callers must opt in when a direct
 * mention, manual follow, or self-reply should reactivate a suppressed thread.
 */
export async function recordThreadFollow(
  followerType: "user" | "agent",
  followerId: string,
  threadChannelId: string,
  parentMessageId: string,
  reason: ThreadFollowReason,
  opts: { reactivateUnfollowed?: boolean } = {},
) {
  const db = getDb();
  const reactivateUnfollowed = opts.reactivateUnfollowed ?? false;
  await db.execute(sql`
    INSERT INTO thread_follows (
      thread_channel_id,
      follower_type,
      follower_id,
      parent_message_id,
      reason,
      done_at,
      unfollowed_at
    )
    VALUES (
      ${threadChannelId}::uuid,
      ${followerType},
      ${followerId}::uuid,
      ${parentMessageId}::uuid,
      ${reason},
      NULL,
      NULL
    )
    ON CONFLICT (thread_channel_id, follower_type, follower_id) DO UPDATE
    SET
      parent_message_id = EXCLUDED.parent_message_id,
      reason = EXCLUDED.reason,
      created_at = now(),
      done_at = NULL,
      unfollowed_at = NULL
    WHERE ${reactivateUnfollowed}
       OR thread_follows.unfollowed_at IS NULL
  `);
}

/** Follow a thread manually (user). */
export async function followThread(userId: string, threadChannelId: string, parentMessageId: string) {
  await recordThreadFollow("user", userId, threadChannelId, parentMessageId, "manual", { reactivateUnfollowed: true });
  // Mark thread as read so existing messages don't appear as unread
  await markReadLatest(userId, threadChannelId);
}

/** Unfollow a thread for any supported follower type. */
export async function unfollowThreadForFollower(
  followerType: "user" | "agent",
  followerId: string,
  threadChannelId: string,
) {
  const db = getDb();
  if (followerType === "agent") {
    await db.delete(threadFollows)
      .where(and(
        eq(threadFollows.threadChannelId, threadChannelId),
        eq(threadFollows.followerType, followerType),
        eq(threadFollows.followerId, followerId),
      ));
    return;
  }

  const [thread] = await db
    .select({ parentMessageId: channels.parentMessageId })
    .from(channels)
    .where(and(eq(channels.id, threadChannelId), eq(channels.type, "thread")))
    .limit(1);
  if (!thread?.parentMessageId) return;

  await db.insert(threadFollows).values({
    threadChannelId,
    followerType,
    followerId,
    parentMessageId: thread.parentMessageId,
    reason: "manual",
    doneAt: new Date(),
    unfollowedAt: new Date(),
  }).onConflictDoUpdate({
    target: [threadFollows.threadChannelId, threadFollows.followerType, threadFollows.followerId],
    set: { reason: "manual", doneAt: new Date(), unfollowedAt: new Date() },
  });

  await markReadLatest(followerId, threadChannelId);
}

/** Unfollow a thread (user). */
export async function unfollowThread(userId: string, threadChannelId: string) {
  await unfollowThreadForFollower("user", userId, threadChannelId);
}

/** Mark a thread as done (hide from active list, auto-restores on new messages). */
export async function markThreadDone(userId: string, threadChannelId: string) {
  const db = getDb();
  await db.update(threadFollows)
    .set({ doneAt: new Date() })
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      eq(threadFollows.followerType, "user"),
      eq(threadFollows.followerId, userId),
      isNull(threadFollows.unfollowedAt),
    ));
  // Also mark as read
  await markReadLatest(userId, threadChannelId);
}

/** Un-done a thread (restore to active list). */
export async function undoneThread(userId: string, threadChannelId: string) {
  const db = getDb();
  await db.update(threadFollows)
    .set({ doneAt: null })
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      eq(threadFollows.followerType, "user"),
      eq(threadFollows.followerId, userId),
      isNull(threadFollows.unfollowedAt),
    ));
}

/** Clear doneAt for all followers of a thread (called when new message arrives). */
export async function clearThreadDoneForAll(threadChannelId: string) {
  const db = getDb();
  await db.update(threadFollows)
    .set({ doneAt: null })
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      isNotNull(threadFollows.doneAt),
      isNull(threadFollows.unfollowedAt),
    ));
}


// ── Unread tracking ──────────────────────────────────────

/** Mark a channel as read up to the given seq for a user. */
export async function markRead(userId: string, channelId: string, seq: number) {
  const db = getDb();
  await db
    .insert(userChannelReadCursors)
    .values({ userId, channelId, lastReadSeq: seq, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [userChannelReadCursors.userId, userChannelReadCursors.channelId],
      set: { lastReadSeq: sql`GREATEST(${userChannelReadCursors.lastReadSeq}, ${seq})`, updatedAt: new Date() },
    });
}

async function getMessageStorageChannelId(channelId: string): Promise<string> {
  const channel = await getChannel(channelId);
  if (!channel) return channelId;
  if (channel.type === "thread") {
    const jointThread = await getJointThreadProjectionByLocalThread(channelId, channel.serverId);
    return jointThread?.canonicalThreadChannelId ?? channelId;
  }
  if (channel.type === "joint") {
    const resolved = await resolveChannelAccess({ serverId: channel.serverId, channelId });
    return resolved?.kind === "joint" ? resolved.canonicalChannelId : channelId;
  }
  return channelId;
}

async function getLatestMessageSeq(channelId: string): Promise<number> {
  const db = getDb();
  const storageChannelId = await getMessageStorageChannelId(channelId);
  const [latest] = await db
    .select({ seq: sql<number>`MAX(${messages.seq})::int` })
    .from(messages)
    .where(eq(messages.channelId, storageChannelId));

  return latest?.seq ?? 0;
}

/** Mark a channel as fully read up to its latest message. */
export async function markReadLatest(userId: string, channelId: string): Promise<number> {
  const latestSeq = await getLatestMessageSeq(channelId);
  if (latestSeq <= 0) return 0;
  await markRead(userId, channelId, latestSeq);
  return latestSeq;
}

/** Mark a channel as unread by rewinding the read cursor to just before the latest message. */
export async function markUnread(userId: string, channelId: string): Promise<number> {
  const db = getDb();
  const latestSeq = await getLatestMessageSeq(channelId);
  if (latestSeq <= 0) return 0;

  const targetSeq = Math.max(latestSeq - 1, 0);
  await db
    .insert(userChannelReadCursors)
    .values({ userId, channelId, lastReadSeq: targetSeq, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [userChannelReadCursors.userId, userChannelReadCursors.channelId],
      set: {
        lastReadSeq: sql`LEAST(${userChannelReadCursors.lastReadSeq}, ${targetSeq})`,
        updatedAt: new Date(),
      },
    });

  return latestSeq - targetSeq;
}

/** Get unread message counts for all channels in a server for a user.
 *  Two-step approach: first identify channels with any unread via EXISTS (short-circuits),
 *  then count only in those channels. Avoids scanning messages in fully-read channels. */
export async function getUnreadCounts(
  serverId: string,
  userId: string,
  historyCutoff?: Date,
  opts?: UnreadCountOptions,
): Promise<Record<string, number>> {
  const traceQuery = opts?.traceQuery ?? untracedDbQuery;
  const jointStorageFallback = await hasJointStorageSurfaceForUser(serverId, userId);
  const risingWaveCounts = jointStorageFallback
    ? null
    : await tryGetUnreadCountsFromRisingWave(serverId, userId, historyCutoff, traceQuery);
  if (risingWaveCounts) {
    recordInboxBackendSelected("rw_mv", "channel_unread", "none");
    return risingWaveCounts;
  }

  const db = getDb();
  const cutoffCondition = historyCutoff ? sql` AND m.created_at > ${historyCutoff}` : sql``;
  const legacyFallbackReason = getLegacyInboxFallbackReason(historyCutoff);

  const rows = await traceQuery(
    "channels.unread_counts_by_user",
    () => db.execute(sql`
      -- Canonical no-env channel unread behavior lives in this inline Postgres SQL.
      -- If you change membership, thread parent access, archived/deleted,
      -- history-cutoff, or count semantics here, update rw_channel_unread_counts_v1
      -- in docs/engineering/risingwave-unread-inbox-full-materialized.sql and rerun
      -- pnpm --filter @slock-ai/server risingwave:verify-inbox-parity.
      WITH candidate_channels AS (
        SELECT
          c.id AS source_channel_id,
          COALESCE(joint_storage.canonical_channel_id, c.id) AS storage_channel_id,
          COALESCE(rc.last_read_seq, 0) AS last_read_seq
        FROM channels c
        LEFT JOIN channel_humans ch
          ON ch.channel_id = c.id AND ch.user_id = ${userId}
        LEFT JOIN joint_channel_servers joint_projection
          ON joint_projection.local_channel_id = c.id
         AND joint_projection.server_id = c.server_id
         AND joint_projection.status = 'active'
        LEFT JOIN joint_channels joint_storage
          ON joint_storage.id = joint_projection.joint_channel_id
         AND joint_storage.status = 'active'
        LEFT JOIN user_channel_read_cursors rc
          ON rc.channel_id = c.id AND rc.user_id = ${userId}
        WHERE c.server_id = ${serverId}
          AND c.deleted_at IS NULL
          AND c.archived_at IS NULL
          AND c.type != 'thread'
          -- DM/private/joint channels must be visible to the current user.
          AND (c.type NOT IN ('dm', 'private', 'joint') OR ch.user_id IS NOT NULL)
        UNION ALL
        SELECT
          c.id AS source_channel_id,
          c.id AS storage_channel_id,
          COALESCE(rc.last_read_seq, 0) AS last_read_seq
        FROM thread_follows tf
        INNER JOIN channels c
          ON c.id = tf.thread_channel_id
         AND c.type = 'thread'
         AND c.server_id = ${serverId}
         AND c.deleted_at IS NULL
        INNER JOIN messages pm
          ON pm.id = c.parent_message_id
        INNER JOIN channels pc
          ON pc.id = pm.channel_id
         AND pc.archived_at IS NULL
         AND pc.deleted_at IS NULL
        LEFT JOIN channel_humans pch
          ON pch.channel_id = pc.id AND pch.user_id = ${userId}
        LEFT JOIN user_channel_read_cursors rc
          ON rc.channel_id = c.id AND rc.user_id = ${userId}
        WHERE tf.follower_type = 'user'
          AND tf.follower_id = ${userId}
          AND tf.done_at IS NULL
          AND tf.unfollowed_at IS NULL
          AND (pc.type NOT IN ('dm', 'private', 'joint') OR pch.user_id IS NOT NULL)
        UNION ALL
        SELECT
          local_thread.id AS source_channel_id,
          canonical_thread.id AS storage_channel_id,
          COALESCE(rc.last_read_seq, 0) AS last_read_seq
        FROM thread_follows tf
        INNER JOIN channels local_thread
          ON local_thread.id = tf.thread_channel_id
         AND local_thread.type = 'thread'
         AND local_thread.server_id = ${serverId}
         AND local_thread.deleted_at IS NULL
        INNER JOIN joint_channel_servers thread_projection
          ON thread_projection.local_channel_id = local_thread.id
         AND thread_projection.server_id = ${serverId}
         AND thread_projection.status = 'active'
        INNER JOIN joint_channels thread_joint
          ON thread_joint.id = thread_projection.joint_channel_id
         AND thread_joint.status = 'active'
        INNER JOIN channels canonical_thread
          ON canonical_thread.id = thread_joint.canonical_channel_id
         AND canonical_thread.type = 'thread'
         AND canonical_thread.deleted_at IS NULL
        INNER JOIN messages parent_msg
          ON parent_msg.id = canonical_thread.parent_message_id
        INNER JOIN joint_channels parent_joint
          ON parent_joint.canonical_channel_id = parent_msg.channel_id
         AND parent_joint.status = 'active'
        INNER JOIN joint_channel_servers parent_projection
          ON parent_projection.joint_channel_id = parent_joint.id
         AND parent_projection.server_id = ${serverId}
         AND parent_projection.status = 'active'
        INNER JOIN channels local_parent
          ON local_parent.id = parent_projection.local_channel_id
         AND local_parent.type = 'joint'
         AND local_parent.archived_at IS NULL
         AND local_parent.deleted_at IS NULL
        INNER JOIN channel_humans parent_member
          ON parent_member.channel_id = local_parent.id
         AND parent_member.user_id = ${userId}
        LEFT JOIN user_channel_read_cursors rc
          ON rc.channel_id = local_thread.id AND rc.user_id = ${userId}
        WHERE tf.follower_type = 'user'
          AND tf.follower_id = ${userId}
          AND tf.done_at IS NULL
          AND tf.unfollowed_at IS NULL
      ),
      unread_channels AS (
        SELECT cc.source_channel_id, cc.storage_channel_id, cc.last_read_seq
        FROM candidate_channels cc
        WHERE EXISTS (
            SELECT 1 FROM messages m
            WHERE m.channel_id = cc.storage_channel_id
              AND m.seq > cc.last_read_seq
              ${cutoffCondition}
          )
      )
      SELECT uc.source_channel_id AS "channelId", count(*)::int AS "count"
      FROM unread_channels uc
      JOIN messages m ON m.channel_id = uc.storage_channel_id
        AND m.seq > uc.last_read_seq
        ${cutoffCondition}
      GROUP BY uc.source_channel_id
    `),
    (result) => ({
      ...inboxTraceAttrs("pg_legacy", "channel_unread", legacyFallbackReason),
      unread_channels_count: result.rows.length,
      history_cutoff_present: Boolean(historyCutoff),
    }),
  );

  const counts: Record<string, number> = {};
  for (const row of rows.rows as { channelId: string; count: number }[]) {
    counts[row.channelId] = row.count;
  }
  recordInboxBackendSelected("pg_legacy", "channel_unread", jointStorageFallback ? "joint_storage" : legacyFallbackReason);
  return counts;
}

/**
 * Count unread messages that would surface as pink unread indicators in the sidebar.
 * This includes:
 * - regular channels the user has joined
 * - DM channels the user participates in
 *
 * It excludes:
 * - non-joined regular channels (which render with the dim/grey unread treatment)
 * - thread channels (not part of the sidebar's pink unread server summary)
 */
export async function getSidebarUnreadSummaryCounts(
  servers: SidebarUnreadSummaryInput[],
  userId: string,
  opts: SidebarUnreadSummaryOptions = {},
): Promise<Record<string, number>> {
  if (servers.length === 0) return {};
  const traceQuery = opts.traceQuery ?? untracedDbQuery;

  const hasHistoryCutoff = servers.some((server) => Boolean(server.historyCutoff));
  const jointStorageServerIds = hasHistoryCutoff
    ? new Set<string>()
    : await getJointStorageServerIdsForUser(servers.map((server) => server.serverId), userId);
  if (!hasHistoryCutoff && jointStorageServerIds.size === 0) {
    const risingWaveCounts = await tryGetSidebarUnreadSummaryCountsFromRisingWave(
      servers,
      userId,
      traceQuery,
    );
    if (risingWaveCounts) {
      recordInboxBackendSelected("rw_mv", "sidebar_summary", "none");
      return risingWaveCounts;
    }
  }

  const db = getDb();
  const legacyFallbackReason = getLegacyInboxFallbackReason(servers.find((server) => server.historyCutoff)?.historyCutoff);

  const serverRows = servers.map(({ serverId, historyCutoff }) =>
    sql`(${serverId}::uuid, ${historyCutoff ?? null}::timestamp)`,
  );

  const rows = await traceQuery(
    "servers.sidebar_unread_counts_by_user",
    () => db.execute(sql`
    -- Canonical no-env sidebar unread behavior lives in this inline Postgres SQL.
    -- If you change membership, channel-type, archived/deleted, history-cutoff,
    -- or count semantics here, update rw_sidebar_unread_summary_v1 in
    -- docs/engineering/risingwave-unread-inbox-full-materialized.sql and rerun
    -- pnpm --filter @slock-ai/server risingwave:verify-inbox-parity.
    WITH selected_servers(server_id, history_cutoff) AS (
      VALUES ${sql.join(serverRows, sql`, `)}
    ),
    sidebar_unread_channels AS (
      SELECT
        c.server_id,
        c.id,
        COALESCE(joint_storage.canonical_channel_id, c.id) AS storage_channel_id,
        COALESCE(rc.last_read_seq, 0) AS last_read_seq,
        s.history_cutoff
      FROM selected_servers s
      INNER JOIN channels c ON c.server_id = s.server_id
      LEFT JOIN joint_channel_servers joint_projection
        ON joint_projection.local_channel_id = c.id
       AND joint_projection.server_id = c.server_id
       AND joint_projection.status = 'active'
      LEFT JOIN joint_channels joint_storage
        ON joint_storage.id = joint_projection.joint_channel_id
       AND joint_storage.status = 'active'
      LEFT JOIN user_channel_read_cursors rc
        ON rc.channel_id = c.id AND rc.user_id = ${userId}
      WHERE c.deleted_at IS NULL
        AND c.archived_at IS NULL
        AND c.type != 'thread'
        AND EXISTS (
          SELECT 1 FROM channel_humans ch
          WHERE ch.channel_id = c.id AND ch.user_id = ${userId}
        )
        AND EXISTS (
          SELECT 1 FROM messages m
          WHERE m.channel_id = COALESCE(joint_storage.canonical_channel_id, c.id)
            AND m.seq > COALESCE(rc.last_read_seq, 0)
            AND (s.history_cutoff IS NULL OR m.created_at > s.history_cutoff)
        )
    )
    SELECT uc.server_id::text AS "serverId", count(*)::int AS "count"
    FROM sidebar_unread_channels uc
    JOIN messages m ON m.channel_id = uc.storage_channel_id
      AND m.seq > uc.last_read_seq
      AND (uc.history_cutoff IS NULL OR m.created_at > uc.history_cutoff)
    GROUP BY uc.server_id
  `),
    (result) => ({
      ...inboxTraceAttrs("pg_legacy", "sidebar_summary", legacyFallbackReason),
      servers_count: servers.length,
      servers_with_unread_count: result.rows.length,
      history_cutoff_present_count: servers.filter((server) => Boolean(server.historyCutoff)).length,
    }),
  );

  const counts: Record<string, number> = {};
  for (const server of servers) counts[server.serverId] = 0;
  for (const row of rows.rows as { serverId: string; count: number }[]) {
    counts[row.serverId] = row.count;
  }
  recordInboxBackendSelected(
    "pg_legacy",
    "sidebar_summary",
    jointStorageServerIds.size > 0 ? "joint_storage" : legacyFallbackReason,
  );
  return counts;
}

export async function getSidebarUnreadSummaryCount(
  serverId: string,
  userId: string,
  historyCutoff?: Date,
  opts: SidebarUnreadSummaryOptions = {},
): Promise<number> {
  const counts = await getSidebarUnreadSummaryCounts([{ serverId, historyCutoff }], userId, opts);
  return counts[serverId] ?? 0;
}

// ── Agent unread tracking ────────────────────────────────

/** Get the agent's last read seq for a channel. Returns 0 if never read. */
export async function getAgentReadCursor(agentId: string, channelId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ lastReadSeq: agentChannelReadCursors.lastReadSeq })
    .from(agentChannelReadCursors)
    .where(and(
      eq(agentChannelReadCursors.agentId, agentId),
      eq(agentChannelReadCursors.channelId, channelId),
    ));
  return row?.lastReadSeq ?? 0;
}

/** Mark a channel as read up to the given seq for an agent. */
export async function markAgentRead(agentId: string, channelId: string, seq: number) {
  const db = getDb();
  await db
    .insert(agentChannelReadCursors)
    .values({ agentId, channelId, lastReadSeq: seq, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [agentChannelReadCursors.agentId, agentChannelReadCursors.channelId],
      set: { lastReadSeq: sql`GREATEST(${agentChannelReadCursors.lastReadSeq}, ${seq})`, updatedAt: new Date() },
    });
}

/** Get unread message counts for all channels an agent belongs to. Returns channelLabel → count. */
export async function getAgentUnreadCounts(agentId: string, historyCutoff?: Date): Promise<Record<string, number>> {
  const db = getDb();

  const conditions = [
    isNull(channels.deletedAt),
    gt(messages.seq, sql`COALESCE(${agentChannelReadCursors.lastReadSeq}, 0)`),
  ];
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }

  const rows = await db
    .select({
      channelId: messages.channelId,
      channelName: channels.name,
      channelType: channels.type,
      count: sql<number>`count(*)::int`,
    })
    .from(messages)
    .innerJoin(channels, eq(messages.channelId, channels.id))
    .innerJoin(channelAgents, and(
      eq(channelAgents.channelId, messages.channelId),
      eq(channelAgents.agentId, agentId),
    ))
    .leftJoin(
      agentChannelReadCursors,
      and(
        eq(agentChannelReadCursors.channelId, messages.channelId),
        eq(agentChannelReadCursors.agentId, agentId),
      ),
    )
    .where(and(...conditions))
    .groupBy(messages.channelId, channels.name, channels.type);

  // Resolve human peer names for DM channels
  const dmChannelIds = rows.filter(r => r.channelType === "dm").map(r => r.channelId);
  const dmPeerNames = new Map<string, string>();
  if (dmChannelIds.length > 0) {
    const peers = await db
      .select({
        channelId: channelHumans.channelId,
        peerName: users.name,
      })
      .from(channelHumans)
      .innerJoin(users, eq(channelHumans.userId, users.id))
      .where(inArray(channelHumans.channelId, dmChannelIds));
    for (const p of peers) {
      dmPeerNames.set(p.channelId, p.peerName);
    }
  }

  const counts: Record<string, number> = {};
  for (const row of rows) {
    let key: string;
    if (row.channelType === "dm") {
      const peerName = dmPeerNames.get(row.channelId) || row.channelName;
      key = `DM:@${peerName}`;
    } else {
      key = `#${row.channelName}`;
    }
    counts[key] = row.count;
  }
  return counts;
}
