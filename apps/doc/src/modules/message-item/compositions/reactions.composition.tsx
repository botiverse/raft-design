import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import { Plus } from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemSender,
  MessageItemTime,
  MessageReactionAddButton,
} from "raft-ui/wip";
import {
  MessageReactionComposition,
  MessageReactionOverlaysComposition,
} from "./reaction.compositions.tsx";
import { MessageQuickReactionPicker } from "./quick-reaction-picker.composition.tsx";

export function MessageReactionsShowcaseComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [reaction, setReaction] = useState<string>();
  const [open, setOpen] = useState(false);

  return (
    <div className="grid w-full max-w-3xl gap-6">
      <MessageItemInteractionBoundary ref={setPortalContainer}>
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
              <MessageItemTime>2:33 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              Sprite reactions, a custom Unicode fallback, failure flash, and the mobile add control
              stay caller-wired.
            </MessageItemBody>
            <MessageItemFooter>
              <MessageReactionComposition emoji="👍" count={5} reacted />
              <MessageReactionComposition emoji="👀" count={2} />
              <MessageReactionComposition emoji="🧭" count={1} title="Custom emoji fallback" />
              <MessageReactionComposition emoji="🔥" count={1} failed />
              <MessageQuickReactionPicker
                open={open}
                onOpenChange={setOpen}
                onReact={setReaction}
                trigger={
                  <MessageReactionAddButton
                    aria-label="Add reaction"
                    data-message-affordance="mobile-reaction-add"
                    className="md:hidden"
                  >
                    <Plus strokeWidth={2.5} />
                  </MessageReactionAddButton>
                }
                side="top"
                align="center"
                portalContainer={portalContainer}
              />
            </MessageItemFooter>
          </MessageItemContent>
        </MessageItem>
        {reaction ? (
          <span className="sr-only" role="status">
            Reacted with {reaction}
          </span>
        ) : null}
      </MessageItemInteractionBoundary>
      <MessageReactionOverlaysComposition />
    </div>
  );
}
