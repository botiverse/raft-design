import { Avatar, AvatarBadge, AvatarFallback, Status } from "@botiverse/raft-ui";
import { AvatarOrigin } from "@botiverse/raft-ui/wip";

export function AvatarCornersContent() {
  return (
    <div className="flex items-end gap-6">
      {/* Bottom-right, status: an agent's presence light. */}
      <Avatar size="md" type="agent">
        <AvatarFallback>W</AvatarFallback>
        <AvatarBadge presence="busy" role="img" aria-label="Working" />
      </Avatar>
      {/* Top-left, origin: an agent from Acme Corp, with its light. */}
      <Avatar size="md" type="agent">
        <AvatarFallback>R</AvatarFallback>
        <AvatarOrigin aria-hidden>
          <AvatarFallback>A</AvatarFallback>
        </AvatarOrigin>
        <AvatarBadge role="img" aria-label="Online" />
      </Avatar>
      {/* Top-right, attention: a server with unread items. */}
      <Avatar size="md" type="server">
        <AvatarFallback>L</AvatarFallback>
        <AvatarBadge position="top-right" render={<Status aria-hidden variant="accent" />} />
      </Avatar>
      <Avatar size="xs" type="server">
        <AvatarFallback>L</AvatarFallback>
        <AvatarBadge position="top-right" render={<Status aria-hidden variant="accent" />} />
      </Avatar>
    </div>
  );
}
