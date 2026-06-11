import { createFileRoute } from "@tanstack/react-router";

import { SHADOW_SNIPPETS, ShadowsDoc } from "#/routes/tokens/shadows.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

export const Route = createFileRoute("/tokens/shadows/elegant")({
  component: ElegantShadowsDoc,
  loader: () => highlightSnippets({ data: SHADOW_SNIPPETS }),
});

function ElegantShadowsDoc() {
  const code = Route.useLoaderData();

  return <ShadowsDoc theme="elegant" code={code} />;
}
