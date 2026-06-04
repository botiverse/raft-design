import { Check, Minus } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const checkIndicator = tv({
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
        root: ["border-2 border-black"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    shape: {
      square: {
        root: "",
      },
      circle: {
        root: "rounded-full",
      },
    },
    // Mark size and stroke (source's 10/12/13px, stroke 4/4/3) live on the icon via
    // CSS; `:not([class*='size-'])` lets a caller override the mark with its own size.
    size: {
      sm: {
        root: ["size-3.5", "[&_svg:not([class*='size-'])]:size-2.5 [&_svg]:[stroke-width:4]"],
      },
      md: {
        root: ["size-4", "[&_svg:not([class*='size-'])]:size-3 [&_svg]:[stroke-width:4]"],
      },
      lg: {
        root: ["size-5", "[&_svg:not([class*='size-'])]:size-[13px] [&_svg]:[stroke-width:3]"],
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
        root: "bg-white text-transparent",
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
    { checked: true, fill: "black", class: { root: "bg-black text-white" } },
    { checked: true, fill: "yellow", class: { root: "bg-brutal-yellow text-black" } },
    { checked: false, previewOnHover: true, class: { root: "group-hover:text-black/20" } },
  ],
  defaultVariants: {
    shape: "square",
    size: "sm",
    fill: "black",
    disabled: false,
    previewOnHover: false,
  },
});

type CheckIndicatorMark = "check" | "minus";

export type CheckIndicatorProps = ComponentPropsWithRef<"span"> &
  Omit<VariantProps<typeof checkIndicator>, "theme" | "checked"> & {
    checked: boolean;
    mark?: CheckIndicatorMark;
  };

export function CheckIndicator({
  checked,
  mark = "check",
  shape,
  size,
  fill,
  disabled,
  previewOnHover,
  className,
  ...props
}: CheckIndicatorProps) {
  const theme = useTheme();
  const { root } = checkIndicator({
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
    <span {...props} data-slot="check-indicator" aria-hidden className={root({ className })}>
      {(checked || previewOnHover) && <Icon />}
    </span>
  );
}
