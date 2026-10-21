import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerSuggestionList = tv({
  slots: {
    root: [
      "absolute inset-x-0 bottom-full w-auto overflow-y-auto",
      "mb-2 max-h-60 overflow-x-hidden rounded-container p-1",
      "bg-layer-popover text-foreground ring-1 ring-line-seam shadow-float",
    ],
    group: ["flex flex-col"],
    groupLabel: [
      "py-1.5",
      "px-2.5 pt-2 pb-1 font-sans text-caption font-bold text-foreground-hint",
    ],
    item: [
      "flex w-full items-center text-left",
      "min-h-9 cursor-pointer gap-2.5 rounded-chip px-2.5 py-1",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft data-[highlighted=true]:bg-brand-soft",
      "data-[disabled=true]:cursor-default data-[disabled=true]:text-foreground-disabled",
      "data-[disabled=true]:hover:bg-transparent",
    ],
    // Every row is one line with the same height. Space goes to the name first:
    // text metadata (descriptions) starts from zero width and only takes what the
    // name leaves, so it truncates (or disappears) before the name does. The name
    // truncates only when it alone cannot fit (pass `title` for the full name).
    content: ["flex min-w-0 flex-1 items-center gap-1.5 text-left"],
    icon: ["shrink-0"],
    title: ["min-w-0 truncate"],
    // Priority: name, then handle, then description. The handle shows in full up
    // to a third of the row and truncates beyond that; the name gets the rest.
    aside: ["ml-auto flex max-w-[33%] min-w-0 shrink-0 items-center justify-end"],
    meta: ["text-caption text-foreground-hint"],
  },
  variants: {
    separated: {
      true: { group: ["-mx-1 mt-1 border-t border-line-hairline px-1 pt-1"] },
      false: {},
    },
    iconVariant: {
      avatar: {},
      framed: {
        icon: [
          "flex size-[19px] items-center justify-center rounded-sticker",
          "bg-fill-muted text-foreground-muted [&_svg]:size-[11px]",
        ],
      },
      auxiliary: { icon: ["-ml-1 size-3", "text-foreground-hint"] },
      // A small glyph inside the row content (e.g. human vs agent), sized to the
      // text and never shrunk away. Pass an accessible label on the svg.
      inline: {
        icon: [
          "flex size-3.5 items-center justify-center [&_svg]:size-3.5",
          "text-foreground-hint",
        ],
      },
    },
    metaVariant: {
      text: { meta: "min-w-0 flex-1 basis-0 truncate" },
      code: { meta: ["min-w-0 truncate font-mono", "text-mono-meta text-foreground-hint"] },
    },
  },
  defaultVariants: {
    separated: false,
    iconVariant: "avatar",
    metaVariant: "text",
  },
});

export type ComposerSuggestionListProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionList({
  className,
  render,
  ...props
}: ComposerSuggestionListProps) {
  const { root } = composerSuggestionList();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-list",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

type ComposerSuggestionListVariantProps = VariantProps<typeof composerSuggestionList>;

export type ComposerSuggestionGroupProps = useRender.ComponentProps<"div"> &
  Pick<ComposerSuggestionListVariantProps, "separated">;

export function ComposerSuggestionGroup({
  separated,
  className,
  render,
  ...props
}: ComposerSuggestionGroupProps) {
  const { group } = composerSuggestionList({ separated });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-group",
    className: group({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionGroupLabelProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionGroupLabel({
  className,
  render,
  ...props
}: ComposerSuggestionGroupLabelProps) {
  const { groupLabel } = composerSuggestionList();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-group-label",
    className: groupLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionOptionProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionOption({
  className,
  render,
  ...props
}: ComposerSuggestionOptionProps) {
  const { item } = composerSuggestionList();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-option",
    className: item({ className }),
    role: "option",
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionContentProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionContent({
  className,
  render,
  ...props
}: ComposerSuggestionContentProps) {
  const { content } = composerSuggestionList();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "composer-suggestion-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionIconProps = useRender.ComponentProps<"span"> & {
  variant?: ComposerSuggestionListVariantProps["iconVariant"];
};

export function ComposerSuggestionIcon({
  variant = "avatar",
  className,
  render,
  ...props
}: ComposerSuggestionIconProps) {
  const { icon } = composerSuggestionList({ iconVariant: variant });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-icon",
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerSuggestionTitleProps = useRender.ComponentProps<"span">;

export function ComposerSuggestionTitle({
  className,
  render,
  ...props
}: ComposerSuggestionTitleProps) {
  const { title } = composerSuggestionList();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerSuggestionAsideProps = useRender.ComponentProps<"span">;

export function ComposerSuggestionAside({
  className,
  render,
  ...props
}: ComposerSuggestionAsideProps) {
  const { aside } = composerSuggestionList();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-aside",
    className: aside({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerSuggestionMetaProps = useRender.ComponentProps<"span"> & {
  variant?: ComposerSuggestionListVariantProps["metaVariant"];
};

export function ComposerSuggestionMeta({
  variant = "text",
  className,
  render,
  ...props
}: ComposerSuggestionMetaProps) {
  const { meta } = composerSuggestionList({ metaVariant: variant });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "composer-suggestion-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
