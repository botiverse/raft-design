import { Button as BaseButton } from "@base-ui/react/button";
import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button";
import { Status, type StatusProps } from "../status";
import type { DataAttributes, SlotElementProps } from "../../lib/data-attributes";
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
  const defaultProps: SlotElementProps<"div"> = {
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
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "chat-sidebar-section-button",
    className: sidebarSectionButton({ className }),
  };

  return useRender({
    render: render ?? <Collapsible.Trigger />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatSidebarSectionChevronProps = useRender.ComponentProps<"svg">;

export function ChatSidebarSectionChevron({
  className,
  render,
  ...props
}: ChatSidebarSectionChevronProps) {
  const defaultProps: useRender.ElementProps<"svg"> = {
    className: cn("size-3", className),
  };

  return useRender({
    render: render ?? <ChevronRight />,
    props: mergeProps<"svg">(defaultProps, props),
  });
}

export type ChatSidebarSectionTitleProps = useRender.ComponentProps<"span">;

export function ChatSidebarSectionTitle({
  className,
  render,
  ...props
}: ChatSidebarSectionTitleProps) {
  const { sidebarSectionTitle } = chatSidebar();
  const defaultProps: SlotElementProps<"span"> = {
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
  const defaultProps: SlotElementProps<"span"> = {
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
  variant,
  ...props
}: ChatSidebarSectionIndicatorProps) {
  const theme = useThemeFamily();
  const { sidebarSectionIndicator } = chatSidebar();
  const resolvedVariant = variant ?? (theme === "elegant" ? "primary" : "accent");
  return (
    <span
      aria-hidden
      data-slot="chat-sidebar-section-indicator"
      className={sidebarSectionIndicator()}
    >
      <Status size={size} variant={resolvedVariant} className={className} {...props} />
    </span>
  );
}

export type ChatSidebarSectionAttentionProps = ChatSidebarSectionIndicatorProps;
export const ChatSidebarSectionAttention = ChatSidebarSectionIndicator;

export type ChatSidebarSectionTrailingProps = useRender.ComponentProps<"div">;
export type ChatSidebarSectionActionsProps = useRender.ComponentProps<"div">;

export function ChatSidebarSectionTrailing({
  className,
  render,
  ...props
}: ChatSidebarSectionTrailingProps) {
  const theme = useThemeFamily();
  const { sidebarSectionTrailing } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-section-trailing",
    className: sidebarSectionTrailing({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export function ChatSidebarSectionActions({
  className,
  render,
  ...props
}: ChatSidebarSectionActionsProps) {
  const theme = useThemeFamily();
  const { sidebarSectionActions } = chatSidebar({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "chat-sidebar-section-actions",
    className: sidebarSectionActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarSectionActionProps = useRender.ComponentProps<"button"> &
  Pick<ButtonProps, "size" | "variant" | "loading" | "loadingLabel">;

export function ChatSidebarSectionAction({
  className,
  render,
  size = "icon-sm",
  variant = "ghost",
  loading,
  loadingLabel,
  ...props
}: ChatSidebarSectionActionProps) {
  const theme = useThemeFamily();
  const { sidebarSectionAction } = chatSidebar({ theme });

  if (theme === "elegant") {
    return (
      <Button
        data-slot="chat-sidebar-section-action"
        size={size}
        variant={variant}
        loading={loading}
        loadingLabel={loadingLabel}
        className={sidebarSectionAction({ className })}
        render={render}
        {...props}
      />
    );
  }

  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "chat-sidebar-section-action",
    className: sidebarSectionAction({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatSidebarActionProps = ChatSidebarSectionActionProps;
export const ChatSidebarAction = ChatSidebarSectionAction;
