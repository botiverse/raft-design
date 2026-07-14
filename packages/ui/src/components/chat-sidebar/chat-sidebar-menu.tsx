import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { chatSidebarMenu } from "./chat-sidebar-menu.recipe";

export type ChatSidebarMenuProps = useRender.ComponentProps<"button">;

export function ChatSidebarMenu({ className, render, ...props }: ChatSidebarMenuProps) {
  const theme = useThemeFamily();
  const { sidebarMenu } = chatSidebarMenu({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "chat-sidebar-menu",
    className: sidebarMenu({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatSidebarMenuIconProps = useRender.ComponentProps<"span">;

export function ChatSidebarMenuIcon({ className, render, ...props }: ChatSidebarMenuIconProps) {
  const theme = useThemeFamily();
  const { sidebarMenuIcon } = chatSidebarMenu({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-menu-icon",
    className: sidebarMenuIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarMenuTitleProps = useRender.ComponentProps<"span">;

export function ChatSidebarMenuTitle({ className, render, ...props }: ChatSidebarMenuTitleProps) {
  const { sidebarMenuTitle } = chatSidebarMenu();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-menu-title",
    className: sidebarMenuTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarMenuAsideProps = useRender.ComponentProps<"span">;

export function ChatSidebarMenuAside({ className, render, ...props }: ChatSidebarMenuAsideProps) {
  const theme = useThemeFamily();
  const { sidebarMenuAside } = chatSidebarMenu({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-menu-aside",
    className: sidebarMenuAside({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatSidebarMenuCountProps = useRender.ComponentProps<"span">;

export function ChatSidebarMenuCount({ className, render, ...props }: ChatSidebarMenuCountProps) {
  const theme = useThemeFamily();
  const { sidebarMenuCount } = chatSidebarMenu({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "chat-sidebar-menu-count",
    className: sidebarMenuCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
