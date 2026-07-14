import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  DEFAULT_CHANNEL_ID,
  PLAYGROUND_TASKS,
  getPlaygroundThread,
} from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/")({
  beforeLoad: ({ search }) => {
    const threadContext = search.thread ? getPlaygroundThread(search.thread) : undefined;
    const task = search.thread
      ? PLAYGROUND_TASKS.find((candidate) => candidate.id === search.thread)
      : undefined;
    const channelId = threadContext?.channelId ?? task?.channelId ?? DEFAULT_CHANNEL_ID;
    // Chat always has a selected channel; never stay on the bare /playground index.
    throw redirect({
      to: "/playground/$channelId",
      params: { channelId },
      search,
    });
  },
});
