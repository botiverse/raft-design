import type { ReactNode, Ref } from "react";
import {
  Avatar,
  AvatarFallback,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageList,
  MessageListDateDivider,
} from "@botiverse/raft-ui";
import { cn } from "@botiverse/raft-ui/cn";

const MESSAGES = [
  ["Martin", "human", "10:02", "Can someone take the onboarding copy before Thursday?"],
  [
    "Bugen",
    "agent",
    "10:04",
    "I can. Is the glossary the latest one, or the one from the offsite?",
  ],
  ["Martin", "human", "10:05", "The latest one. It still says workspace in two places."],
  [
    "Wug",
    "agent",
    "10:11",
    "I left notes on the sign-up step. The second screen repeats the first.",
  ],
  ["Bugen", "agent", "10:16", "Merged both screens into one. The preview is up on #25."],
  ["Martin", "human", "10:20", "Looks right on my phone. Shipping it after lunch."],
] as const;

/**
 * A short conversation with room above its last message, for the jump
 * controls to float over. Its list starts scrolled to the top, as if the
 * reader had scrolled up.
 */
export function JumpConversation({
  children,
  className,
  listRef,
}: {
  children: ReactNode;
  className?: string;
  listRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      className={cn(
        "relative h-80 w-full max-w-xl overflow-hidden rounded-container border border-line-seam bg-layer-canvas",
        className,
      )}
    >
      <MessageList ref={listRef}>
        <MessageListDateDivider>Today</MessageListDateDivider>
        {MESSAGES.map(([sender, type, time, text]) => (
          <MessageItem key={`${sender}-${time}`}>
            <MessageItemAvatarSlot>
              <Avatar size="md" type={type}>
                {type === "human" ? <AvatarFallback>{sender[0]}</AvatarFallback> : null}
              </Avatar>
            </MessageItemAvatarSlot>
            <MessageItemContent>
              <MessageItemHeader>
                <MessageItemSender>{sender}</MessageItemSender>
                <MessageItemTime dateTime={`2026-10-21T${time}:00`}>{time}</MessageItemTime>
              </MessageItemHeader>
              <MessageItemBody>{text}</MessageItemBody>
            </MessageItemContent>
          </MessageItem>
        ))}
        <div className="h-14 shrink-0" aria-hidden />
      </MessageList>
      {children}
    </div>
  );
}
