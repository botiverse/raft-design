import { BrandIllustration } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { BrandPaneSurface } from "../../brand-collage/brand-pane.tsx";
// @docs-source-strip-end

export function BrandIllustrationPreviewContent() {
  return <BrandIllustration name="raft" />;
}

// @docs-source-strip-start
export function BrandIllustrationPreviewComposition() {
  return (
    <BrandPaneSurface className="min-h-72">
      <BrandIllustrationPreviewContent />
    </BrandPaneSurface>
  );
}
// @docs-source-strip-end
