import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, use, useMemo, type MouseEvent } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

export const chatShell = tv({
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
    sidebarList: ["space-y-1"],
    sidebarSectionHeader: ["mt-3 mb-1 flex h-6 items-center justify-between px-2"],
    sidebarSectionButton: [
      "flex h-6 min-w-0 flex-1 items-center gap-1",
      "text-xs font-bold tracking-widest uppercase",
      "[&[data-panel-open]_svg]:rotate-90",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono text-[10px] font-normal tracking-normal"],
    sidebarSectionIndicator: ["ml-1", "[[data-panel-open]_&]:hidden"],
    sidebarSectionActions: ["flex shrink-0 items-center gap-1"],
    sidebarSectionAction: ["flex size-6 items-center justify-center p-0"],
    sidebarItem: [
      "mb-1 flex w-full items-center gap-1.5 px-2 py-2 text-left",
      "border-2 text-sm font-medium",
      "[@media(max-height:600px)]:py-1 md:py-1",
    ],
    sidebarItemIcon: ["flex size-[18px] shrink-0 items-center justify-center"],
    sidebarItemText: ["min-w-0 flex flex-1 items-baseline gap-1 text-left"],
    sidebarItemTextStack: ["min-w-0 flex-1 text-left"],
    sidebarItemTitle: ["block min-w-0 truncate"],
    sidebarItemSubtitle: ["block truncate font-mono text-[11px]"],
    sidebarItemMeta: ["ml-auto shrink-0 font-mono text-[10px]"],
    sidebarItemIndicator: ["ml-1 shrink-0"],
    sidebarItemMention: [
      "inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-2.5 [&_svg]:shrink-0",
    ],
    sidebarItemMuted: [
      "inline-flex size-4 shrink-0 items-center justify-center",
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
      "relative flex w-px shrink-0 items-center justify-center",
      "bg-transparent outline-none ring-offset-background",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
      "focus-visible:ring-1 focus-visible:ring-line-focus",
      "aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
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
        root: "bg-brutal-cream font-display text-black",
        shellRail:
          "w-16 border-r-2 border-[#141111] bg-soft-signal font-display text-[#141111] [@media(max-height:600px)]:w-[50px]",
        shellSidebar: "w-60 border-r-2 border-black bg-brutal-cream",
        shellMain: "bg-white",
        shellPanelStack: "border-l-2 border-black bg-white",
        mobileBar: "border-t-2 border-black bg-white text-black",
        railHeader: "h-[62px] border-b-2 border-[#141111] [@media(max-height:600px)]:h-12",
        railServerButton: [
          "rounded-none border-2 border-[#141111] bg-[#141111]",
          "font-display text-base font-bold text-soft-signal",
          "shadow-[2px_2px_0_#141111] hover:shadow-[4px_4px_0_#141111]",
        ],
        railFooter: "h-[62px] [@media(max-height:600px)]:h-12",
        railItem: [
          "size-10 border-2 border-transparent text-[#141111]",
          "hover:border-[#141111] hover:bg-white",
          "active:border-[#141111] active:bg-white active:shadow-[var(--shadow-brutal-sm)]",
          "data-[selected=true]:border-[#141111] data-[selected=true]:bg-white data-[selected=true]:shadow-[var(--shadow-brutal-sm)]",
          "[@media(max-height:600px)]:size-9",
        ],
        railItemBadge: "border-2 border-black bg-brutal-pink text-black",
        railItemIndicator: "rounded-full border border-[#141111] bg-brutal-pink",
        sidebarHeader:
          "h-[62px] shrink-0 border-b-2 border-black bg-brutal-cream px-5 [@media(max-height:600px)]:h-12",
        sidebarBody: "bg-brutal-cream",
        sidebarSectionButton: "text-black hover:text-black/70",
        sidebarSectionCount: "text-black/40",
        sidebarSectionAction: [
          "font-display font-bold text-black/70",
          "hover:bg-black/5 hover:text-black active:bg-black/10",
          "focus:outline-none focus-visible:bg-black/5 focus-visible:text-black focus-visible:outline-none",
        ],
        sidebarItem: [
          "border-transparent text-black",
          "hover:border-black hover:bg-white hover:shadow-[var(--shadow-brutal-sm)]",
          "active:border-black active:bg-white active:shadow-[var(--shadow-brutal-sm)]",
          "data-[selected=true]:border-black data-[selected=true]:bg-brutal-pink",
          "data-[selected=true]:font-bold data-[selected=true]:shadow-[var(--shadow-brutal-sm)]",
          "data-[menu-open=true]:border-black data-[menu-open=true]:bg-white",
          "data-[menu-open=true]:shadow-[var(--shadow-brutal-sm)]",
        ],
        sidebarItemSubtitle: "text-black/50",
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
  return use(ChatRailContext);
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

  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "chat-shell-root",
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

export type ChatShellRailProps = useRender.ComponentProps<"aside"> & HiddenProp;

export function ChatShellRail({ hidden, className, render, ...props }: ChatShellRailProps) {
  const theme = useThemeFamily();
  const { shellRail } = chatShell({ theme });

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "chat-shell-rail",
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

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "chat-shell-sidebar",
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

export type ChatShellMainProps = useRender.ComponentProps<"main"> & HiddenProp;

export function ChatShellMain({ hidden, className, render, ...props }: ChatShellMainProps) {
  const theme = useThemeFamily();
  const { shellMain } = chatShell({ theme });

  const defaultProps: useRender.ElementProps<"main"> & DataAttributes = {
    "data-slot": "chat-shell-main",
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

  const defaultProps: useRender.ElementProps<"aside"> & DataAttributes = {
    "data-slot": "chat-shell-panel-stack",
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

export type ChatShellMobileBarProps = useRender.ComponentProps<"nav"> & HiddenProp;

export function ChatShellMobileBar({
  hidden,
  className,
  render,
  ...props
}: ChatShellMobileBarProps) {
  const theme = useThemeFamily();
  const { mobileBar } = chatShell({ theme });

  const defaultProps: useRender.ElementProps<"nav"> & DataAttributes = {
    "data-slot": "chat-shell-mobile-bar",
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

export type ChatRailServerButtonProps = useRender.ComponentProps<"button">;

export function ChatRailServerButton({ className, render, ...props }: ChatRailServerButtonProps) {
  const theme = useThemeFamily();
  const { railServerButton } = chatShell({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "chat-rail-server-button",
    className: railServerButton({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
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
