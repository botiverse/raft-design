import {
  ActivityInboxPanel,
  ActivityInboxViewport,
  InboxItem,
  InboxItemContent,
  InboxItemSelection,
  InboxItemTrailing,
  Skeleton,
} from "raft-ui";

export function LoadingActivityComposition() {
  return (
    <ActivityInboxPanel aria-busy="true">
      <ActivityInboxViewport>
        <div className="flex flex-col gap-2">
          <ActivityLoadingItem titleWidth="w-2/5" bodyWidth="w-4/5" />
          <ActivityLoadingItem titleWidth="w-1/3" bodyWidth="w-3/5" />
          <ActivityLoadingItem titleWidth="w-1/2" bodyWidth="w-3/4" />
        </div>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}

function ActivityLoadingItem({ titleWidth, bodyWidth }: { titleWidth: string; bodyWidth: string }) {
  return (
    <InboxItem aria-hidden disabled>
      <InboxItemSelection>
        <Skeleton className="size-4" />
      </InboxItemSelection>
      <InboxItemContent className="flex flex-col gap-2 py-0.5">
        <Skeleton variant="line" className={titleWidth} />
        <Skeleton variant="line" className={bodyWidth} />
      </InboxItemContent>
      <InboxItemTrailing>
        <Skeleton variant="line" className="w-14" />
      </InboxItemTrailing>
    </InboxItem>
  );
}
