import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { VariantProps } from "../../lib/tv";
import { Badge, type BadgeProps } from "../badge";
import type { SlotElementProps } from "../../lib/data-attributes";
import { chatSidebarItem, chatSidebarItemInlineText } from "./chat-sidebar-item.recipe";

export type ChatSidebarItemProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};

function ChatSidebarItemRoot({
  active = false,
  className,
  render,
  ...props
}: ChatSidebarItemProps) {
  const theme = useThemeFamily();
  const { sidebarItem } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "chat-sidebar-item",
    "data-active": active ? "true" : undefined,
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

export type ChatSidebarItemTextProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemText({ className, render, ...props }: ChatSidebarItemTextProps) {
  const { sidebarItemText } = chatSidebarItem();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-text",
    className: sidebarItemText({ className }),
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

export type ChatSidebarItemStatusProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemStatus({ className, render, ...props }: ChatSidebarItemStatusProps) {
  const theme = useThemeFamily();
  const { sidebarItemStatus } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-status",
    className: sidebarItemStatus({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarItemIndicatorProps = BadgeProps;

export function ChatSidebarItemIndicator({
  appearance = "solid",
  className,
  uppercase = false,
  variant = "primary",
  ...props
}: ChatSidebarItemIndicatorProps) {
  const theme = useThemeFamily();
  const { sidebarItemIndicator } = chatSidebarItem({ theme });
  return (
    <Badge
      data-slot="chat-sidebar-item-indicator"
      appearance={appearance}
      uppercase={uppercase}
      variant={variant}
      className={sidebarItemIndicator({ className })}
      {...props}
    />
  );
}

export type ChatSidebarItemMetaIconProps = useRender.ComponentProps<"span">;

export function ChatSidebarItemMetaIcon({
  className,
  render,
  ...props
}: ChatSidebarItemMetaIconProps) {
  const theme = useThemeFamily();
  const { sidebarItemMetaIcon } = chatSidebarItem({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-item-meta-icon",
    className: sidebarItemMetaIcon({ className }),
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

export type ChatSidebarItemCountProps = BadgeProps;

export function ChatSidebarItemCount({
  appearance = "solid",
  className,
  uppercase = false,
  variant = "primary",
  ...props
}: ChatSidebarItemCountProps) {
  const theme = useThemeFamily();
  const { sidebarItemCount } = chatSidebarItem({ theme });
  return (
    <Badge
      data-slot="chat-sidebar-item-count"
      appearance={appearance}
      uppercase={uppercase}
      variant={variant}
      className={sidebarItemCount({ className })}
      {...props}
    />
  );
}
