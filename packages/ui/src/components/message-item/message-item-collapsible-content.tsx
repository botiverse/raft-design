import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useThemeFamily } from "../../lib/theme/use-theme";
import { type SlotElementProps } from "../../lib/data-attributes";
import { messageItem } from "./message-item.recipe";

export const MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT = 320;

type CollapsibleContentContextValue = {
  collapseHeight: number;
  collapsed: boolean;
  disabled: boolean;
  expanded: boolean;
  overflows: boolean;
  panelId: string;
  setExpanded: (expanded: boolean) => void;
  setOverflows: (overflows: boolean) => void;
};

const CollapsibleContentContext = createContext<CollapsibleContentContextValue | null>(null);

function useCollapsibleContentContext() {
  const context = useContext(CollapsibleContentContext);
  if (!context) {
    throw new Error(
      "MessageItemCollapsibleContent parts must be used within MessageItemCollapsibleContent.",
    );
  }
  return context;
}

const observedContentCallbacks = new Map<Element, (height: number) => void>();
let sharedResizeObserver: ResizeObserver | null = null;

function getResizeObserverEntryHeight(entry: ResizeObserverEntry) {
  const borderBoxSize = entry.borderBoxSize as
    | ResizeObserverSize
    | readonly ResizeObserverSize[]
    | undefined;
  const firstBoxSize = Array.isArray(borderBoxSize) ? borderBoxSize[0] : borderBoxSize;
  return firstBoxSize?.blockSize ?? entry.contentRect.height;
}

function observeContentHeight(element: HTMLElement, onMeasure: (height: number) => void) {
  if (typeof ResizeObserver === "undefined") {
    onMeasure(element.scrollHeight);
    return () => {};
  }

  if (!sharedResizeObserver) {
    sharedResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        observedContentCallbacks.get(entry.target)?.(getResizeObserverEntryHeight(entry));
      }
    });
  }

  observedContentCallbacks.set(element, onMeasure);
  sharedResizeObserver.observe(element);
  onMeasure(element.scrollHeight);

  return () => {
    sharedResizeObserver?.unobserve(element);
    observedContentCallbacks.delete(element);
    if (observedContentCallbacks.size === 0) {
      sharedResizeObserver?.disconnect();
      sharedResizeObserver = null;
    }
  };
}

export function messageItemContentOverflows(
  height: number,
  threshold = MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT,
) {
  return height > threshold;
}

export type MessageItemCollapsibleContentProps = useRender.ComponentProps<"div"> & {
  collapseHeight?: number;
  defaultExpanded?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export function MessageItemCollapsibleContent({
  children,
  className,
  collapseHeight = MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT,
  defaultExpanded = false,
  disabled = false,
  expanded: expandedProp,
  onExpandedChange,
  render,
  ...props
}: MessageItemCollapsibleContentProps) {
  const theme = useThemeFamily();
  const { collapsibleContent } = messageItem({ theme });
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const [overflows, setOverflows] = useState(false);
  const panelId = useId();
  const expanded = disabled || (expandedProp ?? uncontrolledExpanded);
  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (expandedProp === undefined) setUncontrolledExpanded(nextExpanded);
      onExpandedChange?.(nextExpanded);
    },
    [expandedProp, onExpandedChange],
  );
  const context = useMemo<CollapsibleContentContextValue>(
    () => ({
      collapseHeight,
      collapsed: overflows && !expanded,
      disabled,
      expanded,
      overflows,
      panelId,
      setExpanded,
      setOverflows,
    }),
    [collapseHeight, disabled, expanded, overflows, panelId, setExpanded],
  );
  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-slot": "message-item-collapsible-content",
    "data-collapsed": context.collapsed ? "true" : undefined,
    "data-expanded": expanded ? "true" : undefined,
    "data-overflow": overflows ? "true" : undefined,
    className: collapsibleContent({ className }),
  };
  const content = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props, { children }),
    state: {
      collapsed: context.collapsed,
      expanded,
      overflow: overflows,
      slot: "message-item-collapsible-content",
    },
  });

  return (
    <CollapsibleContentContext.Provider value={context}>
      {disabled ? children : content}
    </CollapsibleContentContext.Provider>
  );
}

export type MessageItemCollapsibleContentPanelProps = useRender.ComponentProps<"div">;

export function MessageItemCollapsibleContentPanel({
  children,
  className,
  render,
  ...props
}: MessageItemCollapsibleContentPanelProps) {
  const context = useCollapsibleContentContext();
  const theme = useThemeFamily();
  const { collapsibleContentFade, collapsibleContentMeasure, collapsibleContentPanel } =
    messageItem({ theme });
  const measureRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (context.disabled) return;
    const measureElement = measureRef.current;
    if (!measureElement) return;
    return observeContentHeight(measureElement, (height) => {
      context.setOverflows(
        !context.disabled && messageItemContentOverflows(height, context.collapseHeight),
      );
    });
  }, [context]);

  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-slot": "message-item-collapsible-content-panel",
    "data-collapsed": context.collapsed ? "true" : undefined,
    id: context.panelId,
    className: collapsibleContentPanel({
      className: [context.collapsed && "overflow-hidden", className],
    }),
    onFocusCapture: (event) => {
      if (!context.collapsed || !(event.target instanceof HTMLElement)) return;
      const panelBounds = event.currentTarget.getBoundingClientRect();
      const focusedBounds = event.target.getBoundingClientRect();
      if (focusedBounds.bottom > panelBounds.bottom) context.setExpanded(true);
    },
    style: context.collapsed ? { maxHeight: context.collapseHeight } : undefined,
  };

  const content = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props, {
      children: (
        <>
          <div
            ref={measureRef}
            data-slot="message-item-collapsible-content-measure"
            className={collapsibleContentMeasure()}
          >
            {children}
          </div>
          {context.collapsed ? (
            <div
              aria-hidden
              data-slot="message-item-collapsible-content-fade"
              className={collapsibleContentFade()}
            />
          ) : null}
        </>
      ),
    }),
    state: {
      collapsed: context.collapsed,
      expanded: context.expanded,
      slot: "message-item-collapsible-content-panel",
    },
  });

  return context.disabled ? children : content;
}

export type MessageItemCollapsibleContentTriggerProps = Omit<
  useRender.ComponentProps<"button">,
  "children"
> & {
  children:
    | ReactNode
    | ((state: Pick<CollapsibleContentContextValue, "expanded" | "overflows">) => ReactNode);
};

export function MessageItemCollapsibleContentTrigger({
  children,
  className,
  onClick,
  render,
  ...props
}: MessageItemCollapsibleContentTriggerProps) {
  const context = useCollapsibleContentContext();
  const theme = useThemeFamily();
  const { collapsibleContentTrigger } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"button"> & SlotElementProps<"button"> = {
    type: "button",
    "aria-controls": context.panelId,
    "aria-expanded": context.expanded,
    "data-slot": "message-item-collapsible-content-trigger",
    className: collapsibleContentTrigger({ className }),
    onClick: (event) => {
      context.setExpanded(!context.expanded);
      onClick?.(event);
    },
  };
  const content =
    typeof children === "function"
      ? children({ expanded: context.expanded, overflows: context.overflows })
      : children;

  const trigger = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props, { children: content }),
    state: {
      expanded: context.expanded,
      overflow: context.overflows,
      slot: "message-item-collapsible-content-trigger",
    },
  });

  return context.disabled || !context.overflows ? null : trigger;
}
