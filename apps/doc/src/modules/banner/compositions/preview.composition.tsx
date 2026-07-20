import { Banner, BannerDescription } from "raft-ui";
import { CircleAlert } from "lucide-react";

export function BannerPreviewContent() {
  return (
    <Banner status="warning" className="w-[28rem]">
      <CircleAlert />
      <BannerDescription>This action can&rsquo;t be undone.</BannerDescription>
    </Banner>
  );
}
