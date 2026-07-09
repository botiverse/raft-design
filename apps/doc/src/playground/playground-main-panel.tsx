import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  Bell,
  Bookmark,
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
  Play,
  Plus,
  Search,
  Send,
  Settings,
  SmilePlus,
  Square,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarBadge,
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
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageReactionAddButton,
  MessageReactionChip,
  MessageReactionCount,
  MessageReactionGlyph,
  MessageTimelineDateDivider,
  MessageTimelineNotice,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
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

// App-level reference chip (#channel / thread / task / self-mention).
function RefChip({ kind, children }: { kind: ChipKind; children: ReactNode }) {
  return <span className={`${MSG_REF_CHIP} cursor-default ${CHIP_TONE[kind]}`}>{children}</span>;
}

// App-level slock permalink chip: icon + channel label + trailing "msg".
function PermalinkChip({ label }: { label: string }) {
  return (
    <span
      className={`${MSG_REF_CHIP} inline-flex cursor-default items-center gap-1 ${CHIP_TONE.task}`}
    >
      <LinkIcon className="size-3 shrink-0" />
      {label}
      <span className="text-[10px] font-normal leading-none text-black/50">msg</span>
    </span>
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

// A single attachment card (filename, meta line, optional summary, affordance).
function FileCard({
  name,
  meta,
  summary,
  affordance,
}: {
  name: string;
  meta: string;
  summary?: string;
  affordance: ReactNode;
}) {
  return (
    <MessageAttachmentCard>
      <MessageAttachmentBody>
        <MessageAttachmentTitle>{name}</MessageAttachmentTitle>
        <MessageAttachmentMeta>{meta}</MessageAttachmentMeta>
      </MessageAttachmentBody>
      {summary ? (
        <MessageAttachmentMeta className="font-mono font-bold text-black/70">
          {summary}
        </MessageAttachmentMeta>
      ) : null}
      <MessageAttachmentAction>{affordance}</MessageAttachmentAction>
    </MessageAttachmentCard>
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
          description="Images and documents shared in this channel are collected here."
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
        <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
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
            time="08:32 AM"
            body="Documentation: we should auto-generate API docs from the route definitions. Maybe use Swagger."
            footer={<RepliesBadge channelId={channelId} count={2} />}
          />
          <MessageRow compact gutterTime="08:34 AM" body="Great work!" />

          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:38 AM"
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

// Scenario 4: private channel (lock icon) — a normal conversation.
function MatrixBody() {
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
            time="10:04 AM"
            body="Locked this channel down while we finish the component audit."
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            time="10:06 AM"
            body="Every inline message chip now normalizes to the same visual height."
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:09 AM"
            body="Design review: new settings panel layout. Screenshots attached."
            attachments={
              <MessageImageGallery>
                <MessageImageGalleryRow className="grid-cols-2">
                  <MessageImageGalleryItem>
                    <MessageImageGalleryMedia
                      src={IMAGE_SRC}
                      alt=""
                      fit="cover"
                      className="aspect-[4/3]"
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
                      className="aspect-[4/3]"
                    />
                    <MessageImageGalleryOverlay>
                      <Spinner size="lg" className="text-white" />
                    </MessageImageGalleryOverlay>
                  </MessageImageGalleryItem>
                </MessageImageGalleryRow>
              </MessageImageGallery>
            }
            footer={<ReactionPill emoji="🔥" count={1} failed />}
          />
          <MessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            time="10:11 AM"
            body="Captured a walkthrough of the collapsible danger zone."
            attachments={
              <MessageVideoPreview title="settings-walkthrough.mp4">
                <MessageVideoPreviewFrame>
                  <MessageVideoPreviewFallback>
                    <Play className="size-8 text-white/80" />
                  </MessageVideoPreviewFallback>
                  <MessageVideoPreviewAction aria-label="Open settings-walkthrough.mp4 in preview">
                    <Eye />
                  </MessageVideoPreviewAction>
                </MessageVideoPreviewFrame>
              </MessageVideoPreview>
            }
          />
          <MessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="10:13 AM"
            body={
              <>
                Seed task: normalize every inline message chip to the same visual height.{" "}
                <RefChip kind="task">#15</RefChip>
              </>
            }
          />
          <MessageRow compact gutterTime="10:15 AM" body="Ship it once the review passes." />

          <div className="pb-3" aria-hidden />
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
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
}) {
  return (
    <div className="px-3">
      <MessageItem compact={compact} className="[[data-preview-theme=brutal]_&]:transition-none">
        {compact ? (
          <MessageItemGutter>
            <MessageItemContinuationTime className={CONTINUATION_TIME_CLASS}>
              {gutterTime}
            </MessageItemContinuationTime>
          </MessageItemGutter>
        ) : (
          <RowAvatar variant={variant} />
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
        <RowToolbar />
      </MessageItem>
    </div>
  );
}

function RowAvatar({ variant }: { variant: RowVariant }) {
  const isAgent = variant === "agent";
  const brutalBg = isAgent
    ? "[[data-preview-theme=brutal]_&]:bg-brutal-cyan"
    : "[[data-preview-theme=brutal]_&]:bg-brutal-lavender";

  return (
    <MessageItemAvatarSlot>
      <Avatar
        size="md"
        type={isAgent ? "agent" : "human"}
        className={`[[data-preview-theme=brutal]_&]:border-black ${brutalBg} [[data-preview-theme=brutal]_&]:text-black`}
      >
        <AvatarFallback />
        {isAgent ? <AvatarBadge /> : null}
      </Avatar>
    </MessageItemAvatarSlot>
  );
}

function RowToolbar() {
  return (
    <MessageItemToolbar>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Add reaction">
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save message">
        <Bookmark />
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
