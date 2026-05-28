import type { AgentOrchestrator } from "./agentOrchestrator.js";

type MachineReadModelInput = {
  id: string;
  serverId: string;
  userId: string;
  name: string;
  apiKeyPrefix: string | null;
  runtimes: string[] | null;
  hostname: string | null;
  os: string | null;
  daemonVersion: string | null;
  lastHeartbeat: Date | null;
  createdAt: Date;
};

export type MachineReadModel = MachineReadModelInput & {
  status: "online" | "offline";
  statusVersion: number;
  runtimes: string[];
  daemonVersion: string | null;
};

export async function buildMachineReadModel(
  machine: MachineReadModelInput,
  agentOrchestrator: Pick<AgentOrchestrator, "getMachineStatus" | "getMachineStatusVersion" | "getMachineDaemonVersion">,
): Promise<MachineReadModel> {
  const liveDaemonVersion = agentOrchestrator.getMachineDaemonVersion(machine.id);
  const [status, statusVersion] = await Promise.all([
    agentOrchestrator.getMachineStatus(machine.id),
    agentOrchestrator.getMachineStatusVersion(machine.id),
  ]);
  return {
    ...machine,
    status,
    statusVersion,
    runtimes: machine.runtimes || [],
    hostname: machine.hostname ?? null,
    os: machine.os ?? null,
    lastHeartbeat: machine.lastHeartbeat ?? null,
    daemonVersion: liveDaemonVersion ?? machine.daemonVersion ?? null,
  };
}
