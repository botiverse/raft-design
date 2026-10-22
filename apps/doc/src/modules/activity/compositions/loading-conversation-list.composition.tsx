import { InboxItemSkeletonList } from "@botiverse/raft-ui/wip";

/** A conversation list while it loads: compact skeleton rows with a leading block. */
export function LoadingConversationListComposition() {
  return (
    <div className="w-full max-w-md">
      <InboxItemSkeletonList count={4} density="compact" leading />
    </div>
  );
}
