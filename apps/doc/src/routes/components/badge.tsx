import { createFileRoute } from "@tanstack/react-router";
import { Badge, type BadgeProps } from "@slock/ui";
import { X } from "lucide-react";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyBadge, {
  BadgeButton as LegacyBadgeButton,
} from "../../../../../packages/ui/src/legacy/Badge.tsx";
import LegacyExperimentalBadge from "../../../../../packages/ui/src/legacy/ExperimentalBadge.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "appearance", title: "Appearance" },
  { id: "uppercase", title: "Uppercase" },
  { id: "badge-button", title: "BadgeButton migration" },
  { id: "experimental", title: "Experimental" },
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
  "danger",
] as const;

const APPEARANCES = ["solid", "soft", "outline"] as const;

const SNIPPETS = {
  anatomy: `import { Badge } from "@slock/ui";

<Badge variant="primary">In Progress</Badge>`,
  variants: `<Badge>Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="information">Open</Badge>
<Badge variant="muted">Saved</Badge>
<Badge variant="accent">New</Badge>
<Badge variant="success">Experimental</Badge>
<Badge variant="danger">Error</Badge>`,
  appearance: `<Badge appearance="solid" variant="primary">Solid</Badge>
<Badge appearance="soft" variant="primary">Soft</Badge>
<Badge appearance="outline" variant="primary">Outline</Badge>`,
  uppercase: `<Badge>task #42 @bugen</Badge>
<Badge uppercase>In Progress</Badge>`,
  badgeButton: `<Badge
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
  remove @bugen
</Badge>`,
  experimental: `<Badge.Experimental />`,
  sourceDefault: `<Badge>In Progress</Badge>`,
  currentDefault: `<Badge appearance="outline" uppercase>In Progress</Badge>`,
  sourceTone: `<Badge tone="lime">Experimental</Badge>`,
  currentTone: `<Badge variant="success">Experimental</Badge>`,
  sourceUppercaseFalse: `<Badge uppercase={false}>task #42 @bugen</Badge>`,
  currentUppercaseFalse: `<Badge appearance="outline">task #42 @bugen</Badge>`,
  sourceBadgeButton: `<BadgeButton tone="cyan">Filter</BadgeButton>`,
  currentBadgeButton: `<Badge render={<button type="button" aria-label="Filter" />} variant="information">Filter</Badge>`,
  sourceExperimental: `<ExperimentalBadge />`,
  currentExperimental: `<Badge.Experimental />`,
  migrationToneToVariant: `// Source
<Badge tone="white">Default</Badge>
<Badge tone="yellow">In Progress</Badge>
<Badge tone="cyan">Open</Badge>
<Badge tone="stone">Saved</Badge>
<Badge tone="pink">New</Badge>
<Badge tone="lime">Experimental</Badge>
<Badge tone="red">Error</Badge>

// Current
<Badge appearance="outline" uppercase>Default</Badge>
<Badge variant="primary" uppercase>In Progress</Badge>
<Badge variant="information" uppercase>Open</Badge>
<Badge variant="muted" uppercase>Saved</Badge>
<Badge variant="accent" uppercase>New</Badge>
<Badge variant="success" uppercase>Experimental</Badge>
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

export const Route = createFileRoute("/components/badge")({
  component: BadgeDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function BadgeDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Badge"
      description="A small semantic label chip for status, category, and metadata."
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
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          {VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </Example>
      </DocSection>

      <DocSection id="appearance" title="Appearance">
        <Example html={code.appearance}>
          {APPEARANCES.map((appearance) => (
            <div key={appearance} className="flex w-full flex-wrap items-center gap-2">
              {VARIANTS.map((variant) => (
                <Badge key={variant} appearance={appearance} variant={variant}>
                  {variant}
                </Badge>
              ))}
            </div>
          ))}
        </Example>
      </DocSection>

      <DocSection id="uppercase" title="Uppercase">
        <Example html={code.uppercase}>
          <Badge>task #42 @bugen</Badge>
          <Badge uppercase>In Progress</Badge>
        </Example>
      </DocSection>

      <DocSection id="badge-button" title="BadgeButton migration">
        <Example html={code.badgeButton}>
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
            remove @bugen
            <X className="size-3" />
          </Badge>
        </Example>
      </DocSection>

      <DocSection id="experimental" title="Experimental">
        <Example html={code.experimental}>
          <Badge.Experimental />
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
              source: <LegacyBadge>In Progress</LegacyBadge>,
              current: (
                <Badge appearance="outline" uppercase>
                  In Progress
                </Badge>
              ),
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Tone to variant",
              status: "match",
              source: <LegacyBadge tone="lime">Experimental</LegacyBadge>,
              current: <Badge variant="success">Experimental</Badge>,
              sourceCode: code.sourceTone,
              currentCode: code.currentTone,
            },
            {
              label: "Default preserved casing",
              status: "match",
              source: <LegacyBadge uppercase={false}>task #42 @bugen</LegacyBadge>,
              current: <Badge appearance="outline">task #42 @bugen</Badge>,
              sourceCode: code.sourceUppercaseFalse,
              currentCode: code.currentUppercaseFalse,
            },
            {
              label: "BadgeButton migration",
              status: "difference",
              source: <LegacyBadgeButton tone="cyan">Filter</LegacyBadgeButton>,
              current: (
                <Badge render={<button type="button" aria-label="Filter" />} variant="information">
                  Filter
                </Badge>
              ),
              sourceCode: code.sourceBadgeButton,
              currentCode: code.currentBadgeButton,
            },
            {
              label: "Experimental preset",
              status: "match",
              source: <LegacyExperimentalBadge />,
              current: <Badge.Experimental />,
              sourceCode: code.sourceExperimental,
              currentCode: code.currentExperimental,
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Tone to Variant</h3>
            <CodeBlock html={code.migrationToneToVariant} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Casing</h3>
            <CodeBlock html={code.migrationCasing} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Lavender</h3>
            <CodeBlock html={code.migrationLavender} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
