import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { hudTextAction } from "../../lib/hud-text-action";
import { tv } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";

/**
 * A dark strip across a panel, under its head, while the panel is in a mode
 * people entered and leave on purpose (commenting on an Artifact). It is the
 * HUD surface, not an intent tint: nothing is wrong, so it is not a notice;
 * the dark fill says "the panel works differently now" until the mode ends.
 * Its edges and height for one line are PanelNotice's, so the two strips are
 * one size under a head.
 */
const modeBar = tv({
  slots: {
    root: [
      "flex shrink-0 items-start",
      "min-h-10 gap-4 px-5 py-2.5 max-md:px-4",
      "bg-layer-hud font-sans text-callout text-foreground-on-hud",
    ],
    content: ["min-w-0 flex-1 wrap-break-word"],
    title: ["font-bold"],
    description: ["text-foreground-on-hud-muted"],
    action: [
      "relative inline-flex shrink-0 items-center whitespace-nowrap select-none",
      "border-0 bg-transparent p-0",
      ...hudTextAction,
      "disabled:pointer-events-none disabled:opacity-40",
    ],
  },
});

export type ModeBarProps = useRender.ComponentProps<"div">;

/**
 * The strip. Put `ModeBarContent` in it, then the `ModeBarAction` that ends
 * the mode.
 */
export function ModeBar({ className, render, ...props }: ModeBarProps) {
  const { root } = modeBar();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "mode-bar",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ModeBarContentProps = useRender.ComponentProps<"div">;

/**
 * The words: `ModeBarTitle`, then `ModeBarDescription`, on one line that
 * wraps. A polite live region, so a change to the title (a draft count) is
 * read out; the action stays outside it.
 */
export function ModeBarContent({ className, render, ...props }: ModeBarContentProps) {
  const { content } = modeBar();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "mode-bar-content",
    role: "status",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ModeBarTitleProps = useRender.ComponentProps<"span">;

/** The mode and its state, bold in the HUD ink: "Commenting · 1 draft." */
export function ModeBarTitle({ className, render, ...props }: ModeBarTitleProps) {
  const { title } = modeBar();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "mode-bar-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ModeBarDescriptionProps = useRender.ComponentProps<"span">;

/**
 * What to do in the mode, in the muted HUD ink, after the title on the same
 * line. It brings the space before it, so the two read and copy as one
 * sentence.
 */
export function ModeBarDescription({
  className,
  render,
  children,
  ...props
}: ModeBarDescriptionProps) {
  const { description } = modeBar();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "mode-bar-description",
    className: description({ className }),
    children: <> {children}</>,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ModeBarActionProps = useRender.ComponentProps<"button">;

/**
 * The text action that ends the mode (Done), at the end of the first line. A
 * real `button`; on the HUD it is a text action, like a toast's, never a
 * Button.
 */
export function ModeBarAction({ className, render, ...props }: ModeBarActionProps) {
  const { action } = modeBar();
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "mode-bar-action",
    type: "button",
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}
