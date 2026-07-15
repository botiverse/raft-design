import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  DEFAULT_CHANNEL_ID,
  PLAYGROUND_SERVER_SLUG,
  isPlaygroundServerSlug,
} from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/s/$serverSlug")({
  beforeLoad: ({ params }) => {
    if (!isPlaygroundServerSlug(params.serverSlug)) {
      throw redirect({
        to: "/playground/s/$serverSlug/channel/$channelId",
        params: { channelId: DEFAULT_CHANNEL_ID, serverSlug: PLAYGROUND_SERVER_SLUG },
        search: {},
        replace: true,
      });
    }
  },
});
