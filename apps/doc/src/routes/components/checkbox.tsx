import { createFileRoute } from "@tanstack/react-router";
import { Checkbox, Label } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { SIZES, VARIANTS } from "#/modules/checkbox/checkbox.constants.ts";
import { CheckboxPlaygroundPreview } from "#/modules/checkbox/checkbox.preview.tsx";
import checkboxCheckedCompositionSource from "#/modules/checkbox/compositions/checked.composition.tsx?raw";
import checkboxDefaultCheckedCompositionSource from "#/modules/checkbox/compositions/default-checked.composition.tsx?raw";
import checkboxDisabledCompositionSource from "#/modules/checkbox/compositions/disabled.composition.tsx?raw";
import checkboxIndeterminateCompositionSource from "#/modules/checkbox/compositions/indeterminate.composition.tsx?raw";
import checkboxPreviewCompositionSource from "#/modules/checkbox/compositions/preview.composition.tsx?raw";
import checkboxPreviewOnHoverMarkerCompositionSource from "#/modules/checkbox/compositions/preview-on-hover-marker.composition.tsx?raw";
import checkboxPrimaryCheckedCompositionSource from "#/modules/checkbox/compositions/primary-checked.composition.tsx?raw";
import { CheckboxSettingsGroupContent } from "#/modules/checkbox/compositions/settings-group.composition.tsx";
import checkboxSettingsGroupCompositionSource from "#/modules/checkbox/compositions/settings-group.composition.tsx?raw";
import checkboxSizesCompositionSource from "#/modules/checkbox/compositions/sizes.composition.tsx?raw";
import checkboxUncheckedCompositionSource from "#/modules/checkbox/compositions/unchecked.composition.tsx?raw";
import {
  CHECKBOX_SOURCE_COMPARISON_COMPOSITION,
  CHECKBOX_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/checkbox/checkbox.source-comparison.tsx";
import LegacyCheckMarker from "../../../../../packages/ui/src/legacy/CheckMarker.tsx";
import LegacyCheckbox from "../../../../../packages/ui/src/legacy/Checkbox.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Settings and scoped options",
    scenes: [
      {
        label: "SettingsPanel.tsx:1011,1831,1920,2768",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:1011,1831,1920,2768",
      },
      {
        label: "AgentScopesPanel.tsx:149",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentScopesPanel.tsx:149",
      },
      {
        label: "RuntimeConfigFields.tsx:317",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/RuntimeConfigFields.tsx:317",
      },
    ],
  },
  {
    label: "Dialogs and acceptance flows",
    scenes: [
      {
        label: "MessageInput.tsx:1138",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:1138",
      },
      {
        label: "ReportIssueDialog.tsx:308,316,324,340",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ReportIssueDialog.tsx:308,316,324,340",
      },
      {
        label: "OwnerOnboardingModal.tsx:1120",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/OwnerOnboardingModal.tsx:1120",
      },
      {
        label: "LegalAcceptanceCheckbox.tsx:16",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/LegalAcceptanceCheckbox.tsx:16",
      },
    ],
  },
] as const;

const SNIPPETS = {
  anatomy: `<Checkbox />`,
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
  <label className="flex items-center gap-3 border-2 border-black bg-brutal-cream p-3 shadow-[var(--source-shadow)]">
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
  migrationMarker: `// Source
<CheckMarker checked />

// Current
<Checkbox checked readOnly aria-label="Selected" />`,
  migrationRowSelection: `// Source
<CheckMarker checked={false} previewOnHover />

// Current
<Checkbox aria-label="Select row" />`,
  sourceUnchecked: `<Checkbox />`,
  currentUnchecked: `<Checkbox />`,
  sourceChecked: `<Checkbox checked readOnly />`,
  currentChecked: `<Checkbox checked readOnly />`,
  sourceSizes: `<Checkbox size="sm" checked readOnly />
<Checkbox size="md" checked readOnly />`,
  currentSizes: `<Checkbox size="sm" checked readOnly />
<Checkbox size="md" checked readOnly />`,
  sourceDisabled: `<Checkbox checked disabled readOnly />`,
  currentDisabled: `<Checkbox checked disabled readOnly />`,
  sourceDefaultChecked: `<Checkbox defaultChecked />`,
  currentDefaultChecked: `<Checkbox defaultChecked />`,
  currentIndeterminate: `<Checkbox indeterminate />`,
  sourceMarker: `<CheckMarker checked />`,
  currentMarker: `<Checkbox checked readOnly aria-label="Selected" />`,
  sourceHoverMarker: `<CheckMarker checked={false} previewOnHover />`,
  currentRowSelection: `<Checkbox aria-label="Select row" />`,
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

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

const CheckboxCurrent = CHECKBOX_SOURCE_COMPARISON_COMPOSITION;

const CHECKBOX_COMPOSITION_RAW_SOURCES = {
  Checked: checkboxCheckedCompositionSource,
  DefaultChecked: checkboxDefaultCheckedCompositionSource,
  Disabled: checkboxDisabledCompositionSource,
  Indeterminate: checkboxIndeterminateCompositionSource,
  Preview: checkboxPreviewCompositionSource,
  PreviewOnHoverMarker: checkboxPreviewOnHoverMarkerCompositionSource,
  PrimaryChecked: checkboxPrimaryCheckedCompositionSource,
  SettingsGroup: checkboxSettingsGroupCompositionSource,
  Sizes: checkboxSizesCompositionSource,
  Unchecked: checkboxUncheckedCompositionSource,
} as const;

const CHECKBOX_COMPOSITION_SOURCES = createCompositionSourceMap(CHECKBOX_COMPOSITION_RAW_SOURCES);

const CHECKBOX_COMPOSITION_SNIPPET_IDS = {
  Checked: "checkboxCheckedComposition",
  DefaultChecked: "checkboxDefaultCheckedComposition",
  Disabled: "checkboxDisabledComposition",
  Indeterminate: "checkboxIndeterminateComposition",
  Preview: "checkboxPreviewComposition",
  PreviewOnHoverMarker: "checkboxPreviewOnHoverMarkerComposition",
  PrimaryChecked: "checkboxPrimaryCheckedComposition",
  SettingsGroup: "checkboxSettingsGroupComposition",
  Sizes: "checkboxSizesComposition",
  Unchecked: "checkboxUncheckedComposition",
} as const;

type CheckboxCompositionKey = keyof typeof CHECKBOX_COMPOSITION_SOURCES;

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
  const checkboxComposition = (key: CheckboxCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: CHECKBOX_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: CHECKBOX_COMPOSITION_SNIPPET_IDS,
      sources: CHECKBOX_COMPOSITION_SOURCES,
    });

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
                  <label className="flex items-center gap-3 border-2 border-black bg-brutal-cream p-3 shadow-[var(--source-shadow)]">
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              label: "Unchecked",
              status: "match",
              source: <LegacyCheckbox />,
              brutal: <CheckboxCurrent.Unchecked />,
              elegant: <CheckboxCurrent.Unchecked />,
              elegantDark: <CheckboxCurrent.Unchecked />,
              ...checkboxComposition("Unchecked"),
            },
            {
              label: "Checked",
              status: "match",
              source: <LegacyCheckbox checked readOnly />,
              brutal: <CheckboxCurrent.Checked />,
              elegant: <CheckboxCurrent.Checked />,
              elegantDark: <CheckboxCurrent.Checked />,
              ...checkboxComposition("Checked"),
            },
            {
              label: "Disabled",
              status: "match",
              source: <LegacyCheckbox checked disabled readOnly />,
              brutal: <CheckboxCurrent.Disabled />,
              elegant: <CheckboxCurrent.Disabled />,
              elegantDark: <CheckboxCurrent.Disabled />,
              ...checkboxComposition("Disabled"),
            },
            {
              label: "Default checked",
              status: "difference",
              source: <LegacyCheckbox defaultChecked />,
              brutal: <CheckboxCurrent.DefaultChecked />,
              elegant: <CheckboxCurrent.DefaultChecked />,
              elegantDark: <CheckboxCurrent.DefaultChecked />,
              ...checkboxComposition("DefaultChecked"),
            },
            {
              label: "Sizes",
              status: "match",
              source: (
                <>
                  <LegacyCheckbox size="sm" checked readOnly />
                  <LegacyCheckbox size="md" checked readOnly />
                </>
              ),
              brutal: <CheckboxCurrent.Sizes />,
              elegant: <CheckboxCurrent.Sizes />,
              elegantDark: <CheckboxCurrent.Sizes />,
              ...checkboxComposition("Sizes"),
            },
            {
              label: "Primary checked",
              status: "new",
              source: <MissingSource />,
              brutal: <CheckboxCurrent.PrimaryChecked />,
              elegant: <CheckboxCurrent.PrimaryChecked />,
              elegantDark: <CheckboxCurrent.PrimaryChecked />,
              ...checkboxComposition("PrimaryChecked"),
            },
            {
              label: "Indeterminate",
              status: "new",
              source: <MissingSource />,
              brutal: <CheckboxCurrent.Indeterminate />,
              elegant: <CheckboxCurrent.Indeterminate />,
              elegantDark: <CheckboxCurrent.Indeterminate />,
              ...checkboxComposition("Indeterminate"),
            },
            {
              label: "Preview-on-hover marker",
              status: "difference",
              source: <LegacyCheckMarker checked={false} previewOnHover />,
              brutal: <CheckboxCurrent.PreviewOnHoverMarker />,
              elegant: <CheckboxCurrent.PreviewOnHoverMarker />,
              elegantDark: <CheckboxCurrent.PreviewOnHoverMarker />,
              ...checkboxComposition("PreviewOnHoverMarker"),
            },
            {
              label: "Settings group",
              status: "match",
              note: "Used by report bundles, permissions, and settings rows. Checkbox remains independent per row and covers multi-select inclusion, not a mutually exclusive choice.",
              source: (
                <div className="grid min-w-60 gap-2 text-sm">
                  <label className="flex items-center gap-3">
                    <LegacyCheckbox checked readOnly aria-label="Include recent messages" />
                    <span>Recent messages</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <LegacyCheckbox checked readOnly aria-label="Include activity log" />
                    <span>Activity log</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <LegacyCheckbox aria-label="Include trajectory log" />
                    <span>Trajectory log</span>
                  </label>
                </div>
              ),
              brutal: <CheckboxCurrent.SettingsGroup />,
              elegant: <CheckboxCurrent.SettingsGroup />,
              elegantDark: <CheckboxCurrent.SettingsGroup />,
              ...checkboxComposition("SettingsGroup"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
