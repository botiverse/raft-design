import type { ReactNode } from "react";
import { TaskChip } from "raft-ui";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageMarkdown,
  MessageReference,
} from "raft-ui/wip";
import {
  MessageMentionReferenceComposition,
  MessagePermalinkReferenceComposition,
  MessageSelfMentionReferenceComposition,
} from "./compositions/content.compositions.tsx";
import { MESSAGE_PLAYGROUND_URLS } from "./message-item.fixtures.ts";

type ExampleMarkdownProps = {
  portalContainer?: HTMLElement | null;
};

function ExampleMention({
  children,
  portalContainer,
}: {
  children: ReactNode;
  portalContainer?: HTMLElement | null;
}) {
  return (
    <MessageMentionReferenceComposition
      portalContainer={portalContainer}
      preview={<p>Atlas · owner</p>}
    >
      {children}
    </MessageMentionReferenceComposition>
  );
}

function ExampleSelfMention({
  children,
  portalContainer,
}: {
  children: ReactNode;
  portalContainer?: HTMLElement | null;
}) {
  return (
    <MessageSelfMentionReferenceComposition
      portalContainer={portalContainer}
      preview={<p>You · Current workspace member</p>}
    >
      {children}
    </MessageSelfMentionReferenceComposition>
  );
}

/** Compact markdown used by MessageItem docs examples (not the full catalog). */
export function MessageItemExampleMarkdown({ portalContainer }: ExampleMarkdownProps = {}) {
  return (
    <MessageMarkdown>
      <p>
        Ask <ExampleMention portalContainer={portalContainer}>@Atlas</ExampleMention> to ship the{" "}
        <strong>token fixture</strong> pass — <MessageInlineCode>layer-panel</MessageInlineCode>,
        mentions, and{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a">docs links</a> stay
        caller-owned.
      </p>
      <p>
        <ExampleSelfMention portalContainer={portalContainer}>@you</ExampleSelfMention> tracked{" "}
        <TaskChip status="in_progress" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
          #21
        </TaskChip>{" "}
        in{" "}
        <MessageReference
          variant="conversation"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel} />}
        >
          #release-notes
        </MessageReference>{" "}
        and linked{" "}
        <MessageReference
          variant="conversation"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
        >
          #release-notes:reply
        </MessageReference>
        .
      </p>
      <ul>
        <li>
          Keep body content in <MessageInlineCode>MessageItemBody</MessageInlineCode>
        </li>
        <li>
          Prefer <del>ad-hoc spans</del> semantic markdown + reference parts
        </li>
      </ul>
    </MessageMarkdown>
  );
}

export function MessageItemExampleMarkdownLead({ portalContainer }: ExampleMarkdownProps = {}) {
  return (
    <MessageMarkdown>
      <p>
        <ExampleMention portalContainer={portalContainer}>@Atlas</ExampleMention> starting a short
        sequence — first the <strong>layout pass</strong>, then gutter clock polish for{" "}
        <MessageReference
          variant="conversation"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel} />}
        >
          #release-notes
        </MessageReference>
        .
      </p>
    </MessageMarkdown>
  );
}

export function MessageItemExampleMarkdownFollowUp({ portalContainer }: ExampleMarkdownProps = {}) {
  return (
    <MessageMarkdown>
      <p>
        <ExampleSelfMention portalContainer={portalContainer}>@you</ExampleSelfMention> — the second
        row keeps only its timestamp in the gutter, with a quick{" "}
        <MessageInlineCode>HH:MM</MessageInlineCode> hover clock.
      </p>
      <ol>
        <li>
          Align the gutter to the <strong>avatar column</strong>
        </li>
        <li>
          Land{" "}
          <TaskChip
            status="in_progress"
            render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
          >
            #21
          </TaskChip>{" "}
          before the{" "}
          <MessagePermalinkReferenceComposition href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage}>
            #all
          </MessagePermalinkReferenceComposition>{" "}
          rollout
        </li>
      </ol>
    </MessageMarkdown>
  );
}

export function MessageItemExampleMarkdownClosing({ portalContainer }: ExampleMarkdownProps = {}) {
  return (
    <MessageMarkdown>
      <p>
        Final note for <ExampleMention portalContainer={portalContainer}>@Atlas</ExampleMention> in{" "}
        <MessageReference
          variant="conversation"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
        >
          #release-notes:reply
        </MessageReference>
        :
      </p>
      <blockquote>Compact rows should read as one thread, not a new speaker.</blockquote>
      <MessageCodeBlock>
        <code>{"<MessageItem compact>\n  <MessageItemGutter />\n</MessageItem>"}</code>
      </MessageCodeBlock>
    </MessageMarkdown>
  );
}
