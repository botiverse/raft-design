import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

// The Badge's box: height, padding, border width, gap and type. Exported so a
// component that sits in a row of Badges (the `sm` TaskChip in an Activity card,
// #proj-frontend task #748) takes these from here instead of copying them, and
// cannot drift when the Badge changes. Colours stay with each component.
export const badgeBox = {
  base: ["inline-flex items-center gap-1 px-1.5", "text-[10px] font-bold leading-none"],
  brutal: ["h-5 border"],
  elegant: [
    "gap-1.5 rounded-full border px-2.5 py-0.5",
    "[&:has(svg)]:px-2",
    "text-[11px] font-medium leading-3 tracking-[0.22px]",
  ],
} as const;

export const badge = tv({
  slots: {
    root: [
      ...badgeBox.base,
      "w-fit shrink-0 min-w-0 max-w-full",
      "overflow-hidden whitespace-nowrap",
      "transition-[filter,opacity] duration-100",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "[&_[data-slot='spinner']]:size-3 [&_[data-slot='spinner']]:text-xs",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: [...badgeBox.brutal, "border-line-strong enabled:hover:brightness-90"],
      },
      elegant: {
        root: [
          ...badgeBox.elegant,
          "border-transparent",
          "[&_svg]:shrink-0 [&_svg]:translate-y-[0.5px]",
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
        root: "bg-layer-panel text-foreground",
      },
      primary: {
        root: "bg-primary-400 text-primary-950",
      },
      information: {
        root: "bg-info text-foreground-inverse",
      },
      muted: {
        root: "bg-secondary-400 text-foreground",
      },
      accent: {
        root: "bg-accent-400 text-accent-950",
      },
      success: {
        root: "bg-success text-success-strong",
      },
      warning: {
        root: "bg-warning text-warning-foreground",
      },
      danger: {
        root: "bg-[oklch(0.66_0.19_31)] text-foreground",
      },
    },
    // Enables the old brutal casing recipe when a badge should read as a compact
    // label. It defaults off so case-sensitive content stays intact; Elegant
    // preserves the caller's casing.
    uppercase: {
      true: {
        root: "",
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
      uppercase: true,
      class: { root: "uppercase tracking-wide" },
    },
    {
      theme: "brutal",
      appearance: "solid",
      variant: "success",
      class: { root: "bg-brutal-lime text-foreground-strong" },
    },
    {
      theme: "brutal",
      appearance: "solid",
      variant: "danger",
      class: { root: "bg-brutal-red text-foreground-strong" },
    },
    {
      theme: "brutal",
      appearance: "solid",
      variant: "information",
      class: { root: "bg-info text-info-strong" },
    },
    {
      theme: "brutal",
      appearance: "solid",
      variant: "warning",
      class: { root: "bg-warning text-foreground-strong" },
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
      class: { root: "bg-info-muted text-info-strong" },
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
      class: { root: "bg-success/30 text-[oklch(0.39_0.11_153.079)]" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "warning",
      class: { root: "bg-warning-muted text-[oklch(0.43_0.12_44.441)]" },
    },
    {
      theme: "brutal",
      appearance: "soft",
      variant: "danger",
      class: { root: "bg-danger-muted text-danger-strong" },
    },
    {
      theme: "brutal",
      appearance: "outline",
      variant: "default",
      class: { root: "bg-transparent text-foreground" },
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
      class: { root: "bg-transparent text-info-strong" },
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
      class: { root: "bg-transparent text-warning-strong" },
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
        root: "bg-ink-8 text-foreground-muted",
      },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "muted",
      class: {
        root: "bg-inactive text-inactive-foreground",
      },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "primary",
      // Elegant has no brutal-yellow fill; the primary tone reads as the
      // soft/strong pair (the same tokens as the soft appearance).
      class: { root: "bg-primary-soft text-primary-strong" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "information",
      class: { root: "bg-info text-info-strong dark:text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "accent",
      class: { root: "bg-accent-soft text-accent-strong" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "success",
      class: { root: "bg-success text-success-foreground dark:text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "warning",
      class: { root: "bg-warning text-warning-foreground dark:text-foreground-inverse" },
    },
    {
      theme: "elegant",
      appearance: "solid",
      variant: "danger",
      class: {
        root: "bg-[oklch(0.672_0.215_26.69)] text-white dark:text-foreground-inverse",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "default",
      class: {
        root: "border-transparent bg-fill-strong text-[oklch(0.409_0_0)] dark:text-[oklch(0.87_0_0)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "muted",
      class: {
        root: "border-transparent bg-fill-strong text-[oklch(0.447_0.002_67.77)] dark:text-[oklch(0.8_0.002_67.77)]",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "primary",
      class: {
        root: "border-transparent bg-primary-soft text-primary-strong",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "information",
      class: {
        root: "border-transparent bg-info-soft text-info-strong",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "accent",
      class: {
        root: "border-transparent bg-accent-soft text-accent-strong",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "success",
      class: {
        root: "border-transparent bg-success-soft text-success-strong",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "warning",
      class: {
        root: "border-transparent bg-warning-soft text-warning-strong",
      },
    },
    {
      theme: "elegant",
      appearance: "soft",
      variant: "danger",
      class: {
        root: "border-transparent bg-danger-soft text-danger-strong",
      },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "default",
      class: { root: "border-line-muted bg-transparent text-foreground" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "muted",
      class: {
        root: "border-secondary-500 bg-transparent text-secondary-900 dark:text-secondary-300",
      },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "primary",
      class: { root: "border-primary-500 bg-transparent text-primary-strong" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "information",
      class: { root: "border-info bg-transparent text-info-strong" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "accent",
      class: { root: "border-accent-500 bg-transparent text-accent-strong" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "success",
      class: { root: "border-success bg-transparent text-success-strong" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "warning",
      class: { root: "border-warning bg-transparent text-warning-strong" },
    },
    {
      theme: "elegant",
      appearance: "outline",
      variant: "danger",
      class: { root: "border-danger bg-transparent text-danger-strong" },
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
