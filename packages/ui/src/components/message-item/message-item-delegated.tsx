import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AvatarBadge } from "../avatar";
import type { AvatarBadgeProps } from "../avatar";
import { messageItem } from "./message-item.recipe";

export type MessageItemDelegatedByProps = useRender.ComponentProps<"span">;

/**
 * Says an assistant sent the message for its owner, the sender: "sent by
 * Friday". Put it in `MessageItemHeader` after `MessageItemSenderGroup`, and
 * the assistant's name in `MessageItemDelegatedByName` or
 * `MessageItemDelegatedByButton`. The words, and the spaces around the name,
 * come from the product. It takes at most 45% of the line: past that only
 * the name truncates, never the words.
 */
export function MessageItemDelegatedBy({
  className,
  render,
  ...props
}: MessageItemDelegatedByProps) {
  const { delegatedBy } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: delegatedBy({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-delegated-by",
    },
  });
}

export type MessageItemDelegatedByNameProps = useRender.ComponentProps<"span">;

/** The assistant's name in `MessageItemDelegatedBy`, the part that truncates. */
export function MessageItemDelegatedByName({
  className,
  render,
  ...props
}: MessageItemDelegatedByNameProps) {
  const { delegatedByName } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: delegatedByName({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-delegated-by-name",
    },
  });
}

export type MessageItemDelegatedByButtonProps = useRender.ComponentProps<"button">;

/**
 * The assistant's name when it opens the assistant's profile: a `<button>`
 * (or a link through `render`) that underlines on hover and truncates like
 * `MessageItemDelegatedByName`.
 */
export function MessageItemDelegatedByButton({
  className,
  render,
  ...props
}: MessageItemDelegatedByButtonProps) {
  const { delegatedByButton } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: delegatedByButton({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-item-delegated-by-button",
    },
  });
}

export type MessageItemDelegatedAvatarProps = Omit<AvatarBadgeProps, "presence" | "offset"> & {
  /** The assistant was deleted: its face is grayed and faded, over the
   *  row's surface, never the owner's avatar. */
  deleted?: boolean;
};

/**
 * The assistant's face on its owner's avatar, in the corner a presence light
 * takes: put it inside the owner's `md` `Avatar` with a `2xs` agent `Avatar`
 * as its child. It is hidden from assistive technology, because
 * `MessageItemDelegatedBy` already says who sent the message. Only on a
 * person's avatar: an agent's corner is its presence light.
 */
export function MessageItemDelegatedAvatar({
  className,
  deleted,
  ...props
}: MessageItemDelegatedAvatarProps) {
  const { delegatedAvatar } = messageItem();

  return (
    <AvatarBadge
      aria-hidden
      data-deleted={deleted ? "" : undefined}
      className={delegatedAvatar({ className })}
      render={<span />}
      {...props}
    />
  );
}
