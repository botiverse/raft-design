import { createFileRoute, redirect } from "@tanstack/react-router";

// The lab's pixel loader is an example on the Spinner page; the logo
// treatments were archived (apps/doc/DESIGN.md §11, 7).
export const Route = createFileRoute("/lab")({
  beforeLoad: () => {
    throw redirect({ href: "/components/spinner", statusCode: 301 });
  },
});
