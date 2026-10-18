import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";

/**
 * A notice strip that runs the full width of a panel, under its head (a
 * runtime error, a setting that failed to save). It is a region of its own,
 * so it is closed by the region seam, the same line the head draws above it
 * — never the lighter in-region divider. Its edges are the panel's (20 / 16
 * on a phone), and its trailing actions overhang the padding so a 32px
 * button sits on the first text line instead of making the strip taller.
 *
 * Inside a card or a dialog, where a notice is part of the content, use
 * Banner instead.
 */
const panelNotice = tv({
  slots: {
    root: ["flex shrink-0 items-start"],
    content: ["min-w-0 flex-1"],
    actions: ["flex shrink-0 items-center"],
  },
  variants: {
    theme: {
      brutal: {
        root: "gap-2 border-b-2 border-black px-5 py-2.5 text-sm font-bold text-black",
        actions: "gap-2",
      },
      elegant: {
        root: "gap-2 border-b border-line-hairline px-5 py-2.5 text-[13px]/5 text-foreground",
        actions: "gap-2",
      },
      raft: {
        root: [
          "min-h-10 gap-2.5 border-b border-line-seam px-5 py-2.5 max-md:px-4",
          "font-sans text-callout font-semibold text-foreground",
        ],
        actions: "-my-1.5 gap-3",
      },
    },
    status: {
      default: {},
      warning: {},
      destructive: {},
      info: {},
      success: {},
    },
  },
  compoundVariants: [
    { theme: "raft", status: "default", class: { root: "bg-fill-muted" } },
    { theme: "raft", status: "warning", class: { root: "bg-warning-soft" } },
    { theme: "raft", status: "destructive", class: { root: "bg-danger-soft" } },
    { theme: "raft", status: "info", class: { root: "bg-info-soft" } },
    { theme: "raft", status: "success", class: { root: "bg-success-soft" } },
    { theme: ["brutal", "elegant"], status: "warning", class: { root: "bg-warning-soft" } },
    { theme: ["brutal", "elegant"], status: "destructive", class: { root: "bg-danger-soft" } },
    { theme: ["brutal", "elegant"], status: "info", class: { root: "bg-info-soft" } },
    { theme: ["brutal", "elegant"], status: "success", class: { root: "bg-success-soft" } },
  ],
  defaultVariants: { status: "warning" },
});

export type PanelNoticeStatus = "default" | "warning" | "destructive" | "info" | "success";

export type PanelNoticeProps = useRender.ComponentProps<"div"> & {
  /** The tint: warning for something to fix (the default), destructive only
   *  for what cannot be undone. */
  status?: PanelNoticeStatus;
};

export function PanelNotice({ className, render, status = "warning", ...props }: PanelNoticeProps) {
  const theme = useThemeFamily();
  const { root } = panelNotice({ theme, status });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-notice",
    "data-status": status,
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelNoticeContentProps = useRender.ComponentProps<"div">;

/** The message: takes the width left and wraps or clamps as the caller says. */
export function PanelNoticeContent({ className, render, ...props }: PanelNoticeContentProps) {
  const theme = useThemeFamily();
  const { content } = panelNotice({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-notice-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelNoticeActionsProps = useRender.ComponentProps<"div">;

/** Trailing controls (copy, a link, ×), centred on the first text line. */
export function PanelNoticeActions({ className, render, ...props }: PanelNoticeActionsProps) {
  const theme = useThemeFamily();
  const { actions } = panelNotice({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-notice-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
