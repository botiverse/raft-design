import { useState, type ReactNode } from "react";
import { Avatar, type AvatarProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZE_OPTIONS, TYPES } from "./avatar.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type AvatarPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function AvatarPlaygroundPreview({ code, collapsedCode }: AvatarPlaygroundPreviewProps) {
  const [size, setSize] = useState<NonNullable<AvatarProps["size"]>>("lg");
  const [type, setType] = useState<NonNullable<AvatarProps["type"]>>("agent");

  return (
    <Preview>
      <Preview.Canvas>
        <Avatar size={size} type={type} />
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
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
