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
