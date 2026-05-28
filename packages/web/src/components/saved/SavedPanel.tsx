import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark, BookmarkMinus, Copy, Link, MessageSquare } from "lucide-react";
import { useSavedStore, type SavedEntry } from "../../store/savedStore";
import { useAgentStore } from "../../store/agentStore";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import { useThreadStore } from "../../store/threadStore";
import { useAppNavigate, useMobileBack, buildMessagePermalink } from "../../hooks/useAppNavigate";
import { resolveMessageSenderMemberFromList } from "../../utils/messageSenderMember";
import ContextMenuDivider from "../ui/ContextMenuDivider";
import MenuItem from "../ui/MenuItem";
import AvatarSlot from "../ui/AvatarSlot";
import PanelHeader from "../ui/PanelHeader";
import DismissBackdrop from "../ui/DismissBackdrop";
import EmptyState from "../ui/EmptyState";

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }
  if (absMs < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }
  return rtf.format(Math.round(diffMs / day), "day");
}

function SavedItem({ entry, onOpen, onRemove, serverSlug }: {
  entry: SavedEntry;
  onOpen: () => void;
  onRemove: () => void;
  serverSlug: string | undefined;
}) {
  const agents = useAgentStore((s) => s.agents);
  const members = useServerStore((s) => s.members);
  const currentUser = useAuthStore((s) => s.user);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  const isThread = entry.channelType === "thread";
  const isDm = isThread
    ? entry.parentChannelType === "dm"
    : entry.channelType === "dm";
  const sourceChannelName = isThread
    ? entry.parentChannelName
    : entry.channelName;
  const channelLabel = isDm
    ? `@${entry.senderName || entry.senderId}`
    : `#${sourceChannelName}`;

  const senderAgent = entry.senderType === "agent"
    ? agents.find((a) => a.id === entry.senderId)
    : null;
  const senderMember = entry.senderType === "user"
    ? resolveMessageSenderMemberFromList({ senderType: "user", senderId: entry.senderId }, members, currentUser) ?? null
    : null;
  const senderName = senderAgent?.displayName ?? senderAgent?.name ?? senderMember?.displayName ?? senderMember?.name ?? entry.senderName;

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({
      x: Math.min(e.clientX, window.innerWidth - 200),
      y: Math.min(e.clientY, window.innerHeight - 100),
    });
  }, []);

  const handleCopyLink = useCallback(() => {
    if (!serverSlug) return;
    const channelForLink = isThread ? entry.parentChannelId || entry.channelId : entry.channelId;
    const routeKind = isDm ? "dm" : "channel";
    const url = buildMessagePermalink(serverSlug, channelForLink, entry.messageId, {
      routeKind,
      threadParentMessageId: isThread ? entry.parentMessageId : null,
    });
    navigator.clipboard.writeText(url).then(() => setCtxMenu(null));
  }, [serverSlug, isDm, isThread, entry.parentChannelId, entry.parentMessageId, entry.channelId, entry.messageId]);

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(entry.content).then(() => setCtxMenu(null));
  }, [entry.content]);

  const handleRemove = useCallback(() => {
    setCtxMenu(null);
    onRemove();
  }, [onRemove]);

  const handleCloseCtx = useCallback(() => setCtxMenu(null), []);

  return (
    <>
      <button
        onClick={onOpen}
        onContextMenu={handleContextMenu}
        className={`relative flex items-start gap-3 border-2 transition-colors p-3 bg-white text-left w-full ${
          ctxMenu
            ? "border-black shadow-brutal-sm"
            : "border-black/30 hover:border-black hover:shadow-brutal-sm active:border-black active:shadow-brutal-sm"
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-bold text-black/50">{channelLabel}</span>
            {isThread && (
              <span className="inline-flex items-center gap-1 font-bold text-black/40">
                <MessageSquare size={10} />
                thread
              </span>
            )}
            {senderName && (
              <span className="inline-flex items-center gap-1 font-bold text-black">
                {senderAgent ? (
                  <AvatarSlot context="preview-mini" type="agent" agentAvatarUrl={senderAgent.avatarUrl ?? null} />
                ) : (
                  <AvatarSlot context="preview-mini" type="human" humanAvatarUrl={senderMember?.avatarUrl} gravatarHash={senderMember?.gravatarHash} />
                )}
                <span>{senderName}</span>
              </span>
            )}
            <span className="text-xs text-black/40 font-mono">
              {formatRelativeTime(entry.createdAt)}
            </span>
          </div>
          <p className="text-sm line-clamp-3">
            {entry.content}
          </p>
        </div>
        <div
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="btn-brutal-sm p-1.5 bg-white shrink-0"
          title="Remove from Saved"
          role="button"
        >
          <BookmarkMinus size={14} />
        </div>
      </button>
      {ctxMenu && createPortal(
        <>
          <DismissBackdrop onDismiss={handleCloseCtx} trapContextMenu />
          <div
            className="fixed z-50 card-brutal overflow-hidden"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
          >
            <MenuItem
              icon={<Link size={14} />}
              onClick={handleCopyLink}
            >
              Copy Link
            </MenuItem>
            <MenuItem
              icon={<Copy size={14} />}
              onClick={handleCopyMarkdown}
            >
              Copy Markdown
            </MenuItem>
            <ContextMenuDivider />
            <MenuItem
              icon={<BookmarkMinus size={14} />}
              onClick={handleRemove}
            >
              Remove from Saved
            </MenuItem>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function SavedPanel() {
  const saved = useSavedStore((s) => s.saved);
  const loadSaved = useSavedStore((s) => s.loadSaved);
  const loadMore = useSavedStore((s) => s.loadMore);
  const hasMore = useSavedStore((s) => s.hasMore);
  const loading = useSavedStore((s) => s.loading);
  const unsaveMessage = useSavedStore((s) => s.unsaveMessage);
  const openThread = useThreadStore((s) => s.openThread);
  const serverSlug = useServerStore((s) => s.current?.slug);
  const onMobileBack = useMobileBack(serverSlug ? `/s/${serverSlug}` : "/");
  const nav = useAppNavigate();

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        title="Saved"
        subtitle={`${saved.length} saved`}
        icon={<Bookmark size={18} />}
        iconBg="bg-brutal-yellow"
        onMobileBack={onMobileBack}
      />

      {/* Saved list */}
      <div className="flex-1 overflow-y-auto bg-white p-4 safe-bottom">
        {saved.length === 0 ? (
          <EmptyState
            className="flex h-full flex-col items-center justify-center"
            icon={<Bookmark size={36} />}
            title="No saved messages yet"
            description="Save messages by clicking the bookmark icon on any message."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {saved.map((entry) => (
              <SavedItem
                key={entry.messageId}
                entry={entry}
                serverSlug={serverSlug}
                onOpen={() => {
                  if (entry.channelType === "thread" && entry.parentChannelId && entry.parentMessageId) {
                    nav.toMessage(entry.parentChannelId, entry.parentMessageId);
                    void openThread(entry.parentChannelId, entry.parentMessageId, entry.messageId);
                  } else {
                    nav.toMessage(entry.channelId, entry.messageId);
                  }
                }}
                onRemove={() => unsaveMessage(entry.messageId)}
              />
            ))}
            {hasMore && (
              <div className="flex justify-center py-3">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-brutal-sm bg-white px-4 py-1.5 text-xs"
                >
                  {loading ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
