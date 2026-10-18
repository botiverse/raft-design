import { createFileRoute } from "@tanstack/react-router";

import { SectionIndex } from "#/components/site/doc-page-view.tsx";

export const Route = createFileRoute("/_site/patterns/")({
  component: () => <SectionIndex section="patterns" />,
});
