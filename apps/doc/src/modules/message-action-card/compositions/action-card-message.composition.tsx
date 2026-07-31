import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardContent,
  MessageActionCardFact,
  MessageActionCardFactLabel,
  MessageActionCardFacts,
  MessageActionCardFactValue,
  MessageActionCardHeader,
  MessageActionCardHint,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function ActionCardComposition() {
  return (
    <div className="grid gap-2">
      <MessageActionCard>
        <MessageActionCardHeader>
          <span>Create private channel #release-review</span>
        </MessageActionCardHeader>
        <MessageActionCardContent>
          <MessageActionCardFacts>
            <MessageActionCardFact>
              <MessageActionCardFactLabel>Description</MessageActionCardFactLabel>
              <MessageActionCardFactValue>
                Coordinate the final release review.
              </MessageActionCardFactValue>
            </MessageActionCardFact>
            <MessageActionCardFact>
              <MessageActionCardFactLabel>Humans</MessageActionCardFactLabel>
              <MessageActionCardFactValue>Ada, Will</MessageActionCardFactValue>
            </MessageActionCardFact>
            <MessageActionCardFact>
              <MessageActionCardFactLabel>Agents</MessageActionCardFactLabel>
              <MessageActionCardFactValue>Atlas</MessageActionCardFactValue>
            </MessageActionCardFact>
          </MessageActionCardFacts>
          <MessageActionCardHint>
            Suggested after the launch checklist was approved.
          </MessageActionCardHint>
          <MessageActionCardActions>
            <Button size="sm" variant="accent">
              Create Channel
            </Button>
          </MessageActionCardActions>
        </MessageActionCardContent>
      </MessageActionCard>
    </div>
  );
}

export function ActionCardMessageComposition() {
  return (
    <MessageItem className="w-full max-w-4xl">
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent">
          <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:27 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <ActionCardComposition />
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
