import { InboxItemSkeletonList } from "@botiverse/raft-ui/wip";

/**
 * A conversation list while it loads: compact skeleton rows with a leading block, after the
 * list's 1-second delay. The region that stays when the conversations arrive is busy.
 */
export function LoadingConversationListComposition() {
  return (
    <div className="w-full max-w-md" aria-busy="true">
      <InboxItemSkeletonList count={4} density="compact" leading />
    </div>
  );
}
