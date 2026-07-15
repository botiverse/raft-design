import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MobileNavPreview } from "#/modules/mobile-nav/mobile-nav.preview.tsx";
import mobileNavCompositionSource from "#/modules/mobile-nav/mobile-nav.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  mobileNavComposition: mobileNavCompositionSource,
  anatomy: `<MobileNavRoot>
  <MobileNavItem selected aria-label="Home">
    <Home />
    <MobileNavLabel>Home</MobileNavLabel>
  </MobileNavItem>
</MobileNavRoot>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "MobileNavRoot",
    type: 'useRender.ComponentProps<"nav">',
    description:
      "Bottom navigation container. Its width and safe-area spacing follow the active theme.",
  },
  {
    name: "MobileNavItem",
    type: 'useRender.ComponentProps<"button"> & { selected?: boolean }',
    description:
      "One app-owned destination. Pass selected and native onClick from the consuming route or local state.",
  },
  {
    name: "MobileNavLabel",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Destination text. Brutal renders it below the icon; Elegant keeps the same semantic structure visually hidden.",
  },
];

export const Route = createFileRoute("/components/mobile-nav")({
  component: MobileNavDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function MobileNavDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MobileNav"
      description="Composable bottom navigation for app-owned mobile destinations."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example
          html={code.mobileNavComposition}
          previewClassName="!items-stretch !p-0"
          previewInset="flush"
        >
          <MobileNavPreview />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
