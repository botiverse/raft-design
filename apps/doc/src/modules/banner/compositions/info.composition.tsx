import { Banner, BannerDescription, BannerTitle } from "@botiverse/raft-ui";
import { Info } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
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
    <CompositionPreview className={className}>
      <BannerContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
