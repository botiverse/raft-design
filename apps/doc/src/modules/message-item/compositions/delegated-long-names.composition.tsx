import { DELEGATED_FRIDAY_FACE_SRC } from "../message-item-delegated.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemDelegatedByName,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
} from "@botiverse/raft-ui";

export function MessageItemDelegatedLongNamesContent() {
  return (
    <div className="flex w-full max-w-md flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>AK</AvatarFallback>
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
              <MessageItemSender title="Alexandra Konstantinopoulou">
                Alexandra Konstantinopoulou
              </MessageItemSender>
              <MessageItemMeta title="Product & Brand · APAC">
                Product & Brand · APAC
              </MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemDelegatedBy>
              sent by{" "}
              <MessageItemDelegatedByName title="Friday Release Coordinator">
                Friday Release Coordinator
              </MessageItemDelegatedByName>
            </MessageItemDelegatedBy>
            <MessageItemTime dateTime="2026-10-21T10:42:00">10:42</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Two items left on the checklist.</MessageItemBody>
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
              <MessageItemMeta>设计负责人</MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemDelegatedBy>
              由 <MessageItemDelegatedByName>Friday</MessageItemDelegatedByName> 代发
            </MessageItemDelegatedBy>
            <MessageItemTime dateTime="2026-10-21T10:43:00">10:43</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>发布清单已经可以审阅了，还剩两项。</MessageItemBody>
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
              <MessageItemSender title="Alexandra Konstantinopoulou">
                Alexandra Konstantinopoulou
              </MessageItemSender>
            </MessageItemSenderGroup>
            <MessageItemDelegatedBy>
              由{" "}
              <MessageItemDelegatedByName title="Friday Release Coordinator">
                Friday Release Coordinator
              </MessageItemDelegatedByName>{" "}
              代发
            </MessageItemDelegatedBy>
            <MessageItemTime dateTime="2026-10-21T10:44:00">10:44</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>隐私条款的中文版本今天下班前定稿。</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
