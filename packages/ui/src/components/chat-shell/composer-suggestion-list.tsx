import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./app-shell";

const composerSuggestionList = tv({
  slots: {
    root: ["absolute right-7 bottom-full left-7 mb-1 max-h-48 overflow-y-auto", "outline-none"],
    group: [],
    groupLabel: ["px-3 py-1.5", "text-xs"],
    item: [
      "group/composer-suggestion-option",
      "flex w-full items-center gap-2 px-3 py-2 text-left",
      "text-sm transition-colors outline-none",
      "disabled:cursor-not-allowed disabled:opacity-65",
    ],
    content: [
      "flex min-w-0 flex-1 items-center gap-1.5 text-left",
      "[&>[data-slot=composer-suggestion-title]]:min-w-0",
    ],
    icon: ["shrink-0"],
    title: ["truncate"],
    aside: ["ml-auto flex shrink-0 items-center"],
    meta: ["text-xs"],
    badge: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-2 border-line-strong bg-layer-popover shadow-lg",
        groupLabel: "font-bold tracking-widest uppercase text-black/60",
        item: "font-medium text-black aria-[selected=true]:font-bold disabled:text-black/55",
        meta: "text-black/40",
      },
      elegant: {
        root: [
          "rounded-lg border border-line-subtle bg-layer-popover p-1 shadow-xl",
          "ring-1 ring-ink-2",
        ],
        groupLabel: "font-medium text-foreground-muted",
        item: [
          "rounded-md font-normal text-foreground-muted",
          "aria-[selected=true]:font-medium aria-[selected=true]:text-foreground-strong",
          "disabled:text-foreground-placeholder",
        ],
        meta: "text-foreground-placeholder",
      },
    },
    separated: {
      true: {},
      false: {},
    },
    tone: {
      signal: {},
      accent: {},
    },
    iconVariant: {
      avatar: {},
      framed: {
        icon: ["flex size-5 items-center justify-center border", "[&_svg]:size-3"],
      },
      auxiliary: { icon: "-ml-1 size-3" },
    },
    metaVariant: {
      text: { meta: "truncate" },
      code: { meta: "shrink-0 font-mono" },
    },
    badgeVariant: {
      indicator: {
        badge: ["inline-block size-2.5 rounded-full border"],
      },
      label: {
        badge: ["border px-1 py-0.5", "text-[9px] font-bold leading-none"],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      separated: true,
      class: { group: "border-t-2 border-black" },
    },
    {
      theme: "elegant",
      separated: true,
      class: { group: "border-t border-line-subtle" },
    },
    {
      theme: "brutal",
      tone: "signal",
      class: { item: "aria-[selected=true]:bg-soft-signal" },
    },
    {
      theme: "brutal",
      tone: "accent",
      class: { item: "aria-[selected=true]:bg-brutal-pink" },
    },
    {
      theme: "elegant",
      tone: "accent",
      class: { item: "aria-[selected=true]:bg-accent-100 aria-[selected=true]:text-accent-900" },
    },
    {
      theme: "elegant",
      tone: "signal",
      class: { item: "aria-[selected=true]:bg-layer-strong" },
    },
    {
      theme: "brutal",
      iconVariant: "framed",
      class: { icon: "border-black bg-soft-signal text-black" },
    },
    {
      theme: "elegant",
      iconVariant: "framed",
      class: { icon: "rounded-sm border-line-subtle bg-layer-muted text-foreground-icon" },
    },
    {
      theme: "brutal",
      iconVariant: "auxiliary",
      class: { icon: "text-black/40" },
    },
    {
      theme: "elegant",
      iconVariant: "auxiliary",
      class: { icon: "text-foreground-placeholder" },
    },
    {
      theme: "brutal",
      badgeVariant: "indicator",
      class: { badge: "border-black bg-brutal-lime" },
    },
    {
      theme: "elegant",
      badgeVariant: "indicator",
      class: { badge: "border-layer-popover bg-success-base" },
    },
    {
      theme: "brutal",
      badgeVariant: "label",
      class: { badge: "border-black/40 bg-black/5 text-black/45" },
    },
    {
      theme: "elegant",
      badgeVariant: "label",
      class: { badge: "rounded-sm border-line-subtle bg-layer-muted text-foreground-placeholder" },
    },
  ],
  defaultVariants: {
    separated: false,
    tone: "signal",
    iconVariant: "avatar",
    metaVariant: "text",
    badgeVariant: "label",
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "composer-suggestion-group-label",
    className: groupLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerSuggestionOptionProps = useRender.ComponentProps<"button"> &
  Pick<ComposerSuggestionListVariantProps, "tone">;

export function ComposerSuggestionOption({
  tone = "signal",
  className,
  render,
  ...props
}: ComposerSuggestionOptionProps) {
  const theme = useThemeFamily();
  const { item } = composerSuggestionList({ theme, tone });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    "data-slot": "composer-suggestion-option",
    className: item({ className }),
    type: "button",
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ComposerSuggestionContentProps = useRender.ComponentProps<"div">;

export function ComposerSuggestionContent({
  className,
  render,
  ...props
}: ComposerSuggestionContentProps) {
  const { content } = composerSuggestionList();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-suggestion-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerSuggestionBadgeProps = useRender.ComponentProps<"span"> & {
  variant?: ComposerSuggestionListVariantProps["badgeVariant"];
};

export function ComposerSuggestionBadge({
  variant = "label",
  className,
  render,
  ...props
}: ComposerSuggestionBadgeProps) {
  const theme = useThemeFamily();
  const { badge } = composerSuggestionList({ theme, badgeVariant: variant });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-suggestion-badge",
    className: badge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
