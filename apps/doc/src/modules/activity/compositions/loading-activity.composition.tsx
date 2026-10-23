import { ActivityInboxPanel, ActivityInboxViewport } from "@botiverse/raft-ui";
import { InboxItemSkeletonList } from "@botiverse/raft-ui/wip";

/**
 * The Activity list while it loads: flat skeleton rows in the shape of its InboxItem rows,
 * after the list's 1-second delay. The panel, which stays when the items arrive, is busy.
 */
export function LoadingActivityComposition() {
  return (
    <ActivityInboxPanel aria-busy="true">
      <ActivityInboxViewport>
        <InboxItemSkeletonList count={4} context />
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
