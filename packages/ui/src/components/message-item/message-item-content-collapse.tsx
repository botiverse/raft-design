import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useContext, useId, useMemo, type ReactNode } from "react";

import { useThemeFamily } from "../../lib/theme/use-theme";
import { type SlotElementProps } from "../../lib/data-attributes";
import { messageItem } from "./message-item.recipe";

export const MESSAGE_ITEM_CONTENT_COLLAPSE_HEIGHT = 320;

type ContentCollapseContextValue = {
  collapseHeight: number;
  collapsed: boolean;
  collapsible: boolean;
  expanded: boolean;
  panelId: string;
  setExpanded: (expanded: boolean) => void;
};

const ContentCollapseContext = createContext<ContentCollapseContextValue | null>(null);

function useContentCollapseContext() {
  const context = useContext(ContentCollapseContext);
  if (!context) {
    throw new Error(
      "MessageItemContentCollapse parts must be used within MessageItemContentCollapse.",
    );
  }
  return context;
}

export type MessageItemContentCollapseProps = useRender.ComponentProps<"div"> & {
  collapseHeight?: number;
  collapsible: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function MessageItemContentCollapse({
  children,
  className,
  collapseHeight = MESSAGE_ITEM_CONTENT_COLLAPSE_HEIGHT,
  collapsible,
  expanded,
  onExpandedChange,
  render,
  ...props
}: MessageItemContentCollapseProps) {
  const theme = useThemeFamily();
  const { contentCollapse } = messageItem({ theme });
  const panelId = useId();
  const context = useMemo<ContentCollapseContextValue>(
    () => ({
      collapseHeight,
      collapsed: collapsible && !expanded,
      collapsible,
      expanded,
      panelId,
      setExpanded: onExpandedChange,
    }),
    [collapseHeight, collapsible, expanded, onExpandedChange, panelId],
  );
  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-slot": "message-item-content-collapse",
    "data-collapsed": context.collapsed ? "true" : undefined,
    "data-collapsible": collapsible ? "true" : undefined,
    "data-expanded": expanded ? "true" : undefined,
    className: contentCollapse({ className }),
  };
  const content = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props, { children }),
    state: {
      collapsed: context.collapsed,
      collapsible,
      expanded,
      slot: "message-item-content-collapse",
    },
  });

  return (
    <ContentCollapseContext.Provider value={context}>{content}</ContentCollapseContext.Provider>
  );
}

export type MessageItemContentCollapsePanelProps = useRender.ComponentProps<"div">;

export function MessageItemContentCollapsePanel({
  children,
  className,
  render,
  ...props
}: MessageItemContentCollapsePanelProps) {
  const context = useContentCollapseContext();
  const theme = useThemeFamily();
  const { contentCollapseFade, contentCollapseFadeLayer, contentCollapsePanel } = messageItem({
    theme,
  });

  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-slot": "message-item-content-collapse-panel",
    "data-collapsed": context.collapsed ? "true" : undefined,
    id: context.panelId,
    className: contentCollapsePanel({
      className: [context.collapsed && "overflow-hidden", className],
    }),
    onFocusCapture: () => {
      if (context.collapsed) context.setExpanded(true);
    },
    style: context.collapsed ? { maxHeight: context.collapseHeight } : undefined,
  };

  const content = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props, {
      children: (
        <>
          {children}
          {context.collapsed ? (
            <div
              aria-hidden
              data-slot="message-item-content-collapse-fade"
              className={contentCollapseFade()}
            >
              <div
                data-layer="solid"
                data-slot="message-item-content-collapse-fade-layer"
                className={contentCollapseFadeLayer()}
              />
              <div
                data-layer="blur"
                data-slot="message-item-content-collapse-fade-layer"
                className={contentCollapseFadeLayer()}
              />
            </div>
          ) : null}
        </>
      ),
    }),
    state: {
      collapsed: context.collapsed,
      expanded: context.expanded,
      slot: "message-item-content-collapse-panel",
    },
  });

  return content;
}

export type MessageItemContentCollapseTriggerProps = Omit<
  useRender.ComponentProps<"button">,
  "children"
> & {
  children:
    | ReactNode
    | ((state: Pick<ContentCollapseContextValue, "collapsible" | "expanded">) => ReactNode);
};

export function MessageItemContentCollapseTrigger({
  children,
  className,
  onClick,
  render,
  ...props
}: MessageItemContentCollapseTriggerProps) {
  const context = useContentCollapseContext();
  const theme = useThemeFamily();
  const { contentCollapseTrigger } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"button"> & SlotElementProps<"button"> = {
    type: "button",
    "aria-controls": context.panelId,
    "aria-expanded": context.expanded,
    "data-slot": "message-item-content-collapse-trigger",
    className: contentCollapseTrigger({ className }),
    onClick: (event) => {
      event.stopPropagation();
      context.setExpanded(!context.expanded);
      onClick?.(event);
    },
  };
  const content =
    typeof children === "function"
      ? children({ collapsible: context.collapsible, expanded: context.expanded })
      : children;

  const trigger = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props, { children: content }),
    state: {
      collapsible: context.collapsible,
      expanded: context.expanded,
      slot: "message-item-content-collapse-trigger",
    },
  });

  return context.collapsible ? trigger : null;
}
