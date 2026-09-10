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
  TabsBackground,
  TabsLabel,
  TabsList,
  TabsTab,
} from "raft-ui";
import { useMemo, useRef, useState } from "react";

import {
  ACTIVITY_COMPOSITION_ITEMS,
  type ActivityCompositionItem,
  type ActivityCompositionChannelKind,
} from "../activity.fixtures.ts";
import {
  ActivityGroupIcon,
  ActivityItem,
  ActivityNavigationItem,
  ActivitySelectionCheckbox,
  ActivitySwitcherRow,
  type ActivityView,
} from "../activity-inbox.helpers.tsx";

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
  const someVisibleSelected = selectedItems.length > 0 && !allVisibleSelected;

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

  function switchInMobileDialog(nextView: ActivityView) {
    setActivityView(nextView);
    setMobileSwitcherOpen(false);
  }

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
          <Activity
            aria-hidden
            className="size-4.5 in-data-[theme=elegant]:size-3.5 in-data-[theme=elegant]:stroke-[2.5]"
          />
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
            <DialogContent portalProps={{ container: rootRef }}>
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
                  onClick={() => switchInMobileDialog("active")}
                />
                <ActivitySwitcherRow
                  active={view === "saved"}
                  icon={<Bookmark />}
                  label="Saved"
                  count={savedTotal || undefined}
                  onClick={() => switchInMobileDialog("saved")}
                />
                <ActivitySwitcherRow
                  active={view === "done"}
                  icon={<CheckCircle2 />}
                  label="Done"
                  onClick={() => switchInMobileDialog("done")}
                />
                <Separator className="mx-3 my-3" />
                <ActivitySwitcherRow
                  pressed={view === "active" && mentionsOnly}
                  icon={<AtSign />}
                  label="Mentions"
                  onClick={() => {
                    setActivityView("active");
                    setMentionsOnly((current) => !current);
                    setMobileSwitcherOpen(false);
                  }}
                />
                <Separator className="mx-3 my-3" />
                {groups.map((group) => (
                  <ActivitySwitcherRow
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
          </div>

          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <div className="flex flex-col gap-0">
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
          </div>

          <SidebarGroupLabel>
            <span className="min-w-0 flex-1 truncate whitespace-nowrap">DM &amp; Channels</span>
            {channelFilterId ? (
              <SidebarSectionTrailing className="min-w-0 pr-0">
                <Button
                  variant="link"
                  size="sm"
                  data-activity-inbox-show-all=""
                  onClick={() => setChannelFilterId(undefined)}
                >
                  Show all
                </Button>
              </SidebarSectionTrailing>
            ) : null}
          </SidebarGroupLabel>
          <div className="flex flex-col gap-0">
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

            <InputGroup className="min-w-0 flex-1">
              <InputGroupAddon align="inline-start">
                <Search aria-hidden size={15} />
              </InputGroupAddon>
              <InputGroupInput
                className="in-data-[theme=brutal]:py-1"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search activity"
                aria-label="Search activity"
              />
              <InputGroupAddon align="inline-end">
                {query ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X aria-hidden />
                  </Button>
                ) : null}
              </InputGroupAddon>
            </InputGroup>
          </ActivityInboxControls>

          <ActivityInboxSelectionToolbar>
            <ActivitySelectionCheckbox
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
                      onClick={() => runBulkAction("read")}
                    >
                      Mark read
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="primary"
                      onClick={() => runBulkAction("done")}
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
                    onClick={() => runBulkAction("restore")}
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="xs"
                    variant="primary"
                    data-activity-inbox-action="primary"
                    onClick={() => runBulkAction("unsave")}
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
              <div className="flex flex-col gap-2 in-data-[theme=elegant]:gap-2.5 in-data-[theme=elegant]:rounded-[10px] in-data-[theme=elegant]:bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] in-data-[theme=elegant]:p-3 in-data-[theme=elegant]:shadow-raft-xs in-data-[theme=elegant]:dark:bg-layer-card">
                {visibleItems.map((item) => (
                  <ActivityItem
                    key={item.id}
                    item={item}
                    active={openItemId === item.id}
                    selected={selectedIds.has(item.id)}
                    view={view}
                    portalContainer={rootRef}
                    onOpen={(detail) => {
                      setLocalOpenItemId(item.id);
                      onOpenItem?.(item, detail);
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
              </div>
            )}
          </ActivityInboxViewport>
        </ConversationPanelContent>
      </div>
    </ActivityInboxPanel>
  );
}
