import type { ComponentPropsWithRef } from "react";

import { useThemeFamily } from "../../lib/theme/use-theme";
import { Panel } from "../panel/panel";
import { activityInboxShell } from "./activity-inbox-shell.recipe";

export type ActivityInboxPanelProps = ComponentPropsWithRef<typeof Panel>;

export function ActivityInboxPanel({ className, ...props }: ActivityInboxPanelProps) {
  const theme = useThemeFamily();
  const { panel } = activityInboxShell({ theme });
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
  const theme = useThemeFamily();
  const { viewport } = activityInboxShell({ theme });
  return <div data-slot="activity-inbox-viewport" className={viewport({ className })} {...props} />;
}

export type ActivityInboxLoadingMoreProps = ComponentPropsWithRef<"div">;

export function ActivityInboxLoadingMore({ className, ...props }: ActivityInboxLoadingMoreProps) {
  const theme = useThemeFamily();
  const { loadingMore } = activityInboxShell({ theme });
  return (
    <div
      data-slot="activity-inbox-loading-more"
      className={loadingMore({ className })}
      {...props}
    />
  );
}
