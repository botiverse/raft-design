import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "raft-ui";
import type { ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
import { cn } from "tailwind-variants";
import LegacyContextMenuDivider from "../../../../packages/ui/src/legacy/context-menu-divider.tsx";
import LegacyMenuItem from "../../../../packages/ui/src/legacy/menu-item.tsx";
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

import {
  ContextMenuCompositionPreview,
  ContextMenuMessageMenuPreview,
  ContextMenuSelectionMenuPreview,
  ContextMenuSidebarMenuPreview,
} from "./context-menu-composition.tsx";

export const CONTEXT_MENU_COMPOSITION_PATH =
  "apps/doc/src/compositions/context-menu-composition.tsx" as const;

export {
  ContextMenuCompositionPreview,
  ContextMenuMessageMenuPreview,
  ContextMenuSelectionMenuPreview,
  ContextMenuSidebarMenuPreview,
};

function SourceContextMenuPreview({
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
            <ContextMenuTrigger className="flex min-h-14 w-56 items-center justify-center border-2 border-dashed border-black bg-brutal-cream px-4 py-3 text-center font-sans text-xs font-bold text-black">
              {triggerLabel}
            </ContextMenuTrigger>
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

export function ContextMenuSourcePreview({ className }: { className?: string }) {
  return (
    <SourceContextMenuPreview
      className={className}
      contentClassName="flex w-56 min-w-56 flex-col"
      triggerLabel="Right click thread"
    >
      <LegacyMenuItem icon={<Pin className="size-3.5" />}>Pin thread</LegacyMenuItem>
      <LegacyMenuItem
        icon={<Copy className="size-3.5" />}
        trailing={<span className="ml-auto font-sans text-sm font-medium text-black/60">⌘C</span>}
      >
        Copy link
      </LegacyMenuItem>
      <LegacyMenuItem
        icon={<MoonStar className="size-3.5" />}
        trailing={<ChevronRight className="ml-auto size-3.5" />}
      >
        Move to
      </LegacyMenuItem>
      <LegacyContextMenuDivider />
      <LegacyMenuItem icon={<Archive className="size-3.5" />}>Archive</LegacyMenuItem>
      <LegacyMenuItem
        icon={<Trash className="size-3.5" />}
        trailing={<span className="ml-auto font-sans text-sm font-medium text-black/60">⌫</span>}
      >
        Delete
      </LegacyMenuItem>
    </SourceContextMenuPreview>
  );
}

function SourceReactionRow() {
  return (
    <div
      className="flex h-9 items-center gap-1 bg-white px-2"
      data-message-affordance="reaction-quick-row"
    >
      {["👍", "❤️", "😂", "🎉", "👀"].map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="flex size-7 items-center justify-center rounded bg-transparent text-base leading-none transition-colors hover:bg-brutal-pink/20 active:bg-brutal-pink/20"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function ContextMenuSourceMessageMenuPreview({ className }: { className?: string }) {
  return (
    <SourceContextMenuPreview
      className={className}
      contentClassName="flex w-64 min-w-64 flex-col"
      minHeight="min-h-72"
      triggerLabel="Right click message"
    >
      <SourceReactionRow />
      <LegacyContextMenuDivider />
      <LegacyMenuItem icon={<Link2 className="size-3.5" />}>Copy Link</LegacyMenuItem>
      <LegacyMenuItem icon={<Copy className="size-3.5" />}>Copy Markdown</LegacyMenuItem>
      <LegacyMenuItem icon={<Forward className="size-3.5" />}>Share Messages...</LegacyMenuItem>
      <LegacyContextMenuDivider />
      <LegacyMenuItem icon={<MessageCircle className="size-3.5" />}>Open Thread</LegacyMenuItem>
      <LegacyMenuItem icon={<BookmarkPlus className="size-3.5" />}>Save Message</LegacyMenuItem>
      <LegacyMenuItem icon={<ClipboardCheck className="size-3.5" />}>
        Convert to Task
      </LegacyMenuItem>
    </SourceContextMenuPreview>
  );
}

export function ContextMenuSourceSelectionMenuPreview({ className }: { className?: string }) {
  return (
    <SourceContextMenuPreview
      className={className}
      contentClassName="flex w-48 min-w-48 flex-col"
      minHeight="min-h-40"
      triggerLabel="Right click selection"
    >
      <LegacyMenuItem icon={<MessageSquareQuote className="size-3.5" />}>Quote</LegacyMenuItem>
      <LegacyMenuItem icon={<Copy className="size-3.5" />}>Copy</LegacyMenuItem>
    </SourceContextMenuPreview>
  );
}

export function ContextMenuSourceSidebarMenuPreview({ className }: { className?: string }) {
  return (
    <SourceContextMenuPreview
      className={className}
      contentClassName="flex w-48 min-w-48 flex-col"
      minHeight="min-h-48"
      triggerLabel="Right click channel"
    >
      <LegacyMenuItem icon={<Mailbox className="size-3.5" />}>Mark as Read</LegacyMenuItem>
      <LegacyMenuItem icon={<Pin className="size-3.5" />}>Pin</LegacyMenuItem>
      <LegacyContextMenuDivider />
      <LegacyMenuItem icon={<Archive className="size-3.5" />}>Archive</LegacyMenuItem>
    </SourceContextMenuPreview>
  );
}
