import { createFileRoute } from "@tanstack/react-router";
import { Button, Input, Label } from "@slock/ui";
import { IconCircleInfoFill18 } from "nucleo-ui-fill-18";
import { IconGridCircleOutline18 } from "nucleo-ui-outline-18";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyFormField from "../../../../../packages/ui/src/legacy/FormField.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "markers", title: "Markers" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  preview: `import { Label } from "@slock/ui";

<Label htmlFor="email">Email address</Label>`,
  anatomy: `import { Label } from "@slock/ui";

<Label htmlFor="email">
  Email address
  <Label.Asterisk />
</Label>`,
  markers: `<Label htmlFor="email">
  Email address
  <Label.Asterisk />
</Label>

<Label htmlFor="middle-name">
  Middle name
  <Label.Sub>(optional)</Label.Sub>
</Label>

<Label htmlFor="project-url">
  Project URL
  <IconCircleInfoFill18 aria-hidden className="size-3.5 text-foreground/40" />
</Label>`,
  states: `<Label htmlFor="email">Email address</Label>

<Label htmlFor="email" disabled>
  Email address
  <Label.Asterisk />
</Label>`,
  migrationInline: `// Source
<label className="mb-1 block text-sm font-bold text-black" htmlFor="email">
  Email
</label>

// Current
<Label htmlFor="email">Email</Label>`,
  migrationFormField: `// Source
<FormField label="Email" htmlFor="email" required>
  <input id="email" className="input-brutal" />
</FormField>

// Current
<Label htmlFor="email">
  Email
  <Label.Asterisk />
</Label>
<Input id="email" />`,
} as const;

const LABEL_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description: "Visible label content. Compose Label.Asterisk or Label.Sub inside it.",
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

const MARKER_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    default: '"*" for Label.Asterisk',
    description: "Marker content. Label.Sub requires explicit children such as (optional).",
  },
  {
    name: "...props",
    type: 'ComponentProps<"span">',
    description: "Native span attributes for rare custom markers or tests.",
  },
];

export const Route = createFileRoute("/components/label")({
  component: LabelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function LabelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Label"
      description="A form label primitive with required and secondary text markers."
      headerAction={
        <Button
          render={<a href="/components/label/matrix" target="_blank" rel="noreferrer" />}
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
        <Example html={code.preview}>
          <div className="grid w-80 gap-2">
            <Label htmlFor="label-preview-email">Email address</Label>
            <Input id="label-preview-email" placeholder="you@example.com" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Label.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="markers" title="Markers">
        <div className="space-y-4">
          <DocNote>
            Prefer explicit composition over boolean label props. Use Label.Asterisk for required
            fields and Label.Sub for secondary text such as optional.
          </DocNote>
          <Example html={code.markers}>
            <div className="grid w-80 gap-4">
              <Label htmlFor="label-required-email">
                Email address
                <Label.Asterisk />
              </Label>
              <Label htmlFor="label-optional-middle-name">
                Middle name
                <Label.Sub>(optional)</Label.Sub>
              </Label>
              <Label htmlFor="label-project-url">
                Project URL
                <IconCircleInfoFill18 aria-hidden className="size-3.5 text-foreground/40" />
              </Label>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="states" title="States">
        <div className="space-y-4">
          <DocNote>
            Disabled label styling is only visual and semantic. Disable the actual form control
            separately.
          </DocNote>
          <Example html={code.states}>
            <div className="grid w-80 gap-4">
              <Label htmlFor="label-state-email">Email address</Label>
              <Label htmlFor="label-state-disabled-email" disabled>
                Email address
                <Label.Asterisk />
              </Label>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Label</h3>
            <PropsTable rows={LABEL_PROPS} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Label.Asterisk / Label.Sub</h3>
            <PropsTable rows={MARKER_PROPS} />
          </div>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Inline form label",
              status: "match",
              note: "Source repeated native label class strings around inputs. Current extracts the form label text treatment while keeping native label semantics.",
              source: (
                <label
                  className="mb-1 block text-sm font-bold text-black"
                  htmlFor="source-inline-email"
                >
                  Email
                </label>
              ),
              brutal: <Label htmlFor="brutal-inline-email">Email</Label>,
              elegant: <Label htmlFor="elegant-inline-email">Email</Label>,
              elegantDark: <Label htmlFor="dark-inline-email">Email</Label>,
            },
            {
              label: "Required marker",
              status: "difference",
              note: "Source exposed required as a FormField prop. Current keeps the label primitive composable with an explicit asterisk part.",
              source: (
                <LegacyFormField label="Email" htmlFor="source-required-email" required>
                  <input id="source-required-email" className="input-brutal w-64" />
                </LegacyFormField>
              ),
              brutal: (
                <Label htmlFor="brutal-required-email">
                  Email
                  <Label.Asterisk />
                </Label>
              ),
              elegant: (
                <Label htmlFor="elegant-required-email">
                  Email
                  <Label.Asterisk />
                </Label>
              ),
              elegantDark: (
                <Label htmlFor="dark-required-email">
                  Email
                  <Label.Asterisk />
                </Label>
              ),
            },
            {
              label: "Optional marker",
              status: "difference",
              note: "Source exposed optional as a FormField prop. Current uses Label.Sub so secondary label copy stays explicit.",
              source: (
                <LegacyFormField label="Middle name" htmlFor="source-optional-name" optional>
                  <input id="source-optional-name" className="input-brutal w-64" />
                </LegacyFormField>
              ),
              brutal: (
                <Label htmlFor="brutal-optional-name">
                  Middle name
                  <Label.Sub>(optional)</Label.Sub>
                </Label>
              ),
              elegant: (
                <Label htmlFor="elegant-optional-name">
                  Middle name
                  <Label.Sub>(optional)</Label.Sub>
                </Label>
              ),
              elegantDark: (
                <Label htmlFor="dark-optional-name">
                  Middle name
                  <Label.Sub>(optional)</Label.Sub>
                </Label>
              ),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
