import { createFileRoute } from "@tanstack/react-router";
import { Checkbox, type CheckboxProps } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "sizes", title: "Sizes" },
  { id: "states", title: "States" },
  { id: "extensions", title: "Extensions" },
  { id: "label", title: "Label" },
  { id: "api", title: "API" },
] as const;

const SIZES = ["sm", "md"] as const;

const TODOS = ["Add elegant family styling", "Document Checkbox Group usage"] as const;

const SNIPPETS = {
  anatomy: `import { Checkbox } from "@slock-ui/ui";

<Checkbox defaultChecked />`,
  sizes: `<Checkbox size="sm" defaultChecked />
<Checkbox size="md" defaultChecked />`,
  states: `<Checkbox />
<Checkbox defaultChecked />
<Checkbox defaultChecked disabled />`,
  extensions: `<Checkbox indeterminate />`,
  label: `<label className="inline-flex items-center gap-2 text-sm">
  <Checkbox defaultChecked />
  Accept terms
</label>`,
} as const;

type PlaygroundValues = {
  size: NonNullable<CheckboxProps["size"]>;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description: "Visual size of the box: sm (14px) for inline rows, md (16px) for settings lists.",
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
      overview={
        <>
          Built on Base UI&rsquo;s <code>Checkbox</code>, adding:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>brutal family styling</li>
            <li>
              <code>sm</code> / <code>md</code> sizes
            </li>
            <li>black-fill check marker</li>
          </ul>
          <p className="mt-2">
            Beyond the original component it also adds an <code>indeterminate</code> (dash) state
            and a focus-visible ring — see <a href="#extensions">Extensions</a>.
          </p>
        </>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ size: "sm", checked: true, indeterminate: false, disabled: false }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "checked", label: "Checked", type: "boolean" },
            { name: "indeterminate", label: "Indeterminate", type: "boolean" },
            { name: "disabled", label: "Disabled", type: "boolean" },
          ]}
          render={(values) => (
            <Checkbox
              size={values.size}
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

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <Checkbox size="sm" defaultChecked />
          <Checkbox size="md" defaultChecked />
        </Example>
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states}>
          <Checkbox />
          <Checkbox defaultChecked />
          <Checkbox defaultChecked disabled />
        </Example>
      </DocSection>

      <DocSection id="extensions" title="Extensions">
        <div className="space-y-4">
          <Example html={code.extensions}>
            <Checkbox indeterminate />
          </Example>
          <Callout>
            These go beyond the original component, which only had checked / unchecked / disabled
            states and no visible focus:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <code>indeterminate</code> renders a dash instead of a check.
              </li>
              <li>
                a <code>focus-visible</code> ring is drawn on keyboard focus (the original held
                focus on a hidden input, so the box itself showed none).
              </li>
              <li>
                an invisible enlarged hit area keeps the small box easy to click and tap, and{" "}
                <code>disabled</code> shows a not-allowed cursor.
              </li>
            </ul>
          </Callout>
        </div>
      </DocSection>

      <DocSection id="label" title="Label">
        <div className="space-y-4">
          <Example html={code.label}>
            <label className="inline-flex items-center gap-2 text-sm">
              <Checkbox defaultChecked />
              Accept terms
            </label>
          </Example>
          <Callout>
            The checkbox is a leaf control with no built-in label. Wrap it in a <code>label</code>{" "}
            so the surrounding text toggles it, and let the wrapper own hover, cursor, and row
            layout — different consumers compose it into different rows (inline vs stacked, with or
            without a description), so forcing one layout would just push complexity into props.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
