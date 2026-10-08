import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import type { TocItem } from "#/components/toc.tsx";
import { TaskStatusComposition } from "#/modules/tasks/compositions/task-status.composition.tsx";

export const Route = createFileRoute("/components/task-status")({
  component: TaskStatusDoc,
});

const TOC: readonly TocItem[] = [];

function TaskStatusDoc() {
  return (
    <DocPage
      title="Task status"
      description="The five task states and the four surfaces that render them — one colour source, consistent within each theme."
      toc={TOC}
      showToc={false}
      articleClassName="mx-auto max-w-5xl 2xl:max-w-6xl"
    >
      <TaskStatusComposition />
    </DocPage>
  );
}
