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
  ComposerDefaultComposition,
  ComposerDropOverlayComposition,
  ComposerFooterIntegrationComposition,
} from "#/modules/chat-composer/chat-composer.composition.tsx";
import { ChatComposerPreview } from "#/modules/chat-composer/chat-composer.preview.tsx";
import composerAttachmentStatesSource from "#/modules/chat-composer/compositions/composer-attachment-states.composition.tsx?raw";
import composerCompositionSource from "#/modules/chat-composer/compositions/composer-default.composition.tsx?raw";
import composerDropOverlaySource from "#/modules/chat-composer/compositions/composer-drop-overlay.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "states", title: "States" },
  { id: "integration", title: "Integration" },
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
  composition: composerCompositionSource,
  dropOverlay: composerDropOverlaySource,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ComposerRoot",
    type: "div props & { positioned?: boolean }",
    description:
      "Composition root for autocomplete, pending attachments, and the bordered composer surface.",
  },
  {
    name: "Composer / ComposerInput",
    type: "div / textarea props",
    description: "Bordered composer shell and the auto-growing message textarea.",
  },
  {
    name: "ComposerToolbar / ComposerActions / ComposerMeta",
    type: "div props",
    description:
      "Toolbar row under the input: caller-owned action cluster and caller-owned metadata cluster.",
  },
  {
    name: "ComposerIconButton / ComposerSubmit",
    type: "button props",
    description:
      "Attach-action icon buttons and the primary send button. Pass visible content as children; brutal may hide the text label through its recipe.",
  },
  {
    name: "ComposerToolbarLabel",
    type: "label props",
    description: "A labelled checkbox or status cluster with theme-aware spacing and typography.",
  },
  {
    name: "ComposerAttachments / ComposerAttachment",
    type: "div props",
    description: "Pending-upload strip above the input and each attachment tile within it.",
  },
  {
    name: "ComposerAttachmentImage / ComposerAttachmentFile",
    type: "img / span props",
    description: "Image thumbnail tile and file-chip tile for non-image uploads.",
  },
  {
    name: "ComposerAttachmentBody / ComposerAttachmentTitle / ComposerAttachmentMeta",
    type: "span props",
    description: "File-chip text block: filename title and mime/type metadata.",
  },
  {
    name: "ComposerAttachmentUploadingOverlay / ComposerAttachmentFailedOverlay",
    type: "span props",
    description:
      "Explicit uploading and failed overlays for caller-owned spinner, progress, and retry content.",
  },
  {
    name: "ComposerAttachmentProgress / ComposerAttachmentRemove",
    type: "span / button props",
    description:
      "Upload progress indicator along the tile bottom and the corner remove affordance.",
  },
  {
    name: "ComposerDropOverlay / ComposerDropOverlayLabel",
    type: "div / span props",
    description: "Drag-and-drop overlay covering the composer root while files hover over it.",
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
      </DocSection>

      <DocSection id="integration" title="Integration" showThemeSwitcher>
        <DocNote>
          Composer supplies only the editor structure. The consumer selects the panel footer host,
          owns the form submit handler and draft lifecycle, and places <code>ComposerRoot</code>{" "}
          inside that host.
        </DocNote>
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Main panel footer</h3>
            <div className="h-[22rem] overflow-hidden">
              <ComposerFooterIntegrationComposition host="main" />
            </div>
          </section>
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Thread panel footer</h3>
            <div className="h-[22rem] overflow-hidden">
              <ComposerFooterIntegrationComposition host="thread" />
            </div>
          </section>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
