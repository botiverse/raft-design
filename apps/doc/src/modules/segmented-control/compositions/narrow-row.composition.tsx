import { useState } from "react";
import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "@botiverse/raft-ui";
import { CalendarDays, Columns3, List } from "lucide-react";

export function SegmentedControlNarrowRowContent() {
  const [view, setView] = useState("board");
  return (
    <div className="@container flex w-full items-center justify-between gap-3">
      <h3 className="text-headline text-foreground">Tasks</h3>
      <SegmentedControl
        aria-label="Task view"
        iconsOnlyBelow="sm"
        value={view}
        onValueChange={setView}
      >
        <SegmentedControlItem value="board">
          <Columns3 />
          <SegmentedControlLabel>Board</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="list">
          <List />
          <SegmentedControlLabel>List</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="calendar">
          <CalendarDays />
          <SegmentedControlLabel>Calendar</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

// @docs-source-strip-start
export function SegmentedControlNarrowRowComposition() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="w-64">
        <SegmentedControlNarrowRowContent />
      </div>
      <SegmentedControlNarrowRowContent />
    </div>
  );
}
// @docs-source-strip-end
