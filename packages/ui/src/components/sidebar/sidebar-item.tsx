import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Badge } from "../badge";
import type { BadgeProps } from "../badge";
import type { SlotElementProps } from "../../lib/data-attributes";
import { sidebarItemRecipe } from "./sidebar-item.recipe";
import { ThreadIcon } from "../icons";

export type SidebarItemTone = "default" | "unread" | "muted" | "away";

export type SidebarItemRootProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
  /** `false` renders a display-only `div`: no button, no type, nothing to
   *  press. Its own controls (an action button) stay the targets. */
  interactive?: boolean;
};

export function SidebarItemRoot({
  active = false,
  interactive = true,
  className,
  render,
  ...props
}: SidebarItemRootProps) {
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "sidebar-item",
    "data-active": active ? "true" : undefined,
    "data-interactive": interactive ? undefined : "false",
    className,
    ...(interactive ? { type: "button" } : {}),
  };

  return useRender({
    render: render ?? (interactive ? <BaseButton /> : <div />),
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SidebarItemProps = SidebarItemRootProps & {
  /** Let the name run onto more lines: the row grows from its fixed height
   * and its content aligns to the first line. */
  wrap?: boolean;
  /** Something waits for you (a 700 name), the place is muted (an ink-2
   *  name), or it is away: offline or not joined (an ink-3 name). */
  tone?: SidebarItemTone;
};

export function SidebarItem({
  className,
  wrap = false,
  tone = "default",
  interactive = true,
  ...props
}: SidebarItemProps) {
  const { sidebarItem } = sidebarItemRecipe({ wrap, interactive });
  return (
    <SidebarItemRoot
      data-wrap={wrap ? "true" : undefined}
      data-tone={tone === "default" ? undefined : tone}
      interactive={interactive}
      className={sidebarItem({ className })}
      {...props}
    />
  );
}

export type SidebarItemIconProps = useRender.ComponentProps<"span">;

export function SidebarItemIcon({ className, render, ...props }: SidebarItemIconProps) {
  const { sidebarItemIcon } = sidebarItemRecipe();
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
  const { sidebarItemChannelIcon } = sidebarItemRecipe();
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
  const { sidebarItemTitle } = sidebarItemRecipe();
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
  const { sidebarItemSubtitle } = sidebarItemRecipe();
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
  const { sidebarItemMeta } = sidebarItemRecipe();
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
  const { sidebarItemStatus } = sidebarItemRecipe();
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

/** The yellow @ sticker: someone mentioned you here. */
export type SidebarItemIndicatorProps = Omit<BadgeProps, "appearance" | "variant">;

export function SidebarItemIndicator({ className, ...props }: SidebarItemIndicatorProps) {
  const { sidebarItemIndicator } = sidebarItemRecipe();
  return (
    <Badge
      data-slot="sidebar-item-indicator"
      className={sidebarItemIndicator({ className })}
      {...props}
    />
  );
}

export type SidebarItemMetaIconProps = useRender.ComponentProps<"span">;

export function SidebarItemMetaIcon({ className, render, ...props }: SidebarItemMetaIconProps) {
  const { sidebarItemMetaIcon } = sidebarItemRecipe();
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

/** The pink unread count: messages waiting for you. */
export type SidebarItemCountProps = Omit<BadgeProps, "appearance" | "variant">;

export function SidebarItemCount({ className, ...props }: SidebarItemCountProps) {
  const { sidebarItemCount } = sidebarItemRecipe();
  return (
    <Badge data-slot="sidebar-item-count" className={sidebarItemCount({ className })} {...props} />
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
