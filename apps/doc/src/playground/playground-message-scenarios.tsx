import { useRef } from "react";
import { ArrowDown, Eye } from "lucide-react";
import {
  ChatMainPanelBody,
  ChatMainPanelJumpToLatest,
  ChatMainPanelJumpToLatestLayout,
  ChatMainPanelMessageList,
  ChatMainPanelTimeline,
  MessageAttachmentGroup,
  MessageMarkdown,
  MessageInlineCode,
  MessageReferenceChannel,
  MessageReferenceTask,
  MessageReferenceThread,
  MessageTimelineDateDivider,
  MessageTimelineNotice,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";

import {
  MessageMentionReferenceComposition,
  MessagePermalinkReferenceComposition,
  MessageSelfMentionReferenceComposition,
} from "#/modules/message-item/compositions/content.compositions.tsx";
import { MessageAttachmentReadyComposition } from "#/modules/message-item/compositions/attachment.compositions.tsx";
import { MessageReactionComposition } from "#/modules/message-item/compositions/reaction.compositions.tsx";
import { ProfileCardBody } from "./playground-message-avatar.tsx";
import { openMockAttachmentPreview, TaskStatusBadge } from "./playground-message-fixtures.tsx";
import {
  PlaygroundScenarioMessageRow,
  PlaygroundRepliesBadge as RepliesBadge,
  PlaygroundUnreadRepliesBadge as UnreadRepliesBadge,
  type RowVariant,
} from "./playground-message-row.tsx";
import {
  ALL_SHOWCASE_THREAD_IDS,
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundFilesForMessage,
  requirePlaygroundThread,
  type PlaygroundMessageId,
} from "./mock/index.ts";
import { usePlaygroundTask } from "./playground-task-state.tsx";

const GENERAL_CHANNEL_NAME = getPlaygroundChannel("general").name;

export function ProjUiuxBody() {
  const stateModel = requirePlaygroundThread(ALL_SHOWCASE_THREAD_IDS.stateModel).thread.parent;
  const inviteSecurity = requirePlaygroundThread(ALL_SHOWCASE_THREAD_IDS.inviteSecurity).thread
    .parent;
  const selectorPerformance = requirePlaygroundThread(ALL_SHOWCASE_THREAD_IDS.selectorPerformance)
    .thread.parent;
  const apiDocs = requirePlaygroundThread(ALL_SHOWCASE_THREAD_IDS.apiDocs).thread.parent;
  const todoTask = usePlaygroundTask("task:all:10");
  const inProgressTask = usePlaygroundTask("task:all:11");
  const inReviewTask = usePlaygroundTask("task:all:12");
  const doneTask = usePlaygroundTask("task:all:13");

  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <div className="px-3 pt-3">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

          <PlaygroundScenarioMessageRow
            variant="member"
            sender={getPlaygroundActor(stateModel.authorId).name}
            meta="member"
            time={stateModel.time}
            body={stateModel.body}
            threadId={stateModel.id}
            footer={<RepliesBadge threadId={stateModel.id} />}
            attachments={<PlaygroundFileAttachments messageId={stateModel.id} />}
          />
          <PlaygroundScenarioMessageRow
            variant="agent"
            sender={getPlaygroundActor(inviteSecurity.authorId).name}
            meta="Design-system agent on the primary online machine."
            status="online"
            time={inviteSecurity.time}
            body={inviteSecurity.body}
            threadId={inviteSecurity.id}
            footer={<RepliesBadge threadId={inviteSecurity.id} />}
            attachments={<PlaygroundFileAttachments messageId={inviteSecurity.id} />}
          />
          <PlaygroundScenarioMessageRow
            variant="member"
            sender={getPlaygroundActor(selectorPerformance.authorId).name}
            meta="member"
            time={selectorPerformance.time}
            body={selectorPerformance.body}
            threadId={selectorPerformance.id}
            footer={<UnreadRepliesBadge threadId={selectorPerformance.id} />}
            attachments={<PlaygroundFileAttachments messageId={selectorPerformance.id} />}
          />
          <PlaygroundScenarioMessageRow
            variant="agent"
            sender={getPlaygroundActor(apiDocs.authorId).name}
            meta="Design-system agent on the primary online machine."
            status="working"
            time={apiDocs.time}
            body={apiDocs.body}
            threadId={apiDocs.id}
            footer={<RepliesBadge threadId={apiDocs.id} />}
            attachments={<PlaygroundFileAttachments messageId={apiDocs.id} />}
          />
          <PlaygroundScenarioMessageRow compact gutterTime="08:34" body="Great work!" />

          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:35 AM"
            body={
              <>
                {todoTask.title}{" "}
                <MessageReferenceTask href={`/playground/${todoTask.channelId}`}>
                  #{todoTask.number}
                </MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge taskId="task:all:10" />}
          />
          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:36 AM"
            body={
              <>
                {inProgressTask.title}{" "}
                <MessageReferenceTask href={`/playground/${inProgressTask.channelId}`}>
                  #{inProgressTask.number}
                </MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge taskId="task:all:11" />}
          />
          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:37 AM"
            body={
              <>
                {inReviewTask.title}{" "}
                <MessageReferenceTask href={`/playground/${inReviewTask.channelId}`}>
                  #{inReviewTask.number}
                </MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge taskId="task:all:12" />}
          />
          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:38 AM"
            body={
              <>
                {doneTask.title}{" "}
                <MessageReferenceTask href={`/playground/${doneTask.channelId}`}>
                  #{doneTask.number}
                </MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge taskId="task:all:13" />}
          />

          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:39 AM"
            body={<ChipDemoBody />}
            footer={
              <>
                <MessageReactionComposition emoji="👍" count={1} reacted title="Developer" />
                <MessageReactionComposition emoji="👀" count={1} title="Claude Assistant" />
              </>
            }
          />
          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:41 AM"
            body="Attachments: PNG, JPEG, and a text file are linked to this message."
            attachments={
              <MessageAttachmentGroup>
                <MessageAttachmentReadyComposition
                  name="seed-pixel.png"
                  meta="image/png · 1 KB"
                  primaryAction={<Eye />}
                  onPrimaryAction={openMockAttachmentPreview}
                />
                <MessageAttachmentReadyComposition
                  name="seed-photo.jpg"
                  meta="image/jpeg · 1 KB"
                  primaryAction={<Eye />}
                  onPrimaryAction={openMockAttachmentPreview}
                />
                <MessageAttachmentReadyComposition
                  name="seed-notes.txt"
                  meta="Text preview · 1 KB"
                  summary="Plain text document"
                  primaryAction={<Eye />}
                  onPrimaryAction={openMockAttachmentPreview}
                />
              </MessageAttachmentGroup>
            }
          />
          <PlaygroundScenarioMessageRow
            compact
            gutterTime="08:42"
            attachments={
              <MessageAttachmentGroup>
                <MessageAttachmentReadyComposition
                  name="seed-this-is-an-extremely-long-markdown-filename-used-to-verify-attachment-preview-card-truncation.md"
                  meta="Markdown preview · 1 KB"
                  summary="Markdown document"
                  primaryAction={<Eye />}
                  onPrimaryAction={openMockAttachmentPreview}
                />
              </MessageAttachmentGroup>
            }
          />

          <div className="pb-3" aria-hidden />
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
    </ChatMainPanelBody>
  );
}

function PlaygroundFileAttachments({ messageId }: { messageId: PlaygroundMessageId }) {
  return (
    <>
      {getPlaygroundFilesForMessage(messageId).map((file) => {
        const summary = file.type === "image" ? "Image preview" : "Text document";
        return (
          <MessageAttachmentReadyComposition
            key={file.id}
            name={file.filename}
            meta={`${summary} · ${file.size}`}
            summary={summary}
            primaryAction={<Eye />}
            onPrimaryAction={() => window.open(file.previewUrl, "_blank", "noopener,noreferrer")}
          />
        );
      })}
    </>
  );
}

// Rich-text body reproduction (source renders markdown + inline reference chips
// at the app level; the design-system MessageItemBody is a plain container).
export function ChipDemoBody() {
  return (
    <MessageMarkdown>
      <p>
        <strong>Message chip height demo</strong> — compare inline chips in one dense message.
      </p>
      <p>
        Self mention:{" "}
        <MessageSelfMentionReferenceComposition
          href="/playground/dm-code-pilot"
          preview={<ProfileCardBody actorId="developer" />}
        >
          @Developer
        </MessageSelfMentionReferenceComposition>{" "}
        is the attention chip. Normal mentions like{" "}
        <MessageMentionReferenceComposition
          href="/playground/dm-noah"
          preview={<ProfileCardBody actorId="noah" />}
        >
          @Member
        </MessageMentionReferenceComposition>{" "}
        stays text-link style.
      </p>
      <p>
        Refs in one line:{" "}
        <MessageReferenceChannel href="/playground/general">
          #{GENERAL_CHANNEL_NAME}
        </MessageReferenceChannel>{" "}
        task <MessageReferenceTask href="/playground/frontend">#15</MessageReferenceTask>{" "}
        <MessageReferenceThread href="/playground/general">
          #{GENERAL_CHANNEL_NAME}:67253b90
        </MessageReferenceThread>{" "}
        <MessagePermalinkReferenceComposition href="/playground/general">
          #{GENERAL_CHANNEL_NAME}
        </MessagePermalinkReferenceComposition>
      </p>
      <blockquote>Quote row repeats the same shapes at one line height.</blockquote>
      <p>
        Code should not become chips:{" "}
        <MessageInlineCode>@Developer #{GENERAL_CHANNEL_NAME}</MessageInlineCode>
      </p>
    </MessageMarkdown>
  );
}

// Scenario 2: incident channel — a short member/agent exchange.
export function IncidentBody() {
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
          <PlaygroundScenarioMessageRow
            variant="agent"
            sender="Deploy Bot"
            meta="Deploy agent on the primary online machine."
            status="error"
            time="09:12 AM"
            inlineStatus="Converting…"
            body="Delivery degraded — the deploy webhook failed three times and retries are queued."
          />
          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Mx. Chen"
            senderState="removed"
            time="09:16 AM"
            body="Looping in the on-call rotation before the next deploy window."
          />
          <PlaygroundScenarioMessageRow
            variant="member"
            sender="Ada"
            meta="member"
            time="09:20 AM"
            body="Looking now. I'll re-enable the webhook once the incident is resolved."
          />
          <PlaygroundScenarioMessageRow
            compact
            gutterTime="09:24"
            body="Retries are draining, back to healthy."
          />

          <div className="pb-3" aria-hidden />
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
    </ChatMainPanelBody>
  );
}

// Scenario 3: longer thread scrolled up — the jump-to-latest control shows.
export function ReleaseBody() {
  const timelineRef = useRef<HTMLDivElement>(null);
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

          {RELEASE_MESSAGES.map((message) => (
            <PlaygroundScenarioMessageRow
              key={`${message.time}:${message.sender}`}
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
      <ChatMainPanelJumpToLatestLayout>
        <ChatMainPanelJumpToLatest onClick={handleJump}>
          <ArrowDown />
          Back to bottom
        </ChatMainPanelJumpToLatest>
      </ChatMainPanelJumpToLatestLayout>
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

// Non-navigating reply badge (plain or cyan-unread) for the state matrix.
// Source ThreadRepliesBadge: one solid pill, MessageSquare + count, optional "· N new".
