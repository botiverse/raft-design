import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useCallback, useState } from "react";
import { useLabelValueFit } from "../../lib/label-value-fit";
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
          // The label sits beside its value while every value fits there,
          // and above it once one doesn't (data-stacked, set by
          // useLabelValueFit from the list's width and its content): the
          // whole list at once, so labels never alternate between the two
          // (design/patterns/responsive.md#when-a-row-runs-out-of-room).
          "w-full grid items-baseline",
          // Stacked, a value sits 2px under its label (the row gap; no 32px row
          // to centre in) and 10px above the next label (the 2px row gap plus
          // 8px on each following term), so each label reads with its own
          // value, not the one above it.
          "[&[data-stacked]>[data-slot=description-item]>*]:col-span-full",
          "[&[data-stacked]>[data-slot=description-item]>[data-slot=description-details]]:min-h-0",
          "[&[data-stacked]>[data-slot=description-item]+[data-slot=description-item]>[data-slot=description-term]]:mt-2",
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

const listParts = {
  label: ":scope > [data-slot=description-item] > [data-slot=description-term]",
  value: ":scope > [data-slot=description-item] > [data-slot=description-details]",
};

export function DescriptionList({
  direction = "vertical",
  className,
  render,
  ref,
  ...props
}: DescriptionListProps) {
  const [list, setList] = useState<HTMLDListElement | null>(null);
  const listRef = useCallback((element: HTMLDListElement | null) => setList(element), []);
  useLabelValueFit(list, direction === "horizontal", listParts);
  const { root } = descriptionList({ direction });
  const defaultProps: useRender.ElementProps<"dl"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "dl",
    render,
    ref: ref ? [listRef, ref] : listRef,
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
