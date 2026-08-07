import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";

import type { PreviewSegmentedProps } from "./preview.types.ts";

export function PreviewSegmented({ label, options, value, onValueChange }: PreviewSegmentedProps) {
  return (
    <SegmentedControl
      aria-label={label}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
      className="w-full"
    >
      {options.map((option) => (
        <SegmentedControlItem
          key={option}
          value={option}
          className="px-2 py-1.5 font-mono text-[11px]"
        >
          <SegmentedControlLabel>{option}</SegmentedControlLabel>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
