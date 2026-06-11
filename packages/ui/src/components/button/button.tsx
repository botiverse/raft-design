import { Button as BaseButton } from "@base-ui/react/button";
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";
import { Spinner } from "../spinner/index.ts";

export const buttonVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "font-display leading-none whitespace-nowrap select-none",
      "border-line rounded-none",
      "shadow-sm transition-all duration-100",
      "outline-none focus-visible:ring-2 focus-visible:ring-line-focus",
      "data-[loading=true]:cursor-wait",
      "disabled:pointer-events-none disabled:opacity-40 data-[loading=true]:opacity-100",
      "disabled:transform-none",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    ],
    content:
      "relative z-10 inline-flex items-center justify-center gap-[inherit] data-[loading=true]:invisible",
    loadingIndicator: "absolute z-10",
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 font-bold"],
      },
      elegant: {
        root: [
          "overflow-clip rounded-md border-0 font-sans font-medium antialiased",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_2px_2px_-1px_oklch(0_0_0_/_0.05),0_4px_4px_-2px_oklch(0_0_0_/_0.03),0_0_0_1px_var(--line-subtle)]",
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
          "active:not-aria-[haspopup]:scale-[0.985]",
        ],
      },
    },
    variant: {
      primary: {
        root: ["border-line-strong bg-primary-400 text-primary-950", "hover:bg-primary-500"],
      },
      default: {
        root: ["border-line-strong bg-layer-panel text-foreground-strong", "hover:bg-layer-panel"],
      },
      information: {
        root: ["border-line-strong bg-info-base text-info-dark", "hover:bg-info-base"],
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
      outline: {
        root: [
          "border-line-strong bg-transparent text-foreground-strong",
          "hover:bg-layer-muted",
          "shadow-none",
        ],
      },
      ghost: {
        root: [
          "border-transparent bg-transparent text-foreground shadow-none",
          "hover:border-line-strong hover:bg-layer-muted",
        ],
      },
      link: {
        root: [
          "border-transparent bg-transparent text-foreground-strong shadow-none underline-offset-4",
          "hover:underline",
        ],
      },
      "danger-secondary": {
        root: ["border-line-strong bg-danger-lighter text-danger-base", "hover:bg-danger-lighter"],
      },
      danger: {
        root: [
          "border-line-strong bg-danger-base text-foreground-inverse",
          "hover:border-[oklch(0.595_0.241_26.758)] hover:bg-[oklch(0.595_0.241_26.758)]",
        ],
      },
      "danger-outline": {
        root: [
          "border-line-strong bg-transparent text-danger-base",
          "hover:bg-layer-muted",
          "shadow-none",
        ],
      },
    },
    size: {
      xs: {
        root: [
          "gap-1 px-2 py-[5px] text-[11px]",
          "has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5",
          "[&_svg:not([class*='size-'])]:size-3",
        ],
      },
      sm: {
        root: [
          "gap-1.5 px-2.5 py-[6px] text-xs",
          "has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
          "[&_svg:not([class*='size-'])]:size-3.5",
        ],
      },
      md: {
        root: [
          "gap-2 px-3 py-2 text-sm",
          "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
        ],
      },
      lg: {
        root: [
          "gap-2 px-4 py-3 text-sm",
          "has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
        ],
      },
      "icon-xs": { root: ["p-[5px] text-[11px]", "[&_svg:not([class*='size-'])]:size-3"] },
      "icon-sm": { root: ["p-[6px] text-xs", "[&_svg:not([class*='size-'])]:size-3.5"] },
      "icon-md": { root: ["p-2 text-sm", "[&_svg:not([class*='size-'])]:size-4"] },
      "icon-lg": { root: ["p-3 text-sm", "[&_svg:not([class*='size-'])]:size-4"] },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
  compoundVariants: [
    {
      theme: "elegant",
      variant: "default",
      class: {
        root: [
          "bg-foreground-strong text-foreground-inverse",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_2px_2px_-1px_oklch(0_0_0_/_0.12),0_4px_4px_-2px_oklch(0_0_0_/_0.14),0_0_0_1px_var(--foreground-strong)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_16%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.31_0.006_285)]",
          "[&_[data-slot=button-content]]:drop-shadow-[0_1px_2px_oklch(0_0_0_/_0.2)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "bg-primary-400 text-primary-950",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.25),0_2px_2px_-1px_oklch(0.85_0.162_91.89_/_0.12),0_4px_4px_-2px_oklch(0.85_0.162_91.89_/_0.08),0_0_0_1px_oklch(0.83_0.14_91.89_/_0.7)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_28%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.86_0.15_91.89)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      class: {
        root: [
          "bg-layer-panel text-foreground-strong",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_2px_2px_-1px_oklch(0_0_0_/_0.04),0_4px_4px_-2px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-subtle)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_2%)_100%)]",
          "hover:bg-layer-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "ghost",
      class: {
        root: [
          "bg-transparent text-foreground-muted shadow-none",
          "before:bg-transparent hover:bg-line-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger-secondary",
      class: {
        root: [
          "bg-danger-lighter text-danger-base",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.18),0_2px_2px_-1px_oklch(0.616_0.249_26.758_/_0.08),0_4px_4px_-2px_oklch(0.616_0.249_26.758_/_0.1),0_0_0_1px_var(--state-danger-light)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_18%)_0%,oklab(0%_0_0_/_2%)_100%)]",
          "hover:bg-danger-light",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger",
      class: {
        root: [
          "bg-danger-base text-foreground-inverse",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_2px_2px_-1px_oklch(0.616_0.249_26.758_/_0.16),0_4px_4px_-2px_oklch(0.616_0.249_26.758_/_0.24),0_0_0_1px_var(--state-danger-base)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_20%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.56_0.23_26.758)]",
          "[&_[data-slot=button-content]]:drop-shadow-[0_1px_2px_oklch(0_0_0_/_0.2)]",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger",
      class: {
        root: [
          "border-line-strong bg-danger-base text-foreground-inverse",
          "shadow-sm",
          "hover:border-line-strong hover:bg-danger-base",
          "hover:-translate-y-px hover:shadow-md",
          "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
          "active:shadow-2xs",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger-secondary",
      class: {
        root: [
          "border-line-strong bg-danger-lighter text-danger-base",
          "shadow-sm",
          "hover:border-line-strong hover:bg-danger-lighter",
          "hover:-translate-y-px hover:shadow-md",
          "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
          "active:shadow-2xs",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger-outline",
      class: {
        root: [
          "bg-layer-panel text-danger-base",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_2px_2px_-1px_oklch(0.616_0.249_26.758_/_0.06),0_4px_4px_-2px_oklch(0.616_0.249_26.758_/_0.06),0_0_0_1px_var(--state-danger-light)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_2%)_100%)]",
          "hover:bg-danger-lighter",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: [
          "bg-accent-400 text-foreground",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_2px_2px_-1px_oklch(0.78_0.16_0.71_/_0.16),0_4px_4px_-2px_oklch(0.78_0.16_0.71_/_0.2),0_0_0_1px_var(--accent-400)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_16%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.72_0.15_0.71)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        root: [
          "bg-transparent text-foreground-muted shadow-none",
          "before:bg-transparent hover:bg-transparent hover:text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "information",
      class: {
        root: [
          "bg-info-base text-info-dark",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_2px_2px_-1px_oklch(0.78_0.145_215_/_0.16),0_4px_4px_-2px_oklch(0.78_0.145_215_/_0.2),0_0_0_1px_var(--state-info-base)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_16%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.74_0.13_219.2)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        root: [
          "bg-layer-muted text-foreground-placeholder",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_2px_2px_-1px_oklch(0_0_0_/_0.03),0_4px_4px_-2px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-subtle)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_10%)_0%,oklab(0%_0_0_/_2%)_100%)]",
          "hover:bg-line-subtle",
        ],
      },
    },
    {
      theme: "brutal",
      variant: ["primary", "default", "information", "muted", "accent"],
      class: {
        root: [
          "hover:-translate-y-px hover:shadow-md",
          "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
          "active:shadow-2xs",
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
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const { root, content, loadingIndicator } = buttonVariants({
    theme,
    variant,
    size,
  });

  return (
    <BaseButton
      {...props}
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
