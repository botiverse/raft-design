import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function AvatarGroupContent() {
  return (
    <div className="flex items-center gap-8">
      <AvatarGroup role="img" aria-label="Wug, Bugen and Atlas working">
        <Avatar size="xs" type="agent" />
        <Avatar size="xs" type="agent" />
        <Avatar size="xs" type="agent" />
      </AvatarGroup>
      <AvatarGroup role="img" aria-label="Martin, Ada, Wug and 2 others">
        <Avatar size="xs" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <Avatar size="xs" type="human">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar size="xs" type="agent" />
        <AvatarGroupCount size="xs">+2</AvatarGroupCount>
      </AvatarGroup>
      <AvatarGroup role="img" aria-label="Wug, Bugen and 3 other agents following">
        <Avatar size="3xs" type="agent" />
        <Avatar size="3xs" type="agent" />
        <AvatarGroupCount size="3xs">3</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}

// @docs-source-strip-start
export function AvatarGroupComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <AvatarGroupContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
