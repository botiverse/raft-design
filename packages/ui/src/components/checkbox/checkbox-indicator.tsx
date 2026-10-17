import { Check, Minus } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const checkboxIndicator = tv({
  slots: {
    root: [
      "inline-flex shrink-0 items-center justify-center",
      "transition-colors",
      "[&_svg]:shrink-0",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 border-line-strong"],
      },
      elegant: {},
      raft: {
        root: ["rounded-sticker border-[1.5px] border-line-strong"],
      },
    },
    shape: {
      square: {
        root: "",
      },
      circle: {
        root: "rounded-full",
      },
    },
    size: {
      sm: {
        root: ["size-3.5", "[&_svg:not([class*='size-'])]:size-2.5 [&_svg]:stroke-4"],
      },
      md: {
        root: ["size-4", "[&_svg:not([class*='size-'])]:size-3 [&_svg]:stroke-4"],
      },
      lg: {
        root: ["size-5", "[&_svg:not([class*='size-'])]:size-[13px] [&_svg]:stroke-3"],
      },
    },
    fill: {
      black: {
        root: "",
      },
      yellow: {
        root: "",
      },
    },
    checked: {
      true: {
        root: "",
      },
      false: {
        root: "bg-layer-panel text-transparent",
      },
    },
    disabled: {
      true: {
        root: "opacity-50",
      },
      false: {
        root: "",
      },
    },
    previewOnHover: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
  },
  compoundVariants: [
    { checked: true, fill: "black", class: { root: "bg-line-strong text-foreground-inverse" } },
    { checked: true, fill: "yellow", class: { root: "bg-primary-400 text-foreground" } },
    {
      checked: false,
      previewOnHover: true,
      class: { root: "group-hover:text-foreground-strong/20" },
    },
    {
      theme: "raft",
      size: ["sm", "md", "lg"],
      class: {
        root: ["size-5", "[&_svg:not([class*='size-'])]:size-3.5 [&_svg]:stroke-2"],
      },
    },
    { theme: "raft", checked: false, class: { root: "bg-layer-card" } },
    {
      theme: "raft",
      checked: true,
      class: { root: "border-foreground bg-foreground text-foreground-inverse" },
    },
    {
      theme: "raft",
      disabled: true,
      class: { root: "border-foreground-disabled bg-fill-muted opacity-100" },
    },
    {
      theme: "raft",
      checked: true,
      disabled: true,
      class: { root: "bg-foreground-disabled text-layer-card" },
    },
  ],
  defaultVariants: {
    shape: "square",
    size: "sm",
    fill: "black",
    disabled: false,
    previewOnHover: false,
  },
});

type CheckboxIndicatorMark = "check" | "minus";

export type CheckboxIndicatorProps = ComponentPropsWithRef<"span"> &
  Omit<VariantProps<typeof checkboxIndicator>, "theme" | "checked"> & {
    checked: boolean;
    mark?: CheckboxIndicatorMark;
  };

export function CheckboxIndicator({
  checked,
  mark = "check",
  shape,
  size,
  fill,
  disabled,
  previewOnHover,
  className,
  ...props
}: CheckboxIndicatorProps) {
  const theme = useThemeFamily();
  const { root } = checkboxIndicator({
    theme,
    shape,
    size,
    fill,
    checked,
    disabled,
    previewOnHover,
  });
  const Icon = mark === "minus" ? Minus : Check;

  return (
    <span
      {...props}
      data-slot="checkbox-indicator-graphic"
      aria-hidden
      className={root({ className })}
    >
      {(checked || previewOnHover) && <Icon />}
    </span>
  );
}
