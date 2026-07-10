import { Button as BaseButton } from "@base-ui/react/button";
import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Status, type StatusProps } from "../status";
import type { DataAttributes } from "./app-shell";
import { chatSidebar } from "./chat-sidebar.recipe";

export type ChatSidebarSectionProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};

export function ChatSidebarSection({
  className,
  defaultOpen = true,
  render,
  ...props
}: ChatSidebarSectionProps) {
  const theme = useThemeFamily();
  const { sidebarSection } = chatSidebar({ theme });
  const defaultProps: ComponentProps<typeof Collapsible.Root> & DataAttributes = {
    "data-slot": "chat-sidebar-section",
    defaultOpen,
    className: sidebarSection({ className }),
  };

  return <Collapsible.Root render={render ?? <section />} {...mergeProps(defaultProps, props)} />;
}

export type ChatSidebarListProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};

export function ChatSidebarList({ className, render, ...props }: ChatSidebarListProps) {
  const { sidebarList } = chatSidebar();
  const defaultProps: ComponentProps<typeof Collapsible.Panel> & DataAttributes = {
    "data-slot": "chat-sidebar-list",
    className: sidebarList({ className }),
  };

  return <Collapsible.Panel render={render} {...mergeProps(defaultProps, props)} />;
}

export type ChatSidebarSectionHeaderProps = useRender.ComponentProps<"div">;

export function ChatSidebarSectionHeader({
  className,
  render,
  ...props
}: ChatSidebarSectionHeaderProps) {
  const theme = useThemeFamily();
  const { sidebarSectionHeader } = chatSidebar({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-section-header",
    className: sidebarSectionHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarSectionButtonProps = useRender.ComponentProps<"button">;

export function ChatSidebarSectionButton({
  className,
  render,
  ...props
}: ChatSidebarSectionButtonProps) {
  const theme = useThemeFamily();
  const { sidebarSectionButton } = chatSidebar({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-sidebar-section-button",
    className: sidebarSectionButton({ className }),
  };

  return useRender({
    render: render ?? <Collapsible.Trigger />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatSidebarSectionTitleProps = useRender.ComponentProps<"span">;

export function ChatSidebarSectionTitle({
  className,
  render,
  ...props
}: ChatSidebarSectionTitleProps) {
  const { sidebarSectionTitle } = chatSidebar();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-section-title",
    className: sidebarSectionTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarSectionCountProps = useRender.ComponentProps<"span">;

export function ChatSidebarSectionCount({
  className,
  render,
  ...props
}: ChatSidebarSectionCountProps) {
  const theme = useThemeFamily();
  const { sidebarSectionCount } = chatSidebar({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-section-count",
    className: sidebarSectionCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarSectionIndicatorProps = StatusProps;

export function ChatSidebarSectionIndicator({
  className,
  size = "md",
  variant = "accent",
  ...props
}: ChatSidebarSectionIndicatorProps) {
  const { sidebarSectionIndicator } = chatSidebar();
  return (
    <Status
      aria-hidden
      data-slot="chat-sidebar-section-indicator"
      size={size}
      variant={variant}
      className={sidebarSectionIndicator({ className })}
      {...props}
    />
  );
}

export type ChatSidebarSectionActionsProps = useRender.ComponentProps<"div">;

export function ChatSidebarSectionActions({
  className,
  render,
  ...props
}: ChatSidebarSectionActionsProps) {
  const { sidebarSectionActions } = chatSidebar();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-section-actions",
    className: sidebarSectionActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarSectionActionProps = useRender.ComponentProps<"button">;

export function ChatSidebarSectionAction({
  className,
  render,
  ...props
}: ChatSidebarSectionActionProps) {
  const theme = useThemeFamily();
  const { sidebarSectionAction } = chatSidebar({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-sidebar-section-action",
    className: sidebarSectionAction({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}
