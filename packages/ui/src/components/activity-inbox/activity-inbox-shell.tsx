import { useMemo } from "react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";
import { Panel } from "../panel/panel";
import { ScrollAreaGutters } from "../scroll-area/scroll-area-gutters";
import { useScrollAreaContainer } from "../scroll-area/use-scroll-area-container";
import { activityInboxShell } from "./activity-inbox-shell.recipe";

export type ActivityInboxPanelProps = ComponentPropsWithRef<typeof Panel>;

export function ActivityInboxPanel({ className, ...props }: ActivityInboxPanelProps) {
  const { panel } = activityInboxShell();
  return (
    <Panel
      render={<div />}
      edge="inset"
      data-slot="activity-inbox-root"
      className={panel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxViewportProps = ComponentPropsWithRef<"div">;

/** The list's scroller, a ScrollArea container with absolute gutters: the
 *  overlay scrollbar takes no room, so the item cells' fills sit 8px from both
 *  edges with or without it (design/patterns/lists.md), and the scroller lays
 *  out its own column of items. `ref`, `className` and the native props are
 *  the scrolling element's; a frame around it holds the scrollbar. */
export function ActivityInboxViewport({
  children,
  className,
  ref,
  style,
  ...props
}: ActivityInboxViewportProps) {
  const { frame, viewport } = activityInboxShell();
  const { containerProps, frameProps, guttersProps } = useScrollAreaContainer<HTMLDivElement>({
    containerRef: ref,
    guttersPosition: "absolute",
    overscroll: "contain",
  });
  const ownStyle = useMemo(
    () => ({ ...containerProps.style, ...style }),
    [containerProps.style, style],
  );
  return (
    <div
      {...frameProps}
      data-slot="activity-inbox-viewport-frame"
      className={frame({ className: frameProps.className })}
    >
      <div
        data-slot="activity-inbox-viewport"
        {...containerProps}
        {...props}
        style={ownStyle}
        className={viewport({ className: cn(containerProps.className, className) })}
      >
        {children}
      </div>
      <ScrollAreaGutters {...guttersProps} />
    </div>
  );
}

export type ActivityInboxLoadingMoreProps = ComponentPropsWithRef<"div">;

export function ActivityInboxLoadingMore({ className, ...props }: ActivityInboxLoadingMoreProps) {
  const { loadingMore } = activityInboxShell();
  return (
    <div
      data-slot="activity-inbox-loading-more"
      className={loadingMore({ className })}
      {...props}
    />
  );
}
