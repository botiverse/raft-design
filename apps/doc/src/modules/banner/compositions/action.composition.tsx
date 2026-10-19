import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  TextLink,
} from "@botiverse/raft-ui";
import { CircleAlert, X } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function BannerInlineActionContent() {
  return (
    <Banner status="warning" className="w-fit max-w-full">
      <CircleAlert />
      <BannerTitle>Plan limit reached</BannerTitle>
      <BannerDescription>
        Remove an inactive machine before adding another.{" "}
        <TextLink variant="strong">Manage Machines</TextLink>
      </BannerDescription>
      <BannerAction>
        <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
          <X />
        </Button>
      </BannerAction>
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
