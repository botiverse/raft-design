import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import type { TocItem } from "#/components/toc.tsx";
import { IconsComposition } from "#/modules/icons/icons.composition.tsx";

export const Route = createFileRoute("/components/icons")({
  component: IconsDoc,
});

const TOC: readonly TocItem[] = [];

function IconsDoc() {
  return (
    <DocPage
      title="Icons"
      description="Conversation and task-status icons."
      toc={TOC}
      showToc={false}
      articleClassName="mx-auto max-w-5xl 2xl:max-w-6xl"
    >
      <IconsComposition />
    </DocPage>
  );
}
