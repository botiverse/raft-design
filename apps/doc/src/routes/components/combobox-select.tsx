import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ComboboxSelectPreview } from "#/modules/combobox-select/combobox-select.preview.tsx";
import { AsyncOptionsComposition } from "#/modules/combobox-select/compositions/async-options.composition.tsx";
import asyncOptionsSource from "#/modules/combobox-select/compositions/async-options.composition.tsx?raw";
import { AsyncSearchComposition } from "#/modules/combobox-select/compositions/async-search.composition.tsx";
import asyncSearchSource from "#/modules/combobox-select/compositions/async-search.composition.tsx?raw";
import { AsyncSelectComposition } from "#/modules/combobox-select/compositions/async-select.composition.tsx";
import asyncSelectSource from "#/modules/combobox-select/compositions/async-select.composition.tsx?raw";
import { ComboboxSelectComposition } from "#/modules/combobox-select/compositions/combobox-select.composition.tsx";
import comboboxSelectSource from "#/modules/combobox-select/compositions/combobox-select.composition.tsx?raw";
import { ModelSelectComposition } from "#/modules/combobox-select/compositions/model-select.composition.tsx";
import modelSelectSource from "#/modules/combobox-select/compositions/model-select.composition.tsx?raw";
import previewSource from "#/modules/combobox-select/compositions/preview.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { ComboboxSelect } from "raft-ui/wip";

<ComboboxSelect
  options={options}
  value={value}
  onValueChange={setValue}
  clearable
  aria-label="Choose an option"
/>`,
} as const;

const COMBOBOX_SELECT_PROPS: readonly PropRow[] = [
  {
    name: "options",
    type: "readonly (Option | ComboboxSelectGroup<Option>)[]",
    description:
      "Options to display. A group contains a key, label, and children array for grouped results.",
  },
  {
    name: "value",
    type: "ComboboxSelectSelection<Multiple>",
    description: "Controls the selected option or options.",
  },
  {
    name: "defaultValue",
    type: "ComboboxSelectSelection<Multiple>",
    description: "Sets the initial selected option or options for an uncontrolled component.",
  },
  {
    name: "onValueChange",
    type: "(value, options, details) => void",
    description: "Called after a selectable option is chosen, removed, or cleared.",
  },
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description: "Enables multiple values and removable chips in the control.",
  },
  {
    name: "labelField",
    type: "keyof Option",
    default: '"label"',
    description: "Names the option field used for the visible label.",
  },
  {
    name: "valueField",
    type: "keyof Option",
    default: '"value"',
    description: "Names the option field used as the selected value.",
  },
  {
    name: "disabledField",
    type: "keyof Option",
    default: '"disabled"',
    description: "Names the option field that marks an option as unavailable.",
  },
  {
    name: "filterable",
    type: "boolean",
    default: "true",
    description: "Enables local filtering as the user types.",
  },
  {
    name: "filter",
    type: "false | ((query, option) => boolean)",
    description: "Replaces the default local matching function for each option.",
  },
  {
    name: "remote",
    type: "boolean",
    default: "false",
    description: "Keeps filtering under the caller's control for remote result sets.",
  },
  {
    name: "onSearch",
    type: "(query) => void",
    description: "Receives the current query so the caller can request remote options.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Shows loading content and prevents option selection while results are pending.",
  },
  {
    name: "create",
    type: "boolean",
    default: "false",
    description: "Adds a creation row when the query does not match an existing option.",
  },
  {
    name: "creatable",
    type: "boolean",
    description: "Alias for create when using a creatable naming convention.",
  },
  {
    name: "onCreate",
    type: "(query) => Option | null",
    description: "Builds the new option, or returns null to reject the creation.",
  },
  {
    name: "fallbackOption",
    type: "(value) => Option",
    description: "Provides a label for a selected value that is outside the current result window.",
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: "Shows a clear action when the control has a selected value.",
  },
  {
    name: "showArrow",
    type: "boolean",
    default: "true",
    description: "Shows the trigger arrow used to open and close the options popup.",
  },
  {
    name: "clearFilterAfterSelect",
    type: "boolean",
    default: "true",
    description: "Clears the search query after an option is selected.",
  },
  {
    name: "onClear",
    type: "() => void",
    description: "Runs after the current selection is cleared.",
  },
  {
    name: "maxTagCount",
    type: "number",
    description:
      "Limits visible chips when multiple values are selected and shows an overflow count.",
  },
  {
    name: "size",
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: "Sets the control's density and text scale.",
  },
  {
    name: "status",
    type: '"error" | "warning"',
    description: "Applies a validation border state to the control.",
  },
  {
    name: "placeholder",
    type: "string",
    default: '"Select an option"',
    description: "Text shown while no option is selected.",
  },
  {
    name: "className",
    type: "string",
    description: "Adds classes to the control and can be used to set its width.",
  },
  {
    name: "style",
    type: "CSSProperties",
    description: "Adds inline styles to the control. The popup follows the control width.",
  },
  {
    name: "renderLabel",
    type: "(option) => ReactNode",
    description: "Customizes the selected label while keeping the option value unchanged.",
  },
  {
    name: "renderOption",
    type: "(option, info) => ReactNode",
    description: "Customizes option content while preserving selection and keyboard behavior.",
  },
  {
    name: "renderTag",
    type: "(option) => ReactNode",
    description: "Customizes the chip content used for multiple selected values.",
  },
  {
    name: "renderCreateLabel",
    type: "(query) => ReactNode",
    default: "Create “{query}”",
    description: "Customizes the text shown in the creation row.",
  },
  {
    name: "emptyContent",
    type: "ReactNode",
    default: '"No options found"',
    description: "Content shown when no options match the current query.",
  },
  {
    name: "loadingContent",
    type: "ReactNode",
    default: '"Loading…"',
    description: "Content shown while remote options or an async selection is loading.",
  },
  {
    name: "messages",
    type: "Partial<ComboboxSelectMessages>",
    description: "Overrides accessible labels for clearing, toggling, selection, and chip removal.",
  },
];

export const Route = createFileRoute("/components/combobox-select")({
  component: ComboboxSelectDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        preview: previewSource,
        comboboxSelect: comboboxSelectSource,
        asyncSearch: asyncSearchSource,
        asyncOptions: asyncOptionsSource,
        asyncSelect: asyncSelectSource,
        modelSelect: modelSelectSource,
      },
    }),
});

function ComboboxSelectDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ComboboxSelect"
      description="An options-driven combobox for searchable, grouped, remote, multiple, and creatable selection."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComboboxSelectPreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="options-api" title="Options API">
            <DocNote>
              Pass a flat options array or a grouped array. Each option uses{" "}
              <InlineCode>value</InlineCode>, <InlineCode>label</InlineCode>, and an optional{" "}
              <InlineCode>disabled</InlineCode> flag.
            </DocNote>
            <Preview previewClassName="min-h-[30rem] items-start pt-20">
              <Preview.Canvas>
                <ComboboxSelectComposition />
              </Preview.Canvas>
              <Preview.Code html={code.comboboxSelect} collapsedHtml={code.comboboxSelectBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="model-selection" title="Model selection">
            <DocNote>
              Use grouped options when related models belong to the same provider. The component
              keeps filtering, keyboard navigation, disabled options, and selection state together.
            </DocNote>
            <Preview previewClassName="min-h-[18rem] items-start pt-20">
              <Preview.Canvas>
                <ModelSelectComposition />
              </Preview.Canvas>
              <Preview.Code html={code.modelSelect} collapsedHtml={code.modelSelectBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="remote-search" title="Remote search">
            <DocNote>
              Set <InlineCode>remote</InlineCode> to keep filtering in the caller and use{" "}
              <InlineCode>onSearch</InlineCode> to request the next result window.
            </DocNote>
            <Preview previewClassName="min-h-[20rem] items-start pt-20">
              <Preview.Canvas>
                <AsyncSearchComposition />
              </Preview.Canvas>
              <Preview.Code html={code.asyncSearch} collapsedHtml={code.asyncSearchBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="load-options" title="Load options">
            <DocNote>
              Load options when the popup opens and use <InlineCode>fallbackOption</InlineCode> to
              keep an already selected value readable while results are loading.
            </DocNote>
            <Preview previewClassName="min-h-[20rem] items-start pt-20">
              <Preview.Canvas>
                <AsyncOptionsComposition />
              </Preview.Canvas>
              <Preview.Code html={code.asyncOptions} collapsedHtml={code.asyncOptionsBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="async-select" title="Async select">
            <DocNote>
              Keep the popup open while a selection is being saved and expose the pending state
              through <InlineCode>loading</InlineCode>.
            </DocNote>
            <Preview previewClassName="min-h-[20rem] items-start pt-20">
              <Preview.Canvas>
                <AsyncSelectComposition />
              </Preview.Canvas>
              <Preview.Code html={code.asyncSelect} collapsedHtml={code.asyncSelectBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={COMBOBOX_SELECT_PROPS} />
      </DocSection>
    </DocPage>
  );
}
