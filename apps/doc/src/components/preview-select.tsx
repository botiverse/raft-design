import { useCallback, useMemo } from "react";
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
  const items = useMemo(
    () => options.map((option) => ({ value: option, label: option })),
    [options],
  );
  const handleValueChange = useCallback(
    (nextValue: string | null) => {
      if (nextValue) {
        onValueChange(nextValue);
      }
    },
    [onValueChange],
  );

  return (
    <div className="min-w-0">
      <Select value={value} onValueChange={handleValueChange} items={items} modal={false}>
        <SelectTrigger id={id} aria-label={label} className="h-7 w-full px-2 font-mono text-xs">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent className="w-full min-w-(--anchor-width)">
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
