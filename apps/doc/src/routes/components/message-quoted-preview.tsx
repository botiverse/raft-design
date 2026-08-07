import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { QuotedPreviewMessageComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
import quotedPreviewMessageSource from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx?raw";
import { QuotedPreviewDirectMessageComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-direct-message.composition.tsx";
import quotedPreviewDirectMessageSource from "#/modules/message-quoted-preview/compositions/quoted-preview-direct-message.composition.tsx?raw";
import { QuotedPreviewDirectMessageThreadComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-direct-message-thread.composition.tsx";
import quotedPreviewDirectMessageThreadSource from "#/modules/message-quoted-preview/compositions/quoted-preview-direct-message-thread.composition.tsx?raw";
import { QuotedPreviewArchivedChannelComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-archived-channel.composition.tsx";
import quotedPreviewArchivedChannelSource from "#/modules/message-quoted-preview/compositions/quoted-preview-archived-channel.composition.tsx?raw";
import { QuotedPreviewLongContentComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-long-content.composition.tsx";
import quotedPreviewLongContentSource from "#/modules/message-quoted-preview/compositions/quoted-preview-long-content.composition.tsx?raw";
import { QuotedPreviewLoadingComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-loading.composition.tsx";
import quotedPreviewLoadingSource from "#/modules/message-quoted-preview/compositions/quoted-preview-loading.composition.tsx?raw";
import { MessageQuotedPreviewShowcaseComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";
import { QuotedPreviewUnavailableComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-unavailable.composition.tsx";
import quotedPreviewUnavailableSource from "#/modules/message-quoted-preview/compositions/quoted-preview-unavailable.composition.tsx?raw";

const QUOTED_PREVIEW_MESSAGE_PATH =
  "apps/doc/src/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
const QUOTED_PREVIEW_LOADING_PATH =
  "apps/doc/src/modules/message-quoted-preview/compositions/quoted-preview-loading.composition.tsx";
const QUOTED_PREVIEW_UNAVAILABLE_PATH =
  "apps/doc/src/modules/message-quoted-preview/compositions/quoted-preview-unavailable.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `import {
  Avatar,
  MessageQuotedPreview,
  MessageQuotedPreviewAttachment,
  MessageQuotedPreviewAttachments,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorMeta,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewLoading,
  MessageQuotedPreviewText,
  MessageQuotedPreviewThread,
  MessageQuotedPreviewTimestamp,
  MessageQuotedPreviewUnavailable,
  Skeleton,
} from "raft-ui";

<MessageQuotedPreview>
  <MessageQuotedPreviewHeader>
    <MessageQuotedPreviewAuthor>
      <Avatar size="xs" type="human" />
      <MessageQuotedPreviewAuthorName />
      <MessageQuotedPreviewAuthorMeta />
    </MessageQuotedPreviewAuthor>
    <MessageQuotedPreviewChannel />
    <MessageQuotedPreviewThread />
    <MessageQuotedPreviewTimestamp />
  </MessageQuotedPreviewHeader>
  <MessageQuotedPreviewContent>
    <MessageQuotedPreviewText />
    <MessageQuotedPreviewAttachments>
      <MessageQuotedPreviewAttachment />
    </MessageQuotedPreviewAttachments>
  </MessageQuotedPreviewContent>
</MessageQuotedPreview>

<MessageQuotedPreviewLoading>
  <Skeleton variant="line" />
</MessageQuotedPreviewLoading>

<MessageQuotedPreviewUnavailable />`;

const MESSAGE_QUOTED_PREVIEW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Quoted message card root. Compose inside MessageItemEmbedded; use render for button/link shells.",
  },
];

const MESSAGE_QUOTED_PREVIEW_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Quoted excerpt region for text and optional attachment chips.",
  },
];

const MESSAGE_QUOTED_PREVIEW_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Header row for author identity, channel, optional thread, and trailing timestamp.",
  },
];

const MESSAGE_QUOTED_PREVIEW_CHANNEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Header channel or direct-message label. The caller owns icon and label content.",
  },
];

const MESSAGE_QUOTED_PREVIEW_THREAD_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional header thread marker. The caller owns its icon and label content.",
  },
];

const MESSAGE_QUOTED_PREVIEW_AUTHOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline header identity region, usually composed with Avatar and author fields.",
  },
];

const MESSAGE_QUOTED_PREVIEW_AUTHOR_NAME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncated author display name.",
  },
];

const MESSAGE_QUOTED_PREVIEW_AUTHOR_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional muted author metadata, such as a role or agent description.",
  },
];

const MESSAGE_QUOTED_PREVIEW_TIMESTAMP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Header timestamp aligned to the trailing edge.",
  },
];

const MESSAGE_QUOTED_PREVIEW_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Quoted text excerpt, visually clamped to two lines.",
  },
];

const MESSAGE_QUOTED_PREVIEW_ATTACHMENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "One quoted attachment chip. The caller owns its filename or media label.",
  },
];

const MESSAGE_QUOTED_PREVIEW_ATTACHMENTS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Wrapping attachment-chip region within the quoted content.",
  },
];

const MESSAGE_QUOTED_PREVIEW_LOADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Loading-state container; compose it with Skeleton parts for the target context.",
  },
];

const MESSAGE_QUOTED_PREVIEW_UNAVAILABLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Unavailable/deleted quoted target shell. Failure copy stays consumer-owned.",
  },
];

export const Route = createFileRoute("/components/message-quoted-preview")({
  component: MessageQuotedPreviewDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        quotedPreviewDirectMessage: quotedPreviewDirectMessageSource,
        quotedPreviewDirectMessageThread: quotedPreviewDirectMessageThreadSource,
        quotedPreviewArchivedChannel: quotedPreviewArchivedChannelSource,
        quotedPreviewLongContent: quotedPreviewLongContentSource,
        quotedPreviewLoading: quotedPreviewLoadingSource,
        quotedPreviewMessage: quotedPreviewMessageSource,
        quotedPreviewUnavailable: quotedPreviewUnavailableSource,
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch">
          <Preview.Canvas>
            <MessageQuotedPreviewShowcaseComposition />
          </Preview.Canvas>
          <Preview.Code
            codeBlock={
              <DocsCodeBlock.Files
                collapsible={false}
                files={[
                  {
                    path: QUOTED_PREVIEW_MESSAGE_PATH,
                    source: quotedPreviewMessageSource,
                    html: code.quotedPreviewMessage,
                    collapsedHtml: code.quotedPreviewMessageBody,
                  },
                  {
                    path: QUOTED_PREVIEW_LOADING_PATH,
                    source: quotedPreviewLoadingSource,
                    html: code.quotedPreviewLoading,
                    collapsedHtml: code.quotedPreviewLoadingBody,
                  },
                  {
                    path: QUOTED_PREVIEW_UNAVAILABLE_PATH,
                    source: quotedPreviewUnavailableSource,
                    html: code.quotedPreviewUnavailable,
                    collapsedHtml: code.quotedPreviewUnavailableBody,
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
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="channel-thread" title="Channel thread and attachment">
            <DocNote>
              Use a hash-prefixed channel label for channel permalinks. Render
              <InlineCode>MessageQuotedPreviewThread</InlineCode> only when the permalink includes a
              thread parent; attachment chips remain in the content region.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <QuotedPreviewMessageComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.quotedPreviewMessage}
                collapsedHtml={code.quotedPreviewMessageBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="direct-message"
            title="Direct message and optional metadata"
          >
            <DocNote>
              Pair the recipient name with <InlineCode>DirectMessageIcon</InlineCode> for DMs
              instead of the channel hash. Thread, author meta, and attachments are optional; render
              those parts only when the quoted target has that data. Use{" "}
              <InlineCode>MessageQuotedPreviewLoading</InlineCode> while resolving the target and{" "}
              <InlineCode>MessageQuotedPreviewUnavailable</InlineCode> when it is missing or
              inaccessible.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <QuotedPreviewDirectMessageComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.quotedPreviewDirectMessage}
                collapsedHtml={code.quotedPreviewDirectMessageBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="direct-message-thread" title="Direct-message thread">
            <DocNote>
              DM permalinks pair <InlineCode>DirectMessageIcon</InlineCode> with the recipient name.
              A DM can also target a thread reply, in which case render the same thread marker
              beside that label.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <QuotedPreviewDirectMessageThreadComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.quotedPreviewDirectMessageThread}
                collapsedHtml={code.quotedPreviewDirectMessageThreadBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="long-content" title="Long excerpt and attachments">
            <DocNote>
              Quoted text clamps to two lines. Wrap attachment chips in
              <InlineCode>MessageQuotedPreviewAttachments</InlineCode> after{" "}
              <InlineCode>MessageQuotedPreviewText</InlineCode>
              so files remain visible with a long excerpt.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <QuotedPreviewLongContentComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.quotedPreviewLongContent}
                collapsedHtml={code.quotedPreviewLongContentBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="archived-channel" title="Archived channel">
            <DocNote>
              Archive policy stays caller-owned. Compose the channel&apos;s archived label from an
              existing <InlineCode>Badge</InlineCode> alongside the channel and timestamp.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <QuotedPreviewArchivedChannelComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.quotedPreviewArchivedChannel}
                collapsedHtml={code.quotedPreviewArchivedChannelBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="loading" title="Loading">
            <DocNote>
              Use <InlineCode>MessageQuotedPreviewLoading</InlineCode> while resolving the target.
              Its skeleton structure remains caller-owned.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <QuotedPreviewLoadingComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.quotedPreviewLoading}
                collapsedHtml={code.quotedPreviewLoadingBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="unavailable" title="Unavailable">
            <DocNote>
              Use <InlineCode>MessageQuotedPreviewUnavailable</InlineCode> when the target is
              missing or inaccessible. Failure copy stays caller-owned.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <QuotedPreviewUnavailableComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.quotedPreviewUnavailable}
                collapsedHtml={code.quotedPreviewUnavailableBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview"
            title="MessageQuotedPreview"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-content"
            title="MessageQuotedPreviewContent"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-header"
            title="MessageQuotedPreviewHeader"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-channel"
            title="MessageQuotedPreviewChannel"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_CHANNEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-thread"
            title="MessageQuotedPreviewThread"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_THREAD_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-author"
            title="MessageQuotedPreviewAuthor"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_AUTHOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-author-name"
            title="MessageQuotedPreviewAuthorName"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_AUTHOR_NAME_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-author-meta"
            title="MessageQuotedPreviewAuthorMeta"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_AUTHOR_META_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-timestamp"
            title="MessageQuotedPreviewTimestamp"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_TIMESTAMP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-text"
            title="MessageQuotedPreviewText"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_TEXT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-attachment"
            title="MessageQuotedPreviewAttachment"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_ATTACHMENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-attachments"
            title="MessageQuotedPreviewAttachments"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_ATTACHMENTS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-loading"
            title="MessageQuotedPreviewLoading"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_LOADING_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-quoted-preview-unavailable"
            title="MessageQuotedPreviewUnavailable"
          >
            <PropsTable rows={MESSAGE_QUOTED_PREVIEW_UNAVAILABLE_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
