import { PullToRefreshIndicator } from "@botiverse/raft-ui/wip";
import type { PullToRefresh, PullToRefreshPlatform } from "@botiverse/raft-ui/wip";

// Halfway to the 100px threshold, and held at 60px while refreshing.
const pulling = (platform: PullToRefreshPlatform): PullToRefresh => ({
  state: "pulling",
  distance: 50,
  progress: 0.5,
  platform,
});
const refreshing = (platform: PullToRefreshPlatform): PullToRefresh => ({
  state: "refreshing",
  distance: 60,
  progress: 1,
  platform,
});

export function PullToRefreshStatesContent() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      {(["default", "android"] as const).map((platform) =>
        [pulling(platform), refreshing(platform)].map((pull) => (
          <div
            key={`${platform}-${pull.state}`}
            className="h-24 overflow-hidden rounded-md border border-line-hairline"
          >
            <PullToRefreshIndicator pull={pull} label="Refreshing…" />
          </div>
        )),
      )}
    </div>
  );
}
