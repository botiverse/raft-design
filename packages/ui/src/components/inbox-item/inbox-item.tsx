import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useContext } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import { TaskStatusBadge } from "../tasks/task-status-badge";
import type { TaskStatusBadgeProps } from "../tasks/task-status-badge";
import { TaskStatusIcon } from "../tasks/task-status-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import { inboxItem } from "./inbox-item.recipe";

const InboxItemDisabledContext = createContext(false);
const InboxItemDensityContext = createContext<InboxItemDensity | undefined>(undefined);

/** The content lets the pointer through to the trigger; a part that takes it hands its click on. */
function openItemFrom(event: ReactMouseEvent<HTMLElement>) {
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
}

/**
 * `compact`: one line for the title and one for the excerpt, the row centred
 * on its leading visual (a conversation list). Without `InboxItemTrailing` both
 * lines run the full width: the time at the end of the heading, the marks at
 * the end of `InboxItemLine`. With it, the trailing column is set on the same
 * two lines. Leave it unset for the default two-line rows.
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
  const density = useContext(InboxItemDensityContext);
  const { itemContent } = inboxItem({ density });
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
  const density = useContext(InboxItemDensityContext);
  const { itemHeading } = inboxItem({ density });
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

/**
 * The time. In a compact row without `InboxItemTrailing`, put it in
 * `InboxItemHeading`, after the title: it takes the pointer there, so it can
 * carry a tooltip, and a click on it still opens the item. A tooltip's trigger
 * replaces `data-slot`, so the heading finds the time by `data-inbox-item-time`.
 */
export type InboxItemTimestampProps = useRender.ComponentProps<"span"> & {
  /**
   * `hover`, for an older row in a compact list: hidden at rest, so the title
   * takes its room. It shows in the same place, without animation, while the
   * row is hovered or it or a control in it holds keyboard focus; a touch screen
   * never hovers, so there it stays hidden. While hidden it isn't read out: say
   * the time in the trigger's name.
   */
  reveal?: "hover";
};
export function InboxItemTimestamp({
  className,
  onClick,
  render,
  reveal,
  ...props
}: InboxItemTimestampProps) {
  const density = useContext(InboxItemDensityContext);
  const { itemTimestamp } = inboxItem({ density, reveal });
  const defaultProps: SlotElementProps<"span"> = {
    "data-inbox-item-time": "",
    "data-slot": "inbox-item-timestamp",
    className: itemTimestamp({ className }),
    onClick: (event) => {
      onClick?.(event);
      openItemFrom(event);
    },
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

/**
 * The excerpt's line in a compact row without `InboxItemTrailing`:
 * `InboxItemBody` or `InboxItemMessage`, taking the room, then `InboxItemMarks`.
 * Marks with nothing in them take no room.
 */
export type InboxItemLineProps = useRender.ComponentProps<"div">;
export function InboxItemLine({ className, render, ...props }: InboxItemLineProps) {
  const { itemLine } = inboxItem();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "inbox-item-line",
    className: itemLine({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

/**
 * Marks at the end of a line: a mention, muted, an unread count. At the end of
 * `InboxItemLine`, or a 20px line of its own in `InboxItemTrailing`, so it sits
 * beside the excerpt either way.
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
 * A task's status in the marks of a compact row without `InboxItemTrailing`.
 * The word is the status chip's, and in a row narrower than 360px the row keeps
 * only the chip's pixel, with the word in a tooltip on it. The row is the size
 * container, so it is the row that is measured, not the window. Pass an `id` to
 * name the word in the trigger's `aria-labelledby`, as it isn't on screen there.
 */
export type InboxItemStatusProps = Omit<TaskStatusBadgeProps, "children" | "render" | "size"> & {
  /** The status's word. The caller owns the copy and its localization. */
  children: string;
};
export function InboxItemStatus({ children, className, status, ...props }: InboxItemStatusProps) {
  const { itemStatusWord, itemStatusPixel } = inboxItem();
  return (
    <>
      <TaskStatusBadge
        status={status}
        size="sm"
        className={itemStatusWord({ className })}
        {...props}
      >
        {children}
      </TaskStatusBadge>
      <Tooltip>
        <TooltipTrigger
          render={<InboxItemHoverTarget className={itemStatusPixel()} />}
          role="img"
          aria-label={children}
          data-slot="inbox-item-status-pixel"
        >
          <TaskStatusIcon status={status} />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </>
  );
}

/**
 * A day's or a group's heading among the rows, placed straight in the list's
 * column: it starts on the rows' content line, 8px over the next row's shape
 * with the list's gap, and further from the row above it. An `h3`: render
 * another level if the list's title isn't an `h2`. To keep it in view while its
 * rows scroll, the list makes it sticky and gives it the list's surface.
 */
export type InboxItemListHeadingProps = useRender.ComponentProps<"h3">;
export function InboxItemListHeading({ className, render, ...props }: InboxItemListHeadingProps) {
  const { itemListHeading } = inboxItem();
  const defaultProps: SlotElementProps<"h3"> = {
    "data-slot": "inbox-item-list-heading",
    className: itemListHeading({ className }),
  };
  return useRender({
    defaultTagName: "h3",
    render,
    props: mergeProps<"h3">(defaultProps, props),
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
      openItemFrom(event);
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
   * holds focus, is `active` or has a menu open. Give the button
   * `variant="ghost"` here. On a touch screen (`pointer: coarse`) they show at
   * rest. In a compact row without `InboxItemTrailing`, put them last in
   * `InboxItemContent`: they centre on the row and both lines end short of them,
   * the time and the marks moving over and staying visible (room for one
   * 32px button). In `InboxItemTrailing` they take the place of the timestamp,
   * the marks and the attention dot, which step aside; on a touch screen the
   * rest of the trailing column moves over to make room.
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
