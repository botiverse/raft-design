import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { DataAttributes, SlotElementProps } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { buttonVariants } from "../button/button";
import { Spinner } from "../spinner/index";
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

export type MessageListJumpPillProps = StyledProps<BaseButton.Props> &
  DataAttributes & {
    /**
     * Busy, as a Button's `loading`: shows the spinner in place of the label
     * and ignores presses while keeping the pill focusable and its color. A
     * busy pill is `aria-disabled`, not natively `disabled`, so the focus a
     * press left on it stays there.
     */
    loading?: boolean;
    /** The spinner's accessible name while `loading`: say what is happening. */
    loadingLabel?: string;
  };

export function MessageListJumpPill({
  className,
  children,
  render,
  nativeButton,
  loading = false,
  loadingLabel = "Loading",
  disabled,
  focusableWhenDisabled,
  ...props
}: MessageListJumpPillProps) {
  const { root, content, loadingIndicator } = buttonVariants({ variant: "outline", size: "md" });
  const { pillLoading } = messageListJump();
  // Busy but not disabled: aria-disabled like a loading Button, with the
  // pill's own colors back, so it doesn't look disabled beside its dismiss.
  const busy = loading && !disabled;

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="message-list-jump-pill"
      className={root({ className: busy ? pillLoading({ className }) : className })}
      data-loading={loading ? "true" : undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={busy || focusableWhenDisabled}
      {...(loading ? { "aria-disabled": true } : {})}
    >
      {loading ? (
        <span data-slot="message-list-jump-pill-loading-indicator" className={loadingIndicator()}>
          <Spinner aria-label={loadingLabel} />
        </span>
      ) : null}
      <span
        data-slot="message-list-jump-pill-content"
        data-loading={loading ? "true" : undefined}
        className={content()}
      >
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
    /** What the button does, in sentence case: the product's words. */
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
