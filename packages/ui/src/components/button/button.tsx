import { Button as BaseButton } from "@base-ui/react/button";
import type { ReactElement } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Spinner } from "../spinner/index";

export const buttonVariants = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "font-heading leading-none whitespace-nowrap select-none",
      "border-line rounded-none",
      "shadow-sm transition-all duration-100",
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
          "focus-visible:outline-[var(--button-focus-outline,transparent)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-subtle)]",
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
        root: ["border-line-strong bg-info-base text-foreground-inverse", "hover:bg-info-base"],
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
        root: [
          "border-line-strong bg-warning-base text-foreground-inverse",
          "hover:bg-warning-base",
        ],
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
          "[&_[data-icon]]:size-[1em]",
          "[&_svg:not([class*='size-'])]:size-3",
        ],
      },
      sm: {
        root: [
          "gap-[5px] px-2.5 py-[6px] text-xs",
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
          "gap-[6px] px-3.5 py-2 text-base",
          "has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
          "[&_[data-icon]]:size-[1em]",
          "[&_svg:not([class*='size-'])]:size-4",
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
      class: { root: "py-[6px]" },
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
      class: { root: "bg-brutal-yellow text-black hover:bg-brutal-yellow" },
    },
    {
      theme: "brutal",
      variant: "default",
      class: { root: "bg-white text-black hover:bg-white" },
    },
    {
      theme: "brutal",
      variant: "outline",
      class: { root: "bg-white text-black shadow-sm hover:bg-white" },
    },
    {
      theme: "brutal",
      variant: "information",
      class: { root: "bg-brutal-cyan text-black hover:bg-brutal-cyan" },
    },
    {
      theme: "brutal",
      variant: "muted",
      class: { root: "bg-brutal-stone text-black hover:bg-brutal-stone" },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: { root: "bg-brutal-pink text-black hover:bg-brutal-pink" },
    },
    {
      theme: "brutal",
      variant: "danger",
      class: { root: "bg-brutal-red text-black hover:bg-brutal-red" },
    },
    {
      theme: "brutal",
      variant: "warning",
      class: {
        root: "bg-[oklch(0.785_0.123_50.11)] text-black hover:bg-[oklch(0.785_0.123_50.11)]",
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
          "bg-foreground-strong text-foreground-inverse",
          "[--button-focus-outline:var(--foreground-strong)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--foreground-strong)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.31_0.006_285)]",
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
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.15),0_0_0_1px_oklch(0.83_0.14_91.89_/_0.83)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_11%)_0%,oklab(100%_0_0_/_0%)_0%,oklab(0%_0_0_/_0%)_100%)]",
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
          "[--button-focus-outline:var(--layer-panel)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-subtle)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_1%)_100%)]",
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
          "[--button-focus-outline:var(--line-muted)]",
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
          "[--button-focus-outline:var(--state-danger-lighter)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.18),0_0_0_1px_var(--state-danger-light)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_9%)_0%,oklab(0%_0_0_/_1%)_100%)]",
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
          "[--button-focus-outline:var(--state-danger-base)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--state-danger-base)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_10%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.56_0.23_26.758)]",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger",
      class: {
        root: [
          "border-line-strong bg-brutal-red text-black",
          "shadow-sm",
          "hover:border-line-strong hover:bg-brutal-red",
          "hover:-translate-y-px hover:shadow-md",
          "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
          "active:shadow-xs",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "danger-secondary",
      class: {
        root: [
          "border-line-strong bg-danger-lighter text-[color-mix(in_oklab,var(--state-danger-base)_72%,transparent)]",
          "shadow-sm",
          "hover:border-line-strong hover:bg-danger-lighter",
          "hover:-translate-y-px hover:shadow-md",
          "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
          "active:shadow-xs",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "danger-outline",
      class: {
        root: [
          "bg-layer-panel text-danger-base",
          "[--button-focus-outline:var(--layer-panel)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--state-danger-light)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0_/_0%)_30%,oklab(0%_0_0_/_1%)_100%)]",
          "hover:bg-danger-lighter",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: [
          "bg-accent-400 text-white",
          "[--button-focus-outline:var(--accent-400)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--accent-400)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.72_0.15_0.71)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "warning",
      class: {
        root: [
          "bg-warning-base text-foreground-inverse",
          "[--button-focus-outline:var(--state-warning-base)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.14),0_0_0_1px_var(--state-warning-base)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_10%)_0%,oklab(0%_0_0_/_0%)_100%)]",
          "hover:bg-[oklch(0.65_0.19_44.441)]",
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
          "before:bg-transparent hover:bg-transparent hover:text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "information",
      class: {
        root: [
          "bg-info-base text-foreground-inverse",
          "[--button-focus-outline:var(--state-info-base)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.12),0_0_0_1px_var(--state-info-base)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_0%)_100%)]",
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
          "[--button-focus-outline:var(--layer-muted)]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-subtle)]",
          "before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_5%)_0%,oklab(0%_0_0_/_1%)_100%)]",
          "hover:bg-line-subtle",
        ],
      },
    },
    {
      theme: "brutal",
      variant: ["primary", "default", "information", "muted", "accent", "warning", "outline"],
      class: {
        root: [
          "hover:-translate-y-px hover:shadow-md",
          "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
          "active:shadow-xs",
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

function defaultNativeButton(render: BaseButton.Props["render"]): boolean | undefined {
  if (!render || typeof render !== "object" || !("type" in render)) {
    return undefined;
  }

  const element = render as ReactElement;
  if (typeof element.type === "string") {
    return element.type === "button";
  }

  return undefined;
}

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
