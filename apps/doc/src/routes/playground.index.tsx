import { createFileRoute, redirect } from "@tanstack/react-router";

import { DEFAULT_CHANNEL_ID } from "#/playground/mock-data.ts";

export const Route = createFileRoute("/playground/")({
  beforeLoad: () => {
    throw redirect({
      to: "/playground/$channelId",
      params: { channelId: DEFAULT_CHANNEL_ID },
    });
  },
});
