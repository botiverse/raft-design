// /internal/agent/:id/* — legacy machine-on-behalf agent surface.
//
// This router exists for old daemon builds and compatibility clients that
// still hold a machine token. New managed-runner launches must mint an
// `sk_agent_*` credential and use `/internal/agent-api/*`; #1836 deliberately
// does not use this legacy surface as an in-process fallback when runner
// credential mint fails. The release safety story for new daemon builds is
// server-first rollout plus daemon binary rollback.
//
// Keep auth/router adapter concerns here. When sharing implementation with
// `/internal/agent-api/*`, extract principal-agnostic service/use-case helpers
// that receive an already-authorized actor value instead of branching on
// machine-vs-runner principal inside shared core.
import { Router, type Request, type Response, type Router as RouterType } from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import * as messageService from "../services/messageService.js";
import * as channelService from "../services/channelService.js";
import * as agentService from "../services/agentService.js";
import * as machineService from "../services/machineService.js";
import * as serverService from "../services/serverService.js";
import * as taskService from "../services/taskService.js";
import * as searchService from "../services/searchService.js";
import * as reminderService from "../services/reminderService.js";
import * as oauthService from "../services/oauthService.js";
import { resolveScheduleInput } from "../services/reminderScheduleInput.js";
import { parseRecurrenceString, computeNextFire, formatRecurrence, type Recurrence } from "../services/recurrence.js";
import * as agentPermalinkRenderService from "../services/agentPermalinkRenderService.js";
import * as actionCardsService from "../services/actionCardsService.js";
import * as attestedSendService from "../services/attestedSendService.js";
import { emitTaskCreated, emitTaskUpdated } from "../services/taskRealtimeEvents.js";
import { buildMachineReadModel } from "../services/machineReadModel.js";
import { getLatestDaemonVersion } from "../services/daemonVersionService.js";
import { getServerPlan, getHistoryCutoff, isChannelReadOnlyByQuota } from "../services/planService.js";
import {
  PLAN_CONFIG,
  getEffectiveLimits,
  type AgentProfileView,
  type HumanProfileView,
  type ProfileCreatedAgentSummary,
  type ProfileCreatorSummary,
  type ProfileView,
  type ServerPlan,
} from "@slock-ai/shared";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import type { Server as SocketServer } from "socket.io";
import { getFlyInstanceForMachine } from "../replicaRouter.js";
import { getDb } from "../db/index.js";
import { attachments, channels, messageReactions, messages } from "../db/schema.js";
import { and, eq, sql } from "drizzle-orm";
import { getStorage, getCdnStorage, isStorageTimeoutError } from "../services/storageService.js";
import {
  ATTACHMENT_TOO_LARGE_MESSAGE,
  ATTACHMENT_UPLOAD_DISABLED_MESSAGE,
  MAX_ATTACHMENT_FILE_SIZE_BYTES,
  buildSvgRasterPreviewKey,
  canGenerateImagePreview,
  generateThumbnail,
  generateSvgRasterPreview,
  getThumbnailUrl,
  isAttachmentUploadEnabled,
  isEmptyUploadedFile,
  isOversizedUploadedFile,
  isSvgAttachmentMimeType,
  normalizeAttachmentFilename,
  normalizeUploadedMimeType,
  resolveAttachmentMimeType,
} from "./attachments.js";
import { classifyHistoryAroundCursor } from "./historyCursor.js";
import { applyHistoryThreadMetadata, getHistoryThreadParentMessageIds } from "./historyThreadMetadata.js";
import { forbiddenMessageForTarget, notFoundMessageForTarget, resolveWritableAgentTarget } from "./agentWritableTarget.js";
import { createScopeAttestation } from "../lib/scopeAttestation.js";
import { requireAgentScope } from "../middleware/agentScope.js";
import { AGENT_CREDENTIAL_BRIDGE_MACHINE_ID } from "../middleware/agentCredentialBridge.js";
import * as agentScopesService from "../services/agentScopesService.js";
import { addTraceEvent, getCurrentTraceContext, getCurrentTraceSpan, tracePhase } from "../tracing/semanticTrace.js";
import {
  createAvatarUpload,
  MAX_PROFILE_AVATAR_BYTES,
  PROFILE_AVATAR_BAD_FORMAT_MESSAGE,
  PROFILE_AVATAR_TOO_LARGE_MESSAGE,
  runSingleAvatarUpload,
  storeAgentAvatar,
} from "../services/avatarService.js";
import { handleAgentKnowledgeGet } from "./agentKnowledge.js";

export const internalRouter: RouterType = Router();

const MAX_REACTION_LENGTH = 16;
const ATTESTED_SEND_HELD_CONTEXT_LIMIT = 3;
const DEFAULT_AGENT_LOGIN_SCOPES = ["openid", "profile", "identity"] as const;

function parseReactionEmoji(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const emoji = value.trim();
  if (!emoji || emoji.length > MAX_REACTION_LENGTH || /\s/.test(emoji)) return null;
  return emoji;
}

async function loadVisibleMessageForAgent(
  messageId: string,
  agentId: string,
  serverId: string,
  res: Response,
): Promise<NonNullable<Awaited<ReturnType<typeof messageService.getMessage>>> | null> {
  const resolvedMessageId = await messageService.resolveMessageIdInServer(serverId, messageId);
  if (!resolvedMessageId.ok) {
    res.status(resolvedMessageId.status).json({ error: resolvedMessageId.error });
    return null;
  }
  const message = await messageService.getMessage(resolvedMessageId.messageId);
  if (!message) {
    res.status(404).json({ error: "Message not found" });
    return null;
  }

  const channel = await channelService.getChannel(message.channelId);
  if (!channel || channel.serverId !== serverId) {
    res.status(404).json({ error: "Message not found" });
    return null;
  }

  const canAccess = await channelService.canAgentAccessChannel(message.channelId, agentId);
  if (!canAccess) {
    res.status(404).json({ error: "Message not found" });
    return null;
  }

  return message;
}

function isSlockCliRequest(req: Request): boolean {
  return req.header("X-Slock-Client") === "cli";
}

function recordSlockCliActivity(
  req: Request,
  agentId: string,
  event: Parameters<AgentOrchestrator["recordSlockCliAction"]>[1],
) {
  if (!isSlockCliRequest(req)) return;
  const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
  agentOrchestrator?.recordSlockCliAction?.(agentId, event);
}

async function recordAgentSlockAction(
  req: Request,
  agentId: string,
  event: Parameters<AgentOrchestrator["recordAgentSlockAction"]>[1],
): Promise<void> {
  const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
  if (typeof agentOrchestrator?.recordAgentSlockAction !== "function") return;
  await agentOrchestrator.recordAgentSlockAction(agentId, event);
}

function formatAttestedMessageCount(count: number): string {
  return `${count} newer message${count === 1 ? "" : "s"}`;
}

function toAgentFacingActorType(type: "user" | "agent"): "human" | "agent" {
  return type === "user" ? "human" : "agent";
}

function serializeOAuthClientForAgent(
  client: Awaited<ReturnType<typeof oauthService.listOAuthClients>>[number],
) {
  return {
    id: client.id,
    clientId: client.clientId,
    name: client.name,
    description: client.description,
    homepageUrl: client.homepageUrl,
    returnUrl: client.returnUrl,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

function normalizeAgentLoginScopes(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [...DEFAULT_AGENT_LOGIN_SCOPES];
  if (!Array.isArray(raw)) throw new Error("scopes must be an array");

  const scopes = Array.from(new Set(raw.map((scope) => {
    if (typeof scope !== "string") throw new Error("scopes must contain strings");
    const trimmed = scope.trim();
    if (!trimmed) throw new Error("scope values must be non-empty");
    return trimmed;
  }))).sort();

  if (scopes.length === 0) throw new Error("at least one scope is required");
  return scopes;
}

function resolveAgentLoginClient(
  clients: Awaited<ReturnType<typeof oauthService.listOAuthClients>>,
  rawService: unknown,
):
  | { ok: true; client: Awaited<ReturnType<typeof oauthService.listOAuthClients>>[number] }
  | { ok: false; status: 400 | 404 | 409; error: string } {
  if (typeof rawService !== "string" || !rawService.trim()) {
    return { ok: false, status: 400, error: "service is required" };
  }

  const service = rawService.trim();
  const exact = clients.find((client) => client.id === service || client.clientId === service);
  if (exact) return { ok: true, client: exact };

  const normalized = service.toLowerCase();
  const nameMatches = clients.filter((client) => client.name.toLowerCase() === normalized);
  if (nameMatches.length === 1) return { ok: true, client: nameMatches[0] };
  if (nameMatches.length > 1) {
    return { ok: false, status: 409, error: "Service name is ambiguous; use the service id or client id" };
  }

  return { ok: false, status: 404, error: "Registered service not found" };
}

function serializeErrorForLog(err: unknown): unknown {
  if (!(err instanceof Error)) return err;

  const errorWithMeta = err as Error & Record<string, unknown>;
  const cause = errorWithMeta.cause;
  const causeMeta = cause && typeof cause === "object"
    ? cause as Record<string, unknown>
    : null;

  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...(errorWithMeta.code !== undefined ? { code: errorWithMeta.code } : {}),
    ...(errorWithMeta.detail !== undefined ? { detail: errorWithMeta.detail } : {}),
    ...(errorWithMeta.constraint !== undefined ? { constraint: errorWithMeta.constraint } : {}),
    ...(errorWithMeta.schema !== undefined ? { schema: errorWithMeta.schema } : {}),
    ...(errorWithMeta.table !== undefined ? { table: errorWithMeta.table } : {}),
    ...(errorWithMeta.column !== undefined ? { column: errorWithMeta.column } : {}),
    ...(errorWithMeta.routine !== undefined ? { routine: errorWithMeta.routine } : {}),
    ...(causeMeta
      ? {
          cause: {
            ...(cause instanceof Error
              ? {
                  name: cause.name,
                  message: cause.message,
                  stack: cause.stack,
                }
              : {}),
            ...(causeMeta.code !== undefined ? { code: causeMeta.code } : {}),
            ...(causeMeta.detail !== undefined ? { detail: causeMeta.detail } : {}),
            ...(causeMeta.constraint !== undefined ? { constraint: causeMeta.constraint } : {}),
            ...(causeMeta.schema !== undefined ? { schema: causeMeta.schema } : {}),
            ...(causeMeta.table !== undefined ? { table: causeMeta.table } : {}),
            ...(causeMeta.column !== undefined ? { column: causeMeta.column } : {}),
            ...(causeMeta.routine !== undefined ? { routine: causeMeta.routine } : {}),
          },
        }
      : cause !== undefined
        ? { cause }
        : {}),
  };
}

function classifyAgentSendTarget(raw: unknown): "channel" | "thread" | "dm" | "legacy_dm" | "unknown" {
  if (typeof raw !== "string") return "unknown";
  if (raw.startsWith("dm:@")) return "dm";
  if (raw.startsWith("@")) return "legacy_dm";
  if (raw.includes(":")) return "thread";
  if (raw.startsWith("#")) return "channel";
  return "unknown";
}

/**
 * Validate that the requesting machine owns the agent (agent.machineId === req.machineId).
 * Prevents a machine from impersonating agents assigned to a different machine.
 */
function verifyMachineOwnsAgent(
  agent: { machineId: string | null; serverId: string },
  machineId: string | undefined,
  serverId: string | undefined,
): string | null {
  if (agent.serverId !== serverId) return "Agent not found";
  if (machineId === AGENT_CREDENTIAL_BRIDGE_MACHINE_ID && agent.machineId === null) return null;
  if (!machineId || agent.machineId !== machineId) return "This agent is not assigned to your machine";
  return null; // OK
}

type OwnedMachineAgentResult =
  | {
      agent: NonNullable<Awaited<ReturnType<typeof agentService.getAgent>>>;
    }
  | {
      status: 401 | 403 | 404;
      error: string;
    };

async function loadOwnedMachineAgent(
  agentId: string,
  machineId: string | undefined,
  serverId: string | undefined,
): Promise<OwnedMachineAgentResult> {
  if (!machineId || !serverId) {
    return { status: 401, error: "Machine authentication required" };
  }

  const agent = await agentService.getAgent(agentId);
  if (!agent) {
    return { status: 404, error: "Agent not found" };
  }

  const ownerErr = verifyMachineOwnsAgent(agent, machineId, serverId);
  if (ownerErr) {
    return { status: ownerErr === "Agent not found" ? 404 : 403, error: ownerErr };
  }

  return { agent };
}

function normalizeProfileTarget(raw: unknown): string | null {
  if (raw === undefined) return null;
  if (typeof raw !== "string") {
    throw new Error("target must be a string");
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("target must not be empty");
  }
  if (!trimmed.startsWith("@")) {
    throw new Error("target must start with @");
  }

  const handle = trimmed.slice(1).trim();
  if (!handle) {
    throw new Error("target handle must not be empty");
  }
  return handle;
}

function normalizeMemberHandleRef(raw: unknown): string | null {
  if (raw === undefined) return null;
  if (typeof raw !== "string") {
    throw new Error("member ref must be a string");
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("member ref must not be empty");
  }
  const handle = trimmed.replace(/^@/, "").trim();
  if (!handle) {
    throw new Error("member handle must not be empty");
  }
  return handle;
}

/**
 * CLI member-ref contract (see packages/cli/AGENTS.md):
 * - agent-facing member refs are handles (`@handle` or `handle`), not UUIDs;
 * - the server resolves handle -> internal sender id and applies visibility;
 * - unknown or invisible members return one not-found shape instead of a
 *   silent empty search result. Ambiguous human/agent handles are explicit.
 *
 * `senderId` remains accepted by the internal route as a low-level compatibility
 * path, but the slock CLI must send `sender` handles only.
 */
async function resolveSearchSenderFilter(
  serverId: string,
  rawSender: unknown,
  rawSenderId: unknown,
): Promise<
  | { ok: true; senderId?: string }
  | { ok: false; status: 400 | 404 | 409; error: string; errorCode: string }
> {
  if (rawSender !== undefined && rawSenderId !== undefined) {
    return {
      ok: false,
      status: 400,
      error: "Use either sender or senderId, not both",
      errorCode: "invalid_member_ref",
    };
  }

  if (rawSenderId !== undefined) {
    if (typeof rawSenderId !== "string" || !rawSenderId.trim()) {
      return {
        ok: false,
        status: 400,
        error: "senderId must be a non-empty string",
        errorCode: "invalid_member_ref",
      };
    }
    return { ok: true, senderId: rawSenderId.trim() };
  }

  let handle: string | null;
  try {
    handle = normalizeMemberHandleRef(rawSender);
  } catch (err) {
    return {
      ok: false,
      status: 400,
      error: err instanceof Error ? err.message : "Invalid member ref",
      errorCode: "invalid_member_ref",
    };
  }
  if (!handle) return { ok: true };

  const [humanId, agentId] = await Promise.all([
    channelService.resolveUserByName(serverId, handle),
    channelService.resolveAgentByName(serverId, handle),
  ]);

  if (humanId && agentId) {
    return {
      ok: false,
      status: 409,
      error: `Member @${handle} is ambiguous`,
      errorCode: "ambiguous_member_ref",
    };
  }

  const senderId = humanId ?? agentId ?? undefined;
  if (!senderId) {
    return {
      ok: false,
      status: 404,
      error: `Member not found: @${handle}`,
      errorCode: "member_not_found",
    };
  }

  return { ok: true, senderId };
}

function toProfileCreatedAgentSummary(agent: {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  runtime: string;
  status: string;
}): ProfileCreatedAgentSummary {
  return {
    id: agent.id,
    name: agent.name,
    displayName: agent.displayName,
    avatarUrl: agent.avatarUrl,
    runtime: agent.runtime,
    status: agent.status as ProfileCreatedAgentSummary["status"],
  };
}

function toProfileCreatorSummary(
  creator: Awaited<ReturnType<typeof agentService.getAgentCreator>>,
): ProfileCreatorSummary | null {
  if (!creator) return null;
  if (creator.type === "human") {
    return {
      type: "human",
      id: creator.id,
      name: creator.name,
      displayName: creator.displayName,
      avatarUrl: creator.avatarUrl,
      gravatarHash: creator.gravatarHash,
    };
  }

  return {
    type: "agent",
    id: creator.id,
    name: creator.name,
    displayName: creator.displayName,
    avatarUrl: creator.avatarUrl,
    deletedAt: creator.deletedAt ? creator.deletedAt.toISOString() : null,
  };
}

async function buildHumanProfileView(
  serverId: string,
  userId: string,
): Promise<HumanProfileView | null> {
  const members = await serverService.getServerMembers(serverId, null);
  const member = members.find((candidate) => candidate.userId === userId);
  if (!member) return null;
  const createdAgents = await agentService.listCreatedAgents(serverId, "user", userId);

  return {
    kind: "human",
    id: member.userId,
    isSelf: false,
    name: member.name,
    displayName: member.displayName,
    description: member.description,
    avatarUrl: member.avatarUrl,
    email: member.email,
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
    membershipStatus: "active",
    createdAgents: createdAgents.map(toProfileCreatedAgentSummary),
  };
}

async function buildAgentProfileView(
  agentId: string,
  selfAgentId: string,
  agentOrchestrator: AgentOrchestrator | undefined,
): Promise<AgentProfileView | null> {
  const agent = await agentService.getAgent(agentId, true);
  if (!agent) return null;

  const creator = await agentService.getAgentCreator(agent);
  const createdAgents = await agentService.listCreatedAgents(agent.serverId, "agent", agent.id);
  const machine = agent.machineId ? await machineService.getMachine(agent.machineId) : null;
  const daemonVersion = agent.machineId
    ? agentOrchestrator?.getMachineDaemonVersion(agent.machineId) ?? machine?.daemonVersion ?? null
    : null;

  return {
    kind: "agent",
    id: agent.id,
    isSelf: agent.id === selfAgentId,
    name: agent.name,
    displayName: agent.displayName,
    description: agent.description,
    avatarUrl: agent.avatarUrl,
    status: agent.status,
    runtime: agent.runtime,
    model: agent.model,
    reasoningEffort: agent.reasoningEffort ?? null,
    executionMode: agent.executionMode,
    computerId: agent.machineId,
    computerName: machine?.name ?? null,
    computerHostname: machine?.hostname ?? null,
    daemonVersion,
    creator: toProfileCreatorSummary(creator),
    createdAgents: createdAgents.map(toProfileCreatedAgentSummary),
    createdAt: agent.createdAt.toISOString(),
    deletedAt: agent.deletedAt ? agent.deletedAt.toISOString() : null,
  };
}

async function resolveProfileViewForAgent(
  serverId: string,
  selfAgentId: string,
  rawTarget: unknown,
  agentOrchestrator: AgentOrchestrator | undefined,
): Promise<
  | { ok: true; profile: ProfileView }
  | { ok: false; status: 400 | 404 | 409; error: string }
> {
  let targetHandle: string | null;
  try {
    targetHandle = normalizeProfileTarget(rawTarget);
  } catch (err) {
    return { ok: false, status: 400, error: err instanceof Error ? err.message : "Invalid target" };
  }

  if (!targetHandle) {
    const selfProfile = await buildAgentProfileView(selfAgentId, selfAgentId, agentOrchestrator);
    if (!selfProfile) {
      return { ok: false, status: 404, error: "Agent not found" };
    }
    return { ok: true, profile: selfProfile };
  }

  const [humanId, targetAgentId] = await Promise.all([
    channelService.resolveUserByName(serverId, targetHandle),
    channelService.resolveAgentByName(serverId, targetHandle),
  ]);

  if (humanId && targetAgentId) {
    return { ok: false, status: 409, error: `Profile handle @${targetHandle} is ambiguous` };
  }

  if (targetAgentId) {
    const profile = await buildAgentProfileView(targetAgentId, selfAgentId, agentOrchestrator);
    return profile
      ? { ok: true, profile }
      : { ok: false, status: 404, error: `Profile @${targetHandle} not found` };
  }

  if (humanId) {
    const profile = await buildHumanProfileView(serverId, humanId);
    return profile
      ? { ok: true, profile }
      : { ok: false, status: 404, error: `Profile @${targetHandle} not found` };
  }

  return { ok: false, status: 404, error: `Profile @${targetHandle} not found` };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAEMON_CAPABILITY_TTL_MS = 2 * 60 * 1000;
const DAEMON_CAPABILITY_SCOPE_RE = /^[a-z][a-z0-9.-]*:[a-z][a-z0-9.-]*$/;
const TRACE_BUNDLE_MAX_BYTES = 50 * 1024 * 1024;
type DaemonCapabilityPolicy = {
  audience: string;
  deriveResource: (ctx: { serverId: string; machineId: string }) => string;
  deriveMetadata?: (ctx: { serverId: string; machineId: string }, metadata: Record<string, unknown>) => Record<string, unknown>;
};

const DAEMON_CAPABILITY_POLICIES: Record<string, DaemonCapabilityPolicy> = {
  "feedback-report:create": {
    audience: "feedback-worker",
    deriveResource: ({ serverId, machineId }) => `servers/${serverId}/machines/${machineId}/feedback-reports`,
  },
  "daemon-trace-bundle:create": {
    audience: "trace-ingest-worker",
    deriveResource: ({ serverId, machineId }) => `servers/${serverId}/machines/${machineId}/trace-bundles`,
    deriveMetadata: deriveDaemonTraceBundleMetadata,
  },
};

type CreateDaemonScopeAttestationRequest = {
  scope: string;
  metadata: Record<string, unknown>;
};

function parseDaemonScopeAttestationRequest(raw: unknown): CreateDaemonScopeAttestationRequest {
  if (!raw || typeof raw !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const body = raw as Record<string, unknown>;
  const scope = typeof body.scope === "string" ? body.scope.trim() : "";

  if (!scope) throw new Error("scope is required");
  if (!DAEMON_CAPABILITY_SCOPE_RE.test(scope)) throw new Error("scope is invalid");
  if (!DAEMON_CAPABILITY_POLICIES[scope]) throw new Error(`Unsupported scope: ${scope}`);
  if (body.audience !== undefined) throw new Error("audience is derived from scope");
  if (body.resource !== undefined) throw new Error("resource is derived from scope");
  if (body.metadata !== undefined && (!body.metadata || typeof body.metadata !== "object" || Array.isArray(body.metadata))) {
    throw new Error("metadata must be a JSON object");
  }

  return { scope, metadata: (body.metadata as Record<string, unknown> | undefined) ?? {} };
}

function deriveDaemonTraceBundleMetadata(
  ctx: { serverId: string; machineId: string },
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const bundleId = readAttestationString(metadata.bundleId, "metadata.bundleId", 128);
  const bundleSha256 = readAttestationSha256(metadata.bundleSha256, "metadata.bundleSha256");
  const bundleSizeBytes = readAttestationInteger(metadata.bundleSizeBytes, "metadata.bundleSizeBytes", TRACE_BUNDLE_MAX_BYTES);
  const uploadId = randomUUID();
  return {
    uploadId,
    objectKey: `trace-bundles/${ctx.serverId}/${ctx.machineId}/${uploadId}.jsonl.gz`,
    bundleId,
    bundleSha256,
    bundleSizeBytes,
    maxBytes: TRACE_BUNDLE_MAX_BYTES,
    bundleContentType: "application/x-ndjson",
    bundleContentEncoding: "gzip",
    deploymentEnvironment: process.env.DEPLOYMENT_ENV || process.env.NODE_ENV || "unknown",
  };
}

function readAttestationString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${name} is required`);
  if (value.length > maxLength) throw new Error(`${name} is too long`);
  return value;
}

function readAttestationSha256(value: unknown, name: string): string {
  const result = readAttestationString(value, name, 64).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(result)) throw new Error(`${name} is invalid`);
  return result;
}

function readAttestationInteger(value: unknown, name: string, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) throw new Error(`${name} is invalid`);
  if (value > max) throw new Error(`${name} exceeds maxBytes`);
  return value;
}

// Reminder receipt fallback text: deterministic UTC minute precision. The
// receipt now ships a structured token and the web UI re-renders it into the
// viewer's local timezone, but this UTC string remains as a safe fallback for
// any surface that doesn't understand the token yet.
function formatFireAtForReceiptFallback(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

function buildReminderFireAtToken(d: Date): string {
  const fallback = formatFireAtForReceiptFallback(d);
  return `<span data-reminder-fire-at="${d.toISOString()}">${fallback}</span>`;
}

export async function resolveReminderMsgId(
  serverId: string,
  msgId: string,
): Promise<
  | { ok: true; messageId: string }
  | { ok: false; status: 400 | 404; error: string }
> {
  const db = getDb();

  if (/^[0-9a-f]{8}$/i.test(msgId)) {
    const rows = await db
      .select({ id: messages.id })
      .from(messages)
      .innerJoin(channels, eq(channels.id, messages.channelId))
      .where(and(
        eq(channels.serverId, serverId),
        sql`${messages.id}::text LIKE ${msgId.toLowerCase() + "%"}`,
      ))
      .limit(2);

    if (rows.length === 1) {
      return { ok: true, messageId: rows[0].id };
    }
    if (rows.length === 0) {
      return { ok: false, status: 404, error: "message not found" };
    }
    return { ok: false, status: 400, error: "msgId short id is ambiguous" };
  }

  if (!UUID_RE.test(msgId)) {
    return { ok: false, status: 400, error: "msgId must be a full UUID or 8-char short id" };
  }

  const [row] = await db
    .select({ id: messages.id })
    .from(messages)
    .innerJoin(channels, eq(channels.id, messages.channelId))
    .where(and(eq(channels.serverId, serverId), eq(messages.id, msgId)))
    .limit(1);

  if (!row) {
    return { ok: false, status: 404, error: "message not found" };
  }

  return { ok: true, messageId: row.id };
}

internalRouter.get("/machine/self", async (req, res) => {
  try {
    const machineId = req.machineId;
    const serverId = req.serverId;
    if (!machineId || !serverId) {
      res.status(401).json({ error: "Machine authentication required" });
      return;
    }

    const machine = await machineService.getMachine(machineId);
    if (!machine || machine.serverId !== serverId) {
      res.status(404).json({ error: "Machine not found" });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const readModel = await buildMachineReadModel(machine, agentOrchestrator);
    const server = await serverService.getServer(serverId);
    const latestDaemonVersion = await getLatestDaemonVersion();
    res.json({
      ...readModel,
      workspaceId: serverId,
      workspaceName: server?.name ?? null,
      serverSlug: server?.slug ?? null,
      latestDaemonVersion,
    });
  } catch {
    res.status(500).json({ error: "Failed to load machine" });
  }
});

internalRouter.get("/machine/agents", async (req, res) => {
  try {
    const machineId = req.machineId;
    const serverId = req.serverId;
    if (!machineId || !serverId) {
      res.status(401).json({ error: "Machine authentication required" });
      return;
    }

    const machine = await machineService.getMachine(machineId);
    if (!machine || machine.serverId !== serverId) {
      res.status(404).json({ error: "Machine not found" });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const agents = await agentService.getAgentsForMachine(machineId);
    const enriched = await Promise.all(
      agents
        .filter((agent) => agent.serverId === serverId)
        .map(async (agent) => {
          const { activity, activityDetail } = await agentOrchestrator.getActivity(agent.id, {
            parent: getCurrentTraceContext(),
          });
          return {
            id: agent.id,
            name: agent.name,
            displayName: agent.displayName,
            avatarUrl: agent.avatarUrl,
            description: agent.description,
            status: agent.status,
            activity,
            activityDetail,
            model: agent.model,
            runtime: agent.runtime,
            executionMode: agent.executionMode,
          };
        }),
    );

    res.json(enriched);
  } catch {
    res.status(500).json({ error: "Failed to load machine-assigned agents" });
  }
});

internalRouter.post("/machine/agents/:id/start", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    await agentOrchestrator.startAgent(result.agent.id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to start machine-assigned agent" });
  }
});

internalRouter.post("/machine/agents/:id/stop", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    await agentOrchestrator.stopAgent(result.agent.id);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to stop machine-assigned agent" });
  }
});

internalRouter.get("/agent/:id/integrations", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const [clients, overview] = await Promise.all([
      oauthService.listOAuthClients(result.agent.serverId),
      oauthService.getAgentIntegrationsOverview(result.agent.id),
    ]);
    const activeLogins = overview
      .filter((item) => item.type === "active" && !item.revokedAt)
      .map((item) => ({
        id: item.id,
        serviceId: item.clientId,
        clientId: item.clientKey,
        name: item.clientName,
        description: item.clientDescription,
        homepageUrl: item.clientHomepageUrl,
        returnUrl: item.clientReturnUrl,
        scopes: item.scopes,
        createdAt: item.createdAt,
      }));

    res.json({
      services: clients.map(serializeOAuthClientForAgent),
      activeLogins,
    });
  } catch (err) {
    console.error("List agent integrations error:", err);
    res.status(500).json({ error: "Failed to list agent integrations" });
  }
});

internalRouter.post("/agent/:id/integrations/login", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const server = await serverService.getServer(result.agent.serverId);
    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const clients = await oauthService.listOAuthClients(result.agent.serverId);
    const resolved = resolveAgentLoginClient(clients, req.body?.service);
    if (!resolved.ok) {
      res.status(resolved.status).json({ error: resolved.error });
      return;
    }

    const scopes = normalizeAgentLoginScopes(req.body?.scopes);
    const requested = await oauthService.requestAgentAccess({
      clientId: resolved.client.id,
      serverSlug: server.slug,
      agentName: result.agent.name,
      scopes,
    });

    res.json({
      status: requested.grantStatus === "reused" ? "already_logged_in" : "logged_in",
      service: serializeOAuthClientForAgent(resolved.client),
      scopes: requested.request.scopes ?? [],
      requestId: requested.request.id,
    });
  } catch (err: any) {
    const message = err?.message || "Failed to provision agent login";
    if (
      message === "scopes must be an array" ||
      message === "scopes must contain strings" ||
      message === "scope values must be non-empty" ||
      message === "at least one scope is required"
    ) {
      res.status(400).json({ error: message });
      return;
    }
    if (message.includes("not found")) {
      res.status(404).json({ error: message });
      return;
    }
    console.error("Agent integration login error:", err);
    res.status(500).json({ error: "Failed to provision agent login" });
  }
});

// Machine-auth, pull-on-demand scope capability for daemon direct-to-worker calls.
// The server signs authorization metadata only; upload/data bytes must go to the
// requested third-party worker directly from the daemon.
internalRouter.post("/machine/scope-attestation", async (req, res) => {
  try {
    if (!req.machineId || !req.serverId) {
      res.status(401).json({ error: "Machine authentication required" });
      return;
    }

    addTraceEvent("scope_attestation.request.started", {
      surface: "machine",
      metadata_present: typeof req.body?.metadata === "object" && req.body.metadata !== null,
    });

    const { scope, metadata: requestMetadata } = await tracePhase(
      () => Promise.resolve(parseDaemonScopeAttestationRequest(req.body)),
      (_durationMs, result) => ({
        name: "scope_attestation.request.parsed",
        attrs: {
          surface: "machine",
          scope: result.scope,
          metadata_present: !!result.metadata,
        },
      }),
    );
    const machine = await tracePhase(
      () => machineService.getMachine(req.machineId!),
      (_durationMs, result) => ({
        name: "scope_attestation.machine.loaded",
        attrs: {
          surface: "machine",
          outcome: result && result.serverId === req.serverId ? "found" : "missing",
        },
      }),
    );
    if (!machine || machine.serverId !== req.serverId) {
      res.status(401).json({ error: "Machine authentication required" });
      return;
    }

    const server = await tracePhase(
      () => serverService.getServer(req.serverId!),
      (_durationMs, result) => ({
        name: "scope_attestation.server.loaded",
        attrs: {
          surface: "machine",
          outcome: result ? "found" : "missing",
        },
      }),
    );
    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    const policy = DAEMON_CAPABILITY_POLICIES[scope];
    const audience = policy.audience;
    const resource = policy.deriveResource({ serverId: server.id, machineId: machine.id });
    const metadata = policy.deriveMetadata?.({ serverId: server.id, machineId: machine.id }, requestMetadata);

    const expiresAt = new Date(Date.now() + DAEMON_CAPABILITY_TTL_MS);
    const attestation = await tracePhase(
      () => Promise.resolve(createScopeAttestation({
        v: 1,
        typ: "scope-attestation",
        scope,
        sub: `machine:${machine.id}`,
        actorType: "machine",
        machineId: machine.id,
        serverId: server.id,
        serverSlug: server.slug,
        aud: audience,
        resource,
        ...(metadata ? { metadata } : {}),
        nonce: randomUUID(),
        jti: randomUUID(),
        exp: Math.floor(expiresAt.getTime() / 1000),
      })),
      () => ({
        name: "scope_attestation.signed",
        attrs: {
          surface: "machine",
          scope,
          audience,
          metadata_present: !!metadata,
          ttl_seconds: Math.floor(DAEMON_CAPABILITY_TTL_MS / 1000),
        },
      }),
    );

    addTraceEvent("response.ready", {
      status_code: 200,
      surface: "machine",
      scope,
    });
    res.json({
      attestation,
      scope,
      audience,
      resource,
      ...(metadata ? { metadata } : {}),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create scope attestation";
    if (message.includes("not configured")) {
      res.status(503).json({ error: message });
      return;
    }
    if (
      message === "Request body must be a JSON object" ||
      message === "scope is required" ||
      message === "scope is invalid" ||
      message.startsWith("Unsupported scope:") ||
      message === "audience is derived from scope" ||
      message === "resource is derived from scope" ||
      message === "metadata must be a JSON object" ||
      message.startsWith("metadata.")
    ) {
      res.status(400).json({ error: message });
      return;
    }
    res.status(500).json({ error: "Failed to create scope attestation" });
  }
});

// --- Agent file upload ---

const profileAvatarUpload = createAvatarUpload();

type InternalAgentSendState = "sent" | "held";

function toAttestedSendTargetType(type: "channel" | "private" | "joint" | "dm" | "thread"): attestedSendService.AttestedSendTargetType {
  return type === "private" || type === "joint" ? "channel" : type;
}

function parseIdAllowlist(value: string | undefined): Set<string> {
  return new Set((value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean));
}

function isSendFreshnessEnabled(serverId: string, agentId: string): boolean {
  const mode = (process.env.SLOCK_ATTESTED_SEND_MODE ?? "on").trim().toLowerCase();
  if (mode === "on" || mode === "force" || mode === "1" || mode === "true") return true;
  if (mode !== "allowlist") return false;

  const serverAllowlist = parseIdAllowlist(process.env.SLOCK_ATTESTED_SEND_SERVER_IDS);
  const agentAllowlist = parseIdAllowlist(process.env.SLOCK_ATTESTED_SEND_AGENT_IDS);
  return serverAllowlist.has("*") ||
    agentAllowlist.has("*") ||
    serverAllowlist.has(serverId) ||
    agentAllowlist.has(agentId);
}

interface InternalAgentSendResponse {
  ok: true;
  state: InternalAgentSendState;
  messageId?: string;
  messageSeq?: number;
  heldMessages?: unknown[];
  newMessageCount?: number;
  shownMessageCount?: number;
  omittedMessageCount?: number;
  mentionAnnotation?: { formalMentionCount: number };
  continueAnywaySuggested?: boolean;
  seenUpToSeq?: number;
  seenUpToMessageId?: string | null;
}

async function listRecentMessagesAfterSeq(channelId: string, afterSeq: number, limit: number): Promise<unknown[]> {
  const db = getDb();
  const rows = await db
    .select({ seq: messages.seq })
    .from(messages)
    .where(and(eq(messages.channelId, channelId), sql`${messages.seq} > ${afterSeq}`))
    .orderBy(sql`${messages.seq} DESC`)
    .limit(limit);
  if (rows.length === 0) return [];
  const floorSeq = rows[rows.length - 1]!.seq - 1;
  return messageService.listMessages(channelId, limit, undefined, floorSeq);
}

const agentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ATTACHMENT_FILE_SIZE_BYTES },
});

// Agent uploads an attachment
internalRouter.post("/agent/:id/upload", requireAgentScope("attachment:upload"), (req, res, next) => {
  if (!isAttachmentUploadEnabled()) {
    res.status(503).json({
      error: ATTACHMENT_UPLOAD_DISABLED_MESSAGE,
      errorCode: "ATTACHMENT_UPLOAD_DISABLED",
    });
    return;
  }

  agentUpload.single("file")(req, res, (err: any) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: ATTACHMENT_TOO_LARGE_MESSAGE,
        errorCode: "ATTACHMENT_TOO_LARGE",
        maxBytes: MAX_ATTACHMENT_FILE_SIZE_BYTES,
      });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message || "Upload failed" });
      return;
    }
    next();
  });
}, async (req, res) => {
  try {
    const agentId = req.params.id as string;
    const result = await loadOwnedMachineAgent(agentId, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    if (isEmptyUploadedFile(file)) {
      res.status(400).json({ error: "Empty files are not allowed" });
      return;
    }
    if (isOversizedUploadedFile(file)) {
      res.status(413).json({
        error: ATTACHMENT_TOO_LARGE_MESSAGE,
        errorCode: "ATTACHMENT_TOO_LARGE",
        maxBytes: MAX_ATTACHMENT_FILE_SIZE_BYTES,
      });
      return;
    }

    const channelId = typeof req.body.channelId === "string" ? req.body.channelId : undefined;
    if (!channelId) {
      res.status(400).json({ error: "channelId is required" });
      return;
    }

    const canPost = await channelService.canAgentPostToChannel(channelId, agentId);
    if (!canPost) {
      res.status(403).json({ error: "Agent must join this channel before sending or uploading" });
      return;
    }

    // Archive gate: no new attachments on an archived channel.
    if (await channelService.isChannelArchived(channelId)) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    const storage = getStorage();
    if (!storage) {
      res.status(503).json({ error: "File uploads are not configured on this server" });
      return;
    }
    const id = randomUUID();
    const normalizedFilename = normalizeAttachmentFilename(file.originalname);
    const explicitMimeType = typeof req.body.mimeType === "string" ? req.body.mimeType : undefined;
    const normalizedMimeType = normalizeUploadedMimeType(
      normalizedFilename,
      file.mimetype,
      file.buffer,
      explicitMimeType,
    );
    const ext = path.extname(normalizedFilename).toLowerCase();
    const storageKey = `${req.serverId}/${id}${ext}`;
    const db = getDb();
    const cdnStorage = getCdnStorage();

    // Upload original to S3 (synchronous — must complete before response)
    await storage.put(storageKey, file.buffer, normalizedMimeType);

    // Generate and upload thumbnail for previewable images only
    let thumbnailKey: string | null = null;
    if (cdnStorage && canGenerateImagePreview(normalizedMimeType)) {
      try {
        thumbnailKey = `thumbs/${req.serverId}/${id}.webp`;
        const thumbBuf = await generateThumbnail(file.buffer, normalizedMimeType);
        if (isSvgAttachmentMimeType(normalizedMimeType)) {
          const rasterPreviewBuf = await generateSvgRasterPreview(file.buffer);
          await cdnStorage.put(buildSvgRasterPreviewKey(thumbnailKey), rasterPreviewBuf, "image/webp");
        }
        await cdnStorage.put(thumbnailKey, thumbBuf, "image/webp");
      } catch {
        // SVG/raster preview generation failed — continue as a plain file chip.
        thumbnailKey = null;
      }
    }

    // Create DB record (upload already done)
    const [inserted] = await db
      .insert(attachments)
      .values({
        id,
        channelId,
        uploaderId: agentId,
        uploaderType: "agent" as const,
        filename: normalizedFilename,
        mimeType: normalizedMimeType,
        sizeBytes: file.size,
        storageKey,
        thumbnailKey,
      })
      .returning();

    res.json({
      id: inserted.id,
      filename: normalizeAttachmentFilename(inserted.filename),
      mimeType: resolveAttachmentMimeType(inserted.filename, inserted.mimeType),
      sizeBytes: inserted.sizeBytes,
      thumbnailUrl: getThumbnailUrl(inserted.thumbnailKey),
    });
    recordSlockCliActivity(req, agentId, {
      command: "attachment.upload",
      summary: "Uploaded attachment",
      target: `${channelId} · ${normalizeAttachmentFilename(inserted.filename)}`,
      correlationId: inserted.id,
    });
  } catch (err: any) {
    console.error("Agent upload error:", err);
    if (isStorageTimeoutError(err)) {
      res.status(504).json({ error: "Attachment storage timed out" });
      return;
    }
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Agent resolves a channel target to an ID (used by upload_file)
internalRouter.post("/agent/:id/resolve-channel", async (req, res) => {
  try {
    const agentId = req.params.id;
    const { target } = req.body;

    if (!target) {
      res.status(400).json({ error: "target is required" });
      return;
    }

    const result = await loadOwnedMachineAgent(agentId, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const resolved = await resolveWritableAgentTarget(agent.serverId, agentId, target);
    if (resolved === "forbidden") {
      res.status(403).json({ error: forbiddenMessageForTarget(target) });
      return;
    }
    if (resolved === "peer-not-found") {
      res.status(404).json({ error: `User or agent not found: @${target.slice(4)}` });
      return;
    }
    if (resolved === "self-dm") {
      res.status(400).json({ error: "Cannot create a DM with yourself" });
      return;
    }
    if (!resolved) {
      res.status(404).json({ error: notFoundMessageForTarget(target) });
      return;
    }

    res.json({ channelId: resolved.channelId });
  } catch (err) {
    console.error("Resolve channel error:", err);
    res.status(500).json({ error: "Failed to resolve channel" });
  }
});

// Agent sends a message
internalRouter.post("/agent/:id/send", requireAgentScope("message:send"), async (req, res) => {
  try {
    addTraceEvent("agent_send.request.started", {
      attachment_ids_count: Array.isArray(req.body?.attachmentIds) ? req.body.attachmentIds.length : 0,
      idempotency_key_present: typeof req.body?.idempotencyKey === "string" && req.body.idempotencyKey.length > 0,
      send_draft_requested: req.body?.sendDraft === true,
    });
    const agentId = req.params.id;
    const { target, channel, dm_to, content, attachmentIds, idempotencyKey, continue: deprecatedContinue, sendDraft, continueAnyway, draftReholdCount, draftReplacedExisting, seenUpToSeq } = req.body;
    const isSendDraft = sendDraft === true;
    const isContinueAnyway = continueAnyway === true;
    const parsedDraftReholdCount = typeof draftReholdCount === "number" && Number.isFinite(draftReholdCount)
      ? Math.max(0, Math.floor(draftReholdCount))
      : 0;

    if (deprecatedContinue === true) {
      addTraceEvent("agent_send.request.rejected", { reason: "deprecated_continue" });
      res.status(400).json({
        error: "--continue is no longer supported. Use normal message send to update a draft, or --send-draft to send the current saved draft.",
      });
      return;
    }
    if (!content) {
      addTraceEvent("agent_send.request.rejected", { reason: "missing_content" });
      res.status(400).json({ error: "Content is required" });
      return;
    }
    if (isContinueAnyway && !isSendDraft) {
      addTraceEvent("agent_send.request.rejected", { reason: "send_draft_anyway_without_send_draft" });
      res.status(400).json({ error: "--send-draft --anyway requires a saved draft" });
      return;
    }

    // Unified target param (new) or legacy channel/dm_to (backward compat)
    const effectiveTarget = target || channel || (dm_to ? `dm:@${dm_to.replace(/^@/, "")}` : null);
    const targetKind = classifyAgentSendTarget(effectiveTarget);
    if (!effectiveTarget) {
      addTraceEvent("agent_send.request.rejected", { reason: "missing_target" });
      res.status(400).json({ error: "target is required" });
      return;
    }

    const result = await tracePhase(
      () => loadOwnedMachineAgent(agentId, req.machineId, req.serverId),
      (_durationMs, authResult) => ({
        name: "agent.ownership.checked",
        attrs: {
          authorized: !("error" in authResult),
          ...(("error" in authResult) ? { status_code: authResult.status } : {}),
        },
      }),
    );
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;
    const sendFreshnessMode = (process.env.SLOCK_ATTESTED_SEND_MODE ?? "on").trim().toLowerCase();
    const sendFreshnessEnabled = isSendFreshnessEnabled(agent.serverId, agentId);
    const requestedSendFreshness = isSendDraft ||
      isContinueAnyway ||
      typeof seenUpToSeq === "number" ||
      typeof draftReholdCount === "number" ||
      draftReplacedExisting === true;
    const shouldRunSendFreshness = sendFreshnessEnabled &&
      (requestedSendFreshness || sendFreshnessMode === "force");
    if (!sendFreshnessEnabled && requestedSendFreshness) {
      addTraceEvent("agent_send.request.rejected", { reason: "send_freshness_disabled" });
      res.status(403).json({ error: "Send freshness interface is not enabled for this agent." });
      return;
    }

    const resolved = await tracePhase(
      () => resolveWritableAgentTarget(agent.serverId, agentId, effectiveTarget),
      (_durationMs, targetResult) => ({
        name: "target.resolved",
        attrs: {
          target_kind: targetKind,
          outcome: typeof targetResult === "string"
            ? targetResult
            : targetResult
              ? "resolved"
              : "not_found",
          ...(targetResult && typeof targetResult === "object" ? { channel_type: targetResult.type } : {}),
        },
      }),
    );
    if (resolved === "forbidden") {
      res.status(403).json({ error: forbiddenMessageForTarget(effectiveTarget) });
      return;
    }
    if (resolved === "peer-not-found") {
      res.status(404).json({ error: `User or agent not found: @${effectiveTarget.slice(4)}` });
      return;
    }
    if (resolved === "self-dm") {
      res.status(400).json({ error: "Cannot create a DM with yourself" });
      return;
    }
    if (!resolved) {
      res.status(404).json({ error: notFoundMessageForTarget(effectiveTarget) });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const runSend = async () => {
      let attestedSendActivityContext: {
        targetType: attestedSendService.AttestedSendTargetType;
        targetRef: string;
        newMessageCount: number;
      } | null = null;
      if (shouldRunSendFreshness) {
        const latestAnchor = await attestedSendService.getLatestMessageAnchor(resolved.channelId);
        const hasClientSeenBoundary = typeof seenUpToSeq === "number" && Number.isFinite(seenUpToSeq);
        const clientSeenUpToSeq = hasClientSeenBoundary
          ? Math.max(0, Math.floor(seenUpToSeq))
          : 0;
        const threadParentAnchor = !hasClientSeenBoundary && resolved.type === "thread"
          ? await attestedSendService.getThreadParentAnchor(resolved.channelId)
          : null;
        // A cold thread still has a freshness boundary: the parent message the
        // first reply is based on. Once the first reply lands, peers based on
        // that same parent boundary must be held like any other stale draft.
        const latestFreshnessSeq = Math.max(latestAnchor.seq, threadParentAnchor?.seq ?? 0);
        const latestFreshnessMessageId = latestAnchor.seq > 0 && latestAnchor.seq >= (threadParentAnchor?.seq ?? 0)
          ? latestAnchor.messageId
          : (threadParentAnchor?.messageId ?? latestAnchor.messageId);
        // Freshness proof must come from the current generation's model-seen
        // boundary, not the delivery/read cursor. `agentChannelReadCursors`
        // advances on daemon delivery ack / inbox clear and therefore cannot
        // prove the current prompt contained the message. Until the daemon/CLI
        // carries a first-class turn-context boundary, channel sends without
        // explicit `seenUpToSeq` conservatively hold; thread first replies keep
        // the parent-message fallback.
        const fallbackBoundarySeq = threadParentAnchor?.seq ?? 0;
        const attestedBoundarySeq = Math.min(
          hasClientSeenBoundary ? clientSeenUpToSeq : fallbackBoundarySeq,
          latestFreshnessSeq,
        );
        const attestedBoundaryMessageId = attestedBoundarySeq <= 0
          ? null
          : attestedBoundarySeq === threadParentAnchor?.seq
            ? threadParentAnchor.messageId
            : await attestedSendService.getMessageIdForSeq(resolved.channelId, attestedBoundarySeq);
        const newMessageCount = latestFreshnessSeq > attestedBoundarySeq
          ? await attestedSendService.countMessagesAfterSeq(resolved.channelId, attestedBoundarySeq)
          : 0;
        const attestedTargetType = toAttestedSendTargetType(resolved.type);
        attestedSendActivityContext = {
          targetType: attestedTargetType,
          targetRef: effectiveTarget,
          newMessageCount,
        };
        const formalMentionFacts = attestedBoundarySeq > 0 && latestFreshnessSeq > attestedBoundarySeq
          ? await attestedSendService.getFormalMentionFacts(agentId, resolved.channelId, attestedBoundarySeq, latestFreshnessSeq)
          : { count: 0, firstMessageId: null, firstHandle: null };
        const shouldHoldForFreshness =
          !isContinueAnyway && latestFreshnessSeq > attestedBoundarySeq && formalMentionFacts.count === 0;
        const boundarySource = hasClientSeenBoundary
          ? "client_seen"
          : threadParentAnchor
            ? "thread_parent"
            : "none";
        addTraceEvent("attested_send.freshness.evaluated", {
          target_type: attestedTargetType,
          channel_type: resolved.type,
          outcome: shouldHoldForFreshness
            ? "held"
            : formalMentionFacts.count > 0
              ? "mention_exempt"
              : "fresh",
          new_message_count: newMessageCount,
          boundary_source: boundarySource,
          boundary_seq: attestedBoundarySeq,
          latest_seq: latestFreshnessSeq,
        });

        const renderHeldResponse = async (
          replacedExisting: boolean,
          reholdCount: number,
          attestedBoundarySeq: number,
          attestedBoundaryMessageId: string | null,
          latestSeq: number,
          latestMessageId: string | null,
          mentionCount: number,
        ): Promise<InternalAgentSendResponse> => {
          const heldMessages = await listRecentMessagesAfterSeq(
            resolved.channelId,
            attestedBoundarySeq,
            ATTESTED_SEND_HELD_CONTEXT_LIMIT,
          );
          const heldSeqs = heldMessages
            .map((message) => Number((message as { seq?: unknown }).seq))
            .filter((seq) => Number.isInteger(seq) && seq > 0);
          const rawHoldCount = latestSeq > attestedBoundarySeq
            ? await attestedSendService.countMessagesAfterSeq(resolved.channelId, attestedBoundarySeq)
            : 0;
          const shownMessageCount = heldMessages.length;
          // Without a model-seen boundary, do not present the whole target
          // history as "new messages"; this is a bounded first-touch context.
          const hasModelSeenBoundary = boundarySource === "client_seen";
          const holdCount = hasModelSeenBoundary ? rawHoldCount : shownMessageCount;
          const omittedMessageCount = hasModelSeenBoundary
            ? Math.max(0, rawHoldCount - shownMessageCount)
            : 0;
          const eventSubject = {
            id: randomUUID(),
            agentId,
            serverId: agent.serverId,
            targetType: attestedTargetType,
            targetRef: effectiveTarget,
          };
          await channelService.markAgentRead(agentId, resolved.channelId, latestSeq);
          if (latestSeq > attestedBoundarySeq) {
            const ack = agentOrchestrator.acknowledgeDeliveredMessagesForChannelUpToSeq?.(
              agentId,
              resolved.channelId,
              latestSeq,
            ) ?? agentOrchestrator.acknowledgeDeliveredMessagesForChannel(agentId, resolved.channelId, heldSeqs);
            addTraceEvent("held_context.delivery_suppressed", {
              target_type: attestedTargetType,
              shown_message_count: shownMessageCount,
              omitted_message_count: omittedMessageCount,
              removed_count: ack.removedCount,
            });
          }
          await attestedSendService.recordGateTriggered(eventSubject, {
            lastSeenMessageId: attestedBoundaryMessageId,
            latestMessageId,
            hasFormalMentionSinceLastSeen: false,
            draftReplacedExisting: replacedExisting,
            newMessageCount: holdCount,
            boundarySource,
            boundarySeq: attestedBoundarySeq,
            latestSeq,
          });
          const title = reholdCount > 0 || isSendDraft ? "Send draft held" : "Send held by freshness check";
          await recordAgentSlockAction(req, agentId, {
            title,
            text: [
              `target: ${effectiveTarget}`,
              `new messages: ${formatAttestedMessageCount(holdCount)}`,
            ].join("\n"),
          });
          return {
            ok: true,
            state: "held",
            heldMessages,
            newMessageCount: holdCount,
            shownMessageCount,
            omittedMessageCount,
            mentionAnnotation: { formalMentionCount: mentionCount },
            continueAnywaySuggested: reholdCount >= 3,
            seenUpToSeq: latestSeq,
            seenUpToMessageId: latestMessageId,
          };
        };

        if (shouldHoldForFreshness) {
          const response = await renderHeldResponse(
            draftReplacedExisting === true,
            parsedDraftReholdCount,
            attestedBoundarySeq,
            attestedBoundaryMessageId,
            latestFreshnessSeq,
            latestFreshnessMessageId,
            formalMentionFacts.count,
          );
          res.json(response);
          return;
        }

        if (formalMentionFacts.count > 0 && formalMentionFacts.firstMessageId && formalMentionFacts.firstHandle) {
          await attestedSendService.recordE1ExemptEvent({
            agentId,
            serverId: agent.serverId,
            targetType: attestedTargetType,
            targetRef: effectiveTarget,
            mentionMessageId: formalMentionFacts.firstMessageId,
            mentionedHandle: formalMentionFacts.firstHandle,
            newMessageCountSinceLastSeen: newMessageCount,
          });
          await recordAgentSlockAction(req, agentId, {
            title: "Send freshness check passed by mention",
            text: [
              `target: ${effectiveTarget}`,
              `reason: direct @${formalMentionFacts.firstHandle} mention`,
              `new messages: ${formatAttestedMessageCount(newMessageCount)}`,
            ].join("\n"),
          });
        }
      }

    // Unified pipeline: DB write → broadcast → agent delivery
    const io = req.app.get("io");
    const enriched = await tracePhase(
      () => messageService.broadcastAndDeliver(io, agentOrchestrator, {
        channelId: resolved.channelId,
        senderType: "agent",
        senderId: agentId,
        senderName: agent.displayName || agent.name || "Agent",
        content,
        attachmentIds,
        ...(typeof idempotencyKey === "string" && idempotencyKey.length > 0
          ? { agentSendKey: idempotencyKey }
          : {}),
      }),
      (_durationMs, message) => ({
        name: "message.sent",
        attrs: {
          channel_type: resolved.type,
          message_id_present: Boolean(message.id),
          attachments_count: message.attachments.length,
          idempotency_key_present: typeof idempotencyKey === "string" && idempotencyKey.length > 0,
          send_draft_requested: isSendDraft,
        },
      }),
    );

    addTraceEvent("response.ready", {
      attachment_ids_count: Array.isArray(attachmentIds) ? attachmentIds.length : 0,
      send_draft_requested: isSendDraft,
    });

    if (shouldRunSendFreshness && isSendDraft && attestedSendActivityContext) {
      const result = isContinueAnyway ? "committed_anyway" : "committed";
      await attestedSendService.recordContinueEvent({
        agentId,
        serverId: agent.serverId,
        targetType: attestedSendActivityContext.targetType,
        targetRef: attestedSendActivityContext.targetRef,
        messageId: enriched.id,
        result,
        newMessageCount: attestedSendActivityContext.newMessageCount,
      });
      const title = isContinueAnyway ? "Send draft sent anyway" : "Send draft sent";
      await recordAgentSlockAction(req, agentId, {
        title,
        text: [
          `target: ${effectiveTarget}`,
          `new messages: ${formatAttestedMessageCount(attestedSendActivityContext.newMessageCount)}`,
          isContinueAnyway
            ? "decision: sent anyway after reviewing newer messages"
            : "decision: saved draft remained fresh when sent",
        ].join("\n"),
      });
    }

    const response: InternalAgentSendResponse = {
      ok: true,
      state: "sent",
      messageId: enriched.id,
      messageSeq: enriched.seq,
    };
    res.json(response);
    recordSlockCliActivity(req, agentId, {
      command: "message.send",
      summary: "Sent message",
      target: effectiveTarget,
      correlationId: enriched.id,
    });
    };

    if (shouldRunSendFreshness) {
      await attestedSendService.withTargetFreshnessGate(resolved.channelId, runSend);
    } else {
      await runSend();
    }
    return;
  } catch (err) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    console.error("Internal send error:", serializeErrorForLog(err));
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Agent reactions are intentionally lightweight state updates: they update the
// message summary for viewers, but do not wake agents or enter inbox/context.
internalRouter.post("/agent/:id/messages/:messageId/reactions", requireAgentScope("message:send"), async (req, res) => {
  try {
    const emoji = parseReactionEmoji(req.body?.emoji);
    if (!emoji) {
      res.status(400).json({ error: "A valid emoji is required" });
      return;
    }

    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const message = await loadVisibleMessageForAgent(req.params.messageId, agent.id, agent.serverId, res);
    if (!message) return;
    if (message.messageType === "system") {
      res.status(400).json({ error: "System messages cannot receive reactions" });
      return;
    }

    const canPost = await channelService.canAgentPostToChannel(message.channelId, agent.id);
    if (!canPost) {
      res.status(403).json({ error: "Agent must join this channel to react to messages" });
      return;
    }

    await channelService.assertChannelNotArchived(message.channelId);

    const readOnly = await isChannelReadOnlyByQuota(message.channelId, agent.serverId);
    if (readOnly) {
      res.status(403).json({ error: "This channel is read-only on your current plan. Upgrade to continue." });
      return;
    }

    await getDb()
      .insert(messageReactions)
      .values({ messageId: message.id, reactorType: "agent", reactorId: agent.id, emoji })
      .onConflictDoNothing();

    const context = await messageService.getMessageContext(message.id, 0, 0);
    const enriched = context?.messages[0];
    if (!enriched) {
      res.status(500).json({ error: "Failed to reload updated message" });
      return;
    }

    const io = req.app.get("io");
    io.to(`channel:${message.channelId}`).emit("message:updated", enriched);
    res.json(enriched);
  } catch (err) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    console.error("Internal add reaction error:", serializeErrorForLog(err));
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

internalRouter.delete("/agent/:id/messages/:messageId/reactions", requireAgentScope("message:send"), async (req, res) => {
  try {
    const emoji = parseReactionEmoji(req.body?.emoji);
    if (!emoji) {
      res.status(400).json({ error: "A valid emoji is required" });
      return;
    }

    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const message = await loadVisibleMessageForAgent(req.params.messageId, agent.id, agent.serverId, res);
    if (!message) return;
    if (message.messageType === "system") {
      res.status(400).json({ error: "System messages cannot receive reactions" });
      return;
    }

    const canPost = await channelService.canAgentPostToChannel(message.channelId, agent.id);
    if (!canPost) {
      res.status(403).json({ error: "Agent must join this channel to react to messages" });
      return;
    }

    await channelService.assertChannelNotArchived(message.channelId);

    const readOnly = await isChannelReadOnlyByQuota(message.channelId, agent.serverId);
    if (readOnly) {
      res.status(403).json({ error: "This channel is read-only on your current plan. Upgrade to continue." });
      return;
    }

    await getDb()
      .delete(messageReactions)
      .where(and(
        eq(messageReactions.messageId, message.id),
        eq(messageReactions.reactorType, "agent"),
        eq(messageReactions.reactorId, agent.id),
        eq(messageReactions.emoji, emoji),
      ));

    const context = await messageService.getMessageContext(message.id, 0, 0);
    const enriched = context?.messages[0];
    if (!enriched) {
      res.status(500).json({ error: "Failed to reload updated message" });
      return;
    }

    const io = req.app.get("io");
    io.to(`channel:${message.channelId}`).emit("message:updated", enriched);
    res.json(enriched);
  } catch (err) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    console.error("Internal remove reaction error:", serializeErrorForLog(err));
    res.status(500).json({ error: "Failed to remove reaction" });
  }
});

// Agent receives messages (long-poll)
internalRouter.get("/agent/:id/receive", requireAgentScope("message:read"), async (req, res) => {
  try {
    const agentId = req.params.id;
    const block = req.query.block === "true";
    const timeoutMs = Number(req.query.timeout) || 30000;

    addTraceEvent("agent_receive.request.started", {
      block,
      timeout_ms: timeoutMs,
    });

    const result = await tracePhase(
      () => loadOwnedMachineAgent(agentId, req.machineId, req.serverId),
      (_durationMs, ownershipResult) => ({
        name: "agent.ownership.checked",
        attrs: {
          outcome: "error" in ownershipResult ? "rejected" : "owned",
          rejection_status: "error" in ownershipResult ? ownershipResult.status : 0,
        },
      }),
    );
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Ensure this request hits the replica where the machine's inbox lives.
    // On Fly.io, if the machine is on a different instance, replay the request there.
    const routing = await tracePhase(
      async () => {
        const machineLocal = agent.machineId ? agentOrchestrator.hasMachineLocally(agent.machineId) : false;
        const flyInstance = agent.machineId && !machineLocal
          ? await getFlyInstanceForMachine(agent.machineId)
          : null;
        return { machineLocal, flyInstance };
      },
      (_durationMs, routeResult) => ({
        name: "machine.routing.checked",
        attrs: {
          machine_id_present: Boolean(agent.machineId),
          machine_local: routeResult.machineLocal,
          fly_instance_present: Boolean(routeResult.flyInstance),
        },
      }),
    );
    if (routing.flyInstance) {
      res.set("fly-replay", `instance=${routing.flyInstance}`);
      res.status(307).end();
      return;
    }

    const abortController = new AbortController();
    const receiveSpan = getCurrentTraceSpan();
    res.prependOnceListener("close", () => {
      receiveSpan?.addEvent("agent_receive.request.closed", {
        block,
        timeout_ms: timeoutMs,
      });
      abortController.abort();
    });
    addTraceEvent("agent_receive.wait.started", {
      block,
      timeout_ms: timeoutMs,
    });
    const messages = await tracePhase(
      () => agentOrchestrator.receiveMessages(agentId, block, timeoutMs, abortController.signal),
      (_durationMs, receivedMessages) => ({
        name: "agent_receive.messages.received",
        attrs: {
          messages_count: receivedMessages.length,
          outcome: receivedMessages.length > 0 ? "messages" : block ? "timeout" : "empty",
        },
      }),
    );

    if (abortController.signal.aborted) return;
    const renderedContents = await tracePhase(
      () => agentPermalinkRenderService.renderAgentReadablePermalinksInTexts(
        messages.map((message) => message.content),
        agent.serverId,
      ),
      (_durationMs, rendered) => ({
        name: "messages.rendered",
        attrs: {
          messages_count: rendered.length,
        },
      }),
    );
    addTraceEvent("response.ready", {
      messages_count: messages.length,
    });
    res.json({
      messages: messages.map((message, index) => ({
        ...message,
        content: renderedContents[index],
      })),
    });
  } catch (err) {
    addTraceEvent("agent_receive.request.failed", {
      error_class: err instanceof Error ? err.name : typeof err,
    });
    console.error("Internal receive error:", err);
    res.status(500).json({ error: "Failed to receive messages" });
  }
});

internalRouter.post("/agent/:id/receive-ack", async (req, res) => {
  try {
    const agentId = req.params.id;
    const seqs = Array.isArray(req.body?.seqs)
      ? req.body.seqs
          .map((value: unknown) => Number(value))
          .filter((value: number) => Number.isInteger(value) && value > 0)
      : [];

    if (seqs.length === 0) {
      res.status(400).json({ error: "seqs must be a non-empty integer array" });
      return;
    }

    const result = await loadOwnedMachineAgent(agentId, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    agentOrchestrator.acknowledgeDeliveredMessages(agentId, seqs);
    res.json({ ok: true });
  } catch (err) {
    console.error("Internal receive-ack error:", err);
    res.status(500).json({ error: "Failed to acknowledge received messages" });
  }
});

// Legacy runtime-control action. Runtime Profile changes now reset the
// session automatically, so this endpoint is a compatibility no-op that can
// also clear old pending migration rows left by pre-reset-session deployments.
internalRouter.post("/agent/:id/runtime-profile/migration-done", async (req, res) => {
  try {
    const agentId = req.params.id;
    const migrationKey = typeof req.body?.migrationKey === "string"
      ? req.body.migrationKey.trim()
      : "";

    const result = await loadOwnedMachineAgent(agentId, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }

    const launchId = typeof req.headers["x-agent-launch-id"] === "string"
      ? req.headers["x-agent-launch-id"]
      : null;
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const handled = await agentOrchestrator.completeRuntimeProfileMigrationFromAgent(
      agentId,
      migrationKey,
      launchId,
    );
    if (!handled) {
      res.json({
        ok: true,
        deprecated: true,
        noop: "no pending migration",
        message: "Runtime Profile migration acknowledgments are deprecated; runtime changes reset the session automatically.",
      });
      return;
    }

    res.json({
      ok: true,
      deprecated: true,
      message: "Runtime Profile migration acknowledgments are deprecated; runtime changes reset the session automatically.",
    });
  } catch (err) {
    console.error("Internal runtime-profile migration-done error:", err);
    res.status(500).json({ error: "Failed to complete runtime profile reset acknowledgment" });
  }
});

// Agent reads message history
internalRouter.get("/agent/:id/history", requireAgentScope("message:read"), async (req, res) => {
  try {
    const agentId = req.params.id;
    const channelRef = req.query.channel as string;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const around = typeof req.query.around === "string" ? req.query.around.trim() : undefined;

    if (!channelRef) {
      res.status(400).json({ error: "channel query param is required (e.g. #all, DM:@richard)" });
      return;
    }

    const result = await loadOwnedMachineAgent(agentId, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const resolved = await channelService.resolveChannelByName(agent.serverId, agentId, channelRef);
    if (!resolved) {
      res.status(404).json({ error: `Channel not found: ${channelRef}` });
      return;
    }

    const channelId = resolved.channelId;
    const hasAccess = await channelService.canAgentAccessChannel(channelId, agentId);
    if (!hasAccess) {
      res.status(403).json({ error: "You do not have access to this history" });
      return;
    }

    const beforeSeq = req.query.before ? Number(req.query.before) : undefined;
    const afterSeq = req.query.after ? Number(req.query.after) : undefined;
    const lastReadSeq = await channelService.getAgentReadCursor(agentId, channelId);

    // Apply plan-based history limit
    const plan = await getServerPlan(agent.serverId);
    const historyCutoff = getHistoryCutoff(plan);
    let msgs;
    let hasOlder = false;
    let hasNewer = false;

    if (around) {
      const beforeCount = Math.floor((limit - 1) / 2);
      const afterCount = limit - beforeCount - 1;
      const aroundKind = classifyHistoryAroundCursor(around);
      const context = aroundKind === "seq"
        ? await messageService.getMessageContextBySeq(channelId, Number(around), beforeCount, afterCount, historyCutoff)
        : aroundKind === "short_id"
          ? await messageService.getMessageContextByShortId(channelId, around, beforeCount, afterCount, historyCutoff)
          : await messageService.getMessageContext(around, beforeCount, afterCount, historyCutoff);
      if (!context || context.channelId !== channelId) {
        res.status(404).json({ error: `Message not found in ${channelRef}: ${around}` });
        return;
      }
      msgs = context.messages;
      hasOlder = context.hasOlder;
      hasNewer = context.hasNewer;
    } else {
      msgs = await messageService.listMessages(channelId, limit, beforeSeq, afterSeq, historyCutoff);
    }

    // Check if plan limit is truncating results
    let historyLimited = false;
    let historyLimitMessage: string | undefined;
    if (historyCutoff) {
      historyLimited = await messageService.hasOlderMessages(channelId, historyCutoff, beforeSeq);
      if (historyLimited) {
        const days = getEffectiveLimits(plan as ServerPlan).messageHistoryDays;
        historyLimitMessage = `History limited to ${days} days on the ${PLAN_CONFIG[plan as ServerPlan].displayName} plan.`;
      }
    }

    // Advance read cursor to the max seq in returned messages (GREATEST prevents regression)
    if (msgs.length > 0) {
      const maxSeq = Math.max(...msgs.map((m: any) => m.seq ?? 0));
      if (maxSeq > 0) {
        channelService.markAgentRead(agentId, channelId, maxSeq).catch(() => {});
      }
    }

    const threadParentMessageIds = getHistoryThreadParentMessageIds(msgs);
    const threadSummaries = threadParentMessageIds.length > 0
      ? await channelService.getThreadSummariesForParentMessages(threadParentMessageIds)
      : {};
    const renderedHistoryContents = await agentPermalinkRenderService.renderAgentReadablePermalinksInTexts(
      msgs.map((message: any) => message.content),
      agent.serverId,
    );
    const enrichedMsgs = applyHistoryThreadMetadata(msgs, threadSummaries);
    res.json({
      messages: enrichedMsgs.map((message: any, index: number) => ({
        ...message,
        senderType: message.messageType === "system" ? "system" : toAgentFacingActorType(message.senderType),
        taskAssigneeType: message.taskAssigneeType ? toAgentFacingActorType(message.taskAssigneeType) : null,
        content: renderedHistoryContents[index],
      })),
      has_more: around ? hasOlder || hasNewer : msgs.length === limit,
      has_older: hasOlder,
      has_newer: hasNewer,
      last_read_seq: lastReadSeq,
      historyLimited,
      historyLimitMessage,
    });
  } catch (err) {
    console.error("Internal history error:", err);
    res.status(500).json({ error: "Failed to read history" });
  }
});

internalRouter.get("/agent/:id/search", requireAgentScope("message:read"), async (req, res) => {
  try {
    const agentId = req.params.id;
    const rawQuery = typeof req.query.q === "string" ? req.query.q : "";
    const query = rawQuery.trim();

    const result = await loadOwnedMachineAgent(agentId, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const channelRef = typeof req.query.channel === "string" ? req.query.channel : undefined;
    let channelId: string | undefined;
    if (channelRef) {
      const resolved = await channelService.resolveChannelByName(agent.serverId, agentId, channelRef);
      if (!resolved) {
        res.status(404).json({ error: `Channel not found: ${channelRef}` });
        return;
      }
      channelId = resolved.channelId;
    }

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const senderFilter = await resolveSearchSenderFilter(agent.serverId, req.query.sender, req.query.senderId);
    if (!senderFilter.ok) {
      res.status(senderFilter.status).json({ error: senderFilter.error, errorCode: senderFilter.errorCode });
      return;
    }
    const afterRaw = typeof req.query.after === "string" ? req.query.after : undefined;
    const beforeRaw = typeof req.query.before === "string" ? req.query.before : undefined;
    const after = afterRaw ? new Date(afterRaw) : undefined;
    const before = beforeRaw ? new Date(beforeRaw) : undefined;
    if ((after && Number.isNaN(after.getTime())) || (before && Number.isNaN(before.getTime()))) {
      res.status(400).json({ error: "Invalid date filter" });
      return;
    }
    const sortRaw = typeof req.query.sort === "string" ? req.query.sort : undefined;
    if (sortRaw && sortRaw !== "relevance" && sortRaw !== "recent") {
      res.status(400).json({ error: "Invalid search sort" });
      return;
    }
    const sort = sortRaw === "recent" ? "recent" : "relevance";
    const hasMeaningfulFilter = Boolean(channelId || senderFilter.senderId || after || before);
    if (!query && !hasMeaningfulFilter) {
      res.json({ results: [], hasMore: false });
      return;
    }

    const searchResponse = await searchService.searchMessagesForAgent({
      serverId: agent.serverId,
      agentId,
      query,
      channelId,
      senderId: senderFilter.senderId,
      after,
      before,
      sort: query ? sort : "recent",
      limit,
      offset,
    });
    const [renderedContents, renderedSnippets] = await Promise.all([
      agentPermalinkRenderService.renderAgentReadablePermalinksInTexts(
        searchResponse.results.map((result) => result.content),
        agent.serverId,
      ),
      agentPermalinkRenderService.renderAgentReadablePermalinksInTexts(
        searchResponse.results.map((result) => result.snippet),
        agent.serverId,
      ),
    ]);

    res.json({
      ...searchResponse,
      results: searchResponse.results.map((result, index) => ({
        ...result,
        senderType: toAgentFacingActorType(result.senderType),
        content: renderedContents[index],
        snippet: renderedSnippets[index],
      })),
    });
  } catch (err) {
    console.error("Internal search error:", err);
    res.status(500).json({ error: "Failed to search messages" });
  }
});

internalRouter.post("/agent/:id/channels/:channelId/join", requireAgentScope("channel:join"), async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const channel = await channelService.getChannel(req.params.channelId);
    if (!channel || channel.serverId !== result.agent.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    if (channel.type === "dm") {
      res.status(403).json({ error: "Cannot join DM channels" });
      return;
    }
    if (channel.type === "private") {
      res.status(403).json({ error: "Private channels require an invitation" });
      return;
    }
    if (channel.type === "joint") {
      res.status(403).json({ error: "Joint channels require an invitation" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    const wasAgentMember = await channelService.isChannelAgent(channel.id, result.agent.id);
    await channelService.addAgent(channel.id, result.agent.id);
    if (!wasAgentMember) {
      const io = req.app.get("io") as SocketServer | undefined;
      const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
      if (io && agentOrchestrator) {
        await messageService.broadcastSystemMessage(
          io,
          agentOrchestrator,
          channel.id,
          `@${result.agent.name} joined this channel.`,
        );
      }
    }
    req.app.get("io")?.to(`server:${result.agent.serverId}`).emit("channel:members-updated", { channelId: channel.id });
    res.json({ ok: true });
    recordSlockCliActivity(req, result.agent.id, {
      command: "channel.join",
      summary: "Joined channel",
      target: channel.name ? `#${channel.name}` : channel.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to join channel" });
  }
});

internalRouter.post("/agent/:id/channels/:channelId/leave", requireAgentScope("channel:leave"), async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const channel = await channelService.getChannel(req.params.channelId);
    if (!channel || channel.serverId !== result.agent.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type !== "channel" && channel.type !== "private") {
      res.status(403).json({ error: "Agents can only leave regular channels" });
      return;
    }
    const hasAccess = await channelService.canAgentAccessChannel(channel.id, result.agent.id);
    if (!hasAccess) {
      res.status(403).json({ error: "Agents can only leave visible regular channels" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    await channelService.removeAgent(channel.id, result.agent.id);
    req.app.get("io")?.to(channel.type === "private" ? `channel:${channel.id}` : `server:${result.agent.serverId}`).emit("channel:members-updated", { channelId: channel.id });
    res.json({ ok: true });
    recordSlockCliActivity(req, result.agent.id, {
      command: "channel.leave",
      summary: "Left channel",
      target: channel.name ? `#${channel.name}` : channel.id,
    });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Cannot remove")) {
      res.status(403).json({ error: msg });
      return;
    }
    res.status(500).json({ error: "Failed to leave channel" });
  }
});

internalRouter.post("/agent/:id/threads/unfollow", requireAgentScope("thread:unfollow"), async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const threadRef = typeof req.body?.thread === "string" ? req.body.thread.trim() : "";
    if (!threadRef) {
      res.status(400).json({ error: "thread is required" });
      return;
    }

    let threadChannelId: string | null = null;
    if (UUID_RE.test(threadRef)) {
      const channel = await channelService.getChannel(threadRef);
      if (!channel || channel.serverId !== result.agent.serverId) {
        res.status(404).json({ error: "Thread not found" });
        return;
      }
      if (channel.type !== "thread") {
        res.status(400).json({ error: "Target must be a thread" });
        return;
      }
      threadChannelId = channel.id;
    } else {
      const resolved = await channelService.resolveChannelByName(result.agent.serverId, result.agent.id, threadRef);
      if (!resolved) {
        res.status(404).json({ error: "Thread not found" });
        return;
      }
      if (resolved.type !== "thread") {
        res.status(400).json({ error: "Target must be a thread" });
        return;
      }
      threadChannelId = resolved.channelId;
    }

    await channelService.unfollowThreadForFollower("agent", result.agent.id, threadChannelId);
    res.json({ ok: true });
    recordSlockCliActivity(req, result.agent.id, {
      command: "thread.unfollow",
      summary: "Unfollowed thread",
      target: threadRef,
      correlationId: threadChannelId,
    });
  } catch (err: any) {
    console.error("Internal agent thread unfollow error:", err);
    res.status(500).json({ error: err?.message || "Failed to unfollow thread" });
  }
});

internalRouter.get("/agent/:id/channel-members", requireAgentScope("channel:read"), async (req, res) => {
  try {
    const channelRef = typeof req.query.channel === "string" ? req.query.channel : "";
    if (!channelRef) {
      res.status(400).json({ error: "channel query param is required (e.g. #general)" });
      return;
    }

    const ctx = await resolveAgentChannel(req.params.id, req.serverId!, req.machineId, channelRef);
    if (!ctx) {
      res.status(404).json({ error: `Channel not found: ${channelRef}` });
      return;
    }

    const members = await channelService.getChannelMembers(ctx.channelId);
    res.json({
      channel: { ref: channelRef, type: ctx.channelType },
      agents: members.agents.map((a) => ({ name: a.name, status: a.status })),
      humans: members.humans.map((u) => ({ name: u.name, description: u.description, role: u.role })),
    });
  } catch (err) {
    console.error("Internal channel members error:", err);
    res.status(500).json({ error: "Failed to get channel members" });
  }
});

// Agent lists server info (all regular channels with joined status, agents, humans)
internalRouter.get("/agent/:id/server", requireAgentScope("server:read"), async (req, res) => {
  try {
    const agentId = req.params.id;

    const result = await loadOwnedMachineAgent(agentId, req.machineId, req.serverId);
    if ("error" in result) { res.status(result.status).json({ error: result.error }); return; }
    const { agent } = result;

    const channels = await channelService.listChannelsForAgent(agent.serverId, agentId);
    const allAgentsList = await agentService.listAgents(agent.serverId);
    const allAgents = allAgentsList.map((a) => ({
      name: a.name,
      description: a.description,
      status: a.status,
    }));

    const members = await serverService.getServerMembers(agent.serverId, null);
    const humans = members.map((m) => ({
      name: m.name,
      description: m.description,
    }));
    const machine = agent.machineId ? await machineService.getMachine(agent.machineId) : null;
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    const runtimeContext = {
      agentId: agent.id,
      serverId: agent.serverId,
      machineId: agent.machineId,
      machineName: machine?.name ?? null,
      machineHostname: machine?.hostname ?? null,
      machineOs: machine?.os ?? null,
      daemonVersion: agent.machineId ? agentOrchestrator?.getMachineDaemonVersion(agent.machineId) ?? machine?.daemonVersion ?? null : null,
      workspacePath: null,
    };

    res.json({ runtimeContext, channels, agents: allAgents, humans });
  } catch (err) {
    console.error("Internal server info error:", err);
    res.status(500).json({ error: "Failed to get server info" });
  }
});

internalRouter.get("/agent/:id/knowledge", requireAgentScope("knowledge:read"), async (req, res) => {
  const agentId = req.params.id;
  const serverId = req.serverId;
  if (!serverId) {
    res.status(500).json({ error: "Machine authentication state missing" });
    return;
  }
  await handleAgentKnowledgeGet(req, res, { agentId, serverId, computerId: req.machineId ?? null });
});

internalRouter.get("/agent/:id/profile", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    const resolved = await resolveProfileViewForAgent(
      result.agent.serverId,
      result.agent.id,
      req.query.target,
      agentOrchestrator,
    );
    if (!resolved.ok) {
      res.status(resolved.status).json({ error: resolved.error });
      return;
    }

    res.json(resolved.profile);
  } catch (err) {
    console.error("Internal profile read error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

internalRouter.post("/agent/:id/profile/avatar", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const uploaded = await runSingleAvatarUpload(profileAvatarUpload, req);
    if (!uploaded) {
      res.status(400).json({ error: "No avatar file provided" });
      return;
    }

    const avatarUrl = await storeAgentAvatar(result.agent.serverId, result.agent.avatarUrl, uploaded.buffer);
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    if (agentOrchestrator) {
      agentOrchestrator.evictCache(result.agent.id);
    }
    await agentService.updateAgent(result.agent.id, { avatarUrl });

    const profile = await buildAgentProfileView(result.agent.id, result.agent.id, agentOrchestrator);
    if (!profile) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    res.json(profile);
    recordSlockCliActivity(req, result.agent.id, {
      command: "profile.avatar.update",
      summary: "Updated profile avatar",
      target: `@${result.agent.name}`,
    });
  } catch (err) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: PROFILE_AVATAR_TOO_LARGE_MESSAGE,
        errorCode: "PROFILE_AVATAR_TOO_LARGE",
        maxBytes: MAX_PROFILE_AVATAR_BYTES,
      });
      return;
    }
    if (err instanceof Error && err.message.includes(PROFILE_AVATAR_BAD_FORMAT_MESSAGE)) {
      res.status(400).json({
        error: PROFILE_AVATAR_BAD_FORMAT_MESSAGE,
        errorCode: "PROFILE_AVATAR_BAD_FORMAT",
      });
      return;
    }
    console.error("Internal profile avatar update error:", err);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

const MAX_AGENT_PROFILE_DESCRIPTION_LENGTH = 3000;
const MAX_AGENT_PROFILE_DISPLAY_NAME_LENGTH = 80;

internalRouter.post("/agent/:id/profile", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const body = (req.body ?? {}) as { avatarUrl?: unknown; displayName?: unknown; description?: unknown };
    const hasAvatarUrl = Object.prototype.hasOwnProperty.call(body, "avatarUrl");
    const hasDisplayName = Object.prototype.hasOwnProperty.call(body, "displayName");
    const hasDescription = Object.prototype.hasOwnProperty.call(body, "description");
    if (!hasAvatarUrl && !hasDisplayName && !hasDescription) {
      res.status(400).json({
        error: "Provide at least one of avatarUrl, displayName, or description",
        errorCode: "PROFILE_UPDATE_NO_FIELDS",
      });
      return;
    }

    const fields: { avatarUrl?: string; displayName?: string; description?: string } = {};

    if (hasAvatarUrl) {
      const value = body.avatarUrl;
      if (typeof value !== "string") {
        res.status(400).json({ error: "avatarUrl must be a string" });
        return;
      }
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        res.status(400).json({ error: "avatarUrl must not be empty" });
        return;
      }
      if (!trimmed.startsWith("pixel:")) {
        res.status(400).json({
          error: "avatarUrl must be a pixel: URL",
          errorCode: "PROFILE_AVATAR_URL_BAD_FORMAT",
        });
        return;
      }
      fields.avatarUrl = trimmed;
    }

    if (hasDisplayName) {
      const value = body.displayName;
      if (typeof value !== "string") {
        res.status(400).json({ error: "displayName must be a string" });
        return;
      }
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        res.status(400).json({ error: "displayName must not be empty" });
        return;
      }
      if (trimmed.length > MAX_AGENT_PROFILE_DISPLAY_NAME_LENGTH) {
        res.status(400).json({
          error: `displayName must be at most ${MAX_AGENT_PROFILE_DISPLAY_NAME_LENGTH} characters`,
        });
        return;
      }
      fields.displayName = trimmed;
    }

    if (hasDescription) {
      const value = body.description;
      if (typeof value !== "string") {
        res.status(400).json({ error: "description must be a string" });
        return;
      }
      if (value.length === 0) {
        res.status(400).json({ error: "description must not be empty" });
        return;
      }
      if (value.length > MAX_AGENT_PROFILE_DESCRIPTION_LENGTH) {
        res.status(400).json({
          error: `description must be at most ${MAX_AGENT_PROFILE_DESCRIPTION_LENGTH} characters`,
        });
        return;
      }
      fields.description = value;
    }

    const updated = await agentService.updateAgent(result.agent.id, fields);
    if (!updated) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    if (agentOrchestrator) {
      agentOrchestrator.evictCache(result.agent.id);
    }

    const profile = await buildAgentProfileView(result.agent.id, result.agent.id, agentOrchestrator);
    if (!profile) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    res.json(profile);
    recordSlockCliActivity(req, result.agent.id, {
      command: "profile.update",
      summary: "Updated profile",
      target: `@${profile.name}`,
    });
  } catch (err) {
    console.error("Internal profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ── Agent Task Board endpoints ──

// Helper: resolve channel from agent context (with machine ownership check)
async function resolveAgentChannel(agentId: string, serverId: string, machineId: string | undefined, channelRef: string) {
  const result = await loadOwnedMachineAgent(agentId, machineId, serverId);
  if ("error" in result) return null;
  const resolved = await channelService.resolveChannelByName(result.agent.serverId, agentId, channelRef);
  if (!resolved) return null;
  return { agent: result.agent, channelId: resolved.channelId, channelType: resolved.type };
}

function rejectAgentTaskWriteIfNeeded(canPost: boolean, res: any): boolean {
  if (!canPost) {
    res.status(403).json({ error: "Agent must join this channel to modify tasks" });
    return true;
  }
  return false;
}

// Agent lists tasks
internalRouter.get("/agent/:id/tasks", requireAgentScope("task:read"), async (req, res) => {
  try {
    const channelRef = req.query.channel as string;
    if (!channelRef) {
      res.status(400).json({ error: "channel query param is required (e.g. #general)" });
      return;
    }

    const ctx = await resolveAgentChannel(req.params.id, req.serverId!, req.machineId,channelRef);
    if (!ctx) {
      res.status(404).json({ error: "Agent or channel not found" });
      return;
    }

    const statusFilter = req.query.status as any;
    const tasks = await taskService.listTasks(ctx.channelId, statusFilter || undefined);
    res.json({ tasks });
  } catch (err) {
    console.error("Internal list tasks error:", err);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

// Agent creates tasks (batch)
internalRouter.post("/agent/:id/tasks", requireAgentScope("task:write"), async (req, res) => {
  try {
    const { channel, tasks: items } = req.body;
    if (!channel || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "channel and tasks array are required" });
      return;
    }
    if (items.length > 50) {
      res.status(400).json({ error: "Cannot create more than 50 tasks at once" });
      return;
    }
    for (const item of items) {
      if (!item.title || typeof item.title !== "string" || item.title.trim().length === 0) {
        res.status(400).json({ error: "Each task must have a non-empty title" });
        return;
      }
    }

    const ctx = await resolveAgentChannel(req.params.id, req.serverId!, req.machineId,channel);
    if (!ctx) {
      res.status(404).json({ error: "Agent or channel not found" });
      return;
    }
    if (ctx.channelType === "thread") {
      res.status(409).json({ error: "Thread messages cannot become tasks" });
      return;
    }
    if (rejectAgentTaskWriteIfNeeded(await channelService.canAgentPostToChannel(ctx.channelId, req.params.id), res)) return;
    if (await channelService.isChannelArchived(ctx.channelId)) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    const created = await taskService.createTasks(
      ctx.channelId,
      "agent",
      req.params.id,
      items.map((i: any) => ({ title: i.title.trim() })),
    );

    const io: SocketServer = req.app.get("io");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Broadcast each task as both a message:new (chat flow) and task:created (task board)
    for (const t of created) {
      io.to(`channel:${ctx.channelId}`).emit("message:new", { ...t, senderName: t.createdByName || "Unknown" });
      messageService.deliverMessageToAgents(agentOrchestrator, t as any, t.createdByName || "Unknown").catch(() => {});
    }
    emitTaskCreated(io, {
      channelId: ctx.channelId,
      channelType: ctx.channelType,
      serverId: req.serverId!,
    }, {
      channelId: ctx.channelId,
      tasks: created,
    });

    // Emit system message to chat (visible to humans + agents, counts as unread)
    const taskList = created.map((t: any) => `#${t.taskNumber} "${messageService.summarizeForSystemMessage(t.title)}"`).join(", ");
    const sysContent = `📋 ${created.length} new task${created.length > 1 ? "s" : ""} created: ${taskList}`;
    messageService.broadcastSystemMessage(io, agentOrchestrator, ctx.channelId, sysContent).catch(() => {});

    res.json({ tasks: created });
    recordSlockCliActivity(req, req.params.id, {
      command: "task.create",
      summary: `Created ${created.length} task${created.length === 1 ? "" : "s"}`,
      target: channel,
    });
  } catch (err) {
    console.error("Internal create tasks error:", err);
    res.status(500).json({ error: "Failed to create tasks" });
  }
});

// Agent batch claims tasks (by task_numbers and/or message_ids)
internalRouter.post("/agent/:id/tasks/claim", requireAgentScope("task:write"), async (req, res) => {
  try {
    const { channel, task_numbers, message_ids } = req.body;
    const hasTaskNumbers = Array.isArray(task_numbers) && task_numbers.length > 0;
    const hasMessageIds = Array.isArray(message_ids) && message_ids.length > 0;

    if (!channel || (!hasTaskNumbers && !hasMessageIds)) {
      res.status(400).json({ error: "channel and either task_numbers or message_ids array are required" });
      return;
    }

    const ctx = await resolveAgentChannel(req.params.id, req.serverId!, req.machineId,channel);
    if (!ctx) {
      res.status(404).json({ error: "Agent or channel not found" });
      return;
    }
    if (ctx.channelType === "thread") {
      res.status(409).json({ error: "Thread messages cannot be claimed as tasks" });
      return;
    }
    if (rejectAgentTaskWriteIfNeeded(await channelService.canAgentPostToChannel(ctx.channelId, req.params.id), res)) return;
    if (await channelService.isChannelArchived(ctx.channelId)) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    const io: SocketServer = req.app.get("io");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const agentName = ctx.agent.displayName || ctx.agent.name;
    const successfulClaims: { taskNumber: number; title: string; messageId: string }[] = [];

    // Claim by task numbers
    const results: { taskNumber?: number; messageId?: string; success: boolean; reason?: string }[] = [];
    if (hasTaskNumbers) {
      const batchResults = await taskService.batchClaimTasks(
        ctx.channelId,
        task_numbers,
        "agent",
        req.params.id,
      );

      for (const r of batchResults) {
        if (r.success && r.task) {
          const enriched = await taskService.enrichSingleTask(r.task);
          io.to(`channel:${ctx.channelId}`).emit("message:updated", { ...r.task, senderName: enriched.createdByName || "Unknown" });
          emitTaskUpdated(io, {
            channelId: ctx.channelId,
            channelType: ctx.channelType,
            serverId: req.serverId!,
          }, {
            channelId: ctx.channelId,
            task: enriched,
          });
          successfulClaims.push({ taskNumber: r.task.taskNumber!, title: r.task.content, messageId: r.task.id });
        }
        results.push({ taskNumber: r.taskNumber, messageId: r.task?.id, success: r.success, reason: r.reason });
      }
    }

    // Convert messages to tasks then claim them (supports short ID prefixes)
    if (hasMessageIds) {
      for (const rawMsgId of message_ids) {
        // Resolve short ID prefix to full message ID
        const resolved = await taskService.resolveMessageInChannel(ctx.channelId, rawMsgId);
        if (!resolved) {
          results.push({ messageId: rawMsgId, success: false, reason: "message not found" });
          continue;
        }
        const msgId = resolved.id;

        // First convert message to task
        const converted = await taskService.convertMessageToTask(msgId, "agent", req.params.id, ctx.channelId);
        if (typeof converted === "string") {
          // If already converted, try to find and claim the existing task
          if (converted === "already converted") {
            const existingTask = await taskService.getTaskByMessageId(msgId);
            if (existingTask && !existingTask.taskAssigneeId) {
              const claimed = await taskService.claimTask(existingTask.id, "agent", req.params.id);
              if (typeof claimed !== "string") {
                const enriched = await taskService.enrichSingleTask(claimed);
                io.to(`channel:${claimed.channelId}`).emit("message:updated", { ...claimed, senderName: enriched.createdByName || "Unknown" });
                emitTaskUpdated(io, {
                  channelId: claimed.channelId,
                  channelType: ctx.channelType,
                  serverId: req.serverId!,
                }, {
                  channelId: claimed.channelId,
                  task: enriched,
                });
                successfulClaims.push({ taskNumber: claimed.taskNumber!, title: claimed.content, messageId: claimed.id });
                results.push({ messageId: msgId, success: true, taskNumber: claimed.taskNumber! });
                continue;
              }
            }
          }
          results.push({ messageId: msgId, success: false, reason: converted });
        } else {
          // Task created, now claim it
          const claimed = await taskService.claimTask(converted.id, "agent", req.params.id);
          if (typeof claimed !== "string") {
            const enriched = await taskService.enrichSingleTask(claimed);
            // Update message in chat flow with task fields
            io.to(`channel:${converted.channelId}`).emit("message:updated", { ...claimed, senderName: enriched.createdByName || "Unknown" });
            emitTaskCreated(io, {
              channelId: converted.channelId,
              channelType: ctx.channelType,
              serverId: req.serverId!,
            }, {
              channelId: converted.channelId,
              tasks: [enriched],
            });
            successfulClaims.push({ taskNumber: converted.taskNumber!, title: converted.content, messageId: converted.id });
            results.push({ messageId: msgId, success: true, taskNumber: converted.taskNumber! });
          } else {
            results.push({ messageId: msgId, success: false, reason: claimed });
          }
        }
      }
    }

    // Task claim is a small-audience event — only the assignee/creator/reviewer
    // cares (stdrc #proj-task msg=b9b41129 + msg=c580faed). No chat-surface
    // 📌 system message; the assignment is reflected on the task card itself.
    void successfulClaims;

    res.json({ results });
    if (successfulClaims.length > 0) {
      recordSlockCliActivity(req, req.params.id, {
        command: "task.claim",
        summary: `Claimed ${successfulClaims.length} task${successfulClaims.length === 1 ? "" : "s"}`,
        target: channel,
      });
    }
  } catch (err) {
    console.error("Internal claim tasks error:", err);
    res.status(500).json({ error: "Failed to claim tasks" });
  }
});

// Agent unclaims a task
internalRouter.post("/agent/:id/tasks/unclaim", requireAgentScope("task:write"), async (req, res) => {
  try {
    const { channel, task_number } = req.body;
    if (!channel || task_number == null) {
      res.status(400).json({ error: "channel and task_number are required" });
      return;
    }

    const ctx = await resolveAgentChannel(req.params.id, req.serverId!, req.machineId,channel);
    if (!ctx) {
      res.status(404).json({ error: "Agent or channel not found" });
      return;
    }
    if (rejectAgentTaskWriteIfNeeded(await channelService.canAgentPostToChannel(ctx.channelId, req.params.id), res)) return;
    if (await channelService.isChannelArchived(ctx.channelId)) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    const task = await taskService.getTaskByNumber(ctx.channelId, task_number);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const result = await taskService.unclaimTask(task.id, req.params.id);
    if (typeof result === "string") {
      res.status(409).json({ error: result });
      return;
    }

    const enrichedResult = await taskService.enrichSingleTask(result);
    const io: SocketServer = req.app.get("io");
    io.to(`channel:${ctx.channelId}`).emit("message:updated", { ...result, senderName: enrichedResult.createdByName || "Unknown" });
    emitTaskUpdated(io, {
      channelId: ctx.channelId,
      channelType: ctx.channelType,
      serverId: req.serverId!,
    }, {
      channelId: ctx.channelId,
      task: enrichedResult,
    });

    // Task unclaim is a small-audience event — no chat-surface 🔓 system
    // message. (stdrc #proj-task msg=c580faed)

    res.json({ ok: true });
    recordSlockCliActivity(req, req.params.id, {
      command: "task.unclaim",
      summary: `Unclaimed task #${task_number}`,
      target: channel,
      correlationId: task.id,
    });
  } catch (err) {
    console.error("Internal unclaim task error:", err);
    res.status(500).json({ error: "Failed to unclaim task" });
  }
});

// Agent updates task status
internalRouter.post("/agent/:id/tasks/update-status", requireAgentScope("task:write"), async (req, res) => {
  try {
    const { channel, task_number, status } = req.body;
    if (!channel || task_number == null || !status) {
      res.status(400).json({ error: "channel, task_number, and status are required" });
      return;
    }
    if (!["todo", "in_progress", "in_review", "done", "closed"].includes(status)) {
      res.status(400).json({ error: "invalid status" });
      return;
    }

    const ctx = await resolveAgentChannel(req.params.id, req.serverId!, req.machineId,channel);
    if (!ctx) {
      res.status(404).json({ error: "Agent or channel not found" });
      return;
    }
    if (rejectAgentTaskWriteIfNeeded(await channelService.canAgentPostToChannel(ctx.channelId, req.params.id), res)) return;
    if (await channelService.isChannelArchived(ctx.channelId)) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    const task = await taskService.getTaskByNumber(ctx.channelId, task_number);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const result = await taskService.updateTaskStatus(task.id, status, req.params.id);
    if (typeof result === "string") {
      res.status(409).json({ error: result });
      return;
    }

    const enrichedResult = await taskService.enrichSingleTask(result);
    const io: SocketServer = req.app.get("io");
    io.to(`channel:${ctx.channelId}`).emit("message:updated", { ...result, senderName: enrichedResult.createdByName || "Unknown" });
    emitTaskUpdated(io, {
      channelId: ctx.channelId,
      channelType: ctx.channelType,
      serverId: req.serverId!,
    }, {
      channelId: ctx.channelId,
      task: enrichedResult,
    });

    // Task status transitions are small-audience lifecycle churn — no
    // chat-surface system message. (stdrc #proj-task msg=ef870d97 +
    // msg=b9b41129 + msg=c580faed). The current status is rendered on the
    // task card itself; assignee/creator/reviewer follow via task UI.

    res.json({ ok: true });
    recordSlockCliActivity(req, req.params.id, {
      command: "task.update_status",
      summary: `Updated task #${task_number} to ${status}`,
      target: channel,
      correlationId: task.id,
    });
  } catch (err) {
    console.error("Internal update-status task error:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

const REMINDER_MAX_TITLE_LEN = 500;
const REMINDER_VALID_STATUSES = new Set<"scheduled" | "fired" | "canceled">(["scheduled", "fired", "canceled"]);

// Agent lists its own reminders
internalRouter.get("/agent/:id/reminders", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const statusRaw = typeof req.query.status === "string" ? req.query.status : "";
    let statusFilter: Array<"scheduled" | "fired" | "canceled"> = ["scheduled", "fired"];
    if (statusRaw) {
      const parts = statusRaw.split(",").map((s) => s.trim()).filter(Boolean);
      for (const p of parts) {
        if (!REMINDER_VALID_STATUSES.has(p as any)) {
          res.status(400).json({ error: "Invalid status value" });
          return;
        }
      }
      statusFilter = parts as Array<"scheduled" | "fired" | "canceled">;
    } else if (req.query.all === "true") {
      statusFilter = ["scheduled", "fired", "canceled"];
    }

    const rows = await reminderService.listReminders({
      serverId: req.serverId!,
      ownerAgentId: req.params.id,
      status: statusFilter,
    });
    const summaries = await reminderService.toReminderSummaries(rows, req.serverId!);
    res.json({ reminders: summaries });
  } catch (err) {
    console.error("Internal list reminders error:", err);
    res.status(500).json({ error: "Failed to list reminders" });
  }
});

// Agent schedules a reminder for itself
internalRouter.post("/agent/:id/reminders", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const { title, fireAt, delaySeconds, msgId, payload, repeat, tz, channel } = req.body ?? {};
    if (typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    if (title.length > REMINDER_MAX_TITLE_LEN) {
      res.status(400).json({ error: `title must be at most ${REMINDER_MAX_TITLE_LEN} characters` });
      return;
    }

    // Snapshot the caller's IANA timezone into daily/weekly rules at create
    // time so later fires don't drift when the caller's host tz changes. If
    // the caller doesn't supply tz we fall back to UTC (safe for interval).
    let ruleTz = "UTC";
    if (tz !== undefined) {
      if (typeof tz !== "string" || tz.length === 0) {
        res.status(400).json({ error: "tz must be a non-empty IANA timezone string" });
        return;
      }
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
      } catch {
        res.status(400).json({ error: `unknown timezone "${tz}"` });
        return;
      }
      ruleTz = tz;
    }

    let recurrence: Recurrence | null = null;
    if (repeat != null) {
      if (typeof repeat !== "string") {
        res.status(400).json({ error: "repeat must be a string (e.g. every:15m | daily@09:00 | weekly:mon,fri@09:00)" });
        return;
      }
      const parsed = parseRecurrenceString(repeat, ruleTz);
      if (!parsed.ok) {
        res.status(400).json({ error: `repeat: ${parsed.error}` });
        return;
      }
      // Wall-clock rules (daily, weekly) are ambiguous without an explicit
      // caller tz: silent UTC fallback would fire at wrong local times.
      // Force the caller to snapshot their tz so re-fires don't drift.
      if (
        (parsed.recurrence.rule.kind === "daily" || parsed.recurrence.rule.kind === "weekly") &&
        tz === undefined
      ) {
        res.status(400).json({
          error: "tz is required for daily@ or weekly: rules (IANA name, e.g. America/Los_Angeles)",
        });
        return;
      }
      recurrence = parsed.recurrence;
    }

    // For recurring reminders, delaySeconds/fireAt pin the *first* fire. If
    // neither is given, compute the first fire from the recurrence rule so
    // agents can write `--repeat daily@09:00` without also specifying when
    // the first one should go off.
    const hasScheduleInput = delaySeconds != null || fireAt != null;
    let fireAtDate: Date;
    let warning: string | undefined;
    if (hasScheduleInput) {
      const schedule = resolveScheduleInput({ delaySeconds, fireAt }, Date.now());
      if (!schedule.ok) {
        res.status(400).json({ error: schedule.error });
        return;
      }
      fireAtDate = schedule.fireAt;
      warning = schedule.warning;
    } else if (recurrence) {
      fireAtDate = computeNextFire(recurrence, new Date());
    } else {
      res.status(400).json({ error: "Provide delaySeconds, fireAt, or repeat" });
      return;
    }

    if (typeof msgId !== "string" || msgId.length === 0) {
      res.status(400).json({ error: "msgId is required for agent-created reminders" });
      return;
    }

    let resolvedMsgId: string | null = null;
    const resolved = await resolveReminderMsgId(req.serverId!, msgId);
    if (!resolved.ok) {
      res.status(resolved.status).json({ error: resolved.error });
      return;
    }
    resolvedMsgId = resolved.messageId;

    // An explicit channel parameter is still validated (legacy callers can
    // pass it) but no longer used to broadcast a chat-surface "scheduled a
    // reminder" message — that's a personal event for the owner agent only.
    if (channel != null) {
      if (typeof channel !== "string" || channel.length === 0) {
        res.status(400).json({ error: "channel must be a non-empty string" });
        return;
      }
      const ctx = await resolveAgentChannel(req.params.id, req.serverId!, req.machineId, channel);
      if (!ctx) {
        res.status(404).json({ error: "Agent or channel not found" });
        return;
      }
    }

    const row = await reminderService.createReminder({
      serverId: req.serverId!,
      ownerAgentId: req.params.id,
      msgId: resolvedMsgId,
      title: title.trim(),
      fireAt: fireAtDate,
      payload: payload ?? null,
      recurrence,
      createdBy: { type: "agent", id: req.params.id },
    });

    const orchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    void orchestrator.pushReminderUpsert(req.params.id, row).catch((err) => {
      console.warn(`[reminders] pushReminderUpsert failed for ${row.id}:`, err);
    });

    const io = req.app.get("io") as SocketServer;

    // No chat-surface "🔔 X scheduled a reminder ..." system message — schedule
    // is a personal event for the owner agent (per stdrc #proj-task msg=c580faed).
    // Audit lives in `reminder_events` (recordReminderEvent runs inside
    // createReminder); humans observe via the agent's reminder tab.

    const [summary] = await reminderService.toReminderSummaries([row], req.serverId!);

    // Live UI updates — humans watching the agent profile's Reminders tab
    // should see new entries appear without reloading. Scoped to the server
    // room so only members of this server receive it.
    io?.to(`server:${row.serverId}`).emit("reminder:scheduled", { reminder: summary });

    const body: { reminder: typeof summary; warning?: string } = { reminder: summary };
    if (warning) body.warning = warning;
    res.status(201).json(body);
    recordSlockCliActivity(req, req.params.id, {
      command: "reminder.schedule",
      summary: "Scheduled reminder",
      target: summary.msgRef ?? row.id,
      correlationId: row.id,
    });
  } catch (err) {
    console.error("Internal create reminder error:", err);
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

// Agent cancels one of its own reminders
internalRouter.delete("/agent/:id/reminders/:reminderId", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const existing = await reminderService.getReminderById(req.params.reminderId);
    if (!existing || existing.serverId !== req.serverId || existing.ownerAgentId !== req.params.id) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }
    if (existing.status !== "scheduled" && existing.status !== "fired") {
      res.status(409).json({ error: `Reminder is already ${existing.status}` });
      return;
    }

    const canceled = await reminderService.cancelReminder(req.params.reminderId, {
      actor: { type: "agent", id: req.params.id },
    });
    if (!canceled) {
      res.status(409).json({ error: "Reminder state changed; refresh and retry" });
      return;
    }

    const orchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    void orchestrator.pushReminderCancel(canceled.ownerAgentId, canceled.id, canceled.version).catch((err) => {
      console.warn(`[reminders] pushReminderCancel failed for ${canceled.id}:`, err);
    });

    const [summary] = await reminderService.toReminderSummaries([canceled], req.serverId!);

    // Live UI update — pair with reminder:scheduled so the Reminders tab
    // reflects cancellations in real time without manual refresh.
    const io = req.app.get("io") as SocketServer;
    io?.to(`server:${canceled.serverId}`).emit("reminder:canceled", {
      reminderId: canceled.id,
      ownerAgentId: canceled.ownerAgentId,
    });

    res.json({ reminder: summary });
    recordSlockCliActivity(req, req.params.id, {
      command: "reminder.cancel",
      summary: "Canceled reminder",
      target: summary.msgRef ?? canceled.id,
      correlationId: canceled.id,
    });
  } catch (err) {
    console.error("Internal cancel reminder error:", err);
    res.status(500).json({ error: "Failed to cancel reminder" });
  }
});

// Agent snoozes one of its own scheduled/fired reminders
internalRouter.post("/agent/:id/reminders/:reminderId/snooze", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const { delaySeconds } = req.body ?? {};
    const schedule = resolveScheduleInput({ delaySeconds }, Date.now());
    if (!schedule.ok) {
      res.status(400).json({ error: schedule.error });
      return;
    }

    const existing = await reminderService.getReminderById(req.params.reminderId);
    if (!existing || existing.serverId !== req.serverId || existing.ownerAgentId !== req.params.id) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }
    if (existing.status !== "scheduled" && existing.status !== "fired") {
      res.status(409).json({
        error: `Reminder ${existing.id} is ${existing.status}; only scheduled or fired reminders can be snoozed`,
      });
      return;
    }

    const snoozed = await reminderService.snoozeReminder(existing.id, Number(delaySeconds), {
      actor: { type: "agent", id: req.params.id },
    });
    if (!snoozed) {
      res.status(409).json({ error: "Reminder state changed; refresh and retry" });
      return;
    }

    const orchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    void orchestrator.pushReminderUpsert(req.params.id, snoozed).catch((err) => {
      console.warn(`[reminders] pushReminderUpsert failed for ${snoozed.id}:`, err);
    });

    const [summary] = await reminderService.toReminderSummaries([snoozed], req.serverId!);
    const io = req.app.get("io") as SocketServer;
    io?.to(`server:${snoozed.serverId}`).emit("reminder:scheduled", { reminder: summary });
    res.json({ reminder: summary });
    recordSlockCliActivity(req, req.params.id, {
      command: "reminder.snooze",
      summary: "Snoozed reminder",
      target: summary.msgRef ?? snoozed.id,
      correlationId: snoozed.id,
    });
  } catch (err) {
    console.error("Internal snooze reminder error:", err);
    res.status(500).json({ error: "Failed to snooze reminder" });
  }
});

// Agent updates one of its own scheduled reminders
internalRouter.patch("/agent/:id/reminders/:reminderId", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const existing = await reminderService.getReminderById(req.params.reminderId);
    if (!existing || existing.serverId !== req.serverId || existing.ownerAgentId !== req.params.id) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }
    if (existing.status === "fired") {
      res.status(409).json({
        error: `Reminder ${existing.id} is fired; snooze it back to scheduled before updating, or schedule a new reminder`,
      });
      return;
    }
    if (existing.status !== "scheduled") {
      res.status(409).json({ error: `Reminder ${existing.id} is ${existing.status}` });
      return;
    }

    const { fireAt, delaySeconds, repeat, title, tz } = req.body ?? {};
    const mutations = [
      fireAt != null || delaySeconds != null ? "time" : null,
      repeat != null ? "repeat" : null,
      title != null ? "title" : null,
    ].filter(Boolean);
    if (mutations.length !== 1) {
      res.status(400).json({ error: "update requires exactly one of fireAt/delaySeconds, repeat, or title" });
      return;
    }

    let patch: reminderService.ReminderUpdatePatch;
    let warning: string | undefined;
    if (fireAt != null || delaySeconds != null) {
      const schedule = resolveScheduleInput({ fireAt, delaySeconds }, Date.now());
      if (!schedule.ok) {
        res.status(400).json({ error: schedule.error });
        return;
      }
      warning = schedule.warning;
      patch = fireAt != null
        ? { kind: "fireAt", fireAt: schedule.fireAt }
        : { kind: "delay", delaySeconds: Number(delaySeconds) };
    } else if (repeat != null) {
      if (typeof repeat !== "string") {
        res.status(400).json({ error: "repeat must be a string (e.g. every:15m | daily@09:00 | weekly:mon,fri@09:00)" });
        return;
      }
      let ruleTz = "UTC";
      if (tz !== undefined) {
        if (typeof tz !== "string" || tz.length === 0) {
          res.status(400).json({ error: "tz must be a non-empty IANA timezone string" });
          return;
        }
        try {
          new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
        } catch {
          res.status(400).json({ error: `unknown timezone "${tz}"` });
          return;
        }
        ruleTz = tz;
      }
      const parsed = parseRecurrenceString(repeat, ruleTz);
      if (!parsed.ok) {
        res.status(400).json({ error: `repeat: ${parsed.error}` });
        return;
      }
      if (
        (parsed.recurrence.rule.kind === "daily" || parsed.recurrence.rule.kind === "weekly") &&
        tz === undefined
      ) {
        res.status(400).json({
          error: "tz is required for daily@ or weekly: rules (IANA name, e.g. America/Los_Angeles)",
        });
        return;
      }
      patch = { kind: "recurrence", recurrence: parsed.recurrence };
    } else {
      if (typeof title !== "string" || title.trim().length === 0) {
        res.status(400).json({ error: "title must be a non-empty string" });
        return;
      }
      if (title.length > REMINDER_MAX_TITLE_LEN) {
        res.status(400).json({ error: `title must be at most ${REMINDER_MAX_TITLE_LEN} characters` });
        return;
      }
      patch = { kind: "title", title: title.trim() };
    }

    const updated = await reminderService.updateReminder(existing.id, patch, {
      actor: { type: "agent", id: req.params.id },
    });
    if (!updated) {
      res.status(409).json({ error: "Reminder state changed; refresh and retry" });
      return;
    }

    const orchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    void orchestrator.pushReminderUpsert(req.params.id, updated).catch((err) => {
      console.warn(`[reminders] pushReminderUpsert failed for ${updated.id}:`, err);
    });

    const [summary] = await reminderService.toReminderSummaries([updated], req.serverId!);
    const io = req.app.get("io") as SocketServer;
    io?.to(`server:${updated.serverId}`).emit("reminder:scheduled", { reminder: summary });
    const body: { reminder: typeof summary; warning?: string } = { reminder: summary };
    if (warning) body.warning = warning;
    res.json(body);
    recordSlockCliActivity(req, req.params.id, {
      command: "reminder.update",
      summary: "Updated reminder",
      target: summary.msgRef ?? updated.id,
      correlationId: updated.id,
    });
  } catch (err) {
    console.error("Internal update reminder error:", err);
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

// Agent reads lifecycle log for one of its own reminders
internalRouter.get("/agent/:id/reminders/:reminderId/log", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const existing = await reminderService.getReminderById(req.params.reminderId);
    if (!existing || existing.serverId !== req.serverId || existing.ownerAgentId !== req.params.id) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }

    const events = await reminderService.listReminderEvents(existing.id);
    res.json({ events: reminderService.toReminderEventSummaries(events) });
  } catch (err) {
    console.error("Internal reminder log error:", err);
    res.status(500).json({ error: "Failed to read reminder log" });
  }
});

// ── Operation cards (B-mode) — agent prepares an action card ────────────────
//
// Body: { target: "#channel" | "dm:@peer" | thread, action: ActionCardAction }
// Resolves target via channelService.resolveChannelByName; posts a system
// message in that channel whose actionMetadata.kind === "action-card"
// carries the prepared action.

internalRouter.post("/agent/:id/prepare-action", requireAgentScope("action:prepare"), async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    const body = (req.body ?? {}) as { target?: unknown; action?: unknown };
    if (typeof body.target !== "string" || body.target.trim().length === 0) {
      res.status(400).json({ error: "target is required" });
      return;
    }
    const resolved = await channelService.resolveChannelByName(
      req.serverId!,
      req.params.id,
      body.target.trim(),
    );
    if (!resolved) {
      res.status(400).json({ error: `Could not resolve target: ${body.target}` });
      return;
    }

    const io = (req.app.get("io") ?? null) as Parameters<typeof actionCardsService.prepareActionCard>[0]["io"];
    const out = await actionCardsService.prepareActionCard({
      serverId: req.serverId!,
      requesterAgentId: req.params.id,
      targetChannelId: resolved.channelId,
      action: body.action as Parameters<typeof actionCardsService.prepareActionCard>[0]["action"],
      io: io ?? null,
    });
    res.status(201).json({ messageId: out.messageId, metadata: out.metadata });
    recordSlockCliActivity(req, req.params.id, {
      command: "action.prepare",
      summary: "Prepared action card",
      target: body.target.trim(),
      correlationId: out.messageId,
    });
  } catch (err) {
    if (err instanceof actionCardsService.ActionCardError) {
      res.status(err.status).json({ error: err.message, errorCode: err.code });
      return;
    }
    console.error("Internal prepare-action error:", err);
    res.status(500).json({ error: "Failed to prepare action card" });
  }
});

// ── Daemon scope-set fetch ──────────────────────────────────────────────────
//
// Called by the daemon on connect (and consumed by Noel's hot-swap cache on
// `agent:scope-updated` ws event). Returns the canonical AgentScopeSet wire
// shape — daemons cache this verbatim so the chat-bridge MCP listing filter
// and the slock CLI wrapper can short-circuit obviously-denied calls before
// they hit the wire.
//
// No requireAgentScope() here — fetching one's own scope set is intrinsic to
// being an agent. The route still honors machine ownership: a machine API
// key cannot pull the scope set of an agent it doesn't own.
internalRouter.get("/agent/:id/scopes", async (req, res) => {
  try {
    const result = await loadOwnedMachineAgent(req.params.id, req.machineId, req.serverId);
    if ("status" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    const set = await agentScopesService.loadAgentScopes(req.params.id);
    res.json(set);
  } catch (err) {
    if (err instanceof agentScopesService.AgentScopesNotFoundError) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    console.error("Internal agent scopes error:", err);
    res.status(500).json({ error: "Failed to load agent scopes" });
  }
});
