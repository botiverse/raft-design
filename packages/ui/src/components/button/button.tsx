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
      "border-border rounded-[var(--radius)]",
      "shadow-[var(--shadow)] transition-all duration-100",
      "outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "data-[loading=true]:cursor-wait",
      "disabled:pointer-events-none disabled:opacity-40 data-[loading=true]:opacity-100",
      "disabled:transform-none disabled:shadow-[var(--shadow)]",
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
        root: ["border font-medium", "active:not-aria-[haspopup]:scale-[0.98]"],
      },
    },
    variant: {
      primary: {
        root: [
          "border-action-primary-border bg-action-primary text-action-primary-foreground",
          "hover:bg-action-primary-hover",
        ],
      },
      default: {
        root: [
          "border-action-default-border bg-action-default text-action-default-foreground",
          "hover:bg-action-default-hover",
        ],
      },
      information: {
        root: [
          "border-action-information-border bg-action-information text-action-information-foreground",
          "hover:bg-action-information-hover",
        ],
      },
      muted: {
        root: [
          "border-action-muted-border bg-action-muted text-action-muted-foreground",
          "hover:bg-action-muted-hover",
        ],
      },
      accent: {
        root: [
          "border-action-accent-border bg-action-accent text-action-accent-foreground",
          "hover:bg-action-accent-hover",
        ],
      },
      success: {
        root: [
          "border-action-success-border bg-action-success text-action-success-foreground",
          "hover:bg-action-success-hover",
        ],
      },
      warning: {
        root: [
          "border-action-warning-border bg-action-warning text-action-warning-foreground",
          "hover:bg-action-warning-hover",
        ],
      },
      outline: {
        root: [
          "border-action-default-border bg-transparent text-action-default-foreground",
          "hover:bg-action-neutral-hover",
          "shadow-none disabled:shadow-none",
        ],
      },
      ghost: {
        root: [
          "border-transparent bg-transparent text-foreground shadow-none",
          "hover:border-action-default-border",
          "disabled:shadow-none",
        ],
      },
      link: {
        root: [
          "border-transparent bg-transparent text-action-link shadow-none underline-offset-4",
          "hover:underline",
          "disabled:shadow-none",
        ],
      },
      destructive: {
        root: [
          "border-action-destructive-border bg-action-destructive text-action-destructive-foreground",
          "hover:bg-action-destructive-hover",
        ],
      },
      "destructive-outline": {
        root: [
          "border-action-destructive-border bg-transparent text-destructive",
          "hover:bg-destructive-soft",
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
        "destructive",
      ],
      class: {
        root: [
          "hover:-translate-y-px hover:shadow-[var(--shadow-hover)]",
          "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
          "active:shadow-[var(--shadow-active)]",
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
