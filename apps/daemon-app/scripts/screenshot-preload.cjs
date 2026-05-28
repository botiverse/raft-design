const { contextBridge } = require("electron");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const DEFAULT_VIEW = "login";
const stateParam = new URLSearchParams(window.location.search).get("state") || DEFAULT_VIEW;

const serverPrimary = {
  id: "server-botiverse",
  name: "Botiverse",
  url: "https://app.slock.ai",
  status: "connected",
  accountLabel: "Signed in as dayu@botiverse.ai",
  userLabel: "dayu@botiverse.ai",
  remoteServerId: "workspace-botiverse",
  remoteServerSlug: "botiverse",
  remoteServerName: "Botiverse",
  remoteServers: [
    { id: "workspace-botiverse", name: "Botiverse", slug: "botiverse", role: "owner" },
    { id: "workspace-labs", name: "Labs", slug: "labs", role: "admin" },
  ],
};

const serverSecondary = {
  id: "server-sandbox",
  name: "Sandbox",
  url: "https://sandbox.slock.ai",
  status: "needs_login",
  accountLabel: "Browser login required",
  userLabel: null,
  remoteServerId: null,
  remoteServerSlug: null,
  remoteServerName: null,
  remoteServers: [],
};

const anthropicProvider = {
  id: "provider-anthropic",
  kind: "anthropic",
  name: "Anthropic",
  model: "claude-sonnet-4",
  status: "connected",
  hasLocalKey: true,
  keyHint: "sk-ant-•••A1B2",
  usage: "Saved locally · verified just now",
  endpoint: null,
};

const openAiProvider = {
  id: "provider-openai",
  kind: "openai",
  name: "OpenAI",
  model: "gpt-5.4",
  status: "connected",
  hasLocalKey: true,
  keyHint: "sk-proj-•••9X2Q",
  usage: "Saved locally · used for Codex default",
  endpoint: null,
};

const customProvider = {
  id: "provider-custom",
  kind: "custom",
  name: "Custom / Self-hosted",
  model: "qwen3-coder-30b",
  status: "pending",
  hasLocalKey: false,
  keyHint: "not configured",
  usage: "Needs endpoint + key",
  endpoint: "http://localhost:11434/v1",
};

const dashboardMachine = {
  serverId: serverPrimary.id,
  machineId: "machine-dayu-mbp",
  workspaceId: "workspace-botiverse",
  workspaceName: "Botiverse",
  serverSlug: "botiverse",
  name: "dayu-mbp",
  status: "online",
  apiKeyPrefix: "sk_machine_a1b2",
  runtimes: ["claude", "codex"],
  hostname: "dayu-mbp.local",
  os: "macos",
  daemonVersion: "0.33.0",
  latestDaemonVersion: "0.34.0",
  lastHeartbeat: "2026-04-10T08:58:10.000Z",
};

const dashboardAgents = [
  {
    serverId: serverPrimary.id,
    id: "agent-support",
    name: "support",
    displayName: "Support Bot",
    avatarUrl: "pixel:cat",
    description: "Handles customer support routing",
    status: "active",
    activity: "working",
    activityDetail: "replying in #support",
    model: "claude-sonnet-4",
    runtime: "claude",
    executionMode: "byoc",
  },
  {
    serverId: serverPrimary.id,
    id: "agent-release",
    name: "release-watch",
    displayName: "Release Watcher",
    avatarUrl: "pixel:robot",
    description: "Tracks staging vs production deltas",
    status: "inactive",
    activity: "offline",
    activityDetail: "waiting for wake",
    model: "gpt-5.4",
    runtime: "codex",
    executionMode: "cloud",
  },
];

const dashboardRemoteMachines = [
  {
    localServerId: serverPrimary.id,
    id: "machine-dayu-mbp",
    name: "dayu-mbp",
    status: "online",
    apiKeyPrefix: "sk_machine_a1b2",
    runtimes: ["claude", "codex"],
    daemonVersion: "0.33.0",
    lastHeartbeat: "2026-04-10T08:58:10.000Z",
  },
  {
    localServerId: serverPrimary.id,
    id: "machine-ci-runner",
    name: "ci-runner-1",
    status: "offline",
    apiKeyPrefix: "sk_machine_z9y8",
    runtimes: ["codex"],
    daemonVersion: "0.32.1",
    lastHeartbeat: "2026-04-10T08:41:02.000Z",
  },
];

const dashboardWorkspaces = [
  {
    serverId: serverPrimary.id,
    directoryName: "agent-support",
    agentId: "agent-support",
    totalFiles: 14,
    totalSizeBytes: 48320,
    lastModified: "2026-04-10T08:59:12.000Z",
  },
  {
    serverId: serverPrimary.id,
    directoryName: "agent-release",
    agentId: "agent-release",
    totalFiles: 7,
    totalSizeBytes: 19240,
    lastModified: "2026-04-10T08:44:05.000Z",
  },
];

const dashboardActivity = [
  { id: "act-1", time: "09:04", source: "Daemon", action: "Embedded daemon started for Botiverse." },
  { id: "act-2", time: "09:03", source: "Shell", action: "Imported machine bootstrap command for dayu-mbp." },
  { id: "act-3", time: "09:01", source: "Shell", action: "Saved Anthropic provider credentials locally." },
  { id: "act-4", time: "08:58", source: "Daemon", action: "Support Bot received a new assignment." },
];

const dashboardLogs = [
  { id: "log-1", serverId: serverPrimary.id, time: "09:04:11", level: "INFO", line: "daemon connected" },
  { id: "log-2", serverId: serverPrimary.id, time: "09:04:13", level: "INFO", line: "restored 2 idle sessions" },
];

const shellInfo = {
  appVersion: "0.1.0",
  electronVersion: "36.9.5",
  chromeVersion: "136.0.7103.113",
  nodeVersion: "22.14.0",
  platform: "darwin",
  userDataPath: "/Users/dayu/Library/Application Support/Slock Daemon",
  daemonCoreEmbedded: true,
  daemonCoreRunning: true,
  stateFilePath: "/Users/dayu/Library/Application Support/Slock Daemon/daemon-app-state.json",
  secretFilePath: "/Users/dayu/Library/Application Support/Slock Daemon/daemon-app-secrets.json",
  localEncryptionAvailable: true,
};

function createSnapshot(view) {
  switch (view) {
    case "setup":
      return {
        state: {
          currentView: "setup",
          currentServerId: serverPrimary.id,
          serverUrlDraft: serverPrimary.url,
          connectedServers: [clone(serverPrimary), clone(serverSecondary)],
          providers: [],
          systemProviders: [],
          activityLog: [
            { id: "setup-1", time: "08:57", source: "Shell", action: "Saved Botiverse locally." },
          ],
        },
        runtimeStates: [
          {
            serverId: serverPrimary.id,
            hasMachineApiKey: false,
            phase: "stopped",
            message: "No machine API key is saved for this server.",
          },
          {
            serverId: serverSecondary.id,
            hasMachineApiKey: false,
            phase: "stopped",
            message: "No machine API key is saved for this server.",
          },
        ],
        daemonLogs: [],
        machineStates: [],
        machineAgents: [],
        remoteMachines: [],
        workspaceDirectories: [],
      };
    case "dashboard":
      return {
        state: {
          currentView: "dashboard",
          currentServerId: serverPrimary.id,
          serverUrlDraft: serverPrimary.url,
          connectedServers: [clone(serverPrimary), clone(serverSecondary)],
          providers: [clone(anthropicProvider), clone(openAiProvider)],
          systemProviders: [],
          activityLog: clone(dashboardActivity),
        },
        runtimeStates: [
          {
            serverId: serverPrimary.id,
            hasMachineApiKey: true,
            phase: "running",
            message: "Embedded daemon connected to Botiverse.",
          },
          {
            serverId: serverSecondary.id,
            hasMachineApiKey: false,
            phase: "stopped",
            message: "No machine API key is saved for this server.",
          },
        ],
        daemonLogs: clone(dashboardLogs),
        machineStates: [clone(dashboardMachine)],
        machineAgents: clone(dashboardAgents),
        remoteMachines: clone(dashboardRemoteMachines),
        workspaceDirectories: clone(dashboardWorkspaces),
      };
    case "providers":
      return {
        state: {
          currentView: "providers",
          currentServerId: serverPrimary.id,
          serverUrlDraft: serverPrimary.url,
          connectedServers: [clone(serverPrimary), clone(serverSecondary)],
          providers: [clone(anthropicProvider), clone(openAiProvider), clone(customProvider)],
          systemProviders: [],
          activityLog: clone(dashboardActivity),
        },
        runtimeStates: [
          {
            serverId: serverPrimary.id,
            hasMachineApiKey: true,
            phase: "running",
            message: "Embedded daemon connected to Botiverse.",
          },
          {
            serverId: serverSecondary.id,
            hasMachineApiKey: false,
            phase: "stopped",
            message: "No machine API key is saved for this server.",
          },
        ],
        daemonLogs: clone(dashboardLogs),
        machineStates: [clone(dashboardMachine)],
        machineAgents: clone(dashboardAgents),
        remoteMachines: clone(dashboardRemoteMachines),
        workspaceDirectories: clone(dashboardWorkspaces),
      };
    case "login":
    default:
      return {
        state: {
          currentView: "login",
          currentServerId: null,
          serverUrlDraft: "https://app.slock.ai",
          connectedServers: [clone(serverPrimary), clone(serverSecondary)],
          providers: [],
          systemProviders: [],
          activityLog: [],
        },
        runtimeStates: [],
        daemonLogs: [],
        machineStates: [],
        machineAgents: [],
        remoteMachines: [],
        workspaceDirectories: [],
      };
  }
}

let snapshot = createSnapshot(stateParam);
let snapshotListener = null;

function emitSnapshot() {
  if (typeof snapshotListener === "function") {
    snapshotListener(clone(snapshot));
  }
}

const daemonAppApi = {
  getShellInfo: async () => clone(shellInfo),
  getState: async () => clone(snapshot.state),
  setCurrentView: async (view) => {
    snapshot.state.currentView = view;
    emitSnapshot();
    return clone(snapshot.state);
  },
  setServerUrlDraft: async (draft) => {
    snapshot.state.serverUrlDraft = draft;
    emitSnapshot();
    return clone(snapshot.state);
  },
  connectServer: async () => clone(snapshot.state),
  selectServer: async (serverId) => {
    snapshot.state.currentServerId = serverId;
    emitSnapshot();
    return clone(snapshot.state);
  },
  refreshServerContext: async () => clone(snapshot.runtimeStates),
  removeServer: async () => clone(snapshot.state),
  authenticateBrowserSession: async () => clone(snapshot.state),
  clearUserSession: async () => clone(snapshot.state),
  selectRemoteServer: async () => clone(snapshot.state),
  addProvider: async () => clone(snapshot.state),
  saveProviderCredentials: async () => clone(snapshot.state),
  clearProviderCredentials: async () => clone(snapshot.state),
  removeProvider: async () => clone(snapshot.state),
  testProvider: async () => clone(snapshot.state),
  getRuntimeState: async () => clone(snapshot.runtimeStates),
  getDaemonLogs: async () => clone(snapshot.daemonLogs),
  getMachineStates: async () => clone(snapshot.machineStates),
  getMachineAgents: async () => clone(snapshot.machineAgents),
  getRemoteMachines: async () => clone(snapshot.remoteMachines),
  getWorkspaceDirectories: async () => clone(snapshot.workspaceDirectories),
  setMachineApiKey: async () => clone(snapshot.runtimeStates),
  importMachineBootstrap: async () => clone(snapshot.runtimeStates),
  registerMachine: async () => clone(snapshot.runtimeStates),
  attachExistingMachine: async () => clone(snapshot.runtimeStates),
  clearMachineApiKey: async () => clone(snapshot.runtimeStates),
  startLocalDaemon: async () => clone(snapshot.runtimeStates),
  stopLocalDaemon: async () => clone(snapshot.runtimeStates),
  openServerRuntimeDirectory: async () => {},
  openWorkspaceDirectory: async () => {},
  deleteWorkspaceDirectory: async () => {},
  startAssignedAgent: async () => {},
  stopAssignedAgent: async () => {},
  subscribeSnapshot(listener) {
    snapshotListener = listener;
    setTimeout(() => emitSnapshot(), 0);
  },
  unsubscribeSnapshot() {
    snapshotListener = null;
  },
  openExternal: async () => {},
  revealManagedPath: async () => {},
  copyText: async () => {},
  reportSmokeStatus() {},
};

contextBridge.exposeInMainWorld("daemonApp", daemonAppApi);

window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.dataset.daemonAppPreload = "ready";
});
