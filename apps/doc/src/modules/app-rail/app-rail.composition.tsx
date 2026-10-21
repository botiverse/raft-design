import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  AppShellRailSlot,
  AppRailFooter,
  AppRailItem,
  AppRailItemAttention,
  AppRailItemIcon,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@botiverse/raft-ui";
import {
  Activity,
  CheckSquare,
  MessageSquare,
  Monitor,
  Settings,
  Users,
  CircleHelp,
} from "lucide-react";

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

  return (
    <AppShellRailSlot>
      <AppRailRoot>
        <TooltipProvider delay={650}>
          <AppRailNav>
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
              attention={<AppRailItemAttention title="Unread activity" />}
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
              attention={<AppRailItemAttention title="A computer needs attention" />}
            />
          </AppRailNav>
          <AppRailFooter>
            <AppRailNavItem render={<button type="button" />} label="Help" icon={<CircleHelp />} />
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
