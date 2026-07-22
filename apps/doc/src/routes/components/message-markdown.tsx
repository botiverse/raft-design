import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageMarkdownShowcaseComposition } from "#/modules/message-markdown/compositions/markdown.composition.tsx";
import markdownSource from "#/modules/message-markdown/compositions/markdown.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageMarkdown>
  <p />
  <MessageInlineCode />
  <MessageCodeBlock />
  <MessageMarkdownTableScroll />
</MessageMarkdown>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageMarkdown",
    type: 'useRender.ComponentProps<"div">',
    description: "Message prose surface for caller-owned markdown DOM.",
  },
  {
    name: "MessageInlineCode",
    type: "InlineCode props",
    description: "Inline code chip styled for message body density.",
  },
  {
    name: "MessageCodeBlock",
    type: 'useRender.ComponentProps<"pre">',
    description: "Fenced code block shell. Highlighting stays caller-owned.",
  },
  {
    name: "MessageMarkdownTableScroll",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal scroll wrapper for wide markdown tables.",
  },
];

export const Route = createFileRoute("/components/message-markdown")({
  component: MessageMarkdownDoc,
  loader: () => highlightSnippets({ data: { anatomy: ANATOMY_SOURCE, markdown: markdownSource } }),
});

function MessageMarkdownDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageMarkdown"
      description="Message-scoped markdown surface, inline code, and code blocks composed inside MessageItem body."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewMode="light" previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageMarkdownShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code html={code.markdown} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
