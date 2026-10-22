import { useCallback, useState } from "react";
import { Hash } from "lucide-react";
import {
  Avatar,
  Button,
  MessageActionCard,
  MessageActionCardActions,
  MessageActionCardCollapseTrigger,
  MessageActionCardContent,
  MessageActionCardHeader,
  MessageActionCardHeaderDescription,
  MessageActionCardHeaderIcon,
  MessageActionCardHeaderTitle,
  MessageActionCardHint,
  MessageActionCardHintLabel,
  MessageActionCardProperties,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardPropertyValue,
  MessageActionCardStatus,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

export function MessageActionCardAgentRequestContent() {
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(true);

  const handleConfirm = useCallback(() => {
    setDone(true);
    setOpen(false);
  }, []);

  return (
    <MessageItem className="w-full max-w-3xl">
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent" />
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Bugen</MessageItemSender>
          <MessageItemTime>10:58</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody className="grid gap-2">
          The launch review needs its own channel. I've filled it in; it needs one of you to create
          it.
          <MessageActionCard open={open} onOpenChange={setOpen}>
            <MessageActionCardHeader>
              <MessageActionCardHeaderIcon>
                <Hash />
              </MessageActionCardHeaderIcon>
              <MessageActionCardHeaderTitle>
                Create private channel #launch-review
                {done ? (
                  <MessageActionCardHeaderDescription>
                    Committed by Martin · <time dateTime="2026-10-19T11:02">11:02</time>
                  </MessageActionCardHeaderDescription>
                ) : null}
              </MessageActionCardHeaderTitle>
              {done ? (
                <>
                  <MessageActionCardStatus variant="success">Done</MessageActionCardStatus>
                  <MessageActionCardCollapseTrigger aria-label="Show or hide details" />
                </>
              ) : null}
            </MessageActionCardHeader>
            <MessageActionCardContent>
              <MessageActionCardProperties>
                <MessageActionCardProperty>
                  <MessageActionCardPropertyLabel>Description</MessageActionCardPropertyLabel>
                  <MessageActionCardPropertyValue>
                    Final review before launch week
                  </MessageActionCardPropertyValue>
                </MessageActionCardProperty>
                <MessageActionCardProperty>
                  <MessageActionCardPropertyLabel>Humans</MessageActionCardPropertyLabel>
                  <MessageActionCardPropertyValue>Martin, Ada</MessageActionCardPropertyValue>
                </MessageActionCardProperty>
                <MessageActionCardProperty>
                  <MessageActionCardPropertyLabel>Agents</MessageActionCardPropertyLabel>
                  <MessageActionCardPropertyValue>Bugen, Wug</MessageActionCardPropertyValue>
                </MessageActionCardProperty>
              </MessageActionCardProperties>
              <MessageActionCardHintLabel>Reason</MessageActionCardHintLabel>
              <MessageActionCardHint>
                Martin asked for a separate place for the review in #launch-week.
              </MessageActionCardHint>
              {done ? null : (
                <MessageActionCardActions>
                  <Button type="button" variant="outline" size="md" onClick={handleConfirm}>
                    Create Channel
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
