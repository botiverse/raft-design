import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";

type SegmentedControlTimeFormatCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function SegmentedControlTimeFormatComposition({
  value = "24h",
  onValueChange = () => {},
}: SegmentedControlTimeFormatCompositionProps) {
  return (
    <SegmentedControl ariaLabel="Time format" value={value} onValueChange={onValueChange}>
      <SegmentedControlItem value="12h">
        <SegmentedControlLabel>12h</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="24h">
        <SegmentedControlLabel>24h</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
