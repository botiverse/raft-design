import {
  InlineCode,
  MarkdownBlockquote,
  MarkdownList,
  MarkdownListItem,
  MarkdownParagraph,
  MessageItem,
  MessageItemBody,
  MessageItemContent,
  MessageReferenceBadge,
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceText,
  TaskChip,
  TaskInProgressIcon,
} from "raft-ui";
import { GitBranch, Link as LinkIcon, MessagesSquare } from "lucide-react";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

const HASH = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

// Every inline kind a message can hold, mixed in one long paragraph plus a
// quote and a list (#proj-rui task #84). All chips are the body text's size,
// sit on its baseline, and keep their letters centred in the coloured box.
export function MessageReferenceMixedLongMessageComposition() {
  const self = (
    <MessageReferenceText
      variant="primary"
      render={<a href={MESSAGE_PLAYGROUND_URLS.allChannel} />}
    >
      @Developer
    </MessageReferenceText>
  );
  const other = (
    <MessageReferenceText render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}>
      @Noah Bennett
    </MessageReferenceText>
  );
  const task = (
    <TaskChip
      variant="inline"
      status="in-progress"
      render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
    >
      <TaskInProgressIcon />
      <span>#206</span>
    </TaskChip>
  );
  const channel = (
    <MessageReferenceChip variant="accent" render={<a href={MESSAGE_PLAYGROUND_URLS.allChannel} />}>
      #general
    </MessageReferenceChip>
  );
  const joint = (
    <MessageReferenceChip
      variant="accent"
      render={<a href={MESSAGE_PLAYGROUND_URLS.northstarJointChannel} />}
    >
      <MessageReferenceBadge>joint</MessageReferenceBadge>
      <GitBranch />
      <MessageReferenceLabel>northstar-launch-handoff</MessageReferenceLabel>
    </MessageReferenceChip>
  );
  const thread = (
    <MessageReferenceChip
      variant="accent"
      render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelThread} />}
    >
      <MessageReferenceBadge>thread</MessageReferenceBadge>
      <MessagesSquare />
      <MessageReferenceLabel>state-model</MessageReferenceLabel>
    </MessageReferenceChip>
  );
  const link = (
    <MessageReferenceChip
      variant="link"
      render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
    >
      <LinkIcon />
      <MessageReferenceLabel>#general</MessageReferenceLabel>
    </MessageReferenceChip>
  );

  return (
    <MessageItem>
      <MessageItemContent>
        <MessageItemBody>
          <MarkdownParagraph>
            {self} this is one long paragraph that mixes everything: ping {other}, then {task} and
            the channel {channel}, the joint channel {joint}, the thread {thread} and a message
            reference {link}. Inline code comes short{" "}
            <InlineCode appearance="message">x</InlineCode>,{" "}
            <InlineCode appearance="message">ok</InlineCode>,{" "}
            <InlineCode appearance="message">pnpm test</InlineCode>, medium{" "}
            <InlineCode appearance="message">useMentionChip(message)</InlineCode>, and one that
            cannot fit on a line:{" "}
            <InlineCode appearance="message">{`sha256:${HASH}${HASH}`}</InlineCode>. Then chips and
            code alternate: {self} <InlineCode appearance="message">1</InlineCode> {task}{" "}
            <InlineCode appearance="message">2</InlineCode> {channel}{" "}
            <InlineCode appearance="message">3</InlineCode> {thread}{" "}
            <InlineCode appearance="message">4</InlineCode> {other}, and the sentence keeps going so
            the wrapped lines show whether <strong>bold {self}</strong>, <em>italic {channel}</em>{" "}
            and <InlineCode appearance="message">code</InlineCode> all sit on the same baseline as
            plain words.
          </MarkdownParagraph>
          <MarkdownBlockquote>
            <MarkdownParagraph>
              Quoted: {other} asked about {task} in {channel}.
            </MarkdownParagraph>
          </MarkdownBlockquote>
          <MarkdownList>
            <MarkdownListItem>
              List item with {other} and {task}
            </MarkdownListItem>
            <MarkdownListItem>
              List item with {thread} and <InlineCode appearance="message">code</InlineCode>
            </MarkdownListItem>
          </MarkdownList>
          <MarkdownParagraph>
            中文混排：{self} 请看一下 {task}，相关讨论在 {channel} 和 {thread}，代码里是{" "}
            <InlineCode appearance="message">useMentionChip()</InlineCode>，原始消息见 {link}。
            {other} 也请留意。
          </MarkdownParagraph>
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
