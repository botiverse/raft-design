import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Field, FieldDescription, FieldLabel, Switch, type SwitchProps } from "raft-ui";

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

const SIZES = ["sm", "md"] as const;

const SNIPPETS = {
  preview: `<Switch size="sm" defaultChecked aria-label="Desktop notifications" />`,
  anatomy: `<Switch />`,
  sizes: `<Switch size="sm" defaultChecked aria-label="Small switch" />
<Switch size="md" defaultChecked aria-label="Medium switch" />`,
  states: `<Switch aria-label="Off" />
<Switch defaultChecked aria-label="On" />
<Switch disabled aria-label="Disabled off" />
<Switch defaultChecked disabled aria-label="Disabled on" />`,
  field: `<Field className="max-w-sm">
  <div className="flex items-center justify-between gap-4">
    <div className="grid gap-1">
      <FieldLabel htmlFor="notifications">Desktop notifications</FieldLabel>
      <FieldDescription>Show alerts when new messages arrive.</FieldDescription>
    </div>
    <Switch id="notifications" defaultChecked aria-label="Desktop notifications" />
  </div>
</Field>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "size",
    type: SIZES.map((size) => `"${size}"`).join(" | "),
    default: '"sm"',
    description: "Visual size of the switch. Use sm in dense menus and md in form rows.",
  },
  {
    name: "checked",
    type: "boolean",
    description: "Controlled checked state. Pair with onCheckedChange.",
  },
  {
    name: "defaultChecked",
    type: "boolean",
    default: "false",
    description: "Initial checked state for uncontrolled usage.",
  },
  {
    name: "onCheckedChange",
    type: "(checked: boolean, details) => void",
    description: "Called when the switch is toggled.",
  },
  {
    name: "disabled / readOnly / required",
    type: "boolean",
    description: "Interaction and form-validation state from Base UI Switch.",
  },
  {
    name: "SwitchThumb",
    type: "Base UI Switch.Thumb.Props",
    description: "Optional thumb slot for custom visuals. Switch renders it by default.",
  },
  {
    name: "...props",
    type: "Base UI Switch.Root.Props",
    description: "Form props (name, value, uncheckedValue, form) plus Base UI render props.",
  },
];

export const Route = createFileRoute("/components/switch")({
  component: SwitchDoc,
  loader: () =>
    highlightSnippets({
      data: SNIPPETS,
    }),
});

function SwitchPreview({
  code,
  collapsedCode,
}: {
  code: ReturnType<typeof Route.useLoaderData>["preview"];
  collapsedCode?: ReturnType<typeof Route.useLoaderData>["previewBody"];
}) {
  const [size, setSize] = useState<NonNullable<SwitchProps["size"]>>("sm");
  const [disabled, setDisabled] = useState(false);

  return (
    <Preview>
      <Preview.Canvas>
        <Switch size={size} defaultChecked disabled={disabled} aria-label="Desktop notifications" />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Size" htmlFor="switch-preview-size">
          <Preview.Select
            id="switch-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={(value) => setSize(value as NonNullable<SwitchProps["size"]>)}
          />
        </Preview.Control>
        <Preview.Control label="Disabled" htmlFor="switch-preview-disabled">
          <Preview.Checkbox
            id="switch-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

function SwitchDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Switch"
      description="A binary setting control for immediate on/off preferences."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SwitchPreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="sizes" title="Sizes">
            <Preview>
              <Preview.Canvas>
                <div className="flex items-center gap-4">
                  <Switch size="sm" defaultChecked aria-label="Small switch" />
                  <Switch size="md" defaultChecked aria-label="Medium switch" />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.sizes} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="states" title="States">
            <Preview>
              <Preview.Canvas>
                <div className="flex items-center gap-4">
                  <Switch aria-label="Off" />
                  <Switch defaultChecked aria-label="On" />
                  <Switch disabled aria-label="Disabled off" />
                  <Switch defaultChecked disabled aria-label="Disabled on" />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="field" title="Field">
            <Preview>
              <Preview.Canvas>
                <Field className="max-w-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="grid gap-1">
                      <FieldLabel htmlFor="notifications">Desktop notifications</FieldLabel>
                      <FieldDescription>Show alerts when new messages arrive.</FieldDescription>
                    </div>
                    <Switch id="notifications" defaultChecked aria-label="Desktop notifications" />
                  </div>
                </Field>
              </Preview.Canvas>
              <Preview.Code html={code.field} />
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
