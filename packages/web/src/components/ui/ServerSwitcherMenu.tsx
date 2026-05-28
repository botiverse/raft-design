import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { useServerStore, type CommunityServerSlug } from "../../store/serverStore";
import { useJoinCommunityFlow } from "../../hooks/useJoinCommunityFlow";
import {
  CHINESE_COMMUNITY_SERVER_SLUG,
  DEFAULT_COMMUNITY_SERVER_SLUG,
  browserPrefersChineseCommunity,
  hasJoinedCommunity,
} from "../../utils/communityServers";
import ContextMenuDivider from "./ContextMenuDivider";

/**
 * Shared dropdown content for the "switch server" surfaces. The same menu
 * — a list of joined servers + "Join community" + "Switch or create
 * server" — is reachable from two callsites:
 *
 *  - **Desktop LeftRail** — flyout anchored to the top-left server-initial
 *    button. Positioned `absolute left-full top-1 ml-2`, fixed width.
 *  - **Mobile Sidebar navbar pill** — drop-down anchored under the
 *    ServerName pill on the Chat home tab. Positioned
 *    `absolute top-full left-2 right-2 mt-1`, fluid width.
 *
 * Both used to inline 70+ lines of identical JSX (server list + the two
 * footer buttons) and identical state plumbing (outside-click + ESC). They
 * drifted (LeftRail rendered the current server's own unread badge, mobile
 * Sidebar didn't) — this primitive collapses the duplication and pins the
 * canonical behavior.
 *
 * Trigger button + positioning live at the callsite. The primitive owns:
 *  - The shared card container (`card-brutal z-50 flex flex-col overflow-hidden`)
 *  - The server list with current-server check + per-row unread badge
 *  - Join community actions (global plus Chinese community for Chinese-language browsers)
 *  - The "Switch or create server" button
 *  - Outside-click + ESC dismiss
 *
 * Canonical behavior:
 *  - **Current server row hides its own unread count.** A "this server has
 *    N unread" badge inside this server's own switcher menu is redundant —
 *    you're already here. stdrc decision C 2026-05-14
 *    `#proj-uiux:24e533e3` task #234.
 *  - Selecting another server navigates to `/s/${slug}`; ServerResolver
 *    flips `current` once the route lands. The store is not updated
 *    directly, the URL is the source of truth.
 *
 * Trigger contract: callsite's trigger button must `e.stopPropagation()` on
 * `onMouseDown` so the document mousedown listener inside this primitive
 * doesn't fire on the same tap that toggles `open` and immediately close
 * the just-opened menu.
 */
export interface ServerSwitcherMenuProps {
  open: boolean;
  onClose: () => void;
  /** Positioning + sizing classes added to the outer card. */
  className?: string;
  /** Server unread counts keyed by server id. Fetched at the callsite. */
  serverUnreadCounts: Record<string, number>;
  /** Test id on the outer card. Defaults to `server-switcher-menu`. */
  testId?: string;
}

export default function ServerSwitcherMenu({
  open,
  onClose,
  className,
  serverUnreadCounts,
  testId = "server-switcher-menu",
}: ServerSwitcherMenuProps) {
  const navigate = useNavigate();
  const server = useServerStore((s) => s.current);
  const servers = useServerStore((s) => s.servers);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const communityJoinFlow = useJoinCommunityFlow({
    onJoined: () => {
      onClose();
    },
    onError: (_error, _slug, message) => {
      onClose();
      // Surfacing via alert matches the other low-frequency
      // sidebar failure modes until we have a shared toast system.
      // eslint-disable-next-line no-alert
      alert(message);
    },
  });

  // Callsites pass `onClose` as an inline arrow, which means a fresh
  // function ref on every parent render. If we depended on `onClose`
  // directly the dismiss effect would detach+reattach the document
  // listeners on every parent render. Park the latest `onClose` in a
  // ref and depend only on `open`. Bugen nit 2 review of PR #1786.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onCloseRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  const joinOptions: Array<{ slug: CommunityServerSlug; label: string }> = [];
  if (browserPrefersChineseCommunity() && !hasJoinedCommunity(servers, CHINESE_COMMUNITY_SERVER_SLUG)) {
    joinOptions.push({ slug: CHINESE_COMMUNITY_SERVER_SLUG, label: "Join Chinese Community" });
  }
  if (!hasJoinedCommunity(servers, DEFAULT_COMMUNITY_SERVER_SLUG)) {
    joinOptions.push({ slug: DEFAULT_COMMUNITY_SERVER_SLUG, label: "Join Community" });
  }

  const handleJoinCommunity = async (slug: CommunityServerSlug) => {
    await communityJoinFlow.joinCommunity(slug);
  };

  return (
    <div
      ref={menuRef}
      data-testid={testId}
      className={`card-brutal z-50 flex flex-col overflow-hidden ${className ?? ""}`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {servers.map((s) => {
          const isCurrent = s.id === server?.id;
          const unread = serverUnreadCounts[s.id] || 0;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (!isCurrent) {
                  // Let the URL be the source of truth; ServerResolver
                  // will switch the current server after the route changes.
                  navigate(`/s/${s.slug}`);
                }
                onClose();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1 text-sm font-medium text-black hover:bg-brutal-yellow transition-colors ${
                isCurrent ? "font-bold" : ""
              }`}
            >
              <Check size={14} className={isCurrent ? "opacity-100" : "opacity-0"} />
              <div className="text-left min-w-0 flex-1">
                <div className="truncate">{s.name}</div>
                <div className="text-xs text-black/40 font-mono truncate">/{s.slug}</div>
              </div>
              {/* Current server row hides its own unread count — redundant
                  inside its own switcher menu. stdrc decision C 2026-05-14
                  `#proj-uiux:24e533e3` task #234. */}
              {!isCurrent && unread > 0 && (
                <span className="ml-auto shrink-0 rounded bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white border border-black">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <ContextMenuDivider />

      {/* Community join actions sit ABOVE "Switch or create server" — the
          ordering mirrors mobile Sidebar in PR #1234 (task #136). Each
          action is hidden once the user has joined that specific community. */}
      {joinOptions.map((option) => (
        <button
          key={option.slug}
          onClick={() => void handleJoinCommunity(option.slug)}
          className="flex w-full items-center justify-start gap-2 px-3 py-2 [@media(max-height:600px)]:py-1 text-left text-sm font-bold text-black hover:bg-brutal-pink transition-colors"
        >
          <Plus size={14} />
          <span className="min-w-0 flex-1 text-left">{option.label}</span>
        </button>
      ))}

      {communityJoinFlow.agreementDialog}

      <button
        onClick={() => {
          onClose();
          localStorage.removeItem("slock_last_server_slug");
          navigate("/");
        }}
        className="flex w-full items-center justify-start gap-2 px-3 py-2 [@media(max-height:600px)]:py-1 text-left text-sm font-bold text-black hover:bg-brutal-pink transition-colors"
      >
        <Plus size={14} />
        <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
      </button>
    </div>
  );
}
