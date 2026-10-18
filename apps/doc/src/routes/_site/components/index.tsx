import { createFileRoute } from "@tanstack/react-router";

import { ComponentIndex } from "#/components/site/component-index.tsx";

export const Route = createFileRoute("/_site/components/")({
  component: ComponentIndex,
});
