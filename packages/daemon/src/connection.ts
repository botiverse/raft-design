import WebSocket from "ws";
import type { ServerToMachineMessage, MachineToServerMessage, TraceStatus } from "@slock-ai/shared";
import { logger } from "./logger.js";
import { buildWebSocketOptions } from "./proxy.js";

type WebSocketOptions = import("ws").ClientOptions;

export interface Clock {
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(timer: unknown): void;
}

export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  terminate(): void;
  on(event: "open", listener: () => void): unknown;
  on(event: "message", listener: (data: Buffer) => void): unknown;
  on(event: "close", listener: (code: number, reasonBuffer: Buffer) => void): unknown;
  on(event: "error", listener: (err: Error) => void): unknown;
}

export const systemClock: Clock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
};

export interface ConnectionOptions {
  serverUrl: string;
  apiKey: string;
  onMessage: (msg: ServerToMachineMessage) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onTraceEvent?: (name: string, attrs?: Record<string, unknown>, status?: TraceStatus) => void;
  /** Override inbound watchdog timeout for testing. Default: 70_000 ms. */
  inboundWatchdogMs?: number;
  /** Override minimum reconnect delay for testing. Default: 1_000 ms. */
  minReconnectDelayMs?: number;
  /** Override WebSocket constructor for testing. Default: ws.WebSocket. */
  wsFactory?: (url: string, options?: WebSocketOptions) => WebSocketLike;
  /** Override proxy env resolution for testing. Default: process.env. */
  proxyEnv?: NodeJS.ProcessEnv;
  /** Override clock / timer primitives for deterministic tests. */
  clock?: Clock;
}

// The server sends a ping every 30 s. If the daemon receives nothing for
// INBOUND_WATCHDOG_MS it assumes the connection is black-holed and forces a
// TCP-level reset so the normal reconnect logic can take over.
const INBOUND_WATCHDOG_MS = 70_000;

function durationMsBucket(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return "unknown";
  if (ms === 0) return "0";
  if (ms <= 1_000) return "1s";
  if (ms <= 10_000) return "1s-10s";
  if (ms <= 30_000) return "10s-30s";
  if (ms <= 60_000) return "30s-60s";
  if (ms <= 120_000) return "60s-120s";
  return "120s+";
}

export class DaemonConnection {
  private ws: WebSocketLike | null = null;
  private options: ConnectionOptions;
  private readonly clock: Clock;
  private reconnectTimer: unknown = null;
  private watchdogTimer: unknown = null;
  private reconnectDelay: number;
  private readonly maxReconnectDelay = 30000;
  private shouldConnect = true;
  private reconnectAttempt = 0;
  private lastDroppedSendLogAt = 0;
  private lastInboundAt: number | null = null;
  private lastInboundMessageKind: string | null = null;

  constructor(options: ConnectionOptions) {
    this.options = options;
    this.clock = options.clock ?? systemClock;
    this.reconnectDelay = options.minReconnectDelayMs ?? 1000;
  }

  connect() {
    this.shouldConnect = true;
    if (this.reconnectTimer) return;
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) return;
    this.doConnect();
  }

  disconnect() {
    this.shouldConnect = false;
    this.clearWatchdog();
    if (this.reconnectTimer) {
      this.clock.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      logger.info("[Daemon] Disconnect requested");
      this.ws.close();
      this.ws = null;
    }
  }

  send(msg: MachineToServerMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return;
    }

    const now = this.clock.now();
    if (now - this.lastDroppedSendLogAt > 5000) {
      this.lastDroppedSendLogAt = now;
      logger.warn(`[Daemon] Dropping outbound message while disconnected: ${msg.type}`);
    }
    this.trace("daemon.connection.outbound_dropped", {
      message_type: msg.type,
      ws_ready_state: this.ws?.readyState ?? null,
    });
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private doConnect() {
    if (!this.shouldConnect) return;
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) return;

    const wsUrl = this.options.serverUrl.replace(/^http/, "ws") + `/daemon/connect?key=${this.options.apiKey}`;
    const wsOptions = buildWebSocketOptions(wsUrl, this.options.proxyEnv ?? process.env);

    logger.info(`[Daemon] Connecting to ${this.options.serverUrl}...`);
    if (wsOptions?.agent) {
      logger.info("[Daemon] Using configured proxy for WebSocket connection");
    }
    this.trace("daemon.connection.connecting", {
      reconnect_attempt: this.reconnectAttempt,
      server_url_present: Boolean(this.options.serverUrl),
      proxy_present: Boolean(wsOptions?.agent),
    });

    const ws: WebSocketLike = this.options.wsFactory ? this.options.wsFactory(wsUrl, wsOptions) : new WebSocket(wsUrl, wsOptions);
    this.ws = ws;

    ws.on("open", () => {
      if (this.ws !== ws) return;
      if (!this.shouldConnect) return; // disconnect() was called before open fired
      logger.info("[Daemon] Connected to server");
      const priorReconnectAttempt = this.reconnectAttempt;
      this.reconnectAttempt = 0;
      this.reconnectDelay = this.options.minReconnectDelayMs ?? 1000; // Reset backoff
      this.markInbound("websocket_open");
      this.resetWatchdog();
      this.trace("daemon.connection.connected", {
        reconnect_attempt: priorReconnectAttempt,
        inbound_watchdog_ms: this.options.inboundWatchdogMs ?? INBOUND_WATCHDOG_MS,
      });
      this.options.onConnect();
    });

    ws.on("message", (data: Buffer) => {
      if (this.ws !== ws) return;
      let messageKind = "unknown";
      try {
        const msg: ServerToMachineMessage = JSON.parse(data.toString());
        messageKind = msg.type;
        this.markInbound(messageKind);
        this.resetWatchdog();
        if (messageKind !== "ping") {
          this.trace("daemon.connection.inbound_received", {
            message_type: messageKind,
            last_inbound_age_ms_bucket: "0",
          });
        }
        this.options.onMessage(msg);
      } catch (err) {
        this.markInbound("invalid_json");
        this.resetWatchdog();
        logger.error("[Daemon] Invalid message from server", err);
        this.trace("daemon.connection.invalid_message", {
          error_class: err instanceof Error ? err.name : typeof err,
          last_inbound_message_kind: "invalid_json",
        }, "error");
      }
    });

    ws.on("close", (code, reasonBuffer) => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.clearWatchdog();
      const reason = reasonBuffer.toString("utf8");
      logger.warn(
        `[Daemon] Disconnected from server (code=${code}, reason=${JSON.stringify(reason)}, reconnecting=${this.shouldConnect})`,
      );
      this.trace("daemon.connection.disconnected", {
        close_code: code,
        close_reason_present: Boolean(reason),
        reconnecting: this.shouldConnect,
        reconnect_attempt: this.reconnectAttempt,
        last_inbound_message_kind: this.lastInboundMessageKind,
        last_inbound_age_ms_bucket: this.lastInboundAgeBucket(),
      }, this.shouldConnect ? "cancelled" : "ok");
      this.options.onDisconnect();
      this.scheduleReconnect();
    });

    ws.on("error", (err) => {
      if (this.ws !== ws) return;
      logger.error(`[Daemon] WebSocket error: ${err.message}`);
      this.trace("daemon.connection.error", {
        error_class: err.name || "Error",
      }, "error");
      // 'close' will fire after this
    });
  }

  private scheduleReconnect() {
    if (!this.shouldConnect) return;
    if (this.reconnectTimer) return;

    this.reconnectAttempt += 1;
    logger.info(`[Daemon] Reconnecting to server in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempt})`);
    this.trace("daemon.connection.reconnect_scheduled", {
      reconnect_attempt: this.reconnectAttempt,
      delay_ms: this.reconnectDelay,
    });
    this.reconnectTimer = this.clock.setTimeout(() => {
      this.reconnectTimer = null;
      this.doConnect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  private resetWatchdog() {
    this.clearWatchdog();
    const ms = this.options.inboundWatchdogMs ?? INBOUND_WATCHDOG_MS;
    this.watchdogTimer = this.clock.setTimeout(() => {
      logger.warn(`[Daemon] No inbound traffic for ${ms / 1000}s — forcing reconnect`);
      this.trace("daemon.connection.watchdog_timeout", {
        inbound_watchdog_ms: ms,
        last_inbound_message_kind: this.lastInboundMessageKind,
        last_inbound_age_ms_bucket: this.lastInboundAgeBucket(),
        ws_ready_state: this.ws?.readyState ?? null,
        reconnecting: this.shouldConnect,
      }, "error");
      try { this.ws?.terminate(); } catch { /* ignore */ }
      // The close event will fire and scheduleReconnect() will run.
    }, ms);
  }

  private clearWatchdog() {
    if (this.watchdogTimer) {
      this.clock.clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private markInbound(messageKind: string) {
    this.lastInboundAt = this.clock.now();
    this.lastInboundMessageKind = messageKind;
  }

  private lastInboundAgeBucket(): string {
    return durationMsBucket(this.lastInboundAt == null ? null : this.clock.now() - this.lastInboundAt);
  }

  private trace(name: string, attrs?: Record<string, unknown>, status: TraceStatus = "ok") {
    this.options.onTraceEvent?.(name, attrs, status);
  }
}

export { buildWebSocketOptions };
