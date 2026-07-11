import { useRef } from "react";
import { ArrowDown, Eye } from "lucide-react";
import { InlineCode } from "raft-ui";
import {
  ChatMainPanelBody,
  ChatMainPanelJumpToLatest,
  ChatMainPanelMessageList,
  ChatMainPanelTimeline,
  MessageMarkdown,
  MessageReferenceChannel,
  MessageReferenceMention,
  MessageReferenceTask,
  MessageReferenceThread,
  MessageTimelineDateDivider,
  MessageTimelineNotice,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";

import {
  MessagePermalinkReferenceComposition,
  MessageSelfMentionReferenceComposition,
} from "#/compositions/message-item/message-content-compositions.tsx";
import { MessageAttachmentReadyComposition } from "#/compositions/message-item/message-attachment-compositions.tsx";
import { MessageReactionComposition } from "#/compositions/message-item/message-reaction-compositions.tsx";
import { ProfileCardBody } from "./playground-message-avatar.tsx";
import { openMockAttachmentPreview, TaskStatusBadge } from "./playground-message-fixtures.tsx";
import {
  PlaygroundMessageRow,
  PlaygroundRepliesBadge as RepliesBadge,
  PlaygroundUnreadRepliesBadge as UnreadRepliesBadge,
  type RowVariant,
} from "./playground-message-row.tsx";
import { ALL_SHOWCASE_THREAD_IDS } from "./mock/index.ts";

export function ProjUiuxBody() {
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <div className="px-3 pt-3">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>

          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:17 AM"
            body="Should we migrate from Zustand to Jotai? Jotai's atom model might be better for our store structure."
            threadId={ALL_SHOWCASE_THREAD_IDS.stateModel}
            footer={<RepliesBadge threadId={ALL_SHOWCASE_THREAD_IDS.stateModel} />}
          />
          <PlaygroundMessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            status="online"
            time="08:22 AM"
            body="The invite link system needs rate limiting. Someone could enumerate valid invite codes."
            threadId={ALL_SHOWCASE_THREAD_IDS.inviteSecurity}
            footer={<RepliesBadge threadId={ALL_SHOWCASE_THREAD_IDS.inviteSecurity} />}
          />
          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:27 AM"
            body="Performance: the message list re-renders when any agent activity changes. Need to fix selectors."
            threadId={ALL_SHOWCASE_THREAD_IDS.selectorPerformance}
            footer={<UnreadRepliesBadge threadId={ALL_SHOWCASE_THREAD_IDS.selectorPerformance} />}
          />
          <PlaygroundMessageRow
            variant="agent"
            sender="Atlas"
            meta="Design-system agent on the primary online machine."
            status="working"
            time="08:32 AM"
            body="Documentation: we should auto-generate API docs from the route definitions. Maybe use Swagger."
            threadId={ALL_SHOWCASE_THREAD_IDS.apiDocs}
            footer={<RepliesBadge threadId={ALL_SHOWCASE_THREAD_IDS.apiDocs} />}
          />
          <PlaygroundMessageRow compact gutterTime="08:34" body="Great work!" />

          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:35 AM"
            body={
              <>
                Todo: check default seed member permissions{" "}
                <MessageReferenceTask href="/playground/all">#10</MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge channelId="all" status="todo" taskNumber={10} />}
          />
          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:36 AM"
            body={
              <>
                In progress: verify RustFS attachment previews{" "}
                <MessageReferenceTask href="/playground/all">#11</MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge channelId="all" status="in_progress" taskNumber={11} />}
          />
          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:37 AM"
            body={
              <>
                In review: thread reminder wake regression{" "}
                <MessageReferenceTask href="/playground/all">#12</MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge channelId="all" status="in_review" taskNumber={12} />}
          />
          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:38 AM"
            body={
              <>
                Done: archived-channel smoke check{" "}
                <MessageReferenceTask href="/playground/all">#13</MessageReferenceTask>
              </>
            }
            footer={<TaskStatusBadge channelId="all" status="done" taskNumber={13} />}
          />

          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:39 AM"
            body={<ChipDemoBody />}
            footer={
              <>
                <MessageReactionComposition emoji="👍" count={1} reacted />
                <MessageReactionComposition emoji="👀" count={1} />
              </>
            }
          />
          <PlaygroundMessageRow
            variant="member"
            sender="Developer"
            meta="member"
            time="08:41 AM"
            body="Attachments: PNG, JPEG, and a text file are linked to this message."
            attachments={
              <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
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
              </div>
            }
          />
          <PlaygroundMessageRow
            compact
            gutterTime="08:42"
            attachments={
              <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
                <MessageAttachmentReadyComposition
                  name="seed-this-is-an-extremely-long-markdown-filename-used-to-verify-attachment-preview-card-truncation.md"
                  meta="Markdown preview · 1 KB"
                  summary="Markdown document"
                  primaryAction={<Eye />}
                  onPrimaryAction={openMockAttachmentPreview}
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
          preview={<ProfileCardBody variant="member" sender="Developer" meta="member" />}
        >
          @Developer
        </MessageSelfMentionReferenceComposition>{" "}
        is the attention chip. Normal mentions like{" "}
        <MessageReferenceMention href="/playground/dm-noah">@Member</MessageReferenceMention> stay
        text-link style.
      </p>
      <p>
        Refs in one line:{" "}
        <MessageReferenceChannel href="/playground/general">#general</MessageReferenceChannel>{" "}
        <MessageReferenceTask href="/playground/frontend">task #15</MessageReferenceTask>{" "}
        <MessageReferenceThread href="/playground/general">
          #general:67253b90
        </MessageReferenceThread>{" "}
        <MessagePermalinkReferenceComposition href="/playground/general">
          #general
        </MessagePermalinkReferenceComposition>
      </p>
      <blockquote>Quote row repeats the same shapes at one line height.</blockquote>
      <p>
        Code should not become chips: <InlineCode>@Developer #general</InlineCode>
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
          <PlaygroundMessageRow
            variant="agent"
            sender="Deploy Bot"
            meta="Deploy agent on the primary online machine."
            status="error"
            time="09:12 AM"
            inlineStatus="Converting…"
            body="Delivery degraded — the deploy webhook failed three times and retries are queued."
          />
          <PlaygroundMessageRow
            variant="member"
            sender="Mx. Chen"
            senderState="removed"
            time="09:16 AM"
            body="Looping in the on-call rotation before the next deploy window."
          />
          <PlaygroundMessageRow
            variant="member"
            sender="Ada"
            meta="member"
            time="09:20 AM"
            body="Looking now. I'll re-enable the webhook once the incident is resolved."
          />
          <PlaygroundMessageRow
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
            <PlaygroundMessageRow
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

// Non-navigating reply badge (plain or cyan-unread) for the state matrix.
// Source ThreadRepliesBadge: one solid pill, MessageSquare + count, optional "· N new".
