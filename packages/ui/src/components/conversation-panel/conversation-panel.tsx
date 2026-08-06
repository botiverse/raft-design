import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Panel, PanelBody, PanelFooter } from "../panel/panel";
import { conversationPanel } from "./conversation-panel.recipe";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { PanelEdge } from "../panel/panel";

export type ConversationPanelRootProps = useRender.ComponentProps<"section"> & {
  edge?: PanelEdge;
};

export function ConversationPanelRoot({
  className,
  edge = "inset",
  render,
  ...props
}: ConversationPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = conversationPanel({ theme });

  return (
    <Panel
      {...props}
      render={render}
      edge={edge}
      data-slot="conversation-panel-root"
      className={root({ className })}
    />
  );
}

export type ConversationPanelContentProps = useRender.ComponentProps<"div">;

/**
 * Content region below the conversation header. A single container hosting tabs,
 * body, and footer; elegant mobile sits flush to the bottom with top radius
 * and top gap only; desktop keeps the left inset / rounded-tl treatment.
 */
export function ConversationPanelContent({
  className,
  render,
  ...props
}: ConversationPanelContentProps) {
  const theme = useThemeFamily();
  const { content } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelBodyProps = useRender.ComponentProps<"div">;

export function ConversationPanelBody({ className, render, ...props }: ConversationPanelBodyProps) {
  return (
    <PanelBody
      {...props}
      render={render}
      data-slot="conversation-panel-body"
      className={className}
    />
  );
}

export type ConversationPanelTabsProps = useRender.ComponentProps<"div">;

export function ConversationPanelTabs({ className, render, ...props }: ConversationPanelTabsProps) {
  const theme = useThemeFamily();
  const { tabs } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-tabs",
    className: tabs({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelFooterProps = useRender.ComponentProps<"div">;

export function ConversationPanelFooter({
  className,
  render,
  ...props
}: ConversationPanelFooterProps) {
  const theme = useThemeFamily();
  const { footer } = conversationPanel({ theme });

  return (
    <PanelFooter
      {...props}
      render={render}
      data-slot="conversation-panel-footer"
      className={footer({ className })}
    />
  );
}
