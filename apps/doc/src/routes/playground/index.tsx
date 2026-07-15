import { createFileRoute, redirect } from "@tanstack/react-router";

import { PLAYGROUND_SERVER_SLUG } from "#/playground/mock/index.ts";

export const Route = createFileRoute("/playground/")({
  beforeLoad: () => {
    throw redirect({
      to: "/playground/s/$serverSlug",
      params: { serverSlug: PLAYGROUND_SERVER_SLUG },
      search: {},
    });
  },
});
