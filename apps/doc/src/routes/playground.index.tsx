import { createFileRoute, redirect } from "@tanstack/react-router";

import { PLAYGROUND_TASKS, getPlaygroundThread } from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/")({
  beforeLoad: ({ search }) => {
    const threadContext = search.thread ? getPlaygroundThread(search.thread) : undefined;
    const task = search.thread
      ? PLAYGROUND_TASKS.find((candidate) => candidate.id === search.thread)
      : undefined;
    const channelId = threadContext?.channelId ?? task?.channelId;
    if (channelId) {
      throw redirect({
        to: "/playground/$channelId",
        params: { channelId },
        search,
      });
    }
  },
});
