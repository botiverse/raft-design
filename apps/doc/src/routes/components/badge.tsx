import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Status, type BadgeProps } from "@slock/ui";
import { IconCircleCheckFill18 } from "nucleo-ui-fill-18";
import { IconGridCircleOutline18, IconXmarkOutline18 } from "nucleo-ui-outline-18";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
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
  { id: "casing", title: "Casing" },
  { id: "icons", title: "Icons" },
  { id: "composition", title: "Composition" },
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
  "danger",
] as const;

const APPEARANCES = ["solid", "soft", "outline"] as const;

const SNIPPETS = {
  anatomy: `import { Badge } from "@slock/ui";

<Badge variant="primary">In Progress</Badge>`,
  variants: `<Badge appearance="outline" uppercase>Default</Badge>
<Badge variant="primary" uppercase>Pending</Badge>
<Badge variant="information">Open</Badge>
<Badge variant="muted">Saved</Badge>
<Badge variant="accent">New</Badge>
<Badge variant="success">Live</Badge>
<Badge variant="danger">Failed</Badge>`,
  appearance: `<Badge appearance="solid" variant="primary">Solid</Badge>
<Badge appearance="soft" variant="primary">Soft</Badge>
<Badge appearance="outline" variant="primary">Outline</Badge>`,
  casing: `<Badge>task #42 @bugen</Badge>
<Badge uppercase>In Progress</Badge>`,
  icons: `import { Badge, Status } from "@slock/ui";
import { IconCircleCheckFill18 } from "nucleo-ui-fill-18";

<Badge variant="primary">
  <IconCircleCheckFill18 className="size-3" />
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
  composition: `import { Badge } from "@slock/ui";
import { IconXmarkOutline18 } from "nucleo-ui-outline-18";

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
  <IconXmarkOutline18 className="size-3" />
</Badge>`,
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

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

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
      headerAction={
        <Button
          render={<a href="/components/badge/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <IconGridCircleOutline18 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
      sectionDividers={false}
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
          showLineNumbers={false}
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
            <IconCircleCheckFill18 className="size-3" />
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

      <DocSection id="composition" title="Composition">
        <Example html={code.composition}>
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
            <IconXmarkOutline18 className="size-3" />
          </Badge>
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
              brutal: (
                <Badge appearance="outline" uppercase>
                  In Progress
                </Badge>
              ),
              elegant: (
                <Badge appearance="outline" uppercase>
                  In Progress
                </Badge>
              ),
              elegantDark: (
                <Badge appearance="outline" uppercase>
                  In Progress
                </Badge>
              ),
            },
            {
              label: "Primary",
              status: "match",
              source: <LegacyBadge tone="yellow">Pending</LegacyBadge>,
              brutal: <Badge variant="primary">Pending</Badge>,
              elegant: <Badge variant="primary">Pending</Badge>,
              elegantDark: <Badge variant="primary">Pending</Badge>,
            },
            {
              label: "Information",
              status: "match",
              source: <LegacyBadge tone="cyan">Open</LegacyBadge>,
              brutal: <Badge variant="information">Open</Badge>,
              elegant: <Badge variant="information">Open</Badge>,
              elegantDark: <Badge variant="information">Open</Badge>,
            },
            {
              label: "Muted",
              status: "match",
              source: <LegacyBadge tone="stone">Saved</LegacyBadge>,
              brutal: <Badge variant="muted">Saved</Badge>,
              elegant: <Badge variant="muted">Saved</Badge>,
              elegantDark: <Badge variant="muted">Saved</Badge>,
            },
            {
              label: "Accent",
              status: "match",
              source: <LegacyBadge tone="pink">New</LegacyBadge>,
              brutal: <Badge variant="accent">New</Badge>,
              elegant: <Badge variant="accent">New</Badge>,
              elegantDark: <Badge variant="accent">New</Badge>,
            },
            {
              label: "Success",
              status: "match",
              source: <LegacyBadge tone="lime">Live</LegacyBadge>,
              brutal: <Badge variant="success">Live</Badge>,
              elegant: <Badge variant="success">Live</Badge>,
              elegantDark: <Badge variant="success">Live</Badge>,
            },
            {
              label: "Danger",
              status: "match",
              source: <LegacyBadge tone="red">Failed</LegacyBadge>,
              brutal: <Badge variant="danger">Failed</Badge>,
              elegant: <Badge variant="danger">Failed</Badge>,
              elegantDark: <Badge variant="danger">Failed</Badge>,
            },
            {
              label: "Soft appearance",
              status: "new",
              source: <MissingSource />,
              brutal: (
                <Badge appearance="soft" variant="primary">
                  Pending
                </Badge>
              ),
              elegant: (
                <Badge appearance="soft" variant="primary">
                  Pending
                </Badge>
              ),
              elegantDark: (
                <Badge appearance="soft" variant="primary">
                  Pending
                </Badge>
              ),
            },
            {
              label: "Outline appearance",
              status: "new",
              source: <MissingSource />,
              brutal: (
                <Badge appearance="outline" variant="primary">
                  Pending
                </Badge>
              ),
              elegant: (
                <Badge appearance="outline" variant="primary">
                  Pending
                </Badge>
              ),
              elegantDark: (
                <Badge appearance="outline" variant="primary">
                  Pending
                </Badge>
              ),
            },
            {
              label: "Default preserved casing",
              status: "match",
              source: <LegacyBadge uppercase={false}>task #42 @bugen</LegacyBadge>,
              brutal: <Badge appearance="outline">task #42 @bugen</Badge>,
              elegant: <Badge appearance="outline">task #42 @bugen</Badge>,
              elegantDark: <Badge appearance="outline">task #42 @bugen</Badge>,
            },
            {
              label: "Button render",
              status: "difference",
              source: <LegacyBadgeButton tone="cyan">3 replies</LegacyBadgeButton>,
              brutal: (
                <Badge
                  render={<button type="button" aria-label="Open thread replies" />}
                  variant="information"
                >
                  3 replies
                </Badge>
              ),
              elegant: (
                <Badge
                  render={<button type="button" aria-label="Open thread replies" />}
                  variant="information"
                >
                  3 replies
                </Badge>
              ),
              elegantDark: (
                <Badge
                  render={<button type="button" aria-label="Open thread replies" />}
                  variant="information"
                >
                  3 replies
                </Badge>
              ),
            },
            {
              label: "Experimental preset",
              status: "match",
              source: <LegacyExperimentalBadge />,
              brutal: <Badge.Experimental />,
              elegant: <Badge.Experimental />,
              elegantDark: <Badge.Experimental />,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
