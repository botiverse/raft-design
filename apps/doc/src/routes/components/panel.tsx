import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { PanelHeader, PanelHeaderContent, PanelHeading, PanelMeta, PanelTitle } from "raft-ui";
import type { PanelEdge } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { PanelComposition } from "#/modules/panel/panel.composition.tsx";
import panelCompositionSource from "#/modules/panel/panel.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "long-header", title: "Long names and descriptions" },
  { id: "api", title: "API" },
] as const;

const LONG_HEADER_DESCRIPTION =
  "Raft web frontend. DRI: someone with a long name, plus the deploy checklist and the on-call rota";
const LONG_HEADER_CASES = [
  { label: "Wide", width: "100%", name: "proj-frontend" },
  { label: "480px", width: "480px", name: "proj-frontend" },
  { label: "320px", width: "320px", name: "proj-frontend" },
  {
    label: "320px · name longer than the row",
    width: "320px",
    name: "a-very-long-channel-name-that-cannot-fit-in-this-header",
  },
] as const;

const SNIPPETS = {
  panelComposition: panelCompositionSource,
  anatomy: `import {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeaderRoot,
  PanelScrollContent,
  PanelScrollViewport,
  PanelSection,
} from "raft-ui";

<Panel edge="inset">
  {/* Use PanelHeaderRoot directly for a fully custom fixed header. */}
  <PanelHeaderRoot />

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
  composedHeader: `import {
  PanelAction,
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeading,
  PanelMeta,
  PanelSectionHeader,
  PanelStatus,
  PanelTitle,
} from "raft-ui";

<PanelHeader>
  <PanelHeaderIcon />
  <PanelHeaderContent>
    <PanelHeading>
      <PanelTitle />
      <PanelStatus />
    </PanelHeading>
    <PanelMeta />
  </PanelHeaderContent>
  <PanelActions>
    <PanelAction aria-label="Panel action">...</PanelAction>
  </PanelActions>
</PanelHeader>

{/* Use as an alternative fixed header for a section-level view. */}
<PanelSectionHeader />`,
} as const;

const PANEL_PROPS: readonly PropRow[] = [
  {
    name: "edge",
    type: '"inset" | "attached"',
    description:
      "Lets the panel own how its header and content meet adjacent regions. AppShell slots remain layout-only.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"section">',
    description:
      "Panel root. The caller chooses sizing, placement, surface treatment, and header composition.",
  },
];

const PANEL_EDGES = ["inset", "attached"] as const;

const PANEL_HEADER_ROOT_PROPS: readonly PropRow[] = [
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
    description:
      "Optional identity region alongside PanelHeaderContent. It uses the contained sticker-chip icon treatment; the consumer owns the content's size, such as Avatar size or icon size classes.",
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
    description: "Attribute badge alongside the title, such as a muted marker.",
  },
];

const PANEL_ACTIVITY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Live status readout alongside the title, wrapping a Status.",
  },
];

const PANEL_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Trailing region for caller-owned actions.",
  },
];

const PANEL_TOGGLE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'Omit<StyledProps<BaseToggle.Props>, "type">',
    description:
      "Base UI Toggle props for a pressed-state action (for example panel collapse). See the conversation-panel page for its header usage.",
  },
];

const PANEL_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'Omit<StyledProps<BaseButton.Props>, "type">',
    description:
      'Base UI Button props with className narrowed to string. The component always renders type="button", supports render/nativeButton for element substitution, and owns panel-action icon sizing and tabular number alignment.',
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
    description: "Minimum-full-height content wrapper.",
  },
];

const PANEL_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Bottom action boundary with safe-area padding.",
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
  const [edge, setEdge] = useState<PanelEdge>("inset");
  const handleEdgeChange = useCallback((value: string) => setEdge(value as PanelEdge), []);

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
              <PanelComposition edge={edge} />
            </div>
          </Preview.Canvas>
          <Preview.Controls>
            <Preview.Control label="Edge" htmlFor="panel-preview-edge">
              <Preview.Select
                id="panel-preview-edge"
                label="Edge"
                options={PANEL_EDGES}
                value={edge}
                onValueChange={handleEdgeChange}
              />
            </Preview.Control>
          </Preview.Controls>
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

      <DocSection id="long-header" title="Long names and descriptions" showThemeSwitcher>
        <p className="mb-4 text-sm text-foreground-muted">
          On desktop the name and the description share one row. The name keeps its full width; the
          description only uses what is left and truncates, or disappears, first. The name itself
          truncates only when it alone is wider than the row.
        </p>
        <div className="space-y-4" data-demo="long-header">
          {LONG_HEADER_CASES.map((c) => (
            <div key={c.label}>
              <div className="mb-1 text-xs text-foreground-placeholder">{c.label}</div>
              <div
                className="overflow-hidden border border-line bg-layer-panel"
                style={{ width: c.width }}
              >
                <PanelHeader>
                  <PanelHeaderContent>
                    <PanelHeading>
                      <PanelTitle title={c.name}>{c.name}</PanelTitle>
                    </PanelHeading>
                    <PanelMeta>{LONG_HEADER_DESCRIPTION}</PanelMeta>
                  </PanelHeaderContent>
                </PanelHeader>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-panel" title="Panel">
            <PropsTable rows={PANEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-header-root" title="PanelHeaderRoot">
            <PropsTable rows={PANEL_HEADER_ROOT_PROPS} />
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
          <DocSubsection parentId="api" id="api-panel-activity" title="PanelActivity">
            <PropsTable rows={PANEL_ACTIVITY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-actions" title="PanelActions">
            <PropsTable rows={PANEL_ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-toggle-action" title="PanelToggleAction">
            <PropsTable rows={PANEL_TOGGLE_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-action" title="PanelAction">
            <PropsTable rows={PANEL_ACTION_PROPS} />
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
