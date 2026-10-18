import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { Badge } from "../badge";
import { messageFooter } from "./message-footer.recipe";

export type MessageItemBadgeStatus = "read" | "unread";

export type MessageItemBadgeProps = useRender.ComponentProps<"span"> & {
  status?: MessageItemBadgeStatus;
};

export function MessageItemBadge({ className, status = "read", ...props }: MessageItemBadgeProps) {
  const { badge } = messageFooter({ badgeStatus: status });
  // A sunken chip (the recipe owns the surface): soft, neutral.
  return (
    <Badge
      appearance="soft"
      data-slot="message-item-badge"
      variant="muted"
      className={badge({ className })}
      {...props}
    />
  );
}

export type MessageItemBadgeSeparatorProps = useRender.ComponentProps<"span">;

export function MessageItemBadgeSeparator({
  className,
  render,
  ...props
}: MessageItemBadgeSeparatorProps) {
  const { badgeSeparator } = messageFooter();
  const defaultProps: useRender.ElementProps<"span"> = {
    "aria-hidden": true,
    className: badgeSeparator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-badge-separator" },
  });
}

export type MessageItemSavedIndicatorProps = useRender.ComponentProps<"span"> & {
  /**
   * Square icon-only affordance. Replaces the old `data-icon-only`
   * attribute contract with an explicit prop.
   */
  iconOnly?: boolean;
};

export function MessageItemSavedIndicator({
  className,
  iconOnly = false,
  render,
  ...props
}: MessageItemSavedIndicatorProps) {
  const { savedIndicator } = messageFooter({ iconOnly });
  const defaultProps: useRender.ElementProps<"span"> = {
    // Keep the DOM marker so existing attribute selectors keep matching.
    ...(iconOnly ? { "data-icon-only": "" } : {}),
    className: savedIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-saved-indicator",
    },
  });
}

export type MessageItemReadReceiptProps = useRender.ComponentProps<"span">;

export function MessageItemReadReceipt({
  className,
  render,
  ...props
}: MessageItemReadReceiptProps) {
  const { readReceipt } = messageFooter();
  const defaultProps: SlotElementProps<"span"> = {
    className: readReceipt({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-read-receipt",
    },
  });
}
