import { createFileRoute, redirect } from "@tanstack/react-router";

import { PlaygroundConversationPanel } from "#/playground/playground-conversation-panel.tsx";
import {
  DEFAULT_CHANNEL_ID,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundChannelId,
} from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/s/$serverSlug/channel/$channelId")({
  beforeLoad: ({ params, search }) => {
    if (!isPlaygroundChannelId(params.channelId)) {
      throw redirect({
        to: "/playground/s/$serverSlug/channel/$channelId",
        params: { channelId: DEFAULT_CHANNEL_ID, serverSlug: params.serverSlug },
        search: {},
      });
    }

    const threadContext = search.thread ? getPlaygroundThread(search.thread) : undefined;
    if (threadContext && threadContext.channelId !== params.channelId) {
      throw redirect({
        to: "/playground/s/$serverSlug/channel/$channelId",
        params: { channelId: params.channelId, serverSlug: params.serverSlug },
        search: {},
        replace: true,
      });
    }
  },
  component: PlaygroundChannelRoute,
});

function PlaygroundChannelRoute() {
  const { channelId } = Route.useParams();

  if (!isPlaygroundChannelId(channelId)) {
    return null;
  }

  const channel = getPlaygroundChannel(channelId);

  return <PlaygroundConversationPanel channel={channel} />;
}
