import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSubmenu,
  ContextMenuSubmenuTrigger,
  ContextMenuTrigger,
} from "cuvii-rui";
import {
  Archive,
  BookmarkPlus,
  MessageCircle,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Link2,
  Mailbox,
  MessageSquareQuote,
  MoonStar,
  Pin,
  Forward,
  Trash,
} from "lucide-react";

// @docs-source-strip-start
import type { ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
import { cn } from "tailwind-variants";
// @docs-source-strip-end

export function ContextMenuContentPreview() {
  return (
    <>
      <ContextMenuItem>
        <Pin />
        <span className="min-w-0 flex-1 truncate">Pin thread</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy />
        <span className="min-w-0 flex-1 truncate">Copy link</span>
        <ContextMenuShortcut>⌘C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSubmenu>
        <ContextMenuSubmenuTrigger>
          <MoonStar />
          <span className="min-w-0 flex-1 truncate">Move to</span>
          <ChevronRight className="ml-auto" />
        </ContextMenuSubmenuTrigger>
        <ContextMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="flex w-36 min-w-36 flex-col"
        >
          <ContextMenuItem>Inbox</ContextMenuItem>
          <ContextMenuItem>Archive</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuSubmenu>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <Archive />
        <span className="min-w-0 flex-1 truncate">Archive</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Trash />
        <span className="min-w-0 flex-1 truncate">Delete</span>
        <ContextMenuShortcut>⌫</ContextMenuShortcut>
      </ContextMenuItem>
    </>
  );
}

export function ContextMenuComposition() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Right click thread</ContextMenuTrigger>
      <ContextMenuContent className="flex w-56 min-w-56 flex-col">
        <ContextMenuContentPreview />
      </ContextMenuContent>
    </ContextMenu>
  );
}

// @docs-source-strip-start
function ContextMenuPreviewTrigger({ children }: { children: ReactNode }) {
  return (
    <ContextMenuTrigger
      className={cn(
        "flex min-h-14 w-56 items-center justify-center px-4 py-3 text-center",
        "border border-dashed border-line-strong bg-layer-panel text-sm font-medium text-foreground-muted",
        "[[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream [[data-theme=brutal]_&]:font-sans [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black",
      )}
    >
      {children}
    </ContextMenuTrigger>
  );
}

function ReactionRow() {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-1 px-2",
        "-mx-1 rounded-sm bg-layer-panel/70",
        "[[data-theme=brutal]_&]:mx-0 [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:bg-white",
      )}
      data-message-affordance="reaction-quick-row"
    >
      {["👍", "❤️", "😂", "🎉", "👀"].map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={cn(
            "flex size-7 items-center justify-center rounded bg-transparent text-base leading-none transition-colors",
            "hover:bg-foreground/[0.04] active:bg-foreground/[0.06]",
            "[[data-theme=brutal]_&]:hover:bg-brutal-pink/20 [[data-theme=brutal]_&]:active:bg-brutal-pink/20",
          )}
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function StaticContextMenuRows() {
  return (
    <>
      <ContextMenuItem>
        <Pin />
        <span className="min-w-0 flex-1 truncate">Pin thread</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy />
        <span className="min-w-0 flex-1 truncate">Copy link</span>
        <ContextMenuShortcut>⌘C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem>
        <MoonStar />
        <span className="min-w-0 flex-1 truncate">Move to</span>
        <ChevronRight className="ml-auto" />
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <Archive />
        <span className="min-w-0 flex-1 truncate">Archive</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Trash />
        <span className="min-w-0 flex-1 truncate">Delete</span>
        <ContextMenuShortcut>⌫</ContextMenuShortcut>
      </ContextMenuItem>
    </>
  );
}

function StaticMessageMenuRows() {
  return (
    <>
      <ReactionRow />
      <ContextMenuSeparator />
      <ContextMenuItem>
        <Link2 />
        <span className="min-w-0 flex-1 truncate">Copy Link</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy />
        <span className="min-w-0 flex-1 truncate">Copy Markdown</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Forward />
        <span className="min-w-0 flex-1 truncate">Share Messages...</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <MessageCircle />
        <span className="min-w-0 flex-1 truncate">Open Thread</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <BookmarkPlus />
        <span className="min-w-0 flex-1 truncate">Save Message</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <ClipboardCheck />
        <span className="min-w-0 flex-1 truncate">Convert to Task</span>
      </ContextMenuItem>
    </>
  );
}

function StaticSelectionMenuRows() {
  return (
    <>
      <ContextMenuItem>
        <MessageSquareQuote />
        <span className="min-w-0 flex-1 truncate">Quote</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Copy />
        <span className="min-w-0 flex-1 truncate">Copy</span>
      </ContextMenuItem>
    </>
  );
}

function StaticSidebarMenuRows() {
  return (
    <>
      <ContextMenuItem>
        <Mailbox />
        <span className="min-w-0 flex-1 truncate">Mark as Read</span>
      </ContextMenuItem>
      <ContextMenuItem>
        <Pin />
        <span className="min-w-0 flex-1 truncate">Pin</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>
        <Archive />
        <span className="min-w-0 flex-1 truncate">Archive</span>
      </ContextMenuItem>
    </>
  );
}

function InteractiveContextMenuPreview({
  children,
  className,
  contentClassName,
  minHeight = "min-h-56",
  triggerLabel,
}: {
  children: ReactNode;
  className?: string;
  contentClassName: string;
  minHeight?: string;
  triggerLabel: string;
}) {
  const portalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [hasCursorAnchor, setHasCursorAnchor] = useState(false);
  const anchor = {
    getBoundingClientRect() {
      const rect = triggerRef.current?.getBoundingClientRect();
      return DOMRect.fromRect({
        x: rect?.right ?? 0,
        y: rect?.bottom ?? 0,
        width: 0,
        height: 0,
      });
    },
  };

  return (
    <div ref={portalRef} className={cn("relative h-full w-full", minHeight, className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <ContextMenu defaultOpen>
          <div ref={triggerRef} onContextMenuCapture={() => setHasCursorAnchor(true)}>
            <ContextMenuPreviewTrigger>{triggerLabel}</ContextMenuPreviewTrigger>
          </div>
          <ContextMenuContent
            anchor={hasCursorAnchor ? undefined : anchor}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={contentClassName}
          >
            {children}
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}

export function ContextMenuCompositionPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview
      className={className}
      contentClassName="flex w-56 min-w-56 flex-col"
      triggerLabel="Right click thread"
    >
      <StaticContextMenuRows />
    </InteractiveContextMenuPreview>
  );
}

export function ContextMenuMessageMenuPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview
      className={className}
      contentClassName="flex w-64 min-w-64 flex-col"
      minHeight="min-h-72"
      triggerLabel="Right click message"
    >
      <StaticMessageMenuRows />
    </InteractiveContextMenuPreview>
  );
}

export function ContextMenuSelectionMenuPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview
      className={className}
      contentClassName="flex w-48 min-w-48 flex-col"
      minHeight="min-h-40"
      triggerLabel="Right click selection"
    >
      <StaticSelectionMenuRows />
    </InteractiveContextMenuPreview>
  );
}

export function ContextMenuSidebarMenuPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview
      className={className}
      contentClassName="flex w-48 min-w-48 flex-col"
      minHeight="min-h-48"
      triggerLabel="Right click channel"
    >
      <StaticSidebarMenuRows />
    </InteractiveContextMenuPreview>
  );
}
// @docs-source-strip-end
