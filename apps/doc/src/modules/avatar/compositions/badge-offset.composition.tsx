import { Avatar, AvatarBadge, AvatarFallback } from "raft-ui";
import type { AvatarBadgeOffset } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

// [x, y] is where the badge's centre sits, measured from the avatar's top-left.
// Percentages are of the avatar, so these corners hold at every size.
const TOP_LEFT: AvatarBadgeOffset = [0, 0];
const TOP_RIGHT: AvatarBadgeOffset = ["100%", 0];
const BOTTOM_LEFT: AvatarBadgeOffset = [0, "100%"];
const BOTTOM_RIGHT: AvatarBadgeOffset = ["100%", "100%"];
// Any CSS length works: tuck the dot just inside the top-right edge.
const INSIDE_TOP_RIGHT: AvatarBadgeOffset = ["85%", "15%"];

export function AvatarBadgeOffsetContent() {
  return (
    <div className="flex items-end gap-6">
      {/* No offset: the theme's default bottom-right spot. */}
      <Avatar size="md" type="agent">
        <AvatarFallback />
        <AvatarBadge />
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback />
        <AvatarBadge offset={TOP_LEFT} />
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback />
        <AvatarBadge offset={TOP_RIGHT} />
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback />
        <AvatarBadge offset={BOTTOM_LEFT} />
      </Avatar>
      <Avatar size="md" type="agent">
        <AvatarFallback />
        <AvatarBadge offset={BOTTOM_RIGHT} />
      </Avatar>
      <Avatar size="lg" type="human">
        <AvatarFallback />
        <AvatarBadge offset={INSIDE_TOP_RIGHT} />
      </Avatar>
    </div>
  );
}

// @docs-source-strip-start
export function AvatarBadgeOffsetComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <AvatarBadgeOffsetContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
