import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageMarkdownShowcaseComposition } from "#/modules/message-markdown/compositions/markdown.composition.tsx";
import markdownSource from "#/modules/message-markdown/compositions/markdown.composition.tsx?raw";
import { MessageMarkdownComparisonComposition } from "#/modules/message-markdown/message-markdown.source-comparison.tsx";
import markdownComparisonSource from "#/modules/message-markdown/message-markdown.source-comparison.tsx?raw";
import { MessageMarkdownSourcePreview } from "#/modules/message-markdown/message-markdown.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock message markdown",
    scenes: [
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
      {
        label: "messageMarkdownSecurity.ts",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/messageMarkdownSecurity.ts",
      },
    ],
  },
] as const;

const ANATOMY_SOURCE = `<MessageMarkdown>
  <p>...</p>
  <MessageInlineCode />
  <MessageMarkdownTableScroll>
    <table>...</table>
  </MessageMarkdownTableScroll>
  <MessageCodeBlock>
    <code>...</code>
  </MessageCodeBlock>
</MessageMarkdown>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageMarkdown",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Message body markdown surface. Consumers render parsed HTML/React children; parsing stays outside.",
  },
  {
    name: "MessageInlineCode",
    type: "InlineCode props",
    description: "Inline code token styled for message markdown density.",
  },
  {
    name: "MessageMarkdownTableScroll",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal scroll wrapper for wide markdown tables.",
  },
  {
    name: "MessageCodeBlock",
    type: 'useRender.ComponentProps<"pre">',
    description: "Fenced code block shell. Syntax highlighting stays consumer-owned.",
  },
];

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview previewMode="light" previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

export const Route = createFileRoute("/components/message-markdown")({
  component: MessageMarkdownDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        comparison: markdownComparisonSource,
        markdown: markdownSource,
      },
    }),
});

function MessageMarkdownDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageMarkdown"
      description="Markdown body surface for message content — headings, lists, tables, and code blocks."
      toc={TOC}
    >
      <DocNote>
        Body block for <Link to="/components/message-item">MessageItem</Link>. Exported from{" "}
        <code>raft-ui/wip</code>.
      </DocNote>

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.comparison}>
          <MessageMarkdownComparisonComposition />
        </UsagePreview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="markdown" title="Markdown">
          <UsagePreview code={code.markdown}>
            <MessageMarkdownShowcaseComposition />
          </UsagePreview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Markdown inside MessageItem",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real MessageItem markdown DOM; the three Current panes execute the canonical message-context composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <MessageMarkdownSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <MessageMarkdownComparisonComposition />,
              elegant: <MessageMarkdownComparisonComposition />,
              elegantDark: <MessageMarkdownComparisonComposition />,
              compositionCode: code.comparison,
              compositionPath:
                "apps/doc/src/modules/message-markdown/message-markdown.source-comparison.tsx",
              compositionSource: markdownComparisonSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
