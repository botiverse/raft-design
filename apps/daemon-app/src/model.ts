import type { WorkspaceDirectoryInfo } from "@slock-ai/shared";

export type DaemonViewState = "login" | "setup" | "dashboard" | "providers";

export type ConnectedServerStatus = "connected" | "needs_login";
export type ProviderKind = "anthropic" | "openai" | "alibaba" | "custom";
export type ProviderStatus = "pending" | "connected" | "error";
export type ProviderCredentialSource = "app-managed" | "system";
export type LocalDaemonPhase = "stopped" | "starting" | "running" | "reconnecting";
export type LocalDaemonLogLevel = "INFO" | "WARN" | "ERROR";
export type DaemonManagedPath = "user-data" | "state-file" | "secret-file";

export interface RemoteServerOption {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface RemoteMachineOption {
  localServerId: string;
  id: string;
  name: string;
  status: "online" | "offline";
  apiKeyPrefix: string | null;
  runtimes: string[];
  daemonVersion: string | null;
  lastHeartbeat: string | null;
}

export interface ConnectedServer {
  id: string;
  name: string;
  url: string;
  status: ConnectedServerStatus;
  accountLabel: string;
  userLabel: string | null;
  remoteServerId: string | null;
  remoteServerSlug: string | null;
  remoteServerName: string | null;
  remoteServers: RemoteServerOption[];
}

export interface ProviderConfig {
  id: string;
  kind: ProviderKind;
  credentialSource: ProviderCredentialSource;
  name: string;
  model: string;
  status: ProviderStatus;
  hasLocalKey: boolean;
  keyHint: string;
  usage: string;
  endpoint: string | null;
}

export interface ActivityLogEntry {
  id: string;
  time: string;
  source: string;
  action: string;
}

export interface LocalDaemonRuntimeState {
  serverId: string;
  hasMachineApiKey: boolean;
  phase: LocalDaemonPhase;
  message: string;
}

export interface MachineShellState {
  serverId: string;
  machineId: string;
  workspaceId: string | null;
  workspaceName: string | null;
  serverSlug: string | null;
  name: string;
  status: "online" | "offline";
  apiKeyPrefix: string | null;
  runtimes: string[];
  hostname: string | null;
  os: string | null;
  daemonVersion: string | null;
  latestDaemonVersion: string | null;
  lastHeartbeat: string | null;
}

export interface MachineAssignedAgent {
  serverId: string;
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  description: string | null;
  status: "active" | "inactive" | "stopped";
  activity: string;
  activityDetail: string;
  model: string;
  runtime: string;
  executionMode: "byoc" | "cloud";
}

export interface LocalDaemonLogEntry {
  id: string;
  serverId: string;
  time: string;
  level: LocalDaemonLogLevel;
  line: string;
}

export interface ServerWorkspaceDirectory extends WorkspaceDirectoryInfo {
  serverId: string;
}

export interface DaemonSmokeReport {
  status: "running" | "passed" | "failed";
  result?: string;
  error?: string;
  title?: string;
}

export interface DaemonAppState {
  currentView: DaemonViewState;
  currentServerId: string | null;
  serverUrlDraft: string;
  connectedServers: ConnectedServer[];
  providers: ProviderConfig[];
  systemProviders: ProviderConfig[];
  activityLog: ActivityLogEntry[];
}

export const DEFAULT_DAEMON_APP_STATE: DaemonAppState = {
  currentView: "login",
  currentServerId: null,
  serverUrlDraft: "https://app.slock.ai",
  connectedServers: [],
  providers: [],
  systemProviders: [],
  activityLog: [],
};
