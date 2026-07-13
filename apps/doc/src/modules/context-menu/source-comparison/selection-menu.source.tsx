import { Copy, MessageSquareQuote } from "lucide-react";

import LegacyMenuItem from "../../../../../../packages/ui/src/legacy/menu-item.tsx";
import { SourceContextMenuPreview } from "./source-context-menu-preview.tsx";

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
