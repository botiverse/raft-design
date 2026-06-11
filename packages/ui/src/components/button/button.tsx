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
      success: {
        root: ["border-line-strong bg-success-base text-success-dark", "hover:bg-success-base"],
      },
      warning: {
        root: ["border-line-strong bg-warning-base text-warning-dark", "hover:bg-warning-base"],
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
      danger: {
        root: ["border-line-strong bg-danger-base text-danger-dark", "hover:bg-danger-base"],
      },
      "danger-outline": {
        root: [
          "border-danger-base bg-transparent text-danger-base",
          "hover:bg-danger-lighter",
          "shadow-none disabled:shadow-none",
        ],
      },
    },
    size: {
      xs: {
        root: [
          "h-6 gap-1 px-2 text-[11px]",
          "has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5",
          "[&_svg:not([class*='size-'])]:size-3",
        ],
      },
      sm: {
        root: [
          "h-7 gap-1.5 px-2.5 text-xs",
          "has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
          "[&_svg:not([class*='size-'])]:size-3.5",
        ],
      },
      md: {
        root: [
          "h-8 gap-2 px-3 text-sm",
          "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
        ],
      },
      lg: {
        root: [
          "h-10 gap-2 px-4 text-sm",
          "has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
        ],
      },
      "icon-xs": { root: ["size-6 text-[11px]", "[&_svg:not([class*='size-'])]:size-3"] },
      "icon-sm": { root: ["size-7 text-xs", "[&_svg:not([class*='size-'])]:size-3.5"] },
      "icon-md": { root: "size-8 text-sm" },
      "icon-lg": { root: "size-10 text-sm" },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: [
        "primary",
        "default",
        "information",
        "muted",
        "accent",
        "success",
        "warning",
        "danger",
      ],
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
