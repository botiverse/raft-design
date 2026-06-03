import { Check } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const checkMarker = tv({
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
    tone: {
      "black-fill": {
        root: "",
      },
      "yellow-fill": {
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
    { checked: true, tone: "black-fill", class: { root: "bg-black text-white" } },
    { checked: true, tone: "yellow-fill", class: { root: "bg-brutal-yellow text-black" } },
    { checked: false, previewOnHover: true, class: { root: "group-hover:text-black/20" } },
  ],
  defaultVariants: {
    shape: "square",
    size: "sm",
    tone: "black-fill",
    disabled: false,
    previewOnHover: false,
  },
});

export type CheckMarkerProps = ComponentPropsWithRef<"span"> &
  Omit<VariantProps<typeof checkMarker>, "theme" | "checked"> & {
    checked: boolean;
  };

export function CheckMarker({
  checked,
  shape,
  size,
  tone,
  disabled,
  previewOnHover,
  className,
  ...props
}: CheckMarkerProps) {
  const theme = useTheme();
  const { root } = checkMarker({
    theme,
    shape,
    size,
    tone,
    checked,
    disabled,
    previewOnHover,
  });

  return (
    <span {...props} data-slot="check-marker" aria-hidden className={root({ className })}>
      {(checked || previewOnHover) && <Check />}
    </span>
  );
}
