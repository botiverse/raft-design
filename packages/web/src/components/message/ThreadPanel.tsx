import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { X, ArrowDown, ExternalLink, MessageSquare, LogIn } from "lucide-react";
import { useThreadStore, type ThreadSummary } from "../../store/threadStore";
import { useAgentStore } from "../../store/agentStore";
import { useChannelStore } from "../../store/channelStore";
import { useMessageStore } from "../../store/messageStore";
import { useServerStore } from "../../store/serverStore";
import { useAuthStore } from "../../store/authStore";
import { useTaskStore } from "../../store/taskStore";
import { getSocket } from "../../api/socket";
import api from "../../api/client";
import HistoryTopState from "./HistoryTopState";
import MessageItem, { buildMentionMap } from "./MessageItem";
import PanelHeader from "../ui/PanelHeader";
import MessageInput from "./MessageInput";
import EmptyState from "../ui/EmptyState";
import SelectModeToolbar from "./SelectModeToolbar";
import SelectShareLightbox from "./SelectShareLightbox";
import { useSelectionStore } from "../../store/selectionStore";
import { useSelectionShareHandlers } from "./useSelectionShareHandlers";
import MessageTimeline, {
  type MessageTimelineHandle,
  type MessageTimelineSource,
} from "./MessageTimeline";
import type { Message } from "../../store/messageStore";
import type { Task } from "../../store/taskStore";
import { useResizablePanel } from "../../hooks/useResizablePanel";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppNavigate, useMobileBack } from "../../hooks/useAppNavigate";
import { useTranslationBatch } from "../../hooks/useTranslationBatch";
import { useChannelMembers } from "../../hooks/useChannelMembers";
import SystemMessageGroupDisclosure from "./SystemMessageGroupDisclosure";
import { buildSystemMessageRenderStates } from "./systemMessageGrouping";
import { resolveMessageSenderMember } from "../../utils/messageSenderMember";

const EMPTY_MESSAGES: Message[] = [];

function sortThreadMessages(msgs: Message[]): Message[] {
  return [...msgs].sort((a, b) => {
    if (a.seq != null && b.seq != null) return a.seq - b.seq;
    if (a.seq != null) return -1;
    if (b.seq != null) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function sameReactions(
  a: Message["reactions"],
  b: Message["reactions"],
): boolean {
  if (a === b) return true;
  const la = a?.length ?? 0;
  const lb = b?.length ?? 0;
  if (la !== lb) return false;
  if (la === 0) return true;
  for (let i = 0; i < la; i += 1) {
    const left = a![i];
    const right = b![i];
    if (left.emoji !== right.emoji || left.count !== right.count) return false;
    if (left.reactorIds.length !== right.reactorIds.length) return false;
  }
  return true;
}

function sameMessageList(a: Message[], b: Message[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (
      left.id !== right.id ||
      left.seq !== right.seq ||
      left.content !== right.content ||
      left.createdAt !== right.createdAt
    ) {
      return false;
    }
    // Reactions mutate in-place on a stored message when someone toggles an
    // emoji; without this check we'd shallow-equal a reaction-only diff and
    // skip the local `messages` setState, leaving the thread UI stale until
    // refresh. task #290.
    if (!sameReactions(left.reactions, right.reactions)) {
      return false;
    }
  }
  return true;
}

function mergeThreadMessages(existing: Message[], incoming: Message[]): Message[] {
  if (incoming.length === 0) return existing;

  const byId = new Map(existing.map((msg) => [msg.id, msg]));
  for (const msg of incoming) {
    byId.set(msg.id, msg);
  }

  const merged = [...byId.values()];
  const realMessages = merged.filter((msg) => !msg.id.startsWith("optimistic-"));
  const next = realMessages.length === 0
    ? sortThreadMessages(merged)
    : sortThreadMessages(
    merged.filter((msg) =>
      !msg.id.startsWith("optimistic-") ||
      !realMessages.some((real) => real.senderId === msg.senderId && real.content === msg.content)
    )
  );

  return sameMessageList(existing, next) ? existing : next;
}

function onlyThreadMessages(threadChannelId: string, messages: Message[]): Message[] {
  // ThreadPanel can be opened from permalinks whose `msg=` points at a parent
  // channel message. `/messages/context/:id` follows that id's own channel, so
  // defensively keep the reply timeline scoped to the concrete thread channel.
  return messages.filter((msg) => msg.channelId === threadChannelId);
}

export default function ThreadPanel({ presentation = "side" }: { presentation?: "side" | "modal" | "mobile-modal" }) {
  const parentMessageId = useThreadStore((s) => s.openParentMessageId);
  const threadChannelId = useThreadStore((s) => s.openThreadChannelId);
  const parentChannelId = useThreadStore((s) => s.openParentChannelId);
  const focusedMessageId = useThreadStore((s) => s.focusedMessageId);
  const threadSummaries = useThreadStore((s) => s.summaries);
  const followedThreads = useThreadStore((s) => s.followedThreads);
  const closeThread = useThreadStore((s) => s.closeThread);
  const openThreadError = useThreadStore((s) => s.openThreadError);
  const retryOpenThread = useThreadStore((s) => s.retryOpenThread);
  const clearFocusedMessage = useThreadStore((s) => s.clearFocusedMessage);
  const threadBucket = useMessageStore((s) =>
    threadChannelId ? (s.channelMessages[threadChannelId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES
  );
  const parentChannelBucket = useMessageStore((s) =>
    parentChannelId ? (s.channelMessages[parentChannelId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES
  );
  const currentUser = useAuthStore((s) => s.user);

  // Selection / share state. The hook wraps capture / download / clipboard
  // plumbing so ChatPanel and ThreadPanel stay in lock-step. ThreadPanel
  // only renders the toolbar when select mode is anchored at *this* thread
  // root — channel-mode select stays scoped to ChatPanel.
  const selectModeActive = useSelectionStore((s) => s.isActive);
  const selectModeThreadRootId = useSelectionStore((s) => s.threadRootId);
  const threadSelectScopedHere =
    selectModeActive && selectModeThreadRootId !== null && selectModeThreadRootId === parentMessageId;
  // ThreadPanel keeps its replies in local state (NOT messageStore.channelMessages),
  // so we declare `messages` here BEFORE the share-handlers hook can read it.
  // huxijin 2026-05-02 #proj-mobile a8748fc2: select-share in thread was
  // dropping all children because messageStore doesn't bucket replies for
  // the thread channel — ThreadPanel keeps them in local state and now
  // feeds them into useSelectionShareHandlers via the threadReplyMessages opt.
  const [messages, setMessages] = useState<Message[]>([]);
  const [parentMessage, setParentMessage] = useState<Message | null>(null);
  const [parentTask, setParentTask] = useState<Task | null>(null);
  const threadParentMessageRef = useRef<Message | null>(null);
  const selectAll = useSelectionStore((s) => s.selectAll);
  const handleSelectAllInThread = useCallback(() => {
    if (!parentMessageId) return;
    selectAll([parentMessageId, ...messages.map((m) => m.id)]);
  }, [messages, parentMessageId, selectAll]);
  const {
    picCapturing,
    picPreview,
    setPicPreview,
    picError,
    setPicError,
    copiedMd,
    onSavePic,
    onShareX,
    onCopyMd,
  } = useSelectionShareHandlers({ threadReplyMessages: messages, threadParentMessageRef });
  // Closing the thread or the panel unmounting should always exit a thread
  // select that was anchored here, otherwise the toolbar lingers in the
  // ChatPanel below. (ChatPanel only renders the toolbar in channel mode,
  // but other surfaces could observe stale state.)
  useEffect(() => {
    if (!parentMessageId) return;
    const anchorId = parentMessageId;
    return () => {
      const s = useSelectionStore.getState();
      if (s.threadRootId === anchorId) s.exit();
    };
  }, [parentMessageId]);
  // ESC out of thread select.
  useEffect(() => {
    if (!threadSelectScopedHere) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (picPreview) return;
      e.preventDefault();
      useSelectionStore.getState().exit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [threadSelectScopedHere, picPreview]);

  useEffect(() => {
    if (!parentMessageId || threadSelectScopedHere || picPreview) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof Node) || !panelRef.current?.contains(target)) return;
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isEditableTarget) return;
      event.preventDefault();
      closeThread();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeThread, parentMessageId, picPreview, threadSelectScopedHere]);

  const agents = useAgentStore((s) => s.agents);
  const channels = useChannelStore((s) => s.channels);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const joinChannel = useChannelStore((s) => s.joinChannel);
  const members = useServerStore((s) => s.members);
  const mentionScopeChannelId = parentChannelId || threadChannelId || "";
  const { channelAgents: mentionChannelAgents, channelHumans: mentionChannelHumans } = useChannelMembers(mentionScopeChannelId);
  const mobileNavigate = useNavigate();
  const location = useLocation();
  const serverSlug = useServerStore((s) => s.current?.slug);
  const nav = useAppNavigate();
  // Semantic parent of a thread is its parent channel/dm. Fall back to chat
  // root when we don't yet know the parent (loading state).
  const parentRouteKind = parentChannelId
    ? (dmChannels.some((c) => c.id === parentChannelId) ? "dm" : "channel")
    : null;
  const parentChannel = useMemo(
    () => parentChannelId
      ? channels.find((c) => c.id === parentChannelId) || dmChannels.find((c) => c.id === parentChannelId) || null
      : null,
    [channels, dmChannels, parentChannelId],
  );
  // Same tri-state contract as ChatPanel's channel composer: true means the
  // current human can reply, false means show the join CTA, undefined means
  // membership is still hydrating so we should not flash the wrong control.
  const parentJoined: boolean | undefined = parentChannel?.type === "dm" ? true : parentChannel?.joined;
  const parentPath = serverSlug
    ? (parentChannelId && parentRouteKind
        ? `/s/${serverSlug}/${parentRouteKind}/${parentChannelId}`
        : `/s/${serverSlug}`)
    : "/";
  const threadIsOnParentSurface = location.pathname.replace(/\/$/, "") === parentPath.replace(/\/$/, "");
  // Thread permalinks can be opened as overlays on non-parent surfaces such as
  // /tasks?thread=... . In that case mobile back should close the overlay and
  // preserve the underlying route/query, not jump to the parent channel.
  const onMobileBack = useMobileBack(threadIsOnParentSurface ? parentPath : closeThread);
  // When the thread is presented as a centered modal (Tasks page), back
  // always closes the modal, regardless of whether the underlying surface is
  // the thread's parent.
  // In modal / mobile-modal, mobile back always closes the modal (since the
  // X close button is the primary affordance and the underlying surface
  // may not be the thread's semantic parent).
  const mobileBackHandler = presentation === "modal" || presentation === "mobile-modal"
    ? closeThread
    : onMobileBack;

  const [translationWindowIds, setTranslationWindowIds] = useState<string[]>([]);
  const translationMessages = useMemo(
    () => {
      const replyIdSet = new Set(translationWindowIds);
      const visibleReplies = translationWindowIds.length > 0
        ? messages.filter((message) => replyIdSet.has(message.id))
        : [];
      return parentMessage ? [parentMessage, ...visibleReplies] : visibleReplies;
    },
    [messages, parentMessage, translationWindowIds],
  );
  useTranslationBatch(translationMessages);
  // `messages` declared earlier so useSelectionShareHandlers can read it.
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasNewer, setHasNewer] = useState(false);
  const [historyLimited, setHistoryLimited] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const [expandedSystemMessageGroups, setExpandedSystemMessageGroups] = useState<Set<string>>(() => new Set());
  const timelineRef = useRef<MessageTimelineHandle>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasNewerRef = useRef(false);

  // Resize state (desktop only)
  const [dynamicMax, setDynamicMax] = useState(() => Math.max(400, Math.floor(window.innerWidth * 0.6)));
  const { width, handleResizeStart, handleResizeMove, handleResizeEnd } = useResizablePanel({
    storageKey: "slock:threadPanelWidth", min: 360, max: dynamicMax, defaultWidth: 400, direction: "left",
  });
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Update dynamic max on window resize — cap at 60% of viewport
  useEffect(() => {
    const update = () => setDynamicMax(Math.max(400, Math.floor(window.innerWidth * 0.6)));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const mentionMap = useMemo(
    () => buildMentionMap(agents, members, mentionChannelAgents, mentionChannelHumans),
    [agents, members, mentionChannelAgents, mentionChannelHumans],
  );
  const agentById = useMemo(() => {
    const map = new Map<string, (typeof agents)[0]>();
    for (const a of agents) map.set(a.id, a);
    for (const a of mentionChannelAgents) map.set(a.id, a);
    return map;
  }, [agents, mentionChannelAgents]);
  const memberById = useMemo(() => {
    const map = new Map<string, (typeof members)[0]>();
    for (const m of members) map.set(m.userId, m);
    for (const human of mentionChannelHumans) {
      map.set(human.id, {
        userId: human.id,
        serverId: human.serverId,
        serverName: human.serverName,
        serverSlug: human.serverSlug,
        email: null,
        gravatarHash: human.gravatarHash,
        name: human.name,
        displayName: human.displayName,
        description: human.description,
        avatarUrl: human.avatarUrl,
        role: "member",
        joinedAt: "",
      });
    }
    return map;
  }, [members, mentionChannelHumans]);
  const fallbackParentMessage = useMemo<Message | null>(() => {
    if (!parentMessageId || !parentChannelId) return null;

    const cachedParent = parentChannelBucket.find((msg) => msg.id === parentMessageId);
    if (cachedParent) return cachedParent;

    const followedThread = followedThreads.find((thread) => thread.parentMessageId === parentMessageId);
    if (!followedThread) return null;

    const agent = followedThread.parentMessageSenderType === "agent" ? agentById.get(followedThread.parentMessageSenderId) : null;
    const member = resolveMessageSenderMember({
      senderType: followedThread.parentMessageSenderType as Message["senderType"],
      senderId: followedThread.parentMessageSenderId,
    }, memberById, currentUser) ?? null;
    const senderName = agent?.displayName ?? agent?.name ?? member?.displayName ?? member?.name;

    return {
      id: parentMessageId,
      channelId: parentChannelId,
      senderType: followedThread.parentMessageSenderType as Message["senderType"],
      senderId: followedThread.parentMessageSenderId,
      senderName,
      messageType: "chat",
      content: followedThread.parentMessagePreview,
      createdAt: followedThread.lastReplyAt ?? "1970-01-01T00:00:00.000Z",
    };
  }, [agentById, currentUser, followedThreads, memberById, parentChannelBucket, parentChannelId, parentMessageId]);
  const fallbackParentTask = useMemo<Task | null>(() => {
    if (!parentMessageId || !parentChannelId) return null;
    const followedThread = followedThreads.find((thread) => thread.parentMessageId === parentMessageId);
    if (!followedThread?.taskNumber || !followedThread.taskStatus) return null;

    return {
      id: `thread-fallback-task-${parentMessageId}`,
      messageId: parentMessageId,
      channelId: parentChannelId,
      taskNumber: followedThread.taskNumber,
      title: followedThread.parentMessagePreview,
      status: followedThread.taskStatus as Task["status"],
      claimedByName: followedThread.taskClaimedByName,
      createdById: followedThread.parentMessageSenderId,
      createdByType: followedThread.parentMessageSenderType as Task["createdByType"],
      createdAt: followedThread.lastReplyAt ?? "1970-01-01T00:00:00.000Z",
      updatedAt: followedThread.lastReplyAt ?? "1970-01-01T00:00:00.000Z",
    };
  }, [followedThreads, parentChannelId, parentMessageId]);
  const displayedParentMessage = parentMessage ?? fallbackParentMessage;
  const displayedParentMessageWithThreadId = useMemo<Message | null>(() => {
    if (!displayedParentMessage) return null;
    if (!threadChannelId || displayedParentMessage.threadId) return displayedParentMessage;
    return { ...displayedParentMessage, threadId: threadChannelId };
  }, [displayedParentMessage, threadChannelId]);
  threadParentMessageRef.current = displayedParentMessageWithThreadId;
  const displayedParentTask = parentTask ?? fallbackParentTask;
  const displayedParentThreadSummary = useMemo<ThreadSummary | undefined>(() => {
    if (!parentMessageId || !threadChannelId) return undefined;

    const cachedSummary = threadSummaries[parentMessageId];
    if (cachedSummary) return cachedSummary;

    const followedThread = followedThreads.find((thread) => thread.parentMessageId === parentMessageId);
    const lastLoadedReplyAt = messages.length > 0
      ? messages[messages.length - 1]?.createdAt ?? null
      : null;

    return {
      threadChannelId,
      replyCount: Math.max(messages.length, followedThread?.replyCount ?? 0),
      lastReplyAt: followedThread?.lastReplyAt ?? lastLoadedReplyAt,
      participantIds: [],
      unreadCount: followedThread?.unreadCount ?? 0,
      firstUnreadMessageId: null,
    };
  }, [followedThreads, messages, parentMessageId, threadChannelId, threadSummaries]);

  useEffect(() => {
    hasNewerRef.current = hasNewer;
  }, [hasNewer]);

  const isCurrentThread = useCallback((candidateThreadChannelId: string) => {
    return useThreadStore.getState().openThreadChannelId === candidateThreadChannelId;
  }, []);

  const loadLatestThreadMessages = useCallback(async (nextThreadChannelId: string) => {
    const limit = 50;
    const { data } = await api.get(`/messages/channel/${nextThreadChannelId}?limit=${limit}`);
    if (!isCurrentThread(nextThreadChannelId)) return null;
    const msgs = onlyThreadMessages(nextThreadChannelId, data.messages ?? data);
    setMessages(sortThreadMessages(msgs));
    setHasMore(msgs.length >= limit);
    setHasNewer(false);
    setLoading(false);
    setLoadingOlder(false);
    setLoadingNewer(false);
    return msgs;
  }, [isCurrentThread]);

  // Load thread messages
  // Capture focusedMessageId at effect time so clearing it later doesn't re-trigger the load
  const focusedAtOpenRef = useRef<string | null>(null);
  useEffect(() => {
    if (!threadChannelId) return;
    let cancelled = false;

    const initialFocusId =
      focusedMessageId && focusedMessageId !== parentMessageId
        ? focusedMessageId
        : null;
    focusedAtOpenRef.current = initialFocusId;

    // Use cached messages if available instead of clearing to empty (avoids blank flash)
    const cached = onlyThreadMessages(threadChannelId, useMessageStore.getState().channelMessages[threadChannelId] ?? []);
    if (initialFocusId) {
      setMessages([]);
      setLoading(true);
    } else {
      setMessages(cached.length ? sortThreadMessages(cached) : []);
      setLoading(!cached.length);
    }
    setNewMessageCount(0);
    setAtBottom(true);
    setHasMore(true);
    setHasNewer(false);
    setHistoryLimited(false);
    setLoadingOlder(false);
    setLoadingNewer(false);

    const mergeIntoThread = (incoming: Message[]) => {
      setMessages((prev) => mergeThreadMessages(prev, onlyThreadMessages(threadChannelId, incoming)));
    };

    const socket = getSocket();
    const handler = (msg: Message) => {
      if (msg.channelId !== threadChannelId) return;
      setMessages((prev) => {
        const currentMaxSeq = Math.max(...prev.map((m) => m.seq || 0), 0);
        if (hasNewerRef.current && msg.seq && currentMaxSeq > 0 && msg.seq > currentMaxSeq + 1) {
          setNewMessageCount((c) => c + 1);
          return prev;
        }
        const next = mergeThreadMessages(prev, [msg]);
        if (!isNearBottomRef.current || hasNewerRef.current) {
          setNewMessageCount((c) => c + 1);
        }
        return next;
      });
    };

    socket.on("message:new", handler);

    // Merge-only handler for task field updates (no new message count bump)
    const updateHandler = (msg: Message) => {
      if (msg.channelId !== threadChannelId) return;
      mergeIntoThread([msg]);
    };
    socket.on("message:updated", updateHandler);

    // Clear unread count for this thread in the followed threads list
    useThreadStore.getState().clearThreadUnread(threadChannelId);

    // Join socket room for thread channel
    socket.emit("join:channel", threadChannelId);

    const handleReconnect = () => {
      socket.emit("join:channel", threadChannelId);
    };

    socket.on("connect", handleReconnect);

    const INITIAL_LIMIT = 50;
    // The focused reply lives in the thread channel; pass channelId so the
    // server resolves joint-channel thread projections to their canonical
    // store (without it, /messages/context 404s for joint thread replies and
    // the panel renders an empty "No replies yet" despite a non-zero count).
    const loadPromise = initialFocusId
      ? api.get(`/messages/context/${initialFocusId}`, { params: { channelId: threadChannelId } })
      : api.get(`/messages/channel/${threadChannelId}?limit=${INITIAL_LIMIT}`);

    loadPromise
      .then(({ data }) => {
        if (cancelled) return;
        const msgs = onlyThreadMessages(threadChannelId, data.messages ?? data);
        if (initialFocusId && !msgs.some((msg) => msg.id === initialFocusId)) {
          void loadLatestThreadMessages(threadChannelId).catch(() => {
            if (!cancelled) setLoading(false);
          });
          return;
        }
        mergeIntoThread(msgs);
        if (initialFocusId) {
          setHasMore(!!data.hasOlder);
          setHasNewer(!!data.hasNewer);
          setHistoryLimited(!!data.historyLimited);
        } else {
          setHasMore(msgs.length >= INITIAL_LIMIT);
          setHasNewer(false);
          setHistoryLimited(!!data.historyLimited);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // A focused-context load can fail (e.g. transient error) — fall back to
        // loading the thread's latest messages instead of leaving the panel
        // blank, mirroring the success-but-focus-missing path above.
        if (initialFocusId) {
          void loadLatestThreadMessages(threadChannelId).catch(() => {
            if (!cancelled) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      socket.off("message:new", handler);
      socket.off("message:updated", updateHandler);
      socket.off("connect", handleReconnect);
      socket.emit("leave:channel", threadChannelId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadChannelId]);

  useEffect(() => {
    if (!threadChannelId || threadBucket.length === 0) return;
    setMessages((prev) => {
      const filteredThreadBucket = onlyThreadMessages(threadChannelId, threadBucket);
      if (!hasNewerRef.current) return mergeThreadMessages(prev, filteredThreadBucket);

      const currentMaxSeq = Math.max(...prev.map((msg) => msg.seq || 0), 0);
      const safeIncoming = filteredThreadBucket.filter((msg) => {
        if (prev.some((existing) => existing.id === msg.id)) return true;
        if (msg.id.startsWith("optimistic-")) return false;
        if (!msg.seq || currentMaxSeq <= 0) return false;
        return msg.seq <= currentMaxSeq + 1;
      });
      return mergeThreadMessages(prev, safeIncoming);
    });
  }, [threadBucket, threadChannelId]);

  // Load parent message and its linked task
  useEffect(() => {
    setParentMessage(null);
    setParentTask(null);

    if (!parentMessageId || !parentChannelId) return;

    let cancelled = false;
    // Pass the parent's channelId so joint-channel parents resolve via their
    // canonical store; without it /messages/context 404s and the thread header
    // loses its parent preview.
    api.get(`/messages/context/${parentMessageId}`, { params: { channelId: parentChannelId } })
      .then(({ data }) => {
        if (cancelled) return;
        const msgs: Message[] = data.messages ?? [];
        const parent = msgs.find((m) => m.id === parentMessageId) ?? null;
        setParentMessage(parent);
      })
      .catch(() => {
        if (!cancelled) setParentMessage(null);
      });

    api.get(`/tasks/channel/${parentChannelId}`)
      .then(({ data }) => {
        if (cancelled) return;
        const tasks: Task[] = (data as { tasks: Task[] }).tasks;
        const linked = tasks.find((t) => t.messageId === parentMessageId);
        setParentTask(linked ?? null);
      })
      .catch(() => {
        if (!cancelled) setParentTask(null);
      });

    return () => {
      cancelled = true;
    };
  }, [parentChannelId, parentMessageId]);

  // Keep parentTask in sync with taskStore mutations (mark-as-done from the
  // thread header's own context menu, socket task:updated, tasks page, etc.).
  // Without this, the initial API fetch above snapshots the status once and
  // the thread header's status badge stays stale until a refresh.
  const storeParentTask = useTaskStore((s) => {
    if (!parentMessageId) return null;
    return s.tasks.find((t) => t.messageId === parentMessageId)
      ?? s.serverTasks.find((t) => t.messageId === parentMessageId)
      ?? null;
  });
  useEffect(() => {
    if (storeParentTask) setParentTask(storeParentTask);
  }, [storeParentTask]);

  useEffect(() => {
    if (!focusedMessageId || messages.length === 0) return;
    if (!messages.some((msg) => msg.id === focusedMessageId)) return;

    requestAnimationFrame(() => {
      timelineRef.current?.scrollToMessage(focusedMessageId, { align: "center" });
    });

    const timer = window.setTimeout(() => {
      clearFocusedMessage();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [clearFocusedMessage, focusedMessageId, messages]);

  // Load older messages (pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!threadChannelId || loadingOlder || !hasMore || messages.length === 0) return;

    const minSeq = Math.min(...messages.map((m) => m.seq || Infinity));
    if (!minSeq || minSeq === Infinity) return;

    const requestThreadChannelId = threadChannelId;
    setLoadingOlder(true);
    try {
      const limit = 50;
      const { data } = await api.get(
        `/messages/channel/${requestThreadChannelId}?limit=${limit}&before=${minSeq}`
      );
      if (!isCurrentThread(requestThreadChannelId)) return;
      const older = onlyThreadMessages(requestThreadChannelId, data.messages ?? data);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs = older.filter((m) => !existingIds.has(m.id));
        return newMsgs.length === 0 ? prev : [...newMsgs, ...prev];
      });
      setHasMore(older.length >= limit);
      setHistoryLimited(!!data.historyLimited);
    } catch {
      // ignore
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, isCurrentThread, loadingOlder, messages, threadChannelId]);

  const loadNewerMessages = useCallback(async () => {
    if (!threadChannelId || loadingNewer || !hasNewer || loading || messages.length === 0) return;

    const maxSeq = Math.max(...messages.map((m) => m.seq || 0));
    if (!maxSeq || maxSeq === Infinity) return;

    const requestThreadChannelId = threadChannelId;
    setLoadingNewer(true);
    try {
      const limit = 50;
      const { data } = await api.get(
        `/messages/channel/${requestThreadChannelId}?limit=${limit}&after=${maxSeq}`
      );
      if (!isCurrentThread(requestThreadChannelId)) return;
      const newer = onlyThreadMessages(requestThreadChannelId, data.messages ?? data);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs = newer.filter((m) => !existingIds.has(m.id));
        return mergeThreadMessages(prev, newMsgs);
      });
      setHasNewer(newer.length >= limit);
    } catch {
      // ignore
    } finally {
      setLoadingNewer(false);
    }
  }, [hasNewer, isCurrentThread, loading, loadingNewer, messages, threadChannelId]);

  const handleAtBottomStateChange = useCallback((atBottom: boolean) => {
    isNearBottomRef.current = atBottom;
    setAtBottom(atBottom);
    if (atBottom) setNewMessageCount(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    timelineRef.current?.scrollToBottom();
    setNewMessageCount(0);
  }, []);

  const handleBackToBottom = useCallback(async () => {
    if (!threadChannelId) return;
    clearFocusedMessage();
    setNewMessageCount(0);
    setLoading(true);
    try {
      const latest = await loadLatestThreadMessages(threadChannelId);
      if (!latest) return;
      requestAnimationFrame(() => {
        timelineRef.current?.scrollToBottom();
      });
    } catch {
      setLoading(false);
    }
  }, [clearFocusedMessage, loadLatestThreadMessages, threadChannelId]);

  const handleWillSend = useCallback(async () => {
    if (!threadChannelId) return;
    if (hasNewer || focusedMessageId) {
      clearFocusedMessage();
      setNewMessageCount(0);
      hasNewerRef.current = false;
      setHasNewer(false);
      setLoadingNewer(false);
    }
    timelineRef.current?.armFollowOnNextAppend();
    isNearBottomRef.current = true;
    setAtBottom(true);
    setNewMessageCount(0);
    requestAnimationFrame(() => {
      timelineRef.current?.scrollToBottom();
    });
  }, [clearFocusedMessage, focusedMessageId, hasNewer, threadChannelId]);

  const handleJoinParentChannel = useCallback(() => {
    if (!parentChannelId) return;
    void joinChannel(parentChannelId);
  }, [joinChannel, parentChannelId]);

  const threadSource = useMemo<MessageTimelineSource>(() => ({
    messages,
    hasOlder: hasMore,
    hasNewer,
    loading,
    loadOlder: loadOlderMessages,
    loadNewer: loadNewerMessages,
    initialFocusMessageId: focusedAtOpenRef.current,
  }), [messages, hasMore, hasNewer, loading, loadOlderMessages, loadNewerMessages]);

  const systemMessageRenderStates = useMemo(() => buildSystemMessageRenderStates(messages), [messages]);

  const toggleSystemMessageGroup = useCallback((groupId: string) => {
    setExpandedSystemMessageGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const getPreviewSenderAgent = useCallback((message: Message) => (
      message.senderType === "agent" ? agentById.get(message.senderId) : undefined
  ), [agentById]);
  const getPreviewSenderMember = useCallback((message: Message) => (
      message.senderType === "user"
        ? resolveMessageSenderMember(message, memberById, currentUser) ?? undefined
        : undefined
  ), [currentUser, memberById]);

  const renderThreadItem = useCallback((msg: Message, index: number) => {
    const systemMessageState = systemMessageRenderStates[index];
    if (systemMessageState?.kind === "hide") return null;

    if (systemMessageState?.kind === "summary") {
      const expanded = expandedSystemMessageGroups.has(systemMessageState.groupId);
      return (
        <div className="px-3 overflow-hidden">
          <SystemMessageGroupDisclosure
            summary={systemMessageState.content}
            expanded={expanded}
            onToggle={() => toggleSystemMessageGroup(systemMessageState.groupId)}
          >
            {systemMessageState.messageIndexes.map((messageIndex) => {
              const originalMessage = messages[messageIndex];
              if (!originalMessage) return null;
              return (
                <MessageItem
                  key={originalMessage.id}
                  message={originalMessage}
                  mentionMap={mentionMap}
                  channels={channels}
                  parentChannelId={parentChannelId || undefined}
                  parentMessageId={parentMessageId || undefined}
                  previewSenderAgent={getPreviewSenderAgent(originalMessage)}
                  previewSenderMember={getPreviewSenderMember(originalMessage)}
                  hideThreadActions
                />
              );
            })}
          </SystemMessageGroupDisclosure>
        </div>
      );
    }

    return (
      <div className="px-3 overflow-hidden">
        <MessageItem
          key={msg.id}
          message={msg}
          mentionMap={mentionMap}
          channels={channels}
          parentChannelId={parentChannelId || undefined}
          parentMessageId={parentMessageId || undefined}
          previewSenderAgent={getPreviewSenderAgent(msg)}
          previewSenderMember={getPreviewSenderMember(msg)}
          hideThreadActions
        />
      </div>
    );
  }, [channels, expandedSystemMessageGroups, getPreviewSenderAgent, getPreviewSenderMember, mentionMap, messages, parentChannelId, parentMessageId, systemMessageRenderStates, toggleSystemMessageGroup]);

  const threadHeader = useMemo(() => (
    <div>
      {displayedParentMessageWithThreadId && (
        <div data-testid="thread-panel-parent" className="border-b-2 border-black bg-white px-3 py-1">
          <MessageItem
            message={displayedParentMessageWithThreadId}
            mentionMap={mentionMap}
            channels={channels}
            threadSummary={displayedParentThreadSummary}
            linkedTask={displayedParentTask ?? undefined}
            previewSenderAgent={getPreviewSenderAgent(displayedParentMessageWithThreadId)}
            previewSenderMember={getPreviewSenderMember(displayedParentMessageWithThreadId)}
            hideThreadActions
            showThreadFollowAction
            senderAvatarTestId="thread-parent-avatar"
          />
        </div>
      )}
      <div className="px-3 pt-2">
        <HistoryTopState
          hasMore={hasMore}
          historyLimited={historyLimited}
          loadingOlder={loadingOlder}
          onLoadOlder={loadOlderMessages}
          noun="replies"
        />
        <div className="border-b border-black/10 pb-2 mb-1 text-xs text-black/40 font-mono text-center">
          {messages.length} {messages.length === 1 ? "reply" : "replies"}
        </div>
      </div>
    </div>
  ), [channels, displayedParentMessageWithThreadId, displayedParentTask, getPreviewSenderAgent, getPreviewSenderMember, hasMore, historyLimited, loadOlderMessages, loadingOlder, mentionMap, messages.length, renderThreadItem]);

  const threadFooter = useMemo(() => (
    <div className="px-3 pb-3">
      {loadingNewer && (
        <div className="py-2 text-center text-black/40 font-mono text-xs">
          Loading newer replies...
        </div>
      )}
      <div className="h-3" />
    </div>
  ), [loadingNewer]);

  if (!parentMessageId) return null;
  const showBottomButton = hasNewer || !atBottom || newMessageCount > 0;
  const handleBottomButton = hasNewer ? handleBackToBottom : scrollToBottom;
  // Three presentations:
  //   side          — current right-column thread (mobile: full-screen overlay
  //                   inside MainLayout; desktop: right column with resize).
  //   modal         — bounded centered card; only used when wrapped in <Modal>.
  //                   That's the desktop tasks-route case.
  //   mobile-modal  — full-screen overlay on mobile, behaves like a thread but
  //                   with the X close button visible top-right. Rendered
  //                   directly by RightPanel (no Modal wrapper) on the mobile
  //                   tasks-route case per stdrc 2026-05-20 #proj-task:287f18ce.
  const panelClassName = presentation === "modal"
    ? "flex h-[min(86vh,900px)] max-h-[calc(100vh-2rem)] w-[min(960px,calc(100vw-2rem))] flex-col overflow-hidden border-2 border-black bg-white shadow-brutal"
    : presentation === "mobile-modal"
    ? "absolute inset-0 z-30 flex flex-col bg-white"
    : "absolute inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto lg:shrink-0 lg:border-l-2 lg:border-black";
  const panelStyle = presentation === "side" && isDesktop ? { width } : undefined;
  const showResizeHandle = presentation === "side";
  // X close button visibility, per stdrc 2026-05-21 #proj-task:287f18ce
  // msg=804c045d: "它作为弹窗就需要叉；如果它是直接覆盖整个页面，就是返回."
  //   modal        — X (centered card with backdrop, X is the dialog close)
  //   mobile-modal — NO X (full-screen overlay, back chevron handles close)
  //   side         — X on desktop (lg+) only; mobile uses back chevron
  const closeButtonClassName = presentation === "modal"
    ? "btn-brutal-sm flex size-7 items-center justify-center bg-white"
    : "btn-brutal-sm hidden size-7 items-center justify-center bg-white lg:flex";

  // Show a loading shell while threadChannelId is being fetched (first-open
  // case). If resolution actually failed for *this* parent (e.g. the permalink
  // was opened mid private→public conversion, or any transient error), show an
  // actionable error + Retry instead of an unbounded spinner — see
  // threadStore.openThreadError (#engineering task #417).
  if (!threadChannelId) {
    const resolveFailed =
      !!openThreadError &&
      openThreadError.parentChannelId === parentChannelId &&
      openThreadError.parentMessageId === parentMessageId;
    return (
      <div
        className={panelClassName}
        style={panelStyle}
      >
        <PanelHeader
          title="Thread"
          onMobileBack={mobileBackHandler}
          mobileBackProps={{ "data-testid": "thread-mobile-back" }}
          mobileBreakpoint="lg"
          actions={
            <button
              onClick={closeThread}
              className={closeButtonClassName}
              title="Close thread"
            >
              <X size={14} />
            </button>
          }
        />
        <div className="flex flex-1 items-center justify-center p-6">
          {resolveFailed ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="font-display text-lg font-bold text-black">
                Couldn't load this thread
              </div>
              <div className="max-w-xs text-sm text-black/60">
                The thread couldn't be opened. If this channel just became
                public, retrying usually fixes it.
              </div>
              <button
                onClick={() => { void retryOpenThread(); }}
                className="btn-brutal-sm bg-white px-3 py-1.5 text-sm font-bold"
                data-testid="thread-retry"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="text-black/40 font-mono text-sm">Loading…</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={panelClassName}
      style={panelStyle}
      data-testid={presentation === "modal" || presentation === "mobile-modal" ? "task-thread-modal" : undefined}
    >
      {/* Resize handle (desktop only) — invisible drag zone */}
      {showResizeHandle && (
        <div
          className="hidden md:block absolute left-0 top-0 bottom-0 w-2 -ml-1 z-10 cursor-col-resize select-none"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        />
      )}
      <PanelHeader
        onMobileBack={mobileBackHandler}
        mobileBackProps={{ "data-testid": "thread-mobile-back" }}
        // In modal presentation the back chevron is the close affordance, so
        // it should hide once the Rail kicks in (md+, centered card). In side
        // presentation the chevron stays through to lg- (mobile full-screen).
        mobileBreakpoint={presentation === "side" ? "lg" : "md"}
        titleSlot={
          <span className="flex-1 font-bold text-black text-base truncate">
            Thread
            {parentChannelId && (() => {
              const ch = channels.find((c) => c.id === parentChannelId) || dmChannels.find((c) => c.id === parentChannelId);
              if (!ch) return null;
              const label = ch.type === "dm" ? `@${ch.peerDisplayName || ch.peerName || ch.name}` : `#${ch.name}`;
              return <span className="font-normal text-black/50"> — {label}</span>;
            })()}
          </span>
        }
        actions={
          <>
            {parentChannelId && (
              <button
                onClick={() => {
                  if (!parentMessageId) return;
                  const routeKind = parentRouteKind === "dm" ? "dm" : "channel";
                  if (!isDesktop) {
                    // On mobile: push parent surface (channel or DM) on top of the
                    // thread history entry, so back returns to the thread. Don't
                    // call closeThread() here — useRightPanelUrlSync sees the new
                    // URL has no ?thread param and closes the thread for us. If we
                    // closed it ourselves, the resulting store→URL sync would race
                    // the navigate above and replace the freshly-pushed ?msg=
                    // query with the old (thread-cleared) URL.
                    const base = serverSlug ? `/s/${serverSlug}` : "";
                    mobileNavigate(
                      `${base}/${routeKind}/${parentChannelId}?msg=${parentMessageId}`,
                    );
                  } else if (routeKind === "dm") {
                    nav.toDmMessage(parentChannelId, parentMessageId);
                  } else {
                    nav.toMessage(parentChannelId, parentMessageId);
                  }
                }}
                // Collapses to a square size-7 icon button when the
                // "View in channel" label hides on narrow viewports — stops
                // it from reading wider than a canonical icon-only btn.
                className="btn-brutal-sm flex size-7 shrink-0 items-center justify-center bg-white text-xs font-bold sm:w-auto sm:gap-1.5 sm:px-2.5"
                title="View in channel"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">View in channel</span>
              </button>
            )}
            {/*
              X close button.
              - modal (centered card): X is the standard dialog close.
              - mobile-modal (full-screen overlay): NO X — back chevron is
                the close affordance.
              - side: X on desktop (lg+), back chevron on mobile.
              Per stdrc 2026-05-21 #proj-task:287f18ce msg=804c045d.
            */}
            {presentation !== "mobile-modal" && (
              <button
                onClick={closeThread}
                className={closeButtonClassName}
                title="Close thread"
              >
                <X size={14} />
              </button>
            )}
          </>
        }
      />

      {/* Thread replies (parent message scrolls with replies via Header) */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col h-full">
            {displayedParentMessageWithThreadId && (
              <div data-testid="thread-panel-parent" className="border-b-2 border-black bg-white px-3 py-1">
                <MessageItem
                  message={displayedParentMessageWithThreadId}
                  mentionMap={mentionMap}
                  channels={channels}
                  threadSummary={displayedParentThreadSummary}
                  linkedTask={displayedParentTask ?? undefined}
                  previewSenderAgent={getPreviewSenderAgent(displayedParentMessageWithThreadId)}
                  previewSenderMember={getPreviewSenderMember(displayedParentMessageWithThreadId)}
                  hideThreadActions
                  showThreadFollowAction
                  senderAvatarTestId="thread-parent-avatar"
                />
              </div>
            )}
            <div className="flex flex-1 items-center justify-center">
              <div className="text-black/40 font-mono text-sm">Loading…</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col h-full overflow-auto">
            {displayedParentMessageWithThreadId && (
              <div data-testid="thread-panel-parent" className="border-b-2 border-black bg-white px-3 py-1">
                <MessageItem
                  message={displayedParentMessageWithThreadId}
                  mentionMap={mentionMap}
                  channels={channels}
                  threadSummary={displayedParentThreadSummary}
                  linkedTask={displayedParentTask ?? undefined}
                  previewSenderAgent={getPreviewSenderAgent(displayedParentMessageWithThreadId)}
                  previewSenderMember={getPreviewSenderMember(displayedParentMessageWithThreadId)}
                  hideThreadActions
                  showThreadFollowAction
                  senderAvatarTestId="thread-parent-avatar"
                />
              </div>
            )}
            <EmptyState
              className="flex flex-1 flex-col items-center justify-center"
              icon={<MessageSquare size={36} />}
              title="No replies yet"
            />
          </div>
        ) : (
          <MessageTimeline
            key={threadChannelId}
            ref={timelineRef}
            source={threadSource}
            renderItem={renderThreadItem}
            header={threadHeader}
            footer={threadFooter}
            onAtBottomChange={handleAtBottomStateChange}
            onVisibleMessageWindowChange={setTranslationWindowIds}
            persistKey={`thread:${threadChannelId}`}
            className="h-full"
            testId="thread-message-scroller"
          />
        )}
        {showBottomButton && (
          <button
            onClick={handleBottomButton}
            className="btn-brutal-sm absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold z-10"
          >
            <ArrowDown size={12} />
            {newMessageCount > 0 ? `${newMessageCount} new` : "Back to bottom"}
          </button>
        )}
      </div>

      {/* In thread-mode select, the toolbar replaces the input. */}
      {threadSelectScopedHere ? (
        <SelectModeToolbar
          channelId={threadChannelId ?? ""}
          capturing={picCapturing}
          copied={copiedMd}
          onSavePic={onSavePic}
          onShareX={onShareX}
          onCopyMd={onCopyMd}
          onSelectAll={handleSelectAllInThread}
        />
      ) : parentJoined === true ? (
        /* Thread message input — use parent channel members for @mention autocomplete */
        <MessageInput
          channelId={threadChannelId}
          channelName="thread"
          onWillSend={handleWillSend}
          mentionChannelId={parentChannelId || undefined}
          isChannelThread={(() => {
            if (!parentChannelId) return false;
            const ch = channels.find((c) => c.id === parentChannelId) || dmChannels.find((c) => c.id === parentChannelId);
            return ch?.type !== "dm";
          })()}
          threadMessages={messages}
          autoFocus
        />
      ) : parentJoined === false ? (
        <div className="flex items-center border-t-2 border-black bg-white p-3">
          <button
            onClick={handleJoinParentChannel}
            className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-pink px-3 py-1.5 text-sm font-bold"
          >
            <LogIn size={14} />
            Join channel to reply
          </button>
        </div>
      ) : null}
      {picPreview && (
        <SelectShareLightbox
          dataUrl={picPreview}
          filename={`slock-thread-${new Date().toISOString().slice(0, 10)}.png`}
          onClose={() => setPicPreview(null)}
          onSaved={() => {
            setPicPreview(null);
            useSelectionStore.getState().exit();
          }}
        />
      )}
      {picError && (
        <div
          role="alert"
          className="fixed bottom-20 left-1/2 z-[110] -translate-x-1/2 border-2 border-black bg-brutal-orange px-3 py-2 text-xs font-bold shadow-brutal-sm"
          onClick={() => setPicError(null)}
          data-testid="thread-select-share-error"
        >
          Couldn&apos;t render image: {picError} — click to dismiss.
        </div>
      )}
    </div>
  );
}
