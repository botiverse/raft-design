import { createFileRoute } from "@tanstack/react-router";
import { StatusDot, type StatusDotProps } from "@slock-ui/ui";

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
  { id: "activity", title: "Activity" },
  { id: "api", title: "API" },
] as const;

const SIZES = ["sm", "md", "lg"] as const;
const COLORS = ["bg-brutal-lime", "bg-brutal-yellow", "bg-brutal-orange", "bg-gray-400"] as const;

const TODOS = [
  "Add elegant family styling",
  "Evaluate merging with AttentionDot (shared bordered-circle base)",
] as const;

const SNIPPETS = {
  anatomy: `import { StatusDot } from "@slock-ui/ui";

<StatusDot className="bg-brutal-lime" />`,
  sizes: `<StatusDot size="sm" />
<StatusDot size="md" />
<StatusDot size="lg" />`,
  activity: `// activity → color is app domain; map it at the callsite:
<StatusDot className={getActivityDotClass(activity)} />`,
} as const;

type PlaygroundValues = {
  size: NonNullable<StatusDotProps["size"]>;
  color: (typeof COLORS)[number];
  pulse: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZES.map((s) => `"${s}"`).join(" | "),
    default: '"md"',
    description: "md (10px) standard, sm (8px) inline text, lg (11px) avatar overlays.",
  },
  {
    name: "pulse",
    type: "boolean",
    default: "false",
    description: "Adds animate-pulse for waiting/thinking affordances.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description:
      "Native span attributes. Set the color with a bg-* class via className (defaults to bg-gray-400); also positioning, data-testid, etc.",
  },
];

export const Route = createFileRoute("/components/status-dot")({
  component: StatusDotDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function StatusDotDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="StatusDot"
      description="A colored bordered circle signalling presence / activity / binary state."
      overview={
        <Differences from="StatusDot">
          <li>
            dropped the <code>activity</code> axis (app-domain color mapping) — pass the color via{" "}
            <code>className</code> at the callsite
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
          initial={{ size: "md", color: "bg-brutal-lime", pulse: false }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "color", label: "Color (className)", type: "select", options: COLORS },
            { name: "pulse", label: "Pulse", type: "boolean" },
          ]}
          render={(values) => (
            <StatusDot size={values.size} className={values.color} pulse={values.pulse} />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <StatusDot size="sm" className="bg-brutal-lime" />
          <StatusDot size="md" className="bg-brutal-lime" />
          <StatusDot size="lg" className="bg-brutal-lime" />
        </Example>
      </DocSection>

      <DocSection id="activity" title="Activity">
        <div className="space-y-4">
          <CodeBlock html={code.activity} />
          <Callout>
            The source&rsquo;s <code>activity</code> prop is intentionally absent: its
            online/thinking/offline → color mapping was <strong>app domain</strong> (
            <code>@slock-ai/shared</code>), so the dot stays domain-free and the app maps activity
            to a color at the callsite, as above.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
