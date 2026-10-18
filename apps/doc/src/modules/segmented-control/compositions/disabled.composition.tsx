import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "@botiverse/raft-ui";
import { Languages } from "lucide-react";

function noop() {}

export function SegmentedControlDisabledComposition() {
  return (
    <SegmentedControl
      disabled
      aria-label="Translation mode"
      value="translated"
      onValueChange={noop}
    >
      <SegmentedControlItem value="translated">
        <Languages />
        <SegmentedControlLabel>Translated</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="original">
        <SegmentedControlLabel>Original</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
