import { RadioGroup, RadioGroupItem } from "raft-ui";

import type { PreviewRadioProps } from "./preview.types.ts";

export function PreviewRadio({ label, options, value, onValueChange }: PreviewRadioProps) {
  return (
    <RadioGroup
      ariaLabel={label}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
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
