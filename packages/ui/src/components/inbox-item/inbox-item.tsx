import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useContext } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { inboxItem } from "./inbox-item.recipe";

const InboxItemDisabledContext = createContext(false);

export type InboxItemProps = useRender.ComponentProps<"div"> & {
  active?: boolean;
  disabled?: boolean;
};
export function InboxItem({
  active = false,
  className,
  disabled = false,
  render,
  ...props
}: InboxItemProps) {
  const theme = useThemeFamily();
  const { item } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "aria-disabled": disabled || undefined,
    "data-active": active ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-slot": "inbox-item",
    className: item({ className: `group/inbox-item ${className ?? ""}`.trim() }),
  };
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
  return (
    <InboxItemDisabledContext.Provider value={disabled}>
      {element}
    </InboxItemDisabledContext.Provider>
  );
}

export type InboxItemTriggerProps = Omit<useRender.ComponentProps<"button">, "type">;

export function InboxItemTrigger({ className, onClick, render, ...props }: InboxItemTriggerProps) {
  const disabled = useContext(InboxItemDisabledContext);
  const theme = useThemeFamily();
  const { itemTrigger } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: render ? undefined : "button",
    "aria-disabled": disabled || undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-slot": "inbox-item-open",
    disabled: render ? undefined : disabled,
    tabIndex: disabled && render ? -1 : undefined,
    className: itemTrigger({ className }),
    onClick: (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    },
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type InboxItemSelectionProps = useRender.ComponentProps<"div">;
export function InboxItemSelection({ className, render, ...props }: InboxItemSelectionProps) {
  const theme = useThemeFamily();
  const { itemSelection } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-selection",
    className: itemSelection({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemContentProps = useRender.ComponentProps<"div">;
export function InboxItemContent({ className, render, ...props }: InboxItemContentProps) {
  const theme = useThemeFamily();
  const { itemContent } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-content",
    className: itemContent({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemContextProps = useRender.ComponentProps<"div">;
export function InboxItemContext({ className, render, ...props }: InboxItemContextProps) {
  const theme = useThemeFamily();
  const { itemContext } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-context",
    className: itemContext({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemSubtitleProps = useRender.ComponentProps<"div">;
export function InboxItemSubtitle({ className, render, ...props }: InboxItemSubtitleProps) {
  const theme = useThemeFamily();
  const { itemSubtitle } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-subtitle",
    className: itemSubtitle({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemHeadingProps = useRender.ComponentProps<"div">;
export function InboxItemHeading({ className, render, ...props }: InboxItemHeadingProps) {
  const theme = useThemeFamily();
  const { itemHeading } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-heading",
    className: itemHeading({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemTitleProps = useRender.ComponentProps<"div">;
export function InboxItemTitle({ className, render, ...props }: InboxItemTitleProps) {
  const theme = useThemeFamily();
  const { itemTitle } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-title",
    className: itemTitle({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemTrailingProps = useRender.ComponentProps<"div">;
export function InboxItemTrailing({ className, render, ...props }: InboxItemTrailingProps) {
  const theme = useThemeFamily();
  const { itemTrailing } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-trailing",
    className: itemTrailing({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemTimestampProps = useRender.ComponentProps<"span">;
export function InboxItemTimestamp({ className, render, ...props }: InboxItemTimestampProps) {
  const theme = useThemeFamily();
  const { itemTimestamp } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "inbox-item-timestamp",
    className: itemTimestamp({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type InboxItemBodyProps = useRender.ComponentProps<"p">;
export function InboxItemBody({ className, render, ...props }: InboxItemBodyProps) {
  const theme = useThemeFamily();
  const { itemBody } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"p"> = {
    "data-slot": "inbox-item-body",
    className: itemBody({ className }),
  };
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type InboxItemMessageProps = useRender.ComponentProps<"p">;
export function InboxItemMessage({ className, render, ...props }: InboxItemMessageProps) {
  const theme = useThemeFamily();
  const { itemMessage } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"p"> = {
    "data-slot": "inbox-item-message",
    className: itemMessage({ className }),
  };
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type InboxItemSenderProps = useRender.ComponentProps<"span">;
export function InboxItemSender({ className, render, ...props }: InboxItemSenderProps) {
  const theme = useThemeFamily();
  const { itemSender } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "inbox-item-sender",
    className: itemSender({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type InboxItemMetadataProps = useRender.ComponentProps<"div">;
export function InboxItemMetadata({ className, render, ...props }: InboxItemMetadataProps) {
  const theme = useThemeFamily();
  const { itemMetadata } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-metadata",
    className: itemMetadata({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemActionsProps = useRender.ComponentProps<"div">;
export function InboxItemActions({ className, render, ...props }: InboxItemActionsProps) {
  const theme = useThemeFamily();
  const { itemActions } = inboxItem({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-actions",
    className: itemActions({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
