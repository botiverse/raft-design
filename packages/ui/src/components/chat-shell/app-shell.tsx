import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const appShell = tv({
  slots: {
    root: [
      "flex min-h-0 w-full overflow-hidden",
      "text-foreground",
      "data-[presentation=mobile]:flex-col",
      "[&:where([data-slot=app-shell-root])_[class*='tracking-[0.22px]'].inline-flex.h-5]:[letter-spacing:0.11px]",
      "[&:where([data-slot=app-shell-root])_.inline-flex.h-5.uppercase[class*='tracking-wide']]:[letter-spacing:0]",
    ],
    shellRail: ["relative hidden h-full shrink-0 flex-col items-center select-none md:flex"],
    shellSidebar: ["hidden min-h-0 shrink-0 flex-col md:flex"],
    shellMain: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    shellPanelStack: ["hidden min-h-0 shrink-0 lg:flex"],
    mobileBar: ["shrink-0 md:hidden"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-brutal-cream font-sans text-black",
        shellRail:
          "w-16 border-r-2 border-black bg-soft-signal font-sans text-foreground [@media(max-height:600px)]:w-[50px]",
        shellSidebar: "w-60 border-r-2 border-black bg-brutal-cream",
        shellMain: "bg-white",
        shellPanelStack: "border-l-2 border-black bg-white",
        mobileBar: "border-t-2 border-black bg-white text-black",
      },
      elegant: {
        root: [
          "[--sidebar-chrome-bg-color:oklch(0.9789_0.0013_106.42)]",
          "bg-[var(--sidebar-chrome-bg-color)] font-sans text-foreground",
        ],
        shellRail: "w-14 border-r-0 bg-transparent",
        shellSidebar: "w-[252px] border-r-0 bg-transparent",
        shellMain: "bg-[var(--sidebar-chrome-bg-color)]",
        shellPanelStack: "border-l border-line-subtle bg-layer-panel",
        mobileBar: "border-t border-line-subtle bg-layer-panel text-foreground",
      },
    },
    presentation: {
      desktop: {},
      mobile: {
        shellRail: "hidden",
        shellSidebar: "flex w-full flex-1 border-r-0 md:flex",
        shellMain: "hidden",
        shellPanelStack: "hidden",
        mobileBar: "flex",
      },
    },
    resizable: {
      true: {
        shellSidebar: "relative min-w-0 w-auto flex-1 shrink",
      },
      false: {},
    },
  },
  defaultVariants: {
    presentation: "desktop",
    resizable: false,
  },
});

type HiddenProp = {
  hidden?: boolean;
};

type AppShellVariantProps = Omit<VariantProps<typeof appShell>, "theme">;

export type DataAttributes = {
  [key: `data-${string}`]: string | undefined;
};

export type AppShellRootProps = useRender.ComponentProps<"div"> &
  HiddenProp &
  Pick<AppShellVariantProps, "presentation">;

export function AppShellRoot({
  presentation,
  hidden,
  className,
  render,
  ...props
}: AppShellRootProps) {
  const theme = useThemeFamily();
  const { root } = appShell({ theme, presentation });

  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-shell-root",
    "data-presentation": presentation ?? "desktop",
    className: root({ className }),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  if (hidden) return null;
  return element;
}

export type AppShellRailProps = useRender.ComponentProps<"aside"> & HiddenProp;

export function AppShellRail({ hidden, className, render, ...props }: AppShellRailProps) {
  const theme = useThemeFamily();
  const { shellRail } = appShell({ theme });

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "app-shell-rail",
    className: shellRail({ className }),
  };

  const element = useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });

  if (hidden) return null;
  return element;
}

export type AppShellSidebarProps = useRender.ComponentProps<"aside"> &
  HiddenProp &
  Pick<AppShellVariantProps, "resizable">;

export function AppShellSidebar({
  hidden,
  resizable,
  className,
  render,
  ...props
}: AppShellSidebarProps) {
  const theme = useThemeFamily();
  const { shellSidebar } = appShell({ theme, resizable });

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "app-shell-sidebar",
    "data-resizable": resizable ? "true" : undefined,
    className: shellSidebar({ className }),
  };

  const element = useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });

  if (hidden) return null;
  return element;
}

export type AppShellMainProps = useRender.ComponentProps<"main"> & HiddenProp;

export function AppShellMain({ hidden, className, render, ...props }: AppShellMainProps) {
  const theme = useThemeFamily();
  const { shellMain } = appShell({ theme });

  const defaultProps: useRender.ElementProps<"main"> & DataAttributes = {
    "data-slot": "app-shell-main",
    className: shellMain({ className }),
  };

  const element = useRender({
    defaultTagName: "main",
    render,
    props: mergeProps<"main">(defaultProps, props),
  });

  if (hidden) return null;
  return element;
}

export type AppShellPanelStackProps = useRender.ComponentProps<"aside"> &
  HiddenProp &
  Pick<AppShellVariantProps, "resizable">;

export function AppShellPanelStack({
  hidden,
  resizable,
  className,
  render,
  ...props
}: AppShellPanelStackProps) {
  const theme = useThemeFamily();
  const { shellPanelStack } = appShell({ theme, resizable });

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "app-shell-panel-stack",
    "data-resizable": resizable ? "true" : undefined,
    className: shellPanelStack({ className }),
  };

  const element = useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });

  if (hidden) return null;
  return element;
}

export type AppShellMobileBarProps = useRender.ComponentProps<"nav"> & HiddenProp;

export function AppShellMobileBar({ hidden, className, render, ...props }: AppShellMobileBarProps) {
  const theme = useThemeFamily();
  const { mobileBar } = appShell({ theme });

  const defaultProps: useRender.ElementProps<"nav"> & DataAttributes = {
    "data-slot": "app-shell-mobile-bar",
    className: mobileBar({ className }),
  };

  const element = useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(defaultProps, props),
  });

  if (hidden) return null;
  return element;
}
