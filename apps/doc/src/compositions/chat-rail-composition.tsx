import { NotificationCenter, NotificationCenterTrigger } from "raft-ui";
import {
  AppRailFooter,
  AppRailHeader,
  AppRailItem,
  AppRailItemAttention,
  AppRailItemIndicator,
  AppRailNav,
  AppRailRoot,
  AppRailServerButton,
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

export function AppRailComposition() {
  return (
    <AppShellRail className="flex md:flex">
      <AppRailRoot value="chat">
        <AppRailHeader>
          <AppRailServerButton aria-label="Switch server">
            R
            <AppRailItemIndicator aria-hidden />
          </AppRailServerButton>
        </AppRailHeader>
        <AppRailNav>
          <AppRailItem value="search" label="Search">
            <Search />
          </AppRailItem>
          <AppRailItem value="chat" label="Chat">
            <MessageSquare />
          </AppRailItem>
          <AppRailItem value="activity" label="Activity">
            <Activity />
            <AppRailItemAttention>
              <Activity />
            </AppRailItemAttention>
          </AppRailItem>
          <AppRailItem value="tasks" label="Tasks">
            <CheckSquare />
          </AppRailItem>
          <AppRailItem value="members" label="Members">
            <Users />
          </AppRailItem>
          <AppRailItem value="computers" label="Computers">
            <Monitor />
            <AppRailItemAttention>
              <Monitor />
            </AppRailItemAttention>
          </AppRailItem>
        </AppRailNav>
        <AppRailFooter>
          <NotificationCenter modal={false}>
            <NotificationCenterTrigger type="button" aria-label="Notification center" />
          </NotificationCenter>
          <AppRailItem value="settings" label="Settings">
            <Settings />
          </AppRailItem>
        </AppRailFooter>
      </AppRailRoot>
    </AppShellRail>
  );
}
