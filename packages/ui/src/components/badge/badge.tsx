import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

export const badge = tv({
  slots: {
    root: [
      "inline-flex h-5 w-fit shrink-0 min-w-0 max-w-full items-center gap-1 px-1.5",
      "overflow-hidden whitespace-nowrap",
      "text-[10px] font-bold leading-none",
      "[&_[data-slot='spinner']]:!size-3 [&_[data-slot='spinner']]:!text-xs",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border border-line-strong"],
      },
      elegant: {
        root: [
          "gap-1.5 rounded-full border border-transparent px-2.5 py-0.5",
          "[&:has(svg)]:px-2",
          "[&_svg]:shrink-0 [&_svg]:translate-y-[0.5px]",
          "text-[11px] font-medium leading-3 tracking-[0.22px]",
        ],
      },
    },
    appearance: {
      solid: {
        root: "",
      },
      soft: {
        root: "",
      },
      outline: {
        root: "",
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
        root: "bg-info-base text-foreground-inverse",
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
        root: "bg-warning-base text-foreground-inverse",
      },
      danger: {
        root: "bg-[oklch(0.66_0.19_31)] text-foreground-strong",
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
    appearance: "solid",
    variant: "default",
    uppercase: false,
  },
  compoundVariants: [
    {
      theme: "brutal",
      appearance: "solid",
      variant: "success",
      class: { root: "bg-brutal-lime text-foreground" },
    },
    {
      theme: "brutal",
      appearance: "solid",
      variant: "danger",
      class: { root: "bg-brutal-red text-foreground" },
    },
    {
      theme: "brutal",
      appearance: "solid",
      variant: "information",
      class: { root: "bg-info-base text-info-dark" },
    },
    {
      theme: "brutal",
      appearance: "solid",
      variant: "warning",
      class: { root: "bg-warning-base text-foreground" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "default",
      class: { root: "bg-layer-muted text-foreground-strong" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "muted",
      class: { root: "bg-secondary-100 text-secondary-900" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "primary",
      class: { root: "bg-[oklch(0.958_0.047_86)] text-primary-950" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "information",
      class: { root: "bg-info-lighter text-info-dark" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "accent",
      class: { root: "bg-accent-100 text-accent-950" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "success",
      class: { root: "bg-success-lighter text-success-dark" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "warning",
      class: { root: "bg-warning-lighter text-warning-dark" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "danger",
      class: { root: "bg-danger-lighter text-danger-dark" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "default",
      class: { root: "bg-transparent text-foreground-strong" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "muted",
      class: { root: "bg-transparent text-secondary-900" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "primary",
      class: { root: "bg-transparent text-primary-700" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "information",
      class: { root: "bg-transparent text-info-dark" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "accent",
      class: { root: "bg-transparent text-accent-700" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "success",
      class: { root: "bg-transparent text-[oklch(0.48_0.12_153.079)]" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "warning",
      class: { root: "bg-transparent text-warning-dark" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "danger",
      class: { root: "bg-transparent text-[oklch(0.54_0.19_31)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "default",
      class: {
        root: "bg-line-muted text-foreground-muted",
      },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "muted",
      class: { root: "bg-[oklch(0.46_0.004_286)] text-[oklch(0.94_0.001_286)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "primary",
      class: { root: "bg-primary-400 text-primary-950" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "information",
      class: { root: "bg-info-base text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "accent",
      class: { root: "bg-accent-400 text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "success",
      class: { root: "bg-success-base text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "warning",
      class: { root: "bg-warning-base text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "danger",
      class: { root: "bg-[oklch(0.68_0.22_26.758)] text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "default",
      class: { root: "border-transparent bg-layer-muted text-foreground-strong" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "muted",
      class: { root: "border-transparent bg-secondary-100 text-secondary-900" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "primary",
      class: { root: "border-transparent bg-[oklch(0.958_0.047_86)] text-primary-950" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "information",
      class: { root: "border-transparent bg-info-lighter text-info-dark" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "accent",
      class: { root: "border-transparent bg-accent-100 text-accent-950" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "success",
      class: { root: "border-transparent bg-success-lighter text-success-dark" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "warning",
      class: { root: "border-transparent bg-warning-lighter text-warning-dark" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "danger",
      class: { root: "border-transparent bg-danger-lighter text-danger-dark" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "default",
      class: { root: "border-line-subtle bg-transparent text-foreground-strong" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "muted",
      class: { root: "border-secondary-500 bg-transparent text-secondary-900" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "primary",
      class: { root: "border-primary-500 bg-transparent text-primary-800" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "information",
      class: { root: "border-info-base bg-transparent text-[oklch(0.48_0.09_219.2)]" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "accent",
      class: { root: "border-accent-500 bg-transparent text-accent-800" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "success",
      class: { root: "border-success-base bg-transparent text-success-dark" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "warning",
      class: { root: "border-warning-base bg-transparent text-warning-dark" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "danger",
      class: { root: "border-danger-base bg-transparent text-danger-dark" },
    },
  ],
});

export type BadgeProps = useRender.ComponentProps<"span"> &
  Omit<VariantProps<typeof badge>, "theme">;

function BadgeRoot({ appearance, variant, uppercase, className, render, ...props }: BadgeProps) {
  const theme = useThemeFamily();
  const resolvedAppearance = appearance ?? "solid";
  const resolvedUppercase = uppercase ?? false;
  const { root } = badge({
    theme,
    appearance: resolvedAppearance,
    variant,
    uppercase: resolvedUppercase,
  });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "badge",
      appearance: resolvedAppearance,
      variant,
      uppercase: resolvedUppercase,
    },
  });
}

// Fixed success + uppercase "Experimental" preset. The visual identity lives in
// Badge, so every experimental surface stays identical. Attached as a static
// because it only presets props.
function Experimental(props: Omit<BadgeProps, "appearance" | "variant" | "uppercase">) {
  return (
    <BadgeRoot variant="success" uppercase {...props}>
      Experimental
    </BadgeRoot>
  );
}

export const Badge = Object.assign(BadgeRoot, { Experimental });
