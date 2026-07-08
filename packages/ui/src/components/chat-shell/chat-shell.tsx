import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useContext, useMemo, type MouseEvent } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const chatShell = tv({
  slots: {
    root: [
      "flex min-h-0 w-full overflow-hidden",
      "font-sans text-foreground",
      "data-[presentation=mobile]:flex-col",
    ],
    shellRail: ["hidden h-full shrink-0 select-none md:flex"],
    shellSidebar: ["hidden min-h-0 shrink-0 flex-col md:flex"],
    shellMain: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    shellPanelStack: ["hidden min-h-0 shrink-0 lg:flex"],
    mobileBar: ["shrink-0 md:hidden"],
    railRoot: ["flex h-full w-full flex-col items-center"],
    railHeader: ["relative flex w-full shrink-0 items-center justify-center"],
    railNav: ["flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto py-2"],
    railFooter: ["flex w-full shrink-0 flex-col items-center justify-center gap-1.5"],
    railItem: [
      "relative inline-flex shrink-0 items-center justify-center",
      "outline-none transition-colors",
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
    sidebarRoot: ["flex h-full min-h-0 w-full flex-col"],
    sidebarHeader: ["flex shrink-0 items-center gap-3"],
    sidebarBody: ["min-h-0 flex-1 overflow-y-auto"],
    sidebarSection: ["px-2"],
    sidebarList: ["space-y-1"],
    sidebarFooter: ["shrink-0"],
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
        root: "bg-brutal-cream text-black",
        shellRail: "w-16 border-r-2 border-black bg-soft-signal",
        shellSidebar: "w-72 border-r-2 border-black bg-brutal-cream",
        shellMain: "bg-white",
        shellPanelStack: "border-l-2 border-black bg-white",
        mobileBar: "border-t-2 border-black bg-white text-black",
        railHeader: "h-[62px] border-b-2 border-black [@media(max-height:600px)]:h-12",
        railFooter: "min-h-[62px] pb-2 [@media(max-height:600px)]:min-h-12",
        railItem: [
          "size-10 border-2 border-transparent text-black",
          "hover:border-black hover:bg-white",
          "active:border-black active:bg-white active:shadow-xs",
          "data-[selected=true]:border-black data-[selected=true]:bg-white data-[selected=true]:shadow-sm",
          "[@media(max-height:600px)]:size-9",
        ],
        railItemBadge: "border-2 border-black bg-brutal-pink text-black",
        railItemIndicator: "border-2 border-black bg-brutal-red",
        sidebarHeader: "min-h-[62px] border-b-2 border-black bg-brutal-cream px-3",
        sidebarBody: "bg-brutal-cream py-2",
        sidebarFooter: "border-t-2 border-black bg-brutal-cream p-3",
        panelStackItem: "w-80 border-l-2 border-black bg-white first:border-l-0",
        resizeHandle: "hover:bg-black/5",
      },
      elegant: {
        root: "bg-layer-muted text-foreground",
        shellRail: "w-16 border-r border-line-subtle bg-layer-panel",
        shellSidebar: "w-72 border-r border-line-subtle bg-layer-panel",
        shellMain: "bg-layer-panel",
        shellPanelStack: "border-l border-line-subtle bg-layer-panel",
        mobileBar: "border-t border-line-subtle bg-layer-panel text-foreground",
        railHeader: "h-[62px] border-b border-line-subtle",
        railFooter: "min-h-[62px] pb-2",
        railItem: [
          "size-10 rounded-md border border-transparent text-foreground-muted",
          "hover:bg-layer-muted hover:text-foreground-strong",
          "active:bg-layer-muted active:text-foreground-strong",
          "focus-visible:ring-2 focus-visible:ring-line-focus",
          "data-[selected=true]:border-line-subtle data-[selected=true]:bg-layer-muted data-[selected=true]:text-foreground-strong data-[selected=true]:shadow-xs",
        ],
        railItemBadge: "rounded-full bg-accent-400 text-accent-950",
        railItemIndicator: "rounded-full bg-danger-base",
        sidebarHeader: "min-h-[62px] border-b border-line-subtle px-4",
        sidebarBody: "bg-layer-panel py-2",
        sidebarFooter: "border-t border-line-subtle p-3",
        panelStackItem: "w-80 border-l border-line-subtle bg-layer-panel first:border-l-0",
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
        shellSidebar: "relative",
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

type ChatShellVariantProps = Omit<VariantProps<typeof chatShell>, "theme">;

export type DataAttributes = {
  [key: `data-${string}`]: string | undefined;
};

type ChatRailContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const ChatRailContext = createContext<ChatRailContextValue | null>(null);

function useChatRail() {
  return useContext(ChatRailContext);
}

export type ChatShellRootProps = useRender.ComponentProps<"div"> &
  HiddenProp &
  Pick<ChatShellVariantProps, "presentation">;

export function ChatShellRoot({
  presentation,
  hidden,
  className,
  render,
  ...props
}: ChatShellRootProps) {
  const theme = useThemeFamily();
  const { root } = chatShell({ theme, presentation });

  if (hidden) return null;

  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-shell-root",
    "data-presentation": presentation ?? "desktop",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatShellRailProps = useRender.ComponentProps<"aside"> & HiddenProp;

export function ChatShellRail({ hidden, className, render, ...props }: ChatShellRailProps) {
  const theme = useThemeFamily();
  const { shellRail } = chatShell({ theme });

  if (hidden) return null;

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "chat-shell-rail",
    className: shellRail({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type ChatShellSidebarProps = useRender.ComponentProps<"aside"> &
  HiddenProp &
  Pick<ChatShellVariantProps, "resizable">;

export function ChatShellSidebar({
  hidden,
  resizable,
  className,
  render,
  ...props
}: ChatShellSidebarProps) {
  const theme = useThemeFamily();
  const { shellSidebar } = chatShell({ theme, resizable });

  if (hidden) return null;

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "chat-shell-sidebar",
    "data-resizable": resizable ? "true" : undefined,
    className: shellSidebar({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type ChatShellMainProps = useRender.ComponentProps<"main"> & HiddenProp;

export function ChatShellMain({ hidden, className, render, ...props }: ChatShellMainProps) {
  const theme = useThemeFamily();
  const { shellMain } = chatShell({ theme });

  if (hidden) return null;

  const defaultProps: useRender.ElementProps<"main"> & DataAttributes = {
    "data-slot": "chat-shell-main",
    className: shellMain({ className }),
  };

  return useRender({
    defaultTagName: "main",
    render,
    props: mergeProps<"main">(defaultProps, props),
  });
}

export type ChatShellPanelStackProps = useRender.ComponentProps<"aside"> &
  HiddenProp &
  Pick<ChatShellVariantProps, "resizable">;

export function ChatShellPanelStack({
  hidden,
  resizable,
  className,
  render,
  ...props
}: ChatShellPanelStackProps) {
  const theme = useThemeFamily();
  const { shellPanelStack } = chatShell({ theme, resizable });

  if (hidden) return null;

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "chat-shell-panel-stack",
    "data-resizable": resizable ? "true" : undefined,
    className: shellPanelStack({ className }),
  };

  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(defaultProps, props),
  });
}

export type ChatShellMobileBarProps = useRender.ComponentProps<"nav"> & HiddenProp;

export function ChatShellMobileBar({
  hidden,
  className,
  render,
  ...props
}: ChatShellMobileBarProps) {
  const theme = useThemeFamily();
  const { mobileBar } = chatShell({ theme });

  if (hidden) return null;

  const defaultProps: useRender.ElementProps<"nav"> & DataAttributes = {
    "data-slot": "chat-shell-mobile-bar",
    className: mobileBar({ className }),
  };

  return useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(defaultProps, props),
  });
}

export type ChatRailRootProps = useRender.ComponentProps<"div"> & {
  value?: string;
  onValueChange?: (value: string) => void;
};

export function ChatRailRoot({
  value,
  onValueChange,
  className,
  render,
  ...props
}: ChatRailRootProps) {
  const { railRoot } = chatShell();
  const contextValue = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-rail-root",
    className: railRoot({ className }),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return <ChatRailContext.Provider value={contextValue}>{element}</ChatRailContext.Provider>;
}

export type ChatRailHeaderProps = useRender.ComponentProps<"div">;

export function ChatRailHeader({ className, render, ...props }: ChatRailHeaderProps) {
  const theme = useThemeFamily();
  const { railHeader } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-rail-header",
    className: railHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatRailNavProps = useRender.ComponentProps<"nav">;

export function ChatRailNav({ className, render, ...props }: ChatRailNavProps) {
  const { railNav } = chatShell();
  const defaultProps: useRender.ElementProps<"nav"> & DataAttributes = {
    "data-slot": "chat-rail-nav",
    className: railNav({ className }),
  };

  return useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(defaultProps, props),
  });
}

export type ChatRailItemProps = Omit<useRender.ComponentProps<"button">, "value"> & {
  value?: string;
  selected?: boolean;
  onSelect?: (value: string) => void;
};

export function ChatRailItem({
  value,
  selected,
  disabled,
  onSelect,
  onClick,
  className,
  render,
  ...props
}: ChatRailItemProps) {
  const theme = useThemeFamily();
  const context = useChatRail();
  const isSelected = selected ?? (value !== undefined && context?.value === value);
  const { railItem } = chatShell({ theme });
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
    "data-slot": "chat-rail-item",
    "data-selected": isSelected ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    className: railItem({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ChatRailItemIconProps = useRender.ComponentProps<"span">;

export function ChatRailItemIcon({ className, render, ...props }: ChatRailItemIconProps) {
  const { railItemIcon } = chatShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-rail-item-icon",
    className: railItemIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatRailItemLabelProps = useRender.ComponentProps<"span">;

export function ChatRailItemLabel({ className, render, ...props }: ChatRailItemLabelProps) {
  const { railItemLabel } = chatShell();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-rail-item-label",
    className: railItemLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatRailItemBadgeProps = useRender.ComponentProps<"span">;

export function ChatRailItemBadge({ className, render, ...props }: ChatRailItemBadgeProps) {
  const theme = useThemeFamily();
  const { railItemBadge } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-rail-item-badge",
    className: railItemBadge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatRailItemIndicatorProps = useRender.ComponentProps<"span">;

export function ChatRailItemIndicator({ className, render, ...props }: ChatRailItemIndicatorProps) {
  const theme = useThemeFamily();
  const { railItemIndicator } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "chat-rail-item-indicator",
    className: railItemIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type ChatRailFooterProps = useRender.ComponentProps<"div">;

export function ChatRailFooter({ className, render, ...props }: ChatRailFooterProps) {
  const theme = useThemeFamily();
  const { railFooter } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-rail-footer",
    className: railFooter({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarRootProps = useRender.ComponentProps<"div">;

export function ChatSidebarRoot({ className, render, ...props }: ChatSidebarRootProps) {
  const { sidebarRoot } = chatShell();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-root",
    className: sidebarRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarHeaderProps = useRender.ComponentProps<"div">;

export function ChatSidebarHeader({ className, render, ...props }: ChatSidebarHeaderProps) {
  const theme = useThemeFamily();
  const { sidebarHeader } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-header",
    className: sidebarHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarBodyProps = useRender.ComponentProps<"div">;

export function ChatSidebarBody({ className, render, ...props }: ChatSidebarBodyProps) {
  const theme = useThemeFamily();
  const { sidebarBody } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-body",
    className: sidebarBody({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarSectionProps = useRender.ComponentProps<"section">;

export function ChatSidebarSection({ className, render, ...props }: ChatSidebarSectionProps) {
  const { sidebarSection } = chatShell();
  const defaultProps: useRender.ElementProps<"section"> & DataAttributes = {
    "data-slot": "chat-sidebar-section",
    className: sidebarSection({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type ChatSidebarListProps = useRender.ComponentProps<"div">;

export function ChatSidebarList({ className, render, ...props }: ChatSidebarListProps) {
  const { sidebarList } = chatShell();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-list",
    className: sidebarList({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatSidebarFooterProps = useRender.ComponentProps<"div">;

export function ChatSidebarFooter({ className, render, ...props }: ChatSidebarFooterProps) {
  const theme = useThemeFamily();
  const { sidebarFooter } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-sidebar-footer",
    className: sidebarFooter({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatPanelStackRootProps = useRender.ComponentProps<"div"> &
  Pick<ChatShellVariantProps, "resizable">;

export function ChatPanelStackRoot({
  resizable,
  className,
  render,
  ...props
}: ChatPanelStackRootProps) {
  const { panelStackRoot } = chatShell({ resizable });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-panel-stack-root",
    "data-resizable": resizable ? "true" : undefined,
    className: panelStackRoot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatPanelStackItemProps = useRender.ComponentProps<"section"> &
  Pick<ChatShellVariantProps, "open">;

export function ChatPanelStackItem({ open, className, render, ...props }: ChatPanelStackItemProps) {
  const theme = useThemeFamily();
  const { panelStackItem } = chatShell({ theme, open });
  const defaultProps: useRender.ElementProps<"section"> & DataAttributes = {
    "data-slot": "chat-panel-stack-item",
    "data-open": open === false ? "false" : "true",
    className: panelStackItem({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type ChatPanelStackContentProps = useRender.ComponentProps<"div">;

export function ChatPanelStackContent({ className, render, ...props }: ChatPanelStackContentProps) {
  const { panelStackContent } = chatShell();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-panel-stack-content",
    className: panelStackContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ChatPanelResizeHandleProps = useRender.ComponentProps<"div"> & {
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
};

export function ChatPanelResizeHandle({
  disabled,
  orientation = "vertical",
  className,
  render,
  ...props
}: ChatPanelResizeHandleProps) {
  const theme = useThemeFamily();
  const { resizeHandle } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    role: "separator",
    "aria-orientation": orientation,
    "aria-disabled": disabled,
    "data-slot": "chat-panel-resize-handle",
    "data-disabled": disabled ? "true" : undefined,
    className: resizeHandle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
