import { helperText, Banner, BannerDescription, BannerTitle } from "@botiverse/raft-ui";
import { Info } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.banner.info" });
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="info" className="w-[28rem] max-w-full">
      <Info />
      <BannerTitle>Trial ends soon</BannerTitle>
      <BannerDescription>
        {helperText("Upgrade to keep projects available.", {
          why: "consequence",
          about: "project",
        })}
      </BannerDescription>
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
