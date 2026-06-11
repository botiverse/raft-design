import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { tv, type VariantProps } from "tailwind-variants";
import { CheckIndicator } from "../check-indicator/check-indicator.tsx";
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
        root: ["group/checkbox focus:outline-none"],
        graphic: ["absolute inset-0"],
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
      class: { root: "size-5" },
    },
    {
      theme: "elegant",
      variant: "soft",
      color: "default",
      class: {
        outerRect: [
          "fill-layer-muted",
          "group-hover/checkbox:fill-secondary-200",
          "group-focus-visible/checkbox:fill-primary-950",
          "group-hover/checkbox:group-data-[checked]/checkbox:fill-primary-900",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:fill-primary-900",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:fill-primary-950",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:fill-primary-950",
          "group-data-[checked]/checkbox:fill-primary-950",
          "group-data-[indeterminate]/checkbox:fill-primary-950",
          "group-data-[disabled]/checkbox:fill-layer-muted",
        ],
        mark: ["text-foreground-inverse"],
      },
    },
    {
      theme: "elegant",
      variant: "soft",
      color: "primary",
      class: {
        outerRect: [
          "fill-layer-muted",
          "group-hover/checkbox:fill-secondary-200",
          "group-focus-visible/checkbox:fill-primary-400",
          "group-hover/checkbox:group-data-[checked]/checkbox:fill-primary-500",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:fill-primary-500",
          "group-focus-visible/checkbox:group-data-[checked]/checkbox:fill-primary-400",
          "group-focus-visible/checkbox:group-data-[indeterminate]/checkbox:fill-primary-400",
          "group-data-[checked]/checkbox:fill-primary-400",
          "group-data-[indeterminate]/checkbox:fill-primary-400",
          "group-data-[disabled]/checkbox:fill-layer-muted",
        ],
        mark: ["text-primary-950"],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      color: "default",
      class: {
        outerRect: [
          "fill-transparent",
          "stroke-line",
          "stroke-[0.5px]",
          "group-hover/checkbox:stroke-line-strong",
          "group-focus-visible/checkbox:stroke-primary-950",
          "group-data-[checked]/checkbox:stroke-primary-950",
          "group-data-[indeterminate]/checkbox:stroke-primary-950",
          "group-hover/checkbox:group-data-[checked]/checkbox:stroke-primary-900",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:stroke-primary-900",
          "group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[disabled]/checkbox:stroke-line-subtle",
        ],
        mark: ["text-primary-950"],
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      color: "primary",
      class: {
        outerRect: [
          "fill-transparent",
          "stroke-line",
          "stroke-[0.5px]",
          "group-hover/checkbox:stroke-line-strong",
          "group-focus-visible/checkbox:stroke-primary-400",
          "group-data-[checked]/checkbox:stroke-primary-400",
          "group-data-[indeterminate]/checkbox:stroke-primary-400",
          "group-hover/checkbox:group-data-[checked]/checkbox:stroke-primary-500",
          "group-hover/checkbox:group-data-[indeterminate]/checkbox:stroke-primary-500",
          "group-data-[disabled]/checkbox:fill-layer-muted",
          "group-data-[disabled]/checkbox:stroke-line-subtle",
        ],
        mark: ["text-primary-400"],
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
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={classNames.graphic}
    >
      <rect x="2" y="2" width="16" height="16" rx="4" className={classNames.outerRect} />
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
          <CheckIndicator
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
