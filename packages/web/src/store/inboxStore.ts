import { create } from "zustand";
import api from "../api/client";
import { registerServerReset } from "./serverResetRegistry";
import { useMessageStore } from "./messageStore";
import { useThreadStore } from "./threadStore";

/**
 * Inbox filter modes.
 *
 * - `all` — every active inbox item visible to the user, read or unread.
 * - `unread` — inbox items whose unread range is non-empty.
 * - `mentions` — inbox items where someone has @-mentioned the user,
 *   regardless of read state. Source of truth is `message_mentions` +
 *   read cursor on the server (already computed into `hasMention` on
 *   each item, see `#proj-runtime:e7ba4a60` / task #157). Backend filter
 *   contract: `/api/channels/inbox?filter=mentions` returns rows with
 *   `hasMention=true AND NOT done` (no `unreadCount > 0` constraint —
 *   we want users to find historical mentions, not just unread ones).
 *   Client never re-scans message bodies. Backend support is tracked in
 *   #proj-uiux task #188.
 */
export type InboxFilter = "all" | "unread" | "mentions";

export type InboxItem =
  | {
      kind: "channel" | "dm";
      channelId: string;
      channelName: string;
      channelType: "channel" | "private" | "joint" | "dm";
      lastMessageId: string;
      firstUnreadMessageId: string | null;
      lastMessageAt: string;
      lastMessagePreview: string;
      lastMessageSenderType: "user" | "agent" | "system";
      lastMessageSenderId: string;
      lastMessageSenderName: string | null;
      unreadCount: number;
      hasMention: boolean;
    }
  | {
      kind: "thread";
      threadChannelId: string;
      parentMessageId: string;
      parentChannelId: string;
      parentChannelName: string;
      parentChannelType: "channel" | "private" | "joint" | "dm";
      parentMessagePreview: string;
      parentMessageSenderType: "user" | "agent";
      parentMessageSenderId: string;
      latestActivityPreview: string;
      latestActivitySenderType: "user" | "agent" | "system";
      latestActivitySenderId: string;
      latestActivityMessageId: string;
      firstUnreadMessageId: string | null;
      replyCount: number;
      lastActivityAt: string;
      lastReplyAt: string | null;
      unreadCount: number;
      hasMention: boolean;
      taskNumber: number | null;
      taskStatus: string | null;
      taskClaimedByName: string | null;
    };

interface InboxState {
  items: InboxItem[];
  filter: InboxFilter;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  totalUnreadCount: number;
  scrollTop: number;
  focusedItemKey: string | null;
  setFilter: (filter: InboxFilter) => void;
  setScrollTop: (scrollTop: number) => void;
  setFocusedItemKey: (key: string | null) => void;
  loadInbox: (opts?: { reset?: boolean }) => Promise<void>;
  refreshInbox: () => Promise<void>;
  markRead: (item: InboxItem) => Promise<void>;
  markAllRead: () => Promise<void>;
  markDone: (item: InboxItem) => Promise<void>;
  removeItem: (item: InboxItem) => void;
}

const PAGE_SIZE = 30;
let inboxLoadRequestSeq = 0;
let activeInboxLoadRequestId = 0;

export function getInboxItemKey(item: InboxItem): string {
  return item.kind === "thread" ? `thread:${item.threadChannelId}` : `${item.kind}:${item.channelId}`;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  items: [],
  filter: "all",
  loading: false,
  loadingMore: false,
  hasMore: true,
  totalCount: 0,
  totalUnreadCount: 0,
  scrollTop: 0,
  focusedItemKey: null,

  setFilter: (filter) => {
    if (get().filter === filter) return;
    set({ filter, items: [], hasMore: true, totalCount: 0, totalUnreadCount: 0, scrollTop: 0 });
    void get().loadInbox({ reset: true });
  },

  setScrollTop: (scrollTop) => set({ scrollTop }),
  setFocusedItemKey: (key) => set({ focusedItemKey: key }),

  loadInbox: async (opts = {}) => {
    const reset = opts.reset ?? false;
    const state = get();
    const requestFilter = state.filter;
    if (!reset && (state.loading || state.loadingMore)) return;
    if (!reset && !state.hasMore) return;

    const requestId = ++inboxLoadRequestSeq;
    activeInboxLoadRequestId = requestId;
    set(reset ? { loading: true, loadingMore: false } : { loadingMore: true });
    try {
      const { data } = await api.get("/channels/inbox", {
        params: {
          filter: requestFilter,
          limit: PAGE_SIZE,
          offset: reset ? 0 : state.items.length,
        },
      });
      const nextItems = (data.items ?? []) as InboxItem[];
      set((current) => {
        if (requestId !== activeInboxLoadRequestId || current.filter !== requestFilter) {
          return {};
        }
        const merged = reset ? nextItems : [...current.items, ...nextItems];
        const seen = new Set<string>();
        return {
          items: merged.filter((item) => {
            const key = getInboxItemKey(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }),
          hasMore: Boolean(data.hasMore),
          totalCount: Number(data.totalCount ?? merged.length),
          totalUnreadCount: Number(data.totalUnreadCount ?? merged.reduce((sum, item) => sum + item.unreadCount, 0)),
          loading: false,
          loadingMore: false,
        };
      });
    } catch (err) {
      console.error("Failed to load inbox:", err);
      if (requestId === activeInboxLoadRequestId && get().filter === requestFilter) {
        set({ loading: false, loadingMore: false });
      }
    }
  },

  refreshInbox: async () => {
    await get().loadInbox({ reset: true });
  },

  markRead: async (item) => {
    const channelId = item.kind === "thread" ? item.threadChannelId : item.channelId;
    const unreadCount = item.unreadCount;
    if (unreadCount <= 0) return;

    set((state) => ({
      items: state.filter === "unread"
        ? state.items.filter((existing) => getInboxItemKey(existing) !== getInboxItemKey(item))
        : state.items.map((existing) => {
          if (getInboxItemKey(existing) !== getInboxItemKey(item)) return existing;
          return { ...existing, unreadCount: 0, firstUnreadMessageId: null, hasMention: false } as InboxItem;
        }),
      totalCount: state.filter === "unread" ? Math.max(0, state.totalCount - 1) : state.totalCount,
      totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadCount),
    }));

    if (item.kind === "thread") {
      useThreadStore.getState().clearThreadUnread(item.threadChannelId);
    }
    useMessageStore.getState().clearUnread(channelId);

    try {
      await api.post(`/channels/${channelId}/read-all`);
    } catch (err) {
      console.error("Failed to mark inbox item as read:", err);
      await get().refreshInbox();
    }
  },

  markAllRead: async () => {
    if (get().totalUnreadCount <= 0) return;

    set((state) => ({
      items: state.filter === "unread"
        ? []
        : state.items.map((item) => ({ ...item, unreadCount: 0, firstUnreadMessageId: null, hasMention: false } as InboxItem)),
      totalCount: state.filter === "unread" ? 0 : state.totalCount,
      totalUnreadCount: 0,
      focusedItemKey: null,
    }));

    try {
      await api.post("/channels/inbox/read-all");
      await Promise.all([
        useMessageStore.getState().loadUnreadCounts(),
        useThreadStore.getState().loadFollowedThreads(),
      ]);
      await get().refreshInbox();
    } catch (err) {
      console.error("Failed to mark all inbox items as read:", err);
      await get().refreshInbox();
      await useMessageStore.getState().loadUnreadCounts();
    }
  },

  markDone: async (item) => {
    const channelId = item.kind === "thread" ? item.threadChannelId : item.channelId;

    // Activity is a high-frequency triage surface: the row should disappear
    // as soon as the user clicks the checkmark, then reconcile if persistence
    // fails.
    get().removeItem(item);
    useMessageStore.getState().clearUnread(channelId);

    if (item.kind === "thread") {
      try {
        await api.post("/channels/threads/done", { threadChannelId: item.threadChannelId });
        // Keep the followed-thread unread badge server-gated. If the done
        // request fails, refresh below restores the Activity row without a
        // transient read/unread flicker in the thread list.
        useThreadStore.getState().clearThreadUnread(item.threadChannelId);
      } catch (err) {
        console.error("Failed to mark inbox thread as done:", err);
        await get().refreshInbox();
        await Promise.all([
          useMessageStore.getState().loadUnreadCounts(),
          useThreadStore.getState().loadFollowedThreads(),
        ]);
      }
    } else {
      try {
        await api.post("/channels/inbox/done", { channelId: item.channelId });
      } catch (err) {
        console.error("Failed to mark inbox item as done:", err);
        await get().refreshInbox();
        await useMessageStore.getState().loadUnreadCounts();
      }
    }
  },

  removeItem: (item) => {
    const key = getInboxItemKey(item);
    set((state) => ({
      items: state.items.filter((existing) => getInboxItemKey(existing) !== key),
      totalCount: Math.max(0, state.totalCount - 1),
      totalUnreadCount: Math.max(0, state.totalUnreadCount - item.unreadCount),
    }));
  },
}));

registerServerReset(() =>
  useInboxStore.setState({
    items: [],
    filter: "all",
    loading: false,
    loadingMore: false,
    hasMore: true,
    totalCount: 0,
    totalUnreadCount: 0,
    scrollTop: 0,
    focusedItemKey: null,
  })
);
