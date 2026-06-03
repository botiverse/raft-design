import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { TodoList } from "#/components/todo-list.tsx";

const TOC = [{ id: "todo", title: "Todo" }] as const;

const TODOS = ["Document the color palette and semantic color tokens"] as const;

export const Route = createFileRoute("/tokens/colors")({ component: ColorsDoc });

function ColorsDoc() {
  return (
    <DocPage title="Colors" description="The slock-ui color palette and semantic tokens." toc={TOC}>
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>
    </DocPage>
  );
}
