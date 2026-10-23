import { Banner, BannerAction, BannerDescription, BannerTitle, Button } from "@botiverse/raft-ui";
import { Sparkles } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerNarrowContent() {
  return (
    <Banner status="info" className="w-[22.5rem] max-w-full">
      <Sparkles />
      <BannerTitle>Threads now show in the sidebar</BannerTitle>
      <BannerDescription>Pin the threads you follow.</BannerDescription>
      <BannerAction>
        <Button variant="ghost" size="md">
          Dismiss
        </Button>
        <Button variant="default" size="md">
          Show Me
        </Button>
      </BannerAction>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerNarrowComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <BannerNarrowContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
