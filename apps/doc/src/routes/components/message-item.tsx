import type { ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageActionCardShowcaseComposition } from "#/modules/message-action-card/compositions/action-card.composition.tsx";
import actionCardSource from "#/modules/message-action-card/compositions/action-card.composition.tsx?raw";
import { MessageAttachmentPreviewSurfacesComposition } from "#/modules/message-attachment/compositions/attachment-preview-surfaces.composition.tsx";
import attachmentPreviewSurfacesSource from "#/modules/message-attachment/compositions/attachment-preview-surfaces.composition.tsx?raw";
import { MessageAttachmentsShowcaseComposition } from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx";
import attachmentsShowcaseSource from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx?raw";
import { MessageForwardedBundleShowcaseComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import forwardedBundleSource from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx?raw";
import { MessageConsecutiveComposition } from "#/modules/message-item/compositions/consecutive.composition.tsx";
import consecutiveSource from "#/modules/message-item/compositions/consecutive.composition.tsx?raw";
import { MessageContextMenuShowcaseComposition } from "#/modules/message-item/compositions/context-menu-showcase.composition.tsx";
import contextMenuShowcaseSource from "#/modules/message-item/compositions/context-menu-showcase.composition.tsx?raw";
import { MessageConvertingComposition } from "#/modules/message-item/compositions/converting.composition.tsx";
import convertingSource from "#/modules/message-item/compositions/converting.composition.tsx?raw";
import { MessageInteractiveSenderComposition } from "#/modules/message-item/compositions/interactive-sender.composition.tsx";
import interactiveSenderSource from "#/modules/message-item/compositions/interactive-sender.composition.tsx?raw";
import { MessageItemPreview } from "#/modules/message-item/compositions/item-preview.composition.tsx";
import messageItemPreviewSource from "#/modules/message-item/compositions/item-preview.composition.tsx?raw";
import messageItemPreviewCompositionSource from "#/modules/message-item/compositions/preview.composition.tsx?raw";
import { MessageReactionsShowcaseComposition } from "#/modules/message-item/compositions/reactions.composition.tsx";
import reactionsSource from "#/modules/message-item/compositions/reactions.composition.tsx?raw";
import { MessageReadReceiptComposition } from "#/modules/message-item/compositions/read-receipt.composition.tsx";
import readReceiptSource from "#/modules/message-item/compositions/read-receipt.composition.tsx?raw";
import { MessageReferenceShowcaseComposition } from "#/modules/message-item/compositions/reference-showcase.composition.tsx";
import referenceShowcaseSource from "#/modules/message-item/compositions/reference-showcase.composition.tsx?raw";
import { MessageRepliesComposition } from "#/modules/message-item/compositions/replies.composition.tsx";
import repliesSource from "#/modules/message-item/compositions/replies.composition.tsx?raw";
import { MessageRowChromeComposition } from "#/modules/message-item/compositions/row-chrome.composition.tsx";
import rowChromeSource from "#/modules/message-item/compositions/row-chrome.composition.tsx?raw";
import { MessageSavedComposition } from "#/modules/message-item/compositions/saved.composition.tsx";
import savedSource from "#/modules/message-item/compositions/saved.composition.tsx?raw";
import { MessageSenderStateComposition } from "#/modules/message-item/compositions/sender-state.composition.tsx";
import senderStateSource from "#/modules/message-item/compositions/sender-state.composition.tsx?raw";
import { MessageTaskBadgeComposition } from "#/modules/message-item/compositions/task-badge.composition.tsx";
import taskBadgeSource from "#/modules/message-item/compositions/task-badge.composition.tsx?raw";
import { MessageTextSelectionShowcaseComposition } from "#/modules/message-item/compositions/text-selection.composition.tsx";
import textSelectionSource from "#/modules/message-item/compositions/text-selection.composition.tsx?raw";
import { MessageToolbarComposition } from "#/modules/message-item/compositions/toolbar.composition.tsx";
import toolbarSource from "#/modules/message-item/compositions/toolbar.composition.tsx?raw";
import { MessageTranslationShowcaseComposition } from "#/modules/message-item/compositions/translation-showcase.composition.tsx";
import translationShowcaseSource from "#/modules/message-item/compositions/translation-showcase.composition.tsx?raw";
import { MessageItemPlaygroundPreview } from "#/modules/message-item/message-item.preview.tsx";
import { SourceMessageItemPreview } from "#/modules/message-item/message-item.source-preview.tsx";
import { ANATOMY_SOURCE, API_GROUPS, TOC } from "#/modules/message-item/message-item.snippets.ts";
import { MessageMarkdownShowcaseComposition } from "#/modules/message-markdown/compositions/markdown.composition.tsx";
import markdownSource from "#/modules/message-markdown/compositions/markdown.composition.tsx?raw";
import { MessageQuotedPreviewShowcaseComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";
import quotedPreviewSource from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx?raw";

const SOURCE_SCENES = [
  {
    label: "Slock message row",
    scenes: [
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
    ],
  },
] as const;

function UsagePreview({ children, code }: { children: ReactNode; code: ReactNode }) {
  return (
    <Preview previewMode="light" previewClassName="items-stretch">
      <Preview.Canvas>{children}</Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

export const Route = createFileRoute("/components/message-item")({
  component: MessageItemDoc,
  loader: () =>
    highlightSnippets({
      data: {
        actionCard: actionCardSource,
        anatomy: ANATOMY_SOURCE,
        attachmentsShowcase: attachmentsShowcaseSource,
        attachmentPreviewSurfaces: attachmentPreviewSurfacesSource,
        consecutive: consecutiveSource,
        contextMenu: contextMenuShowcaseSource,
        converting: convertingSource,
        forwardedBundle: forwardedBundleSource,
        interactiveSender: interactiveSenderSource,
        markdown: markdownSource,
        preview: messageItemPreviewCompositionSource,
        quotedPreview: quotedPreviewSource,
        reactions: reactionsSource,
        readReceipt: readReceiptSource,
        referenceShowcase: referenceShowcaseSource,
        replies: repliesSource,
        rowChrome: rowChromeSource,
        saved: savedSource,
        senderState: senderStateSource,
        taskBadge: taskBadgeSource,
        textSelection: textSelectionSource,
        toolbar: toolbarSource,
        translationShowcase: translationShowcaseSource,
      },
    }),
});

function MessageItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageItem"
      description="Business-agnostic message row chrome and the body blocks composed inside it."
      overview={
        <Differences from="MessageItem">
          <li>
            store data, permission checks, reaction picker state, and thread behavior stay outside
          </li>
          <li>context menu is composed with the existing ContextMenu primitive</li>
          <li>
            active, search-match, and selection chrome use explicit composition roots without owning
            business state
          </li>
          <li>
            product copy, icons, callbacks, and async state live in docs compositions rather than
            the UI package
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocNote>
        Centered system-event rows are a timeline peer — see{" "}
        <Link to="/components/system-message">SystemMessage</Link>.
      </DocNote>

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <MessageItemPlaygroundPreview code={code.preview} collapsedCode={code.previewBody} />
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
          <DocSubsection parentId="usage" id="consecutive" title="Consecutive">
            <UsagePreview code={code.consecutive}>
              <MessageConsecutiveComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sender-state" title="Sender state">
            <UsagePreview code={code.senderState}>
              <MessageSenderStateComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="converting" title="Converting">
            <UsagePreview code={code.converting}>
              <MessageConvertingComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="interactive-sender" title="Interactive sender">
            <UsagePreview code={code.interactiveSender}>
              <MessageInteractiveSenderComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="markdown" title="Markdown">
            <UsagePreview code={code.markdown}>
              <MessageMarkdownShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="translation" title="Translation">
            <UsagePreview code={code.translationShowcase}>
              <div className="w-full max-w-3xl">
                <MessageTranslationShowcaseComposition />
              </div>
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="references" title="References">
            <UsagePreview code={code.referenceShowcase}>
              <div className="w-full max-w-3xl">
                <MessageReferenceShowcaseComposition />
              </div>
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="quoted-preview" title="Quoted preview">
            <UsagePreview code={code.quotedPreview}>
              <MessageQuotedPreviewShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="forwarded-bundle" title="Forwarded bundle">
            <UsagePreview code={code.forwardedBundle}>
              <MessageForwardedBundleShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="action-card" title="Action card">
            <UsagePreview code={code.actionCard}>
              <MessageActionCardShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="attachments" title="Attachments">
            <UsagePreview code={code.attachmentsShowcase}>
              <MessageAttachmentsShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachment-preview-surfaces"
            title="Attachment preview surfaces"
          >
            <UsagePreview code={code.attachmentPreviewSurfaces}>
              <MessageAttachmentPreviewSurfacesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="task-badge" title="Task badge">
            <UsagePreview code={code.taskBadge}>
              <MessageTaskBadgeComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="replies" title="Replies">
            <UsagePreview code={code.replies}>
              <MessageRepliesComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="saved" title="Saved">
            <UsagePreview code={code.saved}>
              <MessageSavedComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="reactions" title="Reactions">
            <UsagePreview code={code.reactions}>
              <MessageReactionsShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="read-receipt" title="Read receipt">
            <UsagePreview code={code.readReceipt}>
              <MessageReadReceiptComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="toolbar" title="Toolbar">
            <UsagePreview code={code.toolbar}>
              <MessageToolbarComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="context-menu" title="Context menu">
            <UsagePreview code={code.contextMenu}>
              <MessageContextMenuShowcaseComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="row-chrome" title="Row chrome">
            <UsagePreview code={code.rowChrome}>
              <MessageRowChromeComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="text-selection" title="Text selection">
            <UsagePreview code={code.textSelection}>
              <MessageTextSelectionShowcaseComposition />
            </UsagePreview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="grid gap-8">
          {API_GROUPS.map((group) => (
            <DocSubsection key={group.id} parentId="api" id={group.id} title={group.title}>
              <PropsTable rows={group.rows} />
            </DocSubsection>
          ))}
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Standard message row",
              status: "review",
              note: "The source fixture preserves the visible sender, content, and reply structure; product data, reactions, and thread navigation remain consumer-owned composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope>
                  <SourceMessageItemPreview />
                </SourceThemeScope>
              ),
              brutal: <MessageItemPreview reactions replies toolbar />,
              elegant: <MessageItemPreview reactions replies toolbar />,
              elegantDark: <MessageItemPreview reactions replies toolbar />,
              compositionCode: messageItemPreviewSource,
              compositionPath:
                "apps/doc/src/modules/message-item/compositions/item-preview.composition.tsx",
              compositionSource: messageItemPreviewSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
