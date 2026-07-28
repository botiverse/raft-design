import { useState, type ComponentProps, type ReactNode } from "react";
import {
  AppShellRailSlot,
  AppRailFooter,
  AppRailHeader,
  AppRailItem,
  AppRailItemAttention,
  AppRailItemIcon,
  AppRailItemIndicator,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  NotificationCenter,
  NotificationCenterTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import {
  Activity,
  CheckSquare,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { AppRailServerButton } from "#/modules/app-rail/app-rail-server-button.tsx";

// Tooltip-wrapped desktop rail item. Callers own the rendered navigation or action target.
export function AppRailNavItem({
  nativeButton,
  selected,
  label,
  icon,
  attention,
  render,
}: {
  nativeButton?: boolean;
  selected?: boolean;
  label: string;
  icon: ReactNode;
  attention?: ReactNode;
  render: ComponentProps<typeof AppRailItem>["render"];
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<AppRailItem nativeButton={nativeButton} selected={selected} render={render} />}
      >
        <AppRailItemIcon>
          {icon}
          {attention}
        </AppRailItemIcon>
        <AppRailItemLabel>{label}</AppRailItemLabel>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppRailComposition() {
  const [view, setView] = useState("chat");
  const [otherServersUnread, setOtherServersUnread] = useState(true);

  return (
    <AppShellRailSlot>
      <AppRailRoot>
        <AppRailHeader>
          <AppRailServerButton
            title="Raft 中文社区"
            aria-label={
              otherServersUnread
                ? "Raft 中文社区. Mark other servers read"
                : "Raft 中文社区. Mark other servers unread"
            }
            onClick={() => setOtherServersUnread((current) => !current)}
          >
            <img
              alt=""
              src="https://cdn.slock.ai/avatars/server-46a34a4b-a324-4723-ad1d-4921b58ffe48/3f42727015df244421d70c681ff65093.webp"
            />
            {otherServersUnread ? <AppRailItemIndicator size="sm" aria-hidden /> : null}
          </AppRailServerButton>
        </AppRailHeader>
        <TooltipProvider delay={650}>
          <AppRailNav>
            <AppRailNavItem
              selected={view === "search"}
              render={<button type="button" onClick={() => setView("search")} />}
              label="Search"
              icon={<Search />}
            />
            <AppRailNavItem
              selected={view === "chat"}
              render={<button type="button" onClick={() => setView("chat")} />}
              label="Chat"
              icon={<MessageSquare />}
            />
            <AppRailNavItem
              selected={view === "activity"}
              render={<button type="button" onClick={() => setView("activity")} />}
              label="Activity"
              icon={<Activity />}
              attention={
                <AppRailItemAttention>
                  <Activity />
                </AppRailItemAttention>
              }
            />
            <AppRailNavItem
              selected={view === "tasks"}
              render={<button type="button" onClick={() => setView("tasks")} />}
              label="Tasks"
              icon={<CheckSquare />}
            />
            <AppRailNavItem
              selected={view === "members"}
              render={<button type="button" onClick={() => setView("members")} />}
              label="Members"
              icon={<Users />}
            />
            <AppRailNavItem
              selected={view === "computers"}
              render={<button type="button" onClick={() => setView("computers")} />}
              label="Computers"
              icon={<Monitor />}
              attention={
                <AppRailItemAttention>
                  <Monitor />
                </AppRailItemAttention>
              }
            />
          </AppRailNav>
          <AppRailFooter>
            <NotificationCenter modal={false}>
              <NotificationCenterTrigger type="button" aria-label="Notification center" />
            </NotificationCenter>
            <AppRailNavItem
              selected={view === "settings"}
              render={<button type="button" onClick={() => setView("settings")} />}
              label="Settings"
              icon={<Settings />}
            />
          </AppRailFooter>
        </TooltipProvider>
      </AppRailRoot>
    </AppShellRailSlot>
  );
}
