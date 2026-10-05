import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocPage } from "#/components/doc-page.tsx";
import type { TocItem } from "#/components/toc.tsx";
import { GuideContent } from "#/modules/guides/guide-content.tsx";
import { guides } from "#/modules/guides/guides.ts";

export const Route = createFileRoute("/guides/$guide")({
  loader: ({ params }) => {
    if (!Object.hasOwn(guides, params.guide)) throw notFound();
    return guides[params.guide]!;
  },
  component: GuidePage,
});

const TOC: readonly TocItem[] = [];

function GuidePage() {
  const guide = Route.useLoaderData();
  return (
    <DocPage
      title={guide.title}
      toc={TOC}
      sourceHref={`https://github.com/botiverse/rui/blob/main/packages/ui/skills/raft-ui-guide/rules/${guide.slug}.md`}
    >
      <GuideContent>{guide.body}</GuideContent>
    </DocPage>
  );
}
