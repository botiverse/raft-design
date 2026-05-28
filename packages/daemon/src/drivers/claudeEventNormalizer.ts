import type { ParsedEvent } from "./types.js";

function collectResultErrorDetail(message: Record<string, any>, fallback: string): string {
  const parts: string[] = [];
  if (Array.isArray(message.errors)) {
    for (const err of message.errors) {
      if (typeof err === "string" && err.trim()) parts.push(err.trim());
    }
  }
  if (typeof message.result === "string" && message.result.trim()) {
    parts.push(message.result.trim());
  }
  return parts.join(" | ") || fallback;
}

function isProviderApiFailureText(value: string, hasToolUse: boolean): boolean {
  return !hasToolUse
    && /^\s*API Error:/i.test(value)
    && (
      /\b(?:ECONNRESET|EPIPE|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EAI_AGAIN)\b/i.test(value)
      || /\bUnable to connect to API\b/i.test(value)
      || /\b(?:timed out|timeout)\b/i.test(value)
      || /\b5\d{2}\b/.test(value)
    );
}

export class ClaudeEventNormalizer {
  normalizeLine(line: string): ParsedEvent[] {
    let event: any;
    try {
      event = JSON.parse(line);
    } catch {
      return [];
    }

    const events: ParsedEvent[] = [];

    const pushResultError = (message: Record<string, any>, fallback: string) => {
      events.push({ kind: "error", message: collectResultErrorDetail(message, fallback) });
    };

    switch (event.type) {
      case "system":
        if (event.subtype === "init" && event.session_id) {
          events.push({ kind: "session_init", sessionId: event.session_id });
        }
        // Black-box Claude CLI evidence on 2.1.107 emits:
        // - { type: "system", subtype: "status", status: "compacting" }
        // - { type: "system", subtype: "compact_boundary", ... }
        // We keep the parser narrow to those live-stream seams to avoid
        // double-emitting finish events from intermediate status updates.
        if (event.subtype === "status" && event.status === "compacting") {
          events.push({ kind: "compaction_started" });
        }
        if (event.subtype === "status" && event.status === "requesting") {
          events.push({
            kind: "internal_progress",
            source: "claude_system_status",
            itemType: "requesting",
            payloadBytes: Buffer.byteLength(line, "utf8"),
          });
        }
        if (event.subtype === "compact_boundary") {
          events.push({ kind: "compaction_finished" });
        }
        break;

      case "stream_event":
        events.push({
          kind: "internal_progress",
          source: "claude_stream_event",
          itemType: typeof event.event?.type === "string" && event.event.type.length > 0
            ? event.event.type
            : "unknown",
          payloadBytes: Buffer.byteLength(line, "utf8"),
        });
        break;

      case "assistant": {
        const content = event.message?.content;
        if (Array.isArray(content)) {
          const hasToolUse = content.some((block) => block?.type === "tool_use");
          for (const block of content) {
            if (block.type === "thinking" && block.thinking) {
              events.push({ kind: "thinking", text: block.thinking });
            } else if (block.type === "text" && block.text) {
              if (isProviderApiFailureText(block.text, hasToolUse)) {
                events.push({ kind: "error", message: block.text });
              } else {
                events.push({ kind: "text", text: block.text });
              }
            } else if (block.type === "tool_use") {
              events.push({ kind: "tool_call", name: block.name || "unknown_tool", input: block.input });
            }
          }
        }
        break;
      }

      case "user": {
        const content = event.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === "tool_result") {
              events.push({ kind: "tool_output", name: block.name || block.tool_use_id || "tool_result" });
            }
          }
        }
        break;
      }

      case "result": {
        const subtype = typeof event.subtype === "string" ? event.subtype : "success";
        const stopReason = typeof event.stop_reason === "string" ? event.stop_reason : null;

        switch (subtype) {
          case "success":
            if (event.is_error && stopReason !== "max_tokens") {
              pushResultError(event, "Execution failed");
            }
            break;

          case "error_during_execution":
            if (stopReason !== "max_tokens") {
              pushResultError(event, "Execution failed");
            }
            break;

          case "error_max_budget_usd":
            pushResultError(event, "Budget limit exceeded");
            break;

          case "error_max_turns":
            pushResultError(event, "Max turns exceeded");
            break;

          case "error_max_structured_output_retries":
            pushResultError(event, "Structured output retries exceeded");
            break;
        }
        events.push({ kind: "turn_end", sessionId: event.session_id });
        break;
      }
    }

    return events;
  }
}
