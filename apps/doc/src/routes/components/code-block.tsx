import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import plainCompositionSource from "#/modules/code-block/compositions/plain.composition.tsx?raw";
import { PlainCodeBlockComposition } from "#/modules/code-block/compositions/plain.composition.tsx";
import shikiCompositionSource from "#/modules/code-block/compositions/shiki.composition.tsx?raw";
import { ShikiCodeBlockComposition } from "#/modules/code-block/compositions/shiki.composition.tsx";
import animatedCopyCompositionSource from "#/modules/code-block/compositions/animated-copy.composition.tsx?raw";
import { AnimatedCopyCodeBlockComposition } from "#/modules/code-block/compositions/animated-copy.composition.tsx";
import withoutHeaderCompositionSource from "#/modules/code-block/compositions/without-header.composition.tsx?raw";
import { WithoutHeaderCodeBlockComposition } from "#/modules/code-block/compositions/without-header.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<CodeBlock>
  <CodeBlockHeader>
    <CodeBlockTitle>message.ts</CodeBlockTitle>
    <CodeBlockActions>
      <CodeBlockAction />
    </CodeBlockActions>
  </CodeBlockHeader>
  <CodeBlockBody>
    <pre>
      <code>{code}</code>
    </pre>
  </CodeBlockBody>
</CodeBlock>`;

const PROPS: readonly PropRow[] = [
  {
    name: "CodeBlock",
    type: 'useRender.ComponentProps<"div">',
    description: "Framed code surface. Holds the header and the body panel.",
  },
  {
    name: "CodeBlockHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional header bar above the code panel.",
  },
  {
    name: "CodeBlockTitle",
    type: 'useRender.ComponentProps<"span">',
    description: "Header label such as a filename or language.",
  },
  {
    name: "CodeBlockActions",
    type: 'useRender.ComponentProps<"div">',
    description: "Trailing header region for code-block actions.",
  },
  {
    name: "CodeBlockAction",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Styled action shell. raft-ui owns only the appearance; the consumer supplies the icon and the behavior.",
  },
  {
    name: "CodeBlockBody",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Inner code panel. Pass the complete pre and code, from plain markup or an external highlighter.",
  },
];

export const Route = createFileRoute("/components/code-block")({
  component: CodeBlockDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        plain: plainCompositionSource,
        shiki: shikiCompositionSource,
        withoutHeader: withoutHeaderCompositionSource,
        animatedCopy: animatedCopyCompositionSource,
      },
    }),
});

function CodeBlockDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="CodeBlock"
      description="A framed code surface with a header bar, consumer-owned actions, and consumer-rendered code content."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            Shiki stays outside raft-ui. Let the external renderer produce the complete pre and code
            structure, then pass that result to the body. CodeBlock owns the frame, the header bar,
            and the action shell.
          </DocNote>
          <Preview>
            <Preview.Canvas>
              <div className="w-full max-w-2xl">
                <ShikiCodeBlockComposition />
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.shiki} collapsedHtml={code.shikiBody} />
          </Preview>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="plain-content" title="Plain content">
            <DocNote>
              Compose a plain pre and code when syntax highlighting is not needed. The surface stays
              identical; only the body content changes.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="w-full max-w-2xl">
                  <PlainCodeBlockComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.plain} collapsedHtml={code.plainBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="without-header" title="Without header">
            <DocNote>
              The header is optional. Render the body alone and the code panel keeps its full
              treatment without leaving an empty bar.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="w-full max-w-2xl">
                  <WithoutHeaderCodeBlockComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.withoutHeader} collapsedHtml={code.withoutHeaderBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="animated-copy" title="Animated copy">
            <DocNote>
              raft-ui ships the action shell only, so the consumer owns the feedback. This example
              reuses the docs icon-swap transition at a shorter duration, so the check lands almost
              immediately after the click.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="w-full max-w-2xl">
                  <AnimatedCopyCodeBlockComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.animatedCopy} collapsedHtml={code.animatedCopyBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} nameColumnLabel="Part" />
      </DocSection>
    </DocPage>
  );
}
