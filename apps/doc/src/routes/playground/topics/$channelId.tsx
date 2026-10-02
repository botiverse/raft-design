import { createFileRoute, redirect } from "@tanstack/react-router";

import { PlaygroundTopicChannelPanel } from "#/playground/topics/topic-channel-panel.tsx";
import {
  DEFAULT_TOPIC_CHANNEL_ID,
  getPlaygroundTopicChannel,
  getPlaygroundTopicChannelId,
  isPlaygroundTopicChannelId,
} from "#/playground/mock/index.ts";

type PlaygroundTopicChannelSearch = {
  /** Topic open in the side panel. Topics created during the session are not in the mock. */
  topic?: string;
};

export const Route = createFileRoute("/playground/topics/$channelId")({
  validateSearch: (search: Record<string, unknown>): PlaygroundTopicChannelSearch =>
    typeof search.topic === "string" && search.topic.length > 0 ? { topic: search.topic } : {},
  beforeLoad: ({ params, search }) => {
    if (!isPlaygroundTopicChannelId(params.channelId)) {
      throw redirect({
        to: "/playground/topics/$channelId",
        params: { channelId: DEFAULT_TOPIC_CHANNEL_ID },
        search: {},
        replace: true,
      });
    }

    const topicChannelId = search.topic ? getPlaygroundTopicChannelId(search.topic) : undefined;
    if (topicChannelId && topicChannelId !== params.channelId) {
      throw redirect({
        to: "/playground/topics/$channelId",
        params: { channelId: params.channelId },
        search: {},
        replace: true,
      });
    }
  },
  component: PlaygroundTopicChannelRoute,
});

function PlaygroundTopicChannelRoute() {
  const { channelId } = Route.useParams();
  const { topic } = Route.useSearch();

  if (!isPlaygroundTopicChannelId(channelId)) return null;

  return (
    <PlaygroundTopicChannelPanel
      key={channelId}
      activeTopicId={topic}
      channel={getPlaygroundTopicChannel(channelId)}
    />
  );
}
