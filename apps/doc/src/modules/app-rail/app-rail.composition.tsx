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
  selected,
  label,
  icon,
  attention,
  render,
}: {
  selected?: boolean;
  label: string;
  icon: ReactNode;
  attention?: ReactNode;
  render: ComponentProps<typeof AppRailItem>["render"];
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<AppRailItem selected={selected} render={render} />}>
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
  const [announcement, setAnnouncement] = useState({ message: "", sequence: 0 });

  function announce(message: string) {
    setAnnouncement((current) => ({ message, sequence: current.sequence + 1 }));
  }

  function selectView(next: string) {
    setView(next);
    announce(`Opened ${next}`);
  }

  return (
    <AppShellRailSlot>
      <AppRailRoot>
        <AppRailHeader>
          <AppRailServerButton
            title="Raft 中文社区"
            aria-label="Switch server (current: Raft 中文社区)"
            onClick={() => announce("Opened server switcher")}
          >
            <img
              alt=""
              src="https://cdn.slock.ai/avatars/server-46a34a4b-a324-4723-ad1d-4921b58ffe48/3f42727015df244421d70c681ff65093.webp"
            />
            <AppRailItemIndicator size="sm" aria-hidden />
          </AppRailServerButton>
        </AppRailHeader>
        <span className="sr-only" aria-live="polite">
          <span key={announcement.sequence}>{announcement.message}</span>
        </span>
        <TooltipProvider delay={650}>
          <AppRailNav>
            <AppRailNavItem
              selected={view === "search"}
              render={<button type="button" onClick={() => selectView("search")} />}
              label="Search"
              icon={<Search />}
            />
            <AppRailNavItem
              selected={view === "chat"}
              render={<button type="button" onClick={() => selectView("chat")} />}
              label="Chat"
              icon={<MessageSquare />}
            />
            <AppRailNavItem
              selected={view === "activity"}
              render={<button type="button" onClick={() => selectView("activity")} />}
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
              render={<button type="button" onClick={() => selectView("tasks")} />}
              label="Tasks"
              icon={<CheckSquare />}
            />
            <AppRailNavItem
              selected={view === "members"}
              render={<button type="button" onClick={() => selectView("members")} />}
              label="Members"
              icon={<Users />}
            />
            <AppRailNavItem
              selected={view === "computers"}
              render={<button type="button" onClick={() => selectView("computers")} />}
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
              render={<button type="button" onClick={() => selectView("settings")} />}
              label="Settings"
              icon={<Settings />}
            />
          </AppRailFooter>
        </TooltipProvider>
      </AppRailRoot>
    </AppShellRailSlot>
  );
}
