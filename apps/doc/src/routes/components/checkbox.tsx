import { createFileRoute } from "@tanstack/react-router";
import { Checkbox, Label } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { SIZES, VARIANTS } from "#/modules/checkbox/checkbox.constants.ts";
import { CheckboxPlaygroundPreview } from "#/modules/checkbox/checkbox.preview.tsx";
import checkboxPreviewCompositionSource from "#/modules/checkbox/compositions/preview.composition.tsx?raw";
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
  anatomy: `import { Checkbox } from "raft-ui";

<Checkbox />`,
  sizes: `<Checkbox size="sm" defaultChecked />
<Checkbox size="md" defaultChecked />`,
  variants: `<Checkbox defaultChecked />
<Checkbox variant="primary" defaultChecked />`,
  states: `<Checkbox />
<Checkbox disabled />
<Checkbox variant="primary" />
<Checkbox variant="primary" disabled />

<Checkbox defaultChecked />
<Checkbox defaultChecked disabled />
<Checkbox variant="primary" defaultChecked />
<Checkbox variant="primary" defaultChecked disabled />

<Checkbox indeterminate />
<Checkbox indeterminate disabled />
<Checkbox variant="primary" indeterminate />
<Checkbox variant="primary" indeterminate disabled />`,
  label: `<Label>
  <Checkbox defaultChecked />
  Accept terms
</Label>`,
  selection: `<div className="grid gap-2">
  <label className="flex items-center gap-3 border-2 border-black bg-brutal-cream p-3 shadow-raft-sm">
    <Checkbox defaultChecked aria-label="Select conversation" />
    <span className="text-sm font-bold">Customer handoff</span>
  </label>
  <label className="flex items-center gap-3 border-2 border-black bg-white p-3">
    <Checkbox aria-label="Select message" />
    <span className="text-sm">Message selection</span>
  </label>
</div>`,
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
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description:
      "Visual size of the box. Brutal renders sm/md as 14px/16px; Elegant renders them as 16px/18px.",
  },
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description: "Visual treatment for the checked background.",
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

const CHECKBOX_COMPOSITION_RAW_SOURCES = {
  Preview: checkboxPreviewCompositionSource,
  StateControl: checkboxStateControlCompositionSource,
} as const;

const CHECKBOX_COMPOSITION_SOURCES = createCompositionSourceMap(CHECKBOX_COMPOSITION_RAW_SOURCES);

const CHECKBOX_COMPOSITION_SNIPPET_IDS = {
  Preview: "checkboxPreviewComposition",
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
      description="A square toggle with checked and indeterminate states."
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

          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Preview>
              <Preview.Canvas>
                <Checkbox defaultChecked />
                <Checkbox variant="primary" defaultChecked />
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <Checkbox size="sm" defaultChecked />
                <Checkbox size="md" defaultChecked />
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <Preview>
              <Preview.Canvas>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Checkbox />
                    <Checkbox disabled />
                    <Checkbox variant="primary" />
                    <Checkbox variant="primary" disabled />
                  </div>
                  <div className="flex items-center gap-4">
                    <Checkbox defaultChecked />
                    <Checkbox defaultChecked disabled />
                    <Checkbox variant="primary" defaultChecked />
                    <Checkbox variant="primary" defaultChecked disabled />
                  </div>
                  <div className="flex items-center gap-4">
                    <Checkbox indeterminate />
                    <Checkbox indeterminate disabled />
                    <Checkbox variant="primary" indeterminate />
                    <Checkbox variant="primary" indeterminate disabled />
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

          <DocSubsection
            parentId="usage"
            id="selection"
            title="Selection"
            badge={<StatusBadge status="in-progress"></StatusBadge>}
          >
            <Preview>
              <Preview.Canvas>
                <div className="grid min-w-64 gap-2">
                  <label className="flex items-center gap-3 border-2 border-black bg-brutal-cream p-3 shadow-raft-sm">
                    <Checkbox defaultChecked aria-label="Select conversation" />
                    <span className="text-sm font-bold">Customer handoff</span>
                  </label>
                  <label className="flex items-center gap-3 border-2 border-black bg-white p-3">
                    <Checkbox aria-label="Select message" />
                    <span className="text-sm">Message selection</span>
                  </label>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.selection} />
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
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
