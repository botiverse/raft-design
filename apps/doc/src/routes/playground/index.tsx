import { createFileRoute, redirect } from "@tanstack/react-router";

import { DEFAULT_CHANNEL_ID, PLAYGROUND_SERVER_SLUG } from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/")({
  beforeLoad: () => {
    // Chat always has a selected channel; never stay on the bare /playground index.
    throw redirect({
      to: "/playground/s/$serverSlug/channel/$channelId",
      params: { channelId: DEFAULT_CHANNEL_ID, serverSlug: PLAYGROUND_SERVER_SLUG },
      search: {},
    });
  },
});
