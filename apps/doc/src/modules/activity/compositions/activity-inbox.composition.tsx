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
import { Menu as BaseMenu } from "@base-ui/react/menu";
import {
  Badge,
  Avatar,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Skeleton,
} from "raft-ui";
import {
  ActivityInboxControls,
  ActivityInboxControlsFilter,
  ActivityInboxHeader,
  ActivityInboxHeaderBack,
  ActivityInboxHeaderContent,
  ActivityInboxHeaderHeading,
  ActivityInboxHeaderIcon,
  ActivityInboxHeaderSubtitle,
  ActivityInboxHeaderTitle,
  ActivityInboxItem,
  ActivityInboxItemAction,
  ActivityInboxItemActions,
  ActivityInboxItemBody,
  ActivityInboxItemContent,
  ActivityInboxItemHeading,
  ActivityInboxItemMetadata,
  ActivityInboxItemOpen,
  ActivityInboxItemSelection,
  ActivityInboxItemSavedAction,
  ActivityInboxItemSender,
  ActivityInboxItemSubtitle,
  ActivityInboxItemTimestamp,
  ActivityInboxItemTitle,
  ActivityInboxItemTitleIcon,
  ActivityInboxLayout,
  ActivityInboxList,
  ActivityInboxMain,
  ActivityInboxMobileNavigation,
  ActivityInboxMobileNavigationButton,
  ActivityInboxMobileNavigationLabel,
  ActivityInboxNavigationCount,
  ActivityInboxNavigationItem,
  ActivityInboxNavigationLabel,
  ActivityInboxRoot,
  ActivityInboxSearch,
  ActivityInboxSearchClear,
  ActivityInboxSearchIcon,
  ActivityInboxSearchInput,
  ActivityInboxSelectionCount,
  ActivityInboxSelectionToolbar,
  ActivityInboxSidebar,
  ActivityInboxSidebarHeading,
  ActivityInboxSidebarHeadingLabel,
  ActivityInboxSidebarSection,
  ActivityInboxSortTrigger,
  ActivityInboxSwitcher,
  ActivityInboxSwitcherBody,
  ActivityInboxSwitcherClose,
  ActivityInboxSwitcherContent,
  ActivityInboxSwitcherHeader,
  ActivityInboxSwitcherItem,
  ActivityInboxSwitcherItemCount,
  ActivityInboxSwitcherItemLabel,
  ActivityInboxSwitcherSeparator,
  ActivityInboxSwitcherTitle,
  ActivityInboxSwitcherTrigger,
  ActivityInboxToolbarButton,
  ActivityInboxToolbarLink,
  ActivityInboxToolbarPrimaryAction,
  ActivityInboxViewport,
} from "raft-ui/wip";
import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";

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
    <ActivityInboxRoot ref={rootRef} data-layout={resolvedLayout}>
      <ActivityInboxHeader>
        {onBack ? (
          <ActivityInboxHeaderBack onClick={onBack} aria-label="Back to Home">
            <ArrowLeft />
          </ActivityInboxHeaderBack>
        ) : null}
        <ActivityInboxHeaderIcon>
          <Activity />
        </ActivityInboxHeaderIcon>
        <ActivityInboxHeaderContent>
          <ActivityInboxHeaderHeading>
            <ActivityInboxHeaderTitle>Activity</ActivityInboxHeaderTitle>
          </ActivityInboxHeaderHeading>
          <ActivityInboxHeaderSubtitle>
            Triage what needs your attention
          </ActivityInboxHeaderSubtitle>
        </ActivityInboxHeaderContent>
      </ActivityInboxHeader>

      <ActivityInboxLayout>
        <ActivityInboxSidebar>
          <ActivityInboxSidebarSection>
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
          </ActivityInboxSidebarSection>

          <ActivityInboxSidebarHeading>
            <ActivityInboxSidebarHeadingLabel>Filters</ActivityInboxSidebarHeadingLabel>
          </ActivityInboxSidebarHeading>
          <ActivityInboxSidebarSection>
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
          </ActivityInboxSidebarSection>

          <ActivityInboxSidebarHeading>
            <ActivityInboxSidebarHeadingLabel>DM &amp; Channels</ActivityInboxSidebarHeadingLabel>
            {channelFilterId ? (
              <ActivityInboxToolbarLink
                className="text-[10px] font-black text-black/50 underline-offset-2 hover:text-black"
                onClick={() => setChannelFilterId(undefined)}
              >
                Show all
              </ActivityInboxToolbarLink>
            ) : null}
          </ActivityInboxSidebarHeading>
          <ActivityInboxSidebarSection className="gap-0">
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
          </ActivityInboxSidebarSection>
        </ActivityInboxSidebar>

        <ActivityInboxMain>
          <ActivityInboxControls>
            <ActivityInboxMobileNavigation>
              <ActivityInboxSwitcher open={mobileSwitcherOpen} onOpenChange={setMobileSwitcherOpen}>
                <ActivityInboxSwitcherTrigger
                  render={<ActivityInboxMobileNavigationButton aria-label="Switch Activity" />}
                >
                  {view === "active" ? (
                    <Inbox />
                  ) : view === "saved" ? (
                    <Bookmark />
                  ) : (
                    <CheckCircle2 />
                  )}
                  <ActivityInboxMobileNavigationLabel>
                    {view === "active" ? "Active" : view === "saved" ? "Saved" : "Done"}
                  </ActivityInboxMobileNavigationLabel>
                  <ChevronDown />
                </ActivityInboxSwitcherTrigger>
                <ActivityInboxSwitcherContent portalProps={{ container: rootRef.current }}>
                  <ActivityInboxSwitcherHeader>
                    <ActivityInboxSwitcherTitle>Switch Activity</ActivityInboxSwitcherTitle>
                    <ActivityInboxSwitcherClose aria-label="Close">
                      <X />
                    </ActivityInboxSwitcherClose>
                  </ActivityInboxSwitcherHeader>
                  <ActivityInboxSwitcherBody>
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
                    <ActivityInboxSwitcherSeparator />
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
                    <ActivityInboxSwitcherSeparator />
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
                  </ActivityInboxSwitcherBody>
                </ActivityInboxSwitcherContent>
              </ActivityInboxSwitcher>
            </ActivityInboxMobileNavigation>

            {view === "active" ? (
              <ActivityInboxControlsFilter>
                <SegmentedControl
                  value={readFilter}
                  onValueChange={(value) => setReadFilter(value as ActivityReadFilter)}
                  ariaLabel="Filter activity"
                >
                  <SegmentedControlItem value="all">
                    <SegmentedControlLabel>All</SegmentedControlLabel>
                  </SegmentedControlItem>
                  <SegmentedControlItem value="unread">
                    <SegmentedControlLabel>Unread</SegmentedControlLabel>
                  </SegmentedControlItem>
                </SegmentedControl>
              </ActivityInboxControlsFilter>
            ) : null}

            <ActivityInboxSearch>
              <ActivityInboxSearchIcon>
                <Search />
              </ActivityInboxSearchIcon>
              <ActivityInboxSearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search activity"
                aria-label="Search activity"
              />
              {query ? (
                <ActivityInboxSearchClear onClick={() => setQuery("")} aria-label="Clear search">
                  <X />
                </ActivityInboxSearchClear>
              ) : null}
            </ActivityInboxSearch>
          </ActivityInboxControls>

          <ActivityInboxSelectionToolbar>
            {selectedItems.length === 0 ? (
              <>
                <ActivityInboxToolbarButton
                  onClick={toggleAllVisible}
                  disabled={visibleItems.length === 0}
                  aria-pressed={allVisibleSelected}
                >
                  Select all
                </ActivityInboxToolbarButton>
                <BaseMenu.Root>
                  <BaseMenu.Trigger render={<ActivityInboxSortTrigger className="ml-auto" />}>
                    {sortDirection === "desc" ? "Newest to oldest" : "Oldest to newest"}
                    <ChevronDown />
                  </BaseMenu.Trigger>
                  <BaseMenu.Portal container={rootRef.current}>
                    <BaseMenu.Positioner
                      align="end"
                      side="bottom"
                      sideOffset={8}
                      className="isolate z-30 outline-none"
                    >
                      <BaseMenu.Popup className="w-48 border-2 border-black bg-white p-1 shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)] outline-none">
                        <BaseMenu.RadioGroup
                          value={sortDirection}
                          onValueChange={(value) =>
                            setSortDirection(value as ActivitySortDirection)
                          }
                        >
                          {(["desc", "asc"] as const).map((direction) => (
                            <BaseMenu.RadioItem
                              key={direction}
                              value={direction}
                              className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs font-bold outline-none hover:bg-black/5 data-[highlighted]:bg-black/5 data-[checked]:bg-soft-signal"
                            >
                              <span className="flex size-4 items-center justify-center">
                                {sortDirection === direction ? <Check /> : null}
                              </span>
                              {direction === "desc" ? "Newest to oldest" : "Oldest to newest"}
                            </BaseMenu.RadioItem>
                          ))}
                        </BaseMenu.RadioGroup>
                      </BaseMenu.Popup>
                    </BaseMenu.Positioner>
                  </BaseMenu.Portal>
                </BaseMenu.Root>
              </>
            ) : (
              <>
                <ActivityInboxSelectionCount>
                  {selectedItems.length} selected
                </ActivityInboxSelectionCount>
                <ActivityInboxToolbarLink onClick={() => setSelectedIds(new Set())}>
                  Clear
                </ActivityInboxToolbarLink>
                {view === "active" ? (
                  <>
                    <ActivityInboxToolbarButton onClick={() => runBulkAction("read")}>
                      Mark read
                    </ActivityInboxToolbarButton>
                    <ActivityInboxToolbarPrimaryAction onClick={() => runBulkAction("done")}>
                      Mark done
                    </ActivityInboxToolbarPrimaryAction>
                  </>
                ) : view === "done" ? (
                  <ActivityInboxToolbarPrimaryAction onClick={() => runBulkAction("restore")}>
                    Restore
                  </ActivityInboxToolbarPrimaryAction>
                ) : (
                  <ActivityInboxToolbarPrimaryAction onClick={() => runBulkAction("unsave")}>
                    Remove from Saved
                  </ActivityInboxToolbarPrimaryAction>
                )}
              </>
            )}
          </ActivityInboxSelectionToolbar>

          <ActivityInboxViewport aria-busy={loading || loadingMore || undefined}>
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
                    portalContainer={rootRef.current}
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
                {loadingMore ? (
                  <div className="py-3 text-center text-xs font-bold text-black/40">
                    Loading more…
                  </div>
                ) : null}
              </ActivityInboxList>
            )}
          </ActivityInboxViewport>
        </ActivityInboxMain>
      </ActivityInboxLayout>
    </ActivityInboxRoot>
  );
}

function ActivityLoadingList() {
  return (
    <ActivityInboxList>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex w-full items-start gap-3 border-2 border-black/30 bg-white p-3"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <Skeleton variant="line" className="w-20" />
              <Skeleton variant="line" className="w-16" />
              <Skeleton variant="line" className="w-10" />
            </div>
            <Skeleton variant="line" className="w-full" />
            <Skeleton variant="line" className="w-3/5" />
          </div>
        </div>
      ))}
    </ActivityInboxList>
  );
}

function ActivityTaskBadge({ task }: { task: NonNullable<ActivityCompositionItem["task"]> }) {
  const config = activityTaskStatus[task.status];
  const Icon = config.icon;
  return (
    <Badge
      variant={config.variant}
      uppercase={false}
      style={{ backgroundColor: config.background }}
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
} & ComponentProps<typeof ActivityInboxNavigationItem>) {
  return (
    <ActivityInboxNavigationItem
      aria-current={active ? "page" : undefined}
      aria-pressed={pressed || undefined}
      {...props}
    >
      {icon}
      <ActivityInboxNavigationLabel>{label}</ActivityInboxNavigationLabel>
      {count === undefined ? null : (
        <ActivityInboxNavigationCount>{count}</ActivityInboxNavigationCount>
      )}
    </ActivityInboxNavigationItem>
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
} & ComponentProps<typeof ActivityInboxSwitcherItem>) {
  return (
    <ActivityInboxSwitcherItem
      aria-current={active ? "page" : undefined}
      aria-pressed={pressed || undefined}
      {...props}
    >
      {icon}
      <ActivityInboxSwitcherItemLabel>{label}</ActivityInboxSwitcherItemLabel>
      {count === undefined ? null : (
        <ActivityInboxSwitcherItemCount>{count}</ActivityInboxSwitcherItemCount>
      )}
    </ActivityInboxSwitcherItem>
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
  portalContainer: HTMLElement | null;
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
      <ActivityInboxItemSelection
        checked={selected}
        onCheckedChange={onSelect}
        aria-label={selected ? "Remove activity item from selection" : "Select activity item"}
      >
        {selected ? <Check /> : null}
      </ActivityInboxItemSelection>
      <ActivityInboxItemContent>
        {item.kind === "thread" ? (
          <ActivityInboxItemSubtitle>{item.channelLabel}</ActivityInboxItemSubtitle>
        ) : null}
        <ActivityInboxItemHeading>
          <ActivityInboxItemTitle>
            <ActivityInboxItemTitleIcon data-kind={item.kind}>
              <Icon />
            </ActivityInboxItemTitleIcon>
            {item.title}
          </ActivityInboxItemTitle>
          <ActivityInboxItemTimestamp>{item.timestamp}</ActivityInboxItemTimestamp>
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
              <BellOff />
              Unfollowed
            </Badge>
          ) : null}
          {item.hasMention && item.unreadCount > 0 ? (
            <Badge variant="primary" uppercase={false}>
              <AtSign />
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
              <Pencil />
            </Badge>
          ) : null}
        </ActivityInboxItemMetadata>
      </ActivityInboxItemContent>
      <ActivityInboxItemActions>
        {item.saved ? (
          <ActivityInboxItemSavedAction
            onClick={onToggleSaved}
            aria-label="Remove from Saved"
            title="Remove from Saved"
          >
            <Bookmark fill="currentColor" />
          </ActivityInboxItemSavedAction>
        ) : (
          <ActivityInboxItemAction
            onClick={onToggleSaved}
            aria-label="Save activity item"
            title="Save activity item"
          >
            <Bookmark />
          </ActivityInboxItemAction>
        )}
        {view === "saved" ? null : (
          <ActivityInboxItemAction
            onClick={onToggleDone}
            aria-label={view === "done" ? "Restore to Active" : "Mark as done"}
            title={view === "done" ? "Restore to Active" : "Mark as done"}
          >
            {view === "done" ? <RotateCcw /> : <Check />}
          </ActivityInboxItemAction>
        )}
      </ActivityInboxItemActions>
    </ActivityInboxItem>
  );

  if (view !== "active") return row;

  return (
    <ContextMenu>
      <ContextMenuTrigger render={row} />
      <ContextMenuContent
        className="w-[184px] min-w-[184px] max-w-[184px] overflow-y-auto overflow-x-hidden border-2 border-black bg-white p-0 shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]"
        portalProps={{ container: portalContainer }}
      >
        {item.kind !== "thread" || item.following !== false ? (
          <>
            <ContextMenuItem
              className="font-medium hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30"
              onClick={onToggleRead}
            >
              {item.unreadCount > 0 ? <MailOpen /> : <Mail />}
              <span className="min-w-0 flex-1 truncate">
                {item.unreadCount > 0 ? "Mark as read" : "Mark as unread"}
              </span>
            </ContextMenuItem>
            <ContextMenuItem
              className="font-medium hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30"
              onClick={onToggleDone}
            >
              <Check />
              <span className="min-w-0 flex-1 truncate">Mark as done</span>
            </ContextMenuItem>
          </>
        ) : null}
        {item.kind === "thread" ? (
          <ContextMenuItem
            className="font-medium hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30"
            onClick={onToggleFollowing}
          >
            {item.following === false ? <Bell /> : <BellOff />}
            <span className="min-w-0 flex-1 truncate">
              {item.following === false ? "Follow thread" : "Unfollow thread"}
            </span>
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
