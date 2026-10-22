import { ActivityInboxPanel, ActivityInboxViewport } from "@botiverse/raft-ui";
import { InboxItemSkeletonList } from "@botiverse/raft-ui/wip";

/** The Activity list while it loads: flat skeleton rows in the shape of its InboxItem rows. */
export function LoadingActivityComposition() {
  return (
    <ActivityInboxPanel>
      <ActivityInboxViewport>
        <InboxItemSkeletonList count={4} context delay={1000} />
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
