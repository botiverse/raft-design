import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

// EmptyState family: a quiet "nothing here yet" surface — muted icon, muted
// title, optional description + action. Composed from a centered root, a
// content group, and slot parts (`EmptyStateIcon`, `EmptyStateTitle`,
// `EmptyStateDescription`, `EmptyStateActions`). All parts share one `tv()`
// slots config so theme styling lives in a single place. There is no icon frame
// in brutal; elegant uses a compact neutral icon chip. The title is
// sentence-case (callers pass the literal string).
const emptyState = tv({
  slots: {
    root: ["flex w-full min-w-0 flex-col items-center justify-center px-6 py-12 text-center"],
    content: [
      "flex w-full max-w-sm min-w-0 flex-col items-center gap-2 text-center",
      "[&>[data-slot=empty-state-icon]]:mb-0",
      "[&>[data-slot=empty-state-title]]:mb-0",
    ],
    icon: ["mb-4 inline-flex items-center justify-center [&_svg]:shrink-0"],
    title: ["mb-2 w-full max-w-full text-center text-balance font-heading text-lg font-semibold"],
    description: [
      "mx-auto w-full max-w-[32ch] text-center text-sm leading-relaxed text-pretty",
      "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground",
    ],
    actions: ["mt-5"],
  },
  variants: {
    theme: {
      brutal: {
        icon: "text-foreground-muted [&_svg]:size-9",
        title: "text-foreground-strong/60",
        description: "text-foreground-strong/60",
      },
      elegant: {
        icon: [
          "rounded-md bg-fill-muted p-2 text-foreground-placeholder [&_svg]:size-4.5",
          "dark:bg-layer-inset",
          "dark:shadow-[inset_0_1px_1.5px_oklch(0_0_0/0.3),0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
        ],
        title: "text-sm font-medium text-foreground dark:text-foreground-muted",
        description: "text-foreground-muted",
      },
    },
  },
});

type EmptyStateSlotProps = useRender.ElementProps<"div"> & {
  "data-slot": string;
};

export type EmptyStateProps = useRender.ComponentProps<"div">;

// Root: a centered, padded column. Compose `EmptyStateContent` and
// `EmptyStateActions` as children. Flat icon/title/description children are
// still supported for legacy callsites.
export function EmptyState({ render, className, ...props }: EmptyStateProps) {
  const { root } = emptyState();
  const defaultProps: EmptyStateSlotProps = {
    "data-slot": "empty-state",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "empty-state",
    },
  });
}

export type EmptyStateContentProps = useRender.ComponentProps<"div">;

// Content: groups media, title, and description so empty-state copy keeps a
// stable measure and balanced line breaks.
export function EmptyStateContent({ render, className, ...props }: EmptyStateContentProps) {
  const { content } = emptyState();
  const defaultProps: EmptyStateSlotProps = {
    "data-slot": "empty-state-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "empty-state-content",
    },
  });
}

export type EmptyStateIconProps = useRender.ComponentProps<"div">;

// Muted icon slot. The slot owns default SVG sizing per theme; callers can
// still override it with className for custom media.
export function EmptyStateIcon({ render, className, ...props }: EmptyStateIconProps) {
  const theme = useThemeFamily();
  const { icon } = emptyState({ theme });
  const defaultProps: EmptyStateSlotProps = {
    "data-slot": "empty-state-icon",
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "empty-state-icon",
    },
  });
}

export type EmptyStateTitleProps = useRender.ComponentProps<"div">;

// Muted, sentence-case title line. Pass `render` to override the element (e.g. a
// real heading for landmark semantics).
export function EmptyStateTitle({ render, className, ...props }: EmptyStateTitleProps) {
  const theme = useThemeFamily();
  const { title } = emptyState({ theme });
  const defaultProps: EmptyStateSlotProps = {
    "data-slot": "empty-state-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "empty-state-title",
    },
  });
}

export type EmptyStateDescriptionProps = useRender.ComponentProps<"div">;

// Optional supporting copy, capped to ~32ch for a tidy measure. Pass `render` to
// override the element.
export function EmptyStateDescription({ render, className, ...props }: EmptyStateDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = emptyState({ theme });
  const defaultProps: EmptyStateSlotProps = {
    "data-slot": "empty-state-description",
    className: description({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "empty-state-description",
    },
  });
}

export type EmptyStateActionsProps = useRender.ComponentProps<"div">;

// Optional action slot rendered below the copy. Pass `render` to override the
// element.
export function EmptyStateActions({ render, className, ...props }: EmptyStateActionsProps) {
  const { actions } = emptyState();
  const defaultProps: EmptyStateSlotProps = {
    "data-slot": "empty-state-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "empty-state-actions",
    },
  });
}
