import { createFileRoute } from "@tanstack/react-router";
import { Spinner, type SpinnerProps } from "@slock-ui/ui";

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
  { id: "sizes", title: "Sizes" },
  { id: "variants", title: "Variants" },
  { id: "api", title: "API" },
] as const;

const SIZES = ["xs", "sm", "md", "lg"] as const;
const VARIANTS = ["default", "inverse"] as const;

const TODOS = ["Evaluate an elegant family ring style"] as const;

const SNIPPETS = {
  anatomy: `import { Spinner } from "@slock-ui/ui";

<Spinner />`,
  sizes: `<Spinner size="xs" />
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`,
  variants: `<Spinner variant="default" />
<Spinner variant="inverse" />`,
} as const;

type PlaygroundValues = {
  size: NonNullable<SpinnerProps["size"]>;
  variant: NonNullable<SpinnerProps["variant"]>;
};

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZES.map((s) => `"${s}"`).join(" | "),
    default: '"md"',
    description: "xs (10px) inline, sm (16px) chips, md (20px) overlays, lg (32px) full surfaces.",
  },
  {
    name: "variant",
    type: VARIANTS.map((v) => `"${v}"`).join(" | "),
    default: '"default"',
    description: "default is a black ring for light surfaces, inverse a white ring for dark ones.",
  },
  {
    name: "label",
    type: "string",
    default: '"Loading"',
    description: "Accessible label announced by screen readers.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes (className for positioning, data-testid, etc.).",
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
      description="A ring-style spinner for indeterminate loading / pending feedback."
      overview={
        <Differences from="Spinner">
          <li>brutal styling reproduced 1:1 (ring colors, sizes, border width)</li>
          <li>
            intentionally keeps a native <code>span role="status"</code>; there is no Base UI
            primitive for a purely visual indeterminate ring
          </li>
          <li>
            the <code>default</code> export is now a named <code>Spinner</code> export
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
          initial={{ size: "md", variant: "default" }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
          ]}
          render={(values) => (
            <div className={values.variant === "inverse" ? "rounded bg-black p-4" : undefined}>
              <Spinner size={values.size} variant={values.variant} />
            </div>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Example>
      </DocSection>

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          <Spinner variant="default" />
          <div className="rounded bg-black p-3">
            <Spinner variant="inverse" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
