import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PreviewThemeProvider } from "#/components/preview-theme.tsx";
import { ThemeSwitcher } from "#/components/theme-switcher.tsx";

export const Route = createFileRoute("/components")({
  component: ComponentsLayout,
});

function ComponentsLayout() {
  return (
    <PreviewThemeProvider>
      <Outlet />
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur">
          <ThemeSwitcher />
        </div>
      </div>
    </PreviewThemeProvider>
  );
}
