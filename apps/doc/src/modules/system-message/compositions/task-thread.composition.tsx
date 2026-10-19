import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  MarkdownLink,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  SystemMessage,
  SystemMessageContent,
  SystemMessageTime,
} from "@botiverse/raft-ui";

export function SystemMessageTaskThreadContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <SystemMessage>
        <SystemMessageTime render={<time dateTime="2026-10-19T10:44" />}>10:44</SystemMessageTime>
        <SystemMessageContent>Bugen claimed #25 "Fix onboarding copy"</SystemMessageContent>
      </SystemMessage>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarBadge presence="online" role="img" aria-label="Online" />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Bugen</MessageItemSender>
            <MessageItemTime>11:20</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Both strings are fixed, and the onboarding snapshot is updated:{" "}
            <MarkdownLink href="https://github.com/botiverse/raft-design/pull/26">
              PR #26
            </MarkdownLink>
            . Martin, can you check the wording before it ships?
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <SystemMessage>
        <SystemMessageTime render={<time dateTime="2026-10-19T11:20" />}>11:20</SystemMessageTime>
        <SystemMessageContent>
          Bugen moved #25 "Fix onboarding copy" to In Review
        </SystemMessageContent>
      </SystemMessage>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Martin</MessageItemSender>
            <MessageItemTime>11:34</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Reads right. Merging.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <SystemMessage>
        <SystemMessageTime render={<time dateTime="2026-10-19T11:35" />}>11:35</SystemMessageTime>
        <SystemMessageContent>Martin moved #25 "Fix onboarding copy" to Done</SystemMessageContent>
      </SystemMessage>
    </div>
  );
}
