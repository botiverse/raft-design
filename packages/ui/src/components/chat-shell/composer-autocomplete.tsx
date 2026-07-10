import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./app-shell";

const autocompleteSurface = [
  "card-brutal absolute bottom-full left-7",
  "right-[calc(1.75rem+var(--message-scroller-gutter,0px))] mb-1",
  "max-h-48 overflow-y-auto",
];

const autocompleteTheme = {
  root: autocompleteSurface,
  groupLabel: "text-black/60",
  item: "text-black",
  meta: "text-black/40",
} as const;

const composerAutocomplete = tv({
  slots: {
    root: [],
    group: [],
    groupLabel: ["px-3 py-1.5", "text-xs font-bold tracking-widest uppercase"],
    item: [
      "flex w-full items-center gap-2 px-3 py-2 text-left",
      "text-sm font-medium transition-colors",
    ],
    content: [
      "flex min-w-0 flex-1 items-center gap-1.5 text-left",
      "[&>[data-slot=composer-autocomplete-title]]:min-w-0",
    ],
    icon: ["shrink-0"],
    title: ["truncate"],
    aside: ["ml-auto flex shrink-0 items-center"],
    meta: ["text-xs"],
    badge: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: autocompleteTheme,
      // The playground currently uses the source Brutal autocomplete in both
      // preview families. Keeping the same recipe here makes extraction visual-only.
      elegant: autocompleteTheme,
    },
    separated: {
      true: { group: "border-t-2 border-black" },
      false: {},
    },
    selected: {
      true: { item: "font-bold" },
      false: {},
    },
    muted: {
      true: { meta: "text-black/30" },
      false: {},
    },
    tone: {
      signal: {},
      accent: {},
    },
    iconVariant: {
      avatar: {},
      framed: {
        icon: [
          "flex size-5 items-center justify-center border",
          "border-black bg-soft-signal text-black",
          "[&_svg]:size-3",
        ],
      },
      auxiliary: {
        icon: "-ml-1 size-3 text-black/40",
      },
    },
    metaVariant: {
      text: { meta: "truncate" },
      code: { meta: "shrink-0 font-mono" },
    },
    badgeVariant: {
      indicator: {
        badge: ["inline-block size-2.5 rounded-full border border-line-strong bg-brutal-lime"],
      },
      label: {
        badge: [
          "border border-black/40 bg-black/5 px-1 py-0.5",
          "text-[9px] font-bold leading-none text-black/45",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      iconVariant: "avatar",
      class: { icon: "border-black text-black" },
    },
    {
      theme: "brutal",
      badgeVariant: "indicator",
      class: { badge: "border-black" },
    },
    {
      selected: true,
      muted: false,
      tone: "signal",
      class: { item: "bg-soft-signal text-black" },
    },
    {
      selected: false,
      muted: false,
      tone: "signal",
      class: { item: "text-black hover:bg-soft-signal/50" },
    },
    {
      selected: true,
      muted: false,
      tone: "accent",
      class: { item: "bg-brutal-pink text-black" },
    },
    {
      selected: false,
      muted: false,
      tone: "accent",
      class: { item: "text-black hover:bg-soft-signal" },
    },
    {
      selected: true,
      muted: true,
      tone: "signal",
      class: { item: "bg-black/10 text-black/70" },
    },
    {
      selected: true,
      muted: true,
      tone: "accent",
      class: { item: "bg-black/10 text-black/70" },
    },
    {
      selected: false,
      muted: true,
      tone: "signal",
      class: { item: "text-black/50 hover:bg-black/5" },
    },
    {
      selected: false,
      muted: true,
      tone: "accent",
      class: { item: "text-black/45 hover:bg-black/5" },
    },
    {
      iconVariant: "avatar",
      muted: true,
      class: { icon: "opacity-60" },
    },
    {
      theme: "brutal",
      iconVariant: "avatar",
      muted: true,
      class: { icon: "border-black/40 text-black" },
    },
    {
      iconVariant: "framed",
      muted: true,
      class: { icon: "border-black/40 bg-black/5 text-black/45" },
    },
  ],
  defaultVariants: {
    separated: false,
    selected: false,
    muted: false,
    tone: "signal",
    iconVariant: "avatar",
    metaVariant: "text",
    badgeVariant: "label",
  },
});

export type ComposerAutocompleteProps = useRender.ComponentProps<"div">;

export function ComposerAutocomplete({ className, render, ...props }: ComposerAutocompleteProps) {
  const theme = useThemeFamily();
  const { root } = composerAutocomplete({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "composer-autocomplete",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

type ComposerAutocompleteVariantProps = Omit<VariantProps<typeof composerAutocomplete>, "theme">;

export type ComposerAutocompleteGroupProps = useRender.ComponentProps<"div"> &
  Pick<ComposerAutocompleteVariantProps, "separated">;

export function ComposerAutocompleteGroup({
  separated,
  className,
  render,
  ...props
}: ComposerAutocompleteGroupProps) {
  const theme = useThemeFamily();
  const { group } = composerAutocomplete({ theme, separated });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "composer-autocomplete-group",
    className: group({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerAutocompleteGroupLabelProps = useRender.ComponentProps<"div">;

export function ComposerAutocompleteGroupLabel({
  className,
  render,
  ...props
}: ComposerAutocompleteGroupLabelProps) {
  const theme = useThemeFamily();
  const { groupLabel } = composerAutocomplete({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "composer-autocomplete-group-label",
    className: groupLabel({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerAutocompleteItemProps = useRender.ComponentProps<"button"> &
  Pick<ComposerAutocompleteVariantProps, "selected" | "muted" | "tone">;

export function ComposerAutocompleteItem({
  selected = false,
  muted = false,
  tone = "signal",
  className,
  render,
  ...props
}: ComposerAutocompleteItemProps) {
  const theme = useThemeFamily();
  const { item } = composerAutocomplete({ theme, selected, muted, tone });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "composer-autocomplete-item",
    "data-selected": String(selected),
    "data-muted": String(muted),
    className: item({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ComposerAutocompleteContentProps = useRender.ComponentProps<"div">;

export function ComposerAutocompleteContent({
  className,
  render,
  ...props
}: ComposerAutocompleteContentProps) {
  const { content } = composerAutocomplete();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "composer-autocomplete-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ComposerAutocompleteIconProps = useRender.ComponentProps<"span"> &
  Pick<ComposerAutocompleteVariantProps, "muted"> & {
    variant?: ComposerAutocompleteVariantProps["iconVariant"];
  };

export function ComposerAutocompleteIcon({
  variant = "avatar",
  muted = false,
  className,
  render,
  ...props
}: ComposerAutocompleteIconProps) {
  const theme = useThemeFamily();
  const { icon } = composerAutocomplete({ theme, iconVariant: variant, muted });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-autocomplete-icon",
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAutocompleteTitleProps = useRender.ComponentProps<"span">;

export function ComposerAutocompleteTitle({
  className,
  render,
  ...props
}: ComposerAutocompleteTitleProps) {
  const { title } = composerAutocomplete();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-autocomplete-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAutocompleteAsideProps = useRender.ComponentProps<"span">;

export function ComposerAutocompleteAside({
  className,
  render,
  ...props
}: ComposerAutocompleteAsideProps) {
  const { aside } = composerAutocomplete();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-autocomplete-aside",
    className: aside({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAutocompleteMetaProps = useRender.ComponentProps<"span"> &
  Pick<ComposerAutocompleteVariantProps, "muted"> & {
    variant?: ComposerAutocompleteVariantProps["metaVariant"];
  };

export function ComposerAutocompleteMeta({
  variant = "text",
  muted = false,
  className,
  render,
  ...props
}: ComposerAutocompleteMetaProps) {
  const theme = useThemeFamily();
  const { meta } = composerAutocomplete({ theme, metaVariant: variant, muted });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-autocomplete-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ComposerAutocompleteBadgeProps = useRender.ComponentProps<"span"> &
  Pick<ComposerAutocompleteVariantProps, "muted"> & {
    variant?: ComposerAutocompleteVariantProps["badgeVariant"];
  };

export function ComposerAutocompleteBadge({
  variant = "label",
  muted = false,
  className,
  render,
  ...props
}: ComposerAutocompleteBadgeProps) {
  const theme = useThemeFamily();
  const { badge } = composerAutocomplete({ theme, badgeVariant: variant, muted });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "composer-autocomplete-badge",
    className: badge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
