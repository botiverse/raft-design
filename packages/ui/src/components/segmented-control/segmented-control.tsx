import { createContext, use, useCallback, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { TooltipProps } from "../tooltip/tooltip";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";

const segmentedControl = tv({
  slots: {
    root: [
      "inline-flex shrink-0 items-center", // The grey track hugs its segments (w-fit also stops a flex-column
      // parent from stretching it), so it never shows an empty run of track
      // beside them, and it never shrinks below them: the segments don't
      // shrink, so a squeezed track let them spill onto the next control. A
      // caller that wants it full width passes `w-full` and lets the segments
      // share it (`*:flex-1`).
      "w-fit flex-nowrap gap-[3px] rounded-[11px] bg-fill-muted p-[3px]",
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
          "**:data-[slot=segmented-control-item]:text-foreground-on-frame-muted",
          "**:data-[slot=segmented-control-item]:hover:bg-transparent **:data-[slot=segmented-control-item]:hover:overlay-frame-medium **:data-[slot=segmented-control-item]:active:bg-transparent **:data-[slot=segmented-control-item]:active:overlay-frame-medium",
          "**:data-[slot=segmented-control-item]:data-checked:bg-layer-canvas **:data-[slot=segmented-control-item]:data-checked:text-foreground",
          "**:data-[slot=segmented-control-item]:data-checked:hover:bg-layer-canvas **:data-[slot=segmented-control-item]:data-checked:hover:bg-none **:data-[slot=segmented-control-item]:data-checked:active:bg-layer-canvas",
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
  /** `on-frame` in the yellow frame; see `SegmentedControlNav`. */
  variant?: "default" | "on-frame";
};

export function SegmentedControl<T extends string = string>({
  disabled = false,
  iconsOnlyBelow,
  variant = "default",
  className,
  ...props
}: SegmentedControlProps<T>) {
  const { root } = segmentedControl({ iconsOnlyBelow, variant });
  return (
    <SegmentedControlIconsOnlyContext value={iconsOnlyBelow !== undefined}>
      <BaseRadioGroup
        disabled={disabled}
        data-slot="segmented-control"
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

export type SegmentedControlNavProps = ComponentPropsWithRef<"nav"> & {
  /**
   * `on-frame` in the yellow frame (a top bar): the track a deeper yellow and
   * the current segment white paper with its ink edge, since a yellow
   * sticker on yellow would not read as selected.
   */
  variant?: "default" | "on-frame";
};

/**
 * The same track for choices that are places, not values: each segment is a
 * link to another URL (a language, a version of the page), so it can be
 * opened in a new tab and copied. Name it with `aria-label`.
 */
export function SegmentedControlNav({
  variant = "default",
  className,
  ...props
}: SegmentedControlNavProps) {
  const { root } = segmentedControl({ variant });
  return <nav data-slot="segmented-control" className={root({ className })} {...props} />;
}

export type SegmentedControlLinkProps = useRender.ComponentProps<"a"> & {
  /** The segment for the page being shown: `aria-current="page"`, drawn as the selected segment. */
  current?: boolean;
};

/** One segment of a `SegmentedControlNav`: a link, `<a>` unless `render` gives a router link. */
export function SegmentedControlLink({
  current = false,
  className,
  render,
  ...props
}: SegmentedControlLinkProps) {
  const { item } = segmentedControl();
  return useRender({
    render: render ?? <a />,
    props: mergeProps<"a">(
      {
        "data-slot": "segmented-control-item",
        "aria-current": current ? "page" : undefined,
        // The selected look is keyed to Base UI's `data-checked`; a link has
        // no radio state, so the current page sets it.
        ...(current ? { "data-checked": "" } : {}),
        className: item({
          className: `group/segmented-control-item ${className ?? ""}`.trim(),
        }),
      } as ComponentPropsWithRef<"a">,
      props,
    ),
  });
}
