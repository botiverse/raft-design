import { create } from "zustand";
import type { Announcement } from "@slock-ai/shared";
import api from "../api/client";

interface AnnouncementState {
  pending: Announcement[];
  loaded: boolean;
  load: () => Promise<void>;
  receive: (announcement: Announcement) => void;
  dismiss: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
  pending: [],
  loaded: false,

  load: async () => {
    try {
      const { data } = await api.get("/announcements/active");
      const pending = (data.announcements as Announcement[]) ?? [];
      set({ pending, loaded: true });
    } catch (err) {
      console.error("Failed to load announcements:", err);
      set({ loaded: true });
    }
  },

  receive: (announcement) => {
    const { pending } = get();
    if (pending.some((a) => a.id === announcement.id)) return;
    set({ pending: [...pending, announcement] });
  },

  dismiss: async (id) => {
    set((state) => ({ pending: state.pending.filter((a) => a.id !== id) }));
    try {
      await api.post(`/announcements/${id}/dismiss`);
    } catch (err) {
      console.error("Failed to dismiss announcement:", err);
    }
  },

  reset: () => set({ pending: [], loaded: false }),
}));
