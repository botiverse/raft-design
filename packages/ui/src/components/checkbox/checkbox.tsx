import { useId } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { tv, type VariantProps } from "../../lib/tv";
import { CheckboxIndicator } from "./checkbox-indicator";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const checkbox = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 touch-manipulation items-center justify-center outline-none",
      "focus-visible:ring-2 focus-visible:ring-line-strong",
      "data-disabled:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
    ],
    indicator: ["pointer-events-none"],
    graphic: ["pointer-events-none"],
    outerRect: ["transition-[fill,stroke] duration-160 ease-out motion-reduce:transition-none"],
    overlayRect: [
      "pointer-events-none opacity-0 transition-opacity duration-160 ease-out motion-reduce:transition-none",
      "group-data-disabled/checkbox:opacity-0",
      "group-hover/checkbox:group-data-disabled/checkbox:opacity-0 group-focus-visible/checkbox:group-data-disabled/checkbox:opacity-0",
    ],
    mark: ["absolute left-1/2 top-1/2 shrink-0 origin-center -translate-1/2 "],
    checkMark: [
      "-rotate-6 scale-[0.82] opacity-0",
      "transition-[opacity,transform] duration-180 ease-out motion-reduce:transition-none",
      "motion-reduce:rotate-0 motion-reduce:scale-100",
    ],
    indeterminateMark: [
      "invisible scale-x-50 opacity-0",
      "transition-[opacity,transform] duration-160 ease-out motion-reduce:transition-none",
      "motion-reduce:scale-x-100",
    ],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {
        root: [
          "group/checkbox rounded-[3px] focus:outline-none",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_2px_2px_-1px_oklch(0_0_0/0.04),0_4px_4px_-2px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "dark:not-data-checked:not-data-indeterminate:shadow-[inset_0_1px_1.5px_oklch(0_0_0/0.3),0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
          "transition-[box-shadow,transform] duration-100 ease-out motion-reduce:transition-none",
          "active:scale-[0.96] data-disabled:active:scale-100 motion-reduce:active:scale-100",
        ],
        graphic: ["absolute inset-0 size-full"],
      },
    },
    variant: {
      default: {},
      primary: {},
    },
    color: {
      default: {},
      primary: {},
    },
    size: {
      sm: {
        root: "size-3.5",
      },
      md: {
        root: "size-4",
      },
      lg: {
        root: "size-5",
      },
    },
  },
  compoundVariants: [
    {
      theme: "elegant",
      size: "sm",
      class: { root: "size-4" },
    },
    {
      theme: "elegant",
      size: "md",
      class: { root: "size-4.5" },
    },
    {
      theme: "elegant",
      variant: "default",
      color: "default",
      class: {
        root: [
          "data-checked:shadow-[0_2px_2px_-1px_oklch(0_0_0/0.04),0_4px_4px_-2px_oklch(0_0_0/0.02)]",
          "data-indeterminate:shadow-[0_2px_2px_-1px_oklch(0_0_0/0.04),0_4px_4px_-2px_oklch(0_0_0/0.02)]",
          "dark:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "dark:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
        ],
        outerRect: [
          "fill-layer-panel",
          "stroke-transparent",
          "dark:fill-layer-inset",
          "group-hover/checkbox:fill-[oklch(0.976_0.001_106.42)] dark:group-hover/checkbox:fill-layer-card",
          "group-focus-visible/checkbox:fill-foreground",
          "group-hover/checkbox:group-data-checked/checkbox:fill-foreground-active dark:group-hover/checkbox:group-data-checked/checkbox:fill-foreground-hover",
          "group-hover/checkbox:group-data-indeterminate/checkbox:fill-foreground-active dark:group-hover/checkbox:group-data-indeterminate/checkbox:fill-foreground-hover",
          "group-focus-visible/checkbox:group-data-checked/checkbox:fill-foreground",
          "group-focus-visible/checkbox:group-data-indeterminate/checkbox:fill-foreground",
          "group-data-checked/checkbox:fill-foreground",
          "group-data-indeterminate/checkbox:fill-foreground",
          "dark:group-data-checked/checkbox:fill-foreground",
          "dark:group-data-indeterminate/checkbox:fill-foreground",
          "dark:group-focus-visible/checkbox:fill-foreground",
          "group-data-disabled/checkbox:fill-fill-muted",
          "group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-hover/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-hover/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-focus-visible/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-focus-visible/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
        ],
        mark: ["text-foreground-inverse group-data-disabled/checkbox:text-line"],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "hover:data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "hover:data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "dark:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "dark:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "dark:hover:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "dark:hover:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "hover:data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "hover:data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
        ],
        outerRect: [
          "fill-layer-panel",
          "stroke-transparent",
          "dark:fill-layer-inset",
          "group-hover/checkbox:fill-[oklch(0.976_0.001_106.42)] dark:group-hover/checkbox:fill-layer-card",
          "group-focus-visible/checkbox:fill-primary-400",
          "group-hover/checkbox:group-data-checked/checkbox:fill-primary-hover",
          "group-hover/checkbox:group-data-indeterminate/checkbox:fill-primary-hover",
          "group-focus-visible/checkbox:group-data-checked/checkbox:fill-primary-400",
          "group-focus-visible/checkbox:group-data-indeterminate/checkbox:fill-primary-400",
          "group-data-checked/checkbox:fill-primary-400",
          "group-data-indeterminate/checkbox:fill-primary-400",
          "dark:group-data-checked/checkbox:fill-primary-400",
          "dark:group-data-indeterminate/checkbox:fill-primary-400",
          "dark:group-focus-visible/checkbox:fill-primary-400",
          "group-data-disabled/checkbox:fill-fill-muted",
          "group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-hover/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-hover/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-focus-visible/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-focus-visible/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
        ],
        overlayRect: [
          "group-hover/checkbox:group-data-checked/checkbox:opacity-100 group-focus-visible/checkbox:group-data-checked/checkbox:opacity-100",
          "group-hover/checkbox:group-data-indeterminate/checkbox:opacity-100 group-focus-visible/checkbox:group-data-indeterminate/checkbox:opacity-100",
        ],
        mark: ["text-primary-950 group-data-disabled/checkbox:text-line"],
      },
    },
    {
      theme: "elegant",
      variant: "default",
      color: "primary",
      class: {
        root: [
          "data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "hover:data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "hover:data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
          "dark:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "dark:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "dark:hover:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "dark:hover:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
          "hover:data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "hover:data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
          "data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
        ],
        outerRect: [
          "fill-layer-panel",
          "stroke-transparent",
          "dark:fill-layer-inset",
          "group-hover/checkbox:fill-[oklch(0.976_0.001_106.42)] dark:group-hover/checkbox:fill-layer-card",
          "group-focus-visible/checkbox:fill-primary-400",
          "group-hover/checkbox:group-data-checked/checkbox:fill-primary-hover",
          "group-hover/checkbox:group-data-indeterminate/checkbox:fill-primary-hover",
          "group-focus-visible/checkbox:group-data-checked/checkbox:fill-primary-400",
          "group-focus-visible/checkbox:group-data-indeterminate/checkbox:fill-primary-400",
          "group-data-checked/checkbox:fill-primary-400",
          "group-data-indeterminate/checkbox:fill-primary-400",
          "dark:group-data-checked/checkbox:fill-primary-400",
          "dark:group-data-indeterminate/checkbox:fill-primary-400",
          "dark:group-focus-visible/checkbox:fill-primary-400",
          "group-data-disabled/checkbox:fill-fill-muted",
          "group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-hover/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-hover/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-focus-visible/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "group-focus-visible/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
          "dark:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
        ],
        overlayRect: [
          "group-hover/checkbox:group-data-checked/checkbox:opacity-100 group-focus-visible/checkbox:group-data-checked/checkbox:opacity-100",
          "group-hover/checkbox:group-data-indeterminate/checkbox:opacity-100 group-focus-visible/checkbox:group-data-indeterminate/checkbox:opacity-100",
        ],
        mark: ["text-primary-950 group-data-disabled/checkbox:text-line"],
      },
    },
  ],
  defaultVariants: {
    color: "default",
    size: "sm",
    variant: "default",
  },
});

function CheckboxCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M1 3.5L4 6.5L9 1.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckboxIndeterminateIcon({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="2"
      viewBox="0 0 8 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path d="M0 1H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

type ElegantCheckboxGraphicProps = {
  classNames: {
    graphic: string;
    outerRect: string;
    overlayRect: string;
  };
  shape: "square" | "circle";
};

function ElegantCheckboxGraphic({ classNames, shape }: ElegantCheckboxGraphicProps) {
  const gradientId = `checkbox-hover-${useId().replace(/:/g, "")}`;
  const radius = shape === "circle" ? 8 : 3;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={classNames.graphic}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklab(100% 0 0 / 14%)" />
          <stop offset="100%" stopColor="oklab(0% 0 0 / 3%)" />
        </linearGradient>
      </defs>
      <rect width="16" height="16" rx={radius} className={classNames.outerRect} />
      <rect
        width="16"
        height="16"
        rx={radius}
        fill={`url(#${gradientId})`}
        className={classNames.overlayRect}
      />
    </svg>
  );
}

export type CheckboxProps = StyledProps<BaseCheckbox.Root.Props> &
  Omit<VariantProps<typeof checkbox>, "theme"> & {
    shape?: "square" | "circle";
  };

export function Checkbox({
  size,
  color = "default",
  variant = "default",
  shape = "square",
  className,
  ...props
}: CheckboxProps) {
  const theme = useThemeFamily();
  const { root, indicator, graphic, outerRect, overlayRect, mark, checkMark, indeterminateMark } =
    checkbox({
      theme,
      size,
      color,
      variant,
    });

  if (theme === "elegant") {
    return (
      <BaseCheckbox.Root data-slot="checkbox" className={root({ className })} {...props}>
        <ElegantCheckboxGraphic
          shape={shape}
          classNames={{
            graphic: graphic(),
            outerRect: outerRect(),
            overlayRect: overlayRect(),
          }}
        />
        <BaseCheckbox.Indicator
          keepMounted
          data-slot="checkbox-indicator"
          className={indicator()}
          render={(indicatorProps, state) => (
            <span
              {...indicatorProps}
              className={indicator({ className: indicatorProps.className })}
            >
              <CheckboxCheckIcon
                className={mark({
                  className: checkMark({
                    className:
                      state.checked && !state.indeterminate ? "rotate-0 scale-100 opacity-100" : "",
                  }),
                })}
              />
              <CheckboxIndeterminateIcon
                className={mark({
                  className: indeterminateMark({
                    className: state.indeterminate ? "visible scale-x-100 opacity-100" : "",
                  }),
                })}
              />
            </span>
          )}
        />
      </BaseCheckbox.Root>
    );
  }

  return (
    <BaseCheckbox.Root data-slot="checkbox" className={root({ className })} {...props}>
      <BaseCheckbox.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className={indicator()}
        render={(indicatorProps, state) => (
          <CheckboxIndicator
            {...indicatorProps}
            checked={state.checked || state.indeterminate}
            disabled={state.disabled}
            mark={state.indeterminate ? "minus" : "check"}
            size={size}
            shape={shape}
            fill={variant === "primary" || color === "primary" ? "yellow" : "black"}
          />
        )}
      />
    </BaseCheckbox.Root>
  );
}
