import { AlertTriangle } from "lucide-react";
import {
  Button,
  PopoverHeader,
  PopoverPopup,
  PopoverSeparator,
  Status,
  useThemeFamily,
} from "raft-ui";

const notifications = [
  {
    id: "sync",
    title: "Sync needs attention",
    body: "Retry source sync before publishing docs.",
    action: "Retry",
  },
  {
    id: "mention",
    title: "Thread mentioned you",
    body: "Atlas left a note in #design-system.",
    action: "Open",
  },
] as const;

export function PopoverNotificationComposition() {
  const theme = useThemeFamily();
  const triggerVariant = theme === "brutal" ? "warning" : "outline";

  return (
    <div className="flex h-full min-h-72 w-full items-start justify-center pt-8">
      <div className="grid w-80 justify-items-start gap-2">
        <span className="relative inline-flex">
          <Button
            variant={triggerVariant}
            size="icon-md"
            aria-label="Notification center (2 active)"
            className="size-9"
          >
            <AlertTriangle aria-hidden className="size-[18px]" />
          </Button>
          <Status
            aria-hidden
            size="md"
            variant="warning"
            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
          />
        </span>
        <PopoverPopup className="h-72 w-full">
          <PopoverHeader>
            <span className="text-[11px] leading-none font-medium tracking-[-0.005em] text-foreground-strong/45 [[data-theme=brutal]_&]:font-sans [[data-theme=brutal]_&]:text-[10px] [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:tracking-wide [[data-theme=brutal]_&]:text-black/60 [[data-theme=brutal]_&]:uppercase">
              Notifications
            </span>
            <span className="ml-auto font-mono text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/40">
              2 items
            </span>
          </PopoverHeader>
          <PopoverSeparator />
          <ul className="divide-y divide-line-faint [[data-theme=brutal]_&]:divide-y-2 [[data-theme=brutal]_&]:divide-black">
            {notifications.map((notification) => (
              <li key={notification.id} className="px-3 py-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded bg-warning-tint text-warning [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-orange [[data-theme=brutal]_&]:text-black">
                    <AlertTriangle aria-hidden className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="break-words text-sm font-medium text-foreground [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black">
                      {notification.title}
                    </div>
                    <div className="mt-0.5 break-words text-sm text-foreground-muted [[data-theme=brutal]_&]:text-black">
                      {notification.body}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="accent">
                        {notification.action}
                      </Button>
                      <Button size="sm" variant="outline">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </PopoverPopup>
      </div>
    </div>
  );
}
