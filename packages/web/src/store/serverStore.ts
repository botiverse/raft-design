import { create } from "zustand";
import api from "../api/client";
import type { ServerRole } from "@slock-ai/shared";
import { triggerServerReset } from "./serverResetRegistry";

export interface Server {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  onboardingAgentId: string | null;
  hideHumansFromMembers: boolean;
  plan: string;
  planDowngradedAt: string | null;
  role: ServerRole;
  createdAt: string;
}

export type CommunityServerSlug = "community" | "community-cn";

export interface ServerMember {
  userId: string;
  serverId?: string;
  serverName?: string | null;
  serverSlug?: string | null;
  email: string | null;
  gravatarHash: string;
  name: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  role: ServerRole;
  joinedAt: string;
}

export interface ServerUsage {
  agents: number;
  machines: number;
  channels: number;
}

export interface SidebarOrderPreferences {
  channelOrder: string[];
  agentOrder: string[];
  dmOrder: string[];
  channelSortMode: "manual" | "recent" | "az";
  dmSortMode: "manual" | "recent" | "az";
  pinnedSortMode: "manual" | "recent" | "az";
  pinnedChannelIds: string[];
  pinnedAgentIds: string[];
  pinnedOrder: string[];
  hiddenDmIds: string[];
  channelPanelTabOrder: string[];
  agentPanelTabOrder: string[];
}

export interface SubscriptionInfo {
  status: "active" | "past_due" | "canceled" | "incomplete";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface BillingInfo {
  subscription: SubscriptionInfo | null;
  stripeConfigured: boolean;
}

interface ServerState {
  servers: Server[];
  current: Server | null;
  members: ServerMember[];
  loading: boolean;
  usage: ServerUsage | null;
  billing: BillingInfo | null;
  sidebarOrder: SidebarOrderPreferences;
  /**
   * Monotonic counter incremented on every setCurrent() call.
   * All server-scoped async loaders capture this epoch before their await
   * and discard the response if the epoch changed by the time it arrives.
   * This correctly handles A→B→A rapid switching (unlike a plain serverId
   * comparison, which would let a stale response from the first A visit pass).
   */
  serverEpoch: number;

  loadServers: () => Promise<void>;
  setCurrent: (server: Server) => void;
  clearCurrent: () => void;
  createServer: (name: string, slug: string) => Promise<Server>;
  joinCommunityServer: (options?: { agreementId?: string | null; slug?: CommunityServerSlug }) => Promise<Server>;
  updateServerProfile: (updates: { name?: string; hideHumansFromMembers?: boolean }) => Promise<void>;
  leaveServer: () => Promise<void>;
  deleteServer: () => Promise<void>;
  loadMembers: () => Promise<void>;
  loadSidebarOrder: () => Promise<void>;
  updateSidebarOrder: (updates: Partial<SidebarOrderPreferences>) => Promise<void>;
  updateMemberRole: (userId: string, role: ServerRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  loadUsage: () => Promise<void>;
  loadBilling: () => Promise<void>;
}

const DEFAULT_SIDEBAR_ORDER: SidebarOrderPreferences = {
  channelOrder: [],
  agentOrder: [],
  dmOrder: [],
  channelSortMode: "manual",
  dmSortMode: "manual",
  pinnedSortMode: "manual",
  pinnedChannelIds: [],
  pinnedAgentIds: [],
  pinnedOrder: [],
  hiddenDmIds: [],
  channelPanelTabOrder: [],
  agentPanelTabOrder: [],
};

function normalizeSidebarSortMode(value: unknown): SidebarOrderPreferences["channelSortMode"] {
  return value === "recent" || value === "az" || value === "manual" ? value : "manual";
}

/**
 * Central primitive for every "switch current server" path.
 * Increments serverEpoch, resets all server-scoped slices atomically,
 * triggers cross-store resets, and fires initial data loaders.
 * Both setCurrent() and createServer() must funnel through here so no
 * context-switch entry point can bypass the epoch/reset mechanism.
 */
function applyServerSwitch(
  server: Server,
  set: (partial: Partial<ServerState>) => void,
  get: () => ServerState
) {
  localStorage.setItem("slock_last_server_slug", server.slug);
  const nextEpoch = get().serverEpoch + 1;
  set({
    current: server,
    sidebarOrder: DEFAULT_SIDEBAR_ORDER,
    members: [],
    usage: null,
    billing: null,
    serverEpoch: nextEpoch,
  });
  triggerServerReset();
  get().loadMembers();
  get().loadSidebarOrder();
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  current: null,
  members: [],
  loading: true,
  usage: null,
  billing: null,
  sidebarOrder: DEFAULT_SIDEBAR_ORDER,
  serverEpoch: 0,

  loadServers: async () => {
    try {
      const { data } = await api.get("/servers");
      const servers = data as Server[];

      // Clean up legacy localStorage keys
      localStorage.removeItem("slock_server_id");

      set({ servers, loading: false });

      // If a server is already set (e.g. resolved from URL), load its data
      const current = get().current;
      if (current) {
        get().loadMembers();
        get().loadSidebarOrder();
      }
    } catch {
      set({ loading: false });
    }
  },

  setCurrent: (server) => {
    applyServerSwitch(server, set, get);
  },

  clearCurrent: () => {
    set({ current: null, sidebarOrder: DEFAULT_SIDEBAR_ORDER });
  },

  createServer: async (name, slug) => {
    const { data } = await api.post("/servers", { name, slug });
    const server: Server = { ...data, role: "owner" };
    set((state) => ({ servers: [...state.servers, server] }));
    applyServerSwitch(server, set, get);
    return server;
  },

  joinCommunityServer: async (options = {}) => {
    const slug = options.slug ?? "community";
    await api.post("/servers/join-community", { agreementId: options.agreementId, slug });
    // Reload from source of truth rather than reconstructing a full Server
    // shape here — the join endpoint returns only id/name, and the sidebar
    // immediately wants the full record (slug, role, plan, …) that GET
    // /servers already materializes.
    await get().loadServers();
    const joined = get().servers.find((s) => s.slug === slug);
    if (!joined) {
      throw new Error("Joined community server but it's missing from the list");
    }
    applyServerSwitch(joined, set, get);
    return joined;
  },

  updateServerProfile: async (updates) => {
    const { current } = get();
    if (!current) return;
    const { data } = await api.patch(`/servers/${current.id}`, updates);
    const nextCurrent: Server = {
      ...current,
      name: data.name,
      hideHumansFromMembers: data.hideHumansFromMembers,
    };
    set((state) => ({
      current: nextCurrent,
      servers: state.servers.map((s) => (s.id === current.id ? {
        ...s,
        name: data.name,
        hideHumansFromMembers: data.hideHumansFromMembers,
      } : s)),
    }));
  },

  leaveServer: async () => {
    const { current } = get();
    if (!current) return;
    await api.post(`/servers/${current.id}/leave`);
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== current.id),
      current: null,
      members: [],
      usage: null,
      billing: null,
    }));
  },

  deleteServer: async () => {
    const { current } = get();
    if (!current) return;
    await api.delete(`/servers/${current.id}`);
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== current.id),
      current: null,
      members: [],
      usage: null,
      billing: null,
    }));
  },

  loadMembers: async () => {
    const epoch = get().serverEpoch;
    const serverId = get().current?.id;
    if (!serverId) return;
    try {
      const { data } = await api.get(`/servers/${serverId}/members`);
      if (get().serverEpoch !== epoch) return;
      set({ members: data });
    } catch {
      // ignore
    }
  },

  loadSidebarOrder: async () => {
    const epoch = get().serverEpoch;
    const serverId = get().current?.id;
    if (!serverId) return;
    try {
      const { data } = await api.get(`/servers/${serverId}/sidebar-order`);
      if (get().serverEpoch !== epoch) return;
      set({
        sidebarOrder: {
          channelOrder: Array.isArray(data?.channelOrder) ? data.channelOrder : [],
          agentOrder: Array.isArray(data?.agentOrder) ? data.agentOrder : [],
          dmOrder: Array.isArray(data?.dmOrder) ? data.dmOrder : [],
          channelSortMode: normalizeSidebarSortMode(data?.channelSortMode),
          dmSortMode: normalizeSidebarSortMode(data?.dmSortMode),
          pinnedSortMode: normalizeSidebarSortMode(data?.pinnedSortMode),
          pinnedChannelIds: Array.isArray(data?.pinnedChannelIds) ? data.pinnedChannelIds : [],
          pinnedAgentIds: Array.isArray(data?.pinnedAgentIds) ? data.pinnedAgentIds : [],
          pinnedOrder: Array.isArray(data?.pinnedOrder) ? data.pinnedOrder : [],
          hiddenDmIds: Array.isArray(data?.hiddenDmIds) ? data.hiddenDmIds : [],
          channelPanelTabOrder: Array.isArray(data?.channelPanelTabOrder) ? data.channelPanelTabOrder : [],
          agentPanelTabOrder: Array.isArray(data?.agentPanelTabOrder) ? data.agentPanelTabOrder : [],
        },
      });
    } catch {
      if (get().serverEpoch !== epoch) return;
      set({ sidebarOrder: DEFAULT_SIDEBAR_ORDER });
    }
  },

  updateSidebarOrder: async (updates) => {
    const { current, sidebarOrder } = get();
    if (!current) return;
    const serverId = current.id;
    const next: SidebarOrderPreferences = {
      channelOrder: updates.channelOrder ?? sidebarOrder.channelOrder,
      agentOrder: updates.agentOrder ?? sidebarOrder.agentOrder,
      dmOrder: updates.dmOrder ?? sidebarOrder.dmOrder,
      channelSortMode: updates.channelSortMode ?? sidebarOrder.channelSortMode,
      dmSortMode: updates.dmSortMode ?? sidebarOrder.dmSortMode,
      pinnedSortMode: updates.pinnedSortMode ?? sidebarOrder.pinnedSortMode,
      pinnedChannelIds: updates.pinnedChannelIds ?? sidebarOrder.pinnedChannelIds,
      pinnedAgentIds: updates.pinnedAgentIds ?? sidebarOrder.pinnedAgentIds,
      pinnedOrder: updates.pinnedOrder ?? sidebarOrder.pinnedOrder,
      hiddenDmIds: updates.hiddenDmIds ?? sidebarOrder.hiddenDmIds,
      channelPanelTabOrder: updates.channelPanelTabOrder ?? sidebarOrder.channelPanelTabOrder,
      agentPanelTabOrder: updates.agentPanelTabOrder ?? sidebarOrder.agentPanelTabOrder,
    };
    set({ sidebarOrder: next });
    try {
      await api.patch(`/servers/${serverId}/sidebar-order`, updates);
    } catch {
      if (get().current?.id === serverId) {
        set({ sidebarOrder });
      }
    }
  },

  updateMemberRole: async (userId, role) => {
    const { current } = get();
    if (!current) return;
    await api.patch(`/servers/${current.id}/members/${userId}`, { role });
    set((state) => ({
      members: state.members.map((member) =>
        member.userId === userId ? { ...member, role } : member
      ),
    }));
  },

  removeMember: async (userId) => {
    const { current } = get();
    if (!current) return;
    await api.delete(`/servers/${current.id}/members/${userId}`);
    set((state) => ({
      members: state.members.filter((member) => member.userId !== userId),
    }));
  },

  loadUsage: async () => {
    const epoch = get().serverEpoch;
    const serverId = get().current?.id;
    if (!serverId) return;
    try {
      const { data } = await api.get(`/servers/${serverId}/usage`);
      if (get().serverEpoch !== epoch) return;
      set({ usage: data });
    } catch {
      // ignore
    }
  },

  loadBilling: async () => {
    const epoch = get().serverEpoch;
    if (!get().current) return;
    try {
      const { data } = await api.get("/billing/subscription");
      if (get().serverEpoch !== epoch) return;
      set({ billing: data });
    } catch {
      // ignore
    }
  },

}));
