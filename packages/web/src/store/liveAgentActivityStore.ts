import { create } from "zustand";
import type { Agent } from "./agentStore";
import {
  applyStatusActivityEvent,
  pruneExpiredLiveAgentActivityItems,
  type LiveAgentActivityItem,
} from "../utils/liveAgentActivity";

export interface LiveAgentActivityEvent {
  agentId: string;
  activity: string;
  detail?: string;
  timestamp?: number;
}

interface LiveAgentActivityState {
  items: LiveAgentActivityItem[];
  recordStatusActivity: (event: LiveAgentActivityEvent, agents: Agent[]) => void;
  clear: () => void;
  pruneExpired: () => void;
}

export const useLiveAgentActivityStore = create<LiveAgentActivityState>((set) => ({
  items: [],
  recordStatusActivity: (event, agents) => {
    set((state) => ({
      items: applyStatusActivityEvent(state.items, event, agents),
    }));
  },
  clear: () => set({ items: [] }),
  pruneExpired: () => {
    set((state) => ({
      items: pruneExpiredLiveAgentActivityItems(state.items),
    }));
  },
}));
