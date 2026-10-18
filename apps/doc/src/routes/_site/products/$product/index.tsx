import { createFileRoute } from "@tanstack/react-router";

import { DocPageView } from "#/components/site/doc-page-view.tsx";
import { docPageHead, loadDocPage } from "#/components/site/doc-route.ts";
import { pageAt } from "#/lib/content/pages.ts";

// A product's README: design/products/<product>/README.md.
export const Route = createFileRoute("/_site/products/$product/")({
  loader: ({ params }) => loadDocPage(`/products/${params.product}`),
  head: ({ loaderData }) => docPageHead(loaderData?.url),
  component: function Page() {
    return <DocPageView page={pageAt(Route.useLoaderData().url)!} />;
  },
});
