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
      <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">Recent</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="az">A-Z</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

/** Inline popup shell for SourceComparison (always-open preview). */
export function SidebarSortMenuContent() {
  return (
    <DropdownMenuPopup className="flex w-[136px] min-w-[136px] flex-col">
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
