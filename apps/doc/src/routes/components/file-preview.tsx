import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import filePreviewDefaultCompositionSource from "#/modules/file-preview/compositions/default.composition.tsx?raw";
import { FilePreviewDefaultComposition } from "#/modules/file-preview/compositions/default.composition.tsx";
import filePreviewFormatsCompositionSource from "#/modules/file-preview/compositions/formats.composition.tsx?raw";
import { FilePreviewFormatsComposition } from "#/modules/file-preview/compositions/formats.composition.tsx";
import filePreviewIllustrationsCompositionSource from "#/modules/file-preview/compositions/illustrations.composition.tsx?raw";
import { FilePreviewIllustrationsComposition } from "#/modules/file-preview/compositions/illustrations.composition.tsx";
import filePreviewMediaCompositionSource from "#/modules/file-preview/compositions/media.composition.tsx?raw";
import { FilePreviewMediaComposition } from "#/modules/file-preview/compositions/media.composition.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `<FilePreview>
  <FilePreviewDocument />
  <FilePreviewBadge color="rose">PDF</FilePreviewBadge>
</FilePreview>`,
  default: stripSourceCodeBlocks(filePreviewDefaultCompositionSource),
  formats: stripSourceCodeBlocks(filePreviewFormatsCompositionSource),
  illustrations: stripSourceCodeBlocks(filePreviewIllustrationsCompositionSource),
  media: stripSourceCodeBlocks(filePreviewMediaCompositionSource),
} as const;

const FILE_PREVIEW_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "FilePreview",
    type: "span props",
    description: "Preview root and positioning context for the visual part and badge.",
  },
];

const FILE_PREVIEW_VISUAL_PROPS: readonly PropRow[] = [
  {
    name: "FilePreviewDocument",
    type: "span props",
    description: "Document-sheet illustration.",
  },
  {
    name: "FilePreviewFile",
    type: "span props",
    description: "Archive/file illustration.",
  },
  {
    name: "FilePreviewCode",
    type: "span props",
    description: "Code-file illustration.",
  },
  {
    name: "FilePreviewMedia",
    type: "span props",
    description:
      "Cropped media frame. Pass image, video, SVG, or other decorative preview content as children; image and video thumbnails typically use size-full object-cover.",
  },
];

const FILE_PREVIEW_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "FilePreviewBadge",
    type: 'span props & { color?: "rose" | "blue" | "amber" | "emerald" | "violet" | "neutral" }',
    default: 'color: "rose"',
    description:
      "Format label such as PDF or TXT. Render it beside the visual part; choose color at the callsite rather than inferring it from a file name.",
  },
];

export const Route = createFileRoute("/components/file-preview")({
  component: FilePreviewDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function FilePreviewDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="FilePreview"
      description="Compact file, code, and media thumbnails for file attachment metadata."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example html={code.default}>
          <div className="flex min-h-28 items-center justify-center">
            <FilePreviewDefaultComposition />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="formats" title="Format labels">
            <Example html={code.formats}>
              <FilePreviewFormatsComposition />
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="illustrations" title="File kinds">
            <Example html={code.illustrations}>
              <FilePreviewIllustrationsComposition />
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customization" title="Customization">
            <div className="grid gap-3">
              <p className="text-sm text-foreground">
                FilePreviewMedia owns the frame, crop, and rounding. Supply an image, video, SVG, or
                other preview through children.
              </p>
              <Example html={code.media}>
                <FilePreviewMediaComposition />
              </Example>
            </div>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="FilePreview root">
            <PropsTable rows={FILE_PREVIEW_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-visuals" title="Visual parts">
            <PropsTable rows={FILE_PREVIEW_VISUAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-badge" title="FilePreviewBadge">
            <PropsTable rows={FILE_PREVIEW_BADGE_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
