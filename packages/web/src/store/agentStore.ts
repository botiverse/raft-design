import { create } from "zustand";
import api from "../api/client";
import { getToolActivityLabel, normalizeActivity, VALID_ACTIVITIES } from "@slock-ai/shared";
import type { AgentActivity, AgentStatus, ReasoningEffort, RuntimeConfig, TrajectoryEntry } from "@slock-ai/shared";
import { useServerStore } from "./serverStore";
import { registerServerReset } from "./serverResetRegistry";
import { getActivityText } from "../utils/activity";

// Re-export for consumers that previously imported from this file
export type { AgentActivity } from "@slock-ai/shared";
export type { TrajectoryEntry } from "@slock-ai/shared";

export interface Agent {
  id: string;
  serverId?: string;
  serverName?: string | null;
  serverSlug?: string | null;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  description: string | null;
  status: AgentStatus;
  model: string;
  runtime: string;
  runtimeConfig?: RuntimeConfig | null;
  reasoningEffort: ReasoningEffort | null;
  executionMode: "byoc" | "cloud";
  envVars: Record<string, string> | null;
  machineId: string | null;
  runtimeProfile?: AgentRuntimeProfileSummary | null;
  creatorType: "user" | "agent" | null;
  creatorId: string | null;
  creator: CreatorSummary | null;
  createdAgents: AgentCreatedSummary[];
  deletedAt: string | null;
  createdAt: string;
}

export type AgentRuntimeProfileMigrationStatus = "stable" | "pending" | "migrating";
export type AgentRuntimeProfilePendingKind = "migration" | "daemon_release_notice";

export interface AgentRuntimeProfileRef {
  label?: string | null;
  path?: string | null;
  machineId?: string | null;
  runtime?: string | null;
  reachable?: boolean | null;
  reason?: string | null;
}

export interface AgentRuntimeProfileSnapshot {
  runtimeProfileFingerprint?: string;
  daemonVersion?: string | null;
  machineId?: string | null;
  machineName?: string | null;
  runtime?: string | null;
  model?: string | null;
  reasoningEffort?: ReasoningEffort | null;
  executionMode?: "byoc" | "cloud" | string | null;
  workspaceRef?: AgentRuntimeProfileRef | string | null;
  workspacePathRef?: AgentRuntimeProfileRef | string | null;
  sessionRef?: AgentRuntimeProfileRef | string | null;
  observedAt?: string | null;
}

export interface AgentRuntimeProfileChange {
  field: string;
  before?: unknown;
  after?: unknown;
}

export interface AgentRuntimeProfilePending {
  kind: AgentRuntimeProfilePendingKind;
  key: string;
  releaseNotesUrl?: string | null;
  migratingSince?: string | null;
  lastNudgeAt?: string | null;
  nudgeCount?: number;
  before?: AgentRuntimeProfileSnapshot | null;
  after?: AgentRuntimeProfileSnapshot | null;
  changes?: AgentRuntimeProfileChange[];
  previousSessionRef?: AgentRuntimeProfileRef | string | null;
}

export interface AgentRuntimeProfileSummary {
  current?: AgentRuntimeProfileSnapshot | null;
  migrationStatus: AgentRuntimeProfileMigrationStatus;
  pending?: AgentRuntimeProfilePending | null;
}

export interface CreatorSummary {
  type: "human" | "agent";
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  gravatarHash?: string;
  deletedAt?: string | null;
}

export interface AgentCreatedSummary {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  runtime: string;
  status: AgentStatus;
}

/** Shape returned by the API — may include activity fields used to seed agentActivities. */
type ApiAgent = Agent & {
  activity?: AgentActivity;
  activityDetail?: string;
};

export interface ActivityLogEntry {
  timestamp: number;
  activity: AgentActivity;
  detail: string;
}

export interface TrajectoryLogEntry {
  timestamp: number;
  entry: TrajectoryEntry;
}

const MAX_LOG_ENTRIES = 200;
const MAX_TRAJECTORY_ENTRIES = 500;

export interface AgentActivityState {
  activity: AgentActivity;
  activityDetail: string;
}

export interface AgentDisplayState {
  activity: AgentActivity;
  activityDetail: string;
  activityText: string;
  isOnline: boolean;
}

export function resolveAgentDisplayState(
  agent: Pick<Agent, "status"> | null | undefined,
  activityState: AgentActivityState | null | undefined,
): AgentDisplayState {
  const activity = activityState?.activity
    ?? (agent?.status === "active" ? "online" : "offline");
  const activityDetail = activityState?.activityDetail
    ?? (agent?.status === "stopped" ? "Stopped" : "");
  return {
    activity,
    activityDetail,
    activityText: getActivityText(activity, activityDetail),
    isOnline: activity !== "offline",
  };
}

interface AgentState {
  agents: Agent[];
  agentActivities: Record<string, AgentActivityState>;
  /**
   * Last observation timestamp used to update the status surface.
   * Activity Log entries can arrive via a separate trajectory stream;
   * this lets that stream fix stale idle badges without letting older
   * log replay clobber a newer non-idle socket push.
   */
  agentActivityObservedAt: Record<string, number>;
  /**
   * Local monotonic activity mutation counter. REST snapshots can race
   * socket pushes during reconnect: if an `agent:activity` push lands
   * while `/agents` is still in flight, the stale REST response must not
   * overwrite the fresher socket state.
   */
  agentActivityVersions: Record<string, number>;
  /**
   * Per-agent monotonic seq of the last applied `agent:activity`
   * push, used to drop out-of-order updates that arrive during
   * reconnect storms. Cleared on `socket.connect` (which also fires
   * `loadAgents()`) so server restarts don't false-reject. New
   * server emits include `serverSeq`; old servers omit it, in which
   * case we always apply (== pre-PR behaviour).
   * Introduced 2026-05-02 #engineering:72283cf7 task #340 PR B.
   */
  agentActivitySeq: Record<string, number>;
  loading: boolean;
  showCreateAgent: boolean;
  createAgentOnboarding: boolean;
  activityLogs: Record<string, ActivityLogEntry[]>;
  trajectoryLogs: Record<string, TrajectoryLogEntry[]>;
  setShowCreateAgent: (show: boolean, onboarding?: boolean) => void;
  loadAgents: () => Promise<void>;
  /**
   * Reset the per-agent serverSeq tracking. Call this on
   * `socket.on("connect")` so the post-reconnect snapshot path
   * (`loadAgents()` + subsequent socket pushes) is not blocked by
   * stale seq numbers held over from before the disconnect.
   */
  resetActivitySeq: () => void;
  createAgent: (
    name: string,
    opts?: { description?: string; model?: string; runtime?: string; runtimeConfig?: RuntimeConfig; reasoningEffort?: ReasoningEffort; machineId?: string; envVars?: Record<string, string>; avatarUrl?: string; onboarding?: boolean }
  ) => Promise<Agent>;
  updateAgent: (
    agentId: string,
    fields: { displayName?: string | null; description?: string | null; avatarUrl?: string | null; model?: string; runtime?: string; runtimeConfig?: RuntimeConfig | null; reasoningEffort?: ReasoningEffort | null; envVars?: Record<string, string> | null },
    opts?: { restartMode?: "restart" | "session" },
  ) => Promise<Agent>;
  startAgent: (agentId: string) => Promise<void>;
  stopAgent: (agentId: string) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  resetAgent: (agentId: string, mode: "restart" | "session" | "full") => Promise<void>;
  updateActivity: (agentId: string, activity: string, activityDetail?: string, serverSeq?: number, timestamp?: number) => void;
  appendTrajectory: (agentId: string, entries: TrajectoryEntry[], timestamp?: number) => void;
  loadTrajectoryLog: (agentId: string, limit?: number) => Promise<void>;
  getActivityLog: (agentId: string) => ActivityLogEntry[];
  getTrajectoryLog: (agentId: string) => TrajectoryLogEntry[];
}

export function selectAgentDisplayState(state: AgentState, agentId: string): AgentDisplayState {
  return resolveAgentDisplayState(
    state.agents.find((agent) => agent.id === agentId),
    state.agentActivities[agentId],
  );
}

/**
 * Module-level in-flight guard for `loadAgents()`. Multiple
 * concurrent calls (e.g. socket-reconnect storm firing several
 * `connect` events in quick succession) coalesce onto the same
 * Promise, preventing the REST response from racing with newer
 * socket pushes. Cleared after each settled fetch.
 * (#engineering:72283cf7 task #340 PR B)
 */
let loadAgentsInFlight: Promise<void> | null = null;

function nextActivityVersion(state: Pick<AgentState, "agentActivityVersions">, agentId: string): number {
  return (state.agentActivityVersions[agentId] ?? 0) + 1;
}

function parsePushedActivity(raw: string | undefined): AgentActivity | null {
  if (raw && VALID_ACTIVITIES.has(raw as AgentActivity)) return raw as AgentActivity;
  return null;
}

function deriveActivityFromTrajectoryEntry(entry: TrajectoryEntry): AgentActivityState | null {
  switch (entry.kind) {
    case "thinking":
      return { activity: "thinking", activityDetail: entry.text || "Thinking…" };
    case "tool_start":
      return { activity: "working", activityDetail: getToolActivityLabel(entry.toolName) };
    case "compaction_started":
      return { activity: "working", activityDetail: "Compacting context…" };
    case "compaction_finished":
      return { activity: "online", activityDetail: "" };
    case "status":
      return { activity: entry.activity, activityDetail: entry.detail || "" };
    default:
      return null;
  }
}

function deriveLatestActivityFromTrajectory(entries: TrajectoryLogEntry[]): { state: AgentActivityState; timestamp: number } | null {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const item = entries[index];
    const projected = deriveActivityFromTrajectoryEntry(item.entry);
    if (projected) return { state: projected, timestamp: item.timestamp };
  }
  return null;
}

function shouldApplyTrajectoryActivity(state: AgentState, agentId: string, timestamp: number): boolean {
  const current = state.agentActivities[agentId];
  if (!current || current.activity === "online") return true;
  return timestamp >= (state.agentActivityObservedAt[agentId] ?? 0);
}

export const useAgentStore = create<AgentState>((set, get) => ({
  showCreateAgent: false,
  createAgentOnboarding: false,
  setShowCreateAgent: (show, onboarding = false) =>
    set({
      showCreateAgent: show,
      createAgentOnboarding: show ? onboarding : false,
    }),
  agents: [],
  agentActivities: {},
  agentActivityObservedAt: {},
  agentActivityVersions: {},
  agentActivitySeq: {},
  loading: true,
  activityLogs: {},
  trajectoryLogs: {},

  loadAgents: async () => {
    // In-flight guard: when the socket reconnects in a flap, `connect`
    // can fire multiple times rapidly. Each call into `loadAgents`
    // would otherwise produce a parallel REST request whose response
    // races the live socket pushes — a slow response can clobber a
    // newer pushed activity. Coalesce concurrent calls onto a single
    // promise. (#engineering:72283cf7 task #340 PR B.)
    if (loadAgentsInFlight) return loadAgentsInFlight;
    const epoch = useServerStore.getState().serverEpoch;
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    const activityVersionsAtRequest = { ...get().agentActivityVersions };
    // Never set loading here — it starts as true (store init / server reset)
    // and goes to false after the first successful fetch. This keeps existing
    // data (or a legitimate empty state) visible during refreshes.
    loadAgentsInFlight = (async () => {
      try {
        const { data } = await api.get("/agents");
        if (useServerStore.getState().serverEpoch !== epoch) return;
        const apiAgents = data as ApiAgent[];
        const agents = apiAgents.map(({ activity: _a, activityDetail: _d, ...rest }) => rest);
        const snapshotActivities: Record<string, AgentActivityState> = {};
        const snapshotObservedAt = Date.now();
        for (const a of apiAgents) {
          snapshotActivities[a.id] = {
            activity: normalizeActivity(a.activity, a.status),
            activityDetail: a.activityDetail || "",
          };
        }
        // The REST snapshot is authoritative for the moment of fetch;
        // reset per-agent seq tracking so future socket pushes are
        // accepted as long as they're monotonically newer.
        set((state) => {
          const agentActivities: Record<string, AgentActivityState> = {};
          const agentActivityObservedAt: Record<string, number> = {};
          const agentActivityVersions: Record<string, number> = {};
          for (const a of apiAgents) {
            const requestVersion = activityVersionsAtRequest[a.id] ?? 0;
            const currentVersion = state.agentActivityVersions[a.id] ?? 0;
            if (currentVersion > requestVersion && state.agentActivities[a.id]) {
              agentActivities[a.id] = state.agentActivities[a.id];
              agentActivityObservedAt[a.id] = state.agentActivityObservedAt[a.id] ?? snapshotObservedAt;
              agentActivityVersions[a.id] = currentVersion;
            } else {
              agentActivities[a.id] = snapshotActivities[a.id];
              agentActivityObservedAt[a.id] = snapshotObservedAt;
              agentActivityVersions[a.id] = currentVersion;
            }
          }
          return { agents, agentActivities, agentActivityObservedAt, agentActivityVersions, agentActivitySeq: {}, loading: false };
        });
      } catch (err) {
        console.error("Failed to load agents:", err);
        if (useServerStore.getState().serverEpoch !== epoch) return;
        set({ loading: false });
      }
    })();
    try {
      await loadAgentsInFlight;
    } finally {
      loadAgentsInFlight = null;
    }
  },

  resetActivitySeq: () => set({ agentActivitySeq: {} }),

  createAgent: async (name, opts = {}) => {
    const { data } = await api.post("/agents", {
      name,
      description: opts.description,
      model: opts.model,
      runtime: opts.runtime,
      runtimeConfig: opts.runtimeConfig,
      reasoningEffort: opts.reasoningEffort,
      machineId: opts.machineId,
      envVars: opts.envVars,
      avatarUrl: opts.avatarUrl,
      onboarding: opts.onboarding,
    });
    const { activity: rawActivity, activityDetail: rawDetail, ...rest } = data as ApiAgent;
    const agent: Agent = rest;
    set((state) => ({
      agents: [...state.agents, agent],
      agentActivities: {
        ...state.agentActivities,
        [agent.id]: {
          activity: normalizeActivity(rawActivity, agent.status),
          activityDetail: rawDetail || "",
        },
      },
      agentActivityObservedAt: {
        ...state.agentActivityObservedAt,
        [agent.id]: Date.now(),
      },
      agentActivityVersions: {
        ...state.agentActivityVersions,
        [agent.id]: nextActivityVersion(state, agent.id),
      },
    }));
    return agent;
  },

  updateAgent: async (agentId, fields, opts) => {
    const { data } = await api.patch(`/agents/${agentId}`, {
      ...fields,
      ...(opts?.restartMode ? { restartMode: opts.restartMode } : {}),
    });
    set((state) => ({
      ...(() => {
        if (opts?.restartMode !== "session") {
          return {};
        }
        const { [agentId]: _activityLog, ...nextActivityLogs } = state.activityLogs;
        const { [agentId]: _trajectoryLog, ...nextTrajectoryLogs } = state.trajectoryLogs;
        return {
          activityLogs: nextActivityLogs,
          trajectoryLogs: nextTrajectoryLogs,
        };
      })(),
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, ...data } : a
      ),
    }));
    return data;
  },

  startAgent: async (agentId) => {
    await api.post(`/agents/${agentId}/start`);
    // Only optimistically update if agent was offline — avoid overriding real state
    set((state) => {
      const current = state.agentActivities[agentId];
      const agents = state.agents.map((a) =>
        a.id === agentId ? { ...a, status: "active" as const } : a
      );
      if (current?.activity !== "offline") {
        return { agents };
      }
      return {
        agents,
        agentActivities: {
          ...state.agentActivities,
          [agentId]: { activity: "working" as AgentActivity, activityDetail: "Starting\u2026" },
        },
        agentActivityObservedAt: {
          ...state.agentActivityObservedAt,
          [agentId]: Date.now(),
        },
        agentActivityVersions: {
          ...state.agentActivityVersions,
          [agentId]: nextActivityVersion(state, agentId),
        },
      };
    });
  },

  stopAgent: async (agentId) => {
    await api.post(`/agents/${agentId}/stop`);
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status: "stopped" as const } : a
      ),
      agentActivities: {
        ...state.agentActivities,
        [agentId]: { activity: "offline" as AgentActivity, activityDetail: "Stopped" },
      },
      agentActivityObservedAt: {
        ...state.agentActivityObservedAt,
        [agentId]: Date.now(),
      },
      agentActivityVersions: {
        ...state.agentActivityVersions,
        [agentId]: nextActivityVersion(state, agentId),
      },
    }));
  },

  deleteAgent: async (agentId) => {
    await api.delete(`/agents/${agentId}`);
    set((state) => {
      const { [agentId]: _, ...restActivities } = state.agentActivities;
      const { [agentId]: _observedAt, ...restObservedAt } = state.agentActivityObservedAt;
      const { [agentId]: _version, ...restVersions } = state.agentActivityVersions;
      return {
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, deletedAt: new Date().toISOString(), status: "inactive" as const } : a
        ),
        agentActivities: restActivities,
        agentActivityObservedAt: restObservedAt,
        agentActivityVersions: restVersions,
      };
    });
  },

  resetAgent: async (agentId, mode: "restart" | "session" | "full") => {
    await api.post(`/agents/${agentId}/reset`, { mode });
    set((state) => ({
      ...(() => {
        if (mode === "restart") {
          return {};
        }
        const { [agentId]: _activityLog, ...nextActivityLogs } = state.activityLogs;
        const { [agentId]: _trajectoryLog, ...nextTrajectoryLogs } = state.trajectoryLogs;
        return {
          activityLogs: nextActivityLogs,
          trajectoryLogs: nextTrajectoryLogs,
        };
      })(),
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status: "active" as const } : a
      ),
      agentActivities: {
        ...state.agentActivities,
        [agentId]: { activity: "working" as AgentActivity, activityDetail: "Starting\u2026" },
      },
      agentActivityObservedAt: {
        ...state.agentActivityObservedAt,
        [agentId]: Date.now(),
      },
    }));
  },

  updateActivity: (agentId, activity, activityDetail = "", serverSeq, timestamp = Date.now()) =>
    set((state) => {
      // Per-agent serverSeq dedup. New server emits include the
      // monotonic seq; if the incoming seq is not strictly greater
      // than the highest we've already applied, drop it (out-of-order
      // delivery during reconnect). Old servers omit serverSeq → no
      // dedup, identical to pre-PR behaviour.
      // (#engineering:72283cf7 task #340 PR B)
      if (typeof serverSeq === "number") {
        const lastSeq = state.agentActivitySeq[agentId];
        if (lastSeq !== undefined && serverSeq <= lastSeq) {
          return {};
        }
      }

      const normalized = parsePushedActivity(activity);
      if (!normalized) {
        return {};
      }
      const nextVersion = nextActivityVersion(state, agentId);
      const entry: ActivityLogEntry = {
        timestamp,
        activity: normalized,
        detail: activityDetail,
      };
      const existing = state.activityLogs[agentId] || [];
      // Deduplicate: skip if same activity+detail as the last entry (within 1 second)
      const last = existing[existing.length - 1];
      const isDuplicate = last &&
        last.activity === entry.activity &&
        last.detail === entry.detail &&
        entry.timestamp - last.timestamp < 1000;
      const updatedLog = isDuplicate
        ? existing
        : [...existing, entry].slice(-MAX_LOG_ENTRIES);
      return {
        agentActivities: {
          ...state.agentActivities,
          [agentId]: { activity: normalized, activityDetail },
        },
        agentActivityObservedAt: {
          ...state.agentActivityObservedAt,
          [agentId]: timestamp,
        },
        agentActivityVersions: {
          ...state.agentActivityVersions,
          [agentId]: nextVersion,
        },
        agentActivitySeq:
          typeof serverSeq === "number"
            ? { ...state.agentActivitySeq, [agentId]: serverSeq }
            : state.agentActivitySeq,
        activityLogs: {
          ...state.activityLogs,
          [agentId]: updatedLog,
        },
      };
    }),

  appendTrajectory: (agentId, entries, timestamp = Date.now()) =>
    set((state) => {
      const newEntries = entries.map((entry) => ({ timestamp, entry }));
      const existing = state.trajectoryLogs[agentId] || [];
      const combined = [...existing, ...newEntries].slice(-MAX_TRAJECTORY_ENTRIES);
      const latestActivity = deriveLatestActivityFromTrajectory(combined);
      const applyActivity = latestActivity && shouldApplyTrajectoryActivity(state, agentId, latestActivity.timestamp);
      return {
        trajectoryLogs: {
          ...state.trajectoryLogs,
          [agentId]: combined,
        },
        ...(applyActivity
          ? {
              agentActivities: {
                ...state.agentActivities,
                [agentId]: latestActivity.state,
              },
              agentActivityObservedAt: {
                ...state.agentActivityObservedAt,
                [agentId]: latestActivity.timestamp,
              },
              agentActivityVersions: {
                ...state.agentActivityVersions,
                [agentId]: nextActivityVersion(state, agentId),
              },
            }
          : {}),
      };
    }),

  loadTrajectoryLog: async (agentId, limit = 50) => {
    const { data } = await api.get(`/agents/${agentId}/activity-log`, { params: { limit } });
    const incoming = data as TrajectoryLogEntry[];
    set((state) => {
      const existing = state.trajectoryLogs[agentId] || [];
      const seen = new Set(existing.map((item) => `${item.timestamp}:${JSON.stringify(item.entry)}`));
      const merged = [...existing];
      for (const item of incoming) {
        const key = `${item.timestamp}:${JSON.stringify(item.entry)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
      }
      merged.sort((a, b) => a.timestamp - b.timestamp);
      const sliced = merged.slice(-MAX_TRAJECTORY_ENTRIES);
      const latestActivity = deriveLatestActivityFromTrajectory(sliced);
      const applyActivity = latestActivity && shouldApplyTrajectoryActivity(state, agentId, latestActivity.timestamp);
      return {
        trajectoryLogs: {
          ...state.trajectoryLogs,
          [agentId]: sliced,
        },
        ...(applyActivity
          ? {
              agentActivities: {
                ...state.agentActivities,
                [agentId]: latestActivity.state,
              },
              agentActivityObservedAt: {
                ...state.agentActivityObservedAt,
                [agentId]: latestActivity.timestamp,
              },
              agentActivityVersions: {
                ...state.agentActivityVersions,
                [agentId]: nextActivityVersion(state, agentId),
              },
            }
          : {}),
      };
    });
  },

  getActivityLog: (agentId) => get().activityLogs[agentId] || [],

  getTrajectoryLog: (agentId) => get().trajectoryLogs[agentId] || [],
}));

export function useAgentDisplayState(
  agentId: string,
  fallbackAgent?: Pick<Agent, "status"> | null,
): AgentDisplayState {
  const agentStatus = useAgentStore((state) => state.agents.find((agent) => agent.id === agentId)?.status);
  const activityState = useAgentStore((state) => state.agentActivities[agentId]);
  return resolveAgentDisplayState(agentStatus ? { status: agentStatus } : fallbackAgent, activityState);
}

// Reset all server-scoped state when the user switches servers.
registerServerReset(() =>
  useAgentStore.setState({
    agents: [],
    agentActivities: {},
    agentActivityObservedAt: {},
    agentActivityVersions: {},
    agentActivitySeq: {},
    loading: true,
    showCreateAgent: false,
    createAgentOnboarding: false,
    activityLogs: {},
    trajectoryLogs: {},
  })
);
