import { useState, useEffect, useCallback, useLayoutEffect, useRef, useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Archive, Plus, Trash2, ChevronRight, ChevronDown, ChevronLeft, User, MessageSquare, Monitor, Bot, X, Pencil, Mail, MailOpen, Bookmark, FileText, Search, Pin, PinOff, Square, RotateCcw, Play, Bell, Building2, Activity, ArrowUpDown, Languages, GitBranch, Type, CreditCard, Shield, Link2 } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Modal from "../Modal";
import api from "../../api/client";
import { useChannelStore, type Channel } from "../../store/channelStore";
import { resolveAgentDisplayState, useAgentStore, type Agent } from "../../store/agentStore";
import { useMachineStore } from "../../store/machineStore";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import { useUIStore } from "../../store/uiStore";
import { useMessageStore } from "../../store/messageStore";
import { useThreadStore } from "../../store/threadStore";
import { getInboxItemKey, useInboxStore } from "../../store/inboxStore";
import { useSavedStore } from "../../store/savedStore";
import { useProfileStore } from "../../store/profileStore";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { useRailMode } from "../../hooks/useSidebarTab";
import AttentionDot from "../ui/AttentionDot";
import Banner from "../ui/Banner";
import ContextMenuDivider from "../ui/ContextMenuDivider";
import MenuItem from "../ui/MenuItem";
import SelectionPopover from "../ui/SelectionPopover";
import StatusDot from "../ui/StatusDot";
import { useLongPress } from "../../hooks/useLongPress";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import CreateChannelDialog from "../channel/CreateChannelDialog";
import CreateJointChannelDialog from "../channel/CreateJointChannelDialog";
import { ChannelKindIcon } from "../channel/channelKindIcon";
import InviteHumanDialog from "../member/InviteHumanDialog";
import CreateAgentDialog from "../agent/CreateAgentDialog";
import ResetAgentDialog from "../agent/ResetAgentDialog";
import ConfirmDialog from "../ConfirmDialog";
import AvatarSlot from "../ui/AvatarSlot";
import ServerSwitcherMenu from "../ui/ServerSwitcherMenu";
import DismissBackdrop from "../ui/DismissBackdrop";
import { getSidebarDmContextTarget } from "./sidebarDmContext";
import { placeSidebarContextMenu } from "./sidebarContextMenuPosition";
import { sortSidebarChannels, sortSidebarDms, sortSidebarPinnedItems, sidebarDmLabel, type SidebarSortMode } from "./sidebarSort";
import NotificationTrigger from "./NotificationTrigger";

interface CtxMenu {
  x: number;
  y: number;
  type: "channel" | "agent" | "human" | "dm" | "machine" | "member-human" | "member-agent";
  id: string;
}

type PinnedDisplayItem =
  | { id: string; type: "channel"; channel: Channel; createdAt: string; lastMessageAt?: string | null; label: string }
  | { id: string; type: "dm"; dm: Channel; createdAt: string; lastMessageAt?: string | null; label: string }
  | { id: string; type: "agent"; agent: Agent; createdAt: string; lastMessageAt?: string | null; label: string };

interface CollapsedSections {
  pinned: boolean;
  jointChannels: boolean;
  channels: boolean;
  humans: boolean;
  agents: boolean;
  machinesAgents: boolean;
}

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, idx) => value === b[idx]);
}

function reconcileOrderIds<T extends { id: string }>(
  items: T[],
  storedIds: string[],
  pinnedId?: string | null,
): string[] {
  const itemIds = new Set(items.map((item) => item.id));
  const next: string[] = [];

  if (pinnedId && itemIds.has(pinnedId)) next.push(pinnedId);

  for (const id of storedIds) {
    if (id === pinnedId) continue;
    if (itemIds.has(id) && !next.includes(id)) next.push(id);
  }

  for (const item of items) {
    if (item.id === pinnedId) continue;
    if (!next.includes(item.id)) next.push(item.id);
  }

  return next;
}

function orderByIds<T extends { id: string }>(items: T[], orderedIds: string[]): T[] {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  return orderedIds.map((id) => itemMap.get(id)).filter((item): item is T => !!item);
}

const SIDEBAR_SORT_MODES: SidebarSortMode[] = ["manual", "recent", "az"];
const SIDEBAR_SORT_LABELS: Record<SidebarSortMode, string> = {
  manual: "Manual",
  recent: "Recent",
  az: "A-Z",
};
type SidebarSortSection = "pinned" | "channels" | "dms";
const SIDEBAR_SECTION_ROW_CLASS = "mb-1 mt-3 flex h-6 items-center justify-between px-2";
// Pinned by sidebarWidthContract.test.ts as a sibling design-token to
// SIDEBAR_SECTION_ROW_CLASS — currently has no callsite after a layout
// refactor, but the contract test keeps the literal so future "first
// section" geometry stays explicit / reuse-ready. `void` keeps it lint-clean
// without removing the test pin.
const SIDEBAR_SECTION_ROW_FIRST_CLASS = "mb-1 flex h-6 items-center justify-between px-2";
void SIDEBAR_SECTION_ROW_FIRST_CLASS;
const SIDEBAR_SECTION_TOGGLE_CLASS = "flex h-6 min-w-0 flex-1 items-center gap-1 text-xs font-bold uppercase text-black tracking-widest hover:text-black/70 transition-colors";
const SIDEBAR_SECTION_ICON_BUTTON_CLASS = "btn-flat-sm flex size-6 items-center justify-center p-0";

interface SidebarProps {
  onOpenSearch?: () => void;
  mobileInline?: boolean;
  bottomSlot?: ReactNode;
}

function SortableSidebarItem({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const verticalTransform = transform ? { ...transform, x: 0 } : null;
  const style = {
    transform: CSS.Transform.toString(verticalTransform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}

export default function Sidebar({ onOpenSearch, mobileInline, bottomSlot }: SidebarProps) {
  const channels = useChannelStore((s) => s.channels);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const deleteChannel = useChannelStore((s) => s.deleteChannel);
  const archiveChannel = useChannelStore((s) => s.archiveChannel);
  const openUserDM = useChannelStore((s) => s.openUserDM);
  const openDM = useChannelStore((s) => s.openDM);
  const allAgents = useAgentStore((s) => s.agents);
  const agents = useMemo(() => allAgents.filter((a) => !a.deletedAt), [allAgents]);
  const agentActivities = useAgentStore((s) => s.agentActivities);
  const deleteAgent = useAgentStore((s) => s.deleteAgent);
  const startAgent = useAgentStore((s) => s.startAgent);
  const stopAgent = useAgentStore((s) => s.stopAgent);
  const setShowCreateAgent = useAgentStore((s) => s.setShowCreateAgent);
  const machines = useMachineStore((s) => s.machines);
  const deleteMachine = useMachineStore((s) => s.deleteMachine);
  const setShowAddMachine = useMachineStore((s) => s.setShowAddMachine);
  const user = useAuthStore((s) => s.user);
  const server = useServerStore((s) => s.current);
  const servers = useServerStore((s) => s.servers);
  const sidebarOrder = useServerStore((s) => s.sidebarOrder);
  const updateSidebarOrder = useServerStore((s) => s.updateSidebarOrder);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const unreadCounts = useMessageStore((s) => s.unreadCounts);
  const drafts = useMessageStore((s) => s.drafts);
  const markRead = useMessageStore((s) => s.markRead);
  const markUnread = useMessageStore((s) => s.markUnread);
  const inboxTotalCount = useInboxStore((s) => s.totalCount);
  const inboxTotalUnreadCount = useInboxStore((s) => s.totalUnreadCount);
  const loadInbox = useInboxStore((s) => s.loadInbox);
  const savedItems = useSavedStore((s) => s.saved);
  const navigate = useNavigate();
  const nav = useAppNavigate();
  const location = useLocation();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateJointChannel, setShowCreateJointChannel] = useState(false);
  const [showCreateChannelMenu, setShowCreateChannelMenu] = useState(false);
  const createChannelMenuRef = useRef<HTMLDivElement | null>(null);
  const [showInviteHuman, setShowInviteHuman] = useState(false);
  const [createAgentForMachineId, setCreateAgentForMachineId] = useState<string | null>(null);
  const [serverUnreadCounts, setServerUnreadCounts] = useState<Record<string, number>>({});
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const ctxMenuRef = useRef<HTMLDivElement | null>(null);
  // iOS PWA (display:standalone) does not reliably suppress the synthetic
  // click after a long-press touchend, even with e.preventDefault(). That
  // phantom click would land on the context menu overlay or a menu button
  // and close the menu the instant the finger lifted. We absorb clicks with
  // an invisible full-screen shield for ~500ms after a long-press opens the
  // menu, then remove it so the user can interact normally.
  const [ctxMenuClickShielded, setCtxMenuClickShielded] = useState(false);
  const ctxMenuShieldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "channel" | "agent" | "machine";
    id: string;
    name: string;
  } | null>(null);
  const [stopAgentConfirm, setStopAgentConfirm] = useState<{ id: string; name: string } | null>(null);
  const [resetAgentTarget, setResetAgentTarget] = useState<{ id: string; name: string } | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const members = useServerStore((s) => s.members);
  const canCreateJointChannel = server?.slug === "botiverse";
  const { capabilities } = useServerPermissions();
  const canManageServer = capabilities.manageServer;
  const hideHumansFromMembers = server?.role === "member" && server.hideHumansFromMembers;
  // The single source of truth for which left-column surface is active.
  // Both Sidebar and LeftRail derive from useRailMode(), which reads the
  // URL — so the rail's highlighted button and the sidebar's content stay
  // strictly in sync. On mobile the LeftRail is hidden; the 4-tab mobile
  // bar maps /computers back to the Settings tab (Computers is reachable
  // from the Settings sub-nav, not Members).
  const { railMode, selectRailMode } = useRailMode();
  const activeTab: "chat" | "members" = railMode === "members" ? "members" : "chat";
  const selectSidebarTab = useCallback(
    (tab: "chat" | "members") => selectRailMode(tab),
    [selectRailMode],
  );

  const [collapsed, setCollapsed] = useState<CollapsedSections>(() => {
    const defaults: CollapsedSections = { pinned: false, jointChannels: false, channels: false, humans: false, agents: false, machinesAgents: false };
    try {
      const stored = localStorage.getItem("slock:sidebarCollapsed");
      if (stored) return { ...defaults, ...JSON.parse(stored) };
    } catch {}
    return defaults;
  });
  const channelSortMode = sidebarOrder.channelSortMode;
  const dmSortMode = sidebarOrder.dmSortMode;
  const pinnedSortMode = sidebarOrder.pinnedSortMode;
  const [openSortMenu, setOpenSortMenu] = useState<SidebarSortSection | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  const updatePinnedSortMode = useCallback((mode: SidebarSortMode) => {
    void updateSidebarOrder({ pinnedSortMode: mode });
  }, [updateSidebarOrder]);

  const updateChannelSortMode = useCallback((mode: SidebarSortMode) => {
    void updateSidebarOrder({ channelSortMode: mode });
  }, [updateSidebarOrder]);

  const updateDmSortMode = useCallback((mode: SidebarSortMode) => {
    void updateSidebarOrder({ dmSortMode: mode });
  }, [updateSidebarOrder]);

  useEffect(() => {
    if (!openSortMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && sortMenuRef.current?.contains(target)) return;
      setOpenSortMenu(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSortMenu(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openSortMenu]);

  useEffect(() => {
    if (!showCreateChannelMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && createChannelMenuRef.current?.contains(target)) return;
      setShowCreateChannelMenu(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowCreateChannelMenu(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCreateChannelMenu]);

  useEffect(() => {
    void loadInbox({ reset: true });
  }, [loadInbox, server?.id]);

  const focusFirstUnreadInboxItem = useCallback(() => {
    void (async () => {
      let firstUnread = useInboxStore.getState().items.find((item) => item.unreadCount > 0);
      if (!firstUnread) {
        await useInboxStore.getState().loadInbox({ reset: true });
        firstUnread = useInboxStore.getState().items.find((item) => item.unreadCount > 0);
      }
      useInboxStore.getState().setFocusedItemKey(firstUnread ? getInboxItemKey(firstUnread) : null);
    })();
  }, []);

  // Closed DMs — server-synced via sidebarOrder for cross-device consistency
  const closedDmIds = useMemo(() => new Set(sidebarOrder.hiddenDmIds), [sidebarOrder.hiddenDmIds]);
  const closeDm = useCallback((dmId: string) => {
    const current = sidebarOrder.hiddenDmIds;
    if (current.includes(dmId)) return;
    void updateSidebarOrder({ hiddenDmIds: [...current, dmId] });
    // Navigate away if the closed DM is currently active
    const slug = useServerStore.getState().current?.slug;
    if (slug && location.pathname === `/s/${slug}/dm/${dmId}`) {
      navigate(`/s/${slug}`);
    }
  }, [sidebarOrder.hiddenDmIds, updateSidebarOrder, location.pathname, navigate]);
  const reopenDm = useCallback((dmId: string) => {
    const current = sidebarOrder.hiddenDmIds;
    if (!current.includes(dmId)) return;
    void updateSidebarOrder({ hiddenDmIds: current.filter((id) => id !== dmId) });
  }, [sidebarOrder.hiddenDmIds, updateSidebarOrder]);

  const [channelOrderIds, setChannelOrderIds] = useState<string[]>([]);
  const [dmOrderIds, setDmOrderIds] = useState<string[]>([]);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 10 } }),
  );
  const allChannelId = useMemo(() => channels.find((channel) => channel.name === "all")?.id ?? null, [channels]);

  useEffect(() => {
    const next = reconcileOrderIds(channels, sidebarOrder.channelOrder, allChannelId);
    setChannelOrderIds((prev) => arraysEqual(prev, next) ? prev : next);
  }, [sidebarOrder.channelOrder, channels, allChannelId]);

  useEffect(() => {
    const next = reconcileOrderIds(dmChannels, sidebarOrder.dmOrder);
    setDmOrderIds((prev) => arraysEqual(prev, next) ? prev : next);
  }, [sidebarOrder.dmOrder, dmChannels]);


  const toggleSection = (section: keyof CollapsedSections) => {
    setCollapsed((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      try { localStorage.setItem("slock:sidebarCollapsed", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const loadServerUnreadSummary = useCallback(async () => {
    try {
      const { data } = await api.get("/servers/unread-summary");
      const next: Record<string, number> = {};
      if (Array.isArray(data)) {
        for (const row of data) {
          if (!row || typeof row !== "object") continue;
          const entry = row as { serverId?: unknown; unreadCount?: unknown };
          const serverId = typeof entry.serverId === "string" ? entry.serverId : null;
          const unreadCount = Number(entry.unreadCount);
          if (!serverId || !Number.isFinite(unreadCount)) continue;
          next[serverId] = Math.max(0, Math.floor(unreadCount));
        }
      }
      setServerUnreadCounts(next);
    } catch {
      // Ignore fetch failures to avoid sidebar noise.
    }
  }, []);

  useEffect(() => {
    if (!user || servers.length === 0) {
      setServerUnreadCounts({});
      return;
    }

    loadServerUnreadSummary();

    const intervalId = window.setInterval(() => {
      loadServerUnreadSummary();
    }, 30_000);
    const handleFocus = () => {
      loadServerUnreadSummary();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadServerUnreadSummary();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, servers, loadServerUnreadSummary]);

  // Refresh server unread summary eagerly when unread counters change
  // (e.g. incoming message or mark-read), instead of waiting for polling.
  useEffect(() => {
    if (!user || servers.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      loadServerUnreadSummary();
    }, 150);
    return () => window.clearTimeout(timeoutId);
  }, [unreadCounts, user, servers.length, loadServerUnreadSummary]);

  const hasOtherServerUnread = useMemo(
    () => servers.some((s) => s.id !== server?.id && (serverUnreadCounts[s.id] || 0) > 0),
    [servers, server?.id, serverUnreadCounts]
  );

  // Auto-expand collapsed sections when navigating to an item inside them
  useEffect(() => {
    const path = location.pathname;
    const channelMatch = path.match(/\/channel\/(.+)/);
    const dmMatch = path.match(/\/dm\/(.+)/);
    const agentMatch = path.match(/\/agent\/(.+)/);
    const machineMatch = path.match(/\/machine\/(.+)/);
    const humanMatch = path.match(/\/human\/(.+)/);

    if (channelMatch) {
      if (collapsed.channels) setCollapsed((prev) => ({ ...prev, channels: false }));
    } else if (dmMatch) {
      // Expand DMs section (reuses agents collapsed state)
      if (collapsed.agents) setCollapsed((prev) => ({ ...prev, agents: false }));
      // Reopen DM if it was closed (e.g. navigated via Message button)
      reopenDm(dmMatch[1]);
    } else if (agentMatch) {
      // Expand agents in Tab 1
      if (collapsed.agents) setCollapsed((prev) => ({ ...prev, agents: false }));
      // Also expand in Tab 2
      if (collapsed.machinesAgents) setCollapsed((prev) => ({ ...prev, machinesAgents: false }));
    } else if (machineMatch) {
      if (collapsed.machinesAgents) setCollapsed((prev) => ({ ...prev, machinesAgents: false }));
    } else if (humanMatch) {
      if (collapsed.humans) setCollapsed((prev) => ({ ...prev, humans: false }));
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close context menu on Escape. Outside-click is handled by the overlay
  // div in the portal (below) — using a document mousedown listener here
  // would race with iOS's synthetic mousedown after a long-press touchend,
  // closing the menu the instant it opens. The overlay pattern is the same
  // one MessageItem uses for its context menu.
  const closeCtx = useCallback(() => setCtxMenu(null), []);
  useEffect(() => {
    if (!ctxMenu) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCtx();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ctxMenu, closeCtx]);

  // Close user menu on outside click or Escape
  useEffect(() => {
    if (!showUserMenu) return;
    const onMouseDown = () => setShowUserMenu(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowUserMenu(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showUserMenu]);

  // Server-menu outside-click + ESC dismissal lives inside
  // <ServerSwitcherMenu>. The mobile pill trigger below uses
  // `onMouseDown={(e) => e.stopPropagation()}` to keep toggling from racing
  // the primitive's document mousedown listener.

  const markUnreadSidebarItemRead = useCallback((channelId: string) => {
    const messageStore = useMessageStore.getState();
    if (!messageStore.unreadCounts[channelId]) return;

    messageStore.clearUnread(channelId);
    void messageStore.markRead(channelId).catch(() => {
      void messageStore.loadUnreadCounts();
    });
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    if (channelLongPress.suppressClickRef.current) return;
    markUnreadSidebarItemRead(channel.id);
    nav.toChannel(channel.id);
    setSidebarOpen(false);
  };

  const handleSelectDm = (dmChannelId: string) => {
    if (channelLongPress.suppressClickRef.current) return;
    markUnreadSidebarItemRead(dmChannelId);
    nav.toDm(dmChannelId);
    setSidebarOpen(false);
  };

  const closeRightPanel = () => {
    useProfileStore.getState().closeProfile();
    useThreadStore.getState().closeThread();
  };

  const handleSelectAgent = (agentId: string) => {
    if (channelLongPress.suppressClickRef.current) return;
    nav.toAgent(agentId);
    closeRightPanel();
    setSidebarOpen(false);
  };

  const handleSelectMachine = (machineId: string) => {
    if (channelLongPress.suppressClickRef.current) return;
    nav.toComputer(machineId);
    closeRightPanel();
    setSidebarOpen(false);
  };

  const handleSelectHuman = (userId: string) => {
    if (channelLongPress.suppressClickRef.current) return;
    nav.toHuman(userId);
    closeRightPanel();
    setSidebarOpen(false);
  };

  const openCtxMenu = (e: React.MouseEvent, type: CtxMenu["type"], id: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Skip if useLongPress already opened the menu (prevents double-open on mobile)
    if (channelLongPress.suppressClickRef.current) return;
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      id,
    });
  };

  const openCtxMenuAt = (x: number, y: number, type: CtxMenu["type"], id: string) => {
    setCtxMenu({
      x,
      y,
      type,
      id,
    });
    // Shield against the phantom click that fires after the long-press
    // touchend on iOS PWA standalone mode. Without this, the synthetic
    // click lands on the overlay (or the first menu button, if the finger
    // happens to be over it) and closes the menu immediately.
    setCtxMenuClickShielded(true);
    if (ctxMenuShieldTimerRef.current) clearTimeout(ctxMenuShieldTimerRef.current);
    ctxMenuShieldTimerRef.current = setTimeout(() => {
      setCtxMenuClickShielded(false);
      ctxMenuShieldTimerRef.current = null;
    }, 500);
  };

  // Long-press handlers for touch devices — one per sidebar section
  const channelLongPress = useLongPress(
    (coords) => {
      // Find which channel element was pressed via a ref-free approach:
      // We store the pending ID in a ref that gets set onTouchStart
      if (longPressTargetRef.current) {
        openCtxMenuAt(coords.x, coords.y, longPressTargetRef.current.type, longPressTargetRef.current.id);
      }
    }
  );

  // Ref to track which item is being long-pressed
  const longPressTargetRef = useRef<{ type: CtxMenu["type"]; id: string } | null>(null);

  const makeLongPressHandlers = (type: CtxMenu["type"], id: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      longPressTargetRef.current = { type, id };
      channelLongPress.onTouchStart(e);
    },
    onTouchEnd: (e: React.TouchEvent) => channelLongPress.onTouchEnd(e),
    onTouchMove: (e: React.TouchEvent) => channelLongPress.onTouchMove(e),
    onTouchCancel: () => channelLongPress.onTouchCancel(),
  });

  useLayoutEffect(() => {
    if (!ctxMenu) return;
    const menuEl = ctxMenuRef.current;
    if (!menuEl) return;
    const rect = menuEl.getBoundingClientRect();
    const next = placeSidebarContextMenu({
      x: ctxMenu.x,
      y: ctxMenu.y,
      menuWidth: rect.width,
      menuHeight: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    if (next.x === ctxMenu.x && next.y === ctxMenu.y) return;
    setCtxMenu((current) => {
      if (!current || current.type !== ctxMenu.type || current.id !== ctxMenu.id) return current;
      if (current.x !== ctxMenu.x || current.y !== ctxMenu.y) return current;
      return { ...current, ...next };
    });
  }, [ctxMenu]);

  const serverSlug = useServerStore((s) => s.current?.slug);
  const pathBase = serverSlug ? `/s/${serverSlug}` : "";
  const isSelected = (channel: Channel) => {
    return location.pathname === `${pathBase}/channel/${channel.id}`;
  };
  const isDmSelected = (dmId: string) => location.pathname === `${pathBase}/dm/${dmId}`;
  const isAgentSelected = (agentId: string) => location.pathname === `${pathBase}/agent/${agentId}`;
  const isMachineSelected = (machineId: string) =>
    location.pathname === `${pathBase}/computer/${machineId}`
    || location.pathname === `${pathBase}/machine/${machineId}`;
  const isHumanSelected = (userId: string) => location.pathname === `${pathBase}/human/${userId}`;
  const isReleaseNotesRoute = location.pathname.startsWith(`${pathBase}/release-notes`);

  // Settings-mode sidebar contents — when the user is in the Settings rail
  // mode, the sidebar shows a sub-nav of settings sections (Account /
  // Browser / Server / Release Notes, plus Computers on mobile) with their
  // canonical icons. The main panel renders the active sub-page; Logout
  // lives at the bottom of the Account page itself, not as a sidebar item.
  //
  // Computers is part of this sub-nav ONLY on mobile. Desktop has a
  // dedicated Computers rail mode in the LeftRail — adding Computers to
  // the Settings sub-nav there would be a duplicate entry point. Mobile's
  // 4-tab bar (Chat/Tasks/Members/Settings) folds Computers into Settings
  // instead of giving it its own tab (per @stdrc 2026-04-30 #proj-uiux:c8711d2a).
  const isComputersRoute =
    pathBase &&
    (location.pathname === `${pathBase}/computers`
      || location.pathname.startsWith(`${pathBase}/computers/`)
      || location.pathname.startsWith(`${pathBase}/computer/`)
      || location.pathname.startsWith(`${pathBase}/machine/`)); // legacy
  // On mobile, `/settings` is the Settings tab ROOT — a list of sub-items
  // with no sub-page rendered yet. Nothing should be highlighted until the
  // user actually picks a sub-tab. On desktop, `/settings` still defaults
  // to Account (SettingsRoute renders Account content there) so keep the
  // existing highlight behavior. Fix reported by @stdrc 2026-05-01
  // `#proj-uiux:c8711d2a` msg 83123f2b.
  const settingsTabFromPath: string | null = (() => {
    if (isComputersRoute) return "computers";
    if (isReleaseNotesRoute) return "release-notes";
    const m = location.pathname.match(new RegExp(`^${pathBase.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")}/settings(?:/([^/?#]+))?`));
    if (!m) return null;
    const t = m[1];
    if (!t) return mobileInline ? null : "account";
    if (t === "browser") return "notifications";
    if (t === "moderation") return "administration";
    if (t === "language-region" || t === "appearance" || t === "notifications" || t === "server" || t === "billing" || t === "administration" || t === "integrations") return t;
    if (t === "account") return "account";
    return null;
  })();
  type SettingsItem = { id: string; label: string; icon: React.ReactNode; onClick: () => void };
  type SettingsGroup = { label: string; items: SettingsItem[] };
  const settingsSidebarGroups: SettingsGroup[] = pathBase
    ? [
        {
          label: "Personal",
          items: [
            { id: "account", label: "Account", icon: <User size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/account`) },
            { id: "language-region", label: "Language & Region", icon: <Languages size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/language-region`) },
            { id: "appearance", label: "Appearance", icon: <Type size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/appearance`) },
            { id: "notifications", label: "Notifications", icon: <Bell size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/notifications`) },
          ],
        },
        {
          label: "Server",
          items: [
            { id: "server", label: "Server Profile", icon: <Building2 size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/server`) },
            { id: "billing", label: "Plan & Billing", icon: <CreditCard size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/billing`) },
            { id: "administration", label: "Administration", icon: <Shield size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/administration`) },
            { id: "integrations", label: "Connected Apps", icon: <Link2 size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/settings/integrations`) },
            ...(mobileInline
              ? [{ id: "computers", label: "Computers", icon: <Monitor size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/computers`) }]
              : []),
          ],
        },
        {
          label: "About",
          items: [
            { id: "release-notes", label: "Release Notes", icon: <FileText size={14} className="shrink-0" />, onClick: () => navigate(`${pathBase}/release-notes`) },
          ],
        },
      ]
    : [];

  const sidebarItemClass = (selected: boolean, menuOpen = false) =>
    `mb-1  flex w-full items-center gap-1.5 px-2 py-2 [@media(max-height:600px)]:py-1 md:py-1 text-sm font-medium border-2 ${
      selected
        ? "border-black bg-brutal-pink text-black shadow-brutal-sm font-bold"
        : menuOpen
        ? "border-black bg-white shadow-brutal-sm"
        : "border-transparent hover:border-black hover:bg-white hover:shadow-brutal-sm active:border-black active:bg-white active:shadow-brutal-sm transition-colors"
    }`;

  const sidebarScrollClassName = "flex-1 overflow-x-hidden overflow-y-auto px-2 py-3";

  const renderSortMenu = (
    section: SidebarSortSection,
    value: SidebarSortMode,
    onChange: (value: SidebarSortMode) => void,
  ) => {
    const isOpen = openSortMenu === section;
    // Sidebar sort = single-select dropdown — delegated to SelectionPopover
    // so the ✓ position (right) and hover token (`bg-brutal-yellow/30`)
    // match the rest of the Selection family. stdrc 2026-05-25
    // #proj-theme:ac79cf20 msg=8fdf9cba + msg=b0b92c1c. Removes the older
    // hand-rolled `<button role="menuitemradio">` rows that put ✓ on the
    // left and used full-saturation `bg-brutal-yellow` for both hover and
    // selected fill (Linear/Notion/GitHub/Figma all put ✓ on the right
    // for single-select dropdowns).
    return (
      <div ref={isOpen ? sortMenuRef : undefined} className="relative shrink-0">
        <button
          type="button"
          aria-label="Sort sidebar conversations"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          data-testid="sidebar-sort-menu-button"
          data-sort-section={section}
          title={`Sort sidebar conversations: ${SIDEBAR_SORT_LABELS[value]}`}
          onClick={(event) => {
            event.stopPropagation();
            setOpenSortMenu((current) => (current === section ? null : section));
          }}
          className={SIDEBAR_SECTION_ICON_BUTTON_CLASS}
        >
          <ArrowUpDown size={14} />
        </button>
        {isOpen && (
          <SelectionPopover
            title="Sort"
            showHeader={false}
            className="absolute right-0 top-8 z-50 min-w-[136px] overflow-hidden border-2 border-black bg-white shadow-brutal"
            options={SIDEBAR_SORT_MODES.map((mode) => ({
              key: mode,
              checked: mode === value,
              label: SIDEBAR_SORT_LABELS[mode],
              onClick: () => {
                onChange(mode);
                setOpenSortMenu(null);
              },
            }))}
          />
        )}
      </div>
    );
  };

  const openCreateChannelDialog = () => {
    setShowCreateChannelMenu(false);
    setShowCreateChannel(true);
  };

  const openCreateJointChannelDialog = () => {
    if (!canCreateJointChannel) return;
    setShowCreateChannelMenu(false);
    setShowCreateJointChannel(true);
  };

  const renderChannelActionMenu = () => {
    if (!canManageServer && !canCreateJointChannel) return null;

    return (
      <div ref={showCreateChannelMenu ? createChannelMenuRef : undefined} className="relative shrink-0">
        <button
          type="button"
          aria-label="Add channel"
          aria-haspopup="menu"
          aria-expanded={showCreateChannelMenu}
          title="Add channel"
          onClick={(event) => {
            event.stopPropagation();
            setOpenSortMenu(null);
            setShowCreateChannelMenu((current) => !current);
          }}
          className={SIDEBAR_SECTION_ICON_BUTTON_CLASS}
        >
          <Plus size={14} />
        </button>
        {showCreateChannelMenu && (
          <div
            role="menu"
            className="absolute right-0 top-8 z-50 min-w-[190px] overflow-hidden border-2 border-black bg-white shadow-brutal"
          >
            {canManageServer && (
              <MenuItem
                icon={<Plus size={14} className="shrink-0" />}
                onClick={(event) => {
                  event.stopPropagation();
                  openCreateChannelDialog();
                }}
              >
                Create Channel
              </MenuItem>
            )}
            {canCreateJointChannel && (
              <MenuItem
                icon={<GitBranch size={14} className="shrink-0" />}
                onClick={(event) => {
                  event.stopPropagation();
                  openCreateJointChannelDialog();
                }}
              >
                Create Joint Channel
              </MenuItem>
            )}
          </div>
        )}
      </div>
    );
  };

  // Pinned IDs (needed early for filtering)
  const pinnedChannelIds = sidebarOrder.pinnedChannelIds;
  const pinnedAgentIds = sidebarOrder.pinnedAgentIds;

  const orderedChannels = useMemo(
    () => sortSidebarChannels(orderByIds(channels.filter((channel) => !channel.archivedAt), channelOrderIds), channelSortMode, allChannelId),
    [channels, channelOrderIds, channelSortMode, allChannelId],
  );
  const orderedRegularChannels = useMemo(
    () => orderedChannels.filter((channel) => channel.type !== "joint"),
    [orderedChannels],
  );
  const orderedJointChannels = useMemo(
    () => orderedChannels.filter((channel) => channel.type === "joint"),
    [orderedChannels],
  );
  const pinnedChannel = useMemo(
    () => orderedRegularChannels.find((channel) => channel.id === allChannelId) ?? null,
    [orderedRegularChannels, allChannelId],
  );
  const sortableChannels = useMemo(
    () => orderedRegularChannels.filter((channel) => channel.id !== allChannelId && !pinnedChannelIds.includes(channel.id)),
    [orderedRegularChannels, allChannelId, pinnedChannelIds],
  );
  const sortableJointChannels = useMemo(
    () => orderedJointChannels.filter((channel) => !pinnedChannelIds.includes(channel.id)),
    [orderedJointChannels, pinnedChannelIds],
  );
  const sortableChannelIds = useMemo(() => sortableChannels.map((channel) => channel.id), [sortableChannels]);
  const sortableJointChannelIds = useMemo(() => sortableJointChannels.map((channel) => channel.id), [sortableJointChannels]);
  const channelManualSort = channelSortMode === "manual";
  const dmManualSort = dmSortMode === "manual";
  const pinnedManualSort = pinnedSortMode === "manual";

  // Map agent ID → DM unread count and DM channel ID (for draft lookup)
  const { agentDmUnread, agentDmChannelId } = useMemo(() => {
    const unread: Record<string, number> = {};
    const channelId: Record<string, string> = {};
    for (const dm of dmChannels) {
      if (dm.peerType === "agent" && dm.peerId) {
        channelId[dm.peerId] = dm.id;
        const count = unreadCounts[dm.id] || 0;
        if (count > 0) unread[dm.peerId] = count;
      }
    }
    return { agentDmUnread: unread, agentDmChannelId: channelId };
  }, [dmChannels, unreadCounts]);
  const pinnedChannels = useMemo(
    () => pinnedChannelIds
      .map((id) => channels.find((c) => c.id === id))
      .filter((c): c is Channel => !!c && !c.archivedAt),
    [pinnedChannelIds, channels],
  );
  const pinnedDms = useMemo(
    () => pinnedChannelIds.map((id) => dmChannels.find((c) => c.id === id)).filter((c): c is Channel => !!c),
    [pinnedChannelIds, dmChannels],
  );
  const pinnedAgents = useMemo(
    () => pinnedAgentIds.map((id) => agents.find((a) => a.id === id)).filter((a): a is typeof agents[0] => !!a),
    [pinnedAgentIds, agents],
  );
  const dmContextPeerIds = useMemo(() => ({
    agentIds: new Set(agents.map((agent) => agent.id)),
    humanIds: new Set(members.map((member) => member.userId)),
  }), [agents, members]);
  const hasPinned = pinnedChannels.length > 0 || pinnedDms.length > 0 || pinnedAgents.length > 0;

  // Combined pinned IDs for display ordering — reconcile stored pinnedOrder with actual pinned items
  const allPinnedIds = useMemo(() => new Set([...pinnedChannelIds, ...pinnedAgentIds]), [pinnedChannelIds, pinnedAgentIds]);
  const pinnedItemIds = useMemo(() => {
    const stored = sidebarOrder.pinnedOrder;
    const ordered: string[] = [];
    for (const id of stored) {
      if (allPinnedIds.has(id)) ordered.push(id);
    }
    // Append any pinned items not in stored order (newly pinned)
    for (const id of allPinnedIds) {
      if (!ordered.includes(id)) ordered.push(id);
    }
    return ordered;
  }, [sidebarOrder.pinnedOrder, allPinnedIds]);

  const pinnedItems = useMemo(() => {
    const channelById = new Map(pinnedChannels.map((channel) => [channel.id, channel]));
    const dmById = new Map(pinnedDms.map((dm) => [dm.id, dm]));
    const agentById = new Map(pinnedAgents.map((agent) => [agent.id, agent]));
    const agentDmById = new Map(dmChannels.filter((dm) => dm.peerType === "agent" && dm.peerId).map((dm) => [dm.peerId!, dm]));

    const manualItems: PinnedDisplayItem[] = [];
    for (const id of pinnedItemIds) {
      const channel = channelById.get(id);
      if (channel) {
        manualItems.push({ id, type: "channel", channel, createdAt: channel.createdAt, lastMessageAt: channel.lastMessageAt, label: channel.name });
        continue;
      }
      const dm = dmById.get(id);
      if (dm) {
        manualItems.push({ id, type: "dm", dm, createdAt: dm.createdAt, lastMessageAt: dm.lastMessageAt, label: sidebarDmLabel(dm) });
        continue;
      }
      const agent = agentById.get(id);
      if (agent) {
        const dmChannel = agentDmById.get(agent.id);
        manualItems.push({
          id,
          type: "agent",
          agent,
          createdAt: dmChannel?.createdAt ?? agent.createdAt,
          lastMessageAt: dmChannel?.lastMessageAt,
          label: agent.displayName || agent.name,
        });
      }
    }

    return sortSidebarPinnedItems(manualItems, pinnedSortMode);
  }, [pinnedItemIds, pinnedChannels, pinnedDms, pinnedAgents, dmChannels, pinnedSortMode]);

  const handlePinnedDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    if (!pinnedManualSort) return;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = pinnedItemIds.indexOf(activeId);
    const newIndex = pinnedItemIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(pinnedItemIds, oldIndex, newIndex);
    void updateSidebarOrder({ pinnedOrder: reordered });
  }, [pinnedItemIds, pinnedManualSort, updateSidebarOrder]);

  const togglePinChannel = useCallback((channelId: string) => {
    const current = sidebarOrder.pinnedChannelIds;
    const isPinned = current.includes(channelId);
    const nextPinned = isPinned ? current.filter((id) => id !== channelId) : [...current, channelId];
    const nextOrder = isPinned ? pinnedItemIds.filter((id) => id !== channelId) : [...pinnedItemIds, channelId];
    void updateSidebarOrder({ pinnedChannelIds: nextPinned, pinnedOrder: nextOrder });
  }, [sidebarOrder.pinnedChannelIds, pinnedItemIds, updateSidebarOrder]);

  const togglePinAgent = useCallback((agentId: string) => {
    const current = sidebarOrder.pinnedAgentIds;
    const isPinned = current.includes(agentId);
    const nextPinned = isPinned ? current.filter((id) => id !== agentId) : [...current, agentId];
    const nextOrder = isPinned ? pinnedItemIds.filter((id) => id !== agentId) : [...pinnedItemIds, agentId];
    void updateSidebarOrder({ pinnedAgentIds: nextPinned, pinnedOrder: nextOrder });
  }, [sidebarOrder.pinnedAgentIds, pinnedItemIds, updateSidebarOrder]);

  const handleChannelDragEnd = ({ active, over }: DragEndEvent) => {
    if (!channelManualSort) return;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = sortableChannelIds.indexOf(activeId);
    const newIndex = sortableChannelIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sortableChannelIds, oldIndex, newIndex);
    const remaining = [...reordered];
    const reorderedSet = new Set(reordered);
    const nextOrder = channelOrderIds.map((id) => reorderedSet.has(id) ? remaining.shift()! : id);
    setChannelOrderIds(nextOrder);
    void updateSidebarOrder({ channelOrder: nextOrder.filter((id) => id !== allChannelId) });
  };

  const handleJointChannelDragEnd = ({ active, over }: DragEndEvent) => {
    if (!channelManualSort) return;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = sortableJointChannelIds.indexOf(activeId);
    const newIndex = sortableJointChannelIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sortableJointChannelIds, oldIndex, newIndex);
    const remaining = [...reordered];
    const reorderedSet = new Set(reordered);
    const nextOrder = channelOrderIds.map((id) => reorderedSet.has(id) ? remaining.shift()! : id);
    setChannelOrderIds(nextOrder);
    void updateSidebarOrder({ channelOrder: nextOrder.filter((id) => id !== allChannelId) });
  };

  const handleDmDragEnd = ({ active, over }: DragEndEvent) => {
    if (!dmManualSort) return;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = dmOrderIds.indexOf(activeId);
    const newIndex = dmOrderIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(dmOrderIds, oldIndex, newIndex);
    setDmOrderIds(reordered);
    void updateSidebarOrder({ dmOrder: reordered });
  };

  const renderChannelItem = (channel: Channel) => {
    const unread = unreadCounts[channel.id] || 0;
    const hasDraft = !!drafts[channel.id];
    const dimmed = !isSelected(channel) && !channel.joined;
    return (
      <button
        key={channel.id}
        onClick={() => handleSelectChannel(channel)}
        onContextMenu={(e) => openCtxMenu(e, "channel", channel.id)}
        {...makeLongPressHandlers("channel", channel.id)}
        className={sidebarItemClass(isSelected(channel), ctxMenu?.type === "channel" && ctxMenu.id === channel.id)}
      >
        <div className="flex size-[18px] shrink-0 items-center justify-center">
          <ChannelKindIcon type={channel.type} className={dimmed ? "text-black/40" : ""} />
        </div>
        <span className={`min-w-0 flex-1 truncate text-left ${dimmed ? "text-black/40" : ""} ${unread && channel.joined ? "font-bold" : ""}`}>{channel.name}</span>
        {unread > 0 ? (
          channel.joined ? (
            <span className="ml-auto shrink-0 rounded bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white border border-black">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : (
            <span className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none text-black/50 font-mono">
              {unread > 99 ? "99+" : unread}
            </span>
          )
        ) : hasDraft && (
          <Pencil size={12} className="ml-auto shrink-0 text-black/40" />
        )}
      </button>
    );
  };


  /** Render agent as a DM conversation item (Chat tab) — navigates to /dm/:dmId */
  const renderAgentDmItem = (agent: typeof agents[0]) => {
    const displayState = resolveAgentDisplayState(agent, agentActivities[agent.id]);
    const dmId = agentDmChannelId[agent.id];
    const dmUnread = agentDmUnread[agent.id] || 0;
    const hasDraft = dmId ? !!drafts[dmId] : false;
    return (
      <button
        key={agent.id}
        onClick={() => dmId ? handleSelectDm(dmId) : handleSelectAgent(agent.id)}
        onContextMenu={(e) => openCtxMenu(e, "agent", agent.id)}
        {...makeLongPressHandlers("agent", agent.id)}
        className={sidebarItemClass(dmId ? isDmSelected(dmId) : false, ctxMenu?.type === "agent" && ctxMenu.id === agent.id)}
      >
        <AvatarSlot context="sidebar-list" type="agent" agentAvatarUrl={agent.avatarUrl} />
        <div className="flex min-w-0 flex-1 items-baseline gap-1 text-left">
          <span className={`shrink-0 max-w-[70%] truncate text-sm ${dmUnread > 0 ? "font-bold" : ""}`}>{agent.displayName || agent.name}</span>
          {agent.description && (
            <span className="min-w-0 flex-1 truncate text-xs text-black/40">{agent.description}</span>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          <StatusDot activity={displayState.activity} title={displayState.activityText} />
          {dmUnread > 0 ? (
            <span className="rounded bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white border border-black">
              {dmUnread > 99 ? "99+" : dmUnread}
            </span>
          ) : hasDraft && (
            <Pencil size={12} className="text-black/40" />
          )}
        </span>
      </button>
    );
  };

  const renderHumanDmItem = (dm: Channel) => {
    const unread = unreadCounts[dm.id] || 0;
    const hasDraft = !!drafts[dm.id];
    const dmCtxTarget = getSidebarDmContextTarget(dm, dmContextPeerIds);
    return (
      <button
        key={dm.id}
        data-sidebar-channel-id={dm.id}
        onClick={() => handleSelectDm(dm.id)}
        onContextMenu={(e) => openCtxMenu(e, dmCtxTarget.type, dmCtxTarget.id)}
        {...makeLongPressHandlers(dmCtxTarget.type, dmCtxTarget.id)}
        className={sidebarItemClass(isDmSelected(dm.id), ctxMenu?.type === dmCtxTarget.type && ctxMenu.id === dmCtxTarget.id)}
      >
        <AvatarSlot
          context="sidebar-list"
          type="human"
          humanAvatarUrl={dm.peerAvatarUrl ?? null}
          gravatarHash={dm.peerGravatarHash ?? null}
          humanPlaceholder={!dm.peerAvatarUrl && !dm.peerGravatarHash}
        />
        <div className="flex min-w-0 flex-1 items-baseline gap-1 text-left">
          <span className={`shrink-0 max-w-[70%] truncate text-sm ${unread > 0 ? "font-bold" : ""}`}>
            {dm.peerDisplayName || dm.peerName || dm.name}
          </span>
          {dm.peerDescription && (
            <span className="min-w-0 flex-1 truncate text-xs text-black/40">{dm.peerDescription}</span>
          )}
        </div>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {unread > 0 ? (
            <span className="rounded bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white border border-black">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : hasDraft && (
            <Pencil size={12} className="text-black/40" />
          )}
        </span>
      </button>
    );
  };

  /** Render agent as an entity item (Members tab) — navigates to /agent/:agentId */
  const renderAgentItem = (agent: typeof agents[0]) => {
    const displayState = resolveAgentDisplayState(agent, agentActivities[agent.id]);
    return (
      <button
        key={agent.id}
        onClick={() => handleSelectAgent(agent.id)}
        onContextMenu={(e) => openCtxMenu(e, "member-agent", agent.id)}
        {...makeLongPressHandlers("member-agent", agent.id)}
        className={sidebarItemClass(isAgentSelected(agent.id), ctxMenu?.type === "member-agent" && ctxMenu.id === agent.id)}
      >
        <AvatarSlot context="sidebar-list" type="agent" agentAvatarUrl={agent.avatarUrl} />
        <div className="flex min-w-0 flex-1 items-baseline gap-1 text-left">
          <span className="shrink-0 max-w-[70%] truncate text-sm">{agent.displayName || agent.name}</span>
          {agent.description && (
            <span className="min-w-0 flex-1 truncate text-xs text-black/40">{agent.description}</span>
          )}
        </div>
        <StatusDot activity={displayState.activity} className="shrink-0" title={displayState.activityText} />
      </button>
    );
  };

  const renderReadToggleAction = (channelId: string, hasUnread: boolean) => (
    <MenuItem
      icon={hasUnread ? <MailOpen size={14} /> : <Mail size={14} />}
      onClick={async () => {
        if (hasUnread) {
          await markRead(channelId);
        } else {
          await markUnread(channelId);
        }
        setCtxMenu(null);
      }}
    >
      {hasUnread ? "Mark as Read" : "Mark as Unread"}
    </MenuItem>
  );

  return (
    <>
      {/* stdrc 2026-05-02 #proj-uiux:95e25b5b 6e039b98:
          - Desktop side-by-side: Sidebar `bg-brutal-cream`, Main `bg-white`
          - Mobile (mobileInline): no side-by-side; every tab interior
            is white per "移动端的每一个界面背景色都应该相应地变成白色".
            Sidebar full-screens as one tab → `bg-white`. */}
      <div className={`relative flex h-full w-full flex-col ${mobileInline ? "" : "border-r-2 border-black"} ${mobileInline ? "bg-white" : "bg-brutal-cream"} text-black font-display select-none`}>
        {/* Mobile tab-root NavBar — yellow h-panel-header matching the level-2+
            panel headers so the brand yellow shows on every screen
            (@stdrc #proj-uiux:c8711d2a msgs 50ed96a6 + 83123f2b
            + 5013f840 2026-05-01).
            No tab icon — stdrc rejected the redundant Settings/Members/Hash
            glyph on the NavBar ("都不应该有那个 icon"). For the Chat tab
            the title text is also dropped: the ServerName pill is the
            only label, per "只显示一个 Server Name". For other tab roots
            (Settings / Members / Computers) the tab label sits on the
            left and the switcher pill stays on the right for server
            access. On desktop the switcher lives in the LeftRail, so we
            only need this header on mobile. */}
        {mobileInline && (
          <div className="relative flex h-panel-header shrink-0 items-center gap-3 border-b-2 border-black bg-brutal-yellow px-4">
            {railMode === "chat" ? (
              /* Home tab: ServerName pill on the LEFT — it IS the header.
                 No other tab renders the pill: stdrc msg 7b1cf65a
                 2026-05-01 `#proj-uiux:c8711d2a` "除了 Chat 之外的所有
                 其他区域，全都不要有 Server Name 那个选项". */
              <>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setShowServerMenu(!showServerMenu)}
                  /* stdrc 2026-05-02 #proj-uiux:648f8735 5db88a17:
                     在窄+矮屏（移动 + max-h:600）顶部 server-name 不要卡片，
                     直接文字 + chevron，UI 跟 Members / Settings 一致。
                     Tailwind 修饰符链 strip 掉 tilt / border / bg / shadow / pad。 */
                  className="relative inline-flex shrink-0 items-center gap-1.5 tilt-neg-2 [@media(max-height:600px)]:[transform:none] border-2 [@media(max-height:600px)]:border-0 border-black bg-black [@media(max-height:600px)]:bg-transparent px-3 [@media(max-height:600px)]:px-0 py-1 [@media(max-height:600px)]:py-0 font-display font-bold text-base text-brutal-yellow [@media(max-height:600px)]:text-black shadow-brutal-sm [@media(max-height:600px)]:shadow-none hover:shadow-brutal [@media(max-height:600px)]:hover:shadow-none transition-all duration-100 will-change-transform"
                >
                  {hasOtherServerUnread && (
                    <AttentionDot
                      size="lg"
                      className="absolute -right-1 -top-1"
                      title="Other servers have unread messages"
                    />
                  )}
                  <span className="truncate max-w-[200px]">{server?.name || "Slock"}</span>
                  <ChevronDown size={16} className="rotate-2 shrink-0 [@media(max-height:600px)]:rotate-0" />
                </button>
                <div className="min-w-0 flex-1" />
                {/* Notification Center entry — Chat tab navbar right side, only
                    when there are active notifications. Originating direction:
                    stdrc 2026-05-02 #proj-uiux:f87f6eb9 (task #94 mobile case
                    "顶栏的右侧或右上角显示一个 Warning 按钮，只在首页显示"). */}
                <NotificationTrigger flavor="mobile-navbar" />
              </>
            ) : (
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-black truncate">
                  {railMode === "settings" ? "Settings"
                    : railMode === "computers" ? "Computers"
                    : railMode === "members" ? "Members"
                    : ""}
                </div>
              </div>
            )}

            {/* Server switcher menu — only renders on the Chat tab; other
                tabs don't host the pill trigger. */}
            {railMode === "chat" && (
              <ServerSwitcherMenu
                open={showServerMenu}
                onClose={() => setShowServerMenu(false)}
                serverUnreadCounts={serverUnreadCounts}
                testId="mobile-server-switcher-menu"
                className="absolute top-full left-2 right-2 mt-1 max-h-[calc(100dvh-160px)]"
              />
            )}
          </div>
        )}

        {/* Desktop sidebar header — slimmer than the panel headers and
            without the yellow icon container; the LeftRail's selected tab
            already carries the icon, and reusing the panel-header pattern
            here visually competed with the channel/agent header to its
            right. Just a tall bold label gives the sidebar an anchored
            top edge while staying h-panel-header aligned. */}
        {!mobileInline && (
          // stdrc 2026-05-02 #proj-uiux:95e25b5b: sidebar header matches
          // sidebar body at `bg-brutal-cream`. Whole sidebar column
          // reads as one cream surface; main panel is white.
          <div className="flex h-panel-header shrink-0 items-center border-b-2 border-black bg-brutal-cream px-5">
            <div className="text-lg font-bold text-black">
              {railMode === "settings" ? "Settings"
                : railMode === "tasks" ? "Tasks"
                : railMode === "computers" ? "Computers"
                : railMode === "members" ? "Members"
                : "Chat"}
            </div>
          </div>
        )}

        {/* Scrollable content. Native browser scrollbars are used (task #282 /
            stdrc 2026-05-20 #proj-uiux:d7e5c75b restored desktop scrollbar
            visibility). */}
        <div className="relative flex min-h-0 flex-1">
          <div className={sidebarScrollClassName}>
            {/* Keep a full-height inner surface without manufacturing phantom
                overflow; scrollbars should appear only for real overflow. */}
            <div className="min-h-full">
          {railMode === "settings" ? (
            <div className="space-y-3">
              {settingsSidebarGroups.map((group) => (
                <div key={group.label}>
                  <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const active = settingsTabFromPath === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`${sidebarItemClass(active)} text-left`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : railMode === "computers" ? (
            <>
              {/* Computers surface — larger card-style items showing the
                  computer name, daemon version, and status. Renders on both
                  desktop (dedicated Computers rail) and mobile (reached via
                  the Settings sub-nav → /computers). */}
              {/* Mobile-only back row — on mobile Computers is not a top-level
                  tab, it's a level-2 push under the Settings tab. iOS
                  NavigationView expects a back affordance at the top of every
                  pushed view, so render a "← Settings" row that pops back to
                  /settings (the Settings tab home). Desktop has its own
                  dedicated Computers rail so the back row would be wrong there. */}
              {mobileInline && (
                <button
                  type="button"
                  onClick={() => navigate(`${pathBase}/settings`)}
                  data-testid="computers-mobile-back"
                  className="mb-2 flex w-full items-center gap-1 px-2 py-1.5 text-left text-sm font-medium text-black/60 hover:text-black transition-colors"
                  aria-label="Back to Settings"
                >
                  <ChevronLeft size={16} className="shrink-0" />
                  Settings
                </button>
              )}
              {/* Header→first-item gap matches the 1.5rem inter-item rhythm
                  (items below use mb-1.5), not the 1-unit rhythm used in
                  Chat/Members sections where items sit closer together. */}
              <div className="mb-1.5 flex items-center justify-between px-2">
                <div className="text-xs font-bold uppercase text-black tracking-widest">
                  Computers <span className="text-black/40 font-mono normal-case tracking-normal">{machines.length}</span>
                </div>
                {canManageServer && (
                  <button
                    onClick={() => setShowAddMachine(true)}
                    className={SIDEBAR_SECTION_ICON_BUTTON_CLASS}
                    title="Add computer"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {machines.map((machine) => (
                <button
                  key={machine.id}
                  onClick={() => handleSelectMachine(machine.id)}
                  data-testid={`computer-list-item-${machine.id}`}
                  className={`mb-1.5 flex w-full items-center gap-2.5 px-2.5 py-2 [@media(max-height:600px)]:py-1 text-left border-2 transition-colors ${
                    isMachineSelected(machine.id)
                      ? "border-black bg-brutal-pink shadow-brutal-sm"
                      : "border-transparent hover:border-black hover:bg-white hover:shadow-brutal-sm"
                  }`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow">
                    <Monitor size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="min-w-0 truncate text-sm font-bold text-black">{machine.name}</span>
                      <StatusDot
                        tone={machine.status === "online" ? "bg-brutal-lime" : "bg-gray-400"}
                        title={machine.status}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-black/50 font-mono">
                      {machine.daemonVersion ? (
                        <span className="truncate">daemon v{machine.daemonVersion}</span>
                      ) : (
                        <span className="text-black/30 italic">daemon offline</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {machines.length === 0 && (
                <div className="px-2 text-xs text-black/50 font-mono">No computers yet</div>
              )}
            </>
          ) : activeTab === "chat" ? (
            <>
              {/* Search */}
              <button
                onClick={() => onOpenSearch?.()}
                className={`mb-1  flex w-full items-center gap-1.5 px-2 py-2 [@media(max-height:600px)]:py-1 md:py-1 text-left text-sm font-medium border-2 transition-colors ${
                  location.pathname.endsWith("/search")
                    ? "border-black bg-brutal-pink shadow-brutal-sm font-bold"
                    : "border-transparent hover:border-black hover:bg-white hover:shadow-brutal-sm active:border-black active:bg-white active:shadow-brutal-sm"
                }`}
              >
                <Search size={14} className="shrink-0" />
                Search
                <span className="ml-auto hidden sm:inline text-xs font-mono text-black/40">{navigator.platform.includes("Mac") ? "⌘K" : "Ctrl+K"}</span>
              </button>

              {/* Activity entry (formerly "Inbox" — renamed per
                  stdrc #proj-activities task #1 msg=72284db5 2026-05-15
                  as interim minimum before the full first-principles
                  Activity-surface redesign in msg=f797a2ba). Singular
                  "Activity" picked per stdrc #proj-activities:72284db5
                  msg=131b7117 2026-05-16. Visible label only; route,
                  store, icon, and internal identifiers intentionally
                  keep the "inbox" naming for now to keep the diff
                  minimal — they ride along with the larger surface PR
                  when that ships. */}
              <button
                onClick={(e) => {
                  if (e.detail >= 2) return;
                  nav.toThreadsInbox();
                }}
                onDoubleClick={() => {
                  // Land in the Activity surface and signal which row
                  // to scroll-to-top and highlight. We deliberately do
                  // NOT open the right thread panel — keeping the user in
                  // the inbox layer lets them scan other unread threads
                  // instead of jumping straight into one.
                  nav.toThreadsInbox();
                  focusFirstUnreadInboxItem();
                }}
                className={`mb-1  flex w-full items-center gap-1.5 px-2 py-2 [@media(max-height:600px)]:py-1 md:py-1 text-left text-sm font-medium border-2 transition-colors ${
                  location.pathname.endsWith("/inbox") || location.pathname.endsWith("/threads")
                    ? "border-black bg-brutal-pink shadow-brutal-sm font-bold"
                    : "border-transparent hover:border-black hover:bg-white hover:shadow-brutal-sm active:border-black active:bg-white active:shadow-brutal-sm"
                }`}
              >
                <Activity size={14} className="shrink-0" />
                Activity
                {(() => {
                  return inboxTotalUnreadCount > 0 ? (
                    <span className="ml-auto shrink-0 rounded bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white border border-black">
                      {inboxTotalUnreadCount > 99 ? "99+" : inboxTotalUnreadCount}
                    </span>
                  ) : inboxTotalCount > 0 ? (
                    <span className="ml-auto text-[10px] text-black/40 font-mono">{inboxTotalCount}</span>
                  ) : null;
                })()}
              </button>

              {/* Tasks moved to its own LeftRail mode, removed from Chat sidebar. */}

              {/* Saved */}
              <button
                onClick={() => nav.toSaved()}
                className={`mb-1  flex w-full items-center gap-1.5 px-2 py-2 [@media(max-height:600px)]:py-1 md:py-1 text-left text-sm font-medium border-2 transition-colors ${
                  location.pathname.endsWith("/saved")
                    ? "border-black bg-brutal-pink shadow-brutal-sm font-bold"
                    : "border-transparent hover:border-black hover:bg-white hover:shadow-brutal-sm active:border-black active:bg-white active:shadow-brutal-sm"
                }`}
              >
                <Bookmark size={14} className="shrink-0" />
                Saved
                {savedItems.length > 0 && (
                  <span className="ml-auto text-[10px] text-black/40 font-mono">{savedItems.length}</span>
                )}
              </button>

              {/* Pinned */}
              {hasPinned && (
                <>
                  <div className={SIDEBAR_SECTION_ROW_CLASS}>
                    <button
                      type="button"
                      onClick={() => toggleSection("pinned")}
                      className={SIDEBAR_SECTION_TOGGLE_CLASS}
                    >
                      <ChevronRight
                        size={12}
                        className={`transition-transform ${collapsed.pinned ? "" : "rotate-90"}`}
                      />
                      Pinned
                      <span className="text-black/40 font-mono normal-case tracking-normal">{pinnedChannels.length + pinnedDms.length + pinnedAgents.length}</span>
                      {collapsed.pinned && (
                        pinnedChannels.some((c) => (unreadCounts[c.id] || 0) > 0) ||
                        pinnedDms.some((c) => (unreadCounts[c.id] || 0) > 0) ||
                        pinnedAgents.some((a) => (agentDmUnread[a.id] || 0) > 0)
                      ) && (
                        <AttentionDot size="lg" className="ml-1" />
                      )}
                    </button>
                    {renderSortMenu("pinned", pinnedSortMode, updatePinnedSortMode)}
                  </div>

                  <div id="sidebar-section-pinned" hidden={collapsed.pinned}>
                    {pinnedManualSort ? (
                      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handlePinnedDragEnd}>
                        <SortableContext items={pinnedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                          {pinnedItems.map((item) => (
                            <SortableSidebarItem key={item.id} id={item.id}>
                              {item.type === "channel" && renderChannelItem(item.channel)}
                              {item.type === "dm" && renderHumanDmItem(item.dm)}
                              {item.type === "agent" && renderAgentDmItem(item.agent)}
                            </SortableSidebarItem>
                          ))}
                        </SortableContext>
                      </DndContext>
                    ) : (
                      pinnedItems.map((item) => (
                        <div key={item.id}>
                          {item.type === "channel" && renderChannelItem(item.channel)}
                          {item.type === "dm" && renderHumanDmItem(item.dm)}
                          {item.type === "agent" && renderAgentDmItem(item.agent)}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Joint Channels */}
              {sortableJointChannels.length > 0 && (
                <>
                  <div className={SIDEBAR_SECTION_ROW_CLASS}>
                    <button
                      type="button"
                      onClick={() => toggleSection("jointChannels")}
                      aria-expanded={!collapsed.jointChannels}
                      aria-controls="sidebar-section-joint-channels"
                      data-testid="sidebar-section-toggle-joint-channels"
                      className={SIDEBAR_SECTION_TOGGLE_CLASS}
                    >
                      <ChevronRight
                        size={12}
                        className={`transition-transform ${collapsed.jointChannels ? "" : "rotate-90"}`}
                      />
                      <span className="truncate">Joint Channels</span>
                      <span className="text-black/40 font-mono normal-case tracking-normal">{sortableJointChannels.length}</span>
                      {collapsed.jointChannels && sortableJointChannels.some((c) => (unreadCounts[c.id] || 0) > 0) && (
                        <AttentionDot size="lg" className="ml-1" />
                      )}
                    </button>
                    {renderSortMenu("channels", channelSortMode, updateChannelSortMode)}
                  </div>

                  <div id="sidebar-section-joint-channels" hidden={collapsed.jointChannels}>
                    {!collapsed.jointChannels && (
                      channelManualSort ? (
                        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleJointChannelDragEnd}>
                          <SortableContext items={sortableJointChannelIds} strategy={verticalListSortingStrategy}>
                            {sortableJointChannels.map((channel) => (
                              <SortableSidebarItem key={channel.id} id={channel.id}>
                                {renderChannelItem(channel)}
                              </SortableSidebarItem>
                            ))}
                          </SortableContext>
                        </DndContext>
                      ) : (
                        sortableJointChannels.map((channel) => renderChannelItem(channel))
                      )
                    )}
                  </div>
                </>
              )}

              {/* Channels */}
              <div className={SIDEBAR_SECTION_ROW_CLASS}>
                <button
                  type="button"
                  onClick={() => toggleSection("channels")}
                  aria-expanded={!collapsed.channels}
                  aria-controls="sidebar-section-channels"
                  data-testid="sidebar-section-toggle-channels"
                  className={SIDEBAR_SECTION_TOGGLE_CLASS}
                >
                  <ChevronRight
                    size={12}
                    className={`transition-transform ${collapsed.channels ? "" : "rotate-90"}`}
                  />
                  <span className="truncate">Channels</span>
                  <span className="text-black/40 font-mono normal-case tracking-normal">{orderedRegularChannels.length}</span>
                  {collapsed.channels && orderedRegularChannels.some((c) => (unreadCounts[c.id] || 0) > 0) && (
                    <AttentionDot size="lg" className="ml-1" />
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  {renderSortMenu("channels", channelSortMode, updateChannelSortMode)}
                  {renderChannelActionMenu()}
                </div>
              </div>

              <div id="sidebar-section-channels" hidden={collapsed.channels}>
                {!collapsed.channels && (
                  <>
                    {pinnedChannel && renderChannelItem(pinnedChannel)}
                    {channelManualSort ? (
                      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleChannelDragEnd}>
                        <SortableContext items={sortableChannelIds} strategy={verticalListSortingStrategy}>
                          {sortableChannels.map((channel) => (
                            <SortableSidebarItem key={channel.id} id={channel.id}>
                              {renderChannelItem(channel)}
                            </SortableSidebarItem>
                          ))}
                        </SortableContext>
                      </DndContext>
                    ) : (
                      sortableChannels.map((channel) => renderChannelItem(channel))
                    )}

                    {orderedRegularChannels.length === 0 && (
                      <div className="px-2 text-xs text-black/50 font-mono">No channels yet</div>
                    )}
                  </>
                )}
              </div>

              {/* Direct Messages — show open DMs, auto-reopen on unread */}
              {(() => {
                const pinnedAgentIdSet = new Set(pinnedAgentIds);
                const pinnedDmIdSet = new Set(pinnedDms.map((d) => d.id));
                const visibleDmSet = new Set(
                  dmChannels
                    .filter((dm) =>
                      (!closedDmIds.has(dm.id) || (unreadCounts[dm.id] || 0) > 0) &&
                      !(dm.peerType === "agent" && dm.peerId && pinnedAgentIdSet.has(dm.peerId)) &&
                      !pinnedDmIdSet.has(dm.id)
                    )
                    .map((dm) => dm.id)
                );
                const orderedDms = sortSidebarDms(orderByIds(dmChannels, dmOrderIds), dmSortMode).filter((dm) => visibleDmSet.has(dm.id));
                const sortableDmIds = orderedDms.map((dm) => dm.id);
                const renderDmItem = (dm: Channel) => {
                  const unread = unreadCounts[dm.id] || 0;
                  const hasDraft = !!drafts[dm.id];
                  const isAgent = dm.peerType === "agent";
                  const dmCtxTarget = getSidebarDmContextTarget(dm, dmContextPeerIds);
                  return (
                    <button
                      key={dm.id}
                      data-sidebar-channel-id={dm.id}
                      onClick={() => {
                        handleSelectDm(dm.id);
                      }}
                      onContextMenu={(e) => openCtxMenu(e, dmCtxTarget.type, dmCtxTarget.id)}
                      {...makeLongPressHandlers(dmCtxTarget.type, dmCtxTarget.id)}
                      className={sidebarItemClass(
                        isDmSelected(dm.id),
                        ctxMenu?.type === dmCtxTarget.type && ctxMenu.id === dmCtxTarget.id,
                      )}
                    >
                      {isAgent ? (
                        <AvatarSlot context="sidebar-list" type="agent" agentAvatarUrl={dm.peerAvatarUrl ?? null} />
                      ) : (
                        <AvatarSlot
                          context="sidebar-list"
                          type="human"
                          humanAvatarUrl={dm.peerAvatarUrl ?? null}
                          gravatarHash={dm.peerGravatarHash ?? null}
                          humanPlaceholder={!dm.peerAvatarUrl && !dm.peerGravatarHash}
                        />
                      )}
                      <div className="flex min-w-0 flex-1 items-baseline gap-1 text-left">
                        <span className={`shrink-0 max-w-[70%] truncate text-sm ${unread > 0 ? "font-bold" : ""}`}>
                          {dm.peerDisplayName || dm.peerName || dm.name}
                        </span>
                        {isAgent && dm.peerId && (() => {
                          const agent = agents.find((a) => a.id === dm.peerId);
                          return agent?.description ? (
                            <span className="min-w-0 flex-1 truncate text-xs text-black/40">{agent.description}</span>
                          ) : null;
                        })()}
                        {!isAgent && dm.peerDescription && (
                          <span className="min-w-0 flex-1 truncate text-xs text-black/40">{dm.peerDescription}</span>
                        )}
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {isAgent && dm.peerId && (() => {
                          const agent = agents.find((candidate) => candidate.id === dm.peerId);
                          const displayState = resolveAgentDisplayState(agent, agentActivities[dm.peerId]);
                          return (
                            <StatusDot activity={displayState.activity} title={displayState.activityText} />
                          );
                        })()}
                        {unread > 0 ? (
                          <span className="rounded bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white border border-black">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        ) : hasDraft && (
                          <Pencil size={12} className="text-black/40" />
                        )}
                      </span>
                    </button>
                  );
                };
                return (
                <>
                  <div className={SIDEBAR_SECTION_ROW_CLASS}>
                    <button
                      type="button"
                      onClick={() => toggleSection("agents")}
                      aria-expanded={!collapsed.agents}
                      aria-controls="sidebar-section-direct-messages"
                      data-testid="sidebar-section-toggle-dms"
                      className={SIDEBAR_SECTION_TOGGLE_CLASS}
                    >
                      <ChevronRight
                        size={12}
                        className={`transition-transform ${collapsed.agents ? "" : "rotate-90"}`}
                      />
                      <span className="truncate">Direct Messages</span>
                      <span className="text-black/40 font-mono normal-case tracking-normal">{orderedDms.length}</span>
                      {collapsed.agents && orderedDms.some((dm) => (unreadCounts[dm.id] || 0) > 0) && (
                        <AttentionDot size="lg" className="ml-1" />
                      )}
                    </button>
                    {renderSortMenu("dms", dmSortMode, updateDmSortMode)}
                  </div>

                  <div id="sidebar-section-direct-messages" hidden={collapsed.agents}>
                    {!collapsed.agents && orderedDms.length > 0 && (
                      dmManualSort ? (
                        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDmDragEnd}>
                          <SortableContext items={sortableDmIds} strategy={verticalListSortingStrategy}>
                            {orderedDms.map((dm) => (
                              <SortableSidebarItem key={dm.id} id={dm.id}>
                                {renderDmItem(dm)}
                              </SortableSidebarItem>
                            ))}
                          </SortableContext>
                        </DndContext>
                      ) : (
                        orderedDms.map((dm) => renderDmItem(dm))
                      )
                    )}
                  </div>
                </>
              );
              })()}
            </>
          ) : (
            <>
              {/* People tab: Agents, Humans, Computers */}
              <button
                type="button"
                onClick={() => navigate(`${pathBase}/members/graph`)}
                className={`${sidebarItemClass(location.pathname === `${pathBase}/members/graph`)} text-left`}
              >
                <GitBranch size={14} className="shrink-0" />
                Graph
              </button>

              {/* Agents */}
              <div className={SIDEBAR_SECTION_ROW_CLASS}>
                <button
                  type="button"
                  onClick={() => toggleSection("agents")}
                  className={SIDEBAR_SECTION_TOGGLE_CLASS}
                >
                  <ChevronRight
                    size={12}
                    className={`transition-transform ${collapsed.agents ? "" : "rotate-90"}`}
                  />
                  Agents
                  <span className="text-black/40 font-mono normal-case tracking-normal">{agents.length}</span>
                </button>
                {canManageServer && (
                  <div className="relative">
                    <button
                      onClick={() => setShowCreateAgent(true)}
                      className={SIDEBAR_SECTION_ICON_BUTTON_CLASS}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>

              {!collapsed.agents && (
                <>
                  {agents.length === 0 ? (
                    <div className="px-2 text-xs text-black/50 font-mono">No agents yet</div>
                  ) : (
                    (() => {
                      // Group agents by computer, preserving the order in which
                      // each computer first appears in the agents list.
                      const groups: { key: string; machineName: string; agents: typeof agents }[] = [];
                      const indexByKey = new Map<string, number>();
                      for (const agent of agents) {
                        const key = agent.machineId ?? "__no_machine__";
                        let idx = indexByKey.get(key);
                        if (idx === undefined) {
                          idx = groups.length;
                          indexByKey.set(key, idx);
                          const machine = agent.machineId ? machines.find((m) => m.id === agent.machineId) : null;
                          groups.push({
                            key,
                            machineName: machine ? machine.name : "no computer",
                            agents: [],
                          });
                        }
                        groups[idx].agents.push(agent);
                      }
                      return groups.map((group) => (
                        <div key={group.key}>
                          <div className="flex items-center gap-1 px-3 mt-1.5 mb-0.5 text-[10px] font-mono lowercase text-black/40 select-none">
                            <Monitor size={9} className="shrink-0" />
                            <span className="truncate">{group.machineName}</span>
                          </div>
                          {group.agents.map((agent) => renderAgentItem(agent))}
                        </div>
                      ));
                    })()
                  )}
                </>
              )}

              {/* Humans */}
              {!hideHumansFromMembers && (
                <>
                  <div className={SIDEBAR_SECTION_ROW_CLASS}>
                    <button
                      type="button"
                      onClick={() => toggleSection("humans")}
                      data-testid="sidebar-section-toggle-humans"
                      className={SIDEBAR_SECTION_TOGGLE_CLASS}
                    >
                      <ChevronRight
                        size={12}
                        className={`transition-transform ${collapsed.humans ? "" : "rotate-90"}`}
                      />
                      Humans
                      <span className="text-black/40 font-mono normal-case tracking-normal">{members.length}</span>
                    </button>
                    {canManageServer && (
                      <div className="relative">
                        <button
                          onClick={() => setShowInviteHuman(true)}
                          className={SIDEBAR_SECTION_ICON_BUTTON_CLASS}
                          title="Invite human"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!collapsed.humans && (
                    <>
                      {members.length === 0 ? (
                        <div className="px-2 text-xs text-black/50 font-mono">No humans</div>
                      ) : (
                        <>
                          {members.map((human) => {
                            const isSelf = human.userId === user?.id;
                            return (
                              <button
                                key={human.userId}
                                type="button"
                                onClick={() => handleSelectHuman(human.userId)}
                                onContextMenu={(e) => openCtxMenu(e, "member-human", human.userId)}
                                {...makeLongPressHandlers("member-human", human.userId)}
                                className={sidebarItemClass(isHumanSelected(human.userId), ctxMenu?.type === "member-human" && ctxMenu.id === human.userId)}
                                title={isSelf ? "You" : `${human.displayName || human.name}`}
                              >
                                <AvatarSlot context="sidebar-list" type="human" humanAvatarUrl={human.avatarUrl} gravatarHash={human.gravatarHash} />
                                <div className="flex min-w-0 flex-1 items-baseline gap-1 text-left">
                                  <span className="shrink-0 max-w-[70%] truncate text-sm">
                                    {human.displayName || human.name}
                                    {isSelf && <span className="text-black/40 ml-1">(you)</span>}
                                  </span>
                                  {human.description && (
                                    <span className="min-w-0 flex-1 truncate text-xs text-black/40">{human.description}</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Computers list used to be inlined here on mobile (Members
                  tab covered the union). Per @stdrc 2026-04-30 #proj-uiux:c8711d2a
                  the mobile tab bar now has 4 tabs and Computers is reachable
                  via the Settings sub-nav (→ /computers). The desktop rail
                  still owns the dedicated Computers surface. */}
            </>
          )}
            </div>
          </div>
        </div>

        {bottomSlot ? (
          <div className="pointer-events-none shrink-0">
            {bottomSlot}
          </div>
        ) : null}

        {/* Bottom user bar removed — account info, Settings, Release Notes,
            and Logout all live in the LeftRail's account-menu flyout (desktop)
            and the MobileTabBar's Settings tab (mobile). */}
      </div>

      {showCreateChannel && (
        <CreateChannelDialog
          onClose={() => setShowCreateChannel(false)}
        />
      )}

      {showCreateJointChannel && canCreateJointChannel && (
        <CreateJointChannelDialog onClose={() => setShowCreateJointChannel(false)} />
      )}

      {showInviteHuman && (
        <InviteHumanDialog onClose={() => setShowInviteHuman(false)} />
      )}

      {createAgentForMachineId && (
        <CreateAgentDialog
          defaultMachineId={createAgentForMachineId}
          onClose={() => setCreateAgentForMachineId(null)}
        />
      )}

      {deleteConfirm && (() => {
        // Computer with agents: show warning-only dialog
        if (deleteConfirm.type === "machine") {
          const machineAgentCount = agents.filter((a) => a.machineId === deleteConfirm.id).length;
          if (machineAgentCount > 0) {
            return (
              <Modal onClose={() => setDeleteConfirm(null)}>
                <div className="w-full max-w-sm card-brutal p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold uppercase">Cannot Delete Computer</h2>
                    <button onClick={() => setDeleteConfirm(null)} className="btn-brutal-sm bg-white p-1">
                      <X size={20} />
                    </button>
                  </div>
                  <Banner intent="warning" withIcon className="mb-5">
                    This computer has {machineAgentCount} agent{machineAgentCount > 1 ? "s" : ""} assigned. Remove all agents before deleting the computer.
                  </Banner>
                  <div className="flex justify-end">
                    <button onClick={() => setDeleteConfirm(null)} className="btn-brutal bg-white px-4 py-2 [@media(max-height:600px)]:py-1 text-sm">
                      OK
                    </button>
                  </div>
                </div>
              </Modal>
            );
          }
        }

        const labels = {
          channel: { title: "Delete Channel", confirmLabel: "Delete Channel", message: `Are you sure you want to delete channel "${deleteConfirm.name}"? All messages will be lost.` },
          agent: { title: "Delete Agent", confirmLabel: "Delete Agent", message: `Are you sure you want to delete agent "${deleteConfirm.name}"? This will remove all associated data and cannot be undone.` },
          machine: { title: "Delete Computer", confirmLabel: "Delete Computer", message: `Are you sure you want to delete "${deleteConfirm.name}"?` },
        };
        const label = labels[deleteConfirm.type];
        return (
          <ConfirmDialog
            title={label.title}
            message={label.message}
            confirmLabel={label.confirmLabel}
            loadingLabel="Deleting…"
            onConfirm={async () => {
              if (deleteConfirm.type === "agent") {
                await deleteAgent(deleteConfirm.id);
              } else if (deleteConfirm.type === "machine") {
                await deleteMachine(deleteConfirm.id);
              } else {
                await deleteChannel(deleteConfirm.id);
              }
            }}
            onClose={() => setDeleteConfirm(null)}
          />
        );
      })()}

      {stopAgentConfirm && (
        <ConfirmDialog
          title="Stop Agent"
          message={`Are you sure you want to stop "${stopAgentConfirm.name}"? The agent will stop processing messages.`}
          confirmLabel="Stop Agent"
          loadingLabel="Stopping…"
          confirmColor="bg-brutal-orange"
          onConfirm={() => stopAgent(stopAgentConfirm.id)}
          onClose={() => setStopAgentConfirm(null)}
        />
      )}

      {resetAgentTarget && (
        <ResetAgentDialog
          agentId={resetAgentTarget.id}
          agentName={resetAgentTarget.name}
          onClose={() => setResetAgentTarget(null)}
        />
      )}

      {archiveConfirm && (
        <ConfirmDialog
          title="Archive Channel"
          message={`Archive "${archiveConfirm.name}"? Members keep read access and history, but writes will be frozen and the channel will be hidden from sidebars. You can unarchive it later.`}
          confirmLabel="Archive Channel"
          loadingLabel="Archiving…"
          confirmColor="bg-brutal-orange"
          onConfirm={async () => {
            await archiveChannel(archiveConfirm.id);
          }}
          onClose={() => setArchiveConfirm(null)}
        />
      )}

      {/* Context menu — portal to body to escape sidebar transform containment */}
      {ctxMenu && createPortal(
        <>
          {/* Outside-click overlay. onClick (not onMouseDown) so the synthetic
              mousedown after a long-press touchend doesn't close it instantly.
              Same pattern as MessageItem context menu. */}
          <DismissBackdrop onDismiss={closeCtx} trapContextMenu />
          {/* Phantom-click shield for iOS PWA. See ctxMenuClickShielded. */}
          {ctxMenuClickShielded && (
            <DismissBackdrop onDismiss={closeCtx} zIndex={60} stopPropagation />
          )}
          <div
            ref={ctxMenuRef}
            className="fixed z-50 card-brutal overflow-hidden w-48 select-none"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
          {ctxMenu.type === "channel" && (() => {
            const channel = channels.find((c) => c.id === ctxMenu.id);
            const isProtected = channel?.name === "all";
            const hasUnread = (unreadCounts[ctxMenu.id] || 0) > 0;
            const isPinned = pinnedChannelIds.includes(ctxMenu.id);
            const archiveChannelName = channel?.name ?? "";
            const canArchiveChannel = !!channel
              && capabilities.manageChannels
              && !isProtected
              && channel.type !== "joint"
              && !channel.archivedAt;
            return (
              <>
                {renderReadToggleAction(ctxMenu.id, hasUnread)}
                <MenuItem
                  icon={isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                  onClick={() => {
                    togglePinChannel(ctxMenu.id);
                    setCtxMenu(null);
                  }}
                >
                  {isPinned ? "Unpin" : "Pin"}
                </MenuItem>
                {canArchiveChannel && (
                  <>
                    <ContextMenuDivider />
                    <MenuItem
                      icon={<Archive size={14} />}
                      onClick={() => {
                        setArchiveConfirm({ id: ctxMenu.id, name: archiveChannelName });
                        setCtxMenu(null);
                      }}
                    >
                      Archive
                    </MenuItem>
                  </>
                )}
              </>
            );
          })()}

          {ctxMenu.type === "human" && (() => {
            const human = members.find((m) => m.userId === ctxMenu.id);
            if (!human) return null;
            const humanDmChannel = dmChannels.find((dm) => dm.peerType === "user" && dm.peerId === human.userId);
            const hasUnread = humanDmChannel ? (unreadCounts[humanDmChannel.id] || 0) > 0 : false;
            const isPinned = humanDmChannel ? pinnedChannelIds.includes(humanDmChannel.id) : false;
            return (
              <>
                {humanDmChannel && renderReadToggleAction(humanDmChannel.id, hasUnread)}
                {humanDmChannel && (
                  <MenuItem
                    icon={isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    onClick={() => {
                      togglePinChannel(humanDmChannel.id);
                      setCtxMenu(null);
                    }}
                  >
                    {isPinned ? "Unpin" : "Pin"}
                  </MenuItem>
                )}
                {humanDmChannel && (
                  <>
                    <ContextMenuDivider />
                    <MenuItem
                      icon={<X size={14} />}
                      onClick={() => {
                        closeDm(humanDmChannel.id);
                        setCtxMenu(null);
                      }}
                    >
                      Close Chat
                    </MenuItem>
                  </>
                )}
              </>
            );
          })()}

          {ctxMenu.type === "dm" && (() => {
            const dmChannel = dmChannels.find((dm) => dm.id === ctxMenu.id);
            if (!dmChannel) return null;
            const hasUnread = (unreadCounts[dmChannel.id] || 0) > 0;
            const isPinned = pinnedChannelIds.includes(dmChannel.id);
            return (
              <>
                {renderReadToggleAction(dmChannel.id, hasUnread)}
                <MenuItem
                  icon={isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                  onClick={() => {
                    togglePinChannel(dmChannel.id);
                    setCtxMenu(null);
                  }}
                >
                  {isPinned ? "Unpin" : "Pin"}
                </MenuItem>
                <ContextMenuDivider />
                <MenuItem
                  icon={<X size={14} />}
                  onClick={() => {
                    closeDm(dmChannel.id);
                    setCtxMenu(null);
                  }}
                >
                  Close Chat
                </MenuItem>
              </>
            );
          })()}

          {ctxMenu.type === "machine" && (() => {
            const machine = machines.find((m) => m.id === ctxMenu.id);
            if (!machine) return null;
            return (
              <>
                <MenuItem
                  disabled={!canManageServer}
                  icon={<Bot size={14} />}
                  onClick={() => {
                    if (!canManageServer) return;
                    setCreateAgentForMachineId(machine.id);
                    setCtxMenu(null);
                  }}
                >
                  Create Agent
                </MenuItem>
                <ContextMenuDivider />
                <MenuItem
                  disabled={!canManageServer}
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    if (!canManageServer) return;
                    setDeleteConfirm({ type: "machine", id: machine.id, name: machine.name });
                    setCtxMenu(null);
                  }}
                >
                  Delete Computer
                </MenuItem>
              </>
            );
          })()}

          {ctxMenu.type === "member-human" && (() => {
            const human = members.find((m) => m.userId === ctxMenu.id);
            if (!human) return null;
            return (
              <MenuItem
                icon={<MessageSquare size={14} />}
                onClick={async () => {
                  setCtxMenu(null);
                  closeRightPanel();
                  selectSidebarTab("chat");
                  const dmChannel = dmChannels.find((dm) => dm.peerType === "user" && dm.peerId === human.userId);
                  if (dmChannel) {
                    nav.toDm(dmChannel.id);
                  } else {
                    const ch = await openUserDM(human.userId);
                    if (ch) nav.toDm(ch.id);
                  }
                }}
              >
                Message
              </MenuItem>
            );
          })()}

          {ctxMenu.type === "member-agent" && (() => {
            const agent = agents.find((a) => a.id === ctxMenu.id);
            if (!agent) return null;
            const isOnline = resolveAgentDisplayState(agent, agentActivities[agent.id]).isOnline;
            const dmChannelId = agentDmChannelId[agent.id];
            const agentName = agent.displayName || agent.name;
            return (
              <>
                <MenuItem
                  icon={<MessageSquare size={14} />}
                  onClick={async () => {
                    setCtxMenu(null);
                    closeRightPanel();
                    selectSidebarTab("chat");
                    if (dmChannelId) {
                      nav.toDm(dmChannelId);
                    } else {
                      const ch = await openDM(agent.id);
                      if (ch) nav.toDm(ch.id);
                    }
                  }}
                >
                  Message
                </MenuItem>
                <ContextMenuDivider />
                <MenuItem
                  icon={isOnline ? <Square size={14} /> : <Play size={14} />}
                  onClick={() => {
                    if (isOnline) {
                      setStopAgentConfirm({ id: agent.id, name: agentName });
                    } else {
                      void startAgent(agent.id);
                    }
                    setCtxMenu(null);
                  }}
                >
                  {isOnline ? "Stop" : "Start"}
                </MenuItem>
                <MenuItem
                  icon={<RotateCcw size={14} />}
                  onClick={() => {
                    setResetAgentTarget({ id: agent.id, name: agentName });
                    setCtxMenu(null);
                  }}
                >
                  Restart / Reset
                </MenuItem>
              </>
            );
          })()}

          {ctxMenu.type === "agent" && (() => {
            const agent = agents.find((a) => a.id === ctxMenu.id);
            if (!agent) return null;
            const dmChannelId = agentDmChannelId[agent.id];
            const hasUnread = dmChannelId ? (unreadCounts[dmChannelId] || 0) > 0 : false;
            const isPinned = pinnedAgentIds.includes(ctxMenu.id);
            return (
              <>
                {dmChannelId && renderReadToggleAction(dmChannelId, hasUnread)}
                <MenuItem
                  icon={isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                  onClick={() => {
                    togglePinAgent(ctxMenu.id);
                    setCtxMenu(null);
                  }}
                >
                  {isPinned ? "Unpin" : "Pin"}
                </MenuItem>
                {dmChannelId && (
                  <>
                    <ContextMenuDivider />
                    <MenuItem
                      icon={<X size={14} />}
                      onClick={() => {
                        closeDm(dmChannelId);
                        setCtxMenu(null);
                      }}
                    >
                      Close Chat
                    </MenuItem>
                  </>
                )}
              </>
            );
          })()}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
