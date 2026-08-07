import { createFileRoute } from "@tanstack/react-router";
import { InlineCode, Input, Label, LabelAsterisk, LabelOptional, LabelSub } from "raft-ui";
import { Info } from "lucide-react";

import { DocNote } from "#/components/doc-note.tsx";
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

const SNIPPETS = {
  preview: `import { Label } from "raft-ui";

<Label htmlFor="email">Email address</Label>`,
  anatomy: `import { Label, LabelAsterisk } from "raft-ui";

<Label>
  <LabelAsterisk />
</Label>`,
  markers: `<Label htmlFor="email">
  Email address
  <LabelAsterisk />
</Label>

<Label htmlFor="middle-name">
  Middle name
  <LabelOptional />
</Label>

<Label htmlFor="project-visibility">
  Project URL
  <LabelSub>public</LabelSub>
</Label>

<Label htmlFor="project-url">
  Project URL
  <Info aria-hidden className="size-3.5 text-foreground-strong/40" />
</Label>`,
  states: `<Label htmlFor="email">Email address</Label>

<Label htmlFor="email" disabled>
  Email address
  <LabelAsterisk />
</Label>`,
} as const;

const LABEL_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description:
      "Visible label content. Compose LabelAsterisk, LabelOptional, or LabelSub inside it.",
  },
  {
    name: "htmlFor",
    type: "string",
    description: "Native label association with the matching control id.",
  },
  {
    name: "size",
    type: '"sm" | "md"',
    default: '"md"',
    description: "Label text size. Use sm for dense settings rows.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description:
      "Sets aria-disabled and disabled styling on the label. It does not disable the control.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Replace the rendered element when composing into a custom form pattern.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"label">',
    description: "Native label attributes.",
  },
];

const ASTERISK_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    default: '"*"',
    description: "Marker content for required fields.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"span">',
    description: "Native span attributes for rare custom markers or tests.",
  },
];

const OPTIONAL_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    default: '"(optional)"',
    description: "Marker content shown after the label.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"span">',
    description: "Native span attributes for rare custom markers or tests.",
  },
];

const SUB_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description: "Custom secondary copy shown after the label.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"span">',
    description: "Native span attributes for rare custom markers or tests.",
  },
];

export const Route = createFileRoute("/components/label")({
  component: LabelDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
      },
    }),
});

function LabelDoc() {
  const code = Route.useLoaderData();
  return (
    <DocPage
      title="Label"
      description="A form label primitive with required and secondary text markers."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <div className="grid w-80 gap-2">
              <Label htmlFor="label-preview-email">Email address</Label>
              <Input id="label-preview-email" placeholder="you@example.com" />
            </div>
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="markers" title="Markers">
            <DocNote>
              Prefer explicit composition over boolean label props. Use{" "}
              <InlineCode>LabelAsterisk</InlineCode> for required fields,{" "}
              <InlineCode>LabelOptional</InlineCode> for optional markers, and{" "}
              <InlineCode>LabelSub</InlineCode> for custom secondary copy.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="grid w-80 gap-4">
                  <Label htmlFor="label-required-email">
                    Email address
                    <LabelAsterisk />
                  </Label>
                  <Label htmlFor="label-optional-middle-name">
                    Middle name
                    <LabelOptional />
                  </Label>
                  <Label htmlFor="label-secondary-project-url">
                    Project URL
                    <LabelSub>public</LabelSub>
                  </Label>
                  <Label htmlFor="label-project-url">
                    Project URL
                    <Info aria-hidden className="size-3.5 text-foreground-strong/40" />
                  </Label>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.markers} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <DocNote>
              Disabled label styling is only visual and semantic. Disable the actual form control
              separately.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="grid w-80 gap-4">
                  <Label htmlFor="label-state-email">Email address</Label>
                  <Label htmlFor="label-state-disabled-email" disabled>
                    Email address
                    <LabelAsterisk />
                  </Label>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Label">
            <PropsTable rows={LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-asterisk" title="LabelAsterisk">
            <PropsTable rows={ASTERISK_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-optional" title="LabelOptional">
            <PropsTable rows={OPTIONAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sub" title="LabelSub">
            <PropsTable rows={SUB_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
