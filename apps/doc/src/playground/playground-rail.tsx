import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NotificationCenter,
  NotificationCenterActionButton,
  NotificationCenterCount,
  NotificationCenterHeader,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemBody,
  NotificationCenterItemContent,
  NotificationCenterItemIcon,
  NotificationCenterItemRow,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterPopup,
  NotificationCenterScroller,
  NotificationCenterTitle,
  NotificationCenterTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "raft-ui";
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
import { Check } from "lucide-react";
import { useRef, useState } from "react";

import { isPlaygroundRailView, usePlaygroundNavigation } from "./playground-navigation-state.tsx";

const playgroundServers = [
  { id: "raft", name: "Raft", initial: "R" },
  { id: "design-guild", name: "Design Guild", initial: "D" },
  { id: "open-source", name: "Open Source", initial: "O" },
] as const;

export function PlaygroundRail() {
  const { railView, selectRailView } = usePlaygroundNavigation();
  const serverMenuAnchorRef = useRef<HTMLDivElement>(null);
  const [serverId, setServerId] =
    useState<(typeof playgroundServers)[number]["id"]>("design-guild");
  const [notificationVisible, setNotificationVisible] = useState(true);
  const activeServer = playgroundServers.find((server) => server.id === serverId)!;

  return (
    <AppShellRail>
      <AppRailRoot
        value={railView}
        onValueChange={(view) => {
          if (isPlaygroundRailView(view)) selectRailView(view);
        }}
      >
        <AppRailHeader ref={serverMenuAnchorRef}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <AppRailServerButton
                  aria-label={`Switch server. Current server: ${activeServer.name}`}
                />
              }
            >
              {activeServer.initial}
              <AppRailItemIndicator aria-hidden title="Other servers have unread messages" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              anchor={serverMenuAnchorRef}
              side="right"
              sideOffset={8}
              align="start"
              alignOffset={1}
              collisionPadding={4}
              className="flex w-64 flex-col"
            >
              {playgroundServers.map((server) => (
                <DropdownMenuItem key={server.id} onClick={() => setServerId(server.id)}>
                  <Check aria-hidden className={server.id === serverId ? undefined : "opacity-0"} />
                  <span className="min-w-0 flex-1 truncate text-left">{server.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </AppRailHeader>
        <AppRailNav>
          <AppRailItem value="search" label="Search">
            <Search />
          </AppRailItem>
          <AppRailItem value="chat" label="Chat">
            <MessageSquare />
            {railView !== "chat" ? (
              <AppRailItemAttention title="Unread messages">
                <MessageSquare />
              </AppRailItemAttention>
            ) : null}
          </AppRailItem>
          <AppRailItem value="activity" label="Activity">
            <Activity />
            {railView !== "activity" ? (
              <AppRailItemAttention title="Unread activity">
                <Activity />
              </AppRailItemAttention>
            ) : null}
          </AppRailItem>
          <AppRailItem value="tasks" label="Tasks">
            <CheckSquare />
          </AppRailItem>
          <AppRailItem value="members" label="Members">
            <Users />
          </AppRailItem>
          <AppRailItem value="computers" label="Computers">
            <Monitor />
            {railView !== "computers" ? (
              <AppRailItemAttention title="A managed computer has an upgrade available">
                <Monitor />
              </AppRailItemAttention>
            ) : null}
          </AppRailItem>
        </AppRailNav>
        <AppRailFooter>
          {notificationVisible ? (
            <NotificationCenter modal={false}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <NotificationCenterTrigger type="button" aria-label="Notification center" />
                  }
                />
                <TooltipContent side="right">Notification center</TooltipContent>
              </Tooltip>
              <NotificationCenterPopup side="right" align="end">
                <NotificationCenterHeader>
                  <NotificationCenterTitle>Notifications</NotificationCenterTitle>
                  <NotificationCenterCount>1 item</NotificationCenterCount>
                </NotificationCenterHeader>
                <NotificationCenterScroller>
                  <NotificationCenterList>
                    <NotificationCenterItem>
                      <NotificationCenterItemRow>
                        <NotificationCenterItemIcon status="success" />
                        <NotificationCenterItemContent>
                          <NotificationCenterItemTitle>
                            Playground ready
                          </NotificationCenterItemTitle>
                          <NotificationCenterItemBody>
                            Component compositions are available for review.
                          </NotificationCenterItemBody>
                          <NotificationCenterItemActions>
                            <NotificationCenterActionButton
                              onClick={() => setNotificationVisible(false)}
                            >
                              Dismiss
                            </NotificationCenterActionButton>
                          </NotificationCenterItemActions>
                        </NotificationCenterItemContent>
                      </NotificationCenterItemRow>
                    </NotificationCenterItem>
                  </NotificationCenterList>
                </NotificationCenterScroller>
              </NotificationCenterPopup>
            </NotificationCenter>
          ) : null}
          <AppRailItem value="settings" label="Settings">
            <Settings />
          </AppRailItem>
        </AppRailFooter>
      </AppRailRoot>
    </AppShellRail>
  );
}
