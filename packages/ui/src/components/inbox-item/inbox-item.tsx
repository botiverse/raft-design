import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useContext } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { inboxItem } from "./inbox-item.recipe";

const InboxItemDisabledContext = createContext(false);
const InboxItemDensityContext = createContext<InboxItemDensity | undefined>(undefined);

/**
 * `compact`: one line for the title and one for the excerpt, the row centred
 * on its leading visual, and the trailing column set on the same two 20px
 * lines (a conversation list). Leave it unset for the default two-line rows.
 */
export type InboxItemDensity = "compact";

export type InboxItemProps = useRender.ComponentProps<"div"> & {
  active?: boolean;
  density?: InboxItemDensity;
  disabled?: boolean;
};
export function InboxItem({
  active = false,
  className,
  density,
  disabled = false,
  render,
  ...props
}: InboxItemProps) {
  const { item } = inboxItem({ density });
  const defaultProps: SlotElementProps<"div"> = {
    "aria-disabled": disabled || undefined,
    "data-active": active ? "true" : undefined,
    "data-density": density,
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
      <InboxItemDensityContext.Provider value={density}>{element}</InboxItemDensityContext.Provider>
    </InboxItemDisabledContext.Provider>
  );
}

export type InboxItemTriggerProps = Omit<useRender.ComponentProps<"button">, "type">;

export function InboxItemTrigger({ className, onClick, render, ...props }: InboxItemTriggerProps) {
  const disabled = useContext(InboxItemDisabledContext);
  const { itemTrigger } = inboxItem();
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

/**
 * A leading visual before the content: a 36px avatar, a channel tile. The
 * divider between rows starts after it.
 */
export type InboxItemLeadingProps = useRender.ComponentProps<"div">;
export function InboxItemLeading({ className, render, ...props }: InboxItemLeadingProps) {
  const { itemLeading } = inboxItem();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-leading",
    className: itemLeading({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type InboxItemSelectionProps = useRender.ComponentProps<"div">;
export function InboxItemSelection({ className, render, ...props }: InboxItemSelectionProps) {
  const { itemSelection } = inboxItem();
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
  const { itemContent } = inboxItem();
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
  const { itemContext } = inboxItem();
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
  const { itemSubtitle } = inboxItem();
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
  const { itemHeading } = inboxItem();
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
  const density = useContext(InboxItemDensityContext);
  const { itemTitle } = inboxItem({ density });
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
  const density = useContext(InboxItemDensityContext);
  const { itemTrailing } = inboxItem({ density });
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
  const density = useContext(InboxItemDensityContext);
  const { itemTimestamp } = inboxItem({ density });
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

/**
 * Marks at the end of a line: a mention, muted, an unread count. A 20px line
 * of its own in `InboxItemTrailing`, so it sits beside the excerpt.
 */
export type InboxItemMarksProps = useRender.ComponentProps<"div">;
export function InboxItemMarks({ className, render, ...props }: InboxItemMarksProps) {
  const { itemMarks } = inboxItem();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-marks",
    className: itemMarks({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

/**
 * Takes the pointer inside the content, which otherwise lets it through to
 * the trigger, so a badge's tooltip opens on hover. A click on it still opens
 * the item: it is passed on to `InboxItemTrigger`.
 */
export type InboxItemHoverTargetProps = useRender.ComponentProps<"span">;
export function InboxItemHoverTarget({
  className,
  onClick,
  render,
  ...props
}: InboxItemHoverTargetProps) {
  const { itemHoverTarget } = inboxItem();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "inbox-item-hover-target",
    className: itemHoverTarget({ className }),
    onClick: (event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      const trigger = event.currentTarget
        .closest("[data-slot=inbox-item]")
        ?.querySelector<HTMLElement>("[data-slot=inbox-item-open]");
      if (!trigger) return;
      trigger.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          detail: event.detail,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
        }),
      );
    },
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type InboxItemBodyProps = useRender.ComponentProps<"p">;
export function InboxItemBody({ className, render, ...props }: InboxItemBodyProps) {
  const density = useContext(InboxItemDensityContext);
  const { itemBody } = inboxItem({ density });
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
  const density = useContext(InboxItemDensityContext);
  const { itemMessage } = inboxItem({ density });
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
  const { itemSender } = inboxItem();
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
  const { itemMetadata } = inboxItem();
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

export type InboxItemActionsProps = useRender.ComponentProps<"div"> & {
  /**
   * `hover`: with a mouse, the actions stay hidden until the row is hovered,
   * holds focus, is `active` or has a menu open, and then take the place of
   * the rest of `InboxItemTrailing` (the timestamp, the marks, the attention
   * dot), which steps aside. On a touch screen (`pointer: coarse`) they show
   * at rest and the rest of the trailing column moves over to make room.
   */
  reveal?: "hover";
};
export function InboxItemActions({ className, render, reveal, ...props }: InboxItemActionsProps) {
  const density = useContext(InboxItemDensityContext);
  const { itemActions } = inboxItem({ density, reveal });
  const defaultProps: SlotElementProps<"div"> = {
    "data-reveal": reveal,
    "data-slot": "inbox-item-actions",
    className: itemActions({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
