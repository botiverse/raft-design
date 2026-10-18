import { createFileRoute, redirect } from "@tanstack/react-router";

// The token pages moved into Foundations (apps/doc/DESIGN.md §11, 2).
const MOVED: Record<string, string> = {
  colors: "/foundations/color",
  typography: "/foundations/typography",
  shadows: "/foundations/elevation",
};

export const Route = createFileRoute("/tokens/$name")({
  beforeLoad: ({ params }) => {
    throw redirect({ href: MOVED[params.name] ?? "/foundations", statusCode: 301 });
  },
});
