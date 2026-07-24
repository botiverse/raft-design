import { Link } from "@tanstack/react-router";
import { Select as BaseSelect } from "@base-ui/react/select";
import {
  AppShellRailSlot,
  AppRailItem,
  AppRailFooter,
  AppRailHeader,
  AppRailItemIcon,
  AppRailItemLabel,
  AppRailItemAttention,
  AppRailItemIndicator,
  AppRailNav,
  AppRailRoot,
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
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
  Status,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
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

import { AppRailNavItem } from "#/modules/app-rail/app-rail.composition.tsx";
import { AppRailServerButton } from "#/modules/app-rail/app-rail-server-button.tsx";
import {
  ChatSidebarServer,
  ChatSidebarServerAvatar,
  ChatSidebarServerChevron,
  ChatSidebarServerIndicator,
  ChatSidebarServerLabel,
} from "#/modules/chat-sidebar/chat-sidebar-server-switcher.tsx";
import { PlaygroundSidebarTrigger } from "../app-shell/playground-sidebar-trigger.tsx";
import { PlaygroundThemeSelect } from "../app-shell/playground-theme-select.tsx";
import { usePlaygroundShellState } from "../app-shell/use-playground-shell-state.ts";
import { PLAYGROUND_SERVER_SLUG } from "../mock/index.ts";
import { isPlaygroundRailView } from "../navigation/playground-navigation.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";

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
      nativeButton={false}
      render={<div />}
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
                  render={<button type="button" onClick={() => selectView("search")} />}
                  label="Search"
                  icon={<Search />}
                />
                <AppRailNavItem
                  selected={railView === "chat"}
                  nativeButton={false}
                  render={
                    <Link
                      to="/playground/s/$serverSlug"
                      params={{ serverSlug: PLAYGROUND_SERVER_SLUG }}
                      search={{}}
                    />
                  }
                  label="Chat"
                  icon={<MessageSquare />}
                  attention={
                    railView !== "chat" ? (
                      <AppRailItemAttention title="Unread messages">
                        <MessageSquare />
                      </AppRailItemAttention>
                    ) : undefined
                  }
                />
                <AppRailNavItem
                  selected={railView === "activity"}
                  render={<button type="button" onClick={() => selectView("activity")} />}
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
                  render={<button type="button" onClick={() => selectView("tasks")} />}
                  label="Tasks"
                  icon={<CheckSquare />}
                />
                <AppRailNavItem
                  selected={railView === "members"}
                  render={<button type="button" onClick={() => selectView("members")} />}
                  label="Members"
                  icon={<Users />}
                />
                <AppRailNavItem
                  selected={railView === "computers"}
                  render={<button type="button" onClick={() => selectView("computers")} />}
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
              <PlaygroundSidebarTrigger />
              <PlaygroundNotificationCenter />
              <PlaygroundThemeSelect side="right">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <BaseSelect.Trigger
                        render={<AppRailItem />}
                        aria-label="Select Playground theme"
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
              </PlaygroundThemeSelect>
            </AppRailFooter>
          </TooltipProvider>
        </AppRailRoot>
      </AppShellRailSlot>
      {showBottomNavigation ? (
        <MobileNavRoot
          className="fixed inset-x-0 -bottom-1 z-40 mx-auto md:hidden"
          aria-label="Primary navigation"
        >
          <MobileNavItem
            selected={railView === "chat"}
            onClick={() => selectView("chat")}
            aria-label="Home"
          >
            <Home />
            <MobileNavLabel>Home</MobileNavLabel>
          </MobileNavItem>
          <MobileNavItem
            selected={railView === "tasks"}
            onClick={() => selectView("tasks")}
            aria-label="Tasks"
          >
            <CheckSquare />
            <MobileNavLabel>Tasks</MobileNavLabel>
          </MobileNavItem>
          <MobileNavItem
            selected={railView === "members"}
            onClick={() => selectView("members")}
            aria-label="Members"
          >
            <Users />
            <MobileNavLabel>Members</MobileNavLabel>
          </MobileNavItem>
          <PlaygroundThemeSelect side="top">
            <BaseSelect.Trigger render={<MobileNavItem aria-label="Select Playground theme" />}>
              <Settings />
              <MobileNavLabel>Settings</MobileNavLabel>
            </BaseSelect.Trigger>
          </PlaygroundThemeSelect>
        </MobileNavRoot>
      ) : null}
    </>
  );
}
