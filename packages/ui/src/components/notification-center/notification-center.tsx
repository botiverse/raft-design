import { Popover as BasePopover } from "@base-ui/react/popover";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";
import { tv, type VariantProps } from "../../lib/tv";
import { EmptyState, type EmptyStateProps } from "../empty-state/empty-state";
import { Button, type ButtonProps } from "../button/button";
import { Status } from "../status/status";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";

const notificationCenter = tv({
  slots: {
    trigger: [],
    triggerIcon: [],
    triggerBell: [],
    triggerBellGlow: [],
    triggerDot: [],
    popup: ["flex flex-col overflow-hidden bg-layer-panel"],
    header: ["flex items-center gap-2 px-4 py-2"],
    title: ["text-xs"],
    count: ["ml-auto text-xs"],
    scroller: ["min-h-0 flex-1 overflow-y-auto overscroll-contain"],
    list: ["divide-y"],
    item: ["px-4 py-4"],
    itemRow: ["flex items-start"],
    itemIcon: ["mt-0.5 flex size-6 shrink-0 items-center justify-center", "[&_svg]:size-4"],
    itemContent: ["min-w-0 flex-1"],
    itemTitle: ["break-words text-sm text-foreground"],
    itemBody: ["mt-0.5 break-words text-sm"],
    itemActions: ["mt-3 ml-auto flex items-center justify-end gap-2"],
    actionButton: [],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "relative inline-flex size-9 items-center justify-center overflow-visible rounded-none border-2 border-line-strong bg-brutal-orange p-0 text-foreground",
          "select-none shadow-raft-sm transition-all duration-100 hover:bg-brutal-orange hover:shadow-raft-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-strong",
          "[&>svg]:size-4.5 [&>svg]:shrink-0",
        ],
        popup: ["border-2 border-line-strong bg-layer-panel shadow-raft-lg"],
        header: ["border-b-2 border-line-strong bg-brutal-cream"],
        title: ["font-bold uppercase tracking-widest text-foreground-strong/60"],
        count: ["font-mono text-foreground-strong/40"],
        list: ["divide-y-2 divide-line-strong"],
        itemRow: ["gap-2"],
        itemIcon: ["border-2 border-line-strong [&_svg]:text-foreground"],
        itemTitle: ["font-bold"],
        actionButton: [],
      },
      elegant: {
        trigger: [
          "relative inline-flex size-auto min-w-9 items-center justify-center overflow-visible rounded-md border border-transparent p-3",
          "text-[13px] text-foreground-icon [&_svg]:size-4 [&_svg]:shrink-0",
          "select-none transition-colors",
          "hover:bg-fill-strong/80 hover:text-foreground-strong",
          "active:bg-fill-strong/80 active:text-foreground-strong",
          "focus-visible:outline-none focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
        ],
        triggerIcon: ["relative inline-flex size-4 items-center justify-center"],
        triggerBell: ["size-4 shrink-0 text-current"],
        triggerBellGlow: [
          "pointer-events-none absolute inset-0 size-4 shrink-0",
          "text-[oklch(73.4%_0.149_89.2)]",
          "drop-shadow-[0_0_1px_#FFD440D1]",
          "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
        ],
        triggerDot: ["pointer-events-none absolute top-2.5 right-2.5"],
        popup: ["rounded-md bg-layer-popover", "shadow-raft-lg"],
        header: ["border-b border-line-hairline bg-layer-panel pt-2.5"],
        scroller: ["bg-layer-panel"],
        title: ["text-sm font-medium normal-case tracking-normal text-foreground"],
        count: ["font-sans text-[11px] font-medium text-foreground-placeholder"],
        list: ["divide-line-hairline"],
        itemRow: ["gap-2.5"],
        itemIcon: ["rounded-sm border border-transparent"],
        itemTitle: ["font-medium"],
        itemBody: ["text-foreground-muted"],
        actionButton: ["py-0.5"],
      },
    },
    viewport: {
      desktop: {
        popup: "w-[380px]",
      },
      mobile: {
        popup: "w-[min(92vw,360px)]",
      },
    },
    size: {
      sm: {
        popup: "h-56",
      },
      md: {
        popup: "h-72",
      },
      lg: {
        popup: "h-96",
      },
    },
    read: {
      true: {
        item: "opacity-70",
      },
      false: {
        item: "",
      },
    },
    status: {
      error: {},
      warning: {},
      info: {},
      success: {},
    },
    actionVariant: {
      primary: {},
      secondary: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      actionVariant: "primary",
      class: { actionButton: "bg-brutal-pink hover:bg-brutal-pink" },
    },
    { theme: "brutal", status: "error", class: { itemIcon: "bg-brutal-orange" } },
    { theme: "brutal", status: "warning", class: { itemIcon: "bg-brutal-orange" } },
    { theme: "brutal", status: "info", class: { itemIcon: "bg-brutal-yellow" } },
    { theme: "brutal", status: "success", class: { itemIcon: "bg-brutal-lime" } },
    {
      theme: "elegant",
      status: "error",
      class: { itemIcon: "bg-danger/80 text-danger-strong" },
    },
    {
      theme: "elegant",
      status: "warning",
      class: { itemIcon: "bg-warning/80 text-warning-strong" },
    },
    {
      theme: "elegant",
      status: "info",
      class: { itemIcon: "bg-info/80 text-info-strong" },
    },
    {
      theme: "elegant",
      status: "success",
      class: { itemIcon: "bg-success/80 text-success-strong" },
    },
  ],
  defaultVariants: {
    viewport: "desktop",
    size: "md",
    read: false,
    status: "info",
    actionVariant: "secondary",
  },
});

export type NotificationCenterProps = BasePopover.Root.Props;

export function NotificationCenter({ modal = false, ...props }: NotificationCenterProps) {
  return <BasePopover.Root modal={modal} {...props} />;
}

export type NotificationCenterTriggerProps = StyledProps<BasePopover.Trigger.Props>;

function NotificationCenterTriggerContent() {
  const theme = useThemeFamily();
  const { triggerIcon, triggerBell, triggerBellGlow, triggerDot } = notificationCenter({ theme });

  if (theme === "brutal") {
    return (
      <>
        <AlertTriangle aria-hidden className="size-4.5" />
        <Status
          aria-hidden
          variant="warning"
          size="md"
          className="pointer-events-none absolute -top-1 -right-1 [--status-color:var(--color-brutal-orange)]"
        />
      </>
    );
  }

  return (
    <>
      <span aria-hidden className={triggerIcon()}>
        <Bell className={triggerBell()} strokeWidth={2} />
        <Bell className={triggerBellGlow()} strokeWidth={2} />
      </span>
      <Status aria-hidden variant="primary" size="sm" attention className={triggerDot()} />
    </>
  );
}

export function NotificationCenterTrigger({
  className,
  children,
  ...props
}: NotificationCenterTriggerProps) {
  const theme = useThemeFamily();
  const { trigger } = notificationCenter({ theme });

  return (
    <BasePopover.Trigger
      data-slot="notification-center-trigger"
      className={trigger({ className })}
      {...props}
    >
      {children ?? <NotificationCenterTriggerContent />}
    </BasePopover.Trigger>
  );
}

export type NotificationCenterPortalProps = BasePopover.Portal.Props;

function NotificationCenterPortal(props: NotificationCenterPortalProps) {
  return <BasePopover.Portal {...useThemeScopeProps(props)} />;
}

export type NotificationCenterPopupProps = StyledProps<BasePopover.Popup.Props> &
  Pick<VariantProps<typeof notificationCenter>, "size" | "viewport"> &
  Pick<
    BasePopover.Positioner.Props,
    | "align"
    | "alignOffset"
    | "anchor"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionBoundary"
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  > & {
    portalProps?: NotificationCenterPortalProps;
  };

export function NotificationCenterPopup({
  viewport = "desktop",
  size = "md",
  className,
  initialFocus = false,
  "aria-label": ariaLabel = "Notification center",
  align = "center",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking = true,
  positionMethod = "fixed",
  side = "bottom",
  sideOffset = 4,
  sticky,
  portalProps,
  ...props
}: NotificationCenterPopupProps) {
  const theme = useThemeFamily();
  const { popup } = notificationCenter({ theme, viewport, size });

  return (
    <NotificationCenterPortal {...portalProps}>
      <BasePopover.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        arrowPadding={arrowPadding}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
        className="isolate z-50 outline-none"
      >
        <BasePopover.Popup
          aria-label={ariaLabel}
          data-slot="notification-center-popup"
          data-size={size}
          data-viewport={viewport}
          initialFocus={initialFocus}
          className={popup({ className })}
          {...props}
        />
      </BasePopover.Positioner>
    </NotificationCenterPortal>
  );
}

export type NotificationCenterHeaderProps = useRender.ComponentProps<"div">;

export function NotificationCenterHeader({
  render,
  className,
  ...props
}: NotificationCenterHeaderProps) {
  const theme = useThemeFamily();
  const { header } = notificationCenter({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-header",
    },
  });
}

export type NotificationCenterTitleProps = useRender.ComponentProps<"span">;

export function NotificationCenterTitle({
  render,
  className,
  ...props
}: NotificationCenterTitleProps) {
  const theme = useThemeFamily();
  const { title } = notificationCenter({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "notification-center-title",
    },
  });
}

export type NotificationCenterCountProps = useRender.ComponentProps<"span">;

export function NotificationCenterCount({
  render,
  className,
  ...props
}: NotificationCenterCountProps) {
  const theme = useThemeFamily();
  const { count } = notificationCenter({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: count({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "notification-center-count",
    },
  });
}

export type NotificationCenterScrollerProps = useRender.ComponentProps<"div">;

export function NotificationCenterScroller({
  render,
  className,
  ...props
}: NotificationCenterScrollerProps) {
  const { scroller } = notificationCenter();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: scroller({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-scroller",
    },
  });
}

export type NotificationCenterListProps = useRender.ComponentProps<"ul">;

export function NotificationCenterList({
  render,
  className,
  "aria-label": ariaLabel = "Notifications",
  ...props
}: NotificationCenterListProps) {
  const theme = useThemeFamily();
  const { list } = notificationCenter({ theme });
  const defaultProps: useRender.ElementProps<"ul"> = {
    "aria-label": ariaLabel,
    className: list({ className }),
  };

  return useRender({
    defaultTagName: "ul",
    render,
    props: mergeProps<"ul">(defaultProps, props),
    state: {
      slot: "notification-center-list",
    },
  });
}

export type NotificationCenterItemProps = useRender.ComponentProps<"li"> &
  Pick<VariantProps<typeof notificationCenter>, "read">;

export function NotificationCenterItem({
  read = false,
  render,
  className,
  ...props
}: NotificationCenterItemProps) {
  const theme = useThemeFamily();
  const { item } = notificationCenter({ theme, read });
  const defaultProps: useRender.ElementProps<"li"> = {
    className: item({ className }),
  };

  return useRender({
    defaultTagName: "li",
    render,
    props: mergeProps<"li">(defaultProps, props),
    state: {
      slot: "notification-center-item",
      read,
    },
  });
}

export type NotificationCenterItemRowProps = useRender.ComponentProps<"div">;

export function NotificationCenterItemRow({
  render,
  className,
  ...props
}: NotificationCenterItemRowProps) {
  const theme = useThemeFamily();
  const { itemRow } = notificationCenter({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: itemRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-item-row",
    },
  });
}

export type NotificationCenterItemIconProps = useRender.ComponentProps<"div"> &
  Pick<VariantProps<typeof notificationCenter>, "status">;

const STATUS_LABEL = {
  error: "Error",
  warning: "Warning",
  info: "Info",
  success: "Success",
} as const satisfies Record<NonNullable<NotificationCenterItemIconProps["status"]>, string>;

const DEFAULT_STATUS_ICON = {
  error: <AlertTriangle />,
  warning: <AlertTriangle />,
  info: <Info />,
  success: <CheckCircle2 />,
} as const satisfies Record<
  NonNullable<NotificationCenterItemIconProps["status"]>,
  useRender.ComponentProps<"div">["children"]
>;

export function NotificationCenterItemIcon({
  status = "info",
  render,
  className,
  children,
  "aria-label": ariaLabel = STATUS_LABEL[status],
  ...props
}: NotificationCenterItemIconProps) {
  const theme = useThemeFamily();
  const { itemIcon } = notificationCenter({ theme, status });
  const defaultProps: useRender.ElementProps<"div"> = {
    "aria-label": ariaLabel,
    className: itemIcon({ className }),
    children: children ?? DEFAULT_STATUS_ICON[status],
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-item-icon",
      status,
    },
  });
}

export type NotificationCenterItemContentProps = useRender.ComponentProps<"div">;

export function NotificationCenterItemContent({
  render,
  className,
  ...props
}: NotificationCenterItemContentProps) {
  const { itemContent } = notificationCenter();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: itemContent({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-item-content",
    },
  });
}

export type NotificationCenterItemTitleProps = useRender.ComponentProps<"div">;

export function NotificationCenterItemTitle({
  render,
  className,
  ...props
}: NotificationCenterItemTitleProps) {
  const theme = useThemeFamily();
  const { itemTitle } = notificationCenter({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: itemTitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-item-title",
    },
  });
}

export type NotificationCenterItemBodyProps = useRender.ComponentProps<"div">;

export function NotificationCenterItemBody({
  render,
  className,
  ...props
}: NotificationCenterItemBodyProps) {
  const theme = useThemeFamily();
  const { itemBody } = notificationCenter({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: itemBody({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-item-body",
    },
  });
}

export type NotificationCenterItemActionsProps = useRender.ComponentProps<"div">;

export function NotificationCenterItemActions({
  render,
  className,
  ...props
}: NotificationCenterItemActionsProps) {
  const { itemActions } = notificationCenter();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: itemActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-item-actions",
    },
  });
}

export type NotificationCenterActionButtonProps = Omit<
  ButtonProps,
  "className" | "size" | "variant"
> & {
  className?: string;
  variant?: VariantProps<typeof notificationCenter>["actionVariant"];
};

export function NotificationCenterActionButton({
  variant = "secondary",
  className,
  ...props
}: NotificationCenterActionButtonProps) {
  const theme = useThemeFamily();
  const { actionButton } = notificationCenter({ theme, actionVariant: variant });
  const buttonVariant = variant === "primary" ? "primary" : "outline";

  return (
    <Button
      type="button"
      size="xs"
      variant={buttonVariant}
      className={actionButton({ className })}
      {...props}
    />
  );
}

export type NotificationCenterEmptyStateProps = EmptyStateProps;

export function NotificationCenterEmptyState(props: NotificationCenterEmptyStateProps) {
  return <EmptyState data-slot="notification-center-empty-state" {...props} />;
}
