import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

export const badge = tv({
  slots: {
    root: [
      "inline-flex h-5 w-fit min-w-0 max-w-full items-center gap-1 px-1.5",
      "overflow-hidden whitespace-nowrap",
      "text-[10px] font-bold leading-none",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border border-line-strong"],
      },
      elegant: {
        root: [
          "gap-1.5 rounded-full border-transparent px-2.5 py-0.5",
          "[&:has(svg)]:px-2",
          "text-[11px] font-medium leading-3 tracking-[0.22px]",
        ],
      },
    },
    variant: {
      default: {
        root: "bg-layer-panel text-foreground-strong",
      },
      primary: {
        root: "bg-primary-400 text-primary-950",
      },
      information: {
        root: "bg-info-base text-info-dark",
      },
      muted: {
        root: "bg-secondary-400 text-foreground-strong",
      },
      accent: {
        root: "bg-accent-400 text-accent-950",
      },
      success: {
        root: "bg-success-base text-success-dark",
      },
      warning: {
        root: "bg-warning-base text-warning-dark",
      },
      destructive: {
        root: "bg-danger-base text-danger-dark",
      },
    },
    // Enables the old brutal casing recipe when a badge should read as a compact
    // label. It defaults off so case-sensitive content stays intact.
    uppercase: {
      true: {
        root: "uppercase tracking-wide",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    uppercase: false,
  },
  compoundVariants: [
    {
      theme: "elegant",
      variant: "default",
      class: {
        root: "bg-layer-muted text-foreground-muted",
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: { root: "bg-secondary-400 text-foreground-inverse" },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: { root: "bg-primary-400 text-primary-950" },
    },
    {
      theme: "elegant",
      variant: "information",
      class: { root: "bg-info-base text-foreground-inverse" },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: { root: "bg-accent-400 text-foreground-inverse" },
    },
    {
      theme: "elegant",
      variant: "warning",
      class: { root: "bg-warning-base text-warning-dark" },
    },
    {
      theme: "elegant",
      variant: "success",
      class: { root: "bg-success-base text-foreground-inverse" },
    },
    {
      theme: "elegant",
      variant: "destructive",
      class: { root: "bg-danger-base text-foreground-inverse" },
    },
  ],
});

export type BadgeProps = useRender.ComponentProps<"span"> &
  Omit<VariantProps<typeof badge>, "theme">;

function BadgeRoot({ variant, uppercase, className, render, ...props }: BadgeProps) {
  const theme = useTheme();
  const resolvedUppercase = uppercase ?? false;
  const { root } = badge({ theme, variant, uppercase: resolvedUppercase });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "badge",
      variant,
      uppercase: resolvedUppercase,
    },
  });
}

// Fixed success + uppercase "Experimental" preset. The visual identity lives in
// Badge, so every experimental surface stays identical. Attached as a static
// because it only presets props.
function Experimental(props: Omit<BadgeProps, "variant" | "uppercase">) {
  return (
    <BadgeRoot variant="success" uppercase {...props}>
      Experimental
    </BadgeRoot>
  );
}

export const Badge = Object.assign(BadgeRoot, { Experimental });
