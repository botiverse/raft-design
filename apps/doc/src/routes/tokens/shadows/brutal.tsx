import { createFileRoute } from "@tanstack/react-router";

import { SHADOW_SNIPPETS, ShadowsDoc } from "#/routes/tokens/shadows.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

export const Route = createFileRoute("/tokens/shadows/brutal")({
  component: BrutalShadowsDoc,
  loader: () => highlightSnippets({ data: SHADOW_SNIPPETS }),
});

function BrutalShadowsDoc() {
  const code = Route.useLoaderData();

  return <ShadowsDoc theme="brutal" code={code} />;
}
