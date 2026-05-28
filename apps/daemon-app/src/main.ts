import { app, BrowserWindow, ipcMain, safeStorage, shell, type IpcMainEvent } from "electron";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  DaemonCore,
  deleteWorkspaceDirectory,
  resolveWorkspaceDirectoryPath,
  scanWorkspaceDirectories,
} from "@slock-ai/daemon/core";
import type {
  ConnectedServer,
  DaemonManagedPath,
  DaemonViewState,
  DaemonSmokeReport,
  LocalDaemonLogEntry,
  MachineAssignedAgent,
  MachineShellState,
  ProviderKind,
  RemoteMachineOption,
  ServerWorkspaceDirectory,
} from "./model";
import {
  fetchMachineAgents,
  startMachineAssignedAgent,
  stopMachineAssignedAgent,
} from "./agentClient";
import {
  AuthRejectedError,
  getAuthenticatedUserLabel,
  listRemoteMachinesWithUserSession,
  registerMachineWithUserSession,
  resolveRemoteContext,
  rotateMachineKeyWithUserSession,
  selectRemoteServer,
} from "./authClient";
import { extractBrowserAuthSession } from "./browserAuth";
import { fetchMachineSelf } from "./machineClient";
import { parseMachineBootstrapInput } from "./bootstrapCommand";
import { resolveDefaultAgentEnvVars } from "./providerEnv";
import { formatProviderKeyHint, normalizeProviderEndpoint, testProviderConnection } from "./providerClient";
import { mergeAttachedMachineIntoRemoteMachines } from "./remoteMachineInventory";
import { reconcileProviderSecrets } from "./providerSecretReconciliation";
import { daemonApiBasesMatch } from "./serverBaseUrl";
import { DaemonAppSecretStore, type StoredUserSession } from "./secretStore";
import { createSingleFlightByKey } from "./singleFlight";
import { createCoalescedRunner } from "./coalescedRunner";
import { DEFAULT_PROVIDER_KEY_HINT } from "./providerKeyHint";
import { DaemonRuntimeSupervisor } from "./runtimeSupervisor";
import { DaemonAppStateStore } from "./state";
import { detectSystemProviders } from "./systemProviderDetection";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rendererDevUrl = process.env.DAEMON_APP_DEV_URL;
const smokeTestMode = process.argv.includes("--smoke-test");

if (process.env.DAEMON_APP_USER_DATA_DIR) {
  app.setPath("userData", process.env.DAEMON_APP_USER_DATA_DIR);
}

let mainWindow: BrowserWindow | null = null;
let stateStore: DaemonAppStateStore | null = null;
let secretStore: DaemonAppSecretStore | null = null;
let runtimeSupervisor: DaemonRuntimeSupervisor | null = null;
let quitInProgress = false;
const MAX_DAEMON_LOGS_PER_SERVER = 100;
const machineStates = new Map<string, MachineShellState>();
const machineAgents = new Map<string, MachineAssignedAgent[]>();
const remoteMachines = new Map<string, RemoteMachineOption[]>();
const daemonLogs = new Map<string, LocalDaemonLogEntry[]>();
const workspaceDirectories = new Map<string, ServerWorkspaceDirectory[]>();
const refreshMachineContextSingleFlight = createSingleFlightByKey<string, void>();
const refreshRemoteMachinesSingleFlight = createSingleFlightByKey<string, RemoteMachineOption[]>();
const refreshWorkspaceDirectoriesSingleFlight = createSingleFlightByKey<string, ServerWorkspaceDirectory[]>();
const broadcastShellSnapshotRunner = createCoalescedRunner(async () => {
  if (!mainWindow || !stateStore) {
    return;
  }

  const state = await stateStore.getState();
  mainWindow.webContents.send("daemon-app:snapshot", {
    state,
    runtimeStates: await getRuntimeStatesSnapshot(state.connectedServers),
    daemonLogs: getDaemonLogsSnapshot(state.connectedServers),
    machineStates: getMachineStatesSnapshot(state.connectedServers),
    machineAgents: getMachineAgentsSnapshot(state.connectedServers),
    remoteMachines: getRemoteMachinesSnapshot(state.connectedServers),
    workspaceDirectories: getWorkspaceDirectoriesSnapshot(state.connectedServers),
  });
});
const BROWSER_AUTH_POLL_MS = 500;
const BROWSER_AUTH_TIMEOUT_MS = 120_000;

function buildMachineRegistrationName(): string {
  return `Slock Daemon · ${os.hostname()}`;
}

function machineAccountLabel(machine: MachineShellState): string {
  return machine.status === "online" ? `Machine ${machine.name}` : `Machine ${machine.name} · offline`;
}

function getRendererEntryPath() {
  return path.join(__dirname, "renderer", "index.html");
}

function getServerDataDir(serverId: string): string {
  return path.join(app.getPath("userData"), "runtime", serverId);
}

async function openPathOrThrow(targetPath: string) {
  const error = await shell.openPath(targetPath);
  if (error) {
    throw new Error(error);
  }
}

function createMainWindow(options: { show?: boolean } = {}) {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: "Slock Daemon",
    autoHideMenuBar: true,
    backgroundColor: "#FFF8E7",
    show: options.show ?? true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  return window;
}

async function loadMainWindow(window: BrowserWindow) {
  if (rendererDevUrl) {
    const url = new URL(rendererDevUrl);
    if (smokeTestMode) {
      url.searchParams.set("smoke", "1");
    }
    await window.loadURL(url.toString());
  } else {
    const url = pathToFileURL(getRendererEntryPath());
    if (smokeTestMode) {
      url.searchParams.set("smoke", "1");
    }
    await window.loadURL(url.toString());
  }
}

async function runSmokeTest(window: BrowserWindow): Promise<void> {
  const timeoutMs = 15_000;
  const webContentsId = window.webContents.id;
  let preloadReady = false;
  let latestReport: DaemonSmokeReport | null = null;

  const terminalReportPromise = new Promise<DaemonSmokeReport>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      const title = latestReport?.title ?? window.getTitle() ?? "unknown";
      reject(
        new Error(
          `Smoke test failed: renderer smoke status never reached passed. preload=${preloadReady ? "ready" : "missing"} title=${title}.`,
        ),
      );
    }, timeoutMs);

    const handlePreloadReady = (event: IpcMainEvent) => {
      if (event.sender.id !== webContentsId) {
        return;
      }
      preloadReady = true;
    };

    const handleSmokeReport = (event: IpcMainEvent, report: DaemonSmokeReport) => {
      if (event.sender.id !== webContentsId) {
        return;
      }
      latestReport = report;
      if (report.status === "passed" || report.status === "failed") {
        cleanup();
        resolve(report);
      }
    };

    const cleanup = () => {
      clearTimeout(timeout);
      ipcMain.off("daemon-app:smoke-preload-ready", handlePreloadReady);
      ipcMain.off("daemon-app:smoke-report", handleSmokeReport);
    };

    ipcMain.on("daemon-app:smoke-preload-ready", handlePreloadReady);
    ipcMain.on("daemon-app:smoke-report", handleSmokeReport);
  });

  await loadMainWindow(window);
  const terminalReport = await terminalReportPromise;

  if (terminalReport.status !== "passed" || !terminalReport.result) {
    const title = terminalReport.title ?? window.getTitle() ?? "unknown";
    throw new Error(
      `Smoke test failed: ${terminalReport.error || "renderer smoke status never reached passed"}. preload=${preloadReady ? "ready" : "missing"} title=${title}.`,
    );
  }

  const result = JSON.parse(terminalReport.result) as {
    title: string;
    hasDaemonApp: boolean;
    shellInfo: {
      appVersion: string;
      electronVersion: string;
      chromeVersion: string;
      nodeVersion: string;
      platform: string;
      daemonCoreEmbedded: boolean;
      daemonCoreRunning: boolean;
      stateFilePath: string;
      secretFilePath: string;
      localEncryptionAvailable: boolean;
    };
    initialState: {
      currentView: string;
      connectedServers: number;
      providers: number;
    };
    initialRuntimeStates: number;
    connectedState: {
      currentView: string;
      connectedServers: number;
      currentServerId: string | null;
    };
    providerState: {
      currentView: string;
      providers: number;
    };
    finalState: {
      currentView: string;
      connectedServers: number;
      providers: number;
    };
  };

  if (!result.hasDaemonApp) {
    throw new Error("Smoke test failed: preload bridge did not expose window.daemonApp.");
  }
  if (!result.shellInfo.daemonCoreEmbedded) {
    throw new Error("Smoke test failed: embedded daemon core is not available in Electron main.");
  }
  if (result.initialState.currentView !== "login" || result.initialState.connectedServers !== 0 || result.initialState.providers !== 0) {
    throw new Error(`Smoke test failed: isolated shell did not start from a clean login state (${JSON.stringify(result.initialState)}).`);
  }
  if (result.initialRuntimeStates !== 0) {
    throw new Error(`Smoke test failed: expected no runtime rows before onboarding, got ${result.initialRuntimeStates}.`);
  }
  if (result.connectedState.currentView !== "setup" || result.connectedState.connectedServers !== 1 || !result.connectedState.currentServerId) {
    throw new Error(`Smoke test failed: connect-server flow did not transition to setup (${JSON.stringify(result.connectedState)}).`);
  }
  if (result.providerState.currentView !== "providers" || result.providerState.providers !== 1) {
    throw new Error(`Smoke test failed: add-provider flow did not reach providers (${JSON.stringify(result.providerState)}).`);
  }

  const persistedState = JSON.parse(await readFile(result.shellInfo.stateFilePath, "utf8")) as {
    currentView: string;
    connectedServers: unknown[];
    providers: unknown[];
  };

  if (persistedState.currentView !== "providers") {
    throw new Error(`Smoke test failed: persisted state stayed at ${persistedState.currentView} instead of providers.`);
  }
  if (persistedState.connectedServers.length !== 1 || persistedState.providers.length !== 1) {
    throw new Error(`Smoke test failed: persisted state is incomplete (${JSON.stringify(persistedState)}).`);
  }

  // Print a compact JSON line so CLI-driven validation can assert the exact boot result.
  // This keeps daemon-app verification deterministic instead of relying on manual clicking.
  console.log(JSON.stringify({
    ok: true,
    smoke: "daemon-app",
    title: result.title,
    currentView: persistedState.currentView,
    connectedServers: persistedState.connectedServers.length,
    providers: persistedState.providers.length,
    electronVersion: result.shellInfo.electronVersion,
    daemonCoreEmbedded: result.shellInfo.daemonCoreEmbedded,
    localEncryptionAvailable: result.shellInfo.localEncryptionAvailable,
  }));
}

async function reconcileStoredProviderSecrets() {
  const state = await stateStore!.getState();
  const result = await reconcileProviderSecrets(state.providers, (providerId) =>
    secretStore!.getProviderApiKey(providerId),
  );

  if (!result.changed) {
    return state;
  }

  return stateStore!.replaceProviders(result.providers);
}

async function reconcileDetectedSystemProviders() {
  const nextProviders =
    smokeTestMode || process.env.DAEMON_APP_DISABLE_SYSTEM_PROVIDER_DETECTION === "1"
      ? []
      : await detectSystemProviders();
  const state = await stateStore!.getState();

  if (JSON.stringify(state.systemProviders) === JSON.stringify(nextProviders)) {
    return state;
  }

  return stateStore!.replaceSystemProviders(nextProviders);
}

async function reconcileProviderState() {
  await reconcileStoredProviderSecrets();
  await reconcileDetectedSystemProviders();
  return stateStore!.getState();
}

async function getRuntimeStatesSnapshot(connectedServers: ConnectedServer[]) {
  return runtimeSupervisor!.getRuntimeStates(
    connectedServers,
    (serverId) => secretStore!.hasMachineApiKey(serverId),
  );
}

function getMachineStatesSnapshot(connectedServers: ConnectedServer[]) {
  return connectedServers.flatMap((server) => {
    const machine = machineStates.get(server.id);
    return machine ? [machine] : [];
  });
}

function getMachineAgentsSnapshot(connectedServers: ConnectedServer[]) {
  return connectedServers.flatMap((server) => machineAgents.get(server.id) ?? []);
}

function getRemoteMachinesSnapshot(connectedServers: ConnectedServer[]) {
  return connectedServers.flatMap((server) => remoteMachines.get(server.id) ?? []);
}

function getDaemonLogsSnapshot(connectedServers: ConnectedServer[]) {
  return connectedServers.flatMap((server) => daemonLogs.get(server.id) ?? []);
}

function getWorkspaceDirectoriesSnapshot(connectedServers: ConnectedServer[]) {
  return connectedServers.flatMap((server) => workspaceDirectories.get(server.id) ?? []);
}

async function broadcastShellSnapshot() {
  return broadcastShellSnapshotRunner();
}

async function recordRuntimeActivity(serverId: string, message: string) {
  if (!stateStore) {
    return;
  }

  await refreshMachineContextForServer(serverId).catch(() => undefined);
  const state = await stateStore.getState();
  const server = state.connectedServers.find((entry) => entry.id === serverId);
  await stateStore.appendActivity("Daemon", server ? `${server.name}: ${message}` : message);
  await broadcastShellSnapshot();
}

async function recordDaemonLog(
  serverId: string,
  level: LocalDaemonLogEntry["level"],
  line: string,
) {
  const entry: LocalDaemonLogEntry = {
    id: randomUUID(),
    serverId,
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    level,
    line,
  };
  const current = daemonLogs.get(serverId) ?? [];
  daemonLogs.set(serverId, [entry, ...current].slice(0, MAX_DAEMON_LOGS_PER_SERVER));
  await broadcastShellSnapshot();
}

app.whenReady().then(async () => {
  stateStore = new DaemonAppStateStore(path.join(app.getPath("userData"), "daemon-app-state.json"));
  secretStore = new DaemonAppSecretStore(path.join(app.getPath("userData"), "daemon-app-secrets.json"), safeStorage);
  runtimeSupervisor = new DaemonRuntimeSupervisor({
    dataDirRoot: path.join(app.getPath("userData"), "runtime"),
    createCore: (options) => new DaemonCore(options),
    onStatusChange: (event) => {
      void recordRuntimeActivity(event.serverId, event.message);
    },
    onLog: (event) => {
      void recordDaemonLog(event.serverId, event.level, event.line);
    },
    getMachineApiKey: (serverId) => secretStore!.getMachineApiKey(serverId),
    getDefaultAgentEnvVars: async (config) => {
      const state = await stateStore!.getState();
      return resolveDefaultAgentEnvVars(
        config.runtime,
        state.providers,
        (providerId) => secretStore!.getProviderApiKey(providerId),
      );
    },
  });
  await reconcileStoredProviderSecrets();
  await reconcileDetectedSystemProviders();
  await hydrateRemoteSessions();
  await hydrateMachineContext();
  await hydrateWorkspaceDirectories();

  ipcMain.handle("daemon-app:get-shell-info", () => ({
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    platform: process.platform,
    userDataPath: app.getPath("userData"),
    daemonCoreEmbedded: typeof DaemonCore === "function",
    daemonCoreRunning: runtimeSupervisor!.hasActiveRuntime(),
    stateFilePath: stateStore!.getFilePath(),
    secretFilePath: secretStore!.getFilePath(),
    localEncryptionAvailable: safeStorage.isEncryptionAvailable(),
  }));

  ipcMain.handle("daemon-app:get-state", async () => {
    return reconcileProviderState();
  });

  ipcMain.handle("daemon-app:set-current-view", async (_event, view: DaemonViewState) => {
    return stateStore!.setCurrentView(view);
  });

  ipcMain.handle("daemon-app:set-server-url-draft", async (_event, draft: string) => {
    return stateStore!.setServerUrlDraft(draft);
  });

  ipcMain.handle("daemon-app:connect-server", async (_event, url: string) => {
    await reconcileDetectedSystemProviders();
    const next = await stateStore!.connectServer(url);
    const server = next.connectedServers.find((entry) => entry.id === next.currentServerId);
    if (server) {
      remoteMachines.delete(server.id);
      await refreshWorkspaceDirectories(server.id);
    }
    await broadcastShellSnapshot();
    return next;
  });

  ipcMain.handle("daemon-app:select-server", async (_event, serverId: string) => {
    await reconcileDetectedSystemProviders();
    return stateStore!.selectServer(serverId);
  });

  ipcMain.handle("daemon-app:refresh-server-context", async (_event, serverId: string) => {
    let server = await getConnectedServer(serverId);
    const session = await secretStore!.getUserSession(serverId);
    if (session) {
      const nextState = await applyRemoteSession(server, session).catch((error) => {
        if (error instanceof AuthRejectedError) {
          return clearRemoteSessionForServer(serverId).then(() => null);
        }
        throw error;
      });
      if (nextState) {
        server = nextState.connectedServers.find((entry) => entry.id === serverId) ?? server;
      }
    }

    await refreshMachineContextForServer(serverId).catch(() => undefined);
    await stateStore!.appendActivity("Shell", `Refreshed shell context for ${server.name}`);
    await broadcastShellSnapshot();
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:remove-server", async (_event, serverId: string) => {
    await stopRuntimeIfActive(serverId);
    await secretStore!.clearMachineApiKey(serverId).catch(() => undefined);
    await clearRemoteSessionForServer(serverId);
    machineStates.delete(serverId);
    machineAgents.delete(serverId);
    daemonLogs.delete(serverId);
    workspaceDirectories.delete(serverId);
    const next = await stateStore!.removeServer(serverId);
    await broadcastShellSnapshot();
    return next;
  });

  ipcMain.handle("daemon-app:authenticate-browser-session", async (_event, serverId: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Local secret encryption is unavailable, so the daemon app cannot store a Slock login session on this machine.");
    }
    const server = await getConnectedServer(serverId);
    const capturedSession = await captureBrowserAuthSession(server.url);
    const state = await applyRemoteSession(server, capturedSession, {
      activity: `Signed in to ${server.name} and synced available workspaces`,
    });
    await broadcastShellSnapshot();
    return state;
  });

  ipcMain.handle("daemon-app:clear-user-session", async (_event, serverId: string) => {
    const server = await getConnectedServer(serverId);
    const next = await clearRemoteSessionForServer(
      serverId,
      `Cleared the in-app Slock login for ${server.name}`,
    );
    await broadcastShellSnapshot();
    return next;
  });

  ipcMain.handle("daemon-app:select-remote-server", async (_event, serverId: string, remoteServerId: string) => {
    const server = await getConnectedServer(serverId);
    const hasMachineApiKey = await secretStore!.hasMachineApiKey(serverId);
    if (hasMachineApiKey && server.remoteServerId !== remoteServerId) {
      throw new Error("Clear the attached machine key before switching Slock workspaces on this server slot.");
    }
    if (!remoteServerId) {
      remoteMachines.delete(serverId);
      const next = await stateStore!.updateServerConnection(
        serverId,
        {
          remoteServerId: null,
          remoteServerSlug: null,
          remoteServerName: null,
        },
        `Cleared the active workspace selection for ${server.name}`,
      );
      await broadcastShellSnapshot();
      return next;
    }
    const remoteServer = server.remoteServers.find((entry) => entry.id === remoteServerId);
    if (!remoteServer) {
      throw new Error("Selected Slock workspace is no longer available.");
    }

    const next = await stateStore!.updateServerConnection(
      serverId,
      {
        remoteServerId: remoteServer.id,
        remoteServerSlug: remoteServer.slug,
        remoteServerName: remoteServer.name,
      },
      `Selected ${remoteServer.name} for machine bootstrap on ${server.name}`,
    );
    await refreshRemoteMachinesForServer(serverId);
    await broadcastShellSnapshot();
    return next;
  });

  ipcMain.handle("daemon-app:add-provider", async (_event, kind: ProviderKind) => {
    return stateStore!.addProvider(kind);
  });

  ipcMain.handle("daemon-app:save-provider-credentials", async (_event, providerId: string, apiKey: string, endpoint?: string | null) => {
    const state = await stateStore!.getState();
    const provider = state.providers.find((entry) => entry.id === providerId);
    if (!provider) {
      throw new Error("Provider not found.");
    }

    const normalizedEndpoint = normalizeProviderEndpoint(provider.kind, endpoint);
    await secretStore!.setProviderApiKey(providerId, apiKey.trim());
    return stateStore!.updateProviderConfiguration(
      providerId,
      {
        status: "pending",
        hasLocalKey: true,
        keyHint: formatProviderKeyHint(apiKey.trim()),
        usage: "Credentials saved locally — run Test to verify connectivity.",
        endpoint: normalizedEndpoint,
      },
      `Saved local credentials for ${provider.name}`,
    );
  });

  ipcMain.handle("daemon-app:clear-provider-credentials", async (_event, providerId: string) => {
    const state = await stateStore!.getState();
    const provider = state.providers.find((entry) => entry.id === providerId);
    if (!provider) {
      throw new Error("Provider not found.");
    }

    await secretStore!.clearProviderApiKey(providerId);
    return stateStore!.updateProviderConfiguration(
      providerId,
      {
        status: "pending",
        hasLocalKey: false,
        keyHint: DEFAULT_PROVIDER_KEY_HINT,
        usage: "Local credentials required",
        endpoint: null,
      },
      `Cleared local credentials for ${provider.name}`,
    );
  });

  ipcMain.handle("daemon-app:remove-provider", async (_event, providerId: string) => {
    await secretStore!.clearProviderApiKey(providerId);
    return stateStore!.removeProvider(providerId);
  });

  ipcMain.handle("daemon-app:test-provider", async (_event, providerId: string) => {
    const state = await stateStore!.getState();
    const provider = state.providers.find((entry) => entry.id === providerId);
    if (!provider) {
      throw new Error("Provider not found.");
    }

    const apiKey = await secretStore!.getProviderApiKey(providerId);
    try {
      const result = await testProviderConnection({
        kind: provider.kind,
        apiKey: apiKey ?? "",
        endpoint: provider.endpoint,
      });
      return stateStore!.updateProviderConfiguration(
        providerId,
        {
          status: "connected",
          usage: result.usage,
          endpoint: result.endpoint,
        },
        `Verified connectivity for ${provider.name}`,
      );
    } catch (error) {
      return stateStore!.updateProviderConfiguration(
        providerId,
        {
          status: "error",
          usage: error instanceof Error ? error.message : "Provider connectivity check failed.",
        },
        `Provider check failed for ${provider.name}`,
      );
    }
  });

  ipcMain.handle("daemon-app:get-runtime-state", async () => {
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:get-daemon-logs", async () => {
    const state = await stateStore!.getState();
    return getDaemonLogsSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:get-machine-states", async () => {
    const state = await stateStore!.getState();
    return getMachineStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:get-machine-agents", async () => {
    const state = await stateStore!.getState();
    return getMachineAgentsSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:get-remote-machines", async () => {
    const state = await stateStore!.getState();
    return getRemoteMachinesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:get-workspace-directories", async () => {
    const state = await stateStore!.getState();
    return getWorkspaceDirectoriesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:set-machine-api-key", async (_event, serverId: string, apiKey: string) => {
    await verifyAndPersistMachineApiKey(serverId, apiKey);
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:import-machine-bootstrap", async (_event, serverId: string, rawBootstrap: string) => {
    const parsed = parseMachineBootstrapInput(rawBootstrap);
    if (!parsed) {
      throw new Error("Paste the bootstrap command copied from Slock or a raw sk_machine_ key.");
    }

    const server = await getConnectedServer(serverId);
    if (parsed.serverUrl && !daemonApiBasesMatch(server.url, parsed.serverUrl)) {
      throw new Error(`This bootstrap command is for ${parsed.serverUrl}, not ${server.url}. Switch servers or copy the correct command.`);
    }

    await verifyAndPersistMachineApiKey(serverId, parsed.apiKey);
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:register-machine", async (_event, serverId: string) => {
    const server = await getConnectedServer(serverId);
    const session = await secretStore!.getUserSession(serverId);
    if (!session) {
      throw new Error("Sign in with Slock before registering this machine.");
    }

    const nextState = await applyRemoteSession(server, session);
    const nextServer = nextState.connectedServers.find((entry) => entry.id === serverId) ?? server;
    if (!nextServer.remoteServerId) {
      throw new Error("Select a Slock workspace before registering this machine.");
    }

    const activeSession = (await secretStore!.getUserSession(serverId)) ?? session;

    const machineName = buildMachineRegistrationName();
    const result = await registerMachineWithUserSession(
      nextServer.url,
      activeSession,
      nextServer.remoteServerId,
      machineName,
    );

    await secretStore!.setUserSession(serverId, result.session);
    await verifyAndPersistMachineApiKey(serverId, result.apiKey);
    await refreshRemoteMachinesForServer(serverId).catch(() => undefined);
    await stateStore!.appendActivity(
      "Shell",
      `Registered ${result.machineName} in ${nextServer.remoteServerName ?? nextServer.name} and saved its machine key locally`,
    );
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:attach-existing-machine", async (_event, serverId: string, machineId: string) => {
    if (runtimeSupervisor!.getActiveServerId() === serverId) {
      throw new Error("Stop the embedded daemon before attaching an existing machine.");
    }

    const server = await getConnectedServer(serverId);
    if (!server.remoteServerId) {
      throw new Error("Select a Slock workspace before attaching an existing machine.");
    }

    const session = await secretStore!.getUserSession(serverId);
    if (!session) {
      throw new Error("Sign in with Slock before attaching an existing machine.");
    }

    const availableMachines = remoteMachines.get(serverId) ?? (await refreshRemoteMachinesForServer(serverId));
    const selectedMachine = availableMachines.find((entry) => entry.id === machineId);
    if (!selectedMachine) {
      throw new Error("Selected machine is no longer available in the active Slock workspace.");
    }

    const result = await rotateMachineKeyWithUserSession(
      server.url,
      session,
      server.remoteServerId,
      machineId,
    );

    await secretStore!.setUserSession(serverId, result.session);
    await verifyAndPersistMachineApiKey(serverId, result.apiKey);
    await refreshRemoteMachinesForServer(serverId).catch(() => undefined);
    await stateStore!.appendActivity(
      "Shell",
      `Attached existing machine ${selectedMachine.name} from ${server.remoteServerName ?? server.name} and saved its rotated machine key locally`,
    );
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:clear-machine-api-key", async (_event, serverId: string) => {
    await stopRuntimeIfActive(serverId);
    await secretStore!.clearMachineApiKey(serverId);
    machineStates.delete(serverId);
    machineAgents.delete(serverId);
    await stateStore!.updateServerConnection(serverId, {
      status: "needs_login",
      accountLabel: "Machine setup required",
    });
    const server = await getConnectedServer(serverId).catch(() => null);
    if (server) {
      await stateStore!.appendActivity("Shell", `Cleared the saved machine key for ${server.name}`);
    }
    await broadcastShellSnapshot();
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:open-server-runtime-directory", async (_event, serverId: string) => {
    await getConnectedServer(serverId);
    const runtimeDir = getServerDataDir(serverId);
    await mkdir(runtimeDir, { recursive: true });
    await openPathOrThrow(runtimeDir);
  });

  ipcMain.handle("daemon-app:open-workspace-directory", async (_event, serverId: string, directoryName: string) => {
    const targetDir = resolveWorkspaceDirectoryPath(getServerDataDir(serverId), directoryName);
    if (!targetDir) {
      throw new Error("Invalid workspace directory.");
    }
    const result = await shell.openPath(targetDir);
    if (result) {
      throw new Error(result);
    }
    const server = await getConnectedServer(serverId).catch(() => null);
    if (server) {
      await stateStore!.appendActivity("Shell", `Opened local workspace ${directoryName} on ${server.name}`);
      await broadcastShellSnapshot();
    }
  });

  ipcMain.handle("daemon-app:delete-workspace-directory", async (_event, serverId: string, directoryName: string) => {
    const server = await getConnectedServer(serverId);
    const deleted = await deleteWorkspaceDirectory(getServerDataDir(serverId), directoryName);
    if (!deleted) {
      throw new Error("Failed to delete the local workspace directory.");
    }
    await refreshWorkspaceDirectories(serverId);
    await stateStore!.appendActivity("Shell", `Deleted local workspace ${directoryName} on ${server.name}`);
    await broadcastShellSnapshot();
  });

  ipcMain.handle("daemon-app:start-assigned-agent", async (_event, serverId: string, agentId: string) => {
    const server = await getConnectedServer(serverId);
    const apiKey = await secretStore!.getMachineApiKey(serverId);
    if (!apiKey) {
      throw new Error("Save a machine API key before starting agents from the daemon app.");
    }

    await startMachineAssignedAgent(server.url, apiKey, agentId);
    await refreshMachineContextForServer(serverId);
    const agent = machineAgents.get(serverId)?.find((entry) => entry.id === agentId);
    await stateStore!.appendActivity("Shell", `Requested start for ${agent?.displayName || agent?.name || agentId} on ${server.name}`);
    await broadcastShellSnapshot();
  });

  ipcMain.handle("daemon-app:stop-assigned-agent", async (_event, serverId: string, agentId: string) => {
    const server = await getConnectedServer(serverId);
    const apiKey = await secretStore!.getMachineApiKey(serverId);
    if (!apiKey) {
      throw new Error("Save a machine API key before stopping agents from the daemon app.");
    }

    await stopMachineAssignedAgent(server.url, apiKey, agentId);
    await refreshMachineContextForServer(serverId);
    const agent = machineAgents.get(serverId)?.find((entry) => entry.id === agentId);
    await stateStore!.appendActivity("Shell", `Requested stop for ${agent?.displayName || agent?.name || agentId} on ${server.name}`);
    await broadcastShellSnapshot();
  });

  ipcMain.handle("daemon-app:start-local-daemon", async (_event, serverId: string) => {
    const server = await getConnectedServer(serverId);
    await runtimeSupervisor!.start(server);
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:stop-local-daemon", async (_event, serverId: string) => {
    await runtimeSupervisor!.stop(serverId);
    const state = await stateStore!.getState();
    return getRuntimeStatesSnapshot(state.connectedServers);
  });

  ipcMain.handle("daemon-app:open-external", async (_event, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle("daemon-app:reveal-managed-path", async (_event, pathKind: DaemonManagedPath) => {
    switch (pathKind) {
      case "user-data":
        await openPathOrThrow(app.getPath("userData"));
        return;
      case "state-file":
        shell.showItemInFolder(stateStore!.getFilePath());
        return;
      case "secret-file":
        shell.showItemInFolder(secretStore!.getFilePath());
        return;
      default:
        throw new Error("Unknown managed path.");
    }
  });

  mainWindow = createMainWindow({ show: !smokeTestMode });

  if (smokeTestMode) {
    try {
      await runSmokeTest(mainWindow);
      app.exit(0);
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Daemon app smoke test failed.");
      app.exit(1);
    }
    return;
  }

  await loadMainWindow(mainWindow);

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
      await loadMainWindow(mainWindow);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", (event) => {
  if (quitInProgress || !runtimeSupervisor) {
    return;
  }

  const activeServerId = runtimeSupervisor.getActiveServerId();
  if (!activeServerId) {
    return;
  }

  event.preventDefault();
  quitInProgress = true;
  void runtimeSupervisor
    .stop(activeServerId)
    .catch(() => undefined)
    .finally(() => {
      app.quit();
    });
});

async function getConnectedServer(serverId: string): Promise<ConnectedServer> {
  const state = await stateStore!.getState();
  const server = state.connectedServers.find((entry) => entry.id === serverId);
  if (!server) {
    throw new Error("Connected server not found.");
  }
  return server;
}

async function verifyAndPersistMachineApiKey(serverId: string, apiKey: string): Promise<void> {
  const server = await getConnectedServer(serverId);
  // Verify against the real server before persisting the machine key locally.
  // This ordering is intentional: invalid keys should never be written to disk.
  const { machine } = await refreshMachineContext(server, apiKey);
  await secretStore!.setMachineApiKey(serverId, apiKey);
  await stateStore!.updateServerConnection(serverId, {
    status: "connected",
    accountLabel: machineAccountLabel(machine),
  });
  await stateStore!.appendActivity("Shell", `Verified machine key for ${machine.name} on ${server.name}`);
  await broadcastShellSnapshot();
}

async function stopRuntimeIfActive(serverId: string): Promise<void> {
  if (runtimeSupervisor?.getActiveServerId() !== serverId) {
    return;
  }
  await runtimeSupervisor.stop(serverId);
}

async function clearRemoteSessionForServer(
  serverId: string,
  activity?: string,
): Promise<ConnectedServer | null> {
  await secretStore!.clearUserSession(serverId).catch(() => undefined);
  remoteMachines.delete(serverId);
  const next = await stateStore!.updateServerConnection(
    serverId,
    {
      userLabel: null,
      remoteServerId: null,
      remoteServerSlug: null,
      remoteServerName: null,
      remoteServers: [],
    },
    activity,
  );
  return next.connectedServers.find((entry) => entry.id === serverId) ?? null;
}

async function hydrateRemoteSessions() {
  const state = await stateStore!.getState();
  await Promise.all(
    state.connectedServers.map(async (server) => {
      const session = await secretStore!.getUserSession(server.id);
      if (!session) {
        await clearRemoteSessionForServer(server.id);
        return;
      }

      try {
        await applyRemoteSession(server, session);
      } catch {
        await clearRemoteSessionForServer(server.id);
      }
    }),
  );
}

async function hydrateMachineContext() {
  const state = await stateStore!.getState();
  await Promise.all(
    state.connectedServers.map(async (server) => {
      const apiKey = await secretStore!.getMachineApiKey(server.id);
      if (!apiKey) {
        machineStates.delete(server.id);
        machineAgents.delete(server.id);
        await stateStore!.updateServerConnection(server.id, {
          status: "needs_login",
          accountLabel: "Machine setup required",
        });
        return;
      }
      try {
        const { machine } = await refreshMachineContext(server, apiKey);
        await stateStore!.updateServerConnection(server.id, {
          status: "connected",
          accountLabel: machineAccountLabel(machine),
        });
      } catch {
        machineStates.delete(server.id);
        machineAgents.delete(server.id);
        await stateStore!.updateServerConnection(server.id, {
          status: "needs_login",
          accountLabel: "Machine needs attention",
        });
      }
    }),
  );
}

async function applyRemoteSession(
  server: ConnectedServer,
  session: StoredUserSession,
  options: { activity?: string } = {},
) {
  const context = await resolveRemoteContext(server.url, session);
  await secretStore!.setUserSession(server.id, context.session);

  const attachedMachine = machineStates.get(server.id) ?? null;
  const selectedRemoteServer = selectRemoteServer(
    context.servers,
    server.remoteServerId ?? attachedMachine?.workspaceId ?? null,
    attachedMachine?.serverSlug ?? null,
  );
  const nextState = await stateStore!.updateServerConnection(
    server.id,
    {
      userLabel: getAuthenticatedUserLabel(context.user),
      remoteServers: context.servers,
      remoteServerId: selectedRemoteServer?.id ?? null,
      remoteServerSlug: selectedRemoteServer?.slug ?? null,
      remoteServerName: selectedRemoteServer?.name ?? null,
    },
    options.activity,
  );
  await refreshRemoteMachinesForServer(server.id).catch(() => undefined);
  return nextState;
}

async function captureBrowserAuthSession(serverUrl: string): Promise<StoredUserSession> {
  const authWindow = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    title: "Sign in to Slock",
    autoHideMenuBar: true,
    backgroundColor: "#FFF8E7",
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  authWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  await authWindow.loadURL(serverUrl);

  const deadline = Date.now() + BROWSER_AUTH_TIMEOUT_MS;
  try {
    while (Date.now() < deadline) {
      if (authWindow.isDestroyed()) {
        throw new Error("Slock sign-in was closed before authentication completed.");
      }

      try {
        const payload = await authWindow.webContents.executeJavaScript(
          `(() => ({
            accessToken: window.localStorage.getItem("slock_access_token"),
            refreshToken: window.localStorage.getItem("slock_refresh_token"),
          }))();`,
          true,
        );
        const session = extractBrowserAuthSession(payload);
        if (session) {
          authWindow.close();
          return session;
        }
      } catch {
        // The page may still be navigating or cross-origin redirects may be mid-flight.
      }

      await new Promise((resolve) => setTimeout(resolve, BROWSER_AUTH_POLL_MS));
    }

    throw new Error("Timed out waiting for Slock sign-in to finish.");
  } finally {
    if (!authWindow.isDestroyed()) {
      authWindow.close();
    }
  }
}

async function hydrateWorkspaceDirectories() {
  const state = await stateStore!.getState();
  await Promise.all(state.connectedServers.map((server) => refreshWorkspaceDirectories(server.id)));
}

async function refreshMachineState(server: ConnectedServer, apiKey?: string): Promise<MachineShellState> {
  const machine = await loadMachineState(server, apiKey);
  machineStates.set(server.id, machine);
  return machine;
}

async function refreshMachineAgents(server: ConnectedServer, apiKey?: string): Promise<MachineAssignedAgent[]> {
  const machineApiKey = apiKey ?? (await secretStore!.getMachineApiKey(server.id));
  if (!machineApiKey) {
    throw new Error("No machine API key is saved for this server.");
  }
  const agents = await fetchMachineAgents(server.id, server.url, machineApiKey);
  machineAgents.set(server.id, agents);
  return agents;
}

async function refreshMachineContext(
  server: ConnectedServer,
  apiKey?: string,
): Promise<{ machine: MachineShellState; agents: MachineAssignedAgent[] }> {
  const [machine, agents] = await Promise.all([
    refreshMachineState(server, apiKey),
    refreshMachineAgents(server, apiKey),
  ]);
  const currentRemoteMachines = remoteMachines.get(server.id);
  if (currentRemoteMachines) {
    remoteMachines.set(server.id, mergeAttachedMachineIntoRemoteMachines(currentRemoteMachines, machine));
  }
  return { machine, agents };
}

async function loadMachineState(server: ConnectedServer, apiKey?: string): Promise<MachineShellState> {
  const machineApiKey = apiKey ?? (await secretStore!.getMachineApiKey(server.id));
  if (!machineApiKey) {
    throw new Error("No machine API key is saved for this server.");
  }
  return fetchMachineSelf(server.id, server.url, machineApiKey);
}

async function refreshMachineContextForServer(serverId: string): Promise<void> {
  return refreshMachineContextSingleFlight(serverId, async () => {
    const server = await getConnectedServer(serverId).catch(() => null);
    if (!server) {
      machineStates.delete(serverId);
      machineAgents.delete(serverId);
      workspaceDirectories.delete(serverId);
      return;
    }

    const apiKey = await secretStore!.getMachineApiKey(serverId);
    if (!apiKey) {
      machineStates.delete(serverId);
      machineAgents.delete(serverId);
      await refreshWorkspaceDirectories(serverId);
      return;
    }

    try {
      await refreshMachineContext(server, apiKey);
    } catch {
      machineStates.delete(serverId);
      machineAgents.delete(serverId);
    }
    await refreshWorkspaceDirectories(serverId);
  });
}

async function refreshRemoteMachinesForServer(serverId: string): Promise<RemoteMachineOption[]> {
  return refreshRemoteMachinesSingleFlight(serverId, async () => {
    const server = await getConnectedServer(serverId).catch(() => null);
    if (!server || !server.remoteServerId) {
      remoteMachines.delete(serverId);
      return [];
    }

    const session = await secretStore!.getUserSession(serverId);
    if (!session) {
      remoteMachines.delete(serverId);
      return [];
    }

    try {
      const result = await listRemoteMachinesWithUserSession(
        server.url,
        session,
        serverId,
        server.remoteServerId,
      );
      await secretStore!.setUserSession(serverId, result.session);
      remoteMachines.set(serverId, result.machines);
      return result.machines;
    } catch (error) {
      remoteMachines.delete(serverId);
      if (error instanceof AuthRejectedError) {
        await clearRemoteSessionForServer(serverId);
      }
      throw error;
    }
  });
}

async function refreshWorkspaceDirectories(serverId: string): Promise<ServerWorkspaceDirectory[]> {
  return refreshWorkspaceDirectoriesSingleFlight(serverId, async () => {
    const directories = await scanWorkspaceDirectories(getServerDataDir(serverId));
    const next = directories.map((entry) => ({
      ...entry,
      serverId,
    }));
    workspaceDirectories.set(serverId, next);
    return next;
  });
}
