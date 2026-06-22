import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "@raft/ui";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useCallback, useEffect, useEffectEvent, useState } from "react";

import { Callout } from "#/components/callout.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling (if any beyond the dim backdrop)"] as const;

const DEMO_IMAGES = [
  {
    filename: "product-shot.png",
    cells: ["bg-brutal-cyan/35", "bg-brutal-yellow/45"],
  },
  {
    filename: "wireframe-board.png",
    cells: ["bg-brutal-lime/45", "bg-brutal-pink/35"],
  },
  {
    filename: "release-card.png",
    cells: ["bg-brutal-lavender/45", "bg-brutal-orange/40"],
  },
] as const;

const lightboxArrowButtonClassName = (disabled: boolean) =>
  disabled
    ? "pointer-events-auto flex size-12 cursor-default items-center justify-center border-2 border-white/10 bg-white/5 text-white/20"
    : "pointer-events-auto flex size-12 items-center justify-center border-2 border-black bg-white text-black transition-colors duration-100 hover:bg-brutal-yellow";

const SNIPPETS = {
  anatomy: `import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "@raft/ui";

<Lightbox>
  <LightboxTrigger render={<Button variant="default" />}>Open lightbox</LightboxTrigger>
  <LightboxContent className="flex flex-col">
    <LightboxHeader>
      <div className="flex h-14 items-center gap-3 px-4">
        <LightboxTitle>product-shot.png</LightboxTitle>
        <LightboxActions>
          <LightboxClose render={<Button type="button" size="icon-sm" aria-label="Close" />}>
            <X />
          </LightboxClose>
        </LightboxActions>
      </div>
    </LightboxHeader>
    <LightboxStage>
      <LightboxMedia render={<img src={url} alt="" />} />
    </LightboxStage>
  </LightboxContent>
</Lightbox>
`,
  sourceBackdrop: `<Lightbox
  onClose={close}
  className="flex flex-col"
  data-testid="image-lightbox"
>
  <div className="safe-top safe-left safe-right pointer-events-auto shrink-0 border-b-2 border-black bg-white">
    ...
  </div>
  <div className="relative flex flex-1 items-center justify-center overflow-hidden">
    ...
  </div>
</Lightbox>`,
  currentBackdrop: `<Lightbox open onOpenChange={(open) => { if (!open) close() }}>
  <LightboxContent className="flex flex-col" data-testid="image-lightbox">
    <LightboxHeader>...</LightboxHeader>
    <LightboxStage>...</LightboxStage>
  </LightboxContent>
</Lightbox>`,
  sourceRender: `<div
  className={\`\${positionClass} \${backdropClass} \${className}\`}
>
  ...
</div>`,
  currentRender: `<LightboxContent render={<section aria-label="Attachment preview" />}>
  ...
</LightboxContent>`,
  sourceMechanics: `return createPortal(
  <div
    ref={rootRef}
    className={\`\${positionClass} \${backdropClass} \${className}\`}
    style={{ zIndex }}
    onClick={dismissOnBackdrop ? handleBackdropClick : undefined}
  >
    {children}
  </div>,
  document.body
)`,
  currentMechanics: `const dialogRef = useRef<Dialog.Root.Actions>(null);
const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
const effectiveOpen = open ?? uncontrolledOpen;

function LightboxModWClose({ dialogRef }) {
  useHotkey("Mod+W", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dialogRef.current?.close();
  });
  return null;
}

<Dialog.Root
  actionsRef={dialogRef}
  open={open}
  modal
  onOpenChange={onOpenChange}
>
  {closeOnModW && effectiveOpen ? <LightboxModWClose dialogRef={dialogRef} /> : null}
  {children}
</Dialog.Root>`,
  sourceChildren: `<Lightbox onClose={close} className="flex flex-col">
  <Header />
  <Stage />
</Lightbox>`,
  currentChildren: `function Lightbox({ closeOnModW = true, children, ...props }) {
  const dialogRef = useRef<Dialog.Root.Actions>(null);
  const modWClose = closeOnModW && effectiveOpen
    ? <LightboxModWClose dialogRef={dialogRef} />
    : null;

  return (
    <Dialog.Root actionsRef={dialogRef} {...props}>
      {modWClose}
      {children}
    </Dialog.Root>
  );
}`,
  currentContent: `function LightboxContent({ className, ...props }) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className={backdrop()} />
      <Dialog.Popup className={content({ className })} {...props} />
    </Dialog.Portal>
  );
}`,
  sourceSwitching: `const { images, currentIndex, next, prev, goTo } = useImageLightboxStore();
const current = images[currentIndex];

useEffect(() => {
  if (!isOpen) return;
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, handleKeyDown]);

<Lightbox onClose={close} className="flex flex-col">
  <div onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
    <button onClick={() => !isFirst && prev()}>...</button>
    <img src={displaySrc} alt={current.filename} />
    <button onClick={() => !isLast && next()}>...</button>
    {images.map((img, idx) => <button onClick={() => goTo(idx)}>...</button>)}
  </div>
</Lightbox>`,
  currentSwitching: `const [open, setOpen] = useState(false);
const [imageIndex, setImageIndex] = useState(0);
const updateOpen = (nextOpen) => {
  setOpen(nextOpen);
  if (!nextOpen) setImageIndex(0);
};

<Lightbox open={open} onOpenChange={updateOpen}>
  <LightboxContent className="flex flex-col">
    <LightboxHeader>...{imageIndex + 1} / {images.length}</LightboxHeader>
    <LightboxStage>
      <button onClick={() => setImageIndex((i) => Math.max(0, i - 1))}>...</button>
      <LightboxMedia>...</LightboxMedia>
      <button onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}>...</button>
    </LightboxStage>
  </LightboxContent>
</Lightbox>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description:
      "Compound Lightbox parts. Intentionally narrowed from Base UI Dialog.Root render children because Lightbox inserts the Mod+W close helper before user content.",
  },
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state. Passed to Base UI Dialog.Root.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Initial uncontrolled open state.",
  },
  {
    name: "onOpenChange",
    type: "Dialog.Root.Props['onOpenChange']",
    description: "Base UI open-change handler. Lightbox does not rewrite the details signature.",
  },
  {
    name: "modal",
    type: "boolean | 'trap-focus'",
    default: "true",
    description: "Base UI modal behavior. true locks page scroll and traps focus.",
  },
  {
    name: "closeOnModW",
    type: "boolean",
    default: "true",
    description:
      "Mounts the internal TanStack Hotkeys close helper while the lightbox is open. Set false to opt out of the source Cmd/Ctrl+W interception.",
  },
  {
    name: "disablePointerDismissal",
    type: "boolean",
    default: "false",
    description:
      "Base UI Dialog.Root outside-click control. Leave false to close from the backdrop; set true to keep pointer dismissal disabled.",
  },
];

const ROOT_OMITTED_PROPS: readonly PropRow[] = [
  {
    name: "actionsRef",
    type: "never",
    description:
      "Reserved internally so the Mod+W close helper can close the Dialog without exposing an imperative handle API.",
  },
  {
    name: "handle",
    type: "never",
    description:
      "Not exposed. Lightbox keeps Dialog state inside the root instead of asking callers to provide a Dialog handle.",
  },
  {
    name: "children render function",
    type: "never",
    description:
      "Base UI payload render children are intentionally not supported; compose normal React children from the Lightbox parts.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "Dialog.Trigger render prop",
    description: "Base UI trigger composition hook. Commonly render a Button as the trigger.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "Dialog.Popup render prop",
    description: "Optional Base UI popup root composition hook. Defaults to a div overlay.",
  },
  {
    name: "initialFocus",
    type: "Dialog.Popup.Props['initialFocus']",
    default: "false",
    description:
      "Defaulted to false to match the source overlay: opening the image preview does not force focus into the popup.",
  },
  {
    name: "finalFocus",
    type: "Dialog.Popup.Props['finalFocus']",
    default: "false",
    description:
      "Defaulted to false so close focus behavior stays caller/browser-owned, matching the source portal.",
  },
];

const SLOT_RENDER_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "useRender.ComponentProps<'div'>['render']",
    description:
      "Optional composition hook for changing the rendered element while preserving Lightbox slot classes and state.",
  },
  {
    name: "className",
    type: "string",
    description: "Merged into the slot class through tv() and Base UI mergeProps.",
  },
];

const CLOSE_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "Dialog.Close render prop",
    description: "Base UI close composition hook. Commonly render a Button as the close control.",
  },
];

export const Route = createFileRoute("/components/lightbox")({
  component: LightboxDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function LightboxDoc() {
  const code = Route.useLoaderData();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = DEMO_IMAGES[imageIndex];
  const isFirstImage = imageIndex === 0;
  const isLastImage = imageIndex === DEMO_IMAGES.length - 1;

  const updateLightboxOpen = useCallback((nextOpen: boolean) => {
    setLightboxOpen(nextOpen);
    if (!nextOpen) {
      setImageIndex(0);
    }
  }, []);

  const showPreviousImage = useCallback(() => {
    setImageIndex((current) => Math.max(0, current - 1));
  }, []);

  const showNextImage = useCallback(() => {
    setImageIndex((current) => Math.min(DEMO_IMAGES.length - 1, current + 1));
  }, []);

  const switchImageWithArrowKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" && !isFirstImage) {
      showPreviousImage();
    } else if (event.key === "ArrowRight" && !isLastImage) {
      showNextImage();
    }
  });

  useEffect(() => {
    if (!lightboxOpen) return;

    document.addEventListener("keydown", switchImageWithArrowKey);
    return () => document.removeEventListener("keydown", switchImageWithArrowKey);
  }, [lightboxOpen]);

  return (
    <DocPage
      title="Lightbox"
      description="A full-screen dark-backdrop overlay for lightboxes and sheets."
      overview={
        <Differences from="Lightbox">
          <li>
            source used a hand-rolled portal; current moves portal, modal scroll lock, focus
            containment, Escape, and pointer dismissal to Base UI <code>Dialog</code>
          </li>
          <li>
            styling is split across <code>tv()</code> slots: content, header, title, actions, stage,
            media, and close
          </li>
          <li>
            source <code>Cmd/Ctrl+W</code> close interception is preserved as the only custom
            keyboard behavior, now opt-out through <code>closeOnModW</code>
          </li>
          <li>
            root <code>children</code> are intentionally narrowed to normal React children; Base UI
            payload render children are not exposed because Lightbox inserts an internal close
            helper before user content
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <div className="space-y-4">
          <Example html={code.anatomy}>
            <Lightbox open={lightboxOpen} onOpenChange={updateLightboxOpen}>
              <LightboxTrigger render={<Button variant="default" />}>Open lightbox</LightboxTrigger>
              <LightboxContent className="flex flex-col" data-testid="lightbox-demo">
                <LightboxHeader>
                  <div className="flex h-14 items-center gap-3 px-4">
                    <LightboxTitle>{currentImage.filename}</LightboxTitle>
                    <div className="shrink-0 border-2 border-black bg-brutal-yellow px-3 py-1 font-heading text-xs font-bold text-black">
                      {imageIndex + 1} / {DEMO_IMAGES.length}
                    </div>
                    <LightboxActions>
                      <Button type="button" size="icon-sm" aria-label="Download">
                        <Download />
                      </Button>
                      <LightboxClose
                        render={<Button type="button" size="icon-sm" aria-label="Close" />}
                      >
                        <X />
                      </LightboxClose>
                    </LightboxActions>
                  </div>
                </LightboxHeader>
                <LightboxStage data-testid="image-lightbox-stage">
                  <button
                    type="button"
                    disabled={isFirstImage}
                    className={`${lightboxArrowButtonClassName(isFirstImage)} absolute left-8 z-10`}
                    aria-label="Previous image"
                    onClick={showPreviousImage}
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    disabled={isLastImage}
                    className={`${lightboxArrowButtonClassName(isLastImage)} absolute right-8 z-10`}
                    aria-label="Next image"
                    onClick={showNextImage}
                  >
                    <ChevronRight />
                  </button>
                  <LightboxMedia className="flex aspect-[4/3] w-[min(76vw,720px)] items-center justify-center border-2 border-black bg-white shadow-[var(--shadow-lg)]">
                    <div className="grid size-full grid-cols-6 grid-rows-4">
                      {Array.from({ length: 24 }, (_, index) => (
                        <div
                          key={index}
                          className={currentImage.cells[index % currentImage.cells.length]}
                        />
                      ))}
                    </div>
                  </LightboxMedia>
                  <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
                    {DEMO_IMAGES.map((image, index) => {
                      const active = index === imageIndex;
                      return (
                        <button
                          key={image.filename}
                          type="button"
                          className={`pointer-events-auto size-12 overflow-hidden border-2 transition-all duration-100 ${
                            active
                              ? "border-brutal-yellow shadow-[var(--shadow)]"
                              : "border-white/30 opacity-60 hover:border-white/60 hover:opacity-100"
                          }`}
                          aria-label={`Show ${image.filename}`}
                          onClick={() => setImageIndex(index)}
                        >
                          <span className="grid size-full grid-cols-2 grid-rows-2">
                            {Array.from({ length: 4 }, (_, cellIndex) => (
                              <span
                                key={cellIndex}
                                className={image.cells[cellIndex % image.cells.length]}
                              />
                            ))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </LightboxStage>
              </LightboxContent>
            </Lightbox>
          </Example>
          <Callout>
            Lightbox is a Dialog composition family. The root delegates open state and modal
            mechanics to Base UI; the content renders the Base UI backdrop and popup; header,
            actions, stage, media, and close are separate parts. Image switching stays caller-owned,
            matching source <code>ImageLightbox</code>.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Lightbox.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>
      <DocSection id="api" title="API">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Lightbox root</h3>
            <PropsTable rows={ROOT_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Lightbox root omitted props
            </h3>
            <PropsTable rows={ROOT_OMITTED_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">LightboxTrigger</h3>
            <PropsTable rows={TRIGGER_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">LightboxContent</h3>
            <PropsTable rows={CONTENT_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              LightboxHeader / LightboxTitle / LightboxActions / LightboxStage / LightboxMedia
            </h3>
            <PropsTable rows={SLOT_RENDER_PROPS} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">LightboxClose</h3>
            <PropsTable rows={CLOSE_PROPS} />
          </div>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Image lightbox shell",
              status: "match",
              note: "Source and current keep the same visual shell: fixed inset root, black dim, caller-owned title bar, caller-owned stage, backdrop pointer dismissal, and the same z-index family.",
              source: <LightboxShellPreview />,
              current: <LightboxShellPreview />,
              sourceCode: code.sourceBackdrop,
              currentCode: code.currentBackdrop,
            },
            {
              label: "Overlay mechanics",
              status: "difference",
              note: "Source hand-rolled portal and scroll lock. Current delegates modal scroll lock, focus containment, Escape, pointer dismissal, and imperative close to Base UI Dialog. Mod+W is registered through TanStack Hotkeys.",
              source: <LightboxShellPreview />,
              current: <LightboxShellPreview />,
              sourceCode: code.sourceMechanics,
              currentCode: code.currentMechanics,
            },
            {
              label: "Root children boundary",
              status: "difference",
              note: "Source passed children directly into the overlay div. Current root must insert the internal Mod+W close helper before caller content, so children are pulled out of props and re-rendered explicitly. Base UI payload render children are intentionally not exposed.",
              source: <LightboxShellPreview />,
              current: <LightboxShellPreview />,
              sourceCode: code.sourceChildren,
              currentCode: code.currentChildren,
            },
            {
              label: "Content portal",
              status: "difference",
              note: "Source put the portal root and visual content in one component. Current keeps root state in Lightbox and moves Portal, Backdrop, and Popup into LightboxContent, matching the compound composition boundary.",
              source: <LightboxShellPreview />,
              current: <LightboxShellPreview />,
              sourceCode: code.sourceMechanics,
              currentCode: code.currentContent,
            },
            {
              label: "Root composition",
              status: "difference",
              note: "Source hard-coded the div root. Current keeps the default div but exposes Dialog.Popup render composition through LightboxContent.",
              source: <LightboxShellPreview />,
              current: <LightboxShellPreview semantic />,
              sourceCode: code.sourceRender,
              currentCode: code.currentRender,
            },
            {
              label: "Image switching",
              status: "match",
              note: "Source Lightbox did not own carousel state. Source ImageLightbox kept next, previous, and thumbnail selection in the caller; the current demo keeps the same boundary with local caller state.",
              source: <LightboxShellPreview />,
              current: <LightboxShellPreview />,
              sourceCode: code.sourceSwitching,
              currentCode: code.currentSwitching,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function LightboxShellPreview({ semantic = false }: { semantic?: boolean }) {
  const Root = semantic ? "section" : "div";
  return (
    <Root
      aria-label={semantic ? "Attachment preview" : undefined}
      className="flex h-44 w-full max-w-sm flex-col overflow-hidden bg-black/75"
    >
      <div className="shrink-0 border-b-2 border-black bg-white">
        <div className="flex h-10 items-center gap-2 px-3">
          <div className="min-w-0 flex-1 truncate font-heading text-xs font-bold text-black">
            product-shot.png
          </div>
          <div className="border-2 border-black bg-brutal-yellow px-2 py-0.5 font-heading text-[10px] font-bold text-black">
            1 / 3
          </div>
          <div className="flex gap-1">
            <span className="flex size-6 items-center justify-center border-2 border-black bg-white text-black">
              <Download size={12} aria-hidden />
            </span>
            <span className="flex size-6 items-center justify-center border-2 border-black bg-white text-black">
              <X size={12} aria-hidden />
            </span>
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <div className="aspect-[4/3] h-full max-h-24 border-2 border-black bg-white shadow-[var(--shadow)]">
          <div className="grid size-full grid-cols-4 grid-rows-3">
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={index}
                className={index % 2 === 0 ? "bg-brutal-cyan/35" : "bg-brutal-yellow/45"}
              />
            ))}
          </div>
        </div>
      </div>
    </Root>
  );
}
