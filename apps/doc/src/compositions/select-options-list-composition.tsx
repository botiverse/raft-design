import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@slock/ui";

// @docs-source-strip-start
import { useRef, type RefObject } from "react";
import { cn } from "@slock/ui/cn";
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
export function SelectOptionsListComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={portalRef}
      className={cn("relative flex h-full min-h-56 w-full items-center justify-center", className)}
    >
      <Select open defaultValue="relevance" modal={false}>
        <SelectTrigger className="sr-only">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="flex w-[220px] min-w-[220px] flex-col"
        >
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
      </Select>
    </div>
  );
}
// @docs-source-strip-end
