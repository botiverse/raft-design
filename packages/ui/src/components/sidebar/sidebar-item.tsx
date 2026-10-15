import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Badge } from "../badge";
import type { BadgeProps } from "../badge";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { VariantProps } from "../../lib/tv";
import { sidebarItemRecipe } from "./sidebar-item.recipe";
import { ThreadIcon } from "../icons";

export type SidebarItemRootProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};

export function SidebarItemRoot({
  active = false,
  className,
  render,
  ...props
}: SidebarItemRootProps) {
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "sidebar-item",
    "data-active": active ? "true" : undefined,
    className,
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SidebarItemVariant = NonNullable<VariantProps<typeof sidebarItemRecipe>["variant"]>;

export type SidebarItemProps = SidebarItemRootProps &
  Pick<VariantProps<typeof sidebarItemRecipe>, "variant">;

export function SidebarItem({ className, variant = "default", ...props }: SidebarItemProps) {
  const theme = useThemeFamily();
  const { sidebarItem } = sidebarItemRecipe({ theme, variant });
  return (
    <SidebarItemRoot data-variant={variant} className={sidebarItem({ className })} {...props} />
  );
}

export type SidebarItemIconProps = useRender.ComponentProps<"span">;

export function SidebarItemIcon({ className, render, ...props }: SidebarItemIconProps) {
  const theme = useThemeFamily();
  const { sidebarItemIcon } = sidebarItemRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-icon",
    className: sidebarItemIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemChannelIconProps = useRender.ComponentProps<"span">;

export function SidebarItemChannelIcon({
  className,
  render,
  ...props
}: SidebarItemChannelIconProps) {
  const theme = useThemeFamily();
  const { sidebarItemChannelIcon } = sidebarItemRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-channel-icon",
    className: sidebarItemChannelIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemContentProps = useRender.ComponentProps<"span"> & {
  stacked?: boolean;
};

export function SidebarItemContent({
  className,
  render,
  stacked,
  ...props
}: SidebarItemContentProps) {
  const { sidebarItemContent } = sidebarItemRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-content",
    className: sidebarItemContent({ className, stacked }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemTitleProps = useRender.ComponentProps<"span">;

export function SidebarItemTitle({ className, render, ...props }: SidebarItemTitleProps) {
  const theme = useThemeFamily();
  const { sidebarItemTitle } = sidebarItemRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-title",
    className: sidebarItemTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemSubtitleProps = useRender.ComponentProps<"span">;

export function SidebarItemSubtitle({ className, render, ...props }: SidebarItemSubtitleProps) {
  const theme = useThemeFamily();
  const { sidebarItemSubtitle } = sidebarItemRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-subtitle",
    className: sidebarItemSubtitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemMetaProps = useRender.ComponentProps<"span">;

export function SidebarItemMeta({ className, render, ...props }: SidebarItemMetaProps) {
  const theme = useThemeFamily();
  const { sidebarItemMeta } = sidebarItemRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-meta",
    className: sidebarItemMeta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemStatusProps = useRender.ComponentProps<"span">;

export function SidebarItemStatus({ className, render, ...props }: SidebarItemStatusProps) {
  const theme = useThemeFamily();
  const { sidebarItemStatus } = sidebarItemRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-status",
    className: sidebarItemStatus({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemIndicatorProps = BadgeProps;

export function SidebarItemIndicator({
  appearance = "solid",
  className,
  uppercase = false,
  variant = "primary",
  ...props
}: SidebarItemIndicatorProps) {
  const theme = useThemeFamily();
  const { sidebarItemIndicator } = sidebarItemRecipe({ theme });
  return (
    <Badge
      data-slot="sidebar-item-indicator"
      appearance={appearance}
      uppercase={uppercase}
      variant={variant}
      className={sidebarItemIndicator({ className })}
      {...props}
    />
  );
}

export type SidebarItemMetaIconProps = useRender.ComponentProps<"span">;

export function SidebarItemMetaIcon({ className, render, ...props }: SidebarItemMetaIconProps) {
  const theme = useThemeFamily();
  const { sidebarItemMetaIcon } = sidebarItemRecipe({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-meta-icon",
    className: sidebarItemMetaIcon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemAsideProps = useRender.ComponentProps<"span">;

export function SidebarItemAside({ className, render, ...props }: SidebarItemAsideProps) {
  const { sidebarItemAside } = sidebarItemRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-aside",
    className: sidebarItemAside({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemCountProps = BadgeProps;

export function SidebarItemCount({
  appearance = "solid",
  className,
  uppercase = false,
  variant = "primary",
  ...props
}: SidebarItemCountProps) {
  const theme = useThemeFamily();
  const { sidebarItemCount } = sidebarItemRecipe({ theme });
  return (
    <Badge
      data-slot="sidebar-item-count"
      appearance={appearance}
      uppercase={uppercase}
      variant={variant}
      className={sidebarItemCount({ className })}
      {...props}
    />
  );
}

export type SidebarItemCountSeparatorProps = useRender.ComponentProps<"span">;

/** The dot between the channel's own unread count and its thread count. */
export function SidebarItemCountSeparator({
  className,
  render,
  ...props
}: SidebarItemCountSeparatorProps) {
  const { sidebarItemCountSeparator } = sidebarItemRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-count-separator",
    "aria-hidden": true,
    className: sidebarItemCountSeparator({ className }),
    children: "·",
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarItemThreadCountProps = useRender.ComponentProps<"span"> & {
  /**
   * Visually hidden words read after the number, so screen readers hear what
   * the count is (the icon is decorative). Pass localized copy.
   */
  label?: string;
};

/**
 * Thread segment of an unread count: a thread icon followed by the number of
 * threads with new replies. Works inside SidebarItemCount or as quiet text.
 */
export function SidebarItemThreadCount({
  children,
  className,
  label = "threads with new replies",
  render,
  ...props
}: SidebarItemThreadCountProps) {
  const { sidebarItemThreadCount } = sidebarItemRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-item-thread-count",
    className: sidebarItemThreadCount({ className }),
    children: (
      <>
        <ThreadIcon strokeWidth={1.75} />
        {children}
        <span className="sr-only"> {label}</span>
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
