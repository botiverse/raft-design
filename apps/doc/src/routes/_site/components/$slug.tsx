import { createFileRoute, redirect } from "@tanstack/react-router";

import { ComponentPageView } from "#/components/site/component-page-view.tsx";
import { docPageHead, loadDocPage } from "#/components/site/doc-route.ts";
import { loadComponentApi } from "#/lib/content/api.ts";
import { pageAt } from "#/lib/content/pages.ts";

/** Pages the old hand-written routes had under names that are not a component folder. */
const MOVED: Record<string, string> = {
  activity: "activity-inbox",
  "chat-composer": "composer",
  "composer-suggestions": "composer",
  "message-reference": "message-embed",
  "sidebar-item": "sidebar",
  "task-chip": "task-card",
  "task-status": "tasks",
};

// One route for every component: packages/ui/src/components/<x>/<x>.md and
// the API generated from its code (src/data/api/<x>.json).
export const Route = createFileRoute("/_site/components/$slug")({
  loader: async ({ params }) => {
    const moved = MOVED[params.slug];
    if (moved)
      throw redirect({ to: "/components/$slug", params: { slug: moved }, statusCode: 301 });
    const { url } = loadDocPage(`/components/${params.slug}`);
    return { url, api: await loadComponentApi(params.slug) };
  },
  head: ({ loaderData }) => docPageHead(loaderData?.url),
  component: function Page() {
    const { url, api } = Route.useLoaderData();
    return <ComponentPageView page={pageAt(url)!} api={api} />;
  },
});
