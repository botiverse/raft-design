import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
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

const MARKDOWN_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "level",
    type: "1 | 2 | 3 | 4 | 5 | 6",
    description: "Heading level; selects both the element and its scale.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"h1">',
    description: "Heading. The level selects both the element and its scale.",
  },
];

const MARKDOWN_PARAGRAPH_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"p">',
    description: "Paragraph. Drops its bottom margin when it is the last child.",
  },
];

const MARKDOWN_LINK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"a">',
    description:
      "Link. Only the anchors a renderer maps here are styled, so reference chips passed as node overrides keep their own treatment.",
  },
];

const MARKDOWN_MARK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"mark">',
    description: "Highlighted run, for search matches and emphasis.",
  },
];

const MARKDOWN_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"ul">',
    description: "Bulleted list.",
  },
];

const MARKDOWN_ORDERED_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"ol">',
    description: "Numbered list. Shares the list slot and only switches the marker.",
  },
];

const MARKDOWN_LIST_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"li">',
    description: "List item.",
  },
];

const MARKDOWN_BLOCKQUOTE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"blockquote">',
    description: "Quote block.",
  },
];

const MARKDOWN_RULE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"hr">',
    description: "Thematic break.",
  },
];

const MARKDOWN_TABLE_SCROLL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Horizontal scroll container. Wrap the table in it so wide tables never overflow.",
  },
];

const MARKDOWN_TABLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"table">',
    description: "Table. Borders live on the cells, not here.",
  },
];

const MARKDOWN_TABLE_ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"tr">',
    description: "Table row. The last one drops its cells' bottom border.",
  },
];

const MARKDOWN_HEADER_CELL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"th">',
    description: "Header cell. Carries the header surface and the column divider.",
  },
];

const MARKDOWN_CELL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"td">',
    description: "Body cell. Carries the row and column dividers.",
  },
];

const MARKDOWN_IMAGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"img">',
    description: "Embedded image on a transparency checkerboard.",
  },
];

const MARKDOWN_INLINE_CODE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "InlineCodeProps",
    description: "Inline code, sized for body density.",
  },
];

const MARKDOWN_CHECKBOX_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "CheckboxProps",
    description: "Task-list checkbox. Read-only by default, since task items are display-only.",
  },
];

const MARKDOWN_INPUT_FILES = [
  {
    path: MARKDOWN_INPUT_PATH,
    source: markdownInputSource,
    html: MARKDOWN_INPUT_HTML,
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
  const rendererFiles = useMemo(
    () => [
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
    ],
    [code],
  );

  return (
    <DocPage
      title="Markdown Parts"
      description="Stable MarkdownHeading, MarkdownParagraph, and related parts from raft-ui. The complete Markdown renderer shown here is a docs-local composition, not a raft-ui export."
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
                files={MARKDOWN_INPUT_FILES}
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
        <DocSubsection parentId="usage" id="docs-local-renderer" title="Docs-local renderer">
          <DocsCodeBlock.Files files={rendererFiles} />
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-markdown-heading" title="MarkdownHeading">
            <PropsTable rows={MARKDOWN_HEADING_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-paragraph" title="MarkdownParagraph">
            <PropsTable rows={MARKDOWN_PARAGRAPH_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-link" title="MarkdownLink">
            <PropsTable rows={MARKDOWN_LINK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-mark" title="MarkdownMark">
            <PropsTable rows={MARKDOWN_MARK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-list" title="MarkdownList">
            <PropsTable rows={MARKDOWN_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-ordered-list" title="MarkdownOrderedList">
            <PropsTable rows={MARKDOWN_ORDERED_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-list-item" title="MarkdownListItem">
            <PropsTable rows={MARKDOWN_LIST_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-blockquote" title="MarkdownBlockquote">
            <PropsTable rows={MARKDOWN_BLOCKQUOTE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-rule" title="MarkdownRule">
            <PropsTable rows={MARKDOWN_RULE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-table-scroll" title="MarkdownTableScroll">
            <PropsTable rows={MARKDOWN_TABLE_SCROLL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-table" title="MarkdownTable">
            <PropsTable rows={MARKDOWN_TABLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-table-row" title="MarkdownTableRow">
            <PropsTable rows={MARKDOWN_TABLE_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-header-cell" title="MarkdownHeaderCell">
            <PropsTable rows={MARKDOWN_HEADER_CELL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-cell" title="MarkdownCell">
            <PropsTable rows={MARKDOWN_CELL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-image" title="MarkdownImage">
            <PropsTable rows={MARKDOWN_IMAGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-inline-code" title="MarkdownInlineCode">
            <PropsTable rows={MARKDOWN_INLINE_CODE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-markdown-checkbox" title="MarkdownCheckbox">
            <PropsTable rows={MARKDOWN_CHECKBOX_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
