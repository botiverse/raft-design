import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
import { SkeletonPlaygroundPreview } from "#/modules/skeleton/skeleton.preview.tsx";
import skeletonBasicCompositionSource from "#/modules/skeleton/compositions/basic.composition.tsx?raw";
import { SkeletonBasicComposition } from "#/modules/skeleton/compositions/basic.composition.tsx";
import skeletonPreviewCompositionSource from "#/modules/skeleton/compositions/preview.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import SourceSkeleton from "../../../../../packages/ui/source/Skeleton.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const VARIANTS = ["line", "block", "circle"] as const;

const SOURCE_SCENES = {
  Basic: [
    {
      label: "Skeleton primitive",
      scenes: [
        {
          label: "Skeleton.tsx:26",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/ui/Skeleton.tsx:26",
        },
        {
          label: "MessageSearchPage.tsx:161",
          path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/search/MessageSearchPage.tsx:161",
        },
      ],
    },
  ],
} as const;

const SNIPPETS = {
  anatomy: `<Skeleton />`,
  variants: `<Skeleton variant="line" className="w-40" />
<Skeleton variant="block" className="size-12" />
<Skeleton variant="circle" className="size-10" />`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Basic: skeletonBasicCompositionSource,
  Preview: skeletonPreviewCompositionSource,
});

const COMPOSITION_PATHS = {
  Basic: "apps/doc/src/modules/skeleton/compositions/basic.composition.tsx",
  Preview: "apps/doc/src/modules/skeleton/compositions/preview.composition.tsx",
} as const;

const COMPOSITION_SNIPPET_IDS = {
  Basic: "skeletonBasicComposition",
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

type CompositionKey = keyof typeof COMPOSITION_SOURCES;

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
  const compositionPanelProps = (key: CompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: COMPOSITION_PATHS,
      snippetIds: COMPOSITION_SNIPPET_IDS,
      sources: COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Skeleton"
      description="Theme-aware loading placeholders that preserve final layout shape."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SkeletonPlaygroundPreview
          code={code.skeletonPreviewComposition}
          collapsedCode={code.skeletonPreviewCompositionBody}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Primitive variants",
              status: "difference",
              note: "Source used a bordered circle for avatar slots. Current treats circle as the same filled placeholder material as line and block while preserving dimensions.",
              sourceScenes: SOURCE_SCENES.Basic,
              source: <SourceBasicPreview />,
              brutal: <SkeletonBasicComposition />,
              elegant: <SkeletonBasicComposition />,
              elegantDark: <SkeletonBasicComposition />,
              ...compositionPanelProps("Basic"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function SourceBasicPreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <div className="flex items-center gap-3">
        <SourceSkeleton variant="circle" className="size-9" />
        <div className="grid w-48 gap-2">
          <SourceSkeleton variant="line" className="w-32" />
          <SourceSkeleton variant="line" className="w-44" />
        </div>
        <SourceSkeleton variant="block" className="size-10" />
      </div>
    </SourceComparisonPreview>
  );
}
