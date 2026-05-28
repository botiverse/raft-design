import { randomBytes } from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { URL } from "node:url";
import { daemonFetch } from "./daemonFetch.js";
import { logger } from "./logger.js";

type ProxyRegistration = {
  serverUrl: string;
  apiKey: string;
  agentId: string;
  launchId: string | null;
  activeCapabilities: string;
  inboxCoordinator?: AgentProxyInboxCoordinator;
};

type ProxyHandle = {
  proxyUrl: string;
  proxyToken: string;
};

type ProxyServerState = {
  server: http.Server;
  proxyUrl: string;
};

type ProxyServerFactory = (handler: http.RequestListener) => http.Server;

export type AgentProxyVisibleMessage = {
  seq?: number;
  id?: string;
  message_id?: string;
  channel_type?: string;
  channel_name?: string;
  parent_channel_type?: string;
  parent_channel_name?: string;
  sender_type?: string;
  sender_name?: string;
  sender_description?: string | null;
  senderType?: string;
  senderName?: string;
  senderDescription?: string | null;
  content?: string;
  timestamp?: string;
  createdAt?: string;
};

export type AgentProxyInboxCoordinator = {
  getBoundary(target: string): number | undefined;
  getPendingMessages(target: string): AgentProxyVisibleMessage[];
  /**
   * Local Inbox contract for daemon-managed runners:
   * `/internal/agent-api/events` and `slock message check` MUST drain this
   * daemon-local queue before asking the remote server for events. The server
   * `/events` endpoint is a sync/repair fallback after local pending is empty,
   * not the primary source while the daemon has already accepted delivery.
   */
  getAllPendingMessages?(): AgentProxyVisibleMessage[];
  consumeVisibleMessages(input: {
    target?: string;
    messages: AgentProxyVisibleMessage[];
    boundarySeq?: number;
    source: "server_held_context" | "agent_api_events" | "agent_api_history" | "agent_api_send_commit" | "side_effect_preflight_context";
  }): void;
  recordFreshnessDecision?(input: AgentProxyFreshnessDecision): void;
  recordDrainOutcome?(input: AgentProxyDrainOutcome): void;
  recordProxyFailure?(input: AgentProxyFailure): void;
};

export type AgentProxyFreshnessAction = "send" | "task_claim" | "task_update";

export type AgentProxyFreshnessDecision = {
  action: AgentProxyFreshnessAction;
  decision: "local_hold" | "syncing_hold" | "forward" | "bypass";
  target?: string;
  inboxTrustState: "trusted" | "untrusted";
  reason: string;
  pendingCount?: number;
  pendingMaxSeq?: number;
  modelSeenSeq?: number;
  heldMessageCount?: number;
  omittedMessageCount?: number;
};

export type AgentProxyDrainOutcome = {
  /** `daemon_pending` is Local Inbox served directly; `server_events` is the remote fallback after Local Inbox is empty. */
  source: "daemon_pending" | "server_events";
  sinceCursorKind: "latest" | "seq" | null;
  notifiedCount: number;
  drainedCount: number;
  hasMore?: boolean;
};

export type AgentProxyFailure = {
  method: string;
  pathname: string;
  queryKeys: string[];
  errorName: string;
  errorMessage: string;
};

const registrations = new Map<string, ProxyRegistration>();
let proxyServerState: ProxyServerState | null = null;
let proxyServerStartPromise: Promise<ProxyServerState> | null = null;
let proxyServerFactory: ProxyServerFactory = createProxyServer;
const DECODED_RESPONSE_HEADERS = new Set(["content-encoding", "content-length", "transfer-encoding"]);
const LOCAL_HELD_CONTEXT_LIMIT = 3;
const AGENT_CREDENTIAL_PROXY_HOST = "127.0.0.1";
const AGENT_CREDENTIAL_PROXY_BIND_MAX_ATTEMPTS = 3;

function createProxyRequestHandler(): http.RequestListener {
  return (req, res) => {
    void handleProxyRequest(req, res);
  };
}

function createProxyServer(handler: http.RequestListener): http.Server {
  return http.createServer(handler);
}

function listenOnLoopback(server: http.Server): Promise<ProxyServerState> {
  return new Promise((resolve, reject) => {
    const onError = (err: Error) => {
      server.off("listening", onListening);
      reject(err);
    };
    const onListening = () => {
      server.off("error", onError);
      const address = server.address() as AddressInfo | null;
      if (!address || typeof address.port !== "number") {
        reject(new Error("local proxy listen succeeded without a TCP port"));
        return;
      }
      resolve({
        server,
        proxyUrl: `http://${AGENT_CREDENTIAL_PROXY_HOST}:${address.port}`,
      });
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(0, AGENT_CREDENTIAL_PROXY_HOST);
  });
}

function closeServerBestEffort(server: http.Server): void {
  try {
    server.close();
  } catch {
    // The server may not have reached the listening state.
  }
}

async function startProxyServer(): Promise<ProxyServerState> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= AGENT_CREDENTIAL_PROXY_BIND_MAX_ATTEMPTS; attempt += 1) {
    const server = proxyServerFactory(createProxyRequestHandler());
    try {
      const state = await listenOnLoopback(server);
      state.server.on("error", (err) => {
        logger.warn(`[Agent Credential Proxy] local proxy failed after bind: ${(err as Error).message}`);
      });
      state.server.unref();
      return state;
    } catch (err) {
      lastError = err;
      closeServerBestEffort(server);
      logger.warn(
        `[Agent Credential Proxy] local proxy bind attempt ${attempt}/${AGENT_CREDENTIAL_PROXY_BIND_MAX_ATTEMPTS} failed: ` +
        `${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  const detail = lastError instanceof Error ? lastError.message : String(lastError ?? "unknown error");
  throw new Error(
    `Agent Credential Proxy local proxy failed to bind ${AGENT_CREDENTIAL_PROXY_HOST} ` +
    `after ${AGENT_CREDENTIAL_PROXY_BIND_MAX_ATTEMPTS} attempts: ${detail}`,
  );
}

async function ensureServer(): Promise<ProxyServerState> {
  if (proxyServerState) return proxyServerState;
  if (!proxyServerStartPromise) {
    proxyServerStartPromise = startProxyServer();
  }
  try {
    proxyServerState = await proxyServerStartPromise;
    return proxyServerState;
  } finally {
    proxyServerStartPromise = null;
  }
}

export async function __resetAgentCredentialProxyForTest(): Promise<void> {
  registrations.clear();
  const state = proxyServerState;
  proxyServerState = null;
  proxyServerStartPromise = null;
  proxyServerFactory = createProxyServer;
  if (!state) return;
  await new Promise<void>((resolve) => {
    state.server.close(() => resolve());
  });
}

export function __setAgentCredentialProxyServerFactoryForTest(factory: ProxyServerFactory | null): void {
  proxyServerFactory = factory ?? createProxyServer;
}

function responseHeadersForLocalProxy(upstream: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [name, value] of upstream.headers.entries()) {
    // Node fetch transparently decodes gzip/br responses but preserves the
    // upstream encoding headers. The local proxy forwards decoded bytes, so
    // advertising the original compressed encoding makes downstream CLI fetch
    // attempt a second decode and surface null JSON payloads.
    if (DECODED_RESPONSE_HEADERS.has(name.toLowerCase())) continue;
    headers[name] = value;
  }
  return headers;
}

async function handleProxyRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const auth = req.headers.authorization;
  const token = typeof auth === "string" && auth.startsWith("Bearer ")
    ? auth.slice("Bearer ".length)
    : "";
  const registration = registrations.get(token);
  if (!registration) {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "invalid local agent proxy token", code: "invalid_agent_proxy_token" }));
    return;
  }

  const method = req.method ?? "GET";
  let target: URL | undefined;
  try {
    target = new URL(req.url ?? "/", registration.serverUrl);
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      if (name.toLowerCase() === "host") continue;
      if (name.toLowerCase() === "authorization") continue;
      if (Array.isArray(value)) {
        for (const item of value) headers.append(name, item);
      } else {
        headers.set(name, value);
      }
    }
    headers.set("Authorization", `Bearer ${registration.apiKey}`);
    headers.set("X-Agent-Id", registration.agentId);
    headers.set("X-Slock-Client", "cli");
    headers.set("X-Slock-Agent-Active-Capabilities", registration.activeCapabilities);

    let body: BodyInit | undefined = method === "GET" || method === "HEAD" ? undefined : req as unknown as BodyInit;
    let sendTarget: string | undefined;
    const sideEffectAction = agentApiSideEffectAction(target.pathname);

    // Local Inbox first: a managed runner's message check is a projection of
    // the daemon's accepted-but-not-yet-visible inbox. Do not forward to the
    // server while local pending exists, or a busy runtime can receive a
    // pending notification and then see "No new messages."
    if (method === "GET" && target.pathname === "/internal/agent-api/events") {
      const localEvents = localAgentApiEventsResponse(registration, target);
      if (localEvents) {
        res.writeHead(localEvents.status, { "content-type": "application/json" });
        res.end(JSON.stringify(localEvents.body));
        return;
      }
    }

    if (method === "POST" && sideEffectAction) {
      const rawBody = await readRequestBody(req);
      const prepared = await prepareAgentApiSideEffectForward(registration, headers, rawBody, sideEffectAction);
      if (prepared.localResponse) {
        const responseText = JSON.stringify(prepared.localResponse);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(responseText);
        return;
      }
      body = prepared.bodyText;
      if (sideEffectAction === "send") sendTarget = prepared.target;
      headers.set("content-type", "application/json");
      headers.set("content-length", String(Buffer.byteLength(prepared.bodyText)));
    }

    const upstream = await daemonFetch(target, {
      method,
      headers,
      body,
      // Required by undici when forwarding a Node stream.
      duplex: body ? "half" : undefined,
    } as RequestInit & { duplex?: "half" });

    if (shouldBufferJsonResponse(upstream, target.pathname, registration)) {
      const responseText = await upstream.text();
      consumeVisibleResponse(registration, target, sendTarget, responseText);
      res.writeHead(upstream.status, responseHeadersForLocalProxy(upstream));
      res.end(responseText);
      return;
    }

    res.writeHead(upstream.status, responseHeadersForLocalProxy(upstream));
    if (upstream.body) {
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } else {
      res.end();
    }
  } catch (err) {
    const failure = proxyFailureForError(method, target, err);
    logger.warn(
      `[Agent Credential Proxy] request failed ` +
      `(agent=${registration.agentId}, launch=${registration.launchId ?? "none"}, ` +
      `method=${failure.method}, path=${failure.pathname}, query_keys=${failure.queryKeys.join(",") || "none"}): ` +
      `${failure.errorName}: ${failure.errorMessage}`,
    );
    registration.inboxCoordinator?.recordProxyFailure?.(failure);
    writeProxyFailureResponse(res, failure);
  }
}

function writeProxyFailureResponse(res: http.ServerResponse, failure: AgentProxyFailure): void {
  if (res.writableEnded) return;
  if (res.headersSent) {
    // A streaming response may have already committed upstream headers and
    // partial bytes to the runtime. HTTP cannot be changed to a 502 JSON
    // envelope at that point; attempting to write headers again throws
    // ERR_HTTP_HEADERS_SENT. Close this local stream and keep the structured
    // failure in logs / inboxCoordinator instead.
    res.destroy();
    return;
  }
  res.writeHead(502, { "content-type": "application/json" });
  res.end(JSON.stringify({
    error: "failed to proxy local agent request",
    code: "agent_proxy_failed",
    detail: failure.errorMessage,
  }));
}

function proxyFailureForError(method: string, target: URL | undefined, err: unknown): AgentProxyFailure {
  const queryKeys = target ? [...new Set([...target.searchParams.keys()])].sort() : [];
  return {
    method,
    pathname: target?.pathname ?? "unknown",
    queryKeys,
    errorName: err instanceof Error ? err.name : typeof err,
    errorMessage: truncateProxyErrorMessage(err instanceof Error ? err.message : String(err)),
  };
}

function truncateProxyErrorMessage(message: string): string {
  const normalized = message.replace(/\s+/g, " ").trim();
  return normalized.length > 500 ? `${normalized.slice(0, 497)}...` : normalized;
}

async function readRequestBody(req: http.IncomingMessage): Promise<string> {
  let body = "";
  req.setEncoding("utf8");
  for await (const chunk of req) {
    body += String(chunk);
  }
  return body;
}

function messageSeq(message: AgentProxyVisibleMessage): number {
  return Number(message.seq ?? 0);
}

function maxMessageSeq(messages: AgentProxyVisibleMessage[]): number | undefined {
  let maxSeq = 0;
  for (const message of messages) {
    const seq = Math.floor(messageSeq(message));
    if (Number.isFinite(seq) && seq > 0) maxSeq = Math.max(maxSeq, seq);
  }
  return maxSeq > 0 ? maxSeq : undefined;
}

function sortBySeq(messages: AgentProxyVisibleMessage[]): AgentProxyVisibleMessage[] {
  return [...messages].sort((a, b) => messageSeq(a) - messageSeq(b));
}

function latestVisibleMessages(messages: AgentProxyVisibleMessage[], limit: number): AgentProxyVisibleMessage[] {
  const sorted = sortBySeq(messages);
  return sorted.slice(Math.max(0, sorted.length - limit));
}

function parseAgentApiEventsQuery(target: URL): {
  limit: number;
  sinceSeq: number | null;
  sinceCursorKind: "latest" | "seq" | null;
  error?: Record<string, string>;
} {
  const limit = Math.min(Math.max(Number(target.searchParams.get("limit")) || 50, 1), 200);
  const sinceRaw = target.searchParams.get("since")?.trim() ?? "";
  if (!sinceRaw) return { limit, sinceSeq: null, sinceCursorKind: null };
  if (sinceRaw === "latest") return { limit, sinceSeq: null, sinceCursorKind: "latest" };
  const parsed = Number(sinceRaw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      limit,
      sinceSeq: null,
      sinceCursorKind: null,
      error: {
        error: "since must be a non-negative integer (messageSeq) or 'latest'",
        code: "since_invalid",
      },
    };
  }
  return { limit, sinceSeq: Math.floor(parsed), sinceCursorKind: "seq" };
}

function localAgentApiEventsResponse(
  registration: ProxyRegistration,
  target: URL,
): { status: number; body: Record<string, unknown> } | undefined {
  const coordinator = registration.inboxCoordinator;
  if (!coordinator) return undefined;
  const pending = coordinator.getAllPendingMessages?.() ?? [];
  const parsedQuery = parseAgentApiEventsQuery(target);
  if (parsedQuery.error && pending.length > 0) {
    return { status: 400, body: parsedQuery.error };
  }
  if (pending.length === 0) return undefined;

  // Managed-runner `/events` is the check_messages projection over the daemon
  // Local Inbox. The server endpoint is only a sync/repair fallback once this
  // local source of truth is empty; otherwise a busy runtime can be notified
  // about pending inbox messages and then incorrectly see "No new messages."
  const normalized = sortBySeq(normalizeVisibleMessages(pending));
  const filtered = parsedQuery.sinceSeq !== null
    ? normalized.filter((message) => {
        const seq = messageSeq(message);
        return Number.isFinite(seq) && seq > parsedQuery.sinceSeq!;
      })
    : normalized;
  const events = filtered.slice(0, parsedQuery.limit);
  const hasMore = filtered.length > events.length;
  const newestEvent = events[events.length - 1];
  const lastSeenMsgId = newestEvent?.message_id ?? newestEvent?.id ?? null;
  const lastSeenSeq = newestEvent?.seq ?? parsedQuery.sinceSeq;

  if (events.length > 0) {
    coordinator.consumeVisibleMessages({ messages: events, source: "agent_api_events" });
  }
  coordinator.recordDrainOutcome?.({
    source: "daemon_pending",
    sinceCursorKind: parsedQuery.sinceCursorKind,
    notifiedCount: pending.length,
    drainedCount: events.length,
    hasMore,
  });

  return {
    status: 200,
    body: {
      events,
      last_seen_msgId: lastSeenMsgId,
      last_seen_seq: lastSeenSeq,
      reply_target: null,
      pending_notice_ids: [] as string[],
      wake_reason: null as string | null,
      has_more: hasMore,
    },
  };
}

function heldAvailableActions(action: AgentProxyFreshnessAction): string[] {
  return action === "send"
    ? ["check_messages", "send_draft", "send_anyway"]
    : ["check_messages", "retry_action"];
}

function localHeldResponse(input: {
  action: AgentProxyFreshnessAction;
  target: string;
  messages: AgentProxyVisibleMessage[];
  coordinator: AgentProxyInboxCoordinator;
  source: "side_effect_preflight_context";
}): Record<string, unknown> | undefined {
  if (input.messages.length === 0) return undefined;
  const normalized = sortBySeq(normalizeVisibleMessages(input.messages, input.target));
  const heldMessages = latestVisibleMessages(normalized, LOCAL_HELD_CONTEXT_LIMIT);
  const omittedMessageCount = Math.max(0, normalized.length - heldMessages.length);
  const seenUpToSeq = maxMessageSeq(normalized);
  if (seenUpToSeq === undefined) return undefined;
  input.coordinator.consumeVisibleMessages({
    target: input.target,
    messages: heldMessages,
    boundarySeq: seenUpToSeq,
    source: input.source,
  });
  const response: Record<string, unknown> = {
    state: "held",
    outcome: "held",
    subtype: "freshness",
    reason: "newer_messages_available",
    available_actions: heldAvailableActions(input.action),
    heldMessages,
    newMessageCount: normalized.length,
    shownMessageCount: heldMessages.length,
    omittedMessageCount,
  };
  response.seenUpToSeq = seenUpToSeq;
  return response;
}

function recordFreshnessDecision(
  coordinator: AgentProxyInboxCoordinator | undefined,
  decision: AgentProxyFreshnessDecision,
): void {
  coordinator?.recordFreshnessDecision?.(decision);
}

function agentApiSideEffectAction(pathname: string): AgentProxyFreshnessAction | undefined {
  if (pathname === "/internal/agent-api/send") return "send";
  if (pathname === "/internal/agent-api/tasks/claim") return "task_claim";
  if (pathname === "/internal/agent-api/tasks/update-status") return "task_update";
  return undefined;
}

function sideEffectTarget(action: AgentProxyFreshnessAction, body: Record<string, unknown>): string | undefined {
  const field = action === "send" ? body.target : body.channel;
  return typeof field === "string" && field.length > 0 ? field : undefined;
}

function parseTargetFields(target: string): Partial<AgentProxyVisibleMessage> {
  if (target.startsWith("dm:@")) {
    const rest = target.slice("dm:@".length);
    const [peer, threadId] = rest.split(":", 2);
    if (threadId) {
      return {
        channel_type: "thread",
        channel_name: threadId,
        parent_channel_type: "dm",
        parent_channel_name: peer,
      };
    }
    return { channel_type: "dm", channel_name: peer };
  }
  if (target.startsWith("#")) {
    const rest = target.slice(1);
    const [channel, threadId] = rest.split(":", 2);
    if (threadId) {
      return {
        channel_type: "thread",
        channel_name: threadId,
        parent_channel_type: "channel",
        parent_channel_name: channel,
      };
    }
    return { channel_type: "channel", channel_name: channel };
  }
  return {};
}

function normalizeVisibleMessage(message: AgentProxyVisibleMessage, target?: string): AgentProxyVisibleMessage {
  const targetFields = target ? parseTargetFields(target) : {};
  return {
    ...targetFields,
    ...message,
    message_id: message.message_id ?? message.id,
    timestamp: message.timestamp ?? message.createdAt,
    sender_type: message.sender_type ?? message.senderType,
    sender_name: message.sender_name ?? message.senderName,
    sender_description: message.sender_description ?? message.senderDescription ?? null,
  };
}

function normalizeVisibleMessages(messages: AgentProxyVisibleMessage[], target?: string): AgentProxyVisibleMessage[] {
  return messages.map((message) => normalizeVisibleMessage(message, target));
}

async function loadRecentTargetMessages(
  registration: ProxyRegistration,
  headers: Headers,
  target: string,
): Promise<AgentProxyVisibleMessage[]> {
  const historyUrl = new URL("/internal/agent-api/history", registration.serverUrl);
  historyUrl.searchParams.set("channel", target);
  historyUrl.searchParams.set("limit", "3");
  const historyHeaders = new Headers(headers);
  historyHeaders.delete("content-length");
  historyHeaders.delete("content-type");
  const res = await daemonFetch(historyUrl, { method: "GET", headers: historyHeaders });
  if (!res.ok) return [];
  const parsed = await res.json().catch(() => null) as { messages?: AgentProxyVisibleMessage[] } | null;
  return Array.isArray(parsed?.messages) ? normalizeVisibleMessages(parsed!.messages, target) : [];
}

async function prepareAgentApiSideEffectForward(
  registration: ProxyRegistration,
  headers: Headers,
  rawBody: string,
  action: AgentProxyFreshnessAction,
): Promise<
  { bodyText: string; target?: string; localResponse?: Record<string, unknown> }
> {
  let body: Record<string, unknown>;
  try {
    body = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};
  } catch {
    return { bodyText: rawBody };
  }

  const target = sideEffectTarget(action, body);
  const coordinator = registration.inboxCoordinator;
  if (!target || !coordinator) {
    return { bodyText: JSON.stringify(body), target };
  }
  if (action === "send" && body.continueAnyway === true) {
    recordFreshnessDecision(coordinator, {
      action,
      decision: "bypass",
      target,
      inboxTrustState: "trusted",
      reason: "continue_anyway",
    });
    return { bodyText: JSON.stringify(body), target };
  }

  const pending = coordinator.getPendingMessages(target);
  if (pending.length > 0) {
    const localResponse = localHeldResponse({
      action,
      target,
      messages: pending,
      coordinator,
      source: "side_effect_preflight_context",
    });
    if (localResponse) {
      recordFreshnessDecision(coordinator, {
        action,
        decision: "local_hold",
        target,
        inboxTrustState: "trusted",
        reason: "exact_target_pending",
        pendingCount: pending.length,
        pendingMaxSeq: maxMessageSeq(pending),
        modelSeenSeq: coordinator.getBoundary(target),
        heldMessageCount: typeof localResponse.shownMessageCount === "number" ? localResponse.shownMessageCount : undefined,
        omittedMessageCount: typeof localResponse.omittedMessageCount === "number" ? localResponse.omittedMessageCount : undefined,
      });
    }
    return {
      bodyText: JSON.stringify(body),
      target,
      localResponse,
    };
  }

  const existingBoundary = typeof body.seenUpToSeq === "number" && Number.isFinite(body.seenUpToSeq)
    ? Math.max(0, Math.floor(body.seenUpToSeq))
    : undefined;
  const loadedBoundary = coordinator.getBoundary(target);
  const boundary = Math.max(existingBoundary ?? 0, loadedBoundary ?? 0);
  if (boundary > 0) {
    if (action === "send") body.seenUpToSeq = boundary;
    recordFreshnessDecision(coordinator, {
      action,
      decision: "forward",
      target,
      inboxTrustState: "trusted",
      reason: "model_seen_boundary",
      pendingCount: 0,
      modelSeenSeq: boundary,
    });
    return { bodyText: JSON.stringify(body), target };
  }

  // A target that has never established a freshness boundary in this runner
  // should not send with boundary=0 and let the server hold the entire
  // historical DM/channel. Project a bounded context window into the single
  // agent inbox instead:
  // the CLI receives a held response, saves the local draft, and the displayed
  // context advances the runner boundary before any subsequent send-draft.
  const recent = await loadRecentTargetMessages(registration, headers, target);
  if (recent.length > 0) {
    const seenUpToSeq = maxMessageSeq(recent);
    coordinator.consumeVisibleMessages({ target, messages: recent, boundarySeq: seenUpToSeq, source: "side_effect_preflight_context" });
    recordFreshnessDecision(coordinator, {
      action,
      decision: "syncing_hold",
      target,
      inboxTrustState: "untrusted",
      reason: "target_first_touch_recent_context",
      pendingCount: 0,
      pendingMaxSeq: seenUpToSeq,
      modelSeenSeq: 0,
      heldMessageCount: recent.length,
      omittedMessageCount: 0,
    });
    return {
      bodyText: JSON.stringify(body),
      target,
      localResponse: {
        state: "held",
        outcome: "held",
        subtype: "freshness",
        reason: "newer_messages_available",
        available_actions: heldAvailableActions(action),
        seenUpToSeq,
        heldMessages: recent,
        newMessageCount: recent.length,
        shownMessageCount: recent.length,
        omittedMessageCount: 0,
      },
    };
  }

  recordFreshnessDecision(coordinator, {
    action,
    decision: "forward",
    target,
    inboxTrustState: "trusted",
    reason: "no_exact_target_pending_or_recent_context",
    pendingCount: 0,
    modelSeenSeq: 0,
  });
  return { bodyText: JSON.stringify(body), target };
}

function shouldBufferJsonResponse(upstream: Response, pathname: string, registration: ProxyRegistration): boolean {
  if (!registration.inboxCoordinator) return false;
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return false;
  return pathname === "/internal/agent-api/send" ||
    pathname === "/internal/agent-api/events" ||
    pathname === "/internal/agent-api/history";
}

function consumeVisibleResponse(
  registration: ProxyRegistration,
  targetUrl: URL,
  sendTarget: string | undefined,
  responseText: string,
): void {
  const coordinator = registration.inboxCoordinator;
  if (!coordinator) return;
  let parsed: {
    state?: string;
    seenUpToSeq?: number;
    messageId?: string;
    messageSeq?: number;
    heldMessages?: AgentProxyVisibleMessage[];
    events?: AgentProxyVisibleMessage[];
    messages?: AgentProxyVisibleMessage[];
  };
  try {
    parsed = JSON.parse(responseText) as typeof parsed;
  } catch {
    return;
  }
  if (targetUrl.pathname === "/internal/agent-api/send" && parsed.state === "held" && Array.isArray(parsed.heldMessages)) {
    coordinator.consumeVisibleMessages({
      target: sendTarget,
      messages: normalizeVisibleMessages(parsed.heldMessages, sendTarget),
      boundarySeq: typeof parsed.seenUpToSeq === "number" ? parsed.seenUpToSeq : undefined,
      source: "server_held_context",
    });
    return;
  }
  if (targetUrl.pathname === "/internal/agent-api/send" && parsed.state === "sent") {
    const messageSeq = typeof parsed.messageSeq === "number" && Number.isFinite(parsed.messageSeq)
      ? Math.floor(parsed.messageSeq)
      : undefined;
    if (sendTarget && messageSeq && messageSeq > 0) {
      coordinator.consumeVisibleMessages({
        target: sendTarget,
        messages: normalizeVisibleMessages([{ seq: messageSeq, id: parsed.messageId }], sendTarget),
        boundarySeq: messageSeq,
        source: "agent_api_send_commit",
      });
    }
    return;
  }
  if (targetUrl.pathname === "/internal/agent-api/events" && Array.isArray(parsed.events)) {
    const messages = normalizeVisibleMessages(parsed.events);
    coordinator.consumeVisibleMessages({ messages, source: "agent_api_events" });
    coordinator.recordDrainOutcome?.({
      source: "server_events",
      sinceCursorKind: parseAgentApiEventsQuery(targetUrl).sinceCursorKind,
      notifiedCount: 0,
      drainedCount: messages.length,
      hasMore: Boolean((parsed as { has_more?: unknown }).has_more),
    });
    return;
  }
  if (targetUrl.pathname === "/internal/agent-api/history" && Array.isArray(parsed.messages)) {
    const target = targetUrl.searchParams.get("channel") ?? undefined;
    const messages = normalizeVisibleMessages(parsed.messages, target);
    coordinator.consumeVisibleMessages({ target, messages, boundarySeq: maxMessageSeq(messages), source: "agent_api_history" });
  }
}

export async function registerAgentCredentialProxy(input: {
  agentId: string;
  launchId?: string | null;
  serverUrl: string;
  apiKey: string;
  activeCapabilities: string;
  inboxCoordinator?: AgentProxyInboxCoordinator;
}): Promise<ProxyHandle> {
  const server = await ensureServer();
  const proxyToken = `sap_${randomBytes(32).toString("base64url")}`;
  registrations.set(proxyToken, {
    serverUrl: input.serverUrl,
    apiKey: input.apiKey,
    agentId: input.agentId,
    launchId: input.launchId ?? null,
    activeCapabilities: input.activeCapabilities,
    inboxCoordinator: input.inboxCoordinator,
  });
  return {
    proxyUrl: server.proxyUrl,
    proxyToken,
  };
}

export function unregisterAgentCredentialProxyForLaunch(input: {
  agentId: string;
  launchId?: string | null;
}): number {
  let removed = 0;
  const launchId = input.launchId ?? null;
  for (const [token, registration] of registrations) {
    if (registration.agentId === input.agentId && registration.launchId === launchId) {
      registrations.delete(token);
      removed += 1;
    }
  }
  return removed;
}
