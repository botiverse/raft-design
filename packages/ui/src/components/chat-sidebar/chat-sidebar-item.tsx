import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { VariantProps } from "../../lib/tv";
import { Badge, type BadgeProps } from "../badge";
import type { SlotElementProps } from "../../lib/data-attributes";
import { chatSidebarItem, chatSidebarItemInlineText } from "./chat-sidebar-item.recipe";

export type ChatSidebarItemProps = useRender.ComponentProps<"button">;

function ChatSidebarItemRoot({
  className,
  render,
  unread = false,
  ...props
}: ChatSidebarItemProps & { unread?: boolean }) {
  const theme = useThemeFamily();
  const { sidebarItem } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "chat-sidebar-item",
    "data-unread": unread ? "true" : undefined,
    className: sidebarItem({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export function ChatSidebarItem(props: ChatSidebarItemProps) {
  return <ChatSidebarItemRoot {...props} />;
}

export type ChatSidebarItemUnreadProps = ChatSidebarItemProps;

export function ChatSidebarItemUnread(props: ChatSidebarItemUnreadProps) {
  return <ChatSidebarItemRoot unread {...props} />;
}

export type ChatSidebarItemIconProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemIcon({ className, render, ...props }: ChatSidebarItemIconProps) {
  const theme = useThemeFamily();
  const { sidebarItemIcon } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-icon",
    className: sidebarItemIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemChannelIconProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemChannelIcon({
  className,
  render,
  ...props
}: ChatSidebarItemChannelIconProps) {
  const theme = useThemeFamily();
  const { sidebarItemChannelIcon } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-channel-icon",
    className: sidebarItemChannelIcon({ className }),
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
  const { sidebarItemText, sidebarItemTextStack } = chatSidebarItem();
  const defaultProps: SlotElementProps<"span"> = {
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
  const { sidebarItemText } = chatSidebarItem();
  const defaultProps: SlotElementProps<"span"> = {
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
  const { sidebarItemTitle } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
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
  const { sidebarItemSubtitle } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
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
  const { sidebarItemMeta } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
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
  const theme = useThemeFamily();
  const { sidebarItemIndicator } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-indicator",
    className: sidebarItemIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemPresenceProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemPresence({
  className,
  render,
  ...props
}: ChatSidebarItemPresenceProps) {
  const theme = useThemeFamily();
  const { sidebarItemPresence } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-presence",
    className: sidebarItemPresence({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemMentionProps = BadgeProps;

export function ChatSidebarItemMention({
  appearance = "solid",
  className,
  uppercase = false,
  variant = "primary",
  ...props
}: ChatSidebarItemMentionProps) {
  const theme = useThemeFamily();
  const { sidebarItemMention } = chatSidebarItem({ theme });
  return (
    <Badge
      data-slot="chat-sidebar-item-mention"
      role="img"
      appearance={appearance}
      uppercase={uppercase}
      variant={variant}
      className={sidebarItemMention({ className })}
      {...props}
    />
  );
}

export type ChatSidebarItemMutedProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemMuted({ className, render, ...props }: ChatSidebarItemMutedProps) {
  const theme = useThemeFamily();
  const { sidebarItemMuted } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-muted",
    role: "img",
    className: sidebarItemMuted({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemDraftProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemDraft({ className, render, ...props }: ChatSidebarItemDraftProps) {
  const theme = useThemeFamily();
  const { sidebarItemDraft } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-draft",
    role: "img",
    className: sidebarItemDraft({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemAsideProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemAside({ className, render, ...props }: ChatSidebarItemAsideProps) {
  const { sidebarItemAside } = chatSidebarItem();
  const defaultProps: SlotElementProps<"span"> = {
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
  const { sidebarItemBadge } = chatSidebarItem({ theme });
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
