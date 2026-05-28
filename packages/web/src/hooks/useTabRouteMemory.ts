import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useServerStore } from "../store/serverStore";
import type { RailMode } from "./useSidebarTab";

// Determines which rail mode a given pathname belongs to. Returns null for
// routes that don't belong to any rail surface (login redirects, etc.) so
// we don't clobber the per-mode memory.
//
// pathBase is the server-scoped prefix (e.g. `/s/dev`). Pass `null` when no
// active server — the function falls through to null in that case.
export function classifyRouteForTab(pathname: string, pathBase: string | null): RailMode | null {
  if (!pathBase) return null;
  if (!pathname.startsWith(pathBase)) return null;
  const rest = pathname.slice(pathBase.length); // "" | "/foo/bar"
  if (rest === "" || rest === "/") return "chat";
  if (rest.startsWith("/channel/")) return "chat";
  if (rest.startsWith("/dm/")) return "chat";
  if (rest === "/threads" || rest.startsWith("/threads/")) return "chat";
  if (rest === "/tasks" || rest.startsWith("/tasks/")) return "tasks";
  if (rest === "/saved" || rest.startsWith("/saved/")) return "chat";
  if (rest === "/search" || rest.startsWith("/search/")) return "chat";
  if (rest.startsWith("/agent/")) return "members";
  if (rest.startsWith("/human/")) return "members";
  if (rest === "/members" || rest.startsWith("/members/")) return "members";
  if (rest.startsWith("/computer/")) return "computers";
  if (rest.startsWith("/machine/")) return "computers"; // legacy
  if (rest === "/computers" || rest.startsWith("/computers/")) return "computers";
  if (rest === "/settings" || rest.startsWith("/settings/")) return "settings";
  if (rest === "/release-notes" || rest.startsWith("/release-notes/")) return "settings";
  return null;
}

// Bumped to v2 when rail mode moved to path-only routing (members and
// computers split, /machine/<id> → /computer/<id>). Old v1 entries could
// have stored /machine/<id> under the "members" bucket, which would now
// route the user to Computers when they click Members — invalidate them.
const STORAGE_PREFIX = "slock:tabMemory:v2";
function memoryKey(serverSlug: string, mode: RailMode): string {
  return `${STORAGE_PREFIX}:${serverSlug}:${mode}`;
}

export function readTabMemory(serverSlug: string, mode: RailMode): string | null {
  try {
    const raw = localStorage.getItem(memoryKey(serverSlug, mode));
    return raw && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export function writeTabMemory(serverSlug: string, mode: RailMode, pathAndSearch: string): void {
  try {
    localStorage.setItem(memoryKey(serverSlug, mode), pathAndSearch);
  } catch {
    // localStorage may throw in private mode / quota exhaustion — best-effort.
  }
}

// Mount once at the top of the layout. Records the current path+search into
// localStorage under the per-server, per-tab slot whenever the route changes
// to a Chat- or Members-belonging URL. Settings and release-notes routes
// don't update memory so they don't clobber the last detail page.
export function useTabRouteMemory(): void {
  const location = useLocation();
  const serverSlug = useServerStore((s) => s.current?.slug ?? null);

  useEffect(() => {
    if (!serverSlug) return;
    const pathBase = `/s/${serverSlug}`;
    const tab = classifyRouteForTab(location.pathname, pathBase);
    if (!tab) return;
    // Path is the rail-mode source of truth, so we persist the path verbatim.
    // Right-panel keys (?profile=, ?thread=, ?msg=, ?agentTab=, ?chatTab=)
    // belong to other surfaces; preserving them lets the user return to the
    // exact view they left, including any open profile/thread.
    const search = location.search ?? "";
    const pathAndSearch = `${location.pathname}${search}`;
    writeTabMemory(serverSlug, tab, pathAndSearch);
  }, [location.pathname, location.search, serverSlug]);
}
