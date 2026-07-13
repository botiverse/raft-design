import {
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
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import {
  AppRailFooter,
  AppRailHeader,
  AppRailItem,
  AppRailItemAttention,
  AppRailItemIcon,
  AppRailItemIndicator,
  AppRailItemLabel,
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
import { useState } from "react";

import { isPlaygroundRailView, usePlaygroundNavigation } from "./playground-navigation-state.tsx";

const currentServerName = "Design Guild";
const currentServerInitial = "D";

export function PlaygroundRail() {
  const { railView, selectRailView } = usePlaygroundNavigation();
  const [notificationVisible, setNotificationVisible] = useState(true);

  return (
    <AppShellRail>
      <AppRailRoot
        value={railView}
        onValueChange={(view) => {
          if (isPlaygroundRailView(view)) selectRailView(view);
        }}
      >
        <AppRailHeader>
          <AppRailServerButton
            title={currentServerName}
            aria-label={`Switch server (current: ${currentServerName})`}
          >
            {currentServerInitial}
            <AppRailItemIndicator aria-hidden title="Other servers have unread messages" />
          </AppRailServerButton>
        </AppRailHeader>
        <TooltipProvider delay={650}>
          <AppRailNav>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="search" aria-label="Search" />}>
                <AppRailItemIcon>
                  <Search />
                </AppRailItemIcon>
                <AppRailItemLabel>Search</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="chat" aria-label="Chat" />}>
                <AppRailItemIcon>
                  <MessageSquare />
                  {railView !== "chat" ? (
                    <AppRailItemAttention title="Unread messages">
                      <MessageSquare />
                    </AppRailItemAttention>
                  ) : null}
                </AppRailItemIcon>
                <AppRailItemLabel>Chat</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="activity" aria-label="Activity" />}>
                <AppRailItemIcon>
                  <Activity />
                  {railView !== "activity" ? (
                    <AppRailItemAttention title="Unread activity">
                      <Activity />
                    </AppRailItemAttention>
                  ) : null}
                </AppRailItemIcon>
                <AppRailItemLabel>Activity</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Activity</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="tasks" aria-label="Tasks" />}>
                <AppRailItemIcon>
                  <CheckSquare />
                </AppRailItemIcon>
                <AppRailItemLabel>Tasks</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Tasks</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="members" aria-label="Members" />}>
                <AppRailItemIcon>
                  <Users />
                </AppRailItemIcon>
                <AppRailItemLabel>Members</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Members</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="computers" aria-label="Computers" />}>
                <AppRailItemIcon>
                  <Monitor />
                  {railView !== "computers" ? (
                    <AppRailItemAttention title="A managed computer has an upgrade available">
                      <Monitor />
                    </AppRailItemAttention>
                  ) : null}
                </AppRailItemIcon>
                <AppRailItemLabel>Computers</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Computers</TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="settings" aria-label="Settings" />}>
                <AppRailItemIcon>
                  <Settings />
                </AppRailItemIcon>
                <AppRailItemLabel>Settings</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </AppRailFooter>
        </TooltipProvider>
      </AppRailRoot>
    </AppShellRail>
  );
}
