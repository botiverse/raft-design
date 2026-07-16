import { Outlet } from "@tanstack/react-router";

import { PreviewThemeScope, usePreviewTheme } from "#/components/preview-theme.tsx";

import { usePlaygroundEmbeddedPreview } from "./playground-mobile-preview.tsx";
import { PlaygroundNavigationProvider } from "./playground-navigation-state.tsx";
import { usePlaygroundRouteState } from "./playground-route-state.ts";
import { PlaygroundShellStateProvider } from "./playground-shell-state.tsx";
import { PlaygroundTaskStateProvider } from "./playground-task-state.tsx";

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
