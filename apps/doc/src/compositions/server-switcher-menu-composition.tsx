import {
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuPopup,
  DropdownMenuSeparator,
} from "@raft/ui";
import { Check, Plus, UserPlus } from "lucide-react";

// @docs-source-strip-start
import { DropdownMenu, DropdownMenuTrigger } from "@raft/ui";
import { useId } from "react";
import { cn } from "@raft/ui/cn";
// @docs-source-strip-end

export function ServerSwitcherMenuContent() {
  return (
    <DropdownMenuPopup className="flex w-64 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DropdownMenuItem data-selected className="[[data-theme=brutal]_&]:font-bold">
          <Check aria-hidden />
          <span className="min-w-0 flex-1 truncate text-left">Raft</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="font-medium">
          <Check aria-hidden className="opacity-0" />
          <span className="min-w-0 flex-1 truncate text-left">Design Guild</span>
          <DropdownMenuItemCount>4</DropdownMenuItemCount>
        </DropdownMenuItem>
        <DropdownMenuItem className="font-medium">
          <Check aria-hidden className="opacity-0" />
          <span className="min-w-0 flex-1 truncate text-left">Open Source</span>
          <DropdownMenuItemCount>12</DropdownMenuItemCount>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <UserPlus />
        <span className="min-w-0 flex-1 text-left">Join Community</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Plus />
        <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
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
