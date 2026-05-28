import { createHash } from "crypto";
import { eq, and, asc, isNull, inArray, sql, count } from "drizzle-orm";
import { getDb, type DatabaseExecutor } from "../db/index.js";
import { servers, serverMembers, users, channels, channelHumans, messages, agents, threadFollows } from "../db/schema.js";
import { hasServerCapability, isAdminOrOwner, isOwnerRole, type ServerRole } from "@slock-ai/shared";
import { untracedDbQuery, type DbQueryTracer } from "../tracing/dbQueryTrace.js";
import * as serverAgreementService from "./serverAgreementService.js";

export interface SidebarOrderPreferences {
  channelOrder: string[];
  agentOrder: string[];
  dmOrder: string[];
  channelSortMode: "manual" | "recent" | "az";
  dmSortMode: "manual" | "recent" | "az";
  pinnedSortMode: "manual" | "recent" | "az";
  pinnedChannelIds: string[];
  pinnedAgentIds: string[];
  pinnedOrder: string[];
  hiddenDmIds: string[];
  channelPanelTabOrder: string[];
  agentPanelTabOrder: string[];
}

export interface MemberOnboardingPreferences {
  setupModalReminderOptOut: boolean;
  dismissedAddComputerStepAt: Date | null;
  dismissedCreateAgentStepAt: Date | null;
  dismissedInviteStepAt: Date | null;
  dismissedCommunityStepAt: Date | null;
  dismissedNotificationStepAt: Date | null;
  onboardingWizardCurrentStep: "add-computer" | "create-agent" | "referral-source" | "invite-teammates" | "join-community" | "enable-notifications" | "complete" | null;
  onboardingDmSentAt: Date | null;
  onboardingDmSentByAgentId: string | null;
}

export interface ServerOnboardingSettings {
  onboardingAgentId: string | null;
  agentAllChannelGreetingEnabled: boolean;
}

export interface MemberNotificationPreferences {
  serverPushMuted: boolean;
}

export interface ServerTranslationSettings {
  translationEnabled: boolean;
}

export interface ServerProfileUpdates {
  name?: string;
  hideHumansFromMembers?: boolean;
}

const SIDEBAR_SORT_MODES = new Set(["manual", "recent", "az"]);

function toSidebarSortMode(value: unknown): SidebarOrderPreferences["channelSortMode"] {
  return typeof value === "string" && SIDEBAR_SORT_MODES.has(value)
    ? (value as SidebarOrderPreferences["channelSortMode"])
    : "manual";
}

interface AddMemberOptions {
  executor?: DatabaseExecutor;
  agreementAudit?: {
    actorUserId: string;
    source: serverAgreementService.AgreementSource;
    agreementId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

export async function createServer(name: string, slug: string, ownerId: string) {
  const db = getDb();

  const [existing] = await db.select({ id: servers.id }).from(servers).where(and(eq(servers.slug, slug), isNull(servers.deletedAt)));
  if (existing) {
    throw new Error(`Server slug "${slug}" is already taken`);
  }

  return db.transaction(async (tx) => {
    const [server] = await tx.insert(servers).values({
      name,
      slug,
      ownerId,
    }).returning();

    // Add owner as server member
    await tx.insert(serverMembers).values({
      serverId: server.id,
      userId: ownerId,
      role: "owner",
    });
    await serverAgreementService.insertMembershipAgreementAudit(tx, {
      serverId: server.id,
      subjectType: "user",
      subjectId: ownerId,
      actorUserId: ownerId,
      source: "admin-add",
      agreementId: null,
      agreementVersion: null,
    });

    // Auto-create #all channel and add owner as member
    const [allChannel] = await tx.insert(channels).values({
      serverId: server.id,
      name: "all",
      description: "General channel for all members",
      type: "channel",
    }).returning();

    await tx.insert(channelHumans).values({
      channelId: allChannel.id,
      userId: ownerId,
    }).onConflictDoNothing();

    return server;
  });
}

export async function getServer(serverId: string) {
  const db = getDb();
  const [server] = await db.select().from(servers).where(and(eq(servers.id, serverId), isNull(servers.deletedAt)));
  return server || null;
}

export async function getServerBySlug(slug: string) {
  const db = getDb();
  const [server] = await db.select().from(servers).where(and(eq(servers.slug, slug), isNull(servers.deletedAt)));
  return server || null;
}

export async function getUserServers(userId: string, opts: { traceQuery?: DbQueryTracer } = {}) {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  return traceQuery(
    "servers.memberships_by_user",
    () => db
      .select({
        id: servers.id,
        name: servers.name,
        slug: servers.slug,
        ownerId: servers.ownerId,
        onboardingAgentId: servers.onboardingAgentId,
        hideHumansFromMembers: servers.hideHumansFromMembers,
        plan: servers.plan,
        planDowngradedAt: servers.planDowngradedAt,
        role: serverMembers.role,
        createdAt: servers.createdAt,
      })
      .from(serverMembers)
      .innerJoin(servers, eq(serverMembers.serverId, servers.id))
      .where(and(eq(serverMembers.userId, userId), isNull(servers.deletedAt))),
    (rows) => ({
      servers_count: rows.length,
    }),
  );
}

export async function updateServerOnboardingAgent(serverId: string, onboardingAgentId: string | null) {
  const db = getDb();
  const [updated] = await db
    .update(servers)
    .set({
      onboardingAgentId,
      updatedAt: new Date(),
    })
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)))
    .returning();
  return updated || null;
}

export async function getServerOnboardingSettings(serverId: string): Promise<ServerOnboardingSettings | null> {
  const db = getDb();
  const [server] = await db
    .select({
      onboardingAgentId: servers.onboardingAgentId,
      agentAllChannelGreetingEnabled: servers.agentAllChannelGreetingEnabled,
    })
    .from(servers)
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)));

  if (!server) return null;
  return {
    onboardingAgentId: server.onboardingAgentId ?? null,
    agentAllChannelGreetingEnabled: server.agentAllChannelGreetingEnabled !== false,
  };
}

export async function getServerTranslationSettings(serverId: string): Promise<ServerTranslationSettings | null> {
  const db = getDb();
  const [server] = await db
    .select({
      translationEnabled: servers.translationEnabled,
    })
    .from(servers)
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)));

  if (!server) return null;
  return {
    translationEnabled: server.translationEnabled === true,
  };
}

export async function updateServerTranslationSettings(
  serverId: string,
  updates: Partial<ServerTranslationSettings>,
): Promise<ServerTranslationSettings | null> {
  const db = getDb();
  const values: Partial<typeof servers.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (Object.prototype.hasOwnProperty.call(updates, "translationEnabled")) {
    values.translationEnabled = updates.translationEnabled === true;
  }

  const [updated] = await db
    .update(servers)
    .set(values)
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)))
    .returning({
      translationEnabled: servers.translationEnabled,
    });

  if (!updated) return null;
  return {
    translationEnabled: updated.translationEnabled === true,
  };
}

export async function updateServerOnboardingSettings(
  serverId: string,
  updates: Partial<ServerOnboardingSettings>,
) {
  const db = getDb();
  const values: Partial<typeof servers.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (Object.prototype.hasOwnProperty.call(updates, "onboardingAgentId")) {
    values.onboardingAgentId = updates.onboardingAgentId ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "agentAllChannelGreetingEnabled")) {
    values.agentAllChannelGreetingEnabled = updates.agentAllChannelGreetingEnabled !== false;
  }

  const [updated] = await db
    .update(servers)
    .set(values)
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)))
    .returning({
      onboardingAgentId: servers.onboardingAgentId,
      agentAllChannelGreetingEnabled: servers.agentAllChannelGreetingEnabled,
    });

  if (!updated) return null;
  return {
    onboardingAgentId: updated.onboardingAgentId ?? null,
    agentAllChannelGreetingEnabled: updated.agentAllChannelGreetingEnabled !== false,
  };
}

export async function updateServerProfile(serverId: string, updates: ServerProfileUpdates) {
  const db = getDb();
  const values: Partial<typeof servers.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (Object.prototype.hasOwnProperty.call(updates, "name")) {
    values.name = updates.name;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "hideHumansFromMembers")) {
    values.hideHumansFromMembers = updates.hideHumansFromMembers === true;
  }

  const [updated] = await db
    .update(servers)
    .set(values)
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)))
    .returning();
  return updated || null;
}

export async function getServerMembers(serverId: string, requesterId: string | null) {
  const db = getDb();
  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      displayName: users.displayName,
      description: users.description,
      avatarUrl: users.avatarUrl,
      role: serverMembers.role,
      joinedAt: serverMembers.joinedAt,
    })
    .from(serverMembers)
    .innerJoin(users, eq(serverMembers.userId, users.id))
    .where(eq(serverMembers.serverId, serverId))
    .orderBy(asc(serverMembers.joinedAt));

  const requesterRole = requesterId ? await getMemberRole(serverId, requesterId) : null;
  const canSeeAllEmails = isAdminOrOwner(requesterRole);

  return rows.map(({ email, ...rest }) => ({
    ...rest,
    email: canSeeAllEmails || (requesterId !== null && rest.userId === requesterId) ? email : null,
    gravatarHash: createHash("sha256").update(email.trim().toLowerCase()).digest("hex"),
  }));
}

export async function shouldHideHumanDirectoryFromRequester(serverId: string, requesterId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      hideHumansFromMembers: servers.hideHumansFromMembers,
      role: serverMembers.role,
    })
    .from(serverMembers)
    .innerJoin(servers, eq(serverMembers.serverId, servers.id))
    .where(and(
      eq(serverMembers.serverId, serverId),
      eq(serverMembers.userId, requesterId),
      isNull(servers.deletedAt),
    ));

  return row?.hideHumansFromMembers === true && row.role === "member";
}

export async function getServerMemberProfile(serverId: string, userId: string, requesterId: string) {
  const db = getDb();
  const [server] = await db
    .select({
      id: servers.id,
      name: servers.name,
      slug: servers.slug,
    })
    .from(servers)
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)));
  if (!server) return null;

  const [user] = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      displayName: users.displayName,
      description: users.description,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return null;

  const [membership] = await db
    .select({
      role: serverMembers.role,
      joinedAt: serverMembers.joinedAt,
    })
    .from(serverMembers)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)));

  if (!membership) {
    const [historicalMessage] = await db
      .select({ id: messages.id })
      .from(messages)
      .innerJoin(channels, eq(messages.channelId, channels.id))
      .where(
        and(
          eq(channels.serverId, serverId),
          eq(messages.senderType, "user"),
          eq(messages.senderId, userId),
        )
      )
      .limit(1);

    if (!historicalMessage) return null;
  }

  const requesterRole = await getMemberRole(serverId, requesterId);
  const canSeeEmail = isAdminOrOwner(requesterRole) || user.userId === requesterId;
  const createdAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      displayName: agents.displayName,
      avatarUrl: agents.avatarUrl,
      runtime: agents.runtime,
      status: agents.status,
    })
    .from(agents)
    .where(and(
      eq(agents.serverId, serverId),
      eq(agents.creatorType, "user"),
      eq(agents.creatorId, user.userId),
      isNull(agents.deletedAt),
    ))
    .orderBy(asc(agents.createdAt));

  return {
    userId: user.userId,
    serverId: server.id,
    serverName: server.name,
    serverSlug: server.slug,
    name: user.name,
    displayName: user.displayName,
    description: user.description,
    avatarUrl: user.avatarUrl,
    email: canSeeEmail ? user.email : null,
    gravatarHash: createHash("sha256").update(user.email.trim().toLowerCase()).digest("hex"),
    role: (membership?.role ?? null),
    joinedAt: membership?.joinedAt ?? null,
    membershipStatus: membership ? "active" as const : "removed" as const,
    createdAgents,
  };
}

export async function addMember(
  serverId: string,
  userId: string,
  role: ServerRole = "member",
  options: AddMemberOptions = {},
) {
  const run = async (db: DatabaseExecutor) => {
    const [inserted] = await db.insert(serverMembers).values({
      serverId,
      userId,
      role,
    }).onConflictDoNothing().returning({ userId: serverMembers.userId });

    if (inserted && options.agreementAudit) {
      const active = await serverAgreementService.getActiveAgreement(serverId, db);
      const expectedAgreementId = options.agreementAudit.agreementId ?? null;
      if (options.agreementAudit.source !== "admin-add") {
        if (!expectedAgreementId && active) {
          throw new serverAgreementService.AgreementRequiredError(active);
        }
        if (expectedAgreementId && active?.id !== expectedAgreementId) {
          throw new serverAgreementService.AgreementChangedError(active);
        }
      }
      await serverAgreementService.insertMembershipAgreementAudit(db, {
        serverId,
        subjectType: "user",
        subjectId: userId,
        actorUserId: options.agreementAudit.actorUserId,
        source: options.agreementAudit.source,
        agreementId: active?.id ?? null,
        agreementVersion: active?.version ?? null,
        ipAddress: options.agreementAudit.ipAddress,
        userAgent: options.agreementAudit.userAgent,
      });
    }

    // Auto-add to #all channel
    const { addHumanToAllChannel } = await import("./channelService.js");
    await addHumanToAllChannel(serverId, userId, { executor: db });

    return !!inserted;
  };

  if (options.executor) {
    return run(options.executor);
  }

  return getDb().transaction(run);
}

export async function removeMember(serverId: string, userId: string) {
  const db = getDb();
  const serverChannelIds = await db
    .select({ id: channels.id })
    .from(channels)
    .where(and(eq(channels.serverId, serverId), isNull(channels.deletedAt)));

  if (serverChannelIds.length > 0) {
    await db.execute(sql`
      DELETE FROM ${threadFollows}
      WHERE ${threadFollows.followerType} = 'user'
        AND ${threadFollows.followerId} = ${userId}
        AND EXISTS (
          SELECT 1
          FROM ${channels} thread_channels
          INNER JOIN ${messages} parent_messages
            ON parent_messages.id = thread_channels.parent_message_id
          INNER JOIN ${channels} parent_channels
            ON parent_channels.id = parent_messages.channel_id
          WHERE thread_channels.id = ${threadFollows.threadChannelId}
            AND thread_channels.type = 'thread'
            AND parent_channels.server_id = ${serverId}
        )
    `);

    await db.delete(channelHumans).where(
      and(
        eq(channelHumans.userId, userId),
        inArray(channelHumans.channelId, serverChannelIds.map((row) => row.id)),
      )
    );
  }

  await db.delete(serverMembers).where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)));
}

export async function updateMemberRole(serverId: string, userId: string, role: ServerRole) {
  const db = getDb();
  const [updated] = await db
    .update(serverMembers)
    .set({ role })
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)))
    .returning();
  return updated || null;
}

export async function countOwners(serverId: string) {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(serverMembers)
    .innerJoin(servers, eq(serverMembers.serverId, servers.id))
    .where(and(
      eq(serverMembers.serverId, serverId),
      eq(serverMembers.role, "owner"),
      isNull(servers.deletedAt),
    ));
  return Number(row?.value ?? 0);
}

export async function getMemberOnboardingPreferences(
  serverId: string,
  userId: string
): Promise<MemberOnboardingPreferences | null> {
  const db = getDb();
  const [member] = await db
    .select({
      setupModalReminderOptOut: serverMembers.setupModalReminderOptOut,
      dismissedAddComputerStepAt: serverMembers.dismissedAddComputerStepAt,
      dismissedCreateAgentStepAt: serverMembers.dismissedCreateAgentStepAt,
      dismissedInviteStepAt: serverMembers.dismissedInviteStepAt,
      dismissedCommunityStepAt: serverMembers.dismissedCommunityStepAt,
      dismissedNotificationStepAt: serverMembers.dismissedNotificationStepAt,
      onboardingWizardCurrentStep: serverMembers.onboardingWizardCurrentStep,
      onboardingDmSentAt: serverMembers.onboardingDmSentAt,
      onboardingDmSentByAgentId: serverMembers.onboardingDmSentByAgentId,
    })
    .from(serverMembers)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)));

  if (!member) return null;
  return {
    setupModalReminderOptOut: !!member.setupModalReminderOptOut,
    dismissedAddComputerStepAt: member.dismissedAddComputerStepAt ?? null,
    dismissedCreateAgentStepAt: member.dismissedCreateAgentStepAt ?? null,
    dismissedInviteStepAt: member.dismissedInviteStepAt ?? null,
    dismissedCommunityStepAt: member.dismissedCommunityStepAt ?? null,
    dismissedNotificationStepAt: member.dismissedNotificationStepAt ?? null,
    onboardingWizardCurrentStep: member.onboardingWizardCurrentStep ?? null,
    onboardingDmSentAt: member.onboardingDmSentAt ?? null,
    onboardingDmSentByAgentId: member.onboardingDmSentByAgentId ?? null,
  };
}

export async function getMemberNotificationPreferences(
  serverId: string,
  userId: string
): Promise<MemberNotificationPreferences | null> {
  const db = getDb();
  const [member] = await db
    .select({
      serverPushMuted: serverMembers.serverPushMuted,
    })
    .from(serverMembers)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)));

  if (!member) return null;
  return {
    serverPushMuted: !!member.serverPushMuted,
  };
}

export async function updateMemberNotificationPreferences(
  serverId: string,
  userId: string,
  updates: Partial<MemberNotificationPreferences>
): Promise<MemberNotificationPreferences | null> {
  const db = getDb();
  const payload: Partial<typeof serverMembers.$inferInsert> = {};

  if (updates.serverPushMuted !== undefined) {
    payload.serverPushMuted = updates.serverPushMuted;
  }

  if (Object.keys(payload).length === 0) {
    return getMemberNotificationPreferences(serverId, userId);
  }

  const [member] = await db
    .update(serverMembers)
    .set(payload)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)))
    .returning({
      serverPushMuted: serverMembers.serverPushMuted,
    });

  if (!member) return null;
  return {
    serverPushMuted: !!member.serverPushMuted,
  };
}

export async function getServerPushMutedUserIds(serverId: string, userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();

  const db = getDb();
  const rows = await db
    .select({ userId: serverMembers.userId })
    .from(serverMembers)
    .where(and(
      eq(serverMembers.serverId, serverId),
      eq(serverMembers.serverPushMuted, true),
      inArray(serverMembers.userId, userIds),
    ));

  return new Set(rows.map((row) => row.userId));
}

export async function updateMemberOnboardingPreferences(
  serverId: string,
  userId: string,
  updates: Partial<MemberOnboardingPreferences>
): Promise<MemberOnboardingPreferences | null> {
  const db = getDb();
  const payload: Partial<typeof serverMembers.$inferInsert> = {};

  if (updates.setupModalReminderOptOut !== undefined) {
    payload.setupModalReminderOptOut = updates.setupModalReminderOptOut;
  }
  if (updates.dismissedAddComputerStepAt !== undefined) {
    payload.dismissedAddComputerStepAt = updates.dismissedAddComputerStepAt;
  }
  if (updates.dismissedCreateAgentStepAt !== undefined) {
    payload.dismissedCreateAgentStepAt = updates.dismissedCreateAgentStepAt;
  }
  if (updates.dismissedInviteStepAt !== undefined) {
    payload.dismissedInviteStepAt = updates.dismissedInviteStepAt;
  }
  if (updates.dismissedCommunityStepAt !== undefined) {
    payload.dismissedCommunityStepAt = updates.dismissedCommunityStepAt;
  }
  if (updates.dismissedNotificationStepAt !== undefined) {
    payload.dismissedNotificationStepAt = updates.dismissedNotificationStepAt;
  }
  if (updates.onboardingWizardCurrentStep !== undefined) {
    payload.onboardingWizardCurrentStep = updates.onboardingWizardCurrentStep;
  }
  if (updates.onboardingDmSentAt !== undefined) {
    payload.onboardingDmSentAt = updates.onboardingDmSentAt;
  }
  if (updates.onboardingDmSentByAgentId !== undefined) {
    payload.onboardingDmSentByAgentId = updates.onboardingDmSentByAgentId;
  }

  if (Object.keys(payload).length === 0) {
    return getMemberOnboardingPreferences(serverId, userId);
  }

  const [member] = await db
    .update(serverMembers)
    .set(payload)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)))
    .returning({
      setupModalReminderOptOut: serverMembers.setupModalReminderOptOut,
      dismissedAddComputerStepAt: serverMembers.dismissedAddComputerStepAt,
      dismissedCreateAgentStepAt: serverMembers.dismissedCreateAgentStepAt,
      dismissedInviteStepAt: serverMembers.dismissedInviteStepAt,
      dismissedCommunityStepAt: serverMembers.dismissedCommunityStepAt,
      dismissedNotificationStepAt: serverMembers.dismissedNotificationStepAt,
      onboardingWizardCurrentStep: serverMembers.onboardingWizardCurrentStep,
      onboardingDmSentAt: serverMembers.onboardingDmSentAt,
      onboardingDmSentByAgentId: serverMembers.onboardingDmSentByAgentId,
    });

  if (!member) return null;
  return {
    setupModalReminderOptOut: !!member.setupModalReminderOptOut,
    dismissedAddComputerStepAt: member.dismissedAddComputerStepAt ?? null,
    dismissedCreateAgentStepAt: member.dismissedCreateAgentStepAt ?? null,
    dismissedInviteStepAt: member.dismissedInviteStepAt ?? null,
    dismissedCommunityStepAt: member.dismissedCommunityStepAt ?? null,
    dismissedNotificationStepAt: member.dismissedNotificationStepAt ?? null,
    onboardingWizardCurrentStep: member.onboardingWizardCurrentStep ?? null,
    onboardingDmSentAt: member.onboardingDmSentAt ?? null,
    onboardingDmSentByAgentId: member.onboardingDmSentByAgentId ?? null,
  };
}

export async function isMember(serverId: string, userId: string, opts: { traceQuery?: DbQueryTracer } = {}): Promise<boolean> {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const [member] = await traceQuery(
    "servers.member_by_user",
    () => db
      .select({ userId: serverMembers.userId })
      .from(serverMembers)
      .innerJoin(servers, eq(serverMembers.serverId, servers.id))
      .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId), isNull(servers.deletedAt))),
  );
  return !!member;
}

export async function getMemberRole(serverId: string, userId: string): Promise<ServerRole | null> {
  const db = getDb();
  const [member] = await db
    .select({ role: serverMembers.role })
    .from(serverMembers)
    .innerJoin(servers, eq(serverMembers.serverId, servers.id))
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId), isNull(servers.deletedAt)));
  return (member?.role as ServerRole | undefined) || null;
}

export async function userCanManageServer(serverId: string, userId: string): Promise<boolean> {
  return hasServerCapability(await getMemberRole(serverId, userId), "manageServer");
}

export async function userIsServerOwner(serverId: string, userId: string): Promise<boolean> {
  return isOwnerRole(await getMemberRole(serverId, userId));
}

export async function getMemberSidebarOrder(serverId: string, userId: string, opts: { traceQuery?: DbQueryTracer } = {}): Promise<SidebarOrderPreferences | null> {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const [member] = await traceQuery(
    "servers.sidebar_order_by_member",
    () => db
      .select({
        channelOrder: serverMembers.sidebarChannelOrder,
        agentOrder: serverMembers.sidebarAgentOrder,
        dmOrder: serverMembers.sidebarDmOrder,
        channelSortMode: serverMembers.sidebarChannelSortMode,
        dmSortMode: serverMembers.sidebarDmSortMode,
        pinnedSortMode: serverMembers.sidebarPinnedSortMode,
        pinnedChannelIds: serverMembers.pinnedChannelIds,
        pinnedAgentIds: serverMembers.pinnedAgentIds,
        pinnedOrder: serverMembers.pinnedOrder,
        hiddenDmIds: serverMembers.hiddenDmIds,
        channelPanelTabOrder: serverMembers.channelPanelTabOrder,
        agentPanelTabOrder: serverMembers.agentPanelTabOrder,
      })
      .from(serverMembers)
      .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId))),
  );

  if (!member) return null;

  const toStringArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((id): id is string => typeof id === "string") : [];

  return {
    channelOrder: toStringArray(member.channelOrder),
    agentOrder: toStringArray(member.agentOrder),
    dmOrder: toStringArray(member.dmOrder),
    channelSortMode: toSidebarSortMode(member.channelSortMode),
    dmSortMode: toSidebarSortMode(member.dmSortMode),
    pinnedSortMode: toSidebarSortMode(member.pinnedSortMode),
    pinnedChannelIds: toStringArray(member.pinnedChannelIds),
    pinnedAgentIds: toStringArray(member.pinnedAgentIds),
    pinnedOrder: toStringArray(member.pinnedOrder),
    hiddenDmIds: toStringArray(member.hiddenDmIds),
    channelPanelTabOrder: toStringArray(member.channelPanelTabOrder),
    agentPanelTabOrder: toStringArray(member.agentPanelTabOrder),
  };
}

export async function getSanitizedMemberSidebarOrder(serverId: string, userId: string, opts: { traceQuery?: DbQueryTracer } = {}): Promise<SidebarOrderPreferences | null> {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const result = await traceQuery(
    "servers.sidebar_order_by_member_sanitized",
    () => db.execute(sql`
      SELECT
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.sidebar_channel_order, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE EXISTS (
            SELECT 1
            FROM channels c
            WHERE c.id::text = e.id
              AND c.server_id = ${serverId}
              AND (
                c.type = 'channel'
                OR (
                  c.type = 'private'
                  AND EXISTS (
                    SELECT 1
                    FROM channel_humans ch
                    WHERE ch.channel_id = c.id
                      AND ch.user_id = ${userId}
                  )
                )
              )
              AND c.deleted_at IS NULL
              AND c.archived_at IS NULL
          )
        ), ARRAY[]::text[]) AS "channelOrder",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.sidebar_agent_order, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE EXISTS (
            SELECT 1
            FROM agents a
            WHERE a.id::text = e.id
              AND a.server_id = ${serverId}
              AND a.deleted_at IS NULL
          )
        ), ARRAY[]::text[]) AS "agentOrder",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.sidebar_dm_order, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE EXISTS (
            SELECT 1
            FROM channels c
            INNER JOIN channel_humans ch
              ON ch.channel_id = c.id
             AND ch.user_id = ${userId}
            WHERE c.id::text = e.id
              AND c.server_id = ${serverId}
              AND c.type = 'dm'
          )
        ), ARRAY[]::text[]) AS "dmOrder",
        COALESCE(sm.sidebar_channel_sort_mode, 'manual') AS "channelSortMode",
        COALESCE(sm.sidebar_dm_sort_mode, 'manual') AS "dmSortMode",
        COALESCE(sm.sidebar_pinned_sort_mode, 'manual') AS "pinnedSortMode",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.pinned_channel_ids, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE EXISTS (
            SELECT 1
            FROM channels c
            WHERE c.id::text = e.id
              AND c.server_id = ${serverId}
              AND (
                c.type = 'channel'
                OR (
                  c.type = 'private'
                  AND EXISTS (
                    SELECT 1
                    FROM channel_humans ch
                    WHERE ch.channel_id = c.id
                      AND ch.user_id = ${userId}
                  )
                )
              )
              AND c.deleted_at IS NULL
              AND c.archived_at IS NULL
          )
          OR EXISTS (
            SELECT 1
            FROM channels c
            INNER JOIN channel_humans ch
              ON ch.channel_id = c.id
             AND ch.user_id = ${userId}
            WHERE c.id::text = e.id
              AND c.server_id = ${serverId}
              AND c.type = 'dm'
          )
        ), ARRAY[]::text[]) AS "pinnedChannelIds",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.pinned_agent_ids, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE EXISTS (
            SELECT 1
            FROM agents a
            WHERE a.id::text = e.id
              AND a.server_id = ${serverId}
              AND a.deleted_at IS NULL
          )
        ), ARRAY[]::text[]) AS "pinnedAgentIds",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.pinned_order, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE EXISTS (
            SELECT 1
            FROM channels c
            WHERE c.id::text = e.id
              AND c.server_id = ${serverId}
              AND (
                c.type = 'channel'
                OR (
                  c.type = 'private'
                  AND EXISTS (
                    SELECT 1
                    FROM channel_humans ch
                    WHERE ch.channel_id = c.id
                      AND ch.user_id = ${userId}
                  )
                )
              )
              AND c.deleted_at IS NULL
              AND c.archived_at IS NULL
          )
          OR EXISTS (
            SELECT 1
            FROM channels c
            INNER JOIN channel_humans ch
              ON ch.channel_id = c.id
             AND ch.user_id = ${userId}
            WHERE c.id::text = e.id
              AND c.server_id = ${serverId}
              AND c.type = 'dm'
          )
          OR EXISTS (
            SELECT 1
            FROM agents a
            WHERE a.id::text = e.id
              AND a.server_id = ${serverId}
              AND a.deleted_at IS NULL
          )
        ), ARRAY[]::text[]) AS "pinnedOrder",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.hidden_dm_ids, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE EXISTS (
            SELECT 1
            FROM channels c
            INNER JOIN channel_humans ch
              ON ch.channel_id = c.id
             AND ch.user_id = ${userId}
            WHERE c.id::text = e.id
              AND c.server_id = ${serverId}
              AND c.type = 'dm'
          )
        ), ARRAY[]::text[]) AS "hiddenDmIds",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.channel_panel_tab_order, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE e.id = ANY(ARRAY['chat', 'tasks', 'files']::text[])
        ), ARRAY[]::text[]) AS "channelPanelTabOrder",
        COALESCE((
          SELECT array_agg(id ORDER BY ord)
          FROM json_array_elements_text(COALESCE(sm.agent_panel_tab_order, '[]'::json)) WITH ORDINALITY e(id, ord)
          WHERE e.id = ANY(ARRAY['profile', 'permissions', 'dms', 'reminders', 'workspace', 'activity']::text[])
        ), ARRAY[]::text[]) AS "agentPanelTabOrder"
      FROM server_members sm
      INNER JOIN servers s
        ON s.id = sm.server_id
       AND s.deleted_at IS NULL
      WHERE sm.server_id = ${serverId}
        AND sm.user_id = ${userId}
    `),
  );

  const row = result.rows[0] as unknown as SidebarOrderPreferences | undefined;
  return row ?? null;
}

export async function updateMemberSidebarOrder(
  serverId: string,
  userId: string,
  updates: Partial<SidebarOrderPreferences>,
): Promise<SidebarOrderPreferences | null> {
  const db = getDb();
  const payload: Partial<typeof serverMembers.$inferInsert> = {};

  if (updates.channelOrder !== undefined) {
    payload.sidebarChannelOrder = updates.channelOrder;
  }
  if (updates.agentOrder !== undefined) {
    payload.sidebarAgentOrder = updates.agentOrder;
  }
  if (updates.dmOrder !== undefined) {
    payload.sidebarDmOrder = updates.dmOrder;
  }
  if (updates.channelSortMode !== undefined) {
    payload.sidebarChannelSortMode = updates.channelSortMode;
  }
  if (updates.dmSortMode !== undefined) {
    payload.sidebarDmSortMode = updates.dmSortMode;
  }
  if (updates.pinnedSortMode !== undefined) {
    payload.sidebarPinnedSortMode = updates.pinnedSortMode;
  }
  if (updates.pinnedChannelIds !== undefined) {
    payload.pinnedChannelIds = updates.pinnedChannelIds;
  }
  if (updates.pinnedAgentIds !== undefined) {
    payload.pinnedAgentIds = updates.pinnedAgentIds;
  }
  if (updates.pinnedOrder !== undefined) {
    payload.pinnedOrder = updates.pinnedOrder;
  }
  if (updates.hiddenDmIds !== undefined) {
    payload.hiddenDmIds = updates.hiddenDmIds;
  }
  if (updates.channelPanelTabOrder !== undefined) {
    payload.channelPanelTabOrder = updates.channelPanelTabOrder;
  }
  if (updates.agentPanelTabOrder !== undefined) {
    payload.agentPanelTabOrder = updates.agentPanelTabOrder;
  }

  if (Object.keys(payload).length === 0) {
    return getMemberSidebarOrder(serverId, userId);
  }

  const [member] = await db
    .update(serverMembers)
    .set(payload)
    .where(and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, userId)))
    .returning({
      channelOrder: serverMembers.sidebarChannelOrder,
      agentOrder: serverMembers.sidebarAgentOrder,
      dmOrder: serverMembers.sidebarDmOrder,
      channelSortMode: serverMembers.sidebarChannelSortMode,
      dmSortMode: serverMembers.sidebarDmSortMode,
      pinnedSortMode: serverMembers.sidebarPinnedSortMode,
      pinnedChannelIds: serverMembers.pinnedChannelIds,
      pinnedAgentIds: serverMembers.pinnedAgentIds,
      pinnedOrder: serverMembers.pinnedOrder,
      hiddenDmIds: serverMembers.hiddenDmIds,
      channelPanelTabOrder: serverMembers.channelPanelTabOrder,
      agentPanelTabOrder: serverMembers.agentPanelTabOrder,
    });

  if (!member) return null;

  const toStringArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((id): id is string => typeof id === "string") : [];

  return {
    channelOrder: toStringArray(member.channelOrder),
    agentOrder: toStringArray(member.agentOrder),
    dmOrder: toStringArray(member.dmOrder),
    channelSortMode: toSidebarSortMode(member.channelSortMode),
    dmSortMode: toSidebarSortMode(member.dmSortMode),
    pinnedSortMode: toSidebarSortMode(member.pinnedSortMode),
    pinnedChannelIds: toStringArray(member.pinnedChannelIds),
    pinnedAgentIds: toStringArray(member.pinnedAgentIds),
    pinnedOrder: toStringArray(member.pinnedOrder),
    hiddenDmIds: toStringArray(member.hiddenDmIds),
    channelPanelTabOrder: toStringArray(member.channelPanelTabOrder),
    agentPanelTabOrder: toStringArray(member.agentPanelTabOrder),
  };
}

export async function listServerMemberIds(serverId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ userId: serverMembers.userId })
    .from(serverMembers)
    .innerJoin(servers, eq(serverMembers.serverId, servers.id))
    .where(and(eq(serverMembers.serverId, serverId), isNull(servers.deletedAt)));
  return rows.map((row) => row.userId);
}

export async function deleteServer(serverId: string) {
  const db = getDb();
  const [updated] = await db
    .update(servers)
    .set({ deletedAt: new Date() })
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)))
    .returning();
  if (!updated) return null;

  // Cancel Stripe subscription if any
  const { cancelSubscriptionForDeletedServer } = await import("./billingService.js");
  await cancelSubscriptionForDeletedServer(serverId);

  return updated;
}
