import { helperText, Banner, BannerDescription } from "@botiverse/raft-ui";
import { TriangleAlert } from "lucide-react";

export function BannerPreviewContent() {
  return (
    <Banner status="warning" className="w-[28rem]">
      <TriangleAlert />
      <BannerDescription>
        {helperText("This action can’t be undone.", { why: "consequence", about: "action" })}
      </BannerDescription>
    </Banner>
  );
}
