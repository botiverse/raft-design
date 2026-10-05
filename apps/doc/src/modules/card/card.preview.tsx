import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { CardProps } from "raft-ui";

import { Preview } from "#/components/preview.tsx";
import { CardProjectSummaryComposition } from "./compositions/project-summary.composition.tsx";

type CardVariant = NonNullable<CardProps["variant"]>;
type CodeContent = ReactNode | AnyRenderableServerComponent;

const CARD_VARIANTS = ["default", "inset"] as const satisfies readonly CardVariant[];

type CardPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function CardPreview({ code, collapsedCode }: CardPreviewProps) {
  const [variant, setVariant] = useState<CardVariant>("default");

  const handleVariantChange = useCallback((value: string) => {
    setVariant(value as CardVariant);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <CardProjectSummaryComposition variant={variant} />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Variant">
          <Preview.Segmented
            label="Variant"
            options={CARD_VARIANTS}
            value={variant}
            onValueChange={handleVariantChange}
          />
        </Preview.ControlGroup>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
