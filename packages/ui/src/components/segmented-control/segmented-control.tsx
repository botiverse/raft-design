import type { ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Controlled single-select radio group rendered as a row of bordered segments.
// Kept as a hand-rolled `role="radiogroup"` (not base-ui) to preserve the
// original generic `value` / `options` / `onChange` API. The active segment's
// shadow-brutal-sm maps to the brutal --shadow token.
const segmentedControl = tv({
  slots: {
    root: ["inline-flex max-w-full flex-wrap items-center gap-1"],
    segment: [
      "flex h-7 min-w-0 shrink-0 items-center gap-1 px-2",
      "text-xs font-bold transition-colors",
    ],
    label: ["truncate"],
    count: ["font-mono text-[10px] leading-none"],
  },
  variants: {
    theme: {
      brutal: {
        segment: ["border-2 border-black"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    active: {
      true: {
        segment: "bg-brutal-yellow text-black shadow-[var(--shadow)]",
        count: "text-black/60",
      },
      false: {
        segment: "bg-white text-black",
        count: "text-black/40",
      },
    },
    disabled: {
      true: {
        root: "opacity-50",
        segment: "cursor-not-allowed",
      },
      false: {
        root: "",
        segment: "",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      active: false,
      disabled: false,
      class: { segment: "hover:bg-brutal-yellow/30" },
    },
  ],
  defaultVariants: {
    active: false,
    disabled: false,
  },
});

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
  testId?: string;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedControlOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const { root } = segmentedControl({ disabled });
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-slot="segmented-control"
      className={root({ className })}
    >
      {options.map((option) => {
        const active = option.value === value;
        const { segment, label, count } = segmentedControl({ theme, active, disabled });
        return (
          <BaseButton
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-testid={option.testId}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={segment()}
          >
            {option.icon}
            <span className={label()}>{option.label}</span>
            {typeof option.count === "number" && option.count > 0 ? (
              <span className={count()}>{option.count}</span>
            ) : null}
          </BaseButton>
        );
      })}
    </div>
  );
}
