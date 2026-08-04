import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
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
  anatomy: `import { Home } from "lucide-react";
import { MobileNavItem, MobileNavLabel, MobileNavRoot } from "raft-ui";

<MobileNavRoot>
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
          <Preview.Code
            html={code.mobileNavComposition}
            collapsedHtml={code.mobileNavCompositionBody}
          />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} collapsedHtml={code.anatomyBody} />
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
    </DocPage>
  );
}
