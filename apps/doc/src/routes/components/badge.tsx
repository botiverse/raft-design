import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Spinner, Status, Text, type BadgeProps } from "raft-ui";
import { CircleCheck, Clock, X } from "lucide-react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
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
  preview: `<Badge appearance="solid" variant="primary">In Progress</Badge>`,
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

function BadgePreview({
  code,
  collapsedCode,
}: {
  code: ReturnType<typeof Route.useLoaderData>["preview"];
  collapsedCode?: ReturnType<typeof Route.useLoaderData>["previewBody"];
}) {
  const [appearance, setAppearance] = useState<NonNullable<BadgeProps["appearance"]>>("solid");
  const [variant, setVariant] = useState<NonNullable<BadgeProps["variant"]>>("primary");
  const [uppercase, setUppercase] = useState(false);
  const [label, setLabel] = useState("In Progress");

  return (
    <Preview>
      <Preview.Canvas>
        <Badge appearance={appearance} variant={variant} uppercase={uppercase}>
          {label}
        </Badge>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Appearance" htmlFor="badge-preview-appearance">
          <Preview.Select
            id="badge-preview-appearance"
            label="Appearance"
            options={APPEARANCES}
            value={appearance}
            onValueChange={(value) => setAppearance(value as NonNullable<BadgeProps["appearance"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Variant" htmlFor="badge-preview-variant">
          <Preview.Select
            id="badge-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={(value) => setVariant(value as NonNullable<BadgeProps["variant"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Uppercase" htmlFor="badge-preview-uppercase">
          <Preview.Checkbox
            id="badge-preview-uppercase"
            label="Uppercase"
            checked={uppercase}
            onCheckedChange={setUppercase}
          />
        </Preview.Control>
        <Preview.Control label="Label" htmlFor="badge-preview-label">
          <Preview.Text
            id="badge-preview-label"
            label="Label"
            value={label}
            onValueChange={setLabel}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

function BadgeDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Badge"
      description="A small semantic label chip for status, category, and metadata."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <BadgePreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="appearance" title="Appearance">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.appearance} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="casing" title="Casing">
            <Preview>
              <Preview.Canvas>
                <Badge>task #42 @bugen</Badge>
                <Badge uppercase>In Progress</Badge>
              </Preview.Canvas>
              <Preview.Code html={code.casing} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="icons" title="Icons">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.icons} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="spinner" title="Spinner">
            <Preview>
              <Preview.Canvas>
                <Badge>
                  <Spinner data-icon="inline-start" />
                  Syncing
                </Badge>
                <Badge variant="primary">
                  <Spinner data-icon="inline-start" />
                  Loading
                </Badge>
              </Preview.Canvas>
              <Preview.Code html={code.spinner} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="composition" title="Composition">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.composition} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
