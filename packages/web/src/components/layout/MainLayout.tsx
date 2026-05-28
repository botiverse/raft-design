import { useState, useEffect, useLayoutEffect, useCallback, useRef, Suspense, lazy } from "react";
import { useResizablePanel } from "../../hooks/useResizablePanel";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { useChannelStore } from "../../store/channelStore";
import { useAgentStore } from "../../store/agentStore";
import { useMessageStore } from "../../store/messageStore";
import { useMachineStore } from "../../store/machineStore";
import { useServerStore } from "../../store/serverStore";
import { useUIStore } from "../../store/uiStore";
import { useTaskStore } from "../../store/taskStore";
import {
  getSocket,
  connectSocket,
  reconnectSocket,
  ensureSocketConnected,
  isSocketConnected,
} from "../../api/socket";
import Sidebar from "./Sidebar";
import { LeftRail } from "./LeftRail";
import { useTabRouteMemory } from "../../hooks/useTabRouteMemory";
import { useRailLegacyRedirect } from "../../hooks/useRailLegacyRedirect";
import { useMobileNav } from "../../hooks/useMobileNav";
import ChatPanel from "../message/ChatPanel";
import MobileComputersPanel from "../machine/MobileComputersPanel";
import ThreadPanel from "../message/ThreadPanel";
import { useProfileStore } from "../../store/profileStore";
import { useThreadStore } from "../../store/threadStore";
import { useInboxStore } from "../../store/inboxStore";
import { useSavedStore } from "../../store/savedStore";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useAuthStore } from "../../store/authStore";
import { useLegacyTaskPanelStore } from "../../store/legacyTaskPanelStore";
import { getLiveSessionRecoveryPlan } from "../../utils/browserRecoveryPolicy";
import { handleMachineStatusRecoveryEvent } from "../../utils/machineStatusRecovery";
import { CheckSquare, GitBranch, Home, Monitor, Settings, Users } from "lucide-react";
import api from "../../api/client";
import type { HumanProfile } from "../member/HumanDetailPanel";
import { resolveHumanProfile } from "../member/resolveHumanProfile";
import { SIDEBAR_TAB_QUERY_PARAM, useMobileBack } from "../../hooks/useAppNavigate";
import PanelHeader from "../ui/PanelHeader";
import { ExperimentalBadge } from "../ui/ExperimentalBadge";
import LiveAgentActivityBar from "./LiveAgentActivityBar";
import { useLiveAgentActivityStore } from "../../store/liveAgentActivityStore";
import Modal from "../Modal";

const THEME_CHROME_YELLOW = "#FFD440";
const THEME_CHROME_WHITE = "#FFFFFF";

// Lazy-loaded route panels (code splitting)
const AgentDetailPanel = lazy(() => import("../agent/AgentDetailPanel"));
const MachineDetailPanel = lazy(() => import("../machine/MachineDetailPanel"));
const HumanDetailPanel = lazy(() => import("../member/HumanDetailPanel"));
const SettingsPanel = lazy(() => import("../settings/SettingsPanel"));
const MemberGraphSection = lazy(() => import("../settings/MemberGraphSection"));
const ReleaseNotesPanel = lazy(() => import("../settings/ReleaseNotesPanel"));
const ThreadsInbox = lazy(() => import("../thread/ThreadsInbox"));
const TasksPanel = lazy(() => import("../task/TasksPanel"));
const SavedPanel = lazy(() => import("../saved/SavedPanel"));
const ProfilePanel = lazy(() => import("../profile/ProfilePanel"));
const LegacyTaskPanel = lazy(() => import("../task/LegacyTaskPanel"));

/** Returns true when the mobile bottom tab bar should be visible on the
 *  current route. Used by both the bar itself and its in-flow spacer so that
 *  detail views (which return null from MobileTabBar) don't leave a stray
 *  empty strip below the page content.
 *
 *  iOS NavigationView model (per @stdrc 2026-04-30 #proj-uiux:c8711d2a):
 *  the tab bar lives at the root of each tab's stack only. When the user
 *  pushes to a detail (channel / dm / agent / human / computer / settings
 *  detail / search) the new view covers the full screen including the tab
 *  bar — there is no concept of "switch tabs from inside a detail". To
 *  switch tabs the user pops back to the tab home first via the back button.
 */
function useMobileTabBarVisible(): boolean {
  const location = useLocation();
  const serverSlug = useServerStore((s) => s.current?.slug);
  const threadOpen = useThreadStore((s) => !!s.openParentMessageId);

  if (!serverSlug) return false;

  const pathBase = `/s/${serverSlug}`;
  const path = location.pathname;

  // Hide on search and thread overlay (always full-screen).
  if (path.endsWith("/search") || threadOpen) return false;

  // Hide on detail routes: channel, DM, agent, human, computer, settings sub-pages.
  // /computers and /release-notes are level-2 pushes under the Settings tab per
  // @stdrc 2026-04-30 #proj-uiux:c8711d2a ("tabbar is level-1; any view you push
  // into covers the navbar and shows a back button top-left").
  const isChannelDetail = path.startsWith(`${pathBase}/channel/`);
  const isDMDetail = path.startsWith(`${pathBase}/dm/`);
  const isAgentDetail = path.startsWith(`${pathBase}/agent/`);
  const isHumanDetail = path.startsWith(`${pathBase}/human/`);
  const isMembersDetail = path.startsWith(`${pathBase}/members/`);
  const isComputerDetail = path.startsWith(`${pathBase}/computer/`) || path.startsWith(`${pathBase}/machine/`);
  const isComputersList = path === `${pathBase}/computers` || path.startsWith(`${pathBase}/computers/`);
  const isSettingsDetail = path.startsWith(`${pathBase}/settings/`) || path.startsWith(`${pathBase}/release-notes`);
  // Inbox/legacy Threads + Saved are level-2 pushes from Chat tab — same iOS NavigationView
  // model as channel/DM detail. stdrc 2026-05-02 #proj-uiux:648f8735 0a4084eb:
  // "在移动端点击 Threads 和 Saved 出来的页面，没有覆盖掉 Tab Bar" — fix to
  // match the channel/DM/agent detail behavior.
  const isInboxList = path === `${pathBase}/inbox` || path.startsWith(`${pathBase}/inbox/`);
  const isThreadsList = path === `${pathBase}/threads` || path.startsWith(`${pathBase}/threads/`);
  const isSavedList = path === `${pathBase}/saved` || path.startsWith(`${pathBase}/saved/`);

  if (
    isChannelDetail || isDMDetail || isAgentDetail || isHumanDetail || isMembersDetail ||
    isComputerDetail || isComputersList || isSettingsDetail ||
    isInboxList || isThreadsList || isSavedList
  ) {
    return false;
  }

  // Show on tab home routes only: chat root, /tasks, /members, /settings.
  return true;
}

/** Mobile bottom tab bar — shown only on root-level views (md:hidden).
 *  Hidden when user drills into a detail view (channel, DM, thread, member detail). */
function MobileTabBar() {
  const location = useLocation();
  const serverSlug = useServerStore((s) => s.current?.slug);
  const visible = useMobileTabBarVisible();
  const { selectTab } = useMobileNav();

  if (!visible || !serverSlug) return null;

  const pathBase = `/s/${serverSlug}`;
  const path = location.pathname;
  // 4-tab mobile bar (per @stdrc 2026-04-30 #proj-uiux:c8711d2a):
  // Chat / Tasks / Members / Settings. Computers is reachable from
  // inside Settings; it is not a top-level tab on mobile.
  const isSettings = path.startsWith(`${pathBase}/settings`)
    || path.startsWith(`${pathBase}/release-notes`)
    || path === `${pathBase}/computers`
    || path.startsWith(`${pathBase}/computers/`)
    || path.startsWith(`${pathBase}/computer/`)
    || path.startsWith(`${pathBase}/machine/`); // legacy
  const isTasks = !isSettings && (path === `${pathBase}/tasks` || path.startsWith(`${pathBase}/tasks/`));
  const isMembers = !isSettings && !isTasks && (
    path === `${pathBase}/members`
      || path.startsWith(`${pathBase}/members/`)
      || path.startsWith(`${pathBase}/agent/`)
      || path.startsWith(`${pathBase}/human/`)
  );
  const isChat = !isSettings && !isTasks && !isMembers;

  // selectTab (see useMobileNav): every tab tap navigates to that tab's
  // root, regardless of active state. Per-tab sub-page memory is dropped.
  // (stdrc 2026-05-09 #proj-mobile:b1c622e5 task #11 — sub-pages hide the
  // tab bar; restoring sub-page on tab tap traps the user without a path
  // back to root.)
  const tabs = [
    { id: "chat", label: "Home", icon: Home, active: isChat, onClick: () => selectTab("chat") },
    { id: "tasks", label: "Tasks", icon: CheckSquare, active: isTasks, onClick: () => selectTab("tasks") },
    { id: "members", label: "Members", icon: Users, active: isMembers, onClick: () => selectTab("members") },
    { id: "settings", label: "Settings", icon: Settings, active: isSettings, onClick: () => selectTab("settings") },
  ];

  // In-flow (not fixed): the bar is the last child of the MainLayout flex
  // column, which is itself pinned to the visual viewport via #root. This
  // avoids two iOS bugs: (1) `fixed; bottom:0` ending up above the visible
  // bottom in PWA standalone because the layout viewport is taller than the
  // visible area, and (2) the fixed bar being covered by the keyboard in
  // mobile Safari because `fixed; bottom:0` anchors to layout viewport which
  // doesn't shrink with the keyboard. Safe-area is added via padding-bottom
  // so the cream background extends into the home indicator zone.
  return (
    <div
      // stdrc 2026-05-02 #proj-uiux:95e25b5b 6e039b98: "移动端的每一个
      // 界面背景色都应该相应地变成白色". MobileTabBar bg cream → white;
      // active tab pill stays bg-brutal-yellow (brand on selected); inactive
      // active-pressed feedback dropped from cream → black/5.
      className="md:hidden shrink-0 border-t-2 border-black bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            onClick={tab.onClick}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 [@media(max-height:600px)]:py-2 [@media(max-height:600px)]:min-h-9 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              i < tabs.length - 1 ? "border-r-2 border-black" : ""
            } ${tab.active ? "bg-brutal-yellow" : "bg-white active:bg-black/5"}`}
          >
            {/* stdrc 2026-05-02 #proj-uiux:648f8735 16b2ec7b 3(a): on
                short viewports drop the icon and keep just the text label
                — saves vertical density. */}
            <tab.icon size={18} className="[@media(max-height:600px)]:hidden" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import OwnerOnboardingModal from "./OwnerOnboardingModal";
import AddMachineDialog from "../machine/AddMachineDialog";
import CreateAgentDialog from "../agent/CreateAgentDialog";
import AnnouncementModal from "../AnnouncementModal";
import MessageSearchPage from "../search/MessageSearchPage";
import PwaInstallPrompt from "../pwa/PwaInstallPrompt";
import type { Announcement } from "@slock-ai/shared";


/** Route: /channel/:channelId */
function ChannelRoute() {
  const { channelId } = useParams<{ channelId: string }>();
  const channels = useChannelStore((s) => s.channels);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const channelStoreLoading = useChannelStore((s) => s.loading);
  const ensureChannel = useChannelStore((s) => s.ensureChannel);
  const [hydratingChannelId, setHydratingChannelId] = useState<string | null>(null);
  const [missingChannelId, setMissingChannelId] = useState<string | null>(null);
  const all = [...channels, ...dmChannels];
  const channel = channelId ? all.find((c) => c.id === channelId) : undefined;

  useEffect(() => {
    if (!channelId || channel) {
      setHydratingChannelId(null);
      setMissingChannelId(null);
      return;
    }

    let cancelled = false;
    setHydratingChannelId(channelId);
    setMissingChannelId(null);
    void ensureChannel(channelId).then((resolved) => {
      if (cancelled) return;
      setHydratingChannelId(null);
      if (!resolved) setMissingChannelId(channelId);
    });

    return () => {
      cancelled = true;
    };
  }, [channelId, channel, ensureChannel]);

  if (
    channelId
    && !channel
    && missingChannelId !== channelId
    && (channelStoreLoading || hydratingChannelId === channelId)
  ) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-black/40 font-display text-lg font-bold uppercase">
        Loading channel
      </div>
    );
  }

  return <ChatPanel channel={channel ?? null} />;
}

/** Route: /dm/:dmId */
function DmRoute() {
  const { dmId } = useParams<{ dmId: string }>();
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const channel = dmId ? dmChannels.find((c) => c.id === dmId) : undefined;
  return <ChatPanel channel={channel ?? null} />;
}

/** Suspense fallback for lazy-loaded main-area panels (routed full-page views:
 *  AgentRoute, MachineRoute, HumanRoute, SettingsRoute, ReleaseNotesRoute, etc.).
 *  `flex-1` fills the routes container column. */
const PanelFallback = (
  <div className="flex flex-1 items-center justify-center text-black/40 font-display text-lg font-bold">
    Loading...
  </div>
);

/** Suspense fallback for lazy-loaded OVERLAY panels (ProfilePanel, LegacyTaskPanel).
 *  These render alongside the main content in the same flex row; a `flex-1` fallback
 *  would split the mobile viewport 50/50 with the main panel, producing the
 *  "half-loaded agent detail" bug reported in `#proj-uiux:c8711d2a` msg=f4f07d15
 *  (2026-05-01). On mobile the panel itself uses `absolute inset-0 z-30` to cover
 *  the main content, so its fallback must use the same geometry — otherwise during
 *  the few hundred ms of lazy chunk load we flash the split. On desktop the
 *  overlay panel is inline (`md:relative`), so `md:flex-1` restores the normal
 *  sidebar-like fill. */
const OverlayPanelFallback = (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-white text-black/40 font-display text-lg font-bold md:relative md:inset-auto md:z-auto md:flex-1 md:border-l-2 md:border-black">
    Loading...
  </div>
);

/** Route: /agent/:agentId */
function AgentRoute() {
  const { agentId } = useParams<{ agentId: string }>();
  // Fine-grained selector: only re-renders when THIS agent's data changes,
  // not when other agents update (which would create a new agents array reference).
  const agent = useAgentStore(
    useCallback((s) => s.agents.find((a) => a.id === agentId), [agentId])
  );
  if (!agent) {
    return (
      <div className="flex flex-1 items-center justify-center text-black/40 font-display text-lg font-bold uppercase">
        Agent not found
      </div>
    );
  }
  return <Suspense fallback={PanelFallback}><AgentDetailPanel agent={agent} /></Suspense>;
}

/** Route: /machine/:machineId */
function MachineRoute() {
  const { machineId } = useParams<{ machineId: string }>();
  const machines = useMachineStore((s) => s.machines);
  const machine = machineId ? machines.find((m) => m.id === machineId) : undefined;
  if (!machine) {
    return (
      <div className="flex flex-1 items-center justify-center text-black/40 font-display text-lg font-bold uppercase">
        Computer not found
      </div>
    );
  }
  return <Suspense fallback={PanelFallback}><MachineDetailPanel machine={machine} /></Suspense>;
}

/** Route: /human/:userId */
function HumanRoute() {
  const { userId } = useParams<{ userId: string }>();
  const members = useServerStore((s) => s.members);
  const currentServerId = useServerStore((s) => s.current?.id);
  const human = userId ? members.find((m) => m.userId === userId) : undefined;
  const [fallbackHuman, setFallbackHuman] = useState<HumanProfile | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!userId || !currentServerId) {
      setFallbackHuman(null);
      setFallbackLoading(false);
      return;
    }
    setFallbackLoading(true);
    void api
      .get(`/servers/${currentServerId}/members/${userId}/profile`)
      .then(({ data }) => {
        if (!cancelled) setFallbackHuman(data as HumanProfile);
      })
      .catch(() => {
        if (!cancelled) setFallbackHuman(null);
      })
      .finally(() => {
        if (!cancelled) setFallbackLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentServerId, userId]);

  const resolvedHuman = resolveHumanProfile(human, fallbackHuman);
  if (resolvedHuman) {
    return <Suspense fallback={PanelFallback}><HumanDetailPanel human={resolvedHuman} /></Suspense>;
  }
  if (fallbackLoading) return PanelFallback;
  return (
    <div className="flex flex-1 items-center justify-center text-black/40 font-display text-lg font-bold uppercase">
      Human not found
    </div>
  );
}

/** Route: /settings/:tab? */
function SettingsRoute() {
  const { tab } = useParams<{ tab: string }>();
  return <Suspense fallback={PanelFallback}><SettingsPanel tab={tab} /></Suspense>;
}

/** Route: /members/graph */
function MemberGraphRoute() {
  const serverSlug = useServerStore((s) => s.current?.slug);
  const onMobileBack = useMobileBack(serverSlug ? `/s/${serverSlug}/members` : "/");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader
        title="Graph"
        titleSuffix={<ExperimentalBadge className="-translate-y-px" />}
        icon={<GitBranch size={18} />}
        iconBg="bg-brutal-yellow text-black"
        onMobileBack={onMobileBack}
        mobileBackProps={{ "data-testid": "member-graph-mobile-back", title: "Back" }}
      />
      <div className="flex-1 overflow-y-auto bg-white px-5 py-4">
        <Suspense fallback={PanelFallback}>
          <MemberGraphSection sectionLabel="Connections" />
        </Suspense>
      </div>
    </div>
  );
}

/** Route: /release-notes */
function ReleaseNotesRoute() {
  return <Suspense fallback={PanelFallback}><ReleaseNotesPanel /></Suspense>;
}

/** Route: /inbox */
function ThreadsRoute() {
  return <Suspense fallback={PanelFallback}><ThreadsInbox /></Suspense>;
}

function LegacyThreadsRedirect() {
  const slug = useServerStore((s) => s.current?.slug);
  return <Navigate to={slug ? `/s/${slug}/inbox` : "/"} replace />;
}

/** Route: /saved */
function SavedRoute() {
  return <Suspense fallback={PanelFallback}><SavedPanel /></Suspense>;
}

/** Route: /tasks */
function TasksRoute() {
  return <Suspense fallback={PanelFallback}><TasksPanel /></Suspense>;
}

/** Route: * — redirect to first channel */
function DefaultRoute() {
  const channels = useChannelStore((s) => s.channels);
  const loading = useChannelStore((s) => s.loading);
  const slug = useServerStore((s) => s.current?.slug);
  const [isDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  // On mobile, don't auto-redirect — the sidebar (channel list) is shown inline
  // as the main content via the master-detail layout in MainLayout.
  if (isDesktop && channels.length > 0 && slug) {
    return <Navigate to={`/s/${slug}/channel/${channels[0].id}`} replace />;
  }
  if (loading) {
    return null;
  }
  // Desktop: show empty state. Mobile: this won't be visible (sidebar is shown instead).
  return <ChatPanel channel={null} />;
}

// Empty placeholder for /members and /computers root routes. Unlike
// DefaultRoute, these MUST NOT auto-redirect to the first channel — that
// would silently flip the URL into chat mode (and re-highlight the Chat
// rail button) the moment the user clicks Members or Computers.
function EmptyRoute() {
  return <ChatPanel channel={null} />;
}

// Computers route — on desktop the Sidebar owns the Computers rail with
// the list of machines, and the main panel shows the empty ChatPanel.
// On mobile the Sidebar is not rendered for /computers (removed from
// isMobileMasterRoute 2026-05-01 per stdrc msg 2a500cb7), so the main
// panel here IS the page the user sees: MobileComputersPanel renders a
// proper h-[62px] yellow navbar + cream body + cards, matching the
// other mobile panels (Tasks / Saved / Threads / Settings sub-pages).
function ComputersRoute() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop ? <ChatPanel channel={null} /> : <MobileComputersPanel />;
}

/** Parse current URL to extract channelId (for socket reconnect gap sync) */
function getCurrentChannelId(): string | null {
  const match = window.location.pathname.match(/\/(?:channel|dm)\/([^/?]+)/);
  return match ? match[1] : null;
}

function getChannelMaxSeq(messages: { seq?: number }[] | undefined): number {
  return Math.max(...(messages ?? []).map((message) => message.seq || 0), 0);
}

/** Thread panel wrapper — only renders if a thread is open */
function ThreadPanelWrapper({ presentation = "side" }: { presentation?: "side" | "modal" | "mobile-modal" }) {
  const parentMessageId = useThreadStore((s) => s.openParentMessageId);
  if (!parentMessageId) return null;
  return <ThreadPanel key={parentMessageId} presentation={presentation} />;
}

/** Profile panel wrapper — only renders if a profile is open */
function ProfilePanelWrapper() {
  const isOpen = useProfileStore((s) => !!s.profileId);
  if (!isOpen) return null;
  return <Suspense fallback={OverlayPanelFallback}><ProfilePanel /></Suspense>;
}

/** Legacy task panel wrapper — only renders if a legacy task is open */
function LegacyTaskPanelWrapper({ presentation = "side" }: { presentation?: "side" | "modal" | "mobile-modal" }) {
  const isOpen = useLegacyTaskPanelStore((s) => !!s.task);
  if (!isOpen) return null;
  return <Suspense fallback={OverlayPanelFallback}><LegacyTaskPanel presentation={presentation} /></Suspense>;
}

/** Right panel — shows the topmost open view in the overlay stack.
 *  Both thread and profile can be stacked; we render whichever was opened last.
 *  Closing the top one reveals the one below it. */
function RightPanel() {
  const location = useLocation();
  const threadOpen = useThreadStore((s) => !!s.openParentMessageId);
  const threadOpenedAt = useThreadStore((s) => s.openedAt);
  const profileOpen = useProfileStore((s) => !!s.profileId);
  const profileOpenedAt = useProfileStore((s) => s.openedAt);
  const legacyTaskOpen = useLegacyTaskPanelStore((s) => !!s.task);
  const closeThread = useThreadStore((s) => s.closeThread);
  const closeLegacyTask = useLegacyTaskPanelStore((s) => s.closeLegacyTask);
  const isTasksRoute = /\/tasks\/?$/.test(location.pathname);
  // Tasks-route: rail-visible (md+) wraps the thread / legacy task in <Modal>
  // (bounded centered card with backdrop). Mobile (no Rail, <md) renders the
  // panel directly so it behaves like a regular full-screen thread overlay.
  // The md threshold matches LeftRail's own `hidden md:flex` — stdrc
  // 2026-05-21 #proj-task:287f18ce msg=59d4256c: "只要显示 Rail，就应该
  // 显示为中间弹窗". Earlier 1024px threshold made medium viewports drop into
  // mobile mode even with the Rail visible, which felt wrong.
  const [railVisible, setRailVisible] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setRailVisible(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const profileIsTop = profileOpen && (!threadOpen || profileOpenedAt >= threadOpenedAt);
  const threadIsTop = threadOpen && (!profileOpen || threadOpenedAt > profileOpenedAt);
  if (profileIsTop) return <ProfilePanelWrapper />;
  if (isTasksRoute && threadIsTop) {
    if (railVisible) {
      // Centered modal with backdrop. Backdrop click + ESC close it; no
      // inline X (back chevron handles close at md-lg, ESC/backdrop at lg+).
      return (
        <Modal onClose={closeThread} closeOnBackdrop>
          <ThreadPanelWrapper presentation="modal" />
        </Modal>
      );
    }
    return <ThreadPanelWrapper presentation="mobile-modal" />;
  }
  if (threadIsTop) return <ThreadPanelWrapper />;
  if (isTasksRoute && legacyTaskOpen) {
    if (railVisible) {
      return (
        <Modal onClose={closeLegacyTask} closeOnBackdrop>
          <LegacyTaskPanelWrapper presentation="modal" />
        </Modal>
      );
    }
    return <LegacyTaskPanelWrapper presentation="mobile-modal" />;
  }
  if (legacyTaskOpen) return <LegacyTaskPanelWrapper />;
  return null;
}

/** Sync right panel state ↔ URL query params */
function useRightPanelUrlSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef({ pathname: location.pathname, search: location.search });

  // Must precede the URL→Store effect below: ThreadPanel's "View in channel"
  // navigates to the parent surface and relies on the URL→Store effect to
  // close the thread. The store→URL subscriber that fires synchronously from
  // closeThread() reads `locationRef.current` — if this effect hadn't already
  // refreshed the ref, syncUrl would compute the diff against the OLD location
  // (still containing ?thread) and overwrite the freshly-pushed ?msg=. See
  // ThreadPanel.tsx View-in-channel onClick comment for the full rationale.
  useEffect(() => {
    locationRef.current = { pathname: location.pathname, search: location.search };
  }, [location.pathname, location.search]);

  // URL → Store: keep thread/profile stores consistent with URL params.
  // Runs on mount AND on in-session URL changes so that clicking a permalink
  // to a different thread (which calls navigate() and only changes the query
  // string) reopens the panel to the new target instead of staying on the
  // previously opened thread.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const threadParam = params.get("thread");
    const profileParam = params.get("profile");
    const focusedMessageId = params.get("msg");

    if (threadParam) {
      const idx = threadParam.indexOf(":");
      if (idx > 0) {
        const channelId = threadParam.slice(0, idx);
        const messageId = threadParam.slice(idx + 1);
        if (channelId && messageId) {
          // `msg=` on a thread permalink can mean either:
          // 1. the parent message itself (for "view in channel" / parent focus), or
          // 2. a specific reply inside the thread.
          // Only the latter should seed threadStore.focusedMessageId. If we
          // pass the parent message id through as a thread focus target,
          // ThreadPanel will fetch `/messages/context/:id` against the parent
          // channel message and merge channel context into thread replies.
          const threadFocusedMessageId =
            focusedMessageId && focusedMessageId !== messageId
              ? focusedMessageId
              : null;
          const {
            openParentChannelId,
            openParentMessageId,
            focusedMessageId: currentFocus,
          } = useThreadStore.getState();
          if (channelId !== openParentChannelId || messageId !== openParentMessageId) {
            useThreadStore.getState().openThread(channelId, messageId, threadFocusedMessageId);
          } else if (threadFocusedMessageId && threadFocusedMessageId !== currentFocus) {
            // Same thread already open — just update focus so the scroll/highlight
            // effect re-runs. Without this, clicking a permalink to another message
            // in the currently-open thread does nothing until the page is refreshed.
            useThreadStore.setState({ focusedMessageId: threadFocusedMessageId });
          }
        }
      }
    } else if (useThreadStore.getState().openParentMessageId) {
      useThreadStore.getState().closeThread();
    }

    if (profileParam) {
      const idx = profileParam.indexOf(":");
      if (idx > 0) {
        const type = profileParam.slice(0, idx) as "agent" | "human";
        const id = profileParam.slice(idx + 1);
        if ((type === "agent" || type === "human") && id) {
          const { profileType, profileId } = useProfileStore.getState();
          if (type !== profileType || id !== profileId) {
            useProfileStore.getState().openProfile(type, id);
          }
        }
      }
    } else if (useProfileStore.getState().profileId) {
      useProfileStore.getState().closeProfile();
    }
  }, [location.search]);

  // Store → URL: update query params when panel state changes.
  // Panels stack: both ?thread= and ?profile= can coexist. Adding a panel
  // pushes a new history entry; close / swap / in-place updates replace.
  const syncUrl = useCallback((mode: "auto" | "replace" = "auto") => {
      const { pathname, search } = locationRef.current;
      const currentSearch = search.startsWith("?") ? search.slice(1) : search;
      const params = new URLSearchParams(currentSearch);
      const { openParentMessageId: msgId, openParentChannelId: chId } = useThreadStore.getState();
      const { profileType, profileId } = useProfileStore.getState();

      const prevHadThread = params.has("thread");
      const prevHadProfile = params.has("profile");

      params.delete("thread");
      params.delete("profile");

      const hasThread = !!(msgId && chId);
      const hasProfile = !!(profileType && profileId);
      if (hasThread) params.set("thread", `${chId}:${msgId}`);
      if (hasProfile) params.set("profile", `${profileType}:${profileId}`);

      const newSearch = params.toString();
      if (currentSearch === newSearch) return;

      const addedThread = hasThread && !prevHadThread;
      const addedProfile = hasProfile && !prevHadProfile;
      const removedAny = (!hasThread && prevHadThread) || (!hasProfile && prevHadProfile);
      const shouldPush = mode === "auto" && (addedThread || addedProfile) && !removedAny;

      const nextSearch = newSearch ? `?${newSearch}` : "";
      navigate(
        { pathname, search: nextSearch },
        { replace: !shouldPush },
      );
      // Sync locationRef synchronously after navigate(). React-router's
      // navigate() calls history.pushState under the hood, which updates
      // window.history synchronously, but the useEffect at line 413 only
      // refreshes locationRef AFTER React re-renders. Without this manual
      // sync, a Zustand subscriber that fires a second syncUrl() in the
      // same tick (e.g. an openThread() that sets multiple fields, or an
      // openThread+openProfile combo) reads the stale locationRef and
      // pushes the SAME URL again, producing duplicate history entries —
      // which is why browser back needed 2–3 clicks to escape a thread
      // opened from /threads or a channel view. Reported in
      // `#proj-uiux:c8711d2a` msg=b61ca24b (2026-05-01, @stdrc).
      locationRef.current = { pathname, search: nextSearch };
  }, [navigate]);

  useEffect(() => {
    const unsubThread = useThreadStore.subscribe(() => syncUrl("auto"));
    const unsubProfile = useProfileStore.subscribe(() => syncUrl("auto"));
    return () => { unsubThread(); unsubProfile(); };
  }, [syncUrl]);

  // Re-add panel params after react-router navigation changes the pathname
  useEffect(() => {
    syncUrl("replace");
  }, [location.pathname, syncUrl]);
}

export default function MainLayout() {
  useRightPanelUrlSync();
  useRailLegacyRedirect();
  useTabRouteMemory();

  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const loadServers = useServerStore((s) => s.loadServers);
  const clearCurrentServer = useServerStore((s) => s.clearCurrent);
  const loadMembers = useServerStore((s) => s.loadMembers);
  const loadSidebarOrder = useServerStore((s) => s.loadSidebarOrder);
  const loadChannels = useChannelStore((s) => s.loadChannels);
  const loadDMChannels = useChannelStore((s) => s.loadDMChannels);
  const addOrRefreshDM = useChannelStore((s) => s.addOrRefreshDM);
  const touchChannelActivity = useChannelStore((s) => s.touchChannelActivity);
  const loadAgents = useAgentStore((s) => s.loadAgents);
  const updateActivity = useAgentStore((s) => s.updateActivity);
  const appendTrajectory = useAgentStore((s) => s.appendTrajectory);
  const addMessage = useMessageStore((s) => s.addMessage);
  const loadUnreadCounts = useMessageStore((s) => s.loadUnreadCounts);
  const syncGap = useMessageStore((s) => s.syncGap);
  const loadMachines = useMachineStore((s) => s.loadMachines);
  const updateMachineStatus = useMachineStore((s) => s.updateMachineStatus);
  const updateMachineCapabilities = useMachineStore((s) => s.updateMachineCapabilities);
  const showAddMachine = useMachineStore((s) => s.showAddMachine);
  const setShowAddMachine = useMachineStore((s) => s.setShowAddMachine);
  const showCreateAgent = useAgentStore((s) => s.showCreateAgent);
  const createAgentOnboarding = useAgentStore((s) => s.createAgentOnboarding);
  const setShowCreateAgent = useAgentStore((s) => s.setShowCreateAgent);
  const navigate = useNavigate();
  const location = useLocation();

  // `useNavigate()` returns a NEW function reference on every render in
  // react-router-dom v7 (verified empirically via #proj-frontend:4e6a01a6
  // task #1 reproduction — `changedDeps=["navigate"]` on every nav). The
  // socket-listener mega-effect below must NOT depend on it directly,
  // otherwise every navigation re-runs the effect and tears down all
  // listeners, dropping any `agent:activity` push delivered in the gap.
  // We mirror it into a ref so handlers inside the effect can call the
  // current navigate without the effect re-subscribing.
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // Detect mobile vs desktop (matches Tailwind's md: breakpoint at 768px)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Resizable sidebar (desktop only)
  // Chat sidebar is a navigation rail, not a content pane. Keep the
  // resizable max compact so persisted wide values do not create an empty
  // right gutter around short labels and badges.
  const {
    width: sidebarWidth,
    handleResizeStart: handleSidebarResizeStart,
    handleResizeMove: handleSidebarResizeMove,
    handleResizeEnd: handleSidebarResizeEnd,
  } = useResizablePanel({ storageKey: "slock:sidebarWidth", min: 180, max: 320, defaultWidth: 240 });

  const serverSlug = useServerStore((s) => s.current?.slug);
  const currentServerId = useServerStore((s) => s.current?.id);

  useLayoutEffect(() => {
    useLiveAgentActivityStore.getState().clear();
  }, [currentServerId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!serverSlug || location.pathname.endsWith("/search")) return;
        navigate(`/s/${serverSlug}/search`, {
          state: { searchFrom: `${location.pathname}${location.search}` },
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [location.pathname, location.search, navigate, serverSlug]);

  // One-time hash migration: redirect old hash URLs to new paths
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || !serverSlug) return;
    // Clear the hash
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    const base = `/s/${serverSlug}`;
    if (hash === "settings") {
      navigate(`${base}/settings`, { replace: true });
      return;
    }
    const [type, id] = hash.split("/");
    if (id && ["channel", "dm", "agent", "machine", "human", "member"].includes(type)) {
      navigate(`${base}/${type}/${id}`, { replace: true });
    }
  }, [serverSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load initial data — reconnect socket with fresh server auth
  useEffect(() => {
    reconnectSocket();
    loadUnreadCounts();
    loadChannels();
    loadDMChannels();
    loadAgents();
    loadMachines();
    useThreadStore.getState().loadFollowedThreads();
    useInboxStore.getState().loadInbox({ reset: true });
    useSavedStore.getState().loadSaved();
    useAnnouncementStore.getState().load();
  }, [loadChannels, loadDMChannels, loadAgents, loadMachines, loadUnreadCounts]);

  // Listen for agent activity updates + socket reconnect
  useEffect(() => {
    const socket = getSocket();
    let inboxRefreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleInboxRefresh = () => {
      if (inboxRefreshTimer) clearTimeout(inboxRefreshTimer);
      inboxRefreshTimer = setTimeout(() => {
        inboxRefreshTimer = null;
        void useInboxStore.getState().loadInbox({ reset: true });
      }, 150);
    };

    // Global message listener for all channels (unread tracking + current channel)
    socket.on("message:new", (msg: any) => {
      addMessage(msg);
      // Reorder DM to top of sidebar on any new message (sent or received)
      if (msg?.channelId) {
        touchChannelActivity(msg.channelId, typeof msg.createdAt === "string" ? msg.createdAt : null);
        const dmChannels = useChannelStore.getState().dmChannels;
        if (dmChannels.some((c) => c.id === msg.channelId)) {
          addOrRefreshDM(msg.channelId);
        }
        scheduleInboxRefresh();
      }
    });

    // Merge-only updates for existing messages (task field changes).
    // Does NOT create new messages or increment unread counts.
    socket.on("message:updated", (msg: any) => {
      useMessageStore.getState().updateMessage(msg);
    });

    // `serverSeq` (optional) is the monotonic per-agent counter used
    // for out-of-order push dedup. Old servers omit it; agentStore
    // treats undefined as "always apply" (== pre-PR behaviour).
    // #engineering:72283cf7 task #340 PR B
    socket.on("agent:activity", (data: { agentId: string; activity: string; detail?: string; timestamp?: number; entries?: any[]; serverSeq?: number }) => {
      updateActivity(data.agentId, data.activity, data.detail || "", data.serverSeq, data.timestamp);
      useLiveAgentActivityStore.getState().recordStatusActivity(data, useAgentStore.getState().agents);
      if (data.entries && data.entries.length > 0) {
        appendTrajectory(data.agentId, data.entries, data.timestamp);
      }
    });

    // Refresh DM list when a new DM is created (e.g. agent initiates DM)
    // Join the socket room so we receive future message:new events for this DM.
    // The server already ensures we're joined before broadcasting the first message,
    // so message:new handles unread counting — no need to duplicate via dm:new.
    socket.on("dm:new", (data: { channelId: string }) => {
      if (data?.channelId) {
        socket.emit("join:channel", data.channelId);
        addOrRefreshDM(data.channelId);
        scheduleInboxRefresh();
      }
    });

    // Machine connection status
    socket.on("machine:status", (data: { machineId: string; status: "online" | "offline"; statusVersion?: number }) => {
      void handleMachineStatusRecoveryEvent(data, {
        updateMachineStatus,
        listAgents: () => useAgentStore.getState().agents,
        forceAgentOffline: (agentId) => updateActivity(agentId, "offline"),
        reloadMachines: loadMachines,
        reloadAgents: loadAgents,
      });
    });

    // Machine capabilities update (programs, hostname, os, version)
    socket.on("machine:capabilities", (data: { machineId: string; runtimes: string[]; hostname?: string; os?: string; daemonVersion?: string }) => {
      updateMachineCapabilities(data.machineId, data.runtimes, data.hostname, data.os, data.daemonVersion);
    });
    socket.on("machine:updated", () => {
      loadMachines();
    });

    // Legacy: handle old daemon:status events during transition
    socket.on("daemon:status", (data: { daemonId: string; status: "online" | "offline"; statusVersion?: number }) => {
      updateMachineStatus(data.daemonId, data.status, data.statusVersion);
    });

    // Agent list changes (creation/deletion) — refresh agent store for @mention completion etc.
    socket.on("agent:created", () => {
      loadAgents();
    });
    socket.on("agent:deleted", () => {
      loadAgents();
    });

    // Channel updated (name/description change) — refresh channel list
    socket.on("channel:updated", () => {
      loadChannels();
    });

    // Channel membership updates can change the current user's `joined` flag
    // and sidebar availability from another tab/admin action.
    const handleChannelMembersUpdated = () => {
      loadChannels();
    };
    socket.on("channel:members-updated", handleChannelMembersUpdated);

    // Plan change (triggered by Stripe webhook)
    socket.on("server:plan-updated", () => {
      loadServers();
    });

    socket.on("server:member-added", (data: { serverId?: string }) => {
      const currentServerId = useServerStore.getState().current?.id;
      if (data?.serverId && data.serverId !== currentServerId) return;
      loadMembers();
    });
    const refreshMembersForServer = (data: { serverId?: string }) => {
      const currentServerId = useServerStore.getState().current?.id;
      if (data?.serverId && data.serverId !== currentServerId) return;
      loadMembers();
    };
    socket.on("server:member:left", refreshMembersForServer);
    socket.on("server:member-removed", refreshMembersForServer);
    socket.on("server:member-updated", refreshMembersForServer);

    // Current user was removed from a server. If it is the active server,
    // force a return to server selection immediately.
    socket.on("server:membership-removed", async (data: { serverId?: string }) => {
      if (!data?.serverId) return;
      const removedServerId = data.serverId;
      const currentServer = useServerStore.getState().current;
      const wasCurrentServer = currentServer?.id === removedServerId;

      await loadServers();

      if (!wasCurrentServer) return;
      const stillMember = useServerStore.getState().servers.some((server) => server.id === removedServerId);
      if (stillMember) return;

      if (currentServer && localStorage.getItem("slock_last_server_slug") === currentServer.slug) {
        localStorage.removeItem("slock_last_server_slug");
      }
      clearCurrentServer();
      // Use ref — see navigateRef declaration. Calling `navigate` directly
      // would force the enclosing effect to depend on the unstable hook
      // return and re-subscribe every render.
      navigateRef.current("/", { replace: true });
    });

    // Thread reply count updates
    socket.on("thread:updated", (data: { parentMessageId: string; threadChannelId: string; replyCount: number; lastReplyAt: string | null; participantIds: string[]; unreadCount?: number; firstUnreadMessageId?: string | null }) => {
      const threadState = useThreadStore.getState();
      const isOpen = threadState.openThreadChannelId === data.threadChannelId;
      const existingSummary = threadState.summaries[data.parentMessageId];
      const followed = threadState.followedThreads.find((t) => t.threadChannelId === data.threadChannelId);
      const unreadCount = data.unreadCount ?? (isOpen ? 0 : followed ? followed.unreadCount + 1 : existingSummary?.unreadCount ?? 0);
      threadState.updateSummary(data.parentMessageId, {
        threadChannelId: data.threadChannelId,
        replyCount: data.replyCount,
        lastReplyAt: data.lastReplyAt,
        participantIds: data.participantIds,
        unreadCount,
        firstUnreadMessageId: data.firstUnreadMessageId ?? (unreadCount > 0 ? existingSummary?.firstUnreadMessageId ?? null : null),
      });
      // Update followed threads list (increment unread if thread panel not open for this thread)
      if (followed) {
        threadState.updateFollowedThread(data.threadChannelId, {
          replyCount: data.replyCount,
          lastReplyAt: data.lastReplyAt,
          ...(isOpen ? {} : { unreadCount: followed.unreadCount + 1 }),
        });
      } else {
        // The backend can auto-follow a thread for the current user when
        // another actor creates or replies in it; refresh sidebar state.
        threadState.loadFollowedThreads();
      }
      scheduleInboxRefresh();
    });

    // Account-level announcements — global broadcast, client dedupes on id
    socket.on("announcement:new", (a: Announcement) => {
      useAnnouncementStore.getState().receive(a);
    });

    // Task board real-time updates
    socket.on("task:created", (data: { channelId: string; tasks: any[] }) => {
      for (const task of data.tasks) {
        useTaskStore.getState().upsertTask(task);
      }
    });
    socket.on("task:updated", (data: { channelId: string; task: any }) => {
      useTaskStore.getState().upsertTask(data.task);
    });
    socket.on("task:deleted", (data: { channelId: string; taskId: string }) => {
      useTaskStore.getState().removeTask(data.taskId);
    });

    let visibleScopeSyncInFlight = false;
    const syncVisibleScopes = async () => {
      if (visibleScopeSyncInFlight) return;

      const { channelMessages } = useMessageStore.getState();
      const targets: Array<{ channelId: string; sinceSeq: number }> = [];
      const seen = new Set<string>();

      const { openThreadChannelId } = useThreadStore.getState();
      if (openThreadChannelId) {
        const sinceSeq = getChannelMaxSeq(channelMessages[openThreadChannelId]);
        if (sinceSeq > 0) {
          targets.push({ channelId: openThreadChannelId, sinceSeq });
          seen.add(openThreadChannelId);
        }
      }

      const currentChannelId = getCurrentChannelId();
      if (currentChannelId && !seen.has(currentChannelId)) {
        const sinceSeq = getChannelMaxSeq(channelMessages[currentChannelId]);
        if (sinceSeq > 0) {
          targets.push({ channelId: currentChannelId, sinceSeq });
        }
      }

      if (targets.length === 0) return;

      visibleScopeSyncInFlight = true;
      try {
        for (const { channelId, sinceSeq } of targets) {
          await syncGap(channelId, { sinceSeq });
        }
      } finally {
        visibleScopeSyncInFlight = false;
      }
    };

    // Reload state on reconnect (mobile browsers kill WS on background).
    // loadServers() is included so a removal that fired while the per-user room
    // wasn't joined yet self-heals on the next connect — see the
    // server:membership-removed handler above for the realtime path.
    socket.on("connect", () => {
      if (typeof window !== "undefined") {
        (window as Window & { __slockRoomsJoined?: boolean }).__slockRoomsJoined = false;
      }
      // Clear per-agent serverSeq dedup before refetching state. The
      // server's monotonic counter resets on its own restart, so
      // holding stale lastSeen values across a reconnect could block
      // legitimate fresh pushes. `loadAgents()` then snaps the
      // baseline back to the server's authoritative state.
      // (#engineering:72283cf7 task #340 PR B)
      useAgentStore.getState().resetActivitySeq();
      loadUnreadCounts();
      loadSidebarOrder();
      loadMachines();
      loadAgents();
      loadServers();
      useThreadStore.getState().loadFollowedThreads();
      useInboxStore.getState().loadInbox({ reset: true });
    });

    // P0: After server confirms all channel rooms are joined, send sync:resume
    // with lastSeq to backfill ALL missed messages across all channels.
    socket.on("rooms:joined", () => {
      if (typeof window !== "undefined") {
        (window as Window & { __slockRoomsJoined?: boolean }).__slockRoomsJoined = true;
        window.dispatchEvent(new Event("slock:rooms-joined"));
      }
      const { lastSeq } = useMessageStore.getState();
      if (lastSeq > 0) {
        socket.emit("sync:resume", { lastSeq });
      }
      void syncVisibleScopes();
      loadUnreadCounts();
      useInboxStore.getState().loadInbox({ reset: true });
    });

    // P0: Handle sync:resume response — batch-add missed messages
    socket.on("sync:resume:response", ({ messages, currentSeq, hasMore }: {
      messages: any[];
      currentSeq: number;
      hasMore: boolean;
    }) => {
      useMessageStore.getState().batchAddMessages(messages);
      useMessageStore.setState((s) => ({
        lastSeq: Math.max(s.lastSeq, currentSeq),
      }));
      // If too many messages were missed, fallback to full refresh
      if (hasMore) {
        loadUnreadCounts();
        void syncVisibleScopes();
      }
    });

    // P2: Application-layer heartbeat with seq — passive gap detection
    let lastHeartbeatTime = Date.now();
    let lastServerEventTime = Date.now();
    const markServerActivity = () => {
      lastServerEventTime = Date.now();
    };

    socket.on("connect", () => {
      const now = Date.now();
      lastHeartbeatTime = now;
      lastServerEventTime = now;
    });
    socket.onAny(markServerActivity);
    socket.on("heartbeat", ({ seq: serverSeq }: { seq: number; ts: number }) => {
      lastHeartbeatTime = Date.now();
      const { lastSeq } = useMessageStore.getState();
      if (serverSeq > lastSeq) {
        void syncVisibleScopes();
      }
    });

    // Keep a conservative client-side circuit breaker for sockets that appear
    // wedged, but only trip it after both heartbeat silence and total inbound
    // inactivity for an extended period.
    const heartbeatCheckInterval = setInterval(() => {
      const now = Date.now();
      const heartbeatSilentFor = now - lastHeartbeatTime;
      const serverSilentFor = now - lastServerEventTime;
      if (heartbeatSilentFor > 90_000 && serverSilentFor > 120_000 && socket.connected) {
        console.warn("[Socket] Prolonged heartbeat silence, forcing reconnect");
        socket.disconnect();
        socket.connect();
      }
    }, 10_000);

    return () => {
      socket.off("message:new");
      socket.off("message:updated");
      socket.off("agent:activity");
      socket.off("dm:new");
      socket.off("machine:status");
      socket.off("machine:capabilities");
      socket.off("machine:updated");
      socket.off("daemon:status");
      socket.off("agent:created");
      socket.off("agent:deleted");
      socket.off("channel:updated");
      socket.off("channel:members-updated", handleChannelMembersUpdated);
      socket.off("server:plan-updated");
      socket.off("server:member-added");
      socket.off("server:member:left");
      socket.off("server:member-removed");
      socket.off("server:member-updated");
      socket.off("server:membership-removed");
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
      socket.off("announcement:new");
      socket.off("thread:updated");
      socket.off("connect");
      socket.offAny(markServerActivity);
      socket.off("rooms:joined");
      socket.off("sync:resume:response");
      socket.off("heartbeat");
      if (inboxRefreshTimer) clearTimeout(inboxRefreshTimer);
      clearInterval(heartbeatCheckInterval);
    };
    // Stable deps only — every entry below is a zustand action ref (stable
    // across renders). Specifically NO `location.pathname` and NO
    // `navigate` here. The bug being fixed (#proj-frontend:4e6a01a6
    // task #1, "agent activity dot stuck on online after multiple page
    // swaps") was caused by either of those changing on every URL change
    // and re-running the effect, which tore down all socket listeners
    // (`socket.off("agent:activity")` etc.) and re-attached them. Any push
    // delivered in the detach/re-attach gap was silently dropped, and
    // after enough page swaps the dot froze on the last-applied state
    // (typically `online`).
    //
    // - `location.pathname` was listed as a dep even though the effect
    //   body never read it — pure dead weight, removed.
    // - `navigate` from `useNavigate()` returns a NEW function reference
    //   on every render in react-router-dom v7 (verified empirically:
    //   `changedDeps=["navigate"]` on every nav). The one handler that
    //   needs it (`server:member-removed` → bounce to "/") now reads it
    //   through `navigateRef.current` instead.
    //
    // E2E reproduction: with both deps removed, 30 sequential channel
    // swaps trigger 2 effect runs (mount + StrictMode double-render).
    // With `location.pathname` only removed (navigate still in deps),
    // 30 swaps still trigger ~28 runs. Both must be removed for the fix.
  }, [addMessage, updateActivity, appendTrajectory, addOrRefreshDM, touchChannelActivity, updateMachineStatus, updateMachineCapabilities, loadAgents, loadMachines, loadChannels, loadServers, clearCurrentServer, loadSidebarOrder, loadMembers, syncGap, loadUnreadCounts]);

  // Save lastSeq before page unload
  useEffect(() => {
    const handleUnload = () => {
      const { lastSeq } = useMessageStore.getState();
      sessionStorage.setItem("slock_lastSeq", String(lastSeq));
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Re-sync unread counts from DB when tab becomes visible
  // (also self-heals stale machine/agent presence if the browser kept a
  // websocket alive across backgrounding without delivering missed events)
  useEffect(() => {
    const hasStoredSession = !!(accessToken && refreshToken);
    const recoverLiveSession = () => {
      const plan = getLiveSessionRecoveryPlan({
        visible: document.visibilityState === "visible",
        online: navigator.onLine,
        hasStoredSession,
        socketConnected: isSocketConnected(),
      });
      if (plan.reconnectSocket) {
        ensureSocketConnected();
      }
      if (plan.reloadLiveData) {
        loadUnreadCounts();
        loadSidebarOrder();
        loadMachines();
        useAgentStore.getState().resetActivitySeq();
        loadAgents();
      }
    };
    document.addEventListener("visibilitychange", recoverLiveSession);
    window.addEventListener("online", recoverLiveSession);
    return () => {
      document.removeEventListener("visibilitychange", recoverLiveSession);
      window.removeEventListener("online", recoverLiveSession);
    };
  }, [accessToken, refreshToken, loadAgents, loadMachines, loadSidebarOrder, loadUnreadCounts]);

  // On mobile, detect whether we're in a "detail" route (channel, DM, member detail)
  // vs a "root" route where the tab bar is visible.
  const path = location.pathname;
  const pathBase = serverSlug ? `/s/${serverSlug}` : "";
  const isMobileDetailRoute =
    path.startsWith(`${pathBase}/channel/`) ||
    path.startsWith(`${pathBase}/dm/`) ||
    path.startsWith(`${pathBase}/agent/`) ||
    path.startsWith(`${pathBase}/machine/`) ||
    path.startsWith(`${pathBase}/human/`);

  // Show sidebar inline as main content on mobile when the URL is one of
  // the per-rail-mode master pages — chat root, members root, computers
  // root, or settings root. Detail URLs (/channel/<id>, /agent/<id>,
  // /settings/account, etc.) instead show the main panel and hide the
  // sidebar. /tasks has no sidebar at all (handled separately below).
  const isDefaultRoute = path === pathBase || path === `${pathBase}/`;
  const isMembersRoot = path === `${pathBase}/members` || path === `${pathBase}/members/`;
  const isComputersRoot = path === `${pathBase}/computers` || path === `${pathBase}/computers/`;
  const isSettingsRoot = path === `${pathBase}/settings` || path === `${pathBase}/settings/`;
  // Mobile-only: /computers now renders a dedicated MobileComputersPanel
  // instead of a Sidebar-inline view, so it stays out of the master-route
  // set on mobile (stdrc msg 2a500cb7 2026-05-01 — styling inconsistency
  // with other Settings sub-pages). Desktop still uses the Sidebar's
  // Computers rail, so isComputersRoot remains part of the desktop
  // side-by-side layout driven by !isDesktop below.
  const isMobileMasterRoute = isDefaultRoute || isMembersRoot || isSettingsRoot;
  const mobileShowSidebarInline = !isDesktop && isMobileMasterRoute;

  // Tasks rail mode is single-page: TasksPanel owns its own filtering UI
  // and there is no master/detail navigation inside Tasks, so we skip the
  // Sidebar entirely and let the panel take the full width next to LeftRail.
  const isTasksRoute = path === `${pathBase}/tasks` || path.startsWith(`${pathBase}/tasks/`);
  const hideSidebar = isTasksRoute;
  const isMobileTabRoot = mobileShowSidebarInline || (!isDesktop && isTasksRoute);
  const browserChromeColor = !isDesktop && !isMobileTabRoot ? THEME_CHROME_WHITE : THEME_CHROME_YELLOW;
  const mobileTabBarVisible = useMobileTabBarVisible();

  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeColor) return;
    themeColor.content = browserChromeColor;
  }, [browserChromeColor]);

  return (
    <div
      // iOS standalone first-principles contract:
      // - browsers/PWA manifests default to theme yellow when route-level chrome
      //   cannot be applied reliably
      // - mobile detail routes still update theme-color and this wrapper to match
      //   their white top surface
      className={`flex min-h-0 flex-1 flex-col font-display ${isMobileTabRoot ? "bg-brutal-yellow" : "bg-white md:bg-brutal-cream"}`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* System notifications live in the Notification Center popup, hung off the LeftRail
          (desktop) and the Chat-tab navbar (mobile). The previous global
          top banner stack covered itself when multiple conditions fired at
          once; collecting them into a notification-center popover (per
          stdrc 2026-05-02 #proj-uiux:f87f6eb9 task #94) makes the full
          list visible without stealing layout height. */}
      <PwaInstallPrompt />

      <div className="flex min-h-0 flex-1">
        {/* Left rail — desktop only. Hosts server switcher (top), sidebar tab
            icons (Chat/Members), and Settings (bottom). On mobile the
            equivalent surfaces live in the in-Sidebar server header and the
            bottom MobileTabBar. */}
        <LeftRail hidden={mobileShowSidebarInline} />

        {/* Sidebar container:
            - Mobile root: relative, full width, inline as main content (the "Chat tab")
            - Mobile detail: hidden (no drawer on mobile — detail views cover everything)
            - Desktop: always relative inline at resizable width
            - Tasks rail mode: hidden (TasksPanel takes the full main area). */}
        <div
          className={
            hideSidebar
              ? "hidden"
              : mobileShowSidebarInline
                ? "relative z-auto flex min-w-0 flex-1"
                : `hidden md:relative md:flex md:z-auto`
          }
        >
          <div
            // stdrc 2026-05-02 #proj-uiux:95e25b5b ec1523d9: invert
            // sidebar/main relationship — sidebar uses warm cream
            // (`bg-brutal-cream`), main panel uses bright white. After
            // research-driven iterations through paper/yellow/cool-gray
            // candidates, the cleanest hierarchy is the inversion:
            // LeftRail (yellow) → Sidebar (cream) → Main (white).
            className={`bg-brutal-cream relative min-w-0 ${mobileShowSidebarInline ? "flex-1" : "shrink-0"}`}
            style={mobileShowSidebarInline ? undefined : { width: sidebarWidth }}
          >
            <Sidebar
              mobileInline={mobileShowSidebarInline}
              bottomSlot={isDesktop && !hideSidebar ? (
                <LiveAgentActivityBar variant="sidebar" />
              ) : undefined}
              onOpenSearch={() => {
                if (!serverSlug || location.pathname.endsWith("/search")) return;
                navigate(`/s/${serverSlug}/search`, {
                  state: { searchFrom: `${location.pathname}${location.search}` },
                });
              }}
            />
            {/* Resize handle (desktop only) */}
            <div
              className="hidden md:block absolute right-0 top-0 bottom-0 w-2 -mr-1 z-10 cursor-col-resize select-none"
              onPointerDown={handleSidebarResizeStart}
              onPointerMove={handleSidebarResizeMove}
              onPointerUp={handleSidebarResizeEnd}
              onPointerCancel={handleSidebarResizeEnd}
            />
          </div>
        </div>

        {/* Main content — hidden on mobile root views (sidebar is the content),
            visible on mobile detail views and always on desktop.
            stdrc 2026-05-02 #proj-uiux:95e25b5b ec1523d9: bg-white on
            desktop so the whole main column reads as bright white,
            inverted with sidebar's warm cream. Mobile keeps the
            inherited cream so sidebar↔main aren't visually separated
            on small screens where they aren't side-by-side. */}
        <div className={`relative min-h-0 min-w-0 flex-1 ${mobileShowSidebarInline ? "hidden" : "flex"} md:bg-white`}>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Routes>
              <Route path="channel/:channelId" element={<ChannelRoute />} />
              <Route path="dm/:dmId" element={<DmRoute />} />
              <Route path="agent/:agentId" element={<AgentRoute />} />
              <Route path="computer/:machineId" element={<MachineRoute />} />
              {/* Legacy /machine/:id — kept so external links and bookmarks
                  still work; redirected to /computer/:id by RailNavCompat. */}
              <Route path="machine/:machineId" element={<MachineRoute />} />
              <Route path="human/:userId" element={<HumanRoute />} />
              <Route path="members/graph" element={<MemberGraphRoute />} />
              <Route path="members" element={<EmptyRoute />} />
              <Route path="computers" element={<ComputersRoute />} />
              <Route path="search" element={<MessageSearchPage />} />
              <Route path="settings/:tab?" element={<SettingsRoute />} />
              <Route path="inbox" element={<ThreadsRoute />} />
              <Route path="threads" element={<LegacyThreadsRedirect />} />
              <Route path="tasks" element={<TasksRoute />} />
              <Route path="saved" element={<SavedRoute />} />
              <Route path="release-notes" element={<ReleaseNotesRoute />} />
              <Route path="*" element={<DefaultRoute />} />
            </Routes>
          </div>
          <RightPanel />
        </div>
      </div>

      {!isDesktop && mobileTabBarVisible ? (
        <div className="md:hidden shrink-0">
          <LiveAgentActivityBar variant="mobile" />
        </div>
      ) : null}

      {/* Mobile tab bar — in-flow at the bottom of the flex column so it
          sits inside the visual viewport (#root is pinned to visualViewport
          via CSS vars). Auto-hides on detail views and desktop. */}
      <MobileTabBar />
      <OwnerOnboardingModal />
      {showAddMachine && (
        <AddMachineDialog onClose={() => setShowAddMachine(false)} />
      )}
      {showCreateAgent && (
        <CreateAgentDialog
          onboarding={createAgentOnboarding}
          onClose={() => setShowCreateAgent(false)}
        />
      )}
      <AnnouncementModal />
    </div>
  );
}
