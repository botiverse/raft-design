import assert from "node:assert/strict";
import test from "node:test";
import { buildRuntimeErrorDiagnosticEnvelope, formatRuntimeLoginRequiredMessage, formatRuntimeStartTimeoutMessage } from "./runtimeErrorDiagnostics.js";

test("buildRuntimeErrorDiagnosticEnvelope classifies and bounds provider errors", () => {
  const envelope = buildRuntimeErrorDiagnosticEnvelope(
    "API Error: 400 Bad Request: Improperly formed request in /Users/alice/project/session.jsonl",
  );

  assert.equal(envelope.spanAttrs.runtime_error_class, "ProviderApiError");
  assert.equal(envelope.spanAttrs.runtime_error_http_status, 400);
  assert.equal(envelope.spanAttrs.runtime_error_message_present, true);
  assert.equal(envelope.spanAttrs.runtime_error_message_length_bucket, "<1k");
  assert.equal(envelope.spanAttrs.runtime_error_message_truncated, false);
  assert.equal(typeof envelope.spanAttrs.runtime_error_fingerprint, "string");
  assert.equal(envelope.eventAttrs.runtime_error_message_excerpt, "API Error: 400 Bad Request: Improperly formed request in [REDACTED_PATH]");
});

test("buildRuntimeErrorDiagnosticEnvelope redacts secrets and truncates long messages", () => {
  const envelope = buildRuntimeErrorDiagnosticEnvelope(
    [
      "ProviderModelNotFoundError: failed with Bearer abcdefghijklmnopqrstuvwxyz",
      "key sk-ant-1234567890abcdef",
      "email user@example.com",
      "url https://example.com/v1?api_key=secret",
      "body",
      "x".repeat(5000),
    ].join(" "),
  );

  assert.equal(envelope.spanAttrs.runtime_error_class, "ProviderModelNotFoundError");
  assert.equal(envelope.spanAttrs.turn_reason, "unclassified_runtime_error");
  assert.equal(envelope.spanAttrs.runtime_error_message_length_bucket, "4k-16k");
  assert.equal(envelope.spanAttrs.runtime_error_message_truncated, true);
  assert.equal(String(envelope.eventAttrs.runtime_error_message_excerpt).length, 4096);

  const excerpt = String(envelope.eventAttrs.runtime_error_message_excerpt);
  assert.equal(excerpt.includes("abcdefghijklmnopqrstuvwxyz"), false);
  assert.equal(excerpt.includes("sk-ant-1234567890abcdef"), false);
  assert.equal(excerpt.includes("user@example.com"), false);
  assert.match(excerpt, /Bearer \[REDACTED_TOKEN\]/);
  assert.match(excerpt, /\[REDACTED_TOKEN\]/);
  assert.match(excerpt, /\[REDACTED_EMAIL\]/);
  assert.match(excerpt, /\[REDACTED_QUERY\]|%5BREDACTED_QUERY%5D/);
});

test("buildRuntimeErrorDiagnosticEnvelope classifies provider stream failures", () => {
  const streamClosed = buildRuntimeErrorDiagnosticEnvelope("stream closed before response.completed");
  assert.equal(streamClosed.spanAttrs.runtime_error_class, "ProviderStreamError");
  assert.equal(streamClosed.spanAttrs.turn_reason, "provider_stream_error");

  const decodingFailure = buildRuntimeErrorDiagnosticEnvelope("error decoding response body");
  assert.equal(decodingFailure.spanAttrs.runtime_error_class, "ProviderStreamError");
  assert.equal(decodingFailure.spanAttrs.turn_reason, "provider_stream_error");
});

test("buildRuntimeErrorDiagnosticEnvelope classifies Codex OAuth invalidation as auth errors", () => {
  const refreshReuse = buildRuntimeErrorDiagnosticEnvelope(
    "Your access token could not be refreshed because your refresh token was already used. Please log out and sign in again.",
  );
  assert.equal(refreshReuse.spanAttrs.runtime_error_class, "AuthError");
  assert.equal(refreshReuse.spanAttrs.turn_reason, "auth_failed");
  assert.equal(refreshReuse.spanAttrs.runtime_error_action, "user_reauth");
  assert.equal(refreshReuse.spanAttrs.runtime_error_action_required, true);

  const invalidated = buildRuntimeErrorDiagnosticEnvelope(
    "unexpected status 401: Your authentication token has been invalidated.",
  );
  assert.equal(invalidated.spanAttrs.runtime_error_class, "AuthError");
  assert.equal(invalidated.spanAttrs.turn_reason, "auth_failed");
  assert.equal(invalidated.spanAttrs.runtime_error_http_status, 401);
  assert.equal(invalidated.spanAttrs.runtime_error_action, "user_reauth");
  assert.equal(invalidated.spanAttrs.runtime_error_action_required, true);
});

test("buildRuntimeErrorDiagnosticEnvelope classifies login-required runtime failures as auth action", () => {
  const notLoggedIn = buildRuntimeErrorDiagnosticEnvelope("Antigravity CLI is not logged in. Please log in first.");
  assert.equal(notLoggedIn.spanAttrs.runtime_error_class, "AuthError");
  assert.equal(notLoggedIn.spanAttrs.turn_reason, "auth_failed");
  assert.equal(notLoggedIn.spanAttrs.runtime_error_action, "user_reauth");
  assert.equal(notLoggedIn.spanAttrs.runtime_error_action_required, true);

  const missingToken = buildRuntimeErrorDiagnosticEnvelope("Authentication failed: missing API token");
  assert.equal(missingToken.spanAttrs.runtime_error_class, "AuthError");
  assert.equal(missingToken.spanAttrs.turn_reason, "auth_failed");
  assert.equal(missingToken.spanAttrs.runtime_error_action, "user_reauth");
  assert.equal(missingToken.spanAttrs.runtime_error_action_required, true);
});

test("buildRuntimeErrorDiagnosticEnvelope classifies provider connection failures", () => {
  const reset = buildRuntimeErrorDiagnosticEnvelope("API Error: Unable to connect to API (ECONNRESET)");
  assert.equal(reset.spanAttrs.runtime_error_class, "ProviderConnectionError");
  assert.equal(reset.spanAttrs.turn_outcome, "failed");
  assert.equal(reset.spanAttrs.turn_subtype, "runtime_error");
  assert.equal(reset.spanAttrs.turn_reason, "provider_connection_error");

  const refused = buildRuntimeErrorDiagnosticEnvelope("API Error: request failed with ECONNREFUSED");
  assert.equal(refused.spanAttrs.runtime_error_class, "ProviderConnectionError");
  assert.equal(refused.spanAttrs.turn_reason, "provider_connection_error");
});

test("buildRuntimeErrorDiagnosticEnvelope classifies provider timeout codes", () => {
  const timeout = buildRuntimeErrorDiagnosticEnvelope("API Error: model request failed with ETIMEDOUT");
  assert.equal(timeout.spanAttrs.runtime_error_class, "TimeoutError");
  assert.equal(timeout.spanAttrs.turn_reason, "provider_timeout");
});

test("formatRuntimeLoginRequiredMessage gives action-oriented runtime copy", () => {
  assert.equal(
    formatRuntimeLoginRequiredMessage("antigravity"),
    "Antigravity CLI is not logged in on this machine. Please log in to Antigravity CLI locally, then retry starting this agent.",
  );
  assert.equal(
    formatRuntimeLoginRequiredMessage("claude"),
    "Claude Code is not logged in on this machine. Please log in to Claude Code locally, then retry starting this agent.",
  );
});

test("formatRuntimeStartTimeoutMessage gives bounded-startup guidance", () => {
  assert.equal(
    formatRuntimeStartTimeoutMessage("gemini"),
    "Gemini CLI did not finish starting on this machine. Check that Gemini CLI is installed, logged in, and can run non-interactively, then retry starting this agent.",
  );
});
