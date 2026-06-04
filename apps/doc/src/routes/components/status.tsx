import { createFileRoute } from "@tanstack/react-router";
import { Status, type StatusAttentionProps, type StatusProps } from "@slock-ui/ui";

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
import LegacyAttentionDot from "../../../../../packages/ui/src/legacy/AttentionDot.tsx";
import LegacyStatusDot from "../../../../../packages/ui/src/legacy/StatusDot.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "status", title: "Status" },
  { id: "attention", title: "Attention" },
  { id: "fill", title: "Fill" },
  { id: "activity", title: "Activity migration" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const STATUS_SIZES = ["sm", "md", "lg"] as const;
const ATTENTION_SIZES = ["sm", "lg"] as const;
const FILLS = ["gray", "lime", "yellow", "orange", "pink", "cyan", "red", "stone"] as const;

const TODOS = [
  "Add elegant family styling",
  "Keep Status as the status family root and Status.Attention as the unread/pending member",
] as const;

const SNIPPETS = {
  anatomy: `import { Status } from "@slock-ui/ui";

<Status fill="lime" />
<Status.Attention />`,
  status: `<Status size="sm" fill="lime" />
<Status size="md" fill="lime" />
<Status size="lg" fill="lime" />`,
  attention: `<Status.Attention size="lg" />
<Status.Attention size="sm" />
<Status.Attention fill="orange" />`,
  fill: `<Status fill="gray" />
<Status fill="lime" />
<Status fill="yellow" />
<Status.Attention fill="pink" />
<Status.Attention fill="orange" />`,
  activity: `// activity -> fill/pulse is app domain; map it at the callsite:
<Status fill={getActivityDotFill(activity)} pulse={isBusyActivity(activity)} />`,
  sourceStatusDefault: `<StatusDot />`,
  currentStatusDefault: `<Status />`,
  sourceStatusTone: `<StatusDot tone="bg-brutal-lime" />`,
  currentStatusTone: `<Status fill="lime" />`,
  sourceStatusPulse: `<StatusDot tone="bg-brutal-yellow" pulse />`,
  currentStatusPulse: `<Status fill="yellow" pulse />`,
  sourceAttentionDefault: `<AttentionDot />`,
  currentAttentionDefault: `<Status.Attention />`,
  sourceAttentionCompact: `<AttentionDot size="sm" />`,
  currentAttentionCompact: `<Status.Attention size="sm" />`,
  sourceAttentionTone: `<AttentionDot tone="bg-brutal-orange" />`,
  currentAttentionTone: `<Status.Attention fill="orange" />`,
} as const;

type PlaygroundValues = {
  size: NonNullable<StatusProps["size"]>;
  fill: NonNullable<StatusProps["fill"]>;
  pulse: boolean;
};

type AttentionPlaygroundValues = {
  size: NonNullable<StatusAttentionProps["size"]>;
  fill: NonNullable<StatusAttentionProps["fill"]>;
};

const STATUS_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: STATUS_SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description: "md (10px) standard, sm (8px) inline text, lg (11px) avatar overlays.",
  },
  {
    name: "fill",
    type: FILLS.map((fill) => `"${fill}"`).join(" | "),
    default: '"gray"',
    description: 'Status color. Source StatusDot tone="bg-*" maps to this finite fill axis.',
  },
  {
    name: "pulse",
    type: "boolean",
    default: "false",
    description: "Adds animate-pulse for waiting/thinking affordances.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render hook for changing the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes. Use className for positioning or rare custom colors.",
  },
];

const ATTENTION_PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: ATTENTION_SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"lg"',
    description:
      "Physical fit, not priority. lg (10px) is canonical; sm (4px) only when too tight.",
  },
  {
    name: "fill",
    type: FILLS.map((fill) => `"${fill}"`).join(" | "),
    default: '"pink"',
    description: 'Attention color. Source AttentionDot tone="bg-*" maps to this finite fill axis.',
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Base UI render hook for changing the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes. Use className for positioning or rare custom colors.",
  },
];

export const Route = createFileRoute("/components/status")({
  component: StatusDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function StatusDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Status"
      description="A status indicator family for activity dots and unread / attention dots."
      overview={
        <Differences from="StatusDot / AttentionDot">
          <li>
            merges the public surface into <code>Status</code> and <code>Status.Attention</code>
          </li>
          <li>
            keeps source semantics: <code>Status</code> is presence/activity;{" "}
            <code>Status.Attention</code> is unread/pending/needs-attention
          </li>
          <li>
            source <code>tone=&quot;bg-*&quot;</code> becomes a finite <code>fill</code> axis;{" "}
            <code>className</code> stays for positioning/custom overrides
          </li>
          <li>
            drops source <code>activity</code> from the primitive because it depends on app-domain
            activity types
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <div className="grid gap-4 lg:grid-cols-2">
          <ComponentPlayground<PlaygroundValues>
            initial={{ size: "md", fill: "lime", pulse: false }}
            controls={[
              { name: "size", label: "Size", type: "select", options: STATUS_SIZES },
              { name: "fill", label: "Fill", type: "select", options: FILLS },
              { name: "pulse", label: "Pulse", type: "boolean" },
            ]}
            render={(values) => (
              <Status size={values.size} fill={values.fill} pulse={values.pulse} />
            )}
          />
          <ComponentPlayground<AttentionPlaygroundValues>
            initial={{ size: "lg", fill: "pink" }}
            controls={[
              { name: "size", label: "Attention size", type: "select", options: ATTENTION_SIZES },
              { name: "fill", label: "Attention fill", type: "select", options: FILLS },
            ]}
            render={(values) => <Status.Attention size={values.size} fill={values.fill} />}
          />
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="status" title="Status">
        <Example html={code.status}>
          <Status size="sm" fill="lime" />
          <Status size="md" fill="lime" />
          <Status size="lg" fill="lime" />
        </Example>
      </DocSection>

      <DocSection id="attention" title="Attention">
        <div className="space-y-4">
          <Example html={code.attention}>
            <Status.Attention size="lg" />
            <Status.Attention size="sm" />
            <Status.Attention fill="orange" />
          </Example>
          <Callout>
            <code>Status.Attention</code> preserves the old AttentionDot scale: canonical{" "}
            <code>lg</code> is 10px, compact <code>sm</code> is 4px. Both keep the black border.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="fill" title="Fill">
        <div className="space-y-4">
          <Example html={code.fill}>
            <Status fill="gray" />
            <Status fill="lime" />
            <Status fill="yellow" />
            <Status.Attention fill="pink" />
            <Status.Attention fill="orange" />
          </Example>
          <Callout>
            Source accepted arbitrary Tailwind <code>tone=&quot;bg-*&quot;</code> strings. Current
            makes the common brutal palette explicit with <code>fill</code>; use{" "}
            <code>className</code> only for positioning or rare custom colors.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="activity" title="Activity migration">
        <div className="space-y-4">
          <CodeBlock html={code.activity} />
          <Callout>
            The source <code>StatusDot activity</code> prop mapped <code>@slock-ai/shared</code>{" "}
            values like online/thinking/offline to classes. That is app logic, so the primitive
            stays domain-free and the app maps activity to <code>fill</code> / <code>pulse</code> at
            the callsite.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <PropsTable rows={STATUS_PROPS} />
          <PropsTable rows={ATTENTION_PROPS} />
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Status default",
              status: "difference",
              note: "Visual output matches source. Current renames StatusDot to Status.",
              source: <LegacyStatusDot />,
              current: <Status />,
              sourceCode: code.sourceStatusDefault,
              currentCode: code.currentStatusDefault,
            },
            {
              label: "Status explicit color",
              status: "difference",
              note: 'Visual output matches. Source tone="bg-brutal-lime" maps to current fill="lime".',
              source: <LegacyStatusDot tone="bg-brutal-lime" />,
              current: <Status fill="lime" />,
              sourceCode: code.sourceStatusTone,
              currentCode: code.currentStatusTone,
            },
            {
              label: "Status pulse",
              status: "difference",
              note: "Pulse behavior matches. Current uses fill instead of source tone strings.",
              source: <LegacyStatusDot tone="bg-brutal-yellow" pulse />,
              current: <Status fill="yellow" pulse />,
              sourceCode: code.sourceStatusPulse,
              currentCode: code.currentStatusPulse,
            },
            {
              label: "Attention default",
              status: "difference",
              note: "Visual output matches source. Current nests AttentionDot under Status.Attention.",
              source: <LegacyAttentionDot />,
              current: <Status.Attention />,
              sourceCode: code.sourceAttentionDefault,
              currentCode: code.currentAttentionDefault,
            },
            {
              label: "Attention compact",
              status: "difference",
              note: 'The 4px compact dot is preserved under Status.Attention size="sm".',
              source: <LegacyAttentionDot size="sm" />,
              current: <Status.Attention size="sm" />,
              sourceCode: code.sourceAttentionCompact,
              currentCode: code.currentAttentionCompact,
            },
            {
              label: "Attention explicit color",
              status: "difference",
              note: 'Visual output matches. Source tone="bg-brutal-orange" maps to current fill="orange".',
              source: <LegacyAttentionDot tone="bg-brutal-orange" />,
              current: <Status.Attention fill="orange" />,
              sourceCode: code.sourceAttentionTone,
              currentCode: code.currentAttentionTone,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
