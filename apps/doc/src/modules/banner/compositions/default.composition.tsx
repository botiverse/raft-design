import { Banner, BannerDescription, BannerTitle } from "@botiverse/raft-ui";
import { Info } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="default" className="w-fit max-w-full">
      <Info />
      <BannerTitle>Settings synced</BannerTitle>
      <BannerDescription>Rules now apply to every project.</BannerDescription>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerDefaultComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <BannerContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
