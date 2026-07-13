import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { Bookmark, MessageSquare, SmilePlus } from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "raft-ui";
import {
  MessageItemSaveButton,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageReactionPickerContent,
  MessageReactionQuickButton,
} from "raft-ui/wip";
import { MESSAGE_QUICK_REACTIONS } from "#/modules/message-item/message-item.fixtures.ts";
import { MessageReactionGlyphComposition } from "./reaction-glyph.composition.tsx";

export type MessageRowToolbarProps = {
  saved?: boolean;
  portalContainer: HTMLElement | null;
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

  return (
    <MessageItemToolbar
      visible={visible}
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
      <DropdownMenu open={reactionOpen} onOpenChange={setReactionOpen}>
        <DropdownMenuTrigger
          render={
            <MessageItemToolbarButton aria-pressed={reactionOpen} aria-label="Add reaction">
              <SmilePlus />
            </MessageItemToolbarButton>
          }
        />
        <MessageReactionPickerContent
          side="bottom"
          align="end"
          sideOffset={4}
          collisionAvoidance={{ side: "flip", align: "flip" }}
          collisionPadding={8}
          portalProps={{ container: portalContainer }}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          {MESSAGE_QUICK_REACTIONS.map((emoji) => (
            <DropdownMenuItem
              key={emoji}
              render={
                <MessageReactionQuickButton
                  title={`React with ${emoji}`}
                  aria-label={`React with ${emoji}`}
                />
              }
              onClick={() => {
                onReact(emoji);
                setReactionOpen(false);
              }}
            >
              <MessageReactionGlyphComposition emoji={emoji} size={18} />
            </DropdownMenuItem>
          ))}
        </MessageReactionPickerContent>
      </DropdownMenu>
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
