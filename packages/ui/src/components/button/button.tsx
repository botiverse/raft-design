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
    content: "inline-flex items-center justify-center gap-[inherit] data-[loading=true]:invisible",
    loadingIndicator: "absolute",
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 font-bold"],
      },
      elegant: {
        root: [
          "rounded-[4px] border font-medium shadow-none",
          "disabled:shadow-none",
          "active:not-aria-[haspopup]:scale-[0.98]",
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
          "border-line-strong bg-foreground-strong text-foreground-inverse",
          "hover:border-foreground hover:bg-foreground",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "border-primary-400 bg-primary-400 text-warning-dark",
          "hover:border-[oklch(0.85_0.162_91.89)] hover:bg-[oklch(0.85_0.162_91.89)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      class: {
        root: [
          "border-line-subtle bg-transparent text-foreground-strong",
          "hover:border-line hover:bg-transparent",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "ghost",
      class: {
        root: [
          "border-transparent bg-transparent text-foreground-muted",
          "hover:border-transparent hover:bg-line-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger-secondary",
      class: {
        root: [
          "border-danger-lighter bg-danger-lighter text-[oklch(0.595_0.241_26.758)]",
          "hover:border-[oklch(0.9_0.045_20.05)] hover:bg-[oklch(0.9_0.045_20.05)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger",
      class: {
        root: [
          "border-[oklch(0.645_0.24_27.311)] bg-[oklch(0.645_0.24_27.311)] text-foreground-inverse",
          "hover:border-[oklch(0.595_0.241_26.758)] hover:bg-[oklch(0.595_0.241_26.758)]",
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
          "border-line-subtle bg-transparent text-danger-base",
          "hover:border-line hover:bg-transparent",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: [
          "border-accent-400 bg-accent-400 text-foreground",
          "hover:border-[oklch(0.735_0.15_0.71)] hover:bg-[oklch(0.735_0.15_0.71)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        root: [
          "border-transparent bg-transparent text-foreground-muted",
          "hover:border-transparent hover:bg-transparent hover:text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "information",
      class: {
        root: [
          "border-info-base bg-info-base text-info-dark",
          "hover:border-info-base hover:bg-info-base",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        root: [
          "border-layer-muted bg-layer-muted text-foreground-placeholder",
          "hover:border-line-subtle hover:bg-line-subtle",
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
