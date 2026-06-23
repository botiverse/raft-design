import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "@raft/ui";
import { IconBulletListOutline18, IconGridLayoutCols3Outline18 } from "nucleo-ui-outline-18";

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
        <IconGridLayoutCols3Outline18 />
        <SegmentedControlLabel>Board</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="list">
        <IconBulletListOutline18 />
        <SegmentedControlLabel>List</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
