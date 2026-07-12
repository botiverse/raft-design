import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, use, useMemo, type MouseEvent, type ReactNode } from "react";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { DataAttributes } from "./data-attributes";

const appRail = tv({
  slots: {
    root: ["flex h-full w-full flex-col items-center"],
    header: ["relative flex w-full shrink-0 items-center justify-center"],
    serverButton: [
      "relative inline-flex size-10 items-center justify-center",
      "outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[@media(max-height:600px)]:size-9",
    ],
    nav: ["flex w-full flex-1 flex-col items-center gap-1.5 py-2"],
    footer: ["flex w-full shrink-0 flex-col items-center justify-center gap-1.5"],
    item: [
      "relative inline-flex shrink-0 items-center justify-center",
      "outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[&_svg]:size-[18px] [&_svg]:shrink-0",
    ],
    itemIcon: ["relative inline-flex items-center justify-center"],
    itemAttentionMask: [
      "pointer-events-none absolute inset-0",
      "[&_svg]:size-full [&_svg]:shrink-0",
    ],
    itemLabel: ["sr-only"],
    itemBadge: [
      "absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center",
      "px-1 text-[10px] font-bold leading-4",
    ],
    itemIndicator: ["pointer-events-none absolute -right-1 -top-1 size-2.5"],
  },
  variants: {
    theme: {
      brutal: {
        header: "h-[62px] border-b-2 border-black [@media(max-height:600px)]:h-12",
        serverButton: [
          "rounded-none border-2 border-black bg-black",
          "font-sans text-base font-bold text-soft-signal",
          "shadow-brutal-sm hover:shadow-brutal",
          "transition-all duration-100",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        footer: "h-auto pb-2 [@media(max-height:600px)]:pb-1",
        item: [
          "size-10 border-2 border-transparent text-foreground",
          "transition-colors",
          "hover:border-black hover:bg-white",
          "data-[selected=true]:border-black data-[selected=true]:bg-white data-[selected=true]:shadow-brutal-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "[@media(max-height:600px)]:size-9",
        ],
        itemBadge: "border-2 border-black bg-brutal-pink text-black",
        itemIndicator: "rounded-full border border-black bg-brutal-pink",
        itemAttentionMask: "hidden",
      },
      elegant: {
        header: "h-[var(--shell-header-height,3.5rem)] border-b-0",
        serverButton: [
          "rounded-md border-2 border-foreground-strong bg-foreground-strong",
          "font-heading text-xs font-bold text-primary-400",
          "shadow-none transition-[background-color,transform] duration-150 active:translate-y-px",
        ],
        nav: "px-2 pt-4 pb-2",
        footer: ["h-auto gap-1.5 px-2 pb-2", "[&>[data-slot=app-rail-item]]:text-foreground-muted"],
        item: [
          "size-auto min-w-9 p-3 rounded-md border border-transparent",
          "text-[13px] text-foreground-icon [&_svg]:size-4",
          "hover:bg-layer-strong/80 hover:text-foreground",
          "active:bg-layer-strong/80 active:text-foreground",
          "data-[selected=true]:border-transparent data-[selected=true]:bg-layer-strong",
          "data-[selected=true]:text-foreground-muted data-[selected=true]:shadow-none",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
        ],
        itemBadge: [
          "rounded-full border-0 bg-primary-400 text-primary-950",
          "px-1 font-mono text-[10px] font-[450] leading-none tabular-nums normal-case tracking-normal",
          "ring-2 ring-layer-page",
        ],
        itemIndicator: "size-2 rounded-full border border-primary-500/58 bg-primary-400",
        itemAttentionMask: [
          "text-[oklch(73.4%_0.149_89.2)] drop-shadow-[0_0_1px_#FFD440D1]",
          "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
          "[-webkit-mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
        ],
      },
    },
  },
});

type AppRailContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const AppRailContext = createContext<AppRailContextValue | null>(null);

function useAppRail() {
  return use(AppRailContext);
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
  const { root } = appRail();
  const contextValue = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-rail-root",
    className: root({ className }),
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
  const { header } = appRail({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-rail-header",
    className: header({ className }),
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
  const { serverButton } = appRail({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-slot": "app-rail-server-button",
    className: serverButton({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type AppRailNavProps = useRender.ComponentProps<"nav">;

export function AppRailNav({ className, render, ...props }: AppRailNavProps) {
  const theme = useThemeFamily();
  const { nav } = appRail({ theme });
  const defaultProps: useRender.ElementProps<"nav"> & DataAttributes = {
    "data-slot": "app-rail-nav",
    className: nav({ className }),
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
  const { item } = appRail({ theme });
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
    className: item({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type AppRailItemIconProps = useRender.ComponentProps<"span">;

export function AppRailItemIcon({ className, render, ...props }: AppRailItemIconProps) {
  const { itemIcon } = appRail();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-icon",
    className: itemIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppRailItemAttentionProps = {
  title?: string;
  children: ReactNode;
};

export function AppRailItemAttention({ title, children }: AppRailItemAttentionProps) {
  return (
    <>
      <AppRailItemAttentionMask aria-hidden>{children}</AppRailItemAttentionMask>
      <AppRailItemIndicator aria-hidden title={title} />
    </>
  );
}

export type AppRailItemAttentionMaskProps = useRender.ComponentProps<"span">;

export function AppRailItemAttentionMask({
  className,
  render,
  ...props
}: AppRailItemAttentionMaskProps) {
  const theme = useThemeFamily();
  const { itemAttentionMask } = appRail({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-attention-mask",
    className: itemAttentionMask({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppRailItemLabelProps = useRender.ComponentProps<"span">;

export function AppRailItemLabel({ className, render, ...props }: AppRailItemLabelProps) {
  const { itemLabel } = appRail();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-label",
    className: itemLabel({ className }),
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
  const { itemBadge } = appRail({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-badge",
    className: itemBadge({ className }),
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
  const { itemIndicator } = appRail({ theme });
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-rail-item-indicator",
    className: itemIndicator({ className }),
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
  const { footer } = appRail({ theme });
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-rail-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
