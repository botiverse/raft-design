import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageAvatarStatusComposition } from "#/modules/message-item/compositions/avatar-status.composition.tsx";
import avatarStatusSource from "#/modules/message-item/compositions/avatar-status.composition.tsx?raw";
import { MessageContextMenuShowcaseComposition } from "#/modules/message-item/compositions/context-menu-showcase.composition.tsx";
import contextMenuShowcaseSource from "#/modules/message-item/compositions/context-menu-showcase.composition.tsx?raw";
import contextMenuSource from "#/modules/message-item/compositions/context-menu.composition.tsx?raw";
import { MessageCollapsibleContentComposition } from "#/modules/message-item/compositions/collapsible-content.composition.tsx";
import collapsibleContentSource from "#/modules/message-item/compositions/collapsible-content.composition.tsx?raw";
import { MessageConvertingComposition } from "#/modules/message-item/compositions/converting.composition.tsx";
import convertingSource from "#/modules/message-item/compositions/converting.composition.tsx?raw";
import { MessageInteractiveSenderComposition } from "#/modules/message-item/compositions/interactive-sender.composition.tsx";
import interactiveSenderSource from "#/modules/message-item/compositions/interactive-sender.composition.tsx?raw";
import itemPreviewSource from "#/modules/message-item/compositions/item-preview.composition.tsx?raw";
import { MessageItemPreviewContent } from "#/modules/message-item/compositions/preview.composition.tsx";
import messageItemPreviewCompositionSource from "#/modules/message-item/compositions/preview.composition.tsx?raw";
import { MessageReadReceiptComposition } from "#/modules/message-item/compositions/read-receipt.composition.tsx";
import readReceiptSource from "#/modules/message-item/compositions/read-receipt.composition.tsx?raw";
import { MessageReactionsShowcaseComposition } from "#/modules/message-item/compositions/reactions.composition.tsx";
import reactionsSource from "#/modules/message-item/compositions/reactions.composition.tsx?raw";
import reactionPartsSource from "#/modules/message-item/compositions/reaction.compositions.tsx?raw";
import quickReactionPickerSource from "#/modules/message-item/compositions/quick-reaction-picker.composition.tsx?raw";
import reactionGlyphSource from "#/modules/message-item/compositions/reaction-glyph.composition.tsx?raw";
import { MessageRowChromeComposition } from "#/modules/message-item/compositions/row-chrome.composition.tsx";
import rowChromeSource from "#/modules/message-item/compositions/row-chrome.composition.tsx?raw";
import selectionSource from "#/modules/message-item/compositions/selection.compositions.tsx?raw";
import { MessageSearchMatchMarkComposition } from "#/modules/message-item/compositions/search-match-mark.composition.tsx";
import searchMatchMarkSource from "#/modules/message-item/compositions/search-match-mark.composition.tsx?raw";
import { MessageSenderStateComposition } from "#/modules/message-item/compositions/sender-state.composition.tsx";
import senderStateSource from "#/modules/message-item/compositions/sender-state.composition.tsx?raw";
import { MessageTaskBadgeComposition } from "#/modules/message-item/compositions/task-badge.composition.tsx";
import taskBadgeSource from "#/modules/message-item/compositions/task-badge.composition.tsx?raw";
import { MessageTextSelectionShowcaseComposition } from "#/modules/message-item/compositions/text-selection.composition.tsx";
import textSelectionSource from "#/modules/message-item/compositions/text-selection.composition.tsx?raw";
import { MessageItemPlaygroundPreview } from "#/modules/message-item/message-item.preview.tsx";
import { SourceMessageItemPreview } from "#/modules/message-item/message-item.source-preview.tsx";
import { ANATOMY_SOURCE, API_GROUPS, TOC } from "#/modules/message-item/message-item.snippets.ts";

const CONTEXT_MENU_SHOWCASE_PATH =
  "apps/doc/src/modules/message-item/compositions/context-menu-showcase.composition.tsx";
const CONTEXT_MENU_PATH =
  "apps/doc/src/modules/message-item/compositions/context-menu.composition.tsx";
const REACTIONS_PATH = "apps/doc/src/modules/message-item/compositions/reactions.composition.tsx";
const REACTION_PARTS_PATH =
  "apps/doc/src/modules/message-item/compositions/reaction.compositions.tsx";
const QUICK_REACTION_PICKER_PATH =
  "apps/doc/src/modules/message-item/compositions/quick-reaction-picker.composition.tsx";
const REACTION_GLYPH_PATH =
  "apps/doc/src/modules/message-item/compositions/reaction-glyph.composition.tsx";
const ROW_CHROME_PATH = "apps/doc/src/modules/message-item/compositions/row-chrome.composition.tsx";
const SELECTION_PATH = "apps/doc/src/modules/message-item/compositions/selection.compositions.tsx";

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

export const Route = createFileRoute("/components/message-item")({
  component: MessageItemDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        avatarStatus: avatarStatusSource,
        contextMenu: contextMenuSource,
        contextMenuShowcase: contextMenuShowcaseSource,
        collapsibleContent: collapsibleContentSource,
        converting: convertingSource,
        interactiveSender: interactiveSenderSource,
        itemPreview: itemPreviewSource,
        preview: messageItemPreviewCompositionSource,
        quickReactionPicker: quickReactionPickerSource,
        reactionGlyph: reactionGlyphSource,
        reactionParts: reactionPartsSource,
        reactions: reactionsSource,
        readReceipt: readReceiptSource,
        rowChrome: rowChromeSource,
        selection: selectionSource,
        searchMatchMark: searchMatchMarkSource,
        senderState: senderStateSource,
        taskBadge: taskBadgeSource,
        textSelection: textSelectionSource,
      },
    }),
});

function MessageItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MessageItem"
      description="Business-agnostic message row chrome and the body blocks composed inside it."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <MessageItemPlaygroundPreview
          code={code.itemPreview}
          collapsedCode={code.itemPreviewBody}
        />
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
          <DocSubsection parentId="usage" id="sender-state" title="Sender state">
            <UsagePreview code={code.senderState} collapsedCode={code.senderStateBody}>
              <MessageSenderStateComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="avatar-status" title="Avatar status">
            <UsagePreview code={code.avatarStatus} collapsedCode={code.avatarStatusBody}>
              <MessageAvatarStatusComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="converting" title="Converting">
            <UsagePreview code={code.converting} collapsedCode={code.convertingBody}>
              <MessageConvertingComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="interactive-sender" title="Interactive sender">
            <UsagePreview code={code.interactiveSender} collapsedCode={code.interactiveSenderBody}>
              <MessageInteractiveSenderComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="task-badge" title="Task badge">
            <UsagePreview code={code.taskBadge} collapsedCode={code.taskBadgeBody}>
              <MessageTaskBadgeComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="read-receipt" title="Read receipt">
            <UsagePreview code={code.readReceipt} collapsedCode={code.readReceiptBody}>
              <MessageReadReceiptComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="reactions" title="Reactions">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <MessageReactionsShowcaseComposition />
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <DocsCodeBlock.Files
                    collapsible={false}
                    files={[
                      {
                        path: REACTIONS_PATH,
                        source: reactionsSource,
                        html: code.reactions,
                        collapsedHtml: code.reactionsBody,
                      },
                      {
                        path: REACTION_PARTS_PATH,
                        source: reactionPartsSource,
                        html: code.reactionParts,
                        collapsedHtml: code.reactionPartsBody,
                      },
                      {
                        path: QUICK_REACTION_PICKER_PATH,
                        source: quickReactionPickerSource,
                        html: code.quickReactionPicker,
                        collapsedHtml: code.quickReactionPickerBody,
                      },
                      {
                        path: REACTION_GLYPH_PATH,
                        source: reactionGlyphSource,
                        html: code.reactionGlyph,
                        collapsedHtml: code.reactionGlyphBody,
                      },
                    ]}
                  />
                }
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="context-menu" title="Context menu">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <MessageContextMenuShowcaseComposition />
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <DocsCodeBlock.Files
                    collapsible={false}
                    files={[
                      {
                        path: CONTEXT_MENU_SHOWCASE_PATH,
                        source: contextMenuShowcaseSource,
                        html: code.contextMenuShowcase,
                        collapsedHtml: code.contextMenuShowcaseBody,
                      },
                      {
                        path: CONTEXT_MENU_PATH,
                        source: contextMenuSource,
                        html: code.contextMenu,
                        collapsedHtml: code.contextMenuBody,
                      },
                    ]}
                  />
                }
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="collapsible-content" title="Collapsible content">
            <UsagePreview
              code={code.collapsibleContent}
              collapsedCode={code.collapsibleContentBody}
            >
              <MessageCollapsibleContentComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="row-chrome" title="Row chrome">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <MessageRowChromeComposition />
              </Preview.Canvas>
              <Preview.Code
                codeBlock={
                  <DocsCodeBlock.Files
                    collapsible={false}
                    files={[
                      {
                        path: ROW_CHROME_PATH,
                        source: rowChromeSource,
                        html: code.rowChrome,
                        collapsedHtml: code.rowChromeBody,
                      },
                      {
                        path: SELECTION_PATH,
                        source: selectionSource,
                        html: code.selection,
                        collapsedHtml: code.selectionBody,
                      },
                    ]}
                  />
                }
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="search-match-mark" title="Search match + mark">
            <UsagePreview code={code.searchMatchMark} collapsedCode={code.searchMatchMarkBody}>
              <MessageSearchMatchMarkComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="text-selection" title="Text selection">
            <UsagePreview code={code.textSelection} collapsedCode={code.textSelectionBody}>
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
              note: "The Source pane is a non-interactive DOM fixture extracted from the current Slock row; its controls are intentionally disabled. Brutal and Elegant execute the canonical docs composition with product data and navigation kept consumer-owned.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope>
                  <SourceMessageItemPreview />
                </SourceThemeScope>
              ),
              brutal: <MessageItemPreviewContent />,
              elegant: <MessageItemPreviewContent />,
              elegantDark: <MessageItemPreviewContent />,
              compositionCode: code.preview,
              compositionCollapsedCode: code.previewBody,
              compositionPath:
                "apps/doc/src/modules/message-item/compositions/preview.composition.tsx",
              compositionSource: messageItemPreviewCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
