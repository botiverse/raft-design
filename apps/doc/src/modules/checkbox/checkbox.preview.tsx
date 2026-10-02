import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Checkbox } from "raft-ui";
import type { CheckboxProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZES, VARIANTS } from "./checkbox.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type CheckboxPlaygroundPreviewProps = {
  code: CodeContent;
};

export function CheckboxPlaygroundPreview({ code }: CheckboxPlaygroundPreviewProps) {
  const [size, setSize] = useState<NonNullable<CheckboxProps["size"]>>("sm");
  const [variant, setVariant] = useState<NonNullable<CheckboxProps["variant"]>>("default");
  const [checked, setChecked] = useState(true);
  const [indeterminate, setIndeterminate] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleSizeChange = useCallback((value: string) => {
    setSize(value as NonNullable<CheckboxProps["size"]>);
  }, []);

  const handleVariantChange = useCallback((value: string) => {
    setVariant(value as NonNullable<CheckboxProps["variant"]>);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <Checkbox
          size={size}
          variant={variant}
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
        />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Size" htmlFor="checkbox-preview-size">
          <Preview.Select
            id="checkbox-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Variant" htmlFor="checkbox-preview-variant">
          <Preview.Select
            id="checkbox-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={handleVariantChange}
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
