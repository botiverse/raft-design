import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MessageAvatarStatusComposition } from "#/modules/message-item/compositions/avatar-status.composition.tsx";
import avatarStatusSource from "#/modules/message-item/compositions/avatar-status.composition.tsx?raw";
import { MessageContextMenuShowcaseComposition } from "#/modules/message-item/compositions/context-menu-showcase.composition.tsx";
import contextMenuShowcaseSource from "#/modules/message-item/compositions/context-menu-showcase.composition.tsx?raw";
import contextMenuSource from "#/modules/message-item/compositions/context-menu.composition.tsx?raw";
import { MessageConvertingComposition } from "#/modules/message-item/compositions/converting.composition.tsx";
import convertingSource from "#/modules/message-item/compositions/converting.composition.tsx?raw";
import { MessageInteractiveSenderComposition } from "#/modules/message-item/compositions/interactive-sender.composition.tsx";
import interactiveSenderSource from "#/modules/message-item/compositions/interactive-sender.composition.tsx?raw";
import itemPreviewSource from "#/modules/message-item/compositions/item-preview.composition.tsx?raw";
import { MessageReadReceiptComposition } from "#/modules/message-item/compositions/read-receipt.composition.tsx";
import readReceiptSource from "#/modules/message-item/compositions/read-receipt.composition.tsx?raw";
import { MessageReactionsShowcaseComposition } from "#/modules/message-item/compositions/reactions.composition.tsx";
import reactionsSource from "#/modules/message-item/compositions/reactions.composition.tsx?raw";
import reactionPartsSource from "#/modules/message-item/compositions/reaction.compositions.tsx?raw";
import quickReactionPickerSource from "#/modules/message-item/compositions/quick-reaction-picker.composition.tsx?raw";
import reactionGlyphSource from "#/modules/message-item/compositions/reaction-glyph.composition.tsx?raw";
import { MessageRowChromeComposition } from "#/modules/message-item/compositions/row-chrome.composition.tsx";
import rowChromeSource from "#/modules/message-item/compositions/row-chrome.composition.tsx?raw";
import { MessageSearchMatchMarkComposition } from "#/modules/message-item/compositions/search-match-mark.composition.tsx";
import searchMatchMarkSource from "#/modules/message-item/compositions/search-match-mark.composition.tsx?raw";
import { MessageSelectionShowcaseComposition } from "#/modules/message-item/compositions/selection-showcase.composition.tsx";
import selectionShowcaseSource from "#/modules/message-item/compositions/selection-showcase.composition.tsx?raw";
import { MessageSenderStateComposition } from "#/modules/message-item/compositions/sender-state.composition.tsx";
import senderStateSource from "#/modules/message-item/compositions/sender-state.composition.tsx?raw";
import { MessageTaskBadgeComposition } from "#/modules/message-item/compositions/task-badge.composition.tsx";
import taskBadgeSource from "#/modules/message-item/compositions/task-badge.composition.tsx?raw";
import { MessageTextSelectionShowcaseComposition } from "#/modules/message-item/compositions/text-selection.composition.tsx";
import textSelectionSource from "#/modules/message-item/compositions/text-selection.composition.tsx?raw";
import { MessageItemPlaygroundPreview } from "#/modules/message-item/message-item.preview.tsx";
import {
  ANATOMY_SOURCE,
  MESSAGE_ITEM_ATTACHMENTS_PROPS,
  MESSAGE_ITEM_AVATAR_SLOT_PROPS,
  MESSAGE_ITEM_BADGE_PROPS,
  MESSAGE_ITEM_BADGE_SEPARATOR_PROPS,
  MESSAGE_ITEM_BODY_PROPS,
  MESSAGE_ITEM_CONTENT_PROPS,
  MESSAGE_ITEM_CONTINUATION_TIME_PROPS,
  MESSAGE_ITEM_EMBEDDED_PROPS,
  MESSAGE_ITEM_FOOTER_PROPS,
  MESSAGE_ITEM_GUTTER_PROPS,
  MESSAGE_ITEM_HEADER_PROPS,
  MESSAGE_ITEM_INLINE_STATUS_PROPS,
  MESSAGE_ITEM_META_PROPS,
  MESSAGE_ITEM_PROPS,
  MESSAGE_ITEM_READ_RECEIPT_PROPS,
  MESSAGE_ITEM_SAVED_INDICATOR_PROPS,
  MESSAGE_ITEM_SEARCH_MATCH_PROPS,
  MESSAGE_ITEM_SENDER_BADGES_PROPS,
  MESSAGE_ITEM_SENDER_BUTTON_PROPS,
  MESSAGE_ITEM_SENDER_PROPS,
  MESSAGE_ITEM_TIME_PROPS,
  MESSAGE_ITEM_TOOLBAR_BUTTON_PROPS,
  MESSAGE_ITEM_TOOLBAR_PROPS,
  MESSAGE_MULTI_SELECT_CHECKBOX_PROPS,
  MESSAGE_MULTI_SELECT_PROPS,
  MESSAGE_MULTI_SELECT_TOOLBAR_PROPS,
  MESSAGE_REACTION_ADD_BUTTON_PROPS,
  MESSAGE_REACTION_CHIP_PROPS,
  MESSAGE_REACTION_COUNT_PROPS,
  MESSAGE_REACTION_ERROR_INDICATOR_PROPS,
  MESSAGE_REACTION_GLYPH_PROPS,
  MESSAGE_REACTION_PICKER_CONTENT_PROPS,
  MESSAGE_REACTION_PICKER_STATIC_PROPS,
  MESSAGE_REACTION_QUICK_BUTTON_PROPS,
  MESSAGE_REACTION_QUICK_ROW_PROPS,
  MESSAGE_REACTION_TOOLTIP_CONTENT_PROPS,
  MESSAGE_REACTION_TOOLTIP_META_PROPS,
  MESSAGE_REACTION_TOOLTIP_NAME_PROPS,
  MESSAGE_REACTION_TOOLTIP_NAMES_PROPS,
  MESSAGE_REACTION_TOOLTIP_NAME_TEXT_PROPS,
  MESSAGE_REACTION_TOOLTIP_SEPARATOR_PROPS,
  MESSAGE_REFERENCE_BADGE_PROPS,
  MESSAGE_REFERENCE_CHIP_PROPS,
  MESSAGE_REFERENCE_INDICATOR_PROPS,
  MESSAGE_REFERENCE_LABEL_PROPS,
  MESSAGE_REFERENCE_PENDING_PROPS,
  MESSAGE_REFERENCE_TEXT_PROPS,
  MESSAGE_REFERENCE_UNAVAILABLE_PROPS,
  MESSAGE_TEXT_SELECTION_TOOLBAR_BUTTON_PROPS,
  MESSAGE_TEXT_SELECTION_TOOLBAR_PROPS,
  MESSAGE_TEXT_SELECTION_TOOLBAR_SEPARATOR_PROPS,
  TOC,
} from "#/modules/message-item/message-item.snippets.ts";

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
    <Preview>
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
        converting: convertingSource,
        interactiveSender: interactiveSenderSource,
        itemPreview: itemPreviewSource,
        quickReactionPicker: quickReactionPickerSource,
        reactionGlyph: reactionGlyphSource,
        reactionParts: reactionPartsSource,
        reactions: reactionsSource,
        readReceipt: readReceiptSource,
        rowChrome: rowChromeSource,
        searchMatchMark: searchMatchMarkSource,
        selectionShowcase: selectionShowcaseSource,
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
            <Preview>
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

          <DocSubsection parentId="usage" id="row-chrome" title="Row chrome">
            <UsagePreview code={code.rowChrome} collapsedCode={code.rowChromeBody}>
              <MessageRowChromeComposition />
            </UsagePreview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="selection" title="Selection">
            <UsagePreview code={code.selectionShowcase} collapsedCode={code.selectionShowcaseBody}>
              <MessageSelectionShowcaseComposition />
            </UsagePreview>
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
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-message-item" title="MessageItem">
            <PropsTable rows={MESSAGE_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-search-match"
            title="MessageItemSearchMatch"
          >
            <PropsTable rows={MESSAGE_ITEM_SEARCH_MATCH_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-avatar-slot"
            title="MessageItemAvatarSlot"
          >
            <PropsTable rows={MESSAGE_ITEM_AVATAR_SLOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-gutter" title="MessageItemGutter">
            <PropsTable rows={MESSAGE_ITEM_GUTTER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-continuation-time"
            title="MessageItemContinuationTime"
          >
            <PropsTable rows={MESSAGE_ITEM_CONTINUATION_TIME_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-content" title="MessageItemContent">
            <PropsTable rows={MESSAGE_ITEM_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-header" title="MessageItemHeader">
            <PropsTable rows={MESSAGE_ITEM_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-sender" title="MessageItemSender">
            <PropsTable rows={MESSAGE_ITEM_SENDER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-sender-button"
            title="MessageItemSenderButton"
          >
            <PropsTable rows={MESSAGE_ITEM_SENDER_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-sender-badges"
            title="MessageItemSenderBadges"
          >
            <PropsTable rows={MESSAGE_ITEM_SENDER_BADGES_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-meta" title="MessageItemMeta">
            <PropsTable rows={MESSAGE_ITEM_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-time" title="MessageItemTime">
            <PropsTable rows={MESSAGE_ITEM_TIME_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-inline-status"
            title="MessageItemInlineStatus"
          >
            <PropsTable rows={MESSAGE_ITEM_INLINE_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-body" title="MessageItemBody">
            <PropsTable rows={MESSAGE_ITEM_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-attachments"
            title="MessageItemAttachments"
          >
            <PropsTable rows={MESSAGE_ITEM_ATTACHMENTS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-embedded" title="MessageItemEmbedded">
            <PropsTable rows={MESSAGE_ITEM_EMBEDDED_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-footer" title="MessageItemFooter">
            <PropsTable rows={MESSAGE_ITEM_FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-toolbar" title="MessageItemToolbar">
            <PropsTable rows={MESSAGE_ITEM_TOOLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-toolbar-button"
            title="MessageItemToolbarButton"
          >
            <PropsTable rows={MESSAGE_ITEM_TOOLBAR_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-saved-indicator"
            title="MessageItemSavedIndicator"
          >
            <PropsTable rows={MESSAGE_ITEM_SAVED_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-read-receipt"
            title="MessageItemReadReceipt"
          >
            <PropsTable rows={MESSAGE_ITEM_READ_RECEIPT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-item-badge" title="MessageItemBadge">
            <PropsTable rows={MESSAGE_ITEM_BADGE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-badge-separator"
            title="MessageItemBadgeSeparator"
          >
            <PropsTable rows={MESSAGE_ITEM_BADGE_SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-text"
            title="MessageReferenceText"
          >
            <PropsTable rows={MESSAGE_REFERENCE_TEXT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-chip"
            title="MessageReferenceChip"
          >
            <PropsTable rows={MESSAGE_REFERENCE_CHIP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-pending"
            title="MessageReferencePending"
          >
            <PropsTable rows={MESSAGE_REFERENCE_PENDING_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-unavailable"
            title="MessageReferenceUnavailable"
          >
            <PropsTable rows={MESSAGE_REFERENCE_UNAVAILABLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-badge"
            title="MessageReferenceBadge"
          >
            <PropsTable rows={MESSAGE_REFERENCE_BADGE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-label"
            title="MessageReferenceLabel"
          >
            <PropsTable rows={MESSAGE_REFERENCE_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reference-indicator"
            title="MessageReferenceIndicator"
          >
            <PropsTable rows={MESSAGE_REFERENCE_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-reaction-chip" title="MessageReactionChip">
            <PropsTable rows={MESSAGE_REACTION_CHIP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-error-indicator"
            title="MessageReactionErrorIndicator"
          >
            <PropsTable rows={MESSAGE_REACTION_ERROR_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-glyph"
            title="MessageReactionGlyph"
          >
            <PropsTable rows={MESSAGE_REACTION_GLYPH_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-count"
            title="MessageReactionCount"
          >
            <PropsTable rows={MESSAGE_REACTION_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-add-button"
            title="MessageReactionAddButton"
          >
            <PropsTable rows={MESSAGE_REACTION_ADD_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-quick-row"
            title="MessageReactionQuickRow"
          >
            <PropsTable rows={MESSAGE_REACTION_QUICK_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-quick-button"
            title="MessageReactionQuickButton"
          >
            <PropsTable rows={MESSAGE_REACTION_QUICK_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-picker-static"
            title="MessageReactionPickerStatic"
          >
            <PropsTable rows={MESSAGE_REACTION_PICKER_STATIC_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-picker-content"
            title="MessageReactionPickerContent"
          >
            <PropsTable rows={MESSAGE_REACTION_PICKER_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-tooltip-content"
            title="MessageReactionTooltipContent"
          >
            <PropsTable rows={MESSAGE_REACTION_TOOLTIP_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-tooltip-names"
            title="MessageReactionTooltipNames"
          >
            <PropsTable rows={MESSAGE_REACTION_TOOLTIP_NAMES_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-tooltip-name"
            title="MessageReactionTooltipName"
          >
            <PropsTable rows={MESSAGE_REACTION_TOOLTIP_NAME_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-tooltip-name-text"
            title="MessageReactionTooltipNameText"
          >
            <PropsTable rows={MESSAGE_REACTION_TOOLTIP_NAME_TEXT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-tooltip-separator"
            title="MessageReactionTooltipSeparator"
          >
            <PropsTable rows={MESSAGE_REACTION_TOOLTIP_SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-reaction-tooltip-meta"
            title="MessageReactionTooltipMeta"
          >
            <PropsTable rows={MESSAGE_REACTION_TOOLTIP_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-multi-select" title="MessageMultiSelect">
            <PropsTable rows={MESSAGE_MULTI_SELECT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-multi-select-toolbar"
            title="MessageMultiSelectToolbar"
          >
            <PropsTable rows={MESSAGE_MULTI_SELECT_TOOLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-multi-select-checkbox"
            title="MessageMultiSelectCheckbox"
          >
            <PropsTable rows={MESSAGE_MULTI_SELECT_CHECKBOX_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-text-selection-toolbar"
            title="MessageTextSelectionToolbar"
          >
            <PropsTable rows={MESSAGE_TEXT_SELECTION_TOOLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-text-selection-toolbar-button"
            title="MessageTextSelectionToolbarButton"
          >
            <PropsTable rows={MESSAGE_TEXT_SELECTION_TOOLBAR_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-text-selection-toolbar-separator"
            title="MessageTextSelectionToolbarSeparator"
          >
            <PropsTable rows={MESSAGE_TEXT_SELECTION_TOOLBAR_SEPARATOR_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
