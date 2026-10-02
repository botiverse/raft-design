import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  Progress,
  ProgressHeader,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "raft-ui";
import type { ProgressProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZES, VARIANTS } from "./progress.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type ProgressPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function ProgressPlaygroundPreview({ code, collapsedCode }: ProgressPlaygroundPreviewProps) {
  const [value, setValue] = useState("64");
  const [variant, setVariant] = useState<NonNullable<ProgressProps["variant"]>>("primary");
  const [size, setSize] = useState<NonNullable<ProgressProps["size"]>>("md");
  const [indeterminate, setIndeterminate] = useState(false);
  const numericValue = Math.max(0, Math.min(100, Number(value) || 0));

  const handleVariantChange = useCallback(
    (nextValue: string) => setVariant(nextValue as NonNullable<ProgressProps["variant"]>),
    [],
  );
  const handleSizeChange = useCallback(
    (nextValue: string) => setSize(nextValue as NonNullable<ProgressProps["size"]>),
    [],
  );

  return (
    <Preview>
      <Preview.Canvas>
        <div className="w-full max-w-sm">
          <Progress value={indeterminate ? null : numericValue} variant={variant} size={size}>
            <ProgressHeader>
              <ProgressLabel>
                {indeterminate ? "Generating response" : "Uploading transcript"}
              </ProgressLabel>
              <ProgressValue />
            </ProgressHeader>
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Value" htmlFor="progress-preview-value">
          <Preview.Text
            id="progress-preview-value"
            label="Value"
            value={value}
            onValueChange={setValue}
          />
        </Preview.Control>
        <Preview.Control label="Variant" htmlFor="progress-preview-variant">
          <Preview.Select
            id="progress-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={handleVariantChange}
          />
        </Preview.Control>
        <Preview.Control label="Size" htmlFor="progress-preview-size">
          <Preview.Select
            id="progress-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Indeterminate" htmlFor="progress-preview-indeterminate">
          <Preview.Checkbox
            id="progress-preview-indeterminate"
            label="Indeterminate"
            checked={indeterminate}
            onCheckedChange={setIndeterminate}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
