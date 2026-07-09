import { AppShellMobileBar } from "raft-ui/wip";
import { CheckSquare, Home, Settings, Users, type LucideIcon } from "lucide-react";

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
      <div className="flex">
        {MOBILE_TABS.map(({ value: tabValue, label, Icon }, index) => (
          <button
            key={tabValue}
            type="button"
            aria-pressed={value === tabValue}
            onClick={() => onValueChange(tabValue)}
            className={[
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2",
              "text-[10px] font-bold tracking-wider transition-colors",
              "[@media(max-height:600px)]:min-h-9",
              index < MOBILE_TABS.length - 1 ? "border-r-2 border-black" : "",
              value === tabValue ? "bg-soft-signal" : "bg-white active:bg-black/5",
            ].join(" ")}
          >
            <Icon size={18} className="[@media(max-height:600px)]:hidden" />
            {label}
          </button>
        ))}
      </div>
    </AppShellMobileBar>
  );
}
