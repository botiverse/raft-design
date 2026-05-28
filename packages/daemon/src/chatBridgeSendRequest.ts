import { createHash, randomUUID } from "node:crypto";
import { executeJsonRequest, DEFAULT_CHAT_BRIDGE_TOOL_TIMEOUT_MS } from "./chatBridgeRequest.js";
import { logger } from "./logger.js";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface ExecuteRetrySafeSendRequestOptions {
  fetchImpl: FetchLike;
  target: string;
  timeoutMs?: number;
  now?: () => number;
  warn?: (message: string) => void;
  idempotencyKey?: string;
  retryFingerprint?: string;
  retryFingerprintTtlMs?: number;
}

const DEFAULT_SEND_RETRY_FINGERPRINT_TTL_MS = 10 * 60 * 1000;

// Chat bridge processes are spawned per agent today. If this becomes
// multi-tenant, the fingerprint key must include agentId.
const ambiguousSendKeys = new Map<string, { idempotencyKey: string; expiresAt: number }>();

function pruneExpiredAmbiguousSendKeys(nowMs: number): void {
  for (const [fingerprint, entry] of ambiguousSendKeys) {
    if (entry.expiresAt <= nowMs) {
      ambiguousSendKeys.delete(fingerprint);
    }
  }
}

function resolveIdempotencyKey(opts: {
  idempotencyKey?: string;
  retryFingerprint?: string;
  retryFingerprintTtlMs: number;
  nowMs: number;
}): string {
  if (opts.idempotencyKey) return opts.idempotencyKey;
  if (!opts.retryFingerprint) return randomUUID();

  pruneExpiredAmbiguousSendKeys(opts.nowMs);
  const existing = ambiguousSendKeys.get(opts.retryFingerprint);
  if (existing && existing.expiresAt > opts.nowMs) {
    return existing.idempotencyKey;
  }

  return randomUUID();
}

function rememberAmbiguousSendKey(retryFingerprint: string | undefined, idempotencyKey: string, nowMs: number, ttlMs: number): void {
  if (!retryFingerprint) return;
  pruneExpiredAmbiguousSendKeys(nowMs);
  ambiguousSendKeys.set(retryFingerprint, {
    idempotencyKey,
    expiresAt: nowMs + ttlMs,
  });
}

function clearAmbiguousSendKey(retryFingerprint: string | undefined): void {
  if (!retryFingerprint) return;
  ambiguousSendKeys.delete(retryFingerprint);
}

export function buildSendRetryFingerprint(input: {
  target: string;
  content: string;
  attachmentIds?: string[];
}): string {
  const attachmentIds = input.attachmentIds ?? [];
  const hash = createHash("sha256")
    .update(JSON.stringify({
      target: input.target,
      content: input.content,
      attachmentIds,
    }))
    .digest("hex");
  return `send_message:${hash}`;
}

export async function executeRetrySafeSendRequest<T>(
  url: string,
  buildInit: (idempotencyKey: string) => RequestInit,
  {
    fetchImpl,
    target,
    timeoutMs = DEFAULT_CHAT_BRIDGE_TOOL_TIMEOUT_MS,
    now = () => Date.now(),
    warn = (message) => logger.warn(message),
    idempotencyKey: explicitIdempotencyKey,
    retryFingerprint,
    retryFingerprintTtlMs = DEFAULT_SEND_RETRY_FINGERPRINT_TTL_MS,
  }: ExecuteRetrySafeSendRequestOptions,
): Promise<{ response: Response; data: T; durationMs: number; idempotencyKey: string; attempts: number }> {
  let lastError: unknown;
  const idempotencyKey = resolveIdempotencyKey({
    idempotencyKey: explicitIdempotencyKey,
    retryFingerprint,
    retryFingerprintTtlMs,
    nowMs: now(),
  });

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const result = await executeJsonRequest<T>(
        url,
        buildInit(idempotencyKey),
        {
          toolName: "send_message",
          target,
          timeoutMs,
          fetchImpl,
          now,
          warn,
        },
      );
      clearAmbiguousSendKey(retryFingerprint);
      return {
        ...result,
        idempotencyKey,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
      warn(
        `[ChatBridgeRetry] tool=send_message target=${target} attempt=${attempt + 1} reason=${describeRetryReason(error)}`,
      );
    }
  }

  rememberAmbiguousSendKey(retryFingerprint, idempotencyKey, now(), retryFingerprintTtlMs);
  throw lastError;
}

export function __resetRetrySafeSendRequestStateForTest(): void {
  ambiguousSendKeys.clear();
}

function describeRetryReason(error: unknown): string {
  if (error && typeof error === "object" && "name" in error && (error as Error).name === "ChatBridgeToolTimeoutError") {
    return (error as Error).message;
  }
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}
