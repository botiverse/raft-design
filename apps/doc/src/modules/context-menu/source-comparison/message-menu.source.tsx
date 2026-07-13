import { BookmarkPlus, ClipboardCheck, Copy, Forward, Link2, MessageCircle } from "lucide-react";

import LegacyContextMenuDivider from "../../../../../../packages/ui/src/legacy/context-menu-divider.tsx";
import LegacyMenuItem from "../../../../../../packages/ui/src/legacy/menu-item.tsx";
import { SourceContextMenuPreview } from "./source-context-menu-preview.tsx";

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
