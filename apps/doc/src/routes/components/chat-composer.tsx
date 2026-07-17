import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import {
  ComposerAttachmentStatesComposition,
  ComposerCompactReplyComposition,
  ComposerDefaultComposition,
  ComposerDropOverlayComposition,
} from "#/modules/chat-composer/chat-composer.composition.tsx";
import { ChatComposerPreview } from "#/modules/chat-composer/chat-composer.preview.tsx";
import composerAttachmentStatesSource from "#/modules/chat-composer/compositions/composer-attachment-states.composition.tsx?raw";
import composerCompactReplySource from "#/modules/chat-composer/compositions/composer-compact-reply.composition.tsx?raw";
import composerCompositionSource from "#/modules/chat-composer/compositions/composer-default.composition.tsx?raw";
import composerDropOverlaySource from "#/modules/chat-composer/compositions/composer-drop-overlay.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SNIPPET = `<ComposerRoot>
  <ComposerAttachments>
    <ComposerAttachment>
      <ComposerAttachmentImage />
      <ComposerAttachmentUploadingOverlay>
        <Spinner />
      </ComposerAttachmentUploadingOverlay>
      <ComposerAttachmentProgress />
      <ComposerAttachmentRemove />
    </ComposerAttachment>
    <ComposerAttachment>
      <ComposerAttachmentFile>
        <ComposerAttachmentBody>
          <ComposerAttachmentTitle />
          <ComposerAttachmentMeta />
        </ComposerAttachmentBody>
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
    <ComposerDropOverlayLabel />
  </ComposerDropOverlay>
</ComposerRoot>`;

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  attachmentStates: composerAttachmentStatesSource,
  compactReply: composerCompactReplySource,
  composition: composerCompositionSource,
  dropOverlay: composerDropOverlaySource,
} as const;

const PROPS: readonly PropRow[] = [
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
    type: "button props",
    description:
      "Primary send button. Pass visible content as children; brutal may hide its text label through the recipe.",
  },
  {
    name: "ComposerToolbarLabel",
    type: "label props",
    description: "A labelled checkbox or status cluster with theme-aware spacing and typography.",
  },
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
    name: "ComposerAttachmentImage",
    type: "img props",
    description: "Image thumbnail tile.",
  },
  {
    name: "ComposerAttachmentFile",
    type: "span props",
    description: "File-chip tile for non-image uploads.",
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
    description: "Uploading overlay for caller-owned spinner and progress content.",
  },
  {
    name: "ComposerAttachmentFailedOverlay",
    type: "span props",
    description: "Failed overlay for caller-owned retry content.",
  },
  {
    name: "ComposerAttachmentProgress",
    type: "span props",
    description: "Upload progress indicator along the tile bottom.",
  },
  {
    name: "ComposerAttachmentRemove",
    type: "button props",
    description: "Corner remove affordance.",
  },
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
        <ChatComposerPreview />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <Example html={code.composition} previewClassName="min-h-[22rem] items-stretch">
          <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
            <ComposerDefaultComposition />
          </div>
        </Example>
      </DocSection>

      <DocSection id="states" title="States" showThemeSwitcher>
        <div className="grid gap-8">
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">
              Pending and failed attachments
            </h3>
            <Example html={code.attachmentStates} previewClassName="min-h-[22rem] items-stretch">
              <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                <ComposerAttachmentStatesComposition />
              </div>
            </Example>
          </section>
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">File drop overlay</h3>
            <Example html={code.dropOverlay} previewClassName="min-h-[22rem] items-stretch">
              <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end">
                <ComposerDropOverlayComposition />
              </div>
            </Example>
          </section>
        </div>
        <section className="mt-8 grid gap-3">
          <h3 className="text-sm font-medium text-foreground-strong">Compact thread reply</h3>
          <DocNote>
            Compact consumers compose fewer parts and own their send lifecycle. The first submit in
            this example fails deterministically, then restores the draft for a successful retry.
          </DocNote>
          <Example html={code.compactReply} previewClassName="items-stretch">
            <div className="w-full min-w-0">
              <ComposerCompactReplyComposition />
            </div>
          </Example>
        </section>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
