import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Spinner, Status, Text, type BadgeProps } from "raft-ui";
import { CircleCheck, Clock, Grid2X2, X } from "lucide-react";

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
import badgeAccentCompositionSource from "#/compositions/badge/accent-composition.tsx?raw";
import badgeButtonRenderCompositionSource from "#/compositions/badge/button-render-composition.tsx?raw";
import badgeDangerCompositionSource from "#/compositions/badge/danger-composition.tsx?raw";
import badgeDefaultCompositionSource from "#/compositions/badge/default-composition.tsx?raw";
import badgeDefaultPreservedCasingCompositionSource from "#/compositions/badge/default-preserved-casing-composition.tsx?raw";
import badgeExperimentalPresetCompositionSource from "#/compositions/badge/experimental-preset-composition.tsx?raw";
import badgeInformationCompositionSource from "#/compositions/badge/information-composition.tsx?raw";
import badgeMutedCompositionSource from "#/compositions/badge/muted-composition.tsx?raw";
import badgeOutlineAppearanceCompositionSource from "#/compositions/badge/outline-appearance-composition.tsx?raw";
import badgePrimaryCompositionSource from "#/compositions/badge/primary-composition.tsx?raw";
import badgeSoftAppearanceCompositionSource from "#/compositions/badge/soft-appearance-composition.tsx?raw";
import badgeSuccessCompositionSource from "#/compositions/badge/success-composition.tsx?raw";
import badgeWarningCompositionSource from "#/compositions/badge/warning-composition.tsx?raw";
import {
  BADGE_SOURCE_COMPARISON_COMPOSITION,
  BADGE_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/badge-source-comparison.tsx";
import LegacyBadge, {
  BadgeButton as LegacyBadgeButton,
} from "../../../../../packages/ui/src/legacy/Badge.tsx";
import LegacyExperimentalBadge from "../../../../../packages/ui/src/legacy/ExperimentalBadge.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "appearance", title: "Appearance" },
  { id: "casing", title: "Casing" },
  { id: "icons", title: "Icons" },
  { id: "spinner", title: "Spinner" },
  { id: "composition", title: "Composition" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Status and semantic badges",
    scenes: [
      {
        label: "ActionCard.tsx:272",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/actions/ActionCard.tsx:272",
      },
      {
        label: "StatusBadge.tsx:48",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/StatusBadge.tsx:48",
      },
      {
        label: "ExperimentalBadge.tsx:13",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/ExperimentalBadge.tsx:13",
      },
      {
        label: "MessageItem.tsx:40",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:40",
      },
      {
        label: "taskStatusUi.ts:4",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/taskStatusUi.ts:4",
      },
      "InlineBadgeEditor consumers: TaskItem.tsx, TaskCard.tsx, HumanDetailPanel.tsx",
      "JointPeerBadge",
      "AgentStatusBadge",
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

const APPEARANCES = ["solid", "soft", "outline"] as const;

const SNIPPETS = {
  anatomy: `import { Badge } from "raft-ui";

<Badge variant="primary">In Progress</Badge>`,
  variants: `<Badge appearance="outline" uppercase>Default</Badge>
<Badge variant="primary" uppercase>Pending</Badge>
<Badge variant="information">Open</Badge>
<Badge variant="muted">Saved</Badge>
<Badge variant="accent">New</Badge>
<Badge variant="success">Live</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Failed</Badge>`,
  appearance: `<Badge appearance="solid" variant="primary">Solid</Badge>
<Badge appearance="soft" variant="primary">Soft</Badge>
<Badge appearance="outline" variant="primary">Outline</Badge>`,
  casing: `<Badge>task #42 @bugen</Badge>
<Badge uppercase>In Progress</Badge>`,
  icons: `import { Badge, Status } from "raft-ui";

<Badge variant="primary">
  <CircleCheck className="size-3" />
  Approved
</Badge>

<Badge appearance="outline" variant="success">
  <Status size="xs" variant="success" />
  Online
</Badge>

<Badge appearance="soft" variant="success">
  <Status size="xs" variant="success" />
  Available
</Badge>`,
  spinner: `import { Badge, Spinner } from "raft-ui";

<Badge>
  {/* Badge targets Spinner and renders it one step smaller than sm. */}
  <Spinner data-icon="inline-start" />
  Syncing
</Badge>

<Badge variant="primary">
  <Spinner data-icon="inline-start" />
  Loading
</Badge>`,
  composition: `import { Badge, Text } from "raft-ui";

<div className="grid max-w-full grid-cols-[max-content_minmax(0,1fr)] gap-x-8 gap-y-3">
  <div className="flex flex-col items-start gap-3">
    <Badge.Experimental />
    <Badge
      render={<button type="button" aria-label="Open thread replies" />}
      variant="information"
      onClick={openThread}
    >
      3 replies
    </Badge>
    <Badge
      render={<button type="button" aria-label="Remove assignee filter" />}
      variant="danger"
    >
      @bugen
      <X className="size-3" />
    </Badge>
  </div>
  <div className="flex flex-col items-start gap-3">
    <div className="flex items-center gap-3">
      <Badge variant="success">
        <CircleCheck className="size-3" />
        Live
      </Badge>
      <Text.Sans size="small" variant="success" className="font-medium">
        Release channel
      </Text.Sans>
    </div>
    <div className="flex items-center gap-3">
      <Badge variant="warning">
        <Clock className="size-3" />
        Warning
      </Badge>
      <Text.Sans size="small" variant="warning" className="font-medium">
        deploy:warning
      </Text.Sans>
    </div>
    <div className="flex items-center gap-3">
      <Badge appearance="soft" variant="danger">
        <X className="size-3" />
        Retry
      </Badge>
      <Text.Sans size="small" variant="danger" className="font-medium">
        Sync failed
      </Text.Sans>
    </div>
  </div>
</div>`,
  migrationToneToVariant: `// Source
<Badge tone="white">Default</Badge>
<Badge tone="yellow">In Progress</Badge>
<Badge tone="cyan">Open</Badge>
<Badge tone="stone">Saved</Badge>
<Badge tone="pink">New</Badge>
<Badge tone="lime">Experimental</Badge>
<Badge tone="orange">Warning</Badge>
<Badge tone="red">Error</Badge>

// Current
<Badge appearance="outline" uppercase>Default</Badge>
<Badge variant="primary" uppercase>In Progress</Badge>
<Badge variant="information" uppercase>Open</Badge>
<Badge variant="muted" uppercase>Saved</Badge>
<Badge variant="accent" uppercase>New</Badge>
<Badge variant="success" uppercase>Experimental</Badge>
<Badge variant="warning" uppercase>Warning</Badge>
<Badge variant="danger" uppercase>Error</Badge>`,
  migrationCasing: `// Source opt-out
<Badge uppercase={false}>task #42 @bugen</Badge>

// Current default preserves casing
<Badge appearance="outline">task #42 @bugen</Badge>

// Current old brutal casing recipe
<Badge appearance="outline" uppercase>In Progress</Badge>`,
  migrationLavender: `// Source
<Badge tone="lavender">Human</Badge>

// Current, identity/attachment tag escape hatch
<Badge className="bg-brutal-lavender text-black" uppercase>
  Human
</Badge>`,
} as const;

type PlaygroundValues = {
  appearance: NonNullable<BadgeProps["appearance"]>;
  variant: NonNullable<BadgeProps["variant"]>;
  uppercase: boolean;
  label: string;
};

const PROPS: readonly PropRow[] = [
  {
    name: "appearance",
    type: APPEARANCES.map((appearance) => `"${appearance}"`).join(" | "),
    default: '"solid"',
    description:
      "Visual treatment. Solid keeps the current filled badge, soft uses the lighter token ramp, and outline uses a transparent fill with a semantic border.",
  },
  {
    name: "variant",
    type: VARIANTS.map((variant) => `"${variant}"`).join(" | "),
    default: '"default"',
    description:
      "Semantic label/status variant. Uses shared semantic color tokens instead of raw brutal color names.",
  },
  {
    name: "uppercase",
    type: "boolean",
    default: "false",
    description:
      "Apply the badge casing recipe: uppercase plus wider tracking. Defaults off so case-sensitive content stays intact.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description:
      'Swap the root element. Use render={<button type="button" />} for the old BadgeButton shape.',
  },
  {
    name: "...props",
    type: "Base UI useRender span props",
    description: "Native span attributes plus Base UI render composition props.",
  },
];

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

const BadgeCurrent = BADGE_SOURCE_COMPARISON_COMPOSITION;

const BADGE_COMPOSITION_RAW_SOURCES = {
  Accent: badgeAccentCompositionSource,
  ButtonRender: badgeButtonRenderCompositionSource,
  Danger: badgeDangerCompositionSource,
  Default: badgeDefaultCompositionSource,
  DefaultPreservedCasing: badgeDefaultPreservedCasingCompositionSource,
  ExperimentalPreset: badgeExperimentalPresetCompositionSource,
  Information: badgeInformationCompositionSource,
  Muted: badgeMutedCompositionSource,
  OutlineAppearance: badgeOutlineAppearanceCompositionSource,
  Primary: badgePrimaryCompositionSource,
  SoftAppearance: badgeSoftAppearanceCompositionSource,
  Success: badgeSuccessCompositionSource,
  Warning: badgeWarningCompositionSource,
} as const;

const BADGE_COMPOSITION_SOURCES = createCompositionSourceMap(BADGE_COMPOSITION_RAW_SOURCES);

const BADGE_COMPOSITION_SNIPPET_IDS = {
  Accent: "badgeAccentComposition",
  ButtonRender: "badgeButtonRenderComposition",
  Danger: "badgeDangerComposition",
  Default: "badgeDefaultComposition",
  DefaultPreservedCasing: "badgeDefaultPreservedCasingComposition",
  ExperimentalPreset: "badgeExperimentalPresetComposition",
  Information: "badgeInformationComposition",
  Muted: "badgeMutedComposition",
  OutlineAppearance: "badgeOutlineAppearanceComposition",
  Primary: "badgePrimaryComposition",
  SoftAppearance: "badgeSoftAppearanceComposition",
  Success: "badgeSuccessComposition",
  Warning: "badgeWarningComposition",
} as const;

type BadgeCompositionKey = keyof typeof BADGE_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/badge")({
  component: BadgeDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(BADGE_COMPOSITION_SOURCES, BADGE_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function BadgeDoc() {
  const code = Route.useLoaderData();
  const badgeComposition = (key: BadgeCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: BADGE_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: BADGE_COMPOSITION_SNIPPET_IDS,
      sources: BADGE_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Badge"
      description="A small semantic label chip for status, category, and metadata."
      headerAction={
        <Button
          render={<a href="/components/badge/matrix" target="_blank" rel="noreferrer" />}
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
            appearance: "solid",
            variant: "primary",
            uppercase: false,
            label: "In Progress",
          }}
          controls={[
            { name: "appearance", label: "Appearance", type: "select", options: APPEARANCES },
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
            { name: "uppercase", label: "Uppercase", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
          ]}
          render={(values) => (
            <Badge
              appearance={values.appearance}
              variant={values.variant}
              uppercase={values.uppercase}
            >
              {values.label}
            </Badge>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Badge.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          <Badge appearance="outline" uppercase>
            Default
          </Badge>
          <Badge variant="primary" uppercase>
            Pending
          </Badge>
          <Badge variant="information">Open</Badge>
          <Badge variant="muted">Saved</Badge>
          <Badge variant="accent">New</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Failed</Badge>
        </Example>
      </DocSection>

      <DocSection id="appearance" title="Appearance">
        <Example html={code.appearance}>
          {APPEARANCES.map((appearance) => (
            <div
              key={appearance}
              className="flex w-full flex-wrap items-center justify-center gap-2"
            >
              {VARIANTS.map((variant) => (
                <Badge key={variant} appearance={appearance} variant={variant}>
                  {variant}
                </Badge>
              ))}
            </div>
          ))}
        </Example>
      </DocSection>

      <DocSection id="casing" title="Casing">
        <Example html={code.casing}>
          <Badge>task #42 @bugen</Badge>
          <Badge uppercase>In Progress</Badge>
        </Example>
      </DocSection>

      <DocSection id="icons" title="Icons">
        <Example html={code.icons}>
          <Badge variant="primary">
            <CircleCheck className="size-3" />
            Approved
          </Badge>
          <Badge appearance="outline" variant="success">
            <Status size="xs" variant="success" />
            Online
          </Badge>
          <Badge appearance="soft" variant="success">
            <Status size="xs" variant="success" />
            Available
          </Badge>
        </Example>
      </DocSection>

      <DocSection id="spinner" title="Spinner">
        <Example html={code.spinner}>
          <Badge>
            <Spinner data-icon="inline-start" />
            Syncing
          </Badge>
          <Badge variant="primary">
            <Spinner data-icon="inline-start" />
            Loading
          </Badge>
        </Example>
      </DocSection>

      <DocSection id="composition" title="Composition">
        <Example html={code.composition}>
          <div className="grid max-w-full grid-cols-[max-content_minmax(0,1fr)] gap-x-8 gap-y-3">
            <div className="flex flex-col items-start gap-3">
              <Badge.Experimental />
              <Badge
                render={<button type="button" aria-label="Open thread replies" />}
                variant="information"
                onClick={() => undefined}
              >
                3 replies
              </Badge>
              <Badge
                render={<button type="button" aria-label="Remove assignee filter" />}
                variant="danger"
              >
                @bugen
                <X className="size-3" />
              </Badge>
            </div>
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-3">
                <Badge variant="success">
                  <CircleCheck className="size-3" />
                  Live
                </Badge>
                <Text.Sans size="small" variant="success" className="font-medium">
                  Release channel
                </Text.Sans>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="warning">
                  <Clock className="size-3" />
                  Warning
                </Badge>
                <Text.Sans size="small" variant="warning" className="font-medium">
                  deploy:warning
                </Text.Sans>
              </div>
              <div className="flex items-center gap-3">
                <Badge appearance="soft" variant="danger">
                  <X className="size-3" />
                  Retry
                </Badge>
                <Text.Sans size="small" variant="danger" className="font-medium">
                  Sync failed
                </Text.Sans>
              </div>
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
              source: <LegacyBadge>In Progress</LegacyBadge>,
              brutal: <BadgeCurrent.Default />,
              elegant: <BadgeCurrent.Default />,
              elegantDark: <BadgeCurrent.Default />,
              ...badgeComposition("Default"),
            },
            {
              label: "Primary",
              status: "match",
              source: <LegacyBadge tone="yellow">Pending</LegacyBadge>,
              brutal: <BadgeCurrent.Primary />,
              elegant: <BadgeCurrent.Primary />,
              elegantDark: <BadgeCurrent.Primary />,
              ...badgeComposition("Primary"),
            },
            {
              label: "Information",
              status: "match",
              source: <LegacyBadge tone="cyan">Open</LegacyBadge>,
              brutal: <BadgeCurrent.Information />,
              elegant: <BadgeCurrent.Information />,
              elegantDark: <BadgeCurrent.Information />,
              ...badgeComposition("Information"),
            },
            {
              label: "Muted",
              status: "match",
              source: <LegacyBadge tone="stone">Saved</LegacyBadge>,
              brutal: <BadgeCurrent.Muted />,
              elegant: <BadgeCurrent.Muted />,
              elegantDark: <BadgeCurrent.Muted />,
              ...badgeComposition("Muted"),
            },
            {
              label: "Accent",
              status: "match",
              source: <LegacyBadge tone="pink">New</LegacyBadge>,
              brutal: <BadgeCurrent.Accent />,
              elegant: <BadgeCurrent.Accent />,
              elegantDark: <BadgeCurrent.Accent />,
              ...badgeComposition("Accent"),
            },
            {
              label: "Success",
              status: "match",
              source: <LegacyBadge tone="lime">Live</LegacyBadge>,
              brutal: <BadgeCurrent.Success />,
              elegant: <BadgeCurrent.Success />,
              elegantDark: <BadgeCurrent.Success />,
              ...badgeComposition("Success"),
            },
            {
              label: "Warning",
              status: "match",
              source: <LegacyBadge tone="orange">Warning</LegacyBadge>,
              brutal: <BadgeCurrent.Warning />,
              elegant: <BadgeCurrent.Warning />,
              elegantDark: <BadgeCurrent.Warning />,
              ...badgeComposition("Warning"),
            },
            {
              label: "Danger",
              status: "match",
              source: <LegacyBadge tone="red">Failed</LegacyBadge>,
              brutal: <BadgeCurrent.Danger />,
              elegant: <BadgeCurrent.Danger />,
              elegantDark: <BadgeCurrent.Danger />,
              ...badgeComposition("Danger"),
            },
            {
              label: "Soft appearance",
              status: "new",
              source: <MissingSource />,
              brutal: <BadgeCurrent.SoftAppearance />,
              elegant: <BadgeCurrent.SoftAppearance />,
              elegantDark: <BadgeCurrent.SoftAppearance />,
              ...badgeComposition("SoftAppearance"),
            },
            {
              label: "Outline appearance",
              status: "new",
              source: <MissingSource />,
              brutal: <BadgeCurrent.OutlineAppearance />,
              elegant: <BadgeCurrent.OutlineAppearance />,
              elegantDark: <BadgeCurrent.OutlineAppearance />,
              ...badgeComposition("OutlineAppearance"),
            },
            {
              label: "Default preserved casing",
              status: "match",
              source: <LegacyBadge uppercase={false}>task #42 @bugen</LegacyBadge>,
              brutal: <BadgeCurrent.DefaultPreservedCasing />,
              elegant: <BadgeCurrent.DefaultPreservedCasing />,
              elegantDark: <BadgeCurrent.DefaultPreservedCasing />,
              ...badgeComposition("DefaultPreservedCasing"),
            },
            {
              label: "Button render",
              status: "difference",
              source: <LegacyBadgeButton tone="cyan">3 replies</LegacyBadgeButton>,
              brutal: <BadgeCurrent.ButtonRender />,
              elegant: <BadgeCurrent.ButtonRender />,
              elegantDark: <BadgeCurrent.ButtonRender />,
              ...badgeComposition("ButtonRender"),
            },
            {
              label: "Experimental preset",
              status: "match",
              source: <LegacyExperimentalBadge />,
              brutal: <BadgeCurrent.ExperimentalPreset />,
              elegant: <BadgeCurrent.ExperimentalPreset />,
              elegantDark: <BadgeCurrent.ExperimentalPreset />,
              ...badgeComposition("ExperimentalPreset"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
