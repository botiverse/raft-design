import { Fragment, type ReactNode } from "react";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageMarkdown,
  MessageReference,
} from "raft-ui/wip";

import { PLAYGROUND_ACTORS } from "../mock/actors.ts";
import { PLAYGROUND_CHANNELS } from "../mock/conversations.ts";

const VIEWER_ACTOR_ID = "cuvii";

const ACTOR_NAMES = [...PLAYGROUND_ACTORS]
  .map((actor) => actor.name)
  .sort((a, b) => b.length - a.length);

const CHANNEL_NAMES = [...PLAYGROUND_CHANNELS]
  .map((channel) => channel.name)
  .sort((a, b) => b.length - a.length);

const ACTORS_BY_NAME = new Map(
  PLAYGROUND_ACTORS.map((actor) => [actor.name.toLocaleLowerCase(), actor]),
);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildInlinePattern() {
  const channelAlt = CHANNEL_NAMES.map(escapeRegExp).join("|");
  const actorAlt = ACTOR_NAMES.map(escapeRegExp).join("|");
  // Threads (#chan:id) before bare channels; task #N / #N; @mentions; `code`.
  return new RegExp(
    `\\#(?:${channelAlt})(?::([a-z0-9-]+))?|task\\s+#(\\d+)|#(\\d+)|@(${actorAlt})|\`([^\`]+)\``,
    "gi",
  );
}

const INLINE_PATTERN = buildInlinePattern();

function renderInlineText(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(INLINE_PATTERN.source, INLINE_PATTERN.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}:${tokenIndex++}`;
    const [full, threadShortId, taskWithKeyword, bareTask, mentionName, inlineCode] = match;

    if (inlineCode !== undefined) {
      nodes.push(<MessageInlineCode key={key}>{inlineCode}</MessageInlineCode>);
    } else if (mentionName !== undefined) {
      const actor = ACTORS_BY_NAME.get(mentionName.toLocaleLowerCase());
      const label = `@${mentionName}`;
      if (actor?.id === VIEWER_ACTOR_ID) {
        nodes.push(
          <MessageReference key={key} variant="highlight" render={<a href="https://raft.build" />}>
            {label}
          </MessageReference>,
        );
      } else {
        nodes.push(
          <MessageReference key={key} variant="plain" render={<a href="https://raft.build" />}>
            {label}
          </MessageReference>,
        );
      }
    } else if (taskWithKeyword !== undefined || bareTask !== undefined) {
      const taskNumber = taskWithKeyword ?? bareTask;
      nodes.push(
        <MessageReference key={key} variant="muted" render={<a href="https://raft.build" />}>
          #{taskNumber}
        </MessageReference>,
      );
    } else if (full.startsWith("#")) {
      const channelMatch = full.match(/^#([^:]+)(?::(.+))?$/);
      const channelName = channelMatch?.[1] ?? full.slice(1);
      const shortId = threadShortId ?? channelMatch?.[2];
      if (shortId) {
        nodes.push(
          <MessageReference key={key} variant="info" render={<a href="https://raft.build" />}>
            #{channelName}:{shortId}
          </MessageReference>,
        );
      } else {
        nodes.push(
          <MessageReference key={key} variant="accent" render={<a href="https://raft.build" />}>
            #{channelName}
          </MessageReference>,
        );
      }
    } else {
      nodes.push(full);
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function renderTextBlocks(text: string): ReactNode {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const blocks = trimmed.split(/\n{2,}/);
  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n");
    const isUnordered = lines.every((line) => /^\s*[-*]\s+/.test(line));
    const isOrdered = lines.every((line) => /^\s*\d+\.\s+/.test(line));

    if (isUnordered) {
      return (
        <ul key={`ul:${blockIndex}`}>
          {lines.map((line, lineIndex) => (
            <li key={`li:${blockIndex}:${lineIndex}`}>
              {renderInlineText(line.replace(/^\s*[-*]\s+/, ""), `ul:${blockIndex}:${lineIndex}`)}
            </li>
          ))}
        </ul>
      );
    }

    if (isOrdered) {
      return (
        <ol key={`ol:${blockIndex}`}>
          {lines.map((line, lineIndex) => (
            <li key={`oli:${blockIndex}:${lineIndex}`}>
              {renderInlineText(line.replace(/^\s*\d+\.\s+/, ""), `ol:${blockIndex}:${lineIndex}`)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p key={`p:${blockIndex}`}>
        {lines.map((line, lineIndex) => (
          <Fragment key={`line:${blockIndex}:${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {renderInlineText(line, `p:${blockIndex}:${lineIndex}`)}
          </Fragment>
        ))}
      </p>
    );
  });
}

function renderBlocks(content: string): ReactNode {
  const segments = content.split(/(```[\s\S]*?```)/g);
  return segments.map((segment, index) => {
    const fence = segment.match(/^```(?:\w+)?\n?([\s\S]*?)```$/);
    if (fence) {
      return (
        <MessageCodeBlock key={`code:${index}`}>
          <code>{fence[1].replace(/\n$/, "")}</code>
        </MessageCodeBlock>
      );
    }
    return <Fragment key={`text:${index}`}>{renderTextBlocks(segment)}</Fragment>;
  });
}

/** Playground message body: MessageMarkdown + @/#/` chips from plain fixture strings. */
export function PlaygroundMessageBody({ content }: { content: string }) {
  return <MessageMarkdown>{renderBlocks(content)}</MessageMarkdown>;
}

/** Continuation gutter clock — 24h `HH:MM` (matches source `formatClock24`). */
export function playgroundGutterClock(createdAt: string): string {
  const match = createdAt.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return createdAt;
  let hours = Number(match[1]);
  const minutes = match[2]!;
  const period = match[3]?.toUpperCase();
  if (period === "AM") {
    if (hours === 12) hours = 0;
  } else if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}
