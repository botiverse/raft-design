import { Avatar, AvatarFallback, AvatarImage, Status, type StatusProps } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemAvatarStatus,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";

const PRESENCE = [
  { label: "Online", sender: "Kai", fallback: "KA", variant: "success" },
  { label: "Offline", sender: "Nova", fallback: "NO", variant: "default" },
  { label: "Busy", sender: "Atlas", fallback: "AT", variant: "warning" },
] as const satisfies ReadonlyArray<{
  label: string;
  sender: string;
  fallback: string;
  variant: NonNullable<StatusProps["variant"]>;
}>;

function PresenceAvatar({
  fallback,
  label,
  variant,
}: {
  fallback: string;
  label: string;
  variant: NonNullable<StatusProps["variant"]>;
}) {
  return (
    <Avatar size="md" type="agent">
      <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
      <AvatarFallback>{fallback}</AvatarFallback>
      <MessageItemAvatarStatus
        title={label}
        render={<Status aria-hidden size="lg" variant={variant} />}
      />
    </Avatar>
  );
}

export function MessageAvatarStatusComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      {PRESENCE.map((row) => (
        <MessageItem key={row.label}>
          <MessageItemAvatarSlot>
            <PresenceAvatar fallback={row.fallback} label={row.label} variant={row.variant} />
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>{row.sender}</MessageItemSender>
              <MessageItemTime>2:14 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              Avatar status shows {row.label.toLowerCase()} presence via MessageItemAvatarStatus.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      ))}
    </div>
  );
}
