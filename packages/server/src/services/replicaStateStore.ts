import {
  registerMachineReplica,
  unregisterMachineReplica,
  refreshMachineReplica,
  hasMachineReplica,
  getMachineReplicaOwner,
  bumpMachineStatusVersion,
  getMachineStatusVersion,
  acquireWakeLock,
  releaseWakeLock,
  setAgentActivity,
  getAgentActivity,
} from "../replicaRouter.js";
import { isRedisAvailable } from "../redis.js";

export interface ReplicaStateStore {
  isAvailable(): boolean;
  registerMachineReplica(machineId: string): Promise<void>;
  unregisterMachineReplica(machineId: string): Promise<void>;
  refreshMachineReplica(machineId: string): Promise<void>;
  hasMachineReplica(machineId: string): Promise<boolean>;
  getMachineReplicaOwner(machineId: string): Promise<string | null>;
  bumpMachineStatusVersion(machineId: string): Promise<number>;
  getMachineStatusVersion(machineId: string): Promise<number>;
  acquireWakeLock(agentId: string): Promise<boolean>;
  releaseWakeLock(agentId: string): Promise<void>;
  setAgentActivity(agentId: string, activity: string, detail: string): Promise<void>;
  getAgentActivity(agentId: string): Promise<{ activity: string; detail: string; updatedAt: number } | null>;
}

export const redisReplicaStateStore: ReplicaStateStore = {
  isAvailable: () => isRedisAvailable(),
  registerMachineReplica,
  unregisterMachineReplica,
  refreshMachineReplica,
  hasMachineReplica,
  getMachineReplicaOwner,
  bumpMachineStatusVersion,
  getMachineStatusVersion,
  acquireWakeLock,
  releaseWakeLock,
  setAgentActivity,
  getAgentActivity,
};
