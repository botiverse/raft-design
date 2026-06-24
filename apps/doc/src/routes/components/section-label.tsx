import { createFileRoute } from "@tanstack/react-router";
import { SectionLabel } from "@raft/ui/wip";

import { Callout } from "#/components/callout.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacySectionEyebrow from "../../../../../packages/ui/src/legacy/SectionEyebrow.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "render", title: "Render" },
  { id: "color", title: "Color" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { SectionLabel } from "@raft/ui";

<SectionLabel>Members</SectionLabel>`,
  render: `<SectionLabel>Span</SectionLabel>
<SectionLabel render={<div />}>Div</SectionLabel>
<SectionLabel render={<label htmlFor="name" />}>Label</SectionLabel>`,
  color: `<SectionLabel>Muted (default)</SectionLabel>
<SectionLabel className="!text-black">Fully black</SectionLabel>`,
  sourceDiv: `<SectionEyebrow as="div" className="mb-3">
  Info
</SectionEyebrow>`,
  currentDiv: `<SectionLabel render={<div />} className="mb-3">
  Info
</SectionLabel>`,
  sourceLabel: `<SectionEyebrow as="label" htmlFor="name">
  Name
</SectionEyebrow>`,
  currentLabel: `<SectionLabel render={<label htmlFor="name" />}>
  Name
</SectionLabel>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: 'useRender.ComponentProps<"span">["render"]',
    description: "Optional element replacement. Use div for block labels or label for form labels.",
  },
  {
    name: "className",
    type: "string",
    description: "Appended to the base token (margin, padding, !text-black override, etc.).",
  },
  { name: "children", type: "ReactNode", description: "Section label text." },
];

export const Route = createFileRoute("/components/section-label")({
  component: SectionLabelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SectionLabelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SectionLabel"
      description="The locked section label typography token: a muted uppercase label."
      overview={
        <Differences from="SectionEyebrow">
          <li>
            renamed from <code>SectionEyebrow</code> to <code>SectionLabel</code> to avoid
            design-jargon naming
          </li>
          <li>
            <code>as</code> / <code>htmlFor</code> moved to Base UI style <code>render</code>{" "}
            composition
          </li>
          <li>brutal typography is preserved 1:1</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.anatomy}>
          <SectionLabel>Members</SectionLabel>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="SectionLabel.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="render" title="Render">
        <Example html={code.render}>
          <div className="flex flex-col gap-2">
            <SectionLabel>Span</SectionLabel>
            <SectionLabel render={<div />}>Div</SectionLabel>
            <SectionLabel render={<label htmlFor="name" />}>Label</SectionLabel>
          </div>
        </Example>
      </DocSection>

      <DocSection id="color" title="Color">
        <div className="space-y-4">
          <Example html={code.color}>
            <div className="flex flex-col gap-2">
              <SectionLabel>Muted (default)</SectionLabel>
              <SectionLabel className="!text-black">Fully black</SectionLabel>
            </div>
          </Example>
          <Callout>
            Default color is <code>text-black/60</code>. Pass <code>className="!text-black"</code>{" "}
            for fully black labels used in dense control rows.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Block section label",
              status: "difference",
              note: "Source used an as prop. Current uses render composition while preserving the same typography and spacing.",
              source: (
                <LegacySectionEyebrow as="div" className="mb-3">
                  Info
                </LegacySectionEyebrow>
              ),
              current: (
                <SectionLabel render={<div />} className="mb-3">
                  Info
                </SectionLabel>
              ),
              sourceCode: code.sourceDiv,
              currentCode: code.currentDiv,
            },
            {
              label: "Form label element",
              status: "difference",
              note: "Source combined as='label' and htmlFor. Current puts the label element directly in render.",
              source: (
                <LegacySectionEyebrow as="label" htmlFor="name">
                  Name
                </LegacySectionEyebrow>
              ),
              current: <SectionLabel render={<label htmlFor="name" />}>Name</SectionLabel>,
              sourceCode: code.sourceLabel,
              currentCode: code.currentLabel,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
