import { useRef, type RefObject } from "react";
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
} from "raft-ui";

import type { PreviewSelectProps } from "./preview.types.ts";

export function PreviewSelect({ id, label, options, value, onValueChange }: PreviewSelectProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const items = options.map((option) => ({ value: option, label: option }));

  return (
    <div ref={portalRef} className="relative min-w-0">
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
        items={items}
        modal={false}
      >
        <SelectTrigger id={id} aria-label={label} className="h-7 w-full px-2 font-mono text-xs">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-full min-w-[var(--anchor-width)]"
        >
          <SelectList>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                <SelectItemText>{option}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}
