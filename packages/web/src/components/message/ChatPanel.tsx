import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { LogIn, LogOut, ArrowLeft, Settings, MessageSquare, ListTodo, ArrowDown, Square, Paperclip } from "lucide-react";
import SOSDialog from "./SOSDialog";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useChannelStore, type Channel } from "../../store/channelStore";
import { useMessageStore, type Message } from "../../store/messageStore";
import { useAgentDisplayState, useAgentStore } from "../../store/agentStore";
import { useServerStore } from "../../store/serverStore";
import { PLAN_CONFIG, getEffectiveLimits, type ServerPlan } from "@slock-ai/shared";
import { CHAT_TAB_QUERY_PARAM, useAppNavigate, useMobileBack } from "../../hooks/useAppNavigate";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { useTranslationBatch } from "../../hooks/useTranslationBatch";
import { useChannelMembers } from "../../hooks/useChannelMembers";
import StatusDot from "../ui/StatusDot";
import { useThreadStore } from "../../store/threadStore";
import Banner from "../ui/Banner";
import { useProfileStore } from "../../store/profileStore";
import MessageItem, { buildMentionMap } from "./MessageItem";
import HistoryTopState from "./HistoryTopState";
import MessageInput from "./MessageInput";
import MessageTimeline, {
  recallPersistedScrollMessageId,
  type MessageTimelineHandle,
  type MessageTimelineSource,
} from "./MessageTimeline";
import SelectModeToolbar from "./SelectModeToolbar";
import SelectShareLightbox from "./SelectShareLightbox";
import { useSelectionStore } from "../../store/selectionStore";
import { useSelectionShareHandlers } from "./useSelectionShareHandlers";
import ChannelMembers from "../agent/ChannelMembers";
import Button from "../ui/Button";
import PanelHeader from "../ui/PanelHeader";
import EmptyState from "../ui/EmptyState";
import AvatarSlot from "../ui/AvatarSlot";
import ConfirmDialog from "../ConfirmDialog";
import EditChannelDialog from "../channel/EditChannelDialog";
import { ChannelKindIcon } from "../channel/channelKindIcon";
import { useTaskStore, type Task } from "../../store/taskStore";
import TasksPanel from "../task/TasksPanel";
import ChannelFilesPanel from "./ChannelFilesPanel";
import ReorderablePanelTabs, { useOrderedPanelTabs, type PanelTabItem } from "../ui/ReorderablePanelTabs";
import api from "../../api/client";
import { getHistoryTopState } from "../../utils/historyTopState";
import SystemMessageGroupDisclosure from "./SystemMessageGroupDisclosure";
import { buildSystemMessageRenderStates } from "./systemMessageGrouping";

type ChatPanelTab = "chat" | "tasks" | "files";
const CHAT_PANEL_TABS: PanelTabItem<ChatPanelTab>[] = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "tasks", icon: ListTodo, label: "Tasks" },
  { id: "files", icon: Paperclip, label: "Files" },
];

// Isolated component — subscribes to a single agent's activity to avoid
// re-rendering the entire ChatPanel on any agent status change.
function AgentDMStatus({ agentId }: { agentId: string }) {
  const displayState = useAgentDisplayState(agentId);
  return (
    <>
      <StatusDot activity={displayState.activity} title={displayState.activityText} />
      <span className="min-w-0 truncate text-sm text-black/60 font-mono" title={displayState.activityText}>
        {displayState.activityText}
      </span>
    </>
  );
}

function HistoryLimitBanner() {
  const server = useServerStore((s) => s.current);
  const nav = useAppNavigate();
  const plan = (server?.plan || "free") as ServerPlan;
  const days = getEffectiveLimits(plan).messageHistoryDays;

  return (
    <Banner intent="info" density="sm" className="mx-auto mb-3 max-w-md text-center font-bold justify-center">
      Message history limited to {days} days on the {PLAN_CONFIG[plan].displayName} plan.{" "}
      <button
        onClick={() => nav.toSettings("server")}
        className="underline"
      >
        Upgrade
      </button>
    </Banner>
  );
}

export default function ChatPanel({ channel, hideHeader, readOnly }: { channel: Channel | null; hideHeader?: boolean; readOnly?: boolean }) {
  const channelId = channel?.id ?? null;
  const messages = useMessageStore((s) => s.messages);
  const loading = useMessageStore((s) => s.loading);
  const messagesBelongToChannel = useMemo(
    () => !!channelId && messages.length > 0 && messages.every((message) => message.channelId === channelId),
    [channelId, messages],
  );
  const shouldShowMessageTimeline = messages.length > 0 && (!loading || messagesBelongToChannel);
  const [translationWindowIds, setTranslationWindowIds] = useState<string[]>([]);
  const translationMessages = useMemo(() => {
    if (translationWindowIds.length === 0) return [];
    const idSet = new Set(translationWindowIds);
    return messages.filter((message) => idSet.has(message.id));
  }, [messages, translationWindowIds]);
  useTranslationBatch(translationMessages);
  const loadingOlder = useMessageStore((s) => s.loadingOlder);
  const loadingNewer = useMessageStore((s) => s.loadingNewer);
  const hasMore = useMessageStore((s) => s.hasMore);
  const hasNewer = useMessageStore((s) => s.hasNewer);
  const loadMessages = useMessageStore((s) => s.loadMessages);
  const loadMessageContext = useMessageStore((s) => s.loadMessageContext);
  const loadMessageWindowSilent = useMessageStore((s) => s.loadMessageWindowSilent);
  const loadOlderMessages = useMessageStore((s) => s.loadOlderMessages);
  const loadNewerMessages = useMessageStore((s) => s.loadNewerMessages);
  const historyLimited = useMessageStore((s) => s.historyLimited);
  const highlightedMessageId = useMessageStore((s) => s.highlightedMessageId);
  const contextLoadError = useMessageStore((s) => s.contextLoadError);
  const transientFocusRequest = useMessageStore((s) => s.transientFocusRequest);
  const setHighlightedMessageId = useMessageStore((s) => s.setHighlightedMessageId);
  const exitContextWindow = useMessageStore((s) => s.exitContextWindow);
  const setNearBottom = useMessageStore((s) => s.setNearBottom);
  const unreadCounts = useMessageStore((s) => s.unreadCounts);
  const topHistoryState = getHistoryTopState({ hasMore, historyLimited });
  const agents = useAgentStore((s) => s.agents);
  const channels = useChannelStore((s) => s.channels);
  const members = useServerStore((s) => s.members);
  const { channelAgents: mentionChannelAgents, channelHumans: mentionChannelHumans } = useChannelMembers(channel?.id ?? "");
  const joinChannel = useChannelStore((s) => s.joinChannel);
  const leaveChannel = useChannelStore((s) => s.leaveChannel);
  const mobileNavigate = useNavigate();
  const currentServer = useServerStore((s) => s.current);
  const serverSlug = currentServer?.slug;
  const onMobileBack = useMobileBack(serverSlug ? `/s/${serverSlug}` : "/");
  const nav = useAppNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const channelPanelTabOrder = useServerStore((s) => s.sidebarOrder.channelPanelTabOrder);
  const updateSidebarOrder = useServerStore((s) => s.updateSidebarOrder);
  const orderedTabs = useOrderedPanelTabs(CHAT_PANEL_TABS, channelPanelTabOrder);
  const visibleTabs = useMemo(
    () => channel?.type === "joint" ? orderedTabs.filter((tab) => tab.id !== "tasks") : orderedTabs,
    [channel?.type, orderedTabs],
  );
  const reorderTabs = useCallback((nextOrder: ChatPanelTab[]) => {
    void updateSidebarOrder({ channelPanelTabOrder: nextOrder });
  }, [updateSidebarOrder]);
  const defaultTab = visibleTabs[0]?.id ?? "chat";
  const queryTab = searchParams.get(CHAT_TAB_QUERY_PARAM);
  const legacyTab = searchParams.get("tab");
  const activeTab = (
    visibleTabs.some((tab) => tab.id === queryTab)
      ? queryTab
      : queryTab === null && visibleTabs.some((tab) => tab.id === legacyTab)
        ? legacyTab
        : defaultTab
  ) as ChatPanelTab;
  const threadParam = searchParams.get("thread");
  const queryFocusMessageId = threadParam ? null : searchParams.get("msg");
  const setActiveTab = useCallback((tab: ChatPanelTab) => {
    // Merge with existing params — a bare `setSearchParams({ chatTab })` wipes
    // `thread=`/`profile=`/`msg=` and the MainLayout URL→store effect then
    // closes the right panel that was open alongside. See PR #760.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === defaultTab) next.delete(CHAT_TAB_QUERY_PARAM);
      else next.set(CHAT_TAB_QUERY_PARAM, tab);
      const legacyTab = next.get("tab");
      if (legacyTab === "chat" || legacyTab === "tasks") next.delete("tab");
      return next;
    }, { replace: true });
  }, [defaultTab, setSearchParams]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const [expandedSystemMessageGroups, setExpandedSystemMessageGroups] = useState<Set<string>>(() => new Set());
  const timelineRef = useRef<MessageTimelineHandle>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const handledTransientFocusNonceRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);
  // Set when "Back to bottom" is clicked while in a context window
  // (`focusMessageId` or `hasNewer`). Drained after `loadMessages` settles —
  // a manual scroll is required because the primitive's `initialFocusMessageId`
  // is consumed at mount and the data swap happens mid-mount.
  const pendingBottomScrollRef = useRef(false);
  const { capabilities } = useServerPermissions();
  const canManageChannels = capabilities.manageChannels;
  const canManageAgents = capabilities.manageAgents;

  const shouldUseTransientFocus =
    !threadParam &&
    !queryFocusMessageId &&
    !!channel &&
    transientFocusRequest?.channelId === channel.id &&
    transientFocusRequest.nonce !== handledTransientFocusNonceRef.current;
  const focusMessageId = queryFocusMessageId ?? (shouldUseTransientFocus ? transientFocusRequest?.messageId ?? null : null);

  // Load messages on channel switch
  useEffect(() => {
    if (!channelId) return;
    setTranslationWindowIds([]);
    initialLoadRef.current = true;
    prevMessageCountRef.current = 0;
    isNearBottomRef.current = true;
    setNearBottom(true);
    setNewMessageCount(0);
    setAtBottom(true);
    if (focusMessageId) {
      if (shouldUseTransientFocus && transientFocusRequest) {
        handledTransientFocusNonceRef.current = transientFocusRequest.nonce;
      }
      loadMessageContext(channelId, focusMessageId);
      return;
    }
    // Restore prior scroll position if we have one — load centered around the
    // remembered top-visible message id so the same window is rehydrated. The
    // primitive's persistKey path picks the saved id up as the
    // initialTopMostItemIndex on mount. The "silent" load skips the highlight
    // flash + scroll-to-center side-effects so the resume reads as a return
    // to the parked spot, not a permalink jump.
    const persistedId = recallPersistedScrollMessageId(`channel:${channelId}`);
    if (persistedId) {
      loadMessageWindowSilent(channelId, persistedId);
    } else {
      loadMessages(channelId);
    }
  }, [
    channelId,
    focusMessageId,
    loadMessageContext,
    loadMessages,
    loadMessageWindowSilent,
    setNearBottom,
    shouldUseTransientFocus,
    transientFocusRequest,
  ]);

  useEffect(() => {
    if (!highlightedMessageId || messages.length === 0) return;
    if (!messages.some((msg) => msg.id === highlightedMessageId)) return;

    requestAnimationFrame(() => {
      timelineRef.current?.scrollToMessage(highlightedMessageId, { align: "center" });
    });

    const timer = window.setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [messages, highlightedMessageId, setHighlightedMessageId]);

  // Handle new messages: scroll-to-bottom is owned by the primitive's
  // followOutput; here we only maintain the "new messages" badge counter.
  useEffect(() => {
    if (messages.length === 0) return;
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      prevMessageCountRef.current = messages.length;
      return;
    }
    if (messages.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
      const newCount = messages.length - prevMessageCountRef.current;
      if (newCount <= 5 && !isNearBottomRef.current) {
        setNewMessageCount((prev) => prev + newCount);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when switching back to chat tab
  const prevActiveTabRef = useRef(activeTab);
  useEffect(() => {
    const wasOtherTab = prevActiveTabRef.current !== "chat";
    prevActiveTabRef.current = activeTab;
    if (wasOtherTab && activeTab === "chat" && messages.length > 0 && !hasNewer) {
      requestAnimationFrame(() => {
        timelineRef.current?.scrollToBottom();
      });
    }
  }, [activeTab, hasNewer, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAtBottomStateChange = useCallback((atBottom: boolean) => {
    isNearBottomRef.current = atBottom;
    setAtBottom(atBottom);
    setNearBottom(atBottom);
    if (atBottom) setNewMessageCount(0);
  }, [setNearBottom]);

  const scrollToBottom = useCallback(() => {
    timelineRef.current?.scrollToBottom();
    setNewMessageCount(0);
  }, []);

  const clearFocusedMessageParam = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    // `msg` is the current permalink/search anchor. Clean the old `message`
    // alias too so older links or stale local state do not immediately reopen
    // the centered context window.
    next.delete("msg");
    next.delete("message");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // "Back to bottom" while in a context window or with unloaded newer
  // messages. Clears focus, exits the context window in the store (so
  // the list stops requesting newer pages), and arms a post-load scroll
  // that fires once `loadMessages` finishes — Virtuoso would otherwise
  // keep its previous scroll position after the data swap.
  const handleBackToBottom = useCallback(() => {
    if (!channelId) return;
    setHighlightedMessageId(null);
    setNewMessageCount(0);
    pendingBottomScrollRef.current = true;
    if (focusMessageId) {
      clearFocusedMessageParam();
    }
    if (hasNewer) {
      exitContextWindow(channelId);
      loadMessages(channelId);
    }
  }, [channelId, clearFocusedMessageParam, exitContextWindow, focusMessageId, hasNewer, loadMessages, setHighlightedMessageId]);

  // Drains `pendingBottomScrollRef` once the post-`handleBackToBottom`
  // load settles — primitive remounts on channel switch but a context-window
  // exit reuses the same mount, so we have to scroll imperatively.
  useEffect(() => {
    if (!pendingBottomScrollRef.current) return;
    if (loading || messages.length === 0) return;
    pendingBottomScrollRef.current = false;
    requestAnimationFrame(() => {
      timelineRef.current?.scrollToBottom();
    });
  }, [loading, messages]);

  const handleWillSend = useCallback(async () => {
    if (!channelId) return;
    if (hasNewer || focusMessageId) {
      clearFocusedMessageParam();
      exitContextWindow(channelId);
      setHighlightedMessageId(null);
    }
    timelineRef.current?.armFollowOnNextAppend();
    isNearBottomRef.current = true;
    setAtBottom(true);
    setNearBottom(true);
    setNewMessageCount(0);
    requestAnimationFrame(() => {
      timelineRef.current?.scrollToBottom();
    });
  }, [channelId, clearFocusedMessageParam, exitContextWindow, focusMessageId, hasNewer, setHighlightedMessageId, setNearBottom]);

  // Memoize mention map and agent lookup for MessageItem props
  const mentionMap = useMemo(
    () => buildMentionMap(agents, members, mentionChannelAgents, mentionChannelHumans),
    [agents, members, mentionChannelAgents, mentionChannelHumans],
  );
  const agentById = useMemo(() => {
    const map = new Map<string, typeof agents[0]>();
    for (const a of agents) map.set(a.id, a);
    for (const a of mentionChannelAgents) map.set(a.id, a);
    return map;
  }, [agents, mentionChannelAgents]);
  const memberById = useMemo(() => {
    const map = new Map<string, typeof members[0]>();
    for (const m of members) map.set(m.userId, m);
    for (const human of mentionChannelHumans) {
      map.set(human.id, {
        userId: human.id,
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

  // Thread summaries
  const threadSummaries = useThreadStore((s) => s.summaries);
  const loadThreadSummaries = useThreadStore((s) => s.loadSummaries);

  useEffect(() => {
    if (!channel) return;
    loadThreadSummaries(channel.id);
  }, [channel, loadThreadSummaries]);

  const supportsChannelTasks = channel?.type !== "joint";

  // Load tasks for the channel to show claim badges on messages.
  // Joint channels intentionally do not expose task surfaces in PR1.
  const channelTasks = useTaskStore((s) => s.tasks);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const taskCurrentChannelId = useTaskStore((s) => s.currentChannelId);
  useEffect(() => {
    if (!channel || !supportsChannelTasks) return;
    if (taskCurrentChannelId !== channel.id) {
      loadTasks(channel.id);
    }
  }, [channel, loadTasks, supportsChannelTasks, taskCurrentChannelId]);

  const taskByMessageId = useMemo(() => {
    const map = new Map<string, Task>();
    if (!supportsChannelTasks) return map;
    for (const t of channelTasks) map.set(t.messageId, t);
    return map;
  }, [channelTasks, supportsChannelTasks]);

  const messageSource = useMemo<MessageTimelineSource>(() => ({
    messages,
    hasOlder: hasMore,
    hasNewer,
    loading,
    loadOlder: loadOlderMessages,
    loadNewer: loadNewerMessages,
    initialFocusMessageId: highlightedMessageId ?? focusMessageId ?? null,
  }), [messages, hasMore, hasNewer, loading, loadOlderMessages, loadNewerMessages, highlightedMessageId, focusMessageId]);

  const systemMessageRenderStates = useMemo(() => buildSystemMessageRenderStates(messages), [messages]);

  const toggleSystemMessageGroup = useCallback((groupId: string) => {
    setExpandedSystemMessageGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);
  const preserveChannelAnchorForThreadOpen = useCallback(() => {
    timelineRef.current?.preserveAnchorOnNextLayoutChange();
  }, []);

  const renderChannelItem = useCallback((msg: Message, index: number) => {
    const systemMessageState = systemMessageRenderStates[index];
    if (systemMessageState?.kind === "hide") return null;

    if (systemMessageState?.kind === "summary") {
      const expanded = expandedSystemMessageGroups.has(systemMessageState.groupId);
      return (
        <div
          className="px-3 overflow-hidden"
          style={{ contain: "layout paint style" }}
        >
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
                  previewSenderAgent={originalMessage.senderType === "agent" ? agentById.get(originalMessage.senderId) : undefined}
                  previewSenderMember={originalMessage.senderType === "user" ? memberById.get(originalMessage.senderId) : undefined}
                  threadSummary={threadSummaries[originalMessage.id]}
                  parentChannelId={channel?.id ?? ""}
                  linkedTask={taskByMessageId.get(originalMessage.id)}
                  hideThreadActions
                  onBeforeOpenThread={preserveChannelAnchorForThreadOpen}
                />
              );
            })}
          </SystemMessageGroupDisclosure>
        </div>
      );
    }

    return (
      <div
        className="px-3 overflow-hidden"
        style={{ contain: "layout paint style" }}
      >
        <MessageItem
          message={msg}
          mentionMap={mentionMap}
          channels={channels}
          previewSenderAgent={msg.senderType === "agent" ? agentById.get(msg.senderId) : undefined}
          previewSenderMember={msg.senderType === "user" ? memberById.get(msg.senderId) : undefined}
          threadSummary={threadSummaries[msg.id]}
          parentChannelId={channel?.id ?? ""}
          linkedTask={taskByMessageId.get(msg.id)}
          onBeforeOpenThread={preserveChannelAnchorForThreadOpen}
        />
      </div>
    );
  }, [agentById, channel?.id, channels, expandedSystemMessageGroups, memberById, mentionMap, messages, preserveChannelAnchorForThreadOpen, systemMessageRenderStates, taskByMessageId, threadSummaries, toggleSystemMessageGroup]);

  const channelHeader = useMemo(() => (
    <div className="px-3 pt-3">
      {contextLoadError && (
        <Banner intent="warning" density="sm" className="mx-auto mb-3 max-w-md text-center font-bold justify-center">
          {contextLoadError}
        </Banner>
      )}
      {topHistoryState === "history_limited" ? (
        <HistoryLimitBanner />
      ) : (
        <HistoryTopState
          hasMore={hasMore}
          historyLimited={historyLimited}
          loadingOlder={loadingOlder}
          onLoadOlder={loadOlderMessages}
          noun="messages"
        />
      )}
    </div>
  ), [contextLoadError, hasMore, historyLimited, loadOlderMessages, loadingOlder, topHistoryState]);

  const channelFooter = useMemo(() => (
    <div className="px-3 pb-3">
      {loadingNewer && (
        <div className="py-2 text-center text-black/40 font-mono text-xs">Loading newer messages…</div>
      )}
      <div className="h-3" />
    </div>
  ), [loadingNewer]);

  // Quota check — hooks must be above the early return to maintain consistent hook order
  const allChannels = useChannelStore((s) => s.channels);
  const plan = (useServerStore((s) => s.current?.plan) || "free") as ServerPlan;
  const maxChannels = getEffectiveLimits(plan).maxChannels;
  const isReadOnlyByQuota = useMemo(() => {
    if (!channel || channel.type === "dm" || maxChannels === -1) return false;
    if (allChannels.length <= maxChannels) return false;
    const sorted = [...allChannels].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const writableIds = new Set(sorted.slice(0, maxChannels).map((c) => c.id));
    return !writableIds.has(channel.id);
  }, [channel, maxChannels, allChannels]);

  // Selection store hooks must be declared before the early-return so the
  // hook order is stable across renders.
  const selectModeActive = useSelectionStore((s) => s.isActive);
  const selectModeChannelId = useSelectionStore((s) => s.channelId);
  const exitSelection = useSelectionStore((s) => s.exit);
  const channelIdForSelection = channel?.id ?? null;

  // Share-handler state lives in a shared hook so ThreadPanel can mount the
  // same toolbar in thread mode. `picPreviewRef` mirrors `picPreview` so
  // the long-lived ESC handler can defer to the lightbox without
  // re-subscribing.
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
  } = useSelectionShareHandlers();
  const picPreviewRef = useRef<string | null>(null);
  picPreviewRef.current = picPreview;

  // When the user navigates away from the channel (channel.id changes), exit
  // any active select mode for the previous channel — selection is meaningful
  // only on the surface where it was started.
  useEffect(() => {
    if (!channelIdForSelection) return;
    return () => {
      if (useSelectionStore.getState().channelId === channelIdForSelection) {
        useSelectionStore.getState().exit();
      }
    };
  }, [channelIdForSelection]);

  // Wire ESC to exit select mode (desktop convenience). Skip while the
  // share-preview lightbox is up — it owns ESC there.
  const escGuard = selectModeActive && selectModeChannelId === channelIdForSelection;
  useEffect(() => {
    if (!escGuard) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (picPreviewRef.current) return;
      e.preventDefault();
      exitSelection();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [escGuard, exitSelection]);

  if (!channel) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-black/40 font-display text-lg font-bold uppercase">
        <button onClick={onMobileBack} className="btn-brutal-sm p-1.5 mb-4 md:hidden">
          <ArrowLeft size={14} />
        </button>
        Select a channel
      </div>
    );
  }

  const isDM = channel.type === "dm";
  const displayName =
    channel.peerDisplayName || channel.peerName || channel.name;
  const isAgentDM = isDM && channel.peerType === "agent";
  const isUserDM = isDM && channel.peerType === "user";
  const dmAvatarUrl = channel.peerAvatarUrl || null;
  const isRegularChannel = !isDM;
  const isAllChannel = isRegularChannel && channel.name === "all";
  const hideAllChannelMembersButton = isAllChannel
    && currentServer?.role === "member"
    && currentServer.hideHumansFromMembers;
  const isArchived = !!channel.archivedAt;
  // `joined` is tri-state: `true` (member), `false` (not member), `undefined`
  // (membership not yet hydrated). The bottom CTA must distinguish these:
  // joined → composer, not joined → Join CTA, unknown → render nothing so we
  // don't flash a wrong CTA during first-paint hydration. Before PR #1549 the
  // hydration path always came from `/channels` list (joined populated); after
  // #1549, `ChannelRoute` may hit `/channels/:id` first, which historically
  // omitted `joined`. The server-side fix in this PR now backfills it, but the
  // tri-state guard below pins the contract so any future hydration path that
  // forgets `joined` degrades to a hidden CTA (not a wrong CTA).
  // #engineering:e4f52605 / @xxchan / @哭哭 / @Leiysky.
  const joined: boolean | undefined = isDM ? true : channel.joined;
  const selectModeScopedHere = selectModeActive && selectModeChannelId === channel.id;
  const channelHeaderIcon = isRegularChannel ? <ChannelKindIcon type={channel.type} /> : undefined;
  const channelSubtitle =
    isRegularChannel
      ? channel.description || undefined
      : undefined;

  const currentUnreadCount = unreadCounts[channel.id] || 0;
  const bottomButtonCount = hasNewer ? currentUnreadCount : newMessageCount;
  const showBottomButton = hasNewer || !atBottom || newMessageCount > 0;
  const handleBottomButton = hasNewer ? handleBackToBottom : scrollToBottom;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Header — hidden when embedded in detail panels.
          DMs use titleSlot because the avatar is an interactive profile
          trigger. Regular channels use PanelHeader's native title/subtitle
          stack so the title never competes with long descriptions. */}
      {!hideHeader && (
      <PanelHeader
        onMobileBack={onMobileBack}
        mobileBackProps={{ "data-testid": "chat-mobile-back" }}
        icon={channelHeaderIcon}
        iconAlwaysVisible={isRegularChannel}
        title={isRegularChannel ? channel.name : undefined}
        titleSuffix={
          isRegularChannel && isArchived ? (
            <span className="inline-flex shrink-0 items-center border-2 border-black bg-brutal-orange/30 px-1.5 py-1 text-[11px] font-bold uppercase tracking-wide leading-none">
              Archived
            </span>
          ) : undefined
        }
        subtitle={channelSubtitle}
        titleSlot={
          isAgentDM ? (
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => channel.peerId && useProfileStore.getState().openProfile("agent", channel.peerId)}
                className="shrink-0 hover:brightness-90 transition-colors"
              >
                <AvatarSlot context="panel-header" type="agent" agentAvatarUrl={dmAvatarUrl} />
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="min-w-0 truncate font-bold text-black text-base leading-tight" title={displayName}>{displayName}</span>
                {channel.peerId && <AgentDMStatus agentId={channel.peerId} />}
              </div>
            </div>
          ) : isUserDM ? (
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => channel.peerId && useProfileStore.getState().openProfile("human", channel.peerId)}
                className="shrink-0 hover:brightness-90 transition-colors"
              >
                <AvatarSlot
                  context="panel-header"
                  type="human"
                  humanAvatarUrl={dmAvatarUrl}
                  gravatarHash={channel.peerGravatarHash ?? null}
                  humanPlaceholder={!dmAvatarUrl && !channel.peerGravatarHash}
                />
              </button>
              <div className="min-w-0 flex-1">
                <span className="min-w-0 truncate font-bold text-black text-base leading-tight" title={displayName}>{displayName}</span>
              </div>
            </div>
          ) : undefined
        }
        actions={
          !isAgentDM && !isUserDM && (
            <>
              {/* Stop all agents button */}
              {isRegularChannel && joined && canManageAgents && (
                <Button
                  onClick={() => setShowSOSDialog(true)}
                  shape="icon"
                  title="Stop all agents in this channel"
                >
                  <Square size={14} />
                </Button>
              )}
              {/* Edit button for regular channels */}
              {isRegularChannel && joined && canManageChannels && (
                <Button
                  onClick={() => setShowEditDialog(true)}
                  shape="icon"
                  title="Edit channel"
                >
                  <Settings size={14} />
                </Button>
              )}
              {/* Leave button for joined non-#all channels (icon-only on mobile to save header space) */}
              {isRegularChannel && !isAllChannel && joined && (
                <Button
                  onClick={() => setShowLeaveConfirm(true)}
                  shape="icon"
                  className="sm:w-auto sm:gap-1.5 sm:px-2.5"
                  title="Leave channel"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Leave</span>
                </Button>
              )}
              {!hideAllChannelMembersButton && (
                <ChannelMembers channelId={channel.id} />
              )}
            </>
          )
        }
      />
      )}

      {/* Chat/Tasks tab bar */}
      {!hideHeader && (
        <ReorderablePanelTabs
          tabs={visibleTabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onReorderTabs={reorderTabs}
        />
      )}

      {/* Content: Chat or Tasks.
          stdrc 2026-05-07 #proj-task task #3: channel-level Task tab now
          reuses the server-wide TasksPanel in channel mode (board+list view,
          drag-drop status). The previous TaskBoard / TaskItem flat-list pair
          is retained as legacy reference until we delete it in a follow-up. */}
      {activeTab === "tasks" ? (
        <TasksPanel channelId={channel.id} />
      ) : activeTab === "files" ? (
        <ChannelFilesPanel channel={channel} />
      ) : (
        <>
          {/* Messages — virtualized.
              stdrc 2026-05-02 #proj-uiux:95e25b5b e33f2924: main panel
              整个 white 底，messages scroller 也跟上。bg-white 让整个
              主聊天列从 header 到 composer 全白。 */}
          <div className="relative flex-1 overflow-hidden bg-white">
            {loading && !shouldShowMessageTimeline ? (
              <div className="flex-1 flex items-center justify-center py-4">
                <div className="text-center text-black/40 font-mono text-sm">Loading…</div>
              </div>
            ) : !shouldShowMessageTimeline ? (
              <EmptyState
                className="flex h-full flex-col items-center justify-center"
                icon={<MessageSquare size={36} />}
                title="No messages yet"
                description="Start the conversation."
              />
            ) : (
              <MessageTimeline
                key={channel.id}
                ref={timelineRef}
                source={messageSource}
                renderItem={renderChannelItem}
                header={channelHeader}
                footer={channelFooter}
                onAtBottomChange={handleAtBottomStateChange}
                onVisibleMessageWindowChange={setTranslationWindowIds}
                persistKey={`channel:${channel.id}`}
                className="h-full"
                sparseAnchor="bottom"
              />
            )}
            {showBottomButton && (
              <button
                onClick={handleBottomButton}
                className="btn-brutal-sm absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold z-10"
              >
                <ArrowDown size={12} />
                {bottomButtonCount > 0
                  ? `${bottomButtonCount} new message${bottomButtonCount > 1 ? "s" : ""}`
                  : "Back to bottom"}
              </button>
            )}
          </div>

          {/* Input or Join bar */}
          {readOnly ? (
            <div className="border-t-2 border-black bg-white px-4 py-3">
              <div className="input-brutal flex items-center px-3 py-2 opacity-50 cursor-not-allowed">
                <span className="text-sm text-black/40">Chat is unavailable</span>
              </div>
            </div>
          ) : isArchived ? (
            <div className="flex items-center border-t-2 border-black bg-brutal-orange/20 p-3">
              <div className="flex w-full items-center justify-center gap-2 text-sm font-bold text-black">
                This channel is archived.
                {canManageChannels && (
                  <button
                    onClick={() => setShowEditDialog(true)}
                    className="font-bold text-black underline"
                  >
                    Unarchive
                  </button>
                )}
              </div>
            </div>
          ) : isReadOnlyByQuota ? (
            <div className="flex items-center border-t-2 border-black bg-brutal-orange/20 p-3">
              <div className="flex w-full items-center justify-center gap-2 text-sm font-bold text-black">
                This channel is read-only on the {PLAN_CONFIG[plan].displayName} plan.{" "}
                <button
                  onClick={() => nav.toSettings("server")}
                  className="font-bold text-black underline"
                >
                  Upgrade for more channels
                </button>
              </div>
            </div>
          ) : joined === true ? (
            selectModeScopedHere ? (
              <SelectModeToolbar
                channelId={channel.id}
                capturing={picCapturing}
                copied={copiedMd}
                onSavePic={onSavePic}
                onShareX={onShareX}
                onCopyMd={onCopyMd}
              />
            ) : (
              <MessageInput
                channelId={channel.id}
                channelName={isDM ? `@${displayName}` : `#${channel.name}`}
                showTaskButton={supportsChannelTasks}
                autoFocus
                onWillSend={handleWillSend}
              />
            )
          ) : joined === false ? (
            <div className="flex items-center border-t-2 border-black bg-white p-3">
              <button
                onClick={() => joinChannel(channel.id)}
                className="btn-brutal flex w-full items-center justify-center gap-1.5 bg-brutal-pink px-3 py-1.5 text-sm font-bold"
              >
                <LogIn size={14} />
                Join #{channel.name}
              </button>
            </div>
          ) : null}
        </>
      )}

      {showLeaveConfirm && (
        <ConfirmDialog
          title="Leave Channel"
          message={`Are you sure you want to leave #${channel.name}? You will stop receiving notifications and won't be able to send messages until you rejoin.`}
          confirmLabel="Leave Channel"
          loadingLabel="Leaving…"
          confirmColor="bg-brutal-orange"
          onConfirm={() => leaveChannel(channel.id)}
          onClose={() => setShowLeaveConfirm(false)}
        />
      )}

      {showEditDialog && isRegularChannel && (
        <EditChannelDialog
          channelId={channel.id}
          initialName={channel.name}
          initialDescription={channel.description || ""}
          onClose={() => setShowEditDialog(false)}
        />
      )}

      {showSOSDialog && (
        <SOSDialog
          channelId={channel.id}
          channelName={channel.name}
          onClose={() => setShowSOSDialog(false)}
        />
      )}

      {picPreview && (
        <SelectShareLightbox
          dataUrl={picPreview}
          filename={`slock-${channel.name || "export"}-${new Date().toISOString().slice(0, 10)}.png`}
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
          data-testid="select-share-error"
        >
          Couldn't render image: {picError} — click to dismiss.
        </div>
      )}

    </div>
  );
}
