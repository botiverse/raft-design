import { Button as BaseButton } from "@base-ui/react/button";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Spinner } from "../spinner/index";

export const buttonVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "font-heading whitespace-nowrap select-none",
      "rounded-none",
      "shadow-raft-sm transition-all duration-100",
      "outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-transparent",
      "data-[loading=true]:cursor-wait",
      "disabled:pointer-events-none disabled:opacity-40 data-[loading=true]:opacity-100",
      "disabled:transform-none",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ],
    content:
      "relative z-10 inline-flex items-center justify-center gap-[inherit] data-[loading=true]:invisible",
    loadingIndicator: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 font-bold"],
      },
      elegant: {
        root: [
          "overflow-clip border-0 font-sans font-medium antialiased",
          "focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--button-focus-ring,var(--primary-400))_80%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-layer-canvas-muted",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
          "active:scale-[0.985]",
        ],
      },
    },
    variant: {
      primary: {
        root: ["border-line-strong bg-primary-400 text-primary-950", "hover:bg-primary-500"],
      },
      default: {
        root: ["border-line-strong bg-layer-panel text-foreground", "hover:bg-layer-panel"],
      },
      information: {
        root: ["border-line-strong bg-info text-foreground-inverse", "hover:bg-info"],
      },
      muted: {
        root: ["border-line-strong bg-secondary-400 text-secondary-950", "hover:bg-secondary-400"],
      },
      accent: {
        root: ["border-line-strong bg-accent-400 text-accent-950", "hover:bg-accent-500"],
      },
      warning: {
        root: ["border-line-strong bg-warning text-warning-foreground", "hover:bg-warning"],
      },
      success: {
        root: ["border-line-strong bg-success text-success-foreground", "hover:bg-success"],
      },
      outline: {
        root: [
          "border-line-strong bg-transparent text-foreground",
          "hover:bg-fill-muted",
          "shadow-none",
        ],
      },
      ghost: {
        root: [
          "border-transparent bg-transparent text-foreground-strong shadow-none",
          "hover:border-line-strong hover:bg-fill-muted",
        ],
      },
      link: {
        root: [
          "border-transparent bg-transparent text-foreground shadow-none underline-offset-4",
          "hover:underline",
        ],
      },
      "danger-secondary": {
        root: ["border-line-strong bg-danger-soft text-danger", "hover:bg-danger-soft"],
      },
      danger: {
        root: [
          "border-line-strong bg-danger text-danger-foreground",
          "hover:border-danger-hover hover:bg-danger-hover",
        ],
      },
      "danger-outline": {
        root: [
          "border-line-strong bg-transparent text-danger",
          "hover:bg-fill-muted",
          "shadow-none",
        ],
      },
    },
    size: {
      xs: {
        root: [
          "h-6 gap-1 px-2 py-0 text-[11px]",
          "has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5",
          "**:data-icon:size-[1em]",
          "[&_svg:not([class*='size-'])]:size-3",
        ],
      },
      sm: {
        root: [
          "h-7 gap-[5px] px-2.5 py-0 text-xs",
          "has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
          "**:data-icon:size-[1em]",
          "[&_svg:not([class*='size-'])]:size-3.5",
        ],
      },
      md: {
        root: [
          "h-8 gap-[5.5px] px-3 py-0 text-sm",
          "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
          "**:data-icon:size-[1em]",
        ],
      },
      lg: {
        root: [
          "gap-1.5 px-3.5 py-0 text-base",
          "has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
          "**:data-icon:size-[1em]",
        ],
      },
      // An inline action lives inside a line of text, so it takes that text's
      // font-size and line-height rather than a box from this scale, and sits
      // on the baseline so it cannot change the line's height. Every other
      // entry here sets a fixed height; that is right for a button and wrong
      // for something that is semantically a word in a sentence.
      inline: {
        root: [
          // `border-0` is not cosmetic: with `h-auto` the box is content plus
          // border, so a theme's `border-2` alone still yields 24px line-height
          // + 4px = the 28px button box this size exists to remove. Dropping the
          // height class is not sufficient.
          "h-auto gap-1 border-0 p-0 align-baseline leading-[inherit] whitespace-normal",
          "**:data-icon:size-[1em]",
        ],
      },
      "icon-xs": { root: ["size-6 p-0 text-[11px]", "[&_svg:not([class*='size-'])]:size-3"] },
      "icon-sm": { root: ["size-7 p-0 text-xs", "[&_svg:not([class*='size-'])]:size-3.5"] },
      "icon-md": { root: "size-8 p-0 text-sm" },
      "icon-lg": { root: "p-0 text-sm" },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
  compoundVariants: [
    {
      theme: "elegant",
      size: "xs",
      class: { root: "rounded-sm" },
    },
    {
      theme: "elegant",
      size: "icon-xs",
      class: { root: "rounded-sm" },
    },
    {
      theme: "elegant",
      size: "sm",
      class: { root: "rounded-sm" },
    },
    {
      theme: "elegant",
      size: "icon-sm",
      class: { root: "rounded-sm" },
    },
    {
      theme: "elegant",
      size: "md",
      class: { root: "rounded-md" },
    },
    {
      theme: "elegant",
      size: "icon-md",
      class: { root: "rounded-md" },
    },
    {
      theme: "elegant",
      size: "lg",
      class: { root: "h-9 rounded-md" },
    },
    {
      theme: "elegant",
      size: "icon-lg",
      class: { root: "size-9 rounded-md" },
    },
    {
      theme: "elegant",
      variant: [
        "default",
        "primary",
        "outline",
        "information",
        "muted",
        "accent",
        "warning",
        "danger",
        "danger-secondary",
        "danger-outline",
      ],
      class: { root: "dark:shadow-raft-xs" },
    },
    {
      theme: "elegant",
      variant: ["default", "outline"],
      class: { root: "[--button-focus-ring:var(--foreground)]" },
    },
    {
      theme: "elegant",
      variant: ["ghost", "link", "muted"],
      class: { root: "[--button-focus-ring:var(--line-hairline)]" },
    },
    {
      theme: "elegant",
      variant: ["danger-secondary", "danger", "danger-outline"],
      class: { root: "[--button-focus-ring:var(--danger)]" },
    },
    {
      theme: "brutal",
      variant: "primary",
      class: { root: "bg-brutal-yellow text-foreground-strong hover:bg-brutal-yellow" },
    },
    {
      theme: "brutal",
      variant: "default",
      class: { root: "bg-layer-panel text-foreground-strong hover:bg-layer-panel" },
    },
    {
      theme: "brutal",
      variant: "outline",
      class: { root: "bg-layer-panel text-foreground-strong shadow-raft-sm hover:bg-layer-panel" },
    },
    {
      theme: "brutal",
      variant: "information",
      class: { root: "bg-brutal-cyan text-foreground-strong hover:bg-brutal-cyan" },
    },
    {
      theme: "brutal",
      variant: "muted",
      class: { root: "bg-brutal-stone text-foreground-strong hover:bg-brutal-stone" },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: { root: "bg-brutal-pink text-foreground-strong hover:bg-brutal-pink" },
    },
    {
      theme: "brutal",
      variant: "danger",
      class: {
        root: "bg-brutal-red text-foreground-strong hover:border-line-strong hover:bg-brutal-red",
      },
    },
    {
      theme: "brutal",
      variant: "danger-secondary",
      class: {
        root: "text-[color-mix(in_oklab,var(--danger)_72%,transparent)] hover:border-line-strong",
      },
    },
    {
      theme: "brutal",
      variant: "warning",
      class: {
        root: "bg-brutal-orange text-foreground-strong hover:bg-brutal-orange",
      },
    },
    {
      theme: "brutal",
      variant: "success",
      class: {
        root: "bg-brutal-lime text-foreground-strong hover:bg-brutal-lime",
      },
    },
    {
      theme: "brutal",
      size: "lg",
      class: {
        root: [
          "h-10 px-4 text-sm",
          "has-data-[icon=inline-start]:pl-3.5 has-data-[icon=inline-end]:pr-3.5",
        ],
      },
    },
    {
      theme: "brutal",
      size: "icon-lg",
      class: { root: "size-10" },
    },
    {
      theme: "elegant",
      variant: "default",
      class: {
        root: [
          "bg-foreground text-foreground-inverse",
          "dark:bg-ink",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--foreground)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/0%)_100%)]",
          "hover:bg-[oklch(0.31_0.006_106.42)] dark:hover:bg-foreground-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "bg-primary-400 text-primary-950",
          "[--button-focus-ring:var(--primary-400)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.15),0_0_0_1px_var(--primary-edge)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/11%)_0%,oklab(100%_0_0/0%)_0%,oklab(0%_0_0/0%)_100%)]",
          "hover:bg-primary-hover",
          "dark:hover:bg-primary-500",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      class: {
        root: [
          "bg-layer-panel text-foreground dark:text-foreground-muted",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0/0%)_30%,oklab(0%_0_0/1%)_100%)]",
          "hover:bg-fill-muted",
          "dark:bg-fill-muted dark:hover:bg-fill-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "ghost",
      class: {
        root: ["bg-transparent text-foreground-muted shadow-none", "hover:bg-ink-4"],
      },
    },
    {
      theme: "elegant",
      variant: "danger-secondary",
      class: {
        root: [
          "bg-danger-soft text-danger",
          "dark:bg-[oklch(0.37_0.06_27)] dark:text-[oklch(0.8_0.17_22)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.08),0_0_0_1px_var(--danger-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/4%)_0%,oklab(0%_0_0/0%)_100%)]",
          "hover:bg-danger-muted",
          "dark:hover:bg-[oklch(0.4_0.07_27)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger",
      class: {
        root: [
          "bg-danger text-danger-foreground",
          "dark:bg-[oklch(0.58_0.21_27)] dark:text-[oklch(0.985_0.004_106.42)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--danger)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/10%)_0%,oklab(0%_0_0/0%)_100%)]",
          "hover:bg-danger-hover",
          "dark:hover:bg-[oklch(0.61_0.21_27)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger-outline",
      class: {
        root: [
          "bg-layer-panel text-danger",
          "dark:bg-fill-muted dark:text-[oklch(0.78_0.19_25)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.025),0_0_0_1px_var(--danger-muted)]",
          "hover:bg-danger-soft",
          "dark:hover:bg-fill-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: [
          "bg-accent-400 text-accent-950",
          "dark:text-foreground-inverse",
          "[--button-focus-ring:var(--accent-400)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--accent-400)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/0%)_100%)]",
          "hover:bg-accent-hover",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "warning",
      class: {
        root: [
          "bg-warning text-[oklch(0.25_0.05_50)]",
          "dark:bg-[oklch(0.66_0.17_46)]",
          "[--button-focus-ring:var(--warning)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.14),0_0_0_1px_var(--warning)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/10%)_0%,oklab(0%_0_0/0%)_100%)]",
          "hover:bg-warning-hover",
          "dark:hover:bg-[oklch(0.69_0.17_46)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        root: "bg-transparent text-foreground-muted shadow-none",
      },
    },
    {
      theme: "elegant",
      variant: "information",
      class: {
        root: [
          "bg-info text-foreground-inverse",
          "dark:bg-info-strong",
          "[--button-focus-ring:var(--info)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--info)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/0%)_100%)]",
          "hover:bg-info-hover",
          "dark:hover:bg-info",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        root: [
          "bg-fill-muted text-foreground-muted dark:text-foreground-placeholder",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/5%)_0%,oklab(0%_0_0/1%)_100%)]",
          "hover:bg-fill-strong",
          "dark:bg-layer-panel",
          "dark:hover:bg-fill-muted",
        ],
      },
    },
    {
      theme: "brutal",
      variant: [
        "primary",
        "default",
        "information",
        "muted",
        "accent",
        "warning",
        "outline",
        "danger-secondary",
        "danger",
      ],
      class: {
        root: [
          "hover:-translate-y-px hover:shadow-raft-md",
          "active:translate-px",
          "active:shadow-raft-xs",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger-outline",
      class: {
        root: ["hover:-translate-y-px", "active:translate-px"],
      },
    },
  ],
});

export type ButtonProps = StyledProps<BaseButton.Props> &
  Omit<VariantProps<typeof buttonVariants>, "theme"> &
  DataAttributes & {
    loading?: boolean;
    loadingLabel?: string;
  };

export function Button({
  variant,
  size,
  loading = false,
  loadingLabel = "Loading",
  disabled,
  className,
  children,
  render,
  nativeButton,
  ...props
}: ButtonProps) {
  const theme = useThemeFamily();
  const { root, content, loadingIndicator } = buttonVariants({
    theme,
    variant,
    size,
  });

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="button"
      className={root({ className })}
      data-loading={loading ? "true" : undefined}
      disabled={disabled || loading}
      aria-disabled={loading || undefined}
    >
      {loading ? (
        <span data-slot="button-loading-indicator" className={loadingIndicator()}>
          <Spinner aria-label={loadingLabel} />
        </span>
      ) : null}
      <span
        data-slot="button-content"
        data-loading={loading ? "true" : undefined}
        className={content()}
      >
        {children}
      </span>
    </BaseButton>
  );
}
