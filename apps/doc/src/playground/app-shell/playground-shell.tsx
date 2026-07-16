import { Outlet } from "@tanstack/react-router";

import { PreviewThemeScope, usePreviewTheme } from "#/components/preview-theme.tsx";

import { usePlaygroundEmbeddedPreview } from "./use-playground-embedded-preview.ts";
import { PlaygroundNavigationProvider } from "../navigation/playground-navigation-state.tsx";
import { usePlaygroundRouteState } from "../navigation/playground-route-state.ts";
import { PlaygroundTaskStateProvider } from "../tasks/task-state.tsx";
import { PlaygroundShellStateProvider } from "./playground-shell-state.tsx";

export function PlaygroundShell() {
  const { setTheme } = usePreviewTheme();
  usePlaygroundEmbeddedPreview(setTheme);
  const route = usePlaygroundRouteState();
  const content = (
    <PreviewThemeScope className="h-full max-md:h-auto max-md:min-h-dvh">
      <PlaygroundNavigationProvider
        railView={route.railView}
        railDetailId={route.railDetailId}
        onRailViewChange={route.selectRailView}
        onRailDetailChange={route.selectRailDetail}
      >
        <PlaygroundShellStateProvider>
          <PlaygroundTaskStateProvider>
            <Outlet />
          </PlaygroundTaskStateProvider>
        </PlaygroundShellStateProvider>
      </PlaygroundNavigationProvider>
    </PreviewThemeScope>
  );

  return (
    <div className="h-dvh overflow-hidden max-md:h-auto max-md:min-h-dvh max-md:overflow-visible">
      {content}
    </div>
  );
}
