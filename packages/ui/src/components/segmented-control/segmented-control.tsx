import type { ComponentPropsWithRef } from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { tv, type VariantProps } from "../../lib/tv.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useThemeFamily } from "../../lib/theme/use-theme.ts";

const segmentedControl = tv({
  slots: {
    root: ["inline-flex max-w-full flex-wrap items-center gap-1"],
    item: [
      "inline-flex min-w-0 shrink-0 items-center gap-1.5",
      "text-xs leading-none transition-colors",
      "outline-none disabled:pointer-events-none",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    ],
    label: ["truncate"],
    count: ["font-mono text-xs leading-none"],
  },
  variants: {
    theme: {
      brutal: {
        item: [
          "border-2 border-line-strong bg-layer-panel px-2 py-1.5 font-semibold text-foreground-strong",
          "has-[svg]:pl-1.5 has-[[data-slot=segmented-control-count]]:pr-1.5",
          "[&_svg]:stroke-[2.5]",
          "hover:bg-primary-400/30 data-[checked]:bg-primary-400 data-[checked]:text-foreground-strong",
          "data-[disabled]:cursor-not-allowed",
        ],
        count: [
          "font-bold text-foreground/65",
          "group-data-[checked]/segmented-control-item:text-foreground/70",
        ],
      },
      elegant: {
        root: ["gap-1.5"],
        item: [
          "rounded-sm bg-layer-panel px-2.5 py-2 font-medium text-foreground-strong antialiased",
          "has-[svg]:pl-2 has-[[data-slot=segmented-control-count]]:pr-2",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_1px_1.5px_-1px_oklch(0_0_0_/_0.035),0_0_0_1px_var(--line-subtle)]",
          "data-[unchecked]:hover:bg-[color-mix(in_oklch,var(--layer-muted)_55%,var(--layer-panel))]",
          "data-[checked]:bg-primary-400 data-[checked]:text-primary-950 data-[checked]:hover:bg-[oklch(0.86_0.15_91.89)]",
          "data-[checked]:shadow-[0_1px_1.5px_-1px_oklch(0.85_0.162_91.89_/_0.08),0_0_0_1px_oklch(0.83_0.14_91.89_/_0.68)]",
          "focus-visible:ring-2 focus-visible:ring-line-focus",
          "data-[disabled]:cursor-not-allowed",
        ],
        count: [
          "text-foreground-placeholder",
          "group-data-[checked]/segmented-control-item:text-primary-950/60",
        ],
      },
    },
    disabled: {
      true: {
        root: "opacity-50",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export type SegmentedControlProps<T extends string = string> = StyledProps<
  Omit<BaseRadioGroup.Props<T>, "aria-label">
> &
  Omit<VariantProps<typeof segmentedControl>, "theme"> & {
    ariaLabel?: string;
  };

export function SegmentedControl<T extends string = string>({
  ariaLabel,
  disabled = false,
  className,
  ...props
}: SegmentedControlProps<T>) {
  const theme = useThemeFamily();
  const { root } = segmentedControl({ disabled, theme });
  return (
    <BaseRadioGroup
      aria-label={ariaLabel}
      disabled={disabled}
      data-slot="segmented-control"
      className={root({ className })}
      {...props}
    />
  );
}

export type SegmentedControlItemProps<T extends string = string> = StyledProps<
  BaseRadio.Root.Props<T>
>;

export function SegmentedControlItem<T extends string = string>({
  className,
  ...props
}: SegmentedControlItemProps<T>) {
  const theme = useThemeFamily();
  const { item } = segmentedControl({ theme });
  return (
    <BaseRadio.Root
      render={<button type="button" />}
      nativeButton
      data-slot="segmented-control-item"
      className={item({
        className: `group/segmented-control-item ${className ?? ""}`.trim(),
      })}
      {...props}
    />
  );
}

export type SegmentedControlLabelProps = ComponentPropsWithRef<"span">;

export function SegmentedControlLabel({ className, ...props }: SegmentedControlLabelProps) {
  const { label } = segmentedControl();
  return <span data-slot="segmented-control-label" className={label({ className })} {...props} />;
}

export type SegmentedControlCountProps = ComponentPropsWithRef<"span">;

export function SegmentedControlCount({ className, ...props }: SegmentedControlCountProps) {
  const theme = useThemeFamily();
  const { count } = segmentedControl({ theme });
  return <span data-slot="segmented-control-count" className={count({ className })} {...props} />;
}
