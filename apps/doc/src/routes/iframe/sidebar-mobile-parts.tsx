import { createFileRoute } from "@tanstack/react-router";
import type { ThemeMode } from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { SidebarMobilePartsComposition } from "#/modules/sidebar/compositions/mobile-parts.composition.tsx";

export const Route = createFileRoute("/iframe/sidebar-mobile-parts")({
  staticData: { standalone: true },
  validateSearch: (search) => ({
    mode: getMode(search.mode),
  }),
  component: SidebarMobilePartsPreviewPage,
});

function SidebarMobilePartsPreviewPage() {
  const search = Route.useSearch();

  return (
    <PreviewThemeScope mode={search.mode} className="h-dvh overflow-hidden">
      <SidebarMobilePartsComposition />
    </PreviewThemeScope>
  );
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "system" ? value : "light";
}
