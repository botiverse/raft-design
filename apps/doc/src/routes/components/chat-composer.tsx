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

const ANATOMY_SNIPPET = `<ComposerRoot>
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
  <ComposerDropOverlay>
    <ComposerDropOverlayPrompt />
  </ComposerDropOverlay>
</ComposerRoot>`;

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  attachmentStates: composerAttachmentStatesSource,
  compact: composerCompactSource,
  composition: composerCompositionSource,
  dropOverlay: composerDropOverlaySource,
  withLightbox: composerWithLightboxSource,
} as const;

const ROOT_COMPOSER_PROPS: readonly PropRow[] = [
  {
    name: "ComposerRoot",
    type: "form props",
    description:
      "Composition root for autocomplete, pending attachments, and the bordered composer surface.",
  },
  {
    name: "Composer",
    type: "div props",
    description: "Bordered composer shell.",
  },
  {
    name: "ComposerInput",
    type: "textarea props",
    description: "Auto-growing message textarea.",
  },
];

const TOOLBAR_PROPS: readonly PropRow[] = [
  {
    name: "ComposerToolbar",
    type: "div props",
    description: "Toolbar row under the input.",
  },
  {
    name: "ComposerActions",
    type: "div props",
    description: "Caller-owned action cluster in the toolbar.",
  },
  {
    name: "ComposerMeta",
    type: "div props",
    description: "Caller-owned metadata cluster in the toolbar.",
  },
  {
    name: "ComposerIconButton",
    type: "button props",
    description: "Attach-action icon button.",
  },
  {
    name: "ComposerSubmit",
    type: "Button props",
    description:
      "Accent Button used for submit. Use Button size, loading, and render props; pass visible content as children.",
  },
  {
    name: "ComposerToolbarLabel",
    type: "label props",
    description: "A labelled checkbox or status cluster with theme-aware spacing and typography.",
  },
];

const ATTACHMENT_PROPS: readonly PropRow[] = [
  {
    name: "ComposerAttachments",
    type: "div props",
    description: "Pending-upload strip above the input.",
  },
  {
    name: "ComposerAttachment",
    type: "div props",
    description: "Attachment tile within the pending-upload strip.",
  },
  {
    name: "ComposerAttachmentFile",
    type: "span props",
    description: "File-chip tile for non-image uploads.",
  },
  {
    name: "ComposerAttachmentImage",
    type: "span props",
    description:
      "Fixed 64px image media. Place FilePreview media inside. The attachment root owns the brutal frame border when this part is present.",
  },
  {
    name: "ComposerAttachmentBody",
    type: "span props",
    description: "File-chip text block.",
  },
  {
    name: "ComposerAttachmentTitle",
    type: "span props",
    description: "Attachment filename.",
  },
  {
    name: "ComposerAttachmentMeta",
    type: "span props",
    description: "Attachment mime/type metadata.",
  },
  {
    name: "ComposerAttachmentUploadingOverlay",
    type: "span props",
    description:
      "White upload overlay for caller-owned progress content. For images, place as a sibling under ComposerAttachment; for files, nest inside ComposerAttachmentFile.",
  },
  {
    name: "ComposerAttachmentUploadProgressBar",
    type: "span props & { value: number }",
    description:
      "Bottom linear upload progress bar. Place next to the uploading overlay (image: under ComposerAttachment; file: inside ComposerAttachmentFile).",
  },
  {
    name: "ComposerAttachmentFailedOverlay",
    type: "span props",
    description: "Borderless failed-upload mask for caller-owned retry feedback.",
  },
  {
    name: "ComposerAttachmentRemove",
    type: "button props",
    description: "Corner remove affordance.",
  },
];

const DROP_OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "ComposerDropOverlay",
    type: "div props",
    description: "Drag-and-drop overlay covering the composer root while files hover over it.",
  },
  {
    name: "ComposerDropOverlayLabel",
    type: "span props",
    description: "Visible drop feedback content.",
  },
  {
    name: "ComposerDropOverlayPrompt",
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
          <DocSubsection parentId="api" id="api-root-composer" title="Root and composer">
            <PropsTable rows={ROOT_COMPOSER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-toolbar" title="Toolbar">
            <PropsTable rows={TOOLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-attachments" title="Attachments">
            <PropsTable rows={ATTACHMENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-drop-overlay" title="Drop overlay">
            <PropsTable rows={DROP_OVERLAY_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
