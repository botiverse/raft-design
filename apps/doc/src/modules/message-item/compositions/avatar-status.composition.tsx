import type { ComponentProps } from "react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage, Status } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";

type StatusVariant = NonNullable<ComponentProps<typeof Status>["variant"]>;

type ActivityFixture = {
  activity: string;
  activityText: string;
  className?: string;
  fallback: string;
  meta: string;
  name: string;
  pulse?: boolean;
  tone: string;
  variant: StatusVariant;
};

const ACTIVITY_FIXTURES: readonly ActivityFixture[] = [
  {
    activity: "online",
    activityText: "Online",
    fallback: "KA",
    meta: "claude-sonnet",
    name: "Kai",
    tone: "success / lime",
    variant: "success",
  },
  {
    activity: "thinking",
    activityText: "Thinking…",
    className: "[--status-color:var(--color-soft-signal)]",
    fallback: "MI",
    meta: "claude-opus",
    name: "Mira",
    pulse: true,
    tone: "warning / yellow",
    variant: "warning",
  },
  {
    activity: "working",
    activityText: "Working…",
    className: "[--status-color:var(--color-soft-signal)]",
    fallback: "NO",
    meta: "gpt-4.1",
    name: "Nova",
    pulse: true,
    tone: "warning / yellow",
    variant: "warning",
  },
  {
    activity: "error",
    activityText: "Error",
    className: "[--status-color:var(--color-brutal-orange)]",
    fallback: "ER",
    meta: "runtime problem",
    name: "Eris",
    tone: "warning / orange",
    variant: "warning",
  },
  {
    activity: "offline",
    activityText: "Offline",
    fallback: "AT",
    meta: "owner",
    name: "Atlas",
    tone: "default / stone",
    variant: "default",
  },
  {
    activity: "external",
    activityText: "External",
    fallback: "RE",
    meta: "external agent",
    name: "Relay",
    tone: "information / cyan (neutral)",
    variant: "information",
  },
] as const;

export function MessageAvatarStatusComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      {ACTIVITY_FIXTURES.map((fixture) => (
        <MessageItem key={fixture.activity}>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>{fixture.fallback}</AvatarFallback>
              <AvatarBadge
                title={fixture.activityText}
                render={
                  <Status
                    aria-hidden
                    className={fixture.className}
                    pulse={fixture.pulse}
                    size="lg"
                    variant={fixture.variant}
                  />
                }
              />
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>{fixture.name}</MessageItemSender>
              <MessageItemMeta>{fixture.meta}</MessageItemMeta>
              <MessageItemTime>2:14 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              Source activity: {fixture.activity} → “{fixture.activityText}” · {fixture.tone}
              {fixture.pulse ? " · pulse" : " · no pulse"}.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      ))}
    </div>
  );
}
