import { Meter as BaseMeter } from "@base-ui/react/meter";
import { createContext, useContext, useMemo } from "react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const meter = tv({
  slots: {
    root: [
      "group/meter grid w-full min-w-0 gap-1.5",
      "[--meter-indicator:var(--info)]",
      "[--meter-track:var(--fill-muted)]",
      "[--meter-track-edge:transparent]",
      "[--meter-value:var(--foreground-muted)]",
      "font-sans",
      "has-[>[data-slot=meter-ring]]:inline-flex has-[>[data-slot=meter-ring]]:w-auto has-[>[data-slot=meter-ring]]:items-center",
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
        root: ["[--meter-indicator:var(--warning)]", "[--meter-value:var(--warning-strong)]"],
      },
      empty: {
        root: [
          "[--meter-track:var(--warning-muted)]",
          "[--meter-track-edge:var(--warning)]",
          "[--meter-value:var(--warning-strong)]",
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

type MeterContextValue = { valueText: string; left: number; max: number };

const MeterContext = createContext<MeterContextValue>({ valueText: "", left: 0, max: 100 });

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
 * The info fill, like Progress, until `low` or less is left, then the warning
 * color; never danger, and no success color at full.
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
  const context = useMemo(() => ({ valueText, left, max }), [valueText, left, max]);

  return (
    <MeterContext.Provider value={context}>
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
    </MeterContext.Provider>
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

/** Shows the meter's `valueText`, at the end of `MeterHeader`, or beside a `MeterRing`. */
export function MeterValue({ className, ...props }: MeterValueProps) {
  const { value } = meter();
  const { valueText } = useContext(MeterContext);
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

/**
 * The ring's geometry by size: the box matches an icon (16, 20 or 24px) and
 * the band is an eighth of it (2, 2.5 or 3px). An icon at the centre is drawn
 * at 9, 11 or 14px, which leaves the band a clear gap (`meterRing`'s `centre`).
 */
const RING_SIZES = {
  sm: { box: 16, band: 2 },
  md: { box: 20, band: 2.5 },
  lg: { box: 24, band: 3 },
} as const;

const meterRing = tv({
  slots: {
    ring: ["relative inline-grid shrink-0 place-items-center"],
    shape: ["absolute inset-0 size-full -rotate-90"],
    track: ["fill-none stroke-(--meter-track)"],
    edge: ["fill-none stroke-(--meter-track-edge)"],
    indicator: [
      "fill-none stroke-(--meter-indicator)",
      "transition-[stroke-dasharray,stroke] duration-200 ease-out",
    ],
    centre: [
      "relative grid place-items-center",
      "text-foreground",
      "[&>img]:size-full [&>svg]:size-full",
    ],
  },
  variants: {
    size: {
      sm: { ring: "size-4", centre: "size-[9px]" },
      md: { ring: "size-5", centre: "size-[11px]" },
      lg: { ring: "size-6", centre: "size-3.5" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/** The 1px warning edge of a used-up track, as on the bar. */
const RING_EDGE = 1;

export type MeterRingSize = keyof typeof RING_SIZES;

export type MeterRingProps = ComponentPropsWithRef<"span"> & {
  /**
   * The ring's box, matched to an icon: `sm` 16px, `md` 20px, `lg` 24px.
   * @default "md"
   */
  size?: MeterRingSize;
};

/**
 * What is left, drawn as a ring in place of `MeterTrack` and `MeterIndicator`,
 * for meters side by side in a dense row. The arc runs clockwise from the top
 * and is a full circle to start; it shortens as the allowance is used. The
 * colors are the bar's. A child, such as an icon, sits at its centre.
 */
export function MeterRing({ size = "md", className, children, ...props }: MeterRingProps) {
  const { left, max } = useContext(MeterContext);
  const { box, band } = RING_SIZES[size];
  const { ring, shape, track, edge, indicator, centre: centreSlot } = meterRing({ size });
  const centre = box / 2;
  const radius = (box - band) / 2;
  const percent = max > 0 ? (left / max) * 100 : 0;

  return (
    <span data-slot="meter-ring" data-size={size} className={ring({ className })} {...props}>
      <svg
        aria-hidden
        data-slot="meter-ring-shape"
        viewBox={`0 0 ${box} ${box}`}
        className={shape()}
      >
        <circle
          data-slot="meter-ring-track"
          cx={centre}
          cy={centre}
          r={radius}
          strokeWidth={band}
          className={track()}
        />
        <circle
          cx={centre}
          cy={centre}
          r={centre - RING_EDGE / 2}
          strokeWidth={RING_EDGE}
          className={edge()}
        />
        <circle
          cx={centre}
          cy={centre}
          r={centre - band + RING_EDGE / 2}
          strokeWidth={RING_EDGE}
          className={edge()}
        />
        <circle
          data-slot="meter-ring-indicator"
          cx={centre}
          cy={centre}
          r={radius}
          strokeWidth={band}
          pathLength={100}
          strokeDasharray={`${percent} 100`}
          className={indicator()}
        />
      </svg>
      {children ? (
        <span data-slot="meter-ring-centre" className={centreSlot()}>
          {children}
        </span>
      ) : null}
    </span>
  );
}
