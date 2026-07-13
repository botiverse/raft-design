import { DropdownMenu, DropdownMenuPopup, DropdownMenuTrigger } from "raft-ui";
import { SidebarDropdownSortItems } from "./sidebar-section-header-menu.composition.tsx";

// @docs-source-strip-start
import { useId } from "react";
import { cn } from "raft-ui/cn";
// @docs-source-strip-end

/** Inline popup shell for SourceComparison (always-open preview). */
export function SidebarSortMenuContent() {
  return (
    <DropdownMenuPopup className="flex w-[160px] min-w-[160px] flex-col">
      <SidebarDropdownSortItems />
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
