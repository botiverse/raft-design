import { Banner, BannerDescription, BannerTitle } from "raft-ui";
import { CircleAlert } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="warning" className="w-fit max-w-full">
      <CircleAlert />
      <BannerTitle>Invoice details missing</BannerTitle>
      <BannerDescription>Add billing email and tax ID.</BannerDescription>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerWarningComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BannerContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
