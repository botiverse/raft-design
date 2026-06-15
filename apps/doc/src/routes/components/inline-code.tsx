import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "@slock/ui";

import { CodeBlock } from "#/components/code-block.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "migration", title: "Migration" },
] as const;

const SNIPPETS = {
  preview: `import { InlineCode } from "@slock/ui";

<p>
  Set <InlineCode>aria-invalid</InlineCode> on the control.
</p>`,
  anatomy: `import { InlineCode } from "@slock/ui";

<InlineCode>aria-invalid</InlineCode>`,
  usage: `<DocNote>
  Put <InlineCode>aria-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on the control.
</DocNote>

<p>
  Replace <InlineCode>input-brutal</InlineCode> with the themed component recipe.
</p>`,
  migrationNative: `// Before
<code>aria-invalid</code>

// After
<InlineCode>aria-invalid</InlineCode>`,
  migrationImport: `// Before
import { InlineCode } from "#/components/inline-code.tsx";

// After
import { InlineCode } from "@slock/ui";`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "className",
    type: "string",
    description: "Optional spacing or rare visual override classes.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"code">',
    description: "Native code attributes. The root always renders a semantic code element.",
  },
];

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

export const Route = createFileRoute("/components/inline-code")({
  component: InlineCodeDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function InlineCodeDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="InlineCode"
      description="A semantic inline code token for docs prose."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <div className="space-y-4">
          <DocNote>
            Use InlineCode inside explanatory prose when naming props, attributes, classes, or
            component parts.
          </DocNote>
          <Example html={code.preview}>
            <p className="max-w-2xl text-sm leading-6 text-foreground-muted">
              Set <InlineCode>aria-invalid</InlineCode> on the control, then let the wrapper own the
              visible state.
            </p>
          </Example>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-4">
          <DocNote>
            Keep InlineCode for short inline identifiers. Use CodeBlock for snippets, multi-token
            examples, or anything that needs syntax highlighting.
          </DocNote>
          <Example html={code.usage}>
            <div className="grid max-w-2xl gap-4 text-sm leading-6 text-foreground-muted">
              <DocNote>
                Put <InlineCode>aria-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on
                the control.
              </DocNote>
              <p>
                Replace <InlineCode>input-brutal</InlineCode> with the themed component recipe.
              </p>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Inline prose token",
              status: "new",
              note: "Source did not have a reusable inline code primitive. Current adds one so docs prose, prop names, and migration copy share the same semantic code styling.",
              source: <MissingSource />,
              brutal: <InlineCode>aria-invalid</InlineCode>,
              elegant: <InlineCode>aria-invalid</InlineCode>,
              elegantDark: <InlineCode>aria-invalid</InlineCode>,
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Native Code</h3>
            <p className="text-sm text-gray-500">
              Replace styled or unstyled native code tags in docs prose with InlineCode.
            </p>
            <CodeBlock html={code.migrationNative} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Docs Helper</h3>
            <p className="text-sm text-gray-500">
              Import InlineCode from the UI package instead of the docs app.
            </p>
            <CodeBlock html={code.migrationImport} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
