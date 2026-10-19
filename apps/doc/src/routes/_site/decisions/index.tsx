import { createFileRoute } from "@tanstack/react-router";

import { SectionIndex } from "#/components/site/doc-page-view.tsx";
import { docPageHead } from "#/components/site/doc-route.ts";

export const Route = createFileRoute("/_site/decisions/")({
  head: () => docPageHead("/decisions"),
  component: () => <SectionIndex section="decisions" />,
});
