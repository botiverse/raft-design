import type { ComponentPropsWithRef } from "react";

import { useThemeFamily } from "../../lib/theme/use-theme";
import { SidebarBody, SidebarContent, SidebarRoot } from "../sidebar/sidebar";
import { activityInboxSidebar } from "./activity-inbox-sidebar.recipe";

export type ActivityInboxSidebarProps = ComponentPropsWithRef<typeof SidebarRoot>;

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
