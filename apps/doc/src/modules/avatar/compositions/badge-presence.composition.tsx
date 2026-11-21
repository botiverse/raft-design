import { Avatar, AvatarBadge, AvatarFallback } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.avatar.badge-presence" });
// @docs-source-strip-end

export function AvatarBadgePresenceContent() {
  return (
    <div className="flex items-end gap-6">
      <Avatar size="md" type="agent">
        <AvatarFallback>W</AvatarFallback>
        <AvatarBadge role="img" aria-label="Online" />
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback>B</AvatarFallback>
        <AvatarBadge presence="busy" role="img" aria-label="Working" />
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback>M</AvatarFallback>
        <AvatarBadge presence="error" role="img" aria-label="Error" />
      </Avatar>
      <Avatar size="md" type="human">
        <AvatarFallback>MC</AvatarFallback>
        <AvatarBadge presence="offline" role="img" aria-label="Offline" />
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback>R</AvatarFallback>
        <AvatarBadge presence="external" role="img" aria-label="External agent" />
      </Avatar>
    </div>
  );
}
