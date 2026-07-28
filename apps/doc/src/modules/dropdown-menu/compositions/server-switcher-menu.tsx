import { ServerSwitcherMenu as LegacyServerSwitcherMenu } from "../../../../../../packages/ui/src/legacy/server-switcher-menu.tsx";

import { ServerSwitcherMenuComposition } from "./server-switcher-menu.composition.tsx";

export const SERVER_SWITCHER_MENU_COMPOSITION_PATH =
  "apps/doc/src/modules/dropdown-menu/compositions/server-switcher-menu.composition.tsx" as const;

export { ServerSwitcherMenuComposition };

const SERVER_SWITCHER_DEMO_SERVERS = [
  { id: "raft", name: "Raft", slug: "raft" },
  { id: "design", name: "Design Guild", slug: "design" },
  { id: "oss", name: "Open Source", slug: "oss" },
] as const;

const SERVER_SWITCHER_DEMO_UNREAD_COUNTS = {
  design: 4,
  oss: 12,
} as const;

/** Legacy ServerSwitcherMenu for source-comparison source pane. */
export function ServerSwitcherMenuSourcePreview({ className }: { className?: string }) {
  return (
    <div
      className={["flex h-full min-h-56 w-full items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-64 shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]">
        <LegacyServerSwitcherMenu
          servers={[...SERVER_SWITCHER_DEMO_SERVERS]}
          currentServerId="raft"
          serverUnreadCounts={SERVER_SWITCHER_DEMO_UNREAD_COUNTS}
          joinOptions={[{ slug: "community", label: "Join Community" }]}
          className="w-64"
          onSelectServer={() => {}}
          onJoinCommunity={() => {}}
          onSwitchOrCreate={() => {}}
        />
      </div>
    </div>
  );
}
