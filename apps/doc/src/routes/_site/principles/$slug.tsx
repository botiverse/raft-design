import { createFileRoute } from "@tanstack/react-router";

import { DocPageView } from "#/components/site/doc-page-view.tsx";
import { docPageHead, loadDocPage } from "#/components/site/doc-route.ts";
import { pageAt } from "#/lib/content/pages.ts";

export const Route = createFileRoute("/_site/principles/$slug")({
  loader: ({ params }) => loadDocPage(`/principles/${params.slug}`),
  head: ({ loaderData }) => docPageHead(loaderData?.url),
  component: function Page() {
    return <DocPageView page={pageAt(Route.useLoaderData().url)!} />;
  },
});
