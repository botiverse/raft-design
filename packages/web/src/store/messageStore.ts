import { create } from "zustand";
import type { ActionCardMetadata } from "@slock-ai/shared";
import api from "../api/client";
import { useServerStore } from "./serverStore";
import { useThreadStore } from "./threadStore";
import { registerServerReset } from "./serverResetRegistry";

export interface MessageAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  thumbnailUrl?: string | null;
  rasterPreviewUrl?: string | null;
  localPreviewUrl?: string | null;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reactorIds: string[];
  reactorNames: string[];
}

export interface MessageMention {
  type: "user" | "agent";
  id: string;
  name: string;
}

export interface Message {
  id: string;
  seq?: number;
  channelId: string;
  senderType: "user" | "agent";
  senderId: string;
  senderName?: string;
  senderDescription?: string | null;
  senderMembershipStatus?: "active" | "removed" | null;
  messageType?: "chat" | "system";
  content: string;
  mentions?: MessageMention[];
  /**
   * Thread ANCHOR id, NOT a "this is a reply" flag. When non-null, this
   * message is the parent of a thread and the value is the `channelId` of
   * the thread channel that hangs off it (server: `messages.thread_id`, set
   * by `channelService.syncParentMessageThreadId`). A reply *inside* a
   * thread is an ordinary message whose `channelId === threadChannelId` and
   * whose own `threadId` is null. Do not gate "thread reply" branches on
   * `threadId` — gate on whether the message's `channelId` resolves to a
   * thread-type channel.
   */
  threadId?: string | null;
  createdAt: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  /**
   * Optional structured metadata. v1 carries operation cards
   * (`actionMetadata.kind === "action-card"`). Renderers branch on the
   * `kind` discriminator.
   */
  actionMetadata?: ActionCardMetadata | { kind: string; [key: string]: unknown } | null;
}

interface ChannelMeta {
  hasMore: boolean;
  hasNewer: boolean;
  historyLimited: boolean;
}

interface CanonicalThreadTarget {
  kind: "thread";
  channelId: string;
  messageId: string;
  threadParentMessageId: string;
  threadChannelId?: string | null;
}

interface MessageState {
  channelMessages: Record<string, Message[]>;
  messages: Message[];
  highlightedMessageId: string | null;
  transientFocusRequest: { channelId: string; messageId: string; nonce: number } | null;
  lastSeq: number;
  currentChannelId: string | null;
  loading: boolean;
  loadingOlder: boolean;
  loadingNewer: boolean;
  loadingGap: boolean;
  hasMore: boolean;
  hasNewer: boolean;
  hasGap: boolean;
  contextLoadError: string | null;
  unreadCounts: Record<string, number>;
  drafts: Record<string, string>;
  historyLimited: boolean;
  isNearBottom: boolean;
  loadMessages: (channelId: string) => Promise<void>;
  loadOlderMessages: () => Promise<void>;
  loadNewerMessages: () => Promise<void>;
  loadUnreadCounts: () => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  batchAddMessages: (messages: Message[]) => void;
  addOptimisticMessage: (message: Message) => void;
  removeOptimisticMessage: (optimisticId: string, channelId: string) => void;
  sendMessage: (
    channelId: string,
    content: string,
    attachmentIds?: string[],
    asTask?: boolean,
    optimisticId?: string,
    mentions?: MessageMention[],
  ) => Promise<string>;
  loadMessageContext: (channelId: string, messageId: string) => Promise<void>;
  // Silent variant for resuming a remembered scroll position. Loads the same
  // window as `loadMessageContext` but skips the highlight flash + the
  // attendant scroll-to-center side-effect, so the timeline can land at the
  // anchor itself via persistKey memory.
  loadMessageWindowSilent: (channelId: string, messageId: string) => Promise<void>;
  syncGap: (channelId?: string, options?: { sinceSeq?: number }) => Promise<void>;
  setCurrentChannelId: (channelId: string | null) => void;
  setHighlightedMessageId: (messageId: string | null) => void;
  requestTransientFocus: (channelId: string, messageId: string) => void;
  exitContextWindow: (channelId: string) => void;
  clearUnread: (channelId: string) => void;
  markRead: (channelId: string) => Promise<void>;
  markUnread: (channelId: string) => Promise<void>;
  setNearBottom: (val: boolean) => void;
  markCurrentChannelRead: () => void;
  setDraft: (channelId: string, content: string) => void;
  clearDraft: (channelId: string) => void;
}

const DRAFTS_STORAGE_KEY = "slock_drafts";
const MANUAL_UNREAD_SKIP_STORAGE_KEY = "slock_manual_unread_skip";
const PENDING_READ_SEQS_STORAGE_KEY = "slock_pending_read_seqs";
const LOCAL_READ_SUPPRESSION_TTL_MS = 30_000;
const pendingGapMessages = new Map<string, Message[]>();

export interface LocalReadSuppression {
  seq: number;
  expiresAt: number;
}

function loadDraftsFromStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDraftsToStorage(drafts: Record<string, string>) {
  try {
    if (Object.keys(drafts).length === 0) {
      localStorage.removeItem(DRAFTS_STORAGE_KEY);
    } else {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    }
  } catch {
    // ignore quota errors
  }
}

function loadManualUnreadSkips(): Set<string> {
  try {
    const raw = sessionStorage.getItem(MANUAL_UNREAD_SKIP_STORAGE_KEY);
    if (!raw) return new Set();
    const channelIds = JSON.parse(raw);
    return Array.isArray(channelIds) ? new Set(channelIds.filter((id): id is string => typeof id === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function persistManualUnreadSkips(channelIds: Set<string>) {
  try {
    if (channelIds.size === 0) {
      sessionStorage.removeItem(MANUAL_UNREAD_SKIP_STORAGE_KEY);
    } else {
      sessionStorage.setItem(MANUAL_UNREAD_SKIP_STORAGE_KEY, JSON.stringify([...channelIds]));
    }
  } catch {
    // ignore storage errors
  }
}

function loadPendingReadSeqs(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(PENDING_READ_SEQS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const pending: Record<string, number> = {};
    for (const [channelId, seq] of Object.entries(parsed)) {
      if (typeof channelId === "string" && typeof seq === "number" && seq > 0) {
        pending[channelId] = seq;
      }
    }
    return pending;
  } catch {
    return {};
  }
}

function persistPendingReadSeqs(pendingReadSeqs: Record<string, number>) {
  try {
    if (Object.keys(pendingReadSeqs).length === 0) {
      sessionStorage.removeItem(PENDING_READ_SEQS_STORAGE_KEY);
    } else {
      sessionStorage.setItem(PENDING_READ_SEQS_STORAGE_KEY, JSON.stringify(pendingReadSeqs));
    }
  } catch {
    // ignore storage errors
  }
}

/** Sort messages by seq (ascending). Messages without seq fall back to createdAt. */
function sortBySeq(msgs: Message[]): Message[] {
  return msgs.sort((a, b) => (a.seq || 0) - (b.seq || 0));
}

/** Default channel metadata. */
const DEFAULT_META: ChannelMeta = { hasMore: true, hasNewer: false, historyLimited: false };

/** Per-channel metadata (hasMore, historyLimited). Stored outside Zustand to avoid
 *  triggering re-renders when non-current channels' metadata changes. */
const channelMetaMap = new Map<string, ChannelMeta>();

function getChannelMeta(channelId: string): ChannelMeta {
  return channelMetaMap.get(channelId) ?? DEFAULT_META;
}

function getCachedChannelWindowState(
  channelId: string,
  cached: Message[],
  meta: ChannelMeta,
  highlightedMessageId?: string,
) {
  return {
    currentChannelId: channelId,
    messages: cached,
    loading: false,
    loadingOlder: false,
    loadingNewer: false,
    loadingGap: false,
    hasMore: meta.hasMore,
    hasNewer: meta.hasNewer,
    hasGap: false,
    contextLoadError: null,
    historyLimited: meta.historyLimited,
    ...(highlightedMessageId ? { highlightedMessageId } : {}),
  };
}

const manualUnreadSkipChannels = loadManualUnreadSkips();
const pendingReadSeqs = loadPendingReadSeqs();
const pendingReadRequests = new Map<string, Promise<void>>();
const localReadSuppressions = new Map<string, LocalReadSuppression>();

function shouldSkipInitialAutoRead(channelId: string): boolean {
  return manualUnreadSkipChannels.has(channelId);
}

function rememberManualUnread(channelId: string) {
  manualUnreadSkipChannels.add(channelId);
  persistManualUnreadSkips(manualUnreadSkipChannels);
}

function consumeManualUnread(channelId: string) {
  if (!manualUnreadSkipChannels.delete(channelId)) return;
  persistManualUnreadSkips(manualUnreadSkipChannels);
}

function forgetManualUnread(channelId: string) {
  if (!manualUnreadSkipChannels.delete(channelId)) return;
  persistManualUnreadSkips(manualUnreadSkipChannels);
}

function getPendingReadSeq(channelId: string): number {
  return pendingReadSeqs[channelId] ?? 0;
}

function rememberLocalReadSuppression(channelId: string, seq: number, now = Date.now()) {
  if (seq <= 0) return;
  const current = localReadSuppressions.get(channelId);
  // `/channels/unread` is a server snapshot. During reconnect/visibility
  // recovery it can race a just-queued read cursor and reintroduce old unread
  // counts that the user already cleared locally. Keep a short client-side
  // floor so stale snapshots cannot visually undo the local read action.
  localReadSuppressions.set(channelId, {
    seq: Math.max(current?.seq ?? 0, seq),
    expiresAt: Math.max(current?.expiresAt ?? 0, now + LOCAL_READ_SUPPRESSION_TTL_MS),
  });
}

function forgetLocalReadSuppression(channelId: string) {
  localReadSuppressions.delete(channelId);
}

function forgetLocalReadSuppressionIfNewerMessage(channelId: string, seq?: number) {
  if (!seq) return;
  const suppression = localReadSuppressions.get(channelId);
  if (suppression && seq > suppression.seq) {
    localReadSuppressions.delete(channelId);
  }
}

function clearLocalReadSuppressions() {
  localReadSuppressions.clear();
}

/** Filters stale unread snapshots and prunes expired suppressions from `suppressions`. */
export function filterUnreadCountsByLocalReadSuppressions(
  unreadCounts: Record<string, number>,
  suppressions: Map<string, LocalReadSuppression>,
  now = Date.now(),
): Record<string, number> {
  const filtered: Record<string, number> = {};
  for (const [channelId, count] of Object.entries(unreadCounts)) {
    const suppression = suppressions.get(channelId);
    if (!suppression) {
      filtered[channelId] = count;
      continue;
    }
    if (suppression.expiresAt <= now) {
      suppressions.delete(channelId);
      filtered[channelId] = count;
    }
  }
  return filtered;
}

function rememberPendingRead(channelId: string, seq: number) {
  if (seq <= 0) return;
  rememberLocalReadSuppression(channelId, seq);
  const nextSeq = Math.max(getPendingReadSeq(channelId), seq);
  if (nextSeq === getPendingReadSeq(channelId)) return;
  pendingReadSeqs[channelId] = nextSeq;
  persistPendingReadSeqs(pendingReadSeqs);
}

function forgetPendingRead(channelId: string, upToSeq?: number) {
  const currentSeq = getPendingReadSeq(channelId);
  if (currentSeq <= 0) return;
  if (typeof upToSeq === "number" && currentSeq > upToSeq) return;
  delete pendingReadSeqs[channelId];
  persistPendingReadSeqs(pendingReadSeqs);
}

function resetPendingReads() {
  for (const channelId of Object.keys(pendingReadSeqs)) {
    delete pendingReadSeqs[channelId];
  }
  persistPendingReadSeqs(pendingReadSeqs);
  clearLocalReadSuppressions();
}

async function flushPendingRead(channelId: string): Promise<void> {
  const seq = getPendingReadSeq(channelId);
  if (seq <= 0) return;

  const existing = pendingReadRequests.get(channelId);
  if (existing) return existing;

  const request = api.post(`/channels/${channelId}/read`, { seq })
    .then(() => {
      forgetPendingRead(channelId, seq);
    })
    .catch(() => {
      // Keep the pending seq so the next refresh/reconnect can retry.
    })
    .finally(() => {
      pendingReadRequests.delete(channelId);
      if (getPendingReadSeq(channelId) > seq) {
        void flushPendingRead(channelId);
      }
    });

  pendingReadRequests.set(channelId, request);
  return request;
}

async function flushAllPendingReads(): Promise<void> {
  const channelIds = Object.keys(pendingReadSeqs);
  if (channelIds.length === 0) return;
  await Promise.all(channelIds.map((channelId) => flushPendingRead(channelId)));
}

function queueReadSync(channelId: string, seq: number) {
  if (seq <= 0) return;
  rememberPendingRead(channelId, seq);
  void flushPendingRead(channelId);
}

/** Get messages for a channel from the bucket, or empty array. */
function getBucket(channelMessages: Record<string, Message[]>, channelId: string | null): Message[] {
  return channelId ? channelMessages[channelId] ?? [] : [];
}

function getMaxSeq(messages: Message[]): number {
  return messages.reduce((maxSeq, message) => Math.max(maxSeq, message.seq || 0), 0);
}

function isMatchingOptimisticMessage(optimistic: Message, real: Message): boolean {
  if (!optimistic.id.startsWith("optimistic-")) return false;
  if (optimistic.channelId !== real.channelId) return false;
  if (optimistic.senderType !== real.senderType) return false;
  if (optimistic.content !== real.content) return false;

  // The send form can create an optimistic row before the auth profile has
  // populated the current user id. In that race, the optimistic senderId is an
  // empty fallback; still replace it with the persisted message.
  return !optimistic.senderId || optimistic.senderId === real.senderId;
}

function mergeOptimisticAttachmentPreviews(optimistic: Message | undefined, real: Message): Message {
  if (!optimistic?.attachments?.length || !real.attachments?.length) return real;

  let changed = false;
  const attachments = real.attachments.map((attachment, index) => {
    const local = optimistic.attachments?.[index];
    if (
      !local?.localPreviewUrl ||
      local.filename !== attachment.filename ||
      local.mimeType !== attachment.mimeType ||
      local.sizeBytes !== attachment.sizeBytes
    ) {
      return attachment;
    }

    changed = true;
    return {
      ...attachment,
      // Keep the sender-side blob preview through the optimistic -> persisted
      // handoff so image sends do not visually flash/reload as soon as the
      // server ack replaces the local row.
      localPreviewUrl: attachment.localPreviewUrl ?? local.localPreviewUrl,
      width: attachment.width ?? local.width ?? null,
      height: attachment.height ?? local.height ?? null,
    };
  });

  return changed ? { ...real, attachments } : real;
}

function getPendingGapMessages(channelId: string): Message[] {
  return pendingGapMessages.get(channelId) ?? [];
}

function rememberPendingGapMessage(message: Message) {
  if (!message.seq) return;
  const pending = getPendingGapMessages(message.channelId);
  if (pending.some((pendingMessage) => pendingMessage.id === message.id)) return;
  pendingGapMessages.set(message.channelId, sortBySeq([...pending, message]));
}

function forgetPendingGapMessage(channelId: string, messageId: string) {
  const pending = getPendingGapMessages(channelId);
  if (pending.length === 0) return;
  const filtered = pending.filter((message) => message.id !== messageId);
  if (filtered.length === pending.length) return;
  if (filtered.length === 0) {
    pendingGapMessages.delete(channelId);
    return;
  }
  pendingGapMessages.set(channelId, filtered);
}

function clearPendingGapMessages(channelId?: string) {
  if (channelId) {
    pendingGapMessages.delete(channelId);
    return;
  }
  pendingGapMessages.clear();
}

function takeContiguousPendingGapMessages(channelId: string, currentMaxSeq: number, existingIds: Set<string>): Message[] {
  const pending = getPendingGapMessages(channelId);
  if (pending.length === 0) return [];

  let cursor = currentMaxSeq;
  const stitched: Message[] = [];
  const remaining: Message[] = [];

  for (const message of pending) {
    if (existingIds.has(message.id)) {
      cursor = Math.max(cursor, message.seq || 0);
      continue;
    }

    const seq = message.seq || 0;
    if (seq > 0 && seq === cursor + 1) {
      stitched.push(message);
      cursor = seq;
      continue;
    }

    remaining.push(message);
  }

  if (remaining.length === 0) {
    pendingGapMessages.delete(channelId);
  } else {
    pendingGapMessages.set(channelId, remaining);
  }

  return stitched;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  channelMessages: {},
  messages: [],
  highlightedMessageId: null,
  transientFocusRequest: null,
  lastSeq: 0,
  currentChannelId: null,
  loading: false,
  loadingOlder: false,
  loadingNewer: false,
  loadingGap: false,
  hasMore: true,
  hasNewer: false,
  hasGap: false,
  contextLoadError: null,
  unreadCounts: {},
  drafts: loadDraftsFromStorage(),
  historyLimited: false,
  isNearBottom: true,

  loadUnreadCounts: async () => {
    const epoch = useServerStore.getState().serverEpoch;
    const serverId = useServerStore.getState().current?.id;
    if (!serverId) return;
    try {
      await flushAllPendingReads();
      const { data } = await api.get("/channels/unread");
      if (useServerStore.getState().serverEpoch !== epoch) return;
      set({ unreadCounts: filterUnreadCountsByLocalReadSuppressions(data, localReadSuppressions) });
    } catch {
      // ignore
    }
  },

  clearUnread: (channelId) =>
    set((state) => {
      if (!state.unreadCounts[channelId]) return state;
      const { [channelId]: _, ...rest } = state.unreadCounts;
      return { unreadCounts: rest };
    }),

  markRead: async (channelId) => {
    const { data } = await api.post(`/channels/${channelId}/read-all`);
    const seq = Number(data?.seq ?? 0);
    if (seq > 0) {
      rememberLocalReadSuppression(channelId, seq);
    }
    forgetPendingRead(channelId);
    forgetManualUnread(channelId);
    get().clearUnread(channelId);
  },

  markUnread: async (channelId) => {
    forgetPendingRead(channelId);
    forgetLocalReadSuppression(channelId);
    const { data } = await api.post(`/channels/${channelId}/unread`);
    if (get().currentChannelId === channelId && (data?.unreadCount || 0) > 0) {
      rememberManualUnread(channelId);
    } else {
      forgetManualUnread(channelId);
    }
    await get().loadUnreadCounts();
  },

  setDraft: (channelId, content) => {
    set((state) => {
      let newDrafts: Record<string, string>;
      if (!content.trim()) {
        if (!state.drafts[channelId]) return state;
        const { [channelId]: _, ...rest } = state.drafts;
        newDrafts = rest;
      } else {
        newDrafts = { ...state.drafts, [channelId]: content };
      }
      saveDraftsToStorage(newDrafts);
      return { drafts: newDrafts };
    });
  },

  clearDraft: (channelId) => {
    set((state) => {
      if (!state.drafts[channelId]) return state;
      const { [channelId]: _, ...rest } = state.drafts;
      saveDraftsToStorage(rest);
      return { drafts: rest };
    });
  },

  loadMessages: async (channelId) => {
    clearPendingGapMessages(channelId);
    const previousChannelId = get().currentChannelId;
    if (previousChannelId && previousChannelId !== channelId) {
      forgetManualUnread(previousChannelId);
    }

    const skipInitialAutoRead = shouldSkipInitialAutoRead(channelId);
    if (!skipInitialAutoRead) {
      get().clearUnread(channelId);
    }

    // If we have cached messages for this channel, show them immediately
    const cached = get().channelMessages[channelId];
    const meta = getChannelMeta(channelId);
    const canReuseCachedTail = !!cached && cached.length > 0 && !meta.hasNewer;
    if (canReuseCachedTail) {
      set(getCachedChannelWindowState(channelId, cached, meta));
    } else {
      set({
        loading: true,
        loadingOlder: false,
        loadingNewer: false,
        loadingGap: false,
        currentChannelId: channelId,
        historyLimited: false,
        hasMore: true,
        hasNewer: false,
        hasGap: false,
        contextLoadError: null,
      });
    }

    try {
      const limit = 50;
      const { data } = await api.get(`/messages/channel/${channelId}?limit=${limit}`);
      // Guard against stale responses: only apply if this channel is still selected
      if (get().currentChannelId !== channelId) return;
      const msgs: Message[] = data.messages ?? data;
      const historyLimited: boolean = data.historyLimited ?? false;
      const hasMore = msgs.length >= limit;
      const maxSeq = Math.max(...msgs.map((m) => m.seq || 0), 0);

      // Update per-channel metadata
      channelMetaMap.set(channelId, { hasMore, hasNewer: false, historyLimited });

      set((state) => ({
        channelMessages: { ...state.channelMessages, [channelId]: msgs },
        messages: msgs,
        lastSeq: Math.max(state.lastSeq, maxSeq),
        loading: false,
        historyLimited,
        hasMore,
        hasNewer: false,
        hasGap: false,
        contextLoadError: null,
      }));
      // Mark as read server-side (fire and forget)
      if (maxSeq > 0 && !skipInitialAutoRead) {
        queueReadSync(channelId, maxSeq);
      }
      if (skipInitialAutoRead) {
        consumeManualUnread(channelId);
      } else {
        // Clear unread again in case loadUnreadCounts ran between the initial
        // clearUnread and now (race with socket reconnect)
        get().clearUnread(channelId);
      }
    } catch {
      // Only clear loading if this is still the current channel
      if (get().currentChannelId === channelId) {
        set({ loading: false });
      }
    }
  },

  loadOlderMessages: async () => {
    const { currentChannelId, loadingOlder, hasMore, messages } = get();
    if (!currentChannelId || loadingOlder || !hasMore || messages.length === 0) return;

    const minSeq = Math.min(...messages.map((m) => m.seq || Infinity));
    if (!minSeq || minSeq === Infinity) return;

    set({ loadingOlder: true });
    try {
      const limit = 50;
      const { data } = await api.get(
        `/messages/channel/${currentChannelId}?limit=${limit}&before=${minSeq}`
      );
      if (get().currentChannelId !== currentChannelId) return;
      const older: Message[] = data.messages ?? data;
      const historyLimited: boolean = data.historyLimited ?? false;
      const hasMoreResult = older.length >= limit;
      const existingIds = new Set(get().messages.map((m) => m.id));
      const newMsgs = older.filter((m) => !existingIds.has(m.id));

      // Update per-channel metadata
      channelMetaMap.set(currentChannelId, {
        hasMore: hasMoreResult,
        hasNewer: get().hasNewer,
        historyLimited,
      });

      set((state) => {
        const merged = [...newMsgs, ...state.messages];
        return {
          channelMessages: { ...state.channelMessages, [currentChannelId]: merged },
          messages: merged,
          loadingOlder: false,
          hasMore: hasMoreResult,
          historyLimited,
        };
      });
    } catch {
      if (get().currentChannelId === currentChannelId) {
        set({ loadingOlder: false });
      }
    }
  },

  loadNewerMessages: async () => {
    const { currentChannelId, loadingNewer, hasNewer, messages, loading } = get();
    if (!currentChannelId || loadingNewer || !hasNewer || loading || messages.length === 0) return;

    const maxSeq = Math.max(...messages.map((m) => m.seq || 0));
    if (!maxSeq || maxSeq === Infinity) return;

    set({ loadingNewer: true });
    try {
      const limit = 50;
      const { data } = await api.get(
        `/messages/channel/${currentChannelId}?limit=${limit}&after=${maxSeq}`
      );
      if (get().currentChannelId !== currentChannelId) return;
      const newer: Message[] = data.messages ?? data;
      const hasNewerResult = newer.length >= limit;
      const existingIds = new Set(get().messages.map((m) => m.id));
      const newMsgs = newer.filter((m) => !existingIds.has(m.id));

      channelMetaMap.set(currentChannelId, {
        hasMore: get().hasMore,
        hasNewer: hasNewerResult,
        historyLimited: get().historyLimited,
      });

      set((state) => {
        const merged = [...state.messages, ...newMsgs];
        return {
          channelMessages: { ...state.channelMessages, [currentChannelId]: merged },
          messages: merged,
          loadingNewer: false,
          hasNewer: hasNewerResult,
          lastSeq: Math.max(state.lastSeq, ...newMsgs.map((m) => m.seq || 0)),
        };
      });

      const newestSeq = Math.max(...(get().messages.map((m) => m.seq || 0)), 0);
      if (!hasNewerResult && newestSeq > 0 && get().isNearBottom) {
        queueReadSync(currentChannelId, newestSeq);
        get().clearUnread(currentChannelId);
      }
    } catch {
      if (get().currentChannelId === currentChannelId) {
        set({ loadingNewer: false });
      }
    }
  },

  exitContextWindow: (channelId) => {
    clearPendingGapMessages(channelId);
    channelMetaMap.set(channelId, {
      hasMore: get().hasMore,
      hasNewer: false,
      historyLimited: get().historyLimited,
    });
    if (get().currentChannelId !== channelId) return;
    set({
      hasNewer: false,
      hasGap: false,
      loadingNewer: false,
      loadingGap: false,
      highlightedMessageId: null,
      contextLoadError: null,
    });
  },
  addMessage: (message) =>
    set((state) => {
      const newLastSeq = Math.max(state.lastSeq, message.seq || 0);
      const currentMaxSeq = getMaxSeq(state.messages);
      forgetPendingGapMessage(message.channelId, message.id);
      forgetLocalReadSuppressionIfNewerMessage(message.channelId, message.seq);

      // Always store in the channel bucket (even for non-current channels)
      let bucket = state.channelMessages[message.channelId] ?? [];
      // Update existing message if present (e.g. task fields added after convert-to-task)
      const existingIdx = bucket.findIndex((m) => m.id === message.id);
      if (existingIdx >= 0) {
        bucket = bucket.map((m) => m.id === message.id ? { ...m, ...message } : m);
        const newChannelMessages = { ...state.channelMessages, [message.channelId]: bucket };
        return {
          channelMessages: newChannelMessages,
          messages: message.channelId === state.currentChannelId ? bucket : state.messages,
          lastSeq: newLastSeq,
        };
      }
      // Remove any optimistic message from the same sender with same content
      const matchingOptimistic = bucket.find((m) => isMatchingOptimisticMessage(m, message));
      const persistedMessage = mergeOptimisticAttachmentPreviews(matchingOptimistic, message);
      bucket = bucket.filter((m) => !isMatchingOptimisticMessage(m, persistedMessage));
      const updatedBucket = sortBySeq([...bucket, persistedMessage]);
      const newChannelMessages = { ...state.channelMessages, [message.channelId]: updatedBucket };

      // Non-current channel: update bucket + unread count, don't touch `messages`
      if (message.channelId !== state.currentChannelId) {
        const prev = state.unreadCounts[message.channelId] || 0;
        return {
          channelMessages: newChannelMessages,
          lastSeq: newLastSeq,
          unreadCounts: { ...state.unreadCounts, [message.channelId]: prev + 1 },
        };
      }

      const hasSeqGap = Boolean(
        message.seq &&
        currentMaxSeq > 0 &&
        message.seq > currentMaxSeq + 1
      );

      // Current channel: update bucket + messages
      // When viewing a centered context window with newer history still unloaded,
      // keep the loaded segment contiguous instead of appending across the gap.
      if (state.hasNewer && message.seq && currentMaxSeq > 0 && message.seq > currentMaxSeq + 1) {
        const prev = state.unreadCounts[message.channelId] || 0;
        return {
          lastSeq: newLastSeq,
          unreadCounts: { ...state.unreadCounts, [message.channelId]: prev + 1 },
        };
      }

      // Preserve a contiguous loaded window: if socket delivery skips seqs,
      // defer appending until we heal the gap from the current window tail.
      if (!state.hasNewer && (state.hasGap || hasSeqGap)) {
        rememberPendingGapMessage(message);
        if (!state.loadingGap) {
          setTimeout(() => get().syncGap(message.channelId), 0);
        }
        const prev = state.unreadCounts[message.channelId] || 0;
        return {
          lastSeq: newLastSeq,
          hasGap: true,
          unreadCounts: { ...state.unreadCounts, [message.channelId]: prev + 1 },
        };
      }

      // Only mark as read if user is near the real latest bottom, not the
      // bottom of an older centered context slice.
      if (message.seq && state.isNearBottom && !state.hasNewer) {
        queueReadSync(message.channelId, message.seq);
      }

      // If user is scrolled up, or is intentionally viewing an older slice with
      // newer history still unloaded, keep unread state instead of clearing it.
      const unreadUpdate = !state.isNearBottom || state.hasNewer
        ? { unreadCounts: { ...state.unreadCounts, [message.channelId]: (state.unreadCounts[message.channelId] || 0) + 1 } }
        : {};

      return {
        channelMessages: newChannelMessages,
        messages: updatedBucket,
        lastSeq: newLastSeq,
        hasGap: false,
        ...unreadUpdate,
      };
    }),

  // Merge-only update for existing messages (e.g. task field/reaction changes).
  // Does NOT append if message is not cached, does NOT increment unread.
  updateMessage: (message) =>
    set((state) => {
      const mergeIntoRows = (rows: Message[]) => {
        let changed = false;
        const merged = rows.map((m) => {
          if (m.id !== message.id) return m;
          changed = true;
          return { ...m, ...message };
        });
        return { changed, merged };
      };

      const bucket = state.channelMessages[message.channelId];
      const bucketUpdate = bucket ? mergeIntoRows(bucket) : { changed: false, merged: [] as Message[] };
      const visibleUpdate = mergeIntoRows(state.messages);
      if (!bucketUpdate.changed && !visibleUpdate.changed) return state; // Not cached, ignore

      const newChannelMessages = bucketUpdate.changed
        ? { ...state.channelMessages, [message.channelId]: bucketUpdate.merged }
        : state.channelMessages;
      return {
        channelMessages: newChannelMessages,
        messages: visibleUpdate.changed ? visibleUpdate.merged : state.messages,
      };
    }),

  addOptimisticMessage: (message) =>
    set((state) => {
      const bucket = state.channelMessages[message.channelId] ?? [];
      const updatedBucket = [...bucket, message];
      const newChannelMessages = { ...state.channelMessages, [message.channelId]: updatedBucket };
      return {
        channelMessages: newChannelMessages,
        messages: message.channelId === state.currentChannelId ? updatedBucket : state.messages,
      };
    }),

  removeOptimisticMessage: (optimisticId, channelId) =>
    set((state) => {
      const bucket = state.channelMessages[channelId];
      if (!bucket) return state;
      const filtered = bucket.filter((m) => m.id !== optimisticId);
      if (filtered.length === bucket.length) return state;
      const newChannelMessages = { ...state.channelMessages, [channelId]: filtered };
      return {
        channelMessages: newChannelMessages,
        messages: channelId === state.currentChannelId ? filtered : state.messages,
      };
    }),

  // Batch-add messages in a single state update (used by sync:resume).
  // Avoids N re-renders when catching up many missed messages.
  batchAddMessages: (newMsgs: Message[]) =>
    set((state) => {
      if (newMsgs.length === 0) return state;

      // Group incoming messages by channel
      const byChannel = new Map<string, Message[]>();
      for (const m of newMsgs) {
        let arr = byChannel.get(m.channelId);
        if (!arr) { arr = []; byChannel.set(m.channelId, arr); }
        arr.push(m);
      }

      // Merge into channel buckets
      const newChannelMessages = { ...state.channelMessages };
      const unreadUpdates = { ...state.unreadCounts };

      for (const [channelId, msgs] of byChannel) {
        const existing = newChannelMessages[channelId] ?? [];
        const existingIds = new Set(existing.map((m) => m.id));
        const deduped = msgs.filter((m) => !existingIds.has(m.id));
        if (deduped.length > 0) {
          newChannelMessages[channelId] = sortBySeq([...existing, ...deduped]);
        }
        const newestDedupedSeq = getMaxSeq(deduped);
        forgetLocalReadSuppressionIfNewerMessage(channelId, newestDedupedSeq);
        // Update unread for non-current channels
        if (channelId !== state.currentChannelId) {
          unreadUpdates[channelId] = (unreadUpdates[channelId] || 0) + deduped.length;
        }
      }

      const maxSeq = Math.max(...newMsgs.map((m) => m.seq || 0), state.lastSeq);
      return {
        channelMessages: newChannelMessages,
        messages: getBucket(newChannelMessages, state.currentChannelId),
        lastSeq: maxSeq,
        unreadCounts: unreadUpdates,
      };
    }),

  sendMessage: async (channelId, content, attachmentIds, asTask, optimisticId, mentions) => {
    const { data } = await api.post<Message>("/messages", {
      channelId,
      content,
      attachmentIds,
      asTask: asTask || undefined,
      mentions: mentions && mentions.length > 0 ? mentions : undefined,
    });
    const { useChannelStore } = await import("./channelStore");
    useChannelStore.getState().touchChannelActivity(
      channelId,
      typeof data.createdAt === "string" ? data.createdAt : null,
    );
    set((state) => {
      // The socket echo usually replaces the optimistic row before the HTTP
      // response resolves. Keep the exact optimistic id as a second cleanup
      // path for sender-profile races, so the local row cannot stay duplicated.
      let bucket = state.channelMessages[channelId] ?? [];
      const matchingOptimistic = bucket.find((m) => m.id === optimisticId) ?? bucket.find((m) => isMatchingOptimisticMessage(m, data));
      const persistedMessage = mergeOptimisticAttachmentPreviews(matchingOptimistic, data);
      bucket = bucket.filter((m) => m.id !== optimisticId && !isMatchingOptimisticMessage(m, persistedMessage));
      if (bucket.some((m) => m.id === persistedMessage.id)) {
        const newChannelMessages = { ...state.channelMessages, [channelId]: bucket };
        return {
          channelMessages: newChannelMessages,
          messages: channelId === state.currentChannelId ? bucket : state.messages,
          lastSeq: Math.max(state.lastSeq, persistedMessage.seq || 0),
        };
      }
      const updatedBucket = sortBySeq([...bucket, persistedMessage]);
      const newChannelMessages = { ...state.channelMessages, [channelId]: updatedBucket };
      return {
        channelMessages: newChannelMessages,
        messages: channelId === state.currentChannelId ? updatedBucket : state.messages,
        lastSeq: Math.max(state.lastSeq, persistedMessage.seq || 0),
      };
    });
    return data.id;
  },

  loadMessageContext: async (channelId, messageId) => {
    clearPendingGapMessages(channelId);
    const state = get();
    const cached = state.channelMessages[channelId];
    if (cached?.some((message) => message.id === messageId)) {
      const meta = state.currentChannelId === channelId
        ? {
            hasMore: state.hasMore,
            hasNewer: state.hasNewer,
            historyLimited: state.historyLimited,
          }
        : getChannelMeta(channelId);
      set(getCachedChannelWindowState(channelId, cached, meta, messageId));
      return;
    }
    set({
      loading: true,
      loadingOlder: false,
      loadingNewer: false,
      currentChannelId: channelId,
      highlightedMessageId: messageId,
      contextLoadError: null,
    });

    try {
      const { data } = await api.get(`/messages/context/${messageId}`, { params: { channelId } });
      const canonicalTarget = data.canonicalTarget as CanonicalThreadTarget | undefined;
      if (canonicalTarget?.kind === "thread") {
        await useThreadStore.getState().openThread(
          canonicalTarget.channelId,
          canonicalTarget.threadParentMessageId,
          canonicalTarget.messageId,
        );
        if (get().currentChannelId === channelId) {
          await get().loadMessages(channelId);
        }
        return;
      }
      if (get().currentChannelId !== channelId) return;
      const msgs: Message[] = data.messages ?? [];
      const targetMessageId = data.targetMessageId ?? messageId;
      const maxSeq = Math.max(...msgs.map((m) => m.seq || 0), 0);
      channelMetaMap.set(channelId, {
        hasMore: !!data.hasOlder,
        hasNewer: !!data.hasNewer,
        historyLimited: false,
      });

      set((state) => ({
        channelMessages: { ...state.channelMessages, [channelId]: msgs },
        messages: msgs,
        lastSeq: Math.max(state.lastSeq, maxSeq),
        loading: false,
        hasMore: !!data.hasOlder,
        hasNewer: !!data.hasNewer,
        hasGap: false,
        historyLimited: false,
        contextLoadError: null,
        highlightedMessageId: targetMessageId,
      }));
    } catch {
      if (get().currentChannelId === channelId) {
        set({ loading: false, highlightedMessageId: null });
        await get().loadMessages(channelId);
        if (get().currentChannelId === channelId) {
          set({ contextLoadError: "Message not found" });
        }
      }
    }
  },

  loadMessageWindowSilent: async (channelId, messageId) => {
    clearPendingGapMessages(channelId);
    set({
      loading: true,
      loadingOlder: false,
      loadingNewer: false,
      currentChannelId: channelId,
      contextLoadError: null,
    });

    try {
      const { data } = await api.get(`/messages/context/${messageId}`, { params: { channelId } });
      if (get().currentChannelId !== channelId) return;
      const msgs: Message[] = data.messages ?? [];
      const maxSeq = Math.max(...msgs.map((m) => m.seq || 0), 0);
      channelMetaMap.set(channelId, {
        hasMore: !!data.hasOlder,
        hasNewer: !!data.hasNewer,
        historyLimited: false,
      });

      set((state) => ({
        channelMessages: { ...state.channelMessages, [channelId]: msgs },
        messages: msgs,
        lastSeq: Math.max(state.lastSeq, maxSeq),
        loading: false,
        hasMore: !!data.hasOlder,
        hasNewer: !!data.hasNewer,
        hasGap: false,
        historyLimited: false,
        contextLoadError: null,
      }));
    } catch {
      if (get().currentChannelId === channelId) {
        set({ loading: false });
      }
    }
  },

  syncGap: async (channelId, options) => {
    const { currentChannelId, loadingGap, isNearBottom, hasNewer, unreadCounts } = get();
    const targetChannelId = channelId ?? currentChannelId ?? undefined;
    if (loadingGap) return;

    const sinceSeq = options?.sinceSeq ?? (
      targetChannelId
        ? getMaxSeq(get().channelMessages[targetChannelId] ?? [])
        : get().lastSeq
    );
    if (sinceSeq <= 0) return;

    const shouldTrackCurrentGap = Boolean(targetChannelId && currentChannelId === targetChannelId);
    if (shouldTrackCurrentGap) {
      set({ hasGap: true, loadingGap: true });
    }

    try {
      const limit = 200;
      let cursor = sinceSeq;
      const syncedMessages: Message[] = [];

      while (true) {
        const params = new URLSearchParams({
          since_seq: String(cursor),
          limit: String(limit),
        });
        if (targetChannelId) params.set("channel_id", targetChannelId);

        const { data } = await api.get(`/messages/sync?${params}`);
        const page = (data as Message[]) ?? [];
        if (page.length === 0) break;
        syncedMessages.push(...page);
        cursor = Math.max(cursor, getMaxSeq(page));
        if (page.length < limit) break;
      }

      set((state) => {
        // Group synced messages by channel
        const byChannel = new Map<string, Message[]>();
        for (const m of syncedMessages) {
          let arr = byChannel.get(m.channelId);
          if (!arr) { arr = []; byChannel.set(m.channelId, arr); }
          arr.push(m);
        }

        const newChannelMessages = { ...state.channelMessages };
        for (const [chId, msgs] of byChannel) {
          const existing = newChannelMessages[chId] ?? [];
          const existingIds = new Set(existing.map((m) => m.id));
          const deduped = msgs.filter((m) => !existingIds.has(m.id));
          if (deduped.length > 0) {
            newChannelMessages[chId] = sortBySeq([...existing, ...deduped]);
          }
        }

        if (targetChannelId) {
          const existing = newChannelMessages[targetChannelId] ?? [];
          const stitched = takeContiguousPendingGapMessages(
            targetChannelId,
            getMaxSeq(existing),
            new Set(existing.map((message) => message.id))
          );
          if (stitched.length > 0) {
            newChannelMessages[targetChannelId] = sortBySeq([...existing, ...stitched]);
          }
        }

        const maxSeq = Math.max(getMaxSeq(syncedMessages), state.lastSeq);
        const nextState: Partial<MessageState> = {
          channelMessages: newChannelMessages,
          messages: getBucket(newChannelMessages, state.currentChannelId),
          lastSeq: maxSeq,
        };
        if (shouldTrackCurrentGap) {
          nextState.hasGap = targetChannelId ? getPendingGapMessages(targetChannelId).length > 0 : false;
          nextState.loadingGap = false;
        }
        return {
          ...nextState,
        };
      });

      if (shouldTrackCurrentGap && targetChannelId) {
        const updatedMessages = get().channelMessages[targetChannelId] ?? [];
        const newestSeq = getMaxSeq(updatedMessages);
        if (newestSeq > 0 && isNearBottom && !hasNewer) {
          queueReadSync(targetChannelId, newestSeq);
          if (unreadCounts[targetChannelId]) {
            get().clearUnread(targetChannelId);
          }
        }
      }
    } catch {
      if (shouldTrackCurrentGap) {
        set({ loadingGap: false });
      }
      // Ignore sync errors
    }
  },

  setNearBottom: (val) => {
    const prev = get().isNearBottom;
    if (val === prev) return;
    set({ isNearBottom: val });
    // When scrolling back to bottom, mark current channel as read
    if (val && !get().hasNewer) get().markCurrentChannelRead();
  },

  markCurrentChannelRead: () => {
    const { currentChannelId, messages, unreadCounts, hasNewer } = get();
    if (!currentChannelId) return;
    if (hasNewer) return;
    const maxSeq = Math.max(...messages.map((m) => m.seq || 0), 0);
    if (maxSeq > 0) {
      queueReadSync(currentChannelId, maxSeq);
    }
    if (unreadCounts[currentChannelId]) {
      const { [currentChannelId]: _, ...rest } = unreadCounts;
      set({ unreadCounts: rest });
    }
  },

  setCurrentChannelId: (channelId) => set({ currentChannelId: channelId }),
  setHighlightedMessageId: (messageId) => set({ highlightedMessageId: messageId }),
  requestTransientFocus: (channelId, messageId) =>
    set({
      transientFocusRequest: {
        channelId,
        messageId,
        nonce: Date.now(),
      },
    }),
}));

// Reset server-scoped state when the user switches servers.
// channelMessages and drafts are intentionally kept: channelMessages becomes
// unreachable once channels are cleared, and drafts are harmless cross-server.
registerServerReset(() =>
  {
    resetPendingReads();
    clearPendingGapMessages();
    useMessageStore.setState({
      channelMessages: {},
      messages: [],
      highlightedMessageId: null,
      transientFocusRequest: null,
      lastSeq: 0,
      currentChannelId: null,
      loading: false,
      loadingOlder: false,
      loadingNewer: false,
      loadingGap: false,
      hasMore: true,
      hasNewer: false,
      hasGap: false,
      unreadCounts: {},
      historyLimited: false,
      isNearBottom: true,
    });
  }
);
