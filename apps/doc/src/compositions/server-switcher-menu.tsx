import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuSeparator,
  DropdownMenuSurface,
  DropdownMenuTrigger,
  useTheme,
} from "@slock/ui";
import { Check } from "lucide-react";
import { IconPlusOutline18, IconUsersPlusOutline18 } from "nucleo-ui-outline-18";
import { useId } from "react";

import { ServerSwitcherMenu as LegacyServerSwitcherMenu } from "../../../../packages/ui/src/legacy/server-switcher-menu.tsx";

export const SERVER_SWITCHER_MENU_COMPOSITION_PATH =
  "apps/doc/src/compositions/server-switcher-menu.tsx" as const;

export const SERVER_SWITCHER_DEMO_SERVERS = [
  { id: "slock", name: "Slock", slug: "slock" },
  { id: "design", name: "Design Guild", slug: "design" },
  { id: "oss", name: "Open Source", slug: "oss" },
] as const;

export const SERVER_SWITCHER_DEMO_UNREAD_COUNTS = {
  design: 4,
  oss: 12,
} as const;

export const SERVER_SWITCHER_MENU_CONTENT_SNIPPET = `    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DropdownMenuItem data-selected>
        <span className="flex size-3.5 shrink-0 items-center justify-center">
          <Check size={14} />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Slock</div>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem className="font-medium">
        <span className="flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
          <Check size={14} className="opacity-0" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Design Guild</div>
        </div>
        <DropdownMenuItemCount>4</DropdownMenuItemCount>
      </DropdownMenuItem>
      <DropdownMenuItem className="font-medium">
        <span className="flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
          <Check size={14} className="opacity-0" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Open Source</div>
        </div>
        <DropdownMenuItemCount>12</DropdownMenuItemCount>
      </DropdownMenuItem>
    </div>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <IconUsersPlusOutline18 />
      <span className="flex h-6 min-w-0 flex-1 items-center text-left">Join Community</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <IconPlusOutline18 />
      <span className="flex h-6 min-w-0 flex-1 items-center text-left">Switch or Create Server</span>
    </DropdownMenuItem>`;

function ServerSwitcherCheckSlot({ visible }: { visible: boolean }) {
  return (
    <span className="flex size-3.5 shrink-0 items-center justify-center">
      <Check
        size={14}
        className={visible ? "shrink-0" : "shrink-0 opacity-0"}
        aria-hidden={!visible}
      />
    </span>
  );
}

export function ServerSwitcherMenuContent() {
  const theme = useTheme();

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DropdownMenuItem data-selected className={theme === "brutal" ? "font-bold" : undefined}>
          <ServerSwitcherCheckSlot visible />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Slock</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="font-medium">
          <ServerSwitcherCheckSlot visible={false} />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Design Guild</div>
          </div>
          <DropdownMenuItemCount>4</DropdownMenuItemCount>
        </DropdownMenuItem>
        <DropdownMenuItem className="font-medium">
          <ServerSwitcherCheckSlot visible={false} />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Open Source</div>
          </div>
          <DropdownMenuItemCount>12</DropdownMenuItemCount>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <IconUsersPlusOutline18 />
        <span className="min-w-0 flex-1 text-left">Join Community</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <IconPlusOutline18 />
        <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
      </DropdownMenuItem>
    </>
  );
}

/** DropdownMenu composition for source-comparison current panes (all themes). */
export function ServerSwitcherMenuComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    <div
      className={["flex h-full min-h-56 w-full items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <DropdownMenuSurface className="flex w-64 flex-col">
          <ServerSwitcherMenuContent />
        </DropdownMenuSurface>
      </DropdownMenu>
    </div>
  );
}

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
          currentServerId="slock"
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
