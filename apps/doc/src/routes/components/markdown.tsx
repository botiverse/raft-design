import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import markdownComponentsSource from "#/lib/markdown/markdown-components.tsx?raw";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import markdownRendererSource from "#/lib/markdown/markdown.tsx?raw";
import { plainSnippet } from "#/lib/plain-snippet.ts";
import markdownInputSource from "#/modules/markdown/markdown-input.md?raw";

const MARKDOWN_COMPONENTS_PATH = "apps/doc/src/lib/markdown/markdown-components.tsx";
const MARKDOWN_RENDERER_PATH = "apps/doc/src/lib/markdown/markdown.tsx";

const MARKDOWN_INPUT_PATH = "apps/doc/src/modules/markdown/markdown-input.md";
const MARKDOWN_INPUT_HTML = plainSnippet(markdownInputSource);

const ANATOMY_SOURCE = `import {
  MarkdownBlockquote,
  MarkdownCell,
  MarkdownCheckbox,
  MarkdownHeaderCell,
  MarkdownHeading,
  MarkdownImage,
  MarkdownInlineCode,
  MarkdownLink,
  MarkdownList,
  MarkdownListItem,
  MarkdownMark,
  MarkdownOrderedList,
  MarkdownParagraph,
  MarkdownRule,
  MarkdownTable,
  MarkdownTableRow,
  MarkdownTableScroll,
} from "raft-ui";

<MarkdownHeading level={2} />
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
    name: "MarkdownList",
    type: 'ComponentPropsWithRef<"ul">',
    description: "Bulleted list.",
  },
  {
    name: "MarkdownOrderedList",
    type: 'ComponentPropsWithRef<"ol">',
    description: "Numbered list. Shares the list slot and only switches the marker.",
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
    name: "MarkdownTable",
    type: 'ComponentPropsWithRef<"table">',
    description: "Table. Borders live on the cells, not here.",
  },
  {
    name: "MarkdownTableRow",
    type: 'ComponentPropsWithRef<"tr">',
    description: "Table row. The last one drops its cells' bottom border.",
  },
  {
    name: "MarkdownHeaderCell",
    type: 'ComponentPropsWithRef<"th">',
    description: "Header cell. Carries the header surface and the column divider.",
  },
  {
    name: "MarkdownCell",
    type: 'ComponentPropsWithRef<"td">',
    description: "Body cell. Carries the row and column dividers.",
  },
];

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch">
          <Preview.Canvas>
            <Markdown>{markdownInputSource}</Markdown>
          </Preview.Canvas>
          <Preview.Code
            codeBlock={
              <DocsCodeBlock.Files
                collapsible={false}
                showLineNumbers={false}
                files={[
                  {
                    path: MARKDOWN_INPUT_PATH,
                    source: markdownInputSource,
                    html: MARKDOWN_INPUT_HTML,
                  },
                ]}
              />
            }
          />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
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
          ]}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
