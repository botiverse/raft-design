import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MarkdownBlockquote,
  MarkdownParagraph,
  MessageReferenceBadge,
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferencePending,
  MessageReferenceUnavailable,
  Spinner,
  TaskChip,
} from "raft-ui";
import {
  CircleOff,
  Link as LinkIcon,
  MessageCircle,
  MessagesSquare,
  MessageSquareQuote,
  MessageSquareText,
} from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";
import { MessageReferenceComparisonComposition } from "./reference-comparison.composition.tsx";
import { MessageMentionReferenceComposition } from "./reference-adapters.composition.tsx";

export function MessageReferenceShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageReferenceComparisonComposition />
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:21 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MarkdownParagraph>
              Please triage{" "}
              <TaskChip
                variant="message"
                status="todo"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                <span>#21</span>
                <span>@Ada</span>
              </TaskChip>{" "}
              , continue{" "}
              <TaskChip
                variant="message"
                status="in_progress"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                <span>#22</span>
                <span>@Atlas</span>
              </TaskChip>
              , review{" "}
              <TaskChip
                variant="message"
                status="in_review"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                <span>#23</span>
                <span>@Noah</span>
              </TaskChip>
              , confirm{" "}
              <TaskChip
                variant="message"
                status="done"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                <span>#24</span>
                <span>@Mira</span>
              </TaskChip>
              , and archive{" "}
              <TaskChip
                variant="message"
                status="closed"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                <span>#25</span>
                <span>@Cindy</span>
              </TaskChip>{" "}
              with{" "}
              <MessageMentionReferenceComposition
                preview={<p>Ada · current workspace member</p>}
                variant="primary"
              >
                Ada
              </MessageMentionReferenceComposition>{" "}
              before posting the migration summary in{" "}
              <MessageReferenceChip
                variant="accent"
                render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
              >
                <MessageReferenceBadge>thread</MessageReferenceBadge>
                <MessagesSquare />
                <MessageReferenceLabel>release-notes</MessageReferenceLabel>
              </MessageReferenceChip>
              {" or sending it to "}
              <MessageReferenceChip
                variant="accent"
                render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}
              >
                <MessageReferenceBadge>dm</MessageReferenceBadge>
                <MessageCircle />
                <MessageReferenceLabel>Noah</MessageReferenceLabel>
              </MessageReferenceChip>
              .
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:21 PM</MessageItemTime>
          </MessageItemHeader>
          <div className="mb-0.5">
            <MessageReferenceChip
              variant="muted"
              render={
                <a
                  href={MESSAGE_PLAYGROUND_URLS.stateOwnershipAttachment}
                  title="Jump to state-ownership-migration-notes.md · § Ownership boundary"
                />
              }
            >
              <MessageReferenceBadge>comment</MessageReferenceBadge>
              <MessageSquareQuote />
              <MessageReferenceLabel>
                re: state-ownership-migration-notes.md · § Ownership boundary
              </MessageReferenceLabel>
            </MessageReferenceChip>
          </div>
          <MarkdownBlockquote>
            The atom model is a better fit only if we keep server state out of the local store.
          </MarkdownBlockquote>
          <MessageItemBody>
            <MarkdownParagraph>
              Track the rollout in{" "}
              <MessageReferenceChip
                variant="link"
                render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
              >
                <MessageReferenceBadge>message</MessageReferenceBadge>
                <MessageSquareText />
                <MessageReferenceLabel>all</MessageReferenceLabel>
              </MessageReferenceChip>
              {" and review "}
              <MessageReferenceChip
                variant="link"
                render={
                  <a
                    href="https://github.com/botiverse/rui/pull/125"
                    rel="noreferrer"
                    target="_blank"
                  />
                }
              >
                <MessageReferenceBadge>github.com</MessageReferenceBadge>
                <LinkIcon />
                <MessageReferenceLabel>rui#125 Compose message surfaces</MessageReferenceLabel>
              </MessageReferenceChip>
              {" before posting the final migration note in "}
              <MessageReferenceChip
                variant="info"
                render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
              >
                <MessageReferenceBadge>thread</MessageReferenceBadge>
                <MessagesSquare />
                <MessageReferenceLabel>release-notes</MessageReferenceLabel>
              </MessageReferenceChip>
              .
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:22 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MarkdownParagraph>
              I&apos;m still resolving{" "}
              <MessageReferencePending>
                <Spinner size="xs" />
                release-notes
              </MessageReferencePending>
              . The earlier{" "}
              <MessageReferenceUnavailable>
                <CircleOff size={12} />
                release-notes
              </MessageReferenceUnavailable>{" "}
              thread was removed, so keep missing in the draft until its target is confirmed.
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
