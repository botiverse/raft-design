import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ForwardedBundleCompactComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-compact.composition.tsx";
import forwardedBundleCompactSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-compact.composition.tsx?raw";
import { ForwardedBundleLongContentComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-long-content.composition.tsx";
import forwardedBundleLongContentSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-long-content.composition.tsx?raw";
import { ForwardedBundleStaticSourceComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-static-source.composition.tsx";
import forwardedBundleStaticSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-static-source.composition.tsx?raw";
import { ForwardedBundleThreadComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-thread.composition.tsx";
import forwardedBundleThreadSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle-thread.composition.tsx?raw";
import {
  ForwardedBundleEmbeddedComposition,
  MessageForwardedBundleShowcaseComposition,
} from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import forwardedBundleSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `import {
  MessageForwardedBundle,
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachmentMeta,
  MessageForwardedBundleAttachmentName,
  MessageForwardedBundleAttachments,
  MessageForwardedBundleFooter,
  MessageForwardedBundleFooterAction,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderContent,
  MessageForwardedBundleHeaderCount,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleSource,
} from "raft-ui";

<MessageForwardedBundle>
  <MessageForwardedBundleHeader>
    <MessageForwardedBundleHeaderContent>
      <MessageForwardedBundleHeaderLabel />
      <MessageForwardedBundleHeaderCount />
    </MessageForwardedBundleHeaderContent>
    <MessageForwardedBundleSource />
  </MessageForwardedBundleHeader>
  <MessageForwardedBundleItems collapsed>
    <MessageForwardedBundleItem>
      <MessageForwardedBundleItemMeta>
        <MessageForwardedBundleItemAuthor />
      </MessageForwardedBundleItemMeta>
      <MessageForwardedBundleItemContent />
      <MessageForwardedBundleAttachments>
        <MessageForwardedBundleAttachment>
          <MessageForwardedBundleAttachmentName />
          <MessageForwardedBundleAttachmentMeta />
        </MessageForwardedBundleAttachment>
      </MessageForwardedBundleAttachments>
    </MessageForwardedBundleItem>
  </MessageForwardedBundleItems>
  <MessageForwardedBundleFooter>
    <MessageForwardedBundleFooterAction />
  </MessageForwardedBundleFooter>
</MessageForwardedBundle>`;

const MESSAGE_FORWARDED_BUNDLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Forwarded messages card root. Compose inside MessageItemEmbedded; the component owns the eight-line fold by default.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Bundle header row.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_HEADER_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Leading header region for the forwarded label and count.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_HEADER_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Forwarded label.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_HEADER_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Forwarded message count label.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_SOURCE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Interactive public source link; render as an anchor when navigation is available.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_SOURCE_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Static public source label when the original message cannot be opened.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ITEMS_PROPS: readonly PropRow[] = [
  {
    name: "collapsed",
    type: "boolean",
    description:
      "Consumer-owned fold. Set to constrain the item-list height and show its bottom fade; omit to let the component measure its content and manage the fold itself (folds when the items' text together renders beyond eight lines).",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Item list. Without `collapsed` the surface measures its item-content slots and owns the fold.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"article">',
    description: "One forwarded message snapshot.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ITEM_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Author and timestamp row for an item.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ITEM_AUTHOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Forwarded item author label.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "The item's text body. The component-owned fold measures these slots: their combined content beyond eight lines folds the card.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ATTACHMENTS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Attachment-chip region for an item.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ATTACHMENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "One forwarded attachment chip.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ATTACHMENT_NAME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncated attachment filename.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_ATTACHMENT_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Attachment type or other compact metadata.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Footer container for caller-owned actions.",
  },
];

const MESSAGE_FORWARDED_BUNDLE_FOOTER_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Styled action slot for the forwarded bundle footer.",
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

export const Route = createFileRoute("/components/message-forwarded-bundle")({
  component: MessageForwardedBundleDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        forwardedBundle: forwardedBundleSource,
        forwardedBundleCompact: forwardedBundleCompactSource,
        forwardedBundleLongContent: forwardedBundleLongContentSource,
        forwardedBundleStaticSource: forwardedBundleStaticSource,
        forwardedBundleThread: forwardedBundleThreadSource,
      },
    }),
});

function MessageForwardedBundleDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageForwardedBundle"
      description="Collapsed forwarded-message bundle composed inside a MessageItem body."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <UsagePreview code={code.forwardedBundle} collapsedCode={code.forwardedBundleBody}>
          <MessageForwardedBundleShowcaseComposition />
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
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="compact" title="Compact bundle">
            <DocNote>
              One to three short forwarded messages render expanded and omit the footer. A DM,
              private channel, or missing target also omits the source label.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleCompact}
              collapsedCode={code.forwardedBundleCompactBody}
            >
              <ForwardedBundleCompactComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="collapsed" title="Collapsed bundle">
            <DocNote>
              A bundle folds when the items' text together renders beyond eight lines. When{" "}
              <InlineCode>MessageForwardedBundleItems</InlineCode> renders without a{" "}
              <InlineCode>collapsed</InlineCode> prop the component measures this itself: the list
              clips with its own fade and the footer appears only while the content actually folds.
              Passing <InlineCode>collapsed</InlineCode> keeps the consumer-owned mode. The
              measurement reads the <InlineCode>MessageForwardedBundleItemContent</InlineCode>{" "}
              slots, so wrap each item's text body in one — unwrapped text is never measured.
            </DocNote>
            <UsagePreview code={code.forwardedBundle} collapsedCode={code.forwardedBundleBody}>
              <ForwardedBundleEmbeddedComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="long-content" title="Long content and attachments">
            <DocNote>
              A single forwarded item folds under the same eight-line rule. Attachment labels stay
              caller-owned, including their MIME-derived type text.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleLongContent}
              collapsedCode={code.forwardedBundleLongContentBody}
            >
              <ForwardedBundleLongContentComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="thread-source" title="Thread source">
            <DocNote>
              A public thread source is actionable and adds the thread suffix to its label.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleThread}
              collapsedCode={code.forwardedBundleThreadBody}
            >
              <ForwardedBundleThreadComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="static-source" title="Static source label">
            <DocNote>
              Render a static source label when the original message cannot be opened, such as
              unavailable provenance or a composer preview. An empty forwarded-items list has no
              rendered bundle.
            </DocNote>
            <UsagePreview
              code={code.forwardedBundleStaticSource}
              collapsedCode={code.forwardedBundleStaticSourceBody}
            >
              <ForwardedBundleStaticSourceComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle"
            title="MessageForwardedBundle"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-header"
            title="MessageForwardedBundleHeader"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-header-content"
            title="MessageForwardedBundleHeaderContent"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_HEADER_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-header-label"
            title="MessageForwardedBundleHeaderLabel"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_HEADER_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-header-count"
            title="MessageForwardedBundleHeaderCount"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_HEADER_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-source"
            title="MessageForwardedBundleSource"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_SOURCE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-source-label"
            title="MessageForwardedBundleSourceLabel"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_SOURCE_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-items"
            title="MessageForwardedBundleItems"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ITEMS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-item"
            title="MessageForwardedBundleItem"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-item-meta"
            title="MessageForwardedBundleItemMeta"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ITEM_META_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-item-author"
            title="MessageForwardedBundleItemAuthor"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ITEM_AUTHOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-item-content"
            title="MessageForwardedBundleItemContent"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ITEM_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-attachments"
            title="MessageForwardedBundleAttachments"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ATTACHMENTS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-attachment"
            title="MessageForwardedBundleAttachment"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ATTACHMENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-attachment-name"
            title="MessageForwardedBundleAttachmentName"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ATTACHMENT_NAME_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-attachment-meta"
            title="MessageForwardedBundleAttachmentMeta"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_ATTACHMENT_META_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-footer"
            title="MessageForwardedBundleFooter"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-forwarded-bundle-footer-action"
            title="MessageForwardedBundleFooterAction"
          >
            <PropsTable rows={MESSAGE_FORWARDED_BUNDLE_FOOTER_ACTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
