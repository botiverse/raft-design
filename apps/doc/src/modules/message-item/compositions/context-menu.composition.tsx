import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import {
  Bookmark,
  BookmarkMinus,
  CheckCircle,
  ClipboardCheck,
  Copy,
  Link as LinkIcon,
  MessageSquare,
  RotateCcw,
  SmilePlus,
} from "lucide-react";
import {
  ThreadIcon,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  MessageReactionQuickButton,
  MessageReactionQuickRow,
} from "@botiverse/raft-ui";

import { MESSAGE_QUICK_REACTIONS } from "./reaction.compositions.tsx";
import { MessageReactionGlyphComposition } from "./reaction-glyph.composition.tsx";

export type MessageTaskState = "none" | "open" | "done";

const COLLISION_AVOIDANCE = { side: "flip", align: "flip" } as const;

export type MessageContextMenuCompositionProps = {
  children?: ReactNode;
  followed?: boolean;
  onCopyLink?: () => void;
  onCopyMarkdown?: () => void;
  onFollowChange?: (followed: boolean) => void;
  onOpenThread?: () => void;
  /** Opens every emoji, from the `smile-plus` button that ends the quick reactions. */
  onOpenEmojiPicker?: () => void;
  onQuickReact?: (emoji: string) => void;
  onSavedChange?: (saved: boolean) => void;
  onSelectMessage?: () => void;
  onTaskChange?: (task: MessageTaskState) => void;
  portalContainer?: HTMLElement | null;
  saved?: boolean;
  /** The message's full date and time, as a `<time>`: the menu's first line, not interactive. */
  sentAt?: ReactNode;
  task: MessageTaskState;
};

type MessageQuickReactionItemProps = {
  emoji: string;
  onQuickReact?: (emoji: string) => void;
};

function MessageQuickReactionItem({ emoji, onQuickReact }: MessageQuickReactionItemProps) {
  const handleClick = useCallback(() => onQuickReact?.(emoji), [emoji, onQuickReact]);

  return (
    <ContextMenuItem
      nativeButton
      disabled={!onQuickReact}
      onClick={handleClick}
      render={
        <MessageReactionQuickButton
          title={`React with ${emoji}`}
          aria-label={`React with ${emoji}`}
        />
      }
    >
      <MessageReactionGlyphComposition emoji={emoji} size={22} />
    </ContextMenuItem>
  );
}

export function MessageContextMenuComposition({
  children,
  followed,
  onCopyLink,
  onCopyMarkdown,
  onFollowChange,
  onOpenThread,
  onOpenEmojiPicker,
  onQuickReact,
  onSavedChange,
  onSelectMessage,
  onTaskChange,
  portalContainer,
  saved,
  sentAt,
  task,
}: MessageContextMenuCompositionProps) {
  const taskAction =
    task === "done"
      ? { icon: <RotateCcw />, label: "Reopen Task" }
      : task === "open"
        ? { icon: <CheckCircle />, label: "Mark as Done" }
        : { icon: <ClipboardCheck />, label: "Create Task from Message" };

  const portalProps = useMemo(
    () => (portalContainer ? { container: portalContainer } : undefined),
    [portalContainer],
  );

  const handleSavedToggle = useCallback(() => onSavedChange?.(!saved), [onSavedChange, saved]);
  const handleFollowToggle = useCallback(
    () => onFollowChange?.(!followed),
    [followed, onFollowChange],
  );
  const handleTaskToggle = useCallback(
    () => onTaskChange?.(task === "open" ? "done" : "open"),
    [onTaskChange, task],
  );

  return (
    <ContextMenuContent
      aria-label="Message context menu"
      className="overflow-x-hidden overflow-y-auto"
      collisionAvoidance={COLLISION_AVOIDANCE}
      collisionPadding={8}
      portalProps={portalProps}
    >
      {sentAt ? <ContextMenuLabel>{sentAt}</ContextMenuLabel> : null}
      <MessageReactionQuickRow>
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <MessageQuickReactionItem key={emoji} emoji={emoji} onQuickReact={onQuickReact} />
        ))}
        <ContextMenuItem
          nativeButton
          disabled={!onOpenEmojiPicker}
          onClick={onOpenEmojiPicker}
          render={<MessageReactionQuickButton title="Add Reaction" aria-label="Add Reaction" />}
        >
          <SmilePlus />
        </ContextMenuItem>
      </MessageReactionQuickRow>
      <ContextMenuSeparator />
      {/* Keep going on this message. */}
      {onOpenThread ? (
        <ContextMenuItem onClick={onOpenThread}>
          <ThreadIcon />
          Reply in Thread
        </ContextMenuItem>
      ) : null}
      {onFollowChange ? (
        <ContextMenuItem onClick={handleFollowToggle}>
          <MessageSquare />
          {followed ? "Unfollow Thread" : "Follow Thread"}
        </ContextMenuItem>
      ) : null}
      <ContextMenuItem disabled={!onTaskChange} onClick={handleTaskToggle}>
        {taskAction.icon}
        {taskAction.label}
      </ContextMenuItem>
      <ContextMenuSeparator />
      {/* Take it elsewhere: nothing changes here. */}
      <ContextMenuItem disabled={!onCopyLink} onClick={onCopyLink}>
        <LinkIcon />
        Copy Link
      </ContextMenuItem>
      <ContextMenuItem disabled={!onCopyMarkdown} onClick={onCopyMarkdown}>
        <Copy />
        Copy Markdown
      </ContextMenuItem>
      {children}
      {onSelectMessage ? (
        <ContextMenuItem onClick={onSelectMessage}>
          <CheckCircle />
          Select Message
        </ContextMenuItem>
      ) : null}
      <ContextMenuSeparator />
      {/* Just for me: nobody else sees it. */}
      <ContextMenuItem disabled={!onSavedChange} onClick={handleSavedToggle}>
        {saved ? <BookmarkMinus /> : <Bookmark />}
        {saved ? "Remove from Saved" : "Save Message"}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
