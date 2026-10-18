import { Check, Minus } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

// The DS checkbox box: 20px, square, with an ink edge. Checked is an ink block
// with the mark knocked out of it: a value, not "you are here".
const checkboxIndicator = tv({
  slots: {
    root: [
      "inline-flex size-5 shrink-0 items-center justify-center",
      "rounded-sticker border-[1.5px] border-line-strong transition-colors",
      "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:stroke-2",
    ],
  },
  variants: {
    shape: {
      square: "",
      circle: { root: "rounded-full" },
    },
    checked: {
      true: { root: "border-foreground bg-foreground text-foreground-inverse" },
      false: { root: "bg-layer-card text-transparent" },
    },
    disabled: {
      true: { root: "border-foreground-disabled bg-fill-muted" },
      false: "",
    },
    // Shows a faint mark on an unchecked box while its group is hovered.
    previewOnHover: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      checked: false,
      previewOnHover: true,
      class: { root: "group-hover:text-foreground/20" },
    },
    { checked: true, disabled: true, class: { root: "bg-foreground-disabled text-layer-card" } },
  ],
  defaultVariants: {
    shape: "square",
    disabled: false,
    previewOnHover: false,
  },
});

type CheckboxIndicatorMark = "check" | "minus";

export type CheckboxIndicatorProps = ComponentPropsWithRef<"span"> &
  Omit<VariantProps<typeof checkboxIndicator>, "checked"> & {
    checked: boolean;
    mark?: CheckboxIndicatorMark;
  };

export function CheckboxIndicator({
  checked,
  mark = "check",
  shape,
  disabled,
  previewOnHover,
  className,
  ...props
}: CheckboxIndicatorProps) {
  const { root } = checkboxIndicator({
    shape,
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
