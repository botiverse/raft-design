import { createFileRoute } from "@tanstack/react-router";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { Download, X } from "lucide-react";
import type { ReactNode } from "react";

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
import lightboxPreviewSource from "#/modules/lightbox/lightbox.preview.tsx?raw";
import { LightboxPreview } from "#/modules/lightbox/lightbox.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import {
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
  LightboxThumbnail,
  LightboxThumbnailStrip,
  LightboxTitle,
  LightboxTrigger,
} from "raft-ui";

<Lightbox>
  <LightboxTrigger />
  <LightboxContent>
    <LightboxTitle />
    <LightboxClose />
    <LightboxStage>
      <LightboxNavigationButton direction="previous" />
      <LightboxNavigationButton direction="next" />
      <LightboxMedia />
      <LightboxInfoDock>
        <LightboxInfoBar>
          <LightboxInfoTitle />
          <LightboxInfoActions />
        </LightboxInfoBar>
      </LightboxInfoDock>
      <LightboxThumbnailStrip>
        <LightboxThumbnail />
      </LightboxThumbnailStrip>
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

const THUMBNAIL_STRIP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Absolute strip that centers LightboxThumbnail controls along the bottom of the stage.",
  },
];

const THUMBNAIL_PROPS: readonly PropRow[] = [
  {
    name: "active",
    type: "boolean",
    description: "Marks the current thumbnail and updates border/overlay chrome.",
  },
  {
    name: "...props",
    type: "button props",
    description:
      "Thumbnail control. Put the preview image in children; selection state stays caller-owned.",
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
  loader: () =>
    highlightSnippets({
      data: { ...SNIPPETS, preview: lightboxPreviewSource, ...LIGHTBOX_COMPOSITION_SNIPPETS },
    }),
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
            <LightboxPreview />
          </Preview.Canvas>
          <Preview.Code html={code.preview} collapsedHtml={code.previewBody} />
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
              <Preview.Code
                html={code.lightboxImageLightboxShellComposition}
                collapsedHtml={code.lightboxImageLightboxShellCompositionBody}
              />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="attachment-shell" title="Attachment shell">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <AttachmentPreviewShellComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.lightboxAttachmentPreviewShellComposition}
                collapsedHtml={code.lightboxAttachmentPreviewShellCompositionBody}
              />
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
          <DocSubsection parentId="api" id="api-thumbnail-strip" title="LightboxThumbnailStrip">
            <PropsTable rows={THUMBNAIL_STRIP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thumbnail" title="LightboxThumbnail">
            <PropsTable rows={THUMBNAIL_PROPS} />
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
          <div className="shrink-0 border-2 border-black bg-primary px-1.5 py-0.5 text-[10px] font-display font-bold tracking-wide text-black uppercase">
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
