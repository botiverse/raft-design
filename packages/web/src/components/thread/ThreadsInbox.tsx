import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Activity, ArrowUp, AtSign, Ban, Check, CheckCircle, Circle, Eye, Mail, MailOpen, MessageSquare, MessageSquareText, Play } from "lucide-react";
import { getInboxItemKey, useInboxStore, type InboxItem, type InboxFilter } from "../../store/inboxStore";
import { useChannelStore } from "../../store/channelStore";
import { useAgentStore } from "../../store/agentStore";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import { useThreadStore } from "../../store/threadStore";
import { useAppNavigate, useMobileBack } from "../../hooks/useAppNavigate";
import api from "../../api/client";
import { resolveMessageSenderMemberFromList } from "../../utils/messageSenderMember";
import ConversationPreviewCard from "../ui/cards/ConversationPreviewCard";
import SegmentedControl from "../ui/SegmentedControl";
import PanelHeader from "../ui/PanelHeader";
import EmptyState from "../ui/EmptyState";
import MenuItem from "../ui/MenuItem";

function formatRelativeTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < hour) return rtf.format(Math.round(diffMs / minute), "minute");
  if (absMs < day) return rtf.format(Math.round(diffMs / hour), "hour");
  return rtf.format(Math.round(diffMs / day), "day");
}

function itemKey(item: InboxItem): string {
  return getInboxItemKey(item);
}

function itemChannelId(item: InboxItem): string {
  return item.kind === "thread" ? item.threadChannelId : item.channelId;
}

function itemUnreadCount(item: InboxItem): number {
  return item.unreadCount;
}

type ThreadInboxItem = Extract<InboxItem, { kind: "thread" }>;

function asThreadItem(item: InboxItem): ThreadInboxItem | null {
  return item.kind === "thread" ? item : null;
}

interface CtxMenu {
  x: number;
  y: number;
  item: InboxItem;
}

function InboxRow({ item, filter, onOpen, onDone, onContextMenu, focused, focusRef }: {
  item: InboxItem;
  filter: InboxFilter;
  onOpen: () => void;
  onDone: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  focused?: boolean;
  focusRef?: React.Ref<HTMLButtonElement>;
}) {
  const channels = useChannelStore((s) => s.channels);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const agents = useAgentStore((s) => s.agents);
  const members = useServerStore((s) => s.members);
  const currentUser = useAuthStore((s) => s.user);

  const timestamp = item.kind === "thread"
    ? formatRelativeTime(item.lastActivityAt)
    : formatRelativeTime(item.lastMessageAt);
  const unreadCount = itemUnreadCount(item);
  const shouldShowMentionBadge = filter !== "mentions" && item.hasMention && unreadCount > 0;

  const channelLabel = (() => {
    if (item.kind === "thread") {
      if (item.parentChannelType === "dm") {
        const ch = channels.find((c) => c.id === item.parentChannelId)
          || dmChannels.find((c) => c.id === item.parentChannelId);
        return `@${ch?.peerDisplayName || ch?.peerName || item.parentChannelName}`;
      }
      return `#${item.parentChannelName}`;
    }
    if (item.kind === "dm") {
      const ch = dmChannels.find((c) => c.id === item.channelId);
      return `@${ch?.peerDisplayName || ch?.peerName || item.channelName}`;
    }
    return `#${item.channelName}`;
  })();

  const senderType = item.kind === "thread" ? item.latestActivitySenderType : item.lastMessageSenderType;
  const senderId = item.kind === "thread" ? item.latestActivitySenderId : item.lastMessageSenderId;
  const senderAgent = senderType === "agent" ? agents.find((a) => a.id === senderId) : null;
  const senderMember = senderType === "user"
    ? resolveMessageSenderMemberFromList({ senderType, senderId }, members, currentUser) ?? null
    : null;
  const senderName = senderAgent?.displayName
    ?? senderAgent?.name
    ?? senderMember?.displayName
    ?? senderMember?.name
    ?? (item.kind === "thread" ? null : item.lastMessageSenderName);
  const threadItem = asThreadItem(item);
  const isThread = Boolean(threadItem);
  const preview = item.kind === "thread" ? item.parentMessagePreview : item.lastMessagePreview;
  const secondaryPreview = threadItem && threadItem.replyCount > 0 ? (
    <>
      {senderName ? (
        <span className={`font-bold ${unreadCount > 0 ? "text-black" : "text-black/55"}`}>{senderName}: </span>
      ) : null}
      <span>{threadItem.latestActivityPreview}</span>
    </>
  ) : null;

  return (
    <ConversationPreviewCard
      ref={focusRef}
      testId="inbox-row"
      onClick={onOpen}
      onContextMenu={onContextMenu}
      focused={focused}
      channelLabel={channelLabel}
      author={!isThread && senderName ? (
        senderAgent
          ? { kind: "agent", name: senderName, avatarUrl: senderAgent.avatarUrl ?? null }
          : { kind: "user", name: senderName, avatarUrl: senderMember?.avatarUrl ?? null, gravatarHash: senderMember?.gravatarHash ?? null }
      ) : null}
      timestamp={timestamp}
      preview={preview}
      previewAuthor={isThread ? null : senderName}
      previewLeading={isThread ? <MessageSquare size={13} className="shrink-0 text-brutal-pink" /> : null}
      previewLineClampClassName={isThread ? "line-clamp-2" : undefined}
      previewClassName={isThread && unreadCount === 0 ? "font-bold text-black/50" : undefined}
      secondaryPreview={secondaryPreview}
      secondaryPreviewClassName={isThread && unreadCount > 0 ? "text-black" : undefined}
      emphasized={unreadCount > 0}
      footer={
        <>
          {threadItem && threadItem.taskNumber != null && threadItem.taskStatus && (() => {
            const statusConfig: Record<string, { bg: string; icon: typeof Circle }> = {
              todo: { bg: "bg-brutal-orange", icon: Circle },
              in_progress: { bg: "bg-brutal-cyan", icon: Play },
              in_review: { bg: "bg-brutal-lavender", icon: Eye },
              done: { bg: "bg-brutal-lime", icon: CheckCircle },
              closed: { bg: "bg-brutal-red", icon: Ban },
            };
            const cfg = statusConfig[threadItem.taskStatus] || statusConfig.todo;
            const Icon = cfg.icon;
            return (
              <span className={`inline-flex items-center gap-1 border border-black px-1.5 py-0.5 text-[10px] font-bold ${cfg.bg}`}>
                <Icon size={10} />
                #{threadItem.taskNumber}
                {threadItem.taskClaimedByName && ` @${threadItem.taskClaimedByName}`}
              </span>
            );
          })()}
          {threadItem && (
            <span className="font-mono text-[10px] text-black/40">
              {threadItem.replyCount} {threadItem.replyCount === 1 ? "reply" : "replies"}
            </span>
          )}
          {shouldShowMentionBadge && (
            <span
              className="inline-flex items-center gap-1 rounded border border-black bg-brutal-yellow px-1.5 py-0.5 text-[10px] font-bold leading-none text-black"
              data-testid="inbox-mention-badge"
              title="Unread messages mention you"
            >
              <AtSign size={10} />
              you
            </span>
          )}
          {unreadCount > 0 && (
            <span className="rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
              {unreadCount} new
            </span>
          )}
        </>
      }
      action={
        <div
          onClick={(e) => { e.stopPropagation(); onDone(); }}
          className="btn-brutal-sm bg-white p-1.5"
          title="Mark as Done"
          role="button"
        >
          <Check size={14} />
        </div>
      }
    />
  );
}

export default function ThreadsInbox() {
  const serverSlug = useServerStore((s) => s.current?.slug);
  const onMobileBack = useMobileBack(serverSlug ? `/s/${serverSlug}` : "/");
  const items = useInboxStore((s) => s.items);
  const filter = useInboxStore((s) => s.filter);
  const loading = useInboxStore((s) => s.loading);
  const loadingMore = useInboxStore((s) => s.loadingMore);
  const hasMore = useInboxStore((s) => s.hasMore);
  const totalCount = useInboxStore((s) => s.totalCount);
  const totalUnreadCount = useInboxStore((s) => s.totalUnreadCount);
  const savedScrollTop = useInboxStore((s) => s.scrollTop);
  const focusedItemKey = useInboxStore((s) => s.focusedItemKey);
  const setFilter = useInboxStore((s) => s.setFilter);
  const setSavedScrollTop = useInboxStore((s) => s.setScrollTop);
  const setFocusedItemKey = useInboxStore((s) => s.setFocusedItemKey);
  const loadInbox = useInboxStore((s) => s.loadInbox);
  const refreshInbox = useInboxStore((s) => s.refreshInbox);
  const markRead = useInboxStore((s) => s.markRead);
  const markAllRead = useInboxStore((s) => s.markAllRead);
  const markDone = useInboxStore((s) => s.markDone);
  const openThread = useThreadStore((s) => s.openThread);
  const focusedThreadChannelId = useThreadStore((s) => s.focusedThreadChannelId);
  const setFocusedThreadChannelId = useThreadStore((s) => s.setFocusedThreadChannelId);
  const nav = useAppNavigate();
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const focusedRowRef = useRef<HTMLButtonElement>(null);
  const isNearTopRef = useRef(true);
  const [newUpdateCount, setNewUpdateCount] = useState(0);
  const prevItemsRef = useRef(items);
  const restoredScrollRef = useRef(false);
  const activeFocusKey = focusedItemKey ?? (focusedThreadChannelId ? `thread:${focusedThreadChannelId}` : null);

  useEffect(() => {
    if (items.length === 0) {
      loadInbox({ reset: true });
    }
  }, [items.length, loadInbox]);

  useEffect(() => {
    restoredScrollRef.current = false;
  }, [filter]);

  useEffect(() => {
    if (restoredScrollRef.current || items.length === 0) return;
    const container = scrollRef.current;
    if (!container) return;
    const raf = requestAnimationFrame(() => {
      container.scrollTop = savedScrollTop;
      isNearTopRef.current = savedScrollTop < 50;
      restoredScrollRef.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, [items.length, savedScrollTop]);

  useEffect(() => {
    if (!activeFocusKey) return;
    const idx = items.findIndex((item) => itemKey(item) === activeFocusKey);
    if (idx === -1) return;
    const raf = requestAnimationFrame(() => {
      const container = scrollRef.current;
      const row = focusedRowRef.current;
      if (!container || !row) return;
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      container.scrollTo({ top: container.scrollTop + rowRect.top - containerRect.top - 8, behavior: "smooth" });
      isNearTopRef.current = false;
    });
    return () => cancelAnimationFrame(raf);
  }, [activeFocusKey, items]);

  useEffect(() => {
    if (!focusedItemKey) return;
    const t = setTimeout(() => setFocusedItemKey(null), 3000);
    return () => clearTimeout(t);
  }, [focusedItemKey, setFocusedItemKey]);

  useEffect(() => {
    if (!focusedThreadChannelId) return;
    const t = setTimeout(() => setFocusedThreadChannelId(null), 3000);
    return () => clearTimeout(t);
  }, [focusedThreadChannelId, setFocusedThreadChannelId]);

  useEffect(() => {
    const prev = prevItemsRef.current;
    prevItemsRef.current = items;
    if (prev === items) return;
    const prevTopId = prev[0] ? itemKey(prev[0]) : null;
    const newTopId = items[0] ? itemKey(items[0]) : null;
    if (prevTopId && newTopId && prevTopId !== newTopId && !isNearTopRef.current) {
      setNewUpdateCount((c) => c + 1);
    }
    if (isNearTopRef.current && scrollRef.current && !focusedThreadChannelId) {
      scrollRef.current.scrollTop = 0;
      setSavedScrollTop(0);
    }
  }, [items, focusedThreadChannelId, setSavedScrollTop]);

  useEffect(() => {
    if (!ctxMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setCtxMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ctxMenu]);

  const handleOpen = (item: InboxItem) => {
    if (item.unreadCount > 0) {
      void markRead(item);
    }
    if (item.kind === "thread") {
      const targetMessageId = item.unreadCount > 0
        ? item.firstUnreadMessageId ?? item.latestActivityMessageId
        : item.latestActivityMessageId;
      void openThread(
        item.parentChannelId,
        item.parentMessageId,
        targetMessageId,
      );
    } else if (item.kind === "dm") {
      nav.toDmMessage(item.channelId, item.unreadCount > 0 ? item.firstUnreadMessageId ?? item.lastMessageId : item.lastMessageId);
    } else {
      nav.toMessage(item.channelId, item.unreadCount > 0 ? item.firstUnreadMessageId ?? item.lastMessageId : item.lastMessageId);
    }
  };

  const openCtxMenu = useCallback((e: React.MouseEvent, item: InboxItem) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const focusNextUnread = useCallback(() => {
    const unreadItems = items.filter((item) => item.unreadCount > 0);
    if (unreadItems.length === 0) return;
    const currentIdx = activeFocusKey
      ? unreadItems.findIndex((item) => itemKey(item) === activeFocusKey)
      : -1;
    const next = unreadItems[(currentIdx + 1) % unreadItems.length];
    setFocusedItemKey(itemKey(next));
  }, [activeFocusKey, items, setFocusedItemKey]);

  const handleHeaderTitleClick = useCallback((event: React.MouseEvent) => {
    if (event.detail < 2) return;
    focusNextUnread();
  }, [focusNextUnread]);

  const handleScroll = (target: HTMLDivElement) => {
    isNearTopRef.current = target.scrollTop < 50;
    setSavedScrollTop(target.scrollTop);
    if (isNearTopRef.current) setNewUpdateCount(0);
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 240 && hasMore && !loadingMore) {
      void loadInbox();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        title="Activity"
        subtitle={`${totalCount} active${totalUnreadCount > 0 ? ` · ${totalUnreadCount} unread` : ""}`}
        icon={<Activity size={18} />}
        iconBg="bg-brutal-yellow"
        onMobileBack={onMobileBack}
        containerProps={{
          "data-testid": "inbox-header",
          title: "Double-click to jump to the next unread item",
        }}
        titleClickProps={{
          "data-testid": "inbox-header-title",
          title: "Double-click to jump to the next unread item",
          onClick: handleHeaderTitleClick,
        }}
      />

      <div
        data-testid="inbox-toolbar"
        className="flex h-[54px] shrink-0 items-center justify-between gap-3 border-b-2 border-black bg-white px-4"
      >
        <div className="min-w-0">
          <div className="min-w-0">
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              ariaLabel="Filter inbox"
              options={[
                { value: "all", label: "All", testId: "inbox-filter-all" },
                { value: "unread", label: "Unread", testId: "inbox-filter-unread" },
                { value: "mentions", label: "Mentions", testId: "inbox-filter-mentions" },
              ]}
            />
          </div>
        </div>
        {totalUnreadCount > 0 && (
          <button
            onClick={() => void markAllRead()}
            className="btn-brutal-sm inline-flex h-7 shrink-0 items-center whitespace-nowrap bg-white px-2 text-xs font-bold"
            title="Mark all as read"
            data-testid="inbox-mark-all-read"
          >
            Mark all read
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        data-testid="inbox-scroll"
        className="relative flex-1 overflow-y-auto bg-white p-4 safe-bottom"
        onScroll={(e) => handleScroll(e.currentTarget)}
      >
        {newUpdateCount > 0 && (
          <button
            onClick={() => {
              scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              setNewUpdateCount(0);
            }}
            className="btn-brutal-sm sticky top-0 left-1/2 -translate-x-1/2 z-10 mb-2 flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold"
          >
            <ArrowUp size={14} />
            {newUpdateCount} new update{newUpdateCount > 1 ? "s" : ""}
          </button>
        )}
        {loading && items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm font-bold text-black/40">Loading Inbox…</div>
        ) : items.length === 0 ? (
          <EmptyState
            className="flex h-full flex-col items-center justify-center"
            icon={<MessageSquareText size={36} />}
            title={filter === "mentions"
              ? "No mentions yet"
              : filter === "unread"
              ? "No unread chats"
              : "Activity is empty"}
            description={filter === "mentions"
              ? "Channels, DMs, and threads where someone @mentions you will appear here."
              : "Channels, DMs, and followed threads stay here until they are done."}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const isFocused = itemKey(item) === activeFocusKey;
              return (
                <InboxRow
                  key={itemKey(item)}
                  item={item}
                  filter={filter}
                  onOpen={() => handleOpen(item)}
                  onDone={() => void markDone(item)}
                  onContextMenu={(e) => openCtxMenu(e, item)}
                  focused={isFocused}
                  focusRef={isFocused ? focusedRowRef : undefined}
                />
              );
            })}
            {loadingMore && (
              <div className="py-3 text-center text-xs font-bold text-black/40">Loading more…</div>
            )}
          </div>
        )}
      </div>

      {ctxMenu && createPortal(
        <div
          ref={menuRef}
          className="card-brutal fixed z-50 overflow-hidden"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
        >
          <MenuItem
            icon={ctxMenu.item.unreadCount > 0 ? <MailOpen size={14} /> : <Mail size={14} />}
            onClick={async () => {
              const channelId = itemChannelId(ctxMenu.item);
              if (ctxMenu.item.unreadCount > 0) {
                await api.post(`/channels/${channelId}/read-all`);
              } else {
                await api.post(`/channels/${channelId}/unread`).catch(() => {});
              }
              await refreshInbox();
              setCtxMenu(null);
            }}
          >
            {ctxMenu.item.unreadCount > 0 ? "Mark as Read" : "Mark as Unread"}
          </MenuItem>
          <MenuItem
            icon={<Check size={14} />}
            onClick={() => {
              void markDone(ctxMenu.item);
              setCtxMenu(null);
            }}
          >
            Done
          </MenuItem>
        </div>,
        document.body,
      )}
    </div>
  );
}
