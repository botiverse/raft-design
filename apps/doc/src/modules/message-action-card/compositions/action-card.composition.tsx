import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { Check } from "lucide-react";
import { Badge, Button, Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardCompletion,
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

export function ActionCardMessageComposition() {
  const [executed, setExecuted] = useState(false);

  return (
    <MessageItem>
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
            <MessageActionCardContent>
              <MessageActionCardHeader>
                <span>Create the release review channel</span>
                {executed ? (
                  <Badge variant="success" uppercase className="ml-auto">
                    <Check size={10} className="shrink-0" />
                    <span className="shrink-0">Done</span>
                  </Badge>
                ) : null}
              </MessageActionCardHeader>
              <MessageActionCardDetails>
                #release-review · private · Atlas, Ada, and Will
              </MessageActionCardDetails>
              <MessageActionCardHint>
                Suggested after the launch checklist was approved.
              </MessageActionCardHint>
              {executed ? (
                <MessageActionCardCompletion>
                  Committed by <span className="font-bold">Will</span>
                </MessageActionCardCompletion>
              ) : (
                <MessageActionCardActions>
                  <Button size="sm" variant="accent" onClick={() => setExecuted(true)}>
                    Create channel
                  </Button>
                </MessageActionCardActions>
              )}
            </MessageActionCardContent>
          </MessageActionCard>
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function MessageActionCardShowcaseComposition() {
  return (
    <div className="w-full max-w-3xl">
      <ActionCardMessageComposition />
    </div>
  );
}
