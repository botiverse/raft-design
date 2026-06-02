import { createFileRoute } from "@tanstack/react-router";
import { CheckMarker, type CheckMarkerProps } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
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
  { id: "shapes", title: "Shapes" },
  { id: "tones", title: "Tones" },
  { id: "sizes", title: "Sizes" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
] as const;

const SHAPES = ["square", "circle"] as const;
const TONES = ["black-fill", "yellow-fill"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const TODOS = [
  "Add elegant family styling",
  "Merge with Checkbox's inlined tick (single shared visual)",
] as const;

const SNIPPETS = {
  anatomy: `import { CheckMarker } from "@slock-ui/ui";

<CheckMarker checked />`,
  shapes: `<CheckMarker checked shape="square" />
<CheckMarker checked shape="circle" />`,
  tones: `<CheckMarker checked tone="black-fill" />
<CheckMarker checked tone="yellow-fill" />`,
  sizes: `<CheckMarker checked size="sm" />
<CheckMarker checked size="md" />
<CheckMarker checked size="lg" />`,
  states: `<CheckMarker checked={false} />
<CheckMarker checked />
<CheckMarker checked disabled />`,
} as const;

type PlaygroundValues = {
  checked: boolean;
  shape: NonNullable<CheckMarkerProps["shape"]>;
  tone: NonNullable<CheckMarkerProps["tone"]>;
  size: NonNullable<CheckMarkerProps["size"]>;
  disabled: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "checked",
    type: "boolean",
    description: "Whether the tick is shown. Required.",
  },
  {
    name: "shape",
    type: SHAPES.map((shape) => `"${shape}"`).join(" | "),
    default: '"square"',
    description: "Square for checkboxes, circle for message/row selection.",
  },
  {
    name: "tone",
    type: TONES.map((tone) => `"${tone}"`).join(" | "),
    default: '"black-fill"',
    description: "Fill when checked: black (form) or brutal-yellow (selection).",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description: "Box size: sm (14px), md (16px), lg (20px).",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Dims the marker.",
  },
  {
    name: "previewOnHover",
    type: "boolean",
    default: "false",
    description: "Render a faint tick on a parent .group hover, hinting the marker is selectable.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes. The marker is aria-hidden (decorative).",
  },
];

export const Route = createFileRoute("/components/check-marker")({
  component: CheckMarkerDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function CheckMarkerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="CheckMarker"
      description="The shared tick visual — a square or circle marker used by checkboxes and selectable rows."
      overview={
        <Differences from="CheckMarker">
          <li>
            styling and API reproduced 1:1 (square/circle, black/yellow, <code>sm</code>/
            <code>md</code>/<code>lg</code>, <code>previewOnHover</code>)
          </li>
          <li>
            restructured onto a <code>tv()</code> recipe with a theme scaffold (elegant deferred)
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
            tone: "black-fill",
            size: "md",
            disabled: false,
          }}
          controls={[
            { name: "checked", label: "Checked", type: "boolean" },
            { name: "shape", label: "Shape", type: "select", options: SHAPES },
            { name: "tone", label: "Tone", type: "select", options: TONES },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "disabled", label: "Disabled", type: "boolean" },
          ]}
          render={(values) => (
            <CheckMarker
              checked={values.checked}
              shape={values.shape}
              tone={values.tone}
              size={values.size}
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
          <CheckMarker checked shape="square" size="lg" />
          <CheckMarker checked shape="circle" size="lg" />
        </Example>
      </DocSection>

      <DocSection id="tones" title="Tones">
        <div className="space-y-4">
          <Example html={code.tones}>
            <CheckMarker checked tone="black-fill" size="lg" />
            <CheckMarker checked tone="yellow-fill" size="lg" />
          </Example>
          <Callout>
            <code>black-fill</code> matches form checkboxes; <code>yellow-fill</code> (often paired
            with <code>circle</code>) is for row/message selection.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <CheckMarker checked size="sm" />
          <CheckMarker checked size="md" />
          <CheckMarker checked size="lg" />
        </Example>
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states}>
          <CheckMarker checked={false} size="lg" />
          <CheckMarker checked size="lg" />
          <CheckMarker checked disabled size="lg" />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
