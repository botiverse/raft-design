import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button, useTheme } from "raft-ui";
import type { ButtonProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZES, VARIANTS } from "./button.constants.ts";

const ELEGANT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME =
  "outline-transparent ring-2 ring-[color-mix(in_oklch,var(--button-focus-ring,var(--primary-400))_80%,transparent)] ring-offset-1 ring-offset-layer-canvas-muted";

const RAFT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME = "shadow-raft-focus";

type ButtonPreviewProps = ButtonProps & {
  focusVisible?: boolean;
};

export function ButtonPreview({ focusVisible = false, className, ...props }: ButtonPreviewProps) {
  const { theme } = useTheme();
  const focusClassName = !focusVisible
    ? null
    : theme === "elegant"
      ? ELEGANT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME
      : theme === "raft"
        ? RAFT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME
        : null;
  const mergedClassName = [focusClassName, className].filter(Boolean).join(" ") || undefined;

  return <Button {...props} className={mergedClassName} />;
}

type CodeContent = ReactNode | AnyRenderableServerComponent;

type ButtonPlaygroundPreviewProps = {
  code: CodeContent;
};

export function ButtonPlaygroundPreview({ code }: ButtonPlaygroundPreviewProps) {
  const [variant, setVariant] = useState<NonNullable<ButtonProps["variant"]>>("default");
  const [size, setSize] = useState<NonNullable<ButtonProps["size"]>>("sm");
  const [label, setLabel] = useState("Button");
  const [focusVisible, setFocusVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVariantChange = useCallback((value: string) => {
    setVariant(value as NonNullable<ButtonProps["variant"]>);
  }, []);
  const handleSizeChange = useCallback((value: string) => {
    setSize(value as NonNullable<ButtonProps["size"]>);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <ButtonPreview
          variant={variant}
          size={size}
          disabled={disabled}
          loading={loading}
          aria-label={size.startsWith("icon-") ? label : undefined}
          focusVisible={focusVisible}
        >
          {size.startsWith("icon-") ? <Plus /> : label}
        </ButtonPreview>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Variant" htmlFor="button-preview-variant">
          <Preview.Select
            id="button-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={handleVariantChange}
          />
        </Preview.Control>
        <Preview.Control label="Size" htmlFor="button-preview-size">
          <Preview.Select
            id="button-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Label" htmlFor="button-preview-label">
          <Preview.Text
            id="button-preview-label"
            label="Label"
            value={label}
            onValueChange={setLabel}
          />
        </Preview.Control>
        <Preview.Control label="Focus" htmlFor="button-preview-focus">
          <Preview.Checkbox
            id="button-preview-focus"
            label="Focus"
            checked={focusVisible}
            onCheckedChange={setFocusVisible}
          />
        </Preview.Control>
        <Preview.Control label="Disabled" htmlFor="button-preview-disabled">
          <Preview.Checkbox
            id="button-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
        <Preview.Control label="Loading" htmlFor="button-preview-loading">
          <Preview.Checkbox
            id="button-preview-loading"
            label="Loading"
            checked={loading}
            onCheckedChange={setLoading}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
