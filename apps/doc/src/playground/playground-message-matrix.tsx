import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ChevronRight,
  Download,
  Eye,
  MessageSquare,
  Pencil,
  Play,
} from "lucide-react";
import { Banner, BannerDescription, Spinner } from "raft-ui";
import {
  ChatMainPanelBody,
  ChatMainPanelJumpToLatest,
  ChatMainPanelJumpToLatestLayout,
  ChatMainPanelMessageList,
  ChatMainPanelTimeline,
  MessageAttachmentGroup,
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryRow,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemInteractionBoundary,
  MessageMultiSelect,
  MessageReferenceChannelUnavailable,
  MessageReferenceTaskUnavailable,
  MessageReferenceThreadUnavailable,
  MessageTimelineDateDivider,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  SystemMessageGroupDisclosure,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
  useMessageMultiSelect,
} from "raft-ui/wip";

import {
  MessageCodeBlockComposition,
  MessageMarkdownComposition,
  MessagePermalinkReferenceComposition,
  MessageReferenceLoadingComposition,
} from "#/modules/message-item/compositions/content.compositions.tsx";
import {
  MessageAttachmentOpeningComposition,
  MessageAttachmentPendingComposition,
  MessageAttachmentReadyComposition,
} from "#/modules/message-item/compositions/attachment.compositions.tsx";
import {
  MessageReactionComposition,
  MessageReactionTooltipComposition,
} from "#/modules/message-item/compositions/reaction.compositions.tsx";
import { MessageMultiSelectToolbarComposition } from "#/modules/message-item/compositions/selection.compositions.tsx";
import { MESSAGE_FIXTURE_IMAGE_SRC as IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { ChipDemoBody } from "./playground-message-scenarios.tsx";
import {
  ImagePreviewButton,
  openMockAttachmentPreview,
  TaskStatusBadge,
} from "./playground-message-fixtures.tsx";
import { ALL_SHOWCASE_THREAD_IDS, getPlaygroundChannel } from "./mock/index.ts";
import { PlaygroundScenarioMessageRow } from "./playground-message-row.tsx";
import { usePlaygroundTask } from "./playground-task-state.tsx";

const GENERAL_CHANNEL_NAME = getPlaygroundChannel("general").name;

function PlainRepliesBadge({ count, unread }: { count: number; unread?: number }) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <MessageItemBadge
        status={unread ? "unread" : "read"}
        className="cursor-pointer"
        render={
          <button
            type="button"
            aria-label={`${count === 1 ? "1 reply" : `${count} replies`}${unread ? `, ${unread} new` : ""}`}
            onClick={() => setOpened(true)}
          />
        }
      >
        <MessageSquare />
        {count === 1 ? "1 reply" : `${count} replies`}
        {unread ? (
          <>
            <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
            <span>{unread} new</span>
          </>
        ) : null}
      </MessageItemBadge>
      {opened ? (
        <span className="sr-only" role="status">
          Thread opened
        </span>
      ) : null}
    </>
  );
}

// Reply badge draft variants (source ThreadRepliesBadge): one default pill —
// draft-only is Pencil + "draft"; replies+draft appends · Pencil draft.
function DraftRepliesBadge({ count, unread }: { count?: number; unread?: number }) {
  const [opened, setOpened] = useState(false);
  const hasReplies = Boolean(count);
  return (
    <>
      <MessageItemBadge
        status={unread ? "unread" : "read"}
        className="cursor-pointer"
        render={
          <button
            type="button"
            aria-label={hasReplies ? `${count} replies, draft` : "Open draft reply"}
            onClick={() => setOpened(true)}
          />
        }
      >
        {hasReplies ? (
          <>
            <MessageSquare />
            {count === 1 ? "1 reply" : `${count} replies`}
          </>
        ) : (
          <Pencil />
        )}
        {unread ? (
          <>
            <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
            <span>{unread} new</span>
          </>
        ) : null}
        {hasReplies ? <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator> : null}
        {hasReplies ? <Pencil /> : null}
        <span>draft</span>
      </MessageItemBadge>
      {opened ? (
        <span className="sr-only" role="status">
          Thread opened
        </span>
      ) : null}
    </>
  );
}

// System-run collapse disclosure (source SystemMessageGroupDisclosure): a
// centered toggle whose chevron rotates between expanded/collapsed.
function SystemGroupDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1">
      <div className="flex justify-center py-1.5">
        <SystemMessageGroupDisclosure
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="truncate">
            There are 3 system updates: 2 task updates, 1 reminder update
          </span>
          <ChevronRight />
        </SystemMessageGroupDisclosure>
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

// ChatPanel renders the plan limit as a warning banner instead of combining it
// with HistoryTopState's beginning/load-older variants.
function HistoryTopStates() {
  const [billingViewed, setBillingViewed] = useState(false);

  return (
    <div className="px-3 pt-3">
      <Banner status="warning" size="sm" className="mx-auto mb-3 max-w-md">
        <BannerDescription>
          Message history is limited to 30 days on the Free plan.{" "}
          <button type="button" className="underline" onClick={() => setBillingViewed(true)}>
            {billingViewed ? "Billing viewed" : "View Billing"}
          </button>
        </BannerDescription>
      </Banner>
    </div>
  );
}

// Named reactor set for the hover popover demo.
const REACTOR_NAMES = ["Developer", "Ada", "Atlas", "Mx. Chen", "Viewer", "Admin", "Cindy"];

// The task-action row of the context menu depends on the message's task link
// (source: Convert to Task / Mark as Done / Reopen Task).
// Right-click context menu content (source MessageItem handleContextMenu → menu
// at MessageItem.tsx:4355-4526): quick-reaction row on top, then Copy Link / Copy
// Markdown / Select Message | Open Thread | Save/Remove | Follow/Unfollow | task
// action, split by dividers. Rendered as the DS ContextMenu content (Base UI),
// opened from each row's ContextMenuTrigger at the cursor. Most actions are inert
// (auto-closes). Select Message enters list select mode when provided; Open Thread
// navigates when the row has a playground thread. `onQuickReact` closes the
// controlled menu after a quick reaction (those buttons are not menu items, so
// they do not auto-close).
// Reaction pill with the reactor-name tooltip (source MessageItem.tsx:
// 4325-4354): hovering or focusing the pill reveals a tooltip listing
// up to five reactor names plus a "+N more" overflow.
function SelectableMessageList({ children }: { children: ReactNode }) {
  return <MessageMultiSelect>{children}</MessageMultiSelect>;
}

function SelectModeToolbarSlot() {
  const selection = useMessageMultiSelect();
  const [status, setStatus] = useState("");
  if (!selection?.active) return null;
  const canAct = selection.selected.size > 0;
  return (
    <>
      <MessageMultiSelectToolbarComposition
        count={selection.selected.size}
        onCancel={selection.cancel}
        onCopyLink={
          canAct
            ? () => {
                void navigator.clipboard?.writeText(window.location.href);
                setStatus("Selected message links copied");
              }
            : undefined
        }
        onCopyMarkdown={
          canAct
            ? () => {
                void navigator.clipboard?.writeText(
                  `${selection.selected.size} selected playground messages`,
                );
                setStatus("Selected messages copied as Markdown");
              }
            : undefined
        }
        onForward={
          canAct
            ? () => setStatus(`${selection.selected.size} selected messages forwarded`)
            : undefined
        }
        onGenerateImage={
          canAct
            ? () => setStatus(`Generated preview for ${selection.selected.size} messages`)
            : undefined
        }
      />
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
    </>
  );
}

// Scenario 4: component-matrix — a believable channel that happens to exercise
// keep each migrated message-item state isolated, one state per message,
// wrapped so right-click menus and select mode work on every row.
function MatrixContentSection() {
  return (
    <>
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Ada"
        meta="member"
        time="09:58 AM"
        body={<MessageMarkdownComposition imageSrc={IMAGE_SRC} />}
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Design-system agent on the primary online machine."
        status="online"
        time="10:00 AM"
        body={<MessageCodeBlockComposition />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:02 AM"
        body={<ChipDemoBody />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:03 AM"
        body={
          <div className="space-y-1">
            <p>
              Unresolved refs dim to 60%:{" "}
              <MessageReferenceChannelUnavailable>#archived</MessageReferenceChannelUnavailable>{" "}
              <MessageReferenceThreadUnavailable>
                #general:deadbeef
              </MessageReferenceThreadUnavailable>{" "}
              <MessageReferenceTaskUnavailable>#404</MessageReferenceTaskUnavailable>
            </p>
            <p>
              Resolving:{" "}
              <MessageReferenceLoadingComposition>
                #{GENERAL_CHANNEL_NAME}:67253b90
              </MessageReferenceLoadingComposition>{" "}
              · unknown mention @ghost
            </p>
            <p>
              Cross-server permalink:{" "}
              <MessagePermalinkReferenceComposition
                external
                href="/playground/s/raft/channel/incidents"
              >
                #ops@other
              </MessagePermalinkReferenceComposition>{" "}
              vs same-server{" "}
              <MessagePermalinkReferenceComposition href="/playground/s/raft/channel/general">
                #{GENERAL_CHANNEL_NAME}
              </MessagePermalinkReferenceComposition>
            </p>
          </div>
        }
      />
    </>
  );
}

function MatrixMediaSection() {
  return (
    <>
      <PlaygroundScenarioMessageRow
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
                  alt="seed-photo.jpg"
                  fit="contain"
                  style={{ width: "min(320px, 100%)", aspectRatio: "4 / 3" }}
                />
                <ImagePreviewButton src={IMAGE_SRC} name="seed-photo.jpg" />
                <MessageImageGalleryAction
                  aria-label="Download image"
                  onClick={openMockAttachmentPreview}
                >
                  <Download />
                </MessageImageGalleryAction>
              </MessageImageGalleryItem>
            </MessageImageGalleryRow>
          </MessageImageGallery>
        }
      />
      <PlaygroundScenarioMessageRow
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
                  alt="before migration"
                  fit="cover"
                  className="h-32 sm:h-36"
                />
                <MessageImageGalleryAction
                  aria-label="Download image"
                  onClick={openMockAttachmentPreview}
                >
                  <Download />
                </MessageImageGalleryAction>
              </MessageImageGalleryItem>
              <MessageImageGalleryItem aria-busy>
                <MessageImageGalleryMedia
                  src={IMAGE_SRC}
                  alt="after migration uploading"
                  fit="cover"
                  className="h-32 sm:h-36"
                />
                <MessageImageGalleryOverlay>
                  <Spinner size="md" variant="inverse" />
                </MessageImageGalleryOverlay>
              </MessageImageGalleryItem>
            </MessageImageGalleryRow>
          </MessageImageGallery>
        }
      />
      <PlaygroundScenarioMessageRow
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
                    alt={`crop ${i + 1}`}
                    fit="cover"
                    className="h-28 sm:h-32"
                  />
                </MessageImageGalleryItem>
              ))}
            </MessageImageGalleryRow>
          </MessageImageGallery>
        }
      />
      <PlaygroundScenarioMessageRow
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
                    alt={`contact sheet thumbnail ${i + 1}`}
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
                    alt={`contact sheet thumbnail ${i + 3}`}
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
                  alt="contact sheet hero"
                  fit="contain"
                  className="h-32 sm:h-36"
                />
              </MessageImageGalleryItem>
            </MessageImageGalleryRow>
          </MessageImageGallery>
        }
      />

      <PlaygroundScenarioMessageRow
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
              <MessageVideoPreviewAction
                aria-label="Open video in preview"
                onClick={openMockAttachmentPreview}
              >
                <Eye />
              </MessageVideoPreviewAction>
            </MessageVideoPreviewFrame>
          </MessageVideoPreview>
        }
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Design-system agent on the primary online machine."
        status="online"
        time="10:12 AM"
        body="This one is still uploading."
        attachments={
          <MessageVideoPreview aria-busy>
            <MessageVideoPreviewFrame>
              <MessageVideoPreviewFallback>
                <Spinner size="md" variant="inverse" />
              </MessageVideoPreviewFallback>
            </MessageVideoPreviewFrame>
          </MessageVideoPreview>
        }
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Design-system agent on the primary online machine."
        status="online"
        time="10:13 AM"
        body="And this one uses a codec this browser can't decode."
        attachments={
          <MessageVideoPreview>
            <MessageVideoPreviewFrame>
              <MessageVideoPreviewFallback
                render={<button type="button" onClick={openMockAttachmentPreview} />}
              >
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

      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:14 AM"
        body="Attaching the supporting files for review."
        attachments={
          <MessageAttachmentGroup>
            <MessageAttachmentReadyComposition
              name="seed-pixel.png"
              meta="image/png · 1 KB"
              primaryAction={<Eye />}
              onPrimaryAction={openMockAttachmentPreview}
            />
            <MessageAttachmentReadyComposition
              name="seed-notes.txt"
              meta="Text preview · 1 KB"
              summary={<span>Plain text document</span>}
              primaryAction={<Eye />}
              onPrimaryAction={openMockAttachmentPreview}
              commentCount={3}
            />
            <MessageAttachmentReadyComposition
              name="metrics.csv"
              meta="CSV preview · 2 KB"
              summary={<span>Preview 12 rows · 4 columns</span>}
              primaryAction={<Eye />}
              onPrimaryAction={openMockAttachmentPreview}
            />
            <MessageAttachmentReadyComposition
              name="spec.pdf"
              meta="PDF preview · 1.4 MB"
              summary={<span>PDF document</span>}
              primaryAction={<Eye />}
              onPrimaryAction={openMockAttachmentPreview}
            />
            <MessageAttachmentReadyComposition
              name="feature.diff"
              meta="patch · 3 KB"
              summary={
                <>
                  <span>3 files · 8 hunks</span>
                  <span className="text-success-base">+124</span>
                  <span className="text-danger-base">-37</span>
                </>
              }
              primaryAction={<Download />}
              onPrimaryAction={openMockAttachmentPreview}
            />
            <MessageAttachmentReadyComposition
              name="voice-note.m4a"
              meta="Audio preview · 512 KB"
              primaryAction={<Eye />}
              onPrimaryAction={openMockAttachmentPreview}
              secondaryAction={<Download />}
              onSecondaryAction={openMockAttachmentPreview}
            />
            <MessageAttachmentReadyComposition
              name="report.html"
              meta="HTML preview · 6 KB"
              primaryAction={<Eye />}
              onPrimaryAction={openMockAttachmentPreview}
            />
            <MessageAttachmentReadyComposition
              name="archive.zip"
              meta="application/zip · 4 MB"
              primaryAction={<Download />}
              onPrimaryAction={openMockAttachmentPreview}
            />
          </MessageAttachmentGroup>
        }
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:15 AM"
        body="Uploading one more attachment."
        attachments={
          <MessageAttachmentGroup>
            <MessageAttachmentPendingComposition name="uploading.png" meta="image/png · 1 KB" />
          </MessageAttachmentGroup>
        }
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:16 AM"
        body="Opening the spec preview."
        attachments={
          <MessageAttachmentGroup>
            <MessageAttachmentOpeningComposition name="opening.pdf" meta="PDF preview · 1 MB" />
          </MessageAttachmentGroup>
        }
      />
    </>
  );
}

function MatrixStateSection() {
  const todoTask = usePlaygroundTask("task:frontend:10");
  const inProgressTask = usePlaygroundTask("task:frontend:11");
  const inReviewTask = usePlaygroundTask("task:frontend:12");
  const doneTask = usePlaygroundTask("task:frontend:13");
  const closedTask = usePlaygroundTask("task:frontend:15");
  const agentTask = usePlaygroundTask("task:frontend:16");

  return (
    <>
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Online agent."
        status="online"
        time="10:20 AM"
        body="On it — pulling the token diff now."
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Thinking…"
        status="thinking"
        time="10:21 AM"
        body="Let me reason about the contract shape before I touch the palette."
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Working…"
        status="working"
        time="10:23 AM"
        body="Regenerating the palette and re-running the visual suite now."
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Deploy Bot"
        meta="Error: daemon unreachable."
        status="error"
        time="10:24 AM"
        body="Deploy webhook is failing — retries are queued."
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Nyx"
        meta="Offline."
        status="offline"
        time="10:25 AM"
        body="Note before I dropped off: the two snapshots still need rebaselining."
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Relay"
        meta="External agent."
        status="external"
        time="10:26 AM"
        body="Mirroring this thread from the ops server."
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Legacy Bot"
        senderState="deleted"
        deactivated
        meta="Deactivated agent."
        time="10:27 AM"
        body="Old handoff note from the retired build agent."
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Mx. Chen"
        senderState="removed"
        time="10:28 AM"
        body="Looping in the on-call rotation before the next window."
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:29 AM"
        saved
        body="Pinned this one for later — persistent bookmark at rest, saved in the toolbar."
      />

      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Ada"
        meta="member"
        time="10:30 AM"
        body="Nice, the new palette looks great."
        footer={
          <>
            <MessageReactionComposition emoji="👀" count={2} />
            <MessageReactionComposition emoji="👍" count={5} reacted />
            <MessageReactionComposition emoji="🔥" count={1} failed />
          </>
        }
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:31 AM"
        body="Shipping this today — hover the reaction to see who reacted."
        footer={<MessageReactionTooltipComposition emoji="👍" count={7} names={REACTOR_NAMES} />}
      />

      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:35 AM"
        body={`${todoTask.title}.`}
        footer={<TaskStatusBadge taskId="task:frontend:10" assignee="Ada" />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Ada"
        meta="member"
        time="10:36 AM"
        body={`${inProgressTask.title}.`}
        footer={<TaskStatusBadge taskId="task:frontend:11" />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:37 AM"
        body={`${inReviewTask.title}.`}
        footer={<TaskStatusBadge taskId="task:frontend:12" />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Ada"
        meta="member"
        time="10:38 AM"
        body={`${doneTask.title}.`}
        footer={<TaskStatusBadge taskId="task:frontend:13" />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:39 AM"
        body={`${closedTask.title}.`}
        footer={<TaskStatusBadge taskId="task:frontend:15" />}
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Design-system agent on the primary online machine."
        status="working"
        time="10:40 AM"
        body={`${agentTask.title}.`}
        footer={<TaskStatusBadge taskId="task:frontend:16" busy />}
      />

      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:42 AM"
        body="Wrote up the rollback plan in the thread."
        footer={<PlainRepliesBadge count={2} />}
      />
      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Design-system agent on the primary online machine."
        status="online"
        time="10:43 AM"
        body="Posted the regression breakdown — new replies since you last looked."
        footer={<PlainRepliesBadge count={1} unread={1} />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Ada"
        meta="member"
        time="10:44 AM"
        body="Half-written reply saved as a draft on this thread."
        footer={<DraftRepliesBadge />}
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:45 AM"
        body="Thread has replies and a draft of mine still pending."
        footer={<DraftRepliesBadge count={3} />}
      />

      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:46 AM"
        rowState="search-match"
        body="Jumped-to / thread-focus / search anchor: cyan fill + brutal shadow."
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="10:47 AM"
        rowState="active"
        body="Active row (context-menu open / open-thread parent): bordered white."
      />

      <MessageItemInteractionBoundary>
        <SystemMessageItem>
          <SystemMessageItemTime>10:50 AM</SystemMessageItemTime>
          <SystemMessageItemContent>
            Atlas restarted on the primary machine.
          </SystemMessageItemContent>
        </SystemMessageItem>
        <SystemGroupDisclosure />
      </MessageItemInteractionBoundary>

      <PlaygroundScenarioMessageRow
        variant="agent"
        sender="Atlas"
        meta="Design-system agent on the primary online machine."
        status="online"
        time="11:00 AM"
        selectId="im-saved"
        saved
        followed
        task="open"
        threadId={ALL_SHOWCASE_THREAD_IDS.stateModel}
        body="Right-click this saved + followed row — its menu shows Remove / Unfollow / Mark as Done."
      />
      <PlaygroundScenarioMessageRow
        variant="member"
        sender="Developer"
        meta="member"
        time="11:02 AM"
        selectId="im-done"
        task="done"
        body="This row's task is already done, so its menu offers Reopen Task. Right-click any message for the full menu."
      />

      <div className="pb-3" aria-hidden />
    </>
  );
}

export function MatrixBody() {
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <SelectableMessageList>
            <HistoryTopStates />

            <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

            <MatrixContentSection />
            <MatrixMediaSection />
            <MatrixStateSection />
            <SelectModeToolbarSlot />
          </SelectableMessageList>
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
      <ChatMainPanelJumpToLatestLayout>
        <ChatMainPanelJumpToLatest disabled>
          <ArrowDown />3 new messages
        </ChatMainPanelJumpToLatest>
      </ChatMainPanelJumpToLatestLayout>
    </ChatMainPanelBody>
  );
}

// Brand-new channel empty state.
