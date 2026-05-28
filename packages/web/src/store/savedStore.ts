import { create } from "zustand";
import api from "../api/client";
import { registerServerReset } from "./serverResetRegistry";

const PAGE_SIZE = 20;

export interface SavedEntry {
  messageId: string;
  channelId: string;
  channelName: string;
  channelType: string;
  content: string;
  senderType: string;
  senderId: string;
  senderName: string | null;
  createdAt: string;
  savedAt: string;
  parentChannelId: string | null;
  parentChannelName: string | null;
  parentChannelType: string | null;
  parentMessageId: string | null;
}

interface SavedState {
  saved: SavedEntry[];
  /** Set of saved message IDs for quick lookup */
  savedIds: Set<string>;
  loading: boolean;
  hasMore: boolean;
  loadSaved: () => Promise<void>;
  loadMore: () => Promise<void>;
  saveMessage: (messageId: string) => Promise<void>;
  unsaveMessage: (messageId: string) => Promise<void>;
  isSaved: (messageId: string) => boolean;
  /** Check saved status for a batch of message IDs (used when loading messages) */
  checkSaved: (messageIds: string[]) => Promise<void>;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  saved: [],
  savedIds: new Set(),
  loading: false,
  hasMore: false,

  loadSaved: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/channels/saved", { params: { limit: PAGE_SIZE, offset: 0 } });
      const saved = data.saved as SavedEntry[];
      set({
        saved,
        savedIds: new Set(saved.map((s) => s.messageId)),
        hasMore: !!data.hasMore,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to load saved messages:", err);
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const { saved, loading, hasMore } = get();
    if (loading || !hasMore) return;
    set({ loading: true });
    try {
      const { data } = await api.get("/channels/saved", { params: { limit: PAGE_SIZE, offset: saved.length } });
      const more = data.saved as SavedEntry[];
      set((state) => {
        const merged = [...state.saved, ...more];
        const ids = new Set(state.savedIds);
        for (const s of more) ids.add(s.messageId);
        return { saved: merged, savedIds: ids, hasMore: !!data.hasMore, loading: false };
      });
    } catch (err) {
      console.error("Failed to load more saved messages:", err);
      set({ loading: false });
    }
  },

  saveMessage: async (messageId: string) => {
    // Optimistic update
    set((state) => ({
      savedIds: new Set([...state.savedIds, messageId]),
    }));
    try {
      await api.post("/channels/saved", { messageId });
      // Reload full list to get metadata
      get().loadSaved();
    } catch (err) {
      console.error("Failed to save message:", err);
      // Revert
      set((state) => {
        const next = new Set(state.savedIds);
        next.delete(messageId);
        return { savedIds: next };
      });
    }
  },

  unsaveMessage: async (messageId: string) => {
    // Optimistic update
    set((state) => {
      const next = new Set(state.savedIds);
      next.delete(messageId);
      return {
        savedIds: next,
        saved: state.saved.filter((s) => s.messageId !== messageId),
      };
    });
    try {
      await api.delete(`/channels/saved/${messageId}`);
    } catch (err) {
      console.error("Failed to unsave message:", err);
      // Revert by reloading
      get().loadSaved();
    }
  },

  isSaved: (messageId: string) => {
    return get().savedIds.has(messageId);
  },

  checkSaved: async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    try {
      const { data } = await api.post("/channels/saved/check", { messageIds });
      const ids = data.savedIds as string[];
      set((state) => {
        const next = new Set(state.savedIds);
        for (const id of ids) next.add(id);
        return { savedIds: next };
      });
    } catch (err) {
      console.error("Failed to check saved messages:", err);
    }
  },
}));

// Reset on server switch
registerServerReset(() =>
  useSavedStore.setState({ saved: [], savedIds: new Set(), loading: false, hasMore: false })
);
