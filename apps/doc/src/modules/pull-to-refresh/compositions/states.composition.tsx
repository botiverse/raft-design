import { PullToRefreshIndicator } from "@botiverse/raft-ui/wip";
import type { PullToRefresh } from "@botiverse/raft-ui/wip";

const PULLING: PullToRefresh = { state: "pulling", distance: 30, progress: 30 / 56 };
const REFRESHING: PullToRefresh = { state: "refreshing", distance: 36, progress: 1 };

export function PullToRefreshStatesContent() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <div className="rounded-md border border-line-hairline">
        <PullToRefreshIndicator pull={PULLING} label="Refreshing…" />
      </div>
      <div className="rounded-md border border-line-hairline">
        <PullToRefreshIndicator pull={REFRESHING} label="Refreshing…" />
      </div>
    </div>
  );
}
