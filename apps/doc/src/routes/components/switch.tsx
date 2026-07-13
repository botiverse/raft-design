import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldDescription, FieldLabel, Switch, type SwitchProps } from "raft-ui";

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
  { id: "sizes", title: "Sizes" },
  { id: "states", title: "States" },
  { id: "field", title: "Field" },
  { id: "api", title: "API" },
] as const;

const SIZES = ["sm", "md"] as const;

const SNIPPETS = {
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

type PlaygroundValues = {
  size: NonNullable<SwitchProps["size"]>;
  disabled: boolean;
};

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

function SwitchDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Switch"
      description="A binary setting control for immediate on/off preferences."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            size: "sm",
            disabled: false,
          }}
          controls={[
            { name: "size", label: "Size", type: "select", options: SIZES },
            { name: "disabled", label: "Disabled", type: "boolean" },
          ]}
          render={(values) => (
            <Switch
              size={values.size}
              defaultChecked
              disabled={values.disabled}
              aria-label="Desktop notifications"
            />
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

      <DocSection id="sizes" title="Sizes" showThemeSwitcher>
        <Example html={code.sizes}>
          <div className="flex items-center gap-4">
            <Switch size="sm" defaultChecked aria-label="Small switch" />
            <Switch size="md" defaultChecked aria-label="Medium switch" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="states" title="States" showThemeSwitcher>
        <Example html={code.states}>
          <div className="flex items-center gap-4">
            <Switch aria-label="Off" />
            <Switch defaultChecked aria-label="On" />
            <Switch disabled aria-label="Disabled off" />
            <Switch defaultChecked disabled aria-label="Disabled on" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="field" title="Field" showThemeSwitcher>
        <Example html={code.field}>
          <Field className="max-w-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-1">
                <FieldLabel htmlFor="notifications">Desktop notifications</FieldLabel>
                <FieldDescription>Show alerts when new messages arrive.</FieldDescription>
              </div>
              <Switch id="notifications" defaultChecked aria-label="Desktop notifications" />
            </div>
          </Field>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
