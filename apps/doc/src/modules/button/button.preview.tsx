import { Plus } from "lucide-react";
import { Button, useTheme, type ButtonProps } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { SIZES, VARIANTS } from "./button.constants.ts";

const ELEGANT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME =
  "outline-transparent ring-2 ring-[color-mix(in_oklch,var(--button-focus-ring,var(--primary-400))_80%,transparent)] ring-offset-1 ring-offset-background";

type PlaygroundValues = {
  variant: NonNullable<ButtonProps["variant"]>;
  size: NonNullable<ButtonProps["size"]>;
  label: string;
  disabled: boolean;
  loading: boolean;
  focusVisible: boolean;
};

type ButtonPreviewProps = ButtonProps & {
  focusVisible?: boolean;
};

export function ButtonPreview({ focusVisible = false, className, ...props }: ButtonPreviewProps) {
  const { theme } = useTheme();
  const focusClassName =
    focusVisible && theme === "elegant" ? ELEGANT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME : null;
  const mergedClassName = [focusClassName, className].filter(Boolean).join(" ") || undefined;

  return <Button {...props} className={mergedClassName} />;
}

export function ButtonPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        variant: "default",
        size: "sm",
        label: "Button",
        disabled: false,
        loading: false,
        focusVisible: false,
      }}
      controls={[
        { name: "variant", label: "Variant", type: "select", options: VARIANTS },
        { name: "size", label: "Size", type: "select", options: SIZES },
        { name: "label", label: "Label", type: "text" },
        { name: "focusVisible", label: "Focus", type: "boolean" },
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "loading", label: "Loading", type: "boolean" },
      ]}
      render={(values) => (
        <ButtonPreview
          variant={values.variant}
          size={values.size}
          disabled={values.disabled}
          loading={values.loading}
          aria-label={values.size.startsWith("icon-") ? values.label : undefined}
          focusVisible={values.focusVisible}
        >
          {values.size.startsWith("icon-") ? <Plus /> : values.label}
        </ButtonPreview>
      )}
    />
  );
}
