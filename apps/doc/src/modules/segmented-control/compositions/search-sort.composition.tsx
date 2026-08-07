import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";

type SegmentedControlSearchSortCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function SegmentedControlSearchSortComposition({
  value = "relevance",
  onValueChange = () => {},
}: SegmentedControlSearchSortCompositionProps) {
  return (
    <SegmentedControl aria-label="Sort search results" value={value} onValueChange={onValueChange}>
      <SegmentedControlItem value="relevance">
        <SegmentedControlLabel>Relevant</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="recent">
        <SegmentedControlLabel>Recent</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
