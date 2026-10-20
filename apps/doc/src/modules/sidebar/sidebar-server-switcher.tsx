import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants/lite";

// App-owned server switcher chrome for the sidebar header slot. Lives in the docs
// module (not packages/ui) so SidebarHeader stays a layout-only region while
// the sidebar compositions share one pixel-identical implementation.
const sidebarServerRecipe = tv({
  slots: {
    sidebarServer: [
      "relative inline-flex shrink-0 items-center",
      "-rotate-2 gap-1.5 rounded-control bg-sticker-ink py-1 pr-2.5 pl-3",
      "min-h-9 font-sans text-headline text-brand",
      "shadow-[0_0_0_1.5px_var(--sticker-edge)]",
      "transition-colors",
      "hover:bg-[color-mix(in_srgb,var(--sticker-paper)_15%,var(--sticker-ink))]",
      "active:bg-[color-mix(in_srgb,var(--sticker-paper)_15%,var(--sticker-ink))]",
      "outline-none focus-visible:shadow-focus",
    ],
    sidebarServerLabel: ["min-w-0 truncate", "max-w-[200px]"],
    sidebarServerChevron: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      "text-brand",
    ],
  },
});

export type SidebarServerProps = useRender.ComponentProps<"div">;

export function SidebarServer({ className, render, ...props }: SidebarServerProps) {
  const { sidebarServer } = sidebarServerRecipe();
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

export type SidebarServerLabelProps = useRender.ComponentProps<"span">;

export function SidebarServerLabel({ className, render, ...props }: SidebarServerLabelProps) {
  const { sidebarServerLabel } = sidebarServerRecipe();
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
  const { sidebarServerChevron } = sidebarServerRecipe();
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
