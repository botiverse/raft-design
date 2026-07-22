import { AlertTriangle } from "lucide-react";
import { cn } from "raft-ui/cn";
import LegacyNotificationCenter, {
  type NotificationCenterEntry as LegacyNotificationCenterEntry,
} from "../../../../../packages/ui/src/legacy/NotificationCenter.tsx";

import { NotificationCenterComposition } from "./notification-center.composition.tsx";

export const NOTIFICATION_CENTER_COMPOSITION_PATH =
  "apps/doc/src/modules/notification-center/notification-center.composition.tsx" as const;

export { NotificationCenterComposition };

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
    kind: "warning",
    title: "Storage almost full",
    body: "92% of the workspace quota is used.",
    actions: [{ id: "manage", label: "Manage" }],
  },
  {
    id: "deploy-complete",
    kind: "success",
    title: "Deploy completed",
    body: "raft-ui shipped to production.",
  },
  {
    id: "backup-finished",
    kind: "success",
    title: "Backup finished",
    body: "Nightly snapshot stored to cold storage.",
    read: true,
  },
  {
    id: "token-expiring",
    kind: "warning",
    title: "Token expiring",
    body: "API key rotates in 3 days.",
    read: true,
  },
];

export function NotificationCenterSourcePreview({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full min-h-96 w-full items-start justify-center pt-8", className)}>
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded="true"
          aria-label="Notification center (3 active)"
          className="relative inline-flex size-9 items-center justify-center border-2 border-black bg-brutal-orange shadow-sm"
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
