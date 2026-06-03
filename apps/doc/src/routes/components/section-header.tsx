import { createFileRoute } from "@tanstack/react-router";
import { Button, SectionHeader } from "@slock-ui/ui";
import { Bell, Plus } from "lucide-react";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "anatomy", title: "Anatomy" },
  { id: "slots", title: "Slots" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { SectionHeader } from "@slock-ui/ui";

<SectionHeader label="Members" count={12} />`,
  slots: `<SectionHeader label="Members" count={12} />
<SectionHeader
  label="Reminders"
  icon={<Bell size={16} />}
  action={<Button size="icon-xs" aria-label="Add"><Plus /></Button>}
/>`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "label", type: "ReactNode", description: "The eyebrow text." },
  { name: "icon", type: "ReactNode", description: "Optional leading icon (text-black/60)." },
  {
    name: "count",
    type: "number | null",
    description: "Optional count badge after the label (font-mono, rendered when ≥ 0).",
  },
  { name: "action", type: "ReactNode", description: "Optional right-aligned action node." },
  {
    name: "htmlFor",
    type: "string",
    description: "When set, the eyebrow becomes a <label htmlFor> for the region's control.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes on the outer wrapper (e.g. mb-2, border-b-2).",
  },
];

export const Route = createFileRoute("/components/section-header")({
  component: SectionHeaderDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SectionHeaderDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SectionHeader"
      description="An eyebrow label with an optional count badge and trailing action."
      overview={
        <Differences from="SectionHeader">
          <li>brutal styling reproduced 1:1 (composes SectionEyebrow, font-mono count)</li>
          <li>
            the <code>default</code> export is now a named <code>SectionHeader</code> export
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="slots" title="Slots">
        <Example html={code.slots}>
          <div className="flex w-72 flex-col gap-4">
            <SectionHeader label="Members" count={12} />
            <SectionHeader
              label="Reminders"
              icon={<Bell size={16} />}
              action={
                <Button size="icon-xs" aria-label="Add">
                  <Plus />
                </Button>
              }
            />
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
