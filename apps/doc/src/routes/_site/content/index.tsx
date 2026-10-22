import { createFileRoute } from "@tanstack/react-router";

import { SectionIndex } from "#/components/site/doc-page-view.tsx";
import { docPageHead } from "#/components/site/doc-route.ts";

export const Route = createFileRoute("/_site/content/")({
  head: ({ matches }) => docPageHead("/content", matches),
  component: () => <SectionIndex section="content" />,
});
