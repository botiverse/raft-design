import type { Components } from "react-markdown";
import { useMemo } from "react";
import { MarkdownLink, MessageReferenceChip, MessageReferenceText, TaskChip } from "raft-ui";
import { type MarkdownPluginList } from "#/lib/markdown/markdown-plugins.ts";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import { createRemarkReferences } from "#/lib/markdown/create-remark-references.ts";
import { markdownReferenceSanitizeSchema } from "#/lib/markdown/markdown-reference-sanitize-schema.ts";
import { parseMarkdownReference } from "#/lib/markdown/parse-markdown-reference.ts";

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

const ACTORS_BY_NAME = new Map(
  PLAYGROUND_ACTORS.map((actor) => [actor.name.toLocaleLowerCase(), actor]),
);

const CHANNELS_BY_NAME = new Map(
  PLAYGROUND_CHANNELS.map((channel) => [channel.name.toLocaleLowerCase(), channel]),
);

const PLAYGROUND_REMARK_PLUGINS: MarkdownPluginList = [
  createRemarkReferences({
    actorNames: PLAYGROUND_ACTORS.map((actor) => actor.name),
    channelNames: PLAYGROUND_CHANNELS.map((channel) => channel.name),
  }),
];

function conversationHref(channelId: string) {
  const kind = isPlaygroundDmId(channelId) ? "dm" : "channel";
  return `/playground/s/${PLAYGROUND_SERVER_SLUG}/${kind}/${encodeURIComponent(channelId)}`;
}

function createPlaygroundMarkdownComponents(channelId?: string): Components {
  return {
    a: ({ node, href, children, ...props }) => {
      const reference = parseMarkdownReference(node?.properties?.dataMarkdownReference);

      if (!reference) {
        return (
          <MarkdownLink {...props} href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </MarkdownLink>
        );
      }

      if (reference.kind === "mention") {
        const actor = ACTORS_BY_NAME.get(reference.name.toLocaleLowerCase());
        if (!actor) return <>{children}</>;

        return (
          <MessageReferenceText
            variant={actor.id === VIEWER_ACTOR_ID ? "primary" : "secondary"}
            title={`${actor.name} · ${actor.meta}`}
          >
            {children}
          </MessageReferenceText>
        );
      }

      if (reference.kind === "task") {
        const task = channelId
          ? PLAYGROUND_TASKS.find(
              (candidate) =>
                candidate.channelId === channelId && candidate.number === Number(reference.number),
            )
          : undefined;
        if (!task) return <>{children}</>;

        const threadId = task.sourceMessageId ?? task.id;
        const href = `${conversationHref(task.channelId)}?thread=${encodeURIComponent(threadId)}&from=tasks`;
        return (
          <TaskChip status={task.status} render={<a href={href} />}>
            #{reference.number}
          </TaskChip>
        );
      }

      const channel = CHANNELS_BY_NAME.get(reference.name.toLocaleLowerCase());
      if (!channel) return <>{children}</>;

      if (reference.shortId) {
        const threadId = `${channel.id}:${reference.shortId}`;
        const thread = isPlaygroundThreadId(threadId) ? getPlaygroundThread(threadId) : undefined;
        if (!thread) return <>{children}</>;

        return (
          <MessageReferenceChip
            variant="info"
            render={
              <a href={`${conversationHref(channel.id)}?thread=${encodeURIComponent(threadId)}`} />
            }
          >
            {children}
          </MessageReferenceChip>
        );
      }

      return (
        <MessageReferenceChip variant="accent" render={<a href={conversationHref(channel.id)} />}>
          {children}
        </MessageReferenceChip>
      );
    },
  };
}

/** Full GFM message body with Playground-owned @mention, channel, thread, and task references. */
export function PlaygroundMessageBody({
  channelId,
  content,
}: {
  channelId?: string;
  content: string;
}) {
  const components = useMemo(() => createPlaygroundMarkdownComponents(channelId), [channelId]);

  return (
    <Markdown
      additionalRemarkPlugins={PLAYGROUND_REMARK_PLUGINS}
      components={components}
      sanitizeSchema={markdownReferenceSanitizeSchema}
    >
      {content}
    </Markdown>
  );
}
