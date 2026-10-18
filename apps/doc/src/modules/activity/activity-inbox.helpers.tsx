import {
  AtSign,
  Ban,
  Bell,
  BellOff,
  Bookmark,
  Check,
  CheckCircle,
  Circle,
  Eye,
  Hash,
  Mail,
  MailOpen,
  MessageSquare,
  Pencil,
  Play,
  RotateCcw,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import type { ComponentProps, MouseEvent, ReactNode, RefObject, SyntheticEvent } from "react";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemLabel,
  ContextMenuTrigger,
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemMetadata,
  InboxItemSelection,
  InboxItemSender,
  InboxItemSubtitle,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
  PanelAction,
  PanelToggleAction,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemMeta,
  SidebarItemTitle,
} from "raft-ui";
import type {
  ActivityCompositionChannelKind,
  ActivityCompositionItem,
} from "./activity.fixtures.ts";

export type ActivityView = "active" | "saved" | "done";

const taskStatuses = {
  todo: ["warning", Circle],
  in_progress: ["information", Play],
  in_review: ["accent", Eye],
  done: ["success", CheckCircle],
  closed: ["muted", Ban],
} as const;

function stopPropagation(event: SyntheticEvent) {
  event.stopPropagation();
}

export function ActivityNavigationItem({
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
} & ComponentProps<typeof SidebarItem>) {
  return (
    <SidebarItem
      active={active || pressed}
      aria-current={active ? "page" : undefined}
      aria-pressed={pressed || undefined}
      {...props}
    >
      <SidebarItemIcon aria-hidden>{icon}</SidebarItemIcon>
      <SidebarItemTitle>{label}</SidebarItemTitle>
      {count === undefined ? null : <SidebarItemMeta>{count}</SidebarItemMeta>}
    </SidebarItem>
  );
}

export function ActivityGroupIcon({
  group,
  mobile = false,
}: {
  group: { channelKind: ActivityCompositionChannelKind };
  mobile?: boolean;
}) {
  return group.channelKind !== "dm" ? (
    <Hash size={mobile ? 18 : 14} />
  ) : (
    <Avatar size={mobile ? "xs" : "2xs"} type="human" />
  );
}

export function ActivitySwitcherRow({
  active,
  pressed,
  icon,
  label,
  count,
  onClick,
}: {
  active?: boolean;
  pressed?: boolean;
  icon: ReactNode;
  label: string;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "outline" : "ghost"}
      size="md"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-pressed={pressed || undefined}
      className="w-full justify-start gap-2"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {count === undefined ? null : (
        <span className="shrink-0 tabular-nums text-foreground-placeholder">{count}</span>
      )}
    </Button>
  );
}

function ActivityTaskBadge({ task }: { task: NonNullable<ActivityCompositionItem["task"]> }) {
  const [variant, Icon] = taskStatuses[task.status];
  return (
    <Badge variant={variant}>
      <Icon size={10} className="shrink-0" />#{task.number}
      {task.claimedBy ? ` @${task.claimedBy}` : null}
    </Badge>
  );
}

export function ActivityItem({
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
  onOpen: (item: ActivityCompositionItem, detail: number) => void;
  onSelect: (item: ActivityCompositionItem) => void;
  onToggleSaved: (item: ActivityCompositionItem) => void;
  onToggleDone: (item: ActivityCompositionItem) => void;
  onToggleRead: (item: ActivityCompositionItem) => void;
  onToggleFollowing: (item: ActivityCompositionItem) => void;
}) {
  const Icon = item.kind === "thread" ? MessageSquare : item.channelKind === "dm" ? AtSign : Hash;
  const handleOpen = useCallback(
    (event: MouseEvent) => {
      onOpen(item, event.detail);
    },
    [item, onOpen],
  );
  const handleSelect = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);
  const handleToggleSaved = useCallback(() => {
    onToggleSaved(item);
  }, [item, onToggleSaved]);
  const handleToggleDone = useCallback(() => {
    onToggleDone(item);
  }, [item, onToggleDone]);
  const handleToggleRead = useCallback(() => {
    onToggleRead(item);
  }, [item, onToggleRead]);
  const handleToggleFollowing = useCallback(() => {
    onToggleFollowing(item);
  }, [item, onToggleFollowing]);
  const portalProps = useMemo(() => ({ container: portalContainer }), [portalContainer]);
  const row = (
    <InboxItem active={active} data-unread={item.unreadCount > 0 || undefined}>
      <InboxItemTrigger
        aria-current={active || undefined}
        aria-label={`Open ${item.title}`}
        onClick={handleOpen}
      />
      <InboxItemSelection>
        <Checkbox
          checked={selected}
          onCheckedChange={handleSelect}
          onClick={stopPropagation}
          aria-label={selected ? "Remove activity item from selection" : "Select activity item"}
        />
      </InboxItemSelection>
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>
            <Icon aria-hidden />
            {item.title}
          </InboxItemTitle>
        </InboxItemHeading>
        {item.kind === "thread" ? (
          <InboxItemSubtitle>Thread in {item.channelLabel}</InboxItemSubtitle>
        ) : null}
        <InboxItemBody>
          <InboxItemSender>{item.sender}: </InboxItemSender>
          {item.preview}
        </InboxItemBody>
        <InboxItemMetadata>
          {item.task ? <ActivityTaskBadge task={item.task} /> : null}
          {item.replyCount === undefined ? null : (
            <Badge appearance="outline" variant="muted">
              {item.replyCount} replies
            </Badge>
          )}
          {item.kind === "thread" && item.following === false ? (
            <Badge appearance="outline" variant="muted">
              <BellOff size={10} />
              Unfollowed
            </Badge>
          ) : null}
          {item.hasMention && item.unreadCount > 0 ? (
            <Badge variant="primary">
              <AtSign size={10} />
              Mention
            </Badge>
          ) : null}
          {item.unreadCount > 0 ? <Badge variant="accent">{item.unreadCount} new</Badge> : null}
          {item.draft ? (
            <Badge appearance="outline" variant="muted" aria-label="Draft">
              <Pencil size={10} />
            </Badge>
          ) : null}
        </InboxItemMetadata>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp className="max-md:translate-y-0.5">{item.timestamp}</InboxItemTimestamp>
        <InboxItemActions>
          <PanelToggleAction
            pressed={item.saved}
            onPressedChange={handleToggleSaved}
            aria-label={item.saved ? "Remove from Saved" : "Save activity item"}
            title={item.saved ? "Remove from Saved" : "Save activity item"}
          >
            <Bookmark fill={item.saved ? "currentColor" : "none"} />
          </PanelToggleAction>
          {view === "saved" ? null : (
            <PanelAction
              onClick={handleToggleDone}
              aria-label={view === "done" ? "Restore to Active" : "Mark as done"}
              title={view === "done" ? "Restore to Active" : "Mark as done"}
            >
              {view === "done" ? <RotateCcw /> : <Check />}
            </PanelAction>
          )}
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>
  );
  if (view !== "active") return row;
  return (
    <ContextMenu>
      <ContextMenuTrigger render={row} />
      <ContextMenuContent portalProps={portalProps}>
        {item.kind !== "thread" || item.following !== false ? (
          <>
            <ContextMenuItem onClick={handleToggleRead}>
              {item.unreadCount > 0 ? <MailOpen /> : <Mail />}
              <ContextMenuItemLabel>
                {item.unreadCount > 0 ? "Mark as read" : "Mark as unread"}
              </ContextMenuItemLabel>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleToggleDone}>
              <Check />
              <ContextMenuItemLabel>Mark as done</ContextMenuItemLabel>
            </ContextMenuItem>
          </>
        ) : null}
        {item.kind === "thread" ? (
          <ContextMenuItem onClick={handleToggleFollowing}>
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
