import { Meter as BaseMeter } from "@base-ui/react/meter";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const meter = tv({
  slots: {
    root: [
      "group/meter grid w-full min-w-0 gap-1.5",
      "[--meter-indicator:var(--ink-40)]",
      "[--meter-track:var(--fill-muted)]",
      "data-low:[--meter-indicator:var(--color-warning)]",
      "data-empty:[--meter-track:var(--color-warning-soft)]",
      "font-sans",
    ],
    header: ["flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"],
    label: ["min-w-0 truncate", "text-footnote font-semibold text-foreground"],
    value: [
      "shrink-0 text-right tabular-nums",
      "text-footnote text-foreground-muted",
      "group-data-low/meter:text-warning-strong",
    ],
    track: [
      "relative w-full overflow-hidden bg-(--meter-track)",
      "h-2 group-data-[size=sm]/meter:h-1.5",
      "rounded-sticker",
    ],
    indicator: [
      "block h-full bg-(--meter-indicator)",
      "transition-[width,background-color] duration-200 ease-out",
      "rounded-[inherit] inset-ring-[1.5px] inset-ring-sticker-ink",
    ],
  },
  variants: {
    size: {
      sm: {},
      md: {},
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type MeterProps = StyledProps<BaseMeter.Root.Props> &
  VariantProps<typeof meter> & {
    /**
     * At or below this value the meter is low and takes the warning color.
     * In the same units as `value`.
     * @default 20% of the range above `min`
     */
    low?: number;
  };

/**
 * How much of an allowance is left, such as a usage limit that resets. Pass
 * what is left as `value`: the bar starts full and drains. Neutral until the
 * value reaches `low`, then the warning color; never danger.
 */
export function Meter({
  size = "md",
  min = 0,
  max = 100,
  low,
  value,
  className,
  ...props
}: MeterProps) {
  const { root } = meter({ size });
  const lowAt = low ?? min + (max - min) * 0.2;
  const isEmpty = value <= min;
  const isLow = isEmpty || value <= lowAt;

  return (
    <BaseMeter.Root
      data-slot="meter"
      data-size={size}
      data-low={isLow ? "" : undefined}
      data-empty={isEmpty ? "" : undefined}
      min={min}
      max={max}
      value={value}
      className={root({ className })}
      {...props}
    />
  );
}

export type MeterHeaderProps = ComponentPropsWithRef<"div">;

export function MeterHeader({ className, ...props }: MeterHeaderProps) {
  const { header } = meter();
  return <div data-slot="meter-header" className={header({ className })} {...props} />;
}

export type MeterLabelProps = StyledProps<BaseMeter.Label.Props>;

export function MeterLabel({ className, ...props }: MeterLabelProps) {
  const { label } = meter();
  return <BaseMeter.Label data-slot="meter-label" className={label({ className })} {...props} />;
}

export type MeterValueProps = Omit<StyledProps<BaseMeter.Value.Props>, "children"> & {
  /**
   * The visible value, such as "38% left · resets in 3h". A function receives
   * the formatted value and the raw value. Without children it shows the
   * formatted value alone.
   */
  children?: ReactNode | ((formattedValue: string, value: number) => ReactNode);
};

export function MeterValue({ className, children, ...props }: MeterValueProps) {
  const { value } = meter();
  return (
    <BaseMeter.Value data-slot="meter-value" className={value({ className })} {...props}>
      {children === undefined || children === null
        ? undefined
        : typeof children === "function"
          ? children
          : () => children}
    </BaseMeter.Value>
  );
}

export type MeterTrackProps = StyledProps<BaseMeter.Track.Props>;

export function MeterTrack({ className, ...props }: MeterTrackProps) {
  const { track } = meter();
  return <BaseMeter.Track data-slot="meter-track" className={track({ className })} {...props} />;
}

export type MeterIndicatorProps = StyledProps<BaseMeter.Indicator.Props>;

export function MeterIndicator({ className, ...props }: MeterIndicatorProps) {
  const { indicator } = meter();
  return (
    <BaseMeter.Indicator
      data-slot="meter-indicator"
      className={indicator({ className })}
      {...props}
    />
  );
}
