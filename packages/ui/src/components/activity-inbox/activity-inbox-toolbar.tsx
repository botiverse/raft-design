import type { ComponentPropsWithRef } from "react";
import { activityInboxToolbar } from "./activity-inbox-toolbar.recipe";

export type ActivityInboxControlsProps = ComponentPropsWithRef<"div">;

export function ActivityInboxControls({ className, ...props }: ActivityInboxControlsProps) {
  const { controls } = activityInboxToolbar();
  return <div data-slot="activity-inbox-controls" className={controls({ className })} {...props} />;
}

export type ActivityInboxSelectionToolbarProps = ComponentPropsWithRef<"div">;

export function ActivityInboxSelectionToolbar({
  className,
  ...props
}: ActivityInboxSelectionToolbarProps) {
  const { selectionToolbar } = activityInboxToolbar();
  return (
    <div
      data-slot="activity-inbox-selection-toolbar"
      className={selectionToolbar({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSelectionCountProps = ComponentPropsWithRef<"span">;

export function ActivityInboxSelectionCount({
  className,
  ...props
}: ActivityInboxSelectionCountProps) {
  const { selectionCount } = activityInboxToolbar();
  return (
    <span
      data-slot="activity-inbox-selection-count"
      className={selectionCount({ className })}
      {...props}
    />
  );
}
