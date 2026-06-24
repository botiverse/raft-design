import { createFileRoute } from "@tanstack/react-router";
import { Grid2X2 } from "lucide-react";
import { Button, Status, type StatusProps } from "@raft/ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import statusActivityThinkingCompositionSource from "#/compositions/status/activity-thinking-composition.tsx?raw";
import statusAttentionCompactCompositionSource from "#/compositions/status/attention-compact-composition.tsx?raw";
import statusAttentionDefaultCompositionSource from "#/compositions/status/attention-default-composition.tsx?raw";
import statusDefaultCompositionSource from "#/compositions/status/default-composition.tsx?raw";
import statusPrimaryPulseCompositionSource from "#/compositions/status/primary-pulse-composition.tsx?raw";
import statusPulseSizesCompositionSource from "#/compositions/status/pulse-sizes-composition.tsx?raw";
import statusSuccessCompositionSource from "#/compositions/status/success-composition.tsx?raw";
import statusWarningCompositionSource from "#/compositions/status/warning-composition.tsx?raw";
import {
  STATUS_SOURCE_COMPARISON_COMPOSITION,
  STATUS_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/status-source-comparison.tsx";
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

type LegacyStatusDotProps = Parameters<typeof LegacyStatusDot>[0];

function LegacyPulseStatusDot({ className, ...props }: LegacyStatusDotProps) {
  return (
    <LegacyStatusDot
      {...props}
      pulse
      className={`animate-pulse [animation-duration:1.1s] ${className ?? ""}`}
    />
  );
}

const SNIPPETS = {
  anatomy: `import { Status } from "@raft/ui";

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

const StatusCurrent = STATUS_SOURCE_COMPARISON_COMPOSITION;

const STATUS_COMPOSITION_RAW_SOURCES = {
  ActivityThinking: statusActivityThinkingCompositionSource,
  AttentionCompact: statusAttentionCompactCompositionSource,
  AttentionDefault: statusAttentionDefaultCompositionSource,
  Default: statusDefaultCompositionSource,
  PrimaryPulse: statusPrimaryPulseCompositionSource,
  PulseSizes: statusPulseSizesCompositionSource,
  Success: statusSuccessCompositionSource,
  Warning: statusWarningCompositionSource,
} as const;

const STATUS_COMPOSITION_SOURCES = createCompositionSourceMap(STATUS_COMPOSITION_RAW_SOURCES);

const STATUS_COMPOSITION_SNIPPET_IDS = {
  ActivityThinking: "statusActivityThinkingComposition",
  AttentionCompact: "statusAttentionCompactComposition",
  AttentionDefault: "statusAttentionDefaultComposition",
  Default: "statusDefaultComposition",
  PrimaryPulse: "statusPrimaryPulseComposition",
  PulseSizes: "statusPulseSizesComposition",
  Success: "statusSuccessComposition",
  Warning: "statusWarningComposition",
} as const;

type StatusCompositionKey = keyof typeof STATUS_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/status")({
  component: StatusDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(STATUS_COMPOSITION_SOURCES, STATUS_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function StatusDoc() {
  const code = Route.useLoaderData();
  const statusComposition = (key: StatusCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: STATUS_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: STATUS_COMPOSITION_SNIPPET_IDS,
      sources: STATUS_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Status"
      description="Presence, progress, unread, and compact status markers."
      headerAction={
        <Button
          render={<a href="/components/status/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <Grid2X2 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
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
        <DocsCodeBlock.Panel
          path="Status.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
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
              brutal: <StatusCurrent.Default />,
              elegant: <StatusCurrent.Default />,
              elegantDark: <StatusCurrent.Default />,
              ...statusComposition("Default"),
            },
            {
              label: "Success",
              status: "match",
              source: <LegacyStatusDot tone="bg-brutal-lime" />,
              brutal: <StatusCurrent.Success />,
              elegant: <StatusCurrent.Success />,
              elegantDark: <StatusCurrent.Success />,
              ...statusComposition("Success"),
            },
            {
              label: "Primary pulse",
              status: "match",
              source: <LegacyPulseStatusDot tone="bg-brutal-yellow" />,
              brutal: <StatusCurrent.PrimaryPulse />,
              elegant: <StatusCurrent.PrimaryPulse />,
              elegantDark: <StatusCurrent.PrimaryPulse />,
              ...statusComposition("PrimaryPulse"),
            },
            {
              label: "Pulse sizes",
              status: "match",
              source: (
                <>
                  <LegacyPulseStatusDot size="sm" tone="bg-brutal-yellow" />
                  <LegacyPulseStatusDot size="md" tone="bg-brutal-yellow" />
                  <LegacyPulseStatusDot size="lg" tone="bg-brutal-yellow" />
                </>
              ),
              brutal: <StatusCurrent.PulseSizes />,
              elegant: <StatusCurrent.PulseSizes />,
              elegantDark: <StatusCurrent.PulseSizes />,
              ...statusComposition("PulseSizes"),
            },
            {
              label: "Activity thinking",
              status: "match",
              source: <LegacyPulseStatusDot activity="thinking" />,
              brutal: <StatusCurrent.ActivityThinking />,
              elegant: <StatusCurrent.ActivityThinking />,
              elegantDark: <StatusCurrent.ActivityThinking />,
              ...statusComposition("ActivityThinking"),
            },
            {
              label: "Attention default",
              status: "match",
              source: <LegacyAttentionDot />,
              brutal: <StatusCurrent.AttentionDefault />,
              elegant: <StatusCurrent.AttentionDefault />,
              elegantDark: <StatusCurrent.AttentionDefault />,
              ...statusComposition("AttentionDefault"),
            },
            {
              label: "Attention compact",
              status: "match",
              source: <LegacyAttentionDot size="sm" />,
              brutal: <StatusCurrent.AttentionCompact />,
              elegant: <StatusCurrent.AttentionCompact />,
              elegantDark: <StatusCurrent.AttentionCompact />,
              ...statusComposition("AttentionCompact"),
            },
            {
              label: "Warning",
              status: "match",
              source: <LegacyAttentionDot tone="bg-brutal-orange" />,
              brutal: <StatusCurrent.Warning />,
              elegant: <StatusCurrent.Warning />,
              elegantDark: <StatusCurrent.Warning />,
              ...statusComposition("Warning"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
