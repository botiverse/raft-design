import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { IconsComposition } from "#/modules/icons/icons.composition.tsx";

export const Route = createFileRoute("/components/icons")({
  component: IconsDoc,
});

function IconsDoc() {
  return (
    <DocPage
      title="Icons"
      description="Conversation and task-status icons."
      toc={[]}
      showToc={false}
      articleClassName="mx-auto max-w-5xl 2xl:max-w-6xl"
    >
      <IconsComposition />
    </DocPage>
  );
}
