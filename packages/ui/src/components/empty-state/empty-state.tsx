import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants/lite";
import { useTheme } from "../../lib/theme/use-theme.ts";

// EmptyState family: a quiet "nothing here yet" surface — muted icon, muted
// title, optional description + action. Composed from a centered root and slot
// parts (`EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`,
// `EmptyStateActions`). All parts share one `tv()` slots config so theme styling
// lives in a single place — ready for the elegant family to add per-slot
// overrides under `theme`. There is no icon frame; the title is sentence-case
// (callers pass the literal string). Layout slots stay theme-free.
const emptyState = tv({
  slots: {
    root: ["px-6 py-12 text-center"],
    icon: ["mb-4 inline-flex items-center justify-center"],
    title: ["mb-2 font-heading text-lg font-semibold"],
    description: ["mx-auto max-w-[32ch] text-sm leading-relaxed"],
    actions: ["mt-5"],
  },
  variants: {
    theme: {
      brutal: {
        icon: "text-foreground/40",
        title: "text-foreground/60",
        description: "text-foreground/60",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type EmptyStateProps = useRender.ComponentProps<"div">;

// Root: a centered, padded column. Compose `EmptyStateIcon` / `EmptyStateTitle`
// / `EmptyStateDescription` / `EmptyStateActions` as children.
export function EmptyState({ render, className, ...props }: EmptyStateProps) {
  const { root } = emptyState();
  const defaultProps: useRender.ElementProps<"div"> = {
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

export type EmptyStateIconProps = useRender.ComponentProps<"div">;

// Muted icon slot, conventionally a 36px glyph. Pass `render` to override the
// wrapper element.
export function EmptyStateIcon({ render, className, ...props }: EmptyStateIconProps) {
  const theme = useTheme();
  const { icon } = emptyState({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
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
  const theme = useTheme();
  const { title } = emptyState({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
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
  const theme = useTheme();
  const { description } = emptyState({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
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
  const defaultProps: useRender.ElementProps<"div"> = {
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
