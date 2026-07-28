import { Avatar, AvatarBadge, Status } from "raft-ui";

export function AvatarPreviewContent() {
  return (
    <Avatar size="lg" type="agent">
      <AvatarBadge render={<Status aria-hidden variant="success" />} />
    </Avatar>
  );
}
