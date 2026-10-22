import { createContext, use, useCallback, useLayoutEffect, useRef, useState } from "react";
import { useMergedRef } from "../../lib/use-merged-ref";
import type { ComponentPropsWithRef, ReactElement } from "react";
import type { TooltipProps } from "../tooltip/tooltip";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";

const segmentedControl = tv({
  slots: {
    root: [
      "inline-flex min-w-0 items-center", // The grey track hugs its segments (w-fit also stops a flex-column
      // parent from stretching it), so it never shows an empty run of track
      // beside them. The segments don't shrink. When the row is narrower
      // than the track and its neighbors have given way, the track may
      // shrink to the row (max-w-full) and its segments scroll sideways
      // inside it (data-overflowing), instead of spilling onto the next
      // control: the last way a control gives way when it can't show only
      // its icons (design/patterns/responsive.md#when-a-row-runs-out-of-room).
      // The overflow is set only while it overflows, since it clips the
      // focus ring 1px past the track. A caller that wants it full width
      // passes `w-full` and lets the segments share it (`*:flex-1`).
      "w-fit max-w-full flex-nowrap gap-[3px] rounded-[11px] bg-fill-muted p-[3px]",
      "data-overflowing:overflow-x-auto data-overflowing:overscroll-x-contain data-overflowing:scrollbar-none",
    ],
    item: [
      "inline-flex min-w-0 shrink-0 items-center gap-1.5",
      "outline-none disabled:pointer-events-none",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "h-8 justify-center rounded-control border-[1.5px] border-transparent bg-transparent px-3",
      "font-sans text-callout font-semibold text-foreground-muted",
      "[&_svg:not([class*='size-'])]:size-4",
      "hover:bg-fill-medium active:bg-fill-medium",
      "data-checked:border-sticker-ink data-checked:bg-brand data-checked:font-bold data-checked:text-sticker-ink data-checked:ring-[1.5px] data-checked:ring-sticker-edge",
      "data-checked:hover:bg-brand data-checked:active:bg-brand data-checked:active:overlay-sticker-medium",
      "focus-visible:shadow-focus",
      "data-disabled:cursor-not-allowed data-disabled:text-foreground-disabled data-disabled:hover:bg-transparent",
    ],
    label: ["truncate"],
    count: ["font-mono", "text-mono-meta font-normal"],
  },
  variants: {
    variant: {
      default: {},
      "on-frame": {
        root: [
          "bg-fill-frame-medium",
          "**:data-[slot=segmented-control-item]:text-foreground-on-frame-muted **:data-[slot=segmented-control-item]:hover:text-foreground-on-frame",
          "**:data-[slot=segmented-control-item]:hover:bg-transparent **:data-[slot=segmented-control-item]:hover:overlay-frame-medium **:data-[slot=segmented-control-item]:active:bg-transparent **:data-[slot=segmented-control-item]:active:overlay-frame-medium",
          "**:data-[slot=segmented-control-item]:data-checked:border-line-frame-active **:data-[slot=segmented-control-item]:data-checked:bg-layer-frame-active **:data-[slot=segmented-control-item]:data-checked:text-foreground-on-frame-active",
          "**:data-[slot=segmented-control-item]:data-checked:hover:bg-layer-frame-active **:data-[slot=segmented-control-item]:data-checked:hover:bg-none **:data-[slot=segmented-control-item]:data-checked:active:bg-layer-frame-active",
        ],
      },
    },
    iconsOnlyBelow: {
      xs: {
        root: [
          "@max-xs:**:data-[slot=segmented-control-item]:relative @max-xs:**:data-[slot=segmented-control-item]:w-8 @max-xs:**:data-[slot=segmented-control-item]:px-0",
          "@max-xs:**:data-[slot=segmented-control-label]:sr-only @max-xs:**:data-[slot=segmented-control-count]:sr-only",
        ],
      },
      sm: {
        root: [
          "@max-sm:**:data-[slot=segmented-control-item]:relative @max-sm:**:data-[slot=segmented-control-item]:w-8 @max-sm:**:data-[slot=segmented-control-item]:px-0",
          "@max-sm:**:data-[slot=segmented-control-label]:sr-only @max-sm:**:data-[slot=segmented-control-count]:sr-only",
        ],
      },
      md: {
        root: [
          "@max-md:**:data-[slot=segmented-control-item]:relative @max-md:**:data-[slot=segmented-control-item]:w-8 @max-md:**:data-[slot=segmented-control-item]:px-0",
          "@max-md:**:data-[slot=segmented-control-label]:sr-only @max-md:**:data-[slot=segmented-control-count]:sr-only",
        ],
      },
      lg: {
        root: [
          "@max-lg:**:data-[slot=segmented-control-item]:relative @max-lg:**:data-[slot=segmented-control-item]:w-8 @max-lg:**:data-[slot=segmented-control-item]:px-0",
          "@max-lg:**:data-[slot=segmented-control-label]:sr-only @max-lg:**:data-[slot=segmented-control-count]:sr-only",
        ],
      },
      xl: {
        root: [
          "@max-xl:**:data-[slot=segmented-control-item]:relative @max-xl:**:data-[slot=segmented-control-item]:w-8 @max-xl:**:data-[slot=segmented-control-item]:px-0",
          "@max-xl:**:data-[slot=segmented-control-label]:sr-only @max-xl:**:data-[slot=segmented-control-count]:sr-only",
        ],
      },
      "2xl": {
        root: [
          "@max-2xl:**:data-[slot=segmented-control-item]:relative @max-2xl:**:data-[slot=segmented-control-item]:w-8 @max-2xl:**:data-[slot=segmented-control-item]:px-0",
          "@max-2xl:**:data-[slot=segmented-control-label]:sr-only @max-2xl:**:data-[slot=segmented-control-count]:sr-only",
        ],
      },
    },
  },
});

/**
 * Container widths (Tailwind's `@xs` 20rem to `@2xl` 42rem) below which the
 * segments show only their icons.
 */
export type SegmentedControlIconsOnlyBelow = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SegmentedControlIconsOnlyContext = createContext(false);

export type SegmentedControlProps<T extends string = string> = StyledProps<
  BaseRadioGroup.Props<T>
> & {
  /**
   * When the nearest `@container` ancestor (the row the control sits in) is
   * narrower than this width, every segment shows only its icon (give each
   * one). Its label stays the accessible name and shows in a tooltip.
   */
  iconsOnlyBelow?: SegmentedControlIconsOnlyBelow;
  /**
   * `on-frame` in the frame (a top bar): the track the frame's medium fill and
   * the selected segment in the frame's active colours (white on the yellow
   * frame, yellow on the dark one), since a yellow sticker on yellow would
   * not read as selected.
   */
  variant?: "default" | "on-frame";
};

/**
 * Whether the track's segments run past its box: the track's own
 * `scrollWidth` against its `clientWidth`, so only what lays out inside it
 * counts (Base UI's visually hidden radio inputs sit outside the track's box
 * and must not). Measured again when the track or a segment resizes, a label
 * changes or a web font arrives. A pixel of rounding is not an overflow.
 */
function useTrackOverflows(ref: { current: HTMLElement | null }): boolean {
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    const track = ref.current;
    if (!track || typeof ResizeObserver === "undefined") return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setOverflowing(track.scrollWidth - track.clientWidth > 1);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    const observeSegments = () => {
      resize.disconnect();
      resize.observe(track);
      for (const child of Array.from(track.children)) resize.observe(child);
    };
    observeSegments();
    const mutation = new MutationObserver(() => {
      observeSegments();
      schedule();
    });
    mutation.observe(track, { childList: true, subtree: true, characterData: true });
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.addEventListener("loadingdone", schedule);
    measure();
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [ref]);
  return overflowing;
}

export function SegmentedControl<T extends string = string>({
  disabled = false,
  iconsOnlyBelow,
  variant = "default",
  className,
  ref,
  ...props
}: SegmentedControlProps<T>) {
  const { root } = segmentedControl({ iconsOnlyBelow, variant });
  const rootRef = useRef<HTMLDivElement>(null);
  const [setRef] = useMergedRef<HTMLDivElement>(rootRef, ref);
  const overflowing = useTrackOverflows(rootRef);
  // Keep the checked segment in view when the track scrolls.
  const value = props.value;
  useLayoutEffect(() => {
    const track = rootRef.current;
    if (!overflowing || !track) return;
    const checked = track.querySelector<HTMLElement>("[data-checked]");
    if (!checked) return;
    const trackLeft = track.getBoundingClientRect().left;
    const box = checked.getBoundingClientRect();
    const start = box.left - trackLeft + track.scrollLeft;
    const end = start + box.width;
    if (start < track.scrollLeft) track.scrollLeft = start;
    else if (end > track.scrollLeft + track.clientWidth) track.scrollLeft = end - track.clientWidth;
  }, [overflowing, value]);
  return (
    <SegmentedControlIconsOnlyContext value={iconsOnlyBelow !== undefined}>
      <BaseRadioGroup
        ref={setRef}
        disabled={disabled}
        data-slot="segmented-control"
        data-overflowing={overflowing ? "" : undefined}
        className={root({ className })}
        {...props}
      />
    </SegmentedControlIconsOnlyContext>
  );
}

export type SegmentedControlItemProps<T extends string = string> = StyledProps<
  BaseRadio.Root.Props<T>
>;

export function SegmentedControlItem<T extends string = string>({
  className,
  ...props
}: SegmentedControlItemProps<T>) {
  const { item } = segmentedControl();
  const iconsOnly = use(SegmentedControlIconsOnlyContext);
  const radio = (
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
  return iconsOnly ? <SegmentedControlItemTooltip>{radio}</SegmentedControlItemTooltip> : radio;
}

function SegmentedControlItemTooltip({ children }: { children: ReactElement }) {
  const [text, setText] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const handleOpenChange = useCallback<NonNullable<TooltipProps["onOpenChange"]>>(
    (open, details) => {
      if (!open) return;
      const label = triggerRef.current?.querySelector("[data-slot=segmented-control-label]");
      // The tooltip only names a segment whose label is collapsed: a visible
      // label is never repeated in a tooltip.
      if (!label || label.getBoundingClientRect().width > 1) {
        details.cancel();
        return;
      }
      setText(label.textContent ?? "");
    },
    [],
  );
  return (
    <Tooltip onOpenChange={handleOpenChange}>
      <TooltipTrigger ref={triggerRef} render={children} />
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

export type SegmentedControlLabelProps = ComponentPropsWithRef<"span">;

export function SegmentedControlLabel({ className, ...props }: SegmentedControlLabelProps) {
  const { label } = segmentedControl();
  return <span data-slot="segmented-control-label" className={label({ className })} {...props} />;
}

export type SegmentedControlCountProps = ComponentPropsWithRef<"span">;

export function SegmentedControlCount({ className, ...props }: SegmentedControlCountProps) {
  const { count } = segmentedControl();
  return <span data-slot="segmented-control-count" className={count({ className })} {...props} />;
}
