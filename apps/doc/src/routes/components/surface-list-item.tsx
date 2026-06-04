import { createFileRoute } from "@tanstack/react-router";
import { SurfaceListItem } from "@slock/ui";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { SurfaceListItem } from "@slock/ui";

<SurfaceListItem>general</SurfaceListItem>`,
  states: `<SurfaceListItem>Resting (interactive)</SurfaceListItem>
<SurfaceListItem selected>Selected</SurfaceListItem>
<SurfaceListItem interactive={false}>Static</SurfaceListItem>`,
} as const;

type PlaygroundValues = {
  selected: boolean;
  interactive: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    default: "false",
    description: "Selected look — black border, cyan/15 fill, shadow.",
  },
  {
    name: "interactive",
    type: "boolean",
    default: "true",
    description: "When unselected, adds the hover border + shadow.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes (children, onClick, etc.).",
  },
];

export const Route = createFileRoute("/components/surface-list-item")({
  component: SurfaceListItemDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SurfaceListItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SurfaceListItem"
      description="A bordered list surface with a selected state and optional interactive hover."
      overview={
        <Differences from="SurfaceListItem">
          <li>brutal styling reproduced 1:1 (selected cyan fill, hover border + shadow)</li>
          <li>
            <code>shadow-brutal-sm</code> maps to the brutal <code>--shadow</code> token
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ selected: false, interactive: true }}
          controls={[
            { name: "selected", label: "Selected", type: "boolean" },
            { name: "interactive", label: "Interactive", type: "boolean" },
          ]}
          render={(values) => (
            <SurfaceListItem
              selected={values.selected}
              interactive={values.interactive}
              className="w-64"
            >
              # general
            </SurfaceListItem>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states}>
          <div className="flex w-64 flex-col gap-3">
            <SurfaceListItem>Resting (interactive)</SurfaceListItem>
            <SurfaceListItem selected>Selected</SurfaceListItem>
            <SurfaceListItem interactive={false}>Static</SurfaceListItem>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
