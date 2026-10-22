import { createFileRoute } from "@tanstack/react-router";

import { DocPageView } from "#/components/site/doc-page-view.tsx";
import { docPageHead, loadDocPage } from "#/components/site/doc-route.ts";
import { pageAt } from "#/lib/content/pages.ts";

export const Route = createFileRoute("/_site/people-and-agents/$slug")({
  loader: ({ params }) => loadDocPage(`/people-and-agents/${params.slug}`),
  head: ({ loaderData, matches }) => docPageHead(loaderData?.url, matches),
  component: function Page() {
    return <DocPageView page={pageAt(Route.useLoaderData().url)!} />;
  },
});
