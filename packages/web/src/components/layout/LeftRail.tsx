import { useEffect, useMemo, useState } from "react";
import { CheckSquare, MessageSquare, Monitor, Settings, Users } from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { useMessageStore } from "../../store/messageStore";
import { useInboxStore } from "../../store/inboxStore";
import api from "../../api/client";
import { useRailMode } from "../../hooks/useSidebarTab";
import AttentionDot from "../ui/AttentionDot";
import ServerSwitcherMenu from "../ui/ServerSwitcherMenu";
import NotificationTrigger from "./NotificationTrigger";

// Narrow vertical rail to the left of the Sidebar. Hosts, top to bottom:
// 1. Server avatar / switcher button (clicking opens a flyout to switch servers)
// 2. Rail mode buttons (Chat / Members / Computers / Settings) — exactly one
//    is highlighted at a time, derived from the URL via useRailMode().
//
// Rail mode is path-based: /channel/, /dm/, /threads, /tasks, /saved, /search
// are chat; /agent/, /human/, /members are members; /computer/, /computers
// are computers; /settings/, /release-notes are settings. Clicking a rail
// button restores that mode's last-visited path from localStorage memory,
// or falls back to the mode's canonical landing.
//
// Hidden on mobile root inline view: mobile already has its own bottom tab bar
// and the sidebar is the whole main area, so a second vertical rail there would
// just steal width.
export function LeftRail({ hidden }: { hidden?: boolean }) {
  const server = useServerStore((s) => s.current);
  const servers = useServerStore((s) => s.servers);
  const unreadCounts = useMessageStore((s) => s.unreadCounts);
  const inboxTotalUnreadCount = useInboxStore((s) => s.totalUnreadCount);
  const { railMode, selectRailMode } = useRailMode();

  const [showServerMenu, setShowServerMenu] = useState(false);
  const [serverUnreadCounts, setServerUnreadCounts] = useState<Record<string, number>>({});

  const _pathBase = useMemo(() => (server ? `/s/${server.slug}` : ""), [server]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/servers/unread-summary");
        if (cancelled) return;
        const next: Record<string, number> = {};
        if (Array.isArray(data)) {
          for (const row of data) {
            if (!row || typeof row !== "object") continue;
            const entry = row as { serverId?: unknown; unreadCount?: unknown };
            const serverId = typeof entry.serverId === "string" ? entry.serverId : null;
            const unreadCount = Number(entry.unreadCount);
            if (!serverId || !Number.isFinite(unreadCount)) continue;
            next[serverId] = unreadCount;
          }
        }
        setServerUnreadCounts(next);
      } catch {
        // best-effort badge; ignore failures
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [unreadCounts]);

  const hasOtherServerUnread = useMemo(
    () => servers.some((s) => s.id !== server?.id && (serverUnreadCounts[s.id] || 0) > 0),
    [servers, server?.id, serverUnreadCounts],
  );
  const hasChatUnread = useMemo(
    () => inboxTotalUnreadCount > 0 || Object.values(unreadCounts).some((count) => count > 0),
    [inboxTotalUnreadCount, unreadCounts],
  );

  // Outside-click + ESC dismissal lives inside <ServerSwitcherMenu>; the
  // trigger button below uses `onMouseDown={(e) => e.stopPropagation()}` so
  // toggling the menu doesn't re-fire the document mousedown listener and
  // close the just-opened menu.

  const serverInitial = (server?.name || "S").trim().charAt(0).toUpperCase() || "S";

  if (hidden) return null;

  return (
    <div className="relative hidden md:flex h-full w-[64px] [@media(max-height:600px)]:w-[50px] shrink-0 flex-col items-center border-r-2 border-black bg-brutal-yellow select-none">
      {/* Server switcher (top) */}
      <div className="relative flex h-panel-header w-full items-center justify-center border-b-2 border-black">
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setShowServerMenu((s) => !s)}
          title={server?.name || "Slock"}
          aria-label={`Switch server (current: ${server?.name || "Slock"})`}
          // Server-name button matches RailTabButton geometry: h-10 (40)
          // on tall viewports for visual weight, h-9 (36) on short to fit
          // the compact 48px h-panel-header. stdrc 2026-05-02
          // #proj-uiux:8e7df837 task #98 followup 54fbf722: "server name
          // 按钮怎么没修？" — keep server-initial in step with the rail
          // tabs, not pinned at size-icon-header (36 across all viewports).
          className="relative inline-flex size-10 [@media(max-height:600px)]:h-9 [@media(max-height:600px)]:w-9 items-center justify-center border-2 border-black bg-black font-display text-base font-bold text-brutal-yellow shadow-brutal-sm hover:shadow-brutal transition-all duration-100"
        >
          {hasOtherServerUnread && (
            <AttentionDot
              size="lg"
              className="absolute -right-1 -top-1"
              title="Other servers have unread messages"
            />
          )}
          {serverInitial}
        </button>

        <ServerSwitcherMenu
          open={showServerMenu}
          onClose={() => setShowServerMenu(false)}
          serverUnreadCounts={serverUnreadCounts}
          testId="desktop-server-switcher-menu"
          className="absolute left-full top-1 ml-2 w-64 max-h-[calc(100dvh-16px)]"
        />
      </div>

      {/* Rail buttons (middle). Mutually-exclusive — at most one is
          highlighted at a time, and the highlighted one always matches
          the current URL via useRailMode(). */}
      <div className="flex flex-1 flex-col items-center gap-1.5 py-2 w-full">
        <RailTabButton
          icon={<MessageSquare size={18} />}
          label="Chat"
          active={railMode === "chat"}
          showDot={hasChatUnread}
          dotInactiveOnly
          dotTitle="Unread messages"
          onClick={() => selectRailMode("chat")}
          testId="left-rail-tab-chat"
        />
        <RailTabButton
          icon={<CheckSquare size={18} />}
          label="Tasks"
          active={railMode === "tasks"}
          onClick={() => selectRailMode("tasks")}
          testId="left-rail-tab-tasks"
        />
        <RailTabButton
          icon={<Users size={18} />}
          label="Members"
          active={railMode === "members"}
          onClick={() => selectRailMode("members")}
          testId="left-rail-tab-members"
        />
        <RailTabButton
          icon={<Monitor size={18} />}
          label="Computers"
          active={railMode === "computers"}
          onClick={() => selectRailMode("computers")}
          testId="left-rail-tab-computers"
        />
      </div>

      {/* Notification Center trigger — sits just above Settings, only when there
          are active notifications to surface. Originating direction:
          stdrc 2026-05-02 #proj-uiux:f87f6eb9 (task #94 "the top warning bar
          covers itself; collect everything into a popup hung off Settings").
          The popup floats to the right of the rail. */}
      <div className="flex w-full items-center justify-center pb-1">
        <NotificationTrigger flavor="rail-bottom" />
      </div>

      {/* Settings (bottom) — same RailTabButton style as Chat / Members. */}
      <div className="flex h-panel-header w-full items-center justify-center">
        <RailTabButton
          icon={<Settings size={18} />}
          label="Settings"
          active={railMode === "settings"}
          onClick={() => selectRailMode("settings")}
          testId="left-rail-settings"
        />
      </div>
    </div>
  );
}

function RailTabButton({
  icon,
  label,
  active,
  showDot,
  dotInactiveOnly,
  dotTitle,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  showDot?: boolean;
  dotInactiveOnly?: boolean;
  dotTitle?: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      data-testid={testId}
      // RailTabButton size — h-10 (40) on tall viewports for visual weight
      // matching the original brutal aesthetic; shrinks to h-9 (36) on
      // short viewports (max-h:600) to fit the compact 48px h-panel-header
      // and stay aligned with size-icon-header (36) used by main panel
      // header icons. stdrc 2026-05-02 #proj-uiux:8e7df837 task #98:
      // "正常桌面上还是原来的大小比较合适，只在缩窄 rail 和 header 的时候
      // 应该缩按钮".
      className={`relative inline-flex size-10 [@media(max-height:600px)]:h-9 [@media(max-height:600px)]:w-9 items-center justify-center border-2 transition-colors ${
        active
          ? "border-black bg-white shadow-brutal-sm"
          : "border-transparent hover:border-black hover:bg-white"
      }`}
    >
      <span className="relative inline-flex items-center justify-center">
        {icon}
        {showDot && (!dotInactiveOnly || !active) && (
          <AttentionDot
            size="lg"
            className="pointer-events-none absolute -right-1 -top-1"
            title={dotTitle}
          />
        )}
      </span>
    </button>
  );
}

export default LeftRail;
