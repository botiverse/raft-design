import { useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageReactionAddButton,
} from "raft-ui/wip";
import {
  MessageReactionComposition,
  MessageReactionOverlaysComposition,
} from "./reaction.compositions.tsx";
import { MessageQuickReactionPicker } from "./quick-reaction-picker.composition.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReactionsShowcaseComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [reaction, setReaction] = useState<string>();
  const [open, setOpen] = useState(false);

  return (
    <div className="grid w-full max-w-3xl gap-6">
      <div ref={setPortalContainer}>
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
              Release 2.4 is live in the release channel. Changelog and rollback steps are in the
              thread.
            </MessageItemBody>
            <MessageItemFooter>
              <MessageReactionComposition emoji="👍" count={5} reacted />
              <MessageReactionComposition emoji="👀" count={2} />
              <MessageReactionComposition emoji="🧭" count={1} />
              <MessageReactionComposition emoji="🔥" count={1} failed />
              <MessageQuickReactionPicker
                open={open}
                onOpenChange={setOpen}
                onReact={setReaction}
                trigger={
                  <MessageReactionAddButton aria-label="Add reaction">
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
      </div>
      <MessageReactionOverlaysComposition />
    </div>
  );
}
