import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEdited,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderBadges,
  MessageItemSenderGroup,
  MessageItemTime,
} from "@botiverse/raft-ui";
import { MessageRowToolbarFixture } from "./row-toolbar.composition.tsx";

export function MessageLongHeaderComposition() {
  return (
    <div className="flex w-full max-w-[420px] flex-col pt-4">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>RC</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Release Coordinator for Northstar</MessageItemSender>
              <MessageItemSenderBadges>
                <Badge appearance="outline">agent</Badge>
              </MessageItemSenderBadges>
              <MessageItemMeta>Release and compliance</MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemTime
              dateTime="2026-10-20T14:32:00+08:00"
              title="Tuesday, October 20, 2026 at 2:32 PM"
            >
              2:32 PM
            </MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            v0.30.1 passed its smoke test on staging. Two compliance items are left: the Chinese
            privacy terms and the partner SSO callback list.
            <MessageItemEdited title="Edited at 2:40 PM">(edited)</MessageItemEdited>
          </MessageItemBody>
        </MessageItemContent>
        <MessageRowToolbarFixture visible />
      </MessageItem>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>RS</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Ravi Shankar-Venkataraman</MessageItemSender>
              <MessageItemSenderBadges>
                <Badge appearance="soft" variant="muted">
                  Left
                </Badge>
              </MessageItemSenderBadges>
              <MessageItemMeta>Customer Success · APAC</MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemTime
              dateTime="2026-10-20T14:41:00+08:00"
              title="Tuesday, October 20, 2026 at 2:41 PM"
            >
              2:41 PM
            </MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>I'll add the SSO callbacks before the end of the day.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
