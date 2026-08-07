import {
  ActivityInboxItem,
  ActivityInboxItemBody,
  ActivityInboxItemContent,
  ActivityInboxItemTitle,
  ActivityInboxList,
  ActivityInboxLoadingMore,
  ActivityInboxPanel,
  ActivityInboxViewport,
} from "raft-ui/wip";

export function LoadingMoreActivityComposition() {
  return (
    <ActivityInboxPanel aria-busy="true">
      <ActivityInboxViewport>
        <ActivityInboxList>
          <ActivityInboxItem>
            <ActivityInboxItemContent>
              <ActivityInboxItemTitle>Quarterly planning</ActivityInboxItemTitle>
              <ActivityInboxItemBody>Sam: I added the latest milestones.</ActivityInboxItemBody>
            </ActivityInboxItemContent>
          </ActivityInboxItem>
          <ActivityInboxLoadingMore>Loading more…</ActivityInboxLoadingMore>
        </ActivityInboxList>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
