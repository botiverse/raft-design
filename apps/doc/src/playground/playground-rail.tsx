import { useNavigate } from "@tanstack/react-router";
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
  Status,
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
  ChatSidebarServer,
  ChatSidebarServerAvatar,
  ChatSidebarServerChevron,
  ChatSidebarServerIndicator,
  ChatSidebarServerLabel,
} from "raft-ui/wip";
import {
  Activity,
  CheckSquare,
  ChevronDown,
  Home,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { DEFAULT_CHANNEL_ID } from "./mock/index.ts";
import { isPlaygroundRailView, usePlaygroundNavigation } from "./playground-navigation-state.tsx";
import { usePlaygroundShellState } from "./playground-shell-state.tsx";

const currentServerName = "Raft 中文社区";
const currentServerAvatarSrc =
  "https://cdn.slock.ai/avatars/server-46a34a4b-a324-4723-ad1d-4921b58ffe48/3f42727015df244421d70c681ff65093.webp";

export function PlaygroundNotificationCenter({ mobile = false }: { mobile?: boolean }) {
  const { dismissNotification, notificationVisible } = usePlaygroundShellState();

  if (!notificationVisible) return null;

  return (
    <NotificationCenter modal={false}>
      {mobile ? (
        <NotificationCenterTrigger type="button" aria-label="Notification center" />
      ) : (
        <Tooltip>
          <TooltipTrigger
            render={<NotificationCenterTrigger type="button" aria-label="Notification center" />}
          />
          <TooltipContent side="right">Notification center</TooltipContent>
        </Tooltip>
      )}
      <NotificationCenterPopup side={mobile ? "bottom" : "right"} align="end">
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
                  <NotificationCenterItemTitle>Playground ready</NotificationCenterItemTitle>
                  <NotificationCenterItemBody>
                    Component compositions are available for review.
                  </NotificationCenterItemBody>
                  <NotificationCenterItemActions>
                    <NotificationCenterActionButton onClick={dismissNotification}>
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
  );
}

export function PlaygroundServerSwitcher({ className }: { className?: string }) {
  return (
    <AppRailServerButton
      render={<div />}
      type={undefined}
      title={currentServerName}
      className={className}
    >
      <img alt="" src={currentServerAvatarSrc} />
      <span className="sr-only">{currentServerName}</span>
      <AppRailItemIndicator size="sm" aria-hidden title="Other servers have unread messages" />
    </AppRailServerButton>
  );
}

export function PlaygroundSidebarServerSwitcher({ name }: { name: string }) {
  return (
    <ChatSidebarServer title={name}>
      <ChatSidebarServerAvatar>
        <img alt="" src={currentServerAvatarSrc} />
      </ChatSidebarServerAvatar>
      <ChatSidebarServerLabel>{name}</ChatSidebarServerLabel>
      <ChatSidebarServerChevron aria-hidden>
        <ChevronDown />
      </ChatSidebarServerChevron>
      <ChatSidebarServerIndicator>
        <Status
          aria-label="Other servers have unread messages"
          attention
          size="sm"
          variant="primary"
        />
      </ChatSidebarServerIndicator>
    </ChatSidebarServer>
  );
}

export function PlaygroundRail({ showBottomNavigation }: { showBottomNavigation: boolean }) {
  const { railView, selectRailView } = usePlaygroundNavigation();
  const navigate = useNavigate();

  return (
    <>
      <AppShellRail>
        <AppRailRoot
          value={railView}
          onValueChange={(view) => {
            if (isPlaygroundRailView(view)) selectRailView(view);
          }}
        >
          <AppRailHeader>
            <PlaygroundServerSwitcher />
          </AppRailHeader>
          <TooltipProvider delay={650}>
            <div className="hidden min-h-0 w-full flex-1 md:flex">
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
                  <TooltipTrigger
                    render={
                      <AppRailItem
                        value="chat"
                        aria-label="Chat"
                        onClick={(event) => {
                          event.preventDefault();
                          void navigate({
                            to: "/playground/$channelId",
                            params: { channelId: DEFAULT_CHANNEL_ID },
                            search: {},
                          });
                        }}
                      />
                    }
                  >
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
                  <TooltipTrigger
                    render={
                      <AppRailItem
                        value="members"
                        aria-label="Members"
                        onClick={(event) => {
                          event.preventDefault();
                          void navigate({
                            to: "/playground/members",
                            search: { detail: "agents" },
                          });
                        }}
                      />
                    }
                  >
                    <AppRailItemIcon>
                      <Users />
                    </AppRailItemIcon>
                    <AppRailItemLabel>Members</AppRailItemLabel>
                  </TooltipTrigger>
                  <TooltipContent side="right">Members</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <AppRailItem
                        value="computers"
                        aria-label="Computers"
                        onClick={(event) => {
                          event.preventDefault();
                          void navigate({
                            to: "/playground/computers",
                            search: { detail: "dev-machine" },
                          });
                        }}
                      />
                    }
                  >
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
            </div>
            <AppRailFooter>
              <PlaygroundNotificationCenter />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <AppRailItem
                      value="settings"
                      aria-label="Settings"
                      onClick={(event) => {
                        event.preventDefault();
                        void navigate({
                          to: "/playground/settings",
                          search: { detail: "account" },
                        });
                      }}
                    />
                  }
                >
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
      {showBottomNavigation ? (
        <AppShellRail placement="bottom">
          <AppRailRoot
            value={railView}
            onValueChange={(view) => {
              if (isPlaygroundRailView(view)) selectRailView(view);
            }}
          >
            <AppRailNav aria-label="Primary navigation">
              <AppRailItem value="chat" aria-label="Home">
                <AppRailItemIcon>
                  <Home />
                </AppRailItemIcon>
                <AppRailItemLabel>Home</AppRailItemLabel>
              </AppRailItem>
              <AppRailItem value="tasks" aria-label="Tasks">
                <AppRailItemIcon>
                  <CheckSquare />
                </AppRailItemIcon>
                <AppRailItemLabel>Tasks</AppRailItemLabel>
              </AppRailItem>
              <AppRailItem value="members" aria-label="Members">
                <AppRailItemIcon>
                  <Users />
                </AppRailItemIcon>
                <AppRailItemLabel>Members</AppRailItemLabel>
              </AppRailItem>
              <AppRailItem value="settings" aria-label="Settings">
                <AppRailItemIcon>
                  <Settings />
                </AppRailItemIcon>
                <AppRailItemLabel>Settings</AppRailItemLabel>
              </AppRailItem>
            </AppRailNav>
          </AppRailRoot>
        </AppShellRail>
      ) : null}
    </>
  );
}
