import { create } from "zustand";

// In-memory record of notifications the user has dismissed via the ✕ on a single
// row in the notification center. Keys are state-fingerprints, not notification ids:
// `useSystemNotifications` rebuilds the key from the current world (which machines
// are offline, what the excess-agent count is) so the dismissal is auto-
// invalidated whenever that fingerprint changes ("直到状态又发生变化", per
// stdrc 2026-05-02 #proj-uiux:f87f6eb9 msg=308efc48).
//
// We deliberately keep this store ephemeral (no persistence). A reload is the
// natural cue for the user to re-evaluate — also per stdrc's 2026-05-02
// review preference. If we later want cross-tab persistence, point this at
// a per-server `localStorage` key.

interface DismissedNotificationState {
  dismissedKeys: Set<string>;
  dismiss: (key: string) => void;
  /** Clear all dismissals — used on server switch and logout. */
  reset: () => void;
}

export const useDismissedNotificationStore = create<DismissedNotificationState>((set) => ({
  dismissedKeys: new Set(),
  dismiss: (key) =>
    set((s) => {
      if (s.dismissedKeys.has(key)) return s;
      const next = new Set(s.dismissedKeys);
      next.add(key);
      return { dismissedKeys: next };
    }),
  reset: () => set({ dismissedKeys: new Set() }),
}));

/**
 * Selector: true when this fingerprint has been dismissed for the current
 * session. Cheap pure read against the Set.
 */
export function selectIsDismissed(key: string): (state: DismissedNotificationState) => boolean {
  return (state) => state.dismissedKeys.has(key);
}
