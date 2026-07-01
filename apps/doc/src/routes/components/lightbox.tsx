import { createFileRoute } from "@tanstack/react-router";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { Badge, Button } from "raft-ui";
import {
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoTitle,
  LightboxMedia,
  LightboxNavigationButton,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "raft-ui/wip";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "tailwind-variants";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import attachmentPreviewShellCompositionSource from "#/compositions/lightbox/attachment-preview-shell-composition.tsx?raw";
import imageLightboxShellCompositionSource from "#/compositions/lightbox/image-lightbox-shell-composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "structure", title: "Structure" },
  { id: "api", title: "API" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-image-lightbox-shell", title: "Image shell" },
      { id: "source-comparison-attachment-preview-shell", title: "Attachment shell" },
    ],
  },
] as const;

const DEMO_IMAGES = [
  {
    filename: "product-shot.png",
    src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "ui.png",
    src: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "release-card-final-approved-for-directory-cover.png",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "design-system-token-migration-before-after-comparison-v3.png",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=160&q=80",
  },
  {
    filename: "status-board.png",
    src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1440&q=80",
    thumb:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=160&q=80",
  },
] as const;

const SNIPPETS = {
  anatomy: `import { Button } from "raft-ui";
import {
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoTitle,
  LightboxMedia,
  LightboxNavigationButton,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "raft-ui/wip";
import { Download, X } from "lucide-react";

<Lightbox>
  <LightboxTrigger render={<Button variant="default" />}>
    Open lightbox
  </LightboxTrigger>
  <LightboxContent className="flex flex-col">
    <LightboxHeader className="pointer-events-none absolute inset-x-0 top-0 z-20">
      <div className="flex justify-end px-4 pt-4">
        <LightboxTitle className="sr-only">product-shot.png</LightboxTitle>
        <LightboxClose
          render={<Button type="button" variant="outline" size="icon-md" aria-label="Close" className="pointer-events-auto" />}
        >
          <X className="size-4" />
        </LightboxClose>
      </div>
    </LightboxHeader>
    <LightboxStage>
      <LightboxMedia className="border-0 bg-transparent shadow-none" render={<img src={url} alt="" />} />
      <div className="pointer-events-none absolute right-6 bottom-20 left-6 flex justify-center">
        <LightboxInfoBar>
          <LightboxInfoTitle>product-shot.png</LightboxInfoTitle>
          <LightboxInfoActions>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
              <Download />
            </Button>
          </LightboxInfoActions>
        </LightboxInfoBar>
      </div>
    </LightboxStage>
  </LightboxContent>
</Lightbox>`,
  structure: `<Lightbox>
  <LightboxTrigger />
  <LightboxContent>
    <LightboxHeader>
      <LightboxTitle />
      <LightboxActions>
        <LightboxClose />
      </LightboxActions>
    </LightboxHeader>
    <LightboxStage>
      <LightboxNavigationButton direction="previous" />
      <LightboxMedia />
      <LightboxNavigationButton direction="next" />
      <LightboxInfoBar>
        <LightboxInfoTitle />
        <LightboxInfoActions />
      </LightboxInfoBar>
    </LightboxStage>
  </LightboxContent>
</Lightbox>`,
  sourceImageShell: `<Lightbox onClose={close} className="flex flex-col" data-testid="image-lightbox">
  <div className="safe-top safe-left safe-right pointer-events-auto shrink-0 border-b-2 border-black bg-white">
    <div className="flex h-14 items-center gap-3 px-4">
      <div className="min-w-0 flex-1 truncate text-sm font-bold font-display text-black">
        {current.filename}
      </div>
      <Button shape="icon" title="Download" />
      <Button shape="icon" title="Close" />
    </div>
  </div>
  <div className="relative flex flex-1 items-center justify-center overflow-hidden">
    <img src={displaySrc} alt={current.filename} />
  </div>
</Lightbox>`,
  sourceAttachmentShell: `<Lightbox
  onClose={onClose}
  backdropClass={browserFindLayout ? "bg-brutal-cream" : undefined}
  positionClass={browserFindLayout ? "absolute left-0 right-0 top-0 min-h-screen" : undefined}
  lockBodyScroll={!browserFindLayout}
  scrollIntoViewOnMount={browserFindLayout}
  className={browserFindLayout ? "bg-brutal-cream" : "flex flex-col items-center justify-center"}
>
  <div className="safe-top safe-left pointer-events-auto absolute left-0 right-0 top-0 border-b-2 border-black bg-white">
    ...
  </div>
  {children}
</Lightbox>`,
} as const;

const LIGHTBOX_COMPOSITION_RAW_SOURCES = {
  AttachmentPreviewShell: attachmentPreviewShellCompositionSource,
  ImageLightboxShell: imageLightboxShellCompositionSource,
} as const;

const LIGHTBOX_COMPOSITION_SOURCES = createCompositionSourceMap(LIGHTBOX_COMPOSITION_RAW_SOURCES);

const LIGHTBOX_COMPOSITION_SNIPPET_IDS = {
  AttachmentPreviewShell: "lightboxAttachmentPreviewShellComposition",
  ImageLightboxShell: "lightboxImageLightboxShellComposition",
} as const;

const LIGHTBOX_COMPOSITION_SNIPPETS = createCompositionSnippetMap(
  LIGHTBOX_COMPOSITION_SOURCES,
  LIGHTBOX_COMPOSITION_SNIPPET_IDS,
);

const LIGHTBOX_COMPOSITION_PATHS = {
  AttachmentPreviewShell:
    "apps/doc/src/compositions/lightbox/attachment-preview-shell-composition.tsx",
  ImageLightboxShell: "apps/doc/src/compositions/lightbox/image-lightbox-shell-composition.tsx",
} as const;

type LightboxCompositionKey = keyof typeof LIGHTBOX_COMPOSITION_SOURCES;

function compositionPanelProps(
  code: Record<string, ReactNode | AnyRenderableServerComponent>,
  key: LightboxCompositionKey,
) {
  return createCompositionPanelProps({
    code,
    key,
    paths: LIGHTBOX_COMPOSITION_PATHS,
    snippetIds: LIGHTBOX_COMPOSITION_SNIPPET_IDS,
    sources: LIGHTBOX_COMPOSITION_SOURCES,
  });
}

const SOURCE_SCENES = [
  {
    label: "Primitive and global image shell",
    scenes: [
      {
        label: "Lightbox primitive",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/Lightbox.tsx:39",
      },
      {
        label: "ImageLightbox shell",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ImageLightbox.tsx:116",
      },
    ],
  },
  {
    label: "Business lightbox callsites",
    scenes: [
      {
        label: "Attachment preview shell",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:915",
      },
    ],
  },
] as const;

const PROPS: readonly PropRow[] = [
  {
    name: "Lightbox",
    type: "Base UI Dialog.Root props",
    description:
      "Owns open state, modal behavior, Escape, pointer dismissal, and the optional Mod+W close helper.",
  },
  {
    name: "LightboxTrigger",
    type: "Base UI Dialog.Trigger props",
    description: "Opens the lightbox. Compose Button through render for visible triggers.",
  },
  {
    name: "LightboxContent",
    type: "Base UI Dialog.Popup props",
    description:
      "Renders Portal, Backdrop, and Popup. Defaults initialFocus/finalFocus to false for preview-like surfaces.",
  },
  {
    name: "LightboxHeader / LightboxActions / LightboxStage / LightboxMedia / LightboxNavigationButton / LightboxInfoBar",
    type: "div props",
    description:
      "Layout slots for the title bar, action cluster, preview stage, media element, image navigation, and compact filename/action rail.",
  },
  {
    name: "LightboxTitle",
    type: "div props",
    description: "Truncating title slot, usually filename or preview label.",
  },
  {
    name: "LightboxClose",
    type: "Base UI Dialog.Close props",
    description: "Close primitive. Compose Button through render for icon or footer actions.",
  },
];

export const Route = createFileRoute("/components/lightbox")({
  component: LightboxDoc,
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...LIGHTBOX_COMPOSITION_SNIPPETS } }),
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

  const handlePreviousImageClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isFirstImage) {
        event.preventDefault();
        return;
      }
      showPreviousImage();
    },
    [isFirstImage, showPreviousImage],
  );

  const handleNextImageClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isLastImage) {
        event.preventDefault();
        return;
      }
      showNextImage();
    },
    [isLastImage, showNextImage],
  );

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
      description="A full-screen preview surface for image, screenshot, and attachment review."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.anatomy}>
          <Lightbox open={lightboxOpen} onOpenChange={updateLightboxOpen}>
            <LightboxTrigger render={<Button variant="default" />}>Open lightbox</LightboxTrigger>
            <LightboxContent className="flex flex-col" data-testid="lightbox-demo">
              <LightboxHeader className="pointer-events-none absolute inset-x-0 top-0 z-20">
                <div className="flex justify-end px-4 pt-4">
                  <LightboxTitle className="sr-only">{currentImage.filename}</LightboxTitle>
                  <LightboxClose
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-md"
                        aria-label="Close"
                        className="pointer-events-auto"
                      />
                    }
                  >
                    <X className="size-4" />
                  </LightboxClose>
                </div>
              </LightboxHeader>
              <LightboxStage data-testid="image-lightbox-stage">
                <LightboxNavigationButton
                  direction="previous"
                  disabled={isFirstImage}
                  aria-label="Previous image"
                  onClick={handlePreviousImageClick}
                >
                  <ChevronLeft />
                </LightboxNavigationButton>
                <LightboxNavigationButton
                  direction="next"
                  disabled={isLastImage}
                  aria-label="Next image"
                  onClick={handleNextImageClick}
                >
                  <ChevronRight />
                </LightboxNavigationButton>
                <LightboxMedia className="flex aspect-[4/3] w-[min(76vw,720px)] items-center justify-center border-0 bg-transparent shadow-none">
                  <img
                    src={currentImage.src}
                    alt={currentImage.filename}
                    className="size-full object-cover"
                    draggable={false}
                  />
                </LightboxMedia>
                <div className="pointer-events-none absolute right-6 bottom-20 left-6 z-10 flex justify-center">
                  <LightboxInfoBar>
                    <LightboxInfoTitle>{currentImage.filename}</LightboxInfoTitle>
                    <LightboxInfoActions>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
                        <Download />
                      </Button>
                    </LightboxInfoActions>
                  </LightboxInfoBar>
                </div>
                <div className="pointer-events-none absolute right-0 bottom-4 left-0 z-10 flex items-center justify-center gap-1.5">
                  {DEMO_IMAGES.map((image, index) => {
                    const active = index === imageIndex;
                    return (
                      <button
                        key={image.filename}
                        type="button"
                        className={lightboxThumbnailButton({ active })}
                        aria-label={`Show ${image.filename}`}
                        onClick={() => setImageIndex(index)}
                      >
                        <img
                          src={image.thumb}
                          alt=""
                          className="size-full object-cover"
                          draggable={false}
                        />
                        <span className={lightboxThumbnailOverlay({ active })} />
                      </button>
                    );
                  })}
                </div>
              </LightboxStage>
            </LightboxContent>
          </Lightbox>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Lightbox.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="structure" title="Structure">
        <DocsCodeBlock.Panel
          path="Lightbox.tsx"
          source={SNIPPETS.structure}
          html={code.structure}
          collapsedHtml={code.structureBody}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Image lightbox shell",
              status: "difference",
              note: "Source mixed the visual shell and image switching into ImageLightbox. Current keeps the same caller-owned navigation boundary while expressing the header, action cluster, stage, and media slots through the Lightbox composition family.",
              source: <SourceImageLightboxPreview />,
              brutal: <CurrentImageLightboxPreview />,
              elegant: <CurrentImageLightboxPreview />,
              elegantDark: <CurrentImageLightboxPreview />,
              sourceCode: code.sourceImageShell,
              ...compositionPanelProps(code, "ImageLightboxShell"),
            },
            {
              label: "Attachment preview shell",
              status: "todo",
              note: "Source passed positioning, scroll locking, and backdrop classes directly to the primitive for attachment previews. Current keeps those concerns at the composition boundary instead of expanding the public root API.",
              source: <SourceAttachmentPreview />,
              brutal: <CurrentAttachmentPreview />,
              elegant: <CurrentAttachmentPreview />,
              elegantDark: <CurrentAttachmentPreview />,
              sourceCode: code.sourceAttachmentShell,
              ...compositionPanelProps(code, "AttachmentPreviewShell"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function lightboxThumbnailButton({ active }: { active: boolean }) {
  return cn(
    "group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden border-2 transition-[border-color,opacity,box-shadow] duration-150",
    active
      ? "border-brutal-yellow shadow-[var(--shadow)]"
      : "border-white/30 opacity-60 hover:border-white/60 hover:opacity-100",
    "[[data-theme=elegant]_&]:rounded-sm [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:opacity-100 [[data-theme=elegant]_&]:shadow-none",
    active
      ? "[[data-theme=elegant]_&]:border-white/90"
      : "[[data-theme=elegant]_&]:border-white/25 [[data-theme=elegant]_&]:hover:border-white/60",
  );
}

function lightboxThumbnailOverlay({ active }: { active: boolean }) {
  return cn(
    "pointer-events-none absolute inset-0 hidden transition-colors duration-150",
    active
      ? "[[data-theme=elegant]_&]:block [[data-theme=elegant]_&]:bg-transparent"
      : "[[data-theme=elegant]_&]:block [[data-theme=elegant]_&]:bg-black/45 [[data-theme=elegant]_&]:group-hover/lightbox-thumb:bg-black/28",
  );
}

function SourceImageLightboxPreview() {
  return (
    <div className="flex h-44 w-full max-w-sm flex-col overflow-hidden bg-black/75">
      <SourceLightboxHeader title="product-shot.png" />
      <SourceLightboxStage />
    </div>
  );
}

function CurrentImageLightboxPreview() {
  return (
    <div className="relative flex h-44 w-full max-w-sm flex-col overflow-hidden bg-layer-backdrop [[data-theme=elegant]_&]:bg-[oklch(0_0_0_/_0.72)]">
      <CurrentImageLightboxChrome />
      <CurrentLightboxStage />
    </div>
  );
}

function SourceAttachmentPreview() {
  return (
    <div className="flex h-44 w-full max-w-sm flex-col overflow-hidden bg-brutal-cream">
      <SourceLightboxHeader title="diagram-export.html" label="HTML preview" />
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <div className="h-full w-3/4 border-2 border-black bg-white shadow-[var(--shadow)]" />
      </div>
    </div>
  );
}

function CurrentAttachmentPreview() {
  return (
    <div className="flex h-44 w-full max-w-sm flex-col overflow-hidden bg-layer-backdrop [[data-theme=brutal]_&]:bg-brutal-cream [[data-theme=elegant]_&]:bg-[oklch(0_0_0_/_0.72)]">
      <CurrentLightboxHeader title="diagram-export.html" label="HTML preview" />
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <div className="h-full w-3/4 border-2 border-black bg-white shadow-[var(--shadow)] [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:shadow-none" />
      </div>
    </div>
  );
}

function SourceLightboxHeader({
  title,
  label,
  compact,
}: {
  title: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className="shrink-0 border-b-2 border-black bg-white">
      <div className={`${compact ? "h-9" : "h-10"} flex items-center gap-2 px-3`}>
        <div className="min-w-0 flex-1 truncate font-heading text-xs font-bold text-black">
          {title}
        </div>
        {label ? (
          <div className="shrink-0 rounded-full border border-black/20 bg-black/5 px-2 py-0.5 text-[10px] font-bold text-black/60 uppercase">
            {label}
          </div>
        ) : null}
        <SourceIconGroup />
      </div>
    </div>
  );
}

function SourceIconGroup() {
  return (
    <div className="flex gap-1">
      <span className="flex size-6 items-center justify-center border-2 border-black bg-white text-black">
        <Download size={12} aria-hidden />
      </span>
      <span className="flex size-6 items-center justify-center border-2 border-black bg-white text-black">
        <X size={12} aria-hidden />
      </span>
    </div>
  );
}

function CurrentLightboxHeader({
  title,
  label,
  compact,
}: {
  title: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className="shrink-0 border-b-2 border-black bg-white shadow-none [[data-theme=elegant]_&]:border-b [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-popover">
      <div className={`${compact ? "h-9" : "h-10"} flex items-center gap-2 px-3`}>
        <div className="min-w-0 flex-1 truncate font-heading text-xs font-bold text-black [[data-theme=elegant]_&]:font-sans [[data-theme=elegant]_&]:font-medium [[data-theme=elegant]_&]:text-foreground-strong">
          {title}
        </div>
        {label ? (
          <Badge appearance="soft" uppercase className="shrink-0">
            {label}
          </Badge>
        ) : null}
        <CurrentIconGroup />
      </div>
    </div>
  );
}

function CurrentIconGroup() {
  return (
    <div className="flex gap-1">
      <Button type="button" variant="outline" size="icon-xs" aria-label="Download">
        <Download />
      </Button>
      <Button type="button" variant="outline" size="icon-xs" aria-label="Close">
        <X />
      </Button>
    </div>
  );
}

function CurrentImageLightboxChrome() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Close"
        className="pointer-events-auto"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

function CurrentImageInfoRail() {
  return (
    <LightboxInfoBar className="absolute right-3 bottom-3 left-3 z-10 mx-auto">
      <LightboxInfoTitle>release-card-final-approved-for-directory-cover.png</LightboxInfoTitle>
      <LightboxInfoActions>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Download"
          className="shrink-0"
        >
          <Download />
        </Button>
      </LightboxInfoActions>
    </LightboxInfoBar>
  );
}

function CurrentLightboxStage() {
  const image = DEMO_IMAGES[0];

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center p-4">
      <div className="aspect-[4/3] h-full max-h-24 bg-white shadow-none">
        <img src={image.thumb} alt={image.filename} className="size-full object-cover" />
      </div>
      <CurrentImageInfoRail />
    </div>
  );
}

function SourceLightboxStage() {
  return (
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
  );
}
