import { createFileRoute, redirect } from "@tanstack/react-router";

import { PLAYGROUND_SERVER_SLUG, isPlaygroundServerSlug } from "#/playground/mock/index.ts";
import { PlaygroundChatShell } from "#/playground/playground-chat-shell.tsx";

export const Route = createFileRoute("/playground/s/$serverSlug")({
  beforeLoad: ({ params }) => {
    if (!isPlaygroundServerSlug(params.serverSlug)) {
      throw redirect({
        to: "/playground/s/$serverSlug",
        params: { serverSlug: PLAYGROUND_SERVER_SLUG },
        search: {},
        replace: true,
      });
    }
  },
  component: PlaygroundChatShell,
});
