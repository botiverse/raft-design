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
      "disabled:transform-none disabled:shadow-sm",
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
          "[--button-highlight:#ffffff0d] [--button-ring:var(--line-subtle)] [--button-shadow-far:#00000008] [--button-shadow-near:#0000000c]",
          "shadow-[inset_0_1px_0.5px_var(--button-highlight),0_2px_2px_-1px_var(--button-shadow-near),0_4px_4px_-2px_var(--button-shadow-far),0_0_0_1px_var(--button-ring)]",
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
          "disabled:shadow-none disabled:before:hidden",
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
          "shadow-none disabled:shadow-none",
        ],
      },
      ghost: {
        root: [
          "border-transparent bg-transparent text-foreground shadow-none",
          "hover:border-line-strong hover:bg-layer-muted",
          "disabled:shadow-none",
        ],
      },
      link: {
        root: [
          "border-transparent bg-transparent text-foreground-strong shadow-none underline-offset-4",
          "hover:underline",
          "disabled:shadow-none",
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
          "shadow-none disabled:shadow-none",
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
          "[--button-highlight:#ffffff1f] [--button-ring:oklch(0.21_0.006_285)] [--button-shadow-far:#00000024] [--button-shadow-near:#0000001f]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_16%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.31_0.006_285)]",
          "[&_[data-slot=button-content]]:drop-shadow-[0_1px_2px_#00000033]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "bg-primary-400 text-primary-950",
          "[--button-highlight:#ffffff40] [--button-ring:oklch(0.83_0.14_91.89_/_0.7)] [--button-shadow-far:oklch(0.85_0.162_91.89_/_0.08)] [--button-shadow-near:oklch(0.85_0.162_91.89_/_0.12)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_28%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-primary-500",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      class: {
        root: [
          "bg-white text-foreground-strong",
          "[--button-ring:var(--line-subtle)] [--button-shadow-far:#00000006] [--button-shadow-near:#0000000a]",
          "shadow-[inset_0_1px_0.5px_var(--button-highlight),0_2px_2px_-1px_var(--button-shadow-near),0_4px_4px_-2px_var(--button-shadow-far),0_0_0_1px_var(--button-ring)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_2%)_100%)]",
          "hover:bg-[#fafafa]",
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
          "bg-[#fee2e2] text-[#c82121]",
          "[--button-ring:#f7b4b4] [--button-shadow-far:#f73d3d1a] [--button-shadow-near:#f73d3d14]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_18%)_0%,oklab(0%_0_0_/_2%)_100%)]",
          "hover:bg-[#fbd4d4]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger",
      class: {
        root: [
          "bg-[#e02e2e] text-white",
          "[--button-highlight:#ffffff1f] [--button-ring:#f73d3d] [--button-shadow-far:#f73d3d3d] [--button-shadow-near:#f73d3d29]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_20%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[#cf2626]",
          "[&_[data-slot=button-content]]:drop-shadow-[0_1px_2px_#00000033]",
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
          "bg-white text-danger-base",
          "[--button-ring:#f7b4b4] [--button-shadow-far:#f73d3d10] [--button-shadow-near:#f73d3d0f]",
          "shadow-[inset_0_1px_0.5px_var(--button-highlight),0_2px_2px_-1px_var(--button-shadow-near),0_4px_4px_-2px_var(--button-shadow-far),0_0_0_1px_var(--button-ring)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_2%)_100%)]",
          "hover:bg-[#fff7f7]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: [
          "bg-accent-400 text-foreground",
          "[--button-highlight:#ffffff1f] [--button-ring:oklch(0.78_0.16_0.71)] [--button-shadow-far:oklch(0.78_0.16_0.71_/_0.2)] [--button-shadow-near:oklch(0.78_0.16_0.71_/_0.16)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_16%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.735_0.15_0.71)]",
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
          "[--button-highlight:#ffffff1f] [--button-ring:var(--state-info-base)] [--button-shadow-far:oklch(0.78_0.145_215_/_0.2)] [--button-shadow-near:oklch(0.78_0.145_215_/_0.16)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_16%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-info-base",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        root: [
          "bg-layer-muted text-foreground-placeholder",
          "[--button-ring:var(--line-subtle)] [--button-shadow-far:#00000004] [--button-shadow-near:#00000008]",
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
