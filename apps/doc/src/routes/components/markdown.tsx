import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import markdownComponentsSource from "#/lib/markdown/create-markdown-components.tsx?raw";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import markdownRendererSource from "#/lib/markdown/markdown.tsx?raw";
import { renderShikiCodeBlock } from "#/lib/markdown/render-shiki-code-block.tsx";
import shikiCodeBlockSource from "#/lib/markdown/render-shiki-code-block.tsx?raw";
import { plainSnippet } from "#/lib/plain-snippet.ts";
import { MARKDOWN_SOURCE } from "#/modules/markdown/markdown.fixtures.ts";

const MARKDOWN_COMPONENTS_PATH = "apps/doc/src/lib/markdown/create-markdown-components.tsx";
const MARKDOWN_RENDERER_PATH = "apps/doc/src/lib/markdown/markdown.tsx";
const SHIKI_CODE_BLOCK_PATH = "apps/doc/src/lib/markdown/render-shiki-code-block.tsx";

const PREVIEW_INPUT_HTML = plainSnippet(MARKDOWN_SOURCE);

const USAGE_SOURCE = `const components = {
  p: (props) => <MarkdownParagraph {...props} />,
  a: (props) => <MarkdownLink {...props} />,
  // ...one part per node
};

<ReactMarkdown components={components}>{source}</ReactMarkdown>`;

const ANATOMY_SOURCE = `<MarkdownHeading level={2} />
<MarkdownParagraph>
  <MarkdownLink />
  <MarkdownInlineCode />
  <MarkdownMark />
</MarkdownParagraph>
<MarkdownList>
  <MarkdownListItem>
    <MarkdownCheckbox />
  </MarkdownListItem>
</MarkdownList>
<MarkdownOrderedList>
  <MarkdownListItem />
</MarkdownOrderedList>
<MarkdownBlockquote />
<MarkdownRule />
<MarkdownImage />
<MarkdownTableScroll>
  <MarkdownTable>
    <MarkdownTableRow>
      <MarkdownHeaderCell />
      <MarkdownCell />
    </MarkdownTableRow>
  </MarkdownTable>
</MarkdownTableScroll>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MarkdownHeading",
    type: 'ComponentPropsWithRef<"h1"> & { level: 1 | 2 | 3 | 4 | 5 | 6 }',
    description: "Heading. The level selects both the element and its scale.",
  },
  {
    name: "MarkdownParagraph",
    type: 'ComponentPropsWithRef<"p">',
    description: "Paragraph. Drops its bottom margin when it is the last child.",
  },
  {
    name: "MarkdownLink",
    type: 'ComponentPropsWithRef<"a">',
    description:
      "Link. Only the anchors a renderer maps here are styled, so reference chips passed as node overrides keep their own treatment.",
  },
  {
    name: "MarkdownList / MarkdownOrderedList",
    type: 'ComponentPropsWithRef<"ul"> / ComponentPropsWithRef<"ol">',
    description: "Lists. Both share one slot; the ordered one switches the marker.",
  },
  {
    name: "MarkdownListItem",
    type: 'ComponentPropsWithRef<"li">',
    description: "List item.",
  },
  {
    name: "MarkdownCheckbox",
    type: "CheckboxProps",
    description: "Task-list checkbox. Read-only by default, since task items are display-only.",
  },
  {
    name: "MarkdownBlockquote",
    type: 'ComponentPropsWithRef<"blockquote">',
    description: "Quote block.",
  },
  {
    name: "MarkdownRule",
    type: 'ComponentPropsWithRef<"hr">',
    description: "Thematic break.",
  },
  {
    name: "MarkdownInlineCode",
    type: "InlineCodeProps",
    description: "Inline code, sized for body density.",
  },
  {
    name: "MarkdownMark",
    type: 'ComponentPropsWithRef<"mark">',
    description: "Highlighted run, for search matches and emphasis.",
  },
  {
    name: "MarkdownImage",
    type: 'ComponentPropsWithRef<"img">',
    description: "Embedded image on a transparency checkerboard.",
  },
  {
    name: "MarkdownTableScroll",
    type: 'ComponentPropsWithRef<"div">',
    description: "Horizontal scroll container. Wrap the table in it so wide tables never overflow.",
  },
  {
    name: "MarkdownTable / MarkdownTableRow",
    type: 'ComponentPropsWithRef<"table"> / ComponentPropsWithRef<"tr">',
    description: "Table and row. The last row drops its bottom border.",
  },
  {
    name: "MarkdownHeaderCell / MarkdownCell",
    type: 'ComponentPropsWithRef<"th"> / ComponentPropsWithRef<"td">',
    description: "Cells. Dividers come from the cells themselves, not from the table.",
  },
];

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "input", title: "Markdown input" },
  { id: "anatomy", title: "Anatomy" },
  { id: "wiring", title: "Wiring a renderer" },
  { id: "api", title: "API" },
] as const;

export const Route = createFileRoute("/components/markdown")({
  component: MarkdownDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        markdownComponents: markdownComponentsSource,
        markdownRenderer: markdownRendererSource,
        shikiCodeBlock: shikiCodeBlockSource,
        usage: USAGE_SOURCE,
      },
    }),
});

function MarkdownDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Markdown"
      description="Styled parts for rendered Markdown — headings, lists, tables, quotes, and inline code."
      toc={TOC}
    >
      <DocNote>
        This package ships the parts, not a renderer. Parsing, plugins, sanitizing, and the node
        mapping stay with the consumer, so react-markdown and MDX can both use the same parts. The
        docs app wires react-markdown; that wiring is shown below and is meant to be copied, not
        imported.
      </DocNote>

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.usage}>
          <Markdown renderCode={renderShikiCodeBlock}>{MARKDOWN_SOURCE}</Markdown>
        </UsagePreview>
      </DocSection>

      <DocSection id="input" title="Markdown input">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={PREVIEW_INPUT_HTML} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="wiring" title="Wiring a renderer">
        <DocsCodeBlock.Files
          files={[
            {
              path: MARKDOWN_COMPONENTS_PATH,
              source: markdownComponentsSource,
              html: code.markdownComponents,
              collapsedHtml: code.markdownComponentsBody,
            },
            {
              path: MARKDOWN_RENDERER_PATH,
              source: markdownRendererSource,
              html: code.markdownRenderer,
              collapsedHtml: code.markdownRendererBody,
            },
            {
              path: SHIKI_CODE_BLOCK_PATH,
              source: shikiCodeBlockSource,
              html: code.shikiCodeBlock,
              collapsedHtml: code.shikiCodeBlockBody,
            },
          ]}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
