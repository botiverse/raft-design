import LegacyNotificationCenter, {
  type NotificationCenterEntry as LegacyNotificationCenterEntry,
} from "../../../../packages/ui/src/legacy/NotificationCenter.tsx";
import { AlertTriangle } from "lucide-react";

import { NotificationTriggerPopoverComposition } from "./notification-trigger-popover-composition.tsx";

export const NOTIFICATION_TRIGGER_POPOVER_COMPOSITION_PATH =
  "apps/doc/src/compositions/notification-trigger-popover-composition.tsx" as const;

export { NotificationTriggerPopoverComposition };

const notifications: LegacyNotificationCenterEntry[] = [
  {
    id: "runtime-stalled",
    kind: "warning",
    title: "Runtime stalled",
    body: "Atlas has not reported activity for 15 minutes.",
    actions: [
      { id: "view", label: "View", variant: "primary" },
      { id: "dismiss", label: "Dismiss" },
    ],
  },
  {
    id: "storage-full",
    kind: "error",
    title: "Storage almost full",
    body: "92% of the workspace quota is used.",
    actions: [{ id: "manage", label: "Manage" }],
  },
  {
    id: "deploy-complete",
    kind: "success",
    title: "Deploy completed",
    body: "slock-ui shipped to production.",
  },
];

/** Legacy NotificationTrigger for source-comparison source pane. */
export function NotificationTriggerSourcePreview({ className }: { className?: string }) {
  return (
    <div
      className={["flex h-full min-h-96 w-full items-start justify-center pt-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded="true"
          aria-label="Notification center (3 active)"
          className="relative inline-flex size-9 items-center justify-center border-2 border-black bg-brutal-orange shadow-brutal-sm"
        >
          <AlertTriangle aria-hidden size={18} className="text-black" />
          <span
            className="absolute -top-1 -right-1 size-2.5 rounded-full border border-black bg-brutal-orange"
            aria-hidden
          />
        </button>
        <LegacyNotificationCenter
          entries={notifications}
          viewport="desktop"
          size="regular"
          closeOnEscape={false}
          className="mt-2"
        />
      </div>
    </div>
  );
}
