import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrutalOnly } from "raft-ui";

import { BrutalSearchPanelComposition } from "#/modules/search/compositions/brutal-search-panel.composition.tsx";
import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchMessageFixture,
  SearchSenderFixture,
} from "#/modules/search/search.fixtures.ts";

import {
  PLAYGROUND_ACTORS,
  PLAYGROUND_CHANNELS,
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_MACHINES,
  PLAYGROUND_SERVER_SLUG,
  isPlaygroundChannelId,
  isPlaygroundDmId,
  isPlaygroundThreadId,
  type PlaygroundMessage,
} from "../mock/index.ts";
import { PLAYGROUND_CONVERSATIONS } from "../mock/conversations.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PLAYGROUND_SEARCH_FOCUS_EVENT } from "./playground-search-focus.ts";

const PLAYGROUND_SEARCH_COMPUTERS: readonly SearchEntityFixture[] = PLAYGROUND_MACHINES.map(
  (machine) => ({
    key: `computer:${machine.id}`,
    type: "computer",
    title: machine.name,
    subtitle: { kind: "computer", hostname: null },
    fields: [{ value: machine.name, priority: 0 }],
    channelId: null,
    machineId: machine.id,
    agentId: null,
    userId: null,
  }),
);

const PLAYGROUND_SEARCH_SENDERS: readonly SearchSenderFixture[] = PLAYGROUND_ACTORS.map(
  (actor) => ({
    id: actor.id,
    kind: actor.type,
    label: actor.name,
    handle: actor.id,
    isCurrentUser: actor.id === "cuvii" || undefined,
  }),
);

const PLAYGROUND_SEARCH_CHANNELS: readonly SearchChannelFixture[] = PLAYGROUND_CHANNELS.map(
  (channel) => ({
    id: channel.id,
    kind: channel.kind === "dm" ? "dm" : "channel",
    name: channel.name,
    archivedAt: channel.archived ? "2026-05-01T08:00:00.000Z" : undefined,
  }),
);

const channelEntities: readonly SearchEntityFixture[] = PLAYGROUND_CHANNELS.filter(
  (channel) => channel.kind !== "dm",
).map((channel) => ({
  key: `channel:${channel.id}`,
  type: "channel",
  title: channel.name,
  subtitle: { kind: "channel" },
  fields: [
    { value: channel.name, priority: 0 },
    { value: channel.subtitle, priority: 3 },
  ],
  channelId: channel.id,
  machineId: null,
  agentId: null,
  userId: null,
  archivedAt: channel.archived ? "2026-05-01T08:00:00.000Z" : undefined,
}));

const actorEntities: readonly SearchEntityFixture[] = PLAYGROUND_ACTORS.map((actor) => ({
  key: `${actor.type === "agent" ? "agent" : "human"}:${actor.id}`,
  type: actor.type === "agent" ? "agentDm" : "humanDm",
  title: actor.name,
  subtitle:
    actor.id === "cuvii"
      ? { kind: "selfDm" }
      : actor.type === "agent"
        ? { kind: "text", text: `@${actor.id}` }
        : "description" in actor && actor.description
          ? { kind: "text", text: actor.description }
          : { kind: "text", text: actor.meta },
  fields: [
    { value: actor.name, priority: 0 },
    { value: actor.id, priority: 1 },
    {
      value: `${actor.meta} ${"presence" in actor ? actor.presence : ""}`,
      priority: 3,
    },
  ],
  channelId:
    PLAYGROUND_DIRECT_MESSAGES.find((channel) => channel.otherActorId === actor.id)?.id ?? null,
  machineId: null,
  agentId: actor.type === "agent" ? actor.id : null,
  userId: actor.type === "human" ? actor.id : null,
}));

const PLAYGROUND_SEARCH_ENTITIES: readonly SearchEntityFixture[] = [
  ...channelEntities,
  ...actorEntities,
  ...PLAYGROUND_SEARCH_COMPUTERS,
];

const SEARCH_DATE_BASE = Date.parse("2026-05-30T12:00:00.000Z");

function toSearchMessage(
  channelId: string,
  message: PlaygroundMessage,
  sequence: number,
  thread?: {
    id: string;
    parentMessageId: string;
    parentMessageContent: string;
  },
): SearchMessageFixture {
  const normalizedBody = message.content.toLocaleLowerCase();
  return {
    id: message.id,
    channelId,
    senderId: message.senderId,
    content: message.content,
    createdAt:
      message.createdAtDateTime ??
      new Date(SEARCH_DATE_BASE - sequence * 11 * 60 * 1000).toISOString(),
    mentions: normalizedBody.includes("cuvii") ? ["cuvii"] : [],
    threadId: thread?.id ?? null,
    parentMessageId: thread?.parentMessageId ?? null,
    parentMessageContent: thread?.parentMessageContent ?? null,
  };
}

function buildSearchMessages(): readonly SearchMessageFixture[] {
  let sequence = 0;
  const messages: SearchMessageFixture[] = [];

  for (const {
    conversation: channel,
    messages: conversationMessages,
    threads,
  } of PLAYGROUND_CONVERSATIONS) {
    const threadMessageIds = new Set(
      threads.flatMap((thread) => [thread.parent.id, ...thread.replies.map((reply) => reply.id)]),
    );

    for (const message of conversationMessages) {
      if (threadMessageIds.has(message.id)) continue;
      messages.push(toSearchMessage(channel.id, message, sequence++));
    }

    for (const thread of threads) {
      const threadFixture = {
        id: thread.parent.id,
        parentMessageId: thread.parent.id,
        parentMessageContent: thread.parent.content,
      };
      messages.push(toSearchMessage(channel.id, thread.parent, sequence++, threadFixture));
      for (const reply of thread.replies) {
        messages.push(toSearchMessage(channel.id, reply, sequence++, threadFixture));
      }
    }
  }

  return messages;
}

const PLAYGROUND_SEARCH_MESSAGES = buildSearchMessages();

export function PlaygroundSearchPanel() {
  const navigate = useNavigate();
  const { selectRailView } = usePlaygroundNavigation();
  const [focusRequestKey, setFocusRequestKey] = useState(0);

  useEffect(() => {
    const requestFocus = () => setFocusRequestKey((current) => current + 1);
    window.addEventListener(PLAYGROUND_SEARCH_FOCUS_EVENT, requestFocus);
    return () => window.removeEventListener(PLAYGROUND_SEARCH_FOCUS_EVENT, requestFocus);
  }, []);

  return (
    <BrutalOnly>
      <BrutalSearchPanelComposition
        entities={PLAYGROUND_SEARCH_ENTITIES}
        messages={PLAYGROUND_SEARCH_MESSAGES}
        senders={PLAYGROUND_SEARCH_SENDERS}
        channels={PLAYGROUND_SEARCH_CHANNELS}
        defaultQuery=""
        focusRequestKey={focusRequestKey}
        onBack={() => selectRailView("chat")}
        onOpenEntity={(entity) => {
          if (entity.machineId) {
            void navigate({
              to: "/playground/computers",
              search: { detail: entity.machineId },
            });
            return;
          }

          const channelId = entity.channelId;
          if (!channelId || !isPlaygroundChannelId(channelId)) return;

          if (isPlaygroundDmId(channelId)) {
            void navigate({
              to: "/playground/s/$serverSlug/dm/$dmId",
              params: { dmId: channelId, serverSlug: PLAYGROUND_SERVER_SLUG },
              search: {},
            });
            return;
          }

          void navigate({
            to: "/playground/s/$serverSlug/channel/$channelId",
            params: { channelId, serverSlug: PLAYGROUND_SERVER_SLUG },
            search: {},
          });
        }}
        onOpenMessage={(message) => {
          if (!isPlaygroundChannelId(message.channelId)) return;
          const threadId = message.threadId;
          const search = threadId && isPlaygroundThreadId(threadId) ? { thread: threadId } : {};
          if (isPlaygroundDmId(message.channelId)) {
            void navigate({
              to: "/playground/s/$serverSlug/dm/$dmId",
              params: { dmId: message.channelId, serverSlug: PLAYGROUND_SERVER_SLUG },
              search,
            });
            return;
          }
          void navigate({
            to: "/playground/s/$serverSlug/channel/$channelId",
            params: { channelId: message.channelId, serverSlug: PLAYGROUND_SERVER_SLUG },
            search,
          });
        }}
      />
    </BrutalOnly>
  );
}
