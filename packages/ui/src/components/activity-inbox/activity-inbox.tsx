import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { MouseEvent } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  ContextMenuContent,
  ContextMenuItem,
  type ContextMenuContentProps,
  type ContextMenuItemProps,
} from "../context-menu/context-menu";
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

export type ActivityInboxItemProps = useRender.ComponentProps<"div">;
export function ActivityInboxItem({ className, render, ...props }: ActivityInboxItemProps) {
  const theme = useThemeFamily();
  const { item } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item",
    className: item({ className: `group/activity-item ${className ?? ""}`.trim() }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemMenuContentProps = ContextMenuContentProps;
export function ActivityInboxItemMenuContent({
  className,
  ...props
}: ActivityInboxItemMenuContentProps) {
  const theme = useThemeFamily();
  const { itemMenuContent } = activityInbox({ theme });
  return <ContextMenuContent className={itemMenuContent({ className })} {...props} />;
}

export type ActivityInboxItemMenuItemProps = ContextMenuItemProps;
export function ActivityInboxItemMenuItem({ className, ...props }: ActivityInboxItemMenuItemProps) {
  const theme = useThemeFamily();
  const { itemMenuItem } = activityInbox({ theme });
  return <ContextMenuItem className={itemMenuItem({ className })} {...props} />;
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

export type ActivityInboxItemSelectionProps = Omit<
  useRender.ComponentProps<"button">,
  "onChange"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};
export function ActivityInboxItemSelection({
  checked,
  className,
  onCheckedChange,
  onClick,
  render,
  ...props
}: ActivityInboxItemSelectionProps) {
  const theme = useThemeFamily();
  const { itemSelection } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "aria-checked": checked,
    "data-slot": "activity-inbox-item-selection",
    className: itemSelection({ className }),
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onCheckedChange(!checked);
      onClick?.(event);
    },
    role: "checkbox",
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
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

export type ActivityInboxItemActionProps = useRender.ComponentProps<"button">;
export function ActivityInboxItemAction({
  className,
  render,
  ...props
}: ActivityInboxItemActionProps) {
  const theme = useThemeFamily();
  const { itemAction } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-item-action",
    className: itemAction({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxItemSavedActionProps = ActivityInboxItemActionProps;
export function ActivityInboxItemSavedAction({
  className,
  render,
  ...props
}: ActivityInboxItemSavedActionProps) {
  const theme = useThemeFamily();
  const { itemSavedAction } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-item-saved-action",
    className: itemSavedAction({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}
