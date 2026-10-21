import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { DataAttributes, SlotElementProps } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { buttonVariants } from "../button/button";
import { messageListJump } from "./message-list.recipe";

// Raft Design System › MessageList › Jump controls: the pills that take the
// reader back to the end of a conversation, to new messages, or to the next
// unread thread. They float over the list without a shadow (a control is
// marked by its ink edge, Elevation), and they are Button `outline md` so the
// label, icon and height are the Button's.

export type MessageListJumpControlsProps = useRender.ComponentProps<"div"> & {
  /** The edge of the list the controls float on. */
  side?: "bottom" | "top";
};

export function MessageListJumpControls({
  className,
  render,
  side = "bottom",
  ...props
}: MessageListJumpControlsProps) {
  const { controls } = messageListJump({ side });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "message-list-jump-controls",
    "data-side": side,
    className: controls({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type MessageListJumpPillProps = StyledProps<BaseButton.Props> & DataAttributes;

export function MessageListJumpPill({
  className,
  children,
  render,
  nativeButton,
  ...props
}: MessageListJumpPillProps) {
  const { root, content } = buttonVariants({ variant: "outline", size: "md" });

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="message-list-jump-pill"
      className={root({ className })}
    >
      <span data-slot="message-list-jump-pill-content" className={content()}>
        {children}
      </span>
    </BaseButton>
  );
}

export type MessageListJumpPillGroupProps = useRender.ComponentProps<"div">;

/** A pill and its dismiss button, joined on one shared edge. */
export function MessageListJumpPillGroup({
  className,
  render,
  ...props
}: MessageListJumpPillGroupProps) {
  const { group } = messageListJump();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "message-list-jump-pill-group",
    className: group({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type MessageListJumpPillDismissProps = StyledProps<BaseButton.Props> &
  DataAttributes & {
    /** What the button does, in Title Case: the product's words. */
    "aria-label": string;
  };

export function MessageListJumpPillDismiss({
  className,
  children,
  render,
  nativeButton,
  ...props
}: MessageListJumpPillDismissProps) {
  const { root, content } = buttonVariants({ variant: "outline", size: "icon-md" });
  const { dismiss } = messageListJump();

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="message-list-jump-pill-dismiss"
      className={root({ className: dismiss({ className }) })}
    >
      <span data-slot="message-list-jump-pill-dismiss-content" className={content()}>
        {children}
      </span>
    </BaseButton>
  );
}
