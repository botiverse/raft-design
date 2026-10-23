import { Banner, BannerDescription } from "@botiverse/raft-ui";
import { TriangleAlert } from "lucide-react";

export function BannerPreviewContent() {
  return (
    <Banner status="warning" className="w-[28rem]">
      <TriangleAlert />
      <BannerDescription>This action can&rsquo;t be undone.</BannerDescription>
    </Banner>
  );
}
