import { useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "raft-ui";

import type { PreviewRadioProps } from "./preview.types.ts";

export function PreviewRadio({ label, options, value, onValueChange }: PreviewRadioProps) {
  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (nextValue) {
        onValueChange(nextValue);
      }
    },
    [onValueChange],
  );

  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onValueChange={handleValueChange}
      className="flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted"
        >
          <RadioGroupItem value={option} />
          {option}
        </label>
      ))}
    </RadioGroup>
  );
}
