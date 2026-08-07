import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { tv } from "../../lib/tv";
import { cn } from "../../lib/cn";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const radioGroup = tv({
  slots: {
    root: [
      "grid w-full gap-2",
      "data-[disabled]:[&>label]:cursor-not-allowed data-[disabled]:[&>label]:text-foreground-disabled",
      "data-[disabled]:[&>label_*]:text-foreground-disabled",
    ],
    item: [
      "relative inline-flex shrink-0 touch-manipulation items-center justify-center rounded-full outline-none",
      "data-[disabled]:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
    ],
    indicator: ["pointer-events-none flex size-full items-center justify-center"],
    dot: ["block rounded-full bg-current"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["font-sans [&>label]:font-medium"],
        item: [
          "size-4 border-2 border-line-strong bg-layer-panel text-foreground",
          "hover:bg-primary-400/30 data-[checked]:bg-primary-400",
          "data-[disabled]:border-line-hairline data-[disabled]:bg-fill-muted data-[disabled]:text-line data-[disabled]:hover:bg-fill-muted",
          "data-[checked]:data-[disabled]:bg-fill-muted",
          "focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted",
        ],
        dot: "size-1.5",
      },
      elegant: {
        root: "gap-2.5",
        item: [
          "size-3.5 bg-layer-panel text-foreground-inverse",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.035),0_0_0_1px_var(--line-muted)]",
          "dark:not-data-[checked]:not-data-[disabled]:bg-layer-inset",
          "dark:not-data-[checked]:not-data-[disabled]:shadow-[inset_0_1px_1.5px_oklch(0_0_0_/_0.3),0_0_0_1px_oklch(0_0_0_/_0.4),0_1px_0_oklch(0.985_0.004_106.42_/_0.04)]",
          "hover:bg-ink-4 data-[checked]:bg-primary-400 data-[checked]:text-primary-950 dark:data-[checked]:text-foreground-inverse",
          "data-[checked]:shadow-[0_1px_1.5px_-1px_oklch(0_0_0_/_0.08),0_0_0_0.5px_color-mix(in_srgb,var(--primary-500)_35%,transparent)]",
          "dark:data-[checked]:shadow-[0_1px_1.5px_-1px_oklch(0_0_0_/_0.4),0_0_0_0.5px_color-mix(in_srgb,var(--primary-500)_35%,transparent)]",
          "data-[disabled]:bg-fill-muted data-[disabled]:text-line data-[disabled]:shadow-[0_1px_1px_-1px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-muted)] data-[disabled]:hover:bg-fill-muted",
          "data-[checked]:data-[disabled]:bg-fill-muted data-[checked]:data-[disabled]:text-line data-[checked]:data-[disabled]:shadow-[0_1px_1px_-1px_oklch(0_0_0_/_0.02),0_0_0_1px_var(--line-muted)]",
          "active:scale-[0.96] data-[disabled]:active:scale-100 motion-reduce:active:scale-100",
          "focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted",
        ],
        dot: "size-1.5",
      },
    },
  },
});

export type RadioGroupProps<T extends string = string> = StyledProps<
  Omit<BaseRadioGroup.Props<T>, "aria-label">
> & {
  ariaLabel?: string;
};

export function RadioGroup<T extends string = string>({
  ariaLabel,
  className,
  ...props
}: RadioGroupProps<T>) {
  const theme = useThemeFamily();
  const { root } = radioGroup({ theme });

  return (
    <BaseRadioGroup
      aria-label={ariaLabel}
      data-slot="radio-group"
      className={root({ className })}
      {...props}
    />
  );
}

export type RadioGroupIndicatorProps = StyledProps<BaseRadio.Indicator.Props>;

export function RadioGroupIndicator({ className, children, ...props }: RadioGroupIndicatorProps) {
  const theme = useThemeFamily();
  const { indicator, dot } = radioGroup({ theme });

  return (
    <BaseRadio.Indicator
      data-slot="radio-group-indicator"
      className={indicator({ className })}
      {...props}
    >
      {children ?? <span data-slot="radio-group-dot" className={dot()} />}
    </BaseRadio.Indicator>
  );
}

export type RadioGroupItemProps<T extends string = string> = StyledProps<
  BaseRadio.Root.Props<T>
> & {
  appearance?: "default" | "none";
};

export function RadioGroupItem<T extends string = string>({
  appearance = "default",
  className,
  children,
  ...props
}: RadioGroupItemProps<T>) {
  const theme = useThemeFamily();
  const { item } = radioGroup({ theme });
  const itemClassName =
    appearance === "none"
      ? cn("sr-only", "data-[disabled]:cursor-not-allowed", className)
      : item({ className });

  return (
    <BaseRadio.Root data-slot="radio-group-item" className={itemClassName} {...props}>
      {children ?? (appearance === "default" ? <RadioGroupIndicator /> : null)}
    </BaseRadio.Root>
  );
}
