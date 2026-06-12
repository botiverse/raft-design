import { createFileRoute } from "@tanstack/react-router";
import { Status, type StatusProps } from "@slock/ui";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyAttentionDot from "../../../../../packages/ui/src/legacy/AttentionDot.tsx";
import LegacyStatusDot from "../../../../../packages/ui/src/legacy/StatusDot.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "sizes", title: "Sizes" },
  { id: "pulse", title: "Pulse" },
  { id: "customize", title: "Customize" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "migration", title: "Migration" },
] as const;

const VARIANTS = [
  "default",
  "primary",
  "information",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

const SIZES = ["xs", "sm", "md", "lg"] as const;

const SNIPPETS = {
  anatomy: `import { Status } from "@slock/ui";

<Status variant="success" />`,
  variants: `<Status />
<Status variant="primary" />
<Status variant="information" />
<Status variant="muted" />
<Status variant="accent" />
<Status variant="success" />
<Status variant="warning" />
<Status variant="danger" />`,
  sizes: `<Status size="xs" variant="success" />
<Status size="sm" variant="success" />
<Status size="md" variant="success" />
<Status size="lg" variant="success" />`,
  pulse: `<Status size="xs" variant="primary" pulse />
<Status size="sm" variant="primary" pulse />
<Status size="md" variant="primary" pulse />
<Status size="lg" variant="primary" pulse />`,
  customize: `<Status className="[--status-color:var(--color-brutal-purple-300)]" />
<Status
  pulse
  className="[--status-color:var(--color-brutal-purple-300)]"
/>`,
  migrationActivity: `// Source
<StatusDot activity="online" />
<StatusDot activity="thinking" />
<StatusDot activity="working" />
<StatusDot activity="error" />
<StatusDot activity="offline" />

// Current
<Status variant="success" />
<Status variant="primary" pulse />
<Status variant="primary" pulse />
<Status variant="warning" />
<Status />`,
  migrationToneToVariant: `// Source
<StatusDot tone="bg-brutal-lime" />
<StatusDot tone="bg-brutal-yellow" pulse />
<AttentionDot tone="bg-brutal-orange" />

// Current
<Status variant="success" />
<Status variant="primary" pulse />
<Status variant="warning" />`,
  migrationAttention: `// Source
<AttentionDot />
<AttentionDot size="sm" />

// Current
<Status variant="accent" />
<Status variant="accent" size="xs" />`,
  migrationCustomTone: `// Source
<StatusDot tone="bg-brutal-lavender" />

// Current
<Status className="[--status-color:var(--color-brutal-purple-300)]" />`,
} as const;

type PlaygroundValues = {
  variant: NonNullable<StatusProps["variant"]>;
  size: NonNullable<StatusProps["size"]>;
  pulse: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description: "Semantic status color.",
  },
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"md"',
    description: "Dot diameter. xs is the old compact AttentionDot size.",
  },
  {
    name: "pulse",
    type: "boolean",
    default: "false",
    description: "Animated status marker.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Change the root element.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLSpanElement>",
    description: "Native span attributes plus className. Set --status-color for custom colors.",
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
      description="Presence, progress, unread, and compact status markers."
      toc={TOC}
      sectionDividers={false}
    >
      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            variant: "success",
            size: "md",
            pulse: false,
          }}
          controls={[
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "pulse", label: "Pulse", type: "boolean" },
          ]}
          render={(values) => (
            <Status variant={values.variant} size={values.size} pulse={values.pulse} />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          {VARIANTS.map((variant) => (
            <Status key={variant} variant={variant} />
          ))}
        </Example>
      </DocSection>

      <DocSection id="sizes" title="Sizes">
        <Example html={code.sizes}>
          <Status size="xs" variant="success" />
          <Status size="sm" variant="success" />
          <Status size="md" variant="success" />
          <Status size="lg" variant="success" />
        </Example>
      </DocSection>

      <DocSection id="pulse" title="Pulse">
        <Example html={code.pulse}>
          <Status size="xs" variant="primary" pulse />
          <Status size="sm" variant="primary" pulse />
          <Status size="md" variant="primary" pulse />
          <Status size="lg" variant="primary" pulse />
        </Example>
      </DocSection>

      <DocSection id="customize" title="Customize">
        <Example html={code.customize}>
          <Status className="[--status-color:var(--color-brutal-purple-300)]" />
          <Status pulse className="[--status-color:var(--color-brutal-purple-300)]" />
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
              source: <LegacyStatusDot />,
              brutal: <Status />,
              elegant: <Status />,
              elegantDark: <Status />,
            },
            {
              label: "Success",
              status: "difference",
              source: <LegacyStatusDot tone="bg-brutal-lime" />,
              brutal: <Status variant="success" />,
              elegant: <Status variant="success" />,
              elegantDark: <Status variant="success" />,
            },
            {
              label: "Primary pulse",
              status: "difference",
              source: <LegacyStatusDot tone="bg-brutal-yellow" pulse />,
              brutal: <Status variant="primary" pulse />,
              elegant: <Status variant="primary" pulse />,
              elegantDark: <Status variant="primary" pulse />,
            },
            {
              label: "Pulse sizes",
              status: "difference",
              source: (
                <>
                  <LegacyStatusDot size="sm" tone="bg-brutal-yellow" pulse />
                  <LegacyStatusDot size="md" tone="bg-brutal-yellow" pulse />
                  <LegacyStatusDot size="lg" tone="bg-brutal-yellow" pulse />
                </>
              ),
              brutal: (
                <>
                  <Status size="sm" variant="primary" pulse />
                  <Status size="md" variant="primary" pulse />
                  <Status size="lg" variant="primary" pulse />
                </>
              ),
              elegant: (
                <>
                  <Status size="sm" variant="primary" pulse />
                  <Status size="md" variant="primary" pulse />
                  <Status size="lg" variant="primary" pulse />
                </>
              ),
              elegantDark: (
                <>
                  <Status size="sm" variant="primary" pulse />
                  <Status size="md" variant="primary" pulse />
                  <Status size="lg" variant="primary" pulse />
                </>
              ),
            },
            {
              label: "Activity thinking",
              status: "difference",
              source: <LegacyStatusDot activity="thinking" />,
              brutal: <Status variant="primary" pulse />,
              elegant: <Status variant="primary" pulse />,
              elegantDark: <Status variant="primary" pulse />,
            },
            {
              label: "Attention default",
              status: "difference",
              source: <LegacyAttentionDot />,
              brutal: <Status variant="accent" />,
              elegant: <Status variant="accent" />,
              elegantDark: <Status variant="accent" />,
            },
            {
              label: "Attention compact",
              status: "difference",
              source: <LegacyAttentionDot size="sm" />,
              brutal: <Status variant="accent" size="xs" />,
              elegant: <Status variant="accent" size="xs" />,
              elegantDark: <Status variant="accent" size="xs" />,
            },
            {
              label: "Warning",
              status: "difference",
              source: <LegacyAttentionDot tone="bg-brutal-orange" />,
              brutal: <Status variant="warning" />,
              elegant: <Status variant="warning" />,
              elegantDark: <Status variant="warning" />,
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Activity mapping</h3>
            <CodeBlock html={code.migrationActivity} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Color mapping</h3>
            <CodeBlock html={code.migrationToneToVariant} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">AttentionDot</h3>
            <CodeBlock html={code.migrationAttention} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Custom color</h3>
            <CodeBlock html={code.migrationCustomTone} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
