import { PullToRefreshIndicator } from "@botiverse/raft-ui/wip";
import type { PullToRefresh } from "@botiverse/raft-ui/wip";

// Android's own indicator through a pull, on the 100px threshold.
// On the way down: 75px, not armed yet.
const pulling: PullToRefresh = {
  state: "pulling",
  distance: 75,
  progress: 0.75,
  platform: "android",
};
// Past the threshold: armed.
const armed: PullToRefresh = { state: "pulling", distance: 120, progress: 1, platform: "android" };
// Back above the threshold before release: disarmed.
const disarmed: PullToRefresh = {
  state: "pulling",
  distance: 90,
  progress: 0.9,
  platform: "android",
};
// Released while armed: held at 60px until the refresh settles.
const refreshing: PullToRefresh = {
  state: "refreshing",
  distance: 60,
  progress: 1,
  platform: "android",
};

export function PullToRefreshAndroidContent() {
  return (
    <div className="grid w-full max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="h-36 overflow-hidden rounded-md border border-line-hairline">
        <PullToRefreshIndicator pull={pulling} label="Refreshing…" />
      </div>
      <div className="h-36 overflow-hidden rounded-md border border-line-hairline">
        <PullToRefreshIndicator pull={armed} label="Refreshing…" />
      </div>
      <div className="h-36 overflow-hidden rounded-md border border-line-hairline">
        <PullToRefreshIndicator pull={disarmed} label="Refreshing…" />
      </div>
      <div className="h-36 overflow-hidden rounded-md border border-line-hairline">
        <PullToRefreshIndicator pull={refreshing} label="Refreshing…" />
      </div>
    </div>
  );
}
