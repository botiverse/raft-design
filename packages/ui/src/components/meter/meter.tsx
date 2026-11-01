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
      "[--meter-indicator:var(--info)]",
      "[--meter-value:var(--foreground-muted)]",
      "font-sans",
    ],
    header: ["flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"],
    label: ["min-w-0 truncate", "text-footnote font-semibold text-foreground"],
    value: ["shrink-0 text-right tabular-nums", "text-footnote text-(--meter-value)"],
    track: [
      "relative w-full overflow-hidden bg-(--fill-muted)",
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
    warning: {
      true: {
        root: ["[--meter-indicator:var(--warning)]", "[--meter-value:var(--warning-strong)]"],
      },
    },
    size: {
      sm: {},
      md: {},
    },
  },
  defaultVariants: {
    warning: false,
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
     * `max`. The bar fills with it, and it is the meter's `aria-valuenow`.
     */
    used: number;
    /**
     * The whole allowance, in the same units as `used`.
     * @default 100
     */
    max?: number;
    /**
     * The share of `max` used, from 0 to 1, at which the meter takes the
     * warning color: at or above it. Clamped to 0 to 1.
     * @default 0.8
     */
    warnAt?: number;
    /**
     * What is used, in words, with the word: "62% used · resets in 3h".
     * `MeterValue` shows it, and it is the meter's `aria-valuetext`, so the
     * caller writes it once.
     */
    valueText: string;
  };

/**
 * How much of an allowance is used, such as a usage limit that resets. The bar
 * fills as it is used: the info fill, like Progress, until `warnAt` of `max`
 * is used (80% unless set), then the warning color, and a full warning bar
 * when used up; never danger, and no success color.
 */
export function Meter({
  size = "md",
  used,
  max = 100,
  warnAt,
  valueText,
  className,
  ...props
}: MeterProps) {
  const value = clamp(used, 0, max);
  const share = max > 0 ? value / max : 1;
  const warnFrom = warnAt !== undefined ? clamp(warnAt, 0, 1) : 0.8;
  const level = share >= 1 ? "full" : share >= warnFrom ? "high" : "normal";
  const { root } = meter({ size, warning: level !== "normal" });

  return (
    <MeterTextContext.Provider value={valueText}>
      <BaseMeter.Root
        data-slot="meter"
        data-size={size}
        data-level={level}
        min={0}
        max={max}
        value={value}
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
