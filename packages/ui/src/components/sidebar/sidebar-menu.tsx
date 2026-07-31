import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { sidebarMenuRecipe } from "./sidebar-menu.recipe";

export type SidebarMenuProps = useRender.ComponentProps<"button">;

export function SidebarMenu({ className, render, ...props }: SidebarMenuProps) {
  const theme = useThemeFamily();
  const { sidebarMenu } = sidebarMenuRecipe({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "sidebar-menu",
    className: sidebarMenu({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SidebarMenuIconProps = useRender.ComponentProps<"span">;

export function SidebarMenuIcon({ className, render, ...props }: SidebarMenuIconProps) {
  const theme = useThemeFamily();
  const { sidebarMenuIcon } = sidebarMenuRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-menu-icon",
    className: sidebarMenuIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarMenuTitleProps = useRender.ComponentProps<"span">;

export function SidebarMenuTitle({ className, render, ...props }: SidebarMenuTitleProps) {
  const { sidebarMenuTitle } = sidebarMenuRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-menu-title",
    className: sidebarMenuTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarMenuAsideProps = useRender.ComponentProps<"span">;

export function SidebarMenuAside({ className, render, ...props }: SidebarMenuAsideProps) {
  const theme = useThemeFamily();
  const { sidebarMenuAside } = sidebarMenuRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-menu-aside",
    className: sidebarMenuAside({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarMenuCountProps = useRender.ComponentProps<"span">;

export function SidebarMenuCount({ className, render, ...props }: SidebarMenuCountProps) {
  const theme = useThemeFamily();
  const { sidebarMenuCount } = sidebarMenuRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-menu-count",
    className: sidebarMenuCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
