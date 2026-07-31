import { Avatar, AvatarFallback, AvatarImage, Button } from "raft-ui";
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
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function ActionCardChannelAndAgentComposition() {
  return (
    <div className="grid gap-5">
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
            <MessageActionCard>
              <MessageActionCardHeader>
                Create private channel #release-review
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
                  <Button size="sm" variant="accent" disabled>
                    Create Channel
                  </Button>
                </MessageActionCardActions>
              </MessageActionCardContent>
            </MessageActionCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

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
            <MessageItemTime>2:31 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>Create Agent @lumen</MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardFacts>
                  <MessageActionCardFact>
                    <MessageActionCardFactLabel>Description</MessageActionCardFactLabel>
                    <MessageActionCardFactValue>
                      Own the regression-triage queue.
                    </MessageActionCardFactValue>
                  </MessageActionCardFact>
                  <MessageActionCardFact>
                    <MessageActionCardFactLabel>Suggested computer</MessageActionCardFactLabel>
                    <MessageActionCardFactValue>Studio Mac</MessageActionCardFactValue>
                  </MessageActionCardFact>
                </MessageActionCardFacts>
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" disabled>
                    Create Agent
                  </Button>
                </MessageActionCardActions>
              </MessageActionCardContent>
            </MessageActionCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>

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
            <MessageItemTime>2:36 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>Add 3 members to #release-review</MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardFacts>
                  <MessageActionCardFact>
                    <MessageActionCardFactLabel>Channel</MessageActionCardFactLabel>
                    <MessageActionCardFactValue>#release-review</MessageActionCardFactValue>
                  </MessageActionCardFact>
                  <MessageActionCardFact>
                    <MessageActionCardFactLabel>Humans</MessageActionCardFactLabel>
                    <MessageActionCardFactValue>Ada, Will</MessageActionCardFactValue>
                  </MessageActionCardFact>
                  <MessageActionCardFact>
                    <MessageActionCardFactLabel>Agents</MessageActionCardFactLabel>
                    <MessageActionCardFactValue>Lumen</MessageActionCardFactValue>
                  </MessageActionCardFact>
                </MessageActionCardFacts>
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" disabled>
                    Add Members
                  </Button>
                </MessageActionCardActions>
              </MessageActionCardContent>
            </MessageActionCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
