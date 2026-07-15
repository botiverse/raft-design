import { useState, type ComponentProps, type ReactNode } from "react";
import {
  NotificationCenter,
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
  AppShellRailSlot,
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
} from "raft-ui/wip";
import {
  Activity,
  CheckSquare,
  Home,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { AppRailServerButton } from "#/modules/app-rail/app-rail-server-button.tsx";

// Tooltip-wrapped desktop rail item. Callers own selection and navigation behavior.
export function AppRailNavItem({
  selected,
  label,
  icon,
  attention,
  onClick,
}: {
  selected?: boolean;
  label: string;
  icon: ReactNode;
  attention?: ReactNode;
  onClick?: ComponentProps<typeof AppRailItem>["onClick"];
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<AppRailItem selected={selected} onClick={onClick} />}>
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

// App-owned mobile bottom-navigation destinations. Shared by this composition and
// Playground so the two never drift; selection stays coordinated with the desktop rail.
export function MobileNavDestinations({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <MobileNavRoot aria-label="Primary navigation">
      <MobileNavItem
        selected={value === "chat"}
        onClick={() => onValueChange?.("chat")}
        aria-label="Home"
      >
        <Home />
        <MobileNavLabel>Home</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={value === "tasks"}
        onClick={() => onValueChange?.("tasks")}
        aria-label="Tasks"
      >
        <CheckSquare />
        <MobileNavLabel>Tasks</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={value === "members"}
        onClick={() => onValueChange?.("members")}
        aria-label="Members"
      >
        <Users />
        <MobileNavLabel>Members</MobileNavLabel>
      </MobileNavItem>
      <MobileNavItem
        selected={value === "settings"}
        onClick={() => onValueChange?.("settings")}
        aria-label="Settings"
      >
        <Settings />
        <MobileNavLabel>Settings</MobileNavLabel>
      </MobileNavItem>
    </MobileNavRoot>
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
    <AppShellRailSlot className="max-md:order-last max-md:flex max-md:h-auto max-md:w-full">
      <AppRailRoot>
        <AppRailHeader className="max-md:hidden">
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
          <div className="hidden min-h-0 w-full flex-1 md:flex">
            <AppRailNav>
              <AppRailNavItem
                selected={view === "search"}
                onClick={() => selectView("search")}
                label="Search"
                icon={<Search />}
              />
              <AppRailNavItem
                selected={view === "chat"}
                onClick={() => selectView("chat")}
                label="Chat"
                icon={<MessageSquare />}
              />
              <AppRailNavItem
                selected={view === "activity"}
                onClick={() => selectView("activity")}
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
                onClick={() => selectView("tasks")}
                label="Tasks"
                icon={<CheckSquare />}
              />
              <AppRailNavItem
                selected={view === "members"}
                onClick={() => selectView("members")}
                label="Members"
                icon={<Users />}
              />
              <AppRailNavItem
                selected={view === "computers"}
                onClick={() => selectView("computers")}
                label="Computers"
                icon={<Monitor />}
                attention={
                  <AppRailItemAttention>
                    <Monitor />
                  </AppRailItemAttention>
                }
              />
            </AppRailNav>
          </div>
          <AppRailFooter className="max-md:hidden">
            <NotificationCenter modal={false}>
              <NotificationCenterTrigger type="button" aria-label="Notification center" />
            </NotificationCenter>
            <AppRailNavItem
              selected={view === "settings"}
              onClick={() => selectView("settings")}
              label="Settings"
              icon={<Settings />}
            />
          </AppRailFooter>
          <div className="w-full md:hidden">
            <MobileNavDestinations value={view} onValueChange={selectView} />
          </div>
        </TooltipProvider>
      </AppRailRoot>
    </AppShellRailSlot>
  );
}
