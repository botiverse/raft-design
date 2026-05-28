import { Router, type Router as RouterType } from "express";
import { randomUUID } from "node:crypto";
import type { Server as SocketServer } from "socket.io";
import { and, eq, inArray, isNull } from "drizzle-orm";
import * as serverService from "../services/serverService.js";
import * as machineService from "../services/machineService.js";
import * as agentService from "../services/agentService.js";
import * as channelService from "../services/channelService.js";
import * as inviteService from "../services/inviteService.js";
import * as onboardingService from "../services/onboardingService.js";
import * as userService from "../services/userService.js";
import * as serverAgreementService from "../services/serverAgreementService.js";
import { countAgents, countMachines, countChannels, getHistoryCutoff } from "../services/planService.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import { buildMachineReadModel } from "../services/machineReadModel.js";
import { getLatestDaemonVersion } from "../services/daemonVersionService.js";
import { isTranslationProviderConfigured } from "../services/messageTranslationService.js";
import { getFlyInstanceForMachine } from "../replicaRouter.js";
import { INVALID_EMAIL_MESSAGE, canChangeMemberRole, hasServerCapability, validateEmailAddress, MANAGEABLE_SERVER_ROLES, type ManageableServerRole, type ServerPlan, type ServerRole } from "@slock-ai/shared";
import { createScopeAttestation } from "../lib/scopeAttestation.js";
import { getDb } from "../db/index.js";
import { agents as agentsTable, channelAgents, channelHumans } from "../db/schema.js";
import { requireServerMatchesParam } from "../middleware/auth.js";
import { addTraceEvent, createTraceDbQueryTracer, tracePhase } from "../tracing/semanticTrace.js";
import type { DbQueryTracer } from "../tracing/dbQueryTrace.js";

export const serverRouter: RouterType = Router();

const SCOPE_ATTESTATION_TTL_MS = 10 * 60 * 1000;
const ONBOARDING_WIZARD_STEPS = new Set([
  "add-computer",
  "create-agent",
  "referral-source",
  "invite-teammates",
  "join-community",
  "enable-notifications",
  "complete",
]);

type CreateScopeAttestationRequest = {
  scope: string;
};

function normalizeOrderIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    if (seen.has(item)) continue;
    seen.add(item);
    ids.push(item);
  }
  return ids;
}

const SIDEBAR_SORT_MODES = new Set(["manual", "recent", "az"]);
const CHANNEL_PANEL_TAB_IDS = new Set(["chat", "tasks", "files"]);
const AGENT_PANEL_TAB_IDS = new Set(["profile", "permissions", "dms", "reminders", "workspace", "activity"]);
type ServerMemberProfile = NonNullable<Awaited<ReturnType<typeof serverService.getServerMemberProfile>>>;
type JointHumanProfile = Pick<ServerMemberProfile, "userId" | "name" | "displayName" | "description" | "avatarUrl"> & {
  serverId: string;
  serverName: string;
  serverSlug: string;
  email: null;
  gravatarHash: "";
  role: null;
  joinedAt: null;
  membershipStatus: "active";
  createdAgents: [];
};

function normalizeSidebarSortMode(value: unknown): "manual" | "recent" | "az" | null {
  return typeof value === "string" && SIDEBAR_SORT_MODES.has(value)
    ? (value as "manual" | "recent" | "az")
    : null;
}

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, idx) => value === b[idx]);
}

function toJointHumanProfile(profile: ServerMemberProfile | null): JointHumanProfile | null {
  if (!profile) return profile;
  return {
    // Joint-channel human profile visibility is identity-only. Do not leak
    // peer-server private/member graph details such as role, email-derived
    // gravatar hash, join date, or agents created outside the shared channel.
    userId: profile.userId,
    serverId: profile.serverId,
    serverName: profile.serverName,
    serverSlug: profile.serverSlug,
    name: profile.name,
    displayName: profile.displayName,
    description: profile.description,
    avatarUrl: profile.avatarUrl,
    email: null,
    gravatarHash: "",
    role: null,
    joinedAt: null,
    membershipStatus: "active",
    createdAgents: [],
  };
}

function parseCreateScopeAttestationRequest(raw: unknown): CreateScopeAttestationRequest {
  if (!raw || typeof raw !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const body = raw as Record<string, unknown>;
  const scope = typeof body.scope === "string"
    ? body.scope.trim()
    : "";

  if (!scope) {
    throw new Error("scope is required");
  }

  return { scope };
}

function getAgreementRequestMetadata(req: { ip?: string; get: (name: string) => string | undefined }) {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
}

function traceRouteFailure(name: string, err: unknown, attrs: Record<string, unknown> = {}) {
  addTraceEvent(name, {
    error_class: err instanceof Error ? err.name : typeof err,
    ...attrs,
  });
}

async function canCreateScopeAttestation(serverId: string, userId: string, scope: string) {
  const role = await serverService.getMemberRole(serverId, userId);
  if (!role) {
    return null;
  }

  switch (scope) {
    case "web-trace-batch:create":
      return true;
    case "feedback-report:create":
      return hasServerCapability(role, "manageAgents");
    default:
      return null;
  }
}

function scopeAttestationAudience(scope: string): string | null {
  switch (scope) {
    case "web-trace-batch:create":
      return "trace-ingest-worker";
    default:
      return null;
  }
}

function scopeAttestationResource(scope: string, serverId: string): string | null {
  switch (scope) {
    case "web-trace-batch:create":
      return `servers/${serverId}/web-traces`;
    default:
      return null;
  }
}

function filterOrderIds(ids: string[], allowedIds: Set<string>): string[] {
  const next: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!allowedIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    next.push(id);
  }
  return next;
}

async function getAllowedSidebarIds(serverId: string, userId: string, opts: { traceQuery?: DbQueryTracer } = {}) {
  const [channels, agents, dms, removedPeerDmIds] = await Promise.all([
    channelService.listChannels(serverId, userId, { traceQuery: opts.traceQuery }),
    agentService.listAgents(serverId, false, { traceQuery: opts.traceQuery }),
    channelService.listDMChannels(serverId, userId, { traceQuery: opts.traceQuery }),
    channelService.listUserDMChannelIdsIncludingRemoved(serverId, userId, { traceQuery: opts.traceQuery }),
  ]);
  const dmIds = new Set([...dms.map((dm) => dm.id), ...removedPeerDmIds]);

  return {
    channelIds: new Set(channels.map((channel) => channel.id)),
    agentIds: new Set(agents.map((agent) => agent.id)),
    dmIds,
    channelsCount: channels.length,
    agentsCount: agents.length,
    dmsCount: dms.length,
    removedPeerDmIdsCount: removedPeerDmIds.length,
  };
}

// List user's servers
serverRouter.get("/", async (req, res) => {
  try {
    const servers = await serverService.getUserServers(req.userId!);
    res.json(servers);
  } catch {
    res.status(500).json({ error: "Failed to list servers" });
  }
});

// Aggregate unread counts by server for the current user.
// Used by the web sidebar to show "other servers have unread" indicators.
serverRouter.get("/unread-summary", async (req, res) => {
  try {
    addTraceEvent("unread_summary.load.started");
    const memberships = await tracePhase(
      () => serverService.getUserServers(req.userId!, {
        traceQuery: createTraceDbQueryTracer("server_memberships.loaded"),
      }),
      (_durationMs, result) => ({
        name: "server_memberships.loaded",
        attrs: {
          servers_count: result.length,
        },
      }),
    );
    const summaryInputs = memberships.map((membership) => {
      const historyCutoff = getHistoryCutoff((membership.plan ?? "free") as ServerPlan);
      return {
        serverId: membership.id,
        historyCutoff,
      };
    });
    const unreadCounts = await tracePhase(
      () => channelService.getSidebarUnreadSummaryCounts(summaryInputs, req.userId!, {
        traceQuery: createTraceDbQueryTracer("unread_summary.loaded"),
      }),
      (_durationMs, result) => {
        const counts = Object.values(result);
        return {
          name: "unread_summary.loaded",
          attrs: {
            servers_count: memberships.length,
            servers_with_unread_count: counts.filter((count) => count > 0).length,
            total_unread_count: counts.reduce((sum, count) => sum + count, 0),
            history_cutoff_present_count: summaryInputs.filter((input) => Boolean(input.historyCutoff)).length,
          },
        };
      },
    );
    const summary = memberships.map((membership) => ({
      serverId: membership.id,
      unreadCount: unreadCounts[membership.id] ?? 0,
    }));
    addTraceEvent("response.ready", {
      servers_count: summary.length,
      servers_with_unread_count: summary.filter((item) => item.unreadCount > 0).length,
      total_unread_count: summary.reduce((sum, item) => sum + item.unreadCount, 0),
    });
    res.json(summary);
  } catch {
    res.status(500).json({ error: "Failed to get unread summary" });
  }
});

// Create server
serverRouter.post("/", async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: "Name and slug are required" });
      return;
    }
    // Validate slug format and length
    if (slug.length < 5) {
      res.status(400).json({ error: "Slug must be at least 5 characters" });
      return;
    }
    if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
      res.status(400).json({ error: "Slug must start with a letter and contain only lowercase letters, numbers, and hyphens" });
      return;
    }
    const server = await serverService.createServer(name, slug, req.userId!);
    res.json(server);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("already taken")) {
      res.status(409).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to create server" });
    }
  }
});

// Join the canonical community server. User-scoped (no `:id` path), so any
// authenticated user can join without providing X-Server-Id. Reuses the
// same `addMember` path as accept-invite but does not require an invite
// token — all registered users are allowed to join the community server.
// Registration order: must come BEFORE the `/:id` lockdown below so
// "community" is not treated as a server id.
serverRouter.post("/join-community", async (req, res) => {
  try {
    const agreementId = typeof req.body?.agreementId === "string" ? req.body.agreementId : null;
    const rawSlug = req.body?.slug;
    if (rawSlug !== undefined && !inviteService.isCommunityServerSlug(rawSlug)) {
      res.status(400).json({ error: "Unsupported community server slug" });
      return;
    }
    const result = await inviteService.joinCommunityServer(req.userId!, {
      agreementId,
      slug: rawSlug,
      ...getAgreementRequestMetadata(req),
    });
    const io = req.app.get("io") as SocketServer | undefined;
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    if (io) {
      io.to(`server:${result.serverId}`).emit("server:member-added", {
        serverId: result.serverId,
        userId: req.userId!,
      });
      if (agentOrchestrator) {
        void onboardingService.triggerNewMemberOnboarding(io, agentOrchestrator, result.serverId, req.userId!).catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[Onboarding] Failed to trigger member onboarding after community join for ${req.userId}: ${msg}`);
        });
      }
    }
    res.json(result);
  } catch (err: any) {
    const agreementResponse = serverAgreementService.agreementErrorResponse(err);
    if (agreementResponse) {
      res.status(agreementResponse.status).json(agreementResponse.body);
      return;
    }
    const msg = err?.message || "";
    if (msg.includes("not available")) {
      res.status(404).json({ error: msg });
    } else if (msg.includes("already")) {
      res.status(400).json({ error: msg });
    } else {
      console.error("Join community error:", err);
      res.status(500).json({ error: "Failed to join community server" });
    }
  }
});

// Lockdown middleware for all `/:id/*` sub-routes: X-Server-Id header must
// match the URL `:id` and the caller must be a non-deleted member. The
// no-`:id` routes above (list, create, unread-summary, join-community) are
// intentionally not covered — they are user-scoped, not server-scoped.
// Registration order matters: this must come AFTER the no-`:id` handlers so
// they can match first (otherwise "/unread-summary" would be captured as `:id`).
// Introduced 2026-04-19 for #proj-security task #10 (msg=256c4eda).
serverRouter.use("/:id", requireServerMatchesParam);

serverRouter.get("/:id/agreement", async (req, res) => {
  try {
    const isOwner = await serverService.userIsServerOwner(req.params.id, req.userId!);
    if (!isOwner) {
      res.status(403).json({ error: "Only the server owner can manage the pre-join agreement" });
      return;
    }
    const active = await serverAgreementService.getActiveAgreement(req.params.id);
    res.json({
      enabled: !!active,
      agreement: active,
    });
  } catch {
    res.status(500).json({ error: "Failed to load pre-join agreement" });
  }
});

serverRouter.put("/:id/agreement", async (req, res) => {
  try {
    const isOwner = await serverService.userIsServerOwner(req.params.id, req.userId!);
    if (!isOwner) {
      res.status(403).json({ error: "Only the server owner can manage the pre-join agreement" });
      return;
    }
    const enabled = req.body?.enabled === true;
    const active = await serverAgreementService.configureAgreement(req.params.id, req.userId!, {
      enabled,
      title: typeof req.body?.title === "string" ? req.body.title : "",
      bodyMarkdown: typeof req.body?.bodyMarkdown === "string" ? req.body.bodyMarkdown : "",
    });
    res.json({
      enabled: !!active,
      agreement: active,
    });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("required") || msg.includes("500 characters")) {
      res.status(400).json({ error: msg });
      return;
    }
    console.error("Update pre-join agreement error:", err);
    res.status(500).json({ error: "Failed to update pre-join agreement" });
  }
});

// Archive (soft-delete) server — owner only
serverRouter.delete("/:id", async (req, res) => {
  try {
    const isOwner = await serverService.userIsServerOwner(req.params.id, req.userId!);
    if (!isOwner) {
      res.status(403).json({ error: "Only the server owner can delete a server" });
      return;
    }
    const memberIds = await serverService.listServerMemberIds(req.params.id);
    await serverService.deleteServer(req.params.id);
    const io = req.app.get("io") as SocketServer | undefined;
    // Non-authoritative domain event for clients already in the deleted server room.
    // The per-user membership removal below is the contract that clears stale server lists.
    io?.to(`server:${req.params.id}`).emit("server:deleted", {
      serverId: req.params.id,
    });
    for (const userId of memberIds) {
      io?.to(`user:${userId}`).emit("server:membership-removed", {
        serverId: req.params.id,
      });
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete server" });
  }
});

// Update server profile (name) — owner/admin
serverRouter.patch("/:id", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can edit the server profile" });
      return;
    }

    const { name, hideHumansFromMembers } = req.body ?? {};
    const updates: { name?: string; hideHumansFromMembers?: boolean } = {};

    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400).json({ error: "Name must be a string" });
        return;
      }
      const trimmed = name.trim();
      if (!trimmed) {
        res.status(400).json({ error: "Name is required" });
        return;
      }
      if (trimmed.length > 100) {
        res.status(400).json({ error: "Name must be 100 characters or fewer" });
        return;
      }
      updates.name = trimmed;
    }

    if (hideHumansFromMembers !== undefined) {
      if (typeof hideHumansFromMembers !== "boolean") {
        res.status(400).json({ error: "hideHumansFromMembers must be a boolean" });
        return;
      }
      updates.hideHumansFromMembers = hideHumansFromMembers;
    }

    if (updates.name === undefined && updates.hideHumansFromMembers === undefined) {
      res.status(400).json({ error: "At least one field is required" });
      return;
    }

    const updated = await serverService.updateServerProfile(req.params.id, updates);
    if (!updated) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update server" });
  }
});

// Leave server — any member can self-remove as long as at least one owner remains.
serverRouter.post("/:id/leave", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (callerRole === "owner") {
      const ownerCount = await serverService.countOwners(req.params.id);
      if (ownerCount <= 1) {
        res.status(405).json({ error: "A server must have at least one owner. Add another owner before leaving." });
        return;
      }
    }

    await serverService.removeMember(req.params.id, req.userId!);

    const io = req.app.get("io") as SocketServer | undefined;
    if (io) {
      io.to(`server:${req.params.id}`).emit("server:member:left", {
        serverId: req.params.id,
        userId: req.userId,
      });
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to leave server" });
  }
});

// Get server details (requires membership)
serverRouter.get("/:id", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    const server = await serverService.getServer(req.params.id);
    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    res.json(server);
  } catch {
    res.status(500).json({ error: "Failed to get server" });
  }
});

// Get onboarding settings for current member + server
serverRouter.get("/:id/onboarding-settings", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const [settings, prefs] = await Promise.all([
      serverService.getServerOnboardingSettings(req.params.id),
      serverService.getMemberOnboardingPreferences(req.params.id, req.userId!),
    ]);
    if (!settings || !prefs) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.json({
      onboardingAgentId: settings.onboardingAgentId ?? null,
      agentAllChannelGreetingEnabled: settings.agentAllChannelGreetingEnabled,
      setupModalReminderOptOut: prefs.setupModalReminderOptOut,
      // Backward-compatible alias for older clients.
      onboardingReminderOptOut: prefs.setupModalReminderOptOut,
      dismissedAddComputerStepAt: prefs.dismissedAddComputerStepAt,
      dismissedCreateAgentStepAt: prefs.dismissedCreateAgentStepAt,
      dismissedInviteStepAt: prefs.dismissedInviteStepAt,
      dismissedCommunityStepAt: prefs.dismissedCommunityStepAt,
      dismissedNotificationStepAt: prefs.dismissedNotificationStepAt,
      onboardingWizardCurrentStep: prefs.onboardingWizardCurrentStep,
      onboardingDmSentAt: prefs.onboardingDmSentAt,
      onboardingDmSentByAgentId: prefs.onboardingDmSentByAgentId,
    });
  } catch {
    res.status(500).json({ error: "Failed to get onboarding settings" });
  }
});

// Update onboarding settings:
// - owner/admin can set onboardingAgentId
// - any member can update their own setupModalReminderOptOut
serverRouter.patch("/:id/onboarding-settings", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const rawOnboardingAgentId = req.body?.onboardingAgentId;
    const rawAgentAllChannelGreetingEnabled = req.body?.agentAllChannelGreetingEnabled;
    // Accept both names during rollout; canonical key is setupModalReminderOptOut.
    const rawSetupModalReminderOptOut = req.body?.setupModalReminderOptOut ?? req.body?.onboardingReminderOptOut;
    const rawDismissedAddComputerStep = req.body?.dismissedAddComputerStep;
    const rawDismissedCreateAgentStep = req.body?.dismissedCreateAgentStep;
    const rawDismissedInviteStep = req.body?.dismissedInviteStep;
    const rawDismissedCommunityStep = req.body?.dismissedCommunityStep;
    const rawDismissedNotificationStep = req.body?.dismissedNotificationStep;
    const rawOnboardingWizardCurrentStep = req.body?.onboardingWizardCurrentStep;

    const updatesAgent =
      rawOnboardingAgentId === null || typeof rawOnboardingAgentId === "string";
    const updatesGreeting = typeof rawAgentAllChannelGreetingEnabled === "boolean";
    const updatesReminder = typeof rawSetupModalReminderOptOut === "boolean";
    const updatesAddComputerStep = typeof rawDismissedAddComputerStep === "boolean";
    const updatesCreateAgentStep = typeof rawDismissedCreateAgentStep === "boolean";
    const updatesInviteStep = typeof rawDismissedInviteStep === "boolean";
    const updatesCommunityStep = typeof rawDismissedCommunityStep === "boolean";
    const updatesNotificationStep = typeof rawDismissedNotificationStep === "boolean";
    const updatesWizardCurrentStep =
      rawOnboardingWizardCurrentStep === null ||
      (
        typeof rawOnboardingWizardCurrentStep === "string" &&
        ONBOARDING_WIZARD_STEPS.has(rawOnboardingWizardCurrentStep)
      );

    if (rawOnboardingAgentId !== undefined && !updatesAgent) {
      res.status(400).json({ error: "onboardingAgentId must be a string or null" });
      return;
    }
    if (rawSetupModalReminderOptOut !== undefined && !updatesReminder) {
      res.status(400).json({ error: "setupModalReminderOptOut must be a boolean" });
      return;
    }
    if (rawAgentAllChannelGreetingEnabled !== undefined && !updatesGreeting) {
      res.status(400).json({ error: "agentAllChannelGreetingEnabled must be a boolean" });
      return;
    }
    if (rawDismissedAddComputerStep !== undefined && !updatesAddComputerStep) {
      res.status(400).json({ error: "dismissedAddComputerStep must be a boolean" });
      return;
    }
    if (rawDismissedCreateAgentStep !== undefined && !updatesCreateAgentStep) {
      res.status(400).json({ error: "dismissedCreateAgentStep must be a boolean" });
      return;
    }
    if (rawDismissedInviteStep !== undefined && !updatesInviteStep) {
      res.status(400).json({ error: "dismissedInviteStep must be a boolean" });
      return;
    }
    if (rawDismissedCommunityStep !== undefined && !updatesCommunityStep) {
      res.status(400).json({ error: "dismissedCommunityStep must be a boolean" });
      return;
    }
    if (rawDismissedNotificationStep !== undefined && !updatesNotificationStep) {
      res.status(400).json({ error: "dismissedNotificationStep must be a boolean" });
      return;
    }
    if (rawOnboardingWizardCurrentStep !== undefined && !updatesWizardCurrentStep) {
      res.status(400).json({ error: "onboardingWizardCurrentStep must be a valid onboarding wizard step or null" });
      return;
    }
    if (
      rawOnboardingAgentId === undefined
      && rawSetupModalReminderOptOut === undefined
      && rawAgentAllChannelGreetingEnabled === undefined
      && rawDismissedAddComputerStep === undefined
      && rawDismissedCreateAgentStep === undefined
      && rawDismissedInviteStep === undefined
      && rawDismissedCommunityStep === undefined
      && rawDismissedNotificationStep === undefined
      && rawOnboardingWizardCurrentStep === undefined
    ) {
      res.status(400).json({ error: "At least one field is required" });
      return;
    }

    if (rawOnboardingAgentId !== undefined || rawAgentAllChannelGreetingEnabled !== undefined) {
      const canManageServer = await serverService.userCanManageServer(req.params.id, req.userId!);
      if (!canManageServer) {
        res.status(403).json({ error: "Only server owners and admins can update onboarding settings" });
        return;
      }

      if (rawOnboardingAgentId) {
        const agent = await agentService.getAgent(rawOnboardingAgentId);
        if (!agent || agent.serverId !== req.params.id) {
          res.status(400).json({ error: "Onboarding agent not found in this server" });
          return;
        }
      }

      await serverService.updateServerOnboardingSettings(req.params.id, {
        ...(rawOnboardingAgentId !== undefined ? { onboardingAgentId: rawOnboardingAgentId ?? null } : {}),
        ...(rawAgentAllChannelGreetingEnabled !== undefined ? { agentAllChannelGreetingEnabled: rawAgentAllChannelGreetingEnabled } : {}),
      });
    }

    if (
      updatesReminder
      || updatesAddComputerStep
      || updatesCreateAgentStep
      || updatesInviteStep
      || updatesCommunityStep
      || updatesNotificationStep
      || updatesWizardCurrentStep
    ) {
      const now = new Date();
      await serverService.updateMemberOnboardingPreferences(req.params.id, req.userId!, {
        ...(updatesReminder ? { setupModalReminderOptOut: rawSetupModalReminderOptOut } : {}),
        ...(updatesAddComputerStep ? { dismissedAddComputerStepAt: rawDismissedAddComputerStep ? now : null } : {}),
        ...(updatesCreateAgentStep ? { dismissedCreateAgentStepAt: rawDismissedCreateAgentStep ? now : null } : {}),
        ...(updatesInviteStep ? { dismissedInviteStepAt: rawDismissedInviteStep ? now : null } : {}),
        ...(updatesCommunityStep ? { dismissedCommunityStepAt: rawDismissedCommunityStep ? now : null } : {}),
        ...(updatesNotificationStep ? { dismissedNotificationStepAt: rawDismissedNotificationStep ? now : null } : {}),
        ...(updatesWizardCurrentStep ? { onboardingWizardCurrentStep: rawOnboardingWizardCurrentStep } : {}),
      });
    }

    const [settings, prefs] = await Promise.all([
      serverService.getServerOnboardingSettings(req.params.id),
      serverService.getMemberOnboardingPreferences(req.params.id, req.userId!),
    ]);
    if (!settings || !prefs) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.json({
      onboardingAgentId: settings.onboardingAgentId ?? null,
      agentAllChannelGreetingEnabled: settings.agentAllChannelGreetingEnabled,
      setupModalReminderOptOut: prefs.setupModalReminderOptOut,
      // Backward-compatible alias for older clients.
      onboardingReminderOptOut: prefs.setupModalReminderOptOut,
      dismissedAddComputerStepAt: prefs.dismissedAddComputerStepAt,
      dismissedCreateAgentStepAt: prefs.dismissedCreateAgentStepAt,
      dismissedInviteStepAt: prefs.dismissedInviteStepAt,
      dismissedCommunityStepAt: prefs.dismissedCommunityStepAt,
      dismissedNotificationStepAt: prefs.dismissedNotificationStepAt,
      onboardingWizardCurrentStep: prefs.onboardingWizardCurrentStep,
      onboardingDmSentAt: prefs.onboardingDmSentAt,
      onboardingDmSentByAgentId: prefs.onboardingDmSentByAgentId,
    });
  } catch {
    res.status(500).json({ error: "Failed to update onboarding settings" });
  }
});

// Get translation settings for the current server.
serverRouter.get("/:id/translation-settings", async (req, res) => {
  try {
    const role = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!role) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const settings = await serverService.getServerTranslationSettings(req.params.id);
    if (!settings) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.json({
      translationEnabled: settings.translationEnabled,
      translationAvailable: isTranslationProviderConfigured(),
      canManageTranslation: hasServerCapability(role, "manageServer"),
    });
  } catch {
    res.status(500).json({ error: "Failed to get translation settings" });
  }
});

// Update translation settings for the current server.
serverRouter.patch("/:id/translation-settings", async (req, res) => {
  try {
    const role = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!role) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(role, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can update translation settings" });
      return;
    }

    const rawTranslationEnabled = req.body?.translationEnabled;
    if (typeof rawTranslationEnabled !== "boolean") {
      res.status(400).json({ error: "translationEnabled must be a boolean" });
      return;
    }

    const settings = await serverService.updateServerTranslationSettings(req.params.id, {
      translationEnabled: rawTranslationEnabled,
    });
    if (!settings) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.json({
      translationEnabled: settings.translationEnabled,
      translationAvailable: isTranslationProviderConfigured(),
      canManageTranslation: true,
    });
  } catch {
    res.status(500).json({ error: "Failed to update translation settings" });
  }
});

// Get notification settings for the current member in this server.
serverRouter.get("/:id/notification-settings", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const prefs = await serverService.getMemberNotificationPreferences(req.params.id, req.userId!);
    if (!prefs) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.json(prefs);
  } catch {
    res.status(500).json({ error: "Failed to get notification settings" });
  }
});

// Update notification settings for the current member in this server.
serverRouter.patch("/:id/notification-settings", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const rawServerPushMuted = req.body?.serverPushMuted;
    if (typeof rawServerPushMuted !== "boolean") {
      res.status(400).json({ error: "serverPushMuted must be a boolean" });
      return;
    }

    const prefs = await serverService.updateMemberNotificationPreferences(req.params.id, req.userId!, {
      serverPushMuted: rawServerPushMuted,
    });
    if (!prefs) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.json(prefs);
  } catch {
    res.status(500).json({ error: "Failed to update notification settings" });
  }
});

// Create a short-lived server-scoped scope attestation
serverRouter.post("/:id/scope-attestation", async (req, res) => {
  try {
    const { scope } = parseCreateScopeAttestationRequest(req.body);
    const allowed = await canCreateScopeAttestation(req.params.id, req.userId!, scope);

    if (allowed == null) {
      res.status(400).json({ error: `Unsupported scope: ${scope}` });
      return;
    }

    if (!allowed) {
      res.status(403).json({ error: "You are not authorized for the requested scope" });
      return;
    }

    const [user, server] = await Promise.all([
      userService.getUser(req.userId!),
      serverService.getServer(req.params.id),
    ]);

    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const expiresAt = new Date(Date.now() + SCOPE_ATTESTATION_TTL_MS);
    const attestation = createScopeAttestation({
      v: 1,
      typ: "scope-attestation",
      scope,
      sub: req.userId!,
      actorType: "user",
      email: user?.email || null,
      serverId: server.id,
      serverSlug: server.slug,
      aud: scopeAttestationAudience(scope),
      resource: scopeAttestationResource(scope, server.id),
      nonce: randomUUID(),
      exp: Math.floor(expiresAt.getTime() / 1000),
    });

    res.json({
      attestation,
      scope,
      audience: scopeAttestationAudience(scope),
      resource: scopeAttestationResource(scope, server.id),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create scope attestation";
    if (message.includes("not configured")) {
      res.status(503).json({ error: message });
      return;
    }
    if (message === "Request body must be a JSON object" || message === "scope is required" || message.startsWith("Unsupported scope:")) {
      res.status(400).json({ error: message });
      return;
    }
    res.status(500).json({ error: "Failed to create scope attestation" });
  }
});

// Get server resource usage (agent + machine counts)
serverRouter.get("/:id/usage", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    const [agents, machines, channels] = await Promise.all([
      countAgents(req.params.id),
      countMachines(req.params.id),
      countChannels(req.params.id),
    ]);
    res.json({ agents, machines, channels });
  } catch {
    res.status(500).json({ error: "Failed to get usage" });
  }
});

// Get server members
serverRouter.get("/:id/members", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    const [members, hideHumanDirectory] = await Promise.all([
      serverService.getServerMembers(req.params.id, req.userId!),
      serverService.shouldHideHumanDirectoryFromRequester(req.params.id, req.userId!),
    ]);
    res.json(hideHumanDirectory
      ? members.filter((item) => item.userId === req.userId)
      : members);
  } catch {
    res.status(500).json({ error: "Failed to get members" });
  }
});

// Get member ↔ active public channel graph for the current server.
serverRouter.get("/:id/member-graph", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    if (await serverService.shouldHideHumanDirectoryFromRequester(req.params.id, req.userId!)) {
      res.status(403).json({ error: "Member graph is not available" });
      return;
    }

    const [serverMembers, serverAgents, visibleChannelRows] = await Promise.all([
      serverService.getServerMembers(req.params.id, req.userId!),
      agentService.listAgents(req.params.id, false),
      channelService.listChannels(req.params.id, req.userId!),
    ]);
    const visibleChannels = visibleChannelRows.filter((channel) => channel.type === "channel" && !channel.archivedAt);

    // Keep this endpoint cheap enough for large servers: one visible-channel
    // list, one human edge scan, and one agent edge scan. Avoid calling
    // getChannelMembers per channel, which would turn this page into N+1 reads.
    const allChannels = visibleChannels.filter((channel) => channel.name === "all" && channel.type === "channel");
    if (allChannels.length > 0) {
      // getChannelMembers lazily backfills #all humans for older servers. There
      // is normally only one #all channel, so preserve that contract before the
      // batched edge read without reintroducing a per-channel loop.
      await Promise.all(allChannels.map((channel) => channelService.getChannelMembers(channel.id)));
    }

    const channelById = new Map(visibleChannels.map((channel) => [channel.id, channel]));
    const visibleChannelIds = visibleChannels.map((channel) => channel.id);
    const memberChannelIds = new Map<string, Set<string>>();
    const edges: Array<{ channelId: string; memberType: "human" | "agent"; memberId: string }> = [];

    function addEdge(memberType: "human" | "agent", memberId: string, channelId: string) {
      if (!channelById.has(channelId)) return;
      const graphMemberId = `${memberType}:${memberId}`;
      let channelIds = memberChannelIds.get(graphMemberId);
      if (!channelIds) {
        channelIds = new Set<string>();
        memberChannelIds.set(graphMemberId, channelIds);
      }
      channelIds.add(channelId);
      edges.push({ channelId, memberType, memberId });
    }

    const channelCounts = new Map<string, { humans: number; agents: number }>();
    for (const channel of visibleChannels) {
      channelCounts.set(channel.id, { humans: 0, agents: 0 });
    }

    if (visibleChannelIds.length > 0) {
      const db = getDb();
      const [humanEdges, agentEdges] = await Promise.all([
        db
          .select({
            channelId: channelHumans.channelId,
            userId: channelHumans.userId,
          })
          .from(channelHumans)
          .where(inArray(channelHumans.channelId, visibleChannelIds)),
        db
          .select({
            channelId: channelAgents.channelId,
            agentId: channelAgents.agentId,
          })
          .from(channelAgents)
          .innerJoin(agentsTable, eq(channelAgents.agentId, agentsTable.id))
          .where(and(
            inArray(channelAgents.channelId, visibleChannelIds),
            isNull(agentsTable.deletedAt),
          )),
      ]);

      for (const row of humanEdges) {
        addEdge("human", row.userId, row.channelId);
        const counts = channelCounts.get(row.channelId);
        if (counts) counts.humans += 1;
      }
      for (const row of agentEdges) {
        addEdge("agent", row.agentId, row.channelId);
        const counts = channelCounts.get(row.channelId);
        if (counts) counts.agents += 1;
      }
    }

    const humans = serverMembers.map((human) => ({
      type: "human" as const,
      id: human.userId,
      name: human.name,
      displayName: human.displayName,
      avatarUrl: human.avatarUrl,
      gravatarHash: human.gravatarHash,
      role: human.role,
      channelIds: [...(memberChannelIds.get(`human:${human.userId}`) ?? new Set<string>())],
    }));
    const agents = serverAgents.map((agent) => ({
      type: "agent" as const,
      id: agent.id,
      name: agent.name,
      displayName: agent.displayName,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      runtime: agent.runtime,
      channelIds: [...(memberChannelIds.get(`agent:${agent.id}`) ?? new Set<string>())],
    }));
    const channelsForGraph = visibleChannels.map((channel) => {
      const counts = channelCounts.get(channel.id) ?? { humans: 0, agents: 0 };
      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        archivedAt: channel.archivedAt ?? null,
        humanCount: counts.humans,
        agentCount: counts.agents,
        memberCount: counts.humans + counts.agents,
      };
    });

    res.json({
      humans,
      agents,
      channels: channelsForGraph,
      edges,
    });
  } catch (err) {
    console.error("Failed to get member graph:", err);
    res.status(500).json({ error: "Failed to get member graph" });
  }
});

// Get current member's persisted sidebar order
serverRouter.get("/:id/sidebar-order", async (req, res) => {
  try {
    addTraceEvent("sidebar_order.load.started");
    const member = await tracePhase(
      () => serverService.isMember(req.params.id, req.userId!, {
        traceQuery: createTraceDbQueryTracer("server.membership.checked"),
      }),
      (_durationMs, isMember) => ({
        name: "server.membership.checked",
        attrs: { is_member: isMember },
      }),
    );
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    const sidebarOrder = await tracePhase(
      () => serverService.getSanitizedMemberSidebarOrder(req.params.id, req.userId!, {
        traceQuery: createTraceDbQueryTracer("sidebar_order.loaded"),
      }),
      (_durationMs, order) => ({
        name: "sidebar_order.loaded",
        attrs: {
          sidebar_order_present: Boolean(order),
          channel_order_count: order?.channelOrder.length ?? 0,
          agent_order_count: order?.agentOrder.length ?? 0,
          dm_order_count: order?.dmOrder.length ?? 0,
          channel_sort_mode: order?.channelSortMode ?? "manual",
          dm_sort_mode: order?.dmSortMode ?? "manual",
          pinned_channel_count: order?.pinnedChannelIds.length ?? 0,
          pinned_agent_count: order?.pinnedAgentIds.length ?? 0,
          pinned_order_count: order?.pinnedOrder.length ?? 0,
          hidden_dm_count: order?.hiddenDmIds.length ?? 0,
          channel_panel_tab_order_count: order?.channelPanelTabOrder.length ?? 0,
          agent_panel_tab_order_count: order?.agentPanelTabOrder.length ?? 0,
        },
      }),
    );
    if (!sidebarOrder) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    // GET is on the restore hot path and may return 304. Sanitize only the
    // saved ids with one semijoin-style query instead of rebuilding every
    // allowed channel/agent/DM id for the server on each read.
    addTraceEvent("response.ready", {
      channel_order_count: sidebarOrder.channelOrder.length,
      agent_order_count: sidebarOrder.agentOrder.length,
      dm_order_count: sidebarOrder.dmOrder.length,
      channel_sort_mode: sidebarOrder.channelSortMode,
      dm_sort_mode: sidebarOrder.dmSortMode,
      pinned_channel_count: sidebarOrder.pinnedChannelIds.length,
      pinned_agent_count: sidebarOrder.pinnedAgentIds.length,
      pinned_order_count: sidebarOrder.pinnedOrder.length,
      hidden_dm_count: sidebarOrder.hiddenDmIds.length,
      channel_panel_tab_order_count: sidebarOrder.channelPanelTabOrder.length,
      agent_panel_tab_order_count: sidebarOrder.agentPanelTabOrder.length,
    });
    res.json(sidebarOrder);
  } catch {
    res.status(500).json({ error: "Failed to get sidebar order" });
  }
});

// Persist current member's sidebar order
serverRouter.patch("/:id/sidebar-order", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const rawChannelOrder = req.body?.channelOrder;
    const rawAgentOrder = req.body?.agentOrder;
    const rawDmOrder = req.body?.dmOrder;
    const rawChannelSortMode = req.body?.channelSortMode;
    const rawDmSortMode = req.body?.dmSortMode;
    const rawPinnedSortMode = req.body?.pinnedSortMode;
    const rawPinnedChannelIds = req.body?.pinnedChannelIds;
    const rawPinnedAgentIds = req.body?.pinnedAgentIds;
    const rawPinnedOrder = req.body?.pinnedOrder;
    const rawHiddenDmIds = req.body?.hiddenDmIds;
    const rawChannelPanelTabOrder = req.body?.channelPanelTabOrder;
    const rawAgentPanelTabOrder = req.body?.agentPanelTabOrder;
    const normalizedChannelOrder = rawChannelOrder === undefined ? undefined : normalizeOrderIds(rawChannelOrder);
    const normalizedAgentOrder = rawAgentOrder === undefined ? undefined : normalizeOrderIds(rawAgentOrder);
    const normalizedDmOrder = rawDmOrder === undefined ? undefined : normalizeOrderIds(rawDmOrder);
    const normalizedChannelSortMode = rawChannelSortMode === undefined ? undefined : normalizeSidebarSortMode(rawChannelSortMode);
    const normalizedDmSortMode = rawDmSortMode === undefined ? undefined : normalizeSidebarSortMode(rawDmSortMode);
    const normalizedPinnedSortMode = rawPinnedSortMode === undefined ? undefined : normalizeSidebarSortMode(rawPinnedSortMode);
    const normalizedPinnedChannelIds = rawPinnedChannelIds === undefined ? undefined : normalizeOrderIds(rawPinnedChannelIds);
    const normalizedPinnedAgentIds = rawPinnedAgentIds === undefined ? undefined : normalizeOrderIds(rawPinnedAgentIds);
    const normalizedPinnedOrder = rawPinnedOrder === undefined ? undefined : normalizeOrderIds(rawPinnedOrder);
    const normalizedHiddenDmIds = rawHiddenDmIds === undefined ? undefined : normalizeOrderIds(rawHiddenDmIds);
    const normalizedChannelPanelTabOrder = rawChannelPanelTabOrder === undefined ? undefined : normalizeOrderIds(rawChannelPanelTabOrder);
    const normalizedAgentPanelTabOrder = rawAgentPanelTabOrder === undefined ? undefined : normalizeOrderIds(rawAgentPanelTabOrder);

    if (
      (rawChannelOrder !== undefined && !normalizedChannelOrder) ||
      (rawAgentOrder !== undefined && !normalizedAgentOrder) ||
      (rawDmOrder !== undefined && !normalizedDmOrder) ||
      (rawChannelSortMode !== undefined && !normalizedChannelSortMode) ||
      (rawDmSortMode !== undefined && !normalizedDmSortMode) ||
      (rawPinnedSortMode !== undefined && !normalizedPinnedSortMode) ||
      (rawPinnedChannelIds !== undefined && !normalizedPinnedChannelIds) ||
      (rawPinnedAgentIds !== undefined && !normalizedPinnedAgentIds) ||
      (rawPinnedOrder !== undefined && !normalizedPinnedOrder) ||
      (rawHiddenDmIds !== undefined && !normalizedHiddenDmIds) ||
      (rawChannelPanelTabOrder !== undefined && !normalizedChannelPanelTabOrder) ||
      (rawAgentPanelTabOrder !== undefined && !normalizedAgentPanelTabOrder)
    ) {
      res.status(400).json({ error: "Order and pinned fields must be arrays of string IDs; sort modes must be manual, recent, or az" });
      return;
    }

    if (normalizedChannelOrder === undefined && normalizedAgentOrder === undefined && normalizedDmOrder === undefined && normalizedChannelSortMode === undefined && normalizedDmSortMode === undefined && normalizedPinnedSortMode === undefined && normalizedPinnedChannelIds === undefined && normalizedPinnedAgentIds === undefined && normalizedPinnedOrder === undefined && normalizedHiddenDmIds === undefined && normalizedChannelPanelTabOrder === undefined && normalizedAgentPanelTabOrder === undefined) {
      res.status(400).json({ error: "At least one field is required" });
      return;
    }

    const allowedIds = await getAllowedSidebarIds(req.params.id, req.userId!);
    const channelAndDmIds = new Set([...allowedIds.channelIds, ...allowedIds.dmIds]);
    const pinnableIds = new Set([...channelAndDmIds, ...allowedIds.agentIds]);
    const sidebarOrder = await serverService.updateMemberSidebarOrder(req.params.id, req.userId!, {
      channelOrder: normalizedChannelOrder == null ? undefined : filterOrderIds(normalizedChannelOrder, allowedIds.channelIds),
      agentOrder: normalizedAgentOrder == null ? undefined : filterOrderIds(normalizedAgentOrder, allowedIds.agentIds),
      dmOrder: normalizedDmOrder == null ? undefined : filterOrderIds(normalizedDmOrder, allowedIds.dmIds),
      channelSortMode: normalizedChannelSortMode ?? undefined,
      dmSortMode: normalizedDmSortMode ?? undefined,
      pinnedSortMode: normalizedPinnedSortMode ?? undefined,
      pinnedChannelIds: normalizedPinnedChannelIds == null ? undefined : filterOrderIds(normalizedPinnedChannelIds, channelAndDmIds),
      pinnedAgentIds: normalizedPinnedAgentIds == null ? undefined : filterOrderIds(normalizedPinnedAgentIds, allowedIds.agentIds),
      pinnedOrder: normalizedPinnedOrder == null ? undefined : filterOrderIds(normalizedPinnedOrder, pinnableIds),
      hiddenDmIds: normalizedHiddenDmIds == null ? undefined : filterOrderIds(normalizedHiddenDmIds, allowedIds.dmIds),
      channelPanelTabOrder: normalizedChannelPanelTabOrder == null ? undefined : filterOrderIds(normalizedChannelPanelTabOrder, CHANNEL_PANEL_TAB_IDS),
      agentPanelTabOrder: normalizedAgentPanelTabOrder == null ? undefined : filterOrderIds(normalizedAgentPanelTabOrder, AGENT_PANEL_TAB_IDS),
    });
    if (!sidebarOrder) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    res.json(sidebarOrder);
  } catch {
    res.status(500).json({ error: "Failed to update sidebar order" });
  }
});

// Add member to server (admin/owner only)
serverRouter.post("/:id/members", async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Only owner and admin can add members
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can add members" });
      return;
    }

    // Validate role if provided. Admins can add member/admin; only owners can
    // add a member directly as another owner.
    const targetRole = (role || "member") as string;
    if (!MANAGEABLE_SERVER_ROLES.includes(targetRole as ManageableServerRole)) {
      res.status(400).json({ error: "Role must be owner, admin, or member" });
      return;
    }
    if (targetRole === "owner" && callerRole !== "owner") {
      res.status(403).json({ error: "Only server owners can add another owner" });
      return;
    }

    const added = await serverService.addMember(req.params.id, userId, targetRole as ServerRole, {
      agreementAudit: {
        actorUserId: req.userId!,
        source: "admin-add",
        ...getAgreementRequestMetadata(req),
      },
    });

    if (added) {
      const io = req.app.get("io") as SocketServer | undefined;
      const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
      if (io) {
        io.to(`server:${req.params.id}`).emit("server:member-added", {
          serverId: req.params.id,
          userId,
        });
        if (agentOrchestrator) {
          void onboardingService.triggerNewMemberOnboarding(io, agentOrchestrator, req.params.id, userId).catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`[Onboarding] Failed to trigger member onboarding after add-member for ${userId}: ${msg}`);
          });
        }
      }
    }

    res.json({ ok: true, added });
  } catch {
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Update a human member's role (owner/admin with role transition limits)
serverRouter.patch("/:id/members/:memberId", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "changeMemberRoles")) {
      res.status(403).json({ error: "Only server owners and admins can change member roles" });
      return;
    }

    const { role } = req.body as { role?: ManageableServerRole };
    if (!role || !MANAGEABLE_SERVER_ROLES.includes(role)) {
      res.status(400).json({ error: "Role must be owner, admin, or member" });
      return;
    }

    if (req.params.memberId === req.userId) {
      res.status(400).json({ error: "You cannot change your own role" });
      return;
    }

    const targetRole = await serverService.getMemberRole(req.params.id, req.params.memberId);
    if (!targetRole) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    if (!canChangeMemberRole(callerRole, targetRole, role)) {
      res.status(403).json({ error: "You are not allowed to make that role change" });
      return;
    }
    if (targetRole === "owner" && role !== "owner") {
      const ownerCount = await serverService.countOwners(req.params.id);
      if (ownerCount <= 1) {
        res.status(400).json({ error: "A server must have at least one owner" });
        return;
      }
    }

    if (targetRole === role) {
      res.json({ ok: true });
      return;
    }

    await serverService.updateMemberRole(req.params.id, req.params.memberId, role);
    const io = req.app.get("io") as SocketServer | undefined;
    io?.to(`server:${req.params.id}`).emit("server:member-updated", {
      serverId: req.params.id,
      userId: req.params.memberId,
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to update member role" });
  }
});

// Get a human profile in the context of this server, even if they were removed.
serverRouter.get("/:id/members/:memberId/profile", async (req, res) => {
  try {
    const member = await serverService.isMember(req.params.id, req.userId!);
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    let profile: ServerMemberProfile | JointHumanProfile | null = await serverService.getServerMemberProfile(req.params.id, req.params.memberId, req.userId!);
    if (!profile || profile.membershipStatus !== "active") {
      const peerServerId = await channelService.getJointVisibleHumanServerId(req.params.id, req.userId!, req.params.memberId);
      if (peerServerId && peerServerId !== req.params.id) {
        const peerProfile = await serverService.getServerMemberProfile(peerServerId, req.params.memberId, req.userId!);
        if (peerProfile) {
          profile = toJointHumanProfile(peerProfile);
        }
      }
    }
    if (!profile) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(profile);
  } catch {
    res.status(500).json({ error: "Failed to get member profile" });
  }
});

// Remove a human member from the server.
serverRouter.delete("/:id/members/:memberId", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can remove members" });
      return;
    }

    if (req.params.memberId === req.userId) {
      res.status(400).json({ error: "You cannot remove yourself" });
      return;
    }

    const targetRole = await serverService.getMemberRole(req.params.id, req.params.memberId);
    if (!targetRole) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    if (targetRole === "owner") {
      if (callerRole !== "owner") {
        res.status(403).json({ error: "Only server owners can remove owners" });
        return;
      }
      const ownerCount = await serverService.countOwners(req.params.id);
      if (ownerCount <= 1) {
        res.status(400).json({ error: "A server must have at least one owner" });
        return;
      }
    } else if (callerRole !== "owner" && targetRole !== "member") {
      res.status(403).json({ error: "Only an owner can remove admins" });
      return;
    }

    await serverService.removeMember(req.params.id, req.params.memberId);
    const io = req.app.get("io") as SocketServer | undefined;
    io?.to(`server:${req.params.id}`).emit("server:member-removed", {
      serverId: req.params.id,
      userId: req.params.memberId,
    });
    io?.to(`user:${req.params.memberId}`).emit("server:membership-removed", {
      serverId: req.params.id,
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// ── Invites ──

// Create invite (admin/owner only)
serverRouter.post("/:id/invites", async (req, res) => {
  try {
    const rawEmail = typeof req.body.email === "string" ? req.body.email.trim() : "";
    if (!rawEmail) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const emailError = validateEmailAddress(rawEmail);
    if (emailError) {
      res.status(400).json({ error: emailError });
      return;
    }

    // Only owner and admin can invite
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can send invites" });
      return;
    }

    const invite = await inviteService.createInvite(req.params.id, rawEmail, req.userId!);
    res.json(invite);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg === INVALID_EMAIL_MESSAGE) {
      res.status(400).json({ error: msg });
    } else if (msg.includes("already")) {
      res.status(409).json({ error: msg });
    } else {
      console.error("Create invite error:", err);
      res.status(500).json({ error: "Failed to create invite" });
    }
  }
});

// List pending invites (admin/owner only)
serverRouter.get("/:id/invites", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can view invites" });
      return;
    }

    const invites = await inviteService.listPendingInvites(req.params.id);
    res.json(invites);
  } catch {
    res.status(500).json({ error: "Failed to list invites" });
  }
});

// Revoke invite (admin/owner only)
serverRouter.delete("/:id/invites/:inviteId", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can revoke invites" });
      return;
    }

    await inviteService.revokeInvite(req.params.inviteId, req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to revoke invite" });
  }
});

// Create multi-use join link (admin/owner only)
serverRouter.post("/:id/join-links", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can create join links" });
      return;
    }

    const { expiresAt, maxUses } = req.body ?? {};
    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;
    const parsedMaxUses = maxUses === undefined || maxUses === null || maxUses === "" ? null : Number(maxUses);

    if (parsedExpiresAt && Number.isNaN(parsedExpiresAt.getTime())) {
      res.status(400).json({ error: "expiresAt must be a valid date" });
      return;
    }
    if (parsedMaxUses != null && (!Number.isInteger(parsedMaxUses) || parsedMaxUses < 1)) {
      res.status(400).json({ error: "maxUses must be a positive integer" });
      return;
    }

    const { token, link } = await inviteService.createJoinLink(req.params.id, req.userId!, {
      expiresAt: parsedExpiresAt,
      maxUses: parsedMaxUses,
    });

    res.json({ token, link });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Max uses") || msg.includes("Expires at")) {
      res.status(400).json({ error: msg });
      return;
    }
    console.error("Create join link error:", err);
    res.status(500).json({ error: "Failed to create join link" });
  }
});

// List active join links (admin/owner only)
serverRouter.get("/:id/join-links", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can view join links" });
      return;
    }

    const links = await inviteService.listJoinLinks(req.params.id);
    res.json(links);
  } catch {
    res.status(500).json({ error: "Failed to list join links" });
  }
});

// Revoke join link (admin/owner only)
serverRouter.delete("/:id/join-links/:linkId", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!hasServerCapability(callerRole, "manageMembers")) {
      res.status(403).json({ error: "Only server owners and admins can revoke join links" });
      return;
    }

    await inviteService.revokeJoinLink(req.params.linkId, req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to revoke join link" });
  }
});

// List machines for server
serverRouter.get("/:id/machines", async (req, res) => {
  try {
    addTraceEvent("machines.list.started");
    const member = await tracePhase(
      () => serverService.isMember(req.params.id, req.userId!),
      (_durationMs, result) => ({
        name: "server.membership.checked",
        attrs: {
          is_member: Boolean(result),
        },
      }),
    );
    if (!member) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const machines = await tracePhase(
      () => machineService.listMachines(req.params.id, {
        traceQuery: createTraceDbQueryTracer("machines.loaded"),
      }),
      (_durationMs, result) => ({
        name: "machines.loaded",
        attrs: {
          machines_count: result.length,
        },
      }),
    );
    const enriched = await tracePhase(
      () => Promise.all(machines.map((m) => buildMachineReadModel(m, agentOrchestrator))),
      (_durationMs, result) => ({
        name: "machines.read_models.built",
        attrs: {
          machines_count: result.length,
          online_machines_count: result.filter((machine) => machine.status === "online").length,
          daemon_version_present_count: result.filter((machine) => Boolean(machine.daemonVersion)).length,
        },
      }),
    );
    const latestDaemonVersion = await tracePhase(
      () => getLatestDaemonVersion(),
      (_durationMs, result) => ({
        name: "latest_daemon_version.loaded",
        attrs: {
          daemon_version_present: Boolean(result),
        },
      }),
    );
    addTraceEvent("response.ready", {
      machines_count: enriched.length,
      online_machines_count: enriched.filter((machine) => machine.status === "online").length,
      daemon_version_present_count: enriched.filter((machine) => Boolean(machine.daemonVersion)).length,
      latest_daemon_version_present: Boolean(latestDaemonVersion),
    });
    res.json({ machines: enriched, latestDaemonVersion });
  } catch {
    res.status(500).json({ error: "Failed to list machines" });
  }
});

// Register a new machine (admin/owner only)
serverRouter.post("/:id/machines", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(callerRole, "manageMachines")) {
      res.status(403).json({ error: "Only server owners and admins can register machines" });
      return;
    }
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const result = await machineService.registerMachine(req.params.id, req.userId!, name);
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const machine = await buildMachineReadModel(result.machine, agentOrchestrator);
    const io = req.app.get("io") as SocketServer | undefined;
    io?.to(`server:${req.params.id}`).emit("machine:updated", {
      serverId: req.params.id,
      machineId: machine.id,
    });
    // Return the API key only once — it cannot be retrieved again
    res.json({ machine, apiKey: result.apiKey });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("limit reached")) {
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to register machine" });
    }
  }
});

// Rename a machine (admin/owner only)
serverRouter.patch("/:id/machines/:machineId", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(callerRole, "manageMachines")) {
      res.status(403).json({ error: "Only server owners and admins can manage machines" });
      return;
    }
    const machine = await machineService.getMachine(req.params.machineId);
    if (!machine || machine.serverId !== req.params.id) {
      res.status(404).json({ error: "Machine not found in this server" });
      return;
    }
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const updated = await machineService.renameMachine(req.params.machineId, name.trim());
    const io = req.app.get("io") as SocketServer | undefined;
    io?.to(`server:${req.params.id}`).emit("machine:updated", {
      serverId: req.params.id,
      machineId: req.params.machineId,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update machine" });
  }
});

// Delete a machine (admin/owner only)
serverRouter.delete("/:id/machines/:machineId", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(callerRole, "manageMachines")) {
      res.status(403).json({ error: "Only server owners and admins can manage machines" });
      return;
    }
    const machine = await machineService.getMachine(req.params.machineId);
    if (!machine || machine.serverId !== req.params.id) {
      res.status(404).json({ error: "Machine not found in this server" });
      return;
    }
    await machineService.deleteMachine(req.params.machineId);
    const io = req.app.get("io") as SocketServer | undefined;
    io?.to(`server:${req.params.id}`).emit("machine:updated", {
      serverId: req.params.id,
      machineId: req.params.machineId,
    });
    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete machine";
    if (message.includes("agents assigned") || message.includes("runtime profiles still reference active agents")) {
      res.status(409).json({ error: message });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// Regenerate API key for a machine (admin/owner only)
serverRouter.post("/:id/machines/:machineId/rotate-key", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(callerRole, "manageMachines")) {
      res.status(403).json({ error: "Only server owners and admins can manage machines" });
      return;
    }
    const machine = await machineService.getMachine(req.params.machineId);
    if (!machine || machine.serverId !== req.params.id) {
      res.status(404).json({ error: "Machine not found in this server" });
      return;
    }
    const apiKey = await machineService.regenerateApiKey(req.params.machineId);
    res.json({ apiKey });
  } catch {
    res.status(500).json({ error: "Failed to regenerate API key" });
  }
});

// Scan workspace directories on a machine (admin/owner only)
serverRouter.get("/:id/machines/:machineId/workspaces", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(callerRole, "manageMachines")) {
      res.status(403).json({ error: "Only server owners and admins can manage machines" });
      return;
    }
    const machine = await machineService.getMachine(req.params.machineId);
    if (!machine || machine.serverId !== req.params.id) {
      res.status(404).json({ error: "Machine not found in this server" });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Workspace scan needs local machine connection — fly-replay to correct replica
    if (!agentOrchestrator.hasMachineLocally(req.params.machineId)) {
      const flyInstance = await getFlyInstanceForMachine(req.params.machineId);
      if (flyInstance) {
        res.set("fly-replay", `instance=${flyInstance}`);
        res.status(307).end();
        return;
      }
    }

    const directories = await agentOrchestrator.scanMachineWorkspaces(req.params.machineId);

    // Cross-reference with DB agents to determine status
    const allAgents = await agentService.listAgents(req.params.id, true);
    const agentMap = new Map(allAgents.map((a) => [a.id, a]));

    const enriched = directories.map((dir) => {
      const agent = agentMap.get(dir.directoryName);
      let status: "active" | "stopped" | "deleted" | "orphan";
      if (agent) {
        if (agent.deletedAt) {
          status = "deleted";
        } else {
          status = agent.status === "inactive" ? "stopped" : "active";
        }
      } else {
        status = "orphan";
      }
      return {
        ...dir,
        status,
        agentName: agent?.displayName || agent?.name || null,
        agentStatus: agent?.status || null,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to scan workspaces" });
  }
});

// Detect runtime models on a machine on-demand (used by Create/Edit agent picker)
serverRouter.get("/:id/machines/:machineId/runtime-models/:runtime", async (req, res) => {
  addTraceEvent("runtime_models.detect.started", {
    runtime: req.params.runtime,
  });
  try {
    const callerRole = await tracePhase(
      () => serverService.getMemberRole(req.params.id, req.userId!),
      (_durationMs, role) => ({
        name: "server.membership.checked",
        attrs: { is_member: Boolean(role) },
      }),
    );
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(callerRole, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can inspect runtime models" });
      return;
    }
    const machine = await tracePhase(
      () => machineService.getMachine(req.params.machineId),
      (_durationMs, result) => ({
        name: "machine.loaded",
        attrs: {
          machine_found: Boolean(result),
          server_match: Boolean(result && result.serverId === req.params.id),
        },
      }),
    );
    if (!machine || machine.serverId !== req.params.id) {
      res.status(404).json({ error: "Machine not found in this server" });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    if (!agentOrchestrator.hasMachineLocally(req.params.machineId)) {
      const flyInstance = await tracePhase(
        () => getFlyInstanceForMachine(req.params.machineId),
        (_durationMs, result) => ({
          name: "machine.routing.checked",
          attrs: {
            machine_local: false,
            fly_instance_present: Boolean(result),
          },
        }),
      );
      if (flyInstance) {
        res.set("fly-replay", `instance=${flyInstance}`);
        res.status(307).end();
        return;
      }
      addTraceEvent("runtime_models.detect.skipped", {
        reason: "machine_offline",
        runtime: req.params.runtime,
      });
      res.status(503).json({ error: "Machine offline" });
      return;
    }
    addTraceEvent("machine.routing.checked", {
      machine_local: true,
      fly_instance_present: false,
    });

    const result = await tracePhase(
      () => agentOrchestrator.detectMachineRuntimeModels(req.params.machineId, req.params.runtime),
      (_durationMs, detectResult) => ({
        name: "runtime_models.detected",
        attrs: {
          runtime: req.params.runtime,
          models_count: detectResult.models.length,
          default_model_present: Boolean(detectResult.default),
        },
      }),
    );
    addTraceEvent("response.ready", {
      runtime: req.params.runtime,
      models_count: result.models.length,
      default_model_present: Boolean(result.default),
    });
    res.json(result);
  } catch (err: any) {
    traceRouteFailure("runtime_models.detect.failed", err, {
      runtime: req.params.runtime,
    });
    res.status(503).json({ error: err.message || "Failed to detect runtime models" });
  }
});

// Delete a workspace directory on a machine (admin/owner only)
serverRouter.delete("/:id/machines/:machineId/workspaces/:directoryName", async (req, res) => {
  try {
    const callerRole = await serverService.getMemberRole(req.params.id, req.userId!);
    if (!callerRole) {
      res.status(404).json({ error: "Server not found" });
      return;
    }
    if (!hasServerCapability(callerRole, "manageMachines")) {
      res.status(403).json({ error: "Only server owners and admins can manage machines" });
      return;
    }
    const machine = await machineService.getMachine(req.params.machineId);
    if (!machine || machine.serverId !== req.params.id) {
      res.status(404).json({ error: "Machine not found in this server" });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Workspace delete needs local machine connection — fly-replay to correct replica
    if (!agentOrchestrator.hasMachineLocally(req.params.machineId)) {
      const flyInstance = await getFlyInstanceForMachine(req.params.machineId);
      if (flyInstance) {
        res.set("fly-replay", `instance=${flyInstance}`);
        res.status(307).end();
        return;
      }
    }

    const success = await agentOrchestrator.deleteMachineWorkspaceDir(
      req.params.machineId,
      req.params.directoryName,
    );
    if (!success) {
      res.status(500).json({ error: "Failed to delete workspace directory" });
      return;
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete workspace" });
  }
});
