import { BrandIllustration } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { BrandPaneSurface } from "../../brand-collage/brand-pane.tsx";
// @docs-source-strip-end

export function BrandIllustrationAllContent() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
      <BrandIllustration name="fist-bump" cell={4} />
      <BrandIllustration name="hand-off" cell={4} />
      <BrandIllustration name="award" cell={4} />
      <BrandIllustration name="deliver" cell={4} />
      <BrandIllustration name="raft" cell={4} />
      <BrandIllustration name="task-collab" cell={4} />
      <BrandIllustration name="review" cell={4} />
      <BrandIllustration name="shared-data" cell={4} />
      <BrandIllustration name="sync" cell={4} />
      <BrandIllustration name="idea" cell={4} />
    </div>
  );
}

// @docs-source-strip-start
export function BrandIllustrationAllComposition() {
  return (
    <BrandPaneSurface className="p-8">
      <BrandIllustrationAllContent />
    </BrandPaneSurface>
  );
}
// @docs-source-strip-end
