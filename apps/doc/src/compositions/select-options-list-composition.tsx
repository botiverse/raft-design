import { useRef, type RefObject } from "react";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemLeading,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "raft-ui";

const OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Most recent" },
] as const;

export function SelectOptionsListComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={portalRef}
      className={["relative flex justify-center", className].filter(Boolean).join(" ")}
    >
      <Select open defaultValue="relevance" items={OPTIONS} modal={false}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Sort" />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
        >
          <SelectList>
            {OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <SelectItemLeading />
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}
