import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { IconTileSizesComposition } from "#/modules/icon-tile/compositions/sizes.composition.tsx";
import iconTileSizesCompositionSource from "#/modules/icon-tile/compositions/sizes.composition.tsx?raw";
import { IconTileVariantsComposition } from "#/modules/icon-tile/compositions/variants.composition.tsx";
import iconTileVariantsCompositionSource from "#/modules/icon-tile/compositions/variants.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { IconTile } from "raft-ui";

<IconTile>{/* an icon */}</IconTile>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Sizes: iconTileSizesCompositionSource,
  Variants: iconTileVariantsCompositionSource,
});

const COMPOSITION_SNIPPET_IDS = {
  Sizes: "iconTileSizesComposition",
  Variants: "iconTileVariantsComposition",
} as const;

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(
  COMPOSITION_SOURCES,
  COMPOSITION_SNIPPET_IDS,
);

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: '"xs" | "sm" | "md" | "lg"',
    default: '"md"',
    description: "The avatar sizes: 19, 27, 35 or 51, with a 11, 14, 18 or 22px icon.",
  },
  {
    name: "variant",
    type: '"default" | "warning" | "information"',
    default: '"default"',
    description:
      "default: surface-sunken with an ink-2 icon. warning and information: the soft orange or cyan of a system notice, with an ink icon.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Change the root element.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Native span attributes. Label a tile that means something with role and aria-label.",
  },
];

export const Route = createFileRoute("/components/icon-tile")({
  component: IconTileDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...COMPOSITION_SNIPPETS,
      },
    }),
});

function IconTileDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="IconTile"
      description="A neutral square holding an icon, for what has no face: a system notice, a file, an app, a computer. It sits where an avatar would and takes the avatar sizes."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <IconTileSizesComposition />
          </Preview.Canvas>
          <Preview.Code html={code.iconTileSizesComposition} />
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
        <DocSubsection parentId="usage" id="variants" title="Variants">
          <DocNote>
            The neutral tile is the default. <InlineCode>warning</InlineCode> (an error or a
            warning) and <InlineCode>information</InlineCode> (a message) are only for system
            notices, such as the notification centre's.
          </DocNote>
          <Preview>
            <Preview.Canvas>
              <IconTileVariantsComposition />
            </Preview.Canvas>
            <Preview.Code html={code.iconTileVariantsComposition} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
