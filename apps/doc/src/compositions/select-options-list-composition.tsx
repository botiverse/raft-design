import { DropdownMenuPopup, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@slock/ui";

// @docs-source-strip-start
import { DropdownMenu, DropdownMenuTrigger } from "@slock/ui";
import { useId } from "react";
import { cn } from "tailwind-variants";
// @docs-source-strip-end

export function SelectOptionsListContent() {
  return (
    <DropdownMenuPopup className="flex w-[220px] min-w-[220px] flex-col">
      <DropdownMenuRadioGroup defaultValue="relevance">
        <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuPopup>
  );
}

// @docs-source-strip-start
export function SelectOptionsListComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    // Only centers and mounts the menu for SourceComparison. Product usage should use a real trigger and app layout instead.
    <div className={cn("flex h-full min-h-56 w-full items-center justify-center", className)}>
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <SelectOptionsListContent />
      </DropdownMenu>
    </div>
  );
}
// @docs-source-strip-end
