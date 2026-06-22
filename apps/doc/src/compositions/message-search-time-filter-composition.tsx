import {
  DropdownMenuLabel,
  DropdownMenuPopup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@slock/ui";

// @docs-source-strip-start
import { DropdownMenu, DropdownMenuTrigger } from "@slock/ui";
import { useId } from "react";
import { cn } from "@slock/ui/cn";
// @docs-source-strip-end

export function MessageSearchTimeFilterContent() {
  return (
    <DropdownMenuPopup className="flex w-[220px] min-w-[220px] flex-col">
      <DropdownMenuLabel>Time</DropdownMenuLabel>
      <DropdownMenuRadioGroup defaultValue="any">
        <DropdownMenuRadioItem value="any">Any time</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="7d">Last 7 days</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuPopup>
  );
}

// @docs-source-strip-start
export function MessageSearchTimeFilterComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    // Only centers and mounts the menu for SourceComparison. Product usage should use a real trigger and app layout instead.
    <div className={cn("flex h-full min-h-56 w-full items-center justify-center", className)}>
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <MessageSearchTimeFilterContent />
      </DropdownMenu>
    </div>
  );
}
// @docs-source-strip-end
