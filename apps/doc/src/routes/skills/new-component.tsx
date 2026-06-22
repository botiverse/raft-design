import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { TodoList } from "#/components/todo-list.tsx";

const TOC = [{ id: "todo", title: "Todo" }] as const;

const TODOS = ["Document the skill for building new components from scratch"] as const;

export const Route = createFileRoute("/skills/new-component")({ component: NewComponentSkillDoc });

function NewComponentSkillDoc() {
  return (
    <DocPage
      title="New Component Skill"
      description="The skill for developing brand-new raft-ui components."
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>
    </DocPage>
  );
}
