import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

import { PreviewThemeScope, usePreviewTheme } from "#/components/preview-theme.tsx";

import { usePlaygroundEmbeddedPreview } from "./use-playground-embedded-preview.ts";
import { PlaygroundNavigationProvider } from "../navigation/playground-navigation-state.tsx";
import { usePlaygroundRouteState } from "../navigation/playground-route-state.ts";
import { PlaygroundTaskStateProvider } from "../tasks/task-state.tsx";
import { PlaygroundShellStateProvider } from "./playground-shell-state.tsx";
import { PlaygroundActivityStateProvider } from "../activity/activity-state.tsx";

const playgroundPlainPaths = new Set([
  "/playground/tasks",
  "/playground/activity",
  "/playground/search",
  "/playground/settings",
]);

export function PlaygroundShell() {
  const { setTheme } = usePreviewTheme();
  const location = useLocation();
  usePlaygroundEmbeddedPreview(setTheme);
  const route = usePlaygroundRouteState();
  const { selectRailView } = route;

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if (event.isComposing || event.key.toLocaleLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      selectRailView("search");
    };
    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, [selectRailView]);

  const isChatRoute = location.pathname.startsWith("/playground/s/");
  const lockMobileHeight = isChatRoute || playgroundPlainPaths.has(location.pathname);
  const content = (
    <PreviewThemeScope
      className={lockMobileHeight ? "h-full" : "h-full max-md:h-auto max-md:min-h-dvh"}
    >
      <PlaygroundNavigationProvider
        contentId={route.contentId}
        contextId={route.contextId}
        searchQuery={route.searchQuery}
        railView={route.railView}
        railDetailId={route.railDetailId}
        onRailViewChange={route.selectRailView}
        onRailDetailChange={route.selectRailDetail}
        onContentChange={route.selectContent}
        onContextChange={route.selectContext}
        onSearchQueryChange={route.setSearchQuery}
      >
        <PlaygroundShellStateProvider>
          <PlaygroundActivityStateProvider>
            <PlaygroundTaskStateProvider>
              <Outlet />
            </PlaygroundTaskStateProvider>
          </PlaygroundActivityStateProvider>
        </PlaygroundShellStateProvider>
      </PlaygroundNavigationProvider>
    </PreviewThemeScope>
  );

  return (
    <div
      className={
        lockMobileHeight
          ? "h-dvh overflow-hidden"
          : "h-dvh overflow-hidden max-md:h-auto max-md:min-h-dvh max-md:overflow-visible"
      }
    >
      {content}
    </div>
  );
}
