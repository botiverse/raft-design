import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Copy, Image as ImageIcon, MoreHorizontal, Send, X } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MessageMultiSelectToolbar,
  MessageMultiSelectToolbarActions,
} from "@botiverse/raft-ui";

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
      <span
        data-testid="select-mode-count"
        className="inline-flex items-center whitespace-nowrap font-sans text-xs font-[400] leading-none tabular-nums text-foreground-muted"
      >
        {children}
      </span>
      <MessageMultiSelectToolbarActions ref={actionsRef}>
        <Button
          size={compactCancel ? "icon-xs" : "xs"}
          onClick={onCancel}
          aria-label="Cancel"
          title="Cancel"
        >
          <X className="size-3.5" />
          {compactCancel ? null : <span>Cancel</span>}
        </Button>
        <Button
          size={compactForward ? "icon-xs" : "xs"}
          variant="accent"
          aria-label="Forward"
          disabled={!onForward}
          onClick={onForward}
          title="Forward"
        >
          <Send className="size-3.5" />
          {compactForward ? null : <span>Forward</span>}
        </Button>
        <Button
          size={compactCopyLink ? "icon-xs" : "xs"}
          aria-label="Copy link"
          disabled={!onCopyLink}
          onClick={onCopyLink}
          title="Copy link"
        >
          <Copy className="size-3.5" />
          {compactCopyLink ? null : <span>Copy link</span>}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon-xs"
                aria-label="More selected message actions"
                disabled={!onGenerateImage && !onCopyMarkdown}
                title="More"
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
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
      </MessageMultiSelectToolbarActions>
    </MessageMultiSelectToolbar>
  );
}
