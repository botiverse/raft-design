import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";

const appShell = tv({
  slots: {
    root: [
      "flex min-h-0 w-full overflow-visible md:overflow-hidden",
      "max-md:flex-col max-md:pt-[env(safe-area-inset-top,0px)]",
      "font-sans text-foreground",
    ],
    railSlot: ["hidden h-full shrink-0 flex-col md:flex"],
    sidebarSlot: ["hidden min-h-0 shrink-0 flex-col md:flex"],
    mainSlot: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    mobileContent: ["flex min-h-0 min-w-0 w-full flex-1 flex-col md:hidden"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["[--shell-header-height:62px]", "bg-brutal-cream text-black max-md:bg-white"],
        railSlot:
          "w-16 md:border-r-2 md:border-black bg-soft-signal text-foreground md:[@media(max-height:600px)]:w-[50px]",
        sidebarSlot: "w-60 border-r-2 border-black bg-brutal-cream",
        mainSlot: "bg-white",
      },
      elegant: {
        root: ["[--shell-header-height:56px]", "bg-layer-page"],
        railSlot: "w-14",
        sidebarSlot: "w-[252px]",
        mainSlot: "bg-layer-page",
      },
    },
  },
});

export type AppShellRootProps = useRender.ComponentProps<"div">;

export function AppShellRoot({ className, render, ...props }: AppShellRootProps) {
  const theme = useThemeFamily();
  const { root } = appShell({ theme });

  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "app-shell-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppShellRailSlotProps = useRender.ComponentProps<"aside">;

export function AppShellRailSlot({ className, render, ...props }: AppShellRailSlotProps) {
  const theme = useThemeFamily();
  const { railSlot } = appShell({ theme });

  const defaultProps: SlotElementProps<"aside"> = {
    "data-slot": "app-shell-rail-slot",
    className: railSlot({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type AppShellSidebarSlotProps = useRender.ComponentProps<"aside">;

export function AppShellSidebarSlot({ className, render, ...props }: AppShellSidebarSlotProps) {
  const theme = useThemeFamily();
  const { sidebarSlot } = appShell({ theme });

  const defaultProps: SlotElementProps<"aside"> = {
    "data-slot": "app-shell-sidebar-slot",
    className: sidebarSlot({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type AppShellMainSlotProps = useRender.ComponentProps<"main">;

export function AppShellMainSlot({ className, render, ...props }: AppShellMainSlotProps) {
  const theme = useThemeFamily();
  const { mainSlot } = appShell({ theme });

  const defaultProps: SlotElementProps<"main"> = {
    "data-slot": "app-shell-main-slot",
    className: mainSlot({ className }),
  };

  return useRender({
    defaultTagName: "main",
    render,
    props: mergeProps<"main">(defaultProps, props),
  });
}

export type AppShellMobileContentProps = useRender.ComponentProps<"div">;

export function AppShellMobileContent({ className, render, ...props }: AppShellMobileContentProps) {
  const theme = useThemeFamily();
  const { mobileContent } = appShell({ theme });

  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "app-shell-mobile-content",
    className: mobileContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
