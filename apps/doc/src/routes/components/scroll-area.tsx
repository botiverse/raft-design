import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import { ScrollAreaBasicComposition } from "#/modules/scroll-area/compositions/basic.composition.tsx";
import scrollAreaBasicCompositionSource from "#/modules/scroll-area/compositions/basic.composition.tsx?raw";
import { ScrollAreaBothAxesComposition } from "#/modules/scroll-area/compositions/both-axes.composition.tsx";
import scrollAreaBothAxesCompositionSource from "#/modules/scroll-area/compositions/both-axes.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "raft-ui";

<ScrollArea>
  <ScrollAreaViewport>
    <ScrollAreaContent />
  </ScrollAreaViewport>
  <ScrollAreaScrollbar>
    <ScrollAreaThumb />
  </ScrollAreaScrollbar>
</ScrollArea>`,
  basic: stripSourceCodeBlocks(scrollAreaBasicCompositionSource),
  bothAxes: stripSourceCodeBlocks(scrollAreaBothAxesCompositionSource),
} as const;

const SCROLL_AREA_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ScrollArea.Root.Props",
    description: "Root grouping for viewport, content, scrollbar, and corner parts.",
  },
];

const SCROLL_AREA_VIEWPORT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ScrollArea.Viewport.Props",
    description: "The scrollable viewport. Overflow edge CSS variables live on this part.",
  },
];

const SCROLL_AREA_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ScrollArea.Content.Props",
    description: "Sized content wrapper inside the viewport.",
  },
];

const SCROLL_AREA_SCROLLBAR_PROPS: readonly PropRow[] = [
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Scrollbar axis.",
  },
  {
    name: "...props",
    type: "Base UI ScrollArea.Scrollbar.Props",
    description: "Custom scrollbar track. Visible while scrolling via data-scrolling.",
  },
];

const SCROLL_AREA_THUMB_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ScrollArea.Thumb.Props",
    description: "Draggable thumb inside a scrollbar.",
  },
];

const SCROLL_AREA_CORNER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI ScrollArea.Corner.Props",
    description: "Fills the intersection when both scrollbars are visible.",
  },
];

export const Route = createFileRoute("/components/scroll-area")({
  component: ScrollAreaDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ScrollAreaDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ScrollArea"
      description="Native scrolling with themed custom scrollbars for dense panels and lists."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <div className="flex min-h-64 items-center justify-center">
              <ScrollAreaBasicComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.basic} collapsedHtml={code.basicBody} />
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
        <DocSubsection parentId="usage" id="both-axes" title="Both axes">
          <Preview>
            <Preview.Canvas>
              <div className="flex min-h-64 items-center justify-center">
                <ScrollAreaBothAxesComposition />
              </div>
            </Preview.Canvas>
            <Preview.Code html={code.bothAxes} collapsedHtml={code.bothAxesBody} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="ScrollArea">
            <PropsTable rows={SCROLL_AREA_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-viewport" title="ScrollAreaViewport">
            <PropsTable rows={SCROLL_AREA_VIEWPORT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="ScrollAreaContent">
            <PropsTable rows={SCROLL_AREA_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-scrollbar" title="ScrollAreaScrollbar">
            <PropsTable rows={SCROLL_AREA_SCROLLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thumb" title="ScrollAreaThumb">
            <PropsTable rows={SCROLL_AREA_THUMB_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-corner" title="ScrollAreaCorner">
            <PropsTable rows={SCROLL_AREA_CORNER_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
