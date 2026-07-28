import { useState, type ReactNode } from "react";
import { Skeleton, type SkeletonProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { VARIANTS } from "./skeleton.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type SkeletonPlaygroundPreviewProps = {
  code: CodeContent;
};

export function SkeletonPlaygroundPreview({ code }: SkeletonPlaygroundPreviewProps) {
  const [variant, setVariant] = useState<NonNullable<SkeletonProps["variant"]>>("line");

  return (
    <Preview>
      <Preview.Canvas>
        <div className="flex min-h-20 items-center justify-center">
          <Skeleton
            variant={variant}
            className={variant === "line" ? "w-44" : variant === "circle" ? "size-10" : "size-12"}
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Variant" htmlFor="skeleton-preview-variant">
          <Preview.Select
            id="skeleton-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={(value) => setVariant(value as NonNullable<SkeletonProps["variant"]>)}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
