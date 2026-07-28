import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import markdownAdapterSource from "#/lib/message-markdown/message-markdown-adapter.tsx?raw";
import { MessageMarkdownComposition } from "#/modules/message-markdown/compositions/markdown.composition.tsx";
import markdownSource from "#/modules/message-markdown/compositions/markdown.composition.tsx?raw";

const MARKDOWN_ADAPTER_PATH = "apps/doc/src/lib/message-markdown/message-markdown-adapter.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "component-overrides", title: "Component overrides" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageMarkdown>
  <ReactMarkdown components={DEFAULT_COMPONENTS}>
    {markdown}
  </ReactMarkdown>
</MessageMarkdown>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageMarkdown",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Styled message Markdown root. Parsing and product-node rendering remain consumer-owned.",
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
];

function UsagePreview({
  children,
  code,
  collapsedCode,
}: {
  children: ReactNode;
  code: ReactNode;
  collapsedCode?: ReactNode;
}) {
  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
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
        markdownAdapter: markdownAdapterSource,
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.markdown} collapsedCode={code.markdownBody}>
          <MessageMarkdownComposition />
        </UsagePreview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="component-overrides" title="Component overrides">
        <DocsCodeBlock.Panel
          path={MARKDOWN_ADAPTER_PATH}
          source={markdownAdapterSource}
          html={code.markdownAdapter}
          collapsedHtml={code.markdownAdapterBody}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
