import { createFileRoute } from "@tanstack/react-router";
import { Bell, Grid2X2 } from "lucide-react";
import type { CSSProperties } from "react";
import { Button, Status, type StatusProps } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
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
  { id: "attention", title: "Attention" },
  { id: "notification-trigger", title: "Notification trigger" },
  { id: "customize", title: "Customize" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "StatusDot scenes",
    scenes: [
      {
        label: "AnnouncementModal.tsx:170",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/AnnouncementModal.tsx:170",
      },
      {
        label: "AddMachineDialog.tsx:287",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/AddMachineDialog.tsx:287",
      },
      {
        label: "MachineDetailPanel.tsx:426,699",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:426,699",
      },
      {
        label: "MobileComputersPanel.tsx:86",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MobileComputersPanel.tsx:86",
      },
      {
        label: "AgentActivityDot.tsx:24",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentActivityDot.tsx:24",
      },
      {
        label: "MentionHoverCard.tsx:54",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MentionHoverCard.tsx:54",
      },
      {
        label: "AgentDetailPanel.tsx:951,1206,1233,1708",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:951,1206,1233,1708",
      },
      {
        label: "AgentActivityLog.tsx:63,96,116,152,188,228,249",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentActivityLog.tsx:63,96,116,152,188,228,249",
      },
      {
        label: "ChatPanel.tsx:60",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/ChatPanel.tsx:60",
      },
      {
        label: "HumanDetailPanel.tsx:523",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/HumanDetailPanel.tsx:523",
      },
      {
        label: "MessageItem.tsx:1218",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:1218",
      },
      {
        label: "LiveAgentActivityBar.tsx:56",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/LiveAgentActivityBar.tsx:56",
      },
      {
        label: "Sidebar.tsx:1080,1152,1364,1673",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1080,1152,1364,1673",
      },
    ],
  },
  {
    label: "AttentionDot scenes",
    scenes: [
      {
        label: "LeftRail.tsx:101,222",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/LeftRail.tsx:101,222",
      },
      {
        label: "Sidebar.tsx:1212,1481,1532,1575,1705",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1212,1481,1532,1575,1705",
      },
    ],
  },
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

const ATTENTION_PREVIEW_COPY =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore";

// Maps playground variants to token colors for the content-glow layer
// (same role as NotificationCenter triggerBellGlow over the bell icon).
const ATTENTION_GLOW_COLOR: Record<(typeof VARIANTS)[number], string> = {
  default: "var(--color-gray-400)",
  primary: "var(--color-primary-400)",
  information: "var(--color-info-base)",
  muted: "var(--color-secondary-400)",
  accent: "var(--color-accent-400)",
  success: "var(--color-success-base)",
  warning: "var(--color-warning-base)",
  danger: "var(--color-danger-base)",
};

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
  anatomy: `import { Status } from "raft-ui";

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
  attention: `<Status variant="primary" attention />
<Status variant="information" attention />
<Status variant="accent" attention />
<Status variant="success" attention />
<Status variant="warning" attention />
<Status variant="danger" attention />

<Status size="xs" variant="accent" attention />
<Status size="sm" variant="accent" attention />
<Status size="md" variant="accent" attention />
<Status size="lg" variant="accent" attention />

<Status variant="accent" attention pulse />
<Status size="sm" variant="primary" attention pulse />
<Status size="lg" variant="success" attention pulse />`,
  notificationTrigger: `import { Bell } from "lucide-react";
import { Status } from "raft-ui";

{/* Same stack as NotificationCenterTrigger (elegant):
    1. base icon
    2. tinted duplicate + radial mask toward the dot
    3. Status attention as the unread marker */}
<span className="relative inline-flex size-9 items-center justify-center">
  <span className="relative inline-flex size-4 items-center justify-center">
    <Bell className="size-4 shrink-0 text-foreground-muted" strokeWidth={2} />
    <Bell
      aria-hidden
      className={[
        "pointer-events-none absolute inset-0 size-4 shrink-0",
        "text-primary-400",
        "drop-shadow-[0_0_1px_color-mix(in_oklch,var(--color-primary-400)_82%,transparent)]",
        "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
      ].join(" ")}
      strokeWidth={2}
    />
  </span>
  <Status
    aria-hidden
    variant="primary"
    size="sm"
    attention
    className="pointer-events-none absolute top-[7px] right-[8px]"
  />
</span>`,
  customize: `<Status className="[--status-color:var(--color-brutal-purple-300)]" />
<Status
  pulse
  className="[--status-color:var(--color-brutal-purple-300)]"
/>
<Status
  attention
  className="[--status-color:var(--color-brutal-purple-300)]"
/>
<Status
  attention
  pulse
  className="[--status-color:var(--color-brutal-purple-300)]"
/>

<Status className="[--status-color:oklch(0.72_0.14_200)]" />
<Status attention className="[--status-color:oklch(0.72_0.14_200)]" />
<Status size="lg" attention pulse className="[--status-color:oklch(0.78_0.12_145)]" />`,
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
  attention: boolean;
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
    name: "attention",
    type: "boolean",
    default: "false",
    description:
      "Elegant-only glow ring (NotificationCenter triggerDot treatment). No visual effect on brutal.",
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            variant: "success",
            size: "md",
            pulse: false,
            attention: false,
          }}
          controls={[
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "pulse", label: "Pulse", type: "boolean" },
            { name: "attention", label: "Attention", type: "boolean" },
          ]}
          render={(values) =>
            values.attention ? (
              <span
                className="relative inline-grid size-28 place-items-center"
                style={
                  {
                    "--status-glow-color": ATTENTION_GLOW_COLOR[values.variant],
                  } as CSSProperties
                }
              >
                <span
                  aria-hidden
                  className="pointer-events-none col-start-1 row-start-1 max-w-[7rem] text-center text-[9px] leading-[1.15] text-foreground-muted/70"
                >
                  {ATTENTION_PREVIEW_COPY}
                </span>
                {/* Content glow — mirrors NotificationCenter triggerBellGlow: tinted
                    duplicate of the underlying content, masked toward the status. */}
                <span
                  aria-hidden
                  className={[
                    "pointer-events-none col-start-1 row-start-1 max-w-[7rem] text-center text-[9px] leading-[1.15]",
                    "text-[var(--status-glow-color)]",
                    "drop-shadow-[0_0_1px_color-mix(in_oklch,var(--status-glow-color)_82%,transparent)]",
                    "[mask-image:radial-gradient(circle,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
                    "[-webkit-mask-image:radial-gradient(circle,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
                  ].join(" ")}
                >
                  {ATTENTION_PREVIEW_COPY}
                </span>
                <Status
                  className="col-start-1 row-start-1"
                  variant={values.variant}
                  size={values.size}
                  pulse={values.pulse}
                  attention
                />
              </span>
            ) : (
              <Status
                variant={values.variant}
                size={values.size}
                pulse={values.pulse}
                attention={values.attention}
              />
            )
          }
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

      <DocSection id="variants" title="Variants" showThemeSwitcher>
        <Example html={code.variants}>
          {VARIANTS.map((variant) => (
            <Status key={variant} variant={variant} />
          ))}
        </Example>
      </DocSection>

      <DocSection id="sizes" title="Sizes" showThemeSwitcher>
        <Example html={code.sizes}>
          <Status size="xs" variant="success" />
          <Status size="sm" variant="success" />
          <Status size="md" variant="success" />
          <Status size="lg" variant="success" />
        </Example>
      </DocSection>

      <DocSection id="pulse" title="Pulse" showThemeSwitcher>
        <Example html={code.pulse}>
          <Status size="xs" variant="primary" pulse />
          <Status size="sm" variant="primary" pulse />
          <Status size="md" variant="primary" pulse />
          <Status size="lg" variant="primary" pulse />
        </Example>
      </DocSection>

      <DocSection id="attention" title="Attention" showThemeSwitcher>
        <Example html={code.attention}>
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Status variant="primary" attention />
              <Status variant="information" attention />
              <Status variant="accent" attention />
              <Status variant="success" attention />
              <Status variant="warning" attention />
              <Status variant="danger" attention />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Status size="xs" variant="accent" attention />
              <Status size="sm" variant="accent" attention />
              <Status size="md" variant="accent" attention />
              <Status size="lg" variant="accent" attention />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Status variant="accent" attention pulse />
              <Status size="sm" variant="primary" attention pulse />
              <Status size="lg" variant="success" attention pulse />
            </div>
          </div>
        </Example>
      </DocSection>

      <DocSection id="notification-trigger" title="Notification trigger" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            <code>attention</code> only styles the dot. The soft wash on the icon comes from a
            tinted duplicate of the underlying content, masked toward the marker — the same stack as
            elegant <code>NotificationCenterTrigger</code>.
          </DocNote>
          <Example html={code.notificationTrigger}>
            <span className="relative inline-flex size-9 items-center justify-center">
              <span className="relative inline-flex size-4 items-center justify-center">
                <Bell className="size-4 shrink-0 text-foreground-muted" strokeWidth={2} />
                <Bell
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0 size-4 shrink-0",
                    "text-primary-400",
                    "drop-shadow-[0_0_1px_color-mix(in_oklch,var(--color-primary-400)_82%,transparent)]",
                    "[mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
                  ].join(" ")}
                  strokeWidth={2}
                />
              </span>
              <Status
                aria-hidden
                variant="primary"
                size="sm"
                attention
                className="pointer-events-none absolute top-[7px] right-[8px]"
              />
            </span>
          </Example>
        </div>
      </DocSection>

      <DocSection id="customize" title="Customize" showThemeSwitcher>
        <Example html={code.customize}>
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Status className="[--status-color:var(--color-brutal-purple-300)]" />
              <Status pulse className="[--status-color:var(--color-brutal-purple-300)]" />
              <Status attention className="[--status-color:var(--color-brutal-purple-300)]" />
              <Status attention pulse className="[--status-color:var(--color-brutal-purple-300)]" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Status className="[--status-color:oklch(0.72_0.14_200)]" />
              <Status attention className="[--status-color:oklch(0.72_0.14_200)]" />
              <Status size="lg" attention pulse className="[--status-color:oklch(0.78_0.12_145)]" />
            </div>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
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
