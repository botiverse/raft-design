import { createFileRoute } from "@tanstack/react-router";

import { ComponentPageView } from "#/components/site/component-page-view.tsx";
import { docPageHead, loadDocPage } from "#/components/site/doc-route.ts";
import { pageAt } from "#/lib/content/pages.ts";

// One route for every component, rendered from
// packages/ui/src/components/<x>/<x>.md.
export const Route = createFileRoute("/_site/components/$slug")({
  loader: ({ params }) => loadDocPage(`/components/${params.slug}`),
  head: ({ loaderData }) => docPageHead(loaderData?.url),
  component: function Page() {
    return <ComponentPageView page={pageAt(Route.useLoaderData().url)!} />;
  },
});
