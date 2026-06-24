import { Banner, BannerAction, BannerDescription, Button } from "@raft/ui";
import { Info, X } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="info" size="lg" className="w-fit max-w-full">
      <Info />
      <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
      <BannerAction>
        <Button size="icon-xs" aria-label="Dismiss">
          <X />
        </Button>
      </BannerAction>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerLargeActionsComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BannerContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
