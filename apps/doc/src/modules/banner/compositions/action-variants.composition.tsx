import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  TextLink,
} from "@botiverse/raft-ui";
import { Info, Sparkles, TriangleAlert } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerSingleActionContent() {
  return (
    <Banner status="warning">
      <TriangleAlert />
      <BannerDescription>Couldn&rsquo;t load tasks.</BannerDescription>
      <BannerAction>
        <Button variant="default" size="sm">
          Retry
        </Button>
      </BannerAction>
    </Banner>
  );
}

export function BannerDualActionContent() {
  return (
    <Banner status="info">
      <Sparkles />
      <BannerTitle>Threads now show in the sidebar</BannerTitle>
      <BannerDescription>Pin the threads you follow so they stay one click away.</BannerDescription>
      <BannerAction>
        <Button variant="ghost" size="sm">
          Dismiss
        </Button>
        <Button variant="default" size="sm">
          Show Me
        </Button>
      </BannerAction>
    </Banner>
  );
}

export function BannerTitleActionContent() {
  return (
    <Banner status="info">
      <Info />
      <BannerTitle>This channel shows the last 90 days</BannerTitle>
      <BannerDescription>
        Older messages come back on Pro. <TextLink variant="strong">View Usage</TextLink>
      </BannerDescription>
      <BannerAction>
        <Button variant="default" size="sm">
          Upgrade
        </Button>
      </BannerAction>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerActionVariantsComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <div className="flex w-[48rem] max-w-full flex-col gap-3">
        <BannerSingleActionContent />
        <BannerDualActionContent />
        <BannerTitleActionContent />
      </div>
    </CompositionPreview>
  );
}
// @docs-source-strip-end
