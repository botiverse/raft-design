import { useState, type ReactNode } from "react";
import { Avatar, AvatarBadge, Status, type AvatarProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZE_OPTIONS, TYPES } from "./avatar.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type AvatarPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

const BADGE_OPTIONS = ["none", "dot", "status"] as const;
type BadgeOption = (typeof BADGE_OPTIONS)[number];

export function AvatarPlaygroundPreview({ code, collapsedCode }: AvatarPlaygroundPreviewProps) {
  const [size, setSize] = useState<NonNullable<AvatarProps["size"]>>("lg");
  const [type, setType] = useState<NonNullable<AvatarProps["type"]>>("agent");
  const [badge, setBadge] = useState<BadgeOption>("status");
  const [pulse, setPulse] = useState(false);

  return (
    <Preview>
      <Preview.Canvas>
        <Avatar size={size} type={type}>
          {badge === "dot" ? <AvatarBadge /> : null}
          {badge === "status" ? (
            <AvatarBadge render={<Status aria-hidden variant="success" pulse={pulse} />} />
          ) : null}
        </Avatar>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Size" htmlFor="avatar-preview-size">
          <Preview.Select
            id="avatar-preview-size"
            label="Size"
            options={SIZE_OPTIONS}
            value={size}
            onValueChange={(value) => setSize(value as NonNullable<AvatarProps["size"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Type" htmlFor="avatar-preview-type">
          <Preview.Select
            id="avatar-preview-type"
            label="Type"
            options={TYPES}
            value={type}
            onValueChange={(value) => setType(value as NonNullable<AvatarProps["type"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Badge" htmlFor="avatar-preview-badge">
          <Preview.Select
            id="avatar-preview-badge"
            label="Badge"
            options={BADGE_OPTIONS}
            value={badge}
            onValueChange={(value) => setBadge(value as BadgeOption)}
          />
        </Preview.Control>
        <Preview.Control label="Pulse" htmlFor="avatar-preview-pulse">
          <Preview.Checkbox
            id="avatar-preview-pulse"
            label="Pulse"
            checked={pulse}
            onCheckedChange={setPulse}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
