import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AtSign, BellOff, GitBranch, Hash, Lock, Pencil } from "lucide-react";
import { createContext, use } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { VariantProps } from "../../lib/tv";
import { Badge, type BadgeProps } from "../badge";
import type { DataAttributes } from "./app-shell";
import { chatSidebar, chatSidebarItemInlineText } from "./chat-sidebar.recipe";

const ChatSidebarItemUnreadContext = createContext(false);

export type ChatSidebarItemProps = useRender.ComponentProps<"button"> & {
  menuOpen?: boolean;
  selected?: boolean;
  unread?: boolean;
};

export function ChatSidebarItem({
  className,
  menuOpen,
  render,
  selected,
  unread,
  ...props
}: ChatSidebarItemProps) {
  const theme = useThemeFamily();
  const { sidebarItem } = chatSidebar({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-menu-open": menuOpen ? "true" : undefined,
    "data-selected": selected ? "true" : undefined,
    "data-slot": "chat-sidebar-item",
    "data-unread": unread ? "true" : undefined,
    className: sidebarItem({ className }),
  };

  const element = useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });

  return (
    <ChatSidebarItemUnreadContext.Provider value={Boolean(unread)}>
      {element}
    </ChatSidebarItemUnreadContext.Provider>
  );
}

export type ChatSidebarItemIconProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemIcon({ className, render, ...props }: ChatSidebarItemIconProps) {
  const theme = useThemeFamily();
  const { sidebarItemIcon } = chatSidebar({ theme });
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
  const theme = useThemeFamily();
  const { sidebarItemChannelIcon } = chatSidebar({ theme });
  const Icon = type === "joint" ? GitBranch : type === "private" ? Lock : Hash;
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "aria-hidden": true,
    "data-channel-type": type,
    "data-slot": "chat-sidebar-item-channel-icon",
    className: sidebarItemChannelIcon({ className }),
    children: children ?? <Icon className="size-3" strokeWidth={1.5} />,
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
  const { sidebarItemText, sidebarItemTextStack } = chatSidebar();
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

type ChatSidebarItemInlineTextVariantProps = VariantProps<typeof chatSidebarItemInlineText>;

export type ChatSidebarItemInlineTextProps = useRender.ComponentProps<"span"> &
  ChatSidebarItemInlineTextVariantProps;

export function ChatSidebarItemInlineText({
  align,
  className,
  render,
  titleWidth,
  ...props
}: ChatSidebarItemInlineTextProps) {
  const { sidebarItemText } = chatSidebar();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-sidebar-item-inline-text",
    className: sidebarItemText({
      className: chatSidebarItemInlineText({ align, className, titleWidth }),
    }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemTitleProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemTitle({ className, render, ...props }: ChatSidebarItemTitleProps) {
  const theme = useThemeFamily();
  const unread = use(ChatSidebarItemUnreadContext);
  const { sidebarItemTitle } = chatSidebar({ theme, unread });
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
  const { sidebarItemSubtitle } = chatSidebar({ theme });
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
  const { sidebarItemMeta } = chatSidebar({ theme });
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
  const { sidebarItemIndicator } = chatSidebar();
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
  const { sidebarItemMention } = chatSidebar({ theme });
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
  const { sidebarItemMuted } = chatSidebar({ theme });
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
  const { sidebarItemDraft } = chatSidebar({ theme });
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
  const { sidebarItemAside } = chatSidebar();
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
  appearance = "solid",
  className,
  uppercase = false,
  variant = "primary",
  ...props
}: ChatSidebarItemBadgeProps) {
  const theme = useThemeFamily();
  const { sidebarItemBadge } = chatSidebar({ theme });
  return (
    <Badge
      data-slot="chat-sidebar-item-badge"
      appearance={appearance}
      uppercase={uppercase}
      variant={variant}
      className={sidebarItemBadge({ className })}
      {...props}
    />
  );
}
