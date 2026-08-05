import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
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
  anatomy: `import {
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
} from "raft-ui";

<FilePreview>
  <FilePreviewDocument />
  <FilePreviewBadge type="pdf">PDF</FilePreviewBadge>
</FilePreview>`,
  default: stripSourceCodeBlocks(filePreviewDefaultCompositionSource),
  formats: stripSourceCodeBlocks(filePreviewFormatsCompositionSource),
  illustrations: stripSourceCodeBlocks(filePreviewIllustrationsCompositionSource),
  media: stripSourceCodeBlocks(filePreviewMediaCompositionSource),
} as const;

const FILE_PREVIEW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Preview root and positioning context for the visual part and badge.",
  },
];

const FILE_PREVIEW_DOCUMENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Document-sheet illustration.",
  },
];

const FILE_PREVIEW_FILE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Archive/file illustration.",
  },
];

const FILE_PREVIEW_CODE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Code-file illustration.",
  },
];

const FILE_PREVIEW_MEDIA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description:
      "Cropped media frame. Pass image, video, SVG, or other decorative preview content as children; image and video thumbnails typically use size-full object-cover.",
  },
];

const FILE_PREVIEW_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "type",
    type: '"pdf" | "zip" | "docx" | "img" | "mp4" | …',
    description:
      "Semantic file kind. Maps onto badge color (e.g. pdf→rose, zip→amber). Mutually exclusive with color.",
  },
  {
    name: "color",
    type: '"rose" | "blue" | "amber" | "emerald" | "violet" | "neutral"',
    default: '"rose"',
    description:
      "Direct badge color. Mutually exclusive with type; omit both to keep the rose default.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Format label such as PDF or TXT. Render it beside the visual part.",
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
        <Preview>
          <Preview.Canvas>
            <div className="flex min-h-28 items-center justify-center">
              <FilePreviewDefaultComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.default} collapsedHtml={code.defaultBody} />
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
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="formats" title="Format labels">
            <DocNote>
              Prefer <InlineCode>type</InlineCode> for semantic kinds (<InlineCode>pdf</InlineCode>,{" "}
              <InlineCode>zip</InlineCode>, …). It maps onto badge color. Use{" "}
              <InlineCode>color</InlineCode> only when you need a one-off that is not in the type
              map — the two props are mutually exclusive.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <FilePreviewFormatsComposition />
              </Preview.Canvas>
              <Preview.Code html={code.formats} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="illustrations" title="File kinds">
            <Preview>
              <Preview.Canvas>
                <FilePreviewIllustrationsComposition />
              </Preview.Canvas>
              <Preview.Code html={code.illustrations} collapsedHtml={code.illustrationsBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customization" title="Customization">
            <div className="grid gap-3">
              <p className="text-sm text-foreground-strong">
                <InlineCode>FilePreviewMedia</InlineCode> owns the frame, crop, and rounding. Supply
                an image, video, SVG, or other preview through <InlineCode>children</InlineCode>.
              </p>
              <Preview>
                <Preview.Canvas>
                  <FilePreviewMediaComposition />
                </Preview.Canvas>
                <Preview.Code html={code.media} collapsedHtml={code.mediaBody} />
              </Preview>
            </div>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-file-preview" title="FilePreview">
            <PropsTable rows={FILE_PREVIEW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-file-preview-document" title="FilePreviewDocument">
            <PropsTable rows={FILE_PREVIEW_DOCUMENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-file-preview-file" title="FilePreviewFile">
            <PropsTable rows={FILE_PREVIEW_FILE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-file-preview-code" title="FilePreviewCode">
            <PropsTable rows={FILE_PREVIEW_CODE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-file-preview-media" title="FilePreviewMedia">
            <PropsTable rows={FILE_PREVIEW_MEDIA_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-file-preview-badge" title="FilePreviewBadge">
            <PropsTable rows={FILE_PREVIEW_BADGE_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
