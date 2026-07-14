import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";

const appShell = tv({
  slots: {
    root: [
      "flex min-h-0 w-full overflow-hidden",
      "max-md:flex-col max-md:pt-[env(safe-area-inset-top,0px)]",
      "font-sans text-foreground",
    ],
    shellRail: ["hidden h-full shrink-0 flex-col md:flex"],
    shellSidebar: ["hidden min-h-0 shrink-0 flex-col md:flex"],
    shellMain: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    shellPanelStack: ["hidden min-h-0 shrink-0 lg:flex"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-brutal-cream text-black",
        shellRail:
          "w-16 border-r-2 border-black bg-soft-signal text-foreground [@media(max-height:600px)]:w-[50px]",
        shellSidebar: "w-60 border-r-2 border-black bg-brutal-cream",
        shellMain: "bg-white",
        shellPanelStack: "border-l-2 border-black bg-white",
      },
      elegant: {
        root: [
          "[--shell-surface-bg:var(--layer-panel)]",
          "[--shell-header-height:3.5rem]",
          "bg-layer-page",
        ],
        shellRail: "w-14",
        shellSidebar: "w-[252px]",
        shellMain: "bg-layer-page",
        shellPanelStack: "border-l border-line-subtle bg-layer-panel",
      },
    },
    railPlacement: {
      side: {
        shellRail: "",
      },
      bottom: {
        shellRail: "order-last max-md:flex max-md:h-auto max-md:w-full md:hidden",
      },
      responsive: {
        shellRail: "max-md:order-last max-md:flex max-md:h-auto max-md:w-full",
      },
    },
    safeAreaSurface: {
      chrome: {},
      content: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      safeAreaSurface: "chrome",
      class: { root: "max-md:bg-soft-signal" },
    },
    {
      theme: "brutal",
      safeAreaSurface: "content",
      class: { root: "max-md:bg-white" },
    },
  ],
});

export type AppShellRootProps = useRender.ComponentProps<"div"> & {
  safeAreaSurface?: "chrome" | "content";
};

export function AppShellRoot({ safeAreaSurface, className, render, ...props }: AppShellRootProps) {
  const theme = useThemeFamily();
  const { root } = appShell({ theme, safeAreaSurface });

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

export type AppShellRailProps = useRender.ComponentProps<"aside"> & {
  placement?: "side" | "bottom" | "responsive";
};

export function AppShellRail({
  placement = "side",
  className,
  render,
  ...props
}: AppShellRailProps) {
  const theme = useThemeFamily();
  const { shellRail } = appShell({ theme, railPlacement: placement });

  const defaultProps: SlotElementProps<"aside"> = {
    "data-slot": "app-shell-rail",
    className: shellRail({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type AppShellSidebarProps = useRender.ComponentProps<"aside">;

export function AppShellSidebar({ className, render, ...props }: AppShellSidebarProps) {
  const theme = useThemeFamily();
  const { shellSidebar } = appShell({ theme });

  const defaultProps: SlotElementProps<"aside"> = {
    "data-slot": "app-shell-sidebar",
    className: shellSidebar({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type AppShellMainProps = useRender.ComponentProps<"main">;

export function AppShellMain({ className, render, ...props }: AppShellMainProps) {
  const theme = useThemeFamily();
  const { shellMain } = appShell({ theme });

  const defaultProps: SlotElementProps<"main"> = {
    "data-slot": "app-shell-main",
    className: shellMain({ className }),
  };

  return useRender({
    defaultTagName: "main",
    render,
    props: mergeProps<"main">(defaultProps, props),
  });
}

export type AppShellPanelStackProps = useRender.ComponentProps<"aside">;

export function AppShellPanelStack({ className, render, ...props }: AppShellPanelStackProps) {
  const theme = useThemeFamily();
  const { shellPanelStack } = appShell({ theme });

  const defaultProps: SlotElementProps<"aside"> = {
    "data-slot": "app-shell-panel-stack",
    className: shellPanelStack({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}
