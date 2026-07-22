import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageMarkdownShowcaseComposition } from "#/modules/message-markdown/compositions/markdown.composition.tsx";
import markdownSource from "#/modules/message-markdown/compositions/markdown.composition.tsx?raw";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
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
    </DocPage>
  );
}
