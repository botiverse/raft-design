import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { inboxItem } from "./inbox-item.recipe";

export type InboxItemLeadingBadgeProps = useRender.ComponentProps<"span">;

/**
 * A small badge in the bottom-right corner of `InboxItemLeading`, the corner a
 * presence light takes, holding one icon: on a thread or task row in a
 * channel, the channel's own icon on the thread's or task's `IconTile`; in a
 * direct message, the thread's or task's mark on the other side's `Avatar`. Put it inside
 * `InboxItemLeading`, after the tile or avatar, with one icon as its child;
 * leave the avatar's `AvatarBadge` out, since the corner holds one mark. It
 * is hidden from assistive technology unless given a `role`.
 */
export function InboxItemLeadingBadge({ className, render, ...props }: InboxItemLeadingBadgeProps) {
  const { itemLeadingBadge } = inboxItem();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "inbox-item-leading-badge",
    "aria-hidden": props.role ? undefined : true,
    className: itemLeadingBadge({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
