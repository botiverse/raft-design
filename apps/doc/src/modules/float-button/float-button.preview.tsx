import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { FloatButton } from "raft-ui";
import type { FloatButtonProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import {
  FLOAT_BUTTON_SHAPES,
  FLOAT_BUTTON_SIZES,
  FLOAT_BUTTON_VARIANTS,
} from "./float-button.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type FloatButtonPlaygroundPreviewProps = {
  code: CodeContent;
};

export function FloatButtonPlaygroundPreview({ code }: FloatButtonPlaygroundPreviewProps) {
  const [variant, setVariant] = useState<NonNullable<FloatButtonProps["variant"]>>("primary");
  const [shape, setShape] = useState<NonNullable<FloatButtonProps["shape"]>>("circle");
  const [size, setSize] = useState<NonNullable<FloatButtonProps["size"]>>("md");
  const [description, setDescription] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleVariantChange = useCallback((value: string) => {
    setVariant(value as NonNullable<FloatButtonProps["variant"]>);
  }, []);
  const handleShapeChange = useCallback((value: string) => {
    setShape(value as NonNullable<FloatButtonProps["shape"]>);
  }, []);
  const handleSizeChange = useCallback((value: string) => {
    setSize(value as NonNullable<FloatButtonProps["size"]>);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <div className="flex h-36 w-full items-center justify-center">
          <FloatButton
            position="relative"
            variant={variant}
            shape={shape}
            size={size}
            disabled={disabled}
            icon={<MessageSquare />}
            description={description || undefined}
            aria-label="Feedback"
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Variant" htmlFor="float-button-preview-variant">
          <Preview.Select
            id="float-button-preview-variant"
            label="Variant"
            options={FLOAT_BUTTON_VARIANTS}
            value={variant}
            onValueChange={handleVariantChange}
          />
        </Preview.Control>
        <Preview.Control label="Shape" htmlFor="float-button-preview-shape">
          <Preview.Select
            id="float-button-preview-shape"
            label="Shape"
            options={FLOAT_BUTTON_SHAPES}
            value={shape}
            onValueChange={handleShapeChange}
          />
        </Preview.Control>
        <Preview.Control label="Size" htmlFor="float-button-preview-size">
          <Preview.Select
            id="float-button-preview-size"
            label="Size"
            options={FLOAT_BUTTON_SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Description" htmlFor="float-button-preview-description">
          <Preview.Text
            id="float-button-preview-description"
            label="Description"
            value={description}
            onValueChange={setDescription}
          />
        </Preview.Control>
        <Preview.Control label="Disabled" htmlFor="float-button-preview-disabled">
          <Preview.Checkbox
            id="float-button-preview-disabled"
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
