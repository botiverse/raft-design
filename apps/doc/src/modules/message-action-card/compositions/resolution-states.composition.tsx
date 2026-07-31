import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Banner,
  BannerDescription,
  Button,
} from "raft-ui";
import { Check } from "lucide-react";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardCompletion,
  MessageActionCardContent,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardProperties,
  MessageActionCardPropertyValue,
  MessageActionCardHeader,
  MessageActionCardHeaderStatus,
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

export function ActionCardResolutionStatesComposition() {
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
            <MessageItemTime>3:02 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>
                <span>Create private channel #release-review</span>
                <MessageActionCardHeaderStatus render={<Badge variant="success" />}>
                  <Check aria-hidden="true" className="size-3" />
                  Done
                </MessageActionCardHeaderStatus>
              </MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Description</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>
                      Coordinate the final release review.
                    </MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
                <MessageActionCardCompletion>
                  Committed by Ada → #release-review
                </MessageActionCardCompletion>
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
            <MessageItemTime>3:06 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageActionCard>
              <MessageActionCardHeader>Approve Linear for @lumen</MessageActionCardHeader>
              <MessageActionCardContent>
                <MessageActionCardProperties>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Service</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>Linear</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                  <MessageActionCardProperty>
                    <MessageActionCardPropertyLabel>Agent</MessageActionCardPropertyLabel>
                    <MessageActionCardPropertyValue>@lumen</MessageActionCardPropertyValue>
                  </MessageActionCardProperty>
                </MessageActionCardProperties>
                <Banner status="warning" size="sm" className="mt-2">
                  <BannerDescription>
                    Linear rejected the requested scopes. The product can permit a retry after the
                    request is corrected.
                  </BannerDescription>
                </Banner>
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" disabled>
                    Approve Login
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
