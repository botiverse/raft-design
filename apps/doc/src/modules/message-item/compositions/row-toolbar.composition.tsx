import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useMediaQuery } from "foxact/use-media-query";
import { Bookmark, MessageSquare, SmilePlus } from "lucide-react";
import { MessageItemSaveButton, MessageItemToolbar, MessageItemToolbarButton } from "raft-ui/wip";
import { MessageQuickReactionPicker } from "./quick-reaction-picker.composition.tsx";

export type MessageRowToolbarProps = {
  saved?: boolean;
  portalContainer?: HTMLElement | null;
  replyRender?: ReactElement;
  onReact: (emoji: string) => void;
  onReplyInThread?: () => void;
  onSavedChange: (saved: boolean) => void;
  visible?: boolean;
};

export function MessageRowToolbar({
  saved = false,
  portalContainer,
  replyRender,
  onReact,
  onReplyInThread,
  onSavedChange,
  visible,
}: MessageRowToolbarProps) {
  const coarsePointer = useMediaQuery("(pointer: coarse)", false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setReactionOpen(false);
      closeTimerRef.current = null;
    }, 120);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  if (coarsePointer) return null;

  return (
    <MessageItemToolbar
      visible={visible || reactionOpen}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={reactionOpen ? scheduleClose : undefined}
    >
      {replyRender ? (
        <MessageItemToolbarButton aria-label="Reply in thread" render={replyRender}>
          <MessageSquare />
        </MessageItemToolbarButton>
      ) : (
        <MessageItemToolbarButton
          aria-label="Reply in thread"
          disabled={!onReplyInThread}
          onClick={onReplyInThread}
        >
          <MessageSquare />
        </MessageItemToolbarButton>
      )}
      <MessageQuickReactionPicker
        open={reactionOpen}
        onOpenChange={setReactionOpen}
        onReact={onReact}
        trigger={
          <MessageItemToolbarButton aria-pressed={reactionOpen} aria-label="Add reaction">
            <SmilePlus />
          </MessageItemToolbarButton>
        }
        side="bottom"
        align="end"
        sideOffset={4}
        portalContainer={portalContainer}
        contentOnMouseEnter={clearCloseTimer}
        contentOnMouseLeave={scheduleClose}
      />
      <MessageItemSaveButton
        aria-pressed={saved}
        aria-label={saved ? "Remove from Saved" : "Save message"}
        onClick={() => onSavedChange(!saved)}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </MessageItemSaveButton>
    </MessageItemToolbar>
  );
}

export function MessageRowToolbarFixture({
  saved = false,
  visible,
}: {
  saved?: boolean;
  visible?: boolean;
}) {
  const [isSaved, setIsSaved] = useState(saved);
  const [selectedReaction, setSelectedReaction] = useState<string>();

  return (
    <>
      <MessageRowToolbar
        saved={isSaved}
        visible={visible}
        portalContainer={null}
        onReact={setSelectedReaction}
        onSavedChange={setIsSaved}
      />
      {selectedReaction ? (
        <span className="sr-only" role="status">
          Reacted with {selectedReaction}
        </span>
      ) : null}
    </>
  );
}
