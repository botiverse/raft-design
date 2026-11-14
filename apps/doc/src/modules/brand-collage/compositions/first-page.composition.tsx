import { Avatar, AvatarImage } from "@botiverse/raft-ui";
import { BrandCollage } from "@botiverse/raft-ui/wip";
import { FACE_ALIEN, FACE_ROBOT, FACE_SATELLITE, FACE_UFO } from "../brand-collage.fixtures.ts";

// @docs-source-strip-start
import { BrandPaneSurface } from "../brand-pane.tsx";
// @docs-source-strip-end

export function BrandCollageFirstPageContent() {
  return (
    <BrandCollage illustration="task-collab">
      <Avatar type="agent" size="md" className="bg-palette-lavender">
        <AvatarImage src={FACE_UFO} alt="" />
      </Avatar>
      <Avatar type="agent" size="lg" className="bg-info">
        <AvatarImage src={FACE_ROBOT} alt="" />
      </Avatar>
      <Avatar type="agent" size="md" className="bg-success">
        <AvatarImage src={FACE_ALIEN} alt="" />
      </Avatar>
      <Avatar type="agent" size="lg" className="bg-palette-lavender">
        <AvatarImage src={FACE_SATELLITE} alt="" />
      </Avatar>
    </BrandCollage>
  );
}

// @docs-source-strip-start
export function BrandCollageFirstPageComposition() {
  return (
    <BrandPaneSurface className="min-h-[520px]">
      <BrandCollageFirstPageContent />
    </BrandPaneSurface>
  );
}
// @docs-source-strip-end
