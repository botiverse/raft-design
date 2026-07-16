import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "../panel/panel";
import { conversationPanel } from "./conversation-panel.recipe";
import type { SlotElementProps } from "../../lib/data-attributes";

export type ConversationPanelRootProps = useRender.ComponentProps<"section">;

export function ConversationPanelRoot({ className, render, ...props }: ConversationPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = conversationPanel({ theme });

  return (
    <Panel
      {...props}
      render={render}
      data-slot="conversation-panel-root"
      className={root({ className })}
    />
  );
}

export type ConversationPanelHeaderProps = useRender.ComponentProps<"div"> & {
  mobileSticky?: boolean;
};

export function ConversationPanelHeader({
  children,
  className,
  mobileSticky = false,
  render,
  ...props
}: ConversationPanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = conversationPanel({ theme, mobileSticky });
  return (
    <PanelHeader
      {...props}
      render={render}
      data-slot="conversation-panel-header"
      className={header({ className })}
    >
      {children}
    </PanelHeader>
  );
}

export type ConversationPanelSectionHeaderProps = useRender.ComponentProps<"div">;

export function ConversationPanelSectionHeader({
  children,
  className,
  render,
  ...props
}: ConversationPanelSectionHeaderProps) {
  const theme = useThemeFamily();
  const { header, sectionHeader } = conversationPanel({ theme });

  return (
    <PanelHeader
      {...props}
      render={render}
      data-slot="conversation-panel-section-header"
      className={header({ className: cn(sectionHeader(), className) })}
    >
      {children}
    </PanelHeader>
  );
}

export type ConversationPanelHeaderIconProps = useRender.ComponentProps<"div">;

export function ConversationPanelHeaderIcon({
  className,
  render,
  ...props
}: ConversationPanelHeaderIconProps) {
  const theme = useThemeFamily();
  const { headerIcon } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-header-icon",
    className: headerIcon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelHeaderContentProps = useRender.ComponentProps<"div">;

export function ConversationPanelHeaderContent({
  className,
  render,
  ...props
}: ConversationPanelHeaderContentProps) {
  const theme = useThemeFamily();
  const { headerContent } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-header-content",
    className: headerContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelHeadingProps = useRender.ComponentProps<"div">;

export function ConversationPanelHeading({
  className,
  render,
  ...props
}: ConversationPanelHeadingProps) {
  const { heading } = conversationPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-heading",
    className: heading({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelTitleProps = useRender.ComponentProps<"div">;

export function ConversationPanelTitle({
  className,
  render,
  ...props
}: ConversationPanelTitleProps) {
  const theme = useThemeFamily();
  const { title } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelMetaProps = useRender.ComponentProps<"div"> & {
  size?: "sm" | "md";
};

export function ConversationPanelMeta({
  className,
  render,
  size = "sm",
  ...props
}: ConversationPanelMetaProps) {
  const theme = useThemeFamily();
  const { meta } = conversationPanel({ theme, size });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ConversationPanelStatusProps = useRender.ComponentProps<"span"> & {
  mobileVisible?: boolean;
};

export function ConversationPanelStatus({
  className,
  mobileVisible = false,
  render,
  ...props
}: ConversationPanelStatusProps) {
  const theme = useThemeFamily();
  const { status } = conversationPanel({ theme, mobileVisible });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "conversation-panel-status",
    className: status({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ConversationPanelActionsProps = useRender.ComponentProps<"div">;

export function ConversationPanelActions({
  className,
  render,
  ...props
}: ConversationPanelActionsProps) {
  const theme = useThemeFamily();
  const { actions } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "conversation-panel-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
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
