import {
  Button,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
  type PopoverContentProps,
} from "@slock/ui";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

// @docs-source-strip-start
import { useId, useRef, type RefObject } from "react";
import { cn } from "tailwind-variants";
// @docs-source-strip-end

export function NotificationTriggerPopoverContent(props: PopoverContentProps) {
  return (
    <PopoverContent className="flex h-72 w-80 flex-col max-h-none" {...props}>
      <NotificationHeader count={5} />
      <PopoverSeparator className="[[data-theme=brutal]_&]:hidden [[data-theme=elegant]_&]:hidden" />
      <NotificationList>
        <NotificationItem icon={<NotificationIcon status="warning" />} title="Runtime stalled">
          <NotificationBody>Atlas has not reported activity for 15 minutes.</NotificationBody>
          <NotificationActions>
            <Button
              size="xs"
              variant="primary"
              className={cn(
                "[[data-theme=brutal]_&]:bg-brutal-pink [[data-theme=brutal]_&]:hover:bg-brutal-pink",
                "[[data-theme=elegant]_&]:py-0.5",
              )}
            >
              View
            </Button>
            <Button size="xs" variant="outline" className="[[data-theme=elegant]_&]:py-0.5">
              Dismiss
            </Button>
          </NotificationActions>
        </NotificationItem>
        <NotificationItem icon={<NotificationIcon status="warning" />} title="Storage almost full">
          <NotificationBody>92% of the workspace quota is used.</NotificationBody>
          <NotificationActions>
            <Button size="xs" variant="outline" className="[[data-theme=elegant]_&]:py-0.5">
              Manage
            </Button>
          </NotificationActions>
        </NotificationItem>
        <NotificationItem icon={<NotificationIcon status="success" />} title="Deploy completed">
          <NotificationBody>slock-ui shipped to production.</NotificationBody>
        </NotificationItem>
        <NotificationItem read icon={<NotificationIcon status="success" />} title="Backup finished">
          <NotificationBody>Nightly snapshot stored to cold storage.</NotificationBody>
        </NotificationItem>
        <NotificationItem read icon={<NotificationIcon status="warning" />} title="Token expiring">
          <NotificationBody>API key rotates in 3 days.</NotificationBody>
        </NotificationItem>
      </NotificationList>
    </PopoverContent>
  );
}

function NotificationHeader({ count }: { count: number }) {
  return (
    <PopoverHeader
      className={cn(
        "gap-2",
        "[[data-theme=brutal]_&]:border-b-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-[oklch(0.991_0.01_87.41)]",
        "[[data-theme=brutal]_&]:px-3 [[data-theme=brutal]_&]:py-2",
        "[[data-theme=elegant]_&]:pt-2.5",
      )}
    >
      <PopoverTitle
        className={cn(
          "[[data-theme=brutal]_&]:font-semibold [[data-theme=brutal]_&]:uppercase",
          "[[data-theme=elegant]_&]:text-xs [[data-theme=elegant]_&]:font-normal [[data-theme=elegant]_&]:normal-case [[data-theme=elegant]_&]:tracking-normal [[data-theme=elegant]_&]:text-foreground-muted",
        )}
      >
        Notifications
      </PopoverTitle>
      <span
        className={cn(
          "ml-auto",
          "[[data-theme=brutal]_&]:font-mono [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-normal [[data-theme=brutal]_&]:text-black/40",
          "[[data-theme=elegant]_&]:font-sans [[data-theme=elegant]_&]:text-[11px] [[data-theme=elegant]_&]:font-medium [[data-theme=elegant]_&]:text-foreground-placeholder",
        )}
      >
        {count} items
      </span>
    </PopoverHeader>
  );
}

function NotificationList({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 divide-y divide-line-muted overflow-y-auto overscroll-contain [[data-theme=brutal]_&]:divide-y-2 [[data-theme=brutal]_&]:divide-black">
      {children}
    </div>
  );
}

function NotificationItem({
  icon,
  title,
  read = false,
  children,
}: {
  icon: ReactNode;
  title: ReactNode;
  read?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start px-3 py-3 text-sm leading-5 text-foreground-strong",
        "[[data-theme=brutal]_&]:gap-2 [[data-theme=brutal]_&]:text-black",
        "[[data-theme=elegant]_&]:gap-2.5",
        read && "opacity-70",
      )}
    >
      {icon}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="font-medium [[data-theme=brutal]_&]:font-bold">{title}</div>
        {children}
      </div>
    </div>
  );
}

function NotificationBody({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm leading-5 [[data-theme=brutal]_&]:text-black [[data-theme=elegant]_&]:text-foreground-muted">
      {children}
    </div>
  );
}

function NotificationActions({ children }: { children: ReactNode }) {
  return <div className="mt-2 ml-auto flex items-center justify-end gap-2">{children}</div>;
}

const notificationIcon = tv({
  base: [
    "mt-0.5 flex size-6 shrink-0 items-center justify-center",
    "[[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black",
    "[[data-theme=elegant]_&]:rounded-sm [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:border-transparent",
  ],
  variants: {
    status: {
      warning: [
        "[[data-theme=brutal]_&]:bg-brutal-orange/80 [[data-theme=brutal]_&]:text-black",
        "[[data-theme=elegant]_&]:bg-warning-base/80 [[data-theme=elegant]_&]:text-warning-dark",
      ],
      success: [
        "[[data-theme=brutal]_&]:bg-brutal-lime/80 [[data-theme=brutal]_&]:text-black",
        "[[data-theme=elegant]_&]:bg-success-base/80 [[data-theme=elegant]_&]:text-success-dark",
      ],
    },
  },
});

function NotificationIcon({ status }: { status: "warning" | "success" }) {
  return (
    <span className={notificationIcon({ status })}>
      {status === "success" ? (
        <CheckCircle2 aria-hidden size={16} />
      ) : (
        <AlertTriangle aria-hidden size={16} />
      )}
    </span>
  );
}

// @docs-source-strip-start
export function NotificationTriggerPopoverComposition({ className }: { className?: string }) {
  const triggerId = useId();
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={portalRef}
      className={cn(
        "relative flex h-full min-h-96 w-full items-start justify-center pt-8",
        className,
      )}
    >
      <Popover open modal={false} triggerId={triggerId}>
        <div className="relative size-9">
          <PopoverTrigger
            id={triggerId}
            render={
              <Button
                variant="outline"
                size="icon-md"
                className="size-9 overflow-visible p-0 [[data-theme=brutal]_&]:bg-brutal-orange [[data-theme=brutal]_&]:text-black [[data-theme=brutal]_&]:hover:bg-brutal-orange"
              />
            }
          >
            <AlertTriangle aria-hidden size={18} />
          </PopoverTrigger>
          <span
            aria-hidden
            data-slot="notification-trigger-badge"
            className={cn(
              "pointer-events-none absolute -top-1 -right-1 size-2.5 rounded-full border",
              "[[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-orange",
              "[[data-theme=elegant]_&]:border-line-strong [[data-theme=elegant]_&]:bg-warning-base",
            )}
          />
        </div>
        <NotificationTriggerPopoverContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          side="bottom"
          align="center"
          collisionAvoidance={{ side: "none", align: "none" }}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
        />
      </Popover>
    </div>
  );
}
// @docs-source-strip-end
