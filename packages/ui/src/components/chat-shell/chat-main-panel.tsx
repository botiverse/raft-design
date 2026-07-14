import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button";
import { chatMainPanel } from "./chat-main-panel.recipe";
import type { SlotElementProps } from "../../lib/data-attributes";

export type ChatMainPanelRootProps = useRender.ComponentProps<"section">;

export function ChatMainPanelRoot({ className, render, ...props }: ChatMainPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"section"> = {
    "data-slot": "chat-main-panel-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

function ChatMainPanelHeaderMask() {
  const theme = useThemeFamily();
  const { headerMask, headerMaskLayer } = chatMainPanel({ theme });

  return (
    <div aria-hidden data-slot="chat-main-panel-header-mask" className={headerMask()}>
      <div
        data-slot="chat-main-panel-header-mask-layer"
        data-layer="solid"
        className={headerMaskLayer()}
      />
      <div
        data-slot="chat-main-panel-header-mask-layer"
        data-layer="soft"
        className={headerMaskLayer()}
      />
      <div
        data-slot="chat-main-panel-header-mask-layer"
        data-layer="blur"
        className={headerMaskLayer()}
      />
    </div>
  );
}

export type ChatMainPanelHeaderProps = useRender.ComponentProps<"div">;

export function ChatMainPanelHeader({
  children,
  className,
  render,
  ...props
}: ChatMainPanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-header",
    className: header({ className }),
    children: (
      <>
        <ChatMainPanelHeaderMask />
        {children}
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelSectionHeaderProps = useRender.ComponentProps<"div">;

export function ChatMainPanelSectionHeader({
  children,
  className,
  render,
  ...props
}: ChatMainPanelSectionHeaderProps) {
  const theme = useThemeFamily();
  const { header } = chatMainPanel({ theme, headerMode: "section" });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-header",
    className: header({ className }),
    children: (
      <>
        <ChatMainPanelHeaderMask />
        {children}
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelHeaderIconProps = useRender.ComponentProps<"div">;

export function ChatMainPanelHeaderIcon({
  className,
  render,
  ...props
}: ChatMainPanelHeaderIconProps) {
  const theme = useThemeFamily();
  const { headerIcon } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-header-icon",
    className: headerIcon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTitleBlockProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTitleBlock({
  className,
  render,
  ...props
}: ChatMainPanelTitleBlockProps) {
  const theme = useThemeFamily();
  const { titleBlock } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-title-block",
    className: titleBlock({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTitleRowProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTitleRow({ className, render, ...props }: ChatMainPanelTitleRowProps) {
  const { titleRow } = chatMainPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-title-row",
    className: titleRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTitleProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTitle({ className, render, ...props }: ChatMainPanelTitleProps) {
  const theme = useThemeFamily();
  const { title } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-title",
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelSubtitleProps = useRender.ComponentProps<"div"> & {
  size?: "sm" | "md";
};

export function ChatMainPanelSubtitle({
  className,
  render,
  size = "sm",
  ...props
}: ChatMainPanelSubtitleProps) {
  const theme = useThemeFamily();
  const { subtitle } = chatMainPanel({ subtitleSize: size, theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-subtitle",
    className: subtitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTitleBadgeProps = useRender.ComponentProps<"span">;

export function ChatMainPanelTitleBadge({
  className,
  render,
  ...props
}: ChatMainPanelTitleBadgeProps) {
  const theme = useThemeFamily();
  const { titleBadge } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-main-panel-title-badge",
    className: titleBadge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatMainPanelActionsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelActions({ className, render, ...props }: ChatMainPanelActionsProps) {
  const { actions } = chatMainPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelContentProps = useRender.ComponentProps<"div">;

/**
 * Content region below the main-panel header. A single surface hosting tabs,
 * body, and footer; elegant mobile sits flush to the bottom with top radius
 * and top gap only; desktop keeps the left inset / rounded-tl treatment.
 */
export function ChatMainPanelContent({ className, render, ...props }: ChatMainPanelContentProps) {
  const theme = useThemeFamily();
  const { content } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-content",
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelBodyProps = useRender.ComponentProps<"div">;

export function ChatMainPanelBody({ className, render, ...props }: ChatMainPanelBodyProps) {
  const theme = useThemeFamily();
  const { body } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-body",
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTabsProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTabs({ className, render, ...props }: ChatMainPanelTabsProps) {
  const theme = useThemeFamily();
  const { tabs } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-tabs",
    className: tabs({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelTimelineProps = useRender.ComponentProps<"div">;

export function ChatMainPanelTimeline({ className, render, ...props }: ChatMainPanelTimelineProps) {
  const theme = useThemeFamily();
  const { timeline } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-timeline",
    className: timeline({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelMessageListProps = useRender.ComponentProps<"div">;

export function ChatMainPanelMessageList({
  className,
  render,
  ...props
}: ChatMainPanelMessageListProps) {
  const { messageList } = chatMainPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-message-list",
    className: messageList({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelFooterProps = useRender.ComponentProps<"form">;

export function ChatMainPanelFooter({ className, render, ...props }: ChatMainPanelFooterProps) {
  const theme = useThemeFamily();
  const { footer } = chatMainPanel({ theme });
  const defaultProps: SlotElementProps<"form"> = {
    "data-slot": "chat-main-panel-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "form",
    render,
    props: mergeProps<"form">(defaultProps, props),
  });
}

export type ChatMainPanelJumpToLatestLayoutProps = useRender.ComponentProps<"div">;

export function ChatMainPanelJumpToLatestLayout({
  className,
  render,
  ...props
}: ChatMainPanelJumpToLatestLayoutProps) {
  const { jumpToLatestLayout } = chatMainPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-main-panel-jump-to-latest-layout",
    className: jumpToLatestLayout({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelJumpToLatestProps = useRender.ComponentProps<"button"> &
  Pick<ButtonProps, "size" | "loading" | "loadingLabel">;

export function ChatMainPanelJumpToLatest({
  className,
  render,
  size = "sm",
  loading,
  loadingLabel,
  ...props
}: ChatMainPanelJumpToLatestProps) {
  return (
    <Button
      type="button"
      data-slot="chat-main-panel-jump-to-latest"
      className={className}
      variant="outline"
      size={size}
      loading={loading}
      loadingLabel={loadingLabel}
      render={render}
      {...props}
    />
  );
}
