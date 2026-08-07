import {
  ActivityInboxItem,
  ActivityInboxItemBody,
  ActivityInboxItemContent,
  ActivityInboxItemTitle,
  ActivityInboxList,
  ActivityInboxPanel,
  ActivityInboxViewport,
} from "raft-ui/wip";

export function CompactActivityComposition() {
  return (
    <ActivityInboxPanel data-layout="compact">
      <ActivityInboxViewport>
        <ActivityInboxList>
          <ActivityInboxItem data-unread>
            <ActivityInboxItemContent>
              <ActivityInboxItemTitle>Launch checklist</ActivityInboxItemTitle>
              <ActivityInboxItemBody>
                Maya: Can you review the final checklist?
              </ActivityInboxItemBody>
            </ActivityInboxItemContent>
          </ActivityInboxItem>
        </ActivityInboxList>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
