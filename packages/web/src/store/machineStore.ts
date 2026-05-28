import { create } from "zustand";
import api from "../api/client";
import { useServerStore } from "./serverStore";
import { registerServerReset } from "./serverResetRegistry";
import { mergeMachineStatus } from "../utils/machineStatusMerge";

export interface Machine {
  id: string;
  name: string;
  status: "online" | "offline";
  statusVersion: number;
  apiKeyPrefix: string | null;
  runtimes: string[];
  hostname: string | null;
  os: string | null;
  daemonVersion: string | null;
  lastHeartbeat: string | null;
  createdAt: string;
}

export interface MachineWorkspaceEntry {
  directoryName: string;
  totalSizeBytes: number;
  lastModified: string;
  fileCount: number;
  status: "active" | "stopped" | "deleted" | "orphan";
  agentName: string | null;
  agentStatus: string | null;
}

interface MachineState {
  machines: Machine[];
  latestDaemonVersion: string | null;
  loading: boolean;
  selectedMachineId: string | null;
  showAddMachine: boolean;
  /** Transient: API key shown once after registration */
  pendingApiKey: string | null;
  pendingMachineId: string | null;
  /** Per-machine workspace scan results */
  machineWorkspaces: Record<string, MachineWorkspaceEntry[]>;
  machineWorkspacesLoading: Record<string, boolean>;

  loadMachines: () => Promise<void>;
  registerMachine: (name: string) => Promise<{ machine: Machine; apiKey: string }>;
  renameMachine: (machineId: string, name: string) => Promise<void>;
  deleteMachine: (machineId: string) => Promise<void>;
  updateMachineStatus: (machineId: string, status: "online" | "offline", statusVersion?: number) => void;
  updateMachineCapabilities: (
    machineId: string,
    runtimes: string[],
    hostname?: string,
    os?: string,
    daemonVersion?: string
  ) => void;
  rotateApiKey: (machineId: string) => Promise<string>;
  clearPendingApiKey: () => void;
  setSelectedMachine: (machineId: string | null) => void;
  setShowAddMachine: (show: boolean) => void;
  scanMachineWorkspaces: (machineId: string) => Promise<void>;
  deleteMachineWorkspace: (machineId: string, directoryName: string) => Promise<void>;

  /** Computed helpers */
  hasOnlineMachine: () => boolean;
  hasAnyMachine: () => boolean;
}

export const useMachineStore = create<MachineState>((set, get) => ({
  machines: [],
  latestDaemonVersion: null,
  loading: true,
  selectedMachineId: null,
  showAddMachine: false,
  pendingApiKey: null,
  pendingMachineId: null,
  machineWorkspaces: {},
  machineWorkspacesLoading: {},

  loadMachines: async () => {
    const epoch = useServerStore.getState().serverEpoch;
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    // Never set loading here — it starts as true (store init / server reset)
    // and goes to false after the first successful fetch. This keeps existing
    // data (or a legitimate empty state) visible during refreshes.
    try {
      const { data } = await api.get(`/servers/${serverId}/machines`);
      if (useServerStore.getState().serverEpoch !== epoch) return;
      const machines = Array.isArray(data) ? data : data.machines;
      const latestDaemonVersion = Array.isArray(data) ? null : data.latestDaemonVersion ?? null;
      set({ machines, latestDaemonVersion, loading: false });
    } catch (err) {
      console.error("Failed to load machines:", err);
      if (useServerStore.getState().serverEpoch !== epoch) return;
      set({ loading: false });
    }
  },

  registerMachine: async (name: string) => {
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) throw new Error("No server selected");
    const { data } = await api.post(`/servers/${serverId}/machines`, { name });
    const machine: Machine = {
      ...data.machine,
      runtimes: data.machine.runtimes || [],
    };
    // Persist API key locally so the run command is always available
    localStorage.setItem(`slock_machine_apikey_${machine.id}`, data.apiKey);
    set((state) => ({
      machines: [...state.machines, machine],
      pendingApiKey: data.apiKey,
      pendingMachineId: machine.id,
    }));
    return { machine, apiKey: data.apiKey };
  },

  renameMachine: async (machineId: string, name: string) => {
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) throw new Error("No server selected");
    await api.patch(`/servers/${serverId}/machines/${machineId}`, { name });
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, name } : m
      ),
    }));
  },

  deleteMachine: async (machineId: string) => {
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) throw new Error("No server selected");
    await api.delete(`/servers/${serverId}/machines/${machineId}`);
    localStorage.removeItem(`slock_machine_apikey_${machineId}`);
    set((state) => ({
      machines: state.machines.filter((m) => m.id !== machineId),
      selectedMachineId: state.selectedMachineId === machineId ? null : state.selectedMachineId,
      pendingApiKey: state.pendingMachineId === machineId ? null : state.pendingApiKey,
      pendingMachineId: state.pendingMachineId === machineId ? null : state.pendingMachineId,
    }));
  },

  updateMachineStatus: (machineId: string, status: "online" | "offline", statusVersion?: number) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? mergeMachineStatus(m, status, statusVersion) : m
      ),
    }));
  },

  updateMachineCapabilities: (
    machineId: string,
    runtimes: string[],
    hostname?: string,
    os?: string,
    daemonVersion?: string
  ) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId
          ? {
              ...m,
              runtimes,
              ...(hostname !== undefined ? { hostname } : {}),
              ...(os !== undefined ? { os } : {}),
              ...(daemonVersion !== undefined ? { daemonVersion } : {}),
            }
          : m
      ),
    }));
  },

  rotateApiKey: async (machineId: string) => {
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) throw new Error("No server selected");
    const { data } = await api.post(`/servers/${serverId}/machines/${machineId}/rotate-key`);
    localStorage.setItem(`slock_machine_apikey_${machineId}`, data.apiKey);
    const newPrefix = data.apiKey.slice(0, 20);
    set((state) => ({
      pendingApiKey: data.apiKey,
      pendingMachineId: machineId,
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, apiKeyPrefix: newPrefix } : m
      ),
    }));
    return data.apiKey;
  },

  clearPendingApiKey: () => set({ pendingApiKey: null, pendingMachineId: null }),

  setSelectedMachine: (machineId) => set({ selectedMachineId: machineId }),

  setShowAddMachine: (show) => set({ showAddMachine: show }),

  scanMachineWorkspaces: async (machineId: string) => {
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    set((state) => ({
      machineWorkspacesLoading: { ...state.machineWorkspacesLoading, [machineId]: true },
    }));
    try {
      const { data } = await api.get(
        `/servers/${serverId}/machines/${machineId}/workspaces`,
      );
      set((state) => ({
        machineWorkspaces: { ...state.machineWorkspaces, [machineId]: data },
        machineWorkspacesLoading: { ...state.machineWorkspacesLoading, [machineId]: false },
      }));
    } catch (err) {
      console.error("Failed to scan workspaces:", err);
      set((state) => ({
        machineWorkspacesLoading: { ...state.machineWorkspacesLoading, [machineId]: false },
      }));
    }
  },

  deleteMachineWorkspace: async (machineId: string, directoryName: string) => {
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    await api.delete(
      `/servers/${serverId}/machines/${machineId}/workspaces/${directoryName}`,
    );
    // Remove from local state
    set((state) => ({
      machineWorkspaces: {
        ...state.machineWorkspaces,
        [machineId]: (state.machineWorkspaces[machineId] || []).filter(
          (w) => w.directoryName !== directoryName,
        ),
      },
    }));
  },

  hasOnlineMachine: () => get().machines.some((m) => m.status === "online"),
  hasAnyMachine: () => get().machines.length > 0,
}));

// Reset all server-scoped state when the user switches servers.
registerServerReset(() =>
  useMachineStore.setState({
    machines: [],
    latestDaemonVersion: null,
    loading: true,
    selectedMachineId: null,
    showAddMachine: false,
    pendingApiKey: null,
    pendingMachineId: null,
    machineWorkspaces: {},
    machineWorkspacesLoading: {},
  })
);
