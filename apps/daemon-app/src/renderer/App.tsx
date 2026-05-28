import type { ChangeEvent, JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  DaemonDashboard,
  DaemonLogin,
  DaemonMachineKeyLogin,
  DaemonProviderSetup,
  DaemonProviders,
} from "./components/DaemonAppDemo";
import type {
  ConnectedServer,
  DaemonAppState,
  DaemonShellInfo,
  DaemonViewState,
  LocalDaemonLogEntry,
  LocalDaemonRuntimeState,
  MachineAssignedAgent,
  RemoteMachineOption,
  MachineShellState,
  ProviderKind,
  ServerWorkspaceDirectory,
} from "../preload";
import { buildLoginEntryState } from "../loginEntryState";
import {
  countConfiguredProviders,
  countPendingProviders,
  getConfiguredProviderKinds,
  getExistingProviderKinds,
} from "../configuredProviders";
import { buildProviderDashboardActionLabel, buildProviderDashboardBannerState } from "../providerDashboardAction";
import { SUPPORTED_PROVIDER_KINDS } from "../providerCapabilities";
import { parseRequestedViewState, resolveInitialRendererState } from "../rendererInitialState";
import { getServerRuntimeDirectoryPath, getWorkspaceDirectoryPath } from "../runtimePath";
import {
  buildServerSlotSummary,
  getServerSlotSlockUrl,
  getServerSlotWorkspaceLabel,
} from "../serverSlotSummary";

function isSmokeMode(): boolean {
  return new URLSearchParams(window.location.search).get("smoke") === "1";
}

function getRuntimeState(
  runtimeStates: LocalDaemonRuntimeState[],
  serverId: string | null,
): LocalDaemonRuntimeState | null {
  if (!serverId) {
    return null;
  }
  return runtimeStates.find((entry) => entry.serverId === serverId) ?? null;
}

function RuntimeBadge({ phase }: { phase: LocalDaemonRuntimeState["phase"] }) {
  const classes = {
    stopped: "bg-white text-black/70",
    starting: "bg-brutal-yellow text-black",
    running: "bg-brutal-lime text-black",
    reconnecting: "bg-brutal-orange text-black",
  };

  return (
    <span className={`border border-black px-2 py-0.5 text-[10px] font-bold uppercase ${classes[phase]}`}>
      {phase}
    </span>
  );
}

function ManagedPathRow({
  label,
  value,
  primaryLabel,
  onPrimaryAction,
  onCopy,
}: {
  label: string;
  value: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-2 last:border-b-0 last:pb-0">
      <div className="min-w-0 break-all text-[10px] font-mono text-black/30">
        {label}: {value}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function formatBytes(totalSizeBytes: number): string {
  if (totalSizeBytes < 1024) {
    return `${totalSizeBytes} B`;
  }
  if (totalSizeBytes < 1024 * 1024) {
    return `${(totalSizeBytes / 1024).toFixed(1)} KB`;
  }
  return `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWorkspaceTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return "unreported";
  }
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getWorkspaceLabel(workspace: ServerWorkspaceDirectory, machineAgents: MachineAssignedAgent[]): string {
  const agent = machineAgents.find((entry) => entry.id === workspace.directoryName);
  return agent?.displayName || agent?.name || workspace.directoryName;
}

function formatLastSeen(value: string | null): string {
  if (!value) {
    return "unreported";
  }
  return formatWorkspaceTimestamp(value);
}

function ConnectedServersPanel({
  appState,
  currentServer,
  runtimeStates,
  daemonLogs,
  machineStates,
  machineAgents,
  remoteMachines,
  workspaceDirectories,
  userDataPath,
  stateFilePath,
  secretFilePath,
  localEncryptionAvailable,
  machineBootstrapDraft,
  showManualBootstrapFallback,
  selectedRemoteMachineId,
  onMachineBootstrapDraftChange,
  onToggleManualBootstrapFallback,
  onSelectRemoteMachine,
  onAddServer,
  onSelectServer,
  onRefreshServer,
  onStartServerDaemon,
  onStopServerDaemon,
  onRemoveServer,
  onAuthenticateBrowserSession,
  onClearUserSession,
  onSelectRemoteServer,
  onImportMachineBootstrap,
  onRegisterMachine,
  onAttachExistingMachine,
  onClearMachineApiKey,
  onStartLocalDaemon,
  onStopLocalDaemon,
  onOpenServerRuntimeDirectory,
  onCopyText,
  onOpenWorkspaceDirectory,
  onDeleteWorkspaceDirectory,
  onOpenSlock,
  onRevealManagedPath,
  onClose,
}: {
  appState: DaemonAppState | null;
  currentServer: ConnectedServer | null;
  runtimeStates: LocalDaemonRuntimeState[];
  daemonLogs: LocalDaemonLogEntry[];
  machineStates: MachineShellState[];
  machineAgents: MachineAssignedAgent[];
  remoteMachines: RemoteMachineOption[];
  workspaceDirectories: ServerWorkspaceDirectory[];
  userDataPath: string | null;
  stateFilePath: string | null;
  secretFilePath: string | null;
  localEncryptionAvailable: boolean;
  machineBootstrapDraft: string;
  showManualBootstrapFallback: boolean;
  selectedRemoteMachineId: string;
  onMachineBootstrapDraftChange: (value: string) => void;
  onToggleManualBootstrapFallback: () => void;
  onSelectRemoteMachine: (machineId: string) => void;
  onAddServer: () => void;
  onSelectServer: (serverId: string) => void;
  onRefreshServer: (serverId: string) => void;
  onStartServerDaemon: (serverId: string) => void;
  onStopServerDaemon: (serverId: string) => void;
  onRemoveServer: (serverId: string) => void;
  onAuthenticateBrowserSession: () => void;
  onClearUserSession: () => void;
  onSelectRemoteServer: (remoteServerId: string) => void;
  onImportMachineBootstrap: () => void;
  onRegisterMachine: () => void;
  onAttachExistingMachine: () => void;
  onClearMachineApiKey: () => void;
  onStartLocalDaemon: () => void;
  onStopLocalDaemon: () => void;
  onOpenServerRuntimeDirectory: (serverId: string) => void;
  onCopyText: (value: string, label: string) => void;
  onOpenWorkspaceDirectory: (directoryName: string) => void;
  onDeleteWorkspaceDirectory: (directoryName: string) => void;
  onOpenSlock: (url: string) => void;
  onRevealManagedPath: (pathKind: "user-data" | "state-file" | "secret-file") => void;
  onClose: () => void;
}) {
  const currentRuntime = getRuntimeState(runtimeStates, currentServer?.id ?? null);
  const currentDaemonLogs =
    currentServer ? daemonLogs.filter((entry) => entry.serverId === currentServer.id).slice(0, 6) : [];
  const currentMachine =
    currentServer ? machineStates.find((entry) => entry.serverId === currentServer.id) ?? null : null;
  const replacementRuntime = currentServer
    ? runtimeStates.find((entry) => entry.serverId !== currentServer.id && entry.phase !== "stopped") ?? null
    : null;
  const replacementServer = replacementRuntime
    ? appState?.connectedServers.find((server) => server.id === replacementRuntime.serverId) ?? null
    : null;
  const currentWorkspaceDirectories = currentServer
    ? workspaceDirectories
        .filter((entry) => entry.serverId === currentServer.id)
        .sort((left, right) => right.lastModified.localeCompare(left.lastModified))
    : [];
  const currentRuntimeDirectoryPath = currentServer && userDataPath
    ? getServerRuntimeDirectoryPath(userDataPath, currentServer.id)
    : null;
  const currentRemoteMachines = currentServer
    ? remoteMachines
        .filter((entry) => entry.localServerId === currentServer.id)
        .sort((left, right) => {
          if (left.status !== right.status) {
            return left.status === "online" ? -1 : 1;
          }
          return left.name.localeCompare(right.name);
        })
    : [];
  const selectedRemoteMachine =
    currentRemoteMachines.find((entry) => entry.id === selectedRemoteMachineId) ?? null;
  const daemonBusy = currentRuntime ? currentRuntime.phase !== "stopped" : false;
  const workspaceSelectionLocked = Boolean(currentRuntime?.hasMachineApiKey);
  const remoteMachineAlreadyAttached = Boolean(
    selectedRemoteMachine &&
      currentMachine &&
      currentRuntime?.hasMachineApiKey &&
      selectedRemoteMachine.id === currentMachine.machineId,
  );
  const machineHasUpdate = currentServer && currentMachine
    ? buildServerSlotSummary({
        server: currentServer,
        machine: currentMachine,
        remoteMachineCount: currentRemoteMachines.length,
        localWorkspaceCount: currentWorkspaceDirectories.length,
      }).hasDaemonUpdate
    : false;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 p-4">
      <div className="flex h-full w-full max-w-[420px] flex-col overflow-hidden border-2 border-black bg-white shadow-brutal-lg">
        <div className="flex items-center justify-between gap-3 border-b-2 border-black px-3 py-3">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-black/60">Shell tools</div>
            <div className="mt-1 text-xs font-bold">{appState?.connectedServers.length ?? 0} connected server slots</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onAddServer} className="btn-brutal-sm bg-brutal-yellow px-2 py-1 text-[10px] uppercase">
              Add server
            </button>
            <button type="button" onClick={onClose} className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase">
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
      <div className="space-y-2">
        {appState?.connectedServers.length ? (
          appState.connectedServers.map((server) => {
            const active = currentServer?.id === server.id;
            const runtimeState = getRuntimeState(runtimeStates, server.id);
            const machineState = machineStates.find((entry) => entry.serverId === server.id) ?? null;
            const slotRemoteMachineCount = remoteMachines.filter((entry) => entry.localServerId === server.id).length;
            const slotLocalWorkspaceCount = workspaceDirectories.filter((entry) => entry.serverId === server.id).length;
            const slotSummary = buildServerSlotSummary({
              server,
              machine: machineState,
              remoteMachineCount: slotRemoteMachineCount,
              localWorkspaceCount: slotLocalWorkspaceCount,
            });
            const slotSlockUrl = getServerSlotSlockUrl(server, machineState);
            const slotCanStart = Boolean(runtimeState?.hasMachineApiKey) && runtimeState?.phase === "stopped";
            const slotCanStop = runtimeState ? runtimeState.phase !== "stopped" : false;

            return (
              <div
                key={server.id}
                className={`border-2 border-black p-2 ${active ? "bg-brutal-yellow/40" : "bg-brutal-cream/40"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold">{server.name}</div>
                    <div className="truncate text-[10px] font-mono text-black/50">{server.url}</div>
                    <div className="mt-1 text-[10px] font-mono uppercase text-black/40">{server.accountLabel}</div>
                    <div className="mt-1 text-[10px] font-mono text-black/55">session={slotSummary.sessionLabel}</div>
                    <div className="text-[10px] font-mono text-black/55">
                      workspace={slotSummary.workspaceLabel}
                      {slotSummary.workspaceSlug ? ` · slug=${slotSummary.workspaceSlug}` : ""}
                    </div>
                    {slotSummary.machineName ? (
                      <div className="text-[10px] font-mono text-black/55">
                        machine={slotSummary.machineName} · {slotSummary.machineStatus}
                        {slotSummary.daemonVersion ? ` · daemon=${slotSummary.daemonVersion}` : ""}
                      </div>
                    ) : null}
                    <div className="text-[10px] font-mono text-black/45">
                      remote={slotSummary.remoteMachineCount} · local={slotSummary.localWorkspaceCount}
                      {slotSummary.hasDaemonUpdate && slotSummary.latestDaemonVersion
                        ? ` · update=${slotSummary.latestDaemonVersion}`
                        : ""}
                    </div>
                    {runtimeState ? (
                      <div className="mt-1 flex items-center gap-2">
                        <RuntimeBadge phase={runtimeState.phase} />
                        <span className="text-[10px] font-mono text-black/40">
                          {runtimeState.hasMachineApiKey ? "machine key saved" : "no machine key"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {slotCanStop ? (
                      <button
                        type="button"
                        onClick={() => onStopServerDaemon(server.id)}
                        className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartServerDaemon(server.id)}
                        disabled={!slotCanStart}
                        className="btn-brutal-sm bg-brutal-lime px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Start
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRefreshServer(server.id)}
                      className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                    >
                      Sync
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenServerRuntimeDirectory(server.id)}
                      className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                    >
                      Runtime
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenSlock(slotSlockUrl)}
                      className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                    >
                      Open
                    </button>
                    {!active ? (
                      <button
                        type="button"
                        onClick={() => onSelectServer(server.id)}
                        className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                      >
                        Use
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onRemoveServer(server.id)}
                      className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="border-2 border-dashed border-black/40 bg-brutal-cream/40 p-3 text-[11px] text-black/50">
            No saved servers yet.
          </div>
        )}
      </div>

      {currentServer ? (
        <div className="mt-3 border-2 border-black bg-brutal-cream/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold">Machine setup</div>
            {currentRuntime ? <RuntimeBadge phase={currentRuntime.phase} /> : null}
          </div>
          <div className="mt-1 text-[11px] text-black/60">
            {currentRuntime?.message ?? "Select a connected server to manage its local daemon runtime."}
          </div>
          {currentMachine ? (
            <div className="mt-2 border border-black bg-white/70 px-2 py-2 text-[10px] font-mono text-black/60">
              <div>
                machine={currentMachine.name} · status={currentMachine.status} · daemon={currentMachine.daemonVersion ?? "unreported"}
              </div>
              <div className="mt-1">
                runtimes={currentMachine.runtimes.join(", ") || "none"} · host={currentMachine.hostname ?? "unreported"}
              </div>
              {machineHasUpdate ? (
                <div className="mt-1 text-orange-700">
                  update available: {currentMachine.latestDaemonVersion}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 border border-black bg-white/80 px-2 py-2 text-[10px] font-mono text-black/60">
            <div>Slock session={currentServer.userLabel ?? "not connected"}</div>
            <div className="mt-1">
              workspace={getServerSlotWorkspaceLabel(currentServer, currentMachine)}
              {(currentServer.remoteServerSlug ?? currentMachine?.serverSlug)
                ? ` · slug=${currentServer.remoteServerSlug ?? currentMachine?.serverSlug}`
                : ""}
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/50">
              Slock workspace
            </label>
            <select
              value={currentServer.remoteServerId ?? ""}
              onChange={(event) => onSelectRemoteServer(event.target.value)}
              disabled={currentServer.remoteServers.length === 0 || workspaceSelectionLocked}
              className="input-brutal w-full text-[11px] font-mono disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {workspaceSelectionLocked
                  ? "Clear the attached machine key before switching workspaces"
                  : currentServer.remoteServers.length > 0
                    ? "Choose a workspace"
                    : "Sign in first to load workspaces"}
              </option>
              {currentServer.remoteServers.map((remoteServer) => (
                <option key={remoteServer.id} value={remoteServer.id}>
                  {remoteServer.name} ({remoteServer.slug})
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onAuthenticateBrowserSession}
                disabled={!localEncryptionAvailable}
                className="btn-brutal-sm bg-brutal-yellow px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currentServer.userLabel ? "Refresh login" : "Sign in with Slock"}
              </button>
              <button
                type="button"
                onClick={onRegisterMachine}
                disabled={!currentServer.remoteServerId || !localEncryptionAvailable || currentRuntime?.hasMachineApiKey}
                className="btn-brutal-sm bg-brutal-lime px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
              >
                Register this machine
              </button>
              <button
                type="button"
                onClick={onClearUserSession}
                disabled={!currentServer.userLabel}
                className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sign out
              </button>
            </div>
            <div className="mt-1 text-[10px] font-mono text-black/40">
              {!localEncryptionAvailable
                ? "Local secret encryption is unavailable in this environment, so in-app Slock login and machine registration are disabled."
                : workspaceSelectionLocked
                ? "This slot already has a machine key attached. Clear it before switching Slock workspaces on this server slot."
                : "If you sign in with Slock, the daemon app will register or attach a machine for you. You do not need to paste a machine key unless you choose the manual fallback below."}
          </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/50">
              Existing remote machines
            </label>
            <select
              value={selectedRemoteMachineId}
              onChange={(event) => onSelectRemoteMachine(event.target.value)}
              disabled={!currentServer.remoteServerId || currentRemoteMachines.length === 0}
              className="input-brutal w-full text-[11px] font-mono disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {currentServer.remoteServerId
                  ? currentRemoteMachines.length > 0
                    ? "Select an existing machine to attach"
                    : "No existing machines found in this workspace"
                  : "Select a workspace first"}
              </option>
              {currentRemoteMachines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name} ({machine.status})
                </option>
              ))}
            </select>
            {selectedRemoteMachine ? (
              <div className="mt-2 border border-black bg-white/70 px-2 py-2 text-[10px] font-mono text-black/60">
                <div>
                  status={selectedRemoteMachine.status} · daemon={selectedRemoteMachine.daemonVersion ?? "unreported"}
                </div>
                <div className="mt-1">
                  runtimes={selectedRemoteMachine.runtimes.join(", ") || "none"} · lastHeartbeat=
                  {formatLastSeen(selectedRemoteMachine.lastHeartbeat)}
                </div>
                <div className="mt-1">
                  keyPrefix={selectedRemoteMachine.apiKeyPrefix ?? "unreported"}
                  {remoteMachineAlreadyAttached ? " · already attached locally" : ""}
                </div>
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onAttachExistingMachine}
                disabled={
                  !selectedRemoteMachine ||
                  !localEncryptionAvailable ||
                  daemonBusy ||
                  remoteMachineAlreadyAttached
                }
                className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
              >
                Attach existing
              </button>
            </div>
            <div className="mt-1 text-[10px] font-mono text-black/40">
              Use this when the machine already exists in Slock and you want this daemon app to take it over locally.
            </div>
          </div>

          <div className="mt-3 border border-dashed border-black/30 bg-white/70 px-2 py-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-black/50">Advanced fallback</div>
                <div className="mt-1 text-[10px] font-mono text-black/40">
                  Only use manual bootstrap if you already have a copied daemon command or raw machine key.
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleManualBootstrapFallback}
                className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
              >
                {showManualBootstrapFallback
                  ? "Hide manual path"
                  : currentServer.userLabel
                    ? "Use manual bootstrap instead"
                    : "Use manual bootstrap"}
              </button>
            </div>

            {showManualBootstrapFallback ? (
              <div className="mt-3">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/50">
                  Manual bootstrap
                </label>
                <textarea
                  placeholder="Paste the command copied from Slock, or a raw sk_machine_ key"
                  value={machineBootstrapDraft}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onMachineBootstrapDraftChange(event.target.value)}
                  className="input-brutal min-h-[84px] w-full resize-y text-[11px] font-mono"
                  disabled={!localEncryptionAvailable}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSlock(getServerSlotSlockUrl(currentServer, currentMachine))}
                    className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                  >
                    Open Slock
                  </button>
                  <button
                    type="button"
                    onClick={onImportMachineBootstrap}
                    disabled={!localEncryptionAvailable || !machineBootstrapDraft.trim()}
                    className="btn-brutal-sm bg-brutal-cyan px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Import manual bootstrap
                  </button>
                </div>
                <div className="mt-1 text-[10px] font-mono text-black/40">
                  This path is only for copied bootstrap commands or raw machine keys. The normal Slock login flow above handles machine registration for you.
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClearMachineApiKey}
              disabled={!currentRuntime?.hasMachineApiKey}
              className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear key
            </button>
            <button
              type="button"
              onClick={onStartLocalDaemon}
              disabled={!currentRuntime?.hasMachineApiKey || currentRuntime.phase === "running" || currentRuntime.phase === "starting"}
              className="btn-brutal-sm bg-brutal-lime px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start daemon
            </button>
            <button
              type="button"
              onClick={onStopLocalDaemon}
              disabled={!currentRuntime || currentRuntime.phase === "stopped"}
              className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop daemon
            </button>
          </div>

          {replacementServer ? (
            <div className="mt-3 border border-black bg-brutal-yellow/40 px-2 py-2 text-[10px] font-mono text-black/60">
              Starting this server will stop the embedded daemon currently attached to {replacementServer.name}.
            </div>
          ) : null}

          <div className="mt-3 text-[10px] font-mono text-black/30">
            {localEncryptionAvailable
              ? "Electron safeStorage is available for local secret encryption."
              : "Local secret encryption is unavailable in this environment."}
          </div>

          <div className="mt-3 border border-black bg-white/80">
            <div className="border-b border-black/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black/50">
              Recent daemon logs
            </div>
            <div className="max-h-32 overflow-y-auto px-2 py-2">
              {currentDaemonLogs.length > 0 ? (
                currentDaemonLogs.map((entry) => (
                  <div key={entry.id} className="pb-1 text-[10px] font-mono text-black/60 last:pb-0">
                    <span className="text-black/35">{entry.time}</span>{" "}
                    <span
                      className={
                        entry.level === "ERROR"
                          ? "text-red-600"
                          : entry.level === "WARN"
                            ? "text-orange-600"
                            : "text-black/50"
                      }
                    >
                      [{entry.level}]
                    </span>{" "}
                    <span>{entry.line}</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] font-mono text-black/35">
                  Start the embedded daemon to stream local runtime logs here.
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 border border-black bg-white/80">
            <div className="flex items-center justify-between gap-2 border-b border-black/10 px-2 py-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-black/50">Local workspaces</div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onOpenServerRuntimeDirectory(currentServer.id)}
                  className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                >
                  Open runtime dir
                </button>
                {currentRuntimeDirectoryPath ? (
                  <button
                    type="button"
                    onClick={() => onCopyText(currentRuntimeDirectoryPath, "runtime directory path")}
                    className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                  >
                    Copy path
                  </button>
                ) : null}
              </div>
            </div>
            <div className="max-h-36 overflow-y-auto px-2 py-2">
              {currentRuntimeDirectoryPath ? (
                <div className="mb-2 break-all text-[10px] font-mono text-black/30">runtime: {currentRuntimeDirectoryPath}</div>
              ) : null}
              {currentWorkspaceDirectories.length > 0 ? (
                currentWorkspaceDirectories.map((workspace) => (
                  <div key={workspace.directoryName} className="border-b border-black/10 pb-2 pt-1 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-bold text-black">
                          {getWorkspaceLabel(
                            workspace,
                            machineAgents.filter((entry) => entry.serverId === workspace.serverId),
                          )}
                        </div>
                        <div className="truncate text-[10px] font-mono text-black/40">{workspace.directoryName}</div>
                        <div className="mt-1 text-[10px] font-mono text-black/50">
                          {formatBytes(workspace.totalSizeBytes)} · {workspace.fileCount} files
                        </div>
                        <div className="text-[10px] font-mono text-black/35">
                          modified {formatWorkspaceTimestamp(workspace.lastModified)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenWorkspaceDirectory(workspace.directoryName)}
                          className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                        >
                          Open
                        </button>
                        {userDataPath ? (
                          <button
                            type="button"
                            onClick={() =>
                              onCopyText(
                                getWorkspaceDirectoryPath(userDataPath, workspace.serverId, workspace.directoryName),
                                "workspace directory path",
                              )}
                            className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase"
                          >
                            Copy path
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onDeleteWorkspaceDirectory(workspace.directoryName)}
                          className="btn-brutal-sm bg-white px-2 py-1 text-[10px] uppercase text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[10px] font-mono text-black/35">
                  No local workspaces detected for this server.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {stateFilePath || secretFilePath ? (
        <div className="mt-3 border border-black bg-white/80 px-2 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-black/50">Local shell files</div>
          <div className="mt-2 space-y-2">
            {userDataPath ? (
              <ManagedPathRow
                label="data"
                value={userDataPath}
                primaryLabel="Open dir"
                onPrimaryAction={() => onRevealManagedPath("user-data")}
                onCopy={() => onCopyText(userDataPath, "data directory path")}
              />
            ) : null}
            {stateFilePath ? (
              <ManagedPathRow
                label="state"
                value={stateFilePath}
                primaryLabel="Reveal"
                onPrimaryAction={() => onRevealManagedPath("state-file")}
                onCopy={() => onCopyText(stateFilePath, "state file path")}
              />
            ) : null}
            {secretFilePath ? (
              <ManagedPathRow
                label="secrets"
                value={secretFilePath}
                primaryLabel="Reveal"
                onPrimaryAction={() => onRevealManagedPath("secret-file")}
                onCopy={() => onCopyText(secretFilePath, "secret file path")}
              />
            ) : null}
          </div>
        </div>
      ) : null}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [shellInfo, setShellInfo] = useState<DaemonShellInfo | null>(null);
  const [appState, setAppState] = useState<DaemonAppState | null>(null);
  const [runtimeStates, setRuntimeStates] = useState<LocalDaemonRuntimeState[]>([]);
  const [daemonLogs, setDaemonLogs] = useState<LocalDaemonLogEntry[]>([]);
  const [machineStates, setMachineStates] = useState<MachineShellState[]>([]);
  const [machineAgents, setMachineAgents] = useState<MachineAssignedAgent[]>([]);
  const [remoteMachines, setRemoteMachines] = useState<RemoteMachineOption[]>([]);
  const [workspaceDirectories, setWorkspaceDirectories] = useState<ServerWorkspaceDirectory[]>([]);
  const [machineBootstrapDrafts, setMachineBootstrapDrafts] = useState<Record<string, string>>({});
  const [manualBootstrapFallbackOpenByServer, setManualBootstrapFallbackOpenByServer] = useState<Record<string, boolean>>({});
  const [remoteMachineSelections, setRemoteMachineSelections] = useState<Record<string, string>>({});
  const [providerApiKeyDrafts, setProviderApiKeyDrafts] = useState<Record<string, string>>({});
  const [providerEndpointDrafts, setProviderEndpointDrafts] = useState<Record<string, string>>({});
  const [loginMachineBootstrapDraft, setLoginMachineBootstrapDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shellPanelOpen, setShellPanelOpen] = useState(false);
  const [showMachineKeyLogin, setShowMachineKeyLogin] = useState(false);
  const requestedViewState = useMemo(() => parseRequestedViewState(window.location.search), []);
  const smokeMode = useMemo(() => isSmokeMode(), []);

  const refreshRuntimeStates = () => {
    void window.daemonApp?.getRuntimeState().then((states) => {
      setRuntimeStates(states);
    });
  };

  const refreshDaemonLogs = () => {
    void window.daemonApp?.getDaemonLogs().then((logs) => {
      setDaemonLogs(logs);
    });
  };

  const refreshMachineStates = () => {
    void window.daemonApp?.getMachineStates().then((states) => {
      setMachineStates(states);
    });
  };

  const refreshMachineAgents = () => {
    void window.daemonApp?.getMachineAgents().then((agents) => {
      setMachineAgents(agents);
    });
  };

  const refreshRemoteMachines = () => {
    void window.daemonApp?.getRemoteMachines().then((machines) => {
      setRemoteMachines(machines);
    });
  };

  const refreshWorkspaceDirectories = () => {
    void window.daemonApp?.getWorkspaceDirectories().then((directories) => {
      setWorkspaceDirectories(directories);
    });
  };

  useEffect(() => {
    void window.daemonApp?.getShellInfo().then((info) => {
      setShellInfo(info);
    });

    void window.daemonApp?.getState().then((state) => {
      setAppState(resolveInitialRendererState(state, requestedViewState));
      refreshRuntimeStates();
      refreshDaemonLogs();
      refreshMachineStates();
      refreshMachineAgents();
      refreshRemoteMachines();
      refreshWorkspaceDirectories();
    });
  }, [requestedViewState]);

  useEffect(() => {
    if (!window.daemonApp) {
      return;
    }

    window.daemonApp.subscribeSnapshot((snapshot) => {
      setAppState(snapshot.state);
      setRuntimeStates(snapshot.runtimeStates);
      setDaemonLogs(snapshot.daemonLogs);
      setMachineStates(snapshot.machineStates);
      setMachineAgents(snapshot.machineAgents);
      setRemoteMachines(snapshot.remoteMachines);
      setWorkspaceDirectories(snapshot.workspaceDirectories);
    });

    return () => {
      window.daemonApp?.unsubscribeSnapshot();
    };
  }, []);

  const currentServer =
    appState?.connectedServers.find((server) => server.id === appState.currentServerId) ?? null;
  const currentMachine =
    currentServer ? machineStates.find((entry) => entry.serverId === currentServer.id) ?? null : null;
  const currentRemoteMachines =
    currentServer ? remoteMachines.filter((entry) => entry.localServerId === currentServer.id) : [];
  const machineBootstrapDraft =
    currentServer ? machineBootstrapDrafts[currentServer.id] ?? "" : "";
  const showManualBootstrapFallback =
    currentServer ? manualBootstrapFallbackOpenByServer[currentServer.id] ?? false : false;
  const selectedRemoteMachineId =
    currentServer ? remoteMachineSelections[currentServer.id] ?? currentMachine?.machineId ?? "" : "";
  const selectedRemoteMachine =
    currentRemoteMachines.find((entry) => entry.id === selectedRemoteMachineId) ?? null;
  const currentAgents =
    currentServer ? machineAgents.filter((entry) => entry.serverId === currentServer.id) : [];
  const currentRuntime = getRuntimeState(runtimeStates, currentServer?.id ?? null);
  const allProviders = useMemo(
    () => [...(appState?.systemProviders ?? []), ...(appState?.providers ?? [])],
    [appState?.providers, appState?.systemProviders],
  );
  const configuredProviderCount = countConfiguredProviders(allProviders);
  const pendingProviderCount = countPendingProviders(appState?.providers ?? []);
  const systemProviderAttentionCount = countPendingProviders(appState?.systemProviders ?? []);
  const blockedSystemProviderMessage =
    appState?.systemProviders?.find((provider) => provider.status !== "connected")?.usage ?? null;
  const existingProviderKinds = getExistingProviderKinds(appState?.providers ?? []);
  const configuredProviderKinds = getConfiguredProviderKinds(appState?.providers ?? []);
  const hasAvailableProviderKinds = existingProviderKinds.length < SUPPORTED_PROVIDER_KINDS.length;
  const providerActionLabel = buildProviderDashboardActionLabel(
    configuredProviderCount,
    pendingProviderCount,
    systemProviderAttentionCount,
    hasAvailableProviderKinds,
  );
  const providerBanner = buildProviderDashboardBannerState(
    configuredProviderCount,
    pendingProviderCount,
    blockedSystemProviderMessage,
  );
  const effectiveViewState: DaemonViewState =
    currentServer ? appState?.currentView ?? requestedViewState ?? "login" : "login";
  useEffect(() => {
    const titleSuffix = showMachineKeyLogin
      ? "machine key"
      : currentServer
        ? `${effectiveViewState} · ${currentServer.name}`
        : effectiveViewState;
    document.title = `Slock Daemon — ${titleSuffix}`;
  }, [currentServer, effectiveViewState, showMachineKeyLogin]);

  useEffect(() => {
    if (!shellPanelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShellPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shellPanelOpen]);

  useEffect(() => {
    const daemonApp = window.daemonApp;
    if (!smokeMode) {
      return;
    }

    if (!daemonApp) {
      document.documentElement.dataset.daemonAppSmokeError = "renderer cannot see window.daemonApp";
      document.documentElement.dataset.daemonAppSmokeStatus = "failed";
      return;
    }

    let cancelled = false;
    document.documentElement.dataset.daemonAppSmokeStatus = "running";
    delete document.documentElement.dataset.daemonAppSmokeResult;
    delete document.documentElement.dataset.daemonAppSmokeError;
    daemonApp.reportSmokeStatus({ status: "running", title: document.title });

    void (async () => {
      try {
        const shellInfo = await daemonApp.getShellInfo();
        const initialState = await daemonApp.getState();
        const initialRuntimeStates = await daemonApp.getRuntimeState();
        const connectedState = await daemonApp.connectServer("https://app.slock.ai");
        const providerState = await daemonApp.addProvider("openai");
        const finalState = await daemonApp.getState();

        if (cancelled) {
          return;
        }

        document.documentElement.dataset.daemonAppSmokeResult = JSON.stringify({
          title: document.title,
          hasDaemonApp: true,
          shellInfo,
          initialState: {
            currentView: initialState.currentView,
            connectedServers: initialState.connectedServers.length,
            providers: initialState.providers.length,
          },
          initialRuntimeStates: initialRuntimeStates.length,
          connectedState: {
            currentView: connectedState.currentView,
            connectedServers: connectedState.connectedServers.length,
            currentServerId: connectedState.currentServerId,
          },
          providerState: {
            currentView: providerState.currentView,
            providers: providerState.providers.length,
          },
          finalState: {
            currentView: finalState.currentView,
            connectedServers: finalState.connectedServers.length,
            providers: finalState.providers.length,
          },
        });
        document.documentElement.dataset.daemonAppSmokeStatus = "passed";
        daemonApp.reportSmokeStatus({
          status: "passed",
          title: document.title,
          result: document.documentElement.dataset.daemonAppSmokeResult,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        document.documentElement.dataset.daemonAppSmokeError =
          error instanceof Error ? error.message : "renderer smoke flow failed";
        document.documentElement.dataset.daemonAppSmokeStatus = "failed";
        daemonApp.reportSmokeStatus({
          status: "failed",
          title: document.title,
          error: document.documentElement.dataset.daemonAppSmokeError,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [smokeMode]);

  const setCurrentView = (view: DaemonViewState) => {
    setErrorMessage(null);
    void window.daemonApp?.setCurrentView(view).then((next) => {
      setAppState(next);
    });
  };

  const setServerUrlDraft = (draft: string) => {
    setErrorMessage(null);
    setAppState((current) => (current ? { ...current, serverUrlDraft: draft } : current));
    void window.daemonApp?.setServerUrlDraft(draft).then((next) => {
      setAppState(next);
    });
  };

  const connectServerFromLogin = async ({ authenticateInApp }: { authenticateInApp: boolean }) => {
    if (!appState?.serverUrlDraft.trim() || !window.daemonApp) {
      return;
    }

    try {
      setErrorMessage(null);
      const next = await window.daemonApp.connectServer(appState.serverUrlDraft);
      setAppState(next);
      refreshRuntimeStates();
      refreshWorkspaceDirectories();
      refreshRemoteMachines();
      const nextCurrentServer = next.connectedServers.find((server) => server.id === next.currentServerId);
      if (
        nextCurrentServer &&
        authenticateInApp &&
        buildLoginEntryState(shellInfo?.localEncryptionAvailable ?? false).shouldAuthenticateInApp
      ) {
        const authenticated = await window.daemonApp.authenticateBrowserSession(nextCurrentServer.id);
        setAppState(authenticated);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === "Invalid URL") {
        setErrorMessage("Please enter a valid server URL.");
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : "Failed to save the server URL.");
    }
  };

  const handleLogin = async () => {
    await connectServerFromLogin({
      authenticateInApp: true,
    });
  };

  const handleUseMachineKeyInstead = () => {
    setErrorMessage(null);
    setShowMachineKeyLogin(true);
  };

  const handleCancelMachineKeyLogin = async () => {
    if (!window.daemonApp) {
      setShowMachineKeyLogin(false);
      setLoginMachineBootstrapDraft("");
      return;
    }

    try {
      setErrorMessage(null);
      if (currentServer) {
        const next = await window.daemonApp.removeServer(currentServer.id);
        setAppState(next);
        refreshRuntimeStates();
        refreshWorkspaceDirectories();
        refreshRemoteMachines();
      }
      setShowMachineKeyLogin(false);
      setLoginMachineBootstrapDraft("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to cancel manual machine key setup.");
    }
  };

  const handleImportMachineKeyFromLogin = async () => {
    if (!appState?.serverUrlDraft.trim() || !loginMachineBootstrapDraft.trim() || !window.daemonApp) {
      return;
    }

    try {
      setErrorMessage(null);
      let nextState = appState;
      let nextCurrentServer = currentServer;

      if (!nextCurrentServer) {
        nextState = await window.daemonApp.connectServer(appState.serverUrlDraft);
        setAppState(nextState);
        refreshRuntimeStates();
        refreshWorkspaceDirectories();
        refreshRemoteMachines();
        nextCurrentServer =
          nextState.connectedServers.find((server) => server.id === nextState.currentServerId) ?? null;
      }

      if (!nextCurrentServer) {
        throw new Error("Failed to save this server locally before importing the machine key.");
      }

      const states = await window.daemonApp.importMachineBootstrap(nextCurrentServer.id, loginMachineBootstrapDraft);
      setRuntimeStates(states);
      setLoginMachineBootstrapDraft("");
      setShowMachineKeyLogin(false);
      setManualBootstrapFallbackOpenByServer((current) => ({
        ...current,
        [nextCurrentServer.id]: false,
      }));
      refreshRemoteMachines();
      refreshWorkspaceDirectories();
    } catch (error) {
      if (error instanceof TypeError && error.message === "Invalid URL") {
        setErrorMessage("Please enter a valid server URL.");
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : "Failed to import the local machine key.");
    }
  };

  const authenticateBrowserSession = () => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.authenticateBrowserSession(currentServer.id).then((next) => {
      setAppState(next);
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to sign in with Slock.");
    });
  };

  const clearUserSession = () => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.clearUserSession(currentServer.id).then((next) => {
      setAppState(next);
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to clear the local Slock login session.");
    });
  };

  const selectServer = (serverId: string) => {
    setErrorMessage(null);
    void window.daemonApp?.selectServer(serverId).then((next) => {
      setAppState(next);
      refreshRuntimeStates();
      refreshWorkspaceDirectories();
      refreshRemoteMachines();
    });
  };

  const removeServer = (serverId: string) => {
    const server = appState?.connectedServers.find((entry) => entry.id === serverId);
    const runtimeState = getRuntimeState(runtimeStates, serverId);
    const hasLiveRuntime = runtimeState ? runtimeState.phase !== "stopped" : false;
    const warning = hasLiveRuntime
      ? `Remove ${server?.name ?? "this server"}? This will stop the embedded daemon first, then clear the local slot, machine key, and saved Slock session.`
      : `Remove ${server?.name ?? "this server"}? This clears the local slot, machine key, and saved Slock session.`;
    if (!window.confirm(warning)) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp?.removeServer(serverId).then((next) => {
      setAppState(next);
      setMachineBootstrapDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[serverId];
        return nextDrafts;
      });
      setManualBootstrapFallbackOpenByServer((current) => {
        const nextVisibility = { ...current };
        delete nextVisibility[serverId];
        return nextVisibility;
      });
      setRemoteMachineSelections((current) => {
        const nextSelections = { ...current };
        delete nextSelections[serverId];
        return nextSelections;
      });
      refreshRuntimeStates();
      refreshWorkspaceDirectories();
      refreshRemoteMachines();
    });
  };

  const refreshServer = (serverId: string) => {
    if (!window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.refreshServerContext(serverId).then((states) => {
      setRuntimeStates(states);
      refreshRemoteMachines();
      refreshWorkspaceDirectories();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to refresh this daemon-app server slot.");
    });
  };

  const selectRemoteServer = (remoteServerId: string) => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    if (currentRuntime?.hasMachineApiKey && currentServer.remoteServerId !== remoteServerId) {
      setErrorMessage("Clear the attached machine key before switching Slock workspaces on this server slot.");
      return;
    }

    setErrorMessage(null);
    void window.daemonApp.selectRemoteServer(currentServer.id, remoteServerId).then((next) => {
      setAppState(next);
      refreshRemoteMachines();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to switch the active Slock workspace.");
    });
  };

  const selectRemoteMachine = (machineId: string) => {
    if (!currentServer) {
      return;
    }
    setRemoteMachineSelections((current) => ({
      ...current,
      [currentServer.id]: machineId,
    }));
  };

  const setMachineBootstrapDraft = (value: string) => {
    if (!currentServer) {
      return;
    }
    setMachineBootstrapDrafts((current) => ({
      ...current,
      [currentServer.id]: value,
    }));
  };

  const toggleManualBootstrapFallback = () => {
    if (!currentServer) {
      return;
    }
    setManualBootstrapFallbackOpenByServer((current) => ({
      ...current,
      [currentServer.id]: !(current[currentServer.id] ?? false),
    }));
  };

  const addProvider = (kind: ProviderKind) => {
    if (!shellInfo?.localEncryptionAvailable) {
      setErrorMessage("Local secret encryption is unavailable in this environment, so provider setup is disabled.");
      return;
    }
    setErrorMessage(null);
    void window.daemonApp?.addProvider(kind).then((next) => {
      setAppState(next);
    });
  };

  const setProviderApiKeyDraft = (providerId: string, value: string) => {
    setProviderApiKeyDrafts((current) => ({ ...current, [providerId]: value }));
  };

  const setProviderEndpointDraft = (providerId: string, value: string) => {
    setProviderEndpointDrafts((current) => ({ ...current, [providerId]: value }));
  };

  const saveProviderCredentials = (providerId: string) => {
    if (!window.daemonApp || !appState) {
      return;
    }
    const provider = appState.providers.find((entry) => entry.id === providerId);
    const apiKey = providerApiKeyDrafts[providerId]?.trim();
    if (!provider || !apiKey) {
      return;
    }

    setErrorMessage(null);
    void window.daemonApp
      .saveProviderCredentials(providerId, apiKey, providerEndpointDrafts[providerId] ?? provider.endpoint)
      .then((next) => {
        setAppState(next);
        setProviderApiKeyDrafts((current) => ({ ...current, [providerId]: "" }));
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Failed to save local provider credentials.");
      });
  };

  const clearProviderCredentials = (providerId: string) => {
    if (!window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.clearProviderCredentials(providerId).then((next) => {
      setAppState(next);
      setProviderApiKeyDrafts((current) => ({ ...current, [providerId]: "" }));
      setProviderEndpointDrafts((current) => ({ ...current, [providerId]: "" }));
    });
  };

  const removeProvider = (providerId: string) => {
    setErrorMessage(null);
    void window.daemonApp?.removeProvider(providerId).then((next) => {
      setAppState(next);
    });
  };

  const testProvider = (providerId: string) => {
    setErrorMessage(null);
    void window.daemonApp?.testProvider(providerId).then((next) => {
      setAppState(next);
    });
  };

  const openSlockUrl = (url: string | null) => {
    if (!url) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp?.openExternal(url);
  };

  const revealManagedPath = (pathKind: "user-data" | "state-file" | "secret-file") => {
    setErrorMessage(null);
    void window.daemonApp?.revealManagedPath(pathKind).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to open the local daemon-app path.");
    });
  };

  const copyText = (value: string, label: string) => {
    setErrorMessage(null);
    void window.daemonApp?.copyText(value).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : `Failed to copy ${label}.`);
    });
  };

  const openServerRuntimeDirectory = (serverId: string | null) => {
    if (!serverId || !window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.openServerRuntimeDirectory(serverId).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to open the local runtime directory.");
    });
  };

  const openWorkspaceDirectory = (directoryName: string) => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.openWorkspaceDirectory(currentServer.id, directoryName).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to open the local workspace directory.");
    });
  };

  const deleteWorkspaceDirectory = (directoryName: string) => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    const workspace = workspaceDirectories.find(
      (entry) => entry.serverId === currentServer.id && entry.directoryName === directoryName,
    );
    const label = workspace ? getWorkspaceLabel(workspace, currentAgents) : directoryName;
    const confirmed = window.confirm(
      `Delete the local workspace for ${label}? This removes the directory from this machine only.`,
    );
    if (!confirmed) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp
      .deleteWorkspaceDirectory(currentServer.id, directoryName)
      .then(() => {
        refreshWorkspaceDirectories();
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Failed to delete the local workspace directory.");
      });
  };

  const importMachineBootstrap = () => {
    if (!currentServer || !window.daemonApp || !machineBootstrapDraft.trim()) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp
      .importMachineBootstrap(currentServer.id, machineBootstrapDraft)
      .then((states) => {
        setRuntimeStates(states);
        setMachineBootstrapDrafts((current) => ({
          ...current,
          [currentServer.id]: "",
        }));
        setManualBootstrapFallbackOpenByServer((current) => ({
          ...current,
          [currentServer.id]: false,
        }));
        refreshRemoteMachines();
        refreshWorkspaceDirectories();
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Failed to import the local machine bootstrap command.");
      });
  };

  const registerMachine = () => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.registerMachine(currentServer.id).then((states) => {
      setRuntimeStates(states);
      setMachineBootstrapDrafts((current) => ({
        ...current,
        [currentServer.id]: "",
      }));
      setManualBootstrapFallbackOpenByServer((current) => ({
        ...current,
        [currentServer.id]: false,
      }));
      refreshRemoteMachines();
      refreshWorkspaceDirectories();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to register this machine from the daemon app.");
    });
  };

  const attachExistingMachine = () => {
    if (!currentServer || !window.daemonApp || !selectedRemoteMachine) {
      return;
    }

    const warning = currentMachine && currentMachine.machineId !== selectedRemoteMachine.id
      ? `Attach ${selectedRemoteMachine.name}? This rotates its machine key and replaces the machine currently attached to this server slot (${currentMachine.name}).`
      : `Attach ${selectedRemoteMachine.name}? This rotates its machine key and saves it into this daemon app.`;
    if (!window.confirm(warning)) {
      return;
    }

    setErrorMessage(null);
    void window.daemonApp.attachExistingMachine(currentServer.id, selectedRemoteMachine.id).then((states) => {
      setRuntimeStates(states);
      setManualBootstrapFallbackOpenByServer((current) => ({
        ...current,
        [currentServer.id]: false,
      }));
      setRemoteMachineSelections((current) => ({
        ...current,
        [currentServer.id]: selectedRemoteMachine.id,
      }));
      refreshRemoteMachines();
      refreshWorkspaceDirectories();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to attach the selected remote machine.");
    });
  };

  const clearMachineApiKey = () => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    const warning = currentRuntime && currentRuntime.phase !== "stopped"
      ? `Clear the machine key for ${currentServer.name}? This will stop the embedded daemon first.`
      : `Clear the machine key for ${currentServer.name}?`;
    if (!window.confirm(warning)) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.clearMachineApiKey(currentServer.id).then((states) => {
      setRuntimeStates(states);
      refreshWorkspaceDirectories();
    });
  };

  const startLocalDaemon = () => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.startLocalDaemon(currentServer.id).then((states) => {
      setRuntimeStates(states);
      refreshWorkspaceDirectories();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to start the embedded daemon.");
    });
  };

  const stopLocalDaemon = () => {
    if (!currentServer || !window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.stopLocalDaemon(currentServer.id).then((states) => {
      setRuntimeStates(states);
      refreshWorkspaceDirectories();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to stop the embedded daemon.");
    });
  };

  const startServerDaemon = (serverId: string) => {
    if (!window.daemonApp) {
      return;
    }
    const server = appState?.connectedServers.find((entry) => entry.id === serverId);
    const replacementRuntime = runtimeStates.find(
      (entry) => entry.serverId !== serverId && entry.phase !== "stopped",
    );
    if (replacementRuntime) {
      const replacementServer = appState?.connectedServers.find(
        (entry) => entry.id === replacementRuntime.serverId,
      );
      const confirmed = window.confirm(
        `Start ${server?.name ?? "this server"}? This will stop the embedded daemon currently attached to ${replacementServer?.name ?? "another server slot"}.`,
      );
      if (!confirmed) {
        return;
      }
    }
    setErrorMessage(null);
    void window.daemonApp.startLocalDaemon(serverId).then((states) => {
      setRuntimeStates(states);
      refreshWorkspaceDirectories();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to start the embedded daemon.");
    });
  };

  const stopServerDaemon = (serverId: string) => {
    if (!window.daemonApp) {
      return;
    }
    setErrorMessage(null);
    void window.daemonApp.stopLocalDaemon(serverId).then((states) => {
      setRuntimeStates(states);
      refreshWorkspaceDirectories();
    }).catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to stop the embedded daemon.");
    });
  };

  let content: JSX.Element;
  if (showMachineKeyLogin) {
    content = (
      <DaemonMachineKeyLogin
        serverUrl={appState?.serverUrlDraft ?? "https://app.slock.ai"}
        machineBootstrap={loginMachineBootstrapDraft}
        serverUrlLocked={Boolean(currentServer)}
        onServerUrlChange={setServerUrlDraft}
        onMachineBootstrapChange={setLoginMachineBootstrapDraft}
        onImport={handleImportMachineKeyFromLogin}
        onBack={() => {
          void handleCancelMachineKeyLogin();
        }}
      />
    );
  } else {
    switch (effectiveViewState) {
      case "setup":
        content = (
          <DaemonProviderSetup
            currentServer={currentServer}
            localEncryptionAvailable={shellInfo?.localEncryptionAvailable ?? false}
            existingProviderKinds={existingProviderKinds}
            configuredProviderKinds={configuredProviderKinds}
            systemProviders={appState?.systemProviders ?? []}
            onAddProvider={addProvider}
            onSkip={() => setCurrentView("dashboard")}
          />
        );
        break;
      case "dashboard":
        content = (
          <DaemonDashboard
            currentServer={currentServer}
            providerCount={configuredProviderCount}
            providerActionLabel={providerActionLabel}
            providerBanner={providerBanner}
            machineState={currentMachine}
            runtimeState={currentRuntime}
            agents={currentAgents}
            activityLog={appState?.activityLog ?? []}
            onOpenProviders={() =>
              setCurrentView(
                (appState?.providers.length ?? 0) + (appState?.systemProviders?.length ?? 0) > 0
                  ? "providers"
                  : "setup",
              )}
            onOpenSlock={() => openSlockUrl(currentServer ? getServerSlotSlockUrl(currentServer, currentMachine) : null)}
            onOpenShell={() => setShellPanelOpen(true)}
          />
        );
        break;
      case "providers":
        content = (
          <DaemonProviders
            currentServer={currentServer}
            agentCount={currentAgents.length}
            providers={appState?.providers ?? []}
            systemProviders={appState?.systemProviders ?? []}
            localEncryptionAvailable={shellInfo?.localEncryptionAvailable ?? false}
            providerApiKeyDrafts={providerApiKeyDrafts}
            providerEndpointDrafts={providerEndpointDrafts}
            onProviderApiKeyDraftChange={setProviderApiKeyDraft}
            onProviderEndpointDraftChange={setProviderEndpointDraft}
            onGoToDashboard={() => setCurrentView("dashboard")}
            onGoToSetup={() => setCurrentView("setup")}
            onOpenSlock={() => openSlockUrl(currentServer ? getServerSlotSlockUrl(currentServer, currentMachine) : null)}
            onOpenShell={() => setShellPanelOpen(true)}
            onSaveProviderCredentials={saveProviderCredentials}
            onClearProviderCredentials={clearProviderCredentials}
            onRemoveProvider={removeProvider}
            onTestProvider={testProvider}
          />
        );
        break;
      case "login":
      default:
        content = (
          <DaemonLogin
            serverUrl={appState?.serverUrlDraft ?? "https://app.slock.ai"}
            savedServerCount={appState?.connectedServers.length ?? 0}
            localEncryptionAvailable={shellInfo?.localEncryptionAvailable ?? false}
            onServerUrlChange={setServerUrlDraft}
            onLogin={handleLogin}
            onUseMachineKeyInstead={handleUseMachineKeyInstead}
          />
        );
        break;
    }
  }

  return (
    <>
      {content}
      {shellPanelOpen ? (
        <ConnectedServersPanel
          appState={appState}
          currentServer={currentServer}
          runtimeStates={runtimeStates}
          daemonLogs={daemonLogs}
          machineStates={machineStates}
          machineAgents={machineAgents}
          remoteMachines={remoteMachines}
          workspaceDirectories={workspaceDirectories}
          userDataPath={shellInfo?.userDataPath ?? null}
          stateFilePath={shellInfo?.stateFilePath ?? null}
          secretFilePath={shellInfo?.secretFilePath ?? null}
          localEncryptionAvailable={shellInfo?.localEncryptionAvailable ?? false}
          machineBootstrapDraft={machineBootstrapDraft}
          showManualBootstrapFallback={showManualBootstrapFallback}
          selectedRemoteMachineId={selectedRemoteMachine?.id ?? ""}
          onMachineBootstrapDraftChange={setMachineBootstrapDraft}
          onToggleManualBootstrapFallback={toggleManualBootstrapFallback}
          onSelectRemoteMachine={selectRemoteMachine}
          onAddServer={() => setCurrentView("login")}
          onSelectServer={selectServer}
          onRefreshServer={refreshServer}
          onStartServerDaemon={startServerDaemon}
          onStopServerDaemon={stopServerDaemon}
          onRemoveServer={removeServer}
          onAuthenticateBrowserSession={authenticateBrowserSession}
          onClearUserSession={clearUserSession}
          onSelectRemoteServer={selectRemoteServer}
          onImportMachineBootstrap={importMachineBootstrap}
          onRegisterMachine={registerMachine}
          onAttachExistingMachine={attachExistingMachine}
          onClearMachineApiKey={clearMachineApiKey}
          onStartLocalDaemon={startLocalDaemon}
          onStopLocalDaemon={stopLocalDaemon}
          onOpenServerRuntimeDirectory={openServerRuntimeDirectory}
          onCopyText={copyText}
          onOpenWorkspaceDirectory={openWorkspaceDirectory}
          onDeleteWorkspaceDirectory={deleteWorkspaceDirectory}
          onOpenSlock={openSlockUrl}
          onRevealManagedPath={revealManagedPath}
          onClose={() => setShellPanelOpen(false)}
        />
      ) : null}
      {errorMessage ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 border-2 border-black bg-brutal-orange px-4 py-2 shadow-brutal">
          <div className="text-xs font-bold text-black">Daemon Error</div>
          <div className="mt-1 text-[11px] font-mono text-black/70">{errorMessage}</div>
        </div>
      ) : null}
    </>
  );
}
