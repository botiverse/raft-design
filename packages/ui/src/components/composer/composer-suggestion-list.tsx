import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";

const composerSuggestionList = tv({
  slots: {
    root: "absolute inset-x-0 bottom-full w-auto overflow-y-auto",
    group: [],
    groupLabel: ["px-3 py-1.5"],
    item: ["flex w-full items-center gap-2 px-3 py-2 text-left"],
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
    meta: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "mb-2 max-h-48 border-2 border-black bg-white shadow-raft-md",
        groupLabel: "text-xs font-bold tracking-widest uppercase text-black/60",
        item: [
          "cursor-pointer text-sm font-medium text-black transition-colors",
          "data-[disabled=true]:cursor-not-allowed",
          "data-[highlighted=true]:bg-primary data-[highlighted=true]:font-bold",
          "hover:bg-primary/50",
          "data-[disabled=true]:text-black/50 data-[disabled=true]:hover:bg-black/5",
        ],
        meta: "text-xs text-black/50",
      },
      elegant: {
        root: [
          "mb-1 max-h-[204px] overflow-x-hidden rounded-lg p-1 bg-layer-popover",
          "shadow-raft-sm ring-1 ring-ink-6 dark:ring-transparent",
        ],
        group: "flex flex-col gap-0.5",
        groupLabel: [
          "mb-0.5 px-3 py-2",
          "text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45",
        ],
        item: [
          "cursor-default gap-2.5 rounded-sm text-[13px] font-medium tracking-[-0.005em] text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-ink-2 hover:text-foreground",
          "data-[highlighted=true]:bg-ink-4 data-[highlighted=true]:text-foreground",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:text-foreground-disabled",
        ],
        meta: "text-xs text-foreground-placeholder",
      },
    },
    separated: {
      true: { group: "mt-1 pt-1" },
      false: {},
    },
    iconVariant: {
      avatar: {},
      framed: {},
      auxiliary: { icon: "-ml-1 size-3" },
    },
    metaVariant: {
      text: { meta: "min-w-0 flex-1 basis-0 truncate" },
      code: { meta: "min-w-0 truncate font-mono" },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      iconVariant: "framed",
      class: {
        icon: [
          "flex size-5 items-center justify-center border",
          "[&_svg]:size-3",
          "border-black bg-primary text-black",
        ],
      },
    },
    {
      theme: "elegant",
      iconVariant: "framed",
      class: {
        icon: [
          "-mr-1 flex size-3.5 items-center justify-center",
          "text-foreground-icon [&_svg]:size-3.5",
        ],
      },
    },
    {
      theme: "brutal",
      iconVariant: "auxiliary",
      class: { icon: "text-black/40" },
    },
    {
      theme: "brutal",
      metaVariant: "code",
      class: { meta: "text-black/40" },
    },
    {
      theme: "elegant",
      iconVariant: "auxiliary",
      class: { icon: "text-foreground-placeholder" },
    },
  ],
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
  const theme = useThemeFamily();
  const { root } = composerSuggestionList({ theme });
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

type ComposerSuggestionListVariantProps = Omit<
  VariantProps<typeof composerSuggestionList>,
  "theme"
>;

export type ComposerSuggestionGroupProps = useRender.ComponentProps<"div"> &
  Pick<ComposerSuggestionListVariantProps, "separated">;

export function ComposerSuggestionGroup({
  separated,
  className,
  render,
  ...props
}: ComposerSuggestionGroupProps) {
  const theme = useThemeFamily();
  const { group } = composerSuggestionList({ theme, separated });
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
  const theme = useThemeFamily();
  const { groupLabel } = composerSuggestionList({ theme });
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
  const theme = useThemeFamily();
  const { item } = composerSuggestionList({ theme });
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
  const theme = useThemeFamily();
  const { icon } = composerSuggestionList({ theme, iconVariant: variant });
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
  const theme = useThemeFamily();
  const { meta } = composerSuggestionList({ theme, metaVariant: variant });
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
