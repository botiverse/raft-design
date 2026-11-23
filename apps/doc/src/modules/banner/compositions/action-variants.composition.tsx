import {
  helperText,
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
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.banner.action-variants" });
// @docs-source-strip-end

export function BannerSingleActionContent() {
  return (
    <Banner status="warning">
      <TriangleAlert />
      <BannerDescription>
        {helperText("Couldn’t load tasks.", { why: "recovery", about: "task" })}
      </BannerDescription>
      <BannerAction>
        <Button variant="default" size="md">
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
      <BannerAction>
        <Button variant="ghost" size="md">
          Dismiss
        </Button>
        <Button variant="default" size="md">
          Show me
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
        {helperText(
          <>
            Older messages come back on Pro. <TextLink variant="strong">View usage</TextLink>
          </>,
          { why: "recovery", about: "message history" },
        )}
      </BannerDescription>
      <BannerAction>
        <Button variant="default" size="md">
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
