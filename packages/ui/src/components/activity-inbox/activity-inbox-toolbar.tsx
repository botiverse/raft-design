import type { ComponentPropsWithRef } from "react";

import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button/button";
import { activityInboxToolbar } from "./activity-inbox-toolbar.recipe";

export type ActivityInboxControlsProps = ComponentPropsWithRef<"div">;

export function ActivityInboxControls({ className, ...props }: ActivityInboxControlsProps) {
  const theme = useThemeFamily();
  const { controls } = activityInboxToolbar({ theme });
  return <div data-slot="activity-inbox-controls" className={controls({ className })} {...props} />;
}

export type ActivityInboxSelectionToolbarProps = ComponentPropsWithRef<"div">;

export function ActivityInboxSelectionToolbar({
  className,
  ...props
}: ActivityInboxSelectionToolbarProps) {
  const theme = useThemeFamily();
  const { selectionToolbar } = activityInboxToolbar({ theme });
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
  const theme = useThemeFamily();
  const { selectionCount } = activityInboxToolbar({ theme });
  return (
    <span
      data-slot="activity-inbox-selection-count"
      className={selectionCount({ className })}
      {...props}
    />
  );
}

export type ActivityInboxToolbarActionVariant = "secondary" | "primary" | "link" | "ghost";

export type ActivityInboxToolbarActionProps = Omit<
  ComponentPropsWithRef<typeof Button>,
  "size" | "variant"
> & {
  variant?: ActivityInboxToolbarActionVariant;
};

/**
 * Bulk-selection toolbar action built on the shared Button. `secondary` maps to
 * Button's outline treatment, `primary` to the high-emphasis fill, `link` to a
 * text action, and `ghost` to the sort-style text trigger.
 */
export function ActivityInboxToolbarAction({
  className,
  variant = "secondary",
  ...props
}: ActivityInboxToolbarActionProps) {
  const theme = useThemeFamily();
  const { toolbarAction } = activityInboxToolbar({ theme, toolbarActionVariant: variant });
  const buttonVariant =
    variant === "primary"
      ? "default"
      : variant === "link"
        ? "link"
        : variant === "ghost"
          ? "ghost"
          : "outline";
  return (
    <Button
      type="button"
      size="xs"
      variant={buttonVariant}
      className={toolbarAction({ className })}
      {...props}
    />
  );
}
