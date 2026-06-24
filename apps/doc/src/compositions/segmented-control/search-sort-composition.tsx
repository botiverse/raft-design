import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "cuvii-rui";

type SegmentedControlSearchSortCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function SegmentedControlSearchSortComposition({
  value = "relevance",
  onValueChange = () => {},
}: SegmentedControlSearchSortCompositionProps) {
  return (
    <SegmentedControl ariaLabel="Sort search results" value={value} onValueChange={onValueChange}>
      <SegmentedControlItem value="relevance">
        <SegmentedControlLabel>Relevant</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="recent">
        <SegmentedControlLabel>Recent</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
