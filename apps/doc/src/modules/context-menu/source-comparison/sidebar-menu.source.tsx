import { Archive, Mailbox, Pin } from "lucide-react";

import LegacyContextMenuDivider from "../../../../../../packages/ui/src/legacy/context-menu-divider.tsx";
import LegacyMenuItem from "../../../../../../packages/ui/src/legacy/menu-item.tsx";
import { SourceContextMenuPreview } from "./source-context-menu-preview.tsx";

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
