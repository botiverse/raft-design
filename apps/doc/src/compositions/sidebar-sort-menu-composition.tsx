import {
  DropdownMenu,
  DropdownMenuPopup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@slock/ui";
import { useId } from "react";
import { cn } from "tailwind-variants";

function SidebarSortMenuPopup() {
  return (
    <DropdownMenuPopup className="flex w-[136px] min-w-[136px] flex-col">
      <DropdownMenuRadioGroup defaultValue="manual">
        <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="recent">Recent</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="az">A-Z</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuPopup>
  );
}

export function SidebarSortMenuComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    // Only centers and mounts the menu for SourceComparison. Product usage should use a real trigger and app layout instead.
    <div className={cn("flex h-full min-h-56 w-full items-center justify-center", className)}>
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <SidebarSortMenuPopup />
      </DropdownMenu>
    </div>
  );
}
