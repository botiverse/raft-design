import { Banner, BannerAction, BannerDescription, BannerTitle, Button } from "@botiverse/raft-ui";
import { CircleAlert, X } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerSingleActionContent() {
  return (
    <Banner status="warning">
      <CircleAlert />
      <BannerTitle>Invoice details missing</BannerTitle>
      <BannerDescription>Add billing email and tax ID before the next cycle.</BannerDescription>
      <BannerAction>
        <Button variant="default" size="xs">
          Review
        </Button>
      </BannerAction>
    </Banner>
  );
}

export function BannerDualActionContent() {
  return (
    <Banner status="warning">
      <CircleAlert />
      <BannerTitle>Plan limit reached</BannerTitle>
      <BannerDescription>Remove an inactive machine before adding another.</BannerDescription>
      <BannerAction>
        <Button variant="ghost" size="xs">
          Dismiss
        </Button>
        <Button variant="default" size="xs">
          Upgrade
        </Button>
      </BannerAction>
    </Banner>
  );
}

export function BannerDismissOnlyContent() {
  return (
    <Banner status="info">
      <BannerTitle>Deployment live</BannerTitle>
      <BannerDescription>Version 1.8.4 is in production.</BannerDescription>
      <BannerAction>
        <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
          <X />
        </Button>
      </BannerAction>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerActionVariantsComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <div className="flex w-[28rem] flex-col gap-3">
        <BannerSingleActionContent />
        <BannerDualActionContent />
        <BannerDismissOnlyContent />
      </div>
    </CompositionPreview>
  );
}
// @docs-source-strip-end
