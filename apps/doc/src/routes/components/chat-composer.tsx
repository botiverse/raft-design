import { createFileRoute } from "@tanstack/react-router";
import { FileText, ImagePlus, Paperclip, Send, X } from "lucide-react";
import type { ReactNode } from "react";
import { Spinner } from "raft-ui";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import {
  ComposerComposition,
  ComposerDropOverlayComposition,
  ComposerStatesComposition,
  COMPOSER_IMAGE_SRC,
} from "#/compositions/composer-composition.tsx";
import composerCompositionSource from "#/compositions/composer-composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const COMPOSER_COMPOSITION_PATH = "apps/doc/src/compositions/composer-composition.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "states", title: "Attachment and drop states" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  composerComposition: composerCompositionSource,
  anatomy: `import { FileText, ImagePlus, Paperclip, Send, X } from "lucide-react";
import { Checkbox, Spinner } from "raft-ui";
import {
  ChatMainPanelFooter,
  ComposerRoot,
  ChatMainPanelComposer,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerToolbar,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerAttachments,
  ChatMainPanelComposerAttachment,
  ChatMainPanelComposerAttachmentImage,
  ChatMainPanelComposerAttachmentFile,
  ChatMainPanelComposerAttachmentBody,
  ChatMainPanelComposerAttachmentTitle,
  ChatMainPanelComposerAttachmentMeta,
  ChatMainPanelComposerAttachmentOverlay,
  ChatMainPanelComposerAttachmentProgress,
  ChatMainPanelComposerAttachmentRemove,
  ChatMainPanelComposerDropOverlay,
  ChatMainPanelComposerDropOverlayLabel,
  ComposerTaskLabel,
  ComposerTaskToggle,
} from "raft-ui/wip";

<ChatMainPanelFooter onSubmit={handleSubmit}>
  <ComposerRoot>
    <ChatMainPanelComposerAttachments>
      <ChatMainPanelComposerAttachment>
        <ChatMainPanelComposerAttachmentImage alt="" src={previewSrc} />
        <ChatMainPanelComposerAttachmentOverlay tone="uploading">
          <Spinner size="sm" />
          {progress}%
        </ChatMainPanelComposerAttachmentOverlay>
        <ChatMainPanelComposerAttachmentProgress value={progress} />
        <ChatMainPanelComposerAttachmentRemove aria-label="Remove attachment">
          <X />
        </ChatMainPanelComposerAttachmentRemove>
      </ChatMainPanelComposerAttachment>
    </ChatMainPanelComposerAttachments>
    <ChatMainPanelComposer>
      <ChatMainPanelComposerInput placeholder="Message #proj-uiux" />
      <ChatMainPanelComposerToolbar>
        <ChatMainPanelComposerActions>
          <ChatMainPanelComposerIconButton aria-label="Attach image">
            <ImagePlus />
          </ChatMainPanelComposerIconButton>
        </ChatMainPanelComposerActions>
        <ChatMainPanelComposerMeta>
          <ComposerTaskToggle>
            <Checkbox size="sm" aria-label="Send as task" />
            <ComposerTaskLabel>As Task</ComposerTaskLabel>
          </ComposerTaskToggle>
          <ChatMainPanelComposerSubmit aria-label="Send">
            <span>Send</span>
            <Send />
          </ChatMainPanelComposerSubmit>
        </ChatMainPanelComposerMeta>
      </ChatMainPanelComposerToolbar>
    </ChatMainPanelComposer>
  </ComposerRoot>
  <ChatMainPanelComposerDropOverlay aria-hidden>
    <ChatMainPanelComposerDropOverlayLabel>Drop files to attach</ChatMainPanelComposerDropOverlayLabel>
  </ChatMainPanelComposerDropOverlay>
</ChatMainPanelFooter>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ComposerRoot",
    type: "div props & { positioned?: boolean }",
    description:
      "Outer composer composition root for autocomplete, pending attachments, and the bordered composer surface.",
  },
  {
    name: "ChatMainPanelFooter",
    type: "form props",
    description:
      "Composer host at the bottom of the main panel. Owns the top boundary and drop-overlay positioning; submit stays caller-owned.",
  },
  {
    name: "ChatMainPanelComposer / ComposerInput",
    type: "div / textarea props",
    description: "Bordered composer shell and the auto-growing message textarea.",
  },
  {
    name: "ChatMainPanelComposerToolbar / ComposerActions / ComposerMeta",
    type: "div props",
    description:
      "Toolbar row under the input: left attach-action cluster and right meta cluster (As Task, send).",
  },
  {
    name: "ChatMainPanelComposerIconButton / ComposerSubmit",
    type: "button props",
    description:
      "Attach-image/file icon buttons and the primary send button. Pass <span>Send</span> + icon; brutal hides the label via recipe.",
  },
  {
    name: "ComposerTaskToggle / ComposerTaskLabel",
    type: "label / span props",
    description: "As Task checkbox cluster. Toggle owns checkbox↔label gap; label is theme-aware.",
  },
  {
    name: "ChatMainPanelComposerAttachments / ComposerAttachment",
    type: "div props",
    description: "Pending-upload strip above the input and each attachment tile within it.",
  },
  {
    name: "ChatMainPanelComposerAttachmentImage / AttachmentFile",
    type: "img / span props",
    description: "Image thumbnail tile and the file-chip tile for non-image uploads.",
  },
  {
    name: "ChatMainPanelComposerAttachmentBody / AttachmentTitle / AttachmentMeta",
    type: "span props",
    description: "File-chip text block: filename title and mime/type meta line.",
  },
  {
    name: "ChatMainPanelComposerAttachmentOverlay",
    type: "span props",
    description:
      'Tile overlay with tone="uploading" (spinner + percent) or tone="failed" (retry prompt).',
  },
  {
    name: "ChatMainPanelComposerAttachmentProgress / AttachmentRemove",
    type: "span / button props",
    description: "Upload progress bar along the tile bottom and the corner remove affordance.",
  },
  {
    name: "ChatMainPanelComposerDropOverlay / DropOverlayLabel",
    type: "div / span props",
    description: "Drag-and-drop overlay covering the composer form while files hover over it.",
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
      title="ChatMainPanelComposer"
      description="Message composer parts for the main panel footer: input, toolbar, attachment tiles, and drop overlay."
      overview={
        <Differences from="Composer">
          <li>does not own draft state, uploads, submit mutations, or drag-and-drop wiring</li>
          <li>
            keeps the source composer shell, toolbar clusters, attachment tiles, and drop overlay
          </li>
          <li>lives inside ChatMainPanelFooter so the main panel stays the only footer host</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="source-comparison" title="Source comparison">
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceComposerPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <CurrentComposerPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <CurrentComposerPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <CurrentComposerPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
      </DocSection>

      <DocSection id="states" title="Attachment and drop states" showThemeSwitcher>
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceStatesPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel">
                <ComposerStatesComposition />
              </div>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel">
                <ComposerStatesComposition />
              </div>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Source · drop overlay">
            <SourceThemeScope className="h-full">
              <SourceDropOverlayPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal · drop overlay">
            <PreviewThemeScope family="brutal" className="h-full">
              <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel">
                <ComposerDropOverlayComposition />
              </div>
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="chat-composer.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          showLineNumbers={false}
        />
        <DocsCodeBlock.Panel
          path={COMPOSER_COMPOSITION_PATH}
          source={SNIPPETS.composerComposition}
          html={code.composerComposition}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function CurrentComposerPreview() {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel">
      <ComposerComposition />
    </div>
  );
}

function SourceComposerPreview() {
  return (
    <div className="flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-col justify-end overflow-hidden bg-white font-sans text-black">
      <form
        className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex w-full flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
          <textarea
            aria-label="Message #proj-uiux"
            readOnly
            rows={1}
            placeholder="Message #proj-uiux"
            className="min-h-5 max-h-32 w-full resize-none bg-transparent font-sans text-base leading-5 text-black outline-none placeholder:text-black/35 md:min-h-10 md:text-sm"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-brutal-sm bg-white p-1"
                aria-label="Attach image"
              >
                <ImagePlus className="size-3.5" />
              </button>
              <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Attach file">
                <Paperclip className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex select-none items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-flex size-3.5 shrink-0 items-center justify-center border-2 border-black bg-white"
                />
                <span className="text-xs font-bold text-black/60">As Task</span>
              </label>
              <button
                type="submit"
                className="btn-brutal-sm flex size-7 items-center justify-center bg-brutal-pink p-0"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SourceStatesPreview() {
  return (
    <div className="flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-col justify-end overflow-hidden bg-white font-sans text-black">
      <form
        className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <div className="group relative">
              <img
                src={COMPOSER_IMAGE_SRC}
                alt=""
                className="size-16 border-2 border-black object-cover"
              />
              <span className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-white/85 px-1 text-center text-[10px] font-bold text-black">
                <Spinner size="sm" className="mb-1" />
                64%
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full bg-black/15">
                <span className="block h-full w-[64%] bg-brutal-pink" />
              </span>
              <button
                type="button"
                aria-label="Remove screenshot.png"
                className="absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-2.5" />
              </button>
            </div>
            <div className="group relative">
              <span className="flex h-16 w-32 items-center gap-2 border-2 border-black bg-white px-2">
                <FileText className="size-4 shrink-0 text-black/70" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-black">
                    release-notes.pdf
                  </span>
                  <span className="block truncate text-[10px] text-black/50">application/pdf</span>
                </span>
              </span>
              <button
                type="button"
                aria-label="Remove release-notes.pdf"
                className="absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-2.5" />
              </button>
            </div>
            <div className="group relative">
              <span className="flex h-16 w-32 items-center gap-2 border-2 border-black bg-white px-2">
                <FileText className="size-4 shrink-0 text-black/70" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-black">deck.key</span>
                  <span className="block truncate text-[10px] text-black/50">
                    application/octet-stream
                  </span>
                </span>
              </span>
              <span className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-brutal-orange/90 px-1 text-center text-[10px] leading-3 font-bold text-black">
                Upload failed
                <span className="underline">Tap to retry</span>
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
            <textarea
              aria-label="Message #proj-uiux"
              readOnly
              rows={1}
              placeholder="Message #proj-uiux"
              className="min-h-5 max-h-32 w-full resize-none bg-transparent font-sans text-base leading-5 text-black outline-none placeholder:text-black/35 md:min-h-10 md:text-sm"
            />
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Attach file">
                <Paperclip className="size-3.5" />
              </button>
              <button
                type="submit"
                className="btn-brutal-sm flex size-7 items-center justify-center bg-brutal-pink p-0"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SourceDropOverlayPreview() {
  return (
    <div className="flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-col justify-end overflow-hidden bg-white font-sans text-black">
      <form
        className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex w-full flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
          <textarea
            aria-label="Message #proj-uiux"
            readOnly
            rows={1}
            placeholder="Message #proj-uiux"
            className="min-h-5 max-h-32 w-full resize-none bg-transparent font-sans text-base leading-5 text-black outline-none placeholder:text-black/35 md:min-h-10 md:text-sm"
          />
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Attach file">
              <Paperclip className="size-3.5" />
            </button>
            <button
              type="submit"
              className="btn-brutal-sm flex size-7 items-center justify-center bg-brutal-pink p-0"
              aria-label="Send"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 z-30 flex items-center justify-center border-2 border-dashed border-brutal-pink bg-brutal-pink/15"
        >
          <span className="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-brutal-sm">
            Drop files to attach
          </span>
        </div>
      </form>
    </div>
  );
}
