import path from "node:path";
import {
  DaemonCore,
  subscribeDaemonLogs,
  type DefaultAgentEnvVarsProvider,
  type DaemonCoreOptions,
  type DaemonLogEvent,
  type DaemonLogLevel,
} from "@slock-ai/daemon/core";
import type { ConnectedServer, LocalDaemonPhase, LocalDaemonRuntimeState } from "./model";
import { resolveDaemonApiBaseUrl } from "./serverBaseUrl";

export interface ManagedDaemonCore {
  start(): void;
  stop(): Promise<void>;
}

interface ActiveRuntime {
  serverId: string;
  core: ManagedDaemonCore;
  stopRequested: boolean;
  unsubscribeLogs: (() => void) | null;
}

export class DaemonRuntimeSupervisor {
  private activeRuntime: ActiveRuntime | null = null;
  private statuses = new Map<string, { phase: LocalDaemonPhase; message: string }>();

  constructor(
    private readonly options: {
      dataDirRoot: string;
      createCore?: (options: DaemonCoreOptions) => ManagedDaemonCore;
      onStatusChange?: (event: { serverId: string; phase: LocalDaemonPhase; message: string }) => void;
      onLog?: (event: { serverId: string; level: DaemonLogLevel; line: string }) => void;
      subscribeToLogs?: (listener: (event: DaemonLogEvent) => void) => (() => void);
      getMachineApiKey: (serverId: string) => Promise<string | null>;
      getDefaultAgentEnvVars?: DefaultAgentEnvVarsProvider;
    },
  ) {}

  async start(server: ConnectedServer): Promise<void> {
    const apiKey = await this.options.getMachineApiKey(server.id);
    if (!apiKey) {
      this.setStatus(server.id, "stopped", "Save a machine API key before starting the embedded daemon.");
      return;
    }

    if (this.activeRuntime && this.activeRuntime.serverId !== server.id) {
      await this.stop(this.activeRuntime.serverId);
    }

    if (this.activeRuntime?.serverId === server.id) {
      return;
    }

    this.setStatus(server.id, "starting", "Starting the embedded daemon runtime...");
    const subscribeToLogs = this.options.subscribeToLogs ?? subscribeDaemonLogs;
    const unsubscribeLogs = subscribeToLogs((event) => {
      if (this.activeRuntime?.serverId !== server.id) {
        return;
      }
      this.options.onLog?.({
        serverId: server.id,
        level: event.level,
        line: event.line,
      });
    });

    const createCore = this.options.createCore ?? ((coreOptions: DaemonCoreOptions) => new DaemonCore(coreOptions));
    const core = createCore({
      serverUrl: resolveDaemonApiBaseUrl(server.url),
      apiKey,
      dataDir: path.join(this.options.dataDirRoot, server.id),
      localTrace: true,
      defaultAgentEnvVarsProvider: this.options.getDefaultAgentEnvVars,
      lifecycleHooks: {
        onConnect: () => {
          this.setStatus(server.id, "running", "Embedded daemon connected.");
        },
        onDisconnect: () => {
          if (this.activeRuntime?.serverId === server.id && !this.activeRuntime.stopRequested) {
            this.setStatus(server.id, "reconnecting", "Connection lost; embedded daemon is reconnecting.");
          }
        },
      },
    });

    this.activeRuntime = {
      serverId: server.id,
      core,
      stopRequested: false,
      unsubscribeLogs,
    };
    core.start();
  }

  async stop(serverId: string): Promise<void> {
    if (!this.activeRuntime || this.activeRuntime.serverId !== serverId) {
      this.setStatus(serverId, "stopped", "Embedded daemon is not running.");
      return;
    }

    const runtime = this.activeRuntime;
    runtime.stopRequested = true;
    runtime.unsubscribeLogs?.();
    await runtime.core.stop();
    this.activeRuntime = null;
    this.setStatus(serverId, "stopped", "Embedded daemon stopped.");
  }

  async getRuntimeStates(
    servers: ConnectedServer[],
    hasMachineApiKey: (serverId: string) => Promise<boolean>,
  ): Promise<LocalDaemonRuntimeState[]> {
    return Promise.all(
      servers.map(async (server) => {
        const hasKey = await hasMachineApiKey(server.id);
        const status = this.statuses.get(server.id) ?? {
          phase: "stopped" as const,
          message: hasKey ? "Embedded daemon is not running." : "No machine API key is saved for this server.",
        };

        return {
          serverId: server.id,
          hasMachineApiKey: hasKey,
          phase: status.phase,
          message: status.message,
        };
      }),
    );
  }

  hasActiveRuntime(): boolean {
    return this.activeRuntime !== null;
  }

  getActiveServerId(): string | null {
    return this.activeRuntime?.serverId ?? null;
  }

  private setStatus(serverId: string, phase: LocalDaemonPhase, message: string) {
    this.statuses.set(serverId, { phase, message });
    this.options.onStatusChange?.({ serverId, phase, message });
  }
}
