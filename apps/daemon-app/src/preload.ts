import { clipboard, contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import type {
  ActivityLogEntry,
  ConnectedServer,
  DaemonAppState,
  DaemonManagedPath,
  DaemonSmokeReport,
  DaemonViewState,
  LocalDaemonLogEntry,
  LocalDaemonRuntimeState,
  MachineAssignedAgent,
  RemoteMachineOption,
  MachineShellState,
  ProviderConfig,
  ProviderKind,
  RemoteServerOption,
  ServerWorkspaceDirectory,
} from "./model";

export interface DaemonShellInfo {
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  platform: string;
  userDataPath: string;
  daemonCoreEmbedded: boolean;
  daemonCoreRunning: boolean;
  stateFilePath: string;
  secretFilePath: string;
  localEncryptionAvailable: boolean;
}

export interface DaemonShellSnapshot {
  state: DaemonAppState;
  runtimeStates: LocalDaemonRuntimeState[];
  daemonLogs: LocalDaemonLogEntry[];
  machineStates: MachineShellState[];
  machineAgents: MachineAssignedAgent[];
  remoteMachines: RemoteMachineOption[];
  workspaceDirectories: ServerWorkspaceDirectory[];
}

export type {
  ActivityLogEntry,
  ConnectedServer,
  DaemonAppState,
  DaemonSmokeReport,
  DaemonViewState,
  LocalDaemonLogEntry,
  LocalDaemonRuntimeState,
  MachineAssignedAgent,
  RemoteMachineOption,
  MachineShellState,
  ProviderConfig,
  ProviderKind,
  RemoteServerOption,
  ServerWorkspaceDirectory,
};

const daemonAppApi = {
  getShellInfo: () => ipcRenderer.invoke("daemon-app:get-shell-info") as Promise<DaemonShellInfo>,
  getState: () => ipcRenderer.invoke("daemon-app:get-state") as Promise<DaemonAppState>,
  setCurrentView: (view: DaemonViewState) => ipcRenderer.invoke("daemon-app:set-current-view", view) as Promise<DaemonAppState>,
  setServerUrlDraft: (draft: string) => ipcRenderer.invoke("daemon-app:set-server-url-draft", draft) as Promise<DaemonAppState>,
  connectServer: (url: string) => ipcRenderer.invoke("daemon-app:connect-server", url) as Promise<DaemonAppState>,
  selectServer: (serverId: string) => ipcRenderer.invoke("daemon-app:select-server", serverId) as Promise<DaemonAppState>,
  refreshServerContext: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:refresh-server-context", serverId) as Promise<LocalDaemonRuntimeState[]>,
  removeServer: (serverId: string) => ipcRenderer.invoke("daemon-app:remove-server", serverId) as Promise<DaemonAppState>,
  authenticateBrowserSession: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:authenticate-browser-session", serverId) as Promise<DaemonAppState>,
  clearUserSession: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:clear-user-session", serverId) as Promise<DaemonAppState>,
  selectRemoteServer: (serverId: string, remoteServerId: string) =>
    ipcRenderer.invoke("daemon-app:select-remote-server", serverId, remoteServerId) as Promise<DaemonAppState>,
  addProvider: (kind: ProviderKind) => ipcRenderer.invoke("daemon-app:add-provider", kind) as Promise<DaemonAppState>,
  saveProviderCredentials: (providerId: string, apiKey: string, endpoint?: string | null) =>
    ipcRenderer.invoke("daemon-app:save-provider-credentials", providerId, apiKey, endpoint) as Promise<DaemonAppState>,
  clearProviderCredentials: (providerId: string) =>
    ipcRenderer.invoke("daemon-app:clear-provider-credentials", providerId) as Promise<DaemonAppState>,
  removeProvider: (providerId: string) => ipcRenderer.invoke("daemon-app:remove-provider", providerId) as Promise<DaemonAppState>,
  testProvider: (providerId: string) => ipcRenderer.invoke("daemon-app:test-provider", providerId) as Promise<DaemonAppState>,
  getRuntimeState: () => ipcRenderer.invoke("daemon-app:get-runtime-state") as Promise<LocalDaemonRuntimeState[]>,
  getDaemonLogs: () => ipcRenderer.invoke("daemon-app:get-daemon-logs") as Promise<LocalDaemonLogEntry[]>,
  getMachineStates: () => ipcRenderer.invoke("daemon-app:get-machine-states") as Promise<MachineShellState[]>,
  getMachineAgents: () => ipcRenderer.invoke("daemon-app:get-machine-agents") as Promise<MachineAssignedAgent[]>,
  getRemoteMachines: () => ipcRenderer.invoke("daemon-app:get-remote-machines") as Promise<RemoteMachineOption[]>,
  getWorkspaceDirectories: () => ipcRenderer.invoke("daemon-app:get-workspace-directories") as Promise<ServerWorkspaceDirectory[]>,
  setMachineApiKey: (serverId: string, apiKey: string) =>
    ipcRenderer.invoke("daemon-app:set-machine-api-key", serverId, apiKey) as Promise<LocalDaemonRuntimeState[]>,
  importMachineBootstrap: (serverId: string, rawBootstrap: string) =>
    ipcRenderer.invoke("daemon-app:import-machine-bootstrap", serverId, rawBootstrap) as Promise<LocalDaemonRuntimeState[]>,
  registerMachine: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:register-machine", serverId) as Promise<LocalDaemonRuntimeState[]>,
  attachExistingMachine: (serverId: string, machineId: string) =>
    ipcRenderer.invoke("daemon-app:attach-existing-machine", serverId, machineId) as Promise<LocalDaemonRuntimeState[]>,
  clearMachineApiKey: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:clear-machine-api-key", serverId) as Promise<LocalDaemonRuntimeState[]>,
  startLocalDaemon: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:start-local-daemon", serverId) as Promise<LocalDaemonRuntimeState[]>,
  stopLocalDaemon: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:stop-local-daemon", serverId) as Promise<LocalDaemonRuntimeState[]>,
  openServerRuntimeDirectory: (serverId: string) =>
    ipcRenderer.invoke("daemon-app:open-server-runtime-directory", serverId) as Promise<void>,
  openWorkspaceDirectory: (serverId: string, directoryName: string) =>
    ipcRenderer.invoke("daemon-app:open-workspace-directory", serverId, directoryName) as Promise<void>,
  deleteWorkspaceDirectory: (serverId: string, directoryName: string) =>
    ipcRenderer.invoke("daemon-app:delete-workspace-directory", serverId, directoryName) as Promise<void>,
  startAssignedAgent: (serverId: string, agentId: string) =>
    ipcRenderer.invoke("daemon-app:start-assigned-agent", serverId, agentId) as Promise<void>,
  stopAssignedAgent: (serverId: string, agentId: string) =>
    ipcRenderer.invoke("daemon-app:stop-assigned-agent", serverId, agentId) as Promise<void>,
  openExternal: (url: string) => ipcRenderer.invoke("daemon-app:open-external", url) as Promise<void>,
  revealManagedPath: (pathKind: DaemonManagedPath) =>
    ipcRenderer.invoke("daemon-app:reveal-managed-path", pathKind) as Promise<void>,
  copyText: async (value: string) => {
    clipboard.writeText(value);
  },
  reportSmokeStatus: (report: DaemonSmokeReport) => ipcRenderer.send("daemon-app:smoke-report", report),
};

let snapshotListener: ((event: IpcRendererEvent, snapshot: DaemonShellSnapshot) => void) | null = null;

Object.assign(daemonAppApi, {
  subscribeSnapshot(listener: (snapshot: DaemonShellSnapshot) => void) {
    if (snapshotListener) {
      ipcRenderer.off("daemon-app:snapshot", snapshotListener);
    }
    snapshotListener = (_event, snapshot) => {
      listener(snapshot);
    };
    ipcRenderer.on("daemon-app:snapshot", snapshotListener);
  },
  unsubscribeSnapshot() {
    if (!snapshotListener) {
      return;
    }
    ipcRenderer.off("daemon-app:snapshot", snapshotListener);
    snapshotListener = null;
  },
});

contextBridge.exposeInMainWorld("daemonApp", daemonAppApi);

window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.dataset.daemonAppPreload = "ready";
  if (new URLSearchParams(window.location.search).get("smoke") === "1") {
    ipcRenderer.send("daemon-app:smoke-preload-ready");
  }
});
