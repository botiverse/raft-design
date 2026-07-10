import { NotificationCenter, NotificationCenterTrigger } from "raft-ui";
import {
  AppRailFooter,
  AppRailHeader,
  AppRailItem,
  AppRailItemIcon,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  AppRailServerButton,
  AppRailUtilitySlot,
  AppShellRail,
} from "raft-ui/wip";
import {
  Activity,
  CheckSquare,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

export function PlaygroundRail({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <AppShellRail className="flex md:flex">
      <AppRailRoot value={value} onValueChange={onValueChange}>
        <AppRailHeader>
          <AppRailServerButton aria-label="Switch server">D</AppRailServerButton>
        </AppRailHeader>
        <AppRailNav>
          <AppRailItem value="search" title="Search" aria-label="Search">
            <AppRailItemIcon>
              <Search />
            </AppRailItemIcon>
            <AppRailItemLabel>Search</AppRailItemLabel>
          </AppRailItem>
          <AppRailItem value="chat" title="Chat" aria-label="Chat">
            <AppRailItemIcon>
              <MessageSquare />
            </AppRailItemIcon>
            <AppRailItemLabel>Chat</AppRailItemLabel>
          </AppRailItem>
          <AppRailItem value="activity" title="Activity" aria-label="Activity">
            <AppRailItemIcon>
              <Activity />
            </AppRailItemIcon>
            <AppRailItemLabel>Activity</AppRailItemLabel>
          </AppRailItem>
          <AppRailItem value="tasks" title="Tasks" aria-label="Tasks">
            <AppRailItemIcon>
              <CheckSquare />
            </AppRailItemIcon>
            <AppRailItemLabel>Tasks</AppRailItemLabel>
          </AppRailItem>
          <AppRailItem value="members" title="Members" aria-label="Members">
            <AppRailItemIcon>
              <Users />
            </AppRailItemIcon>
            <AppRailItemLabel>Members</AppRailItemLabel>
          </AppRailItem>
          <AppRailItem value="computers" title="Computers" aria-label="Computers">
            <AppRailItemIcon>
              <Monitor />
            </AppRailItemIcon>
            <AppRailItemLabel>Computers</AppRailItemLabel>
          </AppRailItem>
        </AppRailNav>
        <AppRailUtilitySlot>
          <NotificationCenter modal={false}>
            <NotificationCenterTrigger type="button" aria-label="Notification center" />
          </NotificationCenter>
        </AppRailUtilitySlot>
        <AppRailFooter>
          <AppRailItem value="settings" title="Settings" aria-label="Settings">
            <AppRailItemIcon>
              <Settings />
            </AppRailItemIcon>
            <AppRailItemLabel>Settings</AppRailItemLabel>
          </AppRailItem>
        </AppRailFooter>
      </AppRailRoot>
    </AppShellRail>
  );
}
