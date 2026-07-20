import { Banner, BannerDescription, BannerTitle } from "raft-ui";
import { CheckCircle2 } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="success" className="w-fit max-w-full">
      <CheckCircle2 />
      <BannerTitle>Deployment live</BannerTitle>
      <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerSuccessComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BannerContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
