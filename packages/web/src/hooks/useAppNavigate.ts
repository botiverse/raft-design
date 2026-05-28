import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useServerStore } from "../store/serverStore";

export type NavigationKindForDepth = "PUSH" | "POP" | "REPLACE";

// `location.key !== "default"` was the previous heuristic for "is there
// browser history to pop?" and it's unreliable: the very first
// navigate({replace:true}) after a cold-start fallback flips the key away
// from "default" while the browser history stack is still empty, so the
// next back press would silently do nothing.
export function nextNavigationDepth(
  depth: number,
  navigationType: NavigationKindForDepth,
): number {
  if (navigationType === "PUSH") return depth + 1;
  if (navigationType === "POP") return Math.max(0, depth - 1);
  return depth;
}

export type MobileBackAction =
  | { kind: "back" }
  | { kind: "fallback"; path: string };

export function resolveMobileBackAction(
  depth: number,
  fallbackPath: string,
): MobileBackAction {
  if (depth > 0) return { kind: "back" };
  return { kind: "fallback", path: fallbackPath };
}

let inAppPushDepth = 0;

/** Test-only: reset the module-level depth counter. */
export function __resetInAppPushDepthForTesting() {
  inAppPushDepth = 0;
}

/**
 * Mount once inside <BrowserRouter> to maintain `inAppPushDepth`. Renders
 * nothing.
 */
export function NavigationDepthTracker() {
  const navigationType = useNavigationType();
  const location = useLocation();
  const prevKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevKeyRef.current === null) {
      prevKeyRef.current = location.key;
      return;
    }
    if (location.key === prevKeyRef.current) return;
    prevKeyRef.current = location.key;
    inAppPushDepth = nextNavigationDepth(
      inAppPushDepth,
      navigationType as NavigationKindForDepth,
    );
  }, [location.key, navigationType]);
  return null;
}

/**
 * Back-button navigation shared by mobile detail-panel back buttons and
 * anywhere else that needs a semantic "go back" action.
 *
 * Two-step rule (per @stdrc 2026-05-01 `#proj-uiux:c8711d2a`
 * msg=3e59ad5d, superseding the earlier 3-step contract from
 * msg=548eda5f / msg=49bf9068):
 *   1. Browser history first — if there's any in-app push to pop
 *      (`inAppPushDepth > 0`), call `navigate(-1)`. Keeps back consistent
 *      with OS/browser back gestures and the history stack the user
 *      built up in this tab.
 *   2. Explicit `fallback` — on cold-start (PWA launch, shared link,
 *      push-notification tap, bookmark) history is empty, so either
 *      navigate to the caller's semantic parent (string) or run the
 *      caller's custom close handler (function — used by overlay panels
 *      to close themselves rather than skip past their underlying
 *      surface).
 *
 * Why a callback variant exists: profile detail panels (Agent/Human) can
 * be rendered two ways — (a) standalone via `/agent/<id>` / `/human/<id>`
 * routes where the semantic parent is `/members`, or (b) as an OVERLAY on
 * top of an underlying surface via `?profile=<type>:<id>` driven by
 * `useProfileStore`. In case (b) the user's mental model of "back" is
 * "close this overlay and go back to the channel I was looking at", NOT
 * "jump to /members". Cold-starting a profile permalink (`/channel/X?profile=...`,
 * #proj-mobile:b1c622e5 stdrc 2026-05-08) hits the depth=0 branch with
 * no underlying push to pop, so the panel must surface its own close
 * action as the fallback. Passing `closeProfile` (the zustand setter) lets
 * the store→URL sync replace `?profile=` with the underlying pathname
 * cleanly, so the user lands on the channel rather than on `/members`.
 *
 * The per-tab view-stack (`useMobileNav.goBack`) used to sit between 1 and 2
 * as a reconstructed "you probably came from here" fallback. It was fragile
 * in cold-start + overlay (`?thread=`) scenarios: the hydrate+push effect
 * would push the post-back URL onto a stack that still contained the
 * pre-back URL, so the next back click popped INTO the URL we had just
 * left — notably the thread permalink we were trying to close. Repro:
 * msg=768680bf. CI log trace: msg=68fc6426. Since every caller already
 * passes a semantic `fallback` (ThreadPanel → parent channel, ChatPanel
 * → `/s/<slug>`, AgentDetail → `/members` or closeProfile, etc.), the
 * view-stack adds no correctness and only adds race conditions. The
 * view-stack still drives tab-switch memory and popToRoot in
 * `useMobileNav.selectTab`.
 */
export function useMobileBack(fallback: string | (() => void)) {
  const navigate = useNavigate();
  return useCallback(() => {
    if (inAppPushDepth > 0) {
      navigate(-1);
      return;
    }
    if (typeof fallback === "function") {
      fallback();
      return;
    }
    navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}

// Legacy export kept for back-compat: still used by useRailLegacyRedirect to
// strip the ?sidebarTab= param off old URLs and by a few transitional tests.
// New code should not read or write ?sidebarTab= — rail mode lives in the
// path now (`/members`, `/computers`, `/computer/<id>`, etc.).
export const SIDEBAR_TAB_QUERY_PARAM = "sidebarTab";

export const CHAT_TAB_QUERY_PARAM = "chatTab";
export type ChatTabQueryValue = "chat" | "tasks" | "files";

interface NavOptions {
  /** Chat panel state appended as ?chatTab= for shareable URLs */
  chatTab?: ChatTabQueryValue;
}

export type MessagePermalinkRouteKind = "channel" | "dm";

interface MessagePermalinkOptions {
  routeKind?: MessagePermalinkRouteKind;
  threadParentMessageId?: string | null;
}

function buildMessagePath(
  base: string,
  channelId: string,
  messageId: string,
  { routeKind = "channel", threadParentMessageId = null }: MessagePermalinkOptions = {}
): string {
  const params = new URLSearchParams({ msg: messageId });
  if (threadParentMessageId) {
    params.set("thread", `${channelId}:${threadParentMessageId}`);
  }
  return `${base}/${routeKind}/${channelId}?${params.toString()}`;
}

export function useAppNavigate() {
  const navigate = useNavigate();
  const slug = useServerStore((s) => s.current?.slug);
  const base = slug ? `/s/${slug}` : "";
  const withQuery = (path: string, opts?: NavOptions) => {
    const params = new URLSearchParams();
    if (opts?.chatTab && opts.chatTab !== "chat") params.set(CHAT_TAB_QUERY_PARAM, opts.chatTab);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  };
  return {
    toChannel: (channelId: string, opts?: NavOptions) => navigate(withQuery(`${base}/channel/${channelId}`, opts)),
    toDm: (dmChannelId: string, opts?: NavOptions) => navigate(withQuery(`${base}/dm/${dmChannelId}`, opts)),
    toMessage: (channelId: string, messageId: string) => navigate(buildMessagePath(base, channelId, messageId)),
    toDmMessage: (dmChannelId: string, messageId: string) => navigate(buildMessagePath(base, dmChannelId, messageId, { routeKind: "dm" })),
    toThreadMessage: (
      channelId: string,
      parentMessageId: string,
      messageId: string,
      routeKind: MessagePermalinkRouteKind = "channel"
    ) => navigate(buildMessagePath(base, channelId, messageId, { routeKind, threadParentMessageId: parentMessageId })),
    toAgent: (agentId: string) => navigate(`${base}/agent/${agentId}`),
    toComputer: (machineId: string) => navigate(`${base}/computer/${machineId}`),
    /** @deprecated use toComputer */
    toMachine: (machineId: string) => navigate(`${base}/computer/${machineId}`),
    toHuman: (userId: string) => navigate(`${base}/human/${userId}`),
    toMembers: () => navigate(`${base}/members`),
    toComputers: () => navigate(`${base}/computers`),
    toSearch: (query?: string) => navigate(query ? `${base}/search?q=${encodeURIComponent(query)}` : `${base}/search`),
    toSettings: (tab?: string) => navigate(tab ? `${base}/settings/${tab}` : `${base}/settings`),
    toReleaseNotes: () => navigate(`${base}/release-notes`),
    toThreadsInbox: () => navigate(`${base}/inbox`),
    toTasks: () => navigate(`${base}/tasks`),
    toSaved: () => navigate(`${base}/saved`),
  };
}

/** Build a shareable permalink URL for a message. */
export function buildMessagePermalink(
  serverSlug: string,
  channelId: string,
  messageId: string,
  options: MessagePermalinkOptions = {}
): string {
  return `${window.location.origin}${buildMessagePath(`/s/${serverSlug}`, channelId, messageId, options)}`;
}
