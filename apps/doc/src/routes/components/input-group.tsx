import { createFileRoute } from "@tanstack/react-router";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@slock-ui/ui";

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
  { id: "search", title: "Search" },
  { id: "slug", title: "Slug" },
  { id: "custom", title: "Custom addon" },
  { id: "invalid", title: "Invalid" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { InputGroup, InputGroupInput } from "@slock-ui/ui";

<InputGroup>
  <InputGroupInput placeholder="you@example.com" />
</InputGroup>`,
  search: `// Faithful drop-in for the old SearchInput.
<InputGroup lift={false}>
  <InputGroupAddon.Search />
  <InputGroupInput placeholder="Search…" />
</InputGroup>`,
  slug: `// Faithful drop-in for the old SlugInput.
<InputGroup>
  <InputGroupAddon.Slug />
  <InputGroupInput placeholder="my-server" />
</InputGroup>`,
  custom: `// Any content, either edge — here a trailing unit.
<InputGroup>
  <InputGroupInput placeholder="0.00" />
  <InputGroupAddon align="inline-end">USD</InputGroupAddon>
</InputGroup>`,
  invalid: `<InputGroup lift={false}>
  <InputGroupAddon.Search />
  <InputGroupInput aria-invalid defaultValue="oops" />
</InputGroup>`,
} as const;

type PlaygroundValues = {
  invalid: boolean;
  placeholder: string;
};

const GROUP_PROPS: readonly PropRow[] = [
  {
    name: "lift",
    type: "boolean",
    description:
      "Lift the shadow while the control is focused. Defaults to true; set false to match the old SearchInput.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description: 'Native div attributes. Renders role="group" with the brutal shell.',
  },
];

const ADDON_PROPS: readonly PropRow[] = [
  {
    name: "align",
    type: '"inline-start" | "inline-end"',
    description: "Which edge the addon hugs. Defaults to inline-start.",
  },
  {
    name: "InputGroupAddon.Search",
    type: "preset",
    description: "Faithful SearchInput adornment — a 15px magnifier that trims the control inset.",
  },
  {
    name: "InputGroupAddon.Slug",
    type: "preset",
    description: "Faithful SlugInput prefix — a full-height yellow `/` box with a right border.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description: "Native div attributes. Clicking the addon focuses the control.",
  },
];

const INPUT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "InputProps",
    description:
      "Same as Input (minus unstyled, which is forced on). Carries data-slot=input-group-control.",
  },
];

export const Route = createFileRoute("/components/input-group")({
  component: InputGroupDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function InputGroupDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="InputGroup"
      description="A brutal input shell that wraps a bare control with leading or trailing addons."
      overview={
        <>
          A composition primitive new to slock-ui (no upstream original). The shell — border,
          shadow, focus lift, and invalid look — lives on the group; the inner{" "}
          <code>InputGroupInput</code> renders bare. The old <code>SearchInput</code> and{" "}
          <code>SlugInput</code> ship as the <code>InputGroupAddon.Search</code> /{" "}
          <code>InputGroupAddon.Slug</code> presets, restored pixel-for-pixel.
        </>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ invalid: false, placeholder: "Search…" }}
          controls={[
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "placeholder", label: "Placeholder", type: "text" },
          ]}
          render={(values) => (
            <InputGroup lift={false} className="w-80">
              <InputGroupAddon.Search />
              <InputGroupInput
                placeholder={values.placeholder}
                aria-invalid={values.invalid || undefined}
              />
            </InputGroup>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="search" title="Search">
        <div className="space-y-4">
          <Example html={code.search}>
            <InputGroup lift={false} className="w-80">
              <InputGroupAddon.Search />
              <InputGroupInput placeholder="Search…" />
            </InputGroup>
          </Example>
          <Callout>
            <code>InputGroupAddon.Search</code> restores the old SearchInput exactly. Pair it with{" "}
            <code>lift={"{false}"}</code> — the original never lifted on focus.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="slug" title="Slug">
        <div className="space-y-4">
          <Example html={code.slug}>
            <InputGroup className="w-80">
              <InputGroupAddon.Slug />
              <InputGroupInput placeholder="my-server" />
            </InputGroup>
          </Example>
          <Callout>
            <code>InputGroupAddon.Slug</code> restores the old SlugInput exactly — the full-height
            yellow <code>/</code> box keeps the focus lift the original had.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="custom" title="Custom addon">
        <div className="space-y-4">
          <Example html={code.custom}>
            <InputGroup className="w-80">
              <InputGroupInput placeholder="0.00" />
              <InputGroupAddon align="inline-end">USD</InputGroupAddon>
            </InputGroup>
          </Example>
          <Callout>
            A bare <code>InputGroupAddon</code> takes any content — text, icons, buttons — and{" "}
            <code>align</code> picks the edge. Clicking it focuses the control.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="invalid" title="Invalid">
        <div className="space-y-4">
          <Example html={code.invalid}>
            <InputGroup lift={false} className="w-80">
              <InputGroupAddon.Search />
              <InputGroupInput aria-invalid defaultValue="oops" />
            </InputGroup>
          </Example>
          <Callout>
            Set <code>aria-invalid</code> on the control; the group reacts with the red
            border/ring/tint via <code>has-*</code>. This is a capability beyond the old
            SearchInput/SlugInput — it only shows when you opt in, so the resting look is unchanged.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">InputGroup</h3>
            <PropsTable rows={GROUP_PROPS} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">InputGroupAddon</h3>
            <PropsTable rows={ADDON_PROPS} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">InputGroupInput</h3>
            <PropsTable rows={INPUT_PROPS} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
