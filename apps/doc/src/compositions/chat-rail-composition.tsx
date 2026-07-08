import { NotificationCenter, NotificationCenterTrigger, Status } from "raft-ui";
import {
  ChatRailFooter,
  ChatRailHeader,
  ChatRailItem,
  ChatRailItemIcon,
  ChatRailItemLabel,
  ChatRailNav,
  ChatRailRoot,
  ChatRailServerButton,
  ChatShellRail,
} from "raft-ui/wip";
import {
  Activity,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

export function ChatRailComposition() {
  return (
    <ChatShellRail className="flex md:flex">
      <ChatRailRoot value="chat">
        <ChatRailHeader>
          <ChatRailServerButton aria-label="Switch server">
            R
            <Status
              aria-hidden
              variant="accent"
              size="md"
              className="pointer-events-none absolute -top-1 -right-1"
            />
          </ChatRailServerButton>
        </ChatRailHeader>
        <ChatRailNav>
          <ChatRailItem value="search" title="Search" aria-label="Search">
            <ChatRailItemIcon>
              <Search />
            </ChatRailItemIcon>
            <ChatRailItemLabel>Search</ChatRailItemLabel>
          </ChatRailItem>
          <ChatRailItem value="chat" title="Chat" aria-label="Chat">
            <ChatRailItemIcon>
              <MessageSquare />
            </ChatRailItemIcon>
            <ChatRailItemLabel>Chat</ChatRailItemLabel>
          </ChatRailItem>
          <ChatRailItem value="activity" title="Activity" aria-label="Activity">
            <ChatRailItemIcon>
              <Activity />
            </ChatRailItemIcon>
            <ChatRailItemLabel>Activity</ChatRailItemLabel>
            <Status
              aria-hidden
              variant="accent"
              size="md"
              className="pointer-events-none absolute -top-1 -right-1"
            />
          </ChatRailItem>
          <ChatRailItem value="tasks" title="Tasks" aria-label="Tasks">
            <ChatRailItemIcon>
              <CheckSquare />
            </ChatRailItemIcon>
            <ChatRailItemLabel>Tasks</ChatRailItemLabel>
          </ChatRailItem>
          <ChatRailItem value="members" title="Members" aria-label="Members">
            <ChatRailItemIcon>
              <Users />
            </ChatRailItemIcon>
            <ChatRailItemLabel>Members</ChatRailItemLabel>
          </ChatRailItem>
          <ChatRailItem value="computers" title="Computers" aria-label="Computers">
            <ChatRailItemIcon>
              <Monitor />
            </ChatRailItemIcon>
            <ChatRailItemLabel>Computers</ChatRailItemLabel>
            <Status
              aria-hidden
              variant="accent"
              size="md"
              className="pointer-events-none absolute -top-1 -right-1"
            />
          </ChatRailItem>
        </ChatRailNav>
        <div className="flex w-full items-center justify-center pb-1">
          <NotificationCenter modal={false}>
            <NotificationCenterTrigger type="button" aria-label="Notification center">
              <AlertTriangle aria-hidden className="size-[18px]" />
              <Status
                aria-hidden
                variant="accent"
                size="md"
                className="pointer-events-none absolute -top-1 -right-1"
              />
            </NotificationCenterTrigger>
          </NotificationCenter>
        </div>
        <ChatRailFooter>
          <ChatRailItem value="settings" title="Settings" aria-label="Settings">
            <ChatRailItemIcon>
              <Settings />
            </ChatRailItemIcon>
            <ChatRailItemLabel>Settings</ChatRailItemLabel>
          </ChatRailItem>
        </ChatRailFooter>
      </ChatRailRoot>
    </ChatShellRail>
  );
}
