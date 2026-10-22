import { useCallback, useState } from "react";
import {
  Button,
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "@botiverse/raft-ui";
import { AtSign, CircleDot, Inbox, Pin } from "lucide-react";

export function SegmentedControlFitRowContent() {
  const [filter, setFilter] = useState("all");
  const [unread, setUnread] = useState(3);
  const handleMarkAllRead = useCallback(() => setUnread(0), []);
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <SegmentedControl
        aria-label="Filter"
        iconsOnlyBelow="auto"
        value={filter}
        onValueChange={setFilter}
      >
        <SegmentedControlItem value="all">
          <Inbox />
          <SegmentedControlLabel>All</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="unread">
          <CircleDot />
          <SegmentedControlLabel>Unread</SegmentedControlLabel>
          {unread > 0 && <SegmentedControlCount>{unread}</SegmentedControlCount>}
        </SegmentedControlItem>
        <SegmentedControlItem value="mentions">
          <AtSign />
          <SegmentedControlLabel>Mentions</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="pinned">
          <Pin />
          <SegmentedControlLabel>Pinned</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
      <Button
        type="button"
        variant="ghost"
        className="shrink-0"
        disabled={unread === 0}
        onClick={handleMarkAllRead}
      >
        Mark all read
      </Button>
    </div>
  );
}

// @docs-source-strip-start
export function SegmentedControlFitRowComposition() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <div className="w-80">
        <SegmentedControlFitRowContent />
      </div>
      <SegmentedControlFitRowContent />
    </div>
  );
}
// @docs-source-strip-end
