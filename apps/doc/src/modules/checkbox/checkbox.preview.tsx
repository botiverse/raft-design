import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Checkbox } from "raft-ui";
import type { CheckboxProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type CheckboxPlaygroundPreviewProps = {
  code: CodeContent;
};

const SHAPES = ["square", "circle"] as const;

export function CheckboxPlaygroundPreview({ code }: CheckboxPlaygroundPreviewProps) {
  const [shape, setShape] = useState<NonNullable<CheckboxProps["shape"]>>("square");
  const [checked, setChecked] = useState(true);
  const [indeterminate, setIndeterminate] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleShapeChange = useCallback((value: string) => {
    setShape(value as NonNullable<CheckboxProps["shape"]>);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <Checkbox
          shape={shape}
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
        />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Shape" htmlFor="checkbox-preview-shape">
          <Preview.Select
            id="checkbox-preview-shape"
            label="Shape"
            options={SHAPES}
            value={shape}
            onValueChange={handleShapeChange}
          />
        </Preview.Control>
        <Preview.Control label="Checked" htmlFor="checkbox-preview-checked">
          <Preview.Checkbox
            id="checkbox-preview-checked"
            label="Checked"
            checked={checked}
            onCheckedChange={setChecked}
          />
        </Preview.Control>
        <Preview.Control label="Indeterminate" htmlFor="checkbox-preview-indeterminate">
          <Preview.Checkbox
            id="checkbox-preview-indeterminate"
            label="Indeterminate"
            checked={indeterminate}
            onCheckedChange={setIndeterminate}
          />
        </Preview.Control>
        <Preview.Control label="Disabled" htmlFor="checkbox-preview-disabled">
          <Preview.Checkbox
            id="checkbox-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
