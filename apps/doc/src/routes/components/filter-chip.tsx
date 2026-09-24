import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { FilterChipComposition } from "#/modules/filter-chip/filter-chip.composition.tsx";
import filterChipCompositionSource from "#/modules/filter-chip/filter-chip.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "api", title: "API" },
] as const;

const CHIP_PROPS: readonly PropRow[] = [
  {
    name: "pressed",
    type: "boolean",
    description: "Controlled pressed state. Pair with onPressedChange.",
  },
  {
    name: "defaultPressed",
    type: "boolean",
    default: "false",
    description: "Initial pressed state when uncontrolled.",
  },
  {
    name: "...props",
    type: "Toggle.Props",
    description:
      'Base UI Toggle. Chips are independent; wrap them in an element with role="group" and an aria-label, and make chips mutually exclusive in your own state when needed.',
  },
];

const COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional number of matching items shown after the label.",
  },
];

const SNIPPETS = { chips: filterChipCompositionSource } as const;

export const Route = createFileRoute("/components/filter-chip")({
  component: FilterChipDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function FilterChipDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="FilterChip"
      description="Pressable pills that narrow a list, such as topic filters above a TopicList."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <FilterChipComposition />
          </Preview.Canvas>
          <Preview.Code html={code.chips} collapsedHtml={code.chipsBody} />
        </Preview>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-chip" title="FilterChip">
            <PropsTable rows={CHIP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-count" title="FilterChipCount">
            <PropsTable rows={COUNT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
