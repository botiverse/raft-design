import { Avatar, AvatarBadge, Status } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.avatar.preview" });
// @docs-source-strip-end

export function AvatarPreviewContent() {
  return (
    <Avatar size="lg" type="agent">
      <AvatarBadge render={<Status aria-hidden variant="success" />} />
    </Avatar>
  );
}
