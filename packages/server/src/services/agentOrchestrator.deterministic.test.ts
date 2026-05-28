import assert from "node:assert/strict";
import test from "node:test";
import {
  __resetFailpointsForTests,
  __setFailpointsForTests,
  BasicTracer,
  eventsForSpan,
  formatTraceparent,
  InMemoryFailpointRegistry,
  MemoryTraceSink,
  parseTraceparent,
  type AgentMessage,
  type MachineToServerMessage,
  type ServerToMachineMessage,
  type TrajectoryEntry,
  type Tracer,
} from "@slock-ai/shared";
import { REPLICA_ID } from "../replicaRouter.js";
import {
  AgentOrchestrator,
  partitionTargetScopedMessagesUpToSeq,
  planRuntimeProfileHeartbeatNudgeAction,
  type AgentLifecycleEvent,
  type ReadyReconcilePlanAction,
} from "./agentOrchestrator.js";
import { buildMachineReadModel } from "./machineReadModel.js";
import type { ReplicaStateStore } from "./replicaStateStore.js";

type PersistedActivityHint = {
  activity: "online" | "thinking" | "working" | "offline";
  detail: string;
  updatedAt: number;
};

class InMemoryReplicaStateStore implements ReplicaStateStore {
  readonly machineReplicas = new Set<string>();
  readonly machineReplicaOwners = new Map<string, string>();
  readonly machineStatusVersions = new Map<string, number>();
  readonly agentActivities = new Map<string, { activity: string; detail: string; updatedAt: number }>();
  readonly wakeLocks = new Set<string>();

  isAvailable(): boolean {
    return true;
  }

  async registerMachineReplica(machineId: string): Promise<void> {
    this.machineReplicas.add(machineId);
    this.machineReplicaOwners.set(machineId, REPLICA_ID);
  }

  async unregisterMachineReplica(machineId: string): Promise<void> {
    this.machineReplicas.delete(machineId);
  }

  async refreshMachineReplica(machineId: string): Promise<void> {
    this.machineReplicas.add(machineId);
  }

  async hasMachineReplica(machineId: string): Promise<boolean> {
    return this.machineReplicas.has(machineId);
  }

  async getMachineReplicaOwner(machineId: string): Promise<string | null> {
    return this.machineReplicaOwners.get(machineId) ?? (this.machineReplicas.has(machineId) ? "remote-replica" : null);
  }

  async bumpMachineStatusVersion(machineId: string): Promise<number> {
    const next = (this.machineStatusVersions.get(machineId) ?? 0) + 1;
    this.machineStatusVersions.set(machineId, next);
    return next;
  }

  async getMachineStatusVersion(machineId: string): Promise<number> {
    return this.machineStatusVersions.get(machineId) ?? 0;
  }

  async acquireWakeLock(agentId: string): Promise<boolean> {
    if (this.wakeLocks.has(agentId)) return false;
    this.wakeLocks.add(agentId);
    return true;
  }

  async releaseWakeLock(agentId: string): Promise<void> {
    this.wakeLocks.delete(agentId);
  }

  async setAgentActivity(agentId: string, activity: string, detail: string): Promise<void> {
    this.agentActivities.set(agentId, { activity, detail, updatedAt: Date.now() });
  }

  async getAgentActivity(agentId: string): Promise<{ activity: string; detail: string; updatedAt: number } | null> {
    return this.agentActivities.get(agentId) ?? null;
  }
}

class BuggyReplicaFallbackStore extends InMemoryReplicaStateStore {
  override async hasMachineReplica(_machineId: string): Promise<boolean> {
    return false;
  }

  override async getMachineReplicaOwner(_machineId: string): Promise<string | null> {
    return null;
  }
}

class ExpireOnlyRefreshStore extends InMemoryReplicaStateStore {
  override async refreshMachineReplica(machineId: string): Promise<void> {
    if (!this.machineReplicas.has(machineId)) return;
    this.machineReplicas.add(machineId);
  }
}

class BuggyWakeLockStore extends InMemoryReplicaStateStore {
  override async acquireWakeLock(_agentId: string): Promise<boolean> {
    return true;
  }
}

class CountingReplicaOwnerStore extends InMemoryReplicaStateStore {
  ownerLookupCount = 0;

  override async getMachineReplicaOwner(machineId: string): Promise<string | null> {
    this.ownerLookupCount += 1;
    return super.getMachineReplicaOwner(machineId);
  }
}

type MachineReplicaMutationType = "register" | "unregister" | "refresh";
type MachineReplicaMutation = {
  type: MachineReplicaMutationType;
  machineId: string;
  replicaId: string;
};

class ControlledReplicaState {
  readonly machineOwners = new Map<string, string>();
  readonly machineStatusVersions = new Map<string, number>();
  readonly agentActivities = new Map<string, { activity: string; detail: string; updatedAt: number }>();
  readonly wakeLocks = new Set<string>();
  private readonly deferredMutations: Array<{ expected: MachineReplicaMutation; gate: Deferred<void> }> = [];

  deferNextMachineMutation(expected: MachineReplicaMutation): Deferred<void> {
    const gate = deferred<void>();
    this.deferredMutations.push({ expected, gate });
    return gate;
  }

  async runMachineMutation(mutation: MachineReplicaMutation, apply: () => void): Promise<void> {
    const index = this.deferredMutations.findIndex(({ expected }) =>
      expected.type === mutation.type
      && expected.machineId === mutation.machineId
      && expected.replicaId === mutation.replicaId,
    );
    if (index >= 0) {
      const [{ gate }] = this.deferredMutations.splice(index, 1);
      await gate.promise;
    }
    apply();
  }
}

class ControlledReplicaStateStore implements ReplicaStateStore {
  constructor(
    private readonly shared: ControlledReplicaState,
    private readonly replicaId: string,
  ) {}

  isAvailable(): boolean {
    return true;
  }

  async registerMachineReplica(machineId: string): Promise<void> {
    await this.shared.runMachineMutation(
      { type: "register", machineId, replicaId: this.replicaId },
      () => {
        this.shared.machineOwners.set(machineId, this.replicaId);
      },
    );
  }

  async unregisterMachineReplica(machineId: string): Promise<void> {
    await this.shared.runMachineMutation(
      { type: "unregister", machineId, replicaId: this.replicaId },
      () => {
        if (this.shared.machineOwners.get(machineId) === this.replicaId) {
          this.shared.machineOwners.delete(machineId);
        }
      },
    );
  }

  async refreshMachineReplica(machineId: string): Promise<void> {
    await this.shared.runMachineMutation(
      { type: "refresh", machineId, replicaId: this.replicaId },
      () => {
        this.shared.machineOwners.set(machineId, this.replicaId);
      },
    );
  }

  async hasMachineReplica(machineId: string): Promise<boolean> {
    return this.shared.machineOwners.has(machineId);
  }

  async getMachineReplicaOwner(machineId: string): Promise<string | null> {
    return this.shared.machineOwners.get(machineId) ?? null;
  }

  async bumpMachineStatusVersion(machineId: string): Promise<number> {
    const next = (this.shared.machineStatusVersions.get(machineId) ?? 0) + 1;
    this.shared.machineStatusVersions.set(machineId, next);
    return next;
  }

  async getMachineStatusVersion(machineId: string): Promise<number> {
    return this.shared.machineStatusVersions.get(machineId) ?? 0;
  }

  async acquireWakeLock(agentId: string): Promise<boolean> {
    if (this.shared.wakeLocks.has(agentId)) return false;
    this.shared.wakeLocks.add(agentId);
    return true;
  }

  async releaseWakeLock(agentId: string): Promise<void> {
    this.shared.wakeLocks.delete(agentId);
  }

  async setAgentActivity(agentId: string, activity: string, detail: string): Promise<void> {
    this.shared.agentActivities.set(agentId, { activity, detail, updatedAt: Date.now() });
  }

  async getAgentActivity(agentId: string): Promise<{ activity: string; detail: string; updatedAt: number } | null> {
    return this.shared.agentActivities.get(agentId) ?? null;
  }
}

type IntervalHandle = { id: number };

class FakeClock {
  private nowMs = 0;
  private nextId = 1;
  private intervals = new Map<number, { ms: number; nextAt: number; fn: () => void }>();

  now(): number {
    return this.nowMs;
  }

  setInterval(fn: () => void, ms: number): IntervalHandle {
    const handle = { id: this.nextId++ };
    this.intervals.set(handle.id, { ms, nextAt: this.nowMs + ms, fn });
    return handle;
  }

  clearInterval(handle: unknown): void {
    if (!handle || typeof handle !== "object" || !("id" in handle)) return;
    this.intervals.delete((handle as IntervalHandle).id);
  }

  advance(ms: number): void {
    const target = this.nowMs + ms;

    while (true) {
      let next: { id: number; ms: number; nextAt: number; fn: () => void } | null = null;
      for (const [id, interval] of this.intervals) {
        if (interval.nextAt > target) continue;
        if (!next || interval.nextAt < next.nextAt) {
          next = { id, ...interval };
        }
      }

      if (!next) break;

      this.nowMs = next.nextAt;
      next.fn();

      const current = this.intervals.get(next.id);
      if (current) {
        current.nextAt = this.nowMs + current.ms;
      }
    }

    this.nowMs = target;
  }
}

class DeterministicAgentOrchestrator extends AgentOrchestrator {
  constructor(
    store: ReplicaStateStore = new InMemoryReplicaStateStore(),
    clock?: { now(): number; setInterval(fn: () => void, ms: number): unknown; clearInterval(timer: unknown): void },
    tracer?: Tracer,
  ) {
    super(store, clock, tracer);
  }

  protected override async persistAgentStatus(_agentId: string, _status: "active" | "inactive" | "stopped", _sessionId?: string) {
    // No-op in deterministic tests; status semantics are asserted via cache state.
  }

  protected override async persistAgentStatusFromSignal(_agentId: string, _status: "active" | "inactive" | "stopped", _sessionId?: string) {
    // No-op in deterministic tests; status semantics are asserted via cache state.
  }

  protected override async autoAssignConnectedMachine(_serverId: string, _machineId: string) {
    // No-op in deterministic tests; connect-path contracts should not require DB writes.
  }

  protected override async loadAgentsForDisconnect(_machineId: string): Promise<any[]> {
    return [];
  }

  protected override async updateMachineHeartbeat(_machineId: string) {
    // No-op in deterministic tests; the scenarios care only about replica-state transitions.
  }

  protected override async loadRuntimeContextMachine(_machineId: string) {
    // No-op in deterministic tests; start-path contracts should not require DB reads.
    return null;
  }

  protected override async loadLatestPersistedActivityHint(_agentId: string): Promise<PersistedActivityHint | null> {
    return null;
  }

  protected override async hasPassiveDeliveryScope(_agentId: string): Promise<boolean> {
    // Deterministic tests don't seed `agent_scopes` and don't connect to a DB.
    // The scope gate is exercised in dedicated integration tests; here we
    // assume the agent has the default-on `inbox:receive` grant.
    return true;
  }

  protected override async loadAgentForDelivery(agentId: string): Promise<any> {
    const cached = (this as any).agentStateCache.get(agentId);
    if (!cached) return null;
    return {
      id: agentId,
      serverId: cached.serverId,
      machineId: cached.machineId,
      sessionId: cached.sessionId,
      status: cached.status,
      name: cached.name,
      displayName: cached.displayName,
      avatarUrl: null,
      description: cached.description,
      model: cached.model,
      runtime: cached.runtime,
      reasoningEffort: cached.reasoningEffort,
      envVars: cached.envVars,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
  }
}

class StartRoutingMismatchDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  protected override async loadAgentForStart(agentId: string) {
    return {
      id: agentId,
      serverId: "server-1",
      machineId: "machine-1",
      sessionId: null,
      status: "inactive",
      name: "agent-1",
      displayName: null,
      avatarUrl: null,
      description: null,
      model: "gpt-5",
      runtime: "codex",
      reasoningEffort: null,
      envVars: null,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>;
  }
  protected override async routeMachineCommandCrossReplica(): Promise<boolean> {
    return false;
  }
}

class BuggySelfOwnedReplicaReachabilityOrchestrator extends StartRoutingMismatchDeterministicOrchestrator {
  override async getMachineStatus(machineId: string): Promise<"online" | "offline"> {
    if ((this as any).hasMachineLocally(machineId)) return "online";
    return (await (this as any).replicaStateStore.hasMachineReplica(machineId)) ? "online" : "offline";
  }
}

class HeartbeatDeterministicAgentOrchestrator extends DeterministicAgentOrchestrator {
  override async handleMachineDisconnect(machineId: string, ws?: unknown, _context: unknown = {}) {
    const connections = (this as unknown as { machineConnections: Map<string, { ws: unknown }> }).machineConnections;
    const conn = connections.get(machineId);
    if (ws && conn && conn.ws !== ws) return;
    if (!conn) return;

    this.unregisterMachine(machineId);

    const cache = (this as unknown as { agentStateCache: Map<string, { machineId: string | null; status: string }> }).agentStateCache;
    const activity = (this as unknown as { agentActivity: Map<string, { activity: string; detail: string; updatedAt: number }> }).agentActivity;
    const inboxes = (this as unknown as { agentInboxes: Map<string, { inbox: AgentMessage[]; pendingReceive: { resolve: (msgs: AgentMessage[]) => void; timer: ReturnType<typeof setTimeout>; finish: (msgs: AgentMessage[]) => void } | null }> }).agentInboxes;

    for (const [agentId, agent] of cache.entries()) {
      if (agent.machineId !== machineId) continue;
      if (agent.status === "active") {
        activity.set(agentId, { activity: "offline", detail: "", updatedAt: Date.now() });
      }
      const inbox = inboxes.get(agentId);
      if (inbox?.pendingReceive) {
        clearTimeout(inbox.pendingReceive.timer);
        inbox.pendingReceive.resolve([]);
      }
      inboxes.delete(agentId);
    }
  }
}

type DeliverabilityNetwork = {
  owners: Map<string, string>;
  replicas: Map<string, MessageDeliverabilityOrchestrator>;
};

type StartRoutingNetwork = {
  shared: ControlledReplicaState;
  replicas: Map<string, StartRoutingDeterministicOrchestrator>;
};

class StartRoutingDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  constructor(
    readonly replicaId: string,
    readonly network: StartRoutingNetwork,
    store: ReplicaStateStore,
  ) {
    super(store);
    this.network.replicas.set(replicaId, this);
  }

  protected override async loadAgentForStart(agentId: string) {
    return {
      id: agentId,
      serverId: "server-1",
      machineId: "machine-1",
      sessionId: null,
      status: "active",
      name: "agent-1",
      displayName: null,
      avatarUrl: null,
      description: null,
      model: "gpt-5",
      runtime: "codex",
      reasoningEffort: null,
      envVars: null,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>;
  }
  protected override async routeMachineCommandCrossReplica(
    machineId: string,
    msg: ServerToMachineMessage,
    localMachineIds: Set<string>,
  ): Promise<boolean> {
    if (localMachineIds.has(machineId)) return false;
    const targetReplica = this.network.shared.machineOwners.get(machineId);
    if (!targetReplica || targetReplica === this.replicaId) return false;

    const target = this.network.replicas.get(targetReplica);
    assert.ok(target, `missing target replica ${targetReplica}`);
    return target.sendToLocalMachine(machineId, msg);
  }
}

class MessageDeliverabilityOrchestrator extends DeterministicAgentOrchestrator {
  readonly deliveredToMachine: Array<{ machineId: string; msg: ServerToMachineMessage }> = [];

  constructor(
    readonly replicaId: string,
    readonly network: DeliverabilityNetwork,
  ) {
    super(new InMemoryReplicaStateStore());
    this.network.replicas.set(replicaId, this);
  }

  protected override async routeMachineCommandCrossReplica(
    machineId: string,
    msg: ServerToMachineMessage,
    localMachineIds: Set<string>,
  ): Promise<boolean> {
    if (localMachineIds.has(machineId)) return false;
    const targetReplica = this.network.owners.get(machineId);
    if (!targetReplica || targetReplica === this.replicaId) return false;

    const target = this.network.replicas.get(targetReplica);
    assert.ok(target, `missing target replica ${targetReplica}`);
    target.deliveredToMachine.push({ machineId, msg });
    return target.sendToLocalMachine(machineId, msg);
  }

  protected override async routeInboxDeliveryCrossReplica(
    agentId: string,
    machineId: string,
    message: AgentMessage,
    localMachineIds: Set<string>,
  ): Promise<boolean> {
    if (localMachineIds.has(machineId)) return false;
    const targetReplica = this.network.owners.get(machineId);
    if (!targetReplica || targetReplica === this.replicaId) return false;

    const target = this.network.replicas.get(targetReplica);
    assert.ok(target, `missing target replica ${targetReplica}`);
    target.deliverToLocalInbox(agentId, message);
    return true;
  }
}

class EndpointRoutedMessageDeliverabilityOrchestrator extends MessageDeliverabilityOrchestrator {
  protected override async routeMachineCommandCrossReplica(
    machineId: string,
    msg: ServerToMachineMessage,
    localMachineIds: Set<string>,
  ): Promise<boolean> {
    if (localMachineIds.has(machineId)) return false;
    const targetReplica = this.network.owners.get(machineId);
    if (!targetReplica || targetReplica === this.replicaId) return false;

    const target = this.network.replicas.get(targetReplica);
    assert.ok(target, `missing target replica ${targetReplica}`);
    return target.handleRoutedMachineCommand(machineId, msg);
  }

  protected override async routeInboxDeliveryCrossReplica(
    agentId: string,
    machineId: string,
    message: AgentMessage,
    localMachineIds: Set<string>,
  ): Promise<boolean> {
    if (localMachineIds.has(machineId)) return false;
    const targetReplica = this.network.owners.get(machineId);
    if (!targetReplica || targetReplica === this.replicaId) return false;

    const target = this.network.replicas.get(targetReplica);
    assert.ok(target, `missing target replica ${targetReplica}`);
    return target.handleRoutedInboxDelivery(agentId, machineId, message);
  }

  protected override async loadAgentForStart(agentId: string) {
    const cached = (this as any).agentStateCache.get(agentId);
    assert.ok(cached, `missing cached agent ${agentId}`);

    return {
      id: agentId,
      serverId: cached.serverId,
      machineId: cached.machineId,
      sessionId: cached.sessionId,
      status: cached.status,
      name: cached.name,
      displayName: cached.displayName,
      avatarUrl: null,
      description: cached.description,
      model: cached.model,
      runtime: cached.runtime,
      reasoningEffort: cached.reasoningEffort,
      envVars: cached.envVars,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>;
  }}

class BuggyStaleLocalMessageRoutingOrchestrator extends MessageDeliverabilityOrchestrator {
  protected override getRoutableLocalMachineIds(): Set<string> {
    return new Set((this as unknown as { machineConnections: Map<string, unknown> }).machineConnections.keys());
  }
}

class BuggyRoutedMachineCommandOrchestrator extends MessageDeliverabilityOrchestrator {
  override async handleRoutedMachineCommand(machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    return this.sendToLocalMachine(machineId, msg);
  }
}

class BuggyRoutedInboxDeliveryOrchestrator extends MessageDeliverabilityOrchestrator {
  override async handleRoutedInboxDelivery(agentId: string, _machineId: string | null, message: AgentMessage): Promise<boolean> {
    this.deliverToLocalInbox(agentId, message);
    return true;
  }
}

class BuggyPayloadAnchoredRoutedInboxOrchestrator extends MessageDeliverabilityOrchestrator {
  override async handleRoutedInboxDelivery(agentId: string, machineId: string | null, message: AgentMessage): Promise<boolean> {
    if (!machineId) {
      this.deliverToLocalInbox(agentId, message);
      return true;
    }

    const localMachineIds = this.getRoutableLocalMachineIds();
    if (localMachineIds.has(machineId)) {
      this.deliverToLocalInbox(agentId, message);
      return true;
    }

    const rerouted = await this.routeInboxDeliveryCrossReplica(agentId, machineId, message, localMachineIds);
    if (rerouted) {
      return true;
    }

    this.deliverToLocalInbox(agentId, message);
    return true;
  }
}

class BuggyHeartbeatTimeoutOrchestrator extends HeartbeatDeterministicAgentOrchestrator {
  protected override onMachineHeartbeatTick(machineId: string, conn: any) {
    void this.handleMachineDisconnect(machineId, undefined, { cause: "heartbeat_timeout" });
    try { conn?.ws?.terminate?.(); } catch { /* ignore */ }
  }
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
};

function deferred<T = void>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolveFn) => {
    resolve = resolveFn;
  });
  return { promise, resolve };
}

async function flushMicrotasks(times = 3): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

async function waitForCondition(predicate: () => boolean, attempts = 20): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

class WakeLockDeterministicAgentOrchestrator extends DeterministicAgentOrchestrator {
  readonly startMessages: string[] = [];

  constructor(
    store: ReplicaStateStore,
    private readonly options: { holdSend?: Promise<void>; onSend?: () => void; sendSucceeds?: boolean } = {},
  ) {
    super(store);
  }

  protected override async loadAgentForStart(agentId: string) {
    return {
      id: agentId,
      serverId: "server-1",
      machineId: "machine-1",
      sessionId: null,
      status: "active",
      name: "agent-1",
      displayName: null,
      avatarUrl: null,
      description: null,
      model: "gpt-5",
      runtime: "codex",
      reasoningEffort: null,
      envVars: null,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>;
  }
  protected override async sendToMachine(_machineId: string, msg: { type: string; agentId?: string }): Promise<boolean> {
    if (msg.type === "agent:start" && msg.agentId) {
      this.startMessages.push(msg.agentId);
      this.options.onSend?.();
      if (this.options.holdSend) {
        await this.options.holdSend;
      }
    }
    return this.options.sendSucceeds ?? true;
  }

  override async handleMachineMessage(machineId: string, msg: MachineToServerMessage) {
    if (msg.type === "agent:session") {
      (this as any).updateCache(msg.agentId, { runtimeState: "running_idle", status: "active", sessionId: msg.sessionId });
      (this as any).maybeResolveStartingActivity(msg.agentId);
      await (this as any).replicaStateStore.releaseWakeLock(msg.agentId);
      return;
    }
    if (msg.type === "agent:status") {
      const normalizedStatus = msg.status === "sleeping" ? "active" : msg.status;
      (this as any).updateCache(msg.agentId, {
        runtimeState: normalizedStatus === "active" ? "running_idle" : "not_running",
        status: normalizedStatus,
      });
      if (normalizedStatus === "active") {
        (this as any).maybeResolveStartingActivity(msg.agentId);
      }
      if (normalizedStatus === "inactive") {
        await (this as any).replicaStateStore.releaseWakeLock(msg.agentId);
      }
      return;
    }
    return super.handleMachineMessage(machineId, msg);
  }
}

class LaunchGuardDeterministicAgentOrchestrator extends DeterministicAgentOrchestrator {
  readonly startMessages: Array<Extract<ServerToMachineMessage, { type: "agent:start" }>> = [];

  constructor(store: ReplicaStateStore = new InMemoryReplicaStateStore()) {
    super(store);
  }

  protected override async loadAgentForStart(agentId: string) {
    return {
      id: agentId,
      serverId: "server-1",
      machineId: "machine-1",
      sessionId: null,
      status: "active",
      name: "agent-1",
      displayName: null,
      avatarUrl: null,
      description: null,
      model: "gpt-5",
      runtime: "codex",
      reasoningEffort: null,
      envVars: null,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>;
  }
  protected override async sendToMachine(_machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    if (msg.type === "agent:start") {
      this.startMessages.push(msg);
    }
    return true;
  }

  override async handleMachineMessage(machineId: string, msg: MachineToServerMessage) {
    if (msg.type === "agent:status" || msg.type === "agent:activity" || msg.type === "agent:session") {
      if (msg.type === "agent:status" || msg.type === "agent:session") {
        return super.handleMachineMessage(machineId, msg);
      }

      const agent = await (this as any).validateMachineAgentMessage(machineId, "server-1", msg.agentId, msg.type);
      if (!agent) return;
      if (!(this as any).shouldAcceptLifecycleEvent(machineId, agent, msg.type, (msg as any).launchId)) {
        return;
      }

      if (msg.type === "agent:activity") {
        (this as any).broadcastActivity(msg.agentId, msg.activity, msg.detail, msg.entries);
        return;
      }
    }

    return super.handleMachineMessage(machineId, msg);
  }
}

class FailingLaunchGuardDeterministicAgentOrchestrator extends LaunchGuardDeterministicAgentOrchestrator {
  protected override async sendToMachine(_machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    if (msg.type === "agent:start") {
      this.startMessages.push(msg);
    }
    return false;
  }
}

/**
 * Simulates the pre-fix behavior where handleMachineDisconnect did not check ws identity.
 * Without the stale guard, any disconnect call (including from an old/replaced socket) would
 * unconditionally tear down the machine's replica state and mark agents offline.
 */
class BuggyStaleDisconnectOrchestrator extends DeterministicAgentOrchestrator {
  override async handleMachineDisconnect(machineId: string, _ws?: unknown, _context?: unknown) {
    const connections = (this as unknown as { machineConnections: Map<string, unknown> }).machineConnections;
    if (!connections.has(machineId)) return;
    connections.delete(machineId);
    // Directly invoke the store to simulate unregisterMachine's side-effect
    await (this as unknown as { replicaStateStore: { unregisterMachineReplica(id: string): Promise<void> } })
      .replicaStateStore.unregisterMachineReplica(machineId);
  }
}

class BuggyNoSweepOrchestrator extends DeterministicAgentOrchestrator {
  constructor(store: ReplicaStateStore) {
    super(store);
    (this as any).sweepStaleActivities = () => {};
  }
}

class BuggyConcurrentReceiveOrchestrator extends DeterministicAgentOrchestrator {
  override receiveMessages(agentId: string, block: boolean, timeoutMs: number, signal?: AbortSignal): Promise<AgentMessage[]> {
    let inbox = (this as any).agentInboxes.get(agentId);
    if (!inbox) {
      inbox = { inbox: [], pendingReceive: null };
      (this as any).agentInboxes.set(agentId, inbox);
    }

    if (inbox.inbox.length > 0) {
      const msgs = [...inbox.inbox];
      inbox.inbox = [];
      return Promise.resolve(msgs);
    }

    if (!block) return Promise.resolve([]);

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        const ib = (this as any).agentInboxes.get(agentId);
        if (ib?.pendingReceive) {
          ib.pendingReceive = null;
          resolve([]);
        }
      }, timeoutMs);

      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          const ib = (this as any).agentInboxes.get(agentId);
          if (ib?.pendingReceive) {
            ib.pendingReceive = null;
          }
          resolve([]);
        }, { once: true });
      }

      inbox.pendingReceive = {
        resolve,
        timer,
        finish: resolve,
      };
    });
  }
}

class DeferredLocalFallbackDeliverMessageOrchestrator extends DeterministicAgentOrchestrator {
  readonly routeGate = deferred<boolean>();
  routeEntered = false;

  protected override async routeInboxDeliveryCrossReplica(
    _agentId: string,
    _machineId: string,
    _message: AgentMessage,
    _localMachineIds: Set<string>,
  ): Promise<boolean> {
    this.routeEntered = true;
    return this.routeGate.promise;
  }
}

class InactiveWindowDeliverMessageOrchestrator extends DeterministicAgentOrchestrator {
  readonly sentToMachine: ServerToMachineMessage[] = [];

  protected override async loadAgentForStart(agentId: string) {
    const cached = (this as any).agentStateCache.get(agentId);
    assert.ok(cached, `missing cached agent ${agentId}`);
    return {
      id: agentId,
      serverId: cached.serverId,
      machineId: cached.machineId,
      sessionId: cached.sessionId,
      status: cached.status,
      name: cached.name,
      displayName: cached.displayName,
      avatarUrl: null,
      description: cached.description,
      model: cached.model,
      runtime: cached.runtime,
      reasoningEffort: cached.reasoningEffort,
      envVars: cached.envVars,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>;
  }
  protected override async sendToMachine(_machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    this.sentToMachine.push(msg);
    return true;
  }
}

class StaleCachedStoppedDeliveryOrchestrator extends InactiveWindowDeliverMessageOrchestrator {
  constructor(private readonly persistedStatus: "active" | "inactive" | "stopped") {
    super();
  }

  protected override async loadAgentForDelivery(agentId: string): Promise<any> {
    const agent = await super.loadAgentForDelivery(agentId);
    return agent ? { ...agent, status: this.persistedStatus } : null;
  }
}

class FailingWakeDeliverMessageOrchestrator extends InactiveWindowDeliverMessageOrchestrator {
  protected override async sendToMachine(_machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    this.sentToMachine.push(msg);
    return msg.type !== "agent:start";
  }
}

class ResetFailureDeterministicOrchestrator extends InactiveWindowDeliverMessageOrchestrator {
  protected override async sendToMachine(_machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    this.sentToMachine.push(msg);
    return msg.type !== "agent:start";
  }
}

class ReadyReconcileDeterministicOrchestrator extends InactiveWindowDeliverMessageOrchestrator {
  protected override async persistMachineCapabilities(
    _machineId: string,
    _runtimes: string[],
    _hostname?: string,
    _os?: string,
    _daemonVersion?: string | null,
  ) {
    // No-op for determ tests.
  }

  protected override async loadAgentsForReadyReconcile(machineId: string) {
    const agents = [...(this as any).agentStateCache.entries()]
      .filter(([, agent]) => agent.machineId === machineId)
      .map(([id, agent]) => ({
        id,
        serverId: agent.serverId,
        machineId: agent.machineId,
        sessionId: agent.sessionId,
        status: agent.status,
        name: agent.name,
        displayName: agent.displayName,
        avatarUrl: null,
        description: agent.description,
        model: agent.model,
        runtime: agent.runtime,
        reasoningEffort: agent.reasoningEffort,
        envVars: agent.envVars,
        executionMode: "cloud",
        deletedAt: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      }));
    return agents as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>[];
  }

  async callApplyReadyReconcileAction(machineId: string, agentId: string, action: ReadyReconcilePlanAction) {
    const agent = (await this.loadAgentsForReadyReconcile(machineId)).find((candidate) => candidate.id === agentId);
    assert.ok(agent, `missing ready-reconcile agent ${agentId}`);
    await this.applyReadyReconcileAction(machineId, agent, action);
  }
}

class ColdCacheReadyReconcileDeterministicOrchestrator extends InactiveWindowDeliverMessageOrchestrator {
  readonly persistedAgents = new Map<string, any>();

  addPersistedActiveAgent(agentId: string, machineId: string) {
    this.persistedAgents.set(agentId, {
      id: agentId,
      serverId: "server-1",
      machineId,
      sessionId: null,
      status: "active",
      name: agentId,
      displayName: null,
      avatarUrl: null,
      description: null,
      model: "gpt-5",
      runtime: "codex",
      reasoningEffort: null,
      envVars: null,
      executionMode: "cloud",
      deletedAt: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  }

  protected override async persistMachineCapabilities(
    _machineId: string,
    _runtimes: string[],
    _hostname?: string,
    _os?: string,
    _daemonVersion?: string | null,
  ) {
    // No-op for deterministic tests.
  }

  protected override async loadAgentsForReadyReconcile(machineId: string) {
    return [...this.persistedAgents.values()].filter((agent) => agent.machineId === machineId);
  }

  protected override async loadAgentForDelivery(agentId: string): Promise<any> {
    return this.persistedAgents.get(agentId) ?? null;
  }

  protected override async loadAgentForStart(agentId: string): Promise<any> {
    return this.persistedAgents.get(agentId) ?? null;
  }
}

class StopApplyDeterministicOrchestrator extends InactiveWindowDeliverMessageOrchestrator {
  async callApplyStopAction(agentId: string, reason: "manual" | "internal") {
    const agent = await (this as any).getCachedAgent(agentId);
    assert.ok(agent, `missing stop-apply agent ${agentId}`);
    const nextStatus = reason === "manual" ? "stopped" : "inactive";
    await this.applyStopAction({
      agentId,
      serverId: agent.serverId,
      machineId: agent.machineId,
      reason,
      previousStatus: agent.status,
      nextStatus,
    });
  }
}

class UnreachableStopApplyDeterministicOrchestrator extends StopApplyDeterministicOrchestrator {
  protected override async sendToMachine(_machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    this.sentToMachine.push(msg);
    return false;
  }
}

class ReadCursorApplyDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  readonly readCursorAdvances: Array<{ agentId: string; channelId: string; seq: number }> = [];

  protected override applyReadCursorAdvances(agentId: string, channelMaxSeq: Map<string, number>) {
    for (const [channelId, seq] of channelMaxSeq) {
      this.readCursorAdvances.push({ agentId, channelId, seq });
    }
  }
}

class RoutedOwnershipApplyDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  readonly calls: string[] = [];

  async callApplyRoutedOwnershipAction(
    action: "handle-locally" | "reroute-then-fallback" | "fallback",
    rerouteResult = false,
  ) {
    return this.applyRoutedOwnershipAction({
      action,
      handleLocally: async () => {
        this.calls.push("local");
        return true;
      },
      rerouteToCurrentOwner: async () => {
        this.calls.push("reroute");
        return rerouteResult;
      },
      fallback: async () => {
        this.calls.push("fallback");
        return false;
      },
    });
  }
}

class LocalDeliveryGateApplyDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  callApplyLocalDeliveryGateAction(
    action: "deliver-locally" | "drop-delivery",
    agentId: string,
    message: AgentMessage,
  ) {
    return this.applyLocalDeliveryGateAction({
      action,
      agentId,
      message,
    });
  }
}

class SendToMachineApplyDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  readonly calls: string[] = [];

  async callApplySendToMachineAction(
    action: "send-locally" | "reroute-then-warn" | "warn-offline",
    rerouteResult = false,
  ) {
    return this.applySendToMachineAction({
      action,
      machineId: "machine-1",
      msg: { type: "ping" },
      sendLocally: () => {
        this.calls.push("local");
        return true;
      },
      reroute: async () => {
        this.calls.push("reroute");
        return rerouteResult;
      },
    });
  }
}

class InvalidStatusReadyReconcileDeterministicOrchestrator extends ReadyReconcileDeterministicOrchestrator {
  constructor(private readonly invalidStatus: string) {
    super();
  }

  protected override async loadAgentsForReadyReconcile(machineId: string) {
    const agents = await super.loadAgentsForReadyReconcile(machineId);
    return agents.map((agent) => ({ ...agent, status: this.invalidStatus as any }));
  }
}

class InvalidStatusStartDeterministicOrchestrator extends WakeLockDeterministicAgentOrchestrator {
  constructor(
    private readonly invalidStatus: string,
    store: ReplicaStateStore = new InMemoryReplicaStateStore(),
    options: { holdSend?: Promise<void>; onSend?: () => void; sendSucceeds?: boolean } = {},
  ) {
    super(store, options);
  }

  protected override async loadAgentForStart(agentId: string) {
    const agent = await super.loadAgentForStart(agentId);
    return { ...agent, status: this.invalidStatus as any };
  }
}

class DeferredResetWindowOrchestrator extends InactiveWindowDeliverMessageOrchestrator {
  readonly inactivePersistGate = deferred<void>();
  inactivePersistEntered = false;

  protected override async resetPersistedAgentSession(_agentId: string) {
    // No-op for determ tests.
  }

  protected override async persistAgentStatus(_agentId: string, status: "active" | "inactive" | "stopped", _sessionId?: string) {
    if (status === "inactive" && !this.inactivePersistEntered) {
      this.inactivePersistEntered = true;
      await this.inactivePersistGate.promise;
    }
  }
}

class SendPrimitiveHarness extends DeterministicAgentOrchestrator {
  callBestEffortSend() {
    (this as any).sendBestEffortToMachine("machine-1", { type: "ping" }, "best-effort send failed");
  }

  callRequiredSend(offlineMessage = "required send failed") {
    return (this as any).sendRequiredToMachine("machine-1", { type: "ping" }, offlineMessage);
  }
}

class PersistedActivityLogDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  readonly emittedActivityPayloads: Array<{
    agentId: string;
    activity: string;
    detail: string;
    timestamp: number;
    entries?: TrajectoryEntry[];
  }> = [];
  private readonly persistedDedupeKeys = new Set<string>();

  constructor(
    private readonly persistedLogs: Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>> = new Map(),
    clock?: { now(): number; setInterval(fn: () => void, ms: number): unknown; clearInterval(timer: unknown): void },
    tracer?: Tracer,
  ) {
    super(new InMemoryReplicaStateStore(), clock, tracer);
    (this as unknown as { io: { to(room: string): { emit(event: string, payload: unknown): void } } }).io = {
      to: () => ({
        emit: (event: string, payload: unknown) => {
          if (event === "agent:activity") {
            this.emittedActivityPayloads.push(payload as {
              agentId: string;
              activity: string;
              detail: string;
              timestamp: number;
              entries?: TrajectoryEntry[];
            });
          }
        },
      }),
    };
  }

  protected override async persistActivityEvent(
    agentId: string,
    _activity: string,
    _detail: string,
    entries: TrajectoryEntry[],
    createdAt: Date,
    dedupeKey?: string,
  ): Promise<boolean> {
    if (dedupeKey) {
      const scopedDedupeKey = `${agentId}:${dedupeKey}`;
      if (this.persistedDedupeKeys.has(scopedDedupeKey)) {
        return false;
      }
      this.persistedDedupeKeys.add(scopedDedupeKey);
    }
    const existing = this.persistedLogs.get(agentId) ?? [];
    const timestamp = createdAt.getTime();
    const persisted = [...existing, ...entries.map((entry) => ({ timestamp, entry }))];
    this.persistedLogs.set(agentId, persisted);
    return true;
  }

  protected override async loadPersistedActivityLog(agentId: string, limit: number) {
    const existing = this.persistedLogs.get(agentId) ?? [];
    return existing.slice(-limit);
  }

  protected override async loadLatestPersistedActivityHint(agentId: string): Promise<PersistedActivityHint | null> {
    const existing = this.persistedLogs.get(agentId) ?? [];
    const latest = existing.at(-1);
    if (!latest) return null;
    const activity: "online" | "thinking" | "working" | "offline" =
      latest.entry.kind === "status"
        ? latest.entry.activity === "thinking" || latest.entry.activity === "working" || latest.entry.activity === "online"
          ? latest.entry.activity
          : "offline"
        : "working";
    return {
      activity,
      detail:
        latest.entry.kind === "status"
          ? latest.entry.detail
          : latest.entry.kind === "thinking"
            ? latest.entry.text
            : latest.entry.kind === "tool_start"
              ? latest.entry.toolInput
              : latest.entry.kind === "text"
                ? latest.entry.text
                : latest.entry.kind === "system" || latest.entry.kind === "slock_action"
                  ? latest.entry.text
                  : latest.entry.kind === "compaction_started"
                    ? "Compacting context"
                    : "Context compaction finished",
      updatedAt: latest.timestamp,
    };
  }
}

class ReadyReconcileActivityLogDeterministicOrchestrator extends PersistedActivityLogDeterministicOrchestrator {
  protected override async loadAgentsForDisconnect(machineId: string) {
    return this.loadAgentsForReadyReconcile(machineId);
  }

  protected override async loadAgentsForReadyReconcile(machineId: string) {
    const agents = [...(this as any).agentStateCache.entries()]
      .filter(([, agent]) => agent.machineId === machineId)
      .map(([id, agent]) => ({
        id,
        serverId: agent.serverId,
        machineId: agent.machineId,
        sessionId: agent.sessionId,
        status: agent.status,
        name: agent.name,
        displayName: agent.displayName,
        avatarUrl: null,
        description: agent.description,
        model: agent.model,
        runtime: agent.runtime,
        reasoningEffort: agent.reasoningEffort,
        envVars: agent.envVars,
        executionMode: "cloud",
        deletedAt: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      }));
    return agents as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>[];
  }

  async callApplyReadyReconcileAction(machineId: string, agentId: string, action: ReadyReconcilePlanAction) {
    const agent = (await this.loadAgentsForReadyReconcile(machineId)).find((candidate) => candidate.id === agentId);
    assert.ok(agent, `missing ready-reconcile agent ${agentId}`);
    await this.applyReadyReconcileAction(machineId, agent, action);
  }
}

class ActivityResolutionDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  constructor(
    store: ReplicaStateStore,
    private persistedHint: PersistedActivityHint | null,
    clock: { now(): number; setInterval(fn: () => void, ms: number): unknown; clearInterval(timer: unknown): void },
  ) {
    super(store, clock);
  }

  setPersistedHint(persistedHint: PersistedActivityHint | null) {
    this.persistedHint = persistedHint;
  }

  protected override async loadLatestPersistedActivityHint(_agentId: string): Promise<PersistedActivityHint | null> {
    return this.persistedHint;
  }
}

class ActivityBroadcastApplyDeterministicOrchestrator extends PersistedActivityLogDeterministicOrchestrator {
  callApplyActivityBroadcastAction(
    action: "persist-and-emit-now" | "debounce-only",
    agentId: string,
    activity: string,
    detail: string,
    now: number,
    persistedEntries: TrajectoryEntry[],
  ) {
    this.applyActivityBroadcastAction({
      action,
      agentId,
      activity,
      detail,
      now,
      persistedEntries,
    });
  }
}

class ActivityHintApplyDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  callApplyActivityHintResolutionAction(
    action: "return-snapshot" | "return-offline" | "ignore-hint" | "cache-and-return-snapshot",
    agentId: string,
    snapshot: { activity: string; detail: string; updatedAt: number },
  ) {
    return this.applyActivityHintResolutionAction({
      action,
      agentId,
      snapshot,
    });
  }
}

class ActivityHintInputDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  callLoadActivityHintResolutionPlanInput(
    agent: { status: "active" | "inactive" | "stopped"; machineId: string | null } | null,
    snapshot: { activity: string; detail: string; updatedAt: number },
    source: "local-cache" | "redis",
  ) {
    return this.loadActivityHintResolutionPlanInput({
      agent: agent as any,
      snapshot,
      source,
    });
  }
}

class MachineReachabilityInputDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  callLoadMachineReachabilityPlanInput(agent: { machineId: string | null } | null) {
    return this.loadMachineReachabilityPlanInput({ agent: agent as any });
  }
}

class StaleActivityApplyDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  callApplyStaleActivitySweepAction(
    action: "keep-current" | "sweep-online",
    agentId: string,
    now: number,
  ) {
    this.applyStaleActivitySweepAction({ action, agentId, now });
  }
}

class StaleTransientApplyDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  callApplyStaleTransientNormalizationAction(
    action: "keep-current" | "normalize-online",
    agentId: string,
    source: "local-cache" | "redis",
    now: number,
  ) {
    return this.applyStaleTransientNormalizationAction({ action, agentId, source, now });
  }
}
function seedMachineConnection(orchestrator: AgentOrchestrator, machineId: string, ws: unknown, daemonVersion: string | null = "1.0.0") {
  const conn = {
    ws,
    machineId,
    serverId: "server-1",
    connectionEpochId: `machine:${machineId}:connection:test-epoch`,
    heartbeatTimer: null,
    lastPong: Date.now(),
    daemonVersion,
  };
  (orchestrator as unknown as { machineConnections: Map<string, unknown> }).machineConnections.set(machineId, conn);
  return conn;
}

function startHeartbeat(orchestrator: AgentOrchestrator, machineId: string, conn: unknown) {
  (orchestrator as any).startMachineHeartbeat(machineId, conn);
}

function makeFakeWs(readyState = 1) {
  return {
    readyState,
    sent: [] as string[],
    terminated: 0,
    closed: 0,
    send(data: string) {
      this.sent.push(data);
    },
    terminate() {
      this.terminated += 1;
      this.readyState = 3;
    },
    close() {
      this.closed += 1;
      this.readyState = 3;
    },
  };
}

function makeFakeServerIO(captured: Array<{ room: string; event: string; payload: unknown }>) {
  return {
    to(room: string) {
      return {
        emit(event: string, payload: unknown) {
          captured.push({ room, event, payload });
        },
      };
    },
  };
}

function seedActiveAgent(orchestrator: AgentOrchestrator, agentId = "agent-1", machineId = "machine-1") {
  (orchestrator as any).agentStateCache.set(agentId, {
    status: "active",
    machineId,
    sessionId: null,
    expectedLaunchId: null,
    launchGuardMode: "legacy",
    serverId: "server-1",
    name: "agent-1",
    displayName: null,
    description: null,
    model: "gpt-5",
    runtime: "codex",
    runtimeState: "running_idle",
    reasoningEffort: null,
    envVars: null,
  });
}

function makeMachineRecord(machineId = "machine-1") {
  return {
    id: machineId,
    serverId: "server-1",
    userId: "user-1",
    name: "machine-1",
    apiKeyPrefix: null,
    runtimes: null as string[] | null,
    hostname: null as string | null,
    os: null as string | null,
    daemonVersion: null as string | null,
    lastHeartbeat: null as Date | null,
    createdAt: new Date(0),
  };
}

function makeAgentMessage(content: string, seq = 1): AgentMessage {
  return {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    message_id: `msg-${seq}`,
    sender_id: "user-1",
    sender_name: "richard",
    sender_type: "human",
    content,
    seq,
    timestamp: new Date(0).toISOString(),
  };
}

function makeDeterministicTracer() {
  let spanIndex = 0;
  const traceId = "1".repeat(32);
  const spanIds = ["2".repeat(16), "3".repeat(16), "4".repeat(16)];
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({
    sink,
    traceIdGenerator: () => traceId,
    spanIdGenerator: () => spanIds[spanIndex++] ?? "5".repeat(16),
  });
  return { sink, tracer, traceId };
}

function lifecycleProjectionAttrs(sink: MemoryTraceSink, traceId: string) {
  return sink.getTrace(traceId)
    .flatMap((span) => span.events)
    .filter((event) => event.name === "agent.lifecycle.projection")
    .map((event) => event.attrs ?? {});
}

function recentLifecycleEvents(orchestrator: AgentOrchestrator, agentId = "agent-1") {
  return orchestrator.getRecentLifecycleEvents(agentId, 20).map(({ at, ...event }: AgentLifecycleEvent) => event);
}

function recentLifecycleEventsWithTimestamps(orchestrator: AgentOrchestrator, agentId = "agent-1") {
  return orchestrator.getRecentLifecycleEvents(agentId, 20);
}

test("cross-replica active agent stays online when machine replica heartbeat still exists", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");

  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  const activity = await orchestrator.getActivity("agent-1");
  assert.deepEqual(activity, { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("runtime profile heartbeat nudge planner supports kill switch and hard cooldown", () => {
  assert.equal(planRuntimeProfileHeartbeatNudgeAction({
    disabled: true,
    lastSentAt: null,
    now: 10_000,
    cooldownMs: 24 * 60 * 60_000,
  }), "disabled");

  assert.equal(planRuntimeProfileHeartbeatNudgeAction({
    disabled: false,
    lastSentAt: 1_000,
    now: 60_000,
    cooldownMs: 24 * 60 * 60_000,
  }), "cooldown");

  assert.equal(planRuntimeProfileHeartbeatNudgeAction({
    disabled: false,
    lastSentAt: 1_000,
    now: 1_000 + 24 * 60 * 60_000,
    cooldownMs: 24 * 60 * 60_000,
  }), "allow");

  assert.equal(planRuntimeProfileHeartbeatNudgeAction({
    disabled: false,
    lastSentAt: null,
    now: 10_000,
    cooldownMs: 24 * 60 * 60_000,
  }), "allow");
});

test("heartbeat runtime profile nudge path honors kill switch before daemon send", async () => {
  const previousDisable = process.env.SLOCK_DISABLE_MIGRATION_NUDGE_PIGGYBACK;
  const previousCooldown = process.env.SLOCK_MIGRATION_NUDGE_PIGGYBACK_COOLDOWN_MS;
  process.env.SLOCK_DISABLE_MIGRATION_NUDGE_PIGGYBACK = "true";
  delete process.env.SLOCK_MIGRATION_NUDGE_PIGGYBACK_COOLDOWN_MS;

  const { sink, tracer, traceId } = makeDeterministicTracer();
  const clock = new FakeClock();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), clock, tracer);
  const ws = makeFakeWs();
  try {
    seedActiveAgent(orchestrator, "agent-1", "machine-1");
    seedMachineConnection(orchestrator, "machine-1", ws);

    await orchestrator.handleMachineMessage("machine-1", { type: "pong" } as MachineToServerMessage);

    const span = sink.getTrace(traceId).find((entry) => entry.name === "server.runtime_profile.heartbeat_nudge.scan");
    assert.ok(span);
    assert.equal(span.attrs?.disabled, true);
    assert.equal(span.attrs?.active_agents_count, 1);
    assert.equal(span.attrs?.disabled_count, 1);
    assert.equal(span.attrs?.sent_count, 0);
    assert.equal(ws.sent.length, 0);
  } finally {
    if (previousDisable === undefined) {
      delete process.env.SLOCK_DISABLE_MIGRATION_NUDGE_PIGGYBACK;
    } else {
      process.env.SLOCK_DISABLE_MIGRATION_NUDGE_PIGGYBACK = previousDisable;
    }
    if (previousCooldown === undefined) {
      delete process.env.SLOCK_MIGRATION_NUDGE_PIGGYBACK_COOLDOWN_MS;
    } else {
      process.env.SLOCK_MIGRATION_NUDGE_PIGGYBACK_COOLDOWN_MS = previousCooldown;
    }
    orchestrator.shutdown();
  }
});

test("machine websocket heartbeat suppresses normal ping and pong traces", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const clock = new FakeClock();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), clock, tracer);
  const ws = makeFakeWs(1);

  await orchestrator.registerMachine("machine-1", "server-1", ws as never);
  clock.advance(30_000);
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(JSON.parse(ws.sent[0] ?? "{}"), { type: "ping" });
  assert.equal(
    sink.getTrace(traceId).some((span) => span.name === "server.machine.websocket.heartbeat"),
    false,
  );

  await orchestrator.handleMachineMessage("machine-1", { type: "pong" } as MachineToServerMessage);
  assert.equal(
    sink.getTrace(traceId).some((span) => span.name === "server.machine.websocket.pong_received"),
    false,
  );

  orchestrator.shutdown();
});

test("machine websocket heartbeat timeout traces stale pong age before terminating", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const clock = new FakeClock();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), clock, tracer);
  const ws = makeFakeWs(1);

  await orchestrator.registerMachine("machine-1", "server-1", ws as never);
  clock.advance(90_000);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(ws.terminated, 1);
  const timeoutSpan = sink.getTrace(traceId).find((span) =>
    span.name === "server.machine.websocket.heartbeat" && span.attrs?.outcome === "heartbeat_timeout"
  );
  assert.ok(timeoutSpan);
  assert.equal(timeoutSpan.status, "error");
  assert.equal(timeoutSpan.attrs?.last_pong_age_ms_bucket, "60s-120s");
  assert.equal(timeoutSpan.attrs?.terminated_socket, true);
  assert.equal(
    timeoutSpan.events.some((event) => event.name === "heartbeat.timeout" && event.attrs?.last_pong_age_ms_bucket === "60s-120s"),
    true,
  );

  orchestrator.shutdown();
});

test("runtime profile gated inbox flush emits trace and propagates delivery context", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), undefined, tracer);
  const ws = makeFakeWs(1);
  try {
    seedActiveAgent(orchestrator, "agent-1", "machine-1");
    seedMachineConnection(orchestrator, "machine-1", ws);
    (orchestrator as any).agentInboxes.set("agent-1", {
      inbox: [makeAgentMessage("flush after runtime profile migration done", 42)],
      pendingReceive: null,
    });

    const agent = { ...(orchestrator as any).agentStateCache.get("agent-1"), id: "agent-1" };
    await (orchestrator as any).flushRuntimeProfileGatedInbox("machine-1", agent);

    const span = sink.getTrace(traceId).find((entry) => entry.name === "server.runtime_profile.gated_inbox.flush");
    assert.ok(span);
    assert.equal(span.attrs?.agent_id_present, true);
    assert.equal(span.attrs?.machine_id_present, true);
    assert.equal(span.attrs?.inbox_count, 1);
    assert.equal(typeof span.attrs?.oldest_message_age_ms, "number");
    assert.equal(span.attrs?.oldest_message_age_bucket, "120s+");
    assert.equal(span.attrs?.sent_count, 1);
    assert.equal(span.attrs?.send_failed_count, 0);
    const delivered = JSON.parse(ws.sent[0] ?? "{}") as Extract<ServerToMachineMessage, { type: "agent:deliver" }>;
    assert.equal(delivered.type, "agent:deliver");
    assert.equal(delivered.seq, 42);
    const parent = parseTraceparent(delivered.traceparent);
    assert.ok(parent);
    assert.equal(parent.traceId, traceId);
    assert.equal(parent.spanId, span.context.spanId);
  } finally {
    orchestrator.shutdown();
  }
});

test("machine status resolves offline when DB could be stale but no local or remote reachability exists", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();

  assert.equal(await orchestrator.getMachineStatus("machine-1"), "offline");

  orchestrator.shutdown();
});

test("machine status resolves online from remote replica reachability even without a local connection", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  const orchestrator = new DeterministicAgentOrchestrator(store);

  assert.equal(await orchestrator.getMachineStatus("machine-1"), "online");

  orchestrator.shutdown();
});

test("same-replica reconnect handoff keeps remote machine status online even if the stale unregister resolves last", async () => {
  const shared = new ControlledReplicaState();
  const replicaAStore = new ControlledReplicaStateStore(shared, "replica-a");
  const replicaBStore = new ControlledReplicaStateStore(shared, "replica-b");
  const replicaA = new DeterministicAgentOrchestrator(replicaAStore);
  const replicaB = new DeterministicAgentOrchestrator(replicaBStore);

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);
  await flushMicrotasks();
  assert.equal(await replicaB.getMachineStatus("machine-1"), "online");

  const staleUnregister = shared.deferNextMachineMutation({
    type: "unregister",
    machineId: "machine-1",
    replicaId: "replica-a",
  });
  const freshRegister = shared.deferNextMachineMutation({
    type: "register",
    machineId: "machine-1",
    replicaId: "replica-a",
  });

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);

  freshRegister.resolve();
  await flushMicrotasks();
  assert.equal(await replicaB.getMachineStatus("machine-1"), "online");

  staleUnregister.resolve();
  await flushMicrotasks();
  assert.equal(await replicaB.getMachineStatus("machine-1"), "online");

  replicaA.shutdown();
  replicaB.shutdown();
});

test("same-replica reconnect handoff keeps remote start routable even if the stale unregister resolves last", async () => {
  const shared = new ControlledReplicaState();
  const network: StartRoutingNetwork = { shared, replicas: new Map() };
  const replicaA = new StartRoutingDeterministicOrchestrator(
    "replica-a",
    network,
    new ControlledReplicaStateStore(shared, "replica-a"),
  );
  const replicaB = new StartRoutingDeterministicOrchestrator(
    "replica-b",
    network,
    new ControlledReplicaStateStore(shared, "replica-b"),
  );

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);
  await flushMicrotasks();

  const staleUnregister = shared.deferNextMachineMutation({
    type: "unregister",
    machineId: "machine-1",
    replicaId: "replica-a",
  });
  const freshRegister = shared.deferNextMachineMutation({
    type: "register",
    machineId: "machine-1",
    replicaId: "replica-a",
  });

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);

  freshRegister.resolve();
  await flushMicrotasks();
  staleUnregister.resolve();
  await flushMicrotasks();

  await assert.doesNotReject(() => replicaB.startAgent("agent-1"));

  replicaA.shutdown();
  replicaB.shutdown();
});

test("cross-replica ownership transfer keeps remote machine status online even if the previous owner unregister resolves last", async () => {
  const shared = new ControlledReplicaState();
  const replicaA = new DeterministicAgentOrchestrator(new ControlledReplicaStateStore(shared, "replica-a"));
  const replicaB = new DeterministicAgentOrchestrator(new ControlledReplicaStateStore(shared, "replica-b"));
  const replicaC = new DeterministicAgentOrchestrator(new ControlledReplicaStateStore(shared, "replica-c"));

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);
  await flushMicrotasks();
  assert.equal(await replicaC.getMachineStatus("machine-1"), "online");

  const staleUnregister = shared.deferNextMachineMutation({
    type: "unregister",
    machineId: "machine-1",
    replicaId: "replica-a",
  });
  const freshRegister = shared.deferNextMachineMutation({
    type: "register",
    machineId: "machine-1",
    replicaId: "replica-b",
  });

  replicaA.unregisterMachine("machine-1");
  await replicaB.registerMachine("machine-1", "server-1", makeFakeWs() as never);

  freshRegister.resolve();
  await flushMicrotasks();
  assert.equal(await replicaC.getMachineStatus("machine-1"), "online");

  staleUnregister.resolve();
  await flushMicrotasks();
  assert.equal(await replicaC.getMachineStatus("machine-1"), "online");

  replicaA.shutdown();
  replicaB.shutdown();
  replicaC.shutdown();
});

test("cross-replica ownership transfer keeps remote start routable even if the previous owner unregister resolves last", async () => {
  const shared = new ControlledReplicaState();
  const network: StartRoutingNetwork = { shared, replicas: new Map() };
  const replicaA = new StartRoutingDeterministicOrchestrator(
    "replica-a",
    network,
    new ControlledReplicaStateStore(shared, "replica-a"),
  );
  const replicaB = new StartRoutingDeterministicOrchestrator(
    "replica-b",
    network,
    new ControlledReplicaStateStore(shared, "replica-b"),
  );
  const replicaC = new StartRoutingDeterministicOrchestrator(
    "replica-c",
    network,
    new ControlledReplicaStateStore(shared, "replica-c"),
  );

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);
  await flushMicrotasks();

  const staleUnregister = shared.deferNextMachineMutation({
    type: "unregister",
    machineId: "machine-1",
    replicaId: "replica-a",
  });
  const freshRegister = shared.deferNextMachineMutation({
    type: "register",
    machineId: "machine-1",
    replicaId: "replica-b",
  });

  replicaA.unregisterMachine("machine-1");
  await replicaB.registerMachine("machine-1", "server-1", makeFakeWs() as never);

  freshRegister.resolve();
  await flushMicrotasks();
  assert.equal(await replicaC.getMachineStatus("machine-1"), "online");

  staleUnregister.resolve();
  await flushMicrotasks();

  await assert.doesNotReject(() => replicaC.startAgent("agent-1"));

  replicaA.shutdown();
  replicaB.shutdown();
  replicaC.shutdown();
});

test("stale self-owned replica mapping does not report the machine as online", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  store.machineReplicaOwners.set("machine-1", REPLICA_ID);
  const orchestrator = new StartRoutingMismatchDeterministicOrchestrator(store);

  assert.equal(await orchestrator.getMachineStatus("machine-1"), "offline");
  await assert.rejects(() => orchestrator.startAgent("agent-1"), /Machine offline\. Please start your local daemon\./);

  orchestrator.shutdown();
});

test("buggy self-owned replica semantics would misclassify the machine as online", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  store.machineReplicaOwners.set("machine-1", REPLICA_ID);
  const orchestrator = new BuggySelfOwnedReplicaReachabilityOrchestrator(store);

  assert.equal(await orchestrator.getMachineStatus("machine-1"), "online");

  orchestrator.shutdown();
});

test("loadMachineReachabilityPlanInput does not hit replica-owner lookup for missing or local machines", async () => {
  const store = new CountingReplicaOwnerStore();
  const orchestrator = new MachineReachabilityInputDeterministicOrchestrator(store);

  assert.deepEqual(await orchestrator.callLoadMachineReachabilityPlanInput(null), {
    hasMachineId: false,
    hasLocalMachine: false,
    replicaStateAvailable: true,
    ownerReplica: null,
  });
  assert.equal(store.ownerLookupCount, 0);

  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  assert.deepEqual(await orchestrator.callLoadMachineReachabilityPlanInput({ machineId: "machine-1" }), {
    hasMachineId: true,
    hasLocalMachine: true,
    replicaStateAvailable: true,
    ownerReplica: null,
  });
  assert.equal(store.ownerLookupCount, 0);

  orchestrator.shutdown();
});

test("loadMachineReachabilityPlanInput loads remote owner only when the machine is not local", async () => {
  const store = new CountingReplicaOwnerStore();
  store.machineReplicas.add("machine-1");
  store.machineReplicaOwners.set("machine-1", "remote-replica-2");
  const orchestrator = new MachineReachabilityInputDeterministicOrchestrator(store);

  assert.deepEqual(await orchestrator.callLoadMachineReachabilityPlanInput({ machineId: "machine-1" }), {
    hasMachineId: true,
    hasLocalMachine: false,
    replicaStateAvailable: true,
    ownerReplica: "remote-replica-2",
  });
  assert.equal(store.ownerLookupCount, 1);

  orchestrator.shutdown();
});

test("user-visible machine read model stays offline and agent activity stays offline when reachability is gone", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator);

  const machine = await buildMachineReadModel(makeMachineRecord(), orchestrator);
  const activity = await orchestrator.getActivity("agent-1");

  assert.equal(machine.status, "offline");
  assert.deepEqual(activity, { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

test("user-visible machine read model stays online and agent activity stays online from shared remote reachability", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  const machine = await buildMachineReadModel(makeMachineRecord(), orchestrator);
  const activity = await orchestrator.getActivity("agent-1");

  assert.equal(machine.status, "online");
  assert.deepEqual(activity, { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("user-visible machine read model includes the current local daemon version", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const ws = makeFakeWs();
  const conn = seedMachineConnection(orchestrator, "machine-1", ws);
  (conn as { daemonVersion: string | null }).daemonVersion = "1.2.3";

  const machine = await buildMachineReadModel(makeMachineRecord(), orchestrator);

  assert.equal(machine.status, "online");
  assert.equal(machine.daemonVersion, "1.2.3");

  orchestrator.shutdown();
});

test("user-visible machine read model treats stale open local sockets as offline", async () => {
  const clock = new FakeClock();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), clock);
  const ws = makeFakeWs(1);
  await orchestrator.registerMachine("machine-1", "server-1", ws as never);

  // At 60s the cleanup heartbeat has not terminated yet because the timeout is
  // strictly greater than 60s. The read model must still stop treating this
  // half-dead local connection as online.
  clock.advance(60_001);

  const machine = await buildMachineReadModel(makeMachineRecord(), orchestrator);

  assert.equal(ws.readyState, 1);
  assert.equal(machine.status, "offline");

  orchestrator.shutdown();
});

test("user-visible machine read model falls back to the persisted daemon version for remotely reachable machines", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  const orchestrator = new DeterministicAgentOrchestrator(store);

  const machine = await buildMachineReadModel({
    ...makeMachineRecord(),
    daemonVersion: "1.2.3",
  }, orchestrator);

  assert.equal(machine.status, "online");
  assert.equal(machine.daemonVersion, "1.2.3");

  orchestrator.shutdown();
});

test("machine status websocket event matches machine read model when a machine connects", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const emitted: Array<{ room: string; event: string; payload: unknown }> = [];
  orchestrator.setIO(makeFakeServerIO(emitted) as never);
  const ws = makeFakeWs(1);

  await orchestrator.registerMachine("machine-1", "server-1", ws as never);

  const machine = await buildMachineReadModel(makeMachineRecord(), orchestrator);
  assert.deepEqual(emitted.at(-1), {
    room: "server:server-1",
    event: "machine:status",
    payload: { machineId: "machine-1", status: "online", statusVersion: 1 },
  });
  assert.equal(machine.status, "online");
  assert.equal(machine.statusVersion, 1);
  assert.equal(machine.status, (emitted.at(-1)?.payload as { status: string }).status);

  orchestrator.shutdown();
});

test("machine status websocket event matches machine read model when a machine disconnects", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new DeterministicAgentOrchestrator(undefined, undefined, tracer);
  const emitted: Array<{ room: string; event: string; payload: unknown }> = [];
  orchestrator.setIO(makeFakeServerIO(emitted) as never);
  const ws = makeFakeWs(1);
  await orchestrator.registerMachine("machine-1", "server-1", ws as never);

  await orchestrator.handleMachineDisconnect("machine-1", ws as never, { cause: "socket_close" });

  const machine = await buildMachineReadModel(makeMachineRecord(), orchestrator);
  assert.deepEqual(emitted.at(-1), {
    room: "server:server-1",
    event: "machine:status",
    payload: { machineId: "machine-1", status: "offline", statusVersion: 2 },
  });
  assert.equal(machine.status, "offline");
  assert.equal(machine.statusVersion, 2);
  assert.equal(machine.status, (emitted.at(-1)?.payload as { status: string }).status);
  const disconnectSpan = sink.getTrace(traceId).find((span) => span.name === "server.machine.connection.disconnect");
  assert.ok(disconnectSpan);
  assert.equal(disconnectSpan.attrs?.machine_id_present, true);
  assert.equal(disconnectSpan.attrs?.cause, "socket_close");
  assert.equal(disconnectSpan.attrs?.outcome, "processed");
  assert.equal(disconnectSpan.attrs?.affected_agents_count, 0);
  assert.equal(disconnectSpan.attrs?.status_version, 2);

  orchestrator.shutdown();
});

test("machine status version increases monotonically across reconnect handoffs", async () => {
  const shared = new ControlledReplicaState();
  const replicaA = new DeterministicAgentOrchestrator(new ControlledReplicaStateStore(shared, "replica-a"));
  const replicaB = new DeterministicAgentOrchestrator(new ControlledReplicaStateStore(shared, "replica-b"));

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);
  const online = await buildMachineReadModel(makeMachineRecord(), replicaB);
  assert.equal(online.status, "online");
  assert.equal(online.statusVersion, 1);

  await replicaA.handleMachineDisconnect("machine-1", undefined, { cause: "socket_close" });
  const offline = await buildMachineReadModel(makeMachineRecord(), replicaB);
  assert.equal(offline.status, "offline");
  assert.equal(offline.statusVersion, 2);

  await replicaA.registerMachine("machine-1", "server-1", makeFakeWs() as never);
  const reconnected = await buildMachineReadModel(makeMachineRecord(), replicaB);
  assert.equal(reconnected.status, "online");
  assert.equal(reconnected.statusVersion, 3);

  replicaA.shutdown();
  replicaB.shutdown();
});

test("trajectory activity events are durably persisted and hydration matches the emitted websocket payload", async () => {
  const clock = new FakeClock();
  clock.advance(1234);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(new Map(), clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  const entries: TrajectoryEntry[] = [
    { kind: "thinking", text: "plan" },
    { kind: "tool_start", toolName: "read_file", toolInput: "{\"path\":\"foo.ts\"}" },
  ];

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "editing",
    entries,
  } as MachineToServerMessage);

  assert.equal(orchestrator.emittedActivityPayloads.length, 1);
  assert.deepEqual(orchestrator.emittedActivityPayloads[0], {
    agentId: "agent-1",
    activity: "working",
    detail: "editing",
    timestamp: clock.now(),
    entries,
    serverSeq: 1,
  });
  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), entries.map((entry) => ({
    timestamp: clock.now(),
    entry,
  })));

  orchestrator.shutdown();
});

test("persisted activity log survives orchestrator restart and remains available for hydration", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const firstClock = new FakeClock();
  firstClock.advance(4321);
  const first = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, firstClock);
  seedActiveAgent(first);
  seedMachineConnection(first, "machine-1", makeFakeWs());

  const entries: TrajectoryEntry[] = [{ kind: "text", text: "done" }];

  await first.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "wrapping up",
    entries,
  } as MachineToServerMessage);

  const expected = await first.listRecentActivityLog("agent-1");
  first.shutdown();

  const second = new PersistedActivityLogDeterministicOrchestrator(persistedLogs);
  assert.deepEqual(await second.listRecentActivityLog("agent-1"), expected);
  second.shutdown();
});

test("persisted activity log keeps older events even though the default hydration window stays at 50", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  for (let i = 0; i < 60; i += 1) {
    clock.advance(1);
    await orchestrator.handleMachineMessage("machine-1", {
      type: "agent:activity",
      agentId: "agent-1",
      activity: "working",
      detail: `step-${i}`,
      entries: [{ kind: "text", text: `entry-${i}` }],
    } as MachineToServerMessage);
  }

  const defaultWindow = await orchestrator.listRecentActivityLog("agent-1");
  assert.equal(defaultWindow.length, 50);
  assert.equal(defaultWindow[0]?.entry.kind, "text");
  assert.equal((defaultWindow[0]?.entry as { text: string }).text, "entry-10");
  assert.equal((defaultWindow.at(-1)?.entry as { text: string }).text, "entry-59");

  const fullLog = await orchestrator.listRecentActivityLog("agent-1", 200);
  assert.equal(fullLog.length, 60);
  assert.equal((fullLog[0]?.entry as { text: string }).text, "entry-0");
  assert.equal((fullLog.at(-1)?.entry as { text: string }).text, "entry-59");

  orchestrator.shutdown();
});

test("recent persisted transient activity keeps visible agent activity from falling back to online", async () => {
  const timestamp = 12_345;
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>([
    ["agent-1", [{ timestamp, entry: { kind: "status", activity: "working", detail: "Compiling prompt" } }]],
  ]);
  const clock = new FakeClock();
  clock.advance(timestamp);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "Compiling prompt",
  });

  orchestrator.shutdown();
});

test("stale persisted transient activity still decays back to online", async () => {
  const timestamp = 12_345;
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>([
    ["agent-1", [{ timestamp, entry: { kind: "status", activity: "thinking", detail: "Old thought" } }]],
  ]);
  const clock = new FakeClock();
  clock.advance(timestamp + 91_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "online",
    activityDetail: "",
  });

  orchestrator.shutdown();
});


test("server-side offline activity broadcasts without explicit trajectory entries are durably persisted", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(20_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  (orchestrator as any).broadcastActivity("agent-1", "offline", "Stopped");

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry: { kind: "status", activity: "offline", detail: "Stopped" },
  }]);

  orchestrator.shutdown();
});

test("server-side error transition without explicit trajectory entries is durably persisted", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(25_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  (orchestrator as any).broadcastActivity("agent-1", "error", "read_history timed out after 60000ms");

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry: { kind: "status", activity: "error", detail: "read_history timed out after 60000ms" },
  }]);

  orchestrator.shutdown();
});

test("server-side starting transition without explicit trajectory entries is durably persisted", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(27_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  (orchestrator as any).broadcastActivity("agent-1", "working", "Starting\u2026");

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry: { kind: "status", activity: "working", detail: "Starting\u2026" },
  }]);
  assert.deepEqual(orchestrator.emittedActivityPayloads.at(-1), {
    agentId: "agent-1",
    activity: "working",
    detail: "Starting\u2026",
    timestamp: clock.now(),
    entries: [{ kind: "status", activity: "working", detail: "Starting\u2026" }],
    serverSeq: 1,
  });

  orchestrator.shutdown();
});

test("starting activity log entry is followed by durable idle resolution", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(28_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  (orchestrator as any).broadcastActivity("agent-1", "working", "Starting\u2026");
  clock.advance(25);
  (orchestrator as any).maybeResolveStartingActivity("agent-1");

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [
    {
      timestamp: 28_000,
      entry: { kind: "status", activity: "working", detail: "Starting\u2026" },
    },
    {
      timestamp: 28_025,
      entry: { kind: "status", activity: "online", detail: "" },
    },
  ]);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("message IO status-only activity is durably persisted", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(29_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  (orchestrator as any).broadcastActivity("agent-1", "working", "Message received");

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry: { kind: "status", activity: "working", detail: "Message received" },
  }]);

  orchestrator.shutdown();
});

test("control recovery status-only activity is durably persisted", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(29_500);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  (orchestrator as any).broadcastActivity("agent-1", "working", "Restarting stalled codex runtime for queued message");

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry: { kind: "status", activity: "working", detail: "Restarting stalled codex runtime for queued message" },
  }]);

  orchestrator.shutdown();
});

test("server-side online status-only pulses remain non-durable", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(30_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  (orchestrator as any).broadcastActivity("agent-1", "online", "");

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), []);

  orchestrator.shutdown();
});

test("applyActivityBroadcastAction persists and emits immediately for durable activity payloads", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(35_000);
  const orchestrator = new ActivityBroadcastApplyDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  const entries: TrajectoryEntry[] = [{ kind: "text", text: "hello" }];
  orchestrator.callApplyActivityBroadcastAction(
    "persist-and-emit-now",
    "agent-1",
    "working",
    "thinking",
    clock.now(),
    entries,
  );

  await Promise.resolve();

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry: { kind: "text", text: "hello" },
  }]);
  assert.deepEqual(orchestrator.emittedActivityPayloads.at(-1), {
    agentId: "agent-1",
    activity: "working",
    detail: "thinking",
    timestamp: clock.now(),
    entries,
    serverSeq: 1,
  });
  orchestrator.shutdown();
});

test("applyActivityBroadcastAction debounces non-durable status-only pulses", () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(40_000);
  const orchestrator = new ActivityBroadcastApplyDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  orchestrator.callApplyActivityBroadcastAction(
    "debounce-only",
    "agent-1",
    "online",
    "",
    clock.now(),
    [],
  );

  assert.equal((orchestrator as any).activityDebounceTimers.has("agent-1"), true);
  assert.deepEqual(orchestrator.emittedActivityPayloads, []);
  assert.deepEqual(persistedLogs.get("agent-1") ?? [], []);
  orchestrator.shutdown();
});

test("buggy cross-replica fallback semantics would misclassify the same agent as offline", async () => {
  const store = new BuggyReplicaFallbackStore();
  store.machineReplicas.add("machine-1");

  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  const activity = await orchestrator.getActivity("agent-1");
  assert.deepEqual(activity, { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

test("pong refresh self-heals a missing machine replica mapping", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  await orchestrator.handleMachineMessage("machine-1", { type: "pong" } as MachineToServerMessage);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("expire-only refresh semantics would fail to self-heal after pong", async () => {
  const store = new ExpireOnlyRefreshStore();
  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  await orchestrator.handleMachineMessage("machine-1", { type: "pong" } as MachineToServerMessage);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

test("fresh remote cached activity does not mask a missing machine replica heartbeat", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "still-running",
    updatedAt: Date.now(),
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

test("fresh remote cached offline state does not mask a recovered online machine", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "offline",
    detail: "",
    updatedAt: Date.now(),
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("local cached activity remains authoritative over remote soft hints while the machine is connected here", async () => {
  const store = new InMemoryReplicaStateStore();
  await store.setAgentActivity("agent-1", "offline", "");
  const orchestrator = new DeterministicAgentOrchestrator(store);
  const ws = makeFakeWs(1);

  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", ws);
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "local-run",
    updatedAt: Date.now(),
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "local-run",
  });

  orchestrator.shutdown();
});

test("getActivity traces and ignores soft activity hints when the agent has no machine", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), undefined, tracer);

  (orchestrator as any).agentStateCache.set("agent-1", {
    status: "active",
    machineId: null,
    sessionId: null,
    expectedLaunchId: null,
    launchGuardMode: "legacy",
    serverId: "server-1",
    name: "agent-1",
    displayName: null,
    description: null,
    model: "gpt-5",
    runtime: "codex",
    runtimeState: "running_idle",
    reasoningEffort: null,
    envVars: null,
  });
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stale-soft-state",
    updatedAt: Date.now() - 5_000,
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "offline",
    activityDetail: "",
  });

  const events = eventsForSpan(sink, traceId, "server.agent.activity.resolve");
  assert.deepEqual(events.map((event) => event.name), [
    "activity.hint.seen",
    "activity.reachability.resolved",
    "activity.hint.ignored",
  ]);
  assert.equal(events[1]?.attrs?.reachability, "none");
  assert.equal(events[2]?.attrs?.reason, "hard-reachability-offline");
  assert.equal(events.some((event) => event.name === "activity.hint.returned"), false);
  assert.equal(events.some((event) => event.name === "activity.hint.normalized"), false);

  orchestrator.shutdown();
});

test("getActivity derives offline when an active agent has no machine and no soft hints", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), undefined, tracer);

  (orchestrator as any).agentStateCache.set("agent-1", {
    status: "active",
    machineId: null,
    sessionId: null,
    expectedLaunchId: null,
    launchGuardMode: "legacy",
    serverId: "server-1",
    name: "agent-1",
    displayName: null,
    description: null,
    model: "gpt-5",
    runtime: "codex",
    runtimeState: "running_idle",
    reasoningEffort: null,
    envVars: null,
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "offline",
    activityDetail: "",
  });

  const [span] = sink.getTrace(traceId);
  assert.equal(span?.name, "server.agent.activity.resolve");
  assert.deepEqual(span?.attrs, {
    agent_id_present: true,
    outcome: "offline",
    source: "derived",
  });
  assert.deepEqual(span?.events, []);

  orchestrator.shutdown();
});

test("getActivity can link resolve spans to a request parent without leaking raw agent ids", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), undefined, tracer);
  seedActiveAgent(orchestrator, "agent-raw-id");
  (orchestrator as any).agentStateCache.get("agent-raw-id").machineId = null;
  const parent = tracer.startSpan("server.http.request", {
    surface: "server",
    kind: "server",
    attrs: { route_pattern: "/api/agents" },
  });

  assert.deepEqual(await orchestrator.getActivity("agent-raw-id", { parent: parent.context }), {
    activity: "offline",
    activityDetail: "",
  });
  parent.end("ok");

  const span = sink.getTrace(traceId).find((candidate) => candidate.name === "server.agent.activity.resolve");
  assert.ok(span);
  assert.equal(span.context.parentSpanId, parent.context.spanId);
  assert.equal(span.context.traceId, parent.context.traceId);
  assert.equal(span.attrs?.agent_id_present, true);
  assert.equal(Object.values(span.attrs ?? {}).includes("agent-raw-id"), false);
  orchestrator.shutdown();
});

test("loadActivityHintResolutionPlanInput marks fresh local-cache snapshots as fresh and locally reachable", async () => {
  const orchestrator = new ActivityHintInputDeterministicOrchestrator();
  const ws = makeFakeWs(1);
  const now = Date.now();

  seedMachineConnection(orchestrator, "machine-1", ws);

  assert.deepEqual(
    await orchestrator.callLoadActivityHintResolutionPlanInput(
      { status: "active", machineId: "machine-1" },
      { activity: "working", detail: "local-run", updatedAt: now },
      "local-cache",
    ),
    {
      reachability: "local",
      shouldTrustRecoveredOfflineHint: false,
      source: "local-cache",
      isFreshLocalCache: true,
    },
  );

  orchestrator.shutdown();
});

test("loadActivityHintResolutionPlanInput marks recovered remote offline hints for ignore", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  const orchestrator = new ActivityHintInputDeterministicOrchestrator(store);

  assert.deepEqual(
    await orchestrator.callLoadActivityHintResolutionPlanInput(
      { status: "active", machineId: "machine-1" },
      { activity: "offline", detail: "", updatedAt: Date.now() },
      "redis",
    ),
    {
      reachability: "remote",
      shouldTrustRecoveredOfflineHint: true,
      source: "redis",
      isFreshLocalCache: true,
    },
  );

  orchestrator.shutdown();
});

test("stale agent activity from a previous launch does not overwrite the current launch", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1));

  await orchestrator.startAgent("agent-1");
  const launch1 = orchestrator.startMessages[0]!.launchId!;
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-1",
    launchId: launch1,
  });
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "inactive",
    launchId: launch1,
  });

  await orchestrator.startAgent("agent-1");
  const launch2 = orchestrator.startMessages[1]!.launchId!;
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-2",
    launchId: launch2,
  });
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "current-launch",
    launchId: launch2,
  });
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "offline",
    detail: "stale-launch",
    launchId: launch1,
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "current-launch",
  });

  orchestrator.shutdown();
});

test("stale inactive status from a previous launch does not kill the current launch", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1));

  await orchestrator.startAgent("agent-1");
  const launch1 = orchestrator.startMessages[0]!.launchId!;
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-1",
    launchId: launch1,
  });
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "inactive",
    launchId: launch1,
  });

  await orchestrator.startAgent("agent-1");
  const launch2 = orchestrator.startMessages[1]!.launchId!;
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-2",
    launchId: launch2,
  });
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "inactive",
    launchId: launch1,
  });

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");

  orchestrator.shutdown();
});

test("reconnect replay with the current launchId is accepted in guarded mode", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1));

  await orchestrator.startAgent("agent-1");
  const launch1 = orchestrator.startMessages[0]!.launchId!;

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-replay",
    launchId: launch1,
  });

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").sessionId, "session-replay");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").expectedLaunchId, launch1);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "guarded");

  orchestrator.shutdown();
});

test("legacy lifecycle events are accepted in legacy mode but rejected once the agent is guarded", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1));
  seedActiveAgent(orchestrator);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "legacy-accepted",
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "legacy-accepted",
  });

  await orchestrator.startAgent("agent-1");
  const launch1 = orchestrator.startMessages[0]!.launchId!;
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").expectedLaunchId, launch1);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "offline",
    detail: "legacy-rejected-after-guard",
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "Starting…",
  });

  orchestrator.shutdown();
});

test("old daemon without launchId support does not get launch guard", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  // Simulate an old daemon (version 0.30.0, before launchId support)
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1), "0.30.0");

  await orchestrator.startAgent("agent-1");
  const startMsg = orchestrator.startMessages[0]!;
  // Old daemon should not receive a launchId
  assert.equal(startMsg.launchId, undefined);
  // Agent should be in legacy mode (no guard)
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "legacy");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").expectedLaunchId, null);

  // Full lifecycle without launchId — all events should be accepted
  // 1. Session init (old daemon sends session without launchId)
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-old-1",
  });
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").sessionId, "session-old-1");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");

  // 2. Activity updates
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "old-daemon-working",
  });
  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "old-daemon-working",
  });

  // 3. Status inactive (agent stops)
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "inactive",
  });
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");

  // 4. Restart — still no launch guard for old daemon
  await orchestrator.startAgent("agent-1");
  const startMsg2 = orchestrator.startMessages[1]!;
  assert.equal(startMsg2.launchId, undefined);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "legacy");

  // 5. New session after restart is accepted
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-old-2",
  });
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").sessionId, "session-old-2");

  orchestrator.shutdown();
});

test("old daemon with null version does not get launch guard", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1), null);

  await orchestrator.startAgent("agent-1");
  const startMsg = orchestrator.startMessages[0]!;
  assert.equal(startMsg.launchId, undefined);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "legacy");

  orchestrator.shutdown();
});

test("daemon versions from last week (v0.28.x, v0.29.x) work without launch guard", async () => {
  for (const version of ["0.27.1-alpha.0", "0.28.0", "0.28.1-alpha.3", "0.29.0", "0.29.1-alpha.0", "0.30.0"]) {
    const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
    seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1), version);

    await orchestrator.startAgent("agent-1");
    assert.equal(orchestrator.startMessages.at(-1)!.launchId, undefined, `v${version} should not get launchId`);
    assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "legacy", `v${version} should be legacy`);

    // Lifecycle events without launchId should work
    await orchestrator.handleMachineMessage("machine-1", {
      type: "agent:session",
      agentId: "agent-1",
      sessionId: `session-${version}`,
    });
    assert.equal((orchestrator as any).agentStateCache.get("agent-1").sessionId, `session-${version}`, `v${version} session should be accepted`);

    orchestrator.shutdown();
  }
});

test("modern daemon (>= 0.30.1) gets launch guard as before", async () => {
  for (const version of ["0.30.1", "0.30.1-alpha.1", "0.31.0", "1.0.0"]) {
    const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
    seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1), version);

    await orchestrator.startAgent("agent-1");
    const launchId = orchestrator.startMessages.at(-1)!.launchId;
    assert.ok(launchId, `v${version} should get launchId`);
    assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "guarded", `v${version} should be guarded`);
    assert.equal((orchestrator as any).agentStateCache.get("agent-1").expectedLaunchId, launchId, `v${version} should have expectedLaunchId`);

    orchestrator.shutdown();
  }
});

test("failed guarded start clears the launch guard and releases the wake lock", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new FailingLaunchGuardDeterministicAgentOrchestrator(store);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1), "1.0.0");

  await assert.rejects(() => orchestrator.startAgent("agent-1"), /Machine offline\. Please start your local daemon\./);

  const startMsg = orchestrator.startMessages[0]!;
  assert.ok(startMsg.launchId);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "legacy");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").expectedLaunchId, null);
  assert.equal(store.wakeLocks.size, 0);

  orchestrator.shutdown();
});

test("agent inactive status clears the launch guard and releases the wake lock", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator(store);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs(1), "1.0.0");

  await orchestrator.startAgent("agent-1");
  assert.equal(store.wakeLocks.size, 1);

  const startMsg = orchestrator.startMessages[0]!;
  assert.ok(startMsg.launchId);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "guarded");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").expectedLaunchId, startMsg.launchId);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "inactive",
    launchId: startMsg.launchId,
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").launchGuardMode, "legacy");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").expectedLaunchId, null);
  assert.equal(store.wakeLocks.size, 0);

  orchestrator.shutdown();
});

test("getActivity resolution order ignores recovered offline hints before falling through to recent persisted and then derived fallback", async () => {
  const clock = new FakeClock();
  clock.advance(100_000);
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  store.agentActivities.set("agent-1", {
    activity: "offline",
    detail: "",
    updatedAt: clock.now(),
  });
  const orchestrator = new ActivityResolutionDeterministicOrchestrator(
    store,
    {
      activity: "working",
      detail: "persisted-run",
      updatedAt: clock.now() - 10_000,
    },
    clock,
  );

  seedActiveAgent(orchestrator);
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "offline",
    detail: "",
    updatedAt: clock.now(),
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "persisted-run",
  });

  orchestrator.setPersistedHint({
    activity: "working",
    detail: "persisted-run",
    updatedAt: clock.now() - 91_000,
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "online",
    activityDetail: "",
  });

  orchestrator.shutdown();
});

test("getActivity resolution order prefers fresh redis activity over recent persisted fallback when local cache is absent", async () => {
  const clock = new FakeClock();
  clock.advance(100_000);
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  store.agentActivities.set("agent-1", {
    activity: "working",
    detail: "remote-run",
    updatedAt: clock.now(),
  });
  const orchestrator = new ActivityResolutionDeterministicOrchestrator(
    store,
    {
      activity: "thinking",
      detail: "persisted-thought",
      updatedAt: clock.now() - 5_000,
    },
    clock,
  );

  seedActiveAgent(orchestrator);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "remote-run",
  });

  assert.deepEqual((orchestrator as any).agentActivity.get("agent-1"), {
    activity: "working",
    detail: "remote-run",
    updatedAt: clock.now(),
  });

  orchestrator.shutdown();
});

test("redis activity does not mask a missing machine replica heartbeat", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  await store.setAgentActivity("agent-1", "working", "still-running");
  store.machineReplicas.delete("machine-1");

  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

test("stale redis transient activity downgrades to online when the machine is still reachable", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  store.agentActivities.set("agent-1", {
    activity: "working",
    detail: "stuck",
    updatedAt: Date.now() - 91_000,
  });

  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("applyStaleTransientNormalizationAction normalizes stale local-cache transient activity to online and schedules broadcast", () => {
  const orchestrator = new StaleTransientApplyDeterministicOrchestrator();
  const now = Date.now();
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stuck",
    updatedAt: now - 91_000,
  });

  assert.deepEqual(
    orchestrator.callApplyStaleTransientNormalizationAction("normalize-online", "agent-1", "local-cache", now),
    { activity: "online", activityDetail: "" },
  );
  assert.deepEqual((orchestrator as any).agentActivity.get("agent-1"), {
    activity: "online",
    detail: "",
    updatedAt: now,
  });
  assert.ok((orchestrator as any).activityDebounceTimers.has("agent-1"));

  orchestrator.shutdown();
});

test("applyStaleTransientNormalizationAction returns online for stale remote transient hints without mutating local cache", () => {
  const orchestrator = new StaleTransientApplyDeterministicOrchestrator();
  const now = Date.now();
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "cached-local",
    updatedAt: now - 5_000,
  });

  assert.deepEqual(
    orchestrator.callApplyStaleTransientNormalizationAction("normalize-online", "agent-1", "redis", now),
    { activity: "online", activityDetail: "" },
  );
  assert.deepEqual((orchestrator as any).agentActivity.get("agent-1"), {
    activity: "working",
    detail: "cached-local",
    updatedAt: now - 5_000,
  });
  assert.equal((orchestrator as any).activityDebounceTimers.has("agent-1"), false);

  orchestrator.shutdown();
});

test("fresh redis offline state does not mask a recovered online machine", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");
  await store.setAgentActivity("agent-1", "offline", "");

  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("applyActivityHintResolutionAction caches and returns remote soft hints", () => {
  const orchestrator = new ActivityHintApplyDeterministicOrchestrator();
  const snapshot = {
    activity: "working",
    detail: "remote-run",
    updatedAt: Date.now(),
  };

  const visible = orchestrator.callApplyActivityHintResolutionAction(
    "cache-and-return-snapshot",
    "agent-1",
    snapshot,
  );

  assert.deepEqual(visible, {
    activity: "working",
    activityDetail: "remote-run",
  });
  assert.deepEqual((orchestrator as any).agentActivity.get("agent-1"), snapshot);
  orchestrator.shutdown();
});

test("applyActivityHintResolutionAction ignores stale or recovered hints without mutating cache", () => {
  const orchestrator = new ActivityHintApplyDeterministicOrchestrator();
  const existing = {
    activity: "online",
    detail: "",
    updatedAt: Date.now(),
  };
  const snapshot = {
    activity: "offline",
    detail: "",
    updatedAt: Date.now() - 30_000,
  };
  (orchestrator as any).agentActivity.set("agent-1", existing);

  const visible = orchestrator.callApplyActivityHintResolutionAction(
    "ignore-hint",
    "agent-1",
    snapshot,
  );

  assert.equal(visible, null);
  assert.deepEqual((orchestrator as any).agentActivity.get("agent-1"), existing);
  orchestrator.shutdown();
});

// --- Server-side stale disconnect guard ---

test("stale machine disconnect (old socket close after reconnect) does not mark agents offline", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");

  const orchestrator = new DeterministicAgentOrchestrator(store);
  seedActiveAgent(orchestrator);

  const ws1 = {}; // old socket — replaced by ws2 on reconnect
  const ws2 = {}; // current socket
  seedMachineConnection(orchestrator, "machine-1", ws2);

  // ws1.close fires after ws2 has already taken over — should be silently ignored
  await orchestrator.handleMachineDisconnect("machine-1", ws1 as never);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("without stale socket guard, a reconnect+close race would incorrectly mark agents offline", async () => {
  const store = new InMemoryReplicaStateStore();
  store.machineReplicas.add("machine-1");

  const orchestrator = new BuggyStaleDisconnectOrchestrator(store);
  seedActiveAgent(orchestrator);

  const ws1 = {};
  const ws2 = {};
  seedMachineConnection(orchestrator, "machine-1", ws2);

  // Buggy orchestrator processes the stale ws1 disconnect as if it were legitimate
  await orchestrator.handleMachineDisconnect("machine-1", ws1 as never);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

// --- Message deliverability / inbox routing ---

test("cross-replica inbox delivery resolves a pending receive on the owning replica", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const replicaA = new MessageDeliverabilityOrchestrator("replica-a", network);
  const replicaB = new MessageDeliverabilityOrchestrator("replica-b", network);
  const wsB = makeFakeWs(1);

  seedActiveAgent(replicaA);
  seedActiveAgent(replicaB);
  seedMachineConnection(replicaB, "machine-1", wsB);

  const receivePromise = replicaB.receiveMessages("agent-1", true, 10_000);
  await Promise.resolve();

  const message = makeAgentMessage("hello from cross-replica route");
  await replicaA.deliverMessage("agent-1", message);

  const received = await receivePromise;
  assert.deepEqual(received, [message]);
  assert.equal(replicaA.deliveredToMachine.length, 0);
  assert.equal(replicaB.deliveredToMachine.length, 1);
  assert.equal(replicaB.deliveredToMachine[0]?.msg.type, "agent:deliver");

  replicaA.shutdown();
  replicaB.shutdown();
});

test("routed deliver command wakes an inactive current owner with the first message", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const staleReplica = new EndpointRoutedMessageDeliverabilityOrchestrator("replica-a", network);
  const currentOwner = new EndpointRoutedMessageDeliverabilityOrchestrator("replica-b", network);
  const wsB = makeFakeWs(1);

  seedActiveAgent(staleReplica, "agent-1", "machine-1");
  seedActiveAgent(currentOwner, "agent-1", "machine-1");
  (currentOwner as any).agentStateCache.get("agent-1").status = "inactive";
  seedMachineConnection(currentOwner, "machine-1", wsB);

  const message = makeAgentMessage("first mention after reconnect", 7);
  await staleReplica.deliverMessage("agent-1", message);
  await waitForCondition(() => wsB.sent.length === 1);

  const sent = wsB.sent.map((raw: string) => JSON.parse(raw));
  assert.equal(sent.length, 1);
  assert.equal(sent[0].type, "agent:start");
  assert.deepEqual(sent[0].wakeMessage, message);
  assert.equal((currentOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);

  staleReplica.shutdown();
  currentOwner.shutdown();
});

test("stale closed local machine entry does not block delivery to the real remote owner", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const replicaA = new MessageDeliverabilityOrchestrator("replica-a", network);
  const replicaB = new MessageDeliverabilityOrchestrator("replica-b", network);
  const staleWsA = makeFakeWs(3);
  const wsB = makeFakeWs(1);

  seedActiveAgent(replicaA);
  seedActiveAgent(replicaB);
  seedMachineConnection(replicaA, "machine-1", staleWsA);
  seedMachineConnection(replicaB, "machine-1", wsB);

  const receivePromise = replicaB.receiveMessages("agent-1", true, 10_000);
  await Promise.resolve();

  const message = makeAgentMessage("deliver after remap");
  await replicaA.deliverMessage("agent-1", message);

  const received = await receivePromise;
  assert.deepEqual(received, [message]);
  assert.equal((replicaA as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);
  assert.equal(replicaB.deliveredToMachine.length, 1);

  replicaA.shutdown();
  replicaB.shutdown();
});

test("buggy stale-local ownership semantics would strand the message on the wrong replica", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const replicaA = new BuggyStaleLocalMessageRoutingOrchestrator("replica-a", network);
  const replicaB = new BuggyStaleLocalMessageRoutingOrchestrator("replica-b", network);
  const staleWsA = makeFakeWs(3);
  const wsB = makeFakeWs(1);

  seedActiveAgent(replicaA);
  seedActiveAgent(replicaB);
  seedMachineConnection(replicaA, "machine-1", staleWsA);
  seedMachineConnection(replicaB, "machine-1", wsB);

  const message = makeAgentMessage("stranded by stale local owner");
  await replicaA.deliverMessage("agent-1", message);

  assert.equal((replicaA as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 1);
  assert.equal((replicaB as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);
  assert.equal(replicaB.deliveredToMachine.length, 0);

  replicaA.shutdown();
  replicaB.shutdown();
});

// --- Cross-replica routing failover after machine remap ---

test("stale routed machine command is re-routed to the new owner after remap", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const oldOwner = new MessageDeliverabilityOrchestrator("replica-a", network);
  const newOwner = new MessageDeliverabilityOrchestrator("replica-b", network);
  const wsB = makeFakeWs(1);

  seedMachineConnection(newOwner, "machine-1", wsB);

  const delivered = await oldOwner.handleRoutedMachineCommand("machine-1", {
    type: "agent:deliver",
    agentId: "agent-1",
    message: makeAgentMessage("rerouted machine command"),
    seq: 1,
  });

  assert.equal(delivered, true);
  assert.equal(newOwner.deliveredToMachine.length, 1);
  assert.equal(newOwner.deliveredToMachine[0]?.machineId, "machine-1");

  oldOwner.shutdown();
  newOwner.shutdown();
});

test("applyRoutedOwnershipAction short-circuits after a successful reroute", async () => {
  const orchestrator = new RoutedOwnershipApplyDeterministicOrchestrator();

  const delivered = await orchestrator.callApplyRoutedOwnershipAction("reroute-then-fallback", true);

  assert.equal(delivered, true);
  assert.deepEqual(orchestrator.calls, ["reroute"]);
  orchestrator.shutdown();
});

test("applyRoutedOwnershipAction falls back when reroute does not succeed", async () => {
  const orchestrator = new RoutedOwnershipApplyDeterministicOrchestrator();

  const delivered = await orchestrator.callApplyRoutedOwnershipAction("reroute-then-fallback", false);

  assert.equal(delivered, false);
  assert.deepEqual(orchestrator.calls, ["reroute", "fallback"]);
  orchestrator.shutdown();
});

test("buggy stale routed machine command semantics would silently drop delivery after remap", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const oldOwner = new BuggyRoutedMachineCommandOrchestrator("replica-a", network);
  const newOwner = new BuggyRoutedMachineCommandOrchestrator("replica-b", network);
  const wsB = makeFakeWs(1);

  seedMachineConnection(newOwner, "machine-1", wsB);

  const delivered = await oldOwner.handleRoutedMachineCommand("machine-1", {
    type: "agent:deliver",
    agentId: "agent-1",
    message: makeAgentMessage("dropped after remap"),
    seq: 1,
  });

  assert.equal(delivered, false);
  assert.equal(newOwner.deliveredToMachine.length, 0);

  oldOwner.shutdown();
  newOwner.shutdown();
});

test("stale routed inbox delivery is re-routed to the new owner after remap", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const oldOwner = new MessageDeliverabilityOrchestrator("replica-a", network);
  const newOwner = new MessageDeliverabilityOrchestrator("replica-b", network);
  const message = makeAgentMessage("rerouted inbox delivery");

  seedActiveAgent(oldOwner);
  seedActiveAgent(newOwner);

  const receivePromise = newOwner.receiveMessages("agent-1", true, 10_000);
  await Promise.resolve();

  const delivered = await oldOwner.handleRoutedInboxDelivery("agent-1", "machine-1", message);

  assert.equal(delivered, true);
  assert.deepEqual(await receivePromise, [message]);
  assert.equal((oldOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);

  oldOwner.shutdown();
  newOwner.shutdown();
});

test("buggy stale routed inbox semantics would strand the message on the old owner after remap", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const oldOwner = new BuggyRoutedInboxDeliveryOrchestrator("replica-a", network);
  const newOwner = new BuggyRoutedInboxDeliveryOrchestrator("replica-b", network);
  const message = makeAgentMessage("stale inbox on old owner");

  seedActiveAgent(oldOwner);
  seedActiveAgent(newOwner);

  const delivered = await oldOwner.handleRoutedInboxDelivery("agent-1", "machine-1", message);

  assert.equal(delivered, true);
  assert.equal((oldOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 1);
  assert.equal((newOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);

  oldOwner.shutdown();
  newOwner.shutdown();
});

test("routed inbox delivery revalidates against current cached ownership instead of a stale payload machineId", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-2", "replica-b"]]), replicas: new Map() };
  const oldOwner = new MessageDeliverabilityOrchestrator("replica-a", network);
  const newOwner = new MessageDeliverabilityOrchestrator("replica-b", network);
  const message = makeAgentMessage("rerouted using current ownership");

  seedActiveAgent(oldOwner, "agent-1", "machine-2");
  seedActiveAgent(newOwner, "agent-1", "machine-2");

  const receivePromise = newOwner.receiveMessages("agent-1", true, 10_000);
  await Promise.resolve();

  const delivered = await oldOwner.handleRoutedInboxDelivery("agent-1", "machine-1", message);

  assert.equal(delivered, true);
  assert.deepEqual(await receivePromise, [message]);
  assert.equal((oldOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);

  oldOwner.shutdown();
  newOwner.shutdown();
});

test("routed inbox delivery without payload machineId still revalidates current ownership for mixed-version compatibility", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-1", "replica-b"]]), replicas: new Map() };
  const oldOwner = new MessageDeliverabilityOrchestrator("replica-a", network);
  const newOwner = new MessageDeliverabilityOrchestrator("replica-b", network);
  const message = makeAgentMessage("rerouted without payload machine hint");

  seedActiveAgent(oldOwner);
  seedActiveAgent(newOwner);

  const receivePromise = newOwner.receiveMessages("agent-1", true, 10_000);
  await Promise.resolve();

  const delivered = await oldOwner.handleRoutedInboxDelivery("agent-1", null, message);

  assert.equal(delivered, true);
  assert.deepEqual(await receivePromise, [message]);
  assert.equal((oldOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);

  oldOwner.shutdown();
  newOwner.shutdown();
});

test("buggy payload-anchored routed inbox semantics would strand delivery on stale ownership hints", async () => {
  const network: DeliverabilityNetwork = { owners: new Map([["machine-2", "replica-b"]]), replicas: new Map() };
  const oldOwner = new BuggyPayloadAnchoredRoutedInboxOrchestrator("replica-a", network);
  const newOwner = new BuggyPayloadAnchoredRoutedInboxOrchestrator("replica-b", network);
  const message = makeAgentMessage("stale machine hint strands delivery");

  seedActiveAgent(oldOwner, "agent-1", "machine-2");
  seedActiveAgent(newOwner, "agent-1", "machine-2");

  const delivered = await oldOwner.handleRoutedInboxDelivery("agent-1", "machine-1", message);

  assert.equal(delivered, true);
  assert.equal((oldOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 1);
  assert.equal((newOwner as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);

  oldOwner.shutdown();
  newOwner.shutdown();
});

test("late routed inbox delivery is dropped after the agent has already gone inactive", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const message = makeAgentMessage("late message after stop");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "inactive";

  const delivered = await orchestrator.handleRoutedInboxDelivery("agent-1", "machine-1", message);

  assert.equal(delivered, true);
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  orchestrator.shutdown();
});

test("applyLocalDeliveryGateAction delivers locally when the gate says deliver-locally", () => {
  const orchestrator = new LocalDeliveryGateApplyDeterministicOrchestrator();
  const message = makeAgentMessage("deliver now");

  const delivered = orchestrator.callApplyLocalDeliveryGateAction("deliver-locally", "agent-1", message);

  assert.equal(delivered, true);
  assert.deepEqual((orchestrator as any).agentInboxes.get("agent-1")?.inbox ?? [], [message]);
  orchestrator.shutdown();
});

test("applyLocalDeliveryGateAction drops without creating an inbox when the gate says drop-delivery", () => {
  const orchestrator = new LocalDeliveryGateApplyDeterministicOrchestrator();
  const message = makeAgentMessage("drop now");

  const delivered = orchestrator.callApplyLocalDeliveryGateAction("drop-delivery", "agent-1", message);

  assert.equal(delivered, true);
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  orchestrator.shutdown();
});

test("buggy late routed inbox semantics recreate a local inbox even after the agent is inactive", async () => {
  const network: DeliverabilityNetwork = { owners: new Map(), replicas: new Map() };
  const orchestrator = new BuggyRoutedInboxDeliveryOrchestrator("replica-a", network);
  const message = makeAgentMessage("late message after stop");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "inactive";

  const delivered = await orchestrator.handleRoutedInboxDelivery("agent-1", "machine-1", message);

  assert.equal(delivered, true);
  assert.equal((orchestrator as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 1);
  orchestrator.shutdown();
});

test("deliverMessage wakes an inactive agent with the current user message", async () => {
  const orchestrator = new InactiveWindowDeliverMessageOrchestrator();
  const message = makeAgentMessage("message during reset window");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "inactive";

  await orchestrator.deliverMessage("agent-1", message);

  assert.equal(orchestrator.sentToMachine.length, 1);
  const startMsg = orchestrator.sentToMachine[0];
  assert.ok(startMsg && startMsg.type === "agent:start");
  assert.deepEqual(startMsg, {
    type: "agent:start",
    agentId: "agent-1",
    config: {
      name: "agent-1",
      displayName: null,
      description: null,
      model: "gpt-5",
      runtime: "codex",
      runtimeConfig: {
        version: 1,
        runtime: "codex",
        model: { kind: "preset", id: "gpt-5" },
        mode: { kind: "default" },
        reasoningEffort: null,
        envVars: null,
      },
      reasoningEffort: null,
      executionMode: "cloud",
      envVars: null,
      sessionId: null,
      serverUrl: "http://localhost:3001",
      authToken: "",
      runtimeContext: {
        agentId: "agent-1",
        serverId: "server-1",
        machineId: "machine-1",
        machineName: null,
        machineHostname: null,
        machineOs: null,
        daemonVersion: null,
        workspacePath: null,
      },
    },
    wakeMessage: message,
    unreadSummary: undefined,
    resumePrompt: undefined,
    launchId: startMsg.launchId,
  });
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "wake",
      outcome: "attempted",
      cause: "message",
      previousStatus: "inactive",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "start",
      outcome: "completed",
      cause: "message",
      previousStatus: "inactive",
      nextStatus: "active",
    },
  ]);
  orchestrator.shutdown();
});

test("deliverMessage records wake failure when waking an inactive agent fails", async () => {
  const orchestrator = new FailingWakeDeliverMessageOrchestrator();
  const message = makeAgentMessage("message during failed wake");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "inactive";

  await orchestrator.deliverMessage("agent-1", message);

  assert.deepEqual(orchestrator.sentToMachine.map((msg) => msg.type), ["agent:start"]);
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "wake",
      outcome: "attempted",
      cause: "message",
      previousStatus: "inactive",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "start",
      outcome: "failed",
      cause: "message",
      previousStatus: "inactive",
      detail: "Machine offline. Please start your local daemon.",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "wake",
      outcome: "failed",
      cause: "message",
      previousStatus: "inactive",
      detail: "Machine offline. Please start your local daemon.",
    },
  ]);
  orchestrator.shutdown();
});

test("lifecycle events use the injected clock and stay time-ordered", async () => {
  const clock = new FakeClock();
  const orchestrator = new InactiveWindowDeliverMessageOrchestrator(new InMemoryReplicaStateStore(), clock);
  const message = makeAgentMessage("message after manual stop");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");

  clock.advance(10);
  await orchestrator.stopAgent("agent-1");
  clock.advance(15);
  await orchestrator.deliverMessage("agent-1", message);

  assert.deepEqual(
    recentLifecycleEventsWithTimestamps(orchestrator).map(({ at, action, outcome }) => ({ at, action, outcome })),
    [
      { at: 10, action: "stop", outcome: "completed" },
      { at: 25, action: "wake", outcome: "suppressed" },
    ],
  );
  orchestrator.shutdown();
});

test("manual stop moves the agent to stopped and new messages do not auto-wake it", async () => {
  const orchestrator = new InactiveWindowDeliverMessageOrchestrator();
  const message = makeAgentMessage("message after manual stop");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");

  await orchestrator.stopAgent("agent-1");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.equal(orchestrator.sentToMachine.length, 1);
  assert.equal(orchestrator.sentToMachine[0]?.type, "agent:stop");

  await orchestrator.deliverMessage("agent-1", message);

  assert.equal(orchestrator.sentToMachine.length, 1);
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "stop",
      outcome: "completed",
      cause: "manual",
      previousStatus: "active",
      nextStatus: "stopped",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "wake",
      outcome: "suppressed",
      cause: "message",
      previousStatus: "stopped",
    },
  ]);
  orchestrator.shutdown();
});

test("persisted stopped suppresses lazy wake when replica cache is stale inactive", async () => {
  const orchestrator = new StaleCachedStoppedDeliveryOrchestrator("stopped");
  const message = makeAgentMessage("message after stopped on another replica");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "inactive";

  await orchestrator.deliverMessage("agent-1", message);

  assert.equal(orchestrator.sentToMachine.length, 0);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "wake",
      outcome: "suppressed",
      cause: "message",
      previousStatus: "stopped",
    },
  ]);
  orchestrator.shutdown();
});

test("persisted stopped suppresses direct delivery when replica cache is stale active", async () => {
  const orchestrator = new StaleCachedStoppedDeliveryOrchestrator("stopped");
  const message = makeAgentMessage("message after stopped but stale active locally");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");

  await orchestrator.deliverMessage("agent-1", message);

  assert.equal(orchestrator.sentToMachine.length, 0);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "wake",
      outcome: "suppressed",
      cause: "message",
      previousStatus: "stopped",
    },
  ]);
  orchestrator.shutdown();
});

test("stop apply manual immediately surfaces stopped activity when daemon is reachable", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new StopApplyDeterministicOrchestrator(store);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.startAgent("agent-1");
  assert.equal(store.wakeLocks.size, 1);
  orchestrator.sentToMachine.length = 0;

  await orchestrator.callApplyStopAction("agent-1", "manual");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stale pre-stop activity",
    updatedAt: Date.now(),
  });
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  assert.equal(store.wakeLocks.size, 0);
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop"],
  );
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "start",
      outcome: "completed",
      cause: "manual",
      previousStatus: "active",
      nextStatus: "active",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "stop",
      outcome: "completed",
      cause: "manual",
      previousStatus: "active",
      nextStatus: "stopped",
    },
  ]);
  orchestrator.shutdown();
});

test("stop apply internal persists inactive without overwriting pre-stop activity when daemon is reachable", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new StopApplyDeterministicOrchestrator(store);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.startAgent("agent-1");
  assert.equal(store.wakeLocks.size, 1);
  orchestrator.sentToMachine.length = 0;

  await orchestrator.callApplyStopAction("agent-1", "internal");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  // Reachable-daemon stops are daemon-owned for visible activity. Until the
  // daemon ack arrives, the previous visible activity should remain unchanged.
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "working", activityDetail: "Starting…" });
  assert.equal(store.wakeLocks.size, 0);
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop"],
  );
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "start",
      outcome: "completed",
      cause: "manual",
      previousStatus: "active",
      nextStatus: "active",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "stop",
      outcome: "completed",
      cause: "internal",
      previousStatus: "active",
      nextStatus: "inactive",
    },
  ]);
  orchestrator.shutdown();
});

test("stop apply emits server-side stopped fallback when machine stop is unreachable", async () => {
  const orchestrator = new UnreachableStopApplyDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");

  await orchestrator.callApplyStopAction("agent-1", "manual");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  const fallbackActivity = (orchestrator as any).agentActivity.get("agent-1");
  assert.equal(fallbackActivity.activity, "offline");
  assert.equal(fallbackActivity.detail, "Stopped");
  assert.equal(typeof fallbackActivity.updatedAt, "number");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop"],
  );
  orchestrator.shutdown();
});

test("ready reconciliation does not resurrect a manually stopped agent that the daemon still reports as running", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new ReadyReconcileDeterministicOrchestrator(undefined, undefined, tracer);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.stopAgent("agent-1");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: ["agent-1"],
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop", "agent:stop"],
  );
  const readySpan = sink.getTrace(traceId).find((span) => span.name === "server.machine.ready.reconcile");
  assert.ok(readySpan);
  assert.equal(readySpan.attrs?.machine_id_present, true);
  assert.equal(readySpan.attrs?.running_agents_count, 1);
  assert.equal(readySpan.attrs?.runtimes_count, 1);
  assert.equal(readySpan.attrs?.outcome, "processed");
  assert.equal(readySpan.attrs?.force_stop_and_stay_offline_count, 1);
  assert.equal(eventsForSpan(sink, traceId, "server.machine.ready.reconcile").some((event) => event.name === "machine.ready.agents.loaded"), true);
  orchestrator.shutdown();
});

test("ready reconciliation does not resurrect an agent while a session reset is still in progress", async () => {
  const orchestrator = new (class extends DeferredResetWindowOrchestrator {
    protected override async persistMachineCapabilities(
      _machineId: string,
      _runtimes: string[],
      _hostname?: string,
      _os?: string,
      _daemonVersion?: string | null,
    ) {
      // No-op for determ tests.
    }

    protected override async loadAgentsForReadyReconcile(machineId: string) {
      const agents = [...(this as any).agentStateCache.entries()]
        .filter(([, agent]) => agent.machineId === machineId)
        .map(([id, agent]) => ({
          id,
          serverId: agent.serverId,
          machineId: agent.machineId,
          sessionId: agent.sessionId,
          status: agent.status,
          name: agent.name,
          displayName: agent.displayName,
          avatarUrl: null,
          description: agent.description,
          model: agent.model,
          runtime: agent.runtime,
          reasoningEffort: agent.reasoningEffort,
          envVars: agent.envVars,
          executionMode: "cloud",
          deletedAt: null,
          createdAt: new Date(0),
          updatedAt: new Date(0),
        }));
      return agents as Awaited<ReturnType<DeterministicAgentOrchestrator["loadAgentForStart"]>>[];
    }
  })();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  const resetPromise = orchestrator.resetAgent("agent-1", "session");
  await flushMicrotasks();
  assert.equal(orchestrator.inactivePersistEntered, true);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: ["agent-1"],
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop", "agent:stop"],
  );

  orchestrator.inactivePersistGate.resolve();
  await resetPromise;
  orchestrator.shutdown();
});

test("ready reconcile apply force-stop keeps the persisted status and emits offline", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  await orchestrator.stopAgent("agent-1");

  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "force-stop-and-stay-offline");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop", "agent:stop"],
  );
  orchestrator.shutdown();
});

test("ready reconcile apply mark-active persists active and emits online", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  (orchestrator as any).updateCache("agent-1", { status: "inactive" });

  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "mark-active-online");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });
  assert.equal(orchestrator.sentToMachine.length, 0);
  orchestrator.shutdown();
});

test("ready reconcile apply mark-wakeable-not-running preserves active and does not show offline", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "mark-wakeable-not-running");

  const cached = (orchestrator as any).agentStateCache.get("agent-1");
  assert.equal(cached.status, "active");
  assert.equal(cached.runtimeState, "not_running");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });
  assert.equal(orchestrator.sentToMachine.length, 0);
  orchestrator.shutdown();
});

test("slock CLI producer action is durably persisted and emitted as a slock action entry", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(45_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  orchestrator.recordSlockCliAction("agent-1", {
    command: "message.send",
    summary: "Sent message",
    target: "#proj-runtime:9debd7fb",
    correlationId: "msg-1",
  });
  await flushMicrotasks();

  const entry: TrajectoryEntry = {
    kind: "slock_action",
    title: "Sent message",
    text: "target: #proj-runtime:9debd7fb",
  };
  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry,
  }]);
  assert.deepEqual(orchestrator.emittedActivityPayloads.at(-1), {
    agentId: "agent-1",
    activity: "online",
    detail: "",
    timestamp: clock.now(),
    entries: [entry],
    serverSeq: 1,
  });

  orchestrator.shutdown();
});

test("activity producer event normalizes multiline fields before persistence", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(50_000);
  const orchestrator = new PersistedActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  orchestrator.recordActivityProducerEvent("agent-1", {
    producer: "runtime_tool",
    summary: "Ran\nshell command",
    outcome: "failed",
    target: "line one\nline two",
  });
  await flushMicrotasks();

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [{
    timestamp: clock.now(),
    entry: {
      kind: "slock_action",
      title: "Ran shell command",
      text: [
        "target: line one line two",
        "status: failed",
      ].join("\n"),
    },
  }]);

  orchestrator.shutdown();
});

test("ready reconcile after machine disconnect durably records online recovery", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(10_000);
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  const disconnectedWs = makeFakeWs();
  seedMachineConnection(orchestrator, "machine-1", disconnectedWs);

  await orchestrator.handleMachineDisconnect("machine-1", disconnectedWs as never, { cause: "socket_close" });
  await flushMicrotasks();

  clock.advance(5_000);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: ["agent-1"],
  } as MachineToServerMessage);
  await flushMicrotasks();

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [
    { timestamp: 10_000, entry: { kind: "status", activity: "offline", detail: "Machine disconnected" } },
    { timestamp: 15_000, entry: { kind: "status", activity: "online", detail: "" } },
  ]);
  assert.deepEqual(orchestrator.emittedActivityPayloads.at(-1), {
    agentId: "agent-1",
    activity: "online",
    detail: "",
    timestamp: 15_000,
    entries: [{ kind: "status", activity: "online", detail: "" }],
    serverSeq: 2,
  });
  orchestrator.shutdown();
});

test("daemon activity after reconnect updates agents that ready reconcile kept wakeable", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(10_000);
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(persistedLogs, clock);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedActiveAgent(orchestrator, "agent-2", "machine-1");
  const disconnectedWs = makeFakeWs();
  seedMachineConnection(orchestrator, "machine-1", disconnectedWs);

  await orchestrator.handleMachineDisconnect("machine-1", disconnectedWs as never, { cause: "socket_close" });
  await flushMicrotasks();

  clock.advance(5_000);
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);
  await flushMicrotasks();

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").runtimeState, "not_running");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").runtimeState, "not_running");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });
  assert.deepEqual(await orchestrator.getActivity("agent-2"), { activity: "online", activityDetail: "" });

  clock.advance(5_000);
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "thinking",
    detail: "Continuing work",
    entries: [{ kind: "thinking", text: "Continuing work" }],
  } as MachineToServerMessage);
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-2",
    activity: "working",
    detail: "Running tool",
    entries: [{ kind: "tool_start", toolName: "shell", toolInput: "pnpm test" }],
  } as MachineToServerMessage);
  await flushMicrotasks();

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").runtimeState, "thinking");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").runtimeState, "working");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "thinking", activityDetail: "Continuing work" });
  assert.deepEqual(await orchestrator.getActivity("agent-2"), { activity: "working", activityDetail: "Running tool" });
  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [
    { timestamp: 10_000, entry: { kind: "status", activity: "offline", detail: "Machine disconnected" } },
    { timestamp: 15_000, entry: { kind: "status", activity: "online", detail: "" } },
    { timestamp: 20_000, entry: { kind: "thinking", text: "Continuing work" } },
  ]);
  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-2"), [
    { timestamp: 10_000, entry: { kind: "status", activity: "offline", detail: "Machine disconnected" } },
    { timestamp: 15_000, entry: { kind: "status", activity: "online", detail: "" } },
    { timestamp: 20_000, entry: { kind: "tool_start", toolName: "shell", toolInput: "pnpm test" } },
  ]);
  orchestrator.shutdown();
});

test("ready reconcile repeated missing-agent projections do not create offline activity logs", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(10_000);
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(persistedLogs, clock, tracer);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  clock.advance(5_000);
  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), []);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  const activityLogProjections = lifecycleProjectionAttrs(sink, traceId)
    .filter((attrs) => attrs.projection_kind === "activity_log" && attrs.label_kind === "ready_wakeable_not_running");
  assert.equal(activityLogProjections.length, 2);
  assert.deepEqual(activityLogProjections.map((attrs) => attrs.outcome), ["skipped", "skipped"]);
  orchestrator.shutdown();
});

test("machine disconnect projects wake ineligible while the machine is unreachable", async () => {
  const persistedLogs = new Map<string, Array<{ timestamp: number; entry: TrajectoryEntry }>>();
  const clock = new FakeClock();
  clock.advance(10_000);
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(persistedLogs, clock, tracer);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  const ws = makeFakeWs();
  seedMachineConnection(orchestrator, "machine-1", ws);

  await orchestrator.handleMachineDisconnect("machine-1", ws as never, { cause: "socket_close" });

  const [wakeProjection] = lifecycleProjectionAttrs(sink, traceId)
    .filter((attrs) => attrs.projection_kind === "wake_eligibility");
  assert.ok(wakeProjection);
  assert.equal(wakeProjection.wake_eligibility, false);
  assert.equal(wakeProjection.wake_block_reason, "machine_unreachable");
  assert.equal(wakeProjection.machine_reachability, "unreachable");
  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), [
    { timestamp: 10_000, entry: { kind: "status", activity: "offline", detail: "Machine disconnected" } },
  ]);
  orchestrator.shutdown();
});

test("ready reconcile does not overwrite fresh busy activity with idle online", async () => {
  const clock = new FakeClock();
  clock.advance(5_000);
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(new Map(), clock);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "Editing file…",
    entries: [{ kind: "tool_start", toolName: "edit_file", toolInput: "src/App.tsx" }],
    launchId: "current-running-launch",
  } as MachineToServerMessage);

  await flushMicrotasks();
  const emittedBeforeReady = orchestrator.emittedActivityPayloads.length;
  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "mark-active-online");

  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "Editing file…",
  });
  assert.equal(
    orchestrator.emittedActivityPayloads.slice(emittedBeforeReady).some((payload) => payload.activity === "online"),
    false,
  );
  orchestrator.shutdown();
});

test("ready reconcile clears stale launch guard so resumed daemon activity is accepted", async () => {
  const clock = new FakeClock();
  clock.advance(5_000);
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(new Map(), clock);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  (orchestrator as any).updateCache("agent-1", {
    status: "inactive",
    expectedLaunchId: "stale-launch",
    launchGuardMode: "guarded",
  });

  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "mark-active-online");

  const agent = (orchestrator as any).agentStateCache.get("agent-1");
  assert.equal(agent.expectedLaunchId, null);
  assert.equal(agent.launchGuardMode, "legacy");

  const entries: TrajectoryEntry[] = [{ kind: "status", activity: "working", detail: "Message received" }];
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "Message received",
    entries,
    launchId: "current-running-launch",
  } as MachineToServerMessage);

  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), entries.map((entry) => ({
    timestamp: clock.now(),
    entry,
  })));
  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "Message received",
  });
  orchestrator.shutdown();
});

test("activity ingestion trace records accepted activity log and read-model update", async () => {
  const clock = new FakeClock();
  clock.advance(5_000);
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(new Map(), clock, tracer);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  (orchestrator as any).updateCache("agent-1", {
    status: "inactive",
    expectedLaunchId: "stale-launch",
    launchGuardMode: "guarded",
  });

  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "mark-active-online");
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "Message received",
    entries: [{ kind: "status", activity: "working", detail: "Message received" }],
    launchId: "current-running-launch",
  } as MachineToServerMessage);

  const [span] = sink.getTrace(traceId).filter((candidate) => candidate.name === "server.agent.activity.ingest");
  assert.ok(span);
  assert.equal(span.attrs?.outcome, "accepted");
  assert.equal(span.attrs?.agent_id_present, true);
  assert.equal(span.attrs?.machine_id_present, true);
  assert.equal(Object.values(span.attrs ?? {}).includes("agent-1"), false);
  assert.equal(Object.values(span.attrs ?? {}).includes("machine-1"), false);
  const eventNames = span.events.map((event) => event.name);
  assert.deepEqual(eventNames.slice(0, 3), [
    "activity.ingest.received",
    "lifecycle_guard.checked",
    "activity.ingest.accepted",
  ]);
  assert.equal(eventNames.includes("agent.lifecycle.event"), true);
  assert.equal(eventNames.filter((name) => name === "agent.lifecycle.projection").length, 4);
  assert.deepEqual(eventNames.slice(-2), [
    "status.read_model.updated",
    "activity.log.persist_scheduled",
  ]);
  assert.deepEqual(span.events.find((event) => event.name === "lifecycle_guard.checked")?.attrs, {
    action: "accept",
    guardMode: "legacy",
    hasExpectedLaunchId: false,
    hasLaunchId: true,
  });
  assert.deepEqual(span.events.find((event) => event.name === "status.read_model.updated")?.attrs, {
    from: "online",
    to: "working",
  });
  assert.equal(
    span.events.find((event) => event.name === "activity.log.persist_scheduled")?.attrs?.entryCount,
    1,
  );
  assert.deepEqual(await orchestrator.getActivity("agent-1"), {
    activity: "working",
    activityDetail: "Message received",
  });
  orchestrator.shutdown();
});

test("activity ingestion trace records stale launch guard drops before read-model update", async () => {
  const clock = new FakeClock();
  clock.advance(5_000);
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new ReadyReconcileActivityLogDeterministicOrchestrator(new Map(), clock, tracer);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  (orchestrator as any).updateCache("agent-1", {
    status: "active",
    expectedLaunchId: "expected-launch",
    launchGuardMode: "guarded",
  });

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "Message received",
    entries: [{ kind: "status", activity: "working", detail: "Message received" }],
    launchId: "stale-launch",
  } as MachineToServerMessage);

  const [span] = sink.getTrace(traceId).filter((candidate) => candidate.name === "server.agent.activity.ingest");
  assert.ok(span);
  assert.equal(span.attrs?.outcome, "dropped");
  assert.equal(span.attrs?.reason, "stale_launch_guard");
  assert.equal(span.attrs?.agent_id_present, true);
  assert.equal(span.attrs?.machine_id_present, true);
  assert.equal(Object.values(span.attrs ?? {}).includes("agent-1"), false);
  assert.equal(Object.values(span.attrs ?? {}).includes("machine-1"), false);
  assert.deepEqual(span.events.map((event) => event.name), [
    "activity.ingest.received",
    "lifecycle_guard.checked",
    "activity.ingest.dropped",
  ]);
  assert.equal(
    span.events.find((event) => event.name === "activity.ingest.dropped")?.attrs?.reason,
    "stale_launch_guard",
  );
  assert.equal(span.events.some((event) => event.name === "status.read_model.updated"), false);
  assert.deepEqual(await orchestrator.listRecentActivityLog("agent-1"), []);
  orchestrator.shutdown();
});

test("ready reconcile apply stay-offline preserves non-active status without sending commands", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  (orchestrator as any).updateCache("agent-1", { status: "inactive" });

  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "stay-offline");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Runtime interrupted" });
  assert.equal(orchestrator.sentToMachine.length, 0);
  orchestrator.shutdown();
});

test("ready reconcile marks missing active agents wakeable without eager startup", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.callApplyReadyReconcileAction("machine-1", "agent-1", "mark-wakeable-not-running");

  const cached = (orchestrator as any).agentStateCache.get("agent-1");
  assert.equal(cached.status, "active");
  assert.equal(cached.runtimeState, "not_running");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });
  assert.equal(orchestrator.sentToMachine.length, 0);
  orchestrator.shutdown();
});

test("ready reconciliation does not eager-start active agents that are missing from daemon ready", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new ReadyReconcileDeterministicOrchestrator(undefined, undefined, tracer);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedActiveAgent(orchestrator, "agent-2", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").runtimeState, "not_running");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").runtimeState, "not_running");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });
  assert.deepEqual(await orchestrator.getActivity("agent-2"), { activity: "online", activityDetail: "" });
  assert.equal(orchestrator.sentToMachine.length, 0);
  const readySpan = sink.getTrace(traceId).find((span) => span.name === "server.machine.ready.reconcile");
  assert.ok(readySpan);
  assert.equal(readySpan.attrs?.mark_wakeable_not_running_count, 2);
  assert.equal(readySpan.attrs?.mark_inactive_offline_count, 0);
  assert.equal(readySpan.attrs?.request_start_count, 0);
  orchestrator.shutdown();
});

test("ready reconciliation wakes a missing active agent when a message arrived during reconnect", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  const message = makeAgentMessage("message while daemon was reconnecting", 7);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  // Simulates the persisted message fanout path while the daemon has no
  // running runtime process yet. Ready reconciliation must not strand this
  // server-side inbox behind a user-visible "online" projection.
  orchestrator.deliverToLocalInbox("agent-1", message);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => ({ type: msg.type, agentId: "agentId" in msg ? msg.agentId : null })),
    [{ type: "agent:start", agentId: "agent-1" }],
  );
  const startMessage = orchestrator.sentToMachine[0];
  assert.equal(startMessage?.type, "agent:start");
  assert.deepEqual(startMessage.wakeMessage, message);
  assert.equal((orchestrator as any).agentInboxes.get("agent-1")?.inbox.length ?? 0, 0);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").runtimeState, "starting");
  orchestrator.shutdown();
});

test("ready reconciliation does not wake a manually stopped agent with pending inbox", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  const message = makeAgentMessage("message after manual stop", 8);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "stopped";
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  orchestrator.deliverToLocalInbox("agent-1", message);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  assert.equal(orchestrator.sentToMachine.length, 0);
  assert.deepEqual((orchestrator as any).agentInboxes.get("agent-1")?.inbox ?? [], [message]);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  orchestrator.shutdown();
});

test("post-ready message lazy-wakes only the target agent after missing active agents were marked wakeable", async () => {
  const orchestrator = new ReadyReconcileDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedActiveAgent(orchestrator, "agent-2", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  await orchestrator.deliverMessage("agent-2", makeAgentMessage("wake only agent 2"));

  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => ({ type: msg.type, agentId: "agentId" in msg ? msg.agentId : null })),
    [{ type: "agent:start", agentId: "agent-2" }],
  );
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").runtimeState, "not_running");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").status, "active");
  assert.equal((orchestrator as any).agentStateCache.get("agent-2").runtimeState, "starting");
  orchestrator.shutdown();
});

test("ready reconciliation seeds cold cache so post-refresh messages lazy-wake", async () => {
  const orchestrator = new ColdCacheReadyReconcileDeterministicOrchestrator();
  orchestrator.addPersistedActiveAgent("agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  const cachedAfterReady = (orchestrator as any).agentStateCache.get("agent-1");
  assert.equal(cachedAfterReady.status, "active");
  assert.equal(cachedAfterReady.runtimeState, "not_running");

  await orchestrator.deliverMessage("agent-1", makeAgentMessage("wake after daemon refresh", 9));

  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => ({ type: msg.type, agentId: "agentId" in msg ? msg.agentId : null })),
    [{ type: "agent:start", agentId: "agent-1" }],
  );
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").runtimeState, "starting");
  orchestrator.shutdown();
});

test("ready reconciliation fails closed for an invalid persisted status when the daemon reports the agent as running", async () => {
  const orchestrator = new InvalidStatusReadyReconcileDeterministicOrchestrator("sleeping");
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: ["agent-1"],
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  assert.deepEqual(orchestrator.sentToMachine.map((msg) => msg.type), ["agent:stop"]);
  orchestrator.shutdown();
});

test("ready reconciliation fails closed for an invalid persisted status when the daemon does not report the agent as running", async () => {
  const orchestrator = new InvalidStatusReadyReconcileDeterministicOrchestrator("sleeping");
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "ready",
    capabilities: [],
    runtimes: ["codex"],
    daemonVersion: "1.0.0",
    runningAgents: [],
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Runtime interrupted" });
  assert.equal(orchestrator.sentToMachine.length, 0);
  orchestrator.shutdown();
});

test("startAgent records null previousStatus and rolls back to inactive for an invalid persisted status", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new InvalidStatusStartDeterministicOrchestrator("sleeping", store, { sendSucceeds: false });

  await assert.rejects(() => orchestrator.startAgent("agent-1"), /Machine offline\. Please start your local daemon\./);

  assert.equal(store.wakeLocks.size, 0);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "start",
      outcome: "failed",
      cause: "manual",
      previousStatus: null,
      detail: "Machine offline. Please start your local daemon.",
    },
  ]);
  orchestrator.shutdown();
});

test("startAgent completes with null previousStatus for an invalid persisted status", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new InvalidStatusStartDeterministicOrchestrator("sleeping", store);

  await orchestrator.startAgent("agent-1");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "active");
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "start",
      outcome: "completed",
      cause: "manual",
      previousStatus: null,
      nextStatus: "active",
    },
  ]);
  orchestrator.shutdown();
});

test("late agent activity does not overwrite visible activity after a manual stop", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.stopAgent("agent-1");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "late activity after stop",
    entries: [],
  } as MachineToServerMessage);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "Stopped" });
  orchestrator.shutdown();
});

test("late agent activity does not overwrite visible activity during a session reset window", async () => {
  const orchestrator = new DeferredResetWindowOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  const resetPromise = orchestrator.resetAgent("agent-1", "session");
  await flushMicrotasks();
  assert.equal(orchestrator.inactivePersistEntered, true);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "late activity during reset",
    entries: [],
  } as MachineToServerMessage);

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });
  orchestrator.inactivePersistGate.resolve();
  await resetPromise;
  orchestrator.shutdown();
});

test("concurrent reset request is skipped while an existing reset is in progress", async () => {
  const orchestrator = new DeferredResetWindowOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  const resetPromise = orchestrator.resetAgent("agent-1", "restart");
  await flushMicrotasks();
  assert.equal(orchestrator.inactivePersistEntered, true);

  await orchestrator.resetAgent("agent-1", "restart");

  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop"],
  );
  assert.equal(
    recentLifecycleEvents(orchestrator).some((event) =>
      event.action === "reset"
      && event.outcome === "skipped"
      && event.detail === "reset_in_progress"
    ),
    true,
  );

  orchestrator.inactivePersistGate.resolve();
  await resetPromise;
  orchestrator.shutdown();
});

test("daemon inactive status does not overwrite a manually stopped agent back to inactive", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  (orchestrator as any).agentStateCache.get("agent-1").status = "stopped";

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "inactive",
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  orchestrator.shutdown();
});

test("late agent session does not resurrect a manually stopped agent", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.stopAgent("agent-1");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-late",
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").sessionId, null);
  orchestrator.shutdown();
});

test("late active status does not resurrect a manually stopped agent", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.stopAgent("agent-1");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "active",
  } as MachineToServerMessage);

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  orchestrator.shutdown();
});

type DeterministicAgentStatus = "active" | "inactive" | "stopped";

class PersistTrackingDeterministicOrchestrator extends DeterministicAgentOrchestrator {
  readonly persistCalls: Array<{ source: "explicit" | "signal"; status: DeterministicAgentStatus; sessionId?: string }> = [];

  protected override async persistAgentStatus(_agentId: string, status: DeterministicAgentStatus, sessionId?: string) {
    this.persistCalls.push({ source: "explicit", status, sessionId });
  }

  protected override async persistAgentStatusFromSignal(_agentId: string, status: DeterministicAgentStatus, sessionId?: string) {
    this.persistCalls.push({ source: "signal", status, sessionId });
  }
}

test("agent:session persist routes through the signal-protected API", async () => {
  // Cross-replica scenario: this replica's cache shows the agent as still active
  // (no stop happened locally), but DB may already be stopped from a peer replica.
  // The signal-protected DB API is what guards against the resurrection — the
  // orchestrator must route session writes through it.
  const orchestrator = new PersistTrackingDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-late",
  } as MachineToServerMessage);

  assert.deepEqual(orchestrator.persistCalls, [
    { source: "signal", status: "active", sessionId: "session-late" },
  ]);
  orchestrator.shutdown();
});

test("agent:status active persist routes through the signal-protected API", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new PersistTrackingDeterministicOrchestrator(undefined, undefined, tracer);
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "inactive";
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "active",
  } as MachineToServerMessage);

  assert.deepEqual(orchestrator.persistCalls, [
    { source: "signal", status: "active", sessionId: undefined },
  ]);
  const statusSpan = sink.getTrace(traceId).find((span) => span.name === "server.agent.status.ingest");
  assert.ok(statusSpan);
  assert.equal(statusSpan.attrs?.agent_id_present, true);
  assert.equal(statusSpan.attrs?.machine_id_present, true);
  assert.equal(statusSpan.attrs?.reported_status, "active");
  assert.equal(statusSpan.attrs?.outcome, "persisted");
  assert.equal(statusSpan.attrs?.action, "persist-active");
  assert.equal(statusSpan.attrs?.next_status, "active");
  const eventNames = eventsForSpan(sink, traceId, "server.agent.status.ingest").map((event) => event.name);
  assert.deepEqual(eventNames.slice(0, 3), [
    "agent.status.received",
    "agent.status.lifecycle_guard.checked",
    "agent.status.action.planned",
  ]);
  assert.equal(eventNames.includes("agent.lifecycle.event"), true);
  assert.equal(eventNames.filter((name) => name === "agent.lifecycle.projection").length, 4);
  assert.equal(eventNames.includes("agent.status.persisted"), true);
  assert.deepEqual(eventNames.slice(-1), [
    "agent.status.persisted",
  ]);
  orchestrator.shutdown();
});

test("ready reconcile mark-active-online persist routes through the signal-protected API", async () => {
  const orchestrator = new PersistTrackingDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").status = "inactive";

  await (orchestrator as any).applyReadyReconcileAction(
    "machine-1",
    {
      id: "agent-1",
      status: "inactive",
      machineId: "machine-1",
    },
    "mark-active-online",
  );

  assert.deepEqual(orchestrator.persistCalls, [
    { source: "signal", status: "active", sessionId: undefined },
  ]);
  orchestrator.shutdown();
});

test("explicit startAgent projection persist still routes through the unguarded API", async () => {
  // The protected API blocks signal-driven resurrection, but explicit user
  // start (capability-checked, requested by the user) must still be allowed
  // to override stopped → active. Pin that the start reducer/writer does NOT
  // take the signal route.
  const orchestrator = new StartRoutingMismatchDeterministicOrchestrator();
  let explicitCalls = 0;
  let signalCalls = 0;
  (orchestrator as any).persistAgentStatus = async (_agentId: string, _status: DeterministicAgentStatus, _sessionId?: string) => {
    explicitCalls += 1;
  };
  (orchestrator as any).persistAgentStatusFromSignal = async (_agentId: string, _status: DeterministicAgentStatus, _sessionId?: string) => {
    signalCalls += 1;
  };
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.startAgent("agent-1");

  assert.equal(explicitCalls, 1);
  assert.equal(signalCalls, 0);
  orchestrator.shutdown();
});

test("reset restart failure leaves the agent inactive rather than stuck in stopped", async () => {
  const orchestrator = new ResetFailureDeterministicOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");

  await orchestrator.resetAgent("agent-1", "restart");

  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop", "agent:start"],
  );
  assert.deepEqual(recentLifecycleEvents(orchestrator), [
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "reset",
      outcome: "attempted",
      cause: "restart",
      previousStatus: "active",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "stop",
      outcome: "completed",
      cause: "internal",
      previousStatus: "active",
      nextStatus: "inactive",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "start",
      outcome: "failed",
      cause: "manual",
      previousStatus: "inactive",
      detail: "Machine offline. Please start your local daemon.",
    },
    {
      agentId: "agent-1",
      machineId: "machine-1",
      action: "reset",
      outcome: "failed",
      cause: "restart",
      previousStatus: "active",
      nextStatus: "inactive",
    },
  ]);
  orchestrator.shutdown();
});

test("session reset can clear an inactive agent session without restarting", async () => {
  const orchestrator = new InactiveWindowDeliverMessageOrchestrator();
  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  (orchestrator as any).resetPersistedAgentSession = async () => {};
  (orchestrator as any).updateCache("agent-1", { status: "inactive", sessionId: "session-old" });

  await orchestrator.resetAgent("agent-1", "session", { restartEvenIfInactive: false });

  const cached = (orchestrator as any).agentStateCache.get("agent-1");
  assert.equal(cached.status, "inactive");
  assert.equal(cached.sessionId, null);
  assert.deepEqual(
    orchestrator.sentToMachine.map((msg) => msg.type),
    ["agent:stop"],
  );
  orchestrator.shutdown();
});

test("session reset does not let a late message wake the agent with a stale session", async () => {
  const orchestrator = new DeferredResetWindowOrchestrator();
  const message = makeAgentMessage("message during session reset");

  seedActiveAgent(orchestrator, "agent-1", "machine-1");
  (orchestrator as any).agentStateCache.get("agent-1").sessionId = "session-old";

  const resetPromise = orchestrator.resetAgent("agent-1", "session");
  await flushMicrotasks();
  assert.equal(orchestrator.inactivePersistEntered, true);
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "inactive");

  await orchestrator.deliverMessage("agent-1", message);
  orchestrator.inactivePersistGate.resolve();
  await resetPromise;

  const startMessages = orchestrator.sentToMachine.filter((msg) => msg.type === "agent:start");
  assert.equal(startMessages.length, 1);
  assert.equal(startMessages[0]?.config.sessionId, null);

  orchestrator.shutdown();
});

// --- Server-side heartbeat timeout state machine ---

test("heartbeat tick pings at 30s and times out only after the 60s threshold is exceeded", async () => {
  const clock = new FakeClock();
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new HeartbeatDeterministicAgentOrchestrator(store, clock);
  const ws = makeFakeWs(1);
  const conn = seedMachineConnection(orchestrator, "machine-1", ws);
  seedActiveAgent(orchestrator);
  store.machineReplicas.add("machine-1");
  conn.lastPong = clock.now();
  startHeartbeat(orchestrator, "machine-1", conn);

  clock.advance(30_000);
  assert.equal(ws.sent.length, 1);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  clock.advance(30_000);
  assert.equal(ws.terminated, 0);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  clock.advance(30_000);
  assert.equal(ws.terminated, 1);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

test("pong before the timeout threshold resets the server-side heartbeat deadline", async () => {
  const clock = new FakeClock();
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new HeartbeatDeterministicAgentOrchestrator(store, clock);
  const ws = makeFakeWs(1);
  const conn = seedMachineConnection(orchestrator, "machine-1", ws);
  seedActiveAgent(orchestrator);
  store.machineReplicas.add("machine-1");
  conn.lastPong = clock.now();
  startHeartbeat(orchestrator, "machine-1", conn);

  clock.advance(59_000);
  await orchestrator.handleMachineMessage("machine-1", { type: "pong" } as MachineToServerMessage);

  clock.advance(31_000);
  assert.equal(ws.terminated, 0);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  clock.advance(30_000);
  assert.equal(ws.terminated, 1);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

test("stale heartbeat timeout from an old connection does not disconnect the replacement connection", async () => {
  const clock = new FakeClock();
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new HeartbeatDeterministicAgentOrchestrator(store, clock);
  const oldWs = makeFakeWs(1);
  const newWs = makeFakeWs(1);
  const oldConn = seedMachineConnection(orchestrator, "machine-1", oldWs);
  seedActiveAgent(orchestrator);
  store.machineReplicas.add("machine-1");
  oldConn.lastPong = clock.now();
  startHeartbeat(orchestrator, "machine-1", oldConn);

  // Simulate reconnect: new connection replaces the old one before the old timeout fires.
  const newConn = seedMachineConnection(orchestrator, "machine-1", newWs);
  newConn.lastPong = clock.now();

  clock.advance(61_000);

  assert.equal(((orchestrator as any).machineConnections.get("machine-1")?.ws), newWs);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("buggy stale heartbeat timeout semantics would disconnect the replacement connection", async () => {
  const clock = new FakeClock();
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new BuggyHeartbeatTimeoutOrchestrator(store, clock);
  const oldWs = makeFakeWs(1);
  const newWs = makeFakeWs(1);
  const oldConn = seedMachineConnection(orchestrator, "machine-1", oldWs);
  seedActiveAgent(orchestrator);
  store.machineReplicas.add("machine-1");
  oldConn.lastPong = clock.now();
  startHeartbeat(orchestrator, "machine-1", oldConn);

  const newConn = seedMachineConnection(orchestrator, "machine-1", newWs);
  newConn.lastPong = clock.now();

  clock.advance(61_000);

  assert.equal((orchestrator as any).machineConnections.has("machine-1"), false);
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "offline", activityDetail: "" });

  orchestrator.shutdown();
});

// --- Wake lock / duplicate start guard ---

test("wake lock blocks a second sequential start until startup completion releases the lease", async () => {
  const store = new InMemoryReplicaStateStore();
  const replicaA = new WakeLockDeterministicAgentOrchestrator(store);
  const replicaB = new WakeLockDeterministicAgentOrchestrator(store);

  await replicaA.startAgent("agent-1");
  await replicaB.startAgent("agent-1");

  assert.equal(replicaA.startMessages.length + replicaB.startMessages.length, 1);
  assert.equal(store.wakeLocks.size, 1);

  replicaA.shutdown();
  replicaB.shutdown();
});

test("buggy wake-lock semantics would allow the same concurrent scenario to double-start", async () => {
  const store = new BuggyWakeLockStore();
  const holdFirstSend = deferred<void>();
  const firstSendEntered = deferred<void>();

  const replicaA = new WakeLockDeterministicAgentOrchestrator(store, {
    holdSend: holdFirstSend.promise,
    onSend: () => firstSendEntered.resolve(),
  });
  const replicaB = new WakeLockDeterministicAgentOrchestrator(store);

  const firstStart = replicaA.startAgent("agent-1");
  await firstSendEntered.promise;

  const secondStart = replicaB.startAgent("agent-1");
  await Promise.resolve();

  holdFirstSend.resolve();
  await Promise.all([firstStart, secondStart]);

  assert.equal(replicaA.startMessages.length + replicaB.startMessages.length, 2);

  replicaA.shutdown();
  replicaB.shutdown();
});

test("wake lock is released after a failed start so a later retry can proceed", async () => {
  const store = new InMemoryReplicaStateStore();
  const failingReplica = new WakeLockDeterministicAgentOrchestrator(store, { sendSucceeds: false });
  const retryReplica = new WakeLockDeterministicAgentOrchestrator(store);

  await assert.rejects(() => failingReplica.startAgent("agent-1"), /Machine offline/);
  assert.equal(store.wakeLocks.size, 0);

  await retryReplica.startAgent("agent-1");
  assert.equal(retryReplica.startMessages.length, 1);

  failingReplica.shutdown();
  retryReplica.shutdown();
});

test("startup completion releases the wake lock and allows a later start", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new WakeLockDeterministicAgentOrchestrator(store);
  seedMachineConnection(orchestrator, "machine-1", {});

  await orchestrator.startAgent("agent-1");
  assert.equal(store.wakeLocks.size, 1);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-1",
  } as MachineToServerMessage);

  assert.equal(store.wakeLocks.size, 0);

  await orchestrator.startAgent("agent-1");
  assert.equal(orchestrator.startMessages.length, 2);

  orchestrator.shutdown();
});

test("manual stop releases the wake lock even before startup confirmation arrives", async () => {
  const store = new InMemoryReplicaStateStore();
  const orchestrator = new WakeLockDeterministicAgentOrchestrator(store);
  seedMachineConnection(orchestrator, "machine-1", {});

  await orchestrator.startAgent("agent-1");
  assert.equal(store.wakeLocks.size, 1);

  await orchestrator.stopAgent("agent-1");
  assert.equal(store.wakeLocks.size, 0);

  orchestrator.shutdown();
});

test("agent session resolves optimistic starting activity back to online", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.startAgent("agent-1");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "working", activityDetail: "Starting\u2026" });

  const launchId = orchestrator.startMessages.at(-1)?.launchId;
  assert.ok(launchId);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-1",
    launchId,
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("agent status active also resolves optimistic starting activity back to online", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.startAgent("agent-1");
  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "working", activityDetail: "Starting\u2026" });

  const launchId = orchestrator.startMessages.at(-1)?.launchId;
  assert.ok(launchId);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:status",
    agentId: "agent-1",
    status: "active",
    launchId,
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "online", activityDetail: "" });

  orchestrator.shutdown();
});

test("startup confirmation does not overwrite a real post-start working activity", async () => {
  const orchestrator = new LaunchGuardDeterministicAgentOrchestrator();
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());

  await orchestrator.startAgent("agent-1");
  const launchId = orchestrator.startMessages.at(-1)?.launchId;
  assert.ok(launchId);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "Compiling prompt",
    launchId,
  });
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:session",
    agentId: "agent-1",
    sessionId: "session-1",
    launchId,
  });

  assert.deepEqual(await orchestrator.getActivity("agent-1"), { activity: "working", activityDetail: "Compiling prompt" });

  orchestrator.shutdown();
});

// --- Local stale-activity sweep semantics ---

test("stale working activity is swept back to online after 90 seconds", () => {
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore());
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stuck",
    updatedAt: Date.now() - 91_000,
  });

  (orchestrator as any).sweepStaleActivities();

  assert.equal((orchestrator as any).agentActivity.get("agent-1").activity, "online");
  orchestrator.shutdown();
});

test("applyStaleActivitySweepAction overwrites stale activity to online and schedules the status broadcast path", () => {
  const orchestrator = new StaleActivityApplyDeterministicOrchestrator();
  const now = Date.now();
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stuck",
    updatedAt: now - 91_000,
  });

  orchestrator.callApplyStaleActivitySweepAction("sweep-online", "agent-1", now);

  assert.deepEqual((orchestrator as any).agentActivity.get("agent-1"), {
    activity: "online",
    detail: "",
    updatedAt: now,
  });
  assert.ok((orchestrator as any).activityDebounceTimers.has("agent-1"));
  orchestrator.shutdown();
});

test("fresh working activity is not swept before the stale threshold", () => {
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore());
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "still-fresh",
    updatedAt: Date.now() - 30_000,
  });

  (orchestrator as any).sweepStaleActivities();

  assert.equal((orchestrator as any).agentActivity.get("agent-1").activity, "working");
  orchestrator.shutdown();
});

test("applyStaleActivitySweepAction keeps current activity on keep-current", () => {
  const orchestrator = new StaleActivityApplyDeterministicOrchestrator();
  const now = Date.now();
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "still-fresh",
    updatedAt: now - 30_000,
  });

  orchestrator.callApplyStaleActivitySweepAction("keep-current", "agent-1", now);

  assert.deepEqual((orchestrator as any).agentActivity.get("agent-1"), {
    activity: "working",
    detail: "still-fresh",
    updatedAt: now - 30_000,
  });
  assert.equal((orchestrator as any).activityDebounceTimers.has("agent-1"), false);
  orchestrator.shutdown();
});

test("buggy no-op sweep would leave a stale working activity stuck forever", () => {
  const orchestrator = new BuggyNoSweepOrchestrator(new InMemoryReplicaStateStore());
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stuck",
    updatedAt: Date.now() - 91_000,
  });

  (orchestrator as any).sweepStaleActivities();

  assert.equal((orchestrator as any).agentActivity.get("agent-1").activity, "working");
  orchestrator.shutdown();
});

// --- Concurrent receiveMessages semantics ---

test("a newer blocked receive supersedes the previous waiter without getting cancelled by the older abort", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const agentId = "agent-1";
  const firstAbort = new AbortController();
  const secondAbort = new AbortController();
  const message: AgentMessage = {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "hello",
    timestamp: new Date(0).toISOString(),
  };

  const first = orchestrator.receiveMessages(agentId, true, 10_000, firstAbort.signal);
  const second = orchestrator.receiveMessages(agentId, true, 10_000, secondAbort.signal);

  assert.deepEqual(await first, []);

  firstAbort.abort();
  orchestrator.deliverToLocalInbox(agentId, message);

  assert.deepEqual(await second, [message]);
  orchestrator.shutdown();
});

test("buggy concurrent receive semantics let an older abort clear the newer waiter and strand the message", async () => {
  const orchestrator = new BuggyConcurrentReceiveOrchestrator();
  const agentId = "agent-1";
  const firstAbort = new AbortController();
  const secondAbort = new AbortController();
  const message: AgentMessage = {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "hello",
    timestamp: new Date(0).toISOString(),
  };

  const first = orchestrator.receiveMessages(agentId, true, 10_000, firstAbort.signal);
  orchestrator.receiveMessages(agentId, true, 10_000, secondAbort.signal);

  firstAbort.abort();
  assert.deepEqual(await first, []);

  orchestrator.deliverToLocalInbox(agentId, message);

  const inboxes = (orchestrator as any).agentInboxes as Map<string, { inbox: AgentMessage[]; pendingReceive: unknown }>;
  const inbox = inboxes.get(agentId);
  assert.ok(inbox);
  assert.equal(inbox.pendingReceive, null);
  assert.deepEqual(inbox.inbox, [message]);
  orchestrator.shutdown();
});

test("receiveMessages with a pre-aborted signal returns empty without leaving a waiter installed", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const agentId = "agent-1";
  const abort = new AbortController();
  abort.abort();

  assert.deepEqual(
    await orchestrator.receiveMessages(agentId, true, 10_000, abort.signal),
    [],
  );

  const inboxes = (orchestrator as any).agentInboxes as Map<string, { inbox: AgentMessage[]; pendingReceive: unknown }>;
  const inbox = inboxes.get(agentId);
  assert.ok(inbox);
  assert.equal(inbox.pendingReceive, null);
  orchestrator.shutdown();
});

test("deliverToLocalInbox deduplicates both sequenced and seq-less messages", () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const agentId = "agent-1";

  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "seq-1",
    timestamp: new Date(0).toISOString(),
    seq: 1,
    message_id: "m1",
  });
  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "seq-1 duplicate",
    timestamp: new Date(0).toISOString(),
    seq: 1,
    message_id: "m1-dupe",
  });
  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "no-seq",
    timestamp: new Date(0).toISOString(),
    message_id: "m-no-seq",
  });
  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "no-seq duplicate",
    timestamp: new Date(0).toISOString(),
    message_id: "m-no-seq",
  });

  const inbox = (orchestrator as any).agentInboxes.get(agentId);
  assert.ok(inbox);
  assert.equal(inbox.inbox.length, 2);
  assert.deepEqual(
    inbox.inbox.map((msg: AgentMessage) => ({ seq: msg.seq ?? null, message_id: msg.message_id ?? null })),
    [
      { seq: 1, message_id: "m1" },
      { seq: null, message_id: "m-no-seq" },
    ],
  );
  orchestrator.shutdown();
});

test("deliverToLocalInbox trims to the newest 1000 messages", () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const agentId = "agent-1";

  for (let seq = 1; seq <= 1001; seq += 1) {
    orchestrator.deliverToLocalInbox(agentId, {
      channel_id: "channel-1",
      channel_name: "general",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: `msg-${seq}`,
      timestamp: new Date(0).toISOString(),
      seq,
      message_id: `m${seq}`,
    });
  }

  const inbox = (orchestrator as any).agentInboxes.get(agentId);
  assert.ok(inbox);
  assert.equal(inbox.pendingReceive, null);
  assert.equal(inbox.inbox.length, 1000);
  assert.equal(inbox.inbox[0]?.seq, 2);
  assert.equal(inbox.inbox.at(-1)?.seq, 1001);
  orchestrator.shutdown();
});

test("deliverToLocalInbox resolves a pending waiter with the current snapshot and clears it", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const agentId = "agent-1";

  const waiter = orchestrator.receiveMessages(agentId, true, 10_000);
  await Promise.resolve();

  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "msg-1",
    timestamp: new Date(0).toISOString(),
    seq: 1,
    message_id: "m1",
  });

  const delivered = await waiter;
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0]?.seq, 1);

  const inbox = (orchestrator as any).agentInboxes.get(agentId);
  assert.ok(inbox);
  assert.equal(inbox.pendingReceive, null);
  assert.equal(inbox.inbox.length, 1);
  assert.equal(inbox.inbox[0]?.seq, 1);
  orchestrator.shutdown();
});

test("receive delivery remains replayable when the first response-path handoff is lost before daemon consumption", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const agentId = "agent-1";
  const message: AgentMessage = {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "replay this if the response body never reaches the daemon",
    timestamp: new Date(0).toISOString(),
  };

  const firstAttempt = orchestrator.receiveMessages(agentId, true, 10_000);
  orchestrator.deliverToLocalInbox(agentId, message);

  // The server has already "handed off" the message into the open response.
  // Simulate a weak-network / black-holed response-body failure by discarding
  // that first attempt before daemon-side parse / consumption can happen.
  await firstAttempt;

  const replay = await orchestrator.receiveMessages(agentId, false, 0);

  assert.deepEqual(replay, [message]);
  orchestrator.shutdown();
});

test("receive ack clears replayable inbox state and advances the handoff boundary", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  const agentId = "agent-1";
  const message: AgentMessage = {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "ack this after successful daemon-side consumption",
    timestamp: new Date(0).toISOString(),
    seq: 42,
    message_id: "msg-42",
  };

  orchestrator.deliverToLocalInbox(agentId, message);
  assert.deepEqual(await orchestrator.receiveMessages(agentId, false, 0), [message]);

  orchestrator.acknowledgeDeliveredMessages(agentId, [42]);

  assert.deepEqual(await orchestrator.receiveMessages(agentId, false, 0), []);
  orchestrator.shutdown();
});

test("direct websocket delivery uses the persisted message seq so daemon ack clears replayable inbox state", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator);
  const ws = makeFakeWs(1);
  seedMachineConnection(orchestrator, "machine-1", ws);
  const message = makeAgentMessage("direct websocket delivery should not replay after ack", 42);

  await orchestrator.deliverMessage("agent-1", message);

  const delivered = JSON.parse(ws.sent[0] ?? "{}") as Extract<ServerToMachineMessage, { type: "agent:deliver" }>;
  assert.equal(delivered.type, "agent:deliver");
  assert.equal(delivered.seq, 42);
  assert.deepEqual(await orchestrator.receiveMessages("agent-1", false, 0), [message]);

  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:deliver:ack",
    agentId: "agent-1",
    seq: delivered.seq,
  });

  assert.deepEqual(await orchestrator.receiveMessages("agent-1", false, 0), []);
  orchestrator.shutdown();
});

test("direct websocket delivery tolerates immediate daemon ack before deliverMessage returns", async () => {
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator);
  const sent: string[] = [];
  const ws = {
    readyState: 1,
    sent,
    send(data: string) {
      sent.push(data);
      const delivered = JSON.parse(data) as Extract<ServerToMachineMessage, { type: "agent:deliver" }>;
      void orchestrator.handleMachineMessage("machine-1", {
        type: "agent:deliver:ack",
        agentId: delivered.agentId,
        seq: delivered.seq,
      });
    },
    terminate() {
      this.readyState = 3;
    },
    close() {
      this.readyState = 3;
    },
  };
  seedMachineConnection(orchestrator, "machine-1", ws);
  const message = makeAgentMessage("immediate ack should clear replayable inbox", 43);

  await orchestrator.deliverMessage("agent-1", message);
  await flushMicrotasks();

  const delivered = JSON.parse(sent[0] ?? "{}") as Extract<ServerToMachineMessage, { type: "agent:deliver" }>;
  assert.equal(delivered.seq, 43);
  assert.deepEqual(await orchestrator.receiveMessages("agent-1", false, 0), []);
  orchestrator.shutdown();
});

test("direct delivery trace stitches immediate server send, daemon receive, and server ack clear", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), undefined, tracer);
  seedActiveAgent(orchestrator);
  const sent: string[] = [];
  const ws = {
    readyState: 1,
    sent,
    send(data: string) {
      sent.push(data);
      const delivered = JSON.parse(data) as Extract<ServerToMachineMessage, { type: "agent:deliver" }>;
      const daemonSpan = tracer.startSpan("daemon.agent.delivery", {
        parent: parseTraceparent(delivered.traceparent),
        surface: "daemon",
        kind: "consumer",
        attrs: {
          agentId: delivered.agentId,
          deliveryId: delivered.deliveryId,
          delivery_correlation_id: delivered.deliveryId,
          seq: delivered.seq,
        },
      });
      daemonSpan.addEvent("daemon.receive", { seq: delivered.seq });
      daemonSpan.addEvent("daemon.deliver_to_agent_manager");
      daemonSpan.addEvent("daemon.ack.sent", { seq: delivered.seq });
      void orchestrator.handleMachineMessage("machine-1", {
        type: "agent:deliver:ack",
        agentId: delivered.agentId,
        seq: delivered.seq,
        traceparent: formatTraceparent(daemonSpan.context),
        deliveryId: delivered.deliveryId,
      });
      daemonSpan.end("ok", { attrs: { outcome: "ack-sent" } });
    },
    terminate() {
      this.readyState = 3;
    },
    close() {
      this.readyState = 3;
    },
  };
  seedMachineConnection(orchestrator, "machine-1", ws);
  const message = makeAgentMessage("trace full direct delivery ack chain", 44);

  await orchestrator.deliverMessage("agent-1", message);
  await flushMicrotasks();

  const delivered = JSON.parse(sent[0] ?? "{}") as Extract<ServerToMachineMessage, { type: "agent:deliver" }>;
  assert.ok(delivered.traceparent);
  assert.match(delivered.deliveryId ?? "", /^[0-9a-f-]{36}$/i);
  assert.deepEqual(await orchestrator.receiveMessages("agent-1", false, 0), []);

  const trace = sink.getTrace(traceId);
  const serverDelivery = trace.find((span) => span.name === "server.agent.delivery");
  const daemonDelivery = trace.find((span) => span.name === "daemon.agent.delivery");
  const serverAck = trace.find((span) => span.name === "server.agent.delivery.ack");
  assert.ok(serverDelivery, "missing server delivery span");
  assert.ok(daemonDelivery, "missing daemon delivery span");
  assert.ok(serverAck, "missing server ack span");
  assert.equal(daemonDelivery.context.parentSpanId, serverDelivery.context.spanId);
  assert.equal(serverAck.context.parentSpanId, daemonDelivery.context.spanId);
  assert.equal(serverDelivery.attrs?.agent_id_present, true);
  assert.equal(serverDelivery.attrs?.machine_id_present, true);
  assert.equal(serverDelivery.attrs?.deliveryId, delivered.deliveryId);
  assert.equal(daemonDelivery.attrs?.deliveryId, delivered.deliveryId);
  assert.equal(serverAck.attrs?.deliveryId, delivered.deliveryId);
  assert.equal(serverAck.attrs?.agent_id_present, true);
  assert.equal(serverAck.attrs?.machine_id_present, true);
  assert.equal(Object.values(serverDelivery.attrs ?? {}).includes("agent-1"), false);
  assert.equal(Object.values(serverDelivery.attrs ?? {}).includes("machine-1"), false);
  assert.equal(Object.values(serverAck.attrs ?? {}).includes("agent-1"), false);
  assert.equal(Object.values(serverAck.attrs ?? {}).includes("machine-1"), false);
  const serverDeliveryEvents = eventsForSpan(sink, traceId, "server.agent.delivery").map((event) => event.name);
  assert.deepEqual(serverDeliveryEvents, [
    "server.deliver.enqueued",
    "inbox.ready",
    "server.ws.send.attempted",
  ]);
  assert.ok(
    serverDeliveryEvents.indexOf("inbox.ready") < serverDeliveryEvents.indexOf("server.ws.send.attempted"),
    "trace should prove replayable inbox state exists before immediate websocket ack can fire",
  );
  assert.deepEqual(eventsForSpan(sink, traceId, "daemon.agent.delivery").map((event) => event.name), [
    "daemon.receive",
    "daemon.deliver_to_agent_manager",
    "daemon.ack.sent",
  ]);
  assert.deepEqual(eventsForSpan(sink, traceId, "server.agent.delivery.ack").map((event) => event.name), [
    "server.ack.received",
    "inbox.cleared",
  ]);
  assert.equal(
    eventsForSpan(sink, traceId, "server.agent.delivery")
      .some((event) => Object.values(event.attrs ?? {}).includes("machine-1")),
    false,
  );
  orchestrator.shutdown();
});

test("direct delivery trace shows daemon receive without ack when ack is lost", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore(), undefined, tracer);
  seedActiveAgent(orchestrator);
  const sent: string[] = [];
  const ws = {
    readyState: 1,
    sent,
    send(data: string) {
      sent.push(data);
      const delivered = JSON.parse(data) as Extract<ServerToMachineMessage, { type: "agent:deliver" }>;
      const daemonSpan = tracer.startSpan("daemon.agent.delivery", {
        parent: parseTraceparent(delivered.traceparent),
        surface: "daemon",
        kind: "consumer",
        attrs: {
          agentId: delivered.agentId,
          deliveryId: delivered.deliveryId,
          delivery_correlation_id: delivered.deliveryId,
          seq: delivered.seq,
        },
      });
      daemonSpan.addEvent("daemon.receive", { seq: delivered.seq });
      daemonSpan.addEvent("daemon.deliver_to_agent_manager");
      daemonSpan.end("ok", { attrs: { outcome: "no-ack" } });
    },
    terminate() {
      this.readyState = 3;
    },
    close() {
      this.readyState = 3;
    },
  };
  seedMachineConnection(orchestrator, "machine-1", ws);
  const message = makeAgentMessage("trace should identify lost ack boundary", 45);

  await orchestrator.deliverMessage("agent-1", message);
  await flushMicrotasks();

  assert.deepEqual(await orchestrator.receiveMessages("agent-1", false, 0), [message]);
  assert.deepEqual(eventsForSpan(sink, traceId, "daemon.agent.delivery").map((event) => event.name), [
    "daemon.receive",
    "daemon.deliver_to_agent_manager",
  ]);
  assert.equal(sink.getTrace(traceId).some((span) => span.name === "server.agent.delivery.ack"), false);
  orchestrator.shutdown();
});

test("acknowledgeDeliveredMessages applies one read-cursor advance per channel at the max acknowledged seq", () => {
  const orchestrator = new ReadCursorApplyDeterministicOrchestrator();
  const agentId = "agent-1";

  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "first",
    timestamp: new Date(0).toISOString(),
    seq: 10,
    message_id: "m10",
  });
  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "second",
    timestamp: new Date(0).toISOString(),
    seq: 12,
    message_id: "m12",
  });
  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-2",
    channel_name: "random",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "third",
    timestamp: new Date(0).toISOString(),
    seq: 7,
    message_id: "m7",
  });
  orchestrator.deliverToLocalInbox(agentId, {
    channel_id: "channel-2",
    channel_name: "random",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "seq-less",
    timestamp: new Date(0).toISOString(),
    message_id: "m-no-seq",
  });

  orchestrator.acknowledgeDeliveredMessages(agentId, [10, 12, 7]);

  assert.deepEqual(orchestrator.readCursorAdvances, [
    { agentId, channelId: "channel-1", seq: 12 },
    { agentId, channelId: "channel-2", seq: 7 },
  ]);
  orchestrator.shutdown();
});

test("acknowledgeDeliveredMessagesForChannel removes only the specified target channel", async () => {
  const orchestrator = new ReadCursorApplyDeterministicOrchestrator();
  const agentId = "agent-1";
  const targetMessage: AgentMessage = {
    channel_id: "channel-1",
    channel_name: "focus",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "shown in held notice",
    timestamp: new Date(0).toISOString(),
    seq: 10,
    message_id: "target-10",
  };
  const otherMessage: AgentMessage = {
    channel_id: "channel-2",
    channel_name: "side",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "normal inbox still owns this",
    timestamp: new Date(0).toISOString(),
    seq: 11,
    message_id: "side-11",
  };

  orchestrator.deliverToLocalInbox(agentId, targetMessage);
  orchestrator.deliverToLocalInbox(agentId, otherMessage);

  assert.deepEqual(
    orchestrator.acknowledgeDeliveredMessagesForChannel(agentId, "channel-1", [10, 11]),
    { removedCount: 1 },
  );
  assert.deepEqual(await orchestrator.receiveMessages(agentId, false, 0), [otherMessage]);
  assert.deepEqual(orchestrator.readCursorAdvances, [
    { agentId, channelId: "channel-1", seq: 10 },
  ]);
  orchestrator.shutdown();
});

test("acknowledgeDeliveredMessagesForChannelUpToSeq removes the target batch through latest seen seq", async () => {
  const orchestrator = new ReadCursorApplyDeterministicOrchestrator();
  const agentId = "agent-1";
  const targetTen: AgentMessage = {
    channel_id: "channel-1",
    channel_name: "focus",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "tygg",
    sender_type: "human",
    content: "shown in held notice",
    timestamp: new Date(0).toISOString(),
    seq: 10,
    message_id: "target-10",
  };
  const targetEleven: AgentMessage = {
    ...targetTen,
    content: "omitted from bounded held notice",
    seq: 11,
    message_id: "target-11",
  };
  const targetFuture: AgentMessage = {
    ...targetTen,
    content: "future message should remain",
    seq: 13,
    message_id: "target-13",
  };
  const otherMessage: AgentMessage = {
    ...targetTen,
    channel_id: "channel-2",
    channel_name: "side",
    content: "normal inbox still owns this",
    seq: 12,
    message_id: "side-12",
  };

  orchestrator.deliverToLocalInbox(agentId, targetTen);
  orchestrator.deliverToLocalInbox(agentId, targetEleven);
  orchestrator.deliverToLocalInbox(agentId, otherMessage);
  orchestrator.deliverToLocalInbox(agentId, targetFuture);

  assert.deepEqual(
    orchestrator.acknowledgeDeliveredMessagesForChannelUpToSeq(agentId, "channel-1", 11),
    { removedCount: 2 },
  );
  assert.deepEqual(await orchestrator.receiveMessages(agentId, false, 0), [otherMessage, targetFuture]);
  assert.deepEqual(orchestrator.readCursorAdvances, [
    { agentId, channelId: "channel-1", seq: 11 },
  ]);
  orchestrator.shutdown();
});

test("partitionTargetScopedMessagesUpToSeq keeps other channels and newer target messages", () => {
  const targetOld = { channel_id: "target", seq: 1 } as AgentMessage;
  const targetLatest = { channel_id: "target", seq: 2 } as AgentMessage;
  const targetFuture = { channel_id: "target", seq: 3 } as AgentMessage;
  const side = { channel_id: "side", seq: 2 } as AgentMessage;

  assert.deepEqual(
    partitionTargetScopedMessagesUpToSeq({
      inbox: [targetOld, targetLatest, targetFuture, side],
      channelId: "target",
      maxSeq: 2,
    }),
    {
      removed: [targetOld, targetLatest],
      retained: [targetFuture, side],
    },
  );
});

// --- deliverMessage sendToMachine error path ---

test("best-effort send primitive swallows injected send failures", async () => {
  const registry = new InMemoryFailpointRegistry();
  const orchestrator = new SendPrimitiveHarness();
  const warnings: unknown[][] = [];
  const originalWarn = console.warn;

  registry.configure("server.agentOrchestrator.sendToMachine.dispatch", {
    effect: "throw",
    payload: "send failed",
    mode: "once",
  });
  __setFailpointsForTests(registry);
  console.warn = (...args: unknown[]) => {
    warnings.push(args);
  };

  try {
    orchestrator.callBestEffortSend();
    await flushMicrotasks();
  } finally {
    console.warn = originalWarn;
    __resetFailpointsForTests();
    orchestrator.shutdown();
  }

  assert.equal(warnings.length, 1);
  assert.match(String(warnings[0]?.[0] ?? ""), /best-effort send failed/);
});

test("applySendToMachineAction sends locally without reroute when the planner says send-locally", async () => {
  const orchestrator = new SendToMachineApplyDeterministicOrchestrator();

  const delivered = await orchestrator.callApplySendToMachineAction("send-locally");

  assert.equal(delivered, true);
  assert.deepEqual(orchestrator.calls, ["local"]);
  orchestrator.shutdown();
});

test("applySendToMachineAction short-circuits after a successful reroute", async () => {
  const orchestrator = new SendToMachineApplyDeterministicOrchestrator();

  const delivered = await orchestrator.callApplySendToMachineAction("reroute-then-warn", true);

  assert.equal(delivered, true);
  assert.deepEqual(orchestrator.calls, ["reroute"]);
  orchestrator.shutdown();
});

test("applySendToMachineAction warns offline when reroute does not succeed", async () => {
  const orchestrator = new SendToMachineApplyDeterministicOrchestrator();

  const delivered = await orchestrator.callApplySendToMachineAction("reroute-then-warn", false);

  assert.equal(delivered, false);
  assert.deepEqual(orchestrator.calls, ["reroute"]);
  orchestrator.shutdown();
});

test("required send primitive throws when the machine is not routable", async () => {
  const registry = new InMemoryFailpointRegistry();
  const orchestrator = new SendPrimitiveHarness();

  registry.configure("server.agentOrchestrator.sendToMachine.dispatch", {
    effect: "return",
    payload: false,
    mode: "once",
  });
  __setFailpointsForTests(registry);
  try {
    await assert.rejects(() => orchestrator.callRequiredSend("machine offline"), /machine offline/);
  } finally {
    __resetFailpointsForTests();
    orchestrator.shutdown();
  }
});

test("deliverMessage does not recreate a local inbox after the agent is manually stopped during route fallback", async () => {
  const orchestrator = new DeferredLocalFallbackDeliverMessageOrchestrator();
  seedActiveAgent(orchestrator);
  const message = makeAgentMessage("late local fallback after stop");

  const deliverPromise = orchestrator.deliverMessage("agent-1", message);
  await waitForCondition(() => orchestrator.routeEntered);
  assert.equal(orchestrator.routeEntered, true);

  await orchestrator.stopAgent("agent-1");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);

  orchestrator.routeGate.resolve(false);
  await deliverPromise;

  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  orchestrator.shutdown();
});

test("routed inbox delivery does not recreate a local inbox after the agent is manually stopped during reroute fallback", async () => {
  const orchestrator = new DeferredLocalFallbackDeliverMessageOrchestrator();
  seedActiveAgent(orchestrator);
  const message = makeAgentMessage("late routed fallback after stop");

  const deliverPromise = orchestrator.handleRoutedInboxDelivery("agent-1", "machine-1", message);
  await flushMicrotasks();
  assert.equal(orchestrator.routeEntered, true);

  await orchestrator.stopAgent("agent-1");
  assert.equal((orchestrator as any).agentStateCache.get("agent-1").status, "stopped");
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);

  orchestrator.routeGate.resolve(false);
  await deliverPromise;

  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  orchestrator.shutdown();
});

// --- Passive scope gate (#proj-permission:1414ca65) ---

class ScopeRevokedDeliverMessageOrchestrator extends DeterministicAgentOrchestrator {
  readonly hasPassiveDeliveryScopeCalls: string[] = [];
  scopeAllowed = false;

  protected override async hasPassiveDeliveryScope(agentId: string): Promise<boolean> {
    this.hasPassiveDeliveryScopeCalls.push(agentId);
    return this.scopeAllowed;
  }
}

test("deliverMessage drops the message when the agent lacks inbox:receive scope", async () => {
  const orchestrator = new ScopeRevokedDeliverMessageOrchestrator();
  seedActiveAgent(orchestrator);
  const message = makeAgentMessage("revoked passive scope drops push");

  await orchestrator.deliverMessage("agent-1", message);

  assert.deepEqual(orchestrator.hasPassiveDeliveryScopeCalls, ["agent-1"]);
  assert.equal((orchestrator as any).agentInboxes.has("agent-1"), false);
  orchestrator.shutdown();
});

test("deliverMessage with intrinsic option bypasses the passive scope gate", async () => {
  const orchestrator = new ScopeRevokedDeliverMessageOrchestrator();
  seedActiveAgent(orchestrator);
  const message = makeAgentMessage("intrinsic delivery bypasses revoked scope");

  await orchestrator.deliverMessage("agent-1", message, { intrinsic: true });

  // hasPassiveDeliveryScope is never even consulted for intrinsic deliveries.
  assert.deepEqual(orchestrator.hasPassiveDeliveryScopeCalls, []);
  orchestrator.shutdown();
});

test("deliverMessage with admin authority bypasses the passive scope gate", async () => {
  const orchestrator = new ScopeRevokedDeliverMessageOrchestrator();
  seedActiveAgent(orchestrator);
  const message = makeAgentMessage("owner/admin delivery bypasses revoked scope");

  await orchestrator.deliverMessage("agent-1", message, { adminAuthority: true });

  assert.deepEqual(orchestrator.hasPassiveDeliveryScopeCalls, []);
  orchestrator.shutdown();
});

test("deliverMessage swallows fire-and-forget send errors and still delivers to the local inbox", async () => {
  const registry = new InMemoryFailpointRegistry();
  const orchestrator = new DeterministicAgentOrchestrator();
  seedActiveAgent(orchestrator);
  const message = makeAgentMessage("unobserved send failure");

  registry.configure("server.agentOrchestrator.sendToMachine.dispatch", {
    effect: "throw",
    payload: "send failed",
    mode: "once",
  });
  __setFailpointsForTests(registry);
  try {
    await orchestrator.deliverMessage("agent-1", message);
    const inbox = (orchestrator as any).agentInboxes.get("agent-1");
    assert.ok(inbox);
    assert.deepEqual(inbox.inbox, [message]);
  } finally {
    __resetFailpointsForTests();
    orchestrator.shutdown();
  }
});

// --- Activity probe / seq dedup (#engineering:72283cf7 task #340 PR B) ---

test("sweep with connected machine sends agent:activity_probe and skips synth", async () => {
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore());
  const ws = makeFakeWs();
  seedMachineConnection(orchestrator, "machine-1", ws);
  seedActiveAgent(orchestrator);
  // Make the agent stale.
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stuck",
    updatedAt: Date.now() - 91_000,
  });

  (orchestrator as any).sweepStaleActivities();
  // Allow the async probe-issue path to flush.
  await new Promise((resolve) => setImmediate(resolve));

  // The activity hasn't been flipped to online — sweep deferred to probe.
  assert.equal((orchestrator as any).agentActivity.get("agent-1").activity, "working");
  // A probe message was sent over the WS.
  const probeMsg = ws.sent.map((s) => JSON.parse(s)).find((m) => m.type === "agent:activity_probe");
  assert.ok(probeMsg, "expected agent:activity_probe to be sent");
  assert.equal(probeMsg.agentId, "agent-1");
  assert.equal(probeMsg.purpose, "sweep");
  assert.equal(typeof probeMsg.probeId, "string");
  // Probe is tracked as pending.
  assert.equal((orchestrator as any).pendingActivityProbes.size, 1);
  orchestrator.shutdown();
});

test("daemon probe response cancels the synth fallback timer", async () => {
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore());
  const ws = makeFakeWs();
  seedMachineConnection(orchestrator, "machine-1", ws);
  seedActiveAgent(orchestrator);
  (orchestrator as any).agentActivity.set("agent-1", {
    activity: "working",
    detail: "stuck",
    updatedAt: Date.now() - 91_000,
  });

  (orchestrator as any).sweepStaleActivities();
  await new Promise((resolve) => setImmediate(resolve));

  const probeMsg = ws.sent.map((s) => JSON.parse(s)).find((m) => m.type === "agent:activity_probe");
  assert.ok(probeMsg);

  // Daemon replies via the existing agent:activity channel with matching probeId.
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "still busy",
    probeId: probeMsg.probeId,
  } as MachineToServerMessage);

  // pending probe is cleared (fallback won't fire).
  assert.equal((orchestrator as any).pendingActivityProbes.size, 0);
  orchestrator.shutdown();
});

test("ingest dedup drops agent:activity with stale clientSeq for same launchId", async () => {
  const orchestrator = new DeterministicAgentOrchestrator(new InMemoryReplicaStateStore());
  seedMachineConnection(orchestrator, "machine-1", makeFakeWs());
  seedActiveAgent(orchestrator);

  // Seq 5 — accepted, becomes lastSeen.
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "first",
    launchId: "launch-A",
    clientSeq: 5,
  } as MachineToServerMessage);
  assert.equal((orchestrator as any).agentActivity.get("agent-1").activity, "working");
  assert.equal((orchestrator as any).agentActivity.get("agent-1").detail, "first");

  // Seq 3 — late-arriving older message, must be dropped.
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "online",
    detail: "stale-late",
    launchId: "launch-A",
    clientSeq: 3,
  } as MachineToServerMessage);
  assert.equal((orchestrator as any).agentActivity.get("agent-1").detail, "first", "stale clientSeq should not overwrite");

  // Seq 6 — newer than 5 → applied.
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "online",
    detail: "fresh-newer",
    launchId: "launch-A",
    clientSeq: 6,
  } as MachineToServerMessage);
  assert.equal((orchestrator as any).agentActivity.get("agent-1").detail, "fresh-newer");

  // New launchId → seq tracking resets, so seq 1 of a new launch is accepted
  // even though we just saw seq 6 of the previous launch.
  await orchestrator.handleMachineMessage("machine-1", {
    type: "agent:activity",
    agentId: "agent-1",
    activity: "working",
    detail: "new-launch-seq-1",
    launchId: "launch-B",
    clientSeq: 1,
  } as MachineToServerMessage);
  assert.equal((orchestrator as any).agentActivity.get("agent-1").detail, "new-launch-seq-1");

  orchestrator.shutdown();
});
