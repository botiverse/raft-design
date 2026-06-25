import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/migration")({ component: MigrationLayout });

function MigrationLayout() {
  return <Outlet />;
}
