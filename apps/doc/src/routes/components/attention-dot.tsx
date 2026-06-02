import { createFileRoute } from "@tanstack/react-router";
import { AttentionDot, type AttentionDotProps } from "@slock-ui/ui";

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
  { id: "sizes", title: "Sizes" },
  { id: "color", title: "Color" },
  { id: "api", title: "API" },
] as const;

const SIZES = ["sm", "lg"] as const;
const COLORS = ["bg-brutal-pink", "bg-brutal-orange", "bg-brutal-cyan", "bg-gray-400"] as const;

const TODOS = [
  "Add elegant family styling",
  "Evaluate merging with StatusDot (shared bordered-circle base)",
] as const;

const SNIPPETS = {
  anatomy: `import { AttentionDot } from "@slock-ui/ui";

<AttentionDot />`,
  sizes: `<AttentionDot size="lg" />
<AttentionDot size="sm" />`,
  color: `<AttentionDot className="bg-brutal-orange" />`,
} as const;

type PlaygroundValues = {
  size: NonNullable<AttentionDotProps["size"]>;
  color: (typeof COLORS)[number];
};

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZES.map((s) => `"${s}"`).join(" | "),
    default: '"lg"',
    description:
      "Physical fit, not priority. lg (10px) is canonical; sm (4px) only when too tight.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description:
      "Native span attributes. Set the color with a bg-* class via className (defaults to brutal-pink); also positioning, data-testid, etc.",
  },
];

export const Route = createFileRoute("/components/attention-dot")({
  component: AttentionDotDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AttentionDotDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AttentionDot"
      description="A small filled circle that flags “something here needs attention” (unread, pending)."
      overview={
        <Differences from="AttentionDot">
          <li>
            styling reproduced 1:1 (bordered circle, <code>sm</code>/<code>lg</code>, brutal-pink
            default)
          </li>
          <li>
            color is set via <code>className</code> instead of a <code>tone</code> prop
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
          initial={{ size: "lg", color: "bg-brutal-pink" }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "color", label: "Color (className)", type: "select", options: COLORS },
          ]}
          render={(values) => <AttentionDot size={values.size} className={values.color} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <div className="space-y-4">
          <Example html={code.sizes}>
            <AttentionDot size="lg" />
            <AttentionDot size="sm" />
          </Example>
          <Callout>
            Default to <code>lg</code> (10×10, canonical). Reach for <code>sm</code> (4×4) only when
            the parent surface can&rsquo;t fit <code>lg</code> without crowding — it is not a
            &ldquo;lower priority&rdquo; dot. Both keep the black border.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="color" title="Color">
        <div className="space-y-4">
          <Example html={code.color}>
            <AttentionDot className="bg-brutal-orange" />
          </Example>
          <Callout>
            The default is brutal-pink (the canonical unread color). Override it with any{" "}
            <code>bg-*</code> class via <code>className</code> — there is no separate color prop,
            the class merges over the default.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
