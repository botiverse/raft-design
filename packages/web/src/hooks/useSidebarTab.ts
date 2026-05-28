import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useServerStore } from "../store/serverStore";
import { readTabMemory } from "./useTabRouteMemory";

// The left navigation rail surfaces exactly four modes; the entire left
// column (rail button highlight + sidebar content + sidebar header text)
// derives from a SINGLE value.
//
// Source of truth: the URL **path**. No query parameter ever expresses rail
// mode — older `?sidebarTab=` and `?tab=` signals are normalized away by
// useRailLegacyRedirect on entry.
export type RailMode = "chat" | "members" | "computers" | "tasks" | "settings";

// Back-compat alias for callers that only care about the chat/members
// distinction inside the chat-or-members surface (e.g. existing tests).
export type SidebarTab = "chat" | "members";

function deriveRailModeFromPath(pathname: string, pathBase: string): RailMode {
  if (!pathBase) return "chat";
  if (pathname.startsWith(`${pathBase}/settings`)) return "settings";
  if (pathname.startsWith(`${pathBase}/release-notes`)) return "settings";
  if (pathname === `${pathBase}/tasks` || pathname.startsWith(`${pathBase}/tasks/`)) return "tasks";
  if (pathname.startsWith(`${pathBase}/computer/`)) return "computers";
  if (pathname.startsWith(`${pathBase}/machine/`)) return "computers"; // legacy
  if (pathname === `${pathBase}/computers` || pathname.startsWith(`${pathBase}/computers/`)) return "computers";
  if (pathname.startsWith(`${pathBase}/agent/`)) return "members";
  if (pathname.startsWith(`${pathBase}/human/`)) return "members";
  if (pathname === `${pathBase}/members` || pathname.startsWith(`${pathBase}/members/`)) return "members";
  return "chat";
}

export function useRailMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const serverSlug = useServerStore((s) => s.current?.slug ?? null);
  const pathBase = serverSlug ? `/s/${serverSlug}` : "";

  const railMode = useMemo<RailMode>(
    () => deriveRailModeFromPath(location.pathname, pathBase),
    [location.pathname, pathBase],
  );

  const selectRailMode = useCallback((mode: RailMode) => {
    if (!serverSlug) {
      navigate("/");
      return;
    }
    const base = `/s/${serverSlug}`;
    const remembered = readTabMemory(serverSlug, mode);
    const fallback = mode === "chat" ? base
      : mode === "members" ? `${base}/members`
      : mode === "computers" ? `${base}/computers`
      : mode === "tasks" ? `${base}/tasks`
      : `${base}/settings/account`;
    navigate(remembered ?? fallback);
  }, [serverSlug, navigate]);

  return { railMode, selectRailMode };
}

// Back-compat shim for callers that only need chat-vs-members. New code
// should use useRailMode directly.
export function useSidebarTab() {
  const { railMode, selectRailMode } = useRailMode();
  const activeTab: SidebarTab = railMode === "members" ? "members" : "chat";
  const selectSidebarTab = useCallback(
    (tab: SidebarTab) => selectRailMode(tab),
    [selectRailMode],
  );
  return { activeTab, selectSidebarTab };
}
