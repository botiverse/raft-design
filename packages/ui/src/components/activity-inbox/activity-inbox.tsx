import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ElementType, MouseEvent } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  ContextMenuContent,
  ContextMenuItem,
  type ContextMenuContentProps,
  type ContextMenuItemProps,
} from "../context-menu/context-menu";
import { activityInbox } from "./activity-inbox.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type ButtonProps = useRender.ComponentProps<"button">;

function withSlot<Tag extends ElementType>(props: SlotElementProps<Tag>): SlotElementProps<Tag> {
  return props;
}

export type ActivityInboxListProps = DivProps;
export function ActivityInboxList({ className, render, ...props }: ActivityInboxListProps) {
  const theme = useThemeFamily();
  const { list } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "activity-inbox-list", className: list({ className }) }),
      props,
    ),
  });
}

export type ActivityInboxItemProps = DivProps;
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

export type ActivityInboxItemOpenProps = ButtonProps;
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

export type ActivityInboxItemSelectionProps = Omit<ButtonProps, "onChange"> & {
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
  const activate = () => onCheckedChange(!checked);
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "aria-checked": checked,
        "data-slot": "activity-inbox-item-selection",
        className: itemSelection({ className }),
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          activate();
          onClick?.(event);
        },
        role: "checkbox",
        type: "button",
      }),
      props,
    ),
  });
}

export type ActivityInboxItemContentProps = DivProps;
export function ActivityInboxItemContent({
  className,
  render,
  ...props
}: ActivityInboxItemContentProps) {
  const theme = useThemeFamily();
  const { itemContent } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-content",
        className: itemContent({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemSubtitleProps = DivProps;
export function ActivityInboxItemSubtitle({
  className,
  render,
  ...props
}: ActivityInboxItemSubtitleProps) {
  const theme = useThemeFamily();
  const { itemSubtitle } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-subtitle",
        className: itemSubtitle({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemHeadingProps = DivProps;
export function ActivityInboxItemHeading({
  className,
  render,
  ...props
}: ActivityInboxItemHeadingProps) {
  const theme = useThemeFamily();
  const { itemHeading } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-heading",
        className: itemHeading({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemTitleProps = DivProps;
export function ActivityInboxItemTitle({
  className,
  render,
  ...props
}: ActivityInboxItemTitleProps) {
  const theme = useThemeFamily();
  const { itemTitle } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-title",
        className: itemTitle({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemTitleIconProps = SpanProps;
export function ActivityInboxItemTitleIcon({
  className,
  render,
  ...props
}: ActivityInboxItemTitleIconProps) {
  const theme = useThemeFamily();
  const { itemTitleIcon } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "aria-hidden": true,
        "data-slot": "activity-inbox-item-title-icon",
        className: itemTitleIcon({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemTimestampProps = SpanProps;
export function ActivityInboxItemTimestamp({
  className,
  render,
  ...props
}: ActivityInboxItemTimestampProps) {
  const theme = useThemeFamily();
  const { itemTimestamp } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-item-timestamp",
        className: itemTimestamp({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemBodyProps = useRender.ComponentProps<"p">;
export function ActivityInboxItemBody({ className, render, ...props }: ActivityInboxItemBodyProps) {
  const theme = useThemeFamily();
  const { itemBody } = activityInbox({ theme });
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(
      withSlot<"p">({
        "data-slot": "activity-inbox-item-body",
        className: itemBody({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemSenderProps = SpanProps;
export function ActivityInboxItemSender({
  className,
  render,
  ...props
}: ActivityInboxItemSenderProps) {
  const theme = useThemeFamily();
  const { itemSender } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-item-sender",
        className: itemSender({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemMetadataProps = DivProps;
export function ActivityInboxItemMetadata({
  className,
  render,
  ...props
}: ActivityInboxItemMetadataProps) {
  const theme = useThemeFamily();
  const { itemMetadata } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-metadata",
        className: itemMetadata({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemActionsProps = DivProps;
export function ActivityInboxItemActions({
  className,
  render,
  ...props
}: ActivityInboxItemActionsProps) {
  const theme = useThemeFamily();
  const { itemActions } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-actions",
        className: itemActions({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemActionProps = ButtonProps;
export function ActivityInboxItemAction({
  className,
  render,
  ...props
}: ActivityInboxItemActionProps) {
  const theme = useThemeFamily();
  const { itemAction } = activityInbox({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "data-slot": "activity-inbox-item-action",
        className: itemAction({ className }),
        type: "button",
      }),
      props,
    ),
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
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "data-slot": "activity-inbox-item-saved-action",
        className: itemSavedAction({ className }),
        type: "button",
      }),
      props,
    ),
  });
}
