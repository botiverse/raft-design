import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocPage } from "#/components/doc-page.tsx";
import { GuideContent } from "#/modules/guides/guide-content.tsx";
import { guides } from "#/modules/guides/guides.ts";

export const Route = createFileRoute("/guides/$guide")({
  loader: ({ params }) => {
    if (!Object.hasOwn(guides, params.guide)) throw notFound();
    return guides[params.guide]!;
  },
  component: GuidePage,
});

function GuidePage() {
  const guide = Route.useLoaderData();
  return (
    <DocPage
      title={guide.title}
      toc={[]}
      sourceHref={`https://github.com/botiverse/rui/blob/main/packages/ui/skills/raft-ui-guide/rules/${guide.slug}.md`}
    >
      <GuideContent>{guide.body}</GuideContent>
    </DocPage>
  );
}
