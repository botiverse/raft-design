import { createHash } from "node:crypto";

const MAX_RUNTIME_ERROR_MESSAGE_EXCERPT_CHARS = 4096;
const RUNTIME_AUTH_ACTION_REQUIRED_PATTERNS: RegExp[] = [
  /access token could not be refreshed/i,
  /refresh token was already used/i,
  /authentication token has been invalidated/i,
  /logged out or signed in to another account/i,
  /not logged in/i,
  /not signed in/i,
  /login required/i,
  /log in first/i,
  /please log in/i,
  /authentication failed/i,
  /auth(?:entication)? failed/i,
  /authentication timed out/i,
  /missing (?:api )?token/i,
  /no (?:api )?token/i,
  /missing credentials/i,
  /credentials? not found/i,
  /invalid api key/i,
  /api key (?:is )?not set/i,
];

export interface RuntimeErrorDiagnosticEnvelope {
  spanAttrs: Record<string, unknown>;
  eventAttrs: Record<string, unknown>;
}

export function buildRuntimeErrorDiagnosticEnvelope(message: string): RuntimeErrorDiagnosticEnvelope {
  const rawMessage = String(message || "");
  const scrubbed = scrubRuntimeErrorDiagnosticText(rawMessage);
  const { value: excerpt, truncated } = truncateDiagnosticText(scrubbed, MAX_RUNTIME_ERROR_MESSAGE_EXCERPT_CHARS);
  const httpStatus = extractHttpStatus(rawMessage);
  const runtimeErrorClass = classifyRuntimeError(rawMessage, httpStatus);
  const runtimeErrorReason = classifyRuntimeErrorReason(runtimeErrorClass);
  const runtimeErrorAction = classifyRuntimeErrorAction(rawMessage, runtimeErrorClass);
  const fingerprint = fingerprintRuntimeError(scrubbed);
  const spanAttrs: Record<string, unknown> = {
    turn_outcome: "failed",
    turn_subtype: "runtime_error",
    turn_reason: runtimeErrorReason,
    runtime_error_class: runtimeErrorClass,
    runtime_error_action: runtimeErrorAction,
    runtime_error_action_required: runtimeErrorAction !== "none",
    runtime_error_fingerprint: fingerprint,
    runtime_error_message_present: rawMessage.length > 0,
    runtime_error_message_length_bucket: bucketLength(rawMessage.length),
    runtime_error_message_truncated: truncated,
  };
  if (httpStatus !== null) {
    spanAttrs.runtime_error_http_status = httpStatus;
  }

  return {
    spanAttrs,
    eventAttrs: {
      ...spanAttrs,
      runtime_error_message_excerpt: excerpt,
    },
  };
}

export function formatRuntimeLoginRequiredMessage(runtimeId: string): string {
  const runtimeLabel = runtimeDisplayName(runtimeId);
  return `${runtimeLabel} is not logged in on this machine. Please log in to ${runtimeLabel} locally, then retry starting this agent.`;
}

export function formatRuntimeStartTimeoutMessage(runtimeId: string): string {
  const runtimeLabel = runtimeDisplayName(runtimeId);
  return `${runtimeLabel} did not finish starting on this machine. Check that ${runtimeLabel} is installed, logged in, and can run non-interactively, then retry starting this agent.`;
}

export function scrubRuntimeErrorDiagnosticText(value: string): string {
  return value
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer [REDACTED_TOKEN]")
    .replace(/\b(?:sk|sk-ant|sk-proj|xox[baprs]?)-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_TOKEN]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[REDACTED_EMAIL]")
    .replace(/https?:\/\/[^\s"'<>]+/gi, (url) => redactUrlQuery(url))
    .replace(/\/Users\/[^\s"'<>:]+(?:\/[^\s"'<>:]+)*/g, "[REDACTED_PATH]")
    .replace(/\/home\/[^\s"'<>:]+(?:\/[^\s"'<>:]+)*/g, "[REDACTED_PATH]")
    .replace(/[A-Za-z]:\\Users\\[^\s"'<>:]+(?:\\[^\s"'<>:]+)*/g, "[REDACTED_PATH]");
}

function truncateDiagnosticText(value: string, maxChars: number): { value: string; truncated: boolean } {
  if (value.length <= maxChars) return { value, truncated: false };
  return { value: value.slice(0, maxChars), truncated: true };
}

function extractHttpStatus(message: string): number | null {
  const match = /\b(?:HTTP|status(?:\s+code)?|API\s+Error)[:\s]+([45]\d{2})\b/i.exec(message)
    ?? /\b([45]\d{2})\s+(?:Bad Request|Unauthorized|Forbidden|Not Found|Conflict|Too Many Requests|Internal Server Error|Service Unavailable)\b/i.exec(message);
  if (!match) return null;
  const status = Number(match[1]);
  return Number.isInteger(status) ? status : null;
}

function classifyRuntimeError(message: string, httpStatus: number | null): string {
  const explicit = /\b([A-Z][A-Za-z0-9_]*(?:Error|Exception))\b/.exec(message);
  if (explicit) return explicit[1];
  if (httpStatus !== null) {
    if (httpStatus === 429) return "RateLimitError";
    if (httpStatus === 401 || httpStatus === 403) return "AuthError";
    if (httpStatus === 404) return "NotFoundError";
    if (httpStatus >= 500) return "ProviderServerError";
    return "ProviderApiError";
  }
  if (isRuntimeAuthActionRequiredText(message)) return "AuthError";
  if (/\b(?:ETIMEDOUT|timeout|timed out)\b/i.test(message)) return "TimeoutError";
  if (
    /\b(?:ECONNRESET|EPIPE|ECONNREFUSED|ENOTFOUND|EAI_AGAIN)\b/i.test(message)
    || /\bUnable to connect to API\b/i.test(message)
  ) {
    return "ProviderConnectionError";
  }
  if (/stream closed before response\.completed|error decoding response body/i.test(message)) return "ProviderStreamError";
  if (/\brate.?limit|too many requests\b/i.test(message)) return "RateLimitError";
  if (/\bnot found\b/i.test(message)) return "NotFoundError";
  return "RuntimeError";
}

function classifyRuntimeErrorAction(message: string, runtimeErrorClass: string): "none" | "user_reauth" {
  if (runtimeErrorClass === "AuthError" && isRuntimeAuthActionRequiredText(message)) {
    return "user_reauth";
  }
  return "none";
}

function isRuntimeAuthActionRequiredText(text: string): boolean {
  return RUNTIME_AUTH_ACTION_REQUIRED_PATTERNS.some((pattern) => pattern.test(text));
}

function classifyRuntimeErrorReason(runtimeErrorClass: string): string {
  switch (runtimeErrorClass) {
    case "ProviderConnectionError":
      return "provider_connection_error";
    case "TimeoutError":
      return "provider_timeout";
    case "ProviderStreamError":
      return "provider_stream_error";
    case "RateLimitError":
      return "rate_limited";
    case "AuthError":
      return "auth_failed";
    case "NotFoundError":
      return "not_found";
    case "ProviderServerError":
      return "provider_server_error";
    case "ProviderApiError":
      return "provider_api_error";
    default:
      return "unclassified_runtime_error";
  }
}

function runtimeDisplayName(runtimeId: string): string {
  switch (runtimeId) {
    case "antigravity":
      return "Antigravity CLI";
    case "claude":
      return "Claude Code";
    case "codex":
      return "Codex";
    case "copilot":
      return "GitHub Copilot CLI";
    case "cursor":
      return "Cursor CLI";
    case "gemini":
      return "Gemini CLI";
    case "kimi":
      return "Kimi CLI";
    case "opencode":
      return "OpenCode";
    default:
      return runtimeId || "This runtime";
  }
}

function fingerprintRuntimeError(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[0-9a-f]{12,}/g, "<hex>")
    .replace(/\b\d+\b/g, "<num>")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

function bucketLength(length: number): string {
  if (length === 0) return "0";
  if (length < 1024) return "<1k";
  if (length < 4096) return "1k-4k";
  if (length < 16384) return "4k-16k";
  return "16k+";
}

function redactUrlQuery(value: string): string {
  try {
    const url = new URL(value);
    if (url.search) url.search = "?[REDACTED_QUERY]";
    if (url.username) url.username = "[REDACTED_USER]";
    if (url.password) url.password = "[REDACTED_PASSWORD]";
    return url.toString();
  } catch {
    return value.replace(/\?.*$/, "?[REDACTED_QUERY]");
  }
}
