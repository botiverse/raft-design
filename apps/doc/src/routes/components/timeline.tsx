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
import { TimelineHorizontalComposition } from "#/modules/timeline/compositions/horizontal.composition.tsx";
import timelineHorizontalCompositionSource from "#/modules/timeline/compositions/horizontal.composition.tsx?raw";
import { TimelineIconComposition } from "#/modules/timeline/compositions/icon.composition.tsx";
import timelineIconCompositionSource from "#/modules/timeline/compositions/icon.composition.tsx?raw";
import { TimelinePlacementComposition } from "#/modules/timeline/compositions/placement.composition.tsx";
import timelinePlacementCompositionSource from "#/modules/timeline/compositions/placement.composition.tsx?raw";
import timelinePreviewCompositionSource from "#/modules/timeline/compositions/preview.composition.tsx?raw";
import { PLACEMENTS, SIZES, VARIANTS } from "#/modules/timeline/timeline.constants.ts";
import { TimelinePlaygroundPreview } from "#/modules/timeline/timeline.preview.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { Timeline, TimelineContent, TimelineItem, TimelineTime, TimelineTitle } from "raft-ui";

<Timeline>
  <TimelineItem variant="success">
    <TimelineTitle />
    <TimelineContent />
    <TimelineTime />
  </TimelineItem>
</Timeline>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Preview: timelinePreviewCompositionSource,
  Placement: timelinePlacementCompositionSource,
  Horizontal: timelineHorizontalCompositionSource,
  Icon: timelineIconCompositionSource,
});

const COMPOSITION_SNIPPET_IDS = {
  Preview: "timelinePreviewComposition",
  Placement: "timelinePlacementComposition",
  Horizontal: "timelineHorizontalComposition",
  Icon: "timelineIconComposition",
} as const;

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(
  COMPOSITION_SOURCES,
  COMPOSITION_SNIPPET_IDS,
);

const union = (values: readonly string[]) => values.map((value) => `"${value}"`).join(" | ");

const TIMELINE_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: union(SIZES),
    default: '"md"',
    description: "Marker and text size.",
  },
  {
    name: "itemPlacement",
    type: union(PLACEMENTS),
    default: '"left"',
    description: "Which side the markers sit on. Ignored when horizontal.",
  },
  {
    name: "horizontal",
    type: "boolean",
    default: "false",
    description: "Lays the items out in a row; each marker is followed by a line to the next.",
  },
  {
    name: "iconSize",
    type: "number",
    description: "Marker size in px. Defaults to the theme's size for the current size.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"ol">',
    description: "Native ordered-list attributes.",
  },
];

const ITEM_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: union(VARIANTS),
    default: '"default"',
    description: "Marker color role.",
  },
  {
    name: "color",
    type: "string",
    description: "A custom marker color; overrides variant. Prefer a palette token.",
  },
  {
    name: "icon",
    type: "ReactNode",
    description: "Replaces the dot marker and takes the variant's color.",
  },
  {
    name: "lineType",
    type: '"solid" | "dashed"',
    default: '"solid"',
    description: "The line from this item to the next.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"li">',
    description: "Native list-item attributes. Children render beside the marker.",
  },
];

const TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Item title; the marker centers on its first line.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Item body text.",
  },
];

const TIME_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Muted time or meta line under the content.",
  },
];

export const Route = createFileRoute("/components/timeline")({
  component: TimelineDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...COMPOSITION_SNIPPETS,
      },
    }),
});

function TimelineDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Timeline"
      description="An ordered list of events, each with a marker, a title, content and a time."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <TimelinePlaygroundPreview
          code={code.timelinePreviewComposition}
          collapsedCode={code.timelinePreviewCompositionBody}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="placement" title="Item placement">
            <DocNote>
              <InlineCode>itemPlacement="right"</InlineCode> puts the markers on the right and
              aligns the text to them.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <TimelinePlacementComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.timelinePlacementComposition}
                collapsedHtml={code.timelinePlacementCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="horizontal" title="Horizontal">
            <DocNote>
              <InlineCode>horizontal</InlineCode> lays the items out in a row.{" "}
              <InlineCode>lineType="dashed"</InlineCode> draws a dashed line to the next item.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <TimelineHorizontalComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.timelineHorizontalComposition}
                collapsedHtml={code.timelineHorizontalCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="icon" title="Icon and color">
            <DocNote>
              <InlineCode>icon</InlineCode> replaces the dot and takes the variant's color;{" "}
              <InlineCode>iconSize</InlineCode> sets the marker size for the whole timeline.{" "}
              <InlineCode>color</InlineCode> gives one item a custom color.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <TimelineIconComposition />
              </Preview.Canvas>
              <Preview.Code
                html={code.timelineIconComposition}
                collapsedHtml={code.timelineIconCompositionBody}
              />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-timeline" title="Timeline">
            <PropsTable rows={TIMELINE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-timeline-item" title="TimelineItem">
            <PropsTable rows={ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-timeline-title" title="TimelineTitle">
            <PropsTable rows={TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-timeline-content" title="TimelineContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-timeline-time" title="TimelineTime">
            <PropsTable rows={TIME_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
