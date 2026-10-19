import { createFileRoute } from "@tanstack/react-router";

import { ComponentPageView } from "#/components/site/component-page-view.tsx";
import { docPageHead, loadDocPage } from "#/components/site/doc-route.ts";
import { loadComponentApi } from "#/lib/content/api.ts";
import { pageAt } from "#/lib/content/pages.ts";

// One route for every component: packages/ui/src/components/<x>/<x>.md and
// the API generated from its code (src/data/api/<x>.json). Old component
// names redirect in the root route (lib/content/redirects.ts).
export const Route = createFileRoute("/_site/components/$slug")({
  loader: async ({ params }) => {
    const { url } = loadDocPage(`/components/${params.slug}`);
    return { url, api: await loadComponentApi(params.slug) };
  },
  head: ({ loaderData }) => docPageHead(loaderData?.url),
  component: function Page() {
    const { url, api } = Route.useLoaderData();
    return <ComponentPageView page={pageAt(url)!} api={api} />;
  },
});
