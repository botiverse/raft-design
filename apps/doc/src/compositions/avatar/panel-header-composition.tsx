import { Avatar, AvatarFallback, AvatarImage } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
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
    <SourceComparisonPreview className={className}>
      <AvatarPanelHeaderContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
