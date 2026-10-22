import { Popover as BasePopover } from "@base-ui/react/popover";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";
import { headEdgePull } from "../../lib/head-edges";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { EmptyState } from "../empty-state/empty-state";
import type { EmptyStateProps } from "../empty-state/empty-state";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
import { Status } from "../status/status";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";

const notificationCenter = tv({
  slots: {
    trigger: [
      "relative inline-flex size-10 items-center justify-center overflow-visible p-0",
      "rounded-control border-[1.5px] border-transparent bg-transparent text-foreground-on-frame",
      "select-none outline-none",
      "hover:bg-fill-frame-medium active:bg-fill-frame-medium data-popup-open:bg-fill-frame-medium",
      "focus-visible:shadow-focus",
      "[&_svg]:size-5 [&_svg]:shrink-0",
    ],
    triggerIcon: ["relative inline-flex size-5 items-center justify-center"],
    triggerBell: ["size-5 shrink-0 text-current"],
    triggerDot: ["pointer-events-none absolute top-1.5 right-1.5"],
    popup: [
      "flex flex-col overflow-hidden",
      "rounded-container bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    header: [
      "flex items-center px-4",
      "min-h-13 gap-2 border-b border-line-seam py-0",
      headEdgePull,
    ],
    title: ["font-sans text-headline text-foreground"],
    count: ["ml-auto", "font-mono text-mono-meta text-foreground-hint"],
    scroller: ["min-h-0 flex-1 overflow-y-auto overscroll-contain"],
    list: [],
    item: [
      "group/notification-center-item relative px-4 py-3",
      "before:pointer-events-none before:absolute before:top-0 before:right-0 before:left-4 before:hidden before:border-t before:border-line-hairline",
      "not-first:before:block has-data-[slot=notification-center-item-icon]:before:left-[63px]",
    ],
    itemRow: ["flex items-start", "gap-3"],
    itemIcon: [
      "flex shrink-0 items-center justify-center",
      "mt-0 size-[35px] rounded-sticker bg-fill-muted text-foreground-muted",
      "[&_svg]:size-[18px]",
    ],
    itemContent: ["min-w-0 flex-1"],
    itemTitle: [
      "wrap-break-word",
      "font-sans text-subhead font-bold text-foreground",
      "group-data-read/notification-center-item:font-semibold group-data-read/notification-center-item:text-foreground-muted",
    ],
    itemBody: [
      "mt-0.5 wrap-break-word",
      "line-clamp-2 font-sans text-callout text-foreground-muted",
    ],
    itemActions: ["flex items-center", "mt-2 ml-0 flex-wrap justify-start gap-2"],
    actionButton: [],
  },
  variants: {
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
        item: ["opacity-100"],
      },
      false: {
        item: [
          "pr-[37px]",
          "after:pointer-events-none after:absolute after:top-[calc(--spacing(3)+(var(--text-subhead--line-height)-10px)/2)] after:right-4 after:size-2.5",
          "after:rounded-[2px] after:border-[1.5px] after:border-sticker-ink after:bg-attention-400",
        ],
      },
    },
    status: {
      error: { itemIcon: ["bg-warning-soft text-foreground"] },
      warning: { itemIcon: ["bg-warning-soft text-foreground"] },
      info: { itemIcon: ["bg-info-soft text-foreground"] },
      success: {},
    },
  },
  defaultVariants: {
    viewport: "desktop",
    size: "md",
    read: false,
    status: "info",
  },
});

export type NotificationCenterProps = BasePopover.Root.Props;

export function NotificationCenter({ modal = false, ...props }: NotificationCenterProps) {
  return <BasePopover.Root modal={modal} {...props} />;
}

export type NotificationCenterTriggerProps = StyledProps<BasePopover.Trigger.Props>;

function NotificationCenterTriggerContent() {
  const { triggerIcon, triggerBell, triggerDot } = notificationCenter();

  return (
    <>
      <span aria-hidden className={triggerIcon()}>
        <Bell className={triggerBell()} strokeWidth={2} />
      </span>
      <Status aria-hidden variant="accent" size="md" className={triggerDot()} />
    </>
  );
}

export function NotificationCenterTrigger({
  className,
  children,
  ...props
}: NotificationCenterTriggerProps) {
  const { trigger } = notificationCenter();

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
  align = "center",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking,
  positionMethod = "fixed",
  side = "bottom",
  sideOffset = 4,
  sticky,
  portalProps,
  ...props
}: NotificationCenterPopupProps) {
  const { popup } = notificationCenter({ viewport, size });

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
          aria-label={props["aria-label"] ?? "Notification center"}
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
  const { header } = notificationCenter();
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
  const { title } = notificationCenter();
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
  const { count } = notificationCenter();
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
  ...props
}: NotificationCenterListProps) {
  const { list } = notificationCenter();
  const defaultProps: useRender.ElementProps<"ul"> = {
    "aria-label": "Notifications",
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
  const { item } = notificationCenter({ read });
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
  const { itemRow } = notificationCenter();
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
  ...props
}: NotificationCenterItemIconProps) {
  const { itemIcon } = notificationCenter({ status });
  const defaultProps: useRender.ElementProps<"div"> = {
    role: "img",
    "aria-label": STATUS_LABEL[status],
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
  const { itemTitle } = notificationCenter();
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
  const { itemBody } = notificationCenter();
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
};

export function NotificationCenterActionButton({
  className,
  ...props
}: NotificationCenterActionButtonProps) {
  const { actionButton } = notificationCenter();
  // In-row actions are outline small (32px) buttons and never pink: a list can
  // hold several rows waiting on you at once.

  return (
    <Button
      type="button"
      size="md"
      variant="outline"
      className={actionButton({ className })}
      {...props}
    />
  );
}

export type NotificationCenterEmptyStateProps = EmptyStateProps;

export function NotificationCenterEmptyState(props: NotificationCenterEmptyStateProps) {
  return <EmptyState data-slot="notification-center-empty-state" {...props} />;
}
