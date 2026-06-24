import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import inlineCodeInlineProseTokenCompositionSource from "#/compositions/inline-code/inline-prose-token-composition.tsx?raw";
import {
  INLINE_CODE_SOURCE_COMPARISON_COMPOSITION,
  INLINE_CODE_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/inline-code-source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  preview: `import { InlineCode } from "raft-ui";

<p>
  Set <InlineCode>aria-invalid</InlineCode> on the control.
</p>`,
  anatomy: `import { InlineCode } from "raft-ui";

<InlineCode>aria-invalid</InlineCode>`,
  usage: `<p>
  Put <InlineCode>aria-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on the control.
</p>

<p>
  Replace <InlineCode>input-brutal</InlineCode> with the themed component recipe.
</p>`,
  migrationNative: `// Before
<code>aria-invalid</code>

// After
<InlineCode>aria-invalid</InlineCode>`,
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

const InlineCodeCurrent = INLINE_CODE_SOURCE_COMPARISON_COMPOSITION;

const INLINE_CODE_COMPOSITION_RAW_SOURCES = {
  InlineProseToken: inlineCodeInlineProseTokenCompositionSource,
} as const;

const INLINE_CODE_COMPOSITION_SOURCES = createCompositionSourceMap(
  INLINE_CODE_COMPOSITION_RAW_SOURCES,
);

const INLINE_CODE_COMPOSITION_SNIPPET_IDS = {
  InlineProseToken: "inlineCodeInlineProseTokenComposition",
} as const;

type InlineCodeCompositionKey = keyof typeof INLINE_CODE_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/inline-code")({
  component: InlineCodeDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          INLINE_CODE_COMPOSITION_SOURCES,
          INLINE_CODE_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function InlineCodeDoc() {
  const code = Route.useLoaderData();
  const inlineCodeComposition = (key: InlineCodeCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: INLINE_CODE_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: INLINE_CODE_COMPOSITION_SNIPPET_IDS,
      sources: INLINE_CODE_COMPOSITION_SOURCES,
    });

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
            <p className="max-w-2xl text-sm leading-6 text-foreground">
              Set <InlineCode>aria-invalid</InlineCode> on the control.
            </p>
          </Example>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="InlineCode.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-4">
          <DocNote>
            Keep InlineCode for short inline identifiers. Use CodeBlock for snippets, multi-token
            examples, or anything that needs syntax highlighting.
          </DocNote>
          <Example html={code.usage}>
            <div className="grid max-w-2xl gap-4 text-sm leading-6 text-foreground">
              <p>
                Put <InlineCode>aria-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on
                the control.
              </p>
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
              note: "Source rendered inline code inside MarkdownContent. Current turns the same brutal recipe into a reusable InlineCode primitive and adds elegant theme coverage.",
              source: (
                <code className="border border-black bg-brutal-yellow/40 px-1 text-sm font-mono [overflow-wrap:anywhere]">
                  aria-invalid
                </code>
              ),
              brutal: <InlineCodeCurrent.InlineProseToken />,
              elegant: <InlineCodeCurrent.InlineProseToken />,
              elegantDark: <InlineCodeCurrent.InlineProseToken />,
              ...inlineCodeComposition("InlineProseToken"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
