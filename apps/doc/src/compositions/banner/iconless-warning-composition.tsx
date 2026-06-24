import { Banner, BannerDescription } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="warning" className="w-fit max-w-full">
      <BannerDescription>Please fix the highlighted fields.</BannerDescription>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerIconlessWarningComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BannerContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
