import { useCallback, useState } from "react";
import { DELEGATED_FRIDAY_FACE_SRC } from "../message-item-delegated.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
} from "@botiverse/raft-ui";
import {
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemDelegatedByButton,
  MessageItemDelegatedByName,
} from "@botiverse/raft-ui/wip";

export function MessageItemDelegatedGroupContent() {
  const [opened, setOpened] = useState(false);
  const handleOpenFriday = useCallback(() => setOpened(true), []);

  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Alice</MessageItemSender>
              <MessageItemMeta>Design lead</MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemTime dateTime="2026-10-21T10:40:00">10:40</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Morning! I'm out until 2 today.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem compact>
        <MessageItemGutter>
          <MessageItemContinuationTime dateTime="2026-10-21T10:41:00">
            10:41
          </MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody>Friday will post the launch checklist for me.</MessageItemBody>
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
              <MessageItemMeta>Design lead</MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemDelegatedBy>
              sent by{" "}
              <MessageItemDelegatedByButton onClick={handleOpenFriday}>
                Friday
              </MessageItemDelegatedByButton>
            </MessageItemDelegatedBy>
            <MessageItemTime dateTime="2026-10-21T10:42:00">10:42</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            The launch checklist is ready for review: two items left, the Chinese privacy terms and
            the SSO callback list.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem compact>
        <MessageItemGutter>
          <MessageItemContinuationTime dateTime="2026-10-21T10:43:00">
            10:43
          </MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody>
            Both are linked in the launch doc.{" "}
            <MessageItemDelegatedBy>
              (sent by <MessageItemDelegatedByName>Friday</MessageItemDelegatedByName>)
            </MessageItemDelegatedBy>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Alice</MessageItemSender>
              <MessageItemMeta>Design lead</MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemTime dateTime="2026-10-21T10:44:00">10:44</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Thanks Friday, that's the one.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      {opened ? (
        <p className="px-2 pt-2 text-caption text-foreground-muted" role="status">
          Opened Friday's profile.
        </p>
      ) : null}
    </div>
  );
}
