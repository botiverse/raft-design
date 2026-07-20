import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import {
  ComposerAttachmentStatesComposition,
  ComposerCompactComposition,
  ComposerDefaultComposition,
  ComposerDropOverlayComposition,
  ComposerWithLightboxComposition,
} from "#/modules/chat-composer/chat-composer.composition.tsx";
import { ChatComposerPreview } from "#/modules/chat-composer/chat-composer.preview.tsx";
import composerAttachmentStatesSource from "#/modules/chat-composer/compositions/composer-attachment-states.composition.tsx?raw";
import composerCompactSource from "#/modules/chat-composer/compositions/composer-compact-reply.composition.tsx?raw";
import composerCompositionSource from "#/modules/chat-composer/compositions/composer-default.composition.tsx?raw";
import composerDropOverlaySource from "#/modules/chat-composer/compositions/composer-drop-overlay.composition.tsx?raw";
import composerWithLightboxSource from "#/modules/chat-composer/compositions/composer-with-lightbox.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SNIPPET = `<div className="relative">
  <ComposerRoot>
    <ComposerAttachments>
      <ComposerAttachment>
        <ComposerAttachmentImage />
        <ComposerAttachmentUploadingOverlay>
          <Spinner />
          64%
        </ComposerAttachmentUploadingOverlay>
        <ComposerAttachmentUploadProgressBar value={64} />
        <ComposerAttachmentRemove />
      </ComposerAttachment>
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
  attachmentStates: composerAttachmentStatesSource,
  compact: composerCompactSource,
  composition: composerCompositionSource,
  dropOverlay: composerDropOverlaySource,
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
      overview={
        <Differences from="Composer">
          <li>does not own draft state, uploads, submit mutations, or drag-and-drop wiring</li>
          <li>
            keeps the source composer shell, toolbar clusters, attachment tiles, and drop overlay
          </li>
          <li>is hosted by a caller-owned main or thread footer rather than owning either panel</li>
          <li>leaves inline @/# autocomplete behavior and popup anatomy to ComposerSuggestions</li>
        </Differences>
      }
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

      <DocSection id="usage" title="Usage" showThemeSwitcher>
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

          <DocSubsection parentId="usage" id="compact-composer" title="Compact composer">
            <DocNote>
              Compact consumers omit attachment actions and use only a shorter input, status, and
              submit. Use this shape for a comment or note; thread replies use the full composer
              with attachments.
            </DocNote>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <div className="w-full min-w-0">
                  <ComposerCompactComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.compact} />
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
    </DocPage>
  );
}
