import { createFileRoute, redirect } from "@tanstack/react-router";

import { PlaygroundChannelPanel } from "#/playground/conversation/playground-channel-panel.tsx";
import {
  DEFAULT_CHANNEL_ID,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundDmId,
  isPlaygroundRoomChannelId,
} from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/s/$serverSlug/channel/$channelId")({
  beforeLoad: ({ params, search }) => {
    if (isPlaygroundDmId(params.channelId)) {
      throw redirect({
        to: "/playground/s/$serverSlug/dm/$dmId",
        params: { dmId: params.channelId, serverSlug: params.serverSlug },
        search,
        replace: true,
      });
    }

    if (!isPlaygroundRoomChannelId(params.channelId)) {
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

  if (!isPlaygroundRoomChannelId(channelId)) {
    return null;
  }

  const channel = getPlaygroundChannel(channelId);

  return channel.kind === "dm" ? null : <PlaygroundChannelPanel channel={channel} />;
}
