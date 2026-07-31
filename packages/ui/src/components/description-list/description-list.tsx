import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const descriptionList = tv({
  slots: {
    root: ["m-0"],
    item: [""],
    term: ["mb-1 flex items-center gap-2 text-xs", "[&>[data-slot=button]]:-ml-[5px]"],
    details: ["m-0 text-sm"],
  },
  variants: {
    direction: {
      vertical: {},
      horizontal: {
        root: [
          "grid grid-cols-[max-content_minmax(0,1fr)] items-baseline",
          "max-sm:grid-cols-1 max-sm:gap-y-0.5",
          "[&>[data-slot=description-item]]:contents",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:mb-0",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:max-w-40",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:min-w-0",
          "[&>[data-slot=description-item]>[data-slot=description-term]]:break-words",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:min-w-0",
          "[&>[data-slot=description-item]>[data-slot=description-details]]:break-words",
        ],
      },
    },
    theme: {
      brutal: {
        term: "text-foreground/50",
        details: "text-foreground-strong",
      },
      elegant: {
        term: [
          "mb-1.5 gap-1.5",
          "font-sans text-[11px] font-medium leading-none text-foreground-placeholder",
        ],
        details: "font-sans leading-5 text-foreground-muted",
      },
    },
  },
  compoundVariants: [
    {
      direction: "horizontal",
      theme: "brutal",
      class: {
        root: "gap-x-3 gap-y-1",
      },
    },
    {
      direction: "horizontal",
      theme: "elegant",
      class: {
        root: "gap-x-6 gap-y-2",
      },
    },
  ],
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
  const theme = useThemeFamily();
  const { root } = descriptionList({ direction, theme });
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
  const theme = useThemeFamily();
  const { term } = descriptionList({ theme });
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
  const theme = useThemeFamily();
  const { details } = descriptionList({ theme });
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
