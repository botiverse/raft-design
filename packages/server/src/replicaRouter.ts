/**
 * ReplicaRouter: Cross-replica communication layer using Redis pub/sub.
 *
 * Each replica subscribes to its own channel (`replica:{replicaId}`) and a
 * shared broadcast channel (`replica:broadcast`). When a replica needs to send
 * a command to a machine connected on another replica, it publishes to that
 * replica's channel. The receiving replica picks it up and forwards to the
 * local WebSocket connection.
 *
 * Machine→replica mapping is stored in Redis: `machine:{machineId}:replica` → replicaId
 */
import crypto from "node:crypto";
import { getRedis, getRedisReplicaSub, isRedisAvailable } from "./redis.js";
import type { ServerToMachineMessage, AgentMessage } from "@slock-ai/shared";

// Each server instance gets a unique ID
export const REPLICA_ID = crypto.randomUUID();

// Fly.io instance ID for fly-replay header routing
const FLY_INSTANCE = process.env.FLY_MACHINE_ID || process.env.FLY_ALLOC_ID || null;

type MachineCommandHandler = (machineId: string, message: ServerToMachineMessage) => void;
type InboxDeliveryHandler = (agentId: string, machineId: string | null, message: AgentMessage) => void;

let _machineCommandHandler: MachineCommandHandler | null = null;
let _inboxDeliveryHandler: InboxDeliveryHandler | null = null;

const MACHINE_REPLICA_TTL = 300; // 5 minutes, refreshed on heartbeat
const CHANNEL_PREFIX = "slock:replica:";
const machineReplicaKey = (machineId: string) => `slock:machine:${machineId}:replica`;
const machineFlyKey = (machineId: string) => `slock:machine:${machineId}:fly`;
const machineStatusVersionKey = (machineId: string) => `slock:machine:${machineId}:status_version`;
const CONDITIONAL_UNREGISTER_MACHINE_LUA = `
  local currentReplica = redis.call("GET", KEYS[1])
  if currentReplica ~= ARGV[1] then
    return 0
  end

  redis.call("DEL", KEYS[1], KEYS[2])
  return 1
`;

interface ReplicaMessage {
  type: "machine:command" | "inbox:deliver";
  machineId?: string;
  agentId?: string;
  payload: unknown;
}

/**
 * Initialize the replica router. Call after Redis is initialized.
 * Sets up subscription on this replica's channel for incoming cross-replica commands.
 */
export async function initReplicaRouter(
  onMachineCommand: MachineCommandHandler,
  onInboxDelivery: InboxDeliveryHandler,
) {
  if (!isRedisAvailable()) return;

  _machineCommandHandler = onMachineCommand;
  _inboxDeliveryHandler = onInboxDelivery;

  // Use the dedicated replica subscriber connection (tracked by redis.ts for shutdown)
  const sub = getRedisReplicaSub();
  await sub.subscribe(`${CHANNEL_PREFIX}${REPLICA_ID}`);

  sub.on("message", (_channel: string, raw: string) => {
    try {
      const msg: ReplicaMessage = JSON.parse(raw);
      if (msg.type === "machine:command" && msg.machineId && _machineCommandHandler) {
        _machineCommandHandler(msg.machineId, msg.payload as ServerToMachineMessage);
      } else if (msg.type === "inbox:deliver" && msg.agentId && _inboxDeliveryHandler) {
        _inboxDeliveryHandler(msg.agentId, msg.machineId ?? null, msg.payload as AgentMessage);
      }
    } catch (err) {
      console.error("[ReplicaRouter] Failed to parse message:", err);
    }
  });

  console.log(`[ReplicaRouter] Replica ${REPLICA_ID.slice(0, 8)} listening`);
}

/**
 * Register that a machine is connected to THIS replica.
 * Called when a daemon WebSocket connects.
 */
export async function registerMachineReplica(machineId: string) {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(machineReplicaKey(machineId), REPLICA_ID, "EX", MACHINE_REPLICA_TTL);
  if (FLY_INSTANCE) {
    pipeline.set(machineFlyKey(machineId), FLY_INSTANCE, "EX", MACHINE_REPLICA_TTL);
  }
  await pipeline.exec();
}

/**
 * Refresh the machine→replica mapping TTL. Called on each heartbeat pong.
 */
export async function refreshMachineReplica(machineId: string) {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  const pipeline = redis.pipeline();
  // Re-set the mapping instead of only EXPIRE-ing it so heartbeat refresh can
  // recover if Redis was flushed, the key expired, or the mapping was evicted.
  pipeline.set(machineReplicaKey(machineId), REPLICA_ID, "EX", MACHINE_REPLICA_TTL);
  if (FLY_INSTANCE) {
    pipeline.set(machineFlyKey(machineId), FLY_INSTANCE, "EX", MACHINE_REPLICA_TTL);
  }
  pipeline.expire(machineStatusVersionKey(machineId), MACHINE_REPLICA_TTL);
  await pipeline.exec();
}

export async function hasMachineReplica(machineId: string): Promise<boolean> {
  if (!isRedisAvailable()) return false;
  const redis = getRedis();
  return !!(await redis.get(machineReplicaKey(machineId)));
}

export async function getMachineReplicaOwner(machineId: string): Promise<string | null> {
  if (!isRedisAvailable()) return null;
  const redis = getRedis();
  return await redis.get(machineReplicaKey(machineId));
}

export async function bumpMachineStatusVersion(machineId: string): Promise<number> {
  if (!isRedisAvailable()) return 0;
  const redis = getRedis();
  const key = machineStatusVersionKey(machineId);
  const version = await redis.incr(key);
  await redis.expire(key, MACHINE_REPLICA_TTL);
  return version;
}

export async function getMachineStatusVersion(machineId: string): Promise<number> {
  if (!isRedisAvailable()) return 0;
  const redis = getRedis();
  const raw = await redis.get(machineStatusVersionKey(machineId));
  return raw ? Number(raw) || 0 : 0;
}

/**
 * Unregister machine→replica mapping. Called on disconnect.
 */
export async function unregisterMachineReplica(machineId: string) {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  await redis.eval(
    CONDITIONAL_UNREGISTER_MACHINE_LUA,
    2,
    machineReplicaKey(machineId),
    machineFlyKey(machineId),
    REPLICA_ID,
  );
}

/**
 * Send a command to a machine. If the machine is on this replica, returns false
 * (caller should send directly). If on another replica, publishes via Redis and returns true.
 * If machine location is unknown, returns false.
 */
export async function routeMachineCommand(
  machineId: string,
  message: ServerToMachineMessage,
  localMachineIds: Set<string>,
): Promise<boolean> {
  if (!isRedisAvailable()) return false;
  if (localMachineIds.has(machineId)) return false;

  const redis = getRedis();
  const targetReplica = await redis.get(machineReplicaKey(machineId));
  if (!targetReplica || targetReplica === REPLICA_ID) return false;

  const msg: ReplicaMessage = {
    type: "machine:command",
    machineId,
    payload: message,
  };
  await redis.publish(`${CHANNEL_PREFIX}${targetReplica}`, JSON.stringify(msg));
  return true;
}

/**
 * Route a message to an agent's inbox on the correct replica.
 * Returns true if routed cross-replica, false if should be handled locally.
 */
export async function routeInboxDelivery(
  agentId: string,
  machineId: string | null,
  message: AgentMessage,
  localMachineIds: Set<string>,
): Promise<boolean> {
  if (!isRedisAvailable() || !machineId) return false;
  if (localMachineIds.has(machineId)) return false;

  const redis = getRedis();
  const targetReplica = await redis.get(machineReplicaKey(machineId));
  if (!targetReplica || targetReplica === REPLICA_ID) return false;

  const msg: ReplicaMessage = {
    type: "inbox:deliver",
    machineId,
    agentId,
    payload: message,
  };
  await redis.publish(`${CHANNEL_PREFIX}${targetReplica}`, JSON.stringify(msg));
  return true;
}

// --- Distributed lock for agent waking ---

/**
 * Try to acquire a distributed lock for waking an agent.
 * Returns true if lock acquired, false if another replica already holds it.
 * Lock auto-expires after 30 seconds.
 */
export async function acquireWakeLock(agentId: string): Promise<boolean> {
  if (!isRedisAvailable()) return true; // No Redis = single replica, always succeed
  const redis = getRedis();
  const result = await redis.set(`slock:agent:${agentId}:waking`, REPLICA_ID, "EX", 30, "NX");
  return result === "OK";
}

/**
 * Release the wake lock for an agent.
 */
export async function releaseWakeLock(agentId: string) {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  await redis.del(`slock:agent:${agentId}:waking`);
}

// --- Agent activity & maxSeq in Redis ---

/**
 * Store agent activity in Redis for cross-replica consistency.
 */
export async function setAgentActivity(agentId: string, activity: string, detail: string) {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  const key = `slock:agent:${agentId}:activity`;
  const pipeline = redis.pipeline();
  pipeline.hset(key, "activity", activity, "detail", detail, "updatedAt", String(Date.now()));
  pipeline.expire(key, 600); // 10 min TTL
  await pipeline.exec();
}

/**
 * Get agent activity from Redis.
 */
export async function getAgentActivity(agentId: string): Promise<{ activity: string; detail: string; updatedAt: number } | null> {
  if (!isRedisAvailable()) return null;
  const redis = getRedis();
  const data = await redis.hgetall(`slock:agent:${agentId}:activity`);
  if (!data.activity) return null;
  return { activity: data.activity, detail: data.detail || "", updatedAt: Number(data.updatedAt) || 0 };
}

/**
 * Update max message seq per server in Redis.
 */
export async function updateMaxSeqRedis(serverId: string, seq: number) {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  // Use Lua script for atomic compare-and-set
  const script = `
    local current = tonumber(redis.call('get', KEYS[1]) or '0')
    if tonumber(ARGV[1]) > current then
      redis.call('set', KEYS[1], ARGV[1])
    end
    return 1
  `;
  await redis.eval(script, 1, `slock:server:${serverId}:maxseq`, String(seq));
}

/**
 * Get max message seq from Redis (falls back to 0).
 */
export async function getMaxSeqRedis(serverId: string): Promise<number> {
  if (!isRedisAvailable()) return 0;
  const redis = getRedis();
  const val = await redis.get(`slock:server:${serverId}:maxseq`);
  return val ? Number(val) : 0;
}

// --- Fly.io replica affinity ---

/** Returns true if running on Fly.io (FLY_MACHINE_ID or FLY_ALLOC_ID set). */
export function isFlyEnvironment(): boolean {
  return FLY_INSTANCE !== null;
}

/**
 * Get the Fly instance ID for the replica hosting this machine.
 * Returns null if: not on Fly, machine not found, or machine is on THIS instance.
 */
export async function getFlyInstanceForMachine(machineId: string): Promise<string | null> {
  if (!isRedisAvailable() || !FLY_INSTANCE) return null;
  const redis = getRedis();
  const flyId = await redis.get(`slock:machine:${machineId}:fly`);
  if (!flyId || flyId === FLY_INSTANCE) return null;
  return flyId;
}
