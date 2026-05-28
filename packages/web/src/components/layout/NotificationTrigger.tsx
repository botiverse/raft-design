import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import {
  topNotificationKind,
  useVisibleNotifications,
  type NotificationEntry,
  type NotificationKind,
} from "./useSystemNotifications";
import { useViewportClamp } from "./useViewportClamp";

// Trigger affordance for the notification center popup. Renders as a small icon
// button with a kind-coloured indicator dot when notifications are present;
// hides itself entirely when there are no notifications (the empty state still
// renders inside the popup but we never auto-open it).
//
// `flavor` controls placement of the popup:
//   - "rail-bottom": desktop LeftRail above Settings — popup floats to the
//     right at the same vertical level as the trigger.
//   - "mobile-navbar": mobile Chat-tab navbar right side — popup drops down
//     below the navbar, scoped to the visible viewport width.

const KIND_BUTTON_BG: Record<NotificationKind, string> = {
  error: "bg-brutal-orange",
  warning: "bg-brutal-orange",
  info: "bg-white",
};

const KIND_DOT_BG: Record<NotificationKind, string> = {
  error: "bg-brutal-orange",
  warning: "bg-brutal-orange",
  info: "bg-brutal-yellow",
};

export interface NotificationTriggerProps {
  flavor: "rail-bottom" | "mobile-navbar";
  /** Optional list override for tests. Defaults to live `useSystemNotifications()`. */
  notifications?: NotificationEntry[];
}

export default function NotificationTrigger({
  flavor,
  notifications: notificationsProp,
}: NotificationTriggerProps) {
  const liveNotifications = useVisibleNotifications();
  const notifications = notificationsProp ?? liveNotifications;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Position the popover inside the viewport. Desktop rail flavor places it
  // to the right of the trigger and flips upward when the trigger is near
  // the bottom of the screen. Mobile navbar flavor drops it below the
  // trigger, right-anchored, with both edges clamped into the viewport.
  // Originating direction: stdrc 2026-05-02 #proj-uiux:f87f6eb9 msg=78ade5ab
  // ("点了之后，内容会溢出屏幕，感觉你得有一个好的机制让所有 popup 出来的菜单、
  //   通知框，保证在屏幕范围内").
  const { style: popoverStyle } = useViewportClamp({
    triggerRef,
    popoverRef,
    placement: flavor === "rail-bottom" ? "right" : "below",
    open,
    gutter: 8,
  });

  // Close on outside click. The popup itself stops propagation on its own
  // mousedown so child clicks don't accidentally close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Per stdrc 2026-05-02 #proj-uiux:f87f6eb9 msg=d42007fe — when the user
  // dismisses the last notification, the popup should disappear, not linger on
  // an empty "all clear" state. Same applies if a state change drains
  // notifications while the user has the popup open.
  useEffect(() => {
    if (open && notifications.length === 0) {
      setOpen(false);
    }
  }, [open, notifications.length]);

  const top = topNotificationKind(notifications);

  // No trigger when there is nothing to surface AND popup is closed. (We
  // mount the popup body when open so the user can see "all clear" briefly
  // after acting on the last notification.)
  if (notifications.length === 0 && !open) return null;

  if (flavor === "mobile-navbar") {
    return (
      <div className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={
            notifications.length === 0
              ? "Notification center"
              : `Notification center (${notifications.length} active)`
          }
          data-testid="notification-trigger-mobile"
          className={`relative inline-flex size-8 items-center justify-center border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all duration-100 ${
            top ? KIND_BUTTON_BG[top] : "bg-white"
          }`}
        >
          <AlertTriangle size={16} className="text-black" />
          {notifications.length > 0 && top && (
            <span
              className={`absolute -right-1 -top-1 size-2.5 rounded-full border border-black ${KIND_DOT_BG[top]}`}
              aria-hidden
            />
          )}
        </button>
        {open && (
          <NotificationCenter
            ref={popoverRef}
            notifications={notifications}
            onClose={() => setOpen(false)}
            flavor="mobile"
            style={{ ...popoverStyle, zIndex: 50 }}
          />
        )}
      </div>
    );
  }

  // Desktop LeftRail flavor.
  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          notifications.length === 0
            ? "Notification center"
            : `Notification center (${notifications.length} active)`
        }
        data-testid="notification-trigger-rail"
        className={`relative inline-flex size-9 items-center justify-center border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all duration-100 ${
          top ? KIND_BUTTON_BG[top] : "bg-white"
        }`}
      >
        <AlertTriangle size={18} className="text-black" />
        {notifications.length > 0 && top && (
          <span
            className={`absolute -right-1 -top-1 size-2.5 rounded-full border border-black ${KIND_DOT_BG[top]}`}
            aria-hidden
          />
        )}
      </button>
      {open && (
        <NotificationCenter
          ref={popoverRef}
          notifications={notifications}
          onClose={() => setOpen(false)}
          flavor="desktop"
          style={{ ...popoverStyle, zIndex: 50 }}
        />
      )}
    </div>
  );
}
