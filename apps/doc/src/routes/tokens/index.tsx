import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tokens/")({
  beforeLoad: () => {
    throw redirect({ href: "/foundations", statusCode: 301 });
  },
});
