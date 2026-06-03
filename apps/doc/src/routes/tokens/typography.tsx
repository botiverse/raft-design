import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { TodoList } from "#/components/todo-list.tsx";

const TOC = [{ id: "todo", title: "Todo" }] as const;

const TODOS = ["Document the font families, sizes, and weights"] as const;

export const Route = createFileRoute("/tokens/typography")({ component: TypographyDoc });

function TypographyDoc() {
  return (
    <DocPage title="Typography" description="Font families, sizes, and weight scale." toc={TOC}>
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>
    </DocPage>
  );
}
