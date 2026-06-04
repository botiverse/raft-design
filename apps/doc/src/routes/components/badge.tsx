import { createFileRoute } from "@tanstack/react-router";
import { Badge, type BadgeProps } from "@slock-ui/ui";

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
import LegacyBadge from "../../../../../packages/ui/src/legacy/Badge.tsx";
import LegacyExperimentalBadge from "../../../../../packages/ui/src/legacy/ExperimentalBadge.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "tones", title: "Tones" },
  { id: "uppercase", title: "Uppercase" },
  { id: "experimental", title: "Experimental" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TONES = [
  "white",
  "yellow",
  "pink",
  "cyan",
  "lavender",
  "orange",
  "lime",
  "red",
  "stone",
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Badge } from "@slock-ui/ui";

<Badge tone="yellow">In Progress</Badge>`,
  tones: `<Badge tone="yellow">Yellow</Badge>
<Badge tone="pink">Pink</Badge>
<Badge tone="cyan">Cyan</Badge>`,
  uppercase: `<Badge>In Progress</Badge>
<Badge uppercase={false}>task #42 @bugen</Badge>`,
  experimental: `<Badge.Experimental />`,
  sourceDefault: `<Badge>In Progress</Badge>`,
  currentDefault: `<Badge>In Progress</Badge>`,
  sourceTone: `<Badge tone="lime">Experimental</Badge>`,
  currentTone: `<Badge tone="lime">Experimental</Badge>`,
  sourceUppercaseFalse: `<Badge uppercase={false}>task #42 @bugen</Badge>`,
  currentUppercaseFalse: `<Badge uppercase={false}>task #42 @bugen</Badge>`,
  sourceExperimental: `<ExperimentalBadge />`,
  currentExperimental: `<Badge.Experimental />`,
} as const;

type PlaygroundValues = {
  tone: NonNullable<BadgeProps["tone"]>;
  uppercase: boolean;
  label: string;
};

const PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: TONES.map((tone) => `"${tone}"`).join(" | "),
    default: '"white"',
    description: "Background color from the brutal palette. Text is always ink-black.",
  },
  {
    name: "uppercase",
    type: "boolean",
    default: "true",
    description:
      "Apply the brutal uppercase + tracking transform. Pass false next to case-sensitive identifiers.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes (the content is the badge label).",
  },
];

export const Route = createFileRoute("/components/badge")({
  component: BadgeDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function BadgeDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Badge"
      description="A small label chip in the brutal tone palette."
      overview={
        <Differences from="Badge">
          <li>brutal styling reproduced 1:1 (tone palette, uppercase axis)</li>
          <li>
            the clickable variant is now a separate{" "}
            <a href="/components/badge-button">BadgeButton</a>
          </li>
          <li>
            the <code>ExperimentalBadge</code> helper is now the <code>Badge.Experimental</code>{" "}
            preset
          </li>
          <li>
            source <code>BadgeButton</code> moved to the separate <code>BadgeButton</code> component
            because it is structurally interactive
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
          initial={{ tone: "yellow", uppercase: true, label: "In Progress" }}
          controls={[
            { name: "tone", label: "Tone", type: "select", options: TONES },
            { name: "uppercase", label: "Uppercase", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
          ]}
          render={(values) => (
            <Badge tone={values.tone} uppercase={values.uppercase}>
              {values.label}
            </Badge>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="tones" title="Tones">
        <div className="space-y-4">
          <Example html={code.tones}>
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </Example>
          <Callout>
            The badge owns its background — callers pick a tone, never write{" "}
            <code>bg-brutal-*</code> via <code>className</code>. Text is always ink-black.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="uppercase" title="Uppercase">
        <div className="space-y-4">
          <Example html={code.uppercase}>
            <Badge>In Progress</Badge>
            <Badge uppercase={false}>task #42 @bugen</Badge>
          </Example>
          <Callout>
            Content stays Title Case; the brutal theme renders the visual uppercase. Set{" "}
            <code>uppercase={"{false}"}</code> when a badge sits next to case-sensitive identifiers
            (<code>@bugen</code> ≠ <code>@BUGEN</code>), e.g. status chips that include an assignee.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="experimental" title="Experimental">
        <div className="space-y-4">
          <Example html={code.experimental}>
            <Badge.Experimental />
          </Example>
          <Callout>
            <code>Badge.Experimental</code> is a fixed <code>lime</code> + “Experimental” preset, so
            every experimental surface reads the same. It only takes positional props (className /
            span attributes); for any other chip use <code>Badge</code> directly.
          </Callout>
        </div>
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
              source: <LegacyBadge>In Progress</LegacyBadge>,
              current: <Badge>In Progress</Badge>,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Tone",
              status: "match",
              source: <LegacyBadge tone="lime">Experimental</LegacyBadge>,
              current: <Badge tone="lime">Experimental</Badge>,
              sourceCode: code.sourceTone,
              currentCode: code.currentTone,
            },
            {
              label: "Uppercase opt-out",
              status: "match",
              source: <LegacyBadge uppercase={false}>task #42 @bugen</LegacyBadge>,
              current: <Badge uppercase={false}>task #42 @bugen</Badge>,
              sourceCode: code.sourceUppercaseFalse,
              currentCode: code.currentUppercaseFalse,
            },
            {
              label: "Experimental preset",
              status: "match",
              note: "Current keeps the source lime badge visual but moves the helper under Badge.Experimental instead of exporting a separate ExperimentalBadge component.",
              source: <LegacyExperimentalBadge />,
              current: <Badge.Experimental />,
              sourceCode: code.sourceExperimental,
              currentCode: code.currentExperimental,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
