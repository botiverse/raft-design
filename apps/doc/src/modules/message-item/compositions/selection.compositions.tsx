import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Copy, Image as ImageIcon, MoreHorizontal, Send, TextQuote, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "raft-ui";
import {
  MessageMultiSelectAction,
  MessageMultiSelectActions,
  MessageMultiSelectCount,
  MessageMultiSelectToolbar,
  MessageMultiSelectToolbarContent,
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
  children: ReactNode;
  onCancel: () => void;
  onCopyLink?: () => void;
  onCopyMarkdown?: () => void;
  onForward?: () => void;
  onGenerateImage?: () => void;
};

export function MessageMultiSelectToolbarComposition({
  children,
  onCancel,
  onCopyLink,
  onCopyMarkdown,
  onForward,
  onGenerateImage,
}: MessageMultiSelectToolbarCompositionProps) {
  const actionsRef = useRef<HTMLDivElement>(null);
  const lastActionsWidthRef = useRef(0);
  const [compactLevel, setCompactLevel] = useState(0);
  const compactCopyLink = compactLevel >= 1;
  const compactForward = compactLevel >= 2;
  const compactCancel = compactLevel >= 3;

  useLayoutEffect(() => {
    const actions = actionsRef.current;
    if (!actions) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = actions.clientWidth;
        const gap = Number.parseFloat(getComputedStyle(actions).columnGap) || 0;
        const childrenWidth = Array.from(actions.children).reduce(
          (total, child) => total + (child as HTMLElement).offsetWidth,
          0,
        );
        const requiredWidth = childrenWidth + Math.max(0, actions.children.length - 1) * gap;
        const overflow = requiredWidth > width + 1;
        // Hysteresis: only a clearly wider toolbar resets compaction, so the
        // breakpoint cannot oscillate. Read and update the ref here, not in the
        // updater, which React may run more than once.
        const grew = width > lastActionsWidthRef.current + 8;
        lastActionsWidthRef.current = width;
        setCompactLevel((current) => {
          if (grew && current > 0) return 0;
          return overflow && current < 3 ? current + 1 : current;
        });
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(actions);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [compactLevel, onCopyLink, onForward]);

  return (
    <MessageMultiSelectToolbar
      role="group"
      aria-label="Selected message actions"
      data-testid="select-mode-toolbar"
    >
      <MessageMultiSelectToolbarContent>
        <MessageMultiSelectCount data-testid="select-mode-count">
          {children}
        </MessageMultiSelectCount>
        <MessageMultiSelectActions ref={actionsRef}>
          <MessageMultiSelectAction
            size={compactCancel ? "icon" : "default"}
            onClick={onCancel}
            aria-label="Cancel"
            title="Cancel"
          >
            <X size={14} />
            {compactCancel ? null : <span>Cancel</span>}
          </MessageMultiSelectAction>
          <MessageMultiSelectAction
            size={compactForward ? "icon" : "default"}
            tone="accent"
            aria-label="Forward"
            disabled={!onForward}
            onClick={onForward}
            title="Forward"
          >
            <Send size={14} />
            {compactForward ? null : <span>Forward</span>}
          </MessageMultiSelectAction>
          <MessageMultiSelectAction
            size={compactCopyLink ? "icon" : "default"}
            aria-label="Copy link"
            disabled={!onCopyLink}
            onClick={onCopyLink}
            title="Copy link"
          >
            <Copy size={14} />
            {compactCopyLink ? null : <span>Copy link</span>}
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
      </MessageMultiSelectToolbarContent>
    </MessageMultiSelectToolbar>
  );
}
