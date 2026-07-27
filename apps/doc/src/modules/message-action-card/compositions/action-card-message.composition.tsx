import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from "raft-ui";
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

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { ACTION_CARD_FIXTURE, type ActionCardFixture } from "../message-action-card.fixtures.ts";

export function ActionCardFixtureSurface({
  fixture,
  state = "prepared",
}: {
  fixture: ActionCardFixture;
  state?: "prepared" | "executed";
}) {
  const executed = state === "executed";

  return (
    <div className="grid gap-2">
      <MessageActionCard>
        <MessageActionCardContent>
          <MessageActionCardHeader>
            <span>{fixture.title}</span>
            {executed ? (
              <Badge variant="success" uppercase className="ml-auto">
                <Check size={10} className="shrink-0" />
                <span className="shrink-0">Done</span>
              </Badge>
            ) : null}
          </MessageActionCardHeader>
          <MessageActionCardDetails>
            {fixture.details.map((detail) => (
              <div key={detail.label}>
                <span className="text-foreground-muted">{detail.label}:</span> {detail.value}
              </div>
            ))}
          </MessageActionCardDetails>
          <MessageActionCardHint>{fixture.hint}</MessageActionCardHint>
          {executed ? (
            <MessageActionCardCompletion>
              Committed by <span className="font-bold">Will</span> {fixture.result}
            </MessageActionCardCompletion>
          ) : (
            <MessageActionCardActions>
              <Button size="sm" variant="accent">
                {fixture.verb}
              </Button>
            </MessageActionCardActions>
          )}
        </MessageActionCardContent>
      </MessageActionCard>
    </div>
  );
}

export function ActionCardMessageComposition({
  fixture = ACTION_CARD_FIXTURE,
  state = "prepared",
}: {
  fixture?: ActionCardFixture;
  state?: "prepared" | "executed";
} = {}) {
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
          <ActionCardFixtureSurface fixture={fixture} state={state} />
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
