import { Outlet, createFileRoute } from "@tanstack/react-router";

import { validatePlaygroundChannelSearch } from "#/playground/playground-search.ts";

export const Route = createFileRoute("/playground/s/$serverSlug/channel")({
  validateSearch: validatePlaygroundChannelSearch,
  component: Outlet,
});
