import type { ComponentPropsWithRef } from "react";
import { activityInboxToolbar } from "./activity-inbox-toolbar.recipe";

export type ActivityInboxControlsProps = ComponentPropsWithRef<"div">;

export function ActivityInboxControls({ className, ...props }: ActivityInboxControlsProps) {
  const { controls } = activityInboxToolbar();
  return <div data-slot="activity-inbox-controls" className={controls({ className })} {...props} />;
}
