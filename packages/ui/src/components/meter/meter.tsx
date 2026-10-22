import { Meter as BaseMeter } from "@base-ui/react/meter";
import { createContext, useContext } from "react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const meter = tv({
  slots: {
    root: [
      "group/meter grid w-full min-w-0 gap-1.5",
      "[--meter-indicator:var(--ink-40)]",
      "[--meter-track:var(--fill-muted)]",
      "[--meter-track-edge:transparent]",
      "[--meter-value:var(--foreground-muted)]",
      "font-sans",
    ],
    header: ["flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"],
    label: ["min-w-0 truncate", "text-footnote font-semibold text-foreground"],
    value: ["shrink-0 text-right tabular-nums", "text-footnote text-(--meter-value)"],
    track: [
      "relative w-full overflow-hidden bg-(--meter-track)",
      "inset-ring-1 inset-ring-(--meter-track-edge)",
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
    level: {
      plenty: {},
      low: {
        root: [
          "[--meter-indicator:var(--color-warning)]",
          "[--meter-value:var(--color-warning-strong)]",
        ],
      },
      empty: {
        root: [
          "[--meter-track:var(--color-warning-muted)]",
          "[--meter-track-edge:var(--color-warning)]",
          "[--meter-value:var(--color-warning-strong)]",
        ],
      },
    },
    size: {
      sm: {},
      md: {},
    },
  },
  defaultVariants: {
    level: "plenty",
    size: "md",
  },
});

const MeterTextContext = createContext<string>("");

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isNaN(value) ? min : value));
}

export type MeterProps = Omit<
  StyledProps<BaseMeter.Root.Props>,
  "value" | "min" | "max" | "aria-valuetext" | "getAriaValueText" | "format" | "locale"
> &
  Pick<VariantProps<typeof meter>, "size"> & {
    /**
     * How much of the allowance is used, as the provider reports it, from 0 to
     * `max`. The meter draws and announces what is left: `max - used`.
     */
    used: number;
    /**
     * The whole allowance, in the same units as `used`.
     * @default 100
     */
    max?: number;
    /**
     * When as much as this is left, or less, the meter is low and takes the
     * warning color ("at or below", unlike HTML's `<meter low>`, which is
     * strictly below). In the units of `max`, clamped to 0 to `max`.
     * @default 20% of `max`
     */
    low?: number;
    /**
     * What is left, in words: "38% left · resets in 3h". `MeterValue` shows it,
     * and it is the meter's `aria-valuetext`, so the caller writes it once.
     */
    valueText: string;
  };

/**
 * How much of an allowance is left, such as a usage limit that resets. Takes
 * what is `used`; the bar shows what is left, full to start and draining.
 * Neutral until `low` or less is left, then the warning color; never danger.
 */
export function Meter({
  size = "md",
  used,
  max = 100,
  low,
  valueText,
  className,
  ...props
}: MeterProps) {
  const left = max - clamp(used, 0, max);
  const lowAt = clamp(low ?? max * 0.2, 0, max);
  const level = left <= 0 ? "empty" : left <= lowAt ? "low" : "plenty";
  const { root } = meter({ size, level });

  return (
    <MeterTextContext.Provider value={valueText}>
      <BaseMeter.Root
        data-slot="meter"
        data-size={size}
        data-level={level}
        min={0}
        max={max}
        value={left}
        aria-valuetext={valueText}
        className={root({ className })}
        {...props}
      />
    </MeterTextContext.Provider>
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

export type MeterValueProps = Omit<StyledProps<BaseMeter.Value.Props>, "children">;

/** Shows the meter's `valueText`, at the end of `MeterHeader`. */
export function MeterValue({ className, ...props }: MeterValueProps) {
  const { value } = meter();
  const valueText = useContext(MeterTextContext);
  return (
    <BaseMeter.Value data-slot="meter-value" className={value({ className })} {...props}>
      {() => valueText}
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
