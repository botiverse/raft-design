import type { DaemonManagedPath, DaemonShellInfo, DaemonShellSnapshot, DaemonSmokeReport } from "../preload";
import type {
  DaemonAppState,
  DaemonViewState,
  LocalDaemonLogEntry,
  LocalDaemonRuntimeState,
  MachineAssignedAgent,
  RemoteMachineOption,
  MachineShellState,
  ProviderKind,
  ServerWorkspaceDirectory,
} from "../preload";

declare global {
  interface Window {
    daemonApp?: {
      getShellInfo: () => Promise<DaemonShellInfo>;
      getState: () => Promise<DaemonAppState>;
      setCurrentView: (view: DaemonViewState) => Promise<DaemonAppState>;
      setServerUrlDraft: (draft: string) => Promise<DaemonAppState>;
      connectServer: (url: string) => Promise<DaemonAppState>;
      selectServer: (serverId: string) => Promise<DaemonAppState>;
      refreshServerContext: (serverId: string) => Promise<LocalDaemonRuntimeState[]>;
      removeServer: (serverId: string) => Promise<DaemonAppState>;
      authenticateBrowserSession: (serverId: string) => Promise<DaemonAppState>;
      clearUserSession: (serverId: string) => Promise<DaemonAppState>;
      selectRemoteServer: (serverId: string, remoteServerId: string) => Promise<DaemonAppState>;
      addProvider: (kind: ProviderKind) => Promise<DaemonAppState>;
      saveProviderCredentials: (providerId: string, apiKey: string, endpoint?: string | null) => Promise<DaemonAppState>;
      clearProviderCredentials: (providerId: string) => Promise<DaemonAppState>;
      removeProvider: (providerId: string) => Promise<DaemonAppState>;
      testProvider: (providerId: string) => Promise<DaemonAppState>;
      getRuntimeState: () => Promise<LocalDaemonRuntimeState[]>;
      getDaemonLogs: () => Promise<LocalDaemonLogEntry[]>;
      getMachineStates: () => Promise<MachineShellState[]>;
      getMachineAgents: () => Promise<MachineAssignedAgent[]>;
      getRemoteMachines: () => Promise<RemoteMachineOption[]>;
      getWorkspaceDirectories: () => Promise<ServerWorkspaceDirectory[]>;
      setMachineApiKey: (serverId: string, apiKey: string) => Promise<LocalDaemonRuntimeState[]>;
      importMachineBootstrap: (serverId: string, rawBootstrap: string) => Promise<LocalDaemonRuntimeState[]>;
      registerMachine: (serverId: string) => Promise<LocalDaemonRuntimeState[]>;
      attachExistingMachine: (serverId: string, machineId: string) => Promise<LocalDaemonRuntimeState[]>;
      clearMachineApiKey: (serverId: string) => Promise<LocalDaemonRuntimeState[]>;
      startLocalDaemon: (serverId: string) => Promise<LocalDaemonRuntimeState[]>;
      stopLocalDaemon: (serverId: string) => Promise<LocalDaemonRuntimeState[]>;
      openServerRuntimeDirectory: (serverId: string) => Promise<void>;
      openWorkspaceDirectory: (serverId: string, directoryName: string) => Promise<void>;
      deleteWorkspaceDirectory: (serverId: string, directoryName: string) => Promise<void>;
      startAssignedAgent: (serverId: string, agentId: string) => Promise<void>;
      stopAssignedAgent: (serverId: string, agentId: string) => Promise<void>;
      subscribeSnapshot: (listener: (snapshot: DaemonShellSnapshot) => void) => void;
      unsubscribeSnapshot: () => void;
      openExternal: (url: string) => Promise<void>;
      revealManagedPath: (pathKind: DaemonManagedPath) => Promise<void>;
      copyText: (value: string) => Promise<void>;
      reportSmokeStatus: (report: DaemonSmokeReport) => void;
    };
  }
}

export {};
