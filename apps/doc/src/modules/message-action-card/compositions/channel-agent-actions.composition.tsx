import { Avatar, AvatarFallback, AvatarImage, Button } from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardContent,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardProperties,
  MessageActionCardPropertyValue,
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
} from "raft-ui";

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
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Description</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>
                      Coordinate the final release review.
                    </MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Humans</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>Ada, Will</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Agents</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>Atlas</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
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
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Description</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>
                      Own the regression-triage queue.
                    </MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>
                      Suggested computer
                    </MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>Studio Mac</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
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
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Channel</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>#release-review</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Humans</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>Ada, Will</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Agents</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>Lumen</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
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
