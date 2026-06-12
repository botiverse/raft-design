import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const dot = tv({
  slots: {
    root: ["relative inline-block shrink-0 rounded-full", "[background-color:var(--status-color)]"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border border-line-strong",
      },
      elegant: {},
    },
    variant: {
      default: {
        root: "[--status-color:var(--color-gray-400)]",
      },
      primary: {
        root: "[--status-color:var(--color-primary-400)]",
      },
      information: {
        root: "[--status-color:var(--color-info-base)]",
      },
      muted: {
        root: "[--status-color:var(--color-secondary-400)]",
      },
      accent: {
        root: "[--status-color:var(--color-accent-400)]",
      },
      success: {
        root: "[--status-color:var(--color-success-base)]",
      },
      warning: {
        root: "[--status-color:oklch(0.72_0.165_48)]",
      },
      danger: {
        root: "[--status-color:var(--color-danger-base)]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const status = tv({
  extend: dot,
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    size: {
      xs: {
        root: "size-1",
      },
      sm: {
        root: "size-2",
      },
      md: {
        root: "size-2.5",
      },
      lg: {
        root: "size-[11px]",
      },
    },
    pulse: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    pulse: false,
  },
  compoundVariants: [
    {
      theme: "brutal",
      pulse: true,
      class: { root: "animate-pulse" },
    },
    {
      theme: "elegant",
      pulse: true,
      class: {
        root: [
          "before:pointer-events-none before:absolute before:-inset-0.5 before:rounded-full",
          "before:border before:opacity-60 before:animate-ping before:content-['']",
          "before:border-[color-mix(in_oklch,var(--status-color)_50%,transparent)]",
        ],
      },
    },
  ],
});

export type StatusProps = Omit<useRender.ComponentProps<"span">, "children"> &
  Omit<VariantProps<typeof status>, "theme">;

function StatusRoot({ size, variant, pulse, className, render, ...props }: StatusProps) {
  const theme = useTheme();
  const { root } = status({ theme, size, variant, pulse });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "status",
      variant,
      pulse,
      size,
    },
  });
}

export const Status = StatusRoot;
