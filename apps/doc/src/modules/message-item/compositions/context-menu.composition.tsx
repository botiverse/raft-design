import {
  Bookmark,
  BookmarkMinus,
  CheckCircle,
  ClipboardCheck,
  Copy,
  Link as LinkIcon,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "raft-ui";
import { MessageReactionQuickButton, MessageReactionQuickRow } from "raft-ui/wip";

import { MESSAGE_QUICK_REACTIONS } from "./reaction.compositions.tsx";
import { MessageReactionGlyphComposition } from "./reaction-glyph.composition.tsx";

export type MessageTaskState = "none" | "open" | "done";

export type MessageContextMenuCompositionProps = {
  followed?: boolean;
  onCopyLink?: () => void;
  onCopyMarkdown?: () => void;
  onFollowChange?: (followed: boolean) => void;
  onOpenThread?: () => void;
  onQuickReact?: (emoji: string) => void;
  onSavedChange?: (saved: boolean) => void;
  onSelectMessage?: () => void;
  onTaskChange?: (task: MessageTaskState) => void;
  portalContainer?: HTMLElement | null;
  saved?: boolean;
  task: MessageTaskState;
};

export function MessageContextMenuComposition({
  followed,
  onCopyLink,
  onCopyMarkdown,
  onFollowChange,
  onOpenThread,
  onQuickReact,
  onSavedChange,
  onSelectMessage,
  onTaskChange,
  portalContainer,
  saved,
  task,
}: MessageContextMenuCompositionProps) {
  const taskAction =
    task === "done"
      ? { icon: <RotateCcw />, label: "Reopen Task" }
      : task === "open"
        ? { icon: <CheckCircle />, label: "Mark as Done" }
        : { icon: <ClipboardCheck />, label: "Convert to Task" };

  return (
    <ContextMenuContent
      aria-label="Message context menu"
      className="overflow-x-hidden overflow-y-auto"
      collisionAvoidance={{ side: "flip", align: "flip" }}
      collisionPadding={8}
      portalProps={portalContainer ? { container: portalContainer } : undefined}
    >
      <MessageReactionQuickRow>
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <ContextMenuItem
            key={emoji}
            nativeButton
            disabled={!onQuickReact}
            onClick={() => onQuickReact?.(emoji)}
            render={
              <MessageReactionQuickButton
                title={`React with ${emoji}`}
                aria-label={`React with ${emoji}`}
              />
            }
          >
            <MessageReactionGlyphComposition emoji={emoji} size={18} />
          </ContextMenuItem>
        ))}
      </MessageReactionQuickRow>
      <ContextMenuSeparator />
      <ContextMenuItem disabled={!onCopyLink} onClick={onCopyLink}>
        <LinkIcon />
        Copy Link
      </ContextMenuItem>
      <ContextMenuItem disabled={!onCopyMarkdown} onClick={onCopyMarkdown}>
        <Copy />
        Copy Markdown
      </ContextMenuItem>
      {onSelectMessage ? (
        <ContextMenuItem onClick={onSelectMessage}>
          <CheckCircle />
          Select Message
        </ContextMenuItem>
      ) : null}
      <ContextMenuSeparator />
      <ContextMenuItem disabled={!onOpenThread} onClick={onOpenThread}>
        <MessageSquare />
        Open Thread
      </ContextMenuItem>
      <ContextMenuItem disabled={!onSavedChange} onClick={() => onSavedChange?.(!saved)}>
        {saved ? <BookmarkMinus /> : <Bookmark />}
        {saved ? "Remove from Saved" : "Save Message"}
      </ContextMenuItem>
      <ContextMenuItem disabled={!onFollowChange} onClick={() => onFollowChange?.(!followed)}>
        <MessageSquare />
        {followed ? "Unfollow Thread" : "Follow Thread"}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        disabled={!onTaskChange}
        onClick={() => onTaskChange?.(task === "open" ? "done" : "open")}
      >
        {taskAction.icon}
        {taskAction.label}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
