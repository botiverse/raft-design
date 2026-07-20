import { createFileRoute } from "@tanstack/react-router";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import {
  Button,
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoDock,
  LightboxInfoTitle,
  LightboxMedia,
  LightboxNavigationButton,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
  useThemeFamily,
  type Theme,
} from "raft-ui";
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
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import attachmentPreviewShellCompositionSource from "#/modules/lightbox/compositions/attachment-preview-shell.composition.tsx?raw";
import { AttachmentPreviewShellComposition } from "#/modules/lightbox/compositions/attachment-preview-shell.composition.tsx";
import imageLightboxShellCompositionSource from "#/modules/lightbox/compositions/image-lightbox-shell.composition.tsx?raw";
import { ImageLightboxShellComposition } from "#/modules/lightbox/compositions/image-lightbox-shell.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
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
  preview: `import { Button } from "raft-ui";
import {
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoDock,
  LightboxInfoTitle,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "raft-ui";
import { Download, X } from "lucide-react";

<Lightbox>
  <LightboxTrigger render={<Button variant="default" />}>
    Open lightbox
  </LightboxTrigger>
  <LightboxContent>
    <LightboxTitle className="sr-only">product-shot.png</LightboxTitle>
    <LightboxClose aria-label="Close">
      <X />
    </LightboxClose>
    <LightboxStage>
      <LightboxMedia render={<img src={url} alt="" />} />
      <LightboxInfoDock>
        <LightboxInfoBar>
          <LightboxInfoTitle>product-shot.png</LightboxInfoTitle>
          <LightboxInfoActions>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
              <Download />
            </Button>
          </LightboxInfoActions>
        </LightboxInfoBar>
      </LightboxInfoDock>
    </LightboxStage>
  </LightboxContent>
</Lightbox>`,
  anatomy: `<Lightbox>
  <LightboxTrigger />
  <LightboxContent>
    <LightboxTitle />
    <LightboxClose />
    <LightboxStage>
      <LightboxNavigationButton />
      <LightboxMedia />
      <LightboxNavigationButton />
      <LightboxInfoDock>
        <LightboxInfoBar>
          <LightboxInfoTitle />
          <LightboxInfoActions />
        </LightboxInfoBar>
      </LightboxInfoDock>
    </LightboxStage>
  </LightboxContent>
</Lightbox>`,
  sourceImageShell: `<Lightbox onClose={close} className="flex flex-col" data-testid="image-lightbox">
  <div className="safe-top safe-left safe-right pointer-events-auto shrink-0 border-b-2 border-black bg-white">
    <div className="flex h-14 items-center gap-3 px-4">
      <div className="min-w-0 flex-1 truncate text-sm font-bold font-sans text-black">
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
    "apps/doc/src/modules/lightbox/compositions/attachment-preview-shell.composition.tsx",
  ImageLightboxShell:
    "apps/doc/src/modules/lightbox/compositions/image-lightbox-shell.composition.tsx",
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

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Root props",
    description:
      "Owns open state, modal behavior, Escape, pointer dismissal, and the optional Mod+W close helper.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Trigger props",
    description: "Opens the lightbox. Compose Button through render for visible triggers.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Popup props",
    description:
      "Renders Portal, Backdrop, and Popup. Defaults initialFocus/finalFocus to false for preview-like surfaces.",
  },
];

const TOOLBAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Attachment header: left LightboxHeaderMeta + right LightboxActions. Owns in-flow button layout so Close is not treated as the image-shell floating control.",
  },
];

const HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "In-flow header row for simpler shells (title + actions in document flow).",
  },
];

const CLOSE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Dialog.Close props",
    description:
      "Close control. Direct child of LightboxContent → floating top-right (image shell). Inside LightboxToolbar → in-flow with the action buttons.",
  },
];

const HEADER_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Toolbar left cluster (gap 6px): preview-type chip then truncating filename.",
  },
];

const HEADER_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Preview-type chip (or Badge) inside LightboxHeaderMeta.",
  },
];

const MEDIA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Media frame for the stage photo. Borderless with a transparent background.",
  },
];

const INFO_DOCK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Absolute dock that centers LightboxInfoBar near the bottom of the stage.",
  },
];

const ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Toolbar right cluster (chip + buttons).",
  },
];

const STAGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Flex-1 preview surface under Toolbar or Header.",
  },
];

const NAVIGATION_BUTTON_PROPS: readonly PropRow[] = [
  {
    name: "direction",
    type: '"next" | "previous"',
    description: "Chooses the previous or next affordance for multi-item preview navigation.",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Disables the control and blocks click handling.",
  },
  {
    name: "...props",
    type: "ButtonProps (size/variant/loading omitted)",
    description: "Button attributes for the navigation control.",
  },
];
const INFO_BAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Bottom info bar centered by LightboxInfoDock.",
  },
];

const TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Truncating title slot, usually filename or preview label.",
  },
];
export const Route = createFileRoute("/components/lightbox")({
  component: LightboxDoc,
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...LIGHTBOX_COMPOSITION_SNIPPETS } }),
});

function LightboxDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Lightbox"
      description="A full-screen preview surface for image, screenshot, and attachment review."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <LightboxPreviewDemo />
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
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
          <DocSubsection parentId="usage" id="image-shell" title="Image shell">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <ImageLightboxShellComposition />
              </Preview.Canvas>
              <Preview.Code html={code.lightboxImageLightboxShellComposition} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="attachment-shell" title="Attachment shell">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <AttachmentPreviewShellComposition />
              </Preview.Canvas>
              <Preview.Code html={code.lightboxAttachmentPreviewShellComposition} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Lightbox">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="LightboxTrigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="LightboxContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-toolbar" title="LightboxToolbar">
            <PropsTable rows={TOOLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-header" title="LightboxHeader">
            <PropsTable rows={HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-close" title="LightboxClose">
            <PropsTable rows={CLOSE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-header-meta" title="LightboxHeaderMeta">
            <PropsTable rows={HEADER_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-header-label" title="LightboxHeaderLabel">
            <PropsTable rows={HEADER_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-media" title="LightboxMedia">
            <PropsTable rows={MEDIA_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-info-dock" title="LightboxInfoDock">
            <PropsTable rows={INFO_DOCK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-actions" title="LightboxActions">
            <PropsTable rows={ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-stage" title="LightboxStage">
            <PropsTable rows={STAGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-navigation-button" title="LightboxNavigationButton">
            <PropsTable rows={NAVIGATION_BUTTON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-info-bar" title="LightboxInfoBar">
            <PropsTable rows={INFO_BAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="LightboxTitle">
            <PropsTable rows={TITLE_PROPS} />
          </DocSubsection>
        </div>
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
              brutal: <ImageLightboxShellComposition />,
              elegant: <ImageLightboxShellComposition />,
              elegantDark: <ImageLightboxShellComposition />,
              sourceCode: code.sourceImageShell,
              ...compositionPanelProps(code, "ImageLightboxShell"),
            },
            {
              label: "Attachment preview shell",
              status: "difference",
              note: "Source mixed absolute fill layout, browser-find scroll mode, and comment chrome into AttachmentPreviewShell. Current uses LightboxToolbar (left Meta / right Actions) over a flex-1 Stage; modal=false and product comment/browser-find behavior stay at the composition boundary.",
              source: <SourceAttachmentPreview />,
              brutal: <AttachmentPreviewShellComposition />,
              elegant: <AttachmentPreviewShellComposition />,
              elegantDark: <AttachmentPreviewShellComposition />,
              sourceCode: code.sourceAttachmentShell,
              ...compositionPanelProps(code, "AttachmentPreviewShell"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function LightboxPreviewDemo() {
  const theme = useThemeFamily();
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
    <Lightbox open={lightboxOpen} onOpenChange={updateLightboxOpen}>
      <LightboxTrigger render={<Button variant="default" />}>Open lightbox</LightboxTrigger>
      <LightboxContent data-testid="lightbox-demo">
        <LightboxTitle className="sr-only">{currentImage.filename}</LightboxTitle>
        <LightboxClose aria-label="Close">
          <X />
        </LightboxClose>
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
          <LightboxMedia className="flex aspect-[4/3] w-[min(76vw,720px)] items-center justify-center">
            <img
              src={currentImage.src}
              alt={currentImage.filename}
              className="size-full object-cover"
              draggable={false}
            />
          </LightboxMedia>
          <LightboxInfoDock>
            <LightboxInfoBar>
              <LightboxInfoTitle>{currentImage.filename}</LightboxInfoTitle>
              <LightboxInfoActions>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
                  <Download />
                </Button>
              </LightboxInfoActions>
            </LightboxInfoBar>
          </LightboxInfoDock>
          <div className="pointer-events-none absolute right-0 bottom-4 left-0 z-10 flex items-center justify-center gap-1.5">
            {DEMO_IMAGES.map((image, index) => {
              const active = index === imageIndex;
              return (
                <button
                  key={image.filename}
                  type="button"
                  className={lightboxThumbnailButton({ active, theme })}
                  aria-label={`Show ${image.filename}`}
                  onClick={() => setImageIndex(index)}
                >
                  <img
                    src={image.thumb}
                    alt=""
                    className="size-full object-cover"
                    draggable={false}
                  />
                  <span className={lightboxThumbnailOverlay({ active, theme })} />
                </button>
              );
            })}
          </div>
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}

function lightboxThumbnailButton({ active, theme }: { active: boolean; theme: Theme }) {
  if (theme === "elegant") {
    return cn(
      "group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden rounded-sm border opacity-100 shadow-none transition-[border-color,opacity,box-shadow] duration-150",
      active ? "border-white/90" : "border-white/25 hover:border-white/60",
    );
  }

  return cn(
    "group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden border-2 transition-[border-color,opacity,box-shadow] duration-150",
    active
      ? "border-[3px] border-white shadow-[4px_4px_0_0_black]"
      : "border-white/70 opacity-70 shadow-[2px_2px_0_0_black] hover:border-white hover:opacity-100 hover:shadow-[3px_3px_0_0_black]",
  );
}

function lightboxThumbnailOverlay({ active, theme }: { active: boolean; theme: Theme }) {
  if (theme !== "elegant") {
    return "hidden";
  }

  return cn(
    "pointer-events-none absolute inset-0 block transition-colors duration-150",
    active ? "bg-transparent" : "bg-black/45 group-hover/lightbox-thumb:bg-black/28",
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

function SourceAttachmentPreview() {
  return (
    <div className="flex h-44 w-full max-w-sm flex-col overflow-hidden bg-brutal-cream">
      <SourceLightboxHeader title="diagram-export.html" label="HTML preview" />
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <div className="h-full w-3/4 border-2 border-black bg-white shadow-[var(--source-shadow)]" />
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
          <div className="shrink-0 border-2 border-black bg-soft-signal px-1.5 py-0.5 text-[10px] font-display font-bold tracking-wide text-black uppercase">
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

function SourceLightboxStage() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-4">
      <div className="aspect-[4/3] h-full max-h-24 border-2 border-black bg-white shadow-[var(--source-shadow)]">
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
