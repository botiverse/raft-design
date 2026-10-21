import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const descriptionList = tv({
  slots: {
    root: ["m-0"],
    item: ["", "[&+&]:pt-2"],
    term: [
      "flex items-center",
      "*:data-[slot=button]:ml-[-5px]",
      "mb-0 gap-1.5",
      "font-sans text-footnote font-medium text-foreground-hint",
    ],
    details: [
      "m-0",
      "flex min-h-7 min-w-0 flex-wrap items-center gap-1.5",
      "font-sans text-callout text-foreground",
    ],
  },
  variants: {
    direction: {
      vertical: {},
      horizontal: {
        root: [
          "grid items-baseline",
          "max-sm:grid-cols-1 max-sm:gap-y-0.5",
          "*:data-[slot=description-item]:contents",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:mb-0",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:max-w-40",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:min-w-0",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:wrap-break-word",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:min-w-0",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:wrap-break-word",
          "grid-cols-[minmax(88px,max-content)_minmax(0,1fr)] gap-x-4 gap-y-0.5",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:min-h-8",
        ],
      },
      inline: {
        root: [
          "flex flex-wrap items-baseline gap-x-6 gap-y-2",
          "*:data-[slot=description-item]:flex *:data-[slot=description-item]:min-w-0 *:data-[slot=description-item]:items-baseline *:data-[slot=description-item]:gap-3",
          "[&>[data-slot=description-item]+[data-slot=description-item]]:pt-0",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:shrink-0",
          // A value lays its own parts on the label's baseline too, so a value
          // that leads with an avatar or an icon (the assignee, a task's
          // source) takes its baseline from its text, not from the bottom
          // edge of the avatar, which is the baseline a box with no text
          // gets. The avatar and the icon centre on the text's line. The
          // 28px floor moves to the item, so the value's line box is the
          // text's and centring on it is optical centring (alignment.md).
          "*:data-[slot=description-item]:min-h-7",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:min-h-0",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:items-baseline",
          "[&>[data-slot=description-item]>[data-slot=description-details]>:is([data-slot=avatar],svg)]:self-center",
          "[&>[data-slot=description-item]>[data-slot=description-details]>:is([data-slot=badge],[data-slot=task-chip],[data-slot=task-status-badge]):first-child]:-ml-1.5",
          "[&>[data-slot=description-item]>[data-slot=description-details]>:is([data-slot=badge],[data-slot=task-chip],[data-slot=task-status-badge]):first-child]:max-w-[calc(100%+6px)]",
          "[&>[data-slot=description-item]>[data-slot=description-details]>[data-slot=button]:first-child]:ml-[-7.5px]",
          "[&>[data-slot=description-item]>[data-slot=description-details]>[data-slot=button]:first-child]:px-1.5",
        ],
      },
    },
  },
  defaultVariants: {
    direction: "vertical",
  },
});

export type DescriptionListDirection = NonNullable<
  VariantProps<typeof descriptionList>["direction"]
>;

export type DescriptionListProps = useRender.ComponentProps<"dl"> &
  Pick<VariantProps<typeof descriptionList>, "direction">;

export function DescriptionList({
  direction = "vertical",
  className,
  render,
  ...props
}: DescriptionListProps) {
  const { root } = descriptionList({ direction });
  const defaultProps: useRender.ElementProps<"dl"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "dl",
    render,
    props: mergeProps<"dl">(defaultProps, props),
    state: {
      slot: "description-list",
    },
  });
}

export type DescriptionItemProps = useRender.ComponentProps<"div">;

export function DescriptionItem({ className, render, ...props }: DescriptionItemProps) {
  const { item } = descriptionList();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: item({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "description-item",
    },
  });
}

export type DescriptionTermProps = useRender.ComponentProps<"dt">;

export function DescriptionTerm({ className, render, ...props }: DescriptionTermProps) {
  const { term } = descriptionList();
  const defaultProps: useRender.ElementProps<"dt"> = {
    className: term({ className }),
  };

  return useRender({
    defaultTagName: "dt",
    render,
    props: mergeProps<"dt">(defaultProps, props),
    state: {
      slot: "description-term",
    },
  });
}

export type DescriptionDetailsProps = useRender.ComponentProps<"dd">;

export function DescriptionDetails({ className, render, ...props }: DescriptionDetailsProps) {
  const { details } = descriptionList();
  const defaultProps: useRender.ElementProps<"dd"> = {
    className: details({ className }),
  };

  return useRender({
    defaultTagName: "dd",
    render,
    props: mergeProps<"dd">(defaultProps, props),
    state: {
      slot: "description-details",
    },
  });
}
