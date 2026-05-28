import { create } from "zustand";
import api from "../api/client";
import { useServerStore } from "./serverStore";
import { registerServerReset } from "./serverResetRegistry";

export interface ThreadSummary {
  threadChannelId: string;
  replyCount: number;
  lastReplyAt: string | null;
  participantIds: string[];
  unreadCount: number;
  firstUnreadMessageId: string | null;
}

export interface FollowedThread {
  threadChannelId: string;
  parentMessageId: string;
  parentChannelId: string;
  parentChannelName: string;
  parentChannelType: string;
  parentMessagePreview: string;
  parentMessageSenderType: string;
  parentMessageSenderId: string;
  replyCount: number;
  lastReplyAt: string | null;
  unreadCount: number;
  taskNumber: number | null;
  taskStatus: string | null;
  taskClaimedByName: string | null;
}

interface ThreadState {
  /** Parent message ID of the currently open thread */
  openParentMessageId: string | null;
  /** Thread channel ID of the currently open thread */
  openThreadChannelId: string | null;
  /** Parent channel ID (the channel where the parent message lives) */
  openParentChannelId: string | null;
  /** Specific reply to focus/highlight when opening a thread from search */
  focusedMessageId: string | null;
  /** Timestamp when the thread was last opened, used to decide view-stack ordering */
  openedAt: number;
  /** Thread summaries keyed by parent message ID */
  summaries: Record<string, ThreadSummary>;
  /** Threads the user participates in */
  followedThreads: FollowedThread[];
  /**
   * One-shot focus signal for the Threads inbox surface — set by the Sidebar
   * dblclick handler so the inbox can scroll the matching row to the top and
   * highlight it without auto-opening the right thread panel.
   */
  focusedThreadChannelId: string | null;
  /** Set or clear the focused thread channel id (consumed by ThreadsInbox). */
  setFocusedThreadChannelId: (id: string | null) => void;
  /**
   * Resolution failure for the currently-open thread permalink. `openThread`
   * sets the parent anchor optimistically *before* its `POST /threads` call,
   * so a failed resolve (e.g. the permalink was opened while the parent
   * channel was still private / mid private→public conversion, or any
   * transient error) would otherwise leave `openThreadChannelId === null`
   * forever with no retry — ThreadPanel's `!threadChannelId` branch renders
   * an unbounded "Loading…" shell. Tracking the failed anchor lets the panel
   * surface an actionable error + Retry instead.
   *
   * Invariant: a `?thread=` permalink must converge to a usable thread view
   * OR an actionable error — never an unbounded spinner. Originating bug:
   * #engineering task #417 (private→public channel thread permalink hang).
   */
  openThreadError: { parentChannelId: string; parentMessageId: string } | null;
  /** Open a thread panel for a message */
  openThread: (parentChannelId: string, parentMessageId: string, focusedMessageId?: string | null) => Promise<void>;
  /**
   * Re-run resolution for the currently-open thread against the channel's
   * *current* accessibility. Used by ThreadPanel's Retry affordance after an
   * `openThread` failure (see `openThreadError`).
   */
  retryOpenThread: () => Promise<void>;
  /** Close the thread panel */
  closeThread: () => void;
  /** Clear focused reply once the highlight animation completes */
  clearFocusedMessage: () => void;
  /** Load thread summaries for a channel */
  loadSummaries: (channelId: string) => Promise<void>;
  /** Update a single thread summary (from socket event) */
  updateSummary: (parentMessageId: string, summary: ThreadSummary) => void;
  /** Load followed threads for the current server */
  loadFollowedThreads: () => Promise<void>;
  /** Update a followed thread from socket event */
  updateFollowedThread: (threadChannelId: string, updates: Partial<Pick<FollowedThread, "replyCount" | "lastReplyAt" | "unreadCount">>) => void;
  /** Clear unread count for a thread */
  clearThreadUnread: (threadChannelId: string) => void;
  /** Follow a thread manually */
  followThread: (parentMessageId: string) => Promise<void>;
  /** Unfollow a thread */
  unfollowThread: (threadChannelId: string) => Promise<void>;
  /** Mark a thread as done (hide from active list) */
  markThreadDone: (threadChannelId: string) => Promise<void>;
  /** Un-done a thread (restore to active list) */
  undoneThread: (threadChannelId: string) => Promise<void>;
}

export const useThreadStore = create<ThreadState>((set) => ({
  openParentMessageId: null,
  openThreadChannelId: null,
  openParentChannelId: null,
  openThreadError: null,
  focusedMessageId: null,
  openedAt: 0,
  summaries: {},
  followedThreads: [],
  focusedThreadChannelId: null,

  setFocusedThreadChannelId: (id) => set({ focusedThreadChannelId: id }),

  openThread: async (parentChannelId, parentMessageId, focusedMessageId = null) => {
    // Look up threadChannelId from existing data so we can open the panel immediately
    const state = useThreadStore.getState();
    const knownThreadChannelId =
      state.summaries[parentMessageId]?.threadChannelId ??
      state.followedThreads.find((t) => t.parentMessageId === parentMessageId)?.threadChannelId ??
      null;

    // Set panel-open state immediately — don't wait for API. Clear any prior
    // resolution error so a retry/new-open starts from a clean state.
    set({
      openParentMessageId: parentMessageId,
      openThreadChannelId: knownThreadChannelId,
      openParentChannelId: parentChannelId,
      openThreadError: null,
      focusedMessageId,
      openedAt: Date.now(),
    });
    try {
      // Opening a thread must be view-only (no auto-follow), but the panel still
      // needs a concrete threadChannelId so the user can send the first reply.
      // The POST create-or-get path is safe here because the backend contract no
      // longer writes thread_follows rows on create without a reply.
      const { data } = await api.post(`/channels/${parentChannelId}/threads`, {
        parentMessageId,
      });
      if (data?.threadChannelId) {
        set((prev) => ({
          ...(prev.openParentMessageId === parentMessageId
            ? { openThreadChannelId: data.threadChannelId, openThreadError: null }
            : {}),
          summaries: {
            ...prev.summaries,
            [parentMessageId]: {
              threadChannelId: data.threadChannelId,
              replyCount: data.replyCount ?? 0,
              lastReplyAt: data.lastReplyAt ?? null,
              participantIds: data.participantIds ?? [],
              unreadCount: data.unreadCount ?? 0,
              firstUnreadMessageId: data.firstUnreadMessageId ?? null,
            },
          },
        }));
      }
    } catch (err: unknown) {
      console.error("Failed to open thread:", err);
      // Only flag an error when we have no usable thread channel id to fall
      // back on — otherwise the panel is still functional. Guard on the
      // anchor still matching so a stale failed request can't clobber a
      // newer open.
      set((prev) =>
        prev.openParentMessageId === parentMessageId && !prev.openThreadChannelId
          ? { openThreadError: { parentChannelId, parentMessageId } }
          : {},
      );
    }
  },

  retryOpenThread: async () => {
    const { openParentChannelId, openParentMessageId, focusedMessageId } =
      useThreadStore.getState();
    if (!openParentChannelId || !openParentMessageId) return;
    await useThreadStore
      .getState()
      .openThread(openParentChannelId, openParentMessageId, focusedMessageId);
  },

  closeThread: () =>
    set({
      openParentMessageId: null,
      openThreadChannelId: null,
      openParentChannelId: null,
      openThreadError: null,
      focusedMessageId: null,
    }),

  clearFocusedMessage: () => set({ focusedMessageId: null }),

  loadSummaries: async (channelId) => {
    try {
      const { data } = await api.get(`/channels/${channelId}/threads`);
      set((state) => ({
        summaries: { ...state.summaries, ...data },
      }));
    } catch {
      // ignore
    }
  },

  updateSummary: (parentMessageId, summary) =>
    set((state) => {
      // When a summary arrives for the currently-open parent message and we
      // don't yet know its threadChannelId (lazy-opened empty panel), adopt
      // the id so the load/subscribe effect in ThreadPanel can fire.
      const adoptThreadId =
        state.openParentMessageId === parentMessageId &&
        !state.openThreadChannelId &&
        summary.threadChannelId;
      return {
        summaries: {
          ...state.summaries,
          [parentMessageId]: summary,
        },
        ...(adoptThreadId ? { openThreadChannelId: summary.threadChannelId } : {}),
      };
    }),

  loadFollowedThreads: async () => {
    const epoch = useServerStore.getState().serverEpoch;
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    try {
      const { data } = await api.get("/channels/threads/followed");
      if (useServerStore.getState().serverEpoch !== epoch) return;
      set({ followedThreads: data.threads });
    } catch {
      // ignore
    }
  },

  updateFollowedThread: (threadChannelId, updates) =>
    set((state) => ({
      followedThreads: state.followedThreads.map((t) =>
        t.threadChannelId === threadChannelId ? { ...t, ...updates } : t,
      ).sort((a, b) => {
        if (!a.lastReplyAt && !b.lastReplyAt) return 0;
        if (!a.lastReplyAt) return 1;
        if (!b.lastReplyAt) return -1;
        return new Date(b.lastReplyAt).getTime() - new Date(a.lastReplyAt).getTime();
      }),
    })),

  clearThreadUnread: (threadChannelId) => {
    set((state) => ({
      followedThreads: state.followedThreads.map((t) =>
        t.threadChannelId === threadChannelId ? { ...t, unreadCount: 0 } : t,
      ),
    }));
    // Persist to backend so it survives page refresh
    api.post(`/channels/${threadChannelId}/read-all`).catch(() => {});
  },

  followThread: async (parentMessageId) => {
    try {
      await api.post("/channels/threads/follow", { parentMessageId });
      // Reload to get the full thread data
      const { data } = await api.get("/channels/threads/followed");
      set({ followedThreads: data.threads });
    } catch (err) {
      console.error("Failed to follow thread:", err);
    }
  },

  unfollowThread: async (threadChannelId) => {
    try {
      await api.post("/channels/threads/unfollow", { threadChannelId });
      set((state) => ({
        followedThreads: state.followedThreads.filter((t) => t.threadChannelId !== threadChannelId),
      }));
    } catch (err) {
      console.error("Failed to unfollow thread:", err);
    }
  },

  markThreadDone: async (threadChannelId) => {
    // Optimistic: remove from list immediately
    set((state) => ({
      followedThreads: state.followedThreads.filter((t) => t.threadChannelId !== threadChannelId),
    }));
    try {
      await api.post("/channels/threads/done", { threadChannelId });
    } catch (err) {
      console.error("Failed to mark thread as done:", err);
      // Reload on failure to restore correct state
      const { data } = await api.get("/channels/threads/followed");
      set({ followedThreads: data.threads });
    }
  },

  undoneThread: async (threadChannelId) => {
    try {
      await api.post("/channels/threads/undone", { threadChannelId });
      // Reload to get the full thread data
      const { data } = await api.get("/channels/threads/followed");
      set({ followedThreads: data.threads });
    } catch (err) {
      console.error("Failed to undone thread:", err);
    }
  },
}));

// Reset all server-scoped state when the user switches servers.
registerServerReset(() =>
  useThreadStore.setState({
    openParentMessageId: null,
    openThreadChannelId: null,
    openParentChannelId: null,
    focusedMessageId: null,
    summaries: {},
    followedThreads: [],
    focusedThreadChannelId: null,
  })
);
