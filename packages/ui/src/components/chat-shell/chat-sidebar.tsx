import { Button as BaseButton } from "@base-ui/react/button";
import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AtSign, BellOff, GitBranch, Hash, Lock, Pencil } from "lucide-react";
import type { ComponentProps } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Badge, type BadgeProps } from "../badge";
import { Status, type StatusProps } from "../status";
import { chatShell, type DataAttributes } from "./chat-shell";

export type ChatSidebarRootProps = useRender.ComponentProps<"div">;

export function ChatSidebarRoot({ className, render, ...props }: ChatSidebarRootProps) {
  const { sidebarRoot } = chatShell();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-root",
    className: sidebarRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarHeaderProps = useRender.ComponentProps<"div">;

export function ChatSidebarHeader({ className, render, ...props }: ChatSidebarHeaderProps) {
  const theme = useThemeFamily();
  const { sidebarHeader } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-header",
    className: sidebarHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarBodyProps = useRender.ComponentProps<"div">;

export function ChatSidebarBody({ className, render, ...props }: ChatSidebarBodyProps) {
  const theme = useThemeFamily();
  const { sidebarBody } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-body",
    className: sidebarBody({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarSectionProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};

export function ChatSidebarSection({
  className,
  defaultOpen = true,
  render,
  ...props
}: ChatSidebarSectionProps) {
  const { sidebarSection } = chatShell();
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
  const { sidebarList } = chatShell();
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
  const { sidebarSectionHeader } = chatShell();
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
  const { sidebarSectionButton } = chatShell({ theme });
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
  const { sidebarSectionTitle } = chatShell();
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
  const { sidebarSectionCount } = chatShell({ theme });
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
  size = "lg",
  variant = "accent",
  ...props
}: ChatSidebarSectionIndicatorProps) {
  const { sidebarSectionIndicator } = chatShell();
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
  const { sidebarSectionActions } = chatShell();
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
  const { sidebarSectionAction } = chatShell({ theme });
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

export type ChatSidebarItemProps = useRender.ComponentProps<"button"> & {
  menuOpen?: boolean;
  selected?: boolean;
};

export function ChatSidebarItem({
  className,
  menuOpen,
  render,
  selected,
  ...props
}: ChatSidebarItemProps) {
  const theme = useThemeFamily();
  const { sidebarItem } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-menu-open": menuOpen ? "true" : undefined,
    "data-selected": selected ? "true" : undefined,
    "data-slot": "chat-sidebar-item",
    className: sidebarItem({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatSidebarItemIconProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemIcon({ className, render, ...props }: ChatSidebarItemIconProps) {
  const { sidebarItemIcon } = chatShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-icon",
    className: sidebarItemIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemChannelIconType = "channel" | "joint" | "private";

export type ChatSidebarItemChannelIconProps = useRender.ComponentProps<"span"> & {
  type?: ChatSidebarItemChannelIconType;
};

export function ChatSidebarItemChannelIcon({
  children,
  className,
  render,
  type = "channel",
  ...props
}: ChatSidebarItemChannelIconProps) {
  const { sidebarItemIcon } = chatShell();
  const Icon = type === "joint" ? GitBranch : type === "private" ? Lock : Hash;
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-hidden": true,
    "data-channel-type": type,
    "data-slot": "chat-sidebar-item-channel-icon",
    className: sidebarItemIcon({ className }),
    children: children ?? <Icon className="size-3.5" />,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemTextProps = useRender.ComponentProps<"span"> & {
  stacked?: boolean;
};

export function ChatSidebarItemText({
  className,
  render,
  stacked,
  ...props
}: ChatSidebarItemTextProps) {
  const { sidebarItemText, sidebarItemTextStack } = chatShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-text",
    className: stacked ? sidebarItemTextStack({ className }) : sidebarItemText({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemTitleProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemTitle({ className, render, ...props }: ChatSidebarItemTitleProps) {
  const { sidebarItemTitle } = chatShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-title",
    className: sidebarItemTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemSubtitleProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemSubtitle({
  className,
  render,
  ...props
}: ChatSidebarItemSubtitleProps) {
  const theme = useThemeFamily();
  const { sidebarItemSubtitle } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-subtitle",
    className: sidebarItemSubtitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemMetaProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemMeta({ className, render, ...props }: ChatSidebarItemMetaProps) {
  const theme = useThemeFamily();
  const { sidebarItemMeta } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-meta",
    className: sidebarItemMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemIndicatorProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemIndicator({
  className,
  render,
  ...props
}: ChatSidebarItemIndicatorProps) {
  const { sidebarItemIndicator } = chatShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-indicator",
    className: sidebarItemIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemMentionProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemMention({
  className,
  children,
  render,
  ...props
}: ChatSidebarItemMentionProps) {
  const theme = useThemeFamily();
  const { sidebarItemMention } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-label": "Mentioned you",
    "data-slot": "chat-sidebar-item-mention",
    className: sidebarItemMention({ className }),
    children: children ?? <AtSign aria-hidden />,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemMutedProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemMuted({
  className,
  children,
  render,
  ...props
}: ChatSidebarItemMutedProps) {
  const theme = useThemeFamily();
  const { sidebarItemMuted } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-label": "Activity muted",
    "data-slot": "chat-sidebar-item-muted",
    title: "Activity muted. Direct mentions can still notify you.",
    className: sidebarItemMuted({ className }),
    children: children ?? <BellOff aria-hidden />,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemDraftProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemDraft({
  className,
  children,
  render,
  ...props
}: ChatSidebarItemDraftProps) {
  const theme = useThemeFamily();
  const { sidebarItemDraft } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-label": "Draft",
    "data-slot": "chat-sidebar-item-draft",
    className: sidebarItemDraft({ className }),
    children: children ?? <Pencil aria-hidden />,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemAsideProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemAside({ className, render, ...props }: ChatSidebarItemAsideProps) {
  const { sidebarItemAside } = chatShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-aside",
    className: sidebarItemAside({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemBadgeProps = BadgeProps;

export function ChatSidebarItemBadge({
  className,
  variant = "accent",
  ...props
}: ChatSidebarItemBadgeProps) {
  const theme = useThemeFamily();
  const { sidebarItemBadge } = chatShell({ theme });
  return (
    <Badge
      data-slot="chat-sidebar-item-badge"
      variant={variant}
      className={sidebarItemBadge({ className })}
      {...props}
    />
  );
}

export type ChatSidebarFooterProps = useRender.ComponentProps<"div">;

export function ChatSidebarFooter({ className, render, ...props }: ChatSidebarFooterProps) {
  const theme = useThemeFamily();
  const { sidebarFooter } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-footer",
    className: sidebarFooter({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarResizeHandleProps = useRender.ComponentProps<"div">;

export function ChatSidebarResizeHandle({
  className,
  render,
  ...props
}: ChatSidebarResizeHandleProps) {
  const theme = useThemeFamily();
  const { sidebarResizeHandle } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-resize-handle",
    className: sidebarResizeHandle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
