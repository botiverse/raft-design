import { createFileRoute } from "@tanstack/react-router";
import { Checkbox, type CheckboxProps } from "@slock/ui";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyCheckMarker from "../../../../../packages/ui/src/legacy/CheckMarker.tsx";
import LegacyCheckbox from "../../../../../packages/ui/src/legacy/Checkbox.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "sizes", title: "Sizes" },
  { id: "states", title: "States" },
  { id: "label", title: "Label" },
  { id: "selection", title: "Selection" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "migration", title: "Migration" },
] as const;

const SIZES = ["sm", "md"] as const;
const VARIANTS = ["default", "primary"] as const;

const TODOS = ["Document Checkbox Group usage"] as const;

const SNIPPETS = {
  anatomy: `import { Checkbox } from "@slock/ui";

<Checkbox defaultChecked />`,
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
  label: `<label className="inline-flex items-center gap-2 text-sm">
  <Checkbox defaultChecked />
  Accept terms
</label>`,
  selection: `<div className="grid gap-2">
  <label className="flex items-center gap-3 border-2 border-black bg-brutal-cream p-3 shadow-[var(--shadow)]">
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

type PlaygroundValues = {
  size: NonNullable<CheckboxProps["size"]>;
  variant: NonNullable<CheckboxProps["variant"]>;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
};

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

export const Route = createFileRoute("/components/checkbox")({
  component: CheckboxDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function CheckboxDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Checkbox"
      description="A square toggle with checked and indeterminate states."
      toc={TOC}
      sectionDividers={false}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            size: "sm",
            variant: "default",
            checked: true,
            indeterminate: false,
            disabled: false,
          }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
            { name: "checked", label: "Checked", type: "boolean" },
            { name: "indeterminate", label: "Indeterminate", type: "boolean" },
            { name: "disabled", label: "Disabled", type: "boolean" },
          ]}
          render={(values) => (
            <Checkbox
              size={values.size}
              variant={values.variant}
              checked={values.checked}
              indeterminate={values.indeterminate}
              disabled={values.disabled}
            />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <div className="space-y-4">
          <Example html={code.variants}>
            <Checkbox defaultChecked />
            <Checkbox variant="primary" defaultChecked />
          </Example>
        </div>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <Example html={code.sizes}>
            <Checkbox size="sm" defaultChecked />
            <Checkbox size="md" defaultChecked />
          </Example>
        </div>
      </DocSection>

      <DocSection id="states" title="States">
        <div className="space-y-4">
          <Example html={code.states}>
            <div className="grid w-full gap-4">
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
          </Example>
        </div>
      </DocSection>

      <DocSection id="label" title="Label">
        <div className="space-y-4">
          <Example html={code.label}>
            <label
              htmlFor="checkbox-label-example"
              className="inline-flex items-center gap-2 text-sm"
            >
              <Checkbox id="checkbox-label-example" defaultChecked />
              Accept terms
            </label>
          </Example>
        </div>
      </DocSection>

      <DocSection id="selection" title="Selection">
        <div className="space-y-4">
          <Example html={code.selection}>
            <div className="grid min-w-64 gap-2">
              <label className="flex items-center gap-3 border-2 border-black bg-brutal-cream p-3 shadow-[var(--shadow)]">
                <Checkbox defaultChecked aria-label="Select conversation" />
                <span className="text-sm font-bold">Customer handoff</span>
              </label>
              <label className="flex items-center gap-3 border-2 border-black bg-white p-3">
                <Checkbox aria-label="Select message" />
                <span className="text-sm">Message selection</span>
              </label>
            </div>
          </Example>
          <Example html={code.bulk}>
            <div className="flex items-center gap-3">
              <Checkbox indeterminate aria-label="Select all messages" />
              <span className="text-sm font-bold">3 of 8 selected</span>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Unchecked",
              status: "match",
              source: <LegacyCheckbox />,
              brutal: <Checkbox />,
              elegant: <Checkbox />,
              elegantDark: <Checkbox />,
            },
            {
              label: "Checked",
              status: "match",
              source: <LegacyCheckbox checked readOnly />,
              brutal: <Checkbox checked readOnly />,
              elegant: <Checkbox checked readOnly />,
              elegantDark: <Checkbox checked readOnly />,
            },
            {
              label: "Disabled",
              status: "match",
              source: <LegacyCheckbox checked disabled readOnly />,
              brutal: <Checkbox checked disabled readOnly />,
              elegant: <Checkbox checked disabled readOnly />,
              elegantDark: <Checkbox checked disabled readOnly />,
            },
            {
              label: "Default checked",
              status: "difference",
              source: <LegacyCheckbox defaultChecked />,
              brutal: <Checkbox defaultChecked />,
              elegant: <Checkbox defaultChecked />,
              elegantDark: <Checkbox defaultChecked />,
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
              brutal: (
                <>
                  <Checkbox size="sm" checked readOnly />
                  <Checkbox size="md" checked readOnly />
                </>
              ),
              elegant: (
                <>
                  <Checkbox size="sm" checked readOnly />
                  <Checkbox size="md" checked readOnly />
                </>
              ),
              elegantDark: (
                <>
                  <Checkbox size="sm" checked readOnly />
                  <Checkbox size="md" checked readOnly />
                </>
              ),
            },
            {
              label: "Primary checked",
              status: "new",
              source: <MissingSource />,
              brutal: <Checkbox variant="primary" checked readOnly />,
              elegant: <Checkbox variant="primary" checked readOnly />,
              elegantDark: <Checkbox variant="primary" checked readOnly />,
            },
            {
              label: "Indeterminate",
              status: "new",
              source: <MissingSource />,
              brutal: <Checkbox indeterminate />,
              elegant: <Checkbox indeterminate />,
              elegantDark: <Checkbox indeterminate />,
            },
            {
              label: "Preview-on-hover marker",
              status: "difference",
              source: <LegacyCheckMarker checked={false} previewOnHover />,
              brutal: <Checkbox aria-label="Select row" />,
              elegant: <Checkbox aria-label="Select row" />,
              elegantDark: <Checkbox aria-label="Select row" />,
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">CheckMarker</h3>
            <p className="text-sm text-gray-500">
              Move decorative marker usage to a Checkbox-owned selected state.
            </p>
            <CodeBlock html={code.migrationMarker} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Row Selection</h3>
            <p className="text-sm text-gray-500">
              Keep row hover styling on the row and selection state on Checkbox.
            </p>
            <CodeBlock html={code.migrationRowSelection} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
