import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/components")({
  component: ComponentsLayout,
});

function ComponentsLayout() {
  return <Outlet />;
}
