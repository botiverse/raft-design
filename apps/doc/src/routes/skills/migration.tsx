import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/skills/migration")({
  beforeLoad: () => {
    throw redirect({ to: "/migration" });
  },
});
