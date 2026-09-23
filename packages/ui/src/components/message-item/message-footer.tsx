import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Badge } from "../badge";
import { messageFooter } from "./message-footer.recipe";

export type MessageItemBadgeStatus = "read" | "unread";

export type MessageItemBadgeProps = useRender.ComponentProps<"span"> & {
  status?: MessageItemBadgeStatus;
};

export function MessageItemBadge({ className, status = "read", ...props }: MessageItemBadgeProps) {
  const theme = useThemeFamily();
  const { badge } = messageFooter({ badgeStatus: status, theme });
  // Brutal matches source ThreadRepliesBadge (solid default + bg override).
  // Elegant uses outline Badge chrome; unread thread activity uses information.
  const appearance = theme === "elegant" ? "outline" : "solid";
  const variant = theme === "elegant" && status === "unread" ? "information" : "default";
  return (
    <Badge
      appearance={appearance}
      data-slot="message-item-badge"
      uppercase={false}
      variant={variant}
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

export type MessageItemSavedIndicatorElevation = "none" | "xs" | "sm";

export type MessageItemSavedIndicatorProps = useRender.ComponentProps<"span"> & {
  /**
   * Shadow elevation. The default `"none"` renders the passive state-marker
   * form (white surface + border, no shadow); `"xs"`/`"sm"` opt into
   * `shadow-raft-xs`/`shadow-raft-sm` for callers that need a raised badge.
   */
  elevation?: MessageItemSavedIndicatorElevation;
  /**
   * Square icon-only affordance. Replaces the old `data-icon-only`
   * attribute contract with an explicit prop.
   */
  iconOnly?: boolean;
};

export function MessageItemSavedIndicator({
  className,
  elevation = "none",
  iconOnly = false,
  render,
  ...props
}: MessageItemSavedIndicatorProps) {
  const theme = useThemeFamily();
  const { savedIndicator } = messageFooter({ elevation, iconOnly, theme });
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
  const theme = useThemeFamily();
  const { readReceipt } = messageFooter({ theme });
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
