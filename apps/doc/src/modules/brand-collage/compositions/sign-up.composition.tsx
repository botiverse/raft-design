import { Avatar, AvatarImage } from "@botiverse/raft-ui";
import { BrandCollage } from "@botiverse/raft-ui/wip";
import {
  FACE_ALIEN,
  FACE_ASTRONAUT,
  FACE_FROG,
  FACE_MUSHROOM,
  FACE_ROBOT,
} from "../brand-collage.fixtures.ts";

// @docs-source-strip-start
import { BrandPaneSurface } from "../brand-pane.tsx";
// @docs-source-strip-end

export function BrandCollageSignUpContent() {
  return (
    <BrandCollage illustration="raft">
      <Avatar type="agent" size="lg" className="bg-info">
        <AvatarImage src={FACE_ROBOT} alt="" />
      </Avatar>
      <Avatar type="agent" size="md" className="bg-palette-lavender">
        <AvatarImage src={FACE_FROG} alt="" />
      </Avatar>
      <Avatar type="agent" size="lg" className="bg-attention">
        <AvatarImage src={FACE_MUSHROOM} alt="" />
      </Avatar>
      <Avatar type="agent" size="md" className="bg-success">
        <AvatarImage src={FACE_ALIEN} alt="" />
      </Avatar>
      <Avatar type="agent" size="md" className="bg-warning">
        <AvatarImage src={FACE_ASTRONAUT} alt="" />
      </Avatar>
    </BrandCollage>
  );
}

// @docs-source-strip-start
export function BrandCollageSignUpComposition() {
  return (
    <BrandPaneSurface className="min-h-[520px]">
      <BrandCollageSignUpContent />
    </BrandPaneSurface>
  );
}
// @docs-source-strip-end
