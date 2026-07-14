import { createFileRoute } from "@tanstack/react-router";
import type { Theme, ThemeMode } from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { AppShellMobileRootComposition } from "#/modules/app-shell/compositions/mobile-root.composition.tsx";

export const Route = createFileRoute("/iframe/app-shell-mobile")({
  staticData: { standalone: true },
  validateSearch: (search) => ({
    mode: getMode(search.mode),
    theme: getTheme(search.theme),
  }),
  component: AppShellMobilePreviewPage,
});

function AppShellMobilePreviewPage() {
  const search = Route.useSearch();

  return (
    <PreviewThemeScope family={search.theme} mode={search.mode} className="h-dvh overflow-hidden">
      <AppShellMobileRootComposition />
    </PreviewThemeScope>
  );
}

function getTheme(value: unknown): Theme {
  return value === "brutal" ? "brutal" : "elegant";
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "system" ? value : "light";
}
