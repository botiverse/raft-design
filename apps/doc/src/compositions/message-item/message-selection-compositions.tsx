import type { ReactNode } from "react";
import { Copy, Image as ImageIcon, MoreHorizontal, Send, TextQuote, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "raft-ui";
import {
  MessageMultiSelectAction,
  MessageMultiSelectActions,
  MessageMultiSelectCount,
  MessageMultiSelectToolbar,
  MessageTextSelection,
  MessageTextSelectionMenu,
  MessageTextSelectionMenuItem,
  MessageTextSelectionMenuSeparator,
  useMessageTextSelection,
} from "raft-ui/wip";

export type MessageTextSelectionCompositionProps = {
  children: ReactNode;
  onQuote?: (text: string) => void;
};

function MessageTextSelectionActions({
  onQuote,
}: Pick<MessageTextSelectionCompositionProps, "onQuote">) {
  const selection = useMessageTextSelection();

  return (
    <MessageTextSelectionMenu>
      {onQuote ? (
        <>
          <MessageTextSelectionMenuItem onClick={() => onQuote(selection?.text ?? "")}>
            <TextQuote size={13} />
            Quote
          </MessageTextSelectionMenuItem>
          <MessageTextSelectionMenuSeparator />
        </>
      ) : null}
      <MessageTextSelectionMenuItem
        onClick={() => {
          if (selection?.text) void navigator.clipboard.writeText(selection.text);
        }}
      >
        <Copy size={13} />
        Copy
      </MessageTextSelectionMenuItem>
    </MessageTextSelectionMenu>
  );
}

export function MessageTextSelectionComposition({
  children,
  onQuote,
}: MessageTextSelectionCompositionProps) {
  return (
    <MessageTextSelection>
      {children}
      <MessageTextSelectionActions onQuote={onQuote} />
    </MessageTextSelection>
  );
}

export type MessageMultiSelectToolbarCompositionProps = {
  count: number;
  onCancel: () => void;
  onCopyLink?: () => void;
  onCopyMarkdown?: () => void;
  onForward?: () => void;
  onGenerateImage?: () => void;
};

export function MessageMultiSelectToolbarComposition({
  count,
  onCancel,
  onCopyLink,
  onCopyMarkdown,
  onForward,
  onGenerateImage,
}: MessageMultiSelectToolbarCompositionProps) {
  return (
    <MessageMultiSelectToolbar
      role="group"
      aria-label="Selected message actions"
      data-testid="select-mode-toolbar"
    >
      <MessageMultiSelectCount data-testid="select-mode-count">
        {count} selected
      </MessageMultiSelectCount>
      <MessageMultiSelectActions>
        <MessageMultiSelectAction onClick={onCancel} aria-label="Cancel" title="Cancel">
          <X size={14} />
          <span>Cancel</span>
        </MessageMultiSelectAction>
        <MessageMultiSelectAction
          tone="accent"
          aria-label="Forward"
          disabled={!onForward}
          onClick={onForward}
          title="Forward"
        >
          <Send size={14} />
          <span>Forward</span>
        </MessageMultiSelectAction>
        <MessageMultiSelectAction
          aria-label="Copy link"
          disabled={!onCopyLink}
          onClick={onCopyLink}
          title="Copy link"
        >
          <Copy size={14} />
          <span>Copy link</span>
        </MessageMultiSelectAction>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <MessageMultiSelectAction
                size="icon"
                aria-label="More selected message actions"
                disabled={!onGenerateImage && !onCopyMarkdown}
                title="More"
              >
                <MoreHorizontal size={14} />
              </MessageMultiSelectAction>
            }
          />
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={8}
            data-testid="select-mode-more-menu"
            className="min-w-44"
          >
            <DropdownMenuItem disabled={!onGenerateImage} onClick={onGenerateImage}>
              <ImageIcon size={14} />
              Generate image
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!onCopyMarkdown} onClick={onCopyMarkdown}>
              <Copy size={14} />
              Copy MD
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </MessageMultiSelectActions>
    </MessageMultiSelectToolbar>
  );
}
