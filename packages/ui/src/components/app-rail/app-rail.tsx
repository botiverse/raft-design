import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, use, useMemo, type MouseEvent, type ReactNode } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Status, type StatusProps } from "../status/status";
import type { SlotElementProps } from "../../lib/data-attributes";
import { appRail } from "./app-rail.recipe";

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
  const defaultProps: SlotElementProps<"div"> = {
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
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "app-rail-header",
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppRailNavProps = useRender.ComponentProps<"nav">;

export function AppRailNav({ className, render, ...props }: AppRailNavProps) {
  const theme = useThemeFamily();
  const { nav } = appRail({ theme });
  const defaultProps: SlotElementProps<"nav"> = {
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
  const defaultProps: SlotElementProps<"button"> = {
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
  const defaultProps: SlotElementProps<"span"> = {
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
      <AppRailItemIndicator aria-hidden />
      {/* Surface the attention label to assistive tech; the indicator itself is decorative. */}
      {title ? <span className="sr-only">{title}</span> : null}
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
  const defaultProps: SlotElementProps<"span"> = {
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
  const theme = useThemeFamily();
  const { itemLabel } = appRail({ theme });
  const defaultProps: SlotElementProps<"span"> = {
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
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "app-rail-item-badge",
    className: itemBadge({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppRailItemIndicatorProps = StatusProps;

export function AppRailItemIndicator({
  className,
  size = "sm",
  variant,
  attention = true,
  ...props
}: AppRailItemIndicatorProps) {
  const theme = useThemeFamily();
  const { itemIndicator } = appRail({ theme });
  const resolvedVariant = variant ?? (theme === "elegant" ? "primary" : "accent");

  return (
    <Status
      aria-hidden
      attention={attention}
      size={size}
      variant={resolvedVariant}
      data-slot="app-rail-item-indicator"
      className={itemIndicator({ className })}
      {...props}
    />
  );
}

export type AppRailFooterProps = useRender.ComponentProps<"div">;

export function AppRailFooter({ className, render, ...props }: AppRailFooterProps) {
  const theme = useThemeFamily();
  const { footer } = appRail({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "app-rail-footer",
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
