import type { ComponentPropsWithRef, ReactNode } from "react";

import { useThemeFamily } from "../../lib/theme/use-theme";
import { SidebarBody, SidebarContent, SidebarRoot } from "../sidebar/sidebar";
import { SidebarItemRoot } from "../sidebar/sidebar-item";
import { activityInboxSidebar } from "./activity-inbox-sidebar.recipe";

export type ActivityInboxSidebarProps = ComponentPropsWithRef<typeof SidebarRoot> & {
  children?: ReactNode;
};

export function ActivityInboxSidebar({ className, children, ...props }: ActivityInboxSidebarProps) {
  const theme = useThemeFamily();
  const { sidebar, sidebarBody, sidebarContent } = activityInboxSidebar({ theme });
  return (
    <SidebarRoot
      render={<aside />}
      data-slot="activity-inbox-sidebar"
      className={sidebar({ className })}
      {...props}
    >
      <SidebarBody className={sidebarBody()}>
        <SidebarContent className={sidebarContent()}>{children}</SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

export type ActivityInboxSidebarHeadingProps = ComponentPropsWithRef<"div">;

export function ActivityInboxSidebarHeading({
  className,
  ...props
}: ActivityInboxSidebarHeadingProps) {
  const theme = useThemeFamily();
  const { sidebarHeading } = activityInboxSidebar({ theme });
  return (
    <div
      data-slot="activity-inbox-sidebar-heading"
      className={sidebarHeading({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSidebarHeadingLabelProps = ComponentPropsWithRef<"span">;

export function ActivityInboxSidebarHeadingLabel({
  className,
  ...props
}: ActivityInboxSidebarHeadingLabelProps) {
  const theme = useThemeFamily();
  const { sidebarHeadingLabel } = activityInboxSidebar({ theme });
  return (
    <span
      data-slot="activity-inbox-sidebar-heading-label"
      className={sidebarHeadingLabel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxNavigationItemProps = ComponentPropsWithRef<typeof SidebarItemRoot>;

export function ActivityInboxNavigationItem({
  active,
  className,
  ...props
}: ActivityInboxNavigationItemProps) {
  const theme = useThemeFamily();
  const { navigationItem } = activityInboxSidebar({ theme });
  return (
    <SidebarItemRoot
      active={active}
      data-slot="activity-inbox-navigation-item"
      className={navigationItem({ className })}
      {...props}
    />
  );
}

export type ActivityInboxNavigationLabelProps = ComponentPropsWithRef<"span">;

export function ActivityInboxNavigationLabel({
  className,
  ...props
}: ActivityInboxNavigationLabelProps) {
  const theme = useThemeFamily();
  const { navigationLabel } = activityInboxSidebar({ theme });
  return (
    <span
      data-slot="activity-inbox-navigation-label"
      className={navigationLabel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxNavigationCountProps = ComponentPropsWithRef<"span">;

export function ActivityInboxNavigationCount({
  className,
  ...props
}: ActivityInboxNavigationCountProps) {
  const theme = useThemeFamily();
  const { navigationCount } = activityInboxSidebar({ theme });
  return (
    <span
      data-slot="activity-inbox-navigation-count"
      className={navigationCount({ className })}
      {...props}
    />
  );
}
