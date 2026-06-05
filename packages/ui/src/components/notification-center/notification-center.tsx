import { Button as BaseButton } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import { EmptyState, type EmptyStateProps } from "../empty-state/empty-state.tsx";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const notificationCenter = tv({
  slots: {
    popup: ["flex flex-col overflow-hidden bg-white"],
    header: ["flex items-center gap-2 border-b-2 border-black bg-brutal-cream px-3 py-2"],
    title: ["text-xs font-bold uppercase tracking-widest"],
    count: ["ml-auto font-mono text-xs text-black/40"],
    scroller: ["min-h-0 flex-1 overflow-y-auto overscroll-contain"],
    list: ["divide-y-2 divide-black"],
    item: ["px-3 py-3"],
    itemInner: ["flex items-start gap-2"],
    itemIcon: [
      "mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-black",
      "[&_svg]:size-4 [&_svg]:text-black",
    ],
    itemContent: ["min-w-0 flex-1"],
    itemTitle: ["break-words text-sm font-bold text-black"],
    itemBody: ["mt-0.5 break-words text-sm"],
    itemActions: ["mt-2 flex flex-wrap items-center gap-2"],
    actionButton: ["px-3 py-1.5 font-display text-xs font-bold transition-all duration-100"],
  },
  variants: {
    theme: {
      brutal: {
        popup: ["border-2 border-black shadow-[var(--shadow-hover)]"],
        title: ["text-black/60"],
        actionButton: [
          "border-2 border-black shadow-[var(--shadow-hover)]",
          "hover:-translate-y-px hover:shadow-[var(--shadow-lg)]",
          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--shadow-active)]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        ],
      },
      elegant: {},
    },
    viewport: {
      desktop: {
        popup: "w-80",
      },
      mobile: {
        popup: "w-[min(92vw,360px)]",
      },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
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
      error: {
        itemIcon: "bg-brutal-orange",
      },
      warning: {
        itemIcon: "bg-brutal-orange",
      },
      info: {
        itemIcon: "bg-brutal-yellow",
      },
      success: {
        itemIcon: "bg-brutal-lime",
      },
    },
    actionVariant: {
      primary: {
        actionButton: "",
      },
      secondary: {
        actionButton: "",
      },
    },
  },
  compoundVariants: [
    { viewport: "desktop", size: "sm", class: { popup: "h-56" } },
    { viewport: "desktop", size: "md", class: { popup: "h-72" } },
    { viewport: "desktop", size: "lg", class: { popup: "h-96" } },
    { viewport: "mobile", size: "sm", class: { popup: "max-h-[min(64dvh,224px)]" } },
    { viewport: "mobile", size: "md", class: { popup: "max-h-[min(72dvh,288px)]" } },
    { viewport: "mobile", size: "lg", class: { popup: "max-h-[min(80dvh,384px)]" } },
    { theme: "brutal", actionVariant: "primary", class: { actionButton: "bg-brutal-pink" } },
    { theme: "brutal", actionVariant: "secondary", class: { actionButton: "bg-white" } },
  ],
  defaultVariants: {
    viewport: "desktop",
    size: "md",
    read: false,
    status: "info",
    actionVariant: "secondary",
  },
});

export type NotificationCenterProps = Dialog.Root.Props;

export function NotificationCenter({ modal = false, ...props }: NotificationCenterProps) {
  return <Dialog.Root modal={modal} {...props} />;
}

export type NotificationCenterTriggerProps = Dialog.Trigger.Props;

export function NotificationCenterTrigger(props: NotificationCenterTriggerProps) {
  return <Dialog.Trigger data-slot="notification-center-trigger" {...props} />;
}

export type NotificationCenterPortalProps = Dialog.Portal.Props;

export function NotificationCenterPortal(props: NotificationCenterPortalProps) {
  return <Dialog.Portal data-slot="notification-center-portal" {...props} />;
}

export type NotificationCenterPopupProps = StyledProps<Dialog.Popup.Props> &
  Pick<VariantProps<typeof notificationCenter>, "size" | "viewport">;

export function NotificationCenterPopup({
  viewport = "desktop",
  size = "md",
  className,
  initialFocus = false,
  "aria-label": ariaLabel = "Notification center",
  ...props
}: NotificationCenterPopupProps) {
  const theme = useTheme();
  const { popup } = notificationCenter({ theme, viewport, size });

  return (
    <Dialog.Popup
      aria-label={ariaLabel}
      data-slot="notification-center-popup"
      data-size={size}
      data-viewport={viewport}
      initialFocus={initialFocus}
      className={popup({ className })}
      {...props}
    />
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
  const theme = useTheme();
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
  "aria-label": ariaLabel = "Notifications",
  ...props
}: NotificationCenterListProps) {
  const { list } = notificationCenter();
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

export type NotificationCenterItemInnerProps = useRender.ComponentProps<"div">;

export function NotificationCenterItemInner({
  render,
  className,
  ...props
}: NotificationCenterItemInnerProps) {
  const { itemInner } = notificationCenter();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: itemInner({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "notification-center-item-inner",
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
  const { itemIcon } = notificationCenter({ status });
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

export type NotificationCenterActionButtonProps = Omit<BaseButton.Props, "className"> & {
  className?: string;
  variant?: VariantProps<typeof notificationCenter>["actionVariant"];
};

export function NotificationCenterActionButton({
  variant = "secondary",
  className,
  ...props
}: NotificationCenterActionButtonProps) {
  const theme = useTheme();
  const { actionButton } = notificationCenter({ theme, actionVariant: variant });

  return <BaseButton type="button" className={actionButton({ className })} {...props} />;
}

export type NotificationCenterEmptyStateProps = EmptyStateProps;

export function NotificationCenterEmptyState(props: NotificationCenterEmptyStateProps) {
  return <EmptyState data-slot="notification-center-empty-state" {...props} />;
}
