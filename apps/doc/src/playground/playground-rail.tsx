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
  AppRailItemAttention,
  AppRailItemIndicator,
  AppRailNav,
  AppRailRoot,
  AppShellRailSlot,
} from "raft-ui/wip";
import {
  Activity,
  CheckSquare,
  ChevronDown,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { MobileNavDestinations, AppRailNavItem } from "#/modules/app-rail/app-rail.composition.tsx";
import { AppRailServerButton } from "#/modules/app-rail/app-rail-server-button.tsx";
import {
  ChatSidebarServer,
  ChatSidebarServerAvatar,
  ChatSidebarServerChevron,
  ChatSidebarServerIndicator,
  ChatSidebarServerLabel,
} from "#/modules/chat-sidebar/chat-sidebar-server-switcher.tsx";
import { PLAYGROUND_SERVER_SLUG } from "./mock/index.ts";
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

  function selectView(view: string) {
    if (isPlaygroundRailView(view)) selectRailView(view);
  }

  return (
    <>
      <AppShellRailSlot>
        <AppRailRoot>
          <AppRailHeader>
            <PlaygroundServerSwitcher />
          </AppRailHeader>
          <TooltipProvider delay={650}>
            <div className="hidden min-h-0 w-full flex-1 md:flex">
              <AppRailNav>
                <AppRailNavItem
                  selected={railView === "search"}
                  onClick={() => selectView("search")}
                  label="Search"
                  icon={<Search />}
                />
                <AppRailNavItem
                  selected={railView === "chat"}
                  label="Chat"
                  icon={<MessageSquare />}
                  attention={
                    railView !== "chat" ? (
                      <AppRailItemAttention title="Unread messages">
                        <MessageSquare />
                      </AppRailItemAttention>
                    ) : undefined
                  }
                  onClick={() => {
                    void navigate({
                      to: "/playground/s/$serverSlug",
                      params: { serverSlug: PLAYGROUND_SERVER_SLUG },
                      search: {},
                    });
                  }}
                />
                <AppRailNavItem
                  selected={railView === "activity"}
                  onClick={() => selectView("activity")}
                  label="Activity"
                  icon={<Activity />}
                  attention={
                    railView !== "activity" ? (
                      <AppRailItemAttention title="Unread activity">
                        <Activity />
                      </AppRailItemAttention>
                    ) : undefined
                  }
                />
                <AppRailNavItem
                  selected={railView === "tasks"}
                  onClick={() => selectView("tasks")}
                  label="Tasks"
                  icon={<CheckSquare />}
                />
                <AppRailNavItem
                  selected={railView === "members"}
                  onClick={() => selectView("members")}
                  label="Members"
                  icon={<Users />}
                />
                <AppRailNavItem
                  selected={railView === "computers"}
                  onClick={() => selectView("computers")}
                  label="Computers"
                  icon={<Monitor />}
                  attention={
                    railView !== "computers" ? (
                      <AppRailItemAttention title="A managed computer has an upgrade available">
                        <Monitor />
                      </AppRailItemAttention>
                    ) : undefined
                  }
                />
              </AppRailNav>
            </div>
            <AppRailFooter>
              <PlaygroundNotificationCenter />
              <AppRailNavItem
                selected={railView === "settings"}
                onClick={() => selectView("settings")}
                label="Settings"
                icon={<Settings />}
              />
            </AppRailFooter>
          </TooltipProvider>
        </AppRailRoot>
      </AppShellRailSlot>
      {showBottomNavigation ? (
        <MobileNavDestinations
          className="fixed inset-x-0 bottom-0 z-40 mx-auto lg:hidden"
          value={railView}
          onValueChange={selectView}
        />
      ) : null}
    </>
  );
}
