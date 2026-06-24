import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "@raft/ui";
import { List, Columns3 } from "lucide-react";

type SegmentedControlViewModeCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function SegmentedControlViewModeComposition({
  value = "board",
  onValueChange = () => {},
}: SegmentedControlViewModeCompositionProps) {
  return (
    <SegmentedControl ariaLabel="Task view" value={value} onValueChange={onValueChange}>
      <SegmentedControlItem value="board">
        <Columns3 />
        <SegmentedControlLabel>Board</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="list">
        <List />
        <SegmentedControlLabel>List</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
