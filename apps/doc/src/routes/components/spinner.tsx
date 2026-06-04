import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Spinner, type SpinnerProps } from "@slock-ui/ui";

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
import LegacySpinner from "../../../../../packages/ui/src/legacy/Spinner.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "sizes", title: "Sizes" },
  { id: "current-color", title: "Current color" },
  { id: "inline", title: "Inline" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SIZES = ["sm", "lg"] as const;

const TODOS = ["Add elegant family motion/color review"] as const;

const SNIPPETS = {
  anatomy: `import { Spinner } from "@slock-ui/ui";

<Spinner />`,
  sizes: `<Spinner size="sm" />
<Spinner size="lg" />`,
  currentColor: `<div className="text-black">
  <Spinner />
</div>
<div className="text-white">
  <Spinner />
</div>`,
  inline: `<Button>
  <Spinner data-icon="inline-start" />
  Loading
</Button>

<Badge>
  <Spinner data-icon="inline-start" />
  Syncing
</Badge>`,
  sourceDefault: `<Spinner />`,
  currentDefault: `<Spinner />`,
  sourceLarge: `<Spinner size="lg" />`,
  currentLarge: `<Spinner size="lg" />`,
  sourceColor: `<span className="text-white">
  <Spinner />
</span>`,
  currentColorCompare: `<span className="text-white">
  <Spinner />
</span>`,
} as const;

type PlaygroundValues = {
  size: NonNullable<SpinnerProps["size"]>;
  color: "black" | "white" | "yellow";
};

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description: "sm mirrors source h-4/text-base; lg mirrors source h-6/text-xl.",
  },
  {
    name: "aria-label",
    type: "string",
    default: '"Loading"',
    description: "Accessible label announced by screen readers.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render hook for changing the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description:
      "Native span attributes. Use className for color/positioning and data-icon inline placement.",
  },
];

export const Route = createFileRoute("/components/spinner")({
  component: SpinnerDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SpinnerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Spinner"
      description="A braille-glyph spinner for indeterminate loading / pending feedback."
      overview={
        <Differences from="Spinner">
          <li>
            source braille glyph animation reproduced 1:1 (frames, 800ms steps, reduced-motion
            duration)
          </li>
          <li>
            source <code>sm</code>/<code>lg</code> sizing is preserved; previous ring-only{" "}
            <code>xs</code>/<code>md</code> and <code>variant</code> API was removed
          </li>
          <li>
            color stays <code>text-current</code>, so dark surfaces pass a text color instead of a
            component variant
          </li>
          <li>
            no Base UI primitive exists for indeterminate progress, so the root is a native{" "}
            <code>span</code> composed through Base UI <code>useRender</code>
          </li>
          <li>
            current hoists the static glyph subtree and marks the style tag as a React stylesheet;
            source keeps a fresh inline <code>style</code> element in every render
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
          initial={{ size: "sm", color: "black" }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            {
              name: "color",
              label: "Color",
              type: "select",
              options: ["black", "white", "yellow"],
            },
          ]}
          render={(values) => {
            const colorClassName =
              values.color === "white"
                ? "bg-gray-950 text-white"
                : values.color === "yellow"
                  ? "bg-gray-950 text-brutal-yellow"
                  : "text-black";
            return (
              <div className={`rounded px-4 py-3 ${colorClassName}`}>
                <Spinner size={values.size} />
              </div>
            );
          }}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="lg" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="current-color" title="Current color">
        <Example html={code.currentColor}>
          <div className="flex items-center gap-3">
            <div className="text-black">
              <Spinner />
            </div>
            <div className="rounded bg-gray-950 p-3 text-white">
              <Spinner />
            </div>
            <div className="rounded bg-gray-950 p-3 text-brutal-yellow">
              <Spinner />
            </div>
          </div>
        </Example>
      </DocSection>

      <DocSection id="inline" title="Inline">
        <Example html={code.inline}>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Spinner data-icon="inline-start" />
              Loading
            </Button>
            <Badge>
              <Spinner data-icon="inline-start" />
              Syncing
            </Badge>
          </div>
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
              status: "match",
              note: "Both render the source braille spinner with the same default size, label, and currentColor behavior.",
              source: <LegacySpinner />,
              current: <Spinner />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Large",
              status: "match",
              note: "Source size lg maps directly to current size lg.",
              source: <LegacySpinner size="lg" />,
              current: <Spinner size="lg" />,
              sourceCode: code.sourceLarge,
              currentCode: code.currentLarge,
            },
            {
              label: "Current color",
              status: "match",
              note: "Both inherit color from the surrounding text context.",
              source: (
                <span className="rounded bg-gray-950 p-3 text-white">
                  <LegacySpinner />
                </span>
              ),
              current: (
                <span className="rounded bg-gray-950 p-3 text-white">
                  <Spinner />
                </span>
              ),
              sourceCode: code.sourceColor,
              currentCode: code.currentColorCompare,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
