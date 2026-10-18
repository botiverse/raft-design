import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Avatar, AvatarBadge, Status } from "raft-ui";
import type { AvatarProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZE_OPTIONS, TYPES } from "./avatar.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type AvatarPlaygroundPreviewProps = {
  code: CodeContent;
};

const BADGE_OPTIONS = ["none", "dot", "status"] as const;
type BadgeOption = (typeof BADGE_OPTIONS)[number];

export function AvatarPlaygroundPreview({ code }: AvatarPlaygroundPreviewProps) {
  const [size, setSize] = useState<NonNullable<AvatarProps["size"]>>("lg");
  const [type, setType] = useState<NonNullable<AvatarProps["type"]>>("agent");
  const [badge, setBadge] = useState<BadgeOption>("status");

  const handleSizeChange = useCallback((value: string) => {
    setSize(value as NonNullable<AvatarProps["size"]>);
  }, []);
  const handleTypeChange = useCallback((value: string) => {
    setType(value as NonNullable<AvatarProps["type"]>);
  }, []);
  const handleBadgeChange = useCallback((value: string) => {
    setBadge(value as BadgeOption);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <Avatar size={size} type={type}>
          {badge === "dot" ? <AvatarBadge /> : null}
          {badge === "status" ? (
            <AvatarBadge render={<Status aria-hidden variant="success" />} />
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
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Type" htmlFor="avatar-preview-type">
          <Preview.Select
            id="avatar-preview-type"
            label="Type"
            options={TYPES}
            value={type}
            onValueChange={handleTypeChange}
          />
        </Preview.Control>
        <Preview.Control label="Badge" htmlFor="avatar-preview-badge">
          <Preview.Select
            id="avatar-preview-badge"
            label="Badge"
            options={BADGE_OPTIONS}
            value={badge}
            onValueChange={handleBadgeChange}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
