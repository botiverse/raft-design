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
  AppRailServerButton,
  AppShellRail,
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

// Tooltip-wrapped desktop rail item. Callers own the icon, an optional attention
// mask, and an optional handler; selection state comes from the enclosing AppRailRoot.
export function AppRailNavItem({
  value,
  label,
  icon,
  attention,
  onClick,
}: {
  value: string;
  label: string;
  icon: ReactNode;
  attention?: ReactNode;
  onClick?: ComponentProps<typeof AppRailItem>["onClick"];
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<AppRailItem value={value} onClick={onClick} />}>
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
// Playground so the two never drift; selection is driven by the enclosing AppRailRoot.
export function AppRailMobileNav() {
  return (
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
  );
}

export function AppRailComposition() {
  const [view, setView] = useState("chat");
  const [announcement, setAnnouncement] = useState({ message: "", sequence: 0 });

  function announce(message: string) {
    setAnnouncement((current) => ({ message, sequence: current.sequence + 1 }));
  }

  return (
    <AppShellRail className="max-md:order-last max-md:flex max-md:h-auto max-md:w-full">
      <AppRailRoot
        value={view}
        onValueChange={(next) => {
          setView(next);
          announce(`Opened ${next}`);
        }}
      >
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
              <AppRailNavItem value="search" label="Search" icon={<Search />} />
              <AppRailNavItem value="chat" label="Chat" icon={<MessageSquare />} />
              <AppRailNavItem
                value="activity"
                label="Activity"
                icon={<Activity />}
                attention={
                  <AppRailItemAttention>
                    <Activity />
                  </AppRailItemAttention>
                }
              />
              <AppRailNavItem value="tasks" label="Tasks" icon={<CheckSquare />} />
              <AppRailNavItem value="members" label="Members" icon={<Users />} />
              <AppRailNavItem
                value="computers"
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
            <AppRailNavItem value="settings" label="Settings" icon={<Settings />} />
          </AppRailFooter>
          <div className="w-full md:hidden">
            <AppRailMobileNav />
          </div>
        </TooltipProvider>
      </AppRailRoot>
    </AppShellRail>
  );
}
