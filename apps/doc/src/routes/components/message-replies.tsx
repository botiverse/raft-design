import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageRepliesDefaultComposition } from "#/modules/message-replies/compositions/default.composition.tsx";
import messageRepliesDefaultSource from "#/modules/message-replies/compositions/default.composition.tsx?raw";
import { MessageRepliesSingleUnreadComposition } from "#/modules/message-replies/compositions/single-unread.composition.tsx";
import messageRepliesSingleUnreadSource from "#/modules/message-replies/compositions/single-unread.composition.tsx?raw";
import { MessageRepliesUnreadDraftComposition } from "#/modules/message-replies/compositions/unread-draft.composition.tsx";
import messageRepliesUnreadDraftSource from "#/modules/message-replies/compositions/unread-draft.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const MESSAGE_REPLIES_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Single interactive thread-preview surface. Use render to replace the default button with the consumer's link.",
  },
];

const MESSAGE_REPLIES_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Flex container that spaces its direct summary fragments by 4px.",
  },
];

const MESSAGE_REPLIES_SUMMARY_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Inline summary fragment with an optional icon. It centers children and standardizes nested SVG icon size; use render for semantic emphasis.",
  },
];

const MESSAGE_REPLIES_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "One compact reply-preview row. Compose the avatar and fields as children.",
  },
];

const MESSAGE_REPLIES_ITEM_SENDER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Non-shrinking sender display name.",
  },
];

const MESSAGE_REPLIES_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Flexible, single-line truncated reply excerpt.",
  },
];

const MESSAGE_REPLIES_ITEM_TIME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"time">',
    description: "Semantic timestamp aligned to the trailing edge.",
  },
];

export const Route = createFileRoute("/components/message-replies")({
  component: MessageRepliesDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: messageRepliesDefaultSource,
        preview: messageRepliesDefaultSource,
        singleUnread: messageRepliesSingleUnreadSource,
        unreadDraft: messageRepliesUnreadDraftSource,
      },
    }),
});

function MessageRepliesDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageReplies"
      description="A single thread-opening surface with an authoritative count and up to three recent reply previews."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <MessageRepliesDefaultComposition />
          </Preview.Canvas>
          <Preview.Code html={code.preview} collapsedHtml={code.previewBody} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="single-unread-reply" title="Single unread reply">
            <DocNote>
              Use singular count copy when the thread contains one reply, then append unread status
              when that reply is new.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <MessageRepliesSingleUnreadComposition />
              </Preview.Canvas>
              <Preview.Code html={code.singleUnread} collapsedHtml={code.singleUnreadBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="unread-replies-with-draft"
            title="Unread replies with draft"
          >
            <DocNote>
              Keep unread count and draft status in the summary. The draft body belongs in the
              composer and is not rendered in the preview.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <MessageRepliesUnreadDraftComposition />
              </Preview.Canvas>
              <Preview.Code html={code.unreadDraft} collapsedHtml={code.unreadDraftBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-message-replies" title="MessageReplies">
            <PropsTable rows={MESSAGE_REPLIES_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-replies-summary"
            title="MessageRepliesSummary"
          >
            <PropsTable rows={MESSAGE_REPLIES_SUMMARY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-replies-summary-item"
            title="MessageRepliesSummaryItem"
          >
            <PropsTable rows={MESSAGE_REPLIES_SUMMARY_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-replies-item" title="MessageRepliesItem">
            <PropsTable rows={MESSAGE_REPLIES_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-replies-item-sender"
            title="MessageRepliesItemSender"
          >
            <PropsTable rows={MESSAGE_REPLIES_ITEM_SENDER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-replies-item-content"
            title="MessageRepliesItemContent"
          >
            <PropsTable rows={MESSAGE_REPLIES_ITEM_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-replies-item-time"
            title="MessageRepliesItemTime"
          >
            <PropsTable rows={MESSAGE_REPLIES_ITEM_TIME_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
