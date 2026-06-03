import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { TodoList } from "#/components/todo-list.tsx";

const TOC = [{ id: "todo", title: "Todo" }] as const;

const TODOS = ["Document install, peer deps, and Tailwind/tv setup"] as const;

export const Route = createFileRoute("/setup")({ component: SetupDoc });

function SetupDoc() {
  return (
    <DocPage title="Setup" description="Get slock-ui wired into your project." toc={TOC}>
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>
    </DocPage>
  );
}
