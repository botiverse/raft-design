import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@slock-ui/ui";
import { X } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import { BadgeButton as LegacyBadgeButton } from "../../../../../packages/ui/src/legacy/Badge.tsx";

const TOC = [
  { id: "migration", title: "Migration" },
  { id: "anatomy", title: "Anatomy" },
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

const SNIPPETS = {
  anatomy: `import { Badge } from "@slock-ui/ui";

<Badge
  render={<button type="button" aria-label="Apply filter" />}
  tone="lime"
  onClick={apply}
>
  Filter
</Badge>`,
  sourceDefault: `<BadgeButton tone="lime">Filter</BadgeButton>`,
  currentDefault: `<Badge render={<button type="button" aria-label="Filter" />} tone="lime">Filter</Badge>`,
  sourceUppercaseFalse: `<BadgeButton tone="red" uppercase={false}>remove @bugen</BadgeButton>`,
  currentUppercaseFalse: `<Badge
  render={<button type="button" aria-label="Remove assignee filter" />}
  tone="red"
  uppercase={false}
>
  remove @bugen
</Badge>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: TONES.map((tone) => `"${tone}"`).join(" | "),
    default: '"white"',
    description: "Background color from the brutal palette. Same as Badge.",
  },
  {
    name: "uppercase",
    type: "boolean",
    default: "true",
    description: "Brutal uppercase transform. Pass false next to case-sensitive identifiers.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Render the badge as a button, link, or custom element through Base UI.",
  },
  {
    name: "...props",
    type: "Badge props",
    description:
      "Badge props are forwarded to the rendered root. Put button-only attributes on the render element when needed.",
  },
];

export const Route = createFileRoute("/components/badge-button")({
  component: BadgeButtonDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function BadgeButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="BadgeButton"
      description="Migrated: use Badge with a button render instead of a separate BadgeButton component."
      overview={
        <Differences from="BadgeButton">
          <li>
            source <code>BadgeButton</code> shared the exact same visual recipe as{" "}
            <code>Badge</code>
          </li>
          <li>
            current package keeps a single <code>Badge</code> component and changes the root with{" "}
            <code>render</code>
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="migration" title="Migration">
        <Callout>
          Replace <code>BadgeButton</code> with{" "}
          <code>Badge render=&#123;&lt;button type=&quot;button&quot; /&gt;&#125;</code>. Source
          added no default hover, active, or focus styling beyond the shared badge class.
        </Callout>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="space-y-4">
          <CodeBlock html={code.anatomy} />
          <Example html={code.anatomy}>
            <Badge
              render={<button type="button" aria-label="Apply filter" />}
              tone="lime"
              onClick={() => undefined}
            >
              Filter
            </Badge>
            <Badge
              render={<button type="button" aria-label="Remove assignee filter" />}
              tone="red"
              uppercase={false}
            >
              remove @bugen
              <X className="size-3" />
            </Badge>
          </Example>
          <Callout>
            Add callsite-specific hover classes only where the product needs them, just like the
            source thread-replies badge did.
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
              status: "difference",
              note: "Visual recipe matches source. Current removes the standalone component and renders Badge as a button through Base UI composition.",
              source: <LegacyBadgeButton tone="lime">Filter</LegacyBadgeButton>,
              current: (
                <Badge render={<button type="button" aria-label="Filter" />} tone="lime">
                  Filter
                </Badge>
              ),
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Uppercase opt-out",
              status: "difference",
              note: "Visual recipe and non-uppercase rendering match source. Current keeps the button root as Badge composition.",
              source: (
                <LegacyBadgeButton tone="red" uppercase={false}>
                  remove @bugen
                </LegacyBadgeButton>
              ),
              current: (
                <Badge
                  render={<button type="button" aria-label="Remove assignee filter" />}
                  tone="red"
                  uppercase={false}
                >
                  remove @bugen
                </Badge>
              ),
              sourceCode: code.sourceUppercaseFalse,
              currentCode: code.currentUppercaseFalse,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
