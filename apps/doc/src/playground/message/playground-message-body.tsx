import { Fragment, type ReactNode } from "react";
import { TaskChip } from "raft-ui";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageMarkdown,
  MessageReferenceChip,
  MessageReferenceText,
} from "raft-ui/wip";

import {
  getPlaygroundThread,
  isPlaygroundDmId,
  isPlaygroundThreadId,
  PLAYGROUND_ACTORS,
  PLAYGROUND_CHANNELS,
  PLAYGROUND_SERVER_SLUG,
  PLAYGROUND_TASKS,
} from "../mock/index.ts";

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

const CHANNELS_BY_NAME = new Map(
  PLAYGROUND_CHANNELS.map((channel) => [channel.name.toLocaleLowerCase(), channel]),
);

function conversationHref(channelId: string) {
  const kind = isPlaygroundDmId(channelId) ? "dm" : "channel";
  return `/playground/s/${PLAYGROUND_SERVER_SLUG}/${kind}/${encodeURIComponent(channelId)}`;
}

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

function renderInlineText(text: string, keyPrefix: string, channelId?: string): ReactNode[] {
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
          <MessageReferenceChip key={key} tone="primary" title={`${actor.name} · ${actor.meta}`}>
            {label}
          </MessageReferenceChip>,
        );
      } else {
        nodes.push(
          <MessageReferenceText key={key} title={`${actor?.name} · ${actor?.meta}`}>
            {label}
          </MessageReferenceText>,
        );
      }
    } else if (taskWithKeyword !== undefined || bareTask !== undefined) {
      const taskNumber = taskWithKeyword ?? bareTask;
      const task = channelId
        ? PLAYGROUND_TASKS.find(
            (candidate) =>
              candidate.channelId === channelId && candidate.number === Number(taskNumber),
          )
        : undefined;
      if (!task) {
        nodes.push(full);
      } else {
        const threadId = task.sourceMessageId ?? task.id;
        const href = `${conversationHref(task.channelId)}?thread=${encodeURIComponent(threadId)}&from=tasks`;
        nodes.push(
          <TaskChip key={key} status={task.status} render={<a href={href} />}>
            #{taskNumber}
          </TaskChip>,
        );
      }
    } else if (full.startsWith("#")) {
      const channelMatch = full.match(/^#([^:]+)(?::(.+))?$/);
      const channelName = channelMatch?.[1] ?? full.slice(1);
      const shortId = threadShortId ?? channelMatch?.[2];
      const channel = CHANNELS_BY_NAME.get(channelName.toLocaleLowerCase());
      if (!channel) {
        nodes.push(full);
      } else if (shortId) {
        const threadId = `${channel.id}:${shortId}`;
        const thread = isPlaygroundThreadId(threadId) ? getPlaygroundThread(threadId) : undefined;
        if (!thread) {
          nodes.push(full);
        } else {
          nodes.push(
            <MessageReferenceChip
              key={key}
              tone="info"
              render={
                <a
                  href={`${conversationHref(channel.id)}?thread=${encodeURIComponent(threadId)}`}
                />
              }
            >
              #{channelName}:{shortId}
            </MessageReferenceChip>,
          );
        }
      } else {
        nodes.push(
          <MessageReferenceChip
            key={key}
            tone="accent"
            render={<a href={conversationHref(channel.id)} />}
          >
            #{channelName}
          </MessageReferenceChip>,
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

function renderTextBlocks(text: string, channelId?: string): ReactNode {
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
              {renderInlineText(
                line.replace(/^\s*[-*]\s+/, ""),
                `ul:${blockIndex}:${lineIndex}`,
                channelId,
              )}
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
              {renderInlineText(
                line.replace(/^\s*\d+\.\s+/, ""),
                `ol:${blockIndex}:${lineIndex}`,
                channelId,
              )}
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
            {renderInlineText(line, `p:${blockIndex}:${lineIndex}`, channelId)}
          </Fragment>
        ))}
      </p>
    );
  });
}

function renderBlocks(content: string, channelId?: string): ReactNode {
  const segments = content.split(/(```[\s\S]*?```)/g);
  let characterOffset = 0;
  return segments.map((segment) => {
    const segmentOffset = characterOffset;
    characterOffset += segment.length;
    const fence = segment.match(/^```(?:\w+)?\n?([\s\S]*?)```$/);
    if (fence) {
      return (
        <MessageCodeBlock key={`code:${segmentOffset}`}>
          <code>{fence[1].replace(/\n$/, "")}</code>
        </MessageCodeBlock>
      );
    }
    return (
      <Fragment key={`text:${segmentOffset}`}>{renderTextBlocks(segment, channelId)}</Fragment>
    );
  });
}

/** Playground message body: MessageMarkdown + @/#/` chips from plain fixture strings. */
export function PlaygroundMessageBody({
  channelId,
  content,
}: {
  channelId?: string;
  content: string;
}) {
  return <MessageMarkdown>{renderBlocks(content, channelId)}</MessageMarkdown>;
}
