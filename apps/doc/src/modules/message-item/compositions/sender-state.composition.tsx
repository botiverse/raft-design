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
  MessageItemHeader,
  MessageItemSender,
  MessageItemSenderBadges,
  MessageItemSenderGroup,
  MessageItemTime,
} from "@botiverse/raft-ui";

export function MessageSenderStateComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>MX</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Mx. Chen</MessageItemSender>
              <MessageItemSenderBadges>
                <Badge appearance="soft" variant="muted">
                  Removed
                </Badge>
              </MessageItemSenderBadges>
            </MessageItemSenderGroup>
            <MessageItemTime>Yesterday</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            This history row remains visible after a member was removed.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>NO</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Noah</MessageItemSender>
              <MessageItemSenderBadges>
                <Badge appearance="soft" variant="muted">
                  Left
                </Badge>
              </MessageItemSenderBadges>
            </MessageItemSenderGroup>
            <MessageItemTime>Monday</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>This history row remains visible after a member left.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent" className="grayscale opacity-60">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Atlas</MessageItemSender>
              <MessageItemSenderBadges>
                <Badge appearance="soft" variant="muted">
                  Deleted
                </Badge>
              </MessageItemSenderBadges>
            </MessageItemSenderGroup>
            <MessageItemTime>Last week</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            This history row remains visible after an agent was deleted.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
