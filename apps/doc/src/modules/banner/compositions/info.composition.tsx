import { Banner, BannerDescription, BannerTitle } from "raft-ui";
import { Info } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="info" className="w-fit max-w-full">
      <Info />
      <BannerTitle>Trial ends soon</BannerTitle>
      <BannerDescription>Upgrade to keep projects available.</BannerDescription>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerInfoComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BannerContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
