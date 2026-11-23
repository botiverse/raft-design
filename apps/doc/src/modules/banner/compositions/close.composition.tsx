import { helperText, Banner, BannerClose, BannerDescription } from "@botiverse/raft-ui";
import { Info } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerCloseContent() {
  return (
    <Banner status="info" className="w-[48rem] max-w-full">
      <Info />
      <BannerDescription>
        {helperText("Guests can now read #launch-week.", { why: "audience", about: "channel" })}
      </BannerDescription>
      <BannerClose />
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerCloseComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <BannerCloseContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
