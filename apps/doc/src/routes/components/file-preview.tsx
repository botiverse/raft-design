import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import filePreviewDefaultCompositionSource from "#/modules/file-preview/compositions/default.composition.tsx?raw";
import { FilePreviewDefaultComposition } from "#/modules/file-preview/compositions/default.composition.tsx";
import filePreviewFormatsCompositionSource from "#/modules/file-preview/compositions/formats.composition.tsx?raw";
import { FilePreviewFormatsComposition } from "#/modules/file-preview/compositions/formats.composition.tsx";
import filePreviewMediaCompositionSource from "#/modules/file-preview/compositions/media.composition.tsx?raw";
import { FilePreviewMediaComposition } from "#/modules/file-preview/compositions/media.composition.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "formats", title: "Format labels" },
  { id: "custom-media", title: "Custom media" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `<FilePreview>
  <FilePreviewDocument>
    <FilePreviewBadge tone="rose">PDF</FilePreviewBadge>
  </FilePreviewDocument>
</FilePreview>`,
  default: stripSourceCodeBlocks(filePreviewDefaultCompositionSource),
  formats: stripSourceCodeBlocks(filePreviewFormatsCompositionSource),
  media: stripSourceCodeBlocks(filePreviewMediaCompositionSource),
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "FilePreviewDocument",
    type: "span props",
    description: "Document-sheet illustration. Nest FilePreviewBadge for a format label.",
  },
  {
    name: "FilePreviewImage | FilePreviewVideo",
    type: "img props | video props",
    description: "Native image or video thumbnail slots for consumer-provided media.",
  },
  {
    name: "FilePreviewMedia",
    type: "span props",
    description: "Generic custom-media slot for SVGs, canvases, or caller-owned preview markup.",
  },
  {
    name: "FilePreviewBadge",
    type: "span props",
    description:
      "Format label such as PDF or TXT. One shared visual treatment is used for every label.",
  },
  {
    name: "tone",
    type: '"rose" | "blue" | "amber" | "emerald" | "violet" | "neutral"',
    default: '"rose"',
    description:
      "Optional badge color. Choose it at the callsite; FilePreview never infers a tone from a file name.",
  },
  {
    name: "className",
    type: "string",
    description: "Optional layout or positioning override for the decorative preview root.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description:
      "Base UI render hook for changing the root element when required by a parent layout.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"span">',
    description:
      "Native span attributes. The preview is decorative; pair it with visible file metadata.",
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
      description="A compact, decorative document thumbnail for file attachment metadata."
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

      <DocSection id="formats" title="Format labels" showThemeSwitcher>
        <Example html={code.formats}>
          <FilePreviewFormatsComposition />
        </Example>
      </DocSection>

      <DocSection id="custom-media" title="Custom media" showThemeSwitcher>
        <Example html={code.media}>
          <FilePreviewMediaComposition />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
