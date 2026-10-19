import type { ComponentPropsWithRef } from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const segmentedControl = tv({
  slots: {
    root: [
      "inline-flex shrink-0 items-center", // The grey track hugs its segments (w-fit also stops a flex-column
      // parent from stretching it), so it never shows an empty run of track
      // beside them, and it never shrinks below them: the segments don't
      // shrink, so a squeezed track let them spill onto the next control. A
      // caller that wants it full width passes `w-full` and lets the segments
      // share it (`*:flex-1`).
      "w-fit flex-nowrap gap-0.5 rounded-[11px] bg-fill-muted p-[3px]",
    ],
    item: [
      "inline-flex min-w-0 shrink-0 items-center gap-1.5",
      "outline-none disabled:pointer-events-none",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "h-8 justify-center rounded-control border-[1.5px] border-transparent bg-transparent px-3",
      "font-sans text-callout font-semibold text-foreground-muted",
      "[&_svg:not([class*='size-'])]:size-4",
      "hover:bg-fill-pressed",
      "data-checked:border-sticker-ink data-checked:bg-brand data-checked:font-bold data-checked:text-sticker-ink data-checked:ring-[1.5px] data-checked:ring-sticker-edge",
      "data-checked:hover:bg-brand data-checked:hover:press-overlay-sticker data-checked:active:press-overlay-sticker",
      "focus-visible:shadow-focus",
      "data-disabled:cursor-not-allowed data-disabled:text-foreground-disabled data-disabled:hover:bg-transparent",
    ],
    label: ["truncate"],
    count: ["font-mono", "text-mono-meta font-normal"],
  },
});

export type SegmentedControlProps<T extends string = string> = StyledProps<BaseRadioGroup.Props<T>>;

export function SegmentedControl<T extends string = string>({
  disabled = false,
  className,
  ...props
}: SegmentedControlProps<T>) {
  const { root } = segmentedControl();
  return (
    <BaseRadioGroup
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
  const { item } = segmentedControl();
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
  const { count } = segmentedControl();
  return <span data-slot="segmented-control-count" className={count({ className })} {...props} />;
}
