import { Button as BaseButton } from "@base-ui/react/button";
import { tv, type VariantProps } from "../../lib/tv";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Spinner } from "../spinner/index";

export const buttonVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "font-heading leading-none whitespace-nowrap select-none",
      "border-line rounded-none",
      "shadow-raft-sm transition-all duration-100",
      "outline outline-[1px] outline-offset-2 outline-transparent",
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
        root: ["border-2 font-bold focus-visible:outline-transparent"],
      },
      elegant: {
        root: [
          "overflow-clip border-0 font-sans font-medium antialiased",
          "focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--button-focus-ring,var(--primary-400))_80%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-layer-page",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-muted)]",
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
          "active:not-data-[has-popup]:scale-[0.985]",
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
        root: [
          "border-line-strong bg-secondary-400 text-secondary-950",
          "hover:border-line-strong hover:bg-secondary-400",
        ],
      },
      accent: {
        root: ["border-line-strong bg-accent-400 text-accent-950", "hover:bg-accent-500"],
      },
      warning: {
        root: ["border-line-strong bg-warning text-warning-foreground", "hover:bg-warning"],
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
          "gap-1 px-2 py-[5px] text-[11px]",
          "has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5",
          "[&_[data-icon]]:size-[1em]",
          "[&_svg:not([class*='size-'])]:size-3",
        ],
      },
      sm: {
        root: [
          "gap-[5px] px-2.5 py-1.5 text-xs",
          "has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
          "[&_[data-icon]]:size-[1em]",
          "[&_svg:not([class*='size-'])]:size-3.5",
        ],
      },
      md: {
        root: [
          "gap-[5.5px] px-3 py-[7px] text-sm",
          "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
          "[&_[data-icon]]:size-[1em]",
        ],
      },
      lg: {
        root: [
          "gap-1.5 px-3.5 py-2 text-base",
          "has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
          "[&_[data-icon]]:size-[1em]",
          "[&_svg:not([class*='size-'])]:size-4",
        ],
      },
      "icon-xs": { root: ["p-[5px] text-[11px]", "[&_svg:not([class*='size-'])]:size-3"] },
      "icon-sm": { root: ["p-1.5 text-xs", "[&_svg:not([class*='size-'])]:size-3.5"] },
      "icon-md": { root: ["p-2 text-sm", "[&_svg:not([class*='size-'])]:size-4"] },
      "icon-lg": { root: ["p-3 text-sm", "[&_svg:not([class*='size-'])]:size-4"] },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
  compoundVariants: [
    {
      theme: "elegant",
      size: ["xs", "icon-xs"],
      class: { root: "rounded-sm" },
    },
    {
      theme: "elegant",
      size: ["sm", "icon-sm"],
      class: { root: "rounded" },
    },
    {
      theme: "elegant",
      size: ["md", "icon-md"],
      class: { root: "rounded-md" },
    },
    {
      theme: "elegant",
      size: "md",
      class: { root: "py-1.5" },
    },
    {
      theme: "elegant",
      size: ["lg", "icon-lg"],
      class: { root: "rounded-md" },
    },
    {
      theme: "elegant",
      size: "lg",
      class: { root: "py-[7px]" },
    },
    {
      theme: "elegant",
      variant: ["outline", "danger-outline"],
      size: "xs",
      class: { root: "py-1.5" },
    },
    {
      theme: "elegant",
      variant: ["outline", "danger-outline"],
      size: "sm",
      class: { root: "py-[6.75px]" },
    },
    {
      theme: "elegant",
      variant: ["outline", "danger-outline"],
      size: "md",
      class: { root: "py-[7.25px]" },
    },
    {
      theme: "elegant",
      variant: ["outline", "danger-outline"],
      size: "lg",
      class: { root: "py-[7.75px]" },
    },
    {
      theme: "elegant",
      variant: [
        "primary",
        "default",
        "information",
        "muted",
        "accent",
        "warning",
        "danger-secondary",
        "danger",
      ],
      size: "xs",
      class: { root: "py-[5.75px]" },
    },
    {
      theme: "elegant",
      variant: [
        "primary",
        "default",
        "information",
        "muted",
        "accent",
        "warning",
        "danger-secondary",
        "danger",
      ],
      size: "sm",
      class: { root: "py-[6.75px]" },
    },
    {
      theme: "elegant",
      variant: [
        "primary",
        "default",
        "information",
        "muted",
        "accent",
        "warning",
        "danger-secondary",
        "danger",
      ],
      size: "md",
      class: { root: "py-[6.75px]" },
    },
    {
      theme: "elegant",
      variant: [
        "primary",
        "default",
        "information",
        "muted",
        "accent",
        "warning",
        "danger-secondary",
        "danger",
      ],
      size: "lg",
      class: { root: "py-[7.75px]" },
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
      class: { root: "bg-brutal-red text-foreground-strong hover:bg-brutal-red" },
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
      size: "xs",
      class: {
        root: [
          "h-6 px-2 py-0 text-[11px]",
          "has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5",
        ],
      },
    },
    {
      theme: "brutal",
      size: "sm",
      class: {
        root: [
          "h-7 px-2.5 py-0 text-xs",
          "has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
        ],
      },
    },
    {
      theme: "brutal",
      size: "md",
      class: {
        root: [
          "h-8 px-3 py-0 text-sm",
          "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
        ],
      },
    },
    {
      theme: "brutal",
      size: "lg",
      class: {
        root: [
          "h-10 px-4 py-0 text-sm",
          "has-data-[icon=inline-start]:pl-3.5 has-data-[icon=inline-end]:pr-3.5",
        ],
      },
    },
    {
      theme: "brutal",
      size: "icon-xs",
      class: { root: "size-6 p-0 text-[11px]" },
    },
    {
      theme: "brutal",
      size: "icon-sm",
      class: { root: "size-7 p-0 text-xs" },
    },
    {
      theme: "brutal",
      size: "icon-md",
      class: { root: "size-8 p-0 text-sm" },
    },
    {
      theme: "brutal",
      size: "icon-lg",
      class: { root: "size-10 p-0 text-sm" },
    },
    {
      theme: "elegant",
      variant: "default",
      class: {
        root: [
          "bg-foreground text-foreground-inverse dark:bg-layer-popover dark:text-foreground-strong",
          "[--button-focus-outline:var(--foreground)] dark:[--button-focus-outline:var(--layer-popover)]",
          "[--button-focus-ring:var(--foreground)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--foreground)] dark:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.08),0_0_0_1px_var(--line-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_0%)_100%)] dark:before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_6%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.31_0.006_106.42)] dark:hover:bg-fill-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "bg-primary-400 text-primary-950",
          "[--button-focus-outline:var(--primary-400)]",
          "[--button-focus-ring:var(--primary-400)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.15),0_0_0_1px_var(--primary-edge)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_11%)_0%,oklab(100%_0_0_/_0%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-primary-hover",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      class: {
        root: [
          "bg-layer-panel text-foreground",
          "[--button-focus-outline:var(--layer-panel)]",
          "[--button-focus-ring:var(--foreground)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_1%)_100%)]",
          "hover:bg-fill-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "ghost",
      class: {
        root: [
          "bg-transparent text-foreground-muted shadow-none",
          "[--button-focus-outline:var(--line-hairline)]",
          "[--button-focus-ring:var(--line-hairline)]",
          "before:bg-transparent hover:bg-ink-4",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger-secondary",
      class: {
        root: [
          "bg-danger-soft text-danger",
          "[--button-focus-outline:var(--danger-soft)]",
          "[--button-focus-ring:var(--danger)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.18),0_0_0_1px_var(--danger-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_9%)_0%,oklab(0%_0_0_/_1%)_100%)]",
          "hover:bg-danger-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger",
      class: {
        root: [
          "bg-danger text-danger-foreground",
          "[--button-focus-outline:var(--danger)]",
          "[--button-focus-ring:var(--danger)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--danger)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_10%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-danger-hover",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger",
      class: {
        root: [
          "border-line-strong bg-brutal-red text-foreground-strong",
          "shadow-raft-sm",
          "hover:border-line-strong hover:bg-brutal-red",
          "hover:-translate-y-px hover:shadow-raft-md",
          "active:not-data-[has-popup]:translate-x-px active:not-data-[has-popup]:translate-y-px",
          "active:shadow-raft-xs",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger-secondary",
      class: {
        root: [
          "border-line-strong bg-danger-soft text-[color-mix(in_oklab,var(--danger)_72%,transparent)]",
          "shadow-raft-sm",
          "hover:border-line-strong hover:bg-danger-soft",
          "hover:-translate-y-px hover:shadow-raft-md",
          "active:not-data-[has-popup]:translate-x-px active:not-data-[has-popup]:translate-y-px",
          "active:shadow-raft-xs",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger-outline",
      class: {
        root: [
          "bg-layer-panel text-danger",
          "[--button-focus-outline:var(--layer-panel)]",
          "[--button-focus-ring:var(--danger)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--danger-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_1%)_100%)]",
          "hover:bg-danger-soft",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: [
          "bg-accent-400 text-accent-950",
          "[--button-focus-outline:var(--accent-400)]",
          "[--button-focus-ring:var(--accent-400)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--accent-400)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-accent-hover",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "warning",
      class: {
        root: [
          "bg-warning text-warning-foreground",
          "[--button-focus-outline:var(--warning)]",
          "[--button-focus-ring:var(--warning)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.14),0_0_0_1px_var(--warning)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_10%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-warning-hover",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        root: [
          "bg-transparent text-foreground-muted shadow-none",
          "[--button-focus-outline:transparent]",
          "[--button-focus-ring:var(--line-hairline)]",
          "before:bg-transparent hover:bg-transparent hover:text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "information",
      class: {
        root: [
          "bg-info text-foreground-inverse",
          "[--button-focus-outline:var(--info)]",
          "[--button-focus-ring:var(--info)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--info)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-info-hover",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        root: [
          "bg-fill-muted text-foreground-placeholder",
          "[--button-focus-outline:var(--fill-muted)]",
          "[--button-focus-ring:var(--line-hairline)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-muted)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_5%)_0%,oklab(0%_0_0_/_1%)_100%)]",
          "hover:bg-line-muted",
        ],
      },
    },
    {
      theme: "brutal",
      variant: ["primary", "default", "information", "muted", "accent", "warning", "outline"],
      class: {
        root: [
          "hover:-translate-y-px hover:shadow-raft-md",
          "active:not-data-[has-popup]:translate-x-px active:not-data-[has-popup]:translate-y-px",
          "active:shadow-raft-xs",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger-outline",
      class: {
        root: [
          "hover:-translate-y-px",
          "active:not-data-[has-popup]:translate-x-px active:not-data-[has-popup]:translate-y-px",
        ],
      },
    },
  ],
});

export type ButtonProps = StyledProps<BaseButton.Props> &
  Omit<VariantProps<typeof buttonVariants>, "theme"> & {
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
  "aria-haspopup": ariaHasPopup,
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
      aria-haspopup={ariaHasPopup}
      {...(ariaHasPopup != null && ariaHasPopup !== false ? { "data-has-popup": "" as const } : {})}
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
