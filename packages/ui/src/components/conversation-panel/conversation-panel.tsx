import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Panel, PanelBody, PanelFooter, PanelHeaderFrame } from "../panel/panel";
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

export type PanelHeaderProps = useRender.ComponentProps<"div">;

export function PanelHeader({ children, className, render, ...props }: PanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = conversationPanel({ theme });
  return (
    <PanelHeaderFrame
      {...props}
      render={render}
      data-slot="panel-header"
      className={header({ className })}
    >
      {children}
    </PanelHeaderFrame>
  );
}

export type PanelSectionHeaderProps = useRender.ComponentProps<"div">;

export function PanelSectionHeader({
  children,
  className,
  render,
  ...props
}: PanelSectionHeaderProps) {
  const theme = useThemeFamily();
  const { sectionHeader } = conversationPanel({ theme });

  return (
    <PanelHeaderFrame
      {...props}
      render={render}
      data-slot="panel-section-header"
      className={sectionHeader({ className })}
    >
      {children}
    </PanelHeaderFrame>
  );
}

export type PanelHeaderIconProps = useRender.ComponentProps<"div">;

export function PanelHeaderIcon({ className, render, ...props }: PanelHeaderIconProps) {
  const theme = useThemeFamily();
  const { headerIcon } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-header-icon",
    className: headerIcon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelHeaderContentProps = useRender.ComponentProps<"div">;

export function PanelHeaderContent({ className, render, ...props }: PanelHeaderContentProps) {
  const theme = useThemeFamily();
  const { headerContent } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-header-content",
    className: headerContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelHeadingProps = useRender.ComponentProps<"div">;

export function PanelHeading({ className, render, ...props }: PanelHeadingProps) {
  const { heading } = conversationPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-heading",
    className: heading({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelTitleProps = useRender.ComponentProps<"div">;

export function PanelTitle({ className, render, ...props }: PanelTitleProps) {
  const theme = useThemeFamily();
  const { title } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelMetaProps = useRender.ComponentProps<"div"> & {
  size?: "sm" | "md";
};

export function PanelMeta({ className, render, size = "sm", ...props }: PanelMetaProps) {
  const theme = useThemeFamily();
  const { meta } = conversationPanel({ theme, size });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type PanelStatusProps = useRender.ComponentProps<"span">;

export function PanelStatus({ className, render, ...props }: PanelStatusProps) {
  const theme = useThemeFamily();
  const { status } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "panel-status",
    className: status({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type PanelActionsProps = useRender.ComponentProps<"div">;

export function PanelActions({ className, render, ...props }: PanelActionsProps) {
  const theme = useThemeFamily();
  const { actions } = conversationPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "panel-actions",
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
