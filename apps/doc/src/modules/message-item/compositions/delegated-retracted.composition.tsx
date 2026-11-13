import { DELEGATED_FRIDAY_FACE_SRC } from "../message-item-delegated.fixtures.ts";
import {
  Avatar,
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
  MessageReplies,
  MessageRepliesSummary,
} from "@botiverse/raft-ui";
import {
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemDelegatedByName,
} from "@botiverse/raft-ui/wip";

/** A message Friday sent for Alice, then Alice retracted: the record stays, its words and files go. */
export function MessageItemDelegatedRetractedContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
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
            <MessageItemTime dateTime="2026-10-21T10:41:00">10:41</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody className="text-foreground-hint">
            This message was retracted.
          </MessageItemBody>
          {/* Its thread stays: the replies were written by people, not retracted. */}
          <MessageReplies>
            <MessageRepliesSummary>
              <strong>2 replies</strong>
              <span>·</span>
              <span>Last reply 3m ago</span>
            </MessageRepliesSummary>
          </MessageReplies>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
