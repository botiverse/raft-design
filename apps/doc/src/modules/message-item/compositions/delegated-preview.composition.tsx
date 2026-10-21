import {
  Avatar,
  AvatarFallback,
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemContext,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  SearchMessageResult,
  SearchMessageResultBody,
  SearchMessageResultHeader,
  SearchMessageResultMatch,
  SearchMessageResultMeta,
  SearchMessageResultSender,
  SearchMessageResultTimestamp,
  SearchResultsList,
} from "@botiverse/raft-ui";

export function MessageItemDelegatedPreviewContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <InboxItem data-unread>
        <InboxItemLeading>
          <Avatar size="md" type="human">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemContext>#launch-week</InboxItemContext>
          <InboxItemHeading>
            <InboxItemTitle>Alice mentioned you</InboxItemTitle>
          </InboxItemHeading>
          <InboxItemBody>
            <InboxItemSender>Alice (sent by Friday): </InboxItemSender>
            @Martin the launch checklist is ready for your review, two items left.
          </InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemTimestamp>2m</InboxItemTimestamp>
        </InboxItemTrailing>
      </InboxItem>

      <SearchResultsList>
        <SearchMessageResult disabled>
          <SearchMessageResultHeader>
            <SearchMessageResultMeta>#launch-week</SearchMessageResultMeta>
            <SearchMessageResultSender>Alice (sent by Friday)</SearchMessageResultSender>
            <SearchMessageResultTimestamp>Today</SearchMessageResultTimestamp>
          </SearchMessageResultHeader>
          <SearchMessageResultBody>
            The <SearchMessageResultMatch>launch</SearchMessageResultMatch> checklist is ready for
            your review, two items left.
          </SearchMessageResultBody>
        </SearchMessageResult>
      </SearchResultsList>
    </div>
  );
}
