import { pgTable, text, timestamp, integer, bigint, bigserial, uuid, primaryKey, uniqueIndex, index, json, jsonb, boolean, customType, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { RuntimeConfig, TrajectoryEntry } from "@slock-ai/shared";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// Users — registered accounts
export const users = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  preferredLanguage: text("preferred_language"),
  preferredTimezone: text("preferred_timezone"),
  autoTranslationEnabled: boolean("auto_translation_enabled").notNull().default(true),
  preferredTranslationDisplay: text("preferred_translation_display", { enum: ["translated", "original"] }).notNull().default("translated"),
  preferredTimeFormat: text("preferred_time_format", { enum: ["12h", "24h"] }),
  preferredMessageBodyFontSize: text("preferred_message_body_font_size", { enum: ["sm", "md", "lg"] }),
  referralSource: text("referral_source"),
  referralSourceOther: text("referral_source_other"),
  referralSourceSkippedAt: timestamp("referral_source_skipped_at", { withTimezone: true }),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userAuthIdentities = pgTable("user_auth_identities", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: ["google", "github"] }).notNull(),
  providerUserId: text("provider_user_id").notNull(),
  providerEmail: text("provider_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_user_auth_identities_provider_user").on(table.provider, table.providerUserId),
  uniqueIndex("idx_user_auth_identities_user_provider").on(table.userId, table.provider),
  index("idx_user_auth_identities_user").on(table.userId),
]);

export const newsletterAudienceContacts = pgTable("newsletter_audience_contacts", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  audienceId: text("audience_id").notNull(),
  resendContactId: text("resend_contact_id"),
  status: text("status", { enum: ["synced", "sync_failed", "unsubscribed", "bounced", "complained"] }).notNull().default("synced"),
  lastSyncError: text("last_sync_error"),
  optedOutAt: timestamp("opted_out_at", { withTimezone: true }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_newsletter_contacts_audience_email").on(table.audienceId, table.email),
  index("idx_newsletter_contacts_user").on(table.userId),
  index("idx_newsletter_contacts_status").on(table.status),
]);

export const newsletterWebhookEvents = pgTable("newsletter_webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  email: text("email"),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const socialAuthCompletions = pgTable("social_auth_completions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  codeHash: text("code_hash").notNull(),
  provider: text("provider", { enum: ["google", "github"] }).notNull(),
  mode: text("mode", { enum: ["login", "link"] }).notNull(),
  intendedAction: text("intended_action", { enum: ["login", "link"] }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  providerUserId: text("provider_user_id"),
  providerEmail: text("provider_email"),
  providerDisplayName: text("provider_display_name"),
  providerAvatarUrl: text("provider_avatar_url"),
  returnTo: text("return_to"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_social_auth_completions_code_hash").on(table.codeHash),
  index("idx_social_auth_completions_expires_at").on(table.expiresAt),
]);

export const userLegalAcceptances = pgTable("user_legal_acceptances", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  termsVersion: text("terms_version").notNull(),
  privacyVersion: text("privacy_version").notNull(),
  termsUrl: text("terms_url").notNull(),
  privacyUrl: text("privacy_url").notNull(),
  source: text("source", { enum: ["signup", "oauth", "invite"] }).notNull(),
  ipHash: text("ip_hash"),
  userAgentHash: text("user_agent_hash"),
  locale: text("locale"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_user_legal_acceptances_user").on(table.userId),
  index("idx_user_legal_acceptances_source").on(table.source),
]);

// Servers — multi-tenant isolation unit
export const servers = pgTable("servers", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: uuid("owner_id").notNull().references(() => users.id),
  onboardingAgentId: uuid("onboarding_agent_id"),
  agentAllChannelGreetingEnabled: boolean("agent_all_channel_greeting_enabled").notNull().default(true),
  hideHumansFromMembers: boolean("hide_humans_from_members").notNull().default(false),
  plan: text("plan", { enum: ["free", "founder"] }).notNull().default("free"),
  translationEnabled: boolean("translation_enabled").notNull().default(false),
  planDowngradedAt: timestamp("plan_downgraded_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Server members — user ↔ server relationship
export const serverMembers = pgTable("server_members", {
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
  setupModalReminderOptOut: boolean("setup_modal_reminder_opt_out").notNull().default(false),
  dismissedAddComputerStepAt: timestamp("dismissed_add_computer_step_at", { withTimezone: true }),
  dismissedCreateAgentStepAt: timestamp("dismissed_create_agent_step_at", { withTimezone: true }),
  dismissedInviteStepAt: timestamp("dismissed_invite_step_at", { withTimezone: true }),
  dismissedCommunityStepAt: timestamp("dismissed_community_step_at", { withTimezone: true }),
  dismissedNotificationStepAt: timestamp("dismissed_notification_step_at", { withTimezone: true }),
  onboardingWizardCurrentStep: text("onboarding_wizard_current_step", {
    enum: ["add-computer", "create-agent", "referral-source", "invite-teammates", "join-community", "enable-notifications", "complete"],
  }),
  serverPushMuted: boolean("server_push_muted").notNull().default(false),
  onboardingDmSentAt: timestamp("onboarding_dm_sent_at", { withTimezone: true }),
  onboardingDmSentByAgentId: uuid("onboarding_dm_sent_by_agent_id"),
  sidebarChannelOrder: json("sidebar_channel_order").$type<string[]>(),
  sidebarAgentOrder: json("sidebar_agent_order").$type<string[]>(),
  sidebarDmOrder: json("sidebar_dm_order").$type<string[]>(),
  sidebarChannelSortMode: text("sidebar_channel_sort_mode", { enum: ["manual", "recent", "az"] }).notNull().default("manual"),
  sidebarDmSortMode: text("sidebar_dm_sort_mode", { enum: ["manual", "recent", "az"] }).notNull().default("manual"),
  sidebarPinnedSortMode: text("sidebar_pinned_sort_mode", { enum: ["manual", "recent", "az"] }).notNull().default("manual"),
  pinnedChannelIds: json("pinned_channel_ids").$type<string[]>(),
  pinnedAgentIds: json("pinned_agent_ids").$type<string[]>(),
  pinnedOrder: json("pinned_order").$type<string[]>(),
  hiddenDmIds: json("hidden_dm_ids").$type<string[]>(),
  channelPanelTabOrder: json("channel_panel_tab_order").$type<string[]>(),
  agentPanelTabOrder: json("agent_panel_tab_order").$type<string[]>(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.serverId, t.userId] }),
  index("idx_server_members_user").on(t.userId),
  check(
    "server_members_onboarding_wizard_current_step_valid",
    sql`${t.onboardingWizardCurrentStep} IS NULL OR ${t.onboardingWizardCurrentStep} IN ('add-computer', 'create-agent', 'referral-source', 'invite-teammates', 'join-community', 'enable-notifications', 'complete')`,
  ),
]);

export const serverAgreements = pgTable("server_agreements", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  title: text("title").notNull(),
  bodyMarkdown: text("body_markdown").notNull(),
  effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull().defaultNow(),
  enabled: boolean("enabled").notNull().default(true),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_server_agreements_server_version").on(t.serverId, t.version),
  uniqueIndex("idx_server_agreements_active").on(t.serverId).where(sql`${t.enabled} = true`),
  index("idx_server_agreements_server").on(t.serverId),
]);

export const serverMembershipAgreementAudit = pgTable("server_membership_agreement_audit", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  subjectType: text("subject_type", { enum: ["user", "agent"] }).notNull(),
  subjectId: uuid("subject_id").notNull(),
  agreementId: uuid("agreement_id").references(() => serverAgreements.id),
  agreementVersion: integer("agreement_version"),
  actorUserId: uuid("actor_user_id").notNull().references(() => users.id),
  source: text("source", { enum: ["invite", "join", "request-access", "admin-add"] }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signatureMethod: text("signature_method"),
  signaturePayload: jsonb("signature_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_server_membership_agreement_audit_server").on(t.serverId),
  index("idx_server_membership_agreement_audit_subject").on(t.subjectType, t.subjectId),
  index("idx_server_membership_agreement_audit_agreement").on(t.agreementId),
]);

// Sessions — JWT refresh tokens
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_sessions_token_hash").on(t.tokenHash),
]);

// Agents — AI assistants
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  description: text("description"),
  allChannelIntroSentAt: timestamp("all_channel_intro_sent_at", { withTimezone: true }),
  status: text("status", { enum: ["active", "inactive", "stopped"] }).default("inactive").notNull(),
  sessionId: text("session_id"),
  model: text("model").default("sonnet").notNull(),
  runtime: text("runtime").default("claude").notNull(),
  runtimeConfig: jsonb("runtime_config").$type<RuntimeConfig>(),
  reasoningEffort: text("reasoning_effort", { enum: ["low", "medium", "high", "xhigh"] }),
  executionMode: text("execution_mode", { enum: ["byoc", "cloud"] }).default("byoc").notNull(),
  envVars: json("env_vars").$type<Record<string, string>>(),
  creatorType: text("creator_type", { enum: ["user", "agent"] }),
  creatorId: uuid("creator_id"),
  machineId: uuid("daemon_id").references(() => machines.id, { onDelete: "set null" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_agents_server_name").on(t.serverId, t.name).where(sql`deleted_at is null`),
  index("idx_agents_server").on(t.serverId),
  index("idx_agents_creator").on(t.serverId, t.creatorType, t.creatorId),
]);

// OAuth clients — third-party apps that can request agent login
export const oauthClients = pgTable("oauth_clients", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().unique(),
  clientSecretHash: text("client_secret_hash").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  homepageUrl: text("homepage_url"),
  returnUrl: text("return_url"),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_oauth_clients_server").on(t.serverId),
]);

// OAuth access requests — pending/approved/denied login attempts by a client.
// Agent requests are headless service grants; human requests are browser
// authorization codes scoped to one server context.
export const oauthAccessRequests = pgTable("oauth_access_requests", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  principalType: text("principal_type", { enum: ["agent", "human"] }).notNull().default("agent"),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => oauthClients.id, { onDelete: "cascade" }),
  scopes: json("scopes").$type<string[]>().notNull(),
  status: text("status", { enum: ["pending", "approved", "denied"] }).notNull().default("pending"),
  remember: boolean("remember").notNull().default(false),
  resolvedByUserId: uuid("resolved_by_user_id").references(() => users.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_oauth_access_requests_server_status").on(t.serverId, t.status),
  index("idx_oauth_access_requests_agent").on(t.agentId),
  index("idx_oauth_access_requests_user").on(t.userId),
  index("idx_oauth_access_requests_client").on(t.clientId),
]);

// OAuth grants — standing approvals for a client to obtain agent login on a scope set
export const oauthGrants = pgTable("oauth_grants", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => oauthClients.id, { onDelete: "cascade" }),
  scopes: json("scopes").$type<string[]>().notNull(),
  grantedByUserId: uuid("granted_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  revokedByUserId: uuid("revoked_by_user_id").references(() => users.id, { onDelete: "set null" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_oauth_grants_server_agent").on(t.serverId, t.agentId),
  index("idx_oauth_grants_client").on(t.clientId),
]);

// OAuth access tokens — opaque bearer tokens issued after request approval
export const oauthAccessTokens = pgTable("oauth_access_tokens", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  principalType: text("principal_type", { enum: ["agent", "human"] }).notNull().default("agent"),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => oauthClients.id, { onDelete: "cascade" }),
  requestId: uuid("request_id").references(() => oauthAccessRequests.id, { onDelete: "set null" }),
  grantId: uuid("grant_id").references(() => oauthGrants.id, { onDelete: "set null" }),
  tokenHash: text("token_hash").notNull(),
  scopes: json("scopes").$type<string[]>().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_oauth_access_tokens_hash").on(t.tokenHash),
  index("idx_oauth_access_tokens_agent").on(t.agentId),
  index("idx_oauth_access_tokens_user").on(t.userId),
  index("idx_oauth_access_tokens_expires").on(t.expiresAt),
]);

// Channels — context-isolated group chats or DMs.
// Archive contract (2026-04-20, #proj-channel task #3):
//   archived_at    — set when channel is archived; cleared on unarchive.
//                    Archive freezes writes (no messages, reactions, tasks,
//                    attachments) but preserves read access and the name.
//                    Archive ≠ delete: the name stays reserved so
//                    re-creation must explicitly reuse or rename.
//   archived_by_user_id — actor who archived; cleared on unarchive. Retained
//                    for audit display only; user deletion clears it.
export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["channel", "private", "joint", "dm", "thread"] }).default("channel").notNull(),
  parentMessageId: uuid("parent_message_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archivedByUserId: uuid("archived_by_user_id").references(() => users.id, { onDelete: "set null" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  index("idx_channels_server").on(t.serverId),
  // Name uniqueness spans archived and active channels: archive must not
  // release the name. The partial index stays gated only on deleted_at.
  uniqueIndex("idx_channels_server_name_type").on(t.serverId, t.name).where(sql`type in ('channel', 'private', 'joint') and deleted_at is null`),
  index("idx_channels_parent_message").on(t.parentMessageId),
  uniqueIndex("idx_channels_active_thread_parent").on(t.parentMessageId).where(sql`type = 'thread' and deleted_at is null`),
  index("idx_channels_archived").on(t.serverId, t.archivedAt),
]);

// Joint channels — shared conversations projected into multiple servers.
//
// Contract:
// - joint_channels owns the canonical message stream via canonical_channel_id.
// - canonical_channel_id is storage-only; it is not a user-facing projection,
//   not joinable/listable, and must never grant access by itself.
// - joint_channel_servers owns each server-local projection channel.
// - request-time access must resolve through the caller's active local
//   projection before touching canonical storage.
export const jointChannels = pgTable("joint_channels", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  canonicalChannelId: uuid("canonical_channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  createdByServerId: uuid("created_by_server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status", { enum: ["active", "closed"] }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_joint_channels_canonical").on(t.canonicalChannelId),
  index("idx_joint_channels_created_by_server").on(t.createdByServerId),
]);

export const jointChannelServers = pgTable("joint_channel_servers", {
  jointChannelId: uuid("joint_channel_id").notNull().references(() => jointChannels.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  localChannelId: uuid("local_channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["host", "participant"] }).notNull().default("participant"),
  status: text("status", { enum: ["active", "disconnected"] }).notNull().default("active"),
  joinedByUserId: uuid("joined_by_user_id").references(() => users.id, { onDelete: "set null" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  disconnectedByUserId: uuid("disconnected_by_user_id").references(() => users.id, { onDelete: "set null" }),
  disconnectedAt: timestamp("disconnected_at", { withTimezone: true }),
}, (t) => [
  primaryKey({ columns: [t.jointChannelId, t.serverId] }),
  uniqueIndex("idx_joint_channel_servers_local_channel").on(t.localChannelId),
  index("idx_joint_channel_servers_server").on(t.serverId),
]);

export const jointChannelInvites = pgTable("joint_channel_invites", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  jointChannelId: uuid("joint_channel_id").notNull().references(() => jointChannels.id, { onDelete: "cascade" }),
  fromServerId: uuid("from_server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  toServerId: uuid("to_server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  invitedUserId: uuid("invited_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id, { onDelete: "set null" }),
  acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status", { enum: ["pending", "accepted", "declined", "revoked", "expired"] }).notNull().default("pending"),
  tokenHash: text("token_hash"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
}, (t) => [
  uniqueIndex("idx_joint_channel_invites_token_hash").on(t.tokenHash),
  uniqueIndex("idx_joint_channel_invites_pending_target_user").on(t.jointChannelId, t.toServerId, t.invitedUserId).where(sql`status = 'pending'`),
  index("idx_joint_channel_invites_to_server").on(t.toServerId, t.status),
  index("idx_joint_channel_invites_invited_user").on(t.invitedUserId, t.status),
  index("idx_joint_channel_invites_from_server").on(t.fromServerId, t.status),
]);

// Channel-Agent assignments
export const channelAgents = pgTable("channel_agents", {
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.channelId, t.agentId] }),
  index("idx_channel_agents_agent").on(t.agentId),
]);

// Channel-User members (for DM visibility and channel access)
export const channelHumans = pgTable("channel_humans", {
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.channelId, t.userId] }),
  index("idx_channel_humans_user").on(t.userId),
]);

// Messages with server-global seq for reliable delivery
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  seq: bigserial("seq", { mode: "number" }).notNull(),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  senderType: text("sender_type", { enum: ["user", "agent"] }).notNull(),
  senderId: text("sender_id").notNull(), // user UUID or agent UUID
  agentSendKey: text("agent_send_key"),
  messageType: text("message_type", { enum: ["chat", "system"] }).notNull().default("chat"),
  content: text("content").notNull(),
  actionMetadata: json("action_metadata"),
  searchText: text("search_text"),
  searchVector: tsvector("search_vector").generatedAlwaysAs(sql`to_tsvector('simple', COALESCE(search_text, ''))`),
  // `threadId` is the **anchor** marker on a thread PARENT message. It holds
  // the `channels.id` of the thread channel that hangs off this message — set
  // by `channelService.syncParentMessageThreadId` when the thread is first
  // resolved. It is NOT "this message is a reply inside a thread"; thread
  // replies are stored as ordinary messages in the thread channel, with
  // `messages.channelId === threadChannelId` and their own `threadId === null`.
  // Renaming the column would require a migration; reading code should rely on
  // this comment, not the field name's natural reading.
  threadId: text("thread_id"),
  // Task fields — when taskStatus is not null, this message is a task
  taskStatus: text("task_status", { enum: ["todo", "in_progress", "in_review", "done", "closed"] }),
  taskNumber: integer("task_number"),
  taskAssigneeType: text("task_assignee_type", { enum: ["user", "agent"] }),
  taskAssigneeId: text("task_assignee_id"),
  taskClaimedAt: timestamp("task_claimed_at", { withTimezone: true }),
  taskCompletedAt: timestamp("task_completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_messages_channel_seq").on(t.channelId, t.seq),
  index("idx_messages_seq").on(t.seq),
  index("idx_messages_thread").on(t.threadId),
  index("idx_messages_search_vector_gin").using("gin", t.searchVector),
  uniqueIndex("idx_messages_channel_task_number").on(t.channelId, t.taskNumber),
  uniqueIndex("idx_messages_agent_send_key")
    .on(t.senderId, t.agentSendKey)
    .where(sql`sender_type = 'agent' and agent_send_key is not null`),
  index("idx_messages_channel_task_status").on(t.channelId, t.taskStatus),
]);

// Reactions are polymorphic by design: users and agents share the same emoji
// aggregate and differ only by (reactorType, reactorId).
export const messageReactions = pgTable("message_reactions", {
  messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  reactorType: text("reactor_type", { enum: ["user", "agent"] }).notNull(),
  reactorId: uuid("reactor_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.messageId, t.reactorType, t.reactorId, t.emoji] }),
  index("idx_message_reactions_message").on(t.messageId),
  index("idx_message_reactions_reactor").on(t.reactorType, t.reactorId),
]);

export const messageTranslations = pgTable("message_translations", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  contentHash: text("content_hash").notNull(),
  sourceLang: text("source_lang").notNull(),
  sourceConfidence: integer("source_confidence").notNull().default(0),
  targetLang: text("target_lang").notNull(),
  provider: text("provider").notNull(),
  providerVersion: text("provider_version").notNull(),
  placeholderPolicyVersion: text("placeholder_policy_version").notNull(),
  status: text("status", { enum: ["pending", "translated", "skipped", "failed"] }).notNull(),
  skipReason: text("skip_reason", {
    enum: [
      "server_disabled",
      "same_language",
      "own_message",
      "system_message",
      "code_or_link_only",
      "low_confidence",
      "quota_exceeded",
      "provider_unavailable",
      "content_invalid",
      "placeholder_mismatch",
    ],
  }),
  quotaReason: text("quota_reason", { enum: ["server_disabled", "user_quota_exceeded", "server_quota_exceeded"] }),
  translatedContent: text("translated_content"),
  protectedEntities: jsonb("protected_entities").$type<Array<{ id: string; kind: string; value: string }>>().notNull().default([]),
  requestedChars: integer("requested_chars").notNull().default(0),
  providerBilledChars: integer("provider_billed_chars").notNull().default(0),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_message_translations_cache_key").on(
    t.messageId,
    t.contentHash,
    t.sourceLang,
    t.targetLang,
    t.providerVersion,
    t.placeholderPolicyVersion,
  ),
  index("idx_message_translations_server_accessed").on(t.serverId, t.lastAccessedAt),
  index("idx_message_translations_server_created").on(t.serverId, t.createdAt),
]);

export const translationQuotaBuckets = pgTable("translation_quota_buckets", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  actorType: text("actor_type", { enum: ["user", "server"] }).notNull(),
  actorId: text("actor_id").notNull(),
  bucketDate: text("bucket_date").notNull(),
  mode: text("mode", { enum: ["auto", "manual"] }).notNull(),
  requestCount: integer("request_count").notNull().default(0),
  requestedChars: integer("requested_chars").notNull().default(0),
  providerBilledChars: integer("provider_billed_chars").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_translation_quota_bucket").on(t.serverId, t.actorType, t.actorId, t.bucketDate, t.mode),
  index("idx_translation_quota_server_date").on(t.serverId, t.bucketDate),
]);

// Machines — physical compute nodes connected via daemon process
// NOTE: SQL table name is still "daemons" for backward compat; use migration to rename
export const machines = pgTable("daemons", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  apiKeyHash: text("api_key_hash").notNull(),
  apiKeyPrefix: text("api_key_prefix"),
  runtimes: json("runtimes").$type<string[]>(),
  hostname: text("hostname"),
  os: text("os"),
  daemonVersion: text("daemon_version"),
  lastHeartbeat: timestamp("last_heartbeat", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  legacyKeyMigratedAt: timestamp("legacy_key_migrated_at", { withTimezone: true }),
}, (t) => [
  index("idx_daemons_server").on(t.serverId),
  index("idx_daemons_api_key_prefix").on(t.apiKeyPrefix),
]);

// Tasks — DEPRECATED: kept for backward compat, no longer used by application code.
// Tasks are now a property of messages (task_status != null).
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  taskNumber: integer("task_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in_progress", "in_review", "done", "closed"] }).notNull().default("todo"),
  createdByType: text("created_by_type", { enum: ["user", "agent"] }).notNull(),
  createdById: text("created_by_id").notNull(),
  claimedByType: text("claimed_by_type", { enum: ["user", "agent"] }),
  claimedById: text("claimed_by_id"),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  messageId: uuid("message_id").references(() => messages.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_tasks_channel_number").on(t.channelId, t.taskNumber),
  index("idx_tasks_channel_status").on(t.channelId, t.status),
  uniqueIndex("idx_tasks_message_id").on(t.messageId),
]);

// Agent Runtime Profile — one current restart-time migration state per agent.
// Only machine/runtime/model/reasoning/execution feed the fingerprint.
// Daemon version is a first-class release-policy field, but not identity.
export const agentRuntimeProfiles = pgTable("agent_runtime_profiles", {
  agentId: uuid("agent_id").primaryKey().references(() => agents.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),

  machineId: uuid("machine_id").notNull().references(() => machines.id, { onDelete: "restrict" }),
  runtimeProfileFingerprint: text("runtime_profile_fingerprint").notNull(),
  runtime: text("runtime").notNull(),
  model: text("model").notNull(),
  reasoningEffort: text("reasoning_effort"),
  executionMode: text("execution_mode").notNull(),
  daemonVersion: text("daemon_version"),

  workspaceRefLabel: text("workspace_ref_label"),
  workspaceRefPath: text("workspace_ref_path"),
  workspaceRefMachineId: text("workspace_ref_machine_id"),
  workspaceRefRuntime: text("workspace_ref_runtime"),
  workspaceRefReachable: boolean("workspace_ref_reachable"),
  workspaceRefReason: text("workspace_ref_reason"),
  workspacePathRefLabel: text("workspace_path_ref_label"),
  workspacePathRefPath: text("workspace_path_ref_path"),
  workspacePathRefMachineId: text("workspace_path_ref_machine_id"),
  workspacePathRefRuntime: text("workspace_path_ref_runtime"),
  workspacePathRefReachable: boolean("workspace_path_ref_reachable"),
  workspacePathRefReason: text("workspace_path_ref_reason"),
  sessionRefLabel: text("session_ref_label"),
  sessionRefPath: text("session_ref_path"),
  sessionRefMachineId: text("session_ref_machine_id"),
  sessionRefRuntime: text("session_ref_runtime"),
  sessionRefReachable: boolean("session_ref_reachable"),
  sessionRefReason: text("session_ref_reason"),

  baselineRuntimeProfileFingerprint: text("baseline_runtime_profile_fingerprint").notNull(),
  baselineMachineId: uuid("baseline_machine_id").notNull().references(() => machines.id, { onDelete: "restrict" }),
  baselineRuntime: text("baseline_runtime").notNull(),
  baselineModel: text("baseline_model").notNull(),
  baselineReasoningEffort: text("baseline_reasoning_effort"),
  baselineExecutionMode: text("baseline_execution_mode").notNull(),
  baselineDaemonVersion: text("baseline_daemon_version"),

  migrationStatus: text("migration_status", { enum: ["stable", "pending", "migrating"] }).notNull().default("stable"),
  pendingKind: text("pending_kind", { enum: ["migration", "daemon_release_notice"] }),
  pendingKey: text("pending_key"),
  pendingBeforeRuntimeProfileFingerprint: text("pending_before_runtime_profile_fingerprint"),
  pendingAfterRuntimeProfileFingerprint: text("pending_after_runtime_profile_fingerprint"),
  pendingBeforeMachineId: uuid("pending_before_machine_id").references(() => machines.id, { onDelete: "restrict" }),
  pendingAfterMachineId: uuid("pending_after_machine_id").references(() => machines.id, { onDelete: "restrict" }),
  pendingBeforeRuntime: text("pending_before_runtime"),
  pendingAfterRuntime: text("pending_after_runtime"),
  pendingBeforeModel: text("pending_before_model"),
  pendingAfterModel: text("pending_after_model"),
  pendingBeforeReasoningEffort: text("pending_before_reasoning_effort"),
  pendingAfterReasoningEffort: text("pending_after_reasoning_effort"),
  pendingBeforeExecutionMode: text("pending_before_execution_mode"),
  pendingAfterExecutionMode: text("pending_after_execution_mode"),
  pendingBeforeDaemonVersion: text("pending_before_daemon_version"),
  pendingAfterDaemonVersion: text("pending_after_daemon_version"),
  pendingPreviousSessionLabel: text("pending_previous_session_label"),
  pendingPreviousSessionPath: text("pending_previous_session_path"),
  pendingPreviousSessionMachineId: text("pending_previous_session_machine_id"),
  pendingPreviousSessionRuntime: text("pending_previous_session_runtime"),
  pendingPreviousSessionReachable: boolean("pending_previous_session_reachable"),
  pendingPreviousSessionReason: text("pending_previous_session_reason"),
  pendingReleaseNotesUrl: text("pending_release_notes_url"),
  migrationDeliveredAt: timestamp("migration_delivered_at", { withTimezone: true }),
  migrationDeliveredLaunchId: text("migration_delivered_launch_id"),
  migratingSince: timestamp("migrating_since", { withTimezone: true }),
  lastMigrationNudgeAt: timestamp("last_migration_nudge_at", { withTimezone: true }),
  migrationNudgeCount: integer("migration_nudge_count").notNull().default(0),
  migrationHandledAt: timestamp("migration_handled_at", { withTimezone: true }),
  migrationHandledLaunchId: text("migration_handled_launch_id"),

  revision: integer("revision").notNull().default(1),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_agent_runtime_profiles_server").on(t.serverId),
  index("idx_agent_runtime_profiles_machine").on(t.machineId),
  uniqueIndex("idx_agent_runtime_profiles_pending_key").on(t.pendingKey),
  index("idx_agent_runtime_profiles_pending").on(t.serverId, t.updatedAt).where(sql`pending_kind is not null`),
]);

// User-channel read cursor for unread counts
export const userChannelReadCursors = pgTable("user_channel_read_cursors", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  lastReadSeq: integer("last_read_seq").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.channelId] }),
]);

// Per-user Inbox state for regular channels and DMs.
// Thread Inbox state lives on thread_follows.done_at because threads use
// follow as their attention primitive rather than channel membership.
export const userChannelInboxStates = pgTable("user_channel_inbox_states", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  doneAt: timestamp("done_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.channelId] }),
  index("idx_user_channel_inbox_states_channel").on(t.channelId),
  index("idx_user_channel_inbox_states_done").on(t.userId, t.doneAt),
]);

// Agent-channel read cursor for agent unread tracking
export const agentChannelReadCursors = pgTable("agent_channel_read_cursors", {
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  lastReadSeq: integer("last_read_seq").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.agentId, t.channelId] }),
]);

// Email verification tokens
export const emailVerifications = pgTable("email_verifications", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_email_verifications_user").on(t.userId),
]);

// Password reset tokens
export const passwordResets = pgTable("password_resets", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_password_resets_user").on(t.userId),
]);

// Subscriptions — Stripe billing records (one per server)
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }).unique(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripeExtraAgentItemId: text("stripe_extra_agent_item_id"), // [UNUSED] extra-agent billing disabled
  status: text("status", { enum: ["active", "past_due", "canceled", "incomplete"] }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_subscriptions_server").on(t.serverId),
  index("idx_subscriptions_stripe_customer").on(t.stripeCustomerId),
  index("idx_subscriptions_stripe_sub").on(t.stripeSubscriptionId),
]);

// Webhook events — idempotency tracking for Stripe webhooks
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(), // Stripe event ID (evt_...)
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

// Attachments — file uploads linked to messages
export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  uploaderId: text("uploader_id").notNull(),
  uploaderType: text("uploader_type", { enum: ["user", "agent"] }).notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: text("storage_key").notNull(),
  thumbnailKey: text("thumbnail_key"),
  contentHash: text("content_hash"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_attachments_message").on(t.messageId),
  index("idx_attachments_channel").on(t.channelId),
  index("idx_attachments_channel_created_linked")
    .on(t.channelId, sql`${t.createdAt} DESC`, sql`${t.id} DESC`)
    .where(sql`message_id is not null`),
  index("idx_attachments_content_hash").on(t.contentHash),
]);

// Agent activity events — durable recent trajectory log for UI hydration
export const agentActivityEvents = pgTable("agent_activity_events", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  activity: text("activity", { enum: ["online", "thinking", "working", "error", "offline"] }).notNull(),
  detail: text("detail").notNull().default(""),
  entries: json("entries").$type<TrajectoryEntry[]>().notNull(),
  // Optional semantic idempotency key for user-visible Activity Log projections.
  //
  // This is not a lifecycle event id, trace id, or correlation id. It is only
  // set when multiple server observations may project the same user-visible
  // activity row for the same agent, e.g. repeated ready-reconcile observations
  // inside one daemon restart/disconnect window. The projection writer inserts
  // the first row and treats later `(agent_id, dedupe_key)` conflicts as an
  // idempotent "already projected" outcome.
  //
  // Writers must use a stable semantic key for the projection window/operation.
  // Do not use random lifecycle event ids, trace/span ids, or request ids: those
  // change across retries/reconciles and would defeat dedupe. The unique scope
  // is per agent, not global; one daemon restart window may affect many agents,
  // and each affected agent is allowed one visible row for that window.
  //
  // Null deliberately preserves legacy behavior: historical rows and ordinary
  // non-idempotent activity events remain append-only and are not constrained by
  // the partial unique index.
  dedupeKey: text("dedupe_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_agent_activity_events_agent_created").on(t.agentId, t.createdAt),
  uniqueIndex("idx_agent_activity_events_agent_dedupe").on(t.agentId, t.dedupeKey).where(sql`${t.dedupeKey} IS NOT NULL`),
]);

/**
 * Thread contract (authoritative).
 * =============================================================================
 * Thread channels split two authorities that regular channels conflate:
 *
 *   join/membership  → permission to POST  (from parent channel/DM)
 *   follow           → attention / notifications / unread / done (this table)
 *
 * A thread has no channel_humans / channel_agents rows of its own. Its post
 * authority is delegated to the parent channel (for channel threads) or the
 * parent DM (for DM threads). Following a thread grants listen access only —
 * never send permission.
 *
 * ── Data model ───────────────────────────────────────────────────────────────
 *   followerType ∈ {user, agent}          polymorphic follower
 *   reason       ∈ {replied, authored,    why the row was created
 *                   mentioned, manual}
 *   doneAt       nullable                 Inbox-Done marker; cleared by new activity
 *   unfollowedAt nullable                 Explicit opt-out marker; not cleared by
 *                                         ordinary activity; direct mention,
 *                                         manual follow, or self-reply may
 *                                         reactivate attention
 *   PK           (threadChannelId, followerType, followerId)
 *
 * ── Join / post authority (channelService.canUserPostToChannel /
 *     canAgentPostToChannel recurse for threads) ──────────────────────────────
 *   Thread post authority == parent channel/DM membership.
 *   Following a thread never grants post permission.
 *   Enforced at:
 *     - POST /api/messages            (user send)
 *     - /internal/agent/:id/send      (agent send, incl. `#channel:shortid`
 *                                      target resolution in
 *                                      resolveOrCreateThreadTarget)
 *     - /internal/agent/:id/upload    (agent upload)
 *   The legacy thread member-mutation routes (join/leave/add/remove) all
 *   return 400 — thread membership is managed via follow/unfollow.
 *
 * ── Follow / notification authority (this table) ────────────────────────────
 *   getChannelMembers(threadId) delegates to the parent channel — it is the
 *   source of truth for "who is in the room".
 *   getThreadFollowers(threadId) reads this table — it is the source of truth
 *   for "who gets notified, who has unread, who can mark done".
 *
 * ── Auto-follow sources ─────────────────────────────────────────────────────
 *   Opening a thread panel or calling getOrCreateThread NEVER writes a follow
 *   row. The Threads list must only show threads the user actually participated
 *   in — view-only opens must not pollute it.
 *
 *   A. Reply on a thread      — sender        → reason = 'replied'
 *      (includes the first      parent author → reason = 'authored' (if not sender)
 *      reply that creates the
 *      thread)
 *   B. Mention in a thread    — target added with reason = 'mentioned'
 *                              Scope depends on parent channel type:
 *                                public channel thread → server-wide scope
 *                                                        (any server member
 *                                                         or any server agent
 *                                                         may be pulled in)
 *                                DM thread            → private scope
 *                                                        (only existing DM
 *                                                         participants; never
 *                                                         outsiders)
 *      Direct @mention of a user who explicitly unfollowed reactivates the
 *      thread, with the mention message as the new unread-count starting point.
 *   C. Manual follow/unfollow — reason = 'manual' via
 *                               POST /api/channels/threads/follow | unfollow.
 *                               Unfollow keeps a suppressed row so later
 *                               ordinary activity cannot silently re-add Inbox.
 *
 * ── Done / unread reactivation ──────────────────────────────────────────────
 *   POST /api/channels/threads/done   sets doneAt for the caller's follow row.
 *   POST /api/channels/threads/undone clears doneAt for the caller.
 *   New activity on the thread clears doneAt for existing non-unfollowed rows —
 *   a thread that receives a new message is unread again for everyone who
 *   had marked it done, but explicit unfollow remains suppressed.
 *
 * ── Legacy compat ───────────────────────────────────────────────────────────
 *   Migration 0041 backfills pre-existing thread channel_humans / channel_agents
 *   rows into thread_follows (reason='manual') without deleting the legacy
 *   rows. Runtime MUST NOT write new channel_humans / channel_agents rows for
 *   thread-type channels.
 *
 * Contract is fenced by black-box tests in
 *   packages/server/src/routes/channels.api.test.ts
 * =============================================================================
 */
export const threadFollows = pgTable("thread_follows", {
  threadChannelId: uuid("thread_channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  followerType: text("follower_type", { enum: ["user", "agent"] }).notNull(),
  followerId: uuid("follower_id").notNull(),
  parentMessageId: uuid("parent_message_id").notNull(),
  reason: text("reason", { enum: ["replied", "authored", "mentioned", "manual"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  doneAt: timestamp("done_at", { withTimezone: true }),
  unfollowedAt: timestamp("unfollowed_at", { withTimezone: true }),
}, (t) => [
  primaryKey({ columns: [t.threadChannelId, t.followerType, t.followerId] }),
  index("idx_thread_follows_follower").on(t.followerType, t.followerId),
]);

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_push_subscriptions_user_endpoint").on(t.userId, t.endpoint),
  index("idx_push_subscriptions_user").on(t.userId),
]);

export const webPushPromptEvents = pgTable("web_push_prompt_events", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").references(() => servers.id, { onDelete: "set null" }),
  event: text("event").notNull(),
  trigger: text("trigger").notNull(),
  result: text("result"),
  permissionBefore: text("permission_before"),
  permissionAfter: text("permission_after"),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_web_push_prompt_events_user_created").on(t.userId, t.createdAt),
  index("idx_web_push_prompt_events_server_created").on(t.serverId, t.createdAt),
]);

// User saved messages (decoupled from thread follows)
export const userSaved = pgTable("user_saved", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.messageId] }),
  index("idx_user_saved_user_server").on(t.userId, t.serverId),
]);

export const serverInvites = pgTable("server_invites", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  invitedEmail: text("invited_email").notNull(),
  invitedByUserId: uuid("invited_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  status: text("status", { enum: ["pending", "accepted", "expired"] }).notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_server_invites_server").on(t.serverId),
  index("idx_server_invites_email").on(t.invitedEmail),
]);

/**
 * Announcements — account-level popup messages.
 *
 * v0 surface contract: every user only ever sees the SINGLE most recently
 * published announcement, and only if they have not dismissed it. This keeps
 * the operator's mental model trivial — every user is in one of two states
 * (seen latest, or hasn't), and there is no per-user backlog to reason about.
 * Older rows stay in the table as audit history but are never resurfaced.
 *
 * To replace the current campaign, INSERT a new row. The table is FK-free so
 * it can be edited via DB GUI. Multi-step content goes in `pages` as a JSON
 * array rendered as a paginated modal client-side. There is no retracted/
 * disabled flag — publish a new row to swap, or DELETE the row to clear
 * (delete cascades through user_announcement_dismissals).
 *
 * Not server-scoped: announcements follow the user across every server they
 * belong to, so the table holds no serverId.
 */
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  pages: json("pages").$type<Array<{ title?: string; body: string }>>().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_announcements_published_at_desc").on(t.publishedAt),
]);

export const userAnnouncementDismissals = pgTable("user_announcement_dismissals", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  announcementId: uuid("announcement_id").notNull().references(() => announcements.id, { onDelete: "cascade" }),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.announcementId] }),
]);

// Server join links — multi-use invite links for self-serve server joins
export const serverJoinLinks = pgTable("server_join_links", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  maxUses: integer("max_uses"),
  useCount: integer("use_count").notNull().default(0),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_server_join_links_token").on(t.token),
  index("idx_server_join_links_server").on(t.serverId),
]);

// Reminders — single-shot wake events anchored to a message (or free-form).
// Server DB is the authoritative source; daemon holds an ephemeral timer cache.
// All status transitions go through an atomic guard:
//   UPDATE reminders SET status='fired' WHERE id=$1 AND status='scheduled'
// so daemon fire_attempt and server fallback scanner cannot double-fire.
export const reminders = pgTable("reminders", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  ownerAgentId: uuid("owner_agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  // Anchor to a message. Not a FK — msg deletion must not cascade the reminder
  // away, since ACL/visibility is re-evaluated at fire time anyway.
  msgId: uuid("msg_id"),
  title: text("title").notNull(),
  fireAt: timestamp("fire_at", { withTimezone: true }).notNull(),
  payload: json("payload"),
  // Optional recurrence. When present, fire transition re-queues a new fire_at
  // instead of marking the row completed. Stored as a versioned discriminated
  // union (see services/recurrence.ts). Unknown kinds at read time are
  // skip-fired + forward-advanced 5 min so newer variants written by a newer
  // server don't crash an older reader.
  recurrence: jsonb("recurrence"),
  status: text("status", { enum: ["scheduled", "fired", "canceled"] }).notNull().default("scheduled"),
  // Bumped on every mutation; used as the idempotency / ordering key for
  // server→daemon push and daemon→server fire_attempt.
  version: integer("version").notNull().default(1),
  firedAt: timestamp("fired_at", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdByType: text("created_by_type", { enum: ["agent", "human"] }).notNull(),
  createdById: uuid("created_by_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // Fallback scanner path: WHERE status='scheduled' AND fire_at <= now()
  index("idx_reminders_due").on(t.status, t.fireAt),
  // Owner listings (sidebar pending list, daemon snapshot rebuild)
  index("idx_reminders_owner").on(t.ownerAgentId, t.status, t.fireAt),
  index("idx_reminders_server").on(t.serverId),
]);

export const reminderEvents = pgTable("reminder_events", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  reminderId: uuid("reminder_id").notNull().references(() => reminders.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  ownerAgentId: uuid("owner_agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  actorType: text("actor_type", { enum: ["agent", "human", "system"] }).notNull(),
  actorId: uuid("actor_id"),
  eventType: text("event_type", { enum: ["scheduled", "fired", "snoozed", "updated", "canceled"] }).notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  nextFireAt: timestamp("next_fire_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
}, (t) => [
  index("idx_reminder_events_reminder").on(t.reminderId, t.occurredAt),
  index("idx_reminder_events_owner").on(t.ownerAgentId, t.occurredAt),
  index("idx_reminder_events_server").on(t.serverId),
]);

// Action cards: agent-prepared form-style messages that a human admin
// commits ("Create Channel", "Create Agent", "Add Members"). Anchored to a
// carrier message; the message body renders the card from this row.
//
// State machine:
//   prepared → executed
// Both stored as text (not pg enum) so future states (e.g. cancelled) can
// land without a schema migration. Migration-friendly per stdrc/tygg
// 2026-05-10 #proj-approval msg=174b7e16: minimum schema, jsonb where
// flexibility helps.
export const actionCards = pgTable("action_cards", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  // Carrier message — the message whose body renders this card. Cascade
  // delete: if the message goes (e.g. channel deleted), the card is moot.
  messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  requesterAgentId: uuid("requester_agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(),
  // Frozen at prepare time. Mutated only when the human commits with
  // overrides (e.g. picked a different runtime than the agent suggested);
  // in that case we store the merged action so audit reflects what was
  // actually committed.
  payload: jsonb("payload").notNull(),
  state: text("state").notNull().default("prepared"),
  executedAt: timestamp("executed_at", { withTimezone: true }),
  executedByUserId: uuid("executed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  result: jsonb("result"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_action_cards_message").on(t.messageId),
  index("idx_action_cards_server_state").on(t.serverId, t.state),
  index("idx_action_cards_requester").on(t.requesterAgentId, t.createdAt),
]);

// Product events — append-only product-funnel / UX-interaction event log.
//
// **Scope (owned by @Dozy + @meichen, decided 2026-05-13 #proj-permission:13b42cc0):**
// This table holds *product analytics / funnel* events for in-product objects
// (action cards today; reactions, onboarding step, permission card etc. in the
// future). It is NOT a global event sink — explicitly out of scope:
//
//   - audit / permission / credential events  → separate audit table later
//   - runtime / lifecycle / tracing events    → agent_activity_events / OTLP
//   - logging / debug events                  → external log infra
//
// **Boundary**: product event families are accepted only after an explicit
// subject_type / event_type whitelist expansion, gated by DB check
// constraints on both `subject_type` and `event_type`. New
// product objects must (a) propose a typed helper analogous to
// `recordActionCardEvent`, (b) extend the check constraints via migration,
// and (c) document their event shape with @Dozy + @meichen before INSERT
// becomes possible. This keeps the table from degenerating into a JSON
// dumping ground.
//
// **Field shape**: chosen to match a future generic `product_events` envelope
// (Leiysky/Dozy/meichen converged 2026-05-13). The table is named generically
// from day 1 to avoid a future rename — but the check constraints enforce a
// per-feature whitelist that widens through review.
//
// **No FK on subject_id**: deliberate — keeps the table polymorphic-ready
// without coupling to one source-of-truth table. Funnel queries join via
// `subject_id` directly.
//
// **subject_id grain (per subject_type)**:
//   - `action_card` → `action_cards.id` (canonical product entity).
//     Funnel SQL joins as `product_events.subject_id = action_cards.id`.
//     The carrier message id is reachable via `action_cards.message_id`
//     when message/channel context is needed. Decided 2026-05-13 in
//     #proj-permission:13b42cc0 (Dozy msg=9d0f10bd + meichen msg=174ba78c
//     reversal): `subject_id` must be the product entity, NOT its
//     message surface — message id is implementation detail of the
//     current carrier and would carry stale semantics if rendering
//     changes (forward / migrate / detach card from message).
//   - `onboarding_wizard` → `servers.id`. Wizard events are scoped to the
//     current server + human actor; metadata carries the step/session/version
//     dimensions. Do not use `subject_id=user_id` here because the wizard is
//     a server onboarding surface and the same user can onboard multiple
//     workspaces.
//
// **No PII / raw content** in metadata. metadata is for low-cardinality,
// aggregable signals (error_class, error_code, dismiss_reason).
// Free-text, message bodies, channel names, prompts, raw caught error
// messages / stack traces must NOT land here. Enforced by code review,
// not the DB. Per Leiysky/Dozy/meichen 2026-05-13 review: even
// length-truncated `error_message` is rejected because caught text can
// carry user input, payload fragments or DB error strings — boundary is
// "categorical buckets only, never a thing readable as a sentence".
export const productEvents = pgTable("product_events", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  eventType: text("event_type").notNull(),
  // actor_type/id is null for system-emitted events (e.g. `expired` from a
  // future TTL job). For action_card.* events, actor is always the human
  // clicking, except `expired` which has no actor.
  actorType: text("actor_type"),
  actorId: uuid("actor_id"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb("metadata").notNull().default({}),
  // Schema version of the metadata shape for *this* event_type. Increment
  // when an event_type's metadata contract changes in a non-additive way.
  // Defaults to 1 — bump only with explicit Dozy/meichen sign-off.
  schemaVersion: integer("schema_version").notNull().default(1),
  // Where the event came from — 'web' for client-emitted, 'server' for
  // server-side hookpoints, 'cron' for batch jobs. Optional but useful for
  // debugging duplicate/missing events.
  source: text("source"),
  // Optional client-supplied idempotency key — at-most-once write within a
  // (subject_id, event_type) when set. Enforced via partial unique index.
  idempotencyKey: text("idempotency_key"),
}, (t) => [
  index("idx_product_events_subject").on(t.subjectId, t.occurredAt),
  index("idx_product_events_type").on(t.eventType, t.occurredAt),
  uniqueIndex("idx_product_events_idempotency")
    .on(t.subjectId, t.eventType, t.idempotencyKey)
    .where(sql`${t.idempotencyKey} IS NOT NULL`),
  // Day-1 whitelist. Widening this requires a migration + Dozy/meichen review.
  check(
    "product_events_subject_type_whitelist",
    sql`${t.subjectType} IN ('action_card', 'onboarding_wizard')`,
  ),
  check(
    "product_events_event_type_whitelist",
    sql`${t.eventType} IN (
      'action_card.open',
      'action_card.dismiss',
      'action_card.execute_attempt',
      'action_card.execute_success',
      'action_card.execute_fail',
      'action_card.expired',
      'onboarding_wizard.step_shown',
      'onboarding_wizard.primary_clicked',
      'onboarding_wizard.skip_clicked',
      'onboarding_wizard.dismissed',
      'onboarding_wizard.completed',
      'onboarding_wizard.error'
    )`,
  ),
  // actor_type, when set, must be one of the recognised principals.
  check(
    "product_events_actor_type_valid",
    sql`${t.actorType} IS NULL OR ${t.actorType} IN ('human', 'agent', 'system')`,
  ),
]);

// Agent knowledge request events — metadata-only audit/readout for
// authenticated product knowledge retrieval. Do not store raw doc content,
// prompt/context, user-message excerpts, or private-channel quotes here.
export const agentKnowledgeEvents = pgTable("agent_knowledge_events", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  computerId: uuid("computer_id"),
  docId: text("doc_id"),
  topicOrPath: text("topic_or_path").notNull(),
  docVersion: text("doc_version"),
  docState: text("doc_state", { enum: ["draft", "published", "deprecated", "retired"] }),
  source: text("source", { enum: ["cli"] }).notNull(),
  status: text("status", { enum: ["success", "not_found", "denied", "error"] }).notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  latencyMs: integer("latency_ms"),
  responseBytes: integer("response_bytes"),
  turnId: text("turn_id"),
  traceId: text("trace_id"),
  reason: text("reason"),
}, (t) => [
  index("idx_agent_knowledge_events_agent_requested").on(t.agentId, t.requestedAt),
  index("idx_agent_knowledge_events_server_requested").on(t.serverId, t.requestedAt),
  index("idx_agent_knowledge_events_doc_requested").on(t.docId, t.requestedAt),
  index("idx_agent_knowledge_events_status_requested").on(t.status, t.requestedAt),
  check(
    "agent_knowledge_events_source_valid",
    sql`${t.source} IN ('cli')`,
  ),
  check(
    "agent_knowledge_events_status_valid",
    sql`${t.status} IN ('success', 'not_found', 'denied', 'error')`,
  ),
  check(
    "agent_knowledge_events_doc_state_valid",
    sql`${t.docState} IS NULL OR ${t.docState} IN ('draft', 'published', 'deprecated', 'retired')`,
  ),
  check(
    "agent_knowledge_events_success_doc_version",
    sql`${t.status} <> 'success' OR (${t.docId} IS NOT NULL AND ${t.docVersion} IS NOT NULL AND ${t.docState} IS NOT NULL)`,
  ),
]);

// Message mentions — send-time resolved delivery fact.
// Each row records a single @mention resolved at write time.
// Inbox, push, and "who mentioned me" queries join on (target_type, target_id).
// messageSeq is denormalized from messages.seq so Inbox can probe unread mentions
// without joining back to the messages table (aligns with read cursor authority).
export const messageMentions = pgTable("message_mentions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  messageSeq: bigint("message_seq", { mode: "number" }).notNull(),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  targetType: text("target_type", { enum: ["user", "agent"] }).notNull(),
  targetId: uuid("target_id").notNull(),
  handleAtSendTime: text("handle_at_send_time").notNull(),
  source: text("source", { enum: ["send_path", "backfill"] }).notNull().default("send_path"),
  confidence: text("confidence", { enum: ["exact", "backfill"] }).notNull().default("exact"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_message_mentions_unique").on(t.messageId, t.targetType, t.targetId),
  index("idx_message_mentions_target").on(t.targetType, t.targetId, t.serverId, sql`${t.createdAt} DESC`),
  index("idx_message_mentions_channel").on(t.channelId, t.messageId),
  index("idx_message_mentions_inbox").on(t.targetType, t.targetId, t.channelId, t.messageSeq),
]);

// Attested send events — lightweight diagnostic ledger for stale-hold /
// continue / silence / E1 exemption funnel tracking.
export const attestedSendEvents = pgTable("attested_send_events", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  eventType: text("event_type", { enum: ["gate_triggered", "continue", "silence", "e1_exempt"] }).notNull(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").references(() => servers.id, { onDelete: "set null" }),
  targetType: text("target_type", { enum: ["channel", "dm", "thread"] }).notNull(),
  targetRef: text("target_ref").notNull(),
  draftId: text("draft_id"),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "set null" }),
  newMessageCount: integer("new_message_count"),
  result: text("result", { enum: ["committed", "committed_anyway", "reheld", "replaced", "expired", "no_draft"] }),
  metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_attested_send_events_created").on(t.createdAt),
  index("idx_attested_send_events_agent_created").on(t.agentId, t.createdAt),
  index("idx_attested_send_events_type_created").on(t.eventType, t.createdAt),
  index("idx_attested_send_events_server_created").on(t.serverId, t.createdAt),
]);

export const attestedSendPendingDrafts = pgTable("attested_send_pending_drafts", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  channelId: uuid("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  targetType: text("target_type", { enum: ["channel", "dm", "thread"] }).notNull(),
  targetRef: text("target_ref").notNull(),
  content: text("content").notNull(),
  attachmentIds: jsonb("attachment_ids").notNull().default(sql`'[]'::jsonb`),
  attestedUpToSeq: bigint("attested_up_to_seq", { mode: "number" }).notNull(),
  attestedUpToMessageId: uuid("attested_up_to_message_id"),
  newMessageCountAtHold: integer("new_message_count_at_hold").notNull(),
  reholdCount: integer("rehold_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [
  uniqueIndex("idx_attested_send_pending_drafts_agent_channel").on(t.agentId, t.channelId),
  index("idx_attested_send_pending_drafts_expires_at").on(t.expiresAt),
]);

export const attestedSendDraftOutcomes = pgTable("attested_send_draft_outcomes", {
  draftId: text("draft_id").primaryKey(),
  outcome: text("outcome", { enum: ["expired", "replaced"] }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [
  index("idx_attested_send_draft_outcomes_expires_at").on(t.expiresAt),
]);

// Agent permission scopes — single-row-per-agent grant set.
//
// Locked at #proj-permission:10bdc2c9 (2026-05-10). Design decisions:
//
//   • One row per agent — `scopes` is a JSON array of grantable scope
//     literals (see shared/agentScopes.ts). Whole-set updates are atomic
//     and the cache invalidation event payload is just the new array.
//
//   • Intrinsic scopes are NOT stored. They're inherent to "being an
//     agent" — `auth:whoami`, `profile:*`, `reminder:*` — and the
//     server's `hasScope()` check short-circuits them independent of
//     this table. Storing them would invite drift between the literal
//     contract and the runtime check.
//
//   • Absent row = "not yet seeded". The agent service backfills with
//     the default-on set on first read; `revision` starts at 1 then.
//     Treating "no row" as "no scopes" would silently break every agent
//     created before this migration lands.
//
//   • `revision` is a monotonic int bumped on every write, used by the
//     daemon ws cache to short-circuit redundant invalidations on
//     reconnect (no need to re-broadcast if revision matches).
export const agentScopes = pgTable("agent_scopes", {
  agentId: uuid("agent_id").primaryKey().references(() => agents.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  // JSON array of grantable scope literals. Type pinned in service layer
  // via `sanitizeGrantedScopes()`; stored as untyped `text[]`-equivalent
  // JSON for migration-friendliness (additive splits don't need a schema
  // change).
  scopes: jsonb("scopes").notNull().default(sql`'[]'::jsonb`),
  // Bumped on every write — daemon-side scope cache uses it to detect
  // out-of-order invalidations on reconnect.
  revision: integer("revision").notNull().default(1),
  // Audit pointer to the human who last edited the grant set. Null when
  // the row was created by the agent service backfill (default seed).
  updatedByUserId: uuid("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
  // default: follows the system default grant set, including future
  // default-enabled capabilities. custom: human edited this agent; future
  // capabilities stay off until explicitly enabled.
  mode: text("mode", { enum: ["default", "custom"] }).notNull().default("default"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_agent_scopes_server").on(t.serverId),
]);

// External agent credentials — `sk_agent_*` runtime principals
// (`docs/server/slock-credential-rfc.zh.html#section-credential-model`).
//
// Long-lived bearer keys minted by exchanging a gated agent bootstrap token, or
// minted directly by a `sk_computer_*`-authenticated Computer via
// `/internal/computer/runners/:agentId/credentials`. One row
// per credential, bound to exactly one `agentId` for life. NEVER reassigned
// to a different agent — a fresh credential is issued instead. Rows are
// NEVER deleted; revoked rows stay for audit.
//
// Auth flow (see `authenticateAgentCredential` middleware):
//   1. CLI / Runner presents `Authorization: Bearer sk_agent_*`
//   2. middleware extracts `apiKeyPrefix`
//      → SELECT row WHERE prefix = ? AND revoked_at IS NULL
//        (served by partial index `idx_agent_credentials_prefix_active`)
//   3. argon2id verify on `apiKeyHash`
//   4. on success: `req.actingAgentId = row.agentId`,
//      `req.principalKind = 'agent_credential'`,
//      `req.agentCredentialId = row.id`,
//      `req.agentCredentialScopes = row.scopes`
//
// v0.8 active surface (route allowlist via `routeAuthPolicy` registry, see
// `internalAgentApiRouter` at `routes/internalAgentApi.ts`):
//   GET    /internal/agent-api                         — whoami
//   GET    /internal/agent-api/server
//   POST   /internal/agent-api/send
//   GET    /internal/agent-api/history
//   GET    /internal/agent-api/mentions
//   POST   /internal/agent-api/tasks/claim
//   POST   /internal/agent-api/messages/:msgId/reactions
//   DELETE /internal/agent-api/messages/:msgId/reactions
//   POST   /internal/agent-api/channels/:channelId/join
//   POST   /internal/agent-api/channels/:channelId/leave
//   GET    /internal/agent-api/events?since=<seq|latest> — catch-up envelope
//
// Explicitly NOT permitted in v0 (returns 401 `invalid_principal` via the
// auth-policy registry — wrong-principal class, not a 404):
//   /daemon/connect              — legacy server session only (`sk_machine_*`)
//   /internal/machine/*          — legacy server session clientType only
//   /internal/computer/*         — Computer-host scope only
//   /api/agents/:id/credentials/* — admin self-management forbidden for sk_agent_*
//
// Key isolation invariant
// (`docs/server/slock-credential-rfc.zh.html#section-credential-isolation`):
// the raw `sk_agent_*` value lives only in the server response at mint time
// and then inside the daemon/server-session worker private boundary. Managed
// runtime env, tool shells, workspace files, and wrapper scripts must not
// contain the raw key or a readable key-file pointer.
//
// Capability enforcement (Computer RFC §7.2):
//   authorized_for(request) := request.capability
//     ∈ (credential.max_capabilities ∩ session.active_capabilities)
// The `scopes` column below is the MAX side of that intersection.
// Per-session active capabilities live on a separate runtime channel and
// are not stored on the credential row.
export const agentCredentials = pgTable("agent_credentials", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  // argon2id of the raw `sk_agent_*` key. Returned exactly once at mint;
  // never persisted in raw form. Verified constant-time post-lookup.
  apiKeyHash: text("api_key_hash").notNull(),
  // First N chars of raw key for O(1) lookup at auth time. Not identity —
  // a `tokenLookupHash`-style HMAC could replace it later, but partial-
  // prefix is enough at v0 scale and matches the existing `sk_machine_*`
  // shape on `machines.api_key_prefix`.
  apiKeyPrefix: text("api_key_prefix").notNull(),
  // Human-readable label set at issue time (e.g. "ci-runner-1",
  // "computer-Maria-runner-claude"). Optional.
  name: text("name"),
  // MAX capability set — the upper bound on what this credential can do.
  // v0.8 active enum: ['send','read','mentions','tasks','reactions','server','channels','knowledge'].
  // ['workspace'] is reserved-not-active in v0. Route allowlist is the
  // actual enforcement; this column is the audit + future-cap stub.
  scopes: text("scopes").array().notNull(),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Last-use observability triple (best-effort; updated post-auth).
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  lastUsedIp: text("last_used_ip"),
  lastUsedUserAgent: text("last_used_user_agent"),
  // Soft revoke; row stays for audit. Revoked rows are skipped at auth
  // time by the partial index `idx_agent_credentials_prefix_active`
  // (added via raw SQL in the migration — drizzle-kit's `WHERE` support
  // on btree indexes is limited, so the partial-index DDL is hand-rolled).
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedByUserId: uuid("revoked_by_user_id").references(() => users.id, { onDelete: "set null" }),
  revokedReason: text("revoked_reason"),
}, (t) => [
  index("idx_agent_credentials_prefix").on(t.apiKeyPrefix),
  index("idx_agent_credentials_agent").on(t.agentId),
  // Partial index `idx_agent_credentials_prefix_active` is appended to
  // the canonical migration as raw SQL — see drizzle migration
  // `0072_*` step 2.
]);

// Agent bootstrap tokens — single-use tokens minted by the web admin UI
// (`docs/server/slock-credential-rfc.zh.html#section-credential-model`) and
// exchanged at the gated `POST /api/agent/login` primitive for a long-lived
// `sk_agent_*` credential. #1836 keeps the model and primitive testable, but
// does not publish self-hosted-runner CLI onboarding.
//
// Out-of-scope for v0.8 (no separate `provisioning_mode` column needed):
//   - Internal-trusted rows (born-consumed audit only); the Computer-host
//     mint surface (`POST /internal/computer/runners/:agentId/credentials`)
//     mints directly without going through a bootstrap token row.
//   - External-host-login scope — that belongs to the separate
//     `xx/agent-login-v0` workstream (machine-credential issuance), not the
//     RFC v0.8 agent-runner scope.
//
// Exchange flow (RFC §9.1 step 1, §7 invariants):
//   1. SELECT row WHERE token_lookup_hash = HMAC(pepper, raw_token)
//      AND consumed_at IS NULL AND revoked_at IS NULL
//      AND ttl_expires_at > NOW()
//   2. argon2id verify on token_hash
//   3. mint a new agent_credentials row (apiKey returned once)
//   4. UPDATE consumed_at = NOW(), consumed_credential_id = <new>
//      with a WHERE consumed_at IS NULL guard so concurrent racers see
//      one 200 + one 410 token_consumed
//
// Soft revoke (`revoked_at` / `revoked_by_user_id` / `revoked_reason`):
// admins can void a token before exchange. Rows are NEVER deleted.
//
// Single-purpose: this table mints `sk_agent_*` credentials only. The
// `scope` column from the original `xx/agent-credential-v0` reference branch
// is dropped because v0.8's bootstrap_tokens contract has exactly one
// scope. A future `provisioning_mode` / `scope` axis can be added if the
// internal-trusted or external-host-login paths land later.
export const agentBootstrapTokens = pgTable("agent_bootstrap_tokens", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  // HMAC-SHA-256(server_pepper, raw_token) as raw bytes. Deterministic and
  // unique — the row is located by this column at exchange time. The pepper
  // lives in `AGENT_BOOTSTRAP_TOKEN_PEPPER` env (required at boot).
  tokenLookupHash: customType<{ data: Buffer; driverData: Buffer }>({
    dataType: () => "bytea",
  })("token_lookup_hash").notNull().unique(),
  // argon2id of raw token. Constant-time secret verifier; only used AFTER
  // the row is located by tokenLookupHash.
  tokenHash: text("token_hash").notNull(),
  // First N chars of raw token for display in admin UI (e.g. "abtk_a1b2...").
  // Not identity — never used for lookup. The raw token itself is shown to
  // the issuer exactly once at mint time.
  tokenPrefix: text("token_prefix").notNull(),
  // Bound at issue time. The minted credential will reference this agent.
  targetAgentId: uuid("target_agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  // User who issued the token (audit trail; NOT used for ownership decisions
  // — those are evaluated at issue time against the agent row).
  issuedByUserId: uuid("issued_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // MAX capability set baked into the minted credential. Stored on the
  // bootstrap row so the issuer's choice is preserved across exchange.
// v0.8 active enum: ['send','read','mentions','tasks','reactions','server','channels','knowledge'].
  scopes: text("scopes").array().notNull(),
  // Default TTL is 30 minutes per RFC §7; admin can override at issue time.
  ttlExpiresAt: timestamp("ttl_expires_at", { withTimezone: true }).notNull(),
  // NULL until exchange completes successfully. Once set, the token is dead;
  // re-exchange returns 410 token_consumed.
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  consumedCredentialId: uuid("consumed_credential_id"),
  consumedIp: text("consumed_ip"),
  consumedUserAgent: text("consumed_user_agent"),
  // Soft revoke; row stays for audit.
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedByUserId: uuid("revoked_by_user_id").references(() => users.id, { onDelete: "set null" }),
  revokedReason: text("revoked_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_agent_bootstrap_tokens_agent").on(t.targetAgentId),
  index("idx_agent_bootstrap_tokens_server").on(t.serverId),
  // Hot-path exchange index: filters out consumed/revoked rows so the
  // exchange query never argon2-verifies against a dead token. drizzle-kit's
  // partial-index support is limited, so this is appended as raw SQL in the
  // migration alongside `idx_agent_credentials_prefix_active`.
]);

// Device-code authorization grants — task #30 PR-A2 (RFC v0.8 contract v3
// §3/§5/§9). The SHARED pre-credential login primitive behind the generic
// `/api/auth/device/*` surface, consumed by BOTH `slock-computer login` AND
// self-managed / external-agent `slock-cli login`. Deliberately NOT named
// `computer_device_authorizations`: contract v3 §5 forbids a Computer-only
// shaped login path (it cited `computer_device_authorizations` only as an
// illustrative example); a generic name matches the locked shared-primitive
// + generic-namespace requirement. Device-code login is a pre-credential
// grant, NOT a Slock principal: it establishes a user identity/session that
// `attach` (sk_computer_*) or self-managed agent bootstrap later consumes
// under the proper principal/surface contract — it never mints sk_computer_*
// or sk_agent_* itself.
//
// Lifecycle model is intentionally aligned 1:1 with `agentBootstrapTokens`
// (RFC §9 binding): HMAC lookup-hash for O(1) location, argon2id secret
// verifier, single-consume, soft revoke / NEVER deleted (rows stay for
// audit), stable fail-closed errors, zero existence enumeration.
//
// Principal phases (contract v3 §3 — three distinct phases, NO new
// principal type):
//   POST /api/auth/device/authorize  — unauthenticated public, env/feature
//                                       gated; issues device_code + user_code
//   POST /api/auth/device/approve    — USER-authenticated (only auth phase);
//                                       binds approvedByUserId
//   POST /api/auth/device/token      — unauthenticated public poll; on a
//                                       legitimately approved+unconsumed grant
//                                       issues the user session, single-consume
// These `/api/*` routes are OUT of `routeAuthPolicy` BY DESIGN (pre-credential
// `/api/*`, not claimed `/internal/*`) — documented intentional, not an omission.
export const deviceAuthorizations = pgTable("device_authorizations", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  // HMAC-SHA-256(server_pepper, raw_device_code) as raw bytes. Deterministic
  // + unique — the row is located by this at poll time. Pepper reuses the
  // existing bootstrap-token pepper env (same lifecycle model).
  deviceCodeLookupHash: customType<{ data: Buffer; driverData: Buffer }>({
    dataType: () => "bytea",
  })("device_code_lookup_hash").notNull().unique(),
  // argon2id of the raw device_code. Constant-time verifier; only used AFTER
  // the row is located by deviceCodeLookupHash.
  deviceCodeHash: text("device_code_hash").notNull(),
  // Short human-entered/-displayed code (e.g. "WXYZ-1234"). Unique so the
  // user-authenticated approve phase can locate the pending grant. Never a
  // secret verifier — the device_code is. Shown to the user exactly once.
  userCode: text("user_code").notNull().unique(),
  // pending | approved | denied | expired | consumed. Soft state; row is
  // NEVER deleted (audit). Hot-path poll rejects any non-approved/consumed.
  status: text("status").notNull().default("pending"),
  // Optional requesting-client label for audit ("slock-computer"/"slock-cli").
  // Not identity, not used for any decision.
  clientName: text("client_name"),
  // Set ONLY at the user-authenticated approve phase — the established user
  // identity the later session is issued for. NULL until approved.
  approvedByUserId: uuid("approved_by_user_id").references(() => users.id, { onDelete: "set null" }),
  // device_code TTL (RFC-8628-style, default ~10min, set at authorize).
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  // Minimum client poll interval (seconds); slow_down may raise it.
  pollIntervalSeconds: integer("poll_interval_seconds").notNull().default(5),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  deniedAt: timestamp("denied_at", { withTimezone: true }),
  // NULL until the token phase issues the user session. Once set the grant
  // is dead; re-poll returns the consumed error. Single-consume guard.
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  consumedSessionId: uuid("consumed_session_id"),
  consumedIp: text("consumed_ip"),
  consumedUserAgent: text("consumed_user_agent"),
  // Soft revoke; row stays for audit.
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedByUserId: uuid("revoked_by_user_id").references(() => users.id, { onDelete: "set null" }),
  revokedReason: text("revoked_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_device_authorizations_approved_by").on(t.approvedByUserId),
  index("idx_device_authorizations_expires_at").on(t.expiresAt),
]);

// Computer host attachments — `sk_computer_*` runtime principals
// (`docs/server/slock-credential-rfc.zh.html#section-credential-model`).
//
// Slice-1 minimal stub: just enough surface area to authenticate the
// Computer-host that calls `POST /internal/computer/runners/:agentId/credentials`
// (Computer RFC §9.1 step 2 — Computer-requested runner credential mint).
//
// Tao's Phase 1 work owns the canonical Computer attachment lifecycle
// (attach/detach UX flow, ScopeDB triple-sink, credential-replace path on
// re-attach). Slice-1 reconciles with that shape when Phase 1 lands —
// expect column additions (host_machine_id FK, attach_token_id reference,
// last_seen_at observability) but the core (id, server_id, api_key_hash,
// api_key_prefix, revoked_at) is contract-stable.
//
// Auth flow (see `requireComputerAuth` middleware, RFC §6.2):
//   1. Computer host presents `Authorization: Bearer sk_computer_*`
//   2. middleware extracts `api_key_prefix`
//      → SELECT row WHERE prefix = ? AND revoked_at IS NULL
//        (served by partial index `idx_computers_prefix_active`)
//   3. argon2id verify on `api_key_hash`
//   4. on success: `req.computerId = row.id`,
//      `req.principalKind = 'computer'`,
//      `req.serverId = row.serverId`
//
// v0 active surface (route allowlist via `routeAuthPolicy` registry):
//   POST   /internal/computer/runners/:agentId/credentials  — runner mint
//
// Cross-principal rejection (RFC §5.6): an `sk_computer_*` key presented
// at any non-`/internal/computer/*` path returns 401 `invalid_principal`.
// Reciprocal on `/internal/computer/*` for sk_machine_*/sk_agent_*.
//
// Soft revoke (`revoked_at` / `revoked_by_user_id` / `revoked_reason`):
// rows are NEVER deleted; revoked rows stay for audit and are skipped at
// auth time by the partial index.
export const computers = pgTable("computers", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  serverId: uuid("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  // Human-readable label (e.g. "Maria-laptop"). Set at attach time.
  name: text("name").notNull(),
  // argon2id of the raw `sk_computer_*` key. Returned exactly once at
  // attach time; never persisted in raw form.
  apiKeyHash: text("api_key_hash").notNull(),
  // First N chars of raw key for O(1) lookup at auth time.
  apiKeyPrefix: text("api_key_prefix").notNull(),
  // User who attached the Computer (audit trail). May be null for
  // future device-code / bootstrap-token attachment flows.
  attachedByUserId: uuid("attached_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Last-use observability triple (best-effort).
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  lastUsedIp: text("last_used_ip"),
  lastUsedUserAgent: text("last_used_user_agent"),
  // Soft revoke; row stays for audit.
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedByUserId: uuid("revoked_by_user_id").references(() => users.id, { onDelete: "set null" }),
  revokedReason: text("revoked_reason"),
  // task #30 PR-F — the `machines` (daemons) row this Computer presents
  // as to the orchestrator. A Computer attaching connects /daemon/connect
  // with its sk_computer_*; the gate resolves Computer → this linked
  // machine and hands the EXISTING machine object to the unchanged
  // WS/orchestrator path (no orchestrator fork, no agent-table change —
  // agents bind to a Computer via the normal agents.machineId = this id).
  // Nullable: backfilled lazily on attach; rows predating PR-F have none.
  machineId: uuid("machine_id").references(() => machines.id, { onDelete: "set null" }),
}, (t) => [
  index("idx_computers_prefix").on(t.apiKeyPrefix),
  index("idx_computers_server").on(t.serverId),
  // Partial index `idx_computers_prefix_active` is appended to the
  // canonical migration as raw SQL — see drizzle migration `0074_*`.
]);
