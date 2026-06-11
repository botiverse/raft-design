import { createFileRoute } from "@tanstack/react-router";
import { Badge, type BadgeProps } from "@slock/ui";
import { X } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
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
  currentUppercaseFalse: `<Badge>task #42 @bugen</Badge>`,
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
<Badge>task #42 @bugen</Badge>

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
      overview={
        <Differences from="Badge">
          <li>brutal styling reproduced through semantic variants and the uppercase axis</li>
          <li>
            source <code>BadgeButton</code> is no longer a standalone component; use{" "}
            <code>Badge</code> with <code>render</code> to render a button root
          </li>
          <li>
            the <code>ExperimentalBadge</code> helper is now the <code>Badge.Experimental</code>{" "}
            preset
          </li>
        </Differences>
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
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <div className="space-y-4">
          <Example html={code.variants}>
            {VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </Example>
          <Callout>
            The badge owns its background — callers pick a semantic variant, not a raw color. Use{" "}
            <code>className</code> only for local legacy escape hatches such as lavender identity
            tags.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="appearance" title="Appearance">
        <div className="space-y-4">
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
          <Callout>
            Use <code>appearance</code> for visual strength: <code>solid</code> is the default
            filled chip, <code>soft</code> is the lighter status surface, and <code>outline</code>{" "}
            is transparent with a semantic border.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="uppercase" title="Uppercase">
        <div className="space-y-4">
          <Example html={code.uppercase}>
            <Badge>task #42 @bugen</Badge>
            <Badge uppercase>In Progress</Badge>
          </Example>
          <Callout>
            The prop controls the paired casing recipe (<code>uppercase tracking-wide</code>) and
            defaults to <code>false</code>. Turn it on for compact labels; leave it off next to
            case-sensitive identifiers such as <code>@bugen</code>.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="badge-button" title="BadgeButton migration">
        <div className="space-y-4">
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
          <Callout>
            Source <code>BadgeButton</code> shared the exact same visual recipe as{" "}
            <code>Badge</code>; the only difference was rendering a <code>button</code> instead of a{" "}
            <code>span</code>. In this package, keep that as composition instead of a second
            component.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="experimental" title="Experimental">
        <div className="space-y-4">
          <Example html={code.experimental}>
            <Badge.Experimental />
          </Example>
          <Callout>
            <code>Badge.Experimental</code> is a fixed <code>success</code> + uppercase
            “Experimental” preset, so every experimental surface reads the same. It only takes
            positional props (className / span attributes); for any other chip use{" "}
            <code>Badge</code> directly.
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
              current: <Badge>task #42 @bugen</Badge>,
              sourceCode: code.sourceUppercaseFalse,
              currentCode: code.currentUppercaseFalse,
            },
            {
              label: "BadgeButton migration",
              status: "difference",
              note: "Source exported a separate BadgeButton that reused the same badge class. Current keeps one Badge component and renders the old button root through Base UI render composition.",
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
              note: 'Current keeps the source lime badge visual through variant="success" but moves the helper under Badge.Experimental instead of exporting a separate ExperimentalBadge component.',
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
            <p className="text-sm text-gray-500">
              Migrate brutal palette names to label semantics. Unlike Button, these variants
              describe status/category meaning, not action intent. Add <code>uppercase</code> when
              preserving the source default badge casing, and map source <code>white</code> badges
              to the default <code>outline</code> appearance. Source <code>orange</code> is not
              mapped because there is no current Badge scenario for it.
            </p>
            <CodeBlock html={code.migrationToneToVariant} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Casing</h3>
            <p className="text-sm text-gray-500">
              Source defaulted to uppercase. Current defaults to preserved casing and makes the old
              casing recipe explicit. For the old source default badge, keep that recipe on the
              default outline appearance.
            </p>
            <CodeBlock html={code.migrationCasing} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Lavender</h3>
            <p className="text-sm text-gray-500">
              Keep lavender as a palette-only identity/attachment tag until a real reusable Badge
              meaning appears.
            </p>
            <CodeBlock html={code.migrationLavender} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
