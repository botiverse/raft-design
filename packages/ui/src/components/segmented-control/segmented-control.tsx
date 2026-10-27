import { createContext, use, useCallback, useLayoutEffect, useRef, useState } from "react";
import { useMergedRef } from "../../lib/use-merged-ref";
import { useTapActivation } from "../../lib/tap-activation";
import type { ComponentPropsWithRef, ReactElement, Ref } from "react";
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
      "data-checked:border-sticker-ink data-checked:bg-selected data-checked:font-bold data-checked:text-sticker-ink data-checked:ring-[1.5px] data-checked:ring-sticker-edge",
      "data-checked:hover:bg-selected data-checked:active:bg-selected data-checked:active:overlay-sticker-medium",
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
    iconsOnlyMeasured: {
      true: {
        root: [
          "data-icons-only:**:data-[slot=segmented-control-item]:relative data-icons-only:**:data-[slot=segmented-control-item]:w-8 data-icons-only:**:data-[slot=segmented-control-item]:px-0",
          "data-icons-only:**:data-[slot=segmented-control-label]:sr-only data-icons-only:**:data-[slot=segmented-control-count]:sr-only",
        ],
      },
    },
  },
});

/** Tailwind's container sizes, `@xs` (20rem) to `@2xl` (42rem). */
export type SegmentedControlIconsOnlyPreset = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * When the segments show only their icons: `auto` when their labels don't fit
 * the width the control is given, a container size preset, or a CSS length
 * (`px`, `rem` or `em`) the row is narrower than.
 */
export type SegmentedControlIconsOnlyBelow =
  | "auto"
  | SegmentedControlIconsOnlyPreset
  | `${number}px`
  | `${number}rem`
  | `${number}em`;

const ICONS_ONLY_PRESETS = new Set<string>(["xs", "sm", "md", "lg", "xl", "2xl"]);

function isIconsOnlyPreset(value: string | undefined): value is SegmentedControlIconsOnlyPreset {
  return value !== undefined && ICONS_ONLY_PRESETS.has(value);
}

const SegmentedControlIconsOnlyContext = createContext(false);

export type SegmentedControlProps<T extends string = string> = StyledProps<
  BaseRadioGroup.Props<T>
> & {
  /**
   * When every segment shows only its icon (give each one); its label stays
   * the accessible name and shows in a tooltip. `auto`: when the labelled
   * segments don't fit the width the control is given. A preset (`xs` to
   * `2xl`) or a CSS length (`"18.5rem"`, `"296px"`): when the nearest
   * `@container` ancestor (the row the control sits in) is narrower than it.
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
 * A length threshold in CSS pixels, or `undefined` for a value that isn't a
 * `px`, `rem` or `em` length. `em` is the container's font size, as in a
 * container query.
 */
function lengthToPx(value: string, container: Element): number | undefined {
  const match = /^(\d*\.?\d+)(px|rem|em)$/.exec(value.trim());
  if (!match) return undefined;
  const amount = Number(match[1]);
  if (match[2] === "px") return amount;
  const fontOf = match[2] === "rem" ? document.documentElement : container;
  return amount * parseFloat(getComputedStyle(fontOf).fontSize);
}

/** The nearest size container above the track, as a container query finds it; else its parent. */
function queryContainerOf(track: HTMLElement): HTMLElement | null {
  for (let el = track.parentElement; el; el = el.parentElement) {
    if (getComputedStyle(el).containerType !== "normal") return el;
  }
  return track.parentElement;
}

function contentInlineSize(el: HTMLElement): number {
  const style = getComputedStyle(el);
  return el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
}

/**
 * Whether the labelled segments fit the track's box: the segments, first to
 * last, and the track's padding take no more than its `clientWidth` (half a
 * pixel of rounding aside; `scrollWidth` would let the last segment eat into
 * the end padding first, and Base UI's visually hidden radio inputs must not
 * count), and no label is truncated (a track stretched with `*:flex-1`
 * shrinks its labels instead). Measured in the labelled layout
 * whatever the control shows now: the attribute comes off for the read and
 * goes back before anything paints. The track is `w-fit max-w-full min-w-0`,
 * so its box is the width it is given, a shrinking flex item's included,
 * never more than its labels need: the answer depends only on the room
 * around it, not on what it shows, and so can't flap at the boundary.
 */
function labelsFit(track: HTMLElement): boolean {
  const iconsOnly = track.hasAttribute("data-icons-only");
  if (iconsOnly) track.removeAttribute("data-icons-only");
  const segments = Array.from(
    track.querySelectorAll<HTMLElement>(":scope > [data-slot=segmented-control-item]"),
  );
  let fits = true;
  if (segments.length > 0) {
    const style = getComputedStyle(track);
    const needed =
      segments[segments.length - 1]!.getBoundingClientRect().right -
      segments[0]!.getBoundingClientRect().left +
      parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight);
    fits = needed - track.clientWidth <= 0.5;
  }
  if (fits) {
    for (const label of Array.from(
      track.querySelectorAll<HTMLElement>("[data-slot=segmented-control-label]"),
    )) {
      if (label.scrollWidth - label.clientWidth > 1) {
        fits = false;
        break;
      }
    }
  }
  if (iconsOnly) track.setAttribute("data-icons-only", "");
  return fits;
}

/**
 * Lays the track out and reports whether its segments run past its box. The
 * track comes from a callback ref, so a swapped element is measured too.
 *
 * With `iconsOnlyBelow="auto"` or a length, it decides here whether the
 * segments show only their icons, and sets `data-icons-only` on the track
 * (the presets are container queries in CSS and need nothing here). The
 * decision is taken synchronously, in the layout effect and in the observers'
 * callbacks, so the first frame and every resize paint the right layout.
 * Taken again when the track, a segment, the element it is measured against
 * (the parent for `auto`, the container for a length) or one of that
 * element's children resizes or comes and goes, a label, a count or the
 * selection changes, or a web font arrives.
 *
 * The overflow is the track's own `scrollWidth` against its `clientWidth`
 * after that decision, measured in the next frame.
 */
function useTrackFit(
  track: HTMLElement | null,
  iconsOnlyBelow: SegmentedControlIconsOnlyBelow | undefined,
): boolean {
  const [overflowing, setOverflowing] = useState(false);
  const measured = iconsOnlyBelow !== undefined && !isIconsOnlyPreset(iconsOnlyBelow);
  useLayoutEffect(() => {
    if (!track || typeof ResizeObserver === "undefined") return undefined;
    const reference = !measured
      ? null
      : iconsOnlyBelow === "auto"
        ? track.parentElement
        : queryContainerOf(track);
    if (
      measured &&
      iconsOnlyBelow !== "auto" &&
      reference &&
      lengthToPx(iconsOnlyBelow, reference) === undefined &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        `raft-ui: SegmentedControl iconsOnlyBelow="${iconsOnlyBelow}" is not a preset, "auto" or a px, rem or em length; the segments keep their labels.`,
      );
    }
    const fitIcons = () => {
      if (!measured) return;
      let iconsOnly = false;
      if (iconsOnlyBelow === "auto") iconsOnly = !labelsFit(track);
      else if (reference) {
        const threshold = lengthToPx(iconsOnlyBelow, reference);
        iconsOnly = threshold !== undefined && contentInlineSize(reference) < threshold;
      }
      if (iconsOnly !== track.hasAttribute("data-icons-only")) {
        track.toggleAttribute("data-icons-only", iconsOnly);
      }
    };
    let frame = 0;
    const measure = () => {
      frame = 0;
      setOverflowing(track.scrollWidth - track.clientWidth > 1);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };
    const update = () => {
      fitIcons();
      schedule();
    };
    const resize = new ResizeObserver(update);
    const observeAll = () => {
      resize.disconnect();
      resize.observe(track);
      for (const child of Array.from(track.children)) resize.observe(child);
      if (reference) {
        resize.observe(reference);
        for (const child of Array.from(reference.children)) resize.observe(child);
      }
    };
    observeAll();
    const mutation = new MutationObserver(() => {
      observeAll();
      update();
    });
    mutation.observe(track, {
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ["data-checked"],
    });
    if (reference) mutation.observe(reference, { childList: true });
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.addEventListener("loadingdone", update);
    fitIcons();
    measure();
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      fonts?.removeEventListener("loadingdone", update);
      track.removeAttribute("data-icons-only");
    };
  }, [track, measured, iconsOnlyBelow]);
  return overflowing;
}

/** In development, warns when segments that may show only their icons have none. */
function useIconsOnlyWarning(
  ref: { current: HTMLElement | null },
  iconsOnlyBelow: SegmentedControlIconsOnlyBelow | undefined,
) {
  useLayoutEffect(() => {
    if (process.env.NODE_ENV === "production" || iconsOnlyBelow === undefined) return;
    const items = ref.current?.querySelectorAll("[data-slot=segmented-control-item]") ?? [];
    for (const item of Array.from(items)) {
      if (!item.querySelector("svg, img")) {
        console.warn(
          "raft-ui: a SegmentedControl with iconsOnlyBelow has a segment with no icon; it would be left empty when the segments show only their icons. Give every segment an icon.",
        );
        return;
      }
    }
  }, [ref, iconsOnlyBelow]);
}

export function SegmentedControl<T extends string = string>({
  disabled = false,
  iconsOnlyBelow,
  variant = "default",
  className,
  ref,
  ...props
}: SegmentedControlProps<T>) {
  const preset = isIconsOnlyPreset(iconsOnlyBelow);
  const { root } = segmentedControl({
    iconsOnlyBelow: preset ? iconsOnlyBelow : undefined,
    iconsOnlyMeasured: iconsOnlyBelow !== undefined && !preset ? true : undefined,
    variant,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  const [setRef] = useMergedRef<HTMLDivElement>(rootRef, setTrack, ref);
  const overflowing = useTrackFit(track, iconsOnlyBelow);
  useIconsOnlyWarning(rootRef, iconsOnlyBelow);
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
  ref,
  ...props
}: SegmentedControlItemProps<T>) {
  const { item } = segmentedControl();
  const iconsOnly = use(SegmentedControlIconsOnlyContext);
  // Switches when the finger lifts (design/patterns/navigation.md#switching-on-finger-lift).
  const tapRef = useTapActivation<HTMLElement>();
  const [setRef] = useMergedRef<HTMLElement>(tapRef, ref as Ref<HTMLElement> | undefined);
  const radio = (
    <BaseRadio.Root
      ref={setRef}
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
