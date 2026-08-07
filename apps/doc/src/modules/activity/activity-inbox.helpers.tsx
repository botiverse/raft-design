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
import type { ComponentProps, ReactNode, RefObject } from "react";
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
  PanelAction,
  PanelToggleAction,
  Skeleton,
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
  ActivityInboxNavigationCount,
  ActivityInboxNavigationItem,
  ActivityInboxNavigationLabel,
} from "raft-ui/wip";
import type {
  ActivityCompositionChannelKind,
  ActivityCompositionItem,
} from "./activity.fixtures.ts";

export type ActivityView = "active" | "saved" | "done";

const taskStatuses = {
  todo: ["var(--color-brutal-orange)", "warning", Circle],
  in_progress: ["var(--color-brutal-cyan)", "information", Play],
  in_review: ["var(--color-brutal-lavender)", "accent", Eye],
  done: ["var(--color-brutal-lime)", "success", CheckCircle],
  closed: ["var(--color-brutal-stone)", "muted", Ban],
} as const;

export function ActivityLoadingList() {
  return (
    <ActivityInboxList>
      {Array.from({ length: 6 }, (_, index) => (
        <ActivityInboxItem key={index} aria-hidden disabled>
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
} & ComponentProps<typeof ActivityInboxNavigationItem>) {
  return (
    <ActivityInboxNavigationItem
      active={active || pressed}
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
  const theme = useThemeFamily();
  const [background, variant, Icon] = taskStatuses[task.status];
  return (
    <Badge
      variant={variant}
      uppercase={false}
      style={theme === "brutal" ? { backgroundColor: background } : undefined}
    >
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
  onOpen: (detail: number) => void;
  onSelect: () => void;
  onToggleSaved: () => void;
  onToggleDone: () => void;
  onToggleRead: () => void;
  onToggleFollowing: () => void;
}) {
  const Icon = item.kind === "thread" ? MessageSquare : item.channelKind === "dm" ? AtSign : Hash;
  const row = (
    <ActivityInboxItem active={active} data-unread={item.unreadCount > 0 || undefined}>
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
        <ActivityInboxItemHeading>
          <ActivityInboxItemTitle>
            <Icon aria-hidden />
            {item.title}
          </ActivityInboxItemTitle>
        </ActivityInboxItemHeading>
        {item.kind === "thread" ? (
          <ActivityInboxItemSubtitle>Thread in {item.channelLabel}</ActivityInboxItemSubtitle>
        ) : null}
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
