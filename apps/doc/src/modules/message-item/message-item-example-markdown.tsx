import type { ReactNode } from "react";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageMarkdown,
  MessageReferenceChannel,
  MessageReferenceTask,
  MessageReferenceThread,
} from "raft-ui/wip";
import {
  MessageMentionReferenceComposition,
  MessagePermalinkReferenceComposition,
  MessageSelfMentionReferenceComposition,
} from "./compositions/content.compositions.tsx";

type ExampleMarkdownProps = {
  portalContainer?: HTMLElement | null;
};

function preventNav(event: { preventDefault: () => void }) {
  event.preventDefault();
}

function ExampleMention({
  children,
  portalContainer,
}: {
  children: ReactNode;
  portalContainer?: HTMLElement | null;
}) {
  return (
    <MessageMentionReferenceComposition
      href="#atlas"
      portalContainer={portalContainer}
      preview={<p>Atlas · Design-system agent</p>}
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
      href="#you"
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
        mentions, and <a href="https://example.com/docs">docs links</a> stay caller-owned.
      </p>
      <p>
        <ExampleSelfMention portalContainer={portalContainer}>@you</ExampleSelfMention> tracked{" "}
        <MessageReferenceTask href="#task-141" onClick={preventNav}>
          #141
        </MessageReferenceTask>{" "}
        in{" "}
        <MessageReferenceChannel href="#release-notes" onClick={preventNav}>
          #release-notes
        </MessageReferenceChannel>{" "}
        and linked{" "}
        <MessageReferenceThread href="#release-notes-final" onClick={preventNav}>
          #release-notes:final
        </MessageReferenceThread>
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
        <MessageReferenceChannel href="#design-system" onClick={preventNav}>
          #design-system
        </MessageReferenceChannel>
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
          <MessageReferenceTask href="#task-97" onClick={preventNav}>
            #97
          </MessageReferenceTask>{" "}
          before the{" "}
          <MessagePermalinkReferenceComposition href="#message-222">
            message #222
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
        <MessageReferenceThread href="#layout-thread" onClick={preventNav}>
          #layout:thread
        </MessageReferenceThread>
        :
      </p>
      <blockquote>Compact rows should read as one thread, not a new speaker.</blockquote>
      <MessageCodeBlock>
        <code>{"<MessageItem compact>\n  <MessageItemGutter />\n</MessageItem>"}</code>
      </MessageCodeBlock>
    </MessageMarkdown>
  );
}
