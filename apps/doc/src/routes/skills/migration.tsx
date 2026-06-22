import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { TodoList } from "#/components/todo-list.tsx";

const TOC = [{ id: "todo", title: "Todo" }] as const;

const TODOS = ["Document the 3-step gated migration skill workflow"] as const;

export const Route = createFileRoute("/skills/migration")({ component: MigrationSkillDoc });

function MigrationSkillDoc() {
  return (
    <DocPage
      title="Migration Skill"
      description="The skill for migrating existing components into raft-ui."
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>
    </DocPage>
  );
}
