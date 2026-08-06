import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { activityInbox } from "./activity-inbox.recipe";

export type ActivityInboxListProps = useRender.ComponentProps<"div">;
export function ActivityInboxList({ className, render, ...props }: ActivityInboxListProps) {
  const theme = useThemeFamily();
  const { list } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-list",
    className: list({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemProps = useRender.ComponentProps<"div"> & {
  active?: boolean;
  disabled?: boolean;
};
export function ActivityInboxItem({
  active = false,
  className,
  disabled = false,
  render,
  ...props
}: ActivityInboxItemProps) {
  const theme = useThemeFamily();
  const { item } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "aria-disabled": disabled || undefined,
    "data-active": active ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-slot": "activity-inbox-item",
    className: item({ className: `group/activity-item ${className ?? ""}`.trim() }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemOpenProps = useRender.ComponentProps<"button">;
export function ActivityInboxItemOpen({ className, render, ...props }: ActivityInboxItemOpenProps) {
  const theme = useThemeFamily();
  const { itemOpen } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-item-open",
    className: itemOpen({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxItemSelectionProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemSelection({
  className,
  render,
  ...props
}: ActivityInboxItemSelectionProps) {
  const theme = useThemeFamily();
  const { itemSelection } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-selection",
    className: itemSelection({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemContentProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemContent({
  className,
  render,
  ...props
}: ActivityInboxItemContentProps) {
  const theme = useThemeFamily();
  const { itemContent } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-content",
    className: itemContent({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemSubtitleProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemSubtitle({
  className,
  render,
  ...props
}: ActivityInboxItemSubtitleProps) {
  const theme = useThemeFamily();
  const { itemSubtitle } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-subtitle",
    className: itemSubtitle({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemHeadingProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemHeading({
  className,
  render,
  ...props
}: ActivityInboxItemHeadingProps) {
  const theme = useThemeFamily();
  const { itemHeading } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-heading",
    className: itemHeading({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemTitleProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemTitle({
  className,
  render,
  ...props
}: ActivityInboxItemTitleProps) {
  const theme = useThemeFamily();
  const { itemTitle } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-title",
    className: itemTitle({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemTrailingProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemTrailing({
  className,
  render,
  ...props
}: ActivityInboxItemTrailingProps) {
  const theme = useThemeFamily();
  const { itemTrailing } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-trailing",
    className: itemTrailing({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemTimestampProps = useRender.ComponentProps<"span">;
export function ActivityInboxItemTimestamp({
  className,
  render,
  ...props
}: ActivityInboxItemTimestampProps) {
  const theme = useThemeFamily();
  const { itemTimestamp } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "activity-inbox-item-timestamp",
    className: itemTimestamp({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ActivityInboxItemBodyProps = useRender.ComponentProps<"p">;
export function ActivityInboxItemBody({ className, render, ...props }: ActivityInboxItemBodyProps) {
  const theme = useThemeFamily();
  const { itemBody } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"p"> = {
    "data-slot": "activity-inbox-item-body",
    className: itemBody({ className }),
  };
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type ActivityInboxItemSenderProps = useRender.ComponentProps<"span">;
export function ActivityInboxItemSender({
  className,
  render,
  ...props
}: ActivityInboxItemSenderProps) {
  const theme = useThemeFamily();
  const { itemSender } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "activity-inbox-item-sender",
    className: itemSender({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ActivityInboxItemMetadataProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemMetadata({
  className,
  render,
  ...props
}: ActivityInboxItemMetadataProps) {
  const theme = useThemeFamily();
  const { itemMetadata } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-metadata",
    className: itemMetadata({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemActionsProps = useRender.ComponentProps<"div">;
export function ActivityInboxItemActions({
  className,
  render,
  ...props
}: ActivityInboxItemActionsProps) {
  const theme = useThemeFamily();
  const { itemActions } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item-actions",
    className: itemActions({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
