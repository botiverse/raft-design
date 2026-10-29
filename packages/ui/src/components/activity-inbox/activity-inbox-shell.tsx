import type { ComponentPropsWithRef } from "react";
import { useMergedRef } from "../../lib/use-merged-ref";
import { useScrollbarSize } from "../../lib/use-scrollbar-size";
import { Panel } from "../panel/panel";
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

/** The list's scroller. It publishes its scrollbar's width for the item
 *  cells (useScrollbarSize), so their fills sit 8px from both edges. */
export function ActivityInboxViewport({ className, ref, ...props }: ActivityInboxViewportProps) {
  const { viewport } = activityInboxShell();
  const scrollbarRef = useScrollbarSize<HTMLDivElement>();
  const [setRef] = useMergedRef<HTMLDivElement>(ref, scrollbarRef);
  return (
    <div
      data-slot="activity-inbox-viewport"
      className={viewport({ className })}
      {...props}
      ref={setRef}
    />
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
