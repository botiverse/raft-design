import {
  Activity,
  ArrowLeft,
  AtSign,
  Ban,
  Bell,
  BellOff,
  Bookmark,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Circle,
  Eye,
  Hash,
  Inbox,
  Mail,
  MailOpen,
  MessageSquare,
  Pencil,
  Play,
  RotateCcw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Badge,
  Avatar,
  Checkbox,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemLabel,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  PanelAction,
  PanelToggleAction,
  Skeleton,
  Tabs,
  TabsBackground,
  TabsLabel,
  TabsList,
  TabsTab,
  useThemeFamily,
} from "raft-ui";
import {
  ActivityInboxItem,
  ActivityInboxItemActions,
  ActivityInboxItemBody,
  ActivityInboxItemContent,
  ActivityInboxItemHeading,
  ActivityInboxItemMetadata,
  ActivityInboxItemOpen,
  ActivityInboxItemSelection,
  ActivityInboxItemSender,
  ActivityInboxItemSubtitle,
  ActivityInboxItemTimestamp,
  ActivityInboxItemTitle,
  ActivityInboxItemTrailing,
  ActivityInboxList,
} from "raft-ui/wip";

import {
  ActivityPanelControls,
  ActivityPanelHeader,
  ActivityPanelHeaderBack,
  ActivityPanelHeaderContent,
  ActivityPanelHeaderHeading,
  ActivityPanelHeaderIcon,
  ActivityPanelHeaderSubtitle,
  ActivityPanelHeaderTitle,
  ActivityPanelLayout,
  ActivityPanelMain,
  ActivityPanelMobileNavigation,
  ActivityPanelMobileNavigationButton,
  ActivityPanelMobileNavigationLabel,
  ActivityPanelNavigationCount,
  ActivityPanelNavigationItem,
  ActivityPanelNavigationLabel,
  ActivityPanelRoot,
  ActivityPanelSearch,
  ActivityPanelSearchClear,
  ActivityPanelSearchIcon,
  ActivityPanelSearchInput,
  ActivityPanelSelectionCount,
  ActivityPanelSelectionToolbar,
  ActivityPanelSidebar,
  ActivityPanelSidebarHeading,
  ActivityPanelSidebarHeadingLabel,
  ActivityPanelSidebarSection,
  ActivityPanelSortTrigger,
  ActivityPanelSortContent,
  ActivityPanelSwitcher,
  ActivityPanelSwitcherBody,
  ActivityPanelSwitcherClose,
  ActivityPanelSwitcherContent,
  ActivityPanelSwitcherHeader,
  ActivityPanelSwitcherItem,
  ActivityPanelSwitcherItemCount,
  ActivityPanelSwitcherItemLabel,
  ActivityPanelSwitcherSeparator,
  ActivityPanelSwitcherTitle,
  ActivityPanelSwitcherTrigger,
  ActivityPanelToolbarButton,
  ActivityPanelToolbarLink,
  ActivityPanelToolbarPrimaryAction,
  ActivityPanelViewport,
  activityShell,
} from "../activity-panel.parts.tsx";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";

import {
  ACTIVITY_COMPOSITION_ITEMS,
  type ActivityCompositionItem,
  type ActivityCompositionChannelKind,
  type ActivityTaskStatus,
} from "../activity.fixtures.ts";

type ActivityView = "active" | "saved" | "done";
type ActivityReadFilter = "all" | "unread";
type ActivitySortDirection = "desc" | "asc";
type ActivityLayout = "auto" | "compact" | "wide";

const activityTaskStatus = {
  todo: {
    background: "var(--color-brutal-orange)",
    icon: Circle,
    variant: "warning",
  },
  in_progress: {
    background: "var(--color-brutal-cyan)",
    icon: Play,
    variant: "information",
  },
  in_review: {
    background: "var(--color-brutal-lavender)",
    icon: Eye,
    variant: "accent",
  },
  done: {
    background: "var(--color-brutal-lime)",
    icon: CheckCircle,
    variant: "success",
  },
  closed: {
    background: "var(--color-brutal-stone)",
    icon: Ban,
    variant: "muted",
  },
} as const satisfies Record<
  ActivityTaskStatus,
  {
    background: string;
    icon: LucideIcon;
    variant: "warning" | "information" | "accent" | "success" | "muted";
  }
>;

export type ActivityInboxCompositionProps = {
  items?: readonly ActivityCompositionItem[];
  defaultItems?: readonly ActivityCompositionItem[];
  onItemsChange?: (items: readonly ActivityCompositionItem[]) => void;
  onOpenItem?: (
    item: ActivityCompositionItem,
    activation: { compact: boolean; detail: number },
  ) => void;
  onBack?: () => void;
  layout?: ActivityLayout;
  defaultView?: ActivityView;
  loading?: boolean;
  loadingMore?: boolean;
};

export function ActivityInboxComposition({
  items: controlledItems,
  defaultItems = ACTIVITY_COMPOSITION_ITEMS,
  onItemsChange,
  onOpenItem,
  onBack,
  layout = "auto",
  defaultView = "active",
  loading = false,
  loadingMore = false,
}: ActivityInboxCompositionProps = {}) {
  const theme = useThemeFamily();
  const shell = activityShell({ theme });
  const [localItems, setLocalItems] = useState<readonly ActivityCompositionItem[]>(defaultItems);
  const items = controlledItems ?? localItems;
  const [view, setView] = useState<ActivityView>(defaultView);
  const [readFilter, setReadFilter] = useState<ActivityReadFilter>("all");
  const [mentionsOnly, setMentionsOnly] = useState(false);
  const [channelFilterId, setChannelFilterId] = useState<string>();
  const [query, setQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<ActivitySortDirection>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [openItemId, setOpenItemId] = useState<string>();
  const [mobileSwitcherOpen, setMobileSwitcherOpen] = useState(false);
  const [measuredLayout, setMeasuredLayout] = useState<Exclude<ActivityLayout, "auto">>("wide");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (layout !== "auto") return;
    const root = rootRef.current;
    if (!root) return;
    const update = (width = root.getBoundingClientRect().width) => {
      if (width > 0) setMeasuredLayout(width < 768 ? "compact" : "wide");
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => update(entries[0]?.contentRect.width));
    observer.observe(root);
    return () => observer.disconnect();
  }, [layout]);

  const resolvedLayout = layout === "auto" ? measuredLayout : layout;
  const groups = useMemo(() => {
    const counts = new Map<
      string,
      { id: string; label: string; count: number; channelKind: ActivityCompositionChannelKind }
    >();
    for (const item of items) {
      if (item.done) continue;
      const current = counts.get(item.channelId);
      if (current) current.count += 1;
      else {
        counts.set(item.channelId, {
          id: item.channelId,
          label: item.channelLabel.replace(/^#/, ""),
          count: 1,
          channelKind: item.channelKind,
        });
      }
    }
    return [...counts.values()];
  }, [items]);
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const source = items.filter((item) => {
      if (view === "active") return !item.done;
      if (view === "saved") return item.saved;
      return item.done;
    });
    const filtered = source.filter((item) => {
      if (view === "active" && readFilter === "unread" && item.unreadCount === 0) return false;
      if (view === "active" && mentionsOnly && !item.hasMention) return false;
      if (view === "active" && channelFilterId && item.channelId !== channelFilterId) return false;
      if (!normalizedQuery) return true;
      return [item.title, item.channelLabel, item.sender, item.preview]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    });
    return [...filtered].sort((left, right) => {
      const comparison = left.sortAt.localeCompare(right.sortAt);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [channelFilterId, items, mentionsOnly, query, readFilter, sortDirection, view]);
  const selectedItems = visibleItems.filter((item) => selectedIds.has(item.id));
  const allVisibleSelected =
    visibleItems.length > 0 && selectedItems.length === visibleItems.length;

  function commitItems(next: readonly ActivityCompositionItem[]) {
    if (!controlledItems) setLocalItems(next);
    onItemsChange?.(next);
  }

  function updateItems(
    predicate: (item: ActivityCompositionItem) => boolean,
    update: (item: ActivityCompositionItem) => ActivityCompositionItem,
  ) {
    commitItems(items.map((item) => (predicate(item) ? update(item) : item)));
  }

  function setActivityView(nextView: ActivityView) {
    setView(nextView);
    setSelectedIds(new Set());
    if (nextView !== "active") {
      setReadFilter("all");
      setMentionsOnly(false);
      setChannelFilterId(undefined);
    }
  }

  function toggleItem(item: ActivityCompositionItem) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleItems.forEach((item) => next.delete(item.id));
      else visibleItems.forEach((item) => next.add(item.id));
      return next;
    });
  }

  function runBulkAction(action: "read" | "done" | "restore" | "unsave") {
    const ids = new Set(selectedItems.map((item) => item.id));
    updateItems(
      (item) => ids.has(item.id),
      (item) => {
        if (action === "read") return { ...item, unreadCount: 0, hasMention: false };
        if (action === "done") return { ...item, done: true };
        if (action === "restore") return { ...item, done: false };
        return { ...item, saved: false };
      },
    );
    setSelectedIds(new Set());
  }

  const totalActive = items.filter((item) => !item.done).length;
  const savedTotal = items.filter((item) => item.saved).length;

  return (
    <ActivityPanelRoot ref={rootRef} data-layout={resolvedLayout}>
      <ActivityPanelHeader>
        {onBack ? (
          <ActivityPanelHeaderBack onClick={onBack} aria-label="Back to Home">
            <ArrowLeft />
          </ActivityPanelHeaderBack>
        ) : null}
        <ActivityPanelHeaderIcon>
          <Activity />
        </ActivityPanelHeaderIcon>
        <ActivityPanelHeaderContent>
          <ActivityPanelHeaderHeading>
            <ActivityPanelHeaderTitle>Activity</ActivityPanelHeaderTitle>
          </ActivityPanelHeaderHeading>
          <ActivityPanelHeaderSubtitle>
            Triage what needs your attention
          </ActivityPanelHeaderSubtitle>
        </ActivityPanelHeaderContent>
      </ActivityPanelHeader>

      <ActivityPanelLayout>
        <ActivityPanelSidebar>
          <ActivityPanelSidebarSection>
            <ActivityNavigationItem
              active={view === "active"}
              icon={<Inbox size={15} />}
              label="Active"
              count={totalActive}
              onClick={() => setActivityView("active")}
            />
            <ActivityNavigationItem
              active={view === "saved"}
              icon={<Bookmark size={15} />}
              label="Saved"
              count={savedTotal || undefined}
              onClick={() => setActivityView("saved")}
            />
            <ActivityNavigationItem
              active={view === "done"}
              icon={<CheckCircle2 size={15} />}
              label="Done"
              onClick={() => setActivityView("done")}
            />
          </ActivityPanelSidebarSection>

          <ActivityPanelSidebarHeading>
            <ActivityPanelSidebarHeadingLabel>Filters</ActivityPanelSidebarHeadingLabel>
          </ActivityPanelSidebarHeading>
          <ActivityPanelSidebarSection>
            <ActivityNavigationItem
              pressed={view === "active" && mentionsOnly}
              disabled={view !== "active"}
              icon={<AtSign size={14} />}
              label="Mentions"
              onClick={() => {
                setActivityView("active");
                setMentionsOnly((current) => !current);
              }}
            />
          </ActivityPanelSidebarSection>

          <ActivityPanelSidebarHeading>
            <ActivityPanelSidebarHeadingLabel>DM &amp; Channels</ActivityPanelSidebarHeadingLabel>
            {channelFilterId ? (
              <ActivityPanelToolbarLink
                className={shell.sidebarShowAllLink()}
                onClick={() => setChannelFilterId(undefined)}
              >
                Show all
              </ActivityPanelToolbarLink>
            ) : null}
          </ActivityPanelSidebarHeading>
          <ActivityPanelSidebarSection className="gap-0">
            {groups.map((group) => (
              <ActivityNavigationItem
                key={group.id}
                active={view === "active" && channelFilterId === group.id}
                icon={<ActivityGroupIcon group={group} />}
                label={group.label}
                count={group.count}
                onClick={() => {
                  setActivityView("active");
                  setChannelFilterId((current) => (current === group.id ? undefined : group.id));
                }}
              />
            ))}
          </ActivityPanelSidebarSection>
        </ActivityPanelSidebar>

        <ActivityPanelMain>
          <ActivityPanelControls>
            <ActivityPanelMobileNavigation>
              <ActivityPanelSwitcher open={mobileSwitcherOpen} onOpenChange={setMobileSwitcherOpen}>
                <ActivityPanelSwitcherTrigger
                  render={<ActivityPanelMobileNavigationButton aria-label="Switch Activity" />}
                >
                  {view === "active" ? (
                    <Inbox />
                  ) : view === "saved" ? (
                    <Bookmark />
                  ) : (
                    <CheckCircle2 />
                  )}
                  <ActivityPanelMobileNavigationLabel>
                    {view === "active" ? "Active" : view === "saved" ? "Saved" : "Done"}
                  </ActivityPanelMobileNavigationLabel>
                  <ChevronDown />
                </ActivityPanelSwitcherTrigger>
                <ActivityPanelSwitcherContent portalProps={{ container: rootRef }}>
                  <ActivityPanelSwitcherHeader>
                    <ActivityPanelSwitcherTitle>Switch Activity</ActivityPanelSwitcherTitle>
                    <ActivityPanelSwitcherClose aria-label="Close">
                      <X />
                    </ActivityPanelSwitcherClose>
                  </ActivityPanelSwitcherHeader>
                  <ActivityPanelSwitcherBody>
                    <ActivitySwitcherItem
                      active={view === "active"}
                      icon={<Inbox />}
                      label="Active"
                      count={totalActive}
                      onClick={() => {
                        setActivityView("active");
                        setMobileSwitcherOpen(false);
                      }}
                    />
                    <ActivitySwitcherItem
                      active={view === "saved"}
                      icon={<Bookmark />}
                      label="Saved"
                      count={savedTotal || undefined}
                      onClick={() => {
                        setActivityView("saved");
                        setMobileSwitcherOpen(false);
                      }}
                    />
                    <ActivitySwitcherItem
                      active={view === "done"}
                      icon={<CheckCircle2 />}
                      label="Done"
                      onClick={() => {
                        setActivityView("done");
                        setMobileSwitcherOpen(false);
                      }}
                    />
                    <ActivityPanelSwitcherSeparator />
                    <ActivitySwitcherItem
                      pressed={view === "active" && mentionsOnly}
                      icon={<AtSign />}
                      label="Mentions"
                      onClick={() => {
                        setActivityView("active");
                        setMentionsOnly((current) => !current);
                        setMobileSwitcherOpen(false);
                      }}
                    />
                    <ActivityPanelSwitcherSeparator />
                    {groups.map((group) => (
                      <ActivitySwitcherItem
                        key={group.id}
                        active={view === "active" && channelFilterId === group.id}
                        icon={<ActivityGroupIcon group={group} mobile />}
                        label={group.label}
                        count={group.count}
                        onClick={() => {
                          setActivityView("active");
                          setChannelFilterId((current) =>
                            current === group.id ? undefined : group.id,
                          );
                          setMobileSwitcherOpen(false);
                        }}
                      />
                    ))}
                  </ActivityPanelSwitcherBody>
                </ActivityPanelSwitcherContent>
              </ActivityPanelSwitcher>
            </ActivityPanelMobileNavigation>

            {view === "active" ? (
              <Tabs<ActivityReadFilter>
                className="w-auto shrink-0"
                value={readFilter}
                onValueChange={(value) => setReadFilter(value)}
              >
                <TabsList aria-label="Filter activity">
                  <TabsBackground />
                  <TabsTab value="all">
                    <TabsLabel>All</TabsLabel>
                  </TabsTab>
                  <TabsTab value="unread">
                    <TabsLabel>Unread</TabsLabel>
                  </TabsTab>
                </TabsList>
              </Tabs>
            ) : null}

            <ActivityPanelSearch>
              <ActivityPanelSearchIcon>
                <Search />
              </ActivityPanelSearchIcon>
              <ActivityPanelSearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search activity"
                aria-label="Search activity"
              />
              {query ? (
                <ActivityPanelSearchClear onClick={() => setQuery("")} aria-label="Clear search">
                  <X />
                </ActivityPanelSearchClear>
              ) : null}
            </ActivityPanelSearch>
          </ActivityPanelControls>

          <ActivityPanelSelectionToolbar>
            {selectedItems.length === 0 ? (
              <>
                <ActivityPanelToolbarButton
                  onClick={toggleAllVisible}
                  disabled={visibleItems.length === 0}
                  aria-pressed={allVisibleSelected}
                >
                  Select all
                </ActivityPanelToolbarButton>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<ActivityPanelSortTrigger />}>
                    {sortDirection === "desc" ? "Newest to oldest" : "Oldest to newest"}
                    <ChevronDown />
                  </DropdownMenuTrigger>
                  <ActivityPanelSortContent
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    portalProps={{ container: rootRef }}
                  >
                    <DropdownMenuRadioGroup
                      value={sortDirection}
                      onValueChange={(value) => setSortDirection(value as ActivitySortDirection)}
                    >
                      {(["desc", "asc"] as const).map((direction) => (
                        <DropdownMenuRadioItem key={direction} value={direction}>
                          {direction === "desc" ? "Newest to oldest" : "Oldest to newest"}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </ActivityPanelSortContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ActivityPanelSelectionCount>
                  {selectedItems.length} selected
                </ActivityPanelSelectionCount>
                <ActivityPanelToolbarLink onClick={() => setSelectedIds(new Set())}>
                  Clear
                </ActivityPanelToolbarLink>
                {view === "active" ? (
                  <>
                    <ActivityPanelToolbarButton onClick={() => runBulkAction("read")}>
                      Mark read
                    </ActivityPanelToolbarButton>
                    <ActivityPanelToolbarPrimaryAction onClick={() => runBulkAction("done")}>
                      Mark done
                    </ActivityPanelToolbarPrimaryAction>
                  </>
                ) : view === "done" ? (
                  <ActivityPanelToolbarPrimaryAction onClick={() => runBulkAction("restore")}>
                    Restore
                  </ActivityPanelToolbarPrimaryAction>
                ) : (
                  <ActivityPanelToolbarPrimaryAction onClick={() => runBulkAction("unsave")}>
                    Remove from Saved
                  </ActivityPanelToolbarPrimaryAction>
                )}
              </>
            )}
          </ActivityPanelSelectionToolbar>

          <ActivityPanelViewport aria-busy={loading || loadingMore || undefined}>
            {loading && visibleItems.length === 0 ? (
              <ActivityLoadingList />
            ) : visibleItems.length === 0 ? (
              <EmptyState className="h-full">
                <EmptyStateContent>
                  <EmptyStateIcon>
                    {view === "saved" ? (
                      <Bookmark />
                    ) : view === "done" ? (
                      <CheckCircle2 />
                    ) : (
                      <Activity />
                    )}
                  </EmptyStateIcon>
                  <EmptyStateTitle>
                    {query
                      ? "No matching activity"
                      : view === "saved"
                        ? "No saved items"
                        : view === "done"
                          ? "No completed items"
                          : "Activity is empty"}
                  </EmptyStateTitle>
                  <EmptyStateDescription>
                    {view === "done"
                      ? "Items marked as done appear here and can be restored."
                      : "New replies and mentions will appear here."}
                  </EmptyStateDescription>
                </EmptyStateContent>
              </EmptyState>
            ) : (
              <ActivityInboxList>
                {visibleItems.map((item) => (
                  <ActivityItem
                    key={item.id}
                    item={item}
                    active={openItemId === item.id}
                    selected={selectedIds.has(item.id)}
                    view={view}
                    portalContainer={rootRef}
                    onOpen={(detail) => {
                      setOpenItemId(item.id);
                      onOpenItem?.(item, {
                        compact: resolvedLayout === "compact",
                        detail,
                      });
                    }}
                    onSelect={() => toggleItem(item)}
                    onToggleSaved={() =>
                      updateItems(
                        (candidate) => candidate.id === item.id,
                        (candidate) => ({ ...candidate, saved: !candidate.saved }),
                      )
                    }
                    onToggleDone={() =>
                      updateItems(
                        (candidate) => candidate.id === item.id,
                        (candidate) => ({ ...candidate, done: !candidate.done }),
                      )
                    }
                    onToggleRead={() =>
                      updateItems(
                        (candidate) => candidate.id === item.id,
                        (candidate) => ({
                          ...candidate,
                          hasMention: candidate.unreadCount > 0 ? false : candidate.hasMention,
                          unreadCount: candidate.unreadCount > 0 ? 0 : 1,
                        }),
                      )
                    }
                    onToggleFollowing={() =>
                      updateItems(
                        (candidate) => candidate.id === item.id,
                        (candidate) => ({
                          ...candidate,
                          following: candidate.following === false,
                        }),
                      )
                    }
                  />
                ))}
                {loadingMore ? <div className={shell.loadingMore()}>Loading more…</div> : null}
              </ActivityInboxList>
            )}
          </ActivityPanelViewport>
        </ActivityPanelMain>
      </ActivityPanelLayout>
    </ActivityPanelRoot>
  );
}

function ActivityLoadingList() {
  return (
    <ActivityInboxList>
      {Array.from({ length: 6 }, (_, index) => (
        <ActivityInboxItem key={index} aria-hidden aria-disabled>
          <ActivityInboxItemContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <Skeleton variant="line" className="w-20" />
              <Skeleton variant="line" className="w-16" />
              <Skeleton variant="line" className="w-10" />
            </div>
            <Skeleton variant="line" className="w-full" />
            <Skeleton variant="line" className="w-3/5" />
          </ActivityInboxItemContent>
        </ActivityInboxItem>
      ))}
    </ActivityInboxList>
  );
}

function ActivityTaskBadge({ task }: { task: NonNullable<ActivityCompositionItem["task"]> }) {
  const theme = useThemeFamily();
  const config = activityTaskStatus[task.status];
  const Icon = config.icon;
  return (
    <Badge
      variant={config.variant}
      uppercase={false}
      style={theme === "brutal" ? { backgroundColor: config.background } : undefined}
    >
      <Icon size={10} className="shrink-0" />#{task.number}
      {task.claimedBy ? ` @${task.claimedBy}` : null}
    </Badge>
  );
}

function ActivityNavigationItem({
  active,
  pressed,
  icon,
  label,
  count,
  ...props
}: {
  active?: boolean;
  pressed?: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
} & ComponentProps<typeof ActivityPanelNavigationItem>) {
  return (
    <ActivityPanelNavigationItem
      aria-current={active ? "page" : undefined}
      aria-pressed={pressed || undefined}
      {...props}
    >
      {icon}
      <ActivityPanelNavigationLabel>{label}</ActivityPanelNavigationLabel>
      {count === undefined ? null : (
        <ActivityPanelNavigationCount>{count}</ActivityPanelNavigationCount>
      )}
    </ActivityPanelNavigationItem>
  );
}

function ActivityGroupIcon({
  group,
  mobile = false,
}: {
  group: { channelKind: ActivityCompositionChannelKind };
  mobile?: boolean;
}) {
  if (group.channelKind !== "dm") return <Hash size={mobile ? 18 : 14} />;
  return <Avatar size={mobile ? "xs" : "2xs"} type="human" />;
}

function ActivitySwitcherItem({
  active,
  pressed,
  icon,
  label,
  count,
  ...props
}: {
  active?: boolean;
  pressed?: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
} & ComponentProps<typeof ActivityPanelSwitcherItem>) {
  return (
    <ActivityPanelSwitcherItem
      aria-current={active ? "page" : undefined}
      aria-pressed={pressed || undefined}
      {...props}
    >
      {icon}
      <ActivityPanelSwitcherItemLabel>{label}</ActivityPanelSwitcherItemLabel>
      {count === undefined ? null : (
        <ActivityPanelSwitcherItemCount>{count}</ActivityPanelSwitcherItemCount>
      )}
    </ActivityPanelSwitcherItem>
  );
}

function ActivityItem({
  item,
  active,
  selected,
  view,
  portalContainer,
  onOpen,
  onSelect,
  onToggleSaved,
  onToggleDone,
  onToggleRead,
  onToggleFollowing,
}: {
  item: ActivityCompositionItem;
  active: boolean;
  selected: boolean;
  view: ActivityView;
  portalContainer: RefObject<HTMLDivElement | null>;
  onOpen: (detail: number) => void;
  onSelect: () => void;
  onToggleSaved: () => void;
  onToggleDone: () => void;
  onToggleRead: () => void;
  onToggleFollowing: () => void;
}) {
  const Icon = item.kind === "thread" ? MessageSquare : item.channelKind === "dm" ? AtSign : Hash;
  const row = (
    <ActivityInboxItem
      data-unread={item.unreadCount > 0 || undefined}
      data-active={active || undefined}
    >
      <ActivityInboxItemOpen
        aria-current={active || undefined}
        aria-label={`Open ${item.title}`}
        onClick={(event) => onOpen(event.detail)}
      />
      <ActivityInboxItemSelection>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          onClick={(event) => event.stopPropagation()}
          aria-label={selected ? "Remove activity item from selection" : "Select activity item"}
        />
      </ActivityInboxItemSelection>
      <ActivityInboxItemContent>
        {item.kind === "thread" ? (
          <ActivityInboxItemSubtitle>{item.channelLabel}</ActivityInboxItemSubtitle>
        ) : null}
        <ActivityInboxItemHeading>
          <ActivityInboxItemTitle>
            <Icon aria-hidden />
            {item.title}
          </ActivityInboxItemTitle>
        </ActivityInboxItemHeading>
        <ActivityInboxItemBody>
          <ActivityInboxItemSender>{item.sender}: </ActivityInboxItemSender>
          {item.preview}
        </ActivityInboxItemBody>
        <ActivityInboxItemMetadata>
          {item.task ? <ActivityTaskBadge task={item.task} /> : null}
          {item.replyCount === undefined ? null : (
            <Badge appearance="outline" variant="muted" uppercase={false}>
              {item.replyCount} replies
            </Badge>
          )}
          {item.kind === "thread" && item.following === false ? (
            <Badge appearance="outline" variant="muted" uppercase={false}>
              <BellOff size={10} />
              Unfollowed
            </Badge>
          ) : null}
          {item.hasMention && item.unreadCount > 0 ? (
            <Badge variant="primary" uppercase={false}>
              <AtSign size={10} />
              Mention
            </Badge>
          ) : null}
          {item.unreadCount > 0 ? (
            <Badge variant="accent" uppercase={false}>
              {item.unreadCount} new
            </Badge>
          ) : null}
          {item.draft ? (
            <Badge appearance="outline" variant="muted" uppercase={false} aria-label="Draft">
              <Pencil size={10} />
            </Badge>
          ) : null}
        </ActivityInboxItemMetadata>
      </ActivityInboxItemContent>
      <ActivityInboxItemTrailing>
        <ActivityInboxItemTimestamp>{item.timestamp}</ActivityInboxItemTimestamp>
        <ActivityInboxItemActions>
          <PanelToggleAction
            pressed={item.saved}
            onPressedChange={onToggleSaved}
            aria-label={item.saved ? "Remove from Saved" : "Save activity item"}
            title={item.saved ? "Remove from Saved" : "Save activity item"}
          >
            <Bookmark fill={item.saved ? "currentColor" : "none"} />
          </PanelToggleAction>
          {view === "saved" ? null : (
            <PanelAction
              onClick={onToggleDone}
              aria-label={view === "done" ? "Restore to Active" : "Mark as done"}
              title={view === "done" ? "Restore to Active" : "Mark as done"}
            >
              {view === "done" ? <RotateCcw /> : <Check />}
            </PanelAction>
          )}
        </ActivityInboxItemActions>
      </ActivityInboxItemTrailing>
    </ActivityInboxItem>
  );

  if (view !== "active") return row;

  return (
    <ContextMenu>
      <ContextMenuTrigger render={row} />
      <ContextMenuContent portalProps={{ container: portalContainer }}>
        {item.kind !== "thread" || item.following !== false ? (
          <>
            <ContextMenuItem onClick={onToggleRead}>
              {item.unreadCount > 0 ? <MailOpen /> : <Mail />}
              <ContextMenuItemLabel>
                {item.unreadCount > 0 ? "Mark as read" : "Mark as unread"}
              </ContextMenuItemLabel>
            </ContextMenuItem>
            <ContextMenuItem onClick={onToggleDone}>
              <Check />
              <ContextMenuItemLabel>Mark as done</ContextMenuItemLabel>
            </ContextMenuItem>
          </>
        ) : null}
        {item.kind === "thread" ? (
          <ContextMenuItem onClick={onToggleFollowing}>
            {item.following === false ? <Bell /> : <BellOff />}
            <ContextMenuItemLabel>
              {item.following === false ? "Follow thread" : "Unfollow thread"}
            </ContextMenuItemLabel>
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
