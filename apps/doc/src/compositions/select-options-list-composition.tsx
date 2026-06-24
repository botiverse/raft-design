import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
} from "@raft/ui";

// @docs-source-strip-start
import { Check } from "lucide-react";
import { SelectPopup, useTheme } from "@raft/ui";
import { cn } from "@raft/ui/cn";
// @docs-source-strip-end

export function SelectOptionsListContent() {
  return (
    <SelectContent className="flex w-[220px] min-w-[220px] flex-col">
      <SelectList>
        <SelectItem value="relevance">
          <SelectItemText>Relevance</SelectItemText>
          <SelectItemIndicator />
        </SelectItem>
        <SelectItem value="recent">
          <SelectItemText>Most recent</SelectItemText>
          <SelectItemIndicator />
        </SelectItem>
      </SelectList>
    </SelectContent>
  );
}

// @docs-source-strip-start
const STATIC_OPTIONS = [
  { value: "relevance", label: "Relevance", selected: true },
  { value: "recent", label: "Most recent", selected: false },
] as const;

function SelectOptionsListStaticItem({
  label,
  selected = false,
}: {
  label: string;
  selected?: boolean;
}) {
  const theme = useTheme();

  return (
    <div
      data-selected={selected ? "" : undefined}
      data-slot="select-item"
      className={cn(
        "flex h-8 w-full shrink-0 cursor-default select-none items-center justify-between gap-2 overflow-hidden px-3 text-left outline-none transition-colors",
        theme === "brutal" &&
          "border-b border-black/10 bg-white font-sans text-sm font-semibold leading-6 text-black last:border-b-0 data-[selected]:bg-brutal-yellow/30",
        theme === "elegant" &&
          "rounded-sm bg-transparent px-2 text-sm font-normal tracking-[-0.005em] text-foreground-muted data-[selected]:bg-foreground/[0.04] data-[selected]:text-foreground-strong",
      )}
    >
      <span data-slot="select-item-text" className="min-w-0 flex-1 truncate">
        {label}
      </span>
      {selected ? (
        <span
          data-slot="select-item-indicator"
          className={cn(
            "pointer-events-none ml-auto flex shrink-0 items-center justify-center",
            theme === "brutal" ? "text-black" : "text-foreground-strong",
          )}
        >
          {theme === "brutal" ? (
            <Check aria-hidden size={12} className="shrink-0 !stroke-[2.25]" />
          ) : (
            <Check aria-hidden className="size-3 shrink-0" />
          )}
        </span>
      ) : null}
    </div>
  );
}

export function SelectOptionsListComposition({ className }: { className?: string }) {
  const theme = useTheme();

  return (
    <div
      className={cn("relative flex h-full min-h-56 w-full items-center justify-center", className)}
    >
      <SelectPopup className="flex w-[220px] min-w-[220px] flex-col" aria-hidden>
        <div
          data-slot="select-list"
          className={cn(
            "max-h-64 overflow-y-auto overscroll-contain scroll-py-6",
            theme === "elegant" && "flex flex-col gap-0.5 px-1 py-1",
          )}
        >
          {STATIC_OPTIONS.map((option) => (
            <SelectOptionsListStaticItem
              key={option.value}
              label={option.label}
              selected={option.selected}
            />
          ))}
        </div>
      </SelectPopup>
    </div>
  );
}
// @docs-source-strip-end
