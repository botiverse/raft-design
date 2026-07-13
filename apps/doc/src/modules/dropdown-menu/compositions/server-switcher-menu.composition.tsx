import {
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuItemLabel,
  DropdownMenuPopup,
  DropdownMenuSeparator,
} from "raft-ui";
import { Check, Plus, UserPlus } from "lucide-react";

// @docs-source-strip-start
import { DropdownMenu, DropdownMenuTrigger } from "raft-ui";
import { useId } from "react";
import { cn } from "raft-ui/cn";
// @docs-source-strip-end

export function ServerSwitcherMenuContent() {
  return (
    <DropdownMenuPopup className="flex w-64 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DropdownMenuItem data-selected data-interaction="signal">
          <Check aria-hidden />
          <DropdownMenuItemLabel>Raft</DropdownMenuItemLabel>
        </DropdownMenuItem>
        <DropdownMenuItem data-interaction="signal">
          <Check aria-hidden className="opacity-0" />
          <DropdownMenuItemLabel>Design Guild</DropdownMenuItemLabel>
          <DropdownMenuItemCount>4</DropdownMenuItemCount>
        </DropdownMenuItem>
        <DropdownMenuItem data-interaction="signal">
          <Check aria-hidden className="opacity-0" />
          <DropdownMenuItemLabel>Open Source</DropdownMenuItemLabel>
          <DropdownMenuItemCount>12</DropdownMenuItemCount>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem data-emphasis="strong" data-interaction="accent">
        <UserPlus />
        <DropdownMenuItemLabel>Join Community</DropdownMenuItemLabel>
      </DropdownMenuItem>
      <DropdownMenuItem data-emphasis="strong" data-interaction="accent">
        <Plus />
        <DropdownMenuItemLabel>Switch or Create Server</DropdownMenuItemLabel>
      </DropdownMenuItem>
    </DropdownMenuPopup>
  );
}

// @docs-source-strip-start
export function ServerSwitcherMenuComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    // Only centers and mounts the menu for SourceComparison. Product usage should use a real trigger and app layout instead.
    <div className={cn("flex h-full min-h-56 w-full items-center justify-center", className)}>
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <ServerSwitcherMenuContent />
      </DropdownMenu>
    </div>
  );
}
// @docs-source-strip-end
