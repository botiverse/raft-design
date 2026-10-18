import {
  Button,
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "raft-ui";
import { Archive, ChevronRight, Copy, MoonStar, Pin, Trash } from "lucide-react";

// @docs-source-strip-start
import type { ReactNode } from "react";
import { cn } from "tailwind-variants";
import {
  BookmarkPlus,
  ClipboardCheck,
  Forward,
  Link2,
  Mailbox,
  MessageCircle,
  MessageSquareQuote,
} from "lucide-react";
// @docs-source-strip-end

export function ContextMenuComposition() {
  return (
    <ContextMenu>
      <ContextMenuPopup className="flex w-56 min-w-56 flex-col">
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
      </ContextMenuPopup>
    </ContextMenu>
  );
}

// @docs-source-strip-start
function ContextMenuPreviewTrigger({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-h-14 w-56 items-center justify-center px-4 py-3 text-center",
        "border border-dashed border-line-strong bg-layer-canvas text-sm font-medium text-foreground-muted",
      )}
    >
      {children}
    </div>
  );
}

function ReactionRow() {
  return (
    <div className={cn("flex h-9 items-center gap-1 px-2", "-mx-1 rounded-sm bg-layer-canvas/70")}>
      {["👍", "❤️", "😂", "🎉", "👀"].map((emoji) => (
        <Button key={emoji} variant="ghost" size="icon-sm" aria-label={`React with ${emoji}`}>
          {emoji}
        </Button>
      ))}
    </div>
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
  minHeight = "min-h-56",
  triggerLabel,
}: {
  children: ReactNode;
  className?: string;
  minHeight?: string;
  triggerLabel: string;
}) {
  return (
    <div className={cn("relative size-full ", minHeight, className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <ContextMenuPreviewTrigger>{triggerLabel}</ContextMenuPreviewTrigger>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ContextMenuCompositionPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview className={className} triggerLabel="Right click thread">
      <ContextMenuComposition />
    </InteractiveContextMenuPreview>
  );
}

export function ContextMenuMessageMenuPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview
      className={className}
      minHeight="min-h-72"
      triggerLabel="Right click message"
    >
      <ContextMenu>
        <ContextMenuPopup className="flex w-64 min-w-64 flex-col">
          <StaticMessageMenuRows />
        </ContextMenuPopup>
      </ContextMenu>
    </InteractiveContextMenuPreview>
  );
}

export function ContextMenuSelectionMenuPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview
      className={className}
      minHeight="min-h-40"
      triggerLabel="Right click selection"
    >
      <ContextMenu>
        <ContextMenuPopup className="flex w-48 min-w-48 flex-col">
          <StaticSelectionMenuRows />
        </ContextMenuPopup>
      </ContextMenu>
    </InteractiveContextMenuPreview>
  );
}

export function ContextMenuSidebarMenuPreview({ className }: { className?: string }) {
  return (
    <InteractiveContextMenuPreview
      className={className}
      minHeight="min-h-48"
      triggerLabel="Right click channel"
    >
      <ContextMenu>
        <ContextMenuPopup className="flex w-48 min-w-48 flex-col">
          <StaticSidebarMenuRows />
        </ContextMenuPopup>
      </ContextMenu>
    </InteractiveContextMenuPreview>
  );
}
// @docs-source-strip-end
