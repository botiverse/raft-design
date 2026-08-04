import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const SAMPLE_IMAGE =
  "https://unsplash.com/photos/n4KewLKFOZw/download?force=true&w=160&h=160&fit=crop&crop=faces";

export function AvatarPanelHeaderContent() {
  return (
    <Avatar size="md" type="human">
      <AvatarImage src={SAMPLE_IMAGE} alt="Atlas" />
      <AvatarFallback />
    </Avatar>
  );
}

// @docs-source-strip-start
export function AvatarPanelHeaderComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <AvatarPanelHeaderContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
