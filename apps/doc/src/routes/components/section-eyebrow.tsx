import { createFileRoute } from "@tanstack/react-router";
import { SectionEyebrow } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
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
  { id: "elements", title: "Elements" },
  { id: "color", title: "Color" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { SectionEyebrow } from "@slock-ui/ui";

<SectionEyebrow>Members</SectionEyebrow>`,
  elements: `<SectionEyebrow as="span">Span</SectionEyebrow>
<SectionEyebrow as="div">Div</SectionEyebrow>
<SectionEyebrow as="label" htmlFor="name">Label</SectionEyebrow>`,
  color: `<SectionEyebrow>Muted (default)</SectionEyebrow>
<SectionEyebrow className="!text-black">Fully black</SectionEyebrow>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "as",
    type: '"span" | "div" | "label"',
    default: '"span"',
    description: "Element to render. div for block-level, label for form fields.",
  },
  { name: "htmlFor", type: "string", description: 'Forwarded to <label htmlFor> when as="label".' },
  {
    name: "className",
    type: "string",
    description: "Appended to the base token (margin, padding, !text-black override, etc.).",
  },
  { name: "children", type: "ReactNode", description: "Eyebrow text." },
];

export const Route = createFileRoute("/components/section-eyebrow")({
  component: SectionEyebrowDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SectionEyebrowDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SectionEyebrow"
      description="The locked section-eyebrow typographic token — a muted uppercase label."
      overview={
        <Differences from="SectionEyebrow">
          <li>
            brutal styling reproduced 1:1 (text-xs font-bold uppercase tracking-widest,
            text-black/60)
          </li>
          <li>
            the <code>default</code> export is now a named <code>SectionEyebrow</code> export
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

      <DocSection id="elements" title="Elements">
        <Example html={code.elements}>
          <SectionEyebrow as="span">Span</SectionEyebrow>
          <SectionEyebrow as="div">Div</SectionEyebrow>
          <SectionEyebrow as="label" htmlFor="name">
            Label
          </SectionEyebrow>
        </Example>
      </DocSection>

      <DocSection id="color" title="Color">
        <div className="space-y-4">
          <Example html={code.color}>
            <SectionEyebrow>Muted (default)</SectionEyebrow>
            <SectionEyebrow className="!text-black">Fully black</SectionEyebrow>
          </Example>
          <Callout>
            Default color is <code>text-black/60</code>. Pass <code>className="!text-black"</code>{" "}
            for a fully-black eyebrow (e.g. a sidebar section toggle).
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
