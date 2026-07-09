import { useRef, useState, type ReactNode, type RefObject } from "react";
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
  CheckCircle,
  ChevronRight,
  ChevronUp,
  Circle,
  ClipboardCheck,
  Copy,
  Download,
  Eye,
  GitBranch,
  Hash,
  ImagePlus,
  Link as LinkIcon,
  ListTodo,
  Lock,
  MessageSquare,
  Paperclip,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  SmilePlus,
  Square,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Checkbox,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  SortableTabsList,
  SortableTabsTab,
  Spinner,
  Tabs,
  TabsLabel,
} from "raft-ui";
import {
  ChatMainPanelAction,
  ChatMainPanelActions,
  ChatMainPanelBody,
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ChatMainPanelFooter,
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
  MessageReactionAddButton,
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

import type { PlaygroundChannel, PlaygroundChannelId } from "./mock-data.ts";

type PanelTab = "chat" | "tasks" | "files";
type RowVariant = "member" | "agent";

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

function TaskStatusBadge({
  status,
  taskNumber,
  assignee,
  busy,
}: {
  status: TaskStatus;
  taskNumber: number;
  assignee?: string;
  busy?: boolean;
}) {
  const cfg = TASK_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <div
      className={`relative inline-flex min-w-0 max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap ${
        busy ? "pointer-events-none opacity-60" : ""
      }`}
      title={`${cfg.label} #${taskNumber}`}
      data-task-status={status}
    >
      <span
        className={`inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap border border-black px-1.5 text-[10px] font-bold leading-none text-black ${cfg.bg} transition-[filter,opacity] duration-100 hover:brightness-90`}
      >
        <Icon size={10} className="shrink-0" />
        <span className="shrink-0">#{taskNumber}</span>
        {assignee ? <span className="min-w-0 truncate">@{assignee}</span> : null}
      </span>
    </div>
  );
}

// One reaction pill mirroring the design-system fixtures (sprite glyph + count).
function ReactionPill({
  emoji,
  count,
  reacted,
  failed,
}: {
  emoji: string;
  count: number;
  reacted?: boolean;
  failed?: boolean;
}) {
  return (
    <MessageReactionChip
      reacted={reacted}
      failed={failed}
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

      <Composer label={composerLabel} />
    </ChatMainPanelRoot>
  );
}

function ChannelHeader({ channel }: { channel: PlaygroundChannel }) {
  const Icon = channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;

  return (
    <ChatMainPanelHeader>
      <ChatMainPanelHeaderIcon>
        <Icon />
      </ChatMainPanelHeaderIcon>
      <ChatMainPanelTitleBlock>
        <div className="flex min-w-0 items-center gap-2">
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          {channel.id === "component-matrix" ? (
            <span className="inline-flex shrink-0 items-center gap-1 border-2 border-black bg-brutal-orange/25 px-1.5 py-1 text-[11px] font-bold uppercase text-black">
              <BellOff size={11} />
              Muted
            </span>
          ) : null}
        </div>
        <ChatMainPanelSubtitle>{channel.subtitle}</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
      <ChatMainPanelActions>
        <ChatMainPanelAction aria-label="Search this channel">
          <Search />
        </ChatMainPanelAction>
        <ChatMainPanelAction aria-label="Mute activity for this channel">
          <Bell />
        </ChatMainPanelAction>
        <ChatMainPanelAction aria-label="Stop all agents in this channel">
          <Square />
        </ChatMainPanelAction>
        <ChatMainPanelAction aria-label="Edit channel">
          <Settings />
        </ChatMainPanelAction>
        <ChatMainPanelAction aria-label="View participants" className="w-auto min-w-7 gap-1 px-1.5">
          <Users />
          <span className="min-w-[1ch] text-center font-mono text-[11px] font-bold leading-none tabular-nums">
            7
          </span>
        </ChatMainPanelAction>
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
        <ChatMainPanelAction aria-label="Mute activity for this DM">
          <Bell />
        </ChatMainPanelAction>
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
                <MessageReactionAddButton aria-label="Add reaction" className={REACTION_CLASS}>
                  <Plus strokeWidth={2.5} />
                </MessageReactionAddButton>
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
        Self mention: <RefChip kind="self">@Developer</RefChip> is the attention chip. Normal
        mentions like <a className={MENTION_LINK_CLASS}>@Member</a> stay text-link style.
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

// Matrix section separator — reuses the source date divider as an organising
// label so the state matrix reads with native chrome.
function MatrixSection({ label }: { label: string }) {
  return <MessageTimelineDateDivider>{label}</MessageTimelineDateDivider>;
}

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
      <pre className="overflow-x-auto border-2 border-black bg-gray-900 p-3 pr-12 font-mono text-white [font-size:inherit] [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0">
        <code>{"const tokens = load();\nconsole.log(tokens.layerPanel);"}</code>
      </pre>
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

// History top-of-timeline states (source HistoryTopState): load-older button,
// the loading notice, and the plan-limited lock notice.
function HistoryTopStates() {
  return (
    <div className="space-y-2 px-3 pt-3">
      <div className="flex justify-center">
        <button type="button" className="btn-brutal-sm bg-white px-3 py-1 text-xs font-bold">
          <ChevronUp size={12} />
          Load Older Messages
        </button>
      </div>
      <MessageTimelineNotice tone="muted" className="font-mono">
        Loading older messages...
      </MessageTimelineNotice>
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

type MenuState = { x: number; y: number; rowId: string };
type PointPos = { x: number; y: number };

type InteractiveRow = {
  id: string;
  sender: string;
  variant: RowVariant;
  time: string;
  body: string;
  saved: boolean;
  followed: boolean;
  task: "none" | "open" | "done";
};

const INTERACTIVE_ROWS: InteractiveRow[] = [
  {
    id: "im1",
    sender: "Developer",
    variant: "member",
    time: "11:20 AM",
    body: "Right-click me for the full context menu (quick reactions + all actions).",
    saved: false,
    followed: false,
    task: "none",
  },
  {
    id: "im2",
    sender: "Atlas",
    variant: "agent",
    time: "11:21 AM",
    body: "This row is saved and followed — its menu shows Remove / Unfollow / Mark as Done.",
    saved: true,
    followed: true,
    task: "open",
  },
  {
    id: "im3",
    sender: "Developer",
    variant: "member",
    time: "11:22 AM",
    body: "This row's task is done — its menu offers Reopen Task.",
    saved: false,
    followed: false,
    task: "done",
  },
];

// Pure-action context-menu row (source ui/MenuItem).
function MenuItemRow({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black transition-colors hover:bg-soft-signal/30"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

// Live interactions: right-click context menu (with the quick-reaction row and
// every action item), full selection-mode flow, the floating emoji picker, and
// the reactor-name hover popover.
function InteractiveDemo() {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [picker, setPicker] = useState<PointPos | null>(null);
  const [reactor, setReactor] = useState<PointPos | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const menuRow = menu ? INTERACTIVE_ROWS.find((row) => row.id === menu.rowId) : undefined;

  const openPicker = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    setMenu(null);
    setPicker({ x: rect.left, y: rect.bottom + 6 });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelection = (id: string) => {
    setSelectMode(true);
    setSelected(new Set([id]));
    setMenu(null);
  };

  const exitSelection = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const showReactor = (event: { currentTarget: HTMLElement }) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setReactor({ x: rect.left, y: rect.bottom + 6 });
  };

  const taskItem = (row: InteractiveRow) => {
    if (row.task === "done") return { icon: <RotateCcw size={14} />, label: "Reopen Task" };
    if (row.task === "open") return { icon: <CheckCircle size={14} />, label: "Mark as Done" };
    return { icon: <ClipboardCheck size={14} />, label: "Convert to Task" };
  };

  return (
    <>
      {INTERACTIVE_ROWS.map((row) => (
        <MessageRow
          key={row.id}
          variant={row.variant}
          sender={row.sender}
          meta={
            row.variant === "agent"
              ? "Design-system agent on the primary online machine."
              : "member"
          }
          status={row.variant === "agent" ? "online" : undefined}
          time={row.time}
          body={row.body}
          saved={row.saved && !selectMode}
          selectMode={selectMode}
          selected={selected.has(row.id)}
          onToggleSelect={() => toggleSelect(row.id)}
          onOpenMenu={
            selectMode
              ? undefined
              : ({ clientX, clientY }) => setMenu({ x: clientX, y: clientY, rowId: row.id })
          }
          onReact={selectMode ? undefined : openPicker}
          reactionActive={!!picker}
          footer={
            row.id === "im1" ? (
              <span
                onMouseEnter={showReactor}
                onMouseLeave={() => setReactor(null)}
                className="inline-flex"
              >
                <ReactionPill emoji="👍" count={7} reacted />
              </span>
            ) : undefined
          }
        />
      ))}

      {selectMode ? (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-3 border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
            <span className="text-xs font-bold text-black">{selected.size} selected</span>
            <button type="button" className="btn-brutal-sm bg-white px-3 py-1 text-xs font-bold">
              <Copy size={12} />
              Copy
            </button>
            <button
              type="button"
              onClick={exitSelection}
              className="ml-auto text-xs font-bold text-black/50 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {menu && menuRow
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[55]"
                onClick={() => setMenu(null)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setMenu(null);
                }}
              />
              <div
                role="menu"
                aria-label="Message context menu"
                className="fixed z-[60] select-none overflow-hidden border-2 border-black bg-white shadow-brutal"
                style={{ left: menu.x, top: menu.y }}
              >
                <MessageReactionQuickRow>
                  {MESSAGE_QUICK_REACTIONS.map((emoji) => (
                    <MessageReactionQuickButton
                      key={emoji}
                      title={`React with ${emoji}`}
                      aria-label={`React with ${emoji}`}
                      onClick={() => setMenu(null)}
                    >
                      <MessageReactionGlyph emoji={emoji} size={18} className="block" />
                    </MessageReactionQuickButton>
                  ))}
                </MessageReactionQuickRow>
                <div className="border-t-2 border-black" />
                <MenuItemRow icon={<LinkIcon size={14} />} onClick={() => setMenu(null)}>
                  Copy Link
                </MenuItemRow>
                <MenuItemRow icon={<Copy size={14} />} onClick={() => setMenu(null)}>
                  Copy Markdown
                </MenuItemRow>
                <MenuItemRow
                  icon={<CheckCircle size={14} />}
                  onClick={() => enterSelection(menu.rowId)}
                >
                  Select Message
                </MenuItemRow>
                <div className="border-t-2 border-black" />
                <MenuItemRow icon={<MessageSquare size={14} />} onClick={() => setMenu(null)}>
                  Open Thread
                </MenuItemRow>
                <MenuItemRow
                  icon={menuRow.saved ? <BookmarkMinus size={14} /> : <Bookmark size={14} />}
                  onClick={() => setMenu(null)}
                >
                  {menuRow.saved ? "Remove from Saved" : "Save Message"}
                </MenuItemRow>
                <MenuItemRow icon={<MessageSquare size={14} />} onClick={() => setMenu(null)}>
                  {menuRow.followed ? "Unfollow Thread" : "Follow Thread"}
                </MenuItemRow>
                <div className="border-t-2 border-black" />
                <MenuItemRow icon={taskItem(menuRow).icon} onClick={() => setMenu(null)}>
                  {taskItem(menuRow).label}
                </MenuItemRow>
              </div>
            </>,
            document.body,
          )
        : null}

      {picker
        ? createPortal(
            <>
              <div className="fixed inset-0 z-[75]" onClick={() => setPicker(null)} />
              <MessageReactionPicker
                className="fixed z-[80]"
                style={{ left: picker.x, top: picker.y }}
              >
                {MESSAGE_QUICK_REACTIONS.map((emoji) => (
                  <MessageReactionQuickButton
                    key={emoji}
                    title={`React with ${emoji}`}
                    aria-label={`React with ${emoji}`}
                    onClick={() => setPicker(null)}
                  >
                    <MessageReactionGlyph emoji={emoji} size={18} className="block" />
                  </MessageReactionQuickButton>
                ))}
              </MessageReactionPicker>
            </>,
            document.body,
          )
        : null}

      {reactor
        ? createPortal(
            <MessageReactionPopover
              role="tooltip"
              className="pointer-events-none fixed z-[80]"
              style={{ left: reactor.x, top: reactor.y }}
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
    </>
  );
}

// Scenario 4: component-matrix — the exhaustive state matrix covering every
// message-item surface the source app renders.
function MatrixBody() {
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <MatrixSection label="History (top)" />
          <HistoryTopStates />

          <div className="px-3 pt-1">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

          <MatrixSection label="Rich text" />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:00 AM"
            body={<MarkdownShowcaseBody />}
          />

          <MatrixSection label="Inline chips" />
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

          <MatrixSection label="Media — images" />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:05 AM"
            body="Single image (contain, reserved aspect box)."
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
                    <button
                      type="button"
                      aria-label="Preview image"
                      className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black"
                    />
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
            body="2-up row + an optimistic (uploading) tile."
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
            body="3-up row."
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
            sender="Developer"
            meta="member"
            time="10:08 AM"
            body="4 images (chunked into two 2-up rows) then a wide image on its own row."
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

          <MatrixSection label="Media — video" />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            status="online"
            time="10:10 AM"
            body="Real <video controls> (loaded)."
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
            body="Idle Play fallback, optimistic (uploading) spinner, and codec-failure fallback."
            attachments={
              <div className="space-y-2">
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
                <MessageVideoPreview optimistic>
                  <MessageVideoPreviewFrame>
                    <MessageVideoPreviewFallback>
                      <Spinner size="lg" className="text-white" />
                    </MessageVideoPreviewFallback>
                  </MessageVideoPreviewFrame>
                </MessageVideoPreview>
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
              </div>
            }
          />

          <MatrixSection label="Media — file cards" />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:14 AM"
            body="Every file-card mime variant + comment count."
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
                <FileCard name="uploading.png" meta="image/png · 1 KB" optimistic />
                <FileCard name="opening.pdf" meta="PDF preview · 1 MB" loading />
              </div>
            }
          />

          <MatrixSection label="Senders & presence" />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Online agent."
            status="online"
            time="10:20 AM"
            body="Agent status dot — online (lime)."
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Thinking…"
            status="thinking"
            time="10:20 AM"
            body="Agent status dot — thinking (soft-signal, pulsing)."
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Working…"
            status="working"
            time="10:20 AM"
            body="Agent status dot — working (soft-signal, pulsing)."
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Error: daemon unreachable."
            status="error"
            time="10:20 AM"
            body="Agent status dot — error (orange)."
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Offline."
            status="offline"
            time="10:20 AM"
            body="Agent status dot — offline (gray)."
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="External agent."
            status="external"
            time="10:20 AM"
            body="Agent status dot — external (cyan)."
          />
          <MessageRow
            variant="agent"
            sender="Legacy Bot"
            senderState="deleted"
            deactivated
            meta="Deactivated agent."
            time="10:21 AM"
            body="Deactivated agent: grayscale avatar, no status dot, Deleted badge."
          />
          <MessageRow
            variant="member"
            sender="Mx. Chen"
            senderState="removed"
            time="10:22 AM"
            body="Removed human: Removed badge."
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:23 AM"
            saved
            body="Saved message: persistent orange bookmark at rest (hidden on hover), saved toolbar button."
          />

          <MatrixSection label="Reactions" />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:30 AM"
            body="Reaction pills: neutral, reacted-by-viewer, and the failed-flash."
            footer={
              <>
                <ReactionPill emoji="👀" count={2} />
                <ReactionPill emoji="👍" count={5} reacted />
                <ReactionPill emoji="🔥" count={1} failed />
                <MessageReactionAddButton aria-label="Add reaction" className={REACTION_CLASS}>
                  <Plus strokeWidth={2.5} />
                </MessageReactionAddButton>
              </>
            }
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:31 AM"
            body="Quick-reaction row and the floating emoji picker (as they appear inside the menu / on the react button)."
            footer={
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-fit border-2 border-black bg-white">
                  <MessageReactionQuickRow>
                    {MESSAGE_QUICK_REACTIONS.map((emoji) => (
                      <MessageReactionQuickButton key={emoji} aria-label={`React with ${emoji}`}>
                        <MessageReactionGlyph emoji={emoji} size={18} className="block" />
                      </MessageReactionQuickButton>
                    ))}
                  </MessageReactionQuickRow>
                </div>
                <MessageReactionPicker>
                  {MESSAGE_QUICK_REACTIONS.map((emoji) => (
                    <MessageReactionQuickButton key={emoji} aria-label={`React with ${emoji}`}>
                      <MessageReactionGlyph emoji={emoji} size={18} className="block" />
                    </MessageReactionQuickButton>
                  ))}
                </MessageReactionPicker>
              </div>
            }
          />

          <MatrixSection label="Task status" />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:35 AM"
            body="Task status badges — every status, assignee, and the busy (updating) state."
            footer={
              <>
                <TaskStatusBadge status="todo" taskNumber={10} assignee="Ada" />
                <TaskStatusBadge status="in_progress" taskNumber={11} />
                <TaskStatusBadge status="in_review" taskNumber={12} />
                <TaskStatusBadge status="done" taskNumber={13} />
                <TaskStatusBadge status="closed" taskNumber={15} />
                <TaskStatusBadge status="in_progress" taskNumber={16} busy />
              </>
            }
          />

          <MatrixSection label="Reply badges" />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:40 AM"
            body="Reply badges: plain, unread (cyan), draft-only, and replies + draft."
            footer={
              <>
                <PlainRepliesBadge count={2} />
                <PlainRepliesBadge count={1} unread={1} />
                <DraftRepliesBadge />
                <DraftRepliesBadge count={3} />
              </>
            }
          />

          <MatrixSection label="Row states" />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:45 AM"
            rowState="search-match"
            body="Highlighted / anchored row (jump, thread-focus, search): cyan fill + brutal shadow."
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:46 AM"
            rowState="active"
            body="Active row (context-menu open / open-thread parent): bordered white."
          />

          <MatrixSection label="System events" />
          <SystemMessageItem>
            <SystemMessageItemTime>10:50 AM</SystemMessageItemTime>
            <SystemMessageItemContent>
              Atlas restarted on the primary machine.
            </SystemMessageItemContent>
          </SystemMessageItem>
          <SystemGroupDisclosure />

          <MatrixSection label="Interactions (right-click, select, react)" />
          <InteractiveDemo />

          <div className="pb-3" aria-hidden />
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
  reactionActive,
  rowState,
  selectMode,
  selected,
  onToggleSelect,
  onOpenMenu,
  onReact,
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
  reactionActive?: boolean;
  rowState?: MessageItemRowState;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onOpenMenu?: (event: { clientX: number; clientY: number }) => void;
  onReact?: (anchor: HTMLElement) => void;
}) {
  const effectiveRowState = selectMode ? "select" : rowState;
  return (
    <div className="px-3">
      <MessageItem
        compact={compact}
        rowState={effectiveRowState}
        onContextMenu={
          onOpenMenu
            ? (event) => {
                event.preventDefault();
                onOpenMenu({ clientX: event.clientX, clientY: event.clientY });
              }
            : undefined
        }
        className="[[data-preview-theme=brutal]_&]:transition-none"
      >
        {selectMode ? (
          <MessageItemSelectMark
            checked={selected}
            role="checkbox"
            aria-checked={selected}
            aria-label="Select message"
            tabIndex={0}
            onClick={onToggleSelect}
            className="cursor-pointer text-transparent"
          />
        ) : null}
        {compact ? (
          <MessageItemGutter>
            <MessageItemContinuationTime className={CONTINUATION_TIME_CLASS}>
              {gutterTime}
            </MessageItemContinuationTime>
          </MessageItemGutter>
        ) : (
          <RowAvatar variant={variant} status={status} deactivated={deactivated} />
        )}
        <MessageItemContent>
          {compact ? null : (
            <MessageItemHeader>
              <MessageItemSender className={SENDER_CLASS}>{sender}</MessageItemSender>
              {senderState ? <MessageItemSenderState>{senderState}</MessageItemSenderState> : null}
              {meta ? <MessageItemMeta className={META_CLASS}>{meta}</MessageItemMeta> : null}
              <MessageItemTime className={TIME_CLASS}>{time}</MessageItemTime>
              {inlineStatus ? (
                <MessageItemInlineStatus className={META_CLASS}>
                  {inlineStatus}
                </MessageItemInlineStatus>
              ) : null}
            </MessageItemHeader>
          )}
          {body ? <MessageItemBody className={BODY_CLASS}>{body}</MessageItemBody> : null}
          {attachments ? <MessageItemAttachments>{attachments}</MessageItemAttachments> : null}
          {footer ? <MessageItemFooter>{footer}</MessageItemFooter> : null}
        </MessageItemContent>
        {saved ? (
          <MessageItemSavedIndicator>
            <Bookmark fill="currentColor" />
          </MessageItemSavedIndicator>
        ) : null}
        <RowToolbar saved={saved} reactionActive={reactionActive} onReact={onReact} />
      </MessageItem>
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

function RowAvatar({
  variant,
  status = "offline",
  deactivated,
}: {
  variant: RowVariant;
  status?: AgentStatus;
  deactivated?: boolean;
}) {
  const isAgent = variant === "agent";
  const brutalBg = isAgent
    ? "[[data-preview-theme=brutal]_&]:bg-brutal-cyan"
    : "[[data-preview-theme=brutal]_&]:bg-brutal-lavender";

  return (
    <MessageItemAvatarSlot>
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
            className={`absolute -bottom-[2px] -right-[2px] inline-block size-[11px] shrink-0 rounded-full border border-line-strong ${STATUS_DOT[status]} [[data-preview-theme=brutal]_&]:border-black`}
          />
        ) : null}
      </Avatar>
    </MessageItemAvatarSlot>
  );
}

function RowToolbar({
  saved,
  reactionActive,
  onReact,
}: {
  saved?: boolean;
  reactionActive?: boolean;
  onReact?: (anchor: HTMLElement) => void;
}) {
  return (
    <MessageItemToolbar>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton
        active={reactionActive}
        aria-label="Add reaction"
        onClick={onReact ? (event) => onReact(event.currentTarget) : undefined}
      >
        <SmilePlus />
      </MessageItemToolbarButton>
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

function Composer({ label }: { label: string }) {
  return (
    <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
      <div className="flex w-full flex-col gap-2">
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput aria-label={label} placeholder={label} />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerActions>
              <ChatMainPanelComposerIconButton aria-label="Attach image">
                <ImagePlus />
              </ChatMainPanelComposerIconButton>
              <ChatMainPanelComposerIconButton aria-label="Attach file">
                <Paperclip />
              </ChatMainPanelComposerIconButton>
            </ChatMainPanelComposerActions>
            <ChatMainPanelComposerMeta>
              <label className="inline-flex select-none items-center gap-1.5">
                <Checkbox size="sm" aria-label="Send as task" />
                <span className="text-xs font-bold text-foreground-muted [[data-preview-theme=brutal]_&]:text-black/60">
                  As Task
                </span>
              </label>
              <ChatMainPanelComposerSubmit aria-label="Send">
                <Send />
              </ChatMainPanelComposerSubmit>
            </ChatMainPanelComposerMeta>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </div>
    </ChatMainPanelFooter>
  );
}
