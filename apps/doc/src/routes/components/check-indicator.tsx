import { createFileRoute } from "@tanstack/react-router";
import { CheckIndicator, type CheckIndicatorProps } from "@slock/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyCheckMarker from "../../../../../packages/ui/src/legacy/CheckMarker.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "shapes", title: "Shapes" },
  { id: "fill", title: "Fill" },
  { id: "sizes", title: "Sizes" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SHAPES = ["square", "circle"] as const;
const FILLS = ["black", "yellow"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const MARKS = ["check", "minus"] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { CheckIndicator } from "@slock/ui";

<CheckIndicator checked />`,
  shapes: `<CheckIndicator checked shape="square" />
<CheckIndicator checked shape="circle" />`,
  fill: `<CheckIndicator checked fill="black" />
<CheckIndicator checked fill="yellow" />`,
  sizes: `<CheckIndicator checked size="sm" />
<CheckIndicator checked size="md" />
<CheckIndicator checked size="lg" />`,
  states: `<CheckIndicator checked={false} />
<CheckIndicator checked />
<CheckIndicator checked mark="minus" />
<CheckIndicator checked disabled />`,
  sourceDefault: `<CheckMarker checked />`,
  currentDefault: `<CheckIndicator checked />`,
  sourceCircle: `<CheckMarker checked shape="circle" size="lg" tone="yellow-fill" />`,
  currentCircle: `<CheckIndicator checked shape="circle" size="lg" fill="yellow" />`,
  sourceHoverPreview: `<div className="group">
  <CheckMarker checked={false} previewOnHover />
</div>`,
  currentHoverPreview: `<div className="group">
  <CheckIndicator checked={false} previewOnHover />
</div>`,
} as const;

type PlaygroundValues = {
  checked: boolean;
  shape: NonNullable<CheckIndicatorProps["shape"]>;
  fill: NonNullable<CheckIndicatorProps["fill"]>;
  size: NonNullable<CheckIndicatorProps["size"]>;
  mark: NonNullable<CheckIndicatorProps["mark"]>;
  disabled: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "checked",
    type: "boolean",
    description: "Whether the indicator is filled and the mark is shown. Required.",
  },
  {
    name: "shape",
    type: SHAPES.map((shape) => `"${shape}"`).join(" | "),
    default: '"square"',
    description: "Square for checkboxes, circle for message/row selection.",
  },
  {
    name: "fill",
    type: FILLS.map((fill) => `"${fill}"`).join(" | "),
    default: '"black"',
    description: "Fill color when checked.",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description: "Box size: sm (14px), md (16px), lg (20px).",
  },
  {
    name: "mark",
    type: MARKS.map((mark) => `"${mark}"`).join(" | "),
    default: '"check"',
    description: "Icon inside the indicator. Minus is used by Checkbox's indeterminate state.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Dims the indicator.",
  },
  {
    name: "previewOnHover",
    type: "boolean",
    default: "false",
    description: "Render a faint mark on a parent .group hover, hinting the row is selectable.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes. The indicator is aria-hidden (decorative).",
  },
];

export const Route = createFileRoute("/components/check-indicator")({
  component: CheckIndicatorDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function CheckIndicatorDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="CheckIndicator"
      description="A decorative checked-state indicator shared by Checkbox and selectable rows."
      overview={
        <Differences from="CheckMarker">
          <li>
            renamed from <code>CheckMarker</code> to <code>CheckIndicator</code>, matching Base UI's
            indicator anatomy
          </li>
          <li>
            visual contract reproduced 1:1: square/circle, black/yellow, <code>sm</code>/
            <code>md</code>/<code>lg</code>, and <code>previewOnHover</code>
          </li>
          <li>
            adds a <code>mark</code> axis so <code>Checkbox</code> can reuse this visual for its
            indeterminate state
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{
            checked: true,
            shape: "square",
            fill: "black",
            size: "md",
            mark: "check",
            disabled: false,
          }}
          controls={[
            { name: "checked", label: "Checked", type: "boolean" },
            { name: "shape", label: "Shape", type: "select", options: SHAPES },
            { name: "fill", label: "Fill", type: "select", options: FILLS },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "mark", label: "Mark", type: "select", options: MARKS },
            { name: "disabled", label: "Disabled", type: "boolean" },
          ]}
          render={(values) => (
            <CheckIndicator
              checked={values.checked}
              shape={values.shape}
              fill={values.fill}
              size={values.size}
              mark={values.mark}
              disabled={values.disabled}
            />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="shapes" title="Shapes">
        <Example html={code.shapes}>
          <CheckIndicator checked shape="square" size="lg" />
          <CheckIndicator checked shape="circle" size="lg" />
        </Example>
      </DocSection>

      <DocSection id="fill" title="Fill">
        <div className="space-y-4">
          <Example html={code.fill}>
            <CheckIndicator checked fill="black" size="lg" />
            <CheckIndicator checked fill="yellow" size="lg" />
          </Example>
          <Callout>
            Source called this axis <code>tone</code> with <code>black-fill</code> /{" "}
            <code>yellow-fill</code>. Current uses <code>fill</code> because the prop only controls
            the checked fill color.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <CheckIndicator checked size="sm" />
          <CheckIndicator checked size="md" />
          <CheckIndicator checked size="lg" />
        </Example>
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states}>
          <CheckIndicator checked={false} size="lg" />
          <CheckIndicator checked size="lg" />
          <CheckIndicator checked mark="minus" size="lg" />
          <CheckIndicator checked disabled size="lg" />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Default",
              status: "difference",
              note: "Visual output matches source. Current renames CheckMarker to CheckIndicator.",
              source: <LegacyCheckMarker checked />,
              current: <CheckIndicator checked />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Selection circle",
              status: "difference",
              note: 'Circle shape, lg size, and yellow fill match source selection markers. Source tone="yellow-fill" maps to current fill="yellow".',
              source: <LegacyCheckMarker checked shape="circle" size="lg" tone="yellow-fill" />,
              current: <CheckIndicator checked shape="circle" size="lg" fill="yellow" />,
              sourceCode: code.sourceCircle,
              currentCode: code.currentCircle,
            },
            {
              label: "Hover preview",
              status: "difference",
              note: "The faint group-hover preview is preserved for selectable rows.",
              source: (
                <div className="group">
                  <LegacyCheckMarker checked={false} previewOnHover />
                </div>
              ),
              current: (
                <div className="group">
                  <CheckIndicator checked={false} previewOnHover />
                </div>
              ),
              sourceCode: code.sourceHoverPreview,
              currentCode: code.currentHoverPreview,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
