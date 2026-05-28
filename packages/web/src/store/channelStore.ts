import { create } from "zustand";
import api from "../api/client";
import { getSocket } from "../api/socket";
import { useServerStore } from "./serverStore";
import { registerServerReset } from "./serverResetRegistry";

export interface Channel {
  id: string;
  serverId?: string;
  name: string;
  description: string | null;
  type: "channel" | "private" | "joint" | "dm";
  createdAt: string;
  lastMessageAt?: string | null;
  archivedAt?: string | null;
  archivedByUserId?: string | null;
  // Joint-channel metadata. Host projections show a pending/active peer
  // server; participant projections show the host peer.
  jointChannelId?: string | null;
  jointRole?: "host" | "participant" | null;
  jointPeerServerId?: string | null;
  jointPeerServerName?: string | null;
  jointPeerServerSlug?: string | null;
  jointPeerStatus?: "pending" | "active" | null;
  // Channel membership
  joined?: boolean;
  // DM-specific fields — unified peer model (agent or user)
  peerType?: "agent" | "user";
  peerId?: string;
  peerName?: string;
  peerDisplayName?: string | null;
  peerDescription?: string | null;
  peerGravatarHash?: string | null;
  peerAvatarUrl?: string | null;
}

/** Shape returned by the API (type may be missing for legacy data). */
type ApiChannel = Omit<Channel, "type"> & { type?: string };

/** Sort channels: #all always first, preserve backend order for the rest */
function sortChannels(channels: Channel[]): Channel[] {
  const allCh = channels.filter((c) => c.name === "all");
  const rest = channels.filter((c) => c.name !== "all");
  return [...allCh, ...rest];
}

interface ChannelState {
  channels: Channel[];
  dmChannels: Channel[];
  loading: boolean;
  loadChannels: () => Promise<void>;
  loadDMChannels: () => Promise<void>;
  ensureChannel: (channelId: string) => Promise<Channel | null>;
  addOrRefreshDM: (channelId: string) => Promise<void>;
  touchChannelActivity: (channelId: string, lastMessageAt?: string | null) => void;
  createChannel: (name: string, description?: string, opts?: { visibility?: "public" | "private" | "joint"; agentIds?: string[]; userIds?: string[]; targetServerSlug?: string; invitedPeople?: string[] }) => Promise<Channel>;
  updateChannel: (channelId: string, updates: { name?: string; description?: string; visibility?: "public" | "private" }) => Promise<Channel>;
  deleteChannel: (channelId: string) => Promise<void>;
  disconnectJointChannel: (channelId: string) => Promise<void>;
  archiveChannel: (channelId: string) => Promise<Channel>;
  unarchiveChannel: (channelId: string) => Promise<Channel>;
  openDM: (agentId: string) => Promise<Channel>;
  openUserDM: (userId: string) => Promise<Channel>;
  joinChannel: (channelId: string) => Promise<void>;
  leaveChannel: (channelId: string) => Promise<void>;
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: [],
  dmChannels: [],
  loading: true,

  loadChannels: async () => {
    const epoch = useServerStore.getState().serverEpoch;
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    // Never set loading here — it starts as true (store init / server reset)
    // and goes to false after the first successful fetch. This keeps existing
    // data (or a legitimate empty state) visible during refreshes.
    try {
      const { data } = await api.get("/channels", { params: { archived: "include" } });
      if (useServerStore.getState().serverEpoch !== epoch) return;
      // API returns channels without type field for existing data — default to "channel"
      const channels = sortChannels(
        (data as ApiChannel[]).map((c): Channel => ({ ...c, type: (c.type as Channel["type"]) || "channel" }))
      );
      set({ channels, loading: false });
    } catch (err) {
      console.error("Failed to load channels:", err);
      if (useServerStore.getState().serverEpoch !== epoch) return;
      set({ loading: false });
    }
  },

  loadDMChannels: async () => {
    const epoch = useServerStore.getState().serverEpoch;
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    try {
      const { data } = await api.get("/channels/dm");
      if (useServerStore.getState().serverEpoch !== epoch) return;
      const fetched = (data as ApiChannel[]).map((c): Channel => ({ ...c, type: "dm" }));
      set((state) => {
        // Merge: keep locally-added DMs that the server hasn't returned yet
        const fetchedIds = new Set(fetched.map((c) => c.id));
        const localOnly = state.dmChannels.filter((c) => !fetchedIds.has(c.id));
        return { dmChannels: [...fetched, ...localOnly] };
      });
    } catch (err) {
      console.error("Failed to load DM channels:", err);
    }
  },

  ensureChannel: async (channelId) => {
    const existing = get().channels.find((c) => c.id === channelId)
      ?? get().dmChannels.find((c) => c.id === channelId);
    if (existing) return existing;

    const epoch = useServerStore.getState().serverEpoch;
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return null;

    try {
      const { data } = await api.get(`/channels/${channelId}`);
      if (useServerStore.getState().serverEpoch !== epoch) return null;
      const channel = {
        ...data,
        type: ((data as ApiChannel).type as Channel["type"]) || "channel",
      } as Channel;

      set((state) => {
        if (channel.type === "dm") {
          const exists = state.dmChannels.some((c) => c.id === channel.id);
          return {
            dmChannels: exists
              ? state.dmChannels.map((c) => (c.id === channel.id ? channel : c))
              : [...state.dmChannels, channel],
          };
        }

        const exists = state.channels.some((c) => c.id === channel.id);
        return {
          channels: sortChannels(
            exists
              ? state.channels.map((c) => (c.id === channel.id ? channel : c))
              : [...state.channels, channel],
          ),
        };
      });
      return channel;
    } catch (err) {
      console.error("Failed to load channel:", err);
      return null;
    }
  },

  addOrRefreshDM: async (channelId) => {
    const { dmChannels } = useChannelStore.getState();
    const existing = dmChannels.find((c) => c.id === channelId);
    if (existing) {
      // Move to front (most recent message)
      set({ dmChannels: [{ ...existing, lastMessageAt: new Date().toISOString() }, ...dmChannels.filter((c) => c.id !== channelId)] });
      return;
    }
    // New DM — re-fetch the full list (backend returns sorted)
    try {
      const { data } = await api.get("/channels/dm");
      set({ dmChannels: (data as ApiChannel[]).map((c): Channel => ({ ...c, type: "dm" })) });
    } catch (err) {
      console.error("Failed to refresh DM channels:", err);
    }
  },

  touchChannelActivity: (channelId, lastMessageAt) => {
    const nextLastMessageAt = lastMessageAt ?? new Date().toISOString();
    set((state) => ({
      channels: state.channels.map((channel) =>
        channel.id === channelId ? { ...channel, lastMessageAt: nextLastMessageAt } : channel
      ),
      dmChannels: state.dmChannels.map((channel) =>
        channel.id === channelId ? { ...channel, lastMessageAt: nextLastMessageAt } : channel
      ),
    }));
  },

  createChannel: async (name, description, opts) => {
    const { data } = await api.post("/channels", {
      name,
      description,
      visibility: opts?.visibility ?? "public",
      agentIds: opts?.agentIds ?? [],
      userIds: opts?.userIds ?? [],
      targetServerSlug: opts?.targetServerSlug,
      invitedPeople: opts?.invitedPeople ?? [],
    });
    const channel = { ...data, type: ((data as ApiChannel).type as Channel["type"]) || "channel" };
    set((state) => ({
      channels: sortChannels([...state.channels, channel]),
    }));
    // Join the socket room so we receive real-time messages
    getSocket().emit("join:channel", channel.id);
    return channel;
  },

  updateChannel: async (channelId, updates) => {
    const { data } = await api.patch(`/channels/${channelId}`, updates);
    const updated = { ...data, type: ((data as ApiChannel).type as Channel["type"]) || "channel" };
    set((state) => ({
      channels: sortChannels(
        state.channels.map((c) => (c.id === channelId ? { ...c, ...updated } : c))
      ),
    }));
    return updated;
  },

  deleteChannel: async (channelId) => {
    await api.delete(`/channels/${channelId}`);
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== channelId),
      dmChannels: state.dmChannels.filter((c) => c.id !== channelId),
    }));
  },

  disconnectJointChannel: async (channelId) => {
    await api.post(`/channels/${channelId}/disconnect`);
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== channelId),
    }));
  },

  archiveChannel: async (channelId) => {
    const { data } = await api.post(`/channels/${channelId}/archive`);
    const updated = { ...data, type: ((data as ApiChannel).type as Channel["type"]) || "channel" };
    set((state) => ({
      channels: sortChannels(
        state.channels.map((c) => (c.id === channelId ? { ...c, ...updated } : c))
      ),
    }));
    return updated;
  },

  unarchiveChannel: async (channelId) => {
    const { data } = await api.post(`/channels/${channelId}/unarchive`);
    const updated = { ...data, type: ((data as ApiChannel).type as Channel["type"]) || "channel" };
    set((state) => {
      const exists = state.channels.some((c) => c.id === channelId);
      const next = exists
        ? state.channels.map((c) => (c.id === channelId ? { ...c, ...updated } : c))
        : [...state.channels, updated];
      return { channels: sortChannels(next) };
    });
    return updated;
  },

  openDM: async (agentId) => {
    const { data } = await api.post("/channels/dm", { agentId });
    const dmChannel: Channel = { ...data, type: "dm" };

    set((state) => {
      const exists = state.dmChannels.some((c) => c.id === dmChannel.id);
      const updated = exists
        ? state.dmChannels.map((c) => c.id === dmChannel.id ? dmChannel : c)
        : [...state.dmChannels, dmChannel];
      return { dmChannels: (updated) };
    });
    // Join the socket room so we receive real-time messages
    getSocket().emit("join:channel", dmChannel.id);
    return dmChannel;
  },

  openUserDM: async (userId) => {
    const { data } = await api.post("/channels/dm", { userId });
    const dmChannel: Channel = { ...data, type: "dm" };

    set((state) => {
      const exists = state.dmChannels.some((c) => c.id === dmChannel.id);
      const updated = exists
        ? state.dmChannels.map((c) => c.id === dmChannel.id ? dmChannel : c)
        : [...state.dmChannels, dmChannel];
      return { dmChannels: (updated) };
    });
    // Join the socket room so we receive real-time messages
    getSocket().emit("join:channel", dmChannel.id);
    return dmChannel;
  },

  joinChannel: async (channelId) => {
    try {
      await api.post(`/channels/${channelId}/join`);
      set((state) => ({
        channels: state.channels.map((c) =>
          c.id === channelId ? { ...c, joined: true } : c
        ),
      }));
      // Join the socket room so we receive real-time messages
      getSocket().emit("join:channel", channelId);
    } catch (err) {
      console.error("Failed to join channel:", err);
    }
  },

  leaveChannel: async (channelId) => {
    try {
      await api.post(`/channels/${channelId}/leave`);
      set((state) => ({
        channels: state.channels.map((c) =>
          c.id === channelId ? { ...c, joined: false } : c
        ),
      }));
    } catch (err) {
      console.error("Failed to leave channel:", err);
    }
  },
}));

// Reset all server-scoped state when the user switches servers.
registerServerReset(() =>
  useChannelStore.setState({ channels: [], dmChannels: [], loading: true })
);
