import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PreviewThemeProvider } from "#/components/preview-theme.tsx";

export const Route = createFileRoute("/components")({
  component: ComponentsLayout,
});

function ComponentsLayout() {
  return (
    <PreviewThemeProvider>
      <Outlet />
    </PreviewThemeProvider>
  );
}
