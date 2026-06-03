import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { TodoList } from "#/components/todo-list.tsx";

const TOC = [{ id: "todo", title: "Todo" }] as const;

const TODOS = ["Document the elevation / shadow scale"] as const;

export const Route = createFileRoute("/tokens/shadows")({ component: ShadowsDoc });

function ShadowsDoc() {
  return (
    <DocPage title="Shadows" description="The elevation and shadow scale." toc={TOC}>
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>
    </DocPage>
  );
}
