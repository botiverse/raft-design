import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import { tv } from "../../lib/tv";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { PanelAction } from "../panel/panel-action";

const appShell = tv({
  slots: {
    root: [
      "flex min-h-0 w-full overflow-visible md:overflow-hidden",
      "max-md:flex-col max-md:pt-[env(safe-area-inset-top,0px)]",
      "font-sans text-foreground-strong",
    ],
    railSlot: ["hidden h-full shrink-0 flex-col md:flex"],
    sidebarSlot: ["hidden min-h-0 shrink-0 flex-col md:flex"],
    mainSlot: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    panelSlot: ["hidden min-h-0 min-w-0 flex-col md:flex"],
    overlaySlot: ["absolute inset-0 z-20 flex min-h-0 min-w-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["[--shell-header-height:62px]", "bg-brutal-cream text-black max-md:bg-white"],
        railSlot: "w-16 bg-primary text-foreground-strong md:[@media(max-height:600px)]:w-[50px]",
        sidebarSlot: "w-60 bg-brutal-cream",
        mainSlot: "bg-white",
        overlaySlot: [
          "border-l-2 border-black bg-white",
          "group-data-[content-edge=attached]/app-shell-main-slot:border-l-0",
        ],
      },
      elegant: {
        root: ["[--shell-header-height:56px]", "bg-layer-page"],
        railSlot: "w-14",
        sidebarSlot: "w-[252px]",
        mainSlot: "bg-layer-page",
        overlaySlot: "bg-layer-panel",
      },
    },
    contentEdge: {
      inset: {},
      attached: {},
    },
    overlay: {
      false: {},
      true: {
        mainSlot: "relative",
      },
    },
  },
  defaultVariants: {
    contentEdge: "inset",
    overlay: false,
  },
  compoundVariants: [
    {
      theme: "brutal",
      contentEdge: "attached",
      class: {
        mainSlot: "border-l-2 border-black",
      },
    },
    {
      theme: "elegant",
      contentEdge: "attached",
      class: {
        mainSlot: "border-l-[0.5px] border-line-hairline",
      },
    },
  ],
});

type AppShellSidebarContextValue = {
  collapsible: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  toggle: () => void;
};

const AppShellSidebarContext = createContext<AppShellSidebarContextValue | null>(null);

function useOptionalAppShellSidebar() {
  return useContext(AppShellSidebarContext);
}

export type AppShellRootProps = useRender.ComponentProps<"div"> & {
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  sidebarCollapsible?: boolean;
  sidebarOpen?: boolean;
};

export function AppShellRoot({
  className,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  render,
  sidebarCollapsible = false,
  sidebarOpen: sidebarOpenProp,
  style,
  ...props
}: AppShellRootProps) {
  const theme = useThemeFamily();
  const { root } = appShell({ theme });
  const [uncontrolledSidebarOpen, setUncontrolledSidebarOpen] = useState(defaultSidebarOpen);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const sidebarOpen = sidebarOpenProp ?? uncontrolledSidebarOpen;

  const setSidebarOpen = useCallback(
    (open: boolean) => {
      if (sidebarOpenProp === undefined) setUncontrolledSidebarOpen(open);
      onSidebarOpenChange?.(open);
    },
    [onSidebarOpenChange, sidebarOpenProp],
  );
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [setSidebarOpen, sidebarOpen]);
  const setMeasuredSidebarWidth = useCallback((width: number) => {
    if (width <= 0) return;
    setSidebarWidth((currentWidth) => (Math.abs(currentWidth - width) < 1 ? currentWidth : width));
  }, []);
  const sidebarContext = useMemo(
    () => ({
      collapsible: sidebarCollapsible,
      open: sidebarOpen,
      setOpen: setSidebarOpen,
      sidebarWidth,
      setSidebarWidth: setMeasuredSidebarWidth,
      toggle: toggleSidebar,
    }),
    [
      setMeasuredSidebarWidth,
      setSidebarOpen,
      sidebarCollapsible,
      sidebarOpen,
      sidebarWidth,
      toggleSidebar,
    ],
  );
  const rootStyle = sidebarCollapsible
    ? ({ ...style, "--app-shell-sidebar-width": `${sidebarWidth}px` } as CSSProperties)
    : style;

  const defaultProps: SlotElementProps<"div"> = {
    "data-state": sidebarCollapsible ? (sidebarOpen ? "expanded" : "collapsed") : undefined,
    "data-slot": "app-shell-root",
    className: root({ className: cn("group/app-shell", className) }),
    style: rootStyle,
  };

  const rootElement = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return <AppShellSidebarContext value={sidebarContext}>{rootElement}</AppShellSidebarContext>;
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
  const sidebar = useOptionalAppShellSidebar();
  const elementRef = useRef<HTMLElement | null>(null);
  const isCollapsible = sidebar?.collapsible ?? false;
  const setSidebarWidth = sidebar?.setSidebarWidth;
  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useLayoutEffect(() => {
    if (!isCollapsible || !setSidebarWidth || !elementRef.current) return;

    const sidebarElement = elementRef.current;
    const observe = () => setSidebarWidth(sidebarElement.getBoundingClientRect().width);
    const observer = new ResizeObserver(observe);

    observe();
    observer.observe(sidebarElement);

    return () => observer.disconnect();
  }, [isCollapsible, setSidebarWidth]);

  const defaultProps: SlotElementProps<"aside"> = {
    "aria-hidden": sidebar?.collapsible && !sidebar.open ? true : undefined,
    "data-slot": "app-shell-sidebar-slot",
    className: sidebarSlot({
      className: cn(
        className,
        sidebar?.collapsible && [
          "will-change-[opacity]",
          "transition-opacity duration-160 ease-slide",
          "motion-reduce:transition-none",
          "group-data-[state=collapsed]/app-shell:pointer-events-none",
          "group-data-[state=collapsed]/app-shell:opacity-0",
          "group-data-[state=collapsed]/app-shell:duration-120",
        ],
      ),
    }),
    ref: setElementRef,
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type AppShellPanelSlotProps = useRender.ComponentProps<"aside">;

export function AppShellPanelSlot({ className, render, ...props }: AppShellPanelSlotProps) {
  const theme = useThemeFamily();
  const { panelSlot } = appShell({ theme });

  const defaultProps: SlotElementProps<"aside"> = {
    "data-slot": "app-shell-panel-slot",
    className: panelSlot({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type AppShellOverlaySlotProps = useRender.ComponentProps<"div">;

export function AppShellOverlaySlot({ className, render, ...props }: AppShellOverlaySlotProps) {
  const theme = useThemeFamily();
  const { overlaySlot } = appShell({ theme });

  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "app-shell-overlay-slot",
    className: overlaySlot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppShellMainSlotProps = useRender.ComponentProps<"main"> & {
  contentEdge?: "attached" | "inset";
  overlay?: boolean;
};

export function AppShellMainSlot({
  className,
  contentEdge,
  overlay = false,
  render,
  ...props
}: AppShellMainSlotProps) {
  const theme = useThemeFamily();
  const { mainSlot } = appShell({ contentEdge, overlay, theme });
  const sidebar = useOptionalAppShellSidebar();
  const attached = contentEdge === "attached";

  const defaultProps: SlotElementProps<"main"> = {
    "data-content-edge": attached ? contentEdge : undefined,
    "data-slot": "app-shell-main-slot",
    className: mainSlot({
      className: cn(
        attached && "group/app-shell-main-slot",
        className,
        sidebar?.collapsible && [
          "absolute inset-y-0 right-0 left-0 z-45",
          "transition-[left] duration-220 ease-slide",
          "motion-reduce:transition-none",
          "group-data-[state=collapsed]/app-shell:left-[calc(var(--app-shell-sidebar-width)*-1)]",
        ],
      ),
    }),
  };

  return useRender({
    defaultTagName: "main",
    render,
    props: mergeProps<"main">(defaultProps, props),
  });
}

export type AppShellSidebarTriggerProps = useRender.ComponentProps<"button"> & {
  children: ReactNode;
};

export function AppShellSidebarTrigger(props: AppShellSidebarTriggerProps) {
  const sidebar = useOptionalAppShellSidebar();
  if (!sidebar?.collapsible) return null;

  return <AppShellSidebarTriggerButton sidebar={sidebar} {...props} />;
}

function AppShellSidebarTriggerButton({
  sidebar,
  className,
  children,
  onClick,
  render,
  ...props
}: AppShellSidebarTriggerProps & { sidebar: AppShellSidebarContextValue }) {
  const label = sidebar.open ? "Collapse sidebar" : "Expand sidebar";

  // Default to PanelAction for in-panel chrome; consumers can pass AppRailItem (or
  // another render) so rail placements keep the flatter item styles.
  const defaultProps: SlotElementProps<"button"> = {
    className: cn("group/app-shell-sidebar-trigger max-md:hidden", className),
    "aria-label": label,
    "aria-pressed": sidebar.open,
    "data-state": sidebar.open ? "expanded" : "collapsed",
    title: label,
    children,
    onClick: (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) sidebar.toggle();
    },
  };

  return useRender({
    defaultTagName: "button",
    render: render ?? <PanelAction />,
    props: mergeProps<"button">(defaultProps, props),
  });
}
