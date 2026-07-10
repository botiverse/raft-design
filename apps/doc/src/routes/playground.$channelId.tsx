import { createFileRoute, redirect } from "@tanstack/react-router";

import { PlaygroundMainPanel } from "#/playground/playground-main-panel.tsx";
import {
  DEFAULT_CHANNEL_ID,
  PLAYGROUND_CHANNELS,
  isPlaygroundChannelId,
} from "#/playground/mock-data.ts";

export const Route = createFileRoute("/playground/$channelId")({
  beforeLoad: ({ params, search }) => {
    if (!isPlaygroundChannelId(params.channelId)) {
      throw redirect({
        to: "/playground/$channelId",
        params: { channelId: DEFAULT_CHANNEL_ID },
        search,
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

  const channel = PLAYGROUND_CHANNELS[channelId];

  return <PlaygroundMainPanel channel={channel} />;
}
