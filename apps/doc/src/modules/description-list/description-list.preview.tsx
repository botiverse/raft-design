import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { DescriptionListDirection } from "raft-ui";

import { Preview } from "#/components/preview.tsx";
import { MemberInfoComposition } from "./compositions/member-info.composition.tsx";

const DIRECTIONS = [
  "vertical",
  "horizontal",
] as const satisfies readonly DescriptionListDirection[];

type CodeContent = ReactNode | AnyRenderableServerComponent;

type DescriptionListPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function DescriptionListPreview({ code, collapsedCode }: DescriptionListPreviewProps) {
  const [direction, setDirection] = useState<DescriptionListDirection>("vertical");

  const handleDirectionChange = useCallback((value: string) => {
    setDirection(value as DescriptionListDirection);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <MemberInfoComposition direction={direction} />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Direction">
          <Preview.Segmented
            label="Direction"
            options={DIRECTIONS}
            value={direction}
            onValueChange={handleDirectionChange}
          />
        </Preview.ControlGroup>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
