import type { Components } from "react-markdown";
import { Children, useMemo, type ReactNode } from "react";
import { Hash, MessagesSquare } from "lucide-react";
import {
  MarkdownInlineCode,
  MarkdownLink,
  MarkdownParagraph,
  MessageItemSearchMatch,
  MessageReferenceBadge,
  MessageReferenceChip,
  MessageReferenceIndicator,
  MessageReferenceLabel,
  MessageReferenceText,
  Status,
  TaskChip,
  TaskStatusIcon,
} from "raft-ui";
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
  type PlaygroundActorId,
  type PlaygroundMentionReadState,
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

function highlightSearchMatch(text: string, query: string): ReactNode {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return text;

  const parts: ReactNode[] = [];
  const normalizedText = text.toLocaleLowerCase();
  let cursor = 0;
  let matchIndex = normalizedText.indexOf(normalizedQuery);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) parts.push(text.slice(cursor, matchIndex));
    const matchEnd = matchIndex + normalizedQuery.length;
    parts.push(
      <MessageItemSearchMatch key={`${matchIndex}-${matchEnd}`}>
        {text.slice(matchIndex, matchEnd)}
      </MessageItemSearchMatch>,
    );
    cursor = matchEnd;
    matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
  }

  if (cursor === 0) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function highlightSearchChildren(children: ReactNode, query: string): ReactNode {
  return Children.map(children, (child) =>
    typeof child === "string" ? highlightSearchMatch(child, query) : child,
  );
}

function createPlaygroundMarkdownComponents(
  channelId?: string,
  searchQuery?: string,
  mentionReadStates?: Readonly<Partial<Record<PlaygroundActorId, PlaygroundMentionReadState>>>,
): Components {
  return {
    p: ({ node: _node, children, ...props }) => (
      <MarkdownParagraph {...props}>
        {searchQuery
          ? Children.map(children, (child) =>
              typeof child === "string" ? highlightSearchMatch(child, searchQuery) : child,
            )
          : children}
      </MarkdownParagraph>
    ),
    code: ({ node: _node, className, children, ...props }) => (
      <MarkdownInlineCode className={className} {...props}>
        {className || !searchQuery ? children : highlightSearchChildren(children, searchQuery)}
      </MarkdownInlineCode>
    ),
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
        const mentionReadState = actor.type === "agent" ? mentionReadStates?.[actor.id] : undefined;
        const mentionReadLabel = mentionReadState === "read" ? "Read" : "Not read yet";

        return (
          <MessageReferenceText
            variant={actor.id === VIEWER_ACTOR_ID ? "primary" : "secondary"}
            title={`${actor.name} · ${actor.meta}`}
          >
            {children}
            {mentionReadState ? (
              <MessageReferenceIndicator title={mentionReadLabel}>
                <Status
                  aria-label={mentionReadLabel}
                  size="sm"
                  variant={mentionReadState === "read" ? "success" : "default"}
                />
              </MessageReferenceIndicator>
            ) : null}
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
          <TaskChip
            variant="inline"
            status={task.status}
            render={<a href={href} aria-label={`Open task #${reference.number}`} />}
          >
            <TaskStatusIcon status={task.status} />#{reference.number}
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
              <a
                href={`${conversationHref(channel.id)}?thread=${encodeURIComponent(threadId)}`}
                aria-label={`Open thread in #${channel.name}`}
              />
            }
          >
            <MessageReferenceBadge>thread</MessageReferenceBadge>
            <MessagesSquare />
            <MessageReferenceLabel>{channel.name}</MessageReferenceLabel>
          </MessageReferenceChip>
        );
      }

      return (
        <MessageReferenceChip
          variant="accent"
          render={<a href={conversationHref(channel.id)} aria-label={`Open #${channel.name}`} />}
        >
          <MessageReferenceBadge>channel</MessageReferenceBadge>
          <Hash />
          <MessageReferenceLabel>{channel.name}</MessageReferenceLabel>
        </MessageReferenceChip>
      );
    },
  };
}

/** Full GFM message body with Playground-owned @mention, channel, thread, and task references. */
export function PlaygroundMessageBody({
  channelId,
  content,
  mentionReadStates,
  searchQuery,
}: {
  channelId?: string;
  content: string;
  mentionReadStates?: Readonly<Partial<Record<PlaygroundActorId, PlaygroundMentionReadState>>>;
  searchQuery?: string;
}) {
  const components = useMemo(
    () => createPlaygroundMarkdownComponents(channelId, searchQuery, mentionReadStates),
    [channelId, mentionReadStates, searchQuery],
  );

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
