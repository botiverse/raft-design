import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { SkeletonPlaygroundPreview } from "#/modules/skeleton/skeleton.preview.tsx";
import skeletonPreviewCompositionSource from "#/modules/skeleton/compositions/preview.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const VARIANTS = ["line", "block", "circle"] as const;

const SNIPPETS = {
  anatomy: `import { Skeleton } from "raft-ui";

<Skeleton />`,
  variants: `<Skeleton variant="line" className="w-40" />
<Skeleton variant="block" className="size-12" />
<Skeleton variant="circle" className="size-10" />`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Preview: skeletonPreviewCompositionSource,
});

const COMPOSITION_SNIPPET_IDS = {
  Preview: "skeletonPreviewComposition",
} as const;

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(
  COMPOSITION_SOURCES,
  COMPOSITION_SNIPPET_IDS,
);

const SKELETON_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"block"',
    description: "Shape treatment: text line, filled block, or circular avatar/status stand-in.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description:
      "Native div attributes. Decorative loading shape; size comes from className so it can match final content.",
  },
];

export const Route = createFileRoute("/components/skeleton")({
  component: SkeletonDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...COMPOSITION_SNIPPETS,
      },
    }),
});

function SkeletonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Skeleton"
      description="Loading placeholders that preserve final layout shape."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SkeletonPlaygroundPreview code={code.skeletonPreviewComposition} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="variants" title="Variants">
          <Preview>
            <Preview.Canvas>
              <div className="flex items-center gap-4">
                <Skeleton variant="line" className="w-40" />
                <Skeleton variant="block" className="size-12" />
                <Skeleton variant="circle" className="size-10" />
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.variants} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Skeleton">
            <PropsTable rows={SKELETON_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
