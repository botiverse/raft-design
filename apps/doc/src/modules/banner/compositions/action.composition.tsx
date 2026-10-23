import { Banner, BannerClose, BannerDescription, BannerTitle, TextLink } from "@botiverse/raft-ui";
import { TriangleAlert } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerInlineActionContent() {
  return (
    <Banner status="warning" className="w-[36rem] max-w-full">
      <TriangleAlert />
      <BannerTitle>Plan limit reached</BannerTitle>
      <BannerDescription>
        Remove an inactive machine before adding another.{" "}
        <TextLink variant="strong">Manage Machines</TextLink>
      </BannerDescription>
      <BannerClose />
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerActionComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <BannerInlineActionContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
