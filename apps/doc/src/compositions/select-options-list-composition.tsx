import {
  DropdownMenu,
  DropdownMenuPopup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@slock/ui";
import { useId } from "react";
import { cn } from "tailwind-variants";

function SelectOptionsListPopup() {
  return (
    <DropdownMenuPopup className="flex w-[220px] min-w-[220px] flex-col">
      <DropdownMenuRadioGroup defaultValue="relevance">
        <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuPopup>
  );
}

export function SelectOptionsListComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    // Only centers and mounts the menu for SourceComparison. Product usage should use a real trigger and app layout instead.
    <div className={cn("flex h-full min-h-56 w-full items-center justify-center", className)}>
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <SelectOptionsListPopup />
      </DropdownMenu>
    </div>
  );
}
