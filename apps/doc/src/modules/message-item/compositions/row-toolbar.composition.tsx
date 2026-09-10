import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useMediaQuery } from "foxact/use-media-query";
import { Bookmark, MessageSquare, SmilePlus } from "lucide-react";
import { MessageItemToolbar, MessageItemToolbarButton } from "raft-ui";
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
      className={visible ? "pointer-events-auto opacity-100" : undefined}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={reactionOpen ? scheduleClose : undefined}
    >
      {replyRender ? (
        <MessageItemToolbarButton aria-label="Reply in thread" render={replyRender}>
          <MessageSquare />
        </MessageItemToolbarButton>
      ) : onReplyInThread ? (
        <MessageItemToolbarButton aria-label="Reply in thread" onClick={onReplyInThread}>
          <MessageSquare />
        </MessageItemToolbarButton>
      ) : null}
      <MessageQuickReactionPicker
        open={reactionOpen}
        onOpenChange={setReactionOpen}
        onReact={onReact}
        trigger={
          <MessageItemToolbarButton aria-label="Add reaction">
            <SmilePlus />
          </MessageItemToolbarButton>
        }
        side="bottom"
        align="center"
        sideOffset={8}
        portalContainer={portalContainer}
        contentOnMouseEnter={clearCloseTimer}
        contentOnMouseLeave={scheduleClose}
      />
      <MessageItemToolbarButton
        active={saved}
        aria-label={saved ? "Remove from Saved" : "Save message"}
        aria-pressed={saved}
        onClick={() => onSavedChange(!saved)}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </MessageItemToolbarButton>
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
        onReplyInThread={() => undefined}
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
