import { createFileRoute } from "@tanstack/react-router";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@slock/ui";

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
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacySearchInput from "../../../../../packages/ui/src/legacy/SearchInput.tsx";
import LegacySlugInput from "../../../../../packages/ui/src/legacy/SlugInput.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "search", title: "Search" },
  { id: "slug", title: "Slug" },
  { id: "custom", title: "Custom addon" },
  { id: "invalid", title: "Invalid" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { InputGroup, InputGroupInput } from "@slock/ui";

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
  sourceSearch: `<div className="w-80">
  <SearchInput aria-label="Search" placeholder="Search…" />
</div>`,
  currentSearch: `<InputGroup lift={false} className="w-80">
  <InputGroupAddon.Search />
  <InputGroupInput aria-label="Search" placeholder="Search…" />
</InputGroup>`,
  sourceSlug: `<div className="w-80">
  <SlugInput aria-label="Server slug" placeholder="my-server" />
</div>`,
  currentSlug: `<InputGroup className="w-80">
  <InputGroupAddon.Slug />
  <InputGroupInput aria-label="Server slug" placeholder="my-server" />
</InputGroup>`,
  sourceInvalid: `<div className="w-80">
  <SearchInput
    className="!border-brutal-red ring-2 ring-brutal-red/60 bg-brutal-red/5"
    aria-label="Search"
    defaultValue="oops"
  />
</div>`,
  currentInvalid: `<InputGroup lift={false} className="w-80">
  <InputGroupAddon.Search />
  <InputGroupInput aria-label="Search" aria-invalid defaultValue="oops" />
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
    description: "Native div attributes. Renders a composition shell with the brutal frame.",
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
    description: "Native div attributes for non-editable addon content.",
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
        <Differences from="SearchInput / SlugInput">
          <li>
            new composition primitive: one <code>InputGroup</code> shell plus bare{" "}
            <code>InputGroupInput</code>, so addons can sit on either edge
          </li>
          <li>
            old <code>SearchInput</code> and <code>SlugInput</code> visuals are restored
            pixel-for-pixel as <code>InputGroupAddon.Search</code> and{" "}
            <code>InputGroupAddon.Slug</code>
          </li>
          <li>
            invalid styling moves from ad-hoc wrapper classes to <code>aria-invalid</code> on the
            control; resting source styling stays unchanged
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
          defaultValues={{ invalid: false, placeholder: "Search…" }}
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
            <code>align</code> picks the edge.
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
            border/ring/tint via <code>has-*</code>. The invalid look intentionally drops the brutal
            black shadow, matching source ad-hoc invalid overrides.
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "SearchInput",
              status: "match",
              note: "Source SearchInput was a fixed input-brutal shell with a 15px magnifier and no focus lift. Current InputGroup restores it with the Search addon and lift={false}.",
              source: (
                <div className="w-80">
                  <LegacySearchInput aria-label="Search" placeholder="Search…" />
                </div>
              ),
              current: (
                <InputGroup lift={false} className="w-80">
                  <InputGroupAddon.Search />
                  <InputGroupInput aria-label="Search" placeholder="Search…" />
                </InputGroup>
              ),
              sourceCode: code.sourceSearch,
              currentCode: code.currentSearch,
            },
            {
              label: "SlugInput",
              status: "match",
              note: "Source SlugInput was an input-brutal shell with a full-height yellow slash prefix. Current InputGroup keeps the same prefix, divider, padding, and focus lift.",
              source: (
                <div className="w-80">
                  <LegacySlugInput aria-label="Server slug" placeholder="my-server" />
                </div>
              ),
              current: (
                <InputGroup className="w-80">
                  <InputGroupAddon.Slug />
                  <InputGroupInput aria-label="Server slug" placeholder="my-server" />
                </InputGroup>
              ),
              sourceCode: code.sourceSlug,
              currentCode: code.currentSlug,
            },
            {
              label: "Invalid state",
              status: "match",
              note: "Source callers could add red border, red ring, and tinted background to the wrapper. Current InputGroup centralizes that same visual behind aria-invalid on the control.",
              source: (
                <div className="w-80">
                  <LegacySearchInput
                    className="!border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
                    aria-label="Search"
                    defaultValue="oops"
                  />
                </div>
              ),
              current: (
                <InputGroup lift={false} className="w-80">
                  <InputGroupAddon.Search />
                  <InputGroupInput aria-label="Search" aria-invalid defaultValue="oops" />
                </InputGroup>
              ),
              sourceCode: code.sourceInvalid,
              currentCode: code.currentInvalid,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
