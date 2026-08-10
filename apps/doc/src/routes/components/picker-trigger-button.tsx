import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { PickerTriggerButtonComboboxFilterComposition } from "#/modules/picker-trigger-button/compositions/combobox-filter.composition.tsx";
import comboboxFilterCompositionSource from "#/modules/picker-trigger-button/compositions/combobox-filter.composition.tsx?raw";
import { PickerTriggerButtonSelectFilterComposition } from "#/modules/picker-trigger-button/compositions/select-filter.composition.tsx";
import selectFilterCompositionSource from "#/modules/picker-trigger-button/compositions/select-filter.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "compositions", title: "Compositions" },
  { id: "api", title: "API" },
] as const;

const PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: 'Base UI Button.Props["render"]',
    description:
      "Replaces the native button element while preserving PickerTriggerButton behavior and styles.",
  },
  {
    name: "nativeButton",
    type: "boolean",
    description:
      "Overrides native-button handling. Inferred automatically when render replaces the element.",
  },
  {
    name: "...props",
    type: "StyledProps<Base UI Button.Props> & DataAttributes",
    description:
      "Base UI button attributes plus className and data attributes for the picker trigger.",
  },
];

export const Route = createFileRoute("/components/picker-trigger-button")({
  component: PickerTriggerButtonDoc,
  loader: () =>
    highlightSnippets({
      data: {
        selectFilter: selectFilterCompositionSource,
        comboboxFilter: comboboxFilterCompositionSource,
      },
    }),
});

function PickerTriggerButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="PickerTriggerButton"
      description="A compact, theme-aware button surface for Select and Combobox filter triggers."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="min-h-[18rem] items-start pt-24">
          <Preview.Canvas>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PickerTriggerButtonSelectFilterComposition />
              <PickerTriggerButtonComboboxFilterComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.selectFilter} collapsedHtml={code.selectFilterBody} />
        </Preview>
      </DocSection>

      <DocSection id="compositions" title="Compositions">
        <DocNote>
          Use this component as the render target for compact Select or Combobox filters. Keep the
          picker primitive responsible for open state, focus, keyboard navigation, and selection.
        </DocNote>
        <div className="mt-6 space-y-8">
          <DocSubsection parentId="compositions" id="select-filter" title="Select filter">
            <Preview previewClassName="min-h-[18rem] items-start pt-24">
              <Preview.Canvas>
                <PickerTriggerButtonSelectFilterComposition />
              </Preview.Canvas>
              <Preview.Code html={code.selectFilter} collapsedHtml={code.selectFilterBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="compositions" id="combobox-filter" title="Combobox filter">
            <Preview previewClassName="min-h-[22rem] items-start pt-24">
              <Preview.Canvas>
                <PickerTriggerButtonComboboxFilterComposition />
              </Preview.Canvas>
              <Preview.Code html={code.comboboxFilter} collapsedHtml={code.comboboxFilterBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
