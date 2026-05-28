import type { ConnectedServer, MachineShellState } from "./model";
import { hasDaemonVersionUpdate } from "./daemonVersion";

export interface ServerSlotSummary {
  sessionLabel: string;
  workspaceLabel: string;
  workspaceSlug: string | null;
  machineName: string | null;
  machineStatus: MachineShellState["status"] | null;
  daemonVersion: string | null;
  latestDaemonVersion: string | null;
  hasDaemonUpdate: boolean;
  remoteMachineCount: number;
  localWorkspaceCount: number;
}

export function getServerSlotWorkspaceLabel(
  server: ConnectedServer,
  machine: MachineShellState | null,
): string {
  return (
    server.remoteServerName ??
    machine?.workspaceName ??
    server.remoteServerSlug ??
    (machine?.serverSlug ? `${machine.serverSlug} (attached machine)` : null) ??
    "not selected"
  );
}

export function getServerSlotSlockUrl(
  server: ConnectedServer,
  machine: MachineShellState | null,
): string {
  const serverSlug = machine?.serverSlug ?? server.remoteServerSlug;
  if (!serverSlug) {
    return server.url;
  }
  return new URL(`/s/${serverSlug}/settings/server`, server.url).toString();
}

export function buildServerSlotSummary(params: {
  server: ConnectedServer;
  machine: MachineShellState | null;
  remoteMachineCount: number;
  localWorkspaceCount: number;
}): ServerSlotSummary {
  const { server, machine, remoteMachineCount, localWorkspaceCount } = params;
  const daemonVersion = machine?.daemonVersion ?? null;
  const latestDaemonVersion = machine?.latestDaemonVersion ?? null;

  return {
    sessionLabel: server.userLabel ?? "not connected",
    workspaceLabel: getServerSlotWorkspaceLabel(server, machine),
    workspaceSlug: server.remoteServerSlug ?? machine?.serverSlug ?? null,
    machineName: machine?.name ?? null,
    machineStatus: machine?.status ?? null,
    daemonVersion,
    latestDaemonVersion,
    hasDaemonUpdate: hasDaemonVersionUpdate(daemonVersion, latestDaemonVersion),
    remoteMachineCount,
    localWorkspaceCount,
  };
}
