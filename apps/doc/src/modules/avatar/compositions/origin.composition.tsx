import { Avatar, AvatarBadge, AvatarFallback } from "@botiverse/raft-ui";
import { AvatarOrigin } from "@botiverse/raft-ui/wip";

export function AvatarOriginContent() {
  return (
    <div className="flex items-end gap-6">
      <Avatar size="xl" type="human">
        <AvatarFallback>MC</AvatarFallback>
        <AvatarOrigin aria-hidden>
          <AvatarFallback>A</AvatarFallback>
        </AvatarOrigin>
      </Avatar>
      <Avatar size="lg" type="human">
        <AvatarFallback>MC</AvatarFallback>
        <AvatarOrigin aria-hidden>
          <AvatarFallback>A</AvatarFallback>
        </AvatarOrigin>
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback>R</AvatarFallback>
        <AvatarOrigin aria-hidden>
          <AvatarFallback>A</AvatarFallback>
        </AvatarOrigin>
        <AvatarBadge presence="external" role="img" aria-label="External agent" />
      </Avatar>
      <Avatar size="sm" type="human">
        <AvatarFallback>M</AvatarFallback>
        <AvatarOrigin aria-hidden>
          <AvatarFallback>A</AvatarFallback>
        </AvatarOrigin>
      </Avatar>
      <Avatar size="xs" type="human">
        <AvatarFallback>M</AvatarFallback>
        <AvatarOrigin aria-hidden>
          <AvatarFallback>A</AvatarFallback>
        </AvatarOrigin>
      </Avatar>
    </div>
  );
}
