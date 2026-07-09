import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, use, useMemo, type MouseEvent } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

export const appShell = tv({
  slots: {
    root: [
      "flex min-h-0 w-full overflow-hidden",
      "text-foreground",
      "data-[presentation=mobile]:flex-col",
    ],
    shellRail: ["relative hidden h-full shrink-0 flex-col items-center select-none md:flex"],
    shellSidebar: ["hidden min-h-0 shrink-0 flex-col md:flex"],
    shellMain: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    shellPanelStack: ["hidden min-h-0 shrink-0 lg:flex"],
    mobileBar: ["shrink-0 md:hidden"],
    railRoot: ["flex h-full w-full flex-col items-center"],
    railHeader: ["relative flex w-full shrink-0 items-center justify-center"],
    railServerButton: [
      "relative inline-flex size-10 items-center justify-center",
      "outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[@media(max-height:600px)]:size-9",
    ],
    railNav: ["flex w-full flex-1 flex-col items-center gap-1.5 py-2"],
    railFooter: ["flex w-full shrink-0 flex-col items-center justify-center gap-1.5"],
    railItem: [
      "relative inline-flex shrink-0 items-center justify-center",
      "outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    railItemIcon: ["relative inline-flex items-center justify-center"],
    railItemLabel: ["sr-only"],
    railItemBadge: [
      "absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center",
      "px-1 text-[10px] font-bold leading-4",
    ],
    railItemIndicator: ["pointer-events-none absolute -right-1 -top-1 size-2.5"],
    sidebarRoot: ["flex h-full min-h-0 w-full select-none flex-col"],
    sidebarHeader: ["flex shrink-0 items-center gap-3"],
    sidebarBody: ["relative flex min-h-0 flex-1 overflow-hidden"],
    sidebarSection: ["px-2"],
    sidebarList: [],
    sidebarSectionHeader: ["mt-3 mb-1 flex h-6 items-center justify-between px-2"],
    sidebarSectionButton: [
      "flex h-6 min-w-0 flex-1 items-center gap-1",
      "text-xs font-bold tracking-widest uppercase",
      "[&_svg]:transition-transform [&[data-panel-open]_svg]:rotate-90",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono normal-case tracking-normal"],
    sidebarSectionIndicator: ["ml-1", "[[data-panel-open]_&]:hidden"],
    sidebarSectionActions: ["flex shrink-0 items-center gap-1"],
    sidebarSectionAction: ["flex size-6 items-center justify-center p-0"],
    sidebarItem: [
      "mb-1 flex w-full items-center gap-1.5 px-2 py-2 text-left",
      "border-2 text-sm font-medium transition-colors",
      "[@media(max-height:600px)]:py-1 md:py-1",
    ],
    sidebarItemIcon: ["flex size-[18px] shrink-0 items-center justify-center"],
    sidebarItemText: ["min-w-0 flex flex-1 items-baseline gap-1 text-left"],
    sidebarItemTextStack: ["min-w-0 flex-1 text-left"],
    sidebarItemTitle: ["block min-w-0 truncate"],
    sidebarItemSubtitle: ["block min-w-0 flex-1 truncate text-xs"],
    sidebarItemMeta: ["ml-auto shrink-0 font-mono text-[10px]"],
    sidebarItemIndicator: ["ml-1 shrink-0"],
    sidebarItemMention: [
      "ml-1 inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-2.5 [&_svg]:shrink-0",
    ],
    sidebarItemMuted: [
      "ml-1 inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    sidebarItemDraft: [
      "inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    sidebarItemAside: ["flex shrink-0 items-center gap-1.5"],
    sidebarItemBadge: ["shrink-0 px-1.5 py-0.5 text-[10px] leading-none", "font-bold"],
    sidebarFooter: ["shrink-0"],
    sidebarResizeGroup: [
      "flex h-full w-full min-h-0 min-w-0",
      "aria-[orientation=vertical]:flex-col",
    ],
    sidebarResizePanel: ["min-h-0 min-w-0"],
    sidebarResizeHandle: [
      "right-0 z-10 hidden cursor-col-resize select-none md:flex",
      "relative -ml-px flex w-px shrink-0 items-center justify-center",
      "bg-transparent outline-none ring-offset-background",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
      "focus-visible:ring-1 focus-visible:ring-line-focus",
      "aria-[orientation=horizontal]:-mt-px aria-[orientation=horizontal]:ml-0 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
      "aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:top-1/2",
      "aria-[orientation=horizontal]:after:h-3 aria-[orientation=horizontal]:after:w-full",
      "aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2",
    ],
    panelStackRoot: ["flex h-full min-h-0 w-full"],
    panelStackItem: ["relative flex h-full min-h-0 shrink-0 flex-col"],
    panelStackContent: ["min-h-0 flex-1 overflow-hidden"],
    resizeHandle: [
      "absolute inset-y-0 left-0 z-10 w-2 -translate-x-1 cursor-col-resize select-none",
    ],
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
        railHeader: "h-[62px] border-b-2 border-black [@media(max-height:600px)]:h-12",
        railServerButton: [
          "rounded-none border-2 border-black bg-black",
          "font-sans text-base font-bold text-soft-signal",
          "shadow-brutal-sm hover:shadow-brutal",
          "transition-all duration-100",
        ],
        railFooter: "h-[62px] [@media(max-height:600px)]:h-12",
        railItem: [
          "size-10 border-2 border-transparent text-foreground",
          "transition-colors",
          "hover:border-black hover:bg-white",
          "data-[selected=true]:border-black data-[selected=true]:bg-white data-[selected=true]:shadow-brutal-sm",
          "[@media(max-height:600px)]:size-9",
        ],
        railItemBadge: "border-2 border-black bg-brutal-pink text-black",
        railItemIndicator: "rounded-full border border-black bg-brutal-pink",
        sidebarHeader:
          "h-[62px] shrink-0 border-b-2 border-black bg-brutal-cream px-5 [@media(max-height:600px)]:h-12",
        sidebarBody: "bg-brutal-cream",
        sidebarSectionButton: "text-black transition-colors hover:text-black/70",
        sidebarSectionCount: "text-black/40",
        sidebarSectionAction: [
          "font-sans font-bold text-black/70",
          "transition-colors duration-100",
          "hover:bg-black/5 hover:text-black active:bg-black/10",
          "focus:outline-none focus-visible:bg-black/5 focus-visible:text-black focus-visible:outline-none",
        ],
        sidebarItem: [
          "border-transparent text-black",
          "hover:border-black hover:bg-white hover:shadow-brutal-sm",
          "active:border-black active:bg-white active:shadow-brutal-sm",
          "data-[selected=true]:border-black data-[selected=true]:bg-brutal-pink",
          "data-[selected=true]:shadow-brutal-sm",
          "data-[menu-open=true]:border-black data-[menu-open=true]:bg-white",
          "data-[menu-open=true]:shadow-brutal-sm",
        ],
        sidebarItemSubtitle: "text-black/40",
        sidebarItemMeta: "text-black/40",
        sidebarItemMention: "rounded border border-black bg-soft-signal text-black",
        sidebarItemMuted: "text-black/40",
        sidebarItemDraft: "text-black/40",
        sidebarItemBadge: "rounded border border-black bg-brutal-pink text-white",
        sidebarFooter: "border-t-2 border-black bg-brutal-cream p-3",
        sidebarResizeHandle: "hover:bg-black/10",
        panelStackItem: "w-[400px] border-l-2 border-black bg-white first:border-l-0",
        resizeHandle: "hover:bg-black/5",
      },
      elegant: {
        root: "bg-layer-muted font-sans text-foreground",
        shellRail:
          "w-16 border-r border-line-subtle bg-layer-panel [@media(max-height:600px)]:w-[50px]",
        shellSidebar: "w-60 border-r border-line-subtle bg-layer-panel",
        shellMain: "bg-layer-panel",
        shellPanelStack: "border-l border-line-subtle bg-layer-panel",
        mobileBar: "border-t border-line-subtle bg-layer-panel text-foreground",
        railHeader: "h-[62px] border-b border-line-subtle",
        railServerButton: [
          "rounded-md border-2 border-[#141111] bg-[#141111]",
          "font-heading text-sm font-bold text-primary-400",
          "shadow-sm",
        ],
        railFooter: "h-[62px]",
        railItem: [
          "size-10 rounded-md border border-transparent text-foreground-muted",
          "hover:bg-layer-muted hover:text-foreground-strong",
          "active:bg-layer-muted active:text-foreground-strong",
          "focus-visible:ring-2 focus-visible:ring-line-focus",
          "data-[selected=true]:border-line-subtle data-[selected=true]:bg-layer-muted data-[selected=true]:text-foreground-strong data-[selected=true]:shadow-xs",
        ],
        railItemBadge: "rounded-full bg-accent-400 text-accent-950",
        railItemIndicator: "rounded-full bg-danger-base",
        sidebarHeader:
          "h-[62px] shrink-0 border-b border-line-subtle px-5 [@media(max-height:600px)]:h-12",
        sidebarBody: "bg-layer-panel",
        sidebarSectionButton: "text-foreground-muted hover:text-foreground-strong",
        sidebarSectionCount: "text-foreground-muted",
        sidebarSectionAction:
          "rounded-md text-foreground-muted hover:bg-layer-muted hover:text-foreground-strong",
        sidebarItem: [
          "rounded-md border border-transparent text-foreground-strong",
          "hover:border-line-subtle hover:bg-layer-muted",
          "active:border-line-subtle active:bg-layer-muted",
          "data-[selected=true]:border-line-subtle data-[selected=true]:bg-layer-muted",
          "data-[selected=true]:font-semibold data-[selected=true]:shadow-xs",
          "data-[menu-open=true]:border-line-subtle data-[menu-open=true]:bg-layer-muted",
          "data-[menu-open=true]:shadow-xs",
        ],
        sidebarItemSubtitle: "text-foreground-muted",
        sidebarItemMeta: "text-foreground-muted",
        sidebarItemMention:
          "rounded border border-line-subtle bg-layer-muted text-foreground-strong",
        sidebarItemMuted: "text-foreground-muted",
        sidebarItemDraft: "text-foreground-muted",
        sidebarItemBadge: "rounded-full bg-accent-400 text-accent-950",
        sidebarFooter: "border-t border-line-subtle p-3",
        sidebarResizeHandle: "hover:bg-layer-muted",
        panelStackItem: "w-[400px] border-l border-line-subtle bg-layer-panel first:border-l-0",
        resizeHandle: "hover:bg-layer-muted",
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
        panelStackRoot: "relative",
      },
      false: {},
    },
    open: {
      true: {},
      false: {
        panelStackItem: "hidden",
      },
    },
  },
  defaultVariants: {
    presentation: "desktop",
    resizable: false,
    open: true,
  },
});

type HiddenProp = {
  hidden?: boolean;
};

type AppShellVariantProps = Omit<VariantProps<typeof appShell>, "theme">;

export type DataAttributes = {
  [key: `data-${string}`]: string | undefined;
};

type AppRailContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const AppRailContext = createContext<AppRailContextValue | null>(null);

function useAppRail() {
  return use(AppRailContext);
}

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

export type AppRailRootProps = useRender.ComponentProps<"div"> & {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function AppRailRoot({
  value,
  onValueChange,
  className,
  render,
  ...props
}: AppRailRootProps) {
  const { railRoot } = appShell();
  const contextValue = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-rail-root",
    className: railRoot({ className }),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return <AppRailContext.Provider value={contextValue}>{element}</AppRailContext.Provider>;
}

export type AppRailHeaderProps = useRender.ComponentProps<"div">;

export function AppRailHeader({ className, render, ...props }: AppRailHeaderProps) {
  const theme = useThemeFamily();
  const { railHeader } = appShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-rail-header",
    className: railHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppRailServerButtonProps = useRender.ComponentProps<"button">;

export function AppRailServerButton({ className, render, ...props }: AppRailServerButtonProps) {
  const theme = useThemeFamily();
  const { railServerButton } = appShell({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "app-rail-server-button",
    className: railServerButton({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type AppRailNavProps = useRender.ComponentProps<"nav">;

export function AppRailNav({ className, render, ...props }: AppRailNavProps) {
  const { railNav } = appShell();
  const defaultProps: useRender.ElementProps<"nav"> & DataAttributes = {
    "data-slot": "app-rail-nav",
    className: railNav({ className }),
  };

  return useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(defaultProps, props),
  });
}

export type AppRailItemProps = Omit<useRender.ComponentProps<"button">, "value"> & {
  value?: string;
  selected?: boolean;
  onSelect?: (value: string) => void;
};

export function AppRailItem({
  value,
  selected,
  disabled,
  onSelect,
  onClick,
  className,
  render,
  ...props
}: AppRailItemProps) {
  const theme = useThemeFamily();
  const context = useAppRail();
  const isSelected = selected ?? (value !== undefined && context?.value === value);
  const { railItem } = appShell({ theme });
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled || value === undefined) return;
    onSelect?.(value);
    context?.onValueChange?.(value);
  };
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    disabled,
    onClick: handleClick,
    "aria-pressed": isSelected,
    "data-slot": "app-rail-item",
    "data-selected": isSelected ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    className: railItem({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type AppRailItemIconProps = useRender.ComponentProps<"span">;

export function AppRailItemIcon({ className, render, ...props }: AppRailItemIconProps) {
  const { railItemIcon } = appShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-icon",
    className: railItemIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppRailItemLabelProps = useRender.ComponentProps<"span">;

export function AppRailItemLabel({ className, render, ...props }: AppRailItemLabelProps) {
  const { railItemLabel } = appShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-label",
    className: railItemLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppRailItemBadgeProps = useRender.ComponentProps<"span">;

export function AppRailItemBadge({ className, render, ...props }: AppRailItemBadgeProps) {
  const theme = useThemeFamily();
  const { railItemBadge } = appShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-badge",
    className: railItemBadge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppRailItemIndicatorProps = useRender.ComponentProps<"span">;

export function AppRailItemIndicator({ className, render, ...props }: AppRailItemIndicatorProps) {
  const theme = useThemeFamily();
  const { railItemIndicator } = appShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-indicator",
    className: railItemIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppRailFooterProps = useRender.ComponentProps<"div">;

export function AppRailFooter({ className, render, ...props }: AppRailFooterProps) {
  const theme = useThemeFamily();
  const { railFooter } = appShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-rail-footer",
    className: railFooter({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppPanelStackRootProps = useRender.ComponentProps<"div"> &
  Pick<AppShellVariantProps, "resizable">;

export function AppPanelStackRoot({
  resizable,
  className,
  render,
  ...props
}: AppPanelStackRootProps) {
  const { panelStackRoot } = appShell({ resizable });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-panel-stack-root",
    "data-resizable": resizable ? "true" : undefined,
    className: panelStackRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppPanelStackItemProps = useRender.ComponentProps<"section"> &
  Pick<AppShellVariantProps, "open">;

export function AppPanelStackItem({ open, className, render, ...props }: AppPanelStackItemProps) {
  const theme = useThemeFamily();
  const { panelStackItem } = appShell({ theme, open });
  const defaultProps: useRender.ElementProps<"section"> & DataAttributes = {
    "data-slot": "app-panel-stack-item",
    "data-open": open === false ? "false" : "true",
    className: panelStackItem({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type AppPanelStackContentProps = useRender.ComponentProps<"div">;

export function AppPanelStackContent({ className, render, ...props }: AppPanelStackContentProps) {
  const { panelStackContent } = appShell();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-panel-stack-content",
    className: panelStackContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppPanelResizeHandleProps = useRender.ComponentProps<"div"> & {
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
};

export function AppPanelResizeHandle({
  disabled,
  orientation = "vertical",
  className,
  render,
  ...props
}: AppPanelResizeHandleProps) {
  const theme = useThemeFamily();
  const { resizeHandle } = appShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    role: "separator",
    "aria-orientation": orientation,
    "aria-disabled": disabled,
    "data-slot": "app-panel-resize-handle",
    "data-disabled": disabled ? "true" : undefined,
    className: resizeHandle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export const ChatShellRoot = AppShellRoot;
export const ChatShellRail = AppShellRail;
export const ChatShellSidebar = AppShellSidebar;
export const ChatShellMain = AppShellMain;
export const ChatShellPanelStack = AppShellPanelStack;
export const ChatShellMobileBar = AppShellMobileBar;
export const ChatRailRoot = AppRailRoot;
export const ChatRailHeader = AppRailHeader;
export const ChatRailServerButton = AppRailServerButton;
export const ChatRailNav = AppRailNav;
export const ChatRailItem = AppRailItem;
export const ChatRailItemIcon = AppRailItemIcon;
export const ChatRailItemLabel = AppRailItemLabel;
export const ChatRailItemBadge = AppRailItemBadge;
export const ChatRailItemIndicator = AppRailItemIndicator;
export const ChatRailFooter = AppRailFooter;
export const ChatPanelStackRoot = AppPanelStackRoot;
export const ChatPanelStackItem = AppPanelStackItem;
export const ChatPanelStackContent = AppPanelStackContent;
export const ChatPanelResizeHandle = AppPanelResizeHandle;

export type ChatShellRootProps = AppShellRootProps;
export type ChatShellRailProps = AppShellRailProps;
export type ChatShellSidebarProps = AppShellSidebarProps;
export type ChatShellMainProps = AppShellMainProps;
export type ChatShellPanelStackProps = AppShellPanelStackProps;
export type ChatShellMobileBarProps = AppShellMobileBarProps;
export type ChatRailRootProps = AppRailRootProps;
export type ChatRailHeaderProps = AppRailHeaderProps;
export type ChatRailServerButtonProps = AppRailServerButtonProps;
export type ChatRailNavProps = AppRailNavProps;
export type ChatRailItemProps = AppRailItemProps;
export type ChatRailItemIconProps = AppRailItemIconProps;
export type ChatRailItemLabelProps = AppRailItemLabelProps;
export type ChatRailItemBadgeProps = AppRailItemBadgeProps;
export type ChatRailItemIndicatorProps = AppRailItemIndicatorProps;
export type ChatRailFooterProps = AppRailFooterProps;
export type ChatPanelStackRootProps = AppPanelStackRootProps;
export type ChatPanelStackItemProps = AppPanelStackItemProps;
export type ChatPanelStackContentProps = AppPanelStackContentProps;
export type ChatPanelResizeHandleProps = AppPanelResizeHandleProps;
