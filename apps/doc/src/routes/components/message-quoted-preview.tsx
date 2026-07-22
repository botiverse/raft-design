import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageQuotedPreviewShowcaseComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";
import quotedPreviewSource from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx?raw";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
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
        <MessageQuotedPreviewTimestamp />
      </MessageQuotedPreviewContext>
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
  <MessageQuotedPreviewLoadingHeader>
    <MessageQuotedPreviewLoadingAvatar />
    <MessageQuotedPreviewLoadingLines>
      <MessageQuotedPreviewLoadingLine />
    </MessageQuotedPreviewLoadingLines>
  </MessageQuotedPreviewLoadingHeader>
  <MessageQuotedPreviewLoadingContent />
</MessageQuotedPreviewLoading>

<MessageQuotedPreviewUnavailable />`;

const PROPS: readonly PropRow[] = [
  {
    name: "MessageQuotedPreview",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Quoted message card root. Compose inside MessageItemEmbedded; use render for button/link shells.",
  },
  {
    name: "MessageQuotedPreviewContent / Header / Body",
    type: 'useRender.ComponentProps<"div">',
    description: "Structural regions for context chrome and quoted body content.",
  },
  {
    name: "MessageQuotedPreviewContext / Channel / Author / Timestamp",
    type: "div or span props",
    description:
      "Source channel, author identity, separators, and timestamp. Icons and labels stay consumer-owned.",
  },
  {
    name: "MessageQuotedPreviewText / Attachments / Attachment",
    type: 'useRender.ComponentProps<"div">',
    description: "Quoted copy and attachment chips. Product media and filenames stay outside.",
  },
  {
    name: "MessageQuotedPreviewLoading*",
    type: "div or span props",
    description: "Skeleton anatomy while the quoted target resolves.",
  },
  {
    name: "MessageQuotedPreviewUnavailable",
    type: 'useRender.ComponentProps<"div">',
    description: "Unavailable/deleted quoted target shell. Failure copy stays consumer-owned.",
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

export const Route = createFileRoute("/components/message-quoted-preview")({
  component: MessageQuotedPreviewDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        quotedPreview: quotedPreviewSource,
      },
    }),
});

function MessageQuotedPreviewDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageQuotedPreview"
      description="Quoted message card composed inside a MessageItem body for thread and channel quotes."
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
        <DocSubsection parentId="usage" id="quoted-preview" title="Quoted preview">
          <UsagePreview code={code.quotedPreview}>
            <MessageQuotedPreviewShowcaseComposition />
          </UsagePreview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
