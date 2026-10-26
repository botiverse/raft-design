import { Hash, MessageSquare, Send } from "lucide-react";
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
  MessageActionCardProperties,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardPropertyValue,
  MessageActionCardStatus,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageReferenceChip,
} from "@botiverse/raft-ui";

/** Raft's receipt in Alice's DM with Friday: the card on its own row, its left edge on the text column. */
function Receipt({
  time,
  preview,
  thread,
  retracted,
}: {
  time: string;
  preview: string;
  thread?: boolean;
  retracted: boolean;
}) {
  return (
    <MessageItem compact>
      <MessageItemGutter />
      <MessageItemContent>
        <MessageActionCard
          key={retracted ? "retracted" : "live"}
          defaultOpen={!retracted}
          className="max-w-xl"
        >
          <MessageActionCardHeader>
            <MessageActionCardHeaderIcon>
              <Send />
            </MessageActionCardHeaderIcon>
            <MessageActionCardHeaderTitle>
              Sent for you in {thread ? "a thread in " : ""}
              <MessageReferenceChip variant="accent" render={<a href="#launch-week" />}>
                <Hash size={12} />
                launch-week
              </MessageReferenceChip>
              <MessageActionCardHeaderDescription>{time}</MessageActionCardHeaderDescription>
            </MessageActionCardHeaderTitle>
            {retracted ? (
              <>
                <MessageActionCardStatus variant="muted">Retracted</MessageActionCardStatus>
                <MessageActionCardCollapseTrigger aria-label="Show or hide details" />
              </>
            ) : null}
          </MessageActionCardHeader>
          <MessageActionCardContent>
            <MessageActionCardProperties>
              <MessageActionCardProperty>
                <MessageActionCardPropertyLabel>Message text</MessageActionCardPropertyLabel>
                <MessageActionCardPropertyValue>{preview}</MessageActionCardPropertyValue>
              </MessageActionCardProperty>
            </MessageActionCardProperties>
            {retracted ? null : (
              <MessageActionCardActions>
                <Button size="sm" variant="ghost">
                  <MessageSquare />
                  Open Message
                </Button>
                {/* Confirms in a red AlertDialog: Retract this message? · Cancel / Retract. */}
                <Button size="sm">Retract Message</Button>
              </MessageActionCardActions>
            )}
          </MessageActionCardContent>
        </MessageActionCard>
      </MessageItemContent>
    </MessageItem>
  );
}

export function MessageActionCardDelegatedReceiptContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human" />
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Alice</MessageItemSender>
            <MessageItemTime dateTime="2026-10-21T10:40:00">10:40</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Tell #launch-week the review moves to Thursday.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <Receipt time="10:41" preview="The design review moves to Thursday at 3." retracted={false} />
      <Receipt time="09:12" preview="I'll own the SSO callback list." thread retracted />
    </div>
  );
}
