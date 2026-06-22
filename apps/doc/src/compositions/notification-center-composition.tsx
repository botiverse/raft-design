import {
  Button,
  NotificationCenter,
  NotificationCenterActionButton,
  NotificationCenterCount,
  NotificationCenterHeader,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemBody,
  NotificationCenterItemContent,
  NotificationCenterItemIcon,
  NotificationCenterItemRow,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterPopup,
  NotificationCenterScroller,
  NotificationCenterTitle,
  NotificationCenterTrigger,
  Status,
  type NotificationCenterPopupProps,
} from "@raft/ui";
import { AlertTriangle, CircleGauge } from "lucide-react";
import { useId, useRef, type RefObject } from "react";
import { cn } from "@raft/ui/cn";

export function NotificationCenterContent({
  viewport = "desktop",
  size = "md",
  ...props
}: NotificationCenterPopupProps) {
  return (
    <NotificationCenterPopup viewport={viewport} size={size} {...props}>
      <NotificationCenterHeader>
        <NotificationCenterTitle>Notifications</NotificationCenterTitle>
        <NotificationCenterCount>5 items</NotificationCenterCount>
      </NotificationCenterHeader>
      <NotificationCenterScroller>
        <NotificationCenterList>
          <NotificationCenterItem>
            <NotificationCenterItemRow>
              <NotificationCenterItemIcon status="warning">
                <CircleGauge />
              </NotificationCenterItemIcon>
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Runtime stalled</NotificationCenterItemTitle>
                <NotificationCenterItemBody>
                  Atlas has not reported activity for 15 minutes.
                </NotificationCenterItemBody>
                <NotificationCenterItemActions>
                  <NotificationCenterActionButton variant="primary">
                    View
                  </NotificationCenterActionButton>
                  <NotificationCenterActionButton>Dismiss</NotificationCenterActionButton>
                </NotificationCenterItemActions>
              </NotificationCenterItemContent>
            </NotificationCenterItemRow>
          </NotificationCenterItem>
          <NotificationCenterItem>
            <NotificationCenterItemRow>
              <NotificationCenterItemIcon status="warning" />
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Storage almost full</NotificationCenterItemTitle>
                <NotificationCenterItemBody>
                  92% of the workspace quota is used.
                </NotificationCenterItemBody>
                <NotificationCenterItemActions>
                  <NotificationCenterActionButton>Manage</NotificationCenterActionButton>
                </NotificationCenterItemActions>
              </NotificationCenterItemContent>
            </NotificationCenterItemRow>
          </NotificationCenterItem>
          <NotificationCenterItem>
            <NotificationCenterItemRow>
              <NotificationCenterItemIcon status="success" />
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Deploy completed</NotificationCenterItemTitle>
                <NotificationCenterItemBody>
                  raft-ui shipped to production.
                </NotificationCenterItemBody>
              </NotificationCenterItemContent>
            </NotificationCenterItemRow>
          </NotificationCenterItem>
          <NotificationCenterItem read>
            <NotificationCenterItemRow>
              <NotificationCenterItemIcon status="success" />
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Backup finished</NotificationCenterItemTitle>
                <NotificationCenterItemBody>
                  Nightly snapshot stored to cold storage.
                </NotificationCenterItemBody>
              </NotificationCenterItemContent>
            </NotificationCenterItemRow>
          </NotificationCenterItem>
          <NotificationCenterItem read>
            <NotificationCenterItemRow>
              <NotificationCenterItemIcon status="warning" />
              <NotificationCenterItemContent>
                <NotificationCenterItemTitle>Token expiring</NotificationCenterItemTitle>
                <NotificationCenterItemBody>API key rotates in 3 days.</NotificationCenterItemBody>
              </NotificationCenterItemContent>
            </NotificationCenterItemRow>
          </NotificationCenterItem>
        </NotificationCenterList>
      </NotificationCenterScroller>
    </NotificationCenterPopup>
  );
}

export function NotificationCenterComposition({ className }: { className?: string }) {
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
      <NotificationCenter open modal={false} triggerId={triggerId}>
        <div className="relative size-9">
          <NotificationCenterTrigger
            id={triggerId}
            render={
              <Button
                variant="outline"
                size="icon-md"
                className={cn(
                  "size-9 overflow-visible p-0",
                  "[[data-theme=brutal]_&]:bg-brutal-orange [[data-theme=brutal]_&]:text-black [[data-theme=brutal]_&]:hover:bg-brutal-orange",
                )}
              />
            }
          >
            <AlertTriangle aria-hidden size={18} />
          </NotificationCenterTrigger>
          <Status
            aria-hidden
            variant="primary"
            size="md"
            className="pointer-events-none absolute -top-1 -right-1"
          />
        </div>
        <NotificationCenterContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          side="bottom"
          align="center"
          collisionAvoidance={{ side: "none", align: "none" }}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
        />
      </NotificationCenter>
    </div>
  );
}
