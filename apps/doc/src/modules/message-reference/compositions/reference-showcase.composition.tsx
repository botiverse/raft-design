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
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferencePending,
  MessageReferenceUnavailable,
  Spinner,
  TaskChip,
  TaskInProgressIcon,
  TaskTodoIcon,
} from "raft-ui";
import {
  CircleOff,
  GitBranch,
  Link as LinkIcon,
  MessageSquareMore,
  MessageSquareQuote,
  MessagesSquare,
} from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";
import { MessagePrimaryReferencesComposition } from "./primary-references.composition.tsx";
import { MessageMentionReferenceComposition } from "./reference-adapters.composition.tsx";

export function MessageReferenceShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessagePrimaryReferencesComposition />
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
                variant="inline"
                status="todo"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                <TaskTodoIcon />
                <span>#21</span>
                <span>@Ada</span>
              </TaskChip>{" "}
              and continue{" "}
              <TaskChip
                variant="inline"
                status="in-progress"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                <TaskInProgressIcon />
                <span>#22</span>
                <span>@Atlas</span>
              </TaskChip>{" "}
              with{" "}
              <MessageMentionReferenceComposition
                preview={<p>Ada · current workspace member</p>}
                variant="primary"
              >
                Ada
              </MessageMentionReferenceComposition>{" "}
              before posting the migration summary in the joint channel{" "}
              <MessageReferenceChip
                variant="accent"
                render={<a href={MESSAGE_PLAYGROUND_URLS.northstarJointChannel} />}
              >
                <GitBranch />
                <MessageReferenceLabel>northstar-launch-handoff</MessageReferenceLabel>
              </MessageReferenceChip>
              {" and continuing the rollout in the "}
              <MessageReferenceChip
                variant="accent"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelThread} />}
              >
                <MessagesSquare />
                <MessageReferenceLabel>state-model</MessageReferenceLabel>
              </MessageReferenceChip>
              {" thread or sending "}
              <MessageReferenceChip
                variant="accent"
                render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}
              >
                <MessageSquareMore />
                <MessageReferenceLabel>Noah Bennett</MessageReferenceLabel>
              </MessageReferenceChip>
              {" a DM."}
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
              Review{" "}
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
                <LinkIcon />
                <MessageReferenceLabel>rui#125 Compose message surfaces</MessageReferenceLabel>
              </MessageReferenceChip>
              {" before posting the final migration note."}
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
                migration-notes
              </MessageReferencePending>
              . The earlier{" "}
              <MessageReferenceUnavailable>
                <CircleOff size={12} />
                legacy-brief
              </MessageReferenceUnavailable>{" "}
              reference was removed, so leave the original token in the draft until a replacement is
              confirmed.
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
