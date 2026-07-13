import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Spinner, Status, Text, type BadgeProps } from "raft-ui";
import { CircleCheck, Clock, Grid2X2, X } from "lucide-react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

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
  anatomy: `<Badge />`,
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
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
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="variants" title="Variants" showThemeSwitcher>
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

      <DocSection id="appearance" title="Appearance" showThemeSwitcher>
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

      <DocSection id="casing" title="Casing" showThemeSwitcher>
        <Example html={code.casing}>
          <Badge>task #42 @bugen</Badge>
          <Badge uppercase>In Progress</Badge>
        </Example>
      </DocSection>

      <DocSection id="icons" title="Icons" showThemeSwitcher>
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

      <DocSection id="spinner" title="Spinner" showThemeSwitcher>
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

      <DocSection id="composition" title="Composition" showThemeSwitcher>
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
    </DocPage>
  );
}
