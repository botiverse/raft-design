import { Outlet, createFileRoute } from "@tanstack/react-router";

import { validatePlaygroundChannelSearch } from "#/playground/navigation/playground-search.ts";

export const Route = createFileRoute("/playground/s/$serverSlug/dm")({
  validateSearch: validatePlaygroundChannelSearch,
  component: Outlet,
});
