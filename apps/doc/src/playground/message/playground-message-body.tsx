import type { Components, Options } from "react-markdown";
import { useMemo } from "react";
import { TaskChip } from "raft-ui";
import { MessageReferenceChip, MessageReferenceText } from "raft-ui/wip";
import { MessageMarkdownAdapter } from "#/lib/message-markdown/message-markdown-adapter.tsx";

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

type MarkdownNode = {
  children?: MarkdownNode[];
  data?: {
    hProperties?: {
      dataMarkdownReference?: string;
    };
  };
  type: string;
  url?: string;
  value?: string;
};

type PlaygroundReference =
  | { kind: "channel"; name: string; shortId?: string }
  | { kind: "mention"; name: string }
  | { kind: "task"; number: string };

function conversationHref(channelId: string) {
  const kind = isPlaygroundDmId(channelId) ? "dm" : "channel";
  return `/playground/s/${PLAYGROUND_SERVER_SLUG}/${kind}/${encodeURIComponent(channelId)}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildReferencePattern() {
  const channelAlt = CHANNEL_NAMES.map(escapeRegExp).join("|");
  const actorAlt = ACTOR_NAMES.map(escapeRegExp).join("|");
  // Threads before bare channels, then task references and @mentions.
  return new RegExp(
    `#(${channelAlt})(?::([a-z0-9-]+))?|task\\s+#(\\d+)|#(\\d+)|@(${actorAlt})`,
    "gi",
  );
}

const REFERENCE_PATTERN = buildReferencePattern();

function serializeReference(reference: PlaygroundReference) {
  const params = new URLSearchParams();
  params.set("kind", reference.kind);

  if (reference.kind === "task") {
    params.set("number", reference.number);
  } else {
    params.set("name", reference.name);
    if (reference.kind === "channel" && reference.shortId) {
      params.set("shortId", reference.shortId);
    }
  }

  return params.toString();
}

function referenceFromMatch(match: RegExpExecArray): PlaygroundReference {
  const [, channelName, shortId, taskWithKeyword, bareTask, mentionName] = match;

  if (mentionName !== undefined) return { kind: "mention", name: mentionName };
  if (taskWithKeyword !== undefined || bareTask !== undefined) {
    return { kind: "task", number: taskWithKeyword ?? bareTask };
  }
  return { kind: "channel", name: channelName, shortId };
}

function transformTextNode(value: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  const pattern = new RegExp(REFERENCE_PATTERN.source, REFERENCE_PATTERN.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }

    nodes.push({
      type: "link",
      children: [{ type: "text", value: match[0] }],
      data: {
        hProperties: {
          dataMarkdownReference: serializeReference(referenceFromMatch(match)),
        },
      },
      url: "#",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }

  return nodes.length > 0 ? nodes : [{ type: "text", value }];
}

function transformReferences(parent: MarkdownNode) {
  if (!parent.children) return;

  const children: MarkdownNode[] = [];
  for (const child of parent.children) {
    if (child.type === "text" && child.value !== undefined) {
      children.push(...transformTextNode(child.value));
      continue;
    }

    if (
      !["link", "linkReference", "definition", "inlineCode", "code", "html"].includes(child.type)
    ) {
      transformReferences(child);
    }
    children.push(child);
  }
  parent.children = children;
}

function remarkPlaygroundReferences() {
  return (tree: MarkdownNode) => {
    transformReferences(tree);
  };
}

const PLAYGROUND_REMARK_PLUGINS: NonNullable<Options["remarkPlugins"]> = [
  remarkPlaygroundReferences,
];

function parseReferenceMarker(marker: unknown): PlaygroundReference | undefined {
  if (typeof marker !== "string") return undefined;

  const params = new URLSearchParams(marker);
  const kind = params.get("kind");

  if (kind === "task") {
    const number = params.get("number");
    return number ? { kind, number } : undefined;
  }

  if (kind === "mention") {
    const name = params.get("name");
    return name ? { kind, name } : undefined;
  }

  if (kind === "channel") {
    const name = params.get("name");
    return name ? { kind, name, shortId: params.get("shortId") ?? undefined } : undefined;
  }

  return undefined;
}

function createPlaygroundMarkdownComponents(channelId?: string): Components {
  return {
    a: ({ node, href, children, ...props }) => {
      const reference = parseReferenceMarker(node?.properties?.dataMarkdownReference);

      if (!reference) {
        return (
          <a {...props} href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }

      if (reference.kind === "mention") {
        const actor = ACTORS_BY_NAME.get(reference.name.toLocaleLowerCase());
        if (!actor) return <>{children}</>;

        if (actor.id === VIEWER_ACTOR_ID) {
          return (
            <MessageReferenceChip tone="primary" title={`${actor.name} · ${actor.meta}`}>
              {children}
            </MessageReferenceChip>
          );
        }

        return (
          <MessageReferenceText title={`${actor.name} · ${actor.meta}`}>
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
            tone="info"
            render={
              <a href={`${conversationHref(channel.id)}?thread=${encodeURIComponent(threadId)}`} />
            }
          >
            {children}
          </MessageReferenceChip>
        );
      }

      return (
        <MessageReferenceChip tone="accent" render={<a href={conversationHref(channel.id)} />}>
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
    <MessageMarkdownAdapter
      source={content}
      additionalRemarkPlugins={PLAYGROUND_REMARK_PLUGINS}
      components={components}
    />
  );
}
