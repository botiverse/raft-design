import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";
import { Languages } from "lucide-react";

export function SegmentedControlDisabledComposition() {
  return (
    <SegmentedControl
      disabled
      ariaLabel="Translation mode"
      value="translated"
      onValueChange={() => {}}
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
