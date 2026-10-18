import { createFileRoute } from "@tanstack/react-router";
import { Checkbox, InlineCode, Label } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { CheckboxPlaygroundPreview } from "#/modules/checkbox/checkbox.preview.tsx";
import { CheckboxIndicatorContent } from "#/modules/checkbox/compositions/indicator.composition.tsx";
import checkboxIndicatorCompositionSource from "#/modules/checkbox/compositions/indicator.composition.tsx?raw";
import checkboxPreviewCompositionSource from "#/modules/checkbox/compositions/preview.composition.tsx?raw";
import { CheckboxSelectionContent } from "#/modules/checkbox/compositions/selection.composition.tsx";
import checkboxSelectionCompositionSource from "#/modules/checkbox/compositions/selection.composition.tsx?raw";
import { CheckboxSettingsGroupContent } from "#/modules/checkbox/compositions/settings-group.composition.tsx";
import { CheckboxStateControlContent } from "#/modules/checkbox/compositions/state-control.composition.tsx";
import checkboxStateControlCompositionSource from "#/modules/checkbox/compositions/state-control.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { Checkbox, CheckboxIndicator } from "raft-ui";

<Checkbox />

{/* The box alone, inside a control that owns the checkbox semantics */}
<CheckboxIndicator checked />`,
  states: `<Checkbox />
<Checkbox disabled />

<Checkbox defaultChecked />
<Checkbox defaultChecked disabled />

<Checkbox indeterminate />
<Checkbox indeterminate disabled />`,
  label: `<Label>
  <Checkbox defaultChecked />
  Accept terms
</Label>`,
  bulk: `<div className="flex items-center gap-3">
  <Checkbox indeterminate aria-label="Select all messages" />
  <span className="text-sm font-bold">3 of 8 selected</span>
</div>`,
  settingsGroup: `<div className="grid gap-2">
  <label className="flex items-center gap-3">
    <Checkbox defaultChecked aria-label="Include recent messages" />
    <span>Recent messages</span>
  </label>
  <label className="flex items-center gap-3">
    <Checkbox defaultChecked aria-label="Include activity log" />
    <span>Activity log</span>
  </label>
  <label className="flex items-center gap-3">
    <Checkbox aria-label="Include trajectory log" />
    <span>Trajectory log</span>
  </label>
</div>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "shape",
    type: '"square" | "circle"',
    default: '"square"',
    description:
      "Box shape. One size: a 20px box inside a 44 × 36px hit area; checked is an ink block with the mark knocked out.",
  },
  {
    name: "checked",
    type: "boolean",
    description: "Controlled checked state. Pair with onCheckedChange.",
  },
  {
    name: "defaultChecked",
    type: "boolean",
    default: "false",
    description: "Initial checked state for uncontrolled usage.",
  },
  {
    name: "indeterminate",
    type: "boolean",
    default: "false",
    description: "Mixed state, rendered as a dash. Extension beyond the original component.",
  },
  {
    name: "onCheckedChange",
    type: "(checked: boolean, details) => void",
    description: "Called when the checkbox is ticked or unticked.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Dims the box and blocks interaction.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Replace the rendered element or compose with another component (Base UI).",
  },
  {
    name: "...props",
    type: "Base UI Checkbox.Root.Props",
    description: "Form props (name, value, required, form) plus Base UI props.",
  },
];

const INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "checked",
    type: "boolean",
    description: "Draws the checked ink block with the mark. Required.",
  },
  {
    name: "mark",
    type: '"check" | "minus"',
    default: '"check"',
    description: "Mark drawn when checked. Use minus for a mixed state.",
  },
  {
    name: "shape",
    type: '"square" | "circle"',
    default: '"square"',
    description: "Box shape, as on Checkbox.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disabled look. Visual only; the owning control handles interaction.",
  },
  {
    name: "previewOnHover",
    type: "boolean",
    default: "false",
    description: "Shows a faint mark on an unchecked box while its group ancestor is hovered.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"span">',
    description:
      "The 20px box as a decorative span (aria-hidden). Checkbox renders it internally; use it alone inside a row or menu item that owns the checkbox role and state.",
  },
];

const CHECKBOX_COMPOSITION_RAW_SOURCES = {
  Indicator: checkboxIndicatorCompositionSource,
  Preview: checkboxPreviewCompositionSource,
  Selection: checkboxSelectionCompositionSource,
  StateControl: checkboxStateControlCompositionSource,
} as const;

const CHECKBOX_COMPOSITION_SOURCES = createCompositionSourceMap(CHECKBOX_COMPOSITION_RAW_SOURCES);

const CHECKBOX_COMPOSITION_SNIPPET_IDS = {
  Indicator: "checkboxIndicatorComposition",
  Preview: "checkboxPreviewComposition",
  Selection: "checkboxSelectionComposition",
  StateControl: "checkboxStateControlComposition",
} as const;

export const Route = createFileRoute("/components/checkbox")({
  component: CheckboxDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          CHECKBOX_COMPOSITION_SOURCES,
          CHECKBOX_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function CheckboxDoc() {
  const code = Route.useLoaderData();
  return (
    <DocPage
      title="Checkbox"
      description="A 20px box toggle with checked and indeterminate states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <CheckboxPlaygroundPreview code={code.checkboxPreviewComposition} />
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
          <DocSubsection parentId="usage" id="state-control" title="Controlled and uncontrolled">
            <Preview>
              <Preview.Canvas>
                <CheckboxStateControlContent />
              </Preview.Canvas>
              <Preview.Code
                html={code.checkboxStateControlComposition}
                collapsedHtml={code.checkboxStateControlCompositionBody}
              />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <Preview>
              <Preview.Canvas>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Checkbox />
                    <Checkbox disabled />
                  </div>
                  <div className="flex items-center gap-4">
                    <Checkbox defaultChecked />
                    <Checkbox defaultChecked disabled />
                  </div>
                  <div className="flex items-center gap-4">
                    <Checkbox indeterminate />
                    <Checkbox indeterminate disabled />
                  </div>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="label" title="Label">
            <Preview>
              <Preview.Canvas>
                <Label>
                  <Checkbox id="checkbox-label-example" defaultChecked />
                  Accept terms
                </Label>
              </Preview.Canvas>
              <Preview.Code html={code.label} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="indicator" title="Indicator">
            <DocNote>
              <InlineCode>CheckboxIndicator</InlineCode> is the box on its own, with no input or
              role. Use it inside a row or menu item that already owns the checkbox semantics.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <CheckboxIndicatorContent />
              </Preview.Canvas>
              <Preview.Code html={code.checkboxIndicatorComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="usage"
            id="selection"
            title="Selection"
            badge={<StatusBadge status="in-progress"></StatusBadge>}
          >
            <Preview>
              <Preview.Canvas>
                <CheckboxSelectionContent />
              </Preview.Canvas>
              <Preview.Code html={code.checkboxSelectionComposition} />
            </Preview>
            <Preview>
              <Preview.Canvas>
                <div className="flex items-center gap-3">
                  <Checkbox indeterminate aria-label="Select all messages" />
                  <span className="text-sm font-bold">3 of 8 selected</span>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.bulk} />
            </Preview>
            <Preview>
              <Preview.Canvas>
                <CheckboxSettingsGroupContent />
              </Preview.Canvas>
              <Preview.Code html={code.settingsGroup} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-checkbox" title="Checkbox">
            <PropsTable rows={PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-checkbox-indicator" title="CheckboxIndicator">
            <PropsTable rows={INDICATOR_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
