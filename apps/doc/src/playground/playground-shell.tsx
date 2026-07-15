import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { PreviewThemeScope, usePreviewTheme } from "#/components/preview-theme.tsx";

import {
  PlaygroundMobilePreview,
  usePlaygroundEmbeddedPreview,
} from "./playground-mobile-preview.tsx";
import { PlaygroundNavigationProvider } from "./playground-navigation-state.tsx";
import { usePlaygroundRouteState } from "./playground-route-state.ts";
import { PlaygroundShellStateProvider } from "./playground-shell-state.tsx";
import { PlaygroundTaskStateProvider } from "./playground-task-state.tsx";
import { PlaygroundToolbar } from "./playground-toolbar.tsx";

export function PlaygroundShell() {
  const { theme, mode, setTheme } = usePreviewTheme();
  const location = useRouterState({ select: (state) => state.location });
  const [mobilePreview, setMobilePreview] = useState(false);
  const embedded = usePlaygroundEmbeddedPreview(setTheme);
  const route = usePlaygroundRouteState();
  const content = (
    <PreviewThemeScope className="h-full">
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
    <div className="h-dvh overflow-hidden">
      {mobilePreview && !embedded ? (
        <PreviewThemeScope className="h-full">
          <PlaygroundMobilePreview src={location.href} theme={theme} mode={mode} />
        </PreviewThemeScope>
      ) : (
        content
      )}
      {embedded ? null : (
        <PlaygroundToolbar
          theme={theme}
          mode={mode}
          mobile={mobilePreview}
          onThemeChange={setTheme}
          onMobileChange={setMobilePreview}
        />
      )}
    </div>
  );
}
