import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_DAEMON_APP_STATE,
  type ActivityLogEntry,
  type ConnectedServer,
  type DaemonAppState,
  type DaemonViewState,
  type ProviderConfig,
  type ProviderKind,
} from "./model";
import { countConfiguredProviders } from "./configuredProviders";
import {
  DEFAULT_PROVIDER_KEY_HINT,
  SYSTEM_PROVIDER_KEY_HINT,
  isUnconfiguredProviderKeyHint,
} from "./providerKeyHint";

interface ProviderTemplate {
  name: string;
  model: string;
  keyHint: string;
}

type ConnectedServerPatch = Partial<
  Pick<
    ConnectedServer,
    | "status"
    | "accountLabel"
    | "userLabel"
    | "remoteServerId"
    | "remoteServerSlug"
    | "remoteServerName"
    | "remoteServers"
  >
>;

const PROVIDER_TEMPLATES: Record<ProviderKind, ProviderTemplate> = {
  anthropic: {
    name: "Anthropic",
    model: "Claude Sonnet 4",
    keyHint: "oauth-shell",
  },
  openai: {
    name: "OpenAI",
    model: "GPT-4o",
    keyHint: "oauth-shell",
  },
  alibaba: {
    name: "Alibaba Cloud",
    model: "Qwen-Max",
    keyHint: "api-key-pending",
  },
  custom: {
    name: "Custom / Self-hosted",
    model: "OpenAI-compatible",
    keyHint: "endpoint-pending",
  },
};

export class DaemonAppStateStore {
  private updateChain: Promise<void> = Promise.resolve();

  constructor(
    private readonly filePath: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getState(): Promise<DaemonAppState> {
    return this.readState();
  }

  async setCurrentView(currentView: DaemonViewState): Promise<DaemonAppState> {
    return this.updateState((state) => ({ ...state, currentView }));
  }

  async setServerUrlDraft(serverUrlDraft: string): Promise<DaemonAppState> {
    return this.updateState((state) => ({ ...state, serverUrlDraft }));
  }

  async connectServer(rawUrl: string): Promise<DaemonAppState> {
    const normalizedUrl = normalizeServerUrl(rawUrl);
    return this.updateState((state) => {
      const existing = state.connectedServers.find((server) => server.url === normalizedUrl);
      const nextServer =
        existing ??
        ({
          id: randomUUID(),
          name: deriveServerName(normalizedUrl),
          url: normalizedUrl,
          status: "needs_login",
          accountLabel: "Machine setup required",
          userLabel: null,
          remoteServerId: null,
          remoteServerSlug: null,
          remoteServerName: null,
          remoteServers: [],
        } satisfies ConnectedServer);

      const connectedServers = existing
        ? state.connectedServers
        : [...state.connectedServers, nextServer];
      const currentView: DaemonViewState = hasConfiguredProviders(state.providers, state.systemProviders)
        ? "dashboard"
        : "setup";

      return this.withActivity(
        {
          ...state,
          serverUrlDraft: normalizedUrl,
          currentView,
          currentServerId: nextServer.id,
          connectedServers,
        },
        "Shell",
        existing
          ? `Selected ${nextServer.name} as the active server`
          : `Saved ${nextServer.name} for local daemon app onboarding`,
      );
    });
  }

  async selectServer(serverId: string): Promise<DaemonAppState> {
    return this.updateState((state) => {
      const server = state.connectedServers.find((entry) => entry.id === serverId);
      if (!server) {
        return state;
      }
      return this.withActivity(
        {
          ...state,
          currentServerId: server.id,
          currentView: hasConfiguredProviders(state.providers, state.systemProviders) ? "dashboard" : "setup",
        },
        "Shell",
        `Switched active server to ${server.name}`,
      );
    });
  }

  async removeServer(serverId: string): Promise<DaemonAppState> {
    return this.updateState((state) => {
      const removed = state.connectedServers.find((server) => server.id === serverId);
      if (!removed) {
        return state;
      }

      const connectedServers = state.connectedServers.filter((server) => server.id !== serverId);
      const nextCurrentServerId =
        state.currentServerId === serverId ? connectedServers[0]?.id ?? null : state.currentServerId;
      const currentView: DaemonViewState =
        connectedServers.length === 0
          ? "login"
          : hasConfiguredProviders(state.providers, state.systemProviders)
            ? "dashboard"
            : "setup";

      return this.withActivity(
        {
          ...state,
          currentServerId: nextCurrentServerId,
          connectedServers,
          currentView,
        },
        "Shell",
        `Removed ${removed.name} from the local server list`,
      );
    });
  }

  async updateServerConnection(
    serverId: string,
    patch: ConnectedServerPatch,
    activity?: string,
  ): Promise<DaemonAppState> {
    return this.updateState((state) => {
      const server = state.connectedServers.find((entry) => entry.id === serverId);
      if (!server) {
        return state;
      }

      const connectedServers = state.connectedServers.map((entry) =>
        entry.id === serverId
          ? {
              ...entry,
              ...patch,
            }
          : entry,
      );

      const nextState = {
        ...state,
        connectedServers,
      };

      return activity ? this.withActivity(nextState, "Shell", activity) : nextState;
    });
  }

  async addProvider(kind: ProviderKind): Promise<DaemonAppState> {
    return this.updateState((state) => {
      const existing = state.providers.find((provider) => provider.kind === kind);
      if (existing) {
        return this.withActivity(
          {
            ...state,
            currentView: "providers",
          },
          "Shell",
          `${existing.name} is already configured locally`,
        );
      }

      const template = PROVIDER_TEMPLATES[kind];
      const provider: ProviderConfig = {
        id: randomUUID(),
        kind,
        credentialSource: "app-managed",
        name: template.name,
        model: template.model,
        status: "pending",
        hasLocalKey: false,
        keyHint: DEFAULT_PROVIDER_KEY_HINT,
        usage: "Local credentials required",
        endpoint: null,
      };

      return this.withActivity(
        {
          ...state,
          currentView: "providers",
          providers: [...state.providers, provider],
        },
        "Shell",
        `Added ${provider.name} to the machine-level provider list`,
      );
    });
  }

  async removeProvider(providerId: string): Promise<DaemonAppState> {
    return this.updateState((state) => {
      const provider = state.providers.find((entry) => entry.id === providerId);
      if (!provider) {
        return state;
      }

      const providers = state.providers.filter((entry) => entry.id !== providerId);
      const currentView: DaemonViewState = hasConfiguredProviders(providers, state.systemProviders)
        ? state.currentView
        : "setup";

      return this.withActivity(
        {
          ...state,
          currentView,
          providers,
        },
        "Shell",
        `Removed ${provider.name} from the machine-level provider list`,
      );
    });
  }

  async testProvider(providerId: string): Promise<DaemonAppState> {
    return this.updateState((state) => {
      const provider = state.providers.find((entry) => entry.id === providerId);
      if (!provider) {
        return state;
      }

      const providers: ProviderConfig[] = state.providers.map((entry): ProviderConfig =>
        entry.id === providerId
          ? {
              ...entry,
              status: "connected",
              usage: "Connectivity check requested",
            }
          : entry,
      );

      return this.withActivity(
        {
          ...state,
          providers,
        },
        "Shell",
        `Queued a local connectivity check for ${provider.name}`,
      );
    });
  }

  async updateProviderConfiguration(
    providerId: string,
    patch: Partial<Pick<ProviderConfig, "status" | "hasLocalKey" | "keyHint" | "usage" | "endpoint">>,
    activity: string,
  ): Promise<DaemonAppState> {
    return this.updateState((state) => {
      const provider = state.providers.find((entry) => entry.id === providerId);
      if (!provider) {
        return state;
      }

      const providers = state.providers.map((entry) =>
        entry.id === providerId
          ? {
              ...entry,
              ...patch,
            }
          : entry,
      );

      return this.withActivity(
        {
          ...state,
          providers,
        },
        "Shell",
        activity,
      );
    });
  }

  async appendActivity(source: string, action: string): Promise<DaemonAppState> {
    return this.updateState((state) => this.withActivity(state, source, action));
  }

  async replaceProviders(providers: ProviderConfig[]): Promise<DaemonAppState> {
    return this.updateState((state) => ({
      ...state,
      providers,
    }));
  }

  async replaceSystemProviders(systemProviders: ProviderConfig[]): Promise<DaemonAppState> {
    return this.updateState((state) => ({
      ...state,
      systemProviders,
    }));
  }

  private async readState(): Promise<DaemonAppState> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(raw) as Partial<DaemonAppState>;
      return {
        currentView: parsed.currentView ?? DEFAULT_DAEMON_APP_STATE.currentView,
        currentServerId: parsed.currentServerId ?? DEFAULT_DAEMON_APP_STATE.currentServerId,
        serverUrlDraft: parsed.serverUrlDraft ?? DEFAULT_DAEMON_APP_STATE.serverUrlDraft,
        connectedServers: (parsed.connectedServers ?? DEFAULT_DAEMON_APP_STATE.connectedServers).map(
          normalizeConnectedServer,
        ),
        providers: (parsed.providers ?? DEFAULT_DAEMON_APP_STATE.providers).map(normalizeProviderConfig),
        systemProviders: (parsed.systemProviders ?? DEFAULT_DAEMON_APP_STATE.systemProviders).map(
          normalizeProviderConfig,
        ),
        activityLog: parsed.activityLog ?? DEFAULT_DAEMON_APP_STATE.activityLog,
      };
    } catch {
      return DEFAULT_DAEMON_APP_STATE;
    }
  }

  private async updateState(
    updater: (state: DaemonAppState) => DaemonAppState | Promise<DaemonAppState>,
  ): Promise<DaemonAppState> {
    const nextStatePromise = this.updateChain.then(async () => {
      const current = await this.readState();
      const next = await updater(current);
      await this.writeState(next);
      return next;
    });

    this.updateChain = nextStatePromise.then(
      () => undefined,
      () => undefined,
    );

    return nextStatePromise;
  }

  private async writeState(state: DaemonAppState): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
  }

  getFilePath(): string {
    return this.filePath;
  }

  private withActivity(state: DaemonAppState, source: string, action: string): DaemonAppState {
    const entry: ActivityLogEntry = {
      id: randomUUID(),
      time: this.timestampLabel(),
      source,
      action,
    };

    return {
      ...state,
      activityLog: [entry, ...state.activityLog].slice(0, 20),
    };
  }

  private timestampLabel(): string {
    return this.now().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}

function normalizeProviderConfig(
  provider: ProviderConfig | (Partial<ProviderConfig> & Pick<ProviderConfig, "id" | "kind" | "name" | "model" | "status">),
): ProviderConfig {
  const credentialSource = provider.credentialSource ?? "app-managed";
  return {
    ...provider,
    credentialSource,
    hasLocalKey:
      credentialSource === "system"
        ? false
        : provider.hasLocalKey ?? !isUnconfiguredProviderKeyHint(provider.keyHint),
    keyHint: provider.keyHint ?? (credentialSource === "system" ? SYSTEM_PROVIDER_KEY_HINT : DEFAULT_PROVIDER_KEY_HINT),
    usage:
      provider.usage ??
      (credentialSource === "system" ? "Using existing runtime login from this machine." : "Local credentials required"),
    endpoint: provider.endpoint ?? null,
  };
}

function hasConfiguredProviders(
  providers: ProviderConfig[],
  systemProviders: ProviderConfig[] = [],
): boolean {
  return countConfiguredProviders([...providers, ...systemProviders]) > 0;
}

function deriveServerName(url: string): string {
  const hostname = new URL(url).hostname;
  if (hostname === "app.slock.ai") {
    return "Slock Cloud";
  }
  return hostname;
}

function normalizeServerUrl(rawUrl: string): string {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const normalized = new URL(withProtocol);
  return normalized.origin;
}

function normalizeConnectedServer(server: ConnectedServer): ConnectedServer {
  return {
    ...server,
    userLabel: server.userLabel ?? null,
    remoteServerId: server.remoteServerId ?? null,
    remoteServerSlug: server.remoteServerSlug ?? null,
    remoteServerName: server.remoteServerName ?? null,
    remoteServers: Array.isArray(server.remoteServers) ? server.remoteServers : [],
  };
}
