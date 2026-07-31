import { createFileRoute, redirect } from "@tanstack/react-router";

import { PlaygroundChannelPanel } from "#/playground/conversation/playground-channel-panel.tsx";
import { getPlaygroundSidePanelOwner } from "#/playground/navigation/playground-search.ts";
import {
  DEFAULT_CHANNEL_ID,
  getPlaygroundChannel,
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

    const hasSidePanelSearch = Boolean(search.thread || search.legacyTask);
    const sidePanelOwner = getPlaygroundSidePanelOwner(search);
    if (hasSidePanelSearch && sidePanelOwner !== params.channelId) {
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
