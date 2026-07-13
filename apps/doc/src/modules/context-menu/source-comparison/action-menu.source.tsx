import { Archive, ChevronRight, Copy, MoonStar, Pin, Trash } from "lucide-react";

import LegacyContextMenuDivider from "../../../../../../packages/ui/src/legacy/context-menu-divider.tsx";
import LegacyMenuItem from "../../../../../../packages/ui/src/legacy/menu-item.tsx";
import { SourceContextMenuPreview } from "./source-context-menu-preview.tsx";

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
