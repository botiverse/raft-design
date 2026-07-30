import { Avatar, AvatarFallback, AvatarImage, Button } from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardContent,
  MessageActionCardDetails,
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

export function ActionCardDialogBackedComposition() {
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
                <MessageActionCardDetails>
                  <div>
                    <span className="text-foreground-muted">Description:</span> Coordinate the final
                    release review.
                  </div>
                  <div>
                    <span className="text-foreground-muted">Humans:</span> Ada, Will
                  </div>
                  <div>
                    <span className="text-foreground-muted">Agents:</span> Atlas
                  </div>
                </MessageActionCardDetails>
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
                <MessageActionCardDetails>
                  <div>
                    <span className="text-foreground-muted">Description:</span> Own the
                    regression-triage queue.
                  </div>
                  <div>
                    <span className="text-foreground-muted">Suggested computer:</span> Studio Mac
                  </div>
                </MessageActionCardDetails>
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
                <MessageActionCardDetails>
                  <div>
                    <span className="text-foreground-muted">Channel:</span> #release-review
                  </div>
                  <div>
                    <span className="text-foreground-muted">Humans:</span> Ada, Will
                  </div>
                  <div>
                    <span className="text-foreground-muted">Agents:</span> Lumen
                  </div>
                </MessageActionCardDetails>
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
