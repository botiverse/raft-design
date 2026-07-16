import { createFileRoute, redirect } from "@tanstack/react-router";

import { PlaygroundDmPanel } from "#/playground/playground-dm-panel.tsx";
import {
  DEFAULT_CHANNEL_ID,
  getPlaygroundDirectMessage,
  getPlaygroundThread,
  isPlaygroundDmId,
} from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/s/$serverSlug/dm/$dmId")({
  beforeLoad: ({ params, search }) => {
    if (!isPlaygroundDmId(params.dmId)) {
      throw redirect({
        to: "/playground/s/$serverSlug/channel/$channelId",
        params: { channelId: DEFAULT_CHANNEL_ID, serverSlug: params.serverSlug },
        search: {},
      });
    }

    const threadContext = search.thread ? getPlaygroundThread(search.thread) : undefined;
    if (threadContext && threadContext.channelId !== params.dmId) {
      throw redirect({
        to: "/playground/s/$serverSlug/dm/$dmId",
        params: { dmId: params.dmId, serverSlug: params.serverSlug },
        search: {},
        replace: true,
      });
    }
  },
  component: PlaygroundDmRoute,
});

function PlaygroundDmRoute() {
  const { dmId } = Route.useParams();

  if (!isPlaygroundDmId(dmId)) {
    return null;
  }

  return <PlaygroundDmPanel dm={getPlaygroundDirectMessage(dmId)} />;
}
