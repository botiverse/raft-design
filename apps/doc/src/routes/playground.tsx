import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { TodoList } from "#/components/todo-list.tsx";

const TOC = [{ id: "todo", title: "Todo" }] as const;

const TODOS = ["Build a live sandbox to compose and tweak components"] as const;

export const Route = createFileRoute("/playground")({ component: PlaygroundDoc });

function PlaygroundDoc() {
  return (
    <DocPage
      title="Playground"
      description="A sandbox for experimenting with components."
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>
    </DocPage>
  );
}
