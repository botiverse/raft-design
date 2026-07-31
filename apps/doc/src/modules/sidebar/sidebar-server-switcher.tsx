import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "raft-ui";
import { tv } from "tailwind-variants/lite";

// App-owned server switcher chrome for the sidebar header slot. Lives in the docs
// module (not packages/ui) so SidebarHeader stays a layout-only region while
// composition and Playground share one pixel-identical implementation.
const sidebarServerRecipe = tv({
  slots: {
    sidebarServer: ["relative inline-flex shrink-0 items-center"],
    sidebarServerAvatar: [
      "flex shrink-0 items-center justify-center overflow-hidden",
      "[&_img]:size-full [&_img]:min-h-0 [&_img]:min-w-0 [&_img]:object-cover",
    ],
    sidebarServerLabel: ["min-w-0 truncate"],
    sidebarServerChevron: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    sidebarServerIndicator: ["pointer-events-none absolute"],
  },
  variants: {
    theme: {
      brutal: {
        sidebarServer: [
          "-rotate-2 gap-1.5 border-2 border-black bg-black px-3 py-1",
          "font-sans text-base font-bold text-primary-400",
          "shadow-sm transition-shadow hover:shadow-md",
        ],
        sidebarServerAvatar: "hidden",
        sidebarServerLabel: "max-w-[200px]",
        sidebarServerChevron: "rotate-2",
        sidebarServerIndicator: "hidden",
      },
      elegant: {
        sidebarServer: [
          "size-8 justify-center rounded-md bg-layer-panel",
          "transition-colors hover:bg-layer-strong/80",
        ],
        sidebarServerAvatar: "size-8 rounded-[inherit]",
        sidebarServerLabel: "sr-only",
        sidebarServerChevron: "hidden",
        sidebarServerIndicator: "-top-1 -right-1 z-10",
      },
    },
  },
});

export type SidebarServerProps = useRender.ComponentProps<"div">;

export function SidebarServer({ className, render, ...props }: SidebarServerProps) {
  const theme = useThemeFamily();
  const { sidebarServer } = sidebarServerRecipe({ theme });
  const defaultProps = {
    "data-slot": "sidebar-server",
    className: sidebarServer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps as SidebarServerProps, props),
  });
}

export type SidebarServerAvatarProps = useRender.ComponentProps<"span">;

export function SidebarServerAvatar({ className, render, ...props }: SidebarServerAvatarProps) {
  const theme = useThemeFamily();
  const { sidebarServerAvatar } = sidebarServerRecipe({ theme });
  const defaultProps = {
    "data-slot": "sidebar-server-avatar",
    className: sidebarServerAvatar({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps as SidebarServerAvatarProps, props),
  });
}

export type SidebarServerLabelProps = useRender.ComponentProps<"span">;

export function SidebarServerLabel({ className, render, ...props }: SidebarServerLabelProps) {
  const theme = useThemeFamily();
  const { sidebarServerLabel } = sidebarServerRecipe({ theme });
  const defaultProps = {
    "data-slot": "sidebar-server-label",
    className: sidebarServerLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps as SidebarServerLabelProps, props),
  });
}

export type SidebarServerChevronProps = useRender.ComponentProps<"span">;

export function SidebarServerChevron({ className, render, ...props }: SidebarServerChevronProps) {
  const theme = useThemeFamily();
  const { sidebarServerChevron } = sidebarServerRecipe({ theme });
  const defaultProps = {
    "data-slot": "sidebar-server-chevron",
    className: sidebarServerChevron({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps as SidebarServerChevronProps, props),
  });
}

export type SidebarServerIndicatorProps = useRender.ComponentProps<"span">;

export function SidebarServerIndicator({
  className,
  render,
  ...props
}: SidebarServerIndicatorProps) {
  const theme = useThemeFamily();
  const { sidebarServerIndicator } = sidebarServerRecipe({ theme });
  const defaultProps = {
    "data-slot": "sidebar-server-indicator",
    className: sidebarServerIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps as SidebarServerIndicatorProps, props),
  });
}
