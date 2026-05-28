import { forwardRef, type CSSProperties } from "react";
import NotificationCenterPrimitive, {
  type NotificationCenterAction as PrimitiveNotificationAction,
  type NotificationCenterEntry as PrimitiveNotificationEntry,
} from "../ui/NotificationCenter";
import type {
  NotificationAction,
  NotificationEntry,
} from "./useSystemNotifications";
import { useDismissedNotificationStore } from "./dismissedNotificationStore";

// Slock system-notification adapter.
//
// The reusable UI primitive lives in `components/ui/NotificationCenter`.
// This file only maps Slock's system notification aggregation model
// (`NotificationEntry`, dismissal fingerprints, and row actions) into that
// primitive so the component-library API stays product-agnostic.

export interface NotificationCenterProps {
  notifications: NotificationEntry[];
  /** Layout flavor. desktop floats to the right of the rail; mobile floats
   *  beneath the navbar centered on the screen. */
  flavor: "desktop" | "mobile";
  onClose: () => void;
  /** Caller-supplied positioning. Spread onto the outer card so the
   *  viewport-clamping helper can set position/top/left/maxHeight without
   *  this component having to know about layout. */
  style?: CSSProperties;
}

const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(
  function NotificationCenter(
    { notifications, flavor, onClose, style },
    ref,
  ) {
    const dismiss = useDismissedNotificationStore((s) => s.dismiss);
    const entries = notifications.map((entry) => toPrimitiveEntry(entry, dismiss));

    return (
      <NotificationCenterPrimitive
        ref={ref}
        data-testid="notification-center"
        entries={entries}
        viewport={flavor}
        size="regular"
        onClose={onClose}
        style={style}
        onMouseDown={(e) => e.stopPropagation()}
      />
    );
  },
);

export default NotificationCenter;

function toPrimitiveEntry(
  entry: NotificationEntry,
  dismiss: (key: string) => void,
): PrimitiveNotificationEntry {
  return {
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    body: entry.body,
    icon: entry.icon,
    actions: notificationActions(entry, dismiss),
  };
}

function notificationActions(
  entry: NotificationEntry,
  dismiss: (key: string) => void,
): PrimitiveNotificationAction[] {
  const actions: PrimitiveNotificationAction[] = [];
  if (entry.action) actions.push(toPrimitiveAction(entry.action, "primary"));
  if (entry.secondaryAction) {
    actions.push(toPrimitiveAction(entry.secondaryAction, "secondary"));
  }
  if (entry.dismissalKey) {
    // Dismiss is rendered as a labeled button in line with the primary action,
    // not a tiny corner X, per stdrc 2026-05-02 #proj-uiux:f87f6eb9
    // msg=fc60d1c2 ("Dismiss should sit with View").
    actions.push({
      id: "dismiss",
      label: "Dismiss",
      onClick: () => entry.dismissalKey && dismiss(entry.dismissalKey),
      variant: "secondary",
    });
  }
  return actions;
}

function toPrimitiveAction(
  action: NotificationAction,
  variant: PrimitiveNotificationAction["variant"],
): PrimitiveNotificationAction {
  return {
    id: action.label,
    label: action.label,
    onClick: action.onClick,
    disabled: action.disabled,
    variant,
  };
}
