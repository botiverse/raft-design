import { useState } from "react";
import { MessageItemExampleAvatar } from "../message-item-example-avatar.tsx";
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

function MessageReactionsRow() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [reaction, setReaction] = useState<string>();
  const [open, setOpen] = useState(false);

  return (
    <MessageItemInteractionBoundary ref={setPortalContainer}>
      <MessageItem>
        <MessageItemAvatarSlot>
          <MessageItemExampleAvatar />
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:33 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Reaction chips, failure flash, and the mobile add control stay caller-wired.
          </MessageItemBody>
          <MessageItemFooter>
            <MessageReactionComposition emoji="👍" count={5} reacted />
            <MessageReactionComposition emoji="👀" count={2} />
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
  );
}

export function MessageReactionsShowcaseComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-6">
      <MessageReactionsRow />
      <MessageReactionOverlaysComposition />
    </div>
  );
}
