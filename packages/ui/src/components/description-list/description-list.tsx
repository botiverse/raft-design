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
          // The list is its own container: below 24rem (384px) of its own
          // width the label sits above its value (both span the two
          // columns), so it stacks in a narrow panel on a wide window and on
          // a phone (a 390px screen leaves the list about 358px), not by the
          // window
          // (design/patterns/responsive.md#switch-on-the-regions-width).
          "@container/description-list w-full grid items-baseline",
          // Stacked, a value sits 2px under its label (the row gap; no 32px row
          // to centre in) and 10px above the next label (the 2px row gap plus
          // 8px on each following term), so each label reads with its own
          // value, not the one above it.
          "[&>[data-slot=description-item]>*]:@max-sm/description-list:col-span-full",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:@max-sm/description-list:min-h-0",
          "[&>[data-slot=description-item]+[data-slot=description-item]>[data-slot=description-term]]:@max-sm/description-list:mt-2",
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
          // One flow for every fact: the same 24px between facts and 8px
          // between lines, and no fact wider than 24rem (or the row). A long
          // value, such as the message a task came from, goes in an Ellipsis
          // that cuts it there, instead of taking a line of its own.
          "*:data-[slot=description-item]:max-w-[min(100%,24rem)]",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:min-w-0",
          "[&>[data-slot=description-item]+[data-slot=description-item]]:pt-0",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:shrink-0",
          "[&>[data-slot=description-item]>[data-slot=description-details]>[data-slot=badge]:first-child]:-ml-1.5",
          "[&>[data-slot=description-item]>[data-slot=description-details]>[data-slot=badge]:first-child]:max-w-[calc(100%+6px)]",
          "[&>[data-slot=description-item]>[data-slot=description-details]>:is([data-slot=task-chip],[data-slot=task-status-badge]):first-child]:ml-[-7px]",
          "[&>[data-slot=description-item]>[data-slot=description-details]>:is([data-slot=task-chip],[data-slot=task-status-badge]):first-child]:max-w-[calc(100%+7px)]",
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
