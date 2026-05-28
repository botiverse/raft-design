import type { ParsedEvent } from "./types.js";
import { RuntimeTurnState } from "../runtimeTurnState.js";
import { parseCodexTelemetryEvent } from "./codexTelemetrySidecar.js";

export type JsonRpcId = number | string;

export interface JsonRpcMessage {
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, any>;
  result?: Record<string, any>;
  error?: { message?: string };
}

export interface CodexEventNormalizerResult {
  events: ParsedEvent[];
  threadReady?: string;
}

export function parseCodexJsonRpcLine(line: string): JsonRpcMessage | null {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function getCodexNotificationErrorMessage(params: Record<string, any> | undefined): string | null {
  const topLevelMessage = params?.message;
  if (typeof topLevelMessage === "string" && topLevelMessage.trim()) {
    return topLevelMessage;
  }

  const nestedMessage = params?.error?.message;
  if (typeof nestedMessage === "string" && nestedMessage.trim()) {
    return nestedMessage;
  }

  return null;
}

function joinReasoningText(item: Record<string, any>): string {
  const summary = Array.isArray(item.summary) ? item.summary.filter((entry) => typeof entry === "string") : [];
  const content = Array.isArray(item.content) ? item.content.filter((entry) => typeof entry === "string") : [];
  return [...summary, ...content].join("\n").trim();
}

function rawResponseItemProgressEvent(message: JsonRpcMessage): ParsedEvent | null {
  if (message.method !== "rawResponseItem/completed") return null;
  const item = message.params?.item ?? message.params?.responseItem ?? message.params?.rawItem ?? message.params;
  if (!item || typeof item !== "object") return null;

  const itemType = typeof item.type === "string" ? item.type : undefined;
  let payloadBytes: number | undefined;
  try {
    payloadBytes = Buffer.byteLength(JSON.stringify(item), "utf8");
  } catch {
    payloadBytes = undefined;
  }

  return {
    kind: "internal_progress",
    source: "codex_raw_response_item",
    itemType,
    payloadBytes,
  };
}

export class CodexEventNormalizer {
  private mcpToolPrefix: string;
  private currentThreadId: string | null = null;
  private sessionAnnounced = false;
  private streamedAgentMessageIds = new Set<string>();
  private streamedReasoningIds = new Set<string>();
  private turnState = new RuntimeTurnState();

  constructor(opts: { mcpToolPrefix: string }) {
    this.mcpToolPrefix = opts.mcpToolPrefix;
  }

  reset(opts: { threadId?: string | null } = {}) {
    this.currentThreadId = opts.threadId ?? null;
    this.turnState.reset();
    this.sessionAnnounced = false;
    this.streamedAgentMessageIds.clear();
    this.streamedReasoningIds.clear();
  }

  get threadId(): string | null {
    return this.currentThreadId;
  }

  get activeTurnId(): string | null {
    return this.turnState.activeTurnId;
  }

  get canSteerBusy(): boolean {
    return this.turnState.canSteerBusy;
  }

  adoptThreadId(threadId: string) {
    this.currentThreadId = threadId;
  }

  normalizeMessage(message: JsonRpcMessage): CodexEventNormalizerResult {
    const events: ParsedEvent[] = [];

    if (message.result) {
      const thread = message.result.thread;
      if (thread && typeof thread.id === "string") {
        return this.handleThreadReady(thread.id, events);
      }

      const turn = message.result.turn;
      if (turn && typeof turn.id === "string") {
        this.turnState.adoptTurnId(turn.id);
        return { events };
      }

      if (typeof message.result.turnId === "string") {
        this.turnState.adoptTurnId(message.result.turnId);
        return { events };
      }
    }

    if (message.error) {
      events.push({ kind: "error", message: message.error.message || "Codex app-server request failed" });
      return { events };
    }

    const telemetry = parseCodexTelemetryEvent(message);
    if (telemetry) {
      events.push(telemetry);
      return { events };
    }

    const rawProgress = rawResponseItemProgressEvent(message);
    if (rawProgress) {
      events.push(rawProgress);
      return { events };
    }

    switch (message.method) {
      case "thread/started": {
        const threadId = message.params?.thread?.id;
        if (typeof threadId === "string") {
          return this.handleThreadReady(threadId, events);
        }
        break;
      }

      case "turn/started": {
        const turnId = message.params?.turn?.id;
        this.turnState.markTurnStarted(typeof turnId === "string" ? turnId : null);
        events.push({ kind: "thinking", text: "" });
        break;
      }

      case "item/agentMessage/delta": {
        const delta = message.params?.delta;
        const itemId = message.params?.itemId;
        if (typeof itemId === "string") {
          this.streamedAgentMessageIds.add(itemId);
        }
        if (typeof delta === "string" && delta.length > 0) {
          this.turnState.markProgress();
          events.push({ kind: "text", text: delta });
        }
        break;
      }

      case "item/reasoning/summaryTextDelta":
      case "item/reasoning/textDelta": {
        const delta = message.params?.delta;
        const itemId = message.params?.itemId;
        if (typeof itemId === "string") {
          this.streamedReasoningIds.add(itemId);
        }
        if (typeof delta === "string" && delta.length > 0) {
          this.turnState.markProgress();
          events.push({ kind: "thinking", text: delta });
        }
        break;
      }

      case "item/started":
      case "item/completed": {
        const item = message.params?.item;
        if (!item || typeof item !== "object" || typeof item.type !== "string") break;
        const itemType = item.type;
        const isStarted = message.method === "item/started";
        const isCompleted = message.method === "item/completed";

        switch (itemType) {
          case "reasoning":
            if (isCompleted && typeof item.id === "string" && !this.streamedReasoningIds.has(item.id)) {
              const text = joinReasoningText(item);
              if (text) {
                this.turnState.markProgress();
                events.push({ kind: "thinking", text });
              }
            }
            if (isCompleted && typeof item.id === "string") {
              this.streamedReasoningIds.delete(item.id);
            }
            break;

          case "agentMessage":
            if (isCompleted && typeof item.id === "string" && !this.streamedAgentMessageIds.has(item.id) && typeof item.text === "string" && item.text.length > 0) {
              this.turnState.markProgress();
              events.push({ kind: "text", text: item.text });
            }
            if (isCompleted && typeof item.id === "string") {
              this.streamedAgentMessageIds.delete(item.id);
            }
            break;

          case "commandExecution":
            if (isStarted && typeof item.command === "string") {
              events.push({ kind: "tool_call", name: "shell", input: { command: item.command } });
            }
            if (isCompleted) {
              events.push({ kind: "tool_output", name: "shell" });
              this.turnState.markToolBoundary();
            }
            break;

          case "contextCompaction":
            if (isStarted) {
              events.push({ kind: "compaction_started" });
            }
            if (isCompleted) {
              events.push({ kind: "compaction_finished" });
            }
            break;

          case "fileChange":
            if (isStarted && Array.isArray(item.changes)) {
              for (const change of item.changes) {
                events.push({
                  kind: "tool_call",
                  name: "file_change",
                  input: { path: change?.path, kind: change?.kind },
                });
              }
            }
            break;

          case "mcpToolCall":
            if (isStarted) {
              const toolName = item.server === "chat"
                ? `${this.mcpToolPrefix}${item.tool}`
                : `${this.mcpToolPrefix.replace(/_$/, "")}_${item.server}_${item.tool}`;
              events.push({ kind: "tool_call", name: toolName, input: item.arguments });
            }
            if (isCompleted) {
              const toolName = item.server === "chat"
                ? `${this.mcpToolPrefix}${item.tool}`
                : `${this.mcpToolPrefix.replace(/_$/, "")}_${item.server}_${item.tool}`;
              events.push({ kind: "tool_output", name: toolName });
              this.turnState.markToolBoundary();
            }
            break;

          case "collabAgentToolCall":
            if (isStarted) {
              events.push({ kind: "tool_call", name: "collab_tool_call", input: { tool: item.tool, prompt: item.prompt } });
            }
            if (isCompleted) {
              this.turnState.markToolBoundary();
            }
            break;

          case "webSearch":
            if (isStarted) {
              events.push({ kind: "tool_call", name: "web_search", input: { query: item.query } });
            }
            if (isCompleted) {
              this.turnState.markToolBoundary();
            }
            break;
        }
        break;
      }

      case "turn/completed": {
        const turn = message.params?.turn;
        if (turn?.status === "failed" && turn?.error?.message) {
          events.push({ kind: "error", message: turn.error.message });
        }
        this.turnState.markTurnCompleted();
        this.streamedAgentMessageIds.clear();
        this.streamedReasoningIds.clear();
        events.push({ kind: "turn_end", sessionId: this.currentThreadId || undefined });
        break;
      }

      case "error":
        events.push({
          kind: "error",
          message: getCodexNotificationErrorMessage(message.params) || "Unknown Codex app-server error",
        });
        break;
    }

    return { events };
  }

  private handleThreadReady(threadId: string, events: ParsedEvent[]): CodexEventNormalizerResult {
    this.currentThreadId = threadId;
    if (!this.sessionAnnounced) {
      events.push({ kind: "session_init", sessionId: threadId });
      this.sessionAnnounced = true;
    }
    return { events, threadReady: threadId };
  }
}
