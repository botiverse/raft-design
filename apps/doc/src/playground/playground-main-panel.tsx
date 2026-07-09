import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDown,
  Ban,
  Bell,
  BellOff,
  Bookmark,
  BookmarkMinus,
  Check,
  CheckCircle,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Copy,
  Download,
  Eye,
  GitBranch,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  ListTodo,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Play,
  RotateCcw,
  Search,
  Send,
  Settings,
  SmilePlus,
  Square,
  TextQuote,
  Users,
  X,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
  SortableTabsList,
  SortableTabsTab,
  Spinner,
  Tabs,
  TabsLabel,
} from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelBody,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelJumpToLatest,
  ChatMainPanelMessageList,
  ChatMainPanelRoot,
  ChatMainPanelSubtitle,
  ChatMainPanelTabs,
  ChatMainPanelTimeline,
  ChatMainPanelTitle,
  ChatMainPanelTitleBlock,
  MessageAttachmentAction,
  MessageAttachmentBody,
  MessageAttachmentCard,
  MessageAttachmentLoadingBar,
  MessageAttachmentMeta,
  MessageAttachmentTitle,
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryRow,
  MessageItem,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSelectMark,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionGlyph,
  MessageReactionPicker,
  MessageReactionPopover,
  MessageReactionPopoverName,
  MessageReactionPopoverNames,
  MessageReactionPopoverNameText,
  MessageReactionPopoverSeparator,
  MessageReactionQuickButton,
  MessageReactionQuickRow,
  MessageTimelineDateDivider,
  MessageTimelineHistoryLimited,
  MessageTimelineNotice,
  PanelIconButton,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  MessageVideoPreviewMedia,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
  MESSAGE_QUICK_REACTIONS,
  type MessageItemRowState,
} from "raft-ui/wip";

import { Composer } from "#/playground/playground-composer.tsx";
import type { PlaygroundChannel, PlaygroundChannelId } from "./mock-data.ts";

type PanelTab = "chat" | "tasks" | "files";
export type RowVariant = "member" | "agent";

const TAB_META: Record<PanelTab, { icon: ReactNode; label: string }> = {
  chat: { icon: <MessageSquare />, label: "Chat" },
  tasks: { icon: <ListTodo />, label: "Tasks" },
  files: { icon: <Paperclip />, label: "Files" },
};

const SORTABLE_TABS_LIST_CLASS =
  "[[data-preview-theme=brutal]_&]:max-w-none [[data-preview-theme=brutal]_&]:border-y-0 [[data-preview-theme=brutal]_&]:border-l-0 [[data-preview-theme=brutal]_&]:border-r-2 [[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-white";

const SORTABLE_TAB_CLASS =
  "[[data-preview-theme=brutal]_&]:bg-white [[data-preview-theme=brutal]_&]:text-black [[data-preview-theme=brutal]_&]:data-[active]:bg-soft-signal [[data-preview-theme=brutal]_&]:data-[active]:hover:bg-soft-signal [[data-preview-theme=brutal]_&]:[&+&]:before:bg-black";

// Brutal token overrides pin the neutral text ramp to source's pure black so the
// rows stay pixel-identical to the live app (foreground resolves to oklch(0.18)).
const SENDER_CLASS = "[[data-preview-theme=brutal]_&]:text-black";
const META_CLASS = "[[data-preview-theme=brutal]_&]:text-black/40";
const TIME_CLASS = "[[data-preview-theme=brutal]_&]:text-black/40";
const BODY_CLASS = "[[data-preview-theme=brutal]_&]:text-black";
const BADGE_CLASS = "[[data-preview-theme=brutal]_&]:text-black";
// Continuation time stays hidden until the row is hovered, like the live app.
const CONTINUATION_TIME_CLASS =
  "[[data-preview-theme=brutal]_&]:text-black/0 [[data-preview-theme=brutal]_&]:group-hover/message:text-black/40";
const REACTION_CLASS = "[[data-preview-theme=brutal]_&]:text-black";

// Placeholder thumbnail (brutal poster) reused by the image gallery, mirroring
// the design-system message-item fixtures so the docs asset resolves inline.
const IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23f4f0e8'/%3E%3Crect x='34' y='34' width='572' height='352' fill='%23f7d358' stroke='%23000' stroke-width='8'/%3E%3Ccircle cx='180' cy='168' r='72' fill='%23ff7ab6' stroke='%23000' stroke-width='8'/%3E%3Cpath d='M292 310 406 190l70 72 56-42 74 90z' fill='%23a3e8ff' stroke='%23000' stroke-width='8'/%3E%3C/svg%3E";

// In-message reference chip box (app-level markdown rendering in source): every
// @self-mention / #channel / task / thread / permalink chip composes this exact
// box so they share one height. Brutal pins the hairline to source's pure black.
const MSG_REF_CHIP =
  "inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap align-bottom border border-line-strong px-1 [font-size:inherit] font-bold leading-[1.5] text-black select-text [[data-preview-theme=brutal]_&]:border-black";

// Non-self @mention renders as a text-link (bold + subtle underline), not a chip.
const MENTION_LINK_CLASS =
  "cursor-default select-text font-bold text-black underline decoration-black/30 decoration-2 underline-offset-2 hover:text-brutal-pink hover:decoration-brutal-pink";

// Inline code shares the chip height and uses the same soft-signal wash.
const INLINE_CODE_CLASS =
  "border border-line-strong bg-soft-signal/40 px-1 font-mono text-sm font-normal leading-[1.5] text-inherit [overflow-wrap:anywhere] [[data-preview-theme=brutal]_&]:border-black";

type ChipKind = "channel" | "thread" | "task" | "self";

const CHIP_TONE: Record<ChipKind, string> = {
  channel: "bg-brutal-pink/30 hover:bg-brutal-pink/60",
  thread: "bg-brutal-cyan/30 hover:bg-brutal-cyan/60",
  task: "bg-soft-signal/40 hover:bg-soft-signal",
  self: "bg-soft-signal hover:bg-soft-signal/80",
};

// Unresolved chip tones (opacity-60, no hover) — source renders a bare span for
// refs whose target could not be resolved. Task uses /30 (not /40).
const CHIP_TONE_UNRESOLVED: Record<ChipKind, string> = {
  channel: "bg-brutal-pink/30",
  thread: "bg-brutal-cyan/30",
  task: "bg-soft-signal/30",
  self: "bg-soft-signal",
};

// App-level reference chip (#channel / thread / task / self-mention). `resolving`
// adds the cursor-wait + trailing spinner state; `unresolved` dims to opacity-60
// with no hover.
function RefChip({
  kind,
  children,
  resolving,
  unresolved,
}: {
  kind: ChipKind;
  children: ReactNode;
  resolving?: boolean;
  unresolved?: boolean;
}) {
  if (unresolved) {
    return (
      <span className={`${MSG_REF_CHIP} ${CHIP_TONE_UNRESOLVED[kind]} opacity-60`}>{children}</span>
    );
  }
  return (
    <span
      className={`${MSG_REF_CHIP} ${CHIP_TONE[kind]} ${
        resolving ? "cursor-wait opacity-80" : "cursor-default"
      }`}
    >
      {children}
      {resolving ? <Spinner size="sm" className="ml-1 inline-block align-[-1px]" /> : null}
    </span>
  );
}

// Self-mention chip with the profile hover preview (source MentionLink wraps
// every @mention in a PreviewCard). The trigger keeps the self-mention chip
// classes; hovering opens the human profile card.
function SelfMentionPreview({ children }: { children: ReactNode }) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        delay={200}
        closeDelay={120}
        render={
          <span
            className={`${MSG_REF_CHIP} cursor-default bg-soft-signal hover:bg-soft-signal/80`}
          />
        }
      >
        {children}
      </PreviewCardTrigger>
      <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[280px]">
        <ProfileCardBody variant="member" sender="Developer" meta="member" />
      </PreviewCardContent>
    </PreviewCard>
  );
}

// Unknown-@mention fallback: bold underlined text, no hover-pink, not clickable.
function UnknownMention({ children }: { children: ReactNode }) {
  return (
    <span className="select-text font-bold text-black underline decoration-black/30 decoration-2 underline-offset-2">
      {children}
    </span>
  );
}

// App-level slock permalink chip: icon + channel label + trailing "msg".
// Cross-server permalinks swap to a white/blue tone.
function PermalinkChip({ label, crossServer }: { label: string; crossServer?: boolean }) {
  const tone = crossServer ? "bg-white text-blue-700 hover:bg-black/5" : CHIP_TONE.task;
  return (
    <span className={`${MSG_REF_CHIP} inline-flex cursor-default items-center gap-1 ${tone}`}>
      <LinkIcon className="size-3 shrink-0" />
      <span className="truncate">{label}</span>
      <span className="text-[10px] font-normal leading-none text-black/50">msg</span>
    </span>
  );
}

// Task-status footer badge (source STATUS_BADGE_CONFIG). Task rendering is
// app-level in source (no raft-ui task badge), so it is composed inline with
// the exact source classes; every status uses a brutal token background.
type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "closed";

const TASK_STATUS_CONFIG: Record<TaskStatus, { bg: string; icon: typeof Circle; label: string }> = {
  todo: { bg: "bg-brutal-orange", icon: Circle, label: "Todo" },
  in_progress: { bg: "bg-brutal-cyan", icon: Play, label: "In Progress" },
  in_review: { bg: "bg-brutal-lavender", icon: Eye, label: "In Review" },
  done: { bg: "bg-brutal-lime", icon: CheckCircle, label: "Done" },
  closed: { bg: "bg-brutal-stone", icon: Ban, label: "Closed" },
};

// Server-manager option order (source getTaskStatusOptions / TASK_STATUS_UI).
const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "in_review", "done", "closed"];

// Footer task badge → source InlineBadgeEditor: the badge is the trigger for a
// status-change dropdown (card-brutal rows + trailing Check on the current
// status). Selecting a row echoes the new status back into the badge (local
// state only — no real mutation). Composed on the DS DropdownMenu whose brutal
// theme resolves to the same card-brutal chrome + hover:bg-soft-signal/30 rows.
function TaskStatusBadge({
  status: initialStatus,
  taskNumber,
  assignee,
  busy,
}: {
  status: TaskStatus;
  taskNumber: number;
  assignee?: string;
  busy?: boolean;
}) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const cfg = TASK_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const fullLabel = assignee ? `task #${taskNumber} @${assignee}` : `task #${taskNumber}`;
  return (
    <div
      className={`relative inline-flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap ${
        busy ? "pointer-events-none opacity-60" : ""
      }`}
      title={fullLabel}
      data-task-status={status}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Badge
              className={`border-black text-black ${cfg.bg} transition-[filter,opacity] duration-100 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60`}
              render={
                <button
                  type="button"
                  disabled={busy}
                  title={`${fullLabel} · Change task status`}
                  aria-label={`Change status for ${fullLabel}`}
                />
              }
            />
          }
        >
          <Icon size={10} className="shrink-0" />
          <span className="shrink-0">#{taskNumber}</span>
          {assignee ? <span className="min-w-0 truncate">@{assignee}</span> : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={`min-w-[140px] ${MENU_CONTENT_CLASS}`}>
          {TASK_STATUS_ORDER.map((id) => (
            <DropdownMenuItem
              key={id}
              className={`justify-between ${MENU_ITEM_CLASS}`}
              onClick={() => setStatus(id)}
            >
              <span className="truncate">{TASK_STATUS_CONFIG[id].label}</span>
              <Check size={14} className={id === status ? "opacity-100" : "opacity-0"} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// One reaction pill mirroring the design-system fixtures (sprite glyph + count).
// `title` carries the native reactor-summary tooltip source renders on the pill.
function ReactionPill({
  emoji,
  count,
  reacted,
  failed,
  title,
}: {
  emoji: string;
  count: number;
  reacted?: boolean;
  failed?: boolean;
  title?: string;
}) {
  return (
    <MessageReactionChip
      reacted={reacted}
      failed={failed}
      title={title ?? `${emoji} ${count}`}
      aria-label={`${emoji} ${count}`}
      className={REACTION_CLASS}
    >
      <MessageReactionGlyph emoji={emoji} size={15} />
      <MessageReactionCount>{count}</MessageReactionCount>
    </MessageReactionChip>
  );
}

// Source summary line: mono, tight tracking, `pr-5` gutter for the affordance.
const ATTACHMENT_SUMMARY_CLASS =
  "flex items-center gap-1.5 whitespace-nowrap pr-5 font-mono text-[10px] font-bold tracking-[-0.04em]";

// A single attachment card (filename, meta line, optional summary, affordance).
// `loading` swaps the affordance for the "Opening preview…" bar; `optimistic`
// dims the card and shows an upload spinner (both suppress the affordance,
// matching source AttachmentChip). `commentCount` appends the scoped count into
// the meta line; `secondaryDownload` adds the audio-card second action.
function FileCard({
  name,
  meta,
  summary,
  affordance,
  loading,
  optimistic,
  commentCount,
  secondaryDownload,
}: {
  name: string;
  meta?: string;
  summary?: ReactNode;
  affordance?: ReactNode;
  loading?: boolean;
  optimistic?: boolean;
  commentCount?: number;
  secondaryDownload?: boolean;
}) {
  const card = (
    <MessageAttachmentCard loading={loading} optimistic={optimistic}>
      <MessageAttachmentBody>
        <MessageAttachmentTitle>{name}</MessageAttachmentTitle>
        {meta || commentCount ? (
          <MessageAttachmentMeta>
            {meta}
            {commentCount ? (
              <span className="inline-flex items-center gap-1 pl-1">
                {meta ? <span className="text-black/35">·</span> : null}
                <MessageSquare className="size-[9px] shrink-0" />
                {commentCount}
              </span>
            ) : null}
          </MessageAttachmentMeta>
        ) : null}
      </MessageAttachmentBody>
      {summary ? <div className={ATTACHMENT_SUMMARY_CLASS}>{summary}</div> : null}
      {loading ? (
        <MessageAttachmentLoadingBar>
          <Spinner size="sm" />
          <span className="truncate">Opening preview…</span>
        </MessageAttachmentLoadingBar>
      ) : optimistic ? (
        <Spinner size="sm" className="absolute bottom-2 right-2" />
      ) : affordance ? (
        <MessageAttachmentAction className={secondaryDownload ? "right-1.5" : undefined}>
          {affordance}
        </MessageAttachmentAction>
      ) : null}
      {secondaryDownload && !loading && !optimistic ? (
        <MessageAttachmentAction className="right-7">
          <Download />
        </MessageAttachmentAction>
      ) : null}
    </MessageAttachmentCard>
  );
  return card;
}

// Gallery preview affordance: a full-cover trigger over an image tile that opens
// the DS Lightbox (the migration of source `ui/Lightbox` → ImageLightbox). Its
// brutal variant supplies the dark backdrop + bordered contain media; the header
// carries the filename + inert download and the close affordance.
function ImagePreviewButton({ src, name }: { src: string; name: string }) {
  return (
    <Lightbox>
      <LightboxTrigger
        render={
          <button
            type="button"
            aria-label="Preview image"
            className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black"
          />
        }
      />
      <LightboxContent className="flex flex-col">
        <LightboxHeader className="flex h-14 items-center gap-3 px-4">
          <LightboxTitle>{name}</LightboxTitle>
          <LightboxActions>
            <SelectBarButton icon tone="white" aria-label="Download" title="Download">
              <Download size={14} />
            </SelectBarButton>
            <LightboxClose
              render={
                <SelectBarButton icon tone="white" aria-label="Close" title="Close">
                  <X size={14} />
                </SelectBarButton>
              }
            />
          </LightboxActions>
        </LightboxHeader>
        <LightboxStage>
          <LightboxMedia className="object-contain" render={<img src={src} alt="" />} />
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}

export function PlaygroundMainPanel({ channel }: { channel: PlaygroundChannel }) {
  const [tab, setTab] = useState<PanelTab>("chat");
  const [tabOrder, setTabOrder] = useState<PanelTab[]>(["chat", "tasks", "files"]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const isDm = channel.kind === "dm-agent" || channel.kind === "dm-human";
  const composerLabel = isDm ? `Message @${channel.name}` : `Message #${channel.name}`;

  return (
    <ChatMainPanelRoot>
      {isDm ? <DmHeader channel={channel} /> : <ChannelHeader channel={channel} />}

      <ChatMainPanelTabs render={<Tabs value={tab} onValueChange={(value) => setTab(value)} />}>
        <SortableTabsList
          value={tabOrder}
          onReorder={setTabOrder}
          className={SORTABLE_TABS_LIST_CLASS}
        >
          {tabOrder.map((id) => (
            <SortableTabsTab key={id} value={id} className={SORTABLE_TAB_CLASS}>
              {TAB_META[id].icon}
              <TabsLabel>{TAB_META[id].label}</TabsLabel>
            </SortableTabsTab>
          ))}
        </SortableTabsList>
      </ChatMainPanelTabs>

      {tab === "chat" ? (
        <ChannelBody channel={channel} timelineRef={timelineRef} />
      ) : tab === "tasks" ? (
        <TabPlaceholder
          icon={<ListTodo />}
          title="No tasks yet"
          description="Tasks promoted from this conversation will show up here."
        />
      ) : (
        <TabPlaceholder
          icon={<Paperclip />}
          title="No files yet"
          description="Attach files in Chat, or drag files into the message composer. They will appear here after the message is sent."
        />
      )}

      <Composer label={composerLabel} uploads={channel.id === "incident-alerts"} />
      <MessageSelectionShortcut />
    </ChatMainPanelRoot>
  );
}

function ChannelHeader({ channel }: { channel: PlaygroundChannel }) {
  const Icon = channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
  const isMuted = channel.id === "component-matrix";

  return (
    <ChatMainPanelHeader>
      <ChatMainPanelHeaderIcon className="[&_svg]:size-[14px]">
        <Icon />
      </ChatMainPanelHeaderIcon>
      <ChatMainPanelTitleBlock>
        <div className="flex min-w-0 items-center gap-2">
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          {isMuted ? (
            <span
              title="Activity muted. Direct mentions can still notify you."
              className="inline-flex shrink-0 items-center gap-1 border-2 border-black bg-brutal-orange/25 px-1.5 py-1 text-[11px] font-bold uppercase leading-none text-black"
            >
              <BellOff size={11} />
              Muted
            </span>
          ) : null}
        </div>
        <ChatMainPanelSubtitle>{channel.subtitle}</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
      <ChatMainPanelActions>
        <PanelIconButton aria-label="Search this channel">
          <Search />
        </PanelIconButton>
        {isMuted ? (
          <PanelIconButton
            aria-label="Unmute activity for this channel"
            className="bg-brutal-orange text-black"
          >
            <BellOff />
          </PanelIconButton>
        ) : (
          <PanelIconButton aria-label="Mute activity for this channel">
            <Bell />
          </PanelIconButton>
        )}
        <PanelIconButton aria-label="Stop all agents in this channel">
          <Square />
        </PanelIconButton>
        <PanelIconButton aria-label="Edit channel">
          <Settings />
        </PanelIconButton>
        <PanelIconButton aria-label="View participants" className="w-auto min-w-7 gap-1.5 px-2.5">
          <Users />
          <span className="min-w-[1ch] text-center font-mono text-[11px] font-bold leading-none tabular-nums">
            7
          </span>
        </PanelIconButton>
      </ChatMainPanelActions>
    </ChatMainPanelHeader>
  );
}

// DM header: agent avatar instead of the hash box, an inline presence dot +
// status beside the name, and only the mute action.
function DmHeader({ channel }: { channel: PlaygroundChannel }) {
  return (
    <ChatMainPanelHeader>
      <Avatar
        size="md"
        type="agent"
        className="[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-cyan [[data-preview-theme=brutal]_&]:text-black"
      >
        <AvatarFallback />
      </Avatar>
      <ChatMainPanelTitleBlock>
        <div className="flex min-w-0 items-center gap-2">
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          <span
            aria-hidden
            className="inline-block size-2.5 shrink-0 rounded-full border border-line-strong bg-success-base [[data-preview-theme=brutal]_&]:border-black"
          />
          <ChatMainPanelSubtitle className="text-sm [[data-preview-theme=brutal]_&]:text-black/60">
            {channel.subtitle}
          </ChatMainPanelSubtitle>
        </div>
      </ChatMainPanelTitleBlock>
      <ChatMainPanelActions>
        <PanelIconButton aria-label="Mute activity for this DM">
          <Bell />
        </PanelIconButton>
      </ChatMainPanelActions>
    </ChatMainPanelHeader>
  );
}

function ChannelBody({
  channel,
  timelineRef,
}: {
  channel: PlaygroundChannel;
  timelineRef: RefObject<HTMLDivElement | null>;
}) {
  switch (channel.id) {
    case "proj-uiux":
      return <ProjUiuxBody channelId={channel.id} />;
    case "incident-alerts":
      return <IncidentBody />;
    case "release":
      return <ReleaseBody timelineRef={timelineRef} />;
    case "component-matrix":
      return <MatrixBody />;
    case "dm-atlas":
      return <DmAtlasBody channelId={channel.id} />;
    case "new-channel":
      return <NewChannelBody />;
    default:
      return null;
  }
}

// Scenario 1: data-rich channel — member + agent rows, a continuation row, and
// both the plain and the cyan-unread reply badges.
function ProjUiuxBody({ channelId }: { channelId: PlaygroundChannelId }) {
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <div className="px-3 pt-3">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:17 AM"
            body="Should we migrate from Zustand to Jotai? Jotai's atom model might be better for our store structure."
            footer={<RepliesBadge channelId={channelId} count={2} />}
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            status="online"
            time="08:22 AM"
            body="The invite link system needs rate limiting. Someone could enumerate valid invite codes."
            footer={<RepliesBadge channelId={channelId} count={3} />}
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:27 AM"
            body="Performance: the message list re-renders when any agent activity changes. Need to fix selectors."
            footer={<UnreadRepliesBadge channelId={channelId} count={1} unread={1} />}
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            status="working"
            time="08:32 AM"
            body="Documentation: we should auto-generate API docs from the route definitions. Maybe use Swagger."
            footer={<RepliesBadge channelId={channelId} count={2} />}
          />
          <MessageRow compact gutterTime="08:34 AM" body="Great work!" />

          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:35 AM"
            body={
              <>
                Todo: check default seed member permissions <RefChip kind="task">#10</RefChip>
              </>
            }
            footer={<TaskStatusBadge status="todo" taskNumber={10} />}
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:36 AM"
            body={
              <>
                In progress: verify RustFS attachment previews <RefChip kind="task">#11</RefChip>
              </>
            }
            footer={<TaskStatusBadge status="in_progress" taskNumber={11} />}
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:37 AM"
            body={
              <>
                In review: thread reminder wake regression <RefChip kind="task">#12</RefChip>
              </>
            }
            footer={<TaskStatusBadge status="in_review" taskNumber={12} />}
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:38 AM"
            body={
              <>
                Done: archived-channel smoke check <RefChip kind="task">#13</RefChip>
              </>
            }
            footer={<TaskStatusBadge status="done" taskNumber={13} />}
          />

          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:39 AM"
            body={<ChipDemoBody />}
            footer={
              <>
                <ReactionPill emoji="👍" count={1} reacted />
                <ReactionPill emoji="👀" count={1} />
              </>
            }
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:41 AM"
            body="Attachments: PNG, JPEG, and a text file are linked to this message."
            attachments={
              <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
                <FileCard name="seed-pixel.png" meta="image/png · 1 KB" affordance={<Eye />} />
                <FileCard name="seed-photo.jpg" meta="image/jpeg · 1 KB" affordance={<Eye />} />
                <FileCard
                  name="seed-notes.txt"
                  meta="Text preview · 1 KB"
                  summary="Plain text document"
                  affordance={<Eye />}
                />
              </div>
            }
          />
          <MessageRow
            compact
            gutterTime="08:42 AM"
            attachments={
              <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
                <FileCard
                  name="seed-this-is-an-extremely-long-markdown-filename-used-to-verify-attachment-preview-card-truncation.md"
                  meta="Markdown preview · 1 KB"
                  summary="Markdown document"
                  affordance={<Eye />}
                />
              </div>
            }
          />

          <div className="pb-3" aria-hidden />
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
    </ChatMainPanelBody>
  );
}

// Rich-text body reproduction (source renders markdown + inline reference chips
// at the app level; the design-system MessageItemBody is a plain container).
function ChipDemoBody() {
  return (
    <div className="space-y-1">
      <p>
        <strong>Message chip height demo</strong> — compare inline chips in one dense message.
      </p>
      <p>
        Self mention: <SelfMentionPreview>@Developer</SelfMentionPreview> is the attention chip.
        Normal mentions like <a className={MENTION_LINK_CLASS}>@Member</a> stay text-link style.
      </p>
      <p>
        Refs in one line: <RefChip kind="channel">#general</RefChip>{" "}
        <RefChip kind="task">task #15</RefChip> <RefChip kind="thread">#general:67253b90</RefChip>{" "}
        <PermalinkChip label="#general" />
      </p>
      <blockquote className="my-1 border-l-2 border-black/40 pl-3 italic text-black/70">
        Quote row repeats the same shapes at one line height.
      </blockquote>
      <p>
        Code should not become chips: <code className={INLINE_CODE_CLASS}>@Developer #general</code>
      </p>
    </div>
  );
}

// Scenario 2: incident channel — a short member/agent exchange.
function IncidentBody() {
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <div className="px-3 pt-3">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

          <SystemMessageItem>
            <SystemMessageItemTime>09:10 AM</SystemMessageItemTime>
            <SystemMessageItemContent>
              Deploy Bot restarted on the primary machine.
            </SystemMessageItemContent>
          </SystemMessageItem>
          <MessageRow
            variant="agent"
            sender="Deploy Bot"
            meta="Deploy agent on the primary online machine."
            status="error"
            time="09:12 AM"
            inlineStatus="Converting…"
            body="Delivery degraded — the deploy webhook failed three times and retries are queued."
          />
          <MessageRow
            variant="member"
            sender="Mx. Chen"
            senderState="removed"
            time="09:16 AM"
            body="Looping in the on-call rotation before the next deploy window."
          />
          <MessageRow
            variant="member"
            sender="Ada"
            meta="member"
            time="09:20 AM"
            body="Looking now. I'll re-enable the webhook once the incident is resolved."
          />
          <MessageRow compact gutterTime="09:24 AM" body="Retries are draining, back to healthy." />

          <div className="pb-3" aria-hidden />
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
    </ChatMainPanelBody>
  );
}

// Scenario 3: longer thread scrolled up — the jump-to-latest control shows.
function ReleaseBody({ timelineRef }: { timelineRef: RefObject<HTMLDivElement | null> }) {
  const handleJump = () => {
    const el = timelineRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline ref={timelineRef}>
        <ChatMainPanelMessageList>
          <div className="px-3 pt-3">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

          {RELEASE_MESSAGES.map((message, index) => (
            <MessageRow
              key={index}
              variant={message.variant}
              sender={message.sender}
              meta={message.meta}
              status={message.variant === "agent" ? "online" : undefined}
              time={message.time}
              body={message.body}
            />
          ))}

          <div className="pb-3" aria-hidden />
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
      <ChatMainPanelJumpToLatest onClick={handleJump}>
        <ArrowDown />
        Back to bottom
      </ChatMainPanelJumpToLatest>
    </ChatMainPanelBody>
  );
}

const AGENT_META = "Release agent on the primary online machine.";

const RELEASE_MESSAGES: {
  variant: RowVariant;
  sender: string;
  meta: string;
  time: string;
  body: string;
}[] = [
  {
    variant: "member",
    sender: "Ada",
    meta: "member",
    time: "08:01 AM",
    body: "Cutting the 2.4 release candidate now.",
  },
  {
    variant: "agent",
    sender: "Atlas",
    meta: AGENT_META,
    time: "08:03 AM",
    body: "Changelog drafted from merged PRs.",
  },
  {
    variant: "member",
    sender: "Developer",
    meta: "member",
    time: "08:06 AM",
    body: "Token migration landed on main.",
  },
  {
    variant: "agent",
    sender: "Atlas",
    meta: AGENT_META,
    time: "08:09 AM",
    body: "Running the visual regression suite.",
  },
  {
    variant: "member",
    sender: "Ada",
    meta: "member",
    time: "08:12 AM",
    body: "Two snapshots need re-baselining.",
  },
  {
    variant: "agent",
    sender: "Atlas",
    meta: AGENT_META,
    time: "08:15 AM",
    body: "Re-baselined and re-ran, all green.",
  },
  {
    variant: "member",
    sender: "Developer",
    meta: "member",
    time: "08:18 AM",
    body: "Docs preview deployed to staging.",
  },
  {
    variant: "agent",
    sender: "Atlas",
    meta: AGENT_META,
    time: "08:21 AM",
    body: "Smoke tests passing on staging.",
  },
  {
    variant: "member",
    sender: "Ada",
    meta: "member",
    time: "08:24 AM",
    body: "Tagging v2.4.0-rc.1.",
  },
  {
    variant: "agent",
    sender: "Atlas",
    meta: AGENT_META,
    time: "08:27 AM",
    body: "Tag pushed, release notes attached.",
  },
  {
    variant: "member",
    sender: "Developer",
    meta: "member",
    time: "08:30 AM",
    body: "Promoting the candidate to production.",
  },
  {
    variant: "agent",
    sender: "Atlas",
    meta: AGENT_META,
    time: "08:33 AM",
    body: "Production rollout complete.",
  },
];

// Full markdown skin (source BASE_MARKDOWN_COMPONENTS). Markdown is rendered at
// the app level in source, so every element carries its exact source class.
function MarkdownShowcaseBody() {
  return (
    <div>
      <h1 className="mb-1 mt-3 text-[1.286em] font-bold leading-tight">Heading 1</h1>
      <h2 className="mb-1 mt-2 text-[1.143em] font-bold leading-tight">Heading 2</h2>
      <h3 className="mb-1 mt-2 text-[1.071em] font-bold leading-tight">Heading 3</h3>
      <h4 className="mb-0.5 mt-1 text-[1em] font-bold leading-tight">Heading 4</h4>
      <h5 className="mb-0.5 mt-1 text-[1em] font-bold leading-tight">Heading 5</h5>
      <h6 className="mb-0.5 mt-1 text-[1em] font-bold leading-tight text-black/70">Heading 6</h6>
      <p className="mb-1 last:mb-0">
        Inline: <strong>bold</strong>, <em>italic</em>, <del>strikethrough</del>,{" "}
        <code className={INLINE_CODE_CLASS}>inline code</code>, H<sub>2</sub>O and x<sup>2</sup>,
        plus escaped *literal* asterisks.
      </p>
      <p className="mb-1 last:mb-0">
        First line
        <br />
        hard-break second line.
      </p>
      <p className="mb-1 last:mb-0">
        <a className="select-text text-blue-700 underline decoration-2 underline-offset-2 hover:text-brutal-pink">
          Labeled link
        </a>{" "}
        and an autolink{" "}
        <a className="select-text text-blue-700 underline decoration-2 underline-offset-2 hover:text-brutal-pink">
          https://example.com/build
        </a>
      </p>
      <p className="mb-1 last:mb-0">部署成功 🎉 完成 — emoji and CJK render as plain body text.</p>
      <p className="mb-1 last:mb-0">
        Search match:{" "}
        <mark className="bg-soft-signal/70 text-inherit [font:inherit]">migration plan</mark> is
        washed in-place.
      </p>
      <ul className="mb-1 list-disc pl-5">
        <li className="mb-0.5">Unordered item</li>
        <li className="mb-0.5">
          Nested list
          <ul className="mb-1 list-disc pl-5">
            <li className="mb-0.5">child bullet</li>
          </ul>
        </li>
      </ul>
      <ol className="mb-1 list-decimal pl-5">
        <li className="mb-0.5">Ordered one</li>
        <li className="mb-0.5">Ordered two</li>
      </ol>
      <ul className="mb-1 list-disc pl-5">
        <li className="mb-0.5">
          <input type="checkbox" disabled defaultChecked /> completed task-list item
        </li>
        <li className="mb-0.5">
          <input type="checkbox" disabled /> open task-list item
        </li>
      </ul>
      <blockquote className="my-1 border-l-2 border-black/40 pl-3 italic text-black/70">
        Blockquote wraps at the same line height.
      </blockquote>
      <hr className="my-2 border-t-2 border-black" />
      <div className="my-2 overflow-x-auto">
        <table className="border-collapse border-2 border-black text-sm">
          <thead>
            <tr>
              <th className="whitespace-nowrap border-2 border-black bg-brutal-cyan px-2 py-1 text-left font-bold">
                Token
              </th>
              <th className="whitespace-nowrap border-2 border-black bg-brutal-cyan px-2 py-1 text-left font-bold">
                Surface
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1">layer-panel</td>
              <td className="border border-black px-2 py-1">panel</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">line-strong</td>
              <td className="border border-black px-2 py-1">border</td>
            </tr>
          </tbody>
        </table>
      </div>
      <img className="my-2 max-w-full border-2 border-black" src={IMAGE_SRC} alt="markdown embed" />
    </div>
  );
}

// Fenced code block (source BASE_MARKDOWN_COMPONENTS `pre` → BaseCodePre): dark
// terminal surface, no syntax highlighting, copy gutter reserved via `pr-12`.
function CodeBlockBody() {
  return (
    <div className="space-y-1">
      <p>Here is the loader I landed — no highlighting, just the mono block.</p>
      <pre className="overflow-x-auto border-2 border-black bg-gray-900 p-3 pr-12 font-mono text-white [font-size:inherit] [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0">
        <code>{"const tokens = load();\nconsole.log(tokens.layerPanel);"}</code>
      </pre>
    </div>
  );
}

// Non-navigating reply badge (plain or cyan-unread) for the state matrix.
function PlainRepliesBadge({ count, unread }: { count: number; unread?: number }) {
  return (
    <MessageItemBadge tone={unread ? "cyan" : "default"} className={BADGE_CLASS}>
      <MessageSquare />
      {count === 1 ? "1 reply" : `${count} replies`}
      {unread ? (
        <>
          <span className="text-foreground/45">·</span>
          <span>{unread} new</span>
        </>
      ) : null}
    </MessageItemBadge>
  );
}

// Reply badge draft variants (source ThreadRepliesBadge): draft-only shows the
// pencil + "draft"; replies+draft appends the draft segment after the count.
function DraftRepliesBadge({ count, unread }: { count?: number; unread?: number }) {
  return (
    <MessageItemBadge tone={unread ? "cyan" : "default"} className={BADGE_CLASS}>
      {count ? (
        <>
          <MessageSquare />
          {count === 1 ? "1 reply" : `${count} replies`}
          {unread ? (
            <>
              <span className="text-foreground/45">·</span>
              <span>{unread} new</span>
            </>
          ) : null}
          <span className="text-black/45">·</span>
        </>
      ) : null}
      <Pencil className="shrink-0 text-black/55" />
      <span className="text-black/55">draft</span>
    </MessageItemBadge>
  );
}

// System-run collapse disclosure (source SystemMessageGroupDisclosure): a
// centered toggle whose chevron rotates between expanded/collapsed.
function SystemGroupDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1">
      <div className="flex justify-center py-1.5">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="group flex max-w-full items-center gap-1.5 px-2 py-1 text-xs text-black/50 hover:text-black/75"
        >
          <span className="truncate">
            There are 3 system updates: 2 task updates, 1 reminder update
          </span>
          <ChevronRight
            className={`size-3 shrink-0 text-black/35 transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
          />
        </button>
      </div>
      {open ? (
        <>
          <SystemMessageItem>
            <SystemMessageItemTime>09:41 AM</SystemMessageItemTime>
            <SystemMessageItemContent>Task #12 moved to In Review.</SystemMessageItemContent>
          </SystemMessageItem>
          <SystemMessageItem>
            <SystemMessageItemTime>09:42 AM</SystemMessageItemTime>
            <SystemMessageItemContent>Task #13 marked Done.</SystemMessageItemContent>
          </SystemMessageItem>
          <SystemMessageItem>
            <SystemMessageItemTime>09:43 AM</SystemMessageItemTime>
            <SystemMessageItemContent>Reminder rescheduled to tomorrow.</SystemMessageItemContent>
          </SystemMessageItem>
        </>
      ) : null}
    </div>
  );
}

// History top-of-timeline state (source HistoryTopState). The three variants
// (load-older button, loading notice, plan-limited lock) are mutually exclusive;
// source only ever shows one, so render the plan-limited lock at rest.
function HistoryTopStates() {
  return (
    <div className="px-3 pt-3">
      <div className="flex justify-center pb-2">
        <MessageTimelineHistoryLimited className="font-mono text-xs text-black/50">
          <Lock size={12} />
          Older messages are limited by the current plan
        </MessageTimelineHistoryLimited>
      </div>
    </div>
  );
}

// Named reactor set for the hover popover demo.
const REACTOR_NAMES = ["Developer", "Ada", "Atlas", "Mx. Chen", "Viewer", "Admin", "Cindy"];

type PointPos = { x: number; y: number };

// The task-action row of the context menu depends on the message's task link
// (source: Convert to Task / Mark as Done / Reopen Task).
type MessageTask = "none" | "open" | "done";

// Optional list-level select-mode wiring shared by every MessageRow in a list.
// When a list provides it, the menu's "Select Message" enters select mode and
// rows render checkboxes; without it the item is inert (source parity: select
// mode is a list concern with a sticky bottom toolbar).
type MessageListApi = {
  selectMode: boolean;
  selected: ReadonlySet<string>;
  toggleSelect: (id: string) => void;
  enterSelect: (id: string) => void;
};

const MessageListContext = createContext<MessageListApi | null>(null);

// Base UI portals menus/popovers to `document.body`, OUTSIDE the preview's
// `[data-preview-theme=brutal]` scope, so `[[data-preview-theme=brutal]_&]:`
// pins never match and the DS token defaults (zinc border, soft shadow,
// font-semibold) leak through. Author the brutal chrome with literal classes
// instead — same approach as the text-selection popover, which renders correctly
// despite the portal: pure-black 2px border + hard `shadow-brutal`, and source
// `ui/MenuItem` metrics (font-medium, px-3 py-2). Elegant is out of scope.
const MENU_CONTENT_CLASS = "border-2 border-black shadow-brutal";
const MENU_ITEM_CLASS = "px-3 py-2 font-medium text-black";

// Source ui/Button, brutal palette — the SelectModeToolbar buttons. The DS
// Button has no brutal tone axis, so the source classes are composed inline
// (same pattern as TaskStatusBadge).
const SELECT_BAR_BUTTON_BASE =
  "btn-brutal-sm inline-flex shrink-0 items-center justify-center whitespace-nowrap font-bold leading-none";
const SELECT_BAR_BUTTON_TONE: Record<"white" | "pink", string> = {
  white: "bg-white text-black",
  pink: "bg-brutal-pink text-black",
};

function SelectBarButton({
  tone,
  icon,
  className,
  children,
  ...props
}: { tone: "white" | "pink"; icon?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const shape = icon ? "size-7 text-xs" : "h-7 gap-1.5 px-2.5 text-xs";
  return (
    <button
      type="button"
      className={`${SELECT_BAR_BUTTON_BASE} ${SELECT_BAR_BUTTON_TONE[tone]} ${shape} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Bottom sticky bulk-action bar (source SelectModeToolbar): count + Cancel /
// Forward / Copy-link / More(⋯ → Generate image / Copy MD). Inert demo — only
// Cancel exits select mode. The More popover is the DS DropdownMenu, whose
// brutal chrome + `hover:bg-soft-signal/30` rows already match source's inline
// menu; brutal pins pull the border/shadow/text to source's pure black.
function SelectModeToolbar({ count, onCancel }: { count: number; onCancel: () => void }) {
  return (
    <div className="border-t-2 border-black bg-soft-signal" data-testid="select-mode-toolbar">
      <div className="flex items-center gap-1.5 px-2 py-2">
        <span
          className="whitespace-nowrap font-mono text-xs font-bold text-black/70"
          data-testid="select-mode-count"
        >
          {count} selected
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
          <SelectBarButton tone="white" onClick={onCancel} aria-label="Cancel" title="Cancel">
            <X size={14} />
            <span>Cancel</span>
          </SelectBarButton>
          <SelectBarButton tone="pink" aria-label="Forward" title="Forward">
            <Send size={14} />
            <span>Forward</span>
          </SelectBarButton>
          <SelectBarButton tone="white" aria-label="Copy link" title="Copy link">
            <Copy size={14} />
            <span>Copy link</span>
          </SelectBarButton>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SelectBarButton
                  icon
                  tone="white"
                  aria-label="More selected message actions"
                  title="More"
                >
                  <MoreHorizontal size={14} />
                </SelectBarButton>
              }
            />
            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={8}
              data-testid="select-mode-more-menu"
              className={`min-w-44 ${MENU_CONTENT_CLASS}`}
            >
              <DropdownMenuItem className={MENU_ITEM_CLASS}>
                <ImageIcon size={14} />
                Generate image
              </DropdownMenuItem>
              <DropdownMenuItem className={MENU_ITEM_CLASS}>
                <Copy size={14} />
                Copy MD
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// Floating text-selection shortcut (source MessageSelectionShortcut): highlight
// text inside a message body → a Quote / Copy menu above the selection. The
// document selection is an external system, so a mouseup/selectionchange
// listener genuinely needs useEffect (the one sanctioned exception here). Inert
// buttons — trigger + styling only.
function MessageSelectionShortcut() {
  const [position, setPosition] = useState<PointPos | null>(null);

  useEffect(() => {
    const update = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPosition(null);
        return;
      }
      const range = selection.getRangeAt(0);
      const withinSelectable = (node: Node | null) => {
        const element = node instanceof Element ? node : (node?.parentElement ?? null);
        return Boolean(element?.closest("[data-message-selectable='true']"));
      };
      if (!withinSelectable(range.startContainer) || !withinSelectable(range.endContainer)) {
        setPosition(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setPosition(null);
        return;
      }
      // Estimated menu 124×32, 8px gap, centered above the selection.
      setPosition({ x: rect.left + rect.width / 2 - 62, y: rect.top - 40 });
    };
    const onMouseUp = () => window.setTimeout(update, 0);
    document.addEventListener("selectionchange", update);
    document.addEventListener("mouseup", onMouseUp, true);
    return () => {
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("mouseup", onMouseUp, true);
    };
  }, []);

  if (!position) return null;

  return createPortal(
    <div
      role="menu"
      aria-label="Selected text actions"
      data-message-selection-shortcut="true"
      className="fixed z-[70] flex select-none overflow-hidden border-2 border-black bg-white text-xs font-semibold shadow-brutal-sm"
      style={{ left: position.x, top: position.y }}
    >
      <button
        type="button"
        role="menuitem"
        className="flex h-7 items-center gap-1.5 px-2 text-black transition-colors hover:bg-soft-signal/30"
      >
        <TextQuote size={13} />
        Quote
      </button>
      <div className="w-px bg-black/20" aria-hidden />
      <button
        type="button"
        role="menuitem"
        className="flex h-7 items-center gap-1.5 px-2 text-black transition-colors hover:bg-soft-signal/30"
      >
        <Copy size={13} />
        Copy
      </button>
    </div>,
    document.body,
  );
}

// Divider between menu sections — the portaled DS ContextMenuSeparator escapes
// the brutal scope, so author its pure-black hairline literally (see MENU_*).
const CTX_SEPARATOR_CLASS = "border-black";

// Right-click context menu content (source MessageItem handleContextMenu → menu
// at MessageItem.tsx:4355-4526): quick-reaction row on top, then Copy Link / Copy
// Markdown / Select Message | Open Thread | Save/Remove | Follow/Unfollow | task
// action, split by dividers. Rendered as the DS ContextMenu content (Base UI),
// opened from each row's ContextMenuTrigger at the cursor. Every action is inert
// (auto-closes) except Select Message, which enters the list's select mode when
// one is provided. `onQuickReact` closes the controlled menu after a quick
// reaction (those buttons are not menu items, so they do not auto-close).
function MessageContextMenuContent({
  saved,
  followed,
  task,
  onQuickReact,
  onSelectMessage,
}: {
  saved?: boolean;
  followed?: boolean;
  task: MessageTask;
  onQuickReact: () => void;
  onSelectMessage?: () => void;
}) {
  const taskAction =
    task === "done"
      ? { icon: <RotateCcw size={14} />, label: "Reopen Task" }
      : task === "open"
        ? { icon: <CheckCircle size={14} />, label: "Mark as Done" }
        : { icon: <ClipboardCheck size={14} />, label: "Convert to Task" };

  return (
    <ContextMenuContent
      aria-label="Message context menu"
      className={MENU_CONTENT_CLASS}
      collisionAvoidance={{ side: "flip", align: "flip" }}
      collisionPadding={8}
    >
      {/* Base UI moves focus to the first tabbable child on open; source never
          focuses a quick-reaction button, so suppress the UA focus ring here to
          keep the open menu pixel-identical (the ring is the only artifact the
          DS focus manager adds — the menu items keep their own highlight). */}
      <MessageReactionQuickRow className="[&_button]:outline-none">
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <MessageReactionQuickButton
            key={emoji}
            title={`React with ${emoji}`}
            aria-label={`React with ${emoji}`}
            onClick={onQuickReact}
          >
            <MessageReactionGlyph emoji={emoji} size={18} className="block" />
          </MessageReactionQuickButton>
        ))}
      </MessageReactionQuickRow>
      <ContextMenuSeparator className={CTX_SEPARATOR_CLASS} />
      <ContextMenuItem className={MENU_ITEM_CLASS}>
        <LinkIcon size={14} />
        Copy Link
      </ContextMenuItem>
      <ContextMenuItem className={MENU_ITEM_CLASS}>
        <Copy size={14} />
        Copy Markdown
      </ContextMenuItem>
      <ContextMenuItem className={MENU_ITEM_CLASS} onClick={onSelectMessage}>
        <CheckCircle size={14} />
        Select Message
      </ContextMenuItem>
      <ContextMenuSeparator className={CTX_SEPARATOR_CLASS} />
      <ContextMenuItem className={MENU_ITEM_CLASS}>
        <MessageSquare size={14} />
        Open Thread
      </ContextMenuItem>
      <ContextMenuItem className={MENU_ITEM_CLASS}>
        {saved ? <BookmarkMinus size={14} /> : <Bookmark size={14} />}
        {saved ? "Remove from Saved" : "Save Message"}
      </ContextMenuItem>
      <ContextMenuItem className={MENU_ITEM_CLASS}>
        <MessageSquare size={14} />
        {followed ? "Unfollow Thread" : "Follow Thread"}
      </ContextMenuItem>
      <ContextMenuSeparator className={CTX_SEPARATOR_CLASS} />
      <ContextMenuItem className={MENU_ITEM_CLASS}>
        {taskAction.icon}
        {taskAction.label}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

// Reaction pill with the reactor-name hover popover (source MessageItem.tsx:
// 4325-4354): hovering the pill portals a pointer-events-none tooltip listing
// up to five reactor names plus a "+N more" overflow.
function ReactionPillWithReactors({
  emoji,
  count,
  reacted,
}: {
  emoji: string;
  count: number;
  reacted?: boolean;
}) {
  const [pos, setPos] = useState<PointPos | null>(null);
  const summary = `${REACTOR_NAMES.slice(0, 5).join(", ")} and ${
    REACTOR_NAMES.length - 5
  } more reacted with ${emoji}`;
  return (
    <span
      className="inline-flex"
      onMouseEnter={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPos({ x: rect.left, y: rect.bottom + 6 });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <ReactionPill emoji={emoji} count={count} reacted={reacted} title={summary} />
      {pos
        ? createPortal(
            <MessageReactionPopover
              role="tooltip"
              className="pointer-events-none fixed z-[80]"
              style={{ left: pos.x, top: pos.y }}
            >
              <MessageReactionPopoverNames>
                {REACTOR_NAMES.slice(0, 5).map((name, index) => (
                  <MessageReactionPopoverName key={name}>
                    <MessageReactionPopoverNameText>{name}</MessageReactionPopoverNameText>
                    {index < 4 || REACTOR_NAMES.length > 5 ? (
                      <MessageReactionPopoverSeparator>,&nbsp;</MessageReactionPopoverSeparator>
                    ) : null}
                  </MessageReactionPopoverName>
                ))}
                {REACTOR_NAMES.length > 5 ? (
                  <span className="leading-5 text-black/50">+{REACTOR_NAMES.length - 5} more</span>
                ) : null}
              </MessageReactionPopoverNames>
            </MessageReactionPopover>,
            document.body,
          )
        : null}
    </span>
  );
}

// List-level select-mode provider (source SelectModeToolbar flow): the context
// menu's "Select Message" enters select mode, rows render checkboxes, and a
// sticky bottom toolbar shows the bulk actions until Cancel.
function SelectableMessageList({ children }: { children: ReactNode }) {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelect = (id: string) => {
    setSelectMode(true);
    setSelected(new Set([id]));
  };

  const exit = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  return (
    <MessageListContext.Provider value={{ selectMode, selected, toggleSelect, enterSelect }}>
      {children}
      {selectMode ? <SelectModeToolbar count={selected.size} onCancel={exit} /> : null}
    </MessageListContext.Provider>
  );
}

// Scenario 4: component-matrix — a believable channel that happens to exercise
// every message-item surface the source app renders, one state per message,
// wrapped so right-click menus and select mode work on every row.
function MatrixBody() {
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <SelectableMessageList>
            <HistoryTopStates />

            <div className="px-3 pt-1">
              <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
            </div>
            <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

            <MessageRow
              variant="member"
              sender="Ada"
              meta="member"
              time="09:58 AM"
              body={<MarkdownShowcaseBody />}
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="online"
              time="10:00 AM"
              body={<CodeBlockBody />}
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:02 AM"
              body={<ChipDemoBody />}
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:03 AM"
              body={
                <div className="space-y-1">
                  <p>
                    Unresolved refs dim to 60%:{" "}
                    <RefChip kind="channel" unresolved>
                      #archived
                    </RefChip>{" "}
                    <RefChip kind="thread" unresolved>
                      #general:deadbeef
                    </RefChip>{" "}
                    <RefChip kind="task" unresolved>
                      #404
                    </RefChip>
                  </p>
                  <p>
                    Resolving:{" "}
                    <RefChip kind="thread" resolving>
                      #general:67253b90
                    </RefChip>{" "}
                    · message ref <RefChip kind="task">msg #22</RefChip> · unknown mention{" "}
                    <UnknownMention>@ghost</UnknownMention>
                  </p>
                  <p>
                    Cross-server permalink: <PermalinkChip label="#ops@other" crossServer /> vs
                    same-server <PermalinkChip label="#general" />
                  </p>
                </div>
              }
            />

            <MessageRow
              variant="member"
              sender="Ada"
              meta="member"
              time="10:05 AM"
              body="Here's the poster for the release banner."
              attachments={
                <MessageImageGallery>
                  <MessageImageGalleryRow className="grid-cols-1">
                    <MessageImageGalleryItem single>
                      <MessageImageGalleryMedia
                        src={IMAGE_SRC}
                        alt=""
                        fit="contain"
                        style={{ width: "min(320px, 100%)", aspectRatio: "4 / 3" }}
                      />
                      <ImagePreviewButton src={IMAGE_SRC} name="seed-photo.jpg" />
                      <MessageImageGalleryAction aria-label="Download image">
                        <Download />
                      </MessageImageGalleryAction>
                    </MessageImageGalleryItem>
                  </MessageImageGalleryRow>
                </MessageImageGallery>
              }
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:06 AM"
              body="Dropping the before/after — the second is still uploading."
              attachments={
                <MessageImageGallery>
                  <MessageImageGalleryRow className="grid-cols-2">
                    <MessageImageGalleryItem>
                      <MessageImageGalleryMedia
                        src={IMAGE_SRC}
                        alt=""
                        fit="cover"
                        className="h-32 sm:h-36"
                      />
                      <MessageImageGalleryAction aria-label="Download image">
                        <Download />
                      </MessageImageGalleryAction>
                    </MessageImageGalleryItem>
                    <MessageImageGalleryItem optimistic>
                      <MessageImageGalleryMedia
                        src={IMAGE_SRC}
                        alt=""
                        fit="cover"
                        className="h-32 sm:h-36"
                      />
                      <MessageImageGalleryOverlay>
                        <Spinner size="lg" className="text-white" />
                      </MessageImageGalleryOverlay>
                    </MessageImageGalleryItem>
                  </MessageImageGalleryRow>
                </MessageImageGallery>
              }
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:07 AM"
              body="Three crops from the same run."
              attachments={
                <MessageImageGallery>
                  <MessageImageGalleryRow className="grid-cols-2 md:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                      <MessageImageGalleryItem key={i}>
                        <MessageImageGalleryMedia
                          src={IMAGE_SRC}
                          alt=""
                          fit="cover"
                          className="h-28 sm:h-32"
                        />
                      </MessageImageGalleryItem>
                    ))}
                  </MessageImageGalleryRow>
                </MessageImageGallery>
              }
            />
            <MessageRow
              variant="member"
              sender="Ada"
              meta="member"
              time="10:08 AM"
              body="Full contact sheet — four thumbnails then the wide hero."
              attachments={
                <MessageImageGallery>
                  <MessageImageGalleryRow className="grid-cols-2">
                    {[0, 1].map((i) => (
                      <MessageImageGalleryItem key={i}>
                        <MessageImageGalleryMedia
                          src={IMAGE_SRC}
                          alt=""
                          fit="cover"
                          className="h-32 sm:h-36"
                        />
                      </MessageImageGalleryItem>
                    ))}
                  </MessageImageGalleryRow>
                  <MessageImageGalleryRow className="grid-cols-2">
                    {[2, 3].map((i) => (
                      <MessageImageGalleryItem key={i}>
                        <MessageImageGalleryMedia
                          src={IMAGE_SRC}
                          alt=""
                          fit="cover"
                          className="h-32 sm:h-36"
                        />
                      </MessageImageGalleryItem>
                    ))}
                  </MessageImageGalleryRow>
                  <MessageImageGalleryRow className="grid-cols-1">
                    <MessageImageGalleryItem>
                      <MessageImageGalleryMedia
                        src={IMAGE_SRC}
                        alt=""
                        fit="contain"
                        className="h-32 sm:h-36"
                      />
                    </MessageImageGalleryItem>
                  </MessageImageGalleryRow>
                </MessageImageGallery>
              }
            />

            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="online"
              time="10:10 AM"
              body="Screen recording of the token migration diff."
              attachments={
                <MessageVideoPreview>
                  <MessageVideoPreviewFrame>
                    <MessageVideoPreviewMedia controls playsInline preload="metadata" />
                    <MessageVideoPreviewAction aria-label="Open video in preview">
                      <Eye />
                    </MessageVideoPreviewAction>
                  </MessageVideoPreviewFrame>
                </MessageVideoPreview>
              }
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="online"
              time="10:11 AM"
              body="Idle clip — poster frame with the play affordance."
              attachments={
                <MessageVideoPreview>
                  <MessageVideoPreviewFrame>
                    <MessageVideoPreviewFallback>
                      <Play className="size-8 text-white/80" />
                    </MessageVideoPreviewFallback>
                    <MessageVideoPreviewAction aria-label="Open video in preview">
                      <Eye />
                    </MessageVideoPreviewAction>
                  </MessageVideoPreviewFrame>
                </MessageVideoPreview>
              }
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="online"
              time="10:12 AM"
              body="This one is still uploading."
              attachments={
                <MessageVideoPreview optimistic>
                  <MessageVideoPreviewFrame>
                    <MessageVideoPreviewFallback>
                      <Spinner size="lg" className="text-white" />
                    </MessageVideoPreviewFallback>
                  </MessageVideoPreviewFrame>
                </MessageVideoPreview>
              }
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="online"
              time="10:13 AM"
              body="And this one uses a codec this browser can't decode."
              attachments={
                <MessageVideoPreview>
                  <MessageVideoPreviewFrame>
                    <MessageVideoPreviewFallback interactive>
                      <div className="flex max-w-[16rem] flex-col items-center gap-2 px-4 text-center text-xs font-bold">
                        <AlertTriangle size={24} />
                        <span>This video may use a codec this browser cannot preview.</span>
                        <span className="inline-flex items-center gap-1 text-white/75">
                          <Download size={13} />
                          Download to view
                        </span>
                      </div>
                    </MessageVideoPreviewFallback>
                  </MessageVideoPreviewFrame>
                </MessageVideoPreview>
              }
            />

            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:14 AM"
              body="Attaching the supporting files for review."
              attachments={
                <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
                  <FileCard name="seed-pixel.png" meta="image/png · 1 KB" affordance={<Eye />} />
                  <FileCard
                    name="seed-notes.txt"
                    meta="Text preview · 1 KB"
                    summary={<span className="text-black/70">Plain text document</span>}
                    affordance={<Eye />}
                    commentCount={3}
                  />
                  <FileCard
                    name="metrics.csv"
                    meta="CSV preview · 2 KB"
                    summary={<span className="text-black/70">Preview 12 rows · 4 columns</span>}
                    affordance={<Eye />}
                  />
                  <FileCard
                    name="spec.pdf"
                    meta="PDF preview · 1.4 MB"
                    summary={<span className="text-black/70">PDF document</span>}
                    affordance={<Eye />}
                  />
                  <FileCard
                    name="feature.diff"
                    meta="patch · 3 KB"
                    summary={
                      <>
                        <span className="text-black/70">3 files · 8 hunks</span>
                        <span className="text-[#1f883d]">+124</span>
                        <span className="text-[#cf222e]">-37</span>
                      </>
                    }
                    affordance={<Download />}
                  />
                  <FileCard
                    name="voice-note.m4a"
                    meta="Audio preview · 512 KB"
                    affordance={<Eye />}
                    secondaryDownload
                  />
                  <FileCard name="report.html" meta="HTML preview · 6 KB" affordance={<Eye />} />
                  <FileCard
                    name="archive.zip"
                    meta="application/zip · 4 MB"
                    affordance={<Download />}
                  />
                </div>
              }
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:15 AM"
              body="Uploading one more attachment."
              attachments={
                <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
                  <FileCard name="uploading.png" meta="image/png · 1 KB" optimistic />
                </div>
              }
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:16 AM"
              body="Opening the spec preview."
              attachments={
                <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
                  <FileCard name="opening.pdf" meta="PDF preview · 1 MB" loading />
                </div>
              }
            />

            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Online agent."
              status="online"
              time="10:20 AM"
              body="On it — pulling the token diff now."
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Thinking…"
              status="thinking"
              time="10:21 AM"
              body="Let me reason about the contract shape before I touch the palette."
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Working…"
              status="working"
              time="10:23 AM"
              body="Regenerating the palette and re-running the visual suite now."
            />
            <MessageRow
              variant="agent"
              sender="Deploy Bot"
              meta="Error: daemon unreachable."
              status="error"
              time="10:24 AM"
              body="Deploy webhook is failing — retries are queued."
            />
            <MessageRow
              variant="agent"
              sender="Nyx"
              meta="Offline."
              status="offline"
              time="10:25 AM"
              body="Note before I dropped off: the two snapshots still need rebaselining."
            />
            <MessageRow
              variant="agent"
              sender="Relay"
              meta="External agent."
              status="external"
              time="10:26 AM"
              body="Mirroring this thread from the ops server."
            />
            <MessageRow
              variant="agent"
              sender="Legacy Bot"
              senderState="deleted"
              deactivated
              meta="Deactivated agent."
              time="10:27 AM"
              body="Old handoff note from the retired build agent."
            />
            <MessageRow
              variant="member"
              sender="Mx. Chen"
              senderState="removed"
              time="10:28 AM"
              body="Looping in the on-call rotation before the next window."
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:29 AM"
              saved
              body="Pinned this one for later — persistent bookmark at rest, saved in the toolbar."
            />

            <MessageRow
              variant="member"
              sender="Ada"
              meta="member"
              time="10:30 AM"
              body="Nice, the new palette looks great."
              footer={
                <>
                  <ReactionPill emoji="👀" count={2} />
                  <ReactionPill emoji="👍" count={5} reacted />
                  <ReactionPill emoji="🔥" count={1} failed />
                </>
              }
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:31 AM"
              body="Shipping this today — hover the reaction to see who reacted."
              footer={<ReactionPillWithReactors emoji="👍" count={7} reacted />}
            />

            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:35 AM"
              body="Check default seed member permissions."
              footer={<TaskStatusBadge status="todo" taskNumber={10} assignee="Ada" />}
            />
            <MessageRow
              variant="member"
              sender="Ada"
              meta="member"
              time="10:36 AM"
              body="Verifying the RustFS attachment previews."
              footer={<TaskStatusBadge status="in_progress" taskNumber={11} />}
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:37 AM"
              body="Thread reminder wake regression is up for review."
              footer={<TaskStatusBadge status="in_review" taskNumber={12} />}
            />
            <MessageRow
              variant="member"
              sender="Ada"
              meta="member"
              time="10:38 AM"
              body="Archived-channel smoke check passed."
              footer={<TaskStatusBadge status="done" taskNumber={13} />}
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:39 AM"
              body="Closing the duplicate migration ticket."
              footer={<TaskStatusBadge status="closed" taskNumber={15} />}
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="working"
              time="10:40 AM"
              body="Updating the status on this one now."
              footer={<TaskStatusBadge status="in_progress" taskNumber={16} busy />}
            />

            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:42 AM"
              body="Wrote up the rollback plan in the thread."
              footer={<PlainRepliesBadge count={2} />}
            />
            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="online"
              time="10:43 AM"
              body="Posted the regression breakdown — new replies since you last looked."
              footer={<PlainRepliesBadge count={1} unread={1} />}
            />
            <MessageRow
              variant="member"
              sender="Ada"
              meta="member"
              time="10:44 AM"
              body="Half-written reply saved as a draft on this thread."
              footer={<DraftRepliesBadge />}
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:45 AM"
              body="Thread has replies and a draft of mine still pending."
              footer={<DraftRepliesBadge count={3} />}
            />

            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:46 AM"
              rowState="search-match"
              body="Jumped-to / thread-focus / search anchor: cyan fill + brutal shadow."
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="10:47 AM"
              rowState="active"
              body="Active row (context-menu open / open-thread parent): bordered white."
            />

            <SystemMessageItem>
              <SystemMessageItemTime>10:50 AM</SystemMessageItemTime>
              <SystemMessageItemContent>
                Atlas restarted on the primary machine.
              </SystemMessageItemContent>
            </SystemMessageItem>
            <SystemGroupDisclosure />

            <MessageRow
              variant="agent"
              sender="Atlas"
              meta="Design-system agent on the primary online machine."
              status="online"
              time="11:00 AM"
              selectId="im-saved"
              saved
              followed
              task="open"
              body="Right-click this saved + followed row — its menu shows Remove / Unfollow / Mark as Done."
            />
            <MessageRow
              variant="member"
              sender="Developer"
              meta="member"
              time="11:02 AM"
              selectId="im-done"
              task="done"
              body="This row's task is already done, so its menu offers Reopen Task. Right-click any message for the full menu."
            />

            <div className="pb-3" aria-hidden />
          </SelectableMessageList>
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
      <ChatMainPanelJumpToLatest>
        <ArrowDown />3 new messages
      </ChatMainPanelJumpToLatest>
    </ChatMainPanelBody>
  );
}

// Scenario 5: agent DM — agent rows and a plain reply badge into the thread.
function DmAtlasBody({ channelId }: { channelId: PlaygroundChannelId }) {
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <div className="px-3 pt-3">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="11:00 AM"
            body="Looking at the daemon reconnect logs now."
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            status="online"
            time="11:01 AM"
            body="Here is the reconnect stack trace."
            footer={<RepliesBadge channelId={channelId} count={2} />}
          />

          <div className="pb-3" aria-hidden />
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
    </ChatMainPanelBody>
  );
}

// Scenario 6: brand-new channel — the empty state.
function NewChannelBody() {
  return (
    <ChatMainPanelBody>
      <div className="flex h-full items-center justify-center">
        <EmptyState>
          <EmptyStateContent>
            <EmptyStateIcon>
              <MessageSquare />
            </EmptyStateIcon>
            <EmptyStateTitle>No messages yet</EmptyStateTitle>
            <EmptyStateDescription>Start the conversation.</EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </ChatMainPanelBody>
  );
}

function TabPlaceholder({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <ChatMainPanelBody>
      <div className="flex h-full items-center justify-center">
        <EmptyState>
          <EmptyStateContent>
            <EmptyStateIcon>{icon}</EmptyStateIcon>
            <EmptyStateTitle>{title}</EmptyStateTitle>
            <EmptyStateDescription>{description}</EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </ChatMainPanelBody>
  );
}

// Shared message row. Every row self-owns its right-click context menu and the
// floating reaction picker opened from the hover-toolbar react button (source:
// onContextMenu + openReactionPicker both live on the row), so the menu fires on
// any message. Select mode + the "Select Message" action come from the optional
// MessageListContext when a list provides one.
function MessageRow({
  variant = "agent",
  sender,
  meta,
  time,
  body,
  footer,
  attachments,
  senderState,
  inlineStatus,
  compact,
  gutterTime,
  status,
  deactivated,
  saved,
  followed,
  task = "none",
  rowState,
  selectId,
}: {
  variant?: RowVariant;
  sender?: string;
  meta?: string;
  time?: string;
  body?: ReactNode;
  footer?: ReactNode;
  attachments?: ReactNode;
  senderState?: string;
  inlineStatus?: string;
  compact?: boolean;
  gutterTime?: string;
  status?: AgentStatus;
  deactivated?: boolean;
  saved?: boolean;
  followed?: boolean;
  task?: MessageTask;
  rowState?: MessageItemRowState;
  selectId?: string;
}) {
  const list = useContext(MessageListContext);
  // Every row inside a SelectableMessageList is selectable; an explicit selectId
  // is optional (the demo passes stable ids to a couple of rows), otherwise a
  // stable per-row id is generated so the menu's "Select Message" always wires up.
  const generatedSelectId = useId();
  const rowSelectId = selectId ?? generatedSelectId;
  const selectMode = list?.selectMode ?? false;
  const selected = list?.selected.has(rowSelectId) ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);

  const effectiveRowState = selectMode ? "select" : rowState;

  // Persist the hover look while this row's context menu is open (source
  // MessageItem.tsx:3692-3693 `ctxMenu` → `border-2 border-black bg-white`).
  // Highlight/active rows keep their own rowState (source precedence: isHighlighted
  // wins over ctxMenu), so only plain rows opt in. Scoped brutal; elegant is
  // driven by the DS component's own open state and left untouched.
  const menuOpenRowClass =
    menuOpen && !rowState
      ? "[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-white"
      : "";

  const messageItem = (
    <MessageItem
      compact={compact}
      rowState={effectiveRowState}
      className={`[[data-preview-theme=brutal]_&]:transition-none ${menuOpenRowClass}`}
    >
      {selectMode ? (
        <MessageItemSelectMark
          checked={selected}
          role="checkbox"
          aria-checked={selected}
          aria-label="Select message"
          tabIndex={0}
          onClick={() => list?.toggleSelect(rowSelectId)}
          className="cursor-pointer text-transparent"
        />
      ) : null}
      {compact ? (
        <MessageItemGutter>
          <MessageItemContinuationTime className={CONTINUATION_TIME_CLASS} title={gutterTime}>
            {gutterTime}
          </MessageItemContinuationTime>
        </MessageItemGutter>
      ) : (
        <RowAvatar
          variant={variant}
          status={status}
          deactivated={deactivated}
          sender={sender}
          meta={meta}
        />
      )}
      <MessageItemContent>
        {compact ? null : (
          <MessageItemHeader>
            <MessageItemSender className={SENDER_CLASS}>{sender}</MessageItemSender>
            {senderState ? <MessageItemSenderState>{senderState}</MessageItemSenderState> : null}
            {meta ? (
              <MessageItemMeta className={META_CLASS} title={meta}>
                {meta}
              </MessageItemMeta>
            ) : null}
            <MessageItemTime className={TIME_CLASS}>{time}</MessageItemTime>
            {inlineStatus ? (
              <MessageItemInlineStatus className={META_CLASS}>
                {inlineStatus}
              </MessageItemInlineStatus>
            ) : null}
          </MessageItemHeader>
        )}
        {body ? (
          <MessageItemBody className={BODY_CLASS} data-message-selectable="true">
            {body}
          </MessageItemBody>
        ) : null}
        {attachments ? <MessageItemAttachments>{attachments}</MessageItemAttachments> : null}
        {footer ? <MessageItemFooter>{footer}</MessageItemFooter> : null}
      </MessageItemContent>
      {saved ? (
        <MessageItemSavedIndicator>
          <Bookmark fill="currentColor" />
        </MessageItemSavedIndicator>
      ) : null}
      <RowToolbar
        saved={saved}
        reactionOpen={reactionOpen}
        onReactionOpenChange={setReactionOpen}
      />
    </MessageItem>
  );

  // Select mode disables the right-click menu (source parity), so the row skips
  // the ContextMenu wrapper entirely.
  if (selectMode) {
    return <div className="px-3">{messageItem}</div>;
  }

  return (
    <div className="px-3">
      <ContextMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (open) setReactionOpen(false);
        }}
      >
        <ContextMenuTrigger render={messageItem} />
        <MessageContextMenuContent
          saved={saved}
          followed={followed}
          task={task}
          onQuickReact={() => setMenuOpen(false)}
          onSelectMessage={list ? () => list.enterSelect(rowSelectId) : undefined}
        />
      </ContextMenu>
    </div>
  );
}

// Agent presence activity → status-dot color (source utils/activity.ts). The
// dot is pinned bottom-right of the agent avatar, matching source StatusDot
// (size-[11px], black hairline); working/thinking add a pulse.
type AgentStatus = "online" | "thinking" | "working" | "error" | "offline" | "external";

const STATUS_DOT: Record<AgentStatus, string> = {
  online: "bg-brutal-lime",
  thinking: "bg-soft-signal animate-pulse",
  working: "bg-soft-signal animate-pulse",
  error: "bg-brutal-orange",
  offline: "bg-gray-400",
  external: "bg-brutal-cyan",
};

// Agent presence activity → the profile hover-card's activity text (source
// displayState.activityText / AgentStatusDot title).
const STATUS_LABEL: Record<AgentStatus, string> = {
  online: "Online",
  thinking: "Thinking…",
  working: "Working…",
  error: "Error",
  offline: "Offline",
  external: "External",
};

// Static "RECENT ACTIVITY" trajectory rows for the agent profile card
// (source MentionHoverActivityPreview).
const PROFILE_ACTIVITY_ROWS: { time: string; dot: string; text: string }[] = [
  {
    time: "08:32:14",
    dot: "bg-soft-signal animate-pulse",
    text: "Running visual regression suite",
  },
  { time: "08:31:02", dot: "bg-brutal-cyan", text: "Read tokens/colors.css" },
  { time: "08:30:41", dot: "bg-soft-signal animate-pulse", text: "Thinking about token contract" },
];

// Profile hover-card body (source ProfilePreviewCardContent): agent variant adds
// the status dot + activity text + RECENT ACTIVITY block; human variant is just
// header + description. Rendered inside a DS PreviewCardContent.
function ProfileCardBody({
  variant,
  sender,
  meta,
  status = "offline",
}: {
  variant: RowVariant;
  sender: string;
  meta?: string;
  status?: AgentStatus;
}) {
  const isAgent = variant === "agent";
  const handle = `@${sender.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
  return (
    <>
      <div className="flex items-start gap-3 px-3 py-3">
        <Avatar
          size="md"
          type={isAgent ? "agent" : "human"}
          className={`mt-0.5 self-start [[data-preview-theme=brutal]_&]:border-black ${
            isAgent
              ? "[[data-preview-theme=brutal]_&]:bg-brutal-cyan"
              : "[[data-preview-theme=brutal]_&]:bg-brutal-lavender"
          } [[data-preview-theme=brutal]_&]:text-black`}
        >
          <AvatarFallback />
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-black">{sender}</span>
            {isAgent ? (
              <>
                <span
                  aria-hidden
                  className={`inline-block size-2 shrink-0 rounded-full border border-line-strong ${STATUS_DOT[status]} [[data-preview-theme=brutal]_&]:border-black`}
                />
                <span className="truncate font-mono text-xs text-black/60">
                  {STATUS_LABEL[status]}
                </span>
              </>
            ) : null}
          </div>
          <div className="truncate font-mono text-xs text-black/60">{handle}</div>
        </div>
      </div>
      {meta ? (
        <div className="truncate border-t-2 border-black px-3 py-2 text-xs text-black/70">
          {meta}
        </div>
      ) : null}
      {isAgent ? (
        <div className="border-t-2 border-black px-3 py-2">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-black/50">
            Recent activity
          </div>
          <div className="space-y-1.5">
            {PROFILE_ACTIVITY_ROWS.map((row) => (
              <div
                key={row.time}
                className="flex min-w-0 items-center gap-1.5 overflow-hidden text-xs"
              >
                <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-black/40">
                  {row.time}
                </span>
                <span
                  aria-hidden
                  className={`inline-block size-2 shrink-0 rounded-full border border-line-strong ${row.dot} [[data-preview-theme=brutal]_&]:border-black`}
                />
                <span className="min-w-0 flex-1 truncate text-black/70">{row.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function RowAvatar({
  variant,
  status = "offline",
  deactivated,
  sender,
  meta,
}: {
  variant: RowVariant;
  status?: AgentStatus;
  deactivated?: boolean;
  sender?: string;
  meta?: string;
}) {
  const isAgent = variant === "agent";
  const brutalBg = isAgent
    ? "[[data-preview-theme=brutal]_&]:bg-brutal-cyan"
    : "[[data-preview-theme=brutal]_&]:bg-brutal-lavender";

  const avatar = (
    <Avatar
      size="md"
      type={isAgent ? "agent" : "human"}
      className={`[[data-preview-theme=brutal]_&]:border-black ${brutalBg} [[data-preview-theme=brutal]_&]:text-black ${
        deactivated ? "opacity-60 grayscale" : ""
      }`}
    >
      <AvatarFallback />
      {isAgent && !deactivated ? (
        <span
          aria-hidden
          title={STATUS_LABEL[status]}
          className={`absolute -bottom-[2px] -right-[2px] inline-block size-[11px] shrink-0 rounded-full border border-line-strong ${STATUS_DOT[status]} [[data-preview-theme=brutal]_&]:border-black`}
        />
      ) : null}
    </Avatar>
  );

  // Deactivated / removed senders have no profile card in source.
  if (deactivated || !sender) {
    return <MessageItemAvatarSlot>{avatar}</MessageItemAvatarSlot>;
  }

  return (
    <MessageItemAvatarSlot>
      <PreviewCard>
        <PreviewCardTrigger delay={200} closeDelay={120} render={<button type="button" />}>
          {avatar}
        </PreviewCardTrigger>
        <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[280px]">
          <ProfileCardBody variant={variant} sender={sender} meta={meta} status={status} />
        </PreviewCardContent>
      </PreviewCard>
    </MessageItemAvatarSlot>
  );
}

// Neutralizes the DropdownMenu content chrome (min-width / surface / padding /
// menu layout, incl. elegant's `flex-col rounded-md p-1`) so the Base UI
// positioner renders the plain MessageReactionPicker row instead of a menu box.
const REACTION_FLYOUT_CLASS =
  "inline-flex min-w-0 flex-row items-center gap-0.5 rounded-none border-2 border-black bg-white px-1.5 py-1 shadow-[0_4px_12px_oklch(0_0_0_/_0.08)]";

// Hover-toolbar reaction flyout. Source opens the quick-reaction row on click of
// the React button and hand-positions it (buggy x/y); here the row is anchored
// by Base UI's menu positioner (click-to-open trigger, automatic flip/collision)
// while MessageReactionPicker + MessageReactionQuickButton keep the source
// picker chrome and per-emoji hover tint pixel-identical.
function RowToolbar({
  saved,
  reactionOpen,
  onReactionOpenChange,
}: {
  saved?: boolean;
  reactionOpen: boolean;
  onReactionOpenChange: (open: boolean) => void;
}) {
  return (
    <MessageItemToolbar visible={reactionOpen}>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <DropdownMenu open={reactionOpen} onOpenChange={onReactionOpenChange}>
        <DropdownMenuTrigger
          render={
            <MessageItemToolbarButton active={reactionOpen} aria-label="Add reaction">
              <SmilePlus />
            </MessageItemToolbarButton>
          }
        />
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={4}
          className={REACTION_FLYOUT_CLASS}
          render={<MessageReactionPicker />}
        >
          {MESSAGE_QUICK_REACTIONS.map((emoji) => (
            <MessageReactionQuickButton
              key={emoji}
              title={`React with ${emoji}`}
              aria-label={`React with ${emoji}`}
              onClick={() => onReactionOpenChange(false)}
            >
              <MessageReactionGlyph emoji={emoji} size={18} className="block" />
            </MessageReactionQuickButton>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <MessageItemToolbarButton
        saved={saved}
        aria-label={saved ? "Remove from Saved" : "Save message"}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}

// Plain reply badge for a read thread.
function RepliesBadge({ channelId, count }: { channelId: PlaygroundChannelId; count: number }) {
  return (
    <MessageItemBadge
      tone="default"
      className={BADGE_CLASS}
      render={<Link to="/playground/$channelId" params={{ channelId }} search={{ thread: true }} />}
    >
      <MessageSquare />
      {count} replies
    </MessageItemBadge>
  );
}

// Cyan reply badge highlighting unread replies.
function UnreadRepliesBadge({
  channelId,
  count,
  unread,
}: {
  channelId: PlaygroundChannelId;
  count: number;
  unread: number;
}) {
  return (
    <MessageItemBadge
      tone="cyan"
      className={BADGE_CLASS}
      render={<Link to="/playground/$channelId" params={{ channelId }} search={{ thread: true }} />}
    >
      <MessageSquare />
      {count === 1 ? "1 reply" : `${count} replies`}
      <span className="text-foreground/45">·</span>
      <span>{unread} new</span>
    </MessageItemBadge>
  );
}
