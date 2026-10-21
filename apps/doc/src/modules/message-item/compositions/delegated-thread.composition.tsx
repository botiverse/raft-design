import { DELEGATED_FRIDAY_FACE_SRC } from "../message-item-delegated.fixtures.ts";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
  MessageList,
  MessageReferenceText,
  ThreadPanelHeader,
  ThreadPanelOriginalMessage,
  ThreadPanelTitle,
  ThreadPanelTitleMeta,
} from "@botiverse/raft-ui";
import {
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemDelegatedByName,
} from "@botiverse/raft-ui/wip";

export function MessageItemDelegatedThreadContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <ThreadPanelHeader>
        <ThreadPanelTitle>
          Thread
          <ThreadPanelTitleMeta> #launch-week · 3 replies</ThreadPanelTitleMeta>
        </ThreadPanelTitle>
      </ThreadPanelHeader>
      <ThreadPanelOriginalMessage>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human">
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Martin</MessageItemSender>
              <MessageItemTime dateTime="2026-10-21T10:08:00">10:08</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Who owns the SSO callback list?</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </ThreadPanelOriginalMessage>
      <MessageList rootClassName="h-auto" className="pb-2">
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarBadge presence="online" role="img" aria-label="Online" />
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Bugen</MessageItemSender>
              <MessageItemTime dateTime="2026-10-21T10:09:00">10:09</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Not me, I only have the privacy terms.</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human">
              <AvatarFallback>A</AvatarFallback>
              <MessageItemDelegatedAvatar>
                <Avatar size="2xs" type="agent" className="bg-brand">
                  <AvatarImage src={DELEGATED_FRIDAY_FACE_SRC} alt="" />
                </Avatar>
              </MessageItemDelegatedAvatar>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSenderGroup>
                <MessageItemSender>Alice</MessageItemSender>
              </MessageItemSenderGroup>
              <MessageItemDelegatedBy>
                sent by <MessageItemDelegatedByName>Friday</MessageItemDelegatedByName>
              </MessageItemDelegatedBy>
              <MessageItemTime dateTime="2026-10-21T10:12:00">10:12</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              <MessageReferenceText>@Martin</MessageReferenceText> I do. It will be in the launch
              doc by 3 PM.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human">
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Martin</MessageItemSender>
              <MessageItemTime dateTime="2026-10-21T10:13:00">10:13</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Great, thanks.</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </MessageList>
    </div>
  );
}
