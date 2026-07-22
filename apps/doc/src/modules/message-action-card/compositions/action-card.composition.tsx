import { useState } from "react";
import { Check } from "lucide-react";
import { Badge, Button } from "raft-ui";
import { MessageItemExampleAvatar } from "#/modules/message-item/message-item-example-avatar.tsx";
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

function ActionCardMessage({
  children,
  sender,
  time,
}: {
  children: React.ReactNode;
  sender: string;
  time: string;
}) {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <MessageItemExampleAvatar />
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>{sender}</MessageItemSender>
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>{time}</MessageItemTime>
        </MessageItemHeader>
        {children}
      </MessageItemContent>
    </MessageItem>
  );
}

export function ActionCardMessageComposition() {
  const [executed, setExecuted] = useState(false);

  return (
    <ActionCardMessage sender="Atlas" time="2:27 PM">
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
    </ActionCardMessage>
  );
}

export function MessageActionCardShowcaseComposition() {
  return (
    <div className="w-full max-w-3xl">
      <ActionCardMessageComposition />
    </div>
  );
}
