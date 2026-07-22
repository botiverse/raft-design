import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageQuotedPreviewShowcaseComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";
import quotedPreviewSource from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<MessageQuotedPreview>
  <MessageQuotedPreviewContent>
    <MessageQuotedPreviewHeader>
      <MessageQuotedPreviewContext>
        <MessageQuotedPreviewChannel />
        <MessageQuotedPreviewSeparator />
        <MessageQuotedPreviewAuthor>
          <MessageQuotedPreviewAuthorName />
          <MessageQuotedPreviewAuthorMeta />
        </MessageQuotedPreviewAuthor>
      </MessageQuotedPreviewContext>
      <MessageQuotedPreviewTimestamp />
    </MessageQuotedPreviewHeader>
    <MessageQuotedPreviewBody>
      <MessageQuotedPreviewText />
      <MessageQuotedPreviewAttachments>
        <MessageQuotedPreviewAttachment />
      </MessageQuotedPreviewAttachments>
    </MessageQuotedPreviewBody>
  </MessageQuotedPreviewContent>
</MessageQuotedPreview>

<MessageQuotedPreviewLoading>
  <MessageQuotedPreviewLoadingHeader />
  <MessageQuotedPreviewLoadingContent>
    <MessageQuotedPreviewLoadingAvatar />
    <MessageQuotedPreviewLoadingLines>
      <MessageQuotedPreviewLoadingLine />
    </MessageQuotedPreviewLoadingLines>
  </MessageQuotedPreviewLoadingContent>
</MessageQuotedPreviewLoading>

<MessageQuotedPreviewUnavailable>
  <MessageQuotedPreviewContent />
</MessageQuotedPreviewUnavailable>`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageQuotedPreview",
    type: "compound slots",
    description:
      "Quoted message preview with loaded, loading, and unavailable shells. Fetching and permalink resolution stay caller-owned.",
  },
  {
    name: "MessageQuotedPreviewHeader / MessageQuotedPreviewContext",
    type: 'useRender.ComponentProps<"div">',
    description: "Channel, author, and thread context row above the quoted body.",
  },
  {
    name: "MessageQuotedPreviewAuthor / MessageQuotedPreviewAuthorName / MessageQuotedPreviewAuthorMeta",
    type: 'useRender.ComponentProps<"div"> / <"span">',
    description: "Author avatar slot, name, and secondary meta.",
  },
  {
    name: "MessageQuotedPreviewBody / MessageQuotedPreviewText",
    type: 'useRender.ComponentProps<"div">',
    description: "Quoted message text content.",
  },
  {
    name: "MessageQuotedPreviewAttachments / MessageQuotedPreviewAttachment",
    type: 'useRender.ComponentProps<"div">',
    description: "Attachment summary row for quoted messages carrying attachments.",
  },
  {
    name: "MessageQuotedPreviewLoading",
    type: "compound slots",
    description: "Skeleton shell shown while the quoted message resolves.",
  },
  {
    name: "MessageQuotedPreviewUnavailable",
    type: 'useRender.ComponentProps<"div">',
    description: "Unavailable/deleted quoted-message shell. Retry behavior stays caller-owned.",
  },
];

export const Route = createFileRoute("/components/message-quoted-preview")({
  component: MessageQuotedPreviewDoc,
  loader: () =>
    highlightSnippets({ data: { anatomy: ANATOMY_SOURCE, quotedPreview: quotedPreviewSource } }),
});

function MessageQuotedPreviewDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageQuotedPreview"
      description="Quoted message preview with loaded, loading, and unavailable states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewMode="light" previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageQuotedPreviewShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code html={code.quotedPreview} />
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
