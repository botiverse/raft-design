import { Hash, MessageSquare } from "lucide-react";
import {
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  ActivityInboxLoadingMore,
  ActivityInboxPanel,
  ActivityInboxViewport,
} from "raft-ui";

export function LoadingMoreActivityComposition() {
  return (
    <ActivityInboxPanel aria-busy="true">
      <ActivityInboxViewport>
        <div className="flex flex-col gap-2 in-data-[theme=elegant]:py-3">
          <InboxItem data-unread>
            <InboxItemContent>
              <InboxItemTitle>
                <MessageSquare aria-hidden />
                Quarterly planning is ready for review
              </InboxItemTitle>
              <InboxItemBody>
                <InboxItemSender>Sam: </InboxItemSender>I added the latest milestones and owners.
              </InboxItemBody>
            </InboxItemContent>
            <InboxItemTrailing>
              <InboxItemTimestamp>10:42 AM</InboxItemTimestamp>
            </InboxItemTrailing>
          </InboxItem>
          <InboxItem>
            <InboxItemContent>
              <InboxItemTitle>
                <Hash aria-hidden />
                Vendor security questionnaire
              </InboxItemTitle>
              <InboxItemBody>
                <InboxItemSender>Mira: </InboxItemSender>The final controls are now documented.
              </InboxItemBody>
            </InboxItemContent>
            <InboxItemTrailing>
              <InboxItemTimestamp>9:18 AM</InboxItemTimestamp>
            </InboxItemTrailing>
          </InboxItem>
          <ActivityInboxLoadingMore>Loading more…</ActivityInboxLoadingMore>
        </div>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
