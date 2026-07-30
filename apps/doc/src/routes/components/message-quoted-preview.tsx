import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { QuotedPreviewMessageComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
import quotedPreviewMessageSource from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx?raw";
import { QuotedPreviewDirectMessageComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-direct-message.composition.tsx";
import quotedPreviewDirectMessageSource from "#/modules/message-quoted-preview/compositions/quoted-preview-direct-message.composition.tsx?raw";
import { QuotedPreviewLongContentComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-long-content.composition.tsx";
import quotedPreviewLongContentSource from "#/modules/message-quoted-preview/compositions/quoted-preview-long-content.composition.tsx?raw";
import { MessageQuotedPreviewShowcaseComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";
import quotedPreviewSource from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx?raw";
import { MessageQuotedPreviewSourcePreview } from "#/modules/message-quoted-preview/message-quoted-preview.source-preview.tsx";

const QUOTED_PREVIEW_MESSAGE_PATH =
  "apps/doc/src/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
const QUOTED_PREVIEW_STATES_PATH =
  "apps/doc/src/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";

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
        <span>·</span>
        <MessageQuotedPreviewAuthor>
          <Avatar />
          <MessageQuotedPreviewAuthorName />
          <MessageQuotedPreviewAuthorMeta />
        </MessageQuotedPreviewAuthor>
        <span>·</span>
        <MessageQuotedPreviewThread />
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
  <Skeleton variant="line" />
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
    name: "MessageQuotedPreviewContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Padded inner region for the quoted card content.",
  },
  {
    name: "MessageQuotedPreviewHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Header row that aligns quote context with its timestamp.",
  },
  {
    name: "MessageQuotedPreviewContext",
    type: 'useRender.ComponentProps<"div">',
    description: "Wrapping context row for channel, author, thread, and caller-owned separators.",
  },
  {
    name: "MessageQuotedPreviewChannel",
    type: 'useRender.ComponentProps<"span">',
    description: "Channel or direct-message label. The caller owns the icon and label content.",
  },
  {
    name: "MessageQuotedPreviewThread",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional thread marker. The caller owns its icon and label content.",
  },
  {
    name: "MessageQuotedPreviewAuthor",
    type: 'useRender.ComponentProps<"span">',
    description: "Inline author identity region, usually composed with Avatar and author fields.",
  },
  {
    name: "MessageQuotedPreviewAuthorName",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncated author display name.",
  },
  {
    name: "MessageQuotedPreviewAuthorMeta",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional muted author metadata, such as a role or agent description.",
  },
  {
    name: "MessageQuotedPreviewTimestamp",
    type: 'useRender.ComponentProps<"span">',
    description: "Timestamp aligned to the trailing edge of the header.",
  },
  {
    name: "MessageQuotedPreviewBody",
    type: 'useRender.ComponentProps<"div">',
    description: "Body region for the quoted excerpt and any attachments.",
  },
  {
    name: "MessageQuotedPreviewText",
    type: 'useRender.ComponentProps<"div">',
    description: "Quoted text excerpt, visually clamped to two lines.",
  },
  {
    name: "MessageQuotedPreviewAttachments",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional wrapping row for quoted attachment chips.",
  },
  {
    name: "MessageQuotedPreviewAttachment",
    type: 'useRender.ComponentProps<"span">',
    description: "One quoted attachment chip. The caller owns its filename or media label.",
  },
  {
    name: "MessageQuotedPreviewLoading",
    type: 'useRender.ComponentProps<"div">',
    description: "Loading-state container; compose it with Skeleton parts for the target context.",
  },
  {
    name: "MessageQuotedPreviewUnavailable",
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
        quotedPreviewLongContent: quotedPreviewLongContentSource,
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
                    path: QUOTED_PREVIEW_STATES_PATH,
                    source: quotedPreviewSource,
                    html: code.quotedPreview,
                    collapsedHtml: code.quotedPreviewBody,
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
          <DocSubsection
            parentId="usage"
            id="direct-message"
            title="Direct message and optional metadata"
          >
            <DocNote>
              Render the channel part as an <code>@</code> label for DMs and omit the hash icon.
              Thread, author meta, and attachments are optional; render those parts only when the
              quoted target has that data. Use <code>MessageQuotedPreviewLoading</code> while
              resolving the target and <code>MessageQuotedPreviewUnavailable</code> when it is
              missing or inaccessible. Archived labels remain caller-owned product policy in the
              context row.
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

          <DocSubsection parentId="usage" id="long-content" title="Long excerpt and attachments">
            <DocNote>
              Quoted text clamps to two lines. Attachments are outside that clamp, so use
              <code>MessageQuotedPreviewAttachments</code> when files must remain visible with a
              long excerpt.
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
        </div>
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
              compositionCollapsedCode: code.quotedPreviewMessageBody,
              compositionPath: QUOTED_PREVIEW_MESSAGE_PATH,
              compositionSource: quotedPreviewMessageSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
