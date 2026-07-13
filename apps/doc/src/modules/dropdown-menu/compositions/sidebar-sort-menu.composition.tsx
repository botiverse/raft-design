import { ArrowDownAZ, Clock, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuPopup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "raft-ui";

// @docs-source-strip-start
import { useId } from "react";
import { cn } from "raft-ui/cn";
// @docs-source-strip-end

function SidebarSortMenuItems() {
  return (
    <DropdownMenuRadioGroup defaultValue="manual">
      <DropdownMenuRadioItem value="manual">
        <GripVertical />
        <span className="min-w-0 flex-1 text-left">Manual</span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">
        <Clock />
        <span className="min-w-0 flex-1 text-left">Recent</span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="az">
        <ArrowDownAZ />
        <span className="min-w-0 flex-1 text-left">A-Z</span>
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

/** Inline popup shell for SourceComparison (always-open preview). */
export function SidebarSortMenuContent() {
  return (
    <DropdownMenuPopup className="flex w-[160px] min-w-[160px] flex-col">
      <SidebarSortMenuItems />
    </DropdownMenuPopup>
  );
}

/** Section-header sort control. Prefer `sidebar-section-header-menu.composition`. */
export { SidebarSectionSortMenu } from "./sidebar-section-header-menu.composition.tsx";

// @docs-source-strip-start
export function SidebarSortMenuComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    // Only centers and mounts the menu for SourceComparison. Product usage should use a real trigger and app layout instead.
    <div className={cn("flex h-full min-h-56 w-full items-center justify-center", className)}>
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <SidebarSortMenuContent />
      </DropdownMenu>
    </div>
  );
}
// @docs-source-strip-end
