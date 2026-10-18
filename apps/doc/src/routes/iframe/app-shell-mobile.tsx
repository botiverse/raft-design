import { createFileRoute } from "@tanstack/react-router";
import type { ThemeMode } from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { AppShellMobileRootComposition } from "#/modules/app-shell/compositions/mobile-root.composition.tsx";

export const Route = createFileRoute("/iframe/app-shell-mobile")({
  staticData: { standalone: true },
  validateSearch: (search) => ({
    mode: getMode(search.mode),
  }),
  component: AppShellMobilePreviewPage,
});

function AppShellMobilePreviewPage() {
  const search = Route.useSearch();

  return (
    <PreviewThemeScope mode={search.mode} className="h-dvh overflow-hidden">
      <AppShellMobileRootComposition />
    </PreviewThemeScope>
  );
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "system" ? value : "light";
}
