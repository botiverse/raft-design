import {
  Activity,
  ArrowLeft,
  AtSign,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Inbox,
  Search,
  X,
} from "lucide-react";
import {
  ActivityInboxControls,
  ActivityInboxPanel,
  ActivityInboxSelectionCount,
  ActivityInboxSelectionToolbar,
  ActivityInboxSidebar,
  ActivityInboxViewport,
  Button,
  Checkbox,
  ConversationPanelContent,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeading,
  PanelMeta,
  PanelTitle,
  Separator,
  SidebarGroupLabel,
  SidebarSectionTrailing,
  Tabs,
  TabsLabel,
  TabsList,
  TabsTab,
} from "@botiverse/raft-ui";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { ACTIVITY_COMPOSITION_ITEMS } from "../activity.fixtures.ts";
import type {
  ActivityCompositionItem,
  ActivityCompositionChannelKind,
} from "../activity.fixtures.ts";
import {
  ActivityGroupIcon,
  ActivityItem,
  ActivityNavigationItem,
  ActivitySwitcherRow,
} from "../activity-inbox.helpers.tsx";
import type { ActivityView } from "../activity-inbox.helpers.tsx";

type ActivityReadFilter = "all" | "unread";
type ActivitySortDirection = "desc" | "asc";

export type ActivityInboxCompositionProps = {
  items?: readonly ActivityCompositionItem[];
  defaultItems?: readonly ActivityCompositionItem[];
  onItemsChange?: (items: readonly ActivityCompositionItem[]) => void;
  onOpenItem?: (item: ActivityCompositionItem, detail: number) => void;
  openItemId?: string | null;
  onBack?: () => void;
  defaultView?: ActivityView;
};

export function ActivityInboxComposition({
  items: controlledItems,
  defaultItems = ACTIVITY_COMPOSITION_ITEMS,
  onItemsChange,
  onOpenItem,
  openItemId: controlledOpenItemId,
  onBack,
  defaultView = "active",
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
  const [localOpenItemId, setLocalOpenItemId] = useState<string>();
  const openItemId =
    controlledOpenItemId === undefined ? localOpenItemId : (controlledOpenItemId ?? undefined);
  const [mobileSwitcherOpen, setMobileSwitcherOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const portalProps = useMemo(() => ({ container: rootRef }), []);

  const groups = useMemo(() => {
    const counts = new Map<string, ActivityGroup>();
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
  const selectedItems = useMemo(
    () => visibleItems.filter((item) => selectedIds.has(item.id)),
    [selectedIds, visibleItems],
  );
  const allVisibleSelected =
    visibleItems.length > 0 && selectedItems.length === visibleItems.length;
  const someVisibleSelected = selectedItems.length > 0 && !allVisibleSelected;

  const commitItems = useCallback(
    (next: readonly ActivityCompositionItem[]) => {
      if (!controlledItems) setLocalItems(next);
      onItemsChange?.(next);
    },
    [controlledItems, onItemsChange],
  );

  const updateItem = useCallback(
    (id: string, update: (item: ActivityCompositionItem) => ActivityCompositionItem) => {
      commitItems(items.map((item) => (item.id === id ? update(item) : item)));
    },
    [commitItems, items],
  );

  const setActivityView = useCallback((nextView: ActivityView) => {
    setView(nextView);
    setSelectedIds(new Set());
    if (nextView !== "active") {
      setReadFilter("all");
      setMentionsOnly(false);
      setChannelFilterId(undefined);
    }
  }, []);

  const toggleMentionsOnly = useCallback(() => {
    setActivityView("active");
    setMentionsOnly((current) => !current);
  }, [setActivityView]);

  const toggleChannelFilter = useCallback(
    (channelId: string) => {
      setActivityView("active");
      setChannelFilterId((current) => (current === channelId ? undefined : channelId));
    },
    [setActivityView],
  );

  const toggleAllVisible = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleItems.forEach((item) => next.delete(item.id));
      else visibleItems.forEach((item) => next.add(item.id));
      return next;
    });
  }, [allVisibleSelected, visibleItems]);

  const runBulkAction = useCallback(
    (action: "read" | "done" | "restore" | "unsave") => {
      const ids = new Set(selectedItems.map((item) => item.id));
      commitItems(
        items.map((item) => {
          if (!ids.has(item.id)) return item;
          if (action === "read") return { ...item, unreadCount: 0, hasMention: false };
          if (action === "done") return { ...item, done: true };
          if (action === "restore") return { ...item, done: false };
          return { ...item, saved: false };
        }),
      );
      setSelectedIds(new Set());
    },
    [commitItems, items, selectedItems],
  );

  const totalActive = items.filter((item) => !item.done).length;
  const savedTotal = items.filter((item) => item.saved).length;

  const switchInMobileDialog = useCallback(
    (nextView: ActivityView) => {
      setActivityView(nextView);
      setMobileSwitcherOpen(false);
    },
    [setActivityView],
  );

  const handleMobileSwitchToActive = useCallback(() => {
    switchInMobileDialog("active");
  }, [switchInMobileDialog]);
  const handleMobileSwitchToSaved = useCallback(() => {
    switchInMobileDialog("saved");
  }, [switchInMobileDialog]);
  const handleMobileSwitchToDone = useCallback(() => {
    switchInMobileDialog("done");
  }, [switchInMobileDialog]);

  const handleMobileToggleMentions = useCallback(() => {
    toggleMentionsOnly();
    setMobileSwitcherOpen(false);
  }, [toggleMentionsOnly]);

  const handleMobileToggleChannelFilter = useCallback(
    (channelId: string) => {
      toggleChannelFilter(channelId);
      setMobileSwitcherOpen(false);
    },
    [toggleChannelFilter],
  );

  const handleSwitchToActive = useCallback(() => {
    setActivityView("active");
  }, [setActivityView]);
  const handleSwitchToSaved = useCallback(() => {
    setActivityView("saved");
  }, [setActivityView]);
  const handleSwitchToDone = useCallback(() => {
    setActivityView("done");
  }, [setActivityView]);

  const handleShowAllChannels = useCallback(() => {
    setChannelFilterId(undefined);
  }, []);

  const handleQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);
  const handleClearQuery = useCallback(() => {
    setQuery("");
  }, []);

  const handleSortDirectionChange = useCallback((value: ActivitySortDirection) => {
    setSortDirection(value);
  }, []);

  const handleMarkSelectedRead = useCallback(() => {
    runBulkAction("read");
  }, [runBulkAction]);
  const handleMarkSelectedDone = useCallback(() => {
    runBulkAction("done");
  }, [runBulkAction]);
  const handleRestoreSelected = useCallback(() => {
    runBulkAction("restore");
  }, [runBulkAction]);
  const handleUnsaveSelected = useCallback(() => {
    runBulkAction("unsave");
  }, [runBulkAction]);

  const handleOpenItem = useCallback(
    (item: ActivityCompositionItem, detail: number) => {
      setLocalOpenItemId(item.id);
      onOpenItem?.(item, detail);
    },
    [onOpenItem],
  );

  const handleSelectItem = useCallback((item: ActivityCompositionItem) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }, []);

  const handleToggleItemSaved = useCallback(
    (item: ActivityCompositionItem) => {
      updateItem(item.id, (candidate) => ({ ...candidate, saved: !candidate.saved }));
    },
    [updateItem],
  );

  const handleToggleItemDone = useCallback(
    (item: ActivityCompositionItem) => {
      updateItem(item.id, (candidate) => ({ ...candidate, done: !candidate.done }));
    },
    [updateItem],
  );

  const handleToggleItemRead = useCallback(
    (item: ActivityCompositionItem) => {
      updateItem(item.id, (candidate) => ({
        ...candidate,
        hasMention: candidate.unreadCount > 0 ? false : candidate.hasMention,
        unreadCount: candidate.unreadCount > 0 ? 0 : 1,
      }));
    },
    [updateItem],
  );

  const handleToggleItemFollowing = useCallback(
    (item: ActivityCompositionItem) => {
      updateItem(item.id, (candidate) => ({
        ...candidate,
        following: candidate.following === false,
      }));
    },
    [updateItem],
  );

  return (
    <ActivityInboxPanel ref={rootRef}>
      <PanelHeader>
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onBack}
            aria-label="Back to Home"
            className="md:hidden"
          >
            <ArrowLeft size={14} />
          </Button>
        ) : null}
        <PanelHeaderIcon className="max-md:hidden">
          <Activity aria-hidden className="size-4.5" />
        </PanelHeaderIcon>
        <PanelHeaderContent
          className={onBack ? "max-md:col-start-2 max-md:col-span-2" : "max-md:col-span-3"}
        >
          <PanelHeading>
            <PanelTitle render={<h2 />}>Activity</PanelTitle>
          </PanelHeading>
          <PanelMeta render={<p />}>Triage what needs your attention</PanelMeta>
        </PanelHeaderContent>
        <PanelActions className="md:hidden">
          <Dialog open={mobileSwitcherOpen} onOpenChange={setMobileSwitcherOpen}>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Switch Activity"
                  className="min-w-0 max-w-28"
                >
                  {view === "active" ? (
                    <Inbox />
                  ) : view === "saved" ? (
                    <Bookmark />
                  ) : (
                    <CheckCircle2 />
                  )}
                  <span className="min-w-0 flex-1 truncate text-left">
                    {view === "active" ? "Active" : view === "saved" ? "Saved" : "Done"}
                  </span>
                  <ChevronDown />
                </Button>
              }
            />
            <DialogContent portalProps={portalProps}>
              <DialogHeader>
                <DialogTitle>Switch Activity</DialogTitle>
                <DialogClose aria-label="Close" />
              </DialogHeader>
              <DialogBody className="flex flex-col gap-1">
                <ActivitySwitcherRow
                  active={view === "active"}
                  icon={<Inbox />}
                  label="Active"
                  count={totalActive}
                  onClick={handleMobileSwitchToActive}
                />
                <ActivitySwitcherRow
                  active={view === "saved"}
                  icon={<Bookmark />}
                  label="Saved"
                  count={savedTotal || undefined}
                  onClick={handleMobileSwitchToSaved}
                />
                <ActivitySwitcherRow
                  active={view === "done"}
                  icon={<CheckCircle2 />}
                  label="Done"
                  onClick={handleMobileSwitchToDone}
                />
                <Separator className="mx-3 my-3" />
                <ActivitySwitcherRow
                  pressed={view === "active" && mentionsOnly}
                  icon={<AtSign />}
                  label="Mentions"
                  onClick={handleMobileToggleMentions}
                />
                <Separator className="mx-3 my-3" />
                {groups.map((group) => (
                  <ActivityGroupSwitcherRow
                    key={group.id}
                    group={group}
                    active={view === "active" && channelFilterId === group.id}
                    onToggle={handleMobileToggleChannelFilter}
                  />
                ))}
              </DialogBody>
            </DialogContent>
          </Dialog>
        </PanelActions>
      </PanelHeader>

      <div className="flex min-h-0 flex-1">
        <ActivityInboxSidebar>
          <div className="flex flex-col gap-0">
            <ActivityNavigationItem
              active={view === "active"}
              icon={<Inbox size={15} />}
              label="Active"
              count={totalActive}
              onClick={handleSwitchToActive}
            />
            <ActivityNavigationItem
              active={view === "saved"}
              icon={<Bookmark size={15} />}
              label="Saved"
              count={savedTotal || undefined}
              onClick={handleSwitchToSaved}
            />
            <ActivityNavigationItem
              active={view === "done"}
              icon={<CheckCircle2 size={15} />}
              label="Done"
              onClick={handleSwitchToDone}
            />
          </div>

          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <div className="flex flex-col gap-0">
            <ActivityNavigationItem
              pressed={view === "active" && mentionsOnly}
              disabled={view !== "active"}
              icon={<AtSign size={14} />}
              label="Mentions"
              onClick={toggleMentionsOnly}
            />
          </div>

          <SidebarGroupLabel>
            <span className="min-w-0 flex-1 truncate whitespace-nowrap">DM &amp; Channels</span>
            {channelFilterId ? (
              <SidebarSectionTrailing className="min-w-0 pr-0">
                <Button
                  variant="link"
                  size="sm"
                  data-activity-inbox-show-all=""
                  onClick={handleShowAllChannels}
                >
                  Show all
                </Button>
              </SidebarSectionTrailing>
            ) : null}
          </SidebarGroupLabel>
          <div className="flex flex-col gap-0">
            {groups.map((group) => (
              <ActivityGroupNavigationItem
                key={group.id}
                group={group}
                active={view === "active" && channelFilterId === group.id}
                onToggle={toggleChannelFilter}
              />
            ))}
          </div>
        </ActivityInboxSidebar>

        <ConversationPanelContent
          render={<section />}
          data-slot="activity-inbox-main"
          className="md:min-w-[30rem]"
        >
          <ActivityInboxControls>
            {view === "active" ? (
              <Tabs<ActivityReadFilter>
                className="w-auto shrink-0"
                value={readFilter}
                onValueChange={setReadFilter}
              >
                <TabsList aria-label="Filter activity">
                  <TabsTab value="all">
                    <TabsLabel>All</TabsLabel>
                  </TabsTab>
                  <TabsTab value="unread">
                    <TabsLabel>Unread</TabsLabel>
                  </TabsTab>
                </TabsList>
              </Tabs>
            ) : null}

            <InputGroup className="min-w-0 flex-1">
              <InputGroupAddon align="inline-start">
                <Search aria-hidden size={15} />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={handleQueryChange}
                placeholder="Search activity"
                aria-label="Search activity"
              />
              <InputGroupAddon align="inline-end">
                {query ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleClearQuery}
                    aria-label="Clear search"
                  >
                    <X aria-hidden />
                  </Button>
                ) : null}
              </InputGroupAddon>
            </InputGroup>
          </ActivityInboxControls>

          <ActivityInboxSelectionToolbar>
            <Checkbox
              checked={allVisibleSelected}
              indeterminate={someVisibleSelected}
              disabled={visibleItems.length === 0}
              onCheckedChange={toggleAllVisible}
              aria-label="Select all visible activity"
            />
            {selectedItems.length === 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      data-activity-inbox-action="sort"
                      className="ml-auto"
                    />
                  }
                >
                  {sortDirection === "desc" ? "Newest to oldest" : "Oldest to newest"}
                  <ChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  portalProps={portalProps}
                >
                  <DropdownMenuRadioGroup
                    value={sortDirection}
                    onValueChange={handleSortDirectionChange}
                  >
                    {(["desc", "asc"] as const).map((direction) => (
                      <DropdownMenuRadioItem key={direction} value={direction}>
                        {direction === "desc" ? "Newest to oldest" : "Oldest to newest"}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <ActivityInboxSelectionCount>
                  {selectedItems.length} selected
                </ActivityInboxSelectionCount>
                {view === "active" ? (
                  <>
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={handleMarkSelectedRead}
                    >
                      Mark read
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="primary"
                      onClick={handleMarkSelectedDone}
                    >
                      Mark done
                    </Button>
                  </>
                ) : view === "done" ? (
                  <Button
                    type="button"
                    size="xs"
                    variant="primary"
                    data-activity-inbox-action="primary"
                    onClick={handleRestoreSelected}
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    variant="primary"
                    data-activity-inbox-action="primary"
                    onClick={handleUnsaveSelected}
                  >
                    Remove from Saved
                  </Button>
                )}
              </>
            )}
          </ActivityInboxSelectionToolbar>

          <ActivityInboxViewport>
            {visibleItems.length === 0 ? (
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
              <div className="flex flex-col gap-2">
                {visibleItems.map((item) => (
                  <ActivityItem
                    key={item.id}
                    item={item}
                    active={openItemId === item.id}
                    selected={selectedIds.has(item.id)}
                    view={view}
                    portalContainer={rootRef}
                    onOpen={handleOpenItem}
                    onSelect={handleSelectItem}
                    onToggleSaved={handleToggleItemSaved}
                    onToggleDone={handleToggleItemDone}
                    onToggleRead={handleToggleItemRead}
                    onToggleFollowing={handleToggleItemFollowing}
                  />
                ))}
              </div>
            )}
          </ActivityInboxViewport>
        </ConversationPanelContent>
      </div>
    </ActivityInboxPanel>
  );
}

type ActivityGroup = {
  id: string;
  label: string;
  count: number;
  channelKind: ActivityCompositionChannelKind;
};

type ActivityGroupRowProps = {
  group: ActivityGroup;
  active: boolean;
  onToggle: (channelId: string) => void;
};

function ActivityGroupSwitcherRow({ group, active, onToggle }: ActivityGroupRowProps) {
  const handleClick = useCallback(() => {
    onToggle(group.id);
  }, [group.id, onToggle]);

  return (
    <ActivitySwitcherRow
      active={active}
      icon={<ActivityGroupIcon group={group} mobile />}
      label={group.label}
      count={group.count}
      onClick={handleClick}
    />
  );
}

function ActivityGroupNavigationItem({ group, active, onToggle }: ActivityGroupRowProps) {
  const handleClick = useCallback(() => {
    onToggle(group.id);
  }, [group.id, onToggle]);

  return (
    <ActivityNavigationItem
      active={active}
      icon={<ActivityGroupIcon group={group} />}
      label={group.label}
      count={group.count}
      onClick={handleClick}
    />
  );
}
