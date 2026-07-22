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
import { QuotedPreviewMessageComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
import quotedPreviewMessageSource from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx?raw";
import { MessageQuotedPreviewShowcaseComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";
import quotedPreviewSource from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx?raw";
import { MessageQuotedPreviewSourcePreview } from "#/modules/message-quoted-preview/message-quoted-preview.source-preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock quoted-message surface",
    scenes: [
      {
        label: "QuotedMessagePermalinkPreview.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/QuotedMessagePermalinkPreview.tsx",
      },
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
    ],
  },
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
        quotedPreviewMessage: quotedPreviewMessageSource,
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

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.quotedPreview}>
          <MessageQuotedPreviewShowcaseComposition />
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
        <DocSubsection parentId="usage" id="quoted-preview" title="Quoted preview">
          <UsagePreview code={code.quotedPreview}>
            <MessageQuotedPreviewShowcaseComposition />
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
              label: "Loaded quoted message",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real QuotedMessagePermalinkPreview and MessageItem DOM; the three Current panes execute the canonical message composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <MessageQuotedPreviewSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <QuotedPreviewMessageComposition />,
              elegant: <QuotedPreviewMessageComposition />,
              elegantDark: <QuotedPreviewMessageComposition />,
              compositionCode: code.quotedPreviewMessage,
              compositionPath:
                "apps/doc/src/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx",
              compositionSource: quotedPreviewMessageSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
