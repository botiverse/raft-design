import { getRouteApi, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";

import { PLAYGROUND_SERVER_SLUG } from "../mock/index.ts";
import type { PlaygroundRailView } from "./playground-navigation.ts";

const playgroundRoute = getRouteApi("/playground");

const playgroundRailPaths = {
  search: "/playground/search",
  chat: "/playground/s/$serverSlug",
  activity: "/playground/activity",
  saved: "/playground/saved",
  tasks: "/playground/tasks",
  members: "/playground/members",
  computers: "/playground/computers",
  settings: "/playground/settings",
} as const satisfies Record<PlaygroundRailView, string>;

const playgroundDisabledRailViews = new Set<PlaygroundRailView>([
  "search",
  "activity",
  "tasks",
  "computers",
  "settings",
]);

export function usePlaygroundRouteState() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { detail } = playgroundRoute.useSearch();
  const railView = getPlaygroundRailView(pathname);

  const selectRailView = useCallback(
    (view: PlaygroundRailView) => {
      if (playgroundDisabledRailViews.has(view)) return;
      if (view === "chat") {
        void navigate({
          to: "/playground/s/$serverSlug",
          params: { serverSlug: PLAYGROUND_SERVER_SLUG },
          search: {},
        });
        return;
      }
      void navigate({ to: playgroundRailPaths[view], search: {} });
    },
    [navigate],
  );
  const selectRailDetail = useCallback(
    (id?: string) => {
      void navigate({
        to: ".",
        search: (current) => ({
          ...current,
          detail: id,
        }),
      });
    },
    [navigate],
  );

  return {
    railDetailId: detail,
    railView,
    selectRailDetail,
    selectRailView,
  };
}

function getPlaygroundRailView(pathname: string): PlaygroundRailView {
  const segment = pathname.split("/").filter(Boolean)[1];
  return segment && segment in playgroundRailPaths ? (segment as PlaygroundRailView) : "chat";
}
