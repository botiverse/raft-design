import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "cuvii-rui";
import { AtSign, Inbox } from "lucide-react";

type SegmentedControlFiltersCompositionProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function SegmentedControlFiltersComposition({
  value = "all",
  onValueChange = () => {},
}: SegmentedControlFiltersCompositionProps) {
  return (
    <SegmentedControl ariaLabel="Filter messages" value={value} onValueChange={onValueChange}>
      <SegmentedControlItem value="all">
        <Inbox />
        <SegmentedControlLabel>All</SegmentedControlLabel>
        <SegmentedControlCount>12</SegmentedControlCount>
      </SegmentedControlItem>
      <SegmentedControlItem value="unread">
        <SegmentedControlLabel>Unread</SegmentedControlLabel>
        <SegmentedControlCount>3</SegmentedControlCount>
      </SegmentedControlItem>
      <SegmentedControlItem value="mentions">
        <AtSign />
        <SegmentedControlLabel>Mentions</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}
