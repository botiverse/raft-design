import { createFileRoute } from "@tanstack/react-router";

import { ComponentIndex } from "#/components/site/component-index.tsx";
import { docPageHead } from "#/components/site/doc-route.ts";

export const Route = createFileRoute("/_site/components/")({
  head: () => docPageHead("/components"),
  component: ComponentIndex,
});
