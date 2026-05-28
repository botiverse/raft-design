import { Router, type Router as RouterType } from "express";
import type { Server as SocketServer } from "socket.io";
import * as agentService from "../services/agentService.js";
import * as agentRuntimeProfileService from "../services/agentRuntimeProfileService.js";
import * as machineService from "../services/machineService.js";
import * as onboardingService from "../services/onboardingService.js";
import * as serverService from "../services/serverService.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import { getFlyInstanceForMachine } from "../replicaRouter.js";
import {
  hydrateRuntimeConfig,
  runtimeConfigToLaunchFields,
  stripControlledRuntimeEnvVars,
  validateAgentName,
  validateRuntimeConfig,
  REASONING_EFFORTS,
  RUNTIMES,
  type ReasoningEffort,
  type RuntimeConfig,
} from "@slock-ai/shared";
import { userHasServerCapability } from "../lib/serverPermissions.js";
import { getStorage } from "../services/storageService.js";
import {
  createAvatarUpload,
  PROFILE_AVATAR_BAD_FORMAT_MESSAGE,
  storeAgentAvatar,
} from "../services/avatarService.js";
import * as channelService from "../services/channelService.js";
import { addTraceEvent, createTraceDbQueryTracer, getCurrentTraceContext, tracePhase } from "../tracing/semanticTrace.js";
import { isPrincipalHandleConflictError } from "../services/principalHandleService.js";
import * as agentScopesService from "../services/agentScopesService.js";
import {
  ALLOWED_AGENT_CAPABILITIES,
  isAgentBootstrapSurfaceEnabled,
  issueAgentBootstrapToken,
  normalizeAgentCapabilities,
  type AgentCapability,
} from "../services/agentCredentialService.js";

export const agentRouter: RouterType = Router();
export const agentAvatarRouter: RouterType = Router();
const MAX_AGENT_DESCRIPTION_LENGTH = 3000;
const ONBOARDING_AGENT_NAME = "Cindy";
const ONBOARDING_AGENT_DESCRIPTION = "Onboarding Assistant";
const ONBOARDING_MEMORY_SEED_ENV = "SLOCK_ONBOARDING_MEMORY_SEED";

// Env var key must be a valid identifier: letters, digits, underscores; must start with letter or underscore
const ENV_KEY_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
/** Validate envVars and return an error string, or null if valid. */
function validateEnvVars(envVars: unknown): string | null {
  if (envVars == null) return null;
  if (typeof envVars !== "object" || Array.isArray(envVars)) {
    return "envVars must be an object";
  }
  for (const [k, v] of Object.entries(envVars as Record<string, unknown>)) {
    if (typeof k !== "string" || typeof v !== "string") {
      return "envVars keys and values must be strings";
    }
    if (!ENV_KEY_REGEX.test(k)) {
      return `Invalid env var key "${k}": must match [A-Za-z_][A-Za-z0-9_]*`;
    }
    if (k.includes("\0") || (v as string).includes("\0")) {
      return "envVars keys and values must not contain null bytes";
    }
  }
  return null;
}

/** Strip envVars/runtimeConfig from agent payload (secrets should not leak to non-admins). */
function stripEnvVars<T extends Record<string, unknown>>(agent: T): Omit<T, "envVars" | "runtimeConfig"> {
  const { envVars: _, runtimeConfig: __, ...rest } = agent;
  return rest;
}

function withHydratedRuntimeConfig<
  T extends {
    runtime: string;
    model: string;
    runtimeConfig?: unknown;
    reasoningEffort?: ReasoningEffort | null;
    envVars?: Record<string, string> | null;
  },
>(agent: T): T & { runtimeConfig: RuntimeConfig } {
  return {
    ...agent,
    runtimeConfig: hydrateRuntimeConfig(agent),
  };
}

function withRuntimeConfigEnvVars(config: RuntimeConfig, extra: Record<string, string>): RuntimeConfig {
  if (Object.keys(extra).length === 0) return config;
  return {
    ...config,
    envVars: {
      ...(config.envVars ?? {}),
      ...extra,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateRawRuntimeConfigInput(runtimeConfig: unknown): string | null {
  if (runtimeConfig === undefined || runtimeConfig === null) return null;
  if (!isRecord(runtimeConfig)) return "runtimeConfig must be an object";
  const model = runtimeConfig.model;
  if (!isRecord(model)) return "runtimeConfig.model must be an object";
  if (model.kind === "preset" && (typeof model.id !== "string" || !model.id.trim())) {
    return "runtimeConfig.model.id is required";
  }
  if (model.kind === "custom" && (typeof model.name !== "string" || !model.name.trim())) {
    return "runtimeConfig.model.name is required";
  }
  if (model.kind !== "preset" && model.kind !== "custom") {
    return "runtimeConfig.model.kind is invalid";
  }
  if (runtimeConfig.mode !== undefined && runtimeConfig.mode !== null) {
    const mode = runtimeConfig.mode;
    if (!isRecord(mode)) return "runtimeConfig.mode must be an object";
    if (mode.kind !== "default" && mode.kind !== "fast") {
      return "runtimeConfig.mode.kind is invalid";
    }
  }
  if (runtimeConfig.provider !== undefined && runtimeConfig.provider !== null) {
    const provider = runtimeConfig.provider;
    if (!isRecord(provider)) return "runtimeConfig.provider must be an object";
    if (runtimeConfig.runtime !== "claude") {
      return "runtimeConfig.provider is only supported for Claude Code";
    }
    if (provider.kind === "custom" && (typeof provider.apiUrl !== "string" || !provider.apiUrl.trim())) {
      return "runtimeConfig.provider.apiUrl is required";
    }
    if (provider.kind === "custom" && (typeof provider.apiKey !== "string" || !provider.apiKey.trim())) {
      return "runtimeConfig.provider.apiKey is required";
    }
    if (provider.kind !== "default" && provider.kind !== "custom") {
      return "runtimeConfig.provider.kind is invalid";
    }
  }
  const envVarsError = validateEnvVars(runtimeConfig.envVars);
  if (envVarsError) return envVarsError;
  return null;
}

function normalizeRequestRuntimeConfig(input: {
  runtimeConfig?: unknown;
  runtime?: string | null;
  model?: string | null;
  reasoningEffort?: ReasoningEffort | null;
  envVars?: Record<string, string> | null;
  envVarsExplicit?: boolean;
  extraEnvVars?: Record<string, string>;
}): { runtimeConfig: RuntimeConfig; launch: ReturnType<typeof runtimeConfigToLaunchFields>; error: string | null } {
  const rawConfigError = validateRawRuntimeConfigInput(input.runtimeConfig);
  if (rawConfigError) {
    const fallback = hydrateRuntimeConfig(input);
    return { runtimeConfig: fallback, launch: runtimeConfigToLaunchFields(fallback), error: rawConfigError };
  }
  const hydratedConfig = hydrateRuntimeConfig(input);
  const runtimeConfig = withRuntimeConfigEnvVars(
    input.envVarsExplicit
      ? {
          ...hydratedConfig,
          envVars: stripControlledRuntimeEnvVars(hydratedConfig.runtime, input.envVars),
        }
      : hydratedConfig,
    input.extraEnvVars ?? {},
  );
  const configError = validateRuntimeConfig(runtimeConfig);
  if (configError) return { runtimeConfig, launch: runtimeConfigToLaunchFields(runtimeConfig), error: configError };
  const launch = runtimeConfigToLaunchFields(runtimeConfig);
  const envVarsError = validateEnvVars(launch.envVars);
  if (envVarsError) return { runtimeConfig, launch, error: envVarsError };
  return { runtimeConfig, launch, error: null };
}

/**
 * Joint-channel visibility grants only conversation/profile/status context for
 * peer-server agents. It must not inherit the viewer's local admin role into
 * the remote server or expose runtime/control-plane details.
 */
function toJointAgentProfile(agent: Record<string, unknown>): Record<string, unknown> {
  return {
    id: agent.id,
    serverId: agent.serverId,
    serverName: agent.serverName ?? null,
    serverSlug: agent.serverSlug ?? null,
    name: agent.name,
    displayName: agent.displayName ?? null,
    avatarUrl: agent.avatarUrl ?? null,
    description: agent.description ?? null,
    status: agent.status,
    deletedAt: agent.deletedAt ?? null,
    createdAt: agent.createdAt,
    activity: agent.activity ?? "offline",
    activityDetail: "",
  };
}

function getCreatorEnrichmentStats(
  agents: Array<{ creatorType: string | null; creatorId: string | null }>,
): { userCreatorCount: number; agentCreatorCount: number } {
  const userCreatorIds = new Set<string>();
  const agentCreatorIds = new Set<string>();
  for (const agent of agents) {
    if (!agent.creatorType || !agent.creatorId) continue;
    if (agent.creatorType === "user") {
      userCreatorIds.add(agent.creatorId);
    } else if (agent.creatorType === "agent") {
      agentCreatorIds.add(agent.creatorId);
    }
  }
  return {
    userCreatorCount: userCreatorIds.size,
    agentCreatorCount: agentCreatorIds.size,
  };
}

/**
 * Default-deny visibility check for everything beyond the public Profile tab.
 *
 * Spec (#proj-server:175df9ee): only the agent's human creator and users with
 * `manageAgents` (server owner / admin) can see the agent's private surfaces.
 * Profile is the **only** public surface; any new endpoint that exposes
 * agent-internal information (workspace, activity, DMs, reminders, skills, …)
 * must run through this check by default — adding new internal info should
 * NOT silently widen visibility.
 */
export async function canInspectAgentPrivateSurfaces(
  serverId: string,
  userId: string,
  agent: { creatorType: string | null; creatorId: string | null },
): Promise<boolean> {
  if (await userHasServerCapability(serverId, userId, "manageAgents")) return true;
  return agent.creatorType === "user" && agent.creatorId === userId;
}

// List all agents in server
agentRouter.get("/", async (req, res) => {
  try {
    addTraceEvent("agents.list.started");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const canManage = await tracePhase(
      () => userHasServerCapability(req.serverId!, req.userId!, "manageAgents"),
      (durationMs, result) => ({
        name: "agent.permissions.checked",
        attrs: {
          can_manage: result,
        },
      }),
    );
    const list = await tracePhase(
      () => agentService.listAgents(req.serverId!, true, {
        traceQuery: createTraceDbQueryTracer("agents.loaded"),
      }),
      (durationMs, result) => ({
        name: "agents.loaded",
        attrs: {
          agents_count: result.length,
        },
      }),
    );
    const runtimeProfileByAgent = await tracePhase(
      () => agentRuntimeProfileService.getAgentRuntimeProfileSummaries(list.map((a) => a.id), {
        traceQuery: createTraceDbQueryTracer("runtime_profiles.loaded"),
      }),
      (durationMs, result) => ({
        name: "runtime_profiles.loaded",
        attrs: {
          agents_count: list.length,
          runtime_profiles_count: result.size,
        },
      }),
    );
    // Fetch activities (in-memory orchestrator lookup, fast) per-agent then
    // batch-enrich creator + createdAgents via one combined DB pass instead
    // of 2N queries. See agentService.batchEnrichAgentsWithCreatorProfile.
    const withActivity = await tracePhase(
      () => Promise.all(list.map(async (a) => {
        const { activity, activityDetail } = await agentOrchestrator.getActivity(a.id, {
          parent: getCurrentTraceContext(),
        });
        return {
          ...withHydratedRuntimeConfig(a),
          activity,
          activityDetail,
          runtimeProfile: runtimeProfileByAgent.get(a.id) ?? null,
        };
      })),
      (durationMs, result) => ({
        name: "activities.loaded",
        attrs: {
          agents_count: result.length,
        },
      }),
    );
    const creatorStats = getCreatorEnrichmentStats(withActivity);
    const enrichedAll = await tracePhase(
      () => agentService.batchEnrichAgentsWithCreatorProfile(withActivity, {
        traceQuery: createTraceDbQueryTracer("creators.enriched"),
      }),
      (durationMs, result) => ({
        name: "creators.enriched",
        attrs: {
          batched: true,
          agents_count: result.length,
          creator_user_count: creatorStats.userCreatorCount,
          creator_agent_count: creatorStats.agentCreatorCount,
        },
      }),
    );
    const enriched = canManage ? enrichedAll : enrichedAll.map(stripEnvVars);
    addTraceEvent("response.ready", {
      agents_count: enriched.length,
      env_vars_stripped: !canManage,
    });
    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Failed to list agents" });
  }
});

// Create agent — accepts machineId and program, auto-starts after creation
agentRouter.post("/", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const { name, description, model, runtime, runtimeConfig, reasoningEffort, machineId, envVars, avatarUrl } = req.body;
    const onboarding = req.body?.onboarding === true;
    const nameError = validateAgentName(name, "Agent name");
    if (nameError) {
      res.status(400).json({ error: nameError });
      return;
    }
    if (description && (typeof description !== "string" || description.length > MAX_AGENT_DESCRIPTION_LENGTH)) {
      res.status(400).json({ error: `Description must be a string of at most ${MAX_AGENT_DESCRIPTION_LENGTH} characters` });
      return;
    }
    if (avatarUrl !== undefined && avatarUrl !== null) {
      if (typeof avatarUrl !== "string" || !avatarUrl.startsWith("pixel:")) {
        res.status(400).json({ error: "avatarUrl must be a pixel: URL at creation time" });
        return;
      }
    }
    // Validate reasoningEffort
    const validEffortIds = new Set(REASONING_EFFORTS.map((r) => r.id));
    if (reasoningEffort && !validEffortIds.has(reasoningEffort)) {
      res.status(400).json({ error: `Invalid reasoning effort: ${reasoningEffort}` });
      return;
    }
    // Validate envVars
    const envVarsError = validateEnvVars(envVars);
    if (envVarsError) {
      res.status(400).json({ error: envVarsError });
      return;
    }
    // Validate machineId belongs to this server
    if (machineId) {
      const machine = await machineService.getMachine(machineId);
      if (!machine || machine.serverId !== req.serverId) {
        res.status(400).json({ error: "Machine not found in this server" });
        return;
      }
    }
    const existingAgents = onboarding ? await agentService.listAgents(req.serverId!) : [];
    const isFirstOnboardingAgent =
      onboarding
      && existingAgents.length === 0
      && name.trim() === ONBOARDING_AGENT_NAME
      && (description || "") === ONBOARDING_AGENT_DESCRIPTION;
    const normalizedConfig = normalizeRequestRuntimeConfig({
      runtimeConfig,
      runtime,
      model,
      reasoningEffort,
      envVars: envVars ?? null,
      envVarsExplicit: envVars !== undefined,
      extraEnvVars: isFirstOnboardingAgent ? { [ONBOARDING_MEMORY_SEED_ENV]: "first-cindy" } : undefined,
    });
    if (normalizedConfig.error) {
      res.status(400).json({ error: normalizedConfig.error });
      return;
    }

    const agent = await agentService.createAgent(req.serverId!, name.trim(), {
      description,
      model: normalizedConfig.launch.model,
      runtime: normalizedConfig.launch.runtime,
      runtimeConfig: normalizedConfig.runtimeConfig,
      reasoningEffort: normalizedConfig.launch.reasoningEffort ?? undefined,
      machineId,
      envVars: normalizedConfig.launch.envVars ?? undefined,
      avatarUrl: avatarUrl || undefined,
      creatorType: "user",
      creatorId: req.userId!,
    });

    if (isFirstOnboardingAgent) {
      await serverService.updateServerOnboardingAgent(req.serverId!, agent.id);
    }

    const io = req.app.get("io") as SocketServer | undefined;
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Auto-start the agent if it has a machine assigned
    if (agent.machineId) {
      try {
        await agentOrchestrator.startAgent(agent.id);
        if (io) {
          void onboardingService
            .triggerOwnerOnboardingOnAgentActivation(io, agentOrchestrator, req.serverId!, agent.id)
            .catch((err: unknown) => {
              const msg = err instanceof Error ? err.message : String(err);
              console.warn(`[Onboarding] Failed to trigger owner onboarding for auto-started agent ${agent.id}: ${msg}`);
            });
        }
      } catch (startErr: any) {
        // Agent was created but couldn't auto-start — still return the agent
        console.warn(`[Agent ${agent.id}] Auto-start failed: ${startErr.message}`);
      }
    }

    // Notify all clients in this server
    const result = await agentService.enrichAgentWithCreatorProfile(withHydratedRuntimeConfig(agent));

    io?.to(`server:${req.serverId}`).emit("agent:created", { agent: stripEnvVars(result) });

    res.json(result);
  } catch (err: any) {
    const msg = err?.message || "";
    if (isPrincipalHandleConflictError(err) || msg.includes("already taken")) {
      res.status(409).json({ error: msg });
    } else if (msg.includes("limit reached")) {
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to create agent" });
    }
  }
});

// Get agent (includes deleted agents for profile viewing)
agentRouter.get("/:id", async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.id, true);
    const canViewViaJoint = agent && agent.serverId !== req.serverId
      ? await channelService.canUserSeeAgentThroughJointChannel(req.serverId!, req.userId!, agent.id)
      : false;
    if (!agent || (agent.serverId !== req.serverId && !canViewViaJoint)) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const canManage = agent.serverId === req.serverId && await userHasServerCapability(req.serverId!, req.userId!, "manageAgents");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const { activity, activityDetail } = await agentOrchestrator.getActivity(agent.id, {
      parent: getCurrentTraceContext(),
    });
    if (canViewViaJoint) {
      const sourceServer = await serverService.getServer(agent.serverId);
      res.json(toJointAgentProfile({
        ...agent,
        serverName: sourceServer?.name ?? null,
        serverSlug: sourceServer?.slug ?? null,
        activity,
        activityDetail,
      }));
      return;
    }
    const runtimeProfile = await agentRuntimeProfileService.getAgentRuntimeProfileSummary(agent.id);
    const result = await agentService.enrichAgentWithCreatorProfile({ ...withHydratedRuntimeConfig(agent), activity, activityDetail, runtimeProfile });
    res.json(canManage ? result : stripEnvVars(result));
  } catch {
    res.status(500).json({ error: "Failed to get agent" });
  }
});

// Get recent durable activity/trajectory log for an agent
agentRouter.get("/:id/activity-log", async (req, res) => {
  try {
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const agent = await agentService.getAgent(req.params.id, true);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    if (!await canInspectAgentPrivateSurfaces(req.serverId!, req.userId!, agent)) {
      res.status(403).json({ error: "Only the agent creator and server admins can view agent activity" });
      return;
    }

    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 50;
    const entries = await agentOrchestrator.listRecentActivityLog(agent.id, limit);
    res.json(entries);
  } catch {
    res.status(500).json({ error: "Failed to load activity log" });
  }
});

agentRouter.get("/:id/agent-dms", async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.id, true);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    if (!await canInspectAgentPrivateSurfaces(req.serverId!, req.userId!, agent)) {
      res.status(403).json({ error: "Only the agent creator and server admins can view agent DMs" });
      return;
    }

    const conversations = await channelService.listAgentToAgentDMsForAgent(req.serverId!, agent.id);
    res.json(conversations);
  } catch {
    res.status(500).json({ error: "Failed to load agent DMs" });
  }
});

// Update agent profile
agentRouter.patch("/:id", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const existing = await agentService.getAgent(req.params.id);
    if (!existing || existing.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const { displayName, description, avatarUrl, model, runtime, runtimeConfig, reasoningEffort, envVars, restartMode } = req.body;
    if (description !== undefined && description !== null && (typeof description !== "string" || description.length > MAX_AGENT_DESCRIPTION_LENGTH)) {
      res.status(400).json({ error: `Description must be a string of at most ${MAX_AGENT_DESCRIPTION_LENGTH} characters` });
      return;
    }
    if (runtime !== undefined && typeof runtime !== "string") {
      res.status(400).json({ error: "Runtime must be a string" });
      return;
    }
    if (runtime !== undefined) {
      const validRuntimeIds = new Set(RUNTIMES.filter((r) => r.supported).map((r) => r.id));
      if (!validRuntimeIds.has(runtime)) {
        res.status(400).json({ error: `Invalid runtime: ${runtime}` });
        return;
      }
    }
    // Validate reasoningEffort if provided (null is valid — clears the value)
    if (reasoningEffort != null) {
      const validEffortIds = new Set(REASONING_EFFORTS.map((r) => r.id));
      if (!validEffortIds.has(reasoningEffort)) {
        res.status(400).json({ error: `Invalid reasoning effort: ${reasoningEffort}` });
        return;
      }
    }
    if (restartMode !== undefined && restartMode !== "restart" && restartMode !== "session") {
      res.status(400).json({ error: `Invalid restart mode: ${restartMode}` });
      return;
    }
    // Validate avatarUrl if provided (null is valid — clears to pixel avatar)
    if (avatarUrl !== undefined && avatarUrl !== null) {
      const isPixel = avatarUrl.startsWith("pixel:");
      const isRelativeAvatar = /^\/api\/avatars\/[0-9a-f-]+\/[0-9a-f]+\.webp$/.test(avatarUrl);
      const cdnBaseUrl = process.env.CDN_BASE_URL;
      const isCdnUrl = cdnBaseUrl && avatarUrl.startsWith(cdnBaseUrl);
      if (!isPixel && !isRelativeAvatar && !isCdnUrl) {
        res.status(400).json({ error: "Invalid avatar URL" });
        return;
      }
    }
    // Validate envVars if provided (null is valid — clears the value)
    if (envVars !== undefined && envVars !== null) {
      const envError = validateEnvVars(envVars);
      if (envError) {
        res.status(400).json({ error: envError });
        return;
      }
    }
    const runtimeConfigTouched = runtimeConfig !== undefined
      || runtime !== undefined
      || model !== undefined
      || reasoningEffort !== undefined
      || envVars !== undefined;
    const normalizedConfig = runtimeConfigTouched
      ? normalizeRequestRuntimeConfig({
          runtimeConfig: runtimeConfig !== undefined ? runtimeConfig : existing.runtimeConfig,
          runtime: runtime ?? existing.runtime,
          model: model ?? existing.model,
          reasoningEffort: reasoningEffort !== undefined ? reasoningEffort : existing.reasoningEffort,
          envVars: envVars !== undefined ? envVars : existing.envVars,
          envVarsExplicit: envVars !== undefined,
        })
      : null;
    if (normalizedConfig?.error) {
      res.status(400).json({ error: normalizedConfig.error });
      return;
    }
    const updated = await agentService.updateAgent(req.params.id, {
      displayName,
      description,
      avatarUrl,
      ...(normalizedConfig
        ? {
            model: normalizedConfig.launch.model,
            runtime: normalizedConfig.launch.runtime,
            runtimeConfig: normalizedConfig.runtimeConfig,
            reasoningEffort: normalizedConfig.launch.reasoningEffort,
            envVars: normalizedConfig.launch.envVars,
          }
        : {}),
    });
    if (!updated) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const runtimeChanged = normalizedConfig !== null && normalizedConfig.launch.runtime !== existing.runtime;
    const existingRuntimeConfig = hydrateRuntimeConfig(existing);
    const runtimeConfigChanged = normalizedConfig !== null
      && JSON.stringify(normalizedConfig.runtimeConfig) !== JSON.stringify(existingRuntimeConfig);
    const runtimeProfileIdentityChanged =
      runtimeChanged
      || (normalizedConfig !== null && normalizedConfig.launch.model !== existing.model)
      || (normalizedConfig !== null && (normalizedConfig.launch.reasoningEffort ?? null) !== (existing.reasoningEffort ?? null))
      || runtimeConfigChanged;
    if (restartMode && runtimeProfileIdentityChanged) {
      await agentRuntimeProfileService.queueRuntimeProfileMigrationForAgentSettings(req.params.id);
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    agentOrchestrator.evictCache(req.params.id);
    if (restartMode) {
      // Runtime switches intentionally reset the native runtime session; model
      // and reasoning changes can still use the caller-selected restart mode.
      const effectiveRestartMode = runtimeChanged ? "session" : restartMode;
      await agentOrchestrator.resetAgent(req.params.id, effectiveRestartMode, { restartEvenIfInactive: false });
    }
    const runtimeProfile = await agentRuntimeProfileService.getAgentRuntimeProfileSummary(req.params.id);
    const refreshed = await agentService.getAgent(req.params.id) ?? updated;
    res.json(await agentService.enrichAgentWithCreatorProfile({ ...withHydratedRuntimeConfig(refreshed), runtimeProfile }));
  } catch {
    res.status(500).json({ error: "Failed to update agent" });
  }
});

// Upload agent avatar
const avatarUpload = createAvatarUpload();

agentRouter.post("/:id/avatar", avatarUpload.single("avatar"), async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const agentId = req.params.id as string;
    const agent = await agentService.getAgent(agentId);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const avatarUrl = await storeAgentAvatar(req.serverId!, agent.avatarUrl, file.buffer);

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    agentOrchestrator.evictCache(agentId);
    const updated = await agentService.updateAgent(agentId, { avatarUrl });
    res.json(updated);
  } catch (err: any) {
    if (err.message?.includes(PROFILE_AVATAR_BAD_FORMAT_MESSAGE)) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// Serve agent avatar (local dev fallback — in production, CDN serves directly)
agentAvatarRouter.get("/:serverId/:filename", async (req, res) => {
  try {
    const { serverId, filename } = req.params;
    if (!/^[0-9a-f]+\.webp$/.test(filename)) {
      res.status(400).json({ error: "Invalid filename" });
      return;
    }
    const storage = getStorage();
    if (!storage) {
      res.status(500).json({ error: "Storage not configured" });
      return;
    }
    const storageKey = `avatars/${serverId}/${filename}`;
    const stream = await storage.get(storageKey);
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    stream.pipe(res);
  } catch {
    res.status(500).json({ error: "Failed to serve avatar" });
  }
});

// Start agent (routes to machine via agentOrchestrator)
agentRouter.post("/:id/start", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    await agentOrchestrator.startAgent(req.params.id);
    const io = req.app.get("io") as SocketServer | undefined;
    if (io) {
      void onboardingService
        .triggerOwnerOnboardingOnAgentActivation(io, agentOrchestrator, req.serverId!, req.params.id)
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[Onboarding] Failed to trigger owner onboarding for started agent ${req.params.id}: ${msg}`);
        });
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to start agent" });
  }
});

// Stop agent
agentRouter.post("/:id/stop", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    await agentOrchestrator.stopAgent(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to stop agent" });
  }
});

// Reset/restart agent
agentRouter.post("/:id/reset", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    // Support new mode param, fall back to legacy clearWorkspace for backwards compat
    let mode: "restart" | "session" | "full";
    if (req.body.mode && ["restart", "session", "full"].includes(req.body.mode)) {
      mode = req.body.mode;
    } else {
      mode = req.body.clearWorkspace ? "full" : "session";
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    await agentOrchestrator.resetAgent(req.params.id, mode);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reset agent" });
  }
});

// Delete agent
agentRouter.delete("/:id", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    try { await agentOrchestrator.stopAgent(req.params.id); } catch { /* ignore */ }
    agentOrchestrator.evictCache(req.params.id);
    await agentService.deleteAgent(req.params.id);

    // Notify all clients in this server
    const io = req.app.get("io");
    io?.to(`server:${req.serverId}`).emit("agent:deleted", { agentId: req.params.id });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete agent" });
  }
});

// Assign machine to agent
agentRouter.post("/:id/assign-machine", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const { machineId } = req.body;
    // Validate machineId belongs to this server
    if (machineId) {
      const machine = await machineService.getMachine(machineId);
      if (!machine || machine.serverId !== req.serverId) {
        res.status(400).json({ error: "Machine not found in this server" });
        return;
      }
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    agentOrchestrator.evictCache(req.params.id);
    await agentService.assignMachine(req.params.id, machineId || null);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to assign machine" });
  }
});

// Get agent workspace file tree (relayed to daemon via WebSocket)
agentRouter.get("/:id/workspace-files", async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    if (!await canInspectAgentPrivateSurfaces(req.serverId!, req.userId!, agent)) {
      res.status(403).json({ error: "Only the agent creator and server admins can view agent workspace" });
      return;
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Workspace ops need local machine connection — fly-replay to correct replica
    if (agent.machineId && !agentOrchestrator.hasMachineLocally(agent.machineId)) {
      const flyInstance = await getFlyInstanceForMachine(agent.machineId);
      if (flyInstance) {
        res.set("fly-replay", `instance=${flyInstance}`);
        res.status(307).end();
        return;
      }
    }

    const dirPath = req.query.dirPath as string | undefined;
    const files = await agentOrchestrator.getAgentFileTree(req.params.id, dirPath || undefined);
    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to get workspace files" });
  }
});

// Read a file from agent workspace (relayed to daemon via WebSocket)
agentRouter.get("/:id/workspace-files/read", async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    if (!await canInspectAgentPrivateSurfaces(req.serverId!, req.userId!, agent)) {
      res.status(403).json({ error: "Only the agent creator and server admins can view agent workspace" });
      return;
    }
    const filePath = req.query.path as string;
    if (!filePath) {
      res.status(400).json({ error: "path query parameter is required" });
      return;
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Workspace ops need local machine connection — fly-replay to correct replica
    if (agent.machineId && !agentOrchestrator.hasMachineLocally(agent.machineId)) {
      const flyInstance = await getFlyInstanceForMachine(agent.machineId);
      if (flyInstance) {
        res.set("fly-replay", `instance=${flyInstance}`);
        res.status(307).end();
        return;
      }
    }

    const result = await agentOrchestrator.readAgentFile(req.params.id, filePath);
    res.json({
      path: filePath,
      content: result.content,
      binary: result.binary,
      size: result.size,
      mimeType: result.mimeType,
      encoding: result.encoding,
      modifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to read file" });
  }
});

// List agent skills (global + workspace) — relayed to daemon via WebSocket
agentRouter.get("/:id/skills", async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    if (!await canInspectAgentPrivateSurfaces(req.serverId!, req.userId!, agent)) {
      res.status(403).json({ error: "Only the agent creator and server admins can view agent workspace" });
      return;
    }
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Skills live on the machine — fly-replay to correct replica
    if (agent.machineId && !agentOrchestrator.hasMachineLocally(agent.machineId)) {
      const flyInstance = await getFlyInstanceForMachine(agent.machineId);
      if (flyInstance) {
        res.set("fly-replay", `instance=${flyInstance}`);
        res.status(307).end();
        return;
      }
    }

    const skills = await agentOrchestrator.getAgentSkills(req.params.id, agent.runtime);
    res.json(skills);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to list skills" });
  }
});

// ── Agent permission scope grants (creator + admin) ────────────────────────
//
// Visibility: the agent's human creator OR any user with `manageAgents`
// (server owner / admin) can read and edit. Per stdrc 2026-05-13
// (#proj-permission:1414ca65 msg=afe74ee3) the creator owns the agent and
// should be able to revoke its capabilities directly without going through
// a server admin.
//
// Wire shape mirrors `AgentScopeSet` from @slock-ai/shared. Whole-set updates
// only — partial scope adds/removes are not supported (locked at
// #proj-permission:10bdc2c9). The post-write set is broadcast over the
// `agent:scope-updated` ws event by Noel's hot-swap layer.

agentRouter.get("/:id/scopes", async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    if (!await canInspectAgentPrivateSurfaces(req.serverId!, req.userId!, agent)) {
      res.status(403).json({ error: "Only the agent's creator and server admins can read agent scopes" });
      return;
    }
    const set = await agentScopesService.loadAgentScopes(req.params.id);
    res.json(set);
  } catch (err) {
    if (err instanceof agentScopesService.AgentScopesNotFoundError) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    console.error("agents.scopes.read error:", err);
    res.status(500).json({ error: "Failed to load agent scopes" });
  }
});

agentRouter.put("/:id/scopes", async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.id);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    if (!await canInspectAgentPrivateSurfaces(req.serverId!, req.userId!, agent)) {
      res.status(403).json({ error: "Only the agent's creator and server admins can update agent scopes" });
      return;
    }
    const body = (req.body ?? {}) as { scopes?: unknown; mode?: unknown };
    if (body.mode === "default") {
      const set = await agentScopesService.resetAgentScopesToDefault({
        agentId: req.params.id,
        updatedByUserId: req.userId!,
      });
      res.json(set);
      return;
    }
    if (!Array.isArray(body.scopes)) {
      res.status(400).json({ error: "scopes must be an array of scope literals" });
      return;
    }
    const set = await agentScopesService.updateAgentScopes({
      agentId: req.params.id,
      scopes: body.scopes as readonly string[],
      updatedByUserId: req.userId!,
    });
    // TODO(noel): emit `agent:scope-updated` over ws so daemon caches hot-swap
    // without the next CLI/MCP call paying the DB read. Wire is the
    // `AgentScopeSet` wire shape, sent verbatim. Tracked at #proj-permission:10bdc2c9.
    res.json(set);
  } catch (err) {
    if (err instanceof agentScopesService.AgentScopesNotFoundError) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    console.error("agents.scopes.update error:", err);
    res.status(500).json({ error: "Failed to update agent scopes" });
  }
});

// Issue a one-time bootstrap token for an agent (web-session mint).
//
// `docs/server/slock-credential-rfc.zh.html#section-credential-model`
// self-hosted-runner bootstrap token issue path. This unpublished external
// surface is gated off by default; tests and future rollout can opt in with
// SLOCK_SELF_HOSTED_RUNNER_BOOTSTRAP_ENABLED=true. The caller must be
// authenticated, verified, have the `manageAgents` server capability, and the
// resource must belong to the active server. The response includes the raw
// token EXACTLY ONCE — the UI is responsible for surfacing it to the operator
// when the surface is explicitly enabled.
//
// Request body: { scopes?: string[], ttlMs?: number }
//   - scopes: subset of ALLOWED_AGENT_CAPABILITIES. Defaults to ALL caps when
//     omitted — the operator should narrow at issuance time when known.
//   - ttlMs: optional override (default 30 minutes via service layer).
agentRouter.post("/:id/bootstrap-tokens", async (req, res) => {
  if (!isAgentBootstrapSurfaceEnabled()) {
    res.status(404).json({
      error: "Self-hosted runner bootstrap is not enabled",
      code: "self_hosted_runner_bootstrap_disabled",
    });
    return;
  }

  try {
    const agent = await agentService.getAgent(req.params.id, true);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    const canManage = await userHasServerCapability(
      req.serverId!,
      req.userId!,
      "manageAgents",
    );
    if (!canManage) {
      res.status(403).json({
        error: "Only server owners and admins can issue agent bootstrap tokens",
        code: "insufficient_role",
      });
      return;
    }

    const body = (req.body ?? {}) as { scopes?: unknown; ttlMs?: unknown };

    // Default scope = all allowed caps. Narrow if caller passes a subset.
    let scopes: AgentCapability[];
    if (body.scopes === undefined) {
      scopes = [...ALLOWED_AGENT_CAPABILITIES];
    } else if (!Array.isArray(body.scopes)) {
      res.status(400).json({
        error: "scopes must be an array of capability literals",
        code: "scopes_invalid",
      });
      return;
    } else {
      try {
        scopes = normalizeAgentCapabilities(body.scopes as readonly string[]);
      } catch {
        res.status(400).json({
          error: `scopes must each be one of: ${ALLOWED_AGENT_CAPABILITIES.join(", ")}`,
          code: "scopes_invalid",
        });
        return;
      }
      if (scopes.length === 0) {
        res.status(400).json({
          error: "scopes must include at least one capability",
          code: "scopes_empty",
        });
        return;
      }
    }

    let ttlMs: number | undefined;
    if (body.ttlMs !== undefined) {
      if (typeof body.ttlMs !== "number" || !Number.isFinite(body.ttlMs) || body.ttlMs <= 0) {
        res.status(400).json({
          error: "ttlMs must be a positive number of milliseconds",
          code: "ttl_invalid",
        });
        return;
      }
      // Cap at 24h to bound blast radius of accidental long-lived tokens.
      const MAX_TTL_MS = 24 * 60 * 60 * 1000;
      if (body.ttlMs > MAX_TTL_MS) {
        res.status(400).json({
          error: "ttlMs cannot exceed 24 hours",
          code: "ttl_too_long",
        });
        return;
      }
      ttlMs = body.ttlMs;
    }

    const issued = await issueAgentBootstrapToken({
      agentId: agent.id,
      serverId: req.serverId!,
      issuedByUserId: req.userId!,
      scopes,
      ttlMs,
    });

    res.status(201).json({
      tokenId: issued.tokenId,
      // Raw token is surfaced exactly once; UI must copy-to-clipboard now.
      bootstrapToken: issued.rawToken,
      tokenPrefix: issued.tokenPrefix,
      ttlExpiresAt: issued.ttlExpiresAt.toISOString(),
      scopes: issued.scopes,
      agentId: agent.id,
      agentName: agent.name,
      serverId: req.serverId!,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "agent_missing") {
        res.status(404).json({ error: "Agent not found", code: "agent_missing" });
        return;
      }
      if (err.message === "agent_server_mismatch") {
        // Defense-in-depth — should already be caught by the 404 above.
        res.status(404).json({ error: "Agent not found", code: "agent_missing" });
        return;
      }
    }
    console.error("agents.bootstrap-tokens.issue error:", err);
    res.status(500).json({ error: "Failed to issue bootstrap token" });
  }
});

// Note: `POST /api/agents/:id/credentials` lives in
// `packages/server/src/routes/agentCredentials.ts` and is mounted in
// `app.ts` BEFORE this router. It deliberately does NOT require
// `X-Server-Id` (it derives the server context from `agent.serverId`)
// so a CLI caller doesn't have to know the serverId out-of-band. See
// `#proj-runtime:3d515727` (XX msg=dc316ca3 / Hao msg=b50c93bd) for
// the §3 invariant: CLI resource-explicit surfaces derive server
// context from the subject row, not from active-server header.
