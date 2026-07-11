import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button";
import type { DataAttributes } from "./app-shell";
import { chatMainPanel } from "./chat-main-panel.recipe";

export type ChatMainPanelRootProps = useRender.ComponentProps<"section">;

export function ChatMainPanelRoot({ className, render, ...props }: ChatMainPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"section"> & DataAttributes = {
    "data-slot": "chat-main-panel-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type ChatMainPanelHeaderProps = useRender.ComponentProps<"div">;

export function ChatMainPanelHeader({ className, render, ...props }: ChatMainPanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-header",
    className: header({ className }),
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-subtitle",
    className: subtitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelMutedBadgeProps = useRender.ComponentProps<"span">;

export function ChatMainPanelMutedBadge({
  className,
  render,
  ...props
}: ChatMainPanelMutedBadgeProps) {
  const theme = useThemeFamily();
  const { mutedBadge } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-main-panel-muted-badge",
    className: mutedBadge({ className }),
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-actions",
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelSurfaceInsetProps = useRender.ComponentProps<"div">;

export function ChatMainPanelSurfaceInset({
  className,
  render,
  ...props
}: ChatMainPanelSurfaceInsetProps) {
  const theme = useThemeFamily();
  const { surfaceInset } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-surface-inset",
    className: surfaceInset({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelSurfaceShadowProps = useRender.ComponentProps<"div">;

export function ChatMainPanelSurfaceShadow({
  className,
  render,
  ...props
}: ChatMainPanelSurfaceShadowProps) {
  const theme = useThemeFamily();
  const { surfaceShadow } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-surface-shadow",
    className: surfaceShadow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelSurfaceProps = useRender.ComponentProps<"div">;

export function ChatMainPanelSurface({ className, render, ...props }: ChatMainPanelSurfaceProps) {
  const theme = useThemeFamily();
  const { surface } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-main-panel-surface",
    className: surface({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatMainPanelContentProps = ChatMainPanelSurfaceProps;

/**
 * Complete content region below the main-panel header. The nested layers are
 * implementation chrome for inset spacing, shadow, and clipping; consumers
 * compose tabs, body, and footer directly as children.
 */
export function ChatMainPanelContent(props: ChatMainPanelContentProps) {
  return (
    <ChatMainPanelSurfaceInset>
      <ChatMainPanelSurfaceShadow>
        <ChatMainPanelSurface {...props} />
      </ChatMainPanelSurfaceShadow>
    </ChatMainPanelSurfaceInset>
  );
}

export type ChatMainPanelBodyProps = useRender.ComponentProps<"div">;

export function ChatMainPanelBody({ className, render, ...props }: ChatMainPanelBodyProps) {
  const theme = useThemeFamily();
  const { body } = chatMainPanel({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
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
  const defaultProps: useRender.ElementProps<"form"> & DataAttributes = {
    "data-slot": "chat-main-panel-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "form",
    render,
    props: mergeProps<"form">(defaultProps, props),
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
  const { jumpToLatest } = chatMainPanel();

  return (
    <div className={jumpToLatest({ className })}>
      <Button
        type="button"
        data-slot="chat-main-panel-jump-to-latest"
        variant="outline"
        size={size}
        loading={loading}
        loadingLabel={loadingLabel}
        render={render}
        {...props}
      />
    </div>
  );
}
