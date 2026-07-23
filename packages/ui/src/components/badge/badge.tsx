import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

export const badge = tv({
  slots: {
    root: [
      "inline-flex w-fit shrink-0 min-w-0 max-w-full items-center gap-1 px-1.5",
      "overflow-hidden whitespace-nowrap",
      "text-[10px] font-bold leading-none",
      "transition-[filter,opacity] duration-100",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "[&_[data-slot='spinner']]:size-3 [&_[data-slot='spinner']]:text-xs",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["h-5 border border-line-strong enabled:hover:brightness-90"],
      },
      elegant: {
        root: [
          "gap-1.5 rounded-full border border-transparent px-2.5 py-0.5",
          "[&:has(svg)]:px-2",
          "[&_svg]:shrink-0 [&_svg]:translate-y-[0.5px]",
          "text-[11px] font-medium leading-3 tracking-[0.22px]",
          "enabled:hover:brightness-[0.96]",
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
      class: { root: "bg-secondary-100 text-secondary-800" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "muted",
      class: { root: "bg-secondary-200 text-secondary-800" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "primary",
      class: { root: "bg-primary-400/40 text-primary-900" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "information",
      class: { root: "bg-info-light text-info-dark" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "accent",
      class: { root: "bg-accent-200 text-accent-700" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "success",
      class: { root: "bg-success-base/30 text-[oklch(0.39_0.11_153.079)]" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "warning",
      class: { root: "bg-warning-light text-[oklch(0.43_0.12_44.441)]" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "danger",
      class: { root: "bg-danger-light text-danger-dark" },
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
        root: "bg-[oklch(0.209_0.006_91.63_/_0.078)] text-[oklch(0.359_0.005_106.65)]",
      },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "muted",
      class: { root: "bg-[oklch(0.573_0_0)] text-[oklch(0.946_0_0)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "primary",
      class: { root: "bg-[oklch(0.886_0.155_91.41)] text-[oklch(0.431_0.088_86.67)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "information",
      class: { root: "bg-[oklch(0.783_0.135_219.26)] text-[oklch(0.445_0.083_224.7)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "accent",
      class: { root: "bg-[oklch(0.749_0.162_0.7)] text-[oklch(0.281_0.112_3.73)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "success",
      class: { root: "bg-[oklch(0.714_0.176_153.03)] text-[oklch(1_0_0)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "warning",
      class: { root: "bg-[oklch(0.7_0.202_44.44)] text-[oklch(1_0_0)]" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "danger",
      class: { root: "bg-[oklch(0.672_0.215_26.69)] text-[oklch(1_0_0)]" },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "default",
      class: {
        root: "border-transparent bg-[oklch(0.946_0_0)] text-[oklch(0.409_0_0)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "muted",
      class: {
        root: "border-transparent bg-[oklch(0.946_0_0)] text-[oklch(0.447_0.002_67.77)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "primary",
      class: {
        root: "border-transparent bg-[oklch(0.955_0.067_93.62)] text-[oklch(0.44_0.09_91.39)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "information",
      class: {
        root: "border-transparent bg-[oklch(0.91_0.056_224.02)] text-[oklch(0.441_0.078_221.2)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "accent",
      class: {
        root: "border-transparent bg-[oklch(0.914_0.048_358.59)] text-[oklch(0.543_0.215_359.77)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "success",
      class: {
        root: "border-transparent bg-[oklch(0.913_0.11_159.9)] text-[oklch(0.425_0.113_151.2)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "warning",
      class: {
        root: "border-transparent bg-[oklch(0.887_0.064_43.95)] text-[oklch(0.499_0.143_43.52)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "danger",
      class: {
        root: "border-transparent bg-[oklch(0.898_0.05_22.7)] text-[oklch(0.445_0.153_32.91)]",
      },
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
