import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { MobileNavComposition } from "#/modules/mobile-nav/mobile-nav.composition.tsx";
import { MobileNavPreview } from "#/modules/mobile-nav/mobile-nav.preview.tsx";
import { SourceMobileNavPreview } from "#/modules/mobile-nav/mobile-nav.source-preview.tsx";
import mobileNavCompositionSource from "#/modules/mobile-nav/mobile-nav.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock mobile navigation",
    scenes: [
      {
        label: "MainLayout.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/layout/MainLayout.tsx",
      },
      {
        label: "mobileNavStore.ts",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/store/mobileNavStore.ts",
      },
    ],
  },
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

const MOBILE_NAV_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"nav">',
    description:
      "Bottom navigation container. Its width and safe-area spacing follow the active theme.",
  },
];

const MOBILE_NAV_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    description:
      "Marks the destination as selected. Sets data-selected and aria-pressed when nativeButton is true.",
  },
  {
    name: "nativeButton",
    type: "boolean",
    default: "true",
    description:
      "When false, skip native button type/aria-pressed wiring so render can replace the host element.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "One app-owned destination. Pass selected and native onClick from the consuming route or local state.",
  },
];

const MOBILE_NAV_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
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
        <Preview previewInset="flush">
          <Preview.Canvas>
            <MobileNavPreview />
          </Preview.Canvas>
          <Preview.Code html={code.mobileNavComposition} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-mobile-nav-root" title="MobileNavRoot">
            <PropsTable rows={MOBILE_NAV_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-mobile-nav-item" title="MobileNavItem">
            <PropsTable rows={MOBILE_NAV_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-mobile-nav-label" title="MobileNavLabel">
            <PropsTable rows={MOBILE_NAV_LABEL_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Four-tab mobile bar",
              status: "match",
              note: "The source keeps Home, Tasks, Members, and Settings as the mobile destinations; selection and navigation remain consumer-owned.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <SourceMobileNavPreview />
                </SourceThemeScope>
              ),
              brutal: <MobileNavComposition />,
              elegant: <MobileNavComposition />,
              elegantDark: <MobileNavComposition />,
              compositionCode: mobileNavCompositionSource,
              compositionPath: "apps/doc/src/modules/mobile-nav/mobile-nav.composition.tsx",
              compositionSource: mobileNavCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
