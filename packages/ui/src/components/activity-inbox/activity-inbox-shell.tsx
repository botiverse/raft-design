import type { ComponentPropsWithRef } from "react";
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

export function ActivityInboxViewport({ className, ...props }: ActivityInboxViewportProps) {
  const { viewport } = activityInboxShell();
  return <div data-slot="activity-inbox-viewport" className={viewport({ className })} {...props} />;
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
