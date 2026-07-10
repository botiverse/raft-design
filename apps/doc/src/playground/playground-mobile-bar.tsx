import { CheckSquare, Home, Settings, Users, type LucideIcon } from "lucide-react";
import {
  AppMobileBarIcon,
  AppMobileBarItem,
  AppMobileBarLabel,
  AppMobileBarList,
  AppShellMobileBar,
} from "raft-ui/wip";

// Source mobile bar is a level-1 tab bar: Home / Tasks / Members / Settings.
// Search is a Home drill-in and Computers lives under Settings, so neither is a
// top-level tab. Home maps to the shared "chat" rail value.
const MOBILE_TABS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "chat", label: "Home", Icon: Home },
  { value: "tasks", label: "Tasks", Icon: CheckSquare },
  { value: "members", label: "Members", Icon: Users },
  { value: "settings", label: "Settings", Icon: Settings },
];

export function PlaygroundMobileBar({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <AppShellMobileBar
      // md:block keeps the bar visible when the toolbar forces mobile
      // presentation on a wide viewport (source relies on the real md breakpoint).
      className="md:block"
      // Cap the safe-area inset at the iPhone home-indicator height, as in source.
      style={{ paddingBottom: "min(env(safe-area-inset-bottom, 0px), 34px)" }}
    >
      <AppMobileBarList>
        {MOBILE_TABS.map(({ value: tabValue, label, Icon }) => (
          <AppMobileBarItem
            key={tabValue}
            selected={value === tabValue}
            onClick={() => onValueChange(tabValue)}
          >
            <AppMobileBarIcon render={<Icon size={18} />} />
            <AppMobileBarLabel>{label}</AppMobileBarLabel>
          </AppMobileBarItem>
        ))}
      </AppMobileBarList>
    </AppShellMobileBar>
  );
}
