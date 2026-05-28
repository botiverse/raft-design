import { failpoints } from "@slock-ai/shared";

export interface MachineStatusRecoveryAgent {
  id: string;
  machineId: string | null;
}

export interface MachineStatusRecoveryEvent {
  machineId: string;
  status: "online" | "offline";
  statusVersion?: number;
}

export interface MachineStatusRecoveryDependencies {
  updateMachineStatus: (machineId: string, status: "online" | "offline", statusVersion?: number) => void;
  listAgents: () => readonly MachineStatusRecoveryAgent[];
  forceAgentOffline: (agentId: string) => void;
  reloadMachines: () => void;
  reloadAgents: () => void;
}

/**
 * Keep machine status handling symmetric on the web client.
 *
 * `offline` events force the affected agents offline immediately for fast UI
 * feedback. A later `online` event must do an authoritative reload; otherwise
 * the forced offline state can linger even though the daemon has already
 * reconnected and the browser socket itself never dropped.
 */
export async function handleMachineStatusRecoveryEvent(
  event: MachineStatusRecoveryEvent,
  deps: MachineStatusRecoveryDependencies,
): Promise<void> {
  deps.updateMachineStatus(event.machineId, event.status, event.statusVersion);

  if (event.status === "offline") {
    for (const agent of deps.listAgents()) {
      if (agent.machineId === event.machineId) {
        deps.forceAgentOffline(agent.id);
      }
    }
    return;
  }

  if (!failpoints.enabled) {
    deps.reloadMachines();
    deps.reloadAgents();
    return;
  }

  await failpoints.hit(
    "web.machineStatusRecovery.onlineAuthoritativeReload",
    { machineId: event.machineId, statusVersion: event.statusVersion ?? null },
    async () => {
      deps.reloadMachines();
      deps.reloadAgents();
    },
  );
}
