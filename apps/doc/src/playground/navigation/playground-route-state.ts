import { getRouteApi, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";

import { PLAYGROUND_SERVER_SLUG } from "../mock/index.ts";
import { requestPlaygroundSearchFocus } from "../search/playground-search-focus.ts";
import type { PlaygroundRailView } from "./playground-navigation.ts";

const playgroundRoute = getRouteApi("/playground");

const playgroundRailPaths = {
  search: "/playground/search",
  chat: "/playground/s/$serverSlug",
  activity: "/playground/activity",
  tasks: "/playground/tasks",
  members: "/playground/members",
  computers: "/playground/computers",
  settings: "/playground/settings",
} as const satisfies Record<PlaygroundRailView, string>;

const playgroundDisabledRailViews = new Set<PlaygroundRailView>(["computers", "settings"]);

export function usePlaygroundRouteState() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { content, context, detail, query } = playgroundRoute.useSearch();
  const railView = getPlaygroundRailView(pathname);

  const selectRailView = useCallback(
    (view: PlaygroundRailView) => {
      if (playgroundDisabledRailViews.has(view)) return;
      if (view === "search" && railView === "search") {
        requestPlaygroundSearchFocus();
        return;
      }
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
    [navigate, railView],
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
  const selectContent = useCallback(
    (id?: string, options?: { hash?: string; surface?: string }) => {
      void navigate({
        to: ".",
        search: (current) => ({
          ...current,
          content: id,
          context:
            current.content === id ||
            (options?.surface !== undefined && current.surface === options.surface)
              ? current.context
              : undefined,
          surface: id ? options?.surface : undefined,
        }),
        hash: options?.hash,
      });
    },
    [navigate],
  );
  const selectContext = useCallback(
    (id?: string) => {
      void navigate({
        to: ".",
        search: (current) => ({
          ...current,
          context: id,
        }),
      });
    },
    [navigate],
  );
  const setSearchQuery = useCallback(
    (nextQuery: string) => {
      void navigate({
        to: ".",
        replace: true,
        search: (current) => ({
          ...current,
          query: nextQuery || undefined,
        }),
      });
    },
    [navigate],
  );

  return {
    contentId: content,
    contextId: context,
    railDetailId: detail,
    railView,
    searchQuery: query ?? "",
    selectContent,
    selectContext,
    selectRailDetail,
    selectRailView,
    setSearchQuery,
  };
}

function getPlaygroundRailView(pathname: string): PlaygroundRailView {
  const segment = pathname.split("/").filter(Boolean)[1];
  return segment && segment in playgroundRailPaths ? (segment as PlaygroundRailView) : "chat";
}
