import type { MachineShellState, RemoteMachineOption } from "./model";

export function mergeAttachedMachineIntoRemoteMachines(
  machines: RemoteMachineOption[],
  machine: MachineShellState,
): RemoteMachineOption[] {
  let changed = false;
  const next = machines.map((entry) => {
    if (entry.id !== machine.machineId) {
      return entry;
    }

    changed = true;
    return {
      ...entry,
      name: machine.name,
      status: machine.status,
      apiKeyPrefix: machine.apiKeyPrefix,
      runtimes: machine.runtimes,
      daemonVersion: machine.daemonVersion,
      lastHeartbeat: machine.lastHeartbeat,
    };
  });

  return changed ? next : machines;
}
