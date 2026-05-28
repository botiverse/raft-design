import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { agentKnowledgeEvents, agents } from "../db/schema.js";

export const AGENT_KNOWLEDGE_STATUSES = ["success", "not_found", "denied", "error"] as const;
export type AgentKnowledgeStatus = (typeof AGENT_KNOWLEDGE_STATUSES)[number];

export const AGENT_KNOWLEDGE_SOURCES = ["cli"] as const;
export type AgentKnowledgeSource = (typeof AGENT_KNOWLEDGE_SOURCES)[number];

export const AGENT_KNOWLEDGE_DOC_STATES = ["draft", "published", "deprecated", "retired"] as const;
export type AgentKnowledgeDocState = (typeof AGENT_KNOWLEDGE_DOC_STATES)[number];

export interface AgentKnowledgeDoc {
  docId: string;
  topicOrPath: string;
  docVersion: string;
  docState: AgentKnowledgeDocState;
  content: string;
  contentType: KnowledgeContentType;
}

interface KnowledgeRegistryEntry {
  docId: string;
  aliases: readonly string[];
  docState: AgentKnowledgeDocState;
  contentType: KnowledgeContentType;
  sourcePath: string;
}

type KnowledgeContentType = "text/markdown" | "text/mdx";

export interface RecordAgentKnowledgeEventArgs {
  serverId: string;
  agentId: string;
  computerId?: string | null;
  docId?: string | null;
  topicOrPath: string;
  docVersion?: string | null;
  docState?: AgentKnowledgeDocState | null;
  source: AgentKnowledgeSource;
  status: AgentKnowledgeStatus;
  requestedAt?: Date;
  latencyMs?: number | null;
  responseBytes?: number | null;
  /**
   * Caller-provided semantic turn join key. The server stores it as opaque text
   * and does not infer, validate, or backfill semantic stability.
   */
  turnId?: string | null;
  /**
   * Caller-provided request/trace join key for debugging request paths. This is
   * opaque text and may differ from turnId across retries or split requests.
   */
  traceId?: string | null;
  reason?: string | null;
}

export interface ValidateKnowledgeReasonResult {
  ok: boolean;
  reason: string | null;
  error?: string;
}

const MAX_TOPIC_LENGTH = 200;
const MAX_CORRELATION_LENGTH = 200;
const MIN_REASON_LENGTH = 12;
const MAX_REASON_LENGTH = 500;

const AGENT_KNOWLEDGE_SOURCE_PATHS = [
  "docs/agent-knowledge/account.mdx",
  "docs/agent-knowledge/action-cards.mdx",
  "docs/agent-knowledge/agent-draft-human-commit.mdx",
  "docs/agent-knowledge/agent-profile.mdx",
  "docs/agent-knowledge/agent-status.mdx",
  "docs/agent-knowledge/agent.mdx",
  "docs/agent-knowledge/attachment.mdx",
  "docs/agent-knowledge/channel.mdx",
  "docs/agent-knowledge/common-worked-patterns.mdx",
  "docs/agent-knowledge/computer.mdx",
  "docs/agent-knowledge/dm.mdx",
  "docs/agent-knowledge/inbox.mdx",
  "docs/agent-knowledge/membership.mdx",
  "docs/agent-knowledge/mention.mdx",
  "docs/agent-knowledge/message.mdx",
  "docs/agent-knowledge/metric-safe-vocabulary.mdx",
  "docs/agent-knowledge/mobile-vs-desktop.mdx",
  "docs/agent-knowledge/notifications.mdx",
  "docs/agent-knowledge/permission-matrix.mdx",
  "docs/agent-knowledge/reminder.mdx",
  "docs/agent-knowledge/runtime.mdx",
  "docs/agent-knowledge/saved-messages.mdx",
  "docs/agent-knowledge/scopes-and-permissions.mdx",
  "docs/agent-knowledge/search.mdx",
  "docs/agent-knowledge/server-management.mdx",
  "docs/agent-knowledge/server-role.mdx",
  "docs/agent-knowledge/server.mdx",
  "docs/agent-knowledge/slock-cli-overview.mdx",
  "docs/agent-knowledge/task.mdx",
  "docs/agent-knowledge/terminology-canon.mdx",
  "docs/agent-knowledge/thread.mdx",
  "docs/agent-knowledge/ui-surface-map.mdx",
  "docs/agent-knowledge/user-profile.mdx",
  "docs/agent-knowledge/voice-and-tone.mdx",
  "docs/agent-knowledge/what-slock-doesnt-have.mdx",
] as const;

const KNOWLEDGE_REGISTRY: readonly KnowledgeRegistryEntry[] = [
  {
    docId: "slock-home",
    aliases: ["slock-home", "daemon/slock-home", "docs/daemon/slock-home"],
    docState: "published",
    contentType: "text/markdown",
    sourcePath: "docs/daemon/slock-home.md",
  },
  ...AGENT_KNOWLEDGE_SOURCE_PATHS.map(buildAgentKnowledgeRegistryEntry),
];

export function normalizeKnowledgeTopic(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const topic = raw.trim();
  if (!topic || topic.length > MAX_TOPIC_LENGTH) return null;
  return topic;
}

export function normalizeOptionalKnowledgeField(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > MAX_CORRELATION_LENGTH) return null;
  return value;
}

export function validateKnowledgeReason(raw: unknown): ValidateKnowledgeReasonResult {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, reason: null };
  }
  if (typeof raw !== "string") {
    return { ok: false, reason: null, error: "reason must be a string" };
  }
  const reason = raw.trim();
  if (reason.length < MIN_REASON_LENGTH) {
    return { ok: false, reason: null, error: `reason must be at least ${MIN_REASON_LENGTH} characters` };
  }
  if (reason.length > MAX_REASON_LENGTH) {
    return { ok: false, reason: null, error: `reason must be at most ${MAX_REASON_LENGTH} characters` };
  }
  const rawPayloadError = classifyRawPayloadReason(reason);
  if (rawPayloadError) {
    return { ok: false, reason: null, error: rawPayloadError };
  }
  return { ok: true, reason };
}

export async function resolveAgentKnowledgeDoc(topicOrPath: string): Promise<AgentKnowledgeDoc | null> {
  const normalized = topicOrPath.toLowerCase();
  const entry = KNOWLEDGE_REGISTRY.find((candidate) =>
    candidate.aliases.some((alias) => alias.toLowerCase() === normalized)
  );
  if (!entry) return null;

  const content = await readKnowledgeContent(entry);
  const digest = createHash("sha256").update(content, "utf8").digest("hex").slice(0, 16);
  return {
    docId: entry.docId,
    topicOrPath,
    docVersion: `sha256:${digest}`,
    docState: entry.docState,
    content,
    contentType: entry.contentType,
  };
}

export async function recordAgentKnowledgeEvent(args: RecordAgentKnowledgeEventArgs): Promise<void> {
  const db = getDb();
  await db.insert(agentKnowledgeEvents).values({
    serverId: args.serverId,
    agentId: args.agentId,
    computerId: args.computerId ?? null,
    docId: args.docId ?? null,
    topicOrPath: args.topicOrPath,
    docVersion: args.docVersion ?? null,
    docState: args.docState ?? null,
    source: args.source,
    status: args.status,
    requestedAt: args.requestedAt ?? new Date(),
    latencyMs: args.latencyMs ?? null,
    responseBytes: args.responseBytes ?? null,
    turnId: args.turnId ?? null,
    traceId: args.traceId ?? null,
    reason: args.reason ?? null,
  });
}

export async function agentBelongsToServer(agentId: string, serverId: string): Promise<boolean> {
  const [agent] = await getDb()
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.serverId, serverId), isNull(agents.deletedAt)));
  return Boolean(agent);
}

async function readKnowledgeContent(entry: KnowledgeRegistryEntry): Promise<string> {
  for (const root of knowledgeRootCandidates()) {
    try {
      const source = await readFile(path.join(root, entry.sourcePath), "utf8");
      return sanitizeAgentKnowledgeContent(source);
    } catch {
      // Try the next candidate; missing deployed docs should be visible as an error event.
    }
  }
  throw new Error(`Knowledge document not found in deploy artifact: ${entry.sourcePath}`);
}

export function sanitizeAgentKnowledgeContent(source: string): string {
  let output = "";
  let cursor = 0;
  let inFence = false;

  for (const match of source.matchAll(/^```/gm)) {
    const markerIndex = match.index ?? 0;
    const segment = source.slice(cursor, markerIndex);
    output += inFence ? segment : stripMdxComments(segment);
    output += match[0];
    cursor = markerIndex + match[0].length;
    inFence = !inFence;
  }

  const tail = source.slice(cursor);
  output += inFence ? tail : stripMdxComments(tail);
  return output;
}

function stripMdxComments(source: string): string {
  return source.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

function knowledgeRootCandidates(): string[] {
  const roots = [
    process.env.SLOCK_KNOWLEDGE_ROOT,
    process.cwd(),
    path.resolve(process.cwd(), "../.."),
  ].filter((value): value is string => Boolean(value));
  return [...new Set(roots)];
}

function classifyRawPayloadReason(reason: string): string | null {
  if (/\[target=.*\bmsg=/.test(reason)) return "reason must not contain raw Slock message headers";
  if (/```[\s\S]*```/.test(reason)) return "reason must not contain markdown code blocks";
  const urlCount = reason.match(/https?:\/\//g)?.length ?? 0;
  if (urlCount >= 3) return "reason must not contain long URL lists";
  const lineCount = reason.split(/\r?\n/).length;
  if (lineCount > 4) return "reason must be a concise intent summary";
  return null;
}

function buildAgentKnowledgeRegistryEntry(sourcePath: string): KnowledgeRegistryEntry {
  const relativePath = sourcePath
    .replace(/^docs\/agent-knowledge\//, "")
    .replace(/\.mdx?$/, "");
  const docId = relativePath === "index" ? "index" : relativePath.replace(/\//g, ".");
  return {
    docId,
    aliases: buildAgentKnowledgeAliases(docId, relativePath),
    docState: "published",
    contentType: "text/mdx",
    sourcePath,
  };
}

function buildAgentKnowledgeAliases(docId: string, relativePath: string): readonly string[] {
  const aliases = new Set<string>([
    docId,
    relativePath,
    `agent-knowledge/${relativePath}`,
    `docs/agent-knowledge/${relativePath}`,
  ]);
  if (relativePath === "index") {
    aliases.add("agent-knowledge");
    aliases.add("docs/agent-knowledge");
  }
  return [...aliases];
}
