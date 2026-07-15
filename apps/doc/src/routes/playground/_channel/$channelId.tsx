import { createFileRoute, redirect } from "@tanstack/react-router";

import { PlaygroundMainPanel } from "#/playground/playground-main-panel.tsx";
import {
  DEFAULT_CHANNEL_ID,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundChannelId,
} from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/_channel/$channelId")({
  beforeLoad: ({ params, search }) => {
    if (!isPlaygroundChannelId(params.channelId)) {
      throw redirect({
        to: "/playground/$channelId",
        params: { channelId: DEFAULT_CHANNEL_ID },
        search: {},
      });
    }

    const threadContext = search.thread ? getPlaygroundThread(search.thread) : undefined;
    if (threadContext && threadContext.channelId !== params.channelId) {
      throw redirect({
        to: "/playground/$channelId",
        params: { channelId: params.channelId },
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

  return <PlaygroundMainPanel channel={channel} />;
}
