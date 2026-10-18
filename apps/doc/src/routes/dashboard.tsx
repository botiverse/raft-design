import { createFileRoute, redirect } from "@tanstack/react-router";

// The dashboard example was dropped (apps/doc/DESIGN.md §11, 8).
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ href: "/", statusCode: 301 });
  },
});
