import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { PanelComposition } from "#/modules/panel/panel.composition.tsx";
import panelCompositionSource from "#/modules/panel/panel.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  panelComposition: panelCompositionSource,
  anatomy: `<Panel>
  {/* Use PanelHeaderFrame directly for a fully custom fixed header. */}
  <PanelHeaderFrame />

  <PanelBody>
    <PanelScrollViewport>
      <PanelScrollContent>
        <PanelSection />
      </PanelScrollContent>
    </PanelScrollViewport>
  </PanelBody>

  {/* Optional bottom action boundary. */}
  <PanelFooter />
</Panel>`,
  composedHeader: `<PanelHeader>
  <PanelHeaderContent>
    <PanelHeaderIcon />
    <PanelHeading>
      <PanelTitle />
      <PanelStatus />
    </PanelHeading>
    <PanelMeta />
  </PanelHeaderContent>
  <PanelActions />
</PanelHeader>

{/* Use as an alternative fixed header for a section-level view. */}
<PanelSectionHeader />`,
} as const;

const PANEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"section">',
    description:
      "Layout-neutral panel root. The caller chooses sizing, placement, surface treatment, and header composition.",
  },
  {
    name: "--panel-footer-clearance",
    type: "<length>",
    default: "10rem",
    description:
      "Elegant desktop space reserved below scroll content for an overlaid PanelFooter. Set to 0rem when the panel has no footer.",
  },
];

const PANEL_HEADER_FRAME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Low-level fixed header region. Use PanelHeader when the header needs the shared identity, metadata, status, and actions layout.",
  },
];

const PANEL_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Shared panel header layout for caller-owned identity, metadata, status, and actions.",
  },
];

const PANEL_SECTION_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Fixed section-level header with the shared responsive panel treatment.",
  },
];

const PANEL_HEADER_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional identity icon inside PanelHeaderContent.",
  },
];

const PANEL_HEADER_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Flexible region for an optional icon, title, metadata, and status parts.",
  },
];

const PANEL_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Inline group for a title and its adjacent status.",
  },
];

const PANEL_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Caller-owned panel or section title.",
  },
];

const PANEL_META_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: '"sm" | "md"',
    default: '"sm"',
    description: "Secondary metadata size.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Optional secondary metadata below or alongside the title.",
  },
];

const PANEL_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional caller-owned status alongside the title.",
  },
];

const PANEL_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Trailing region for caller-owned actions.",
  },
];

const PANEL_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Flexible min-height-zero body boundary that clips overflow around a contained viewport.",
  },
];

const PANEL_SCROLL_VIEWPORT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Native vertical scroll owner with overscroll containment and mobile momentum scrolling.",
  },
];

const PANEL_SCROLL_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Minimum-full-height content wrapper. Elegant panels reserve footer clearance when needed.",
  },
];

const PANEL_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Bottom action boundary with safe-area padding. Elegant desktop panels float it over the scroll body.",
  },
];

const PANEL_SECTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"section">',
    description: "Section boundary that owns the separator and panel-consistent inline padding.",
  },
];

export const Route = createFileRoute("/components/panel")({
  component: PanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function PanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Panel"
      description="Layout foundation for fixed headers, contained scrolling, sections, and optional bottom actions."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <div className="h-[24rem] w-full max-w-[32rem] overflow-hidden border border-line bg-layer-panel">
              <PanelComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.panelComposition} collapsedHtml={code.panelCompositionBody} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="space-y-4">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.composedHeader} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-panel" title="Panel">
            <PropsTable rows={PANEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-header-frame" title="PanelHeaderFrame">
            <PropsTable rows={PANEL_HEADER_FRAME_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-header" title="PanelHeader">
            <PropsTable rows={PANEL_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-section-header" title="PanelSectionHeader">
            <PropsTable rows={PANEL_SECTION_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-header-icon" title="PanelHeaderIcon">
            <PropsTable rows={PANEL_HEADER_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-header-content" title="PanelHeaderContent">
            <PropsTable rows={PANEL_HEADER_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-heading" title="PanelHeading">
            <PropsTable rows={PANEL_HEADING_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-title" title="PanelTitle">
            <PropsTable rows={PANEL_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-meta" title="PanelMeta">
            <PropsTable rows={PANEL_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-status" title="PanelStatus">
            <PropsTable rows={PANEL_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-actions" title="PanelActions">
            <PropsTable rows={PANEL_ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-body" title="PanelBody">
            <PropsTable rows={PANEL_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-scroll-viewport" title="PanelScrollViewport">
            <PropsTable rows={PANEL_SCROLL_VIEWPORT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-scroll-content" title="PanelScrollContent">
            <PropsTable rows={PANEL_SCROLL_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-footer" title="PanelFooter">
            <PropsTable rows={PANEL_FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-section" title="PanelSection">
            <PropsTable rows={PANEL_SECTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
