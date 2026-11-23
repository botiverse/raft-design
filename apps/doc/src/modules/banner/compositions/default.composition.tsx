import { helperText, Banner, BannerDescription, BannerTitle } from "@botiverse/raft-ui";
import { Info } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="default" className="w-[28rem] max-w-full">
      <Info />
      <BannerTitle>Settings synced</BannerTitle>
      <BannerDescription>
        {helperText("Rules now apply to every project.", { why: "audience", about: "rule" })}
      </BannerDescription>
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
