import { createFileRoute } from "@tanstack/react-router";
import type { Theme, ThemeMode } from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { ChatSidebarMobilePartsComposition } from "#/modules/chat-sidebar/compositions/mobile-parts.composition.tsx";

export const Route = createFileRoute("/iframe/chat-sidebar-mobile-parts")({
  staticData: { standalone: true },
  validateSearch: (search) => ({
    mode: getMode(search.mode),
    theme: getTheme(search.theme),
  }),
  component: ChatSidebarMobilePartsPreviewPage,
});

function ChatSidebarMobilePartsPreviewPage() {
  const search = Route.useSearch();

  return (
    <PreviewThemeScope family={search.theme} mode={search.mode} className="h-dvh overflow-hidden">
      <ChatSidebarMobilePartsComposition />
    </PreviewThemeScope>
  );
}

function getTheme(value: unknown): Theme {
  return value === "brutal" ? "brutal" : "elegant";
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "system" ? value : "light";
}
