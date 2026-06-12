import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { tv, type VariantProps } from "tailwind-variants";
import { CheckboxIndicator } from "./checkbox-indicator.tsx";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const checkbox = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center outline-none",
      "focus-visible:ring-2 focus-visible:ring-line-focus",
      "data-disabled:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
    ],
    indicator: ["pointer-events-none"],
    graphic: ["pointer-events-none"],
    outerRect: ["transition-[fill,stroke] duration-200 ease-out"],
    mark: ["absolute left-1/2 top-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2"],
    checkMark: ["opacity-0 transition-opacity duration-200 ease-out"],
    indeterminateMark: ["invisible opacity-0 transition-opacity duration-200 ease-out"],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {
        root: [
          "group/checkbox rounded-[3px] focus:outline-none",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_2px_2px_-1px_oklch(0_0_0_/_0.04),0_4px_4px_-2px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-subtle)]",
          "transition-[box-shadow,transform] duration-100",
        ],
        graphic: ["absolute inset-0 size-full"],
      },
    },
    variant: {
      soft: {},
      outline: {},
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
      class: { root: "size-[18px]" },
    },
    {
      theme: "elegant",
      variant: "soft",
      color: "default",
      class: {
        root: [
          "data-[checked]:shadow-[0_2px_2px_-1px_oklch(0_0_0_/_0.04),0_4px_4px_-2px_oklch(0_0_0_/_0.02)]",
          "data-[indeterminate]:shadow-[0_2px_2px_-1px_oklch(0_0_0_/_0.04),0_4px_4px_-2px_oklch(0_0_0_/_0.02)]",
          "data-[disabled]:shadow-[0_1px_1px_-1px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-subtle)]",
        ],
        outerRect: [
          "fill-layer-panel",
          "stroke-transparent",
          "group-hover/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:fill-foreground-strong",
          "group-hover/checkbox:group-data-[checked]/checkbox:fill-[oklch(0.31_0.006_285)]",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:fill-[oklch(0.31_0.006_285)]",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:fill-foreground-strong",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:fill-foreground-strong",
          "group-data-[checked]/checkbox:fill-foreground-strong",
          "group-data-[indeterminate]/checkbox:fill-foreground-strong",
          "group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
        ],
        mark: ["text-foreground-inverse group-data-[disabled]/checkbox:text-line"],
      },
    },
    {
      theme: "elegant",
      variant: "soft",
      color: "primary",
      class: {
        root: [
          "data-[checked]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.2),0_1px_1px_-0.5px_oklch(0.85_0.162_91.89_/_0.1),0_2px_2px_-1px_oklch(0.85_0.162_91.89_/_0.06),0_0_0_1px_oklch(0.83_0.14_91.89_/_0.7)]",
          "data-[indeterminate]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.2),0_1px_1px_-0.5px_oklch(0.85_0.162_91.89_/_0.1),0_2px_2px_-1px_oklch(0.85_0.162_91.89_/_0.06),0_0_0_1px_oklch(0.83_0.14_91.89_/_0.7)]",
          "data-[disabled]:shadow-[0_1px_1px_-1px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-subtle)]",
        ],
        outerRect: [
          "fill-layer-panel",
          "stroke-transparent",
          "group-hover/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:fill-primary-400",
          "group-hover/checkbox:group-data-[checked]/checkbox:fill-primary-500",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:fill-primary-500",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:fill-primary-400",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:fill-primary-400",
          "group-data-[checked]/checkbox:fill-primary-400",
          "group-data-[indeterminate]/checkbox:fill-primary-400",
          "group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
        ],
        mark: ["text-primary-950 group-data-[disabled]/checkbox:text-line"],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      color: "default",
      class: {
        root: [
          "data-[checked]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_2px_2px_-1px_oklch(0_0_0_/_0.05),0_4px_4px_-2px_oklch(0_0_0_/_0.025),0_0_0_1px_var(--line-strong)]",
          "data-[indeterminate]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_2px_2px_-1px_oklch(0_0_0_/_0.05),0_4px_4px_-2px_oklch(0_0_0_/_0.025),0_0_0_1px_var(--line-strong)]",
          "data-[disabled]:shadow-[0_1px_1px_-1px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-subtle)]",
        ],
        outerRect: [
          "fill-layer-panel",
          "stroke-transparent",
          "stroke-[0.5px]",
          "group-hover/checkbox:fill-layer-muted",
          "group-hover/checkbox:stroke-line-strong",
          "group-focus-visible/checkbox:stroke-line-strong",
          "group-data-[checked]/checkbox:stroke-line-strong",
          "group-data-[indeterminate]/checkbox:stroke-line-strong",
          "group-hover/checkbox:group-data-[checked]/checkbox:stroke-line-strong",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:stroke-line-strong",
          "group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[checked]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-hover/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
        ],
        mark: ["text-foreground-strong group-data-[disabled]/checkbox:text-line"],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      color: "primary",
      class: {
        root: [
          "data-[checked]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.2),0_1px_1px_-0.5px_oklch(0.85_0.162_91.89_/_0.1),0_2px_2px_-1px_oklch(0.85_0.162_91.89_/_0.06),0_0_0_1px_oklch(0.83_0.14_91.89_/_0.7)]",
          "data-[indeterminate]:shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.2),0_1px_1px_-0.5px_oklch(0.85_0.162_91.89_/_0.1),0_2px_2px_-1px_oklch(0.85_0.162_91.89_/_0.06),0_0_0_1px_oklch(0.83_0.14_91.89_/_0.7)]",
          "data-[disabled]:shadow-[0_1px_1px_-1px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-subtle)]",
        ],
        outerRect: [
          "fill-layer-panel",
          "stroke-transparent",
          "stroke-[0.5px]",
          "group-hover/checkbox:fill-layer-muted",
          "group-hover/checkbox:stroke-line-strong",
          "group-focus-visible/checkbox:stroke-primary-400",
          "group-data-[checked]/checkbox:stroke-primary-400",
          "group-data-[indeterminate]/checkbox:stroke-primary-400",
          "group-hover/checkbox:group-data-[checked]/checkbox:stroke-primary-500",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:stroke-primary-500",
          "group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[checked]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-hover/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:group-data-[disabled]/checkbox:stroke-line-subtle",
        ],
        mark: ["text-primary-400 group-data-[disabled]/checkbox:text-line"],
      },
    },
  ],
  defaultVariants: {
    color: "default",
    size: "sm",
    variant: "soft",
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
  };
};

function ElegantCheckboxGraphic({ classNames }: ElegantCheckboxGraphicProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={classNames.graphic}
    >
      <rect width="16" height="16" rx="3" className={classNames.outerRect} />
    </svg>
  );
}

export type CheckboxProps = StyledProps<BaseCheckbox.Root.Props> &
  Omit<VariantProps<typeof checkbox>, "theme">;

export function Checkbox({
  size,
  color = "default",
  variant = "soft",
  className,
  ...props
}: CheckboxProps) {
  const theme = useTheme();
  const { root, indicator, graphic, outerRect, mark, checkMark, indeterminateMark } = checkbox({
    theme,
    size,
    color,
    variant,
  });

  if (theme === "elegant") {
    return (
      <BaseCheckbox.Root data-slot="checkbox" className={root({ className })} {...props}>
        <ElegantCheckboxGraphic
          classNames={{
            graphic: graphic(),
            outerRect: outerRect(),
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
                    className: state.checked && !state.indeterminate ? "opacity-100" : "",
                  }),
                })}
              />
              <CheckboxIndeterminateIcon
                className={mark({
                  className: indeterminateMark({
                    className: state.indeterminate ? "visible opacity-100" : "",
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
            fill="black"
          />
        )}
      />
    </BaseCheckbox.Root>
  );
}
