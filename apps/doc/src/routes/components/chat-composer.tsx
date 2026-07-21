import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import {
  ComposerAttachmentLimitComposition,
  ComposerAttachmentStatesComposition,
  ComposerAttachmentsReorderComposition,
  ComposerAttachmentsScrollComposition,
  ComposerAttachmentsScrollReorderComposition,
  ComposerDefaultComposition,
  ComposerDropOverlayComposition,
  ComposerFooterAddComposition,
  ComposerFooterNoticeComposition,
  ComposerWithLightboxComposition,
} from "#/modules/chat-composer/chat-composer.composition.tsx";
import { ChatComposerPreview } from "#/modules/chat-composer/chat-composer.preview.tsx";
import {
  ComposerAttachmentStatesSourceComparison,
  ComposerDefaultSourceComparison,
  ComposerDropOverlaySourceComparison,
} from "#/modules/chat-composer/chat-composer.source-comparison.tsx";
import composerAttachmentLimitSource from "#/modules/chat-composer/compositions/composer-attachment-limit.composition.tsx?raw";
import composerAttachmentStatesSource from "#/modules/chat-composer/compositions/composer-attachment-states.composition.tsx?raw";
import composerAttachmentsReorderSource from "#/modules/chat-composer/compositions/composer-attachments-reorder.composition.tsx?raw";
import composerAttachmentsScrollSource from "#/modules/chat-composer/compositions/composer-attachments-scroll.composition.tsx?raw";
import composerAttachmentsScrollReorderSource from "#/modules/chat-composer/compositions/composer-attachments-scroll-reorder.composition.tsx?raw";
import composerCompositionSource from "#/modules/chat-composer/compositions/composer-default.composition.tsx?raw";
import composerDropOverlaySource from "#/modules/chat-composer/compositions/composer-drop-overlay.composition.tsx?raw";
import composerFooterAddSource from "#/modules/chat-composer/compositions/composer-footer-add.composition.tsx?raw";
import composerFooterNoticeSource from "#/modules/chat-composer/compositions/composer-footer-notice.composition.tsx?raw";
import composerWithLightboxSource from "#/modules/chat-composer/compositions/composer-with-lightbox.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock MessageInput composer",
    scenes: [
      {
        label: "Composer shell",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageInput.tsx:1787",
      },
      {
        label: "Pending attachments",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageInput.tsx:287",
      },
      {
        label: "Drop overlay",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageInput.tsx:1550",
      },
    ],
  },
] as const;

const ANATOMY_SNIPPET = `<div className="relative">
  <ComposerRoot>
    <ComposerAttachments>
      {/* wrap: SortableComposerAttachments — scroll: SortableComposerAttachmentsScroll */}
      <SortableComposerAttachmentsScroll items={ids} onReorder={onReorder}>
        <SortableComposerAttachment id="shot" label="screenshot.png">
          <ComposerAttachment>
            <ComposerAttachmentImage />
            <ComposerAttachmentUploadingOverlay>
              <Spinner />
              64%
            </ComposerAttachmentUploadingOverlay>
            <ComposerAttachmentUploadProgressBar value={64} />
            <ComposerAttachmentRemove />
          </ComposerAttachment>
        </SortableComposerAttachment>
        <SortableComposerAttachment id="notes" label="release-notes.pdf">
          <ComposerAttachment>
            <ComposerAttachmentFile>
              <ComposerAttachmentBody>
                <ComposerAttachmentTitle />
                <ComposerAttachmentMeta>18 KB</ComposerAttachmentMeta>
              </ComposerAttachmentBody>
              <ComposerAttachmentUploadingOverlay>
                <Spinner />
                64%
              </ComposerAttachmentUploadingOverlay>
              <ComposerAttachmentUploadProgressBar value={64} />
            </ComposerAttachmentFile>
            <ComposerAttachmentRemove />
          </ComposerAttachment>
        </SortableComposerAttachment>
      </SortableComposerAttachmentsScroll>
    </ComposerAttachments>
    <Composer>
      <ComposerInput />
      <ComposerToolbar>
        <ComposerActions>
          <ComposerIconButton />
        </ComposerActions>
        <ComposerMeta>
          <ComposerToolbarLabel>
            <Checkbox />
            As Task
          </ComposerToolbarLabel>
          <ComposerSubmit />
        </ComposerMeta>
      </ComposerToolbar>
    </Composer>
  </ComposerRoot>
  <ComposerDropOverlay>
    <ComposerDropOverlayPrompt />
  </ComposerDropOverlay>
</div>`;

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  attachmentLimit: composerAttachmentLimitSource,
  attachmentStates: composerAttachmentStatesSource,
  attachmentsReorder: composerAttachmentsReorderSource,
  attachmentsScroll: composerAttachmentsScrollSource,
  attachmentsScrollReorder: composerAttachmentsScrollReorderSource,
  composition: composerCompositionSource,
  dropOverlay: composerDropOverlaySource,
  footerAdd: composerFooterAddSource,
  footerNotice: composerFooterNoticeSource,
  withLightbox: composerWithLightboxSource,
} as const;

const COMPOSER_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "form props",
    description:
      "Composition root for autocomplete, pending attachments, and the bordered composer surface.",
  },
];

const COMPOSER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Bordered composer shell.",
  },
];

const COMPOSER_INPUT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "textarea props",
    description: "Auto-growing message textarea.",
  },
];

const COMPOSER_TOOLBAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Toolbar row under the input.",
  },
];

const COMPOSER_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Caller-owned action cluster in the toolbar.",
  },
];

const COMPOSER_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Caller-owned metadata cluster in the toolbar.",
  },
];

const COMPOSER_ICON_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Attach-action icon button.",
  },
];

const COMPOSER_SUBMIT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Button props",
    description:
      "Accent Button used for submit. Use Button size, loading, and render props; pass visible content as children.",
  },
];

const COMPOSER_TOOLBAR_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "label props",
    description: "A labelled checkbox or status cluster with theme-aware spacing and typography.",
  },
];

const COMPOSER_ATTACHMENTS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Pending-upload strip above the input.",
  },
];

const COMPOSER_ATTACHMENTS_SCROLL_AREA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Opt-in single-row overflow with prev/next arrows. Prefer SortableComposerAttachmentsScroll when reorder is needed — that wrapper includes this shell.",
  },
];

const SORTABLE_COMPOSER_ATTACHMENTS_PROPS: readonly PropRow[] = [
  {
    name: "items",
    type: "readonly string[]",
    description: "Ordered attachment ids. Consumer owns the list and maps ids back to tile data.",
  },
  {
    name: "onReorder",
    type: "(items: string[]) => void",
    description:
      "Commits the reordered id list on drag end. Live draft order is kept inside the sortable while dragging.",
  },
  {
    name: "children",
    type: "ReactNode",
    description: "SortableComposerAttachment children for each id in items.",
  },
];

const SORTABLE_COMPOSER_ATTACHMENTS_SCROLL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "SortableComposerAttachments props",
    description:
      "Thin wrapper: ComposerAttachmentsScrollArea + horizontal sort strategy + x-only autoscroll.",
  },
];

const SORTABLE_COMPOSER_ATTACHMENT_PROPS: readonly PropRow[] = [
  {
    name: "id",
    type: "string",
    description: "Stable id matching an entry in the parent items list.",
  },
  {
    name: "label",
    type: "string",
    description: "Accessible name used for the reorder control (e.g. filename).",
  },
  {
    name: "children",
    type: "ReactNode",
    description: "ComposerAttachment tile content. DragOverlay clones this as the pointer ghost.",
  },
];

const COMPOSER_ATTACHMENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Attachment tile within the pending-upload strip.",
  },
];

const COMPOSER_ATTACHMENT_FILE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "File-chip tile for non-image uploads.",
  },
];

const COMPOSER_ATTACHMENT_IMAGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description:
      "Fixed 64px image media. Place FilePreview media inside. The attachment root owns the brutal frame border when this part is present.",
  },
];

const COMPOSER_ATTACHMENT_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "File-chip text block.",
  },
];

const COMPOSER_ATTACHMENT_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Attachment filename.",
  },
];

const COMPOSER_ATTACHMENT_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Attachment mime/type metadata.",
  },
];

const COMPOSER_ATTACHMENT_UPLOADING_OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description:
      "White upload overlay for caller-owned progress content. For images, place as a sibling under ComposerAttachment; for files, nest inside ComposerAttachmentFile.",
  },
];

const COMPOSER_ATTACHMENT_UPLOAD_PROGRESS_BAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props & { value: number }",
    description:
      "Bottom linear upload progress bar. Place next to the uploading overlay (image: under ComposerAttachment; file: inside ComposerAttachmentFile).",
  },
];

const COMPOSER_ATTACHMENT_FAILED_OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Borderless failed-upload mask for caller-owned retry feedback.",
  },
];

const COMPOSER_ATTACHMENT_REMOVE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Corner remove affordance.",
  },
];

const COMPOSER_DROP_OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Drag-and-drop overlay that fills its nearest positioned ancestor. May sit inside ComposerRoot or outside it on a shared relative wrapper.",
  },
];

const COMPOSER_DROP_OVERLAY_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Visible drop feedback content.",
  },
];

const COMPOSER_DROP_OVERLAY_PROMPT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Default drop feedback prompt; pass children to replace its visible content.",
  },
];

export const Route = createFileRoute("/components/chat-composer")({
  component: ChatComposerDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatComposerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Composer"
      description="Composable message-editor parts for an input, toolbar, attachments, and drag-and-drop feedback."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ChatComposerPreview code={code.composition} collapsedCode={code.compositionBody} />
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
          <DocSubsection parentId="usage" id="default-composer" title="Default composer">
            <Preview previewClassName="min-h-[22rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                  <ComposerDefaultComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.composition} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachment-states"
            title="Pending and failed attachments"
          >
            <Preview previewClassName="min-h-[22rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                  <ComposerAttachmentStatesComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.attachmentStates} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="attachment-limit" title="Attachment limit banner">
            <DocNote>
              Attachment count limits are product policy. Keep the Banner outside Composer and show
              it when the consumer rejects another file.
            </DocNote>
            <Preview previewClassName="min-h-[24rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[24rem] w-full min-w-0 flex-col justify-end">
                  <ComposerAttachmentLimitComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.attachmentLimit} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachments-scroll"
            title="Single-row attachments with arrows"
          >
            <DocNote>
              Use <code>SortableComposerAttachmentsScroll</code> inside{" "}
              <code>ComposerAttachments</code> for a single-row strip (arrows + horizontal reorder).
              For wrapping tiles, use <code>SortableComposerAttachments</code> instead.
            </DocNote>
            <Preview previewClassName="min-h-[22rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                  <ComposerAttachmentsScrollComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.attachmentsScroll} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachments-reorder"
            title="Reorder attachments (wrap)"
          >
            <DocNote>
              Use <code>SortableComposerAttachments</code> with consumer-owned order. Pass string{" "}
              <code>items</code> / <code>onReorder</code>; render each tile inside{" "}
              <code>SortableComposerAttachment</code>.
            </DocNote>
            <Preview previewClassName="min-h-[22rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                  <ComposerAttachmentsReorderComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.attachmentsReorder} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="attachments-scroll-reorder"
            title="Reorder attachments (scroll)"
          >
            <DocNote>
              <code>SortableComposerAttachmentsScroll</code> is a thin wrapper around{" "}
              <code>ComposerAttachmentsScrollArea</code> with horizontal sort + x-only autoscroll.
              Same <code>items</code> / <code>onReorder</code> contract as the wrap variant.
            </DocNote>
            <Preview previewClassName="min-h-[22rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                  <ComposerAttachmentsScrollReorderComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.attachmentsScrollReorder} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="with-lightbox" title="Ready images with lightbox">
            <DocNote>
              Composer does not own preview state. Ready image attachments stay clickable tiles; the
              consumer opens Lightbox and owns gallery index / navigation.
            </DocNote>
            <Preview previewClassName="min-h-[22rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                  <ComposerWithLightboxComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.withLightbox} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="drop-overlay" title="File drop overlay">
            <Preview previewClassName="min-h-[22rem] items-stretch">
              <Preview.Canvas>
                <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                  <ComposerDropOverlayComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.dropOverlay} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="custom-toolbar" title="Custom toolbar">
            <DocNote>
              Toolbar slots are consumer-owned. Replace the left actions with policy copy when send
              is blocked, or with a single custom affordance while keeping submit on the right.
            </DocNote>
            <Preview previewClassName="items-center">
              <Preview.Canvas>
                <div className="w-full min-w-0">
                  <ComposerFooterNoticeComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.footerNotice} />
            </Preview>
            <Preview previewClassName="items-center">
              <Preview.Canvas>
                <div className="w-full min-w-0">
                  <ComposerFooterAddComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.footerAdd} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-composer-root" title="ComposerRoot">
            <PropsTable rows={COMPOSER_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer" title="Composer">
            <PropsTable rows={COMPOSER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-input" title="ComposerInput">
            <PropsTable rows={COMPOSER_INPUT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-toolbar" title="ComposerToolbar">
            <PropsTable rows={COMPOSER_TOOLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-actions" title="ComposerActions">
            <PropsTable rows={COMPOSER_ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-meta" title="ComposerMeta">
            <PropsTable rows={COMPOSER_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-icon-button" title="ComposerIconButton">
            <PropsTable rows={COMPOSER_ICON_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-submit" title="ComposerSubmit">
            <PropsTable rows={COMPOSER_SUBMIT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-toolbar-label"
            title="ComposerToolbarLabel"
          >
            <PropsTable rows={COMPOSER_TOOLBAR_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-attachments" title="ComposerAttachments">
            <PropsTable rows={COMPOSER_ATTACHMENTS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachments-scroll-area"
            title="ComposerAttachmentsScrollArea"
          >
            <PropsTable rows={COMPOSER_ATTACHMENTS_SCROLL_AREA_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sortable-composer-attachments"
            title="SortableComposerAttachments"
          >
            <PropsTable rows={SORTABLE_COMPOSER_ATTACHMENTS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sortable-composer-attachments-scroll"
            title="SortableComposerAttachmentsScroll"
          >
            <PropsTable rows={SORTABLE_COMPOSER_ATTACHMENTS_SCROLL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sortable-composer-attachment"
            title="SortableComposerAttachment"
          >
            <PropsTable rows={SORTABLE_COMPOSER_ATTACHMENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-attachment" title="ComposerAttachment">
            <PropsTable rows={COMPOSER_ATTACHMENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-file"
            title="ComposerAttachmentFile"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_FILE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-image"
            title="ComposerAttachmentImage"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_IMAGE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-body"
            title="ComposerAttachmentBody"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-title"
            title="ComposerAttachmentTitle"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-meta"
            title="ComposerAttachmentMeta"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_META_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-uploading-overlay"
            title="ComposerAttachmentUploadingOverlay"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_UPLOADING_OVERLAY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-upload-progress-bar"
            title="ComposerAttachmentUploadProgressBar"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_UPLOAD_PROGRESS_BAR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-failed-overlay"
            title="ComposerAttachmentFailedOverlay"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_FAILED_OVERLAY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-attachment-remove"
            title="ComposerAttachmentRemove"
          >
            <PropsTable rows={COMPOSER_ATTACHMENT_REMOVE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-composer-drop-overlay" title="ComposerDropOverlay">
            <PropsTable rows={COMPOSER_DROP_OVERLAY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-drop-overlay-label"
            title="ComposerDropOverlayLabel"
          >
            <PropsTable rows={COMPOSER_DROP_OVERLAY_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-composer-drop-overlay-prompt"
            title="ComposerDropOverlayPrompt"
          >
            <PropsTable rows={COMPOSER_DROP_OVERLAY_PROMPT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Default composer",
              status: "difference",
              note: "Source keeps the icon-only pink send control and CheckMarker task toggle inside MessageInput. Current exposes the same card as composable parts and lets submit/label content stay consumer-owned.",
              source: (
                <SourceThemeScope className="w-full">
                  <ComposerDefaultSourceComparison />
                </SourceThemeScope>
              ),
              brutal: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerDefaultComposition />
                </div>
              ),
              elegant: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerDefaultComposition />
                </div>
              ),
              elegantDark: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerDefaultComposition />
                </div>
              ),
              compositionCode: code.composition,
              compositionPath:
                "apps/doc/src/modules/chat-composer/compositions/composer-default.composition.tsx",
              compositionSource: composerCompositionSource,
            },
            {
              label: "Pending and failed attachments",
              status: "difference",
              note: "Source attachment chips are inline MessageInput markup (64px image / w-32 file + FileText). Current splits the same states into ComposerAttachment parts with FilePreview media.",
              source: (
                <SourceThemeScope className="w-full">
                  <ComposerAttachmentStatesSourceComparison />
                </SourceThemeScope>
              ),
              brutal: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerAttachmentStatesComposition />
                </div>
              ),
              elegant: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerAttachmentStatesComposition />
                </div>
              ),
              elegantDark: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerAttachmentStatesComposition />
                </div>
              ),
              compositionCode: code.attachmentStates,
              compositionPath:
                "apps/doc/src/modules/chat-composer/compositions/composer-attachment-states.composition.tsx",
              compositionSource: composerAttachmentStatesSource,
            },
            {
              label: "File drop overlay",
              status: "difference",
              note: "Source uses a pink dashed wash with a bordered label chip. Current keeps the same prompt copy but restyles the overlay as a dark scrim with stacked file icons.",
              source: (
                <SourceThemeScope className="w-full">
                  <ComposerDropOverlaySourceComparison />
                </SourceThemeScope>
              ),
              brutal: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerDropOverlayComposition />
                </div>
              ),
              elegant: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerDropOverlayComposition />
                </div>
              ),
              elegantDark: (
                <div className="flex w-full min-w-0 flex-col justify-end p-3">
                  <ComposerDropOverlayComposition />
                </div>
              ),
              compositionCode: code.dropOverlay,
              compositionPath:
                "apps/doc/src/modules/chat-composer/compositions/composer-drop-overlay.composition.tsx",
              compositionSource: composerDropOverlaySource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
