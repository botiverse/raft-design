import { Banner, BannerDescription, BannerTitle } from "@slock/ui";
import { IconCircleXmarkFill18 } from "nucleo-ui-fill-18";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function BannerContent() {
  return (
    <Banner status="destructive" className="w-fit max-w-full">
      <IconCircleXmarkFill18 />
      <BannerTitle>Delete server</BannerTitle>
      <BannerDescription>This can&rsquo;t be undone.</BannerDescription>
    </Banner>
  );
}

// @docs-source-strip-start
export function BannerIconTitleComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BannerContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
