import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  InlineCode,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Textarea,
  TextareaCounter,
  TextareaGroup,
} from "@raft/ui";
import { IconGridCircleOutline18 } from "nucleo-ui-outline-18";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
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
import fieldCompactLabelCompositionSource from "#/compositions/field/compact-label-composition.tsx?raw";
import fieldErrorCompositionSource from "#/compositions/field/error-composition.tsx?raw";
import fieldLabelControlHelperCompositionSource from "#/compositions/field/label-control-helper-composition.tsx?raw";
import {
  FIELD_SOURCE_COMPARISON_COMPOSITION,
  FIELD_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/field-source-comparison.tsx";
import LegacyFormField from "../../../../../packages/ui/src/legacy/FormField.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "structure", title: "Structure" },
  { id: "states", title: "States" },
  { id: "controls", title: "Controls" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const PREVIEW_TOP_CLASS = "!items-start !pt-16";

const SNIPPETS = {
  preview: `import { Field, FieldDescription, FieldError, FieldLabel, Input } from "@raft/ui";

<Field invalid>
  <FieldLabel htmlFor="email" required>Email</FieldLabel>
  <Input id="email" type="email" aria-invalid defaultValue="oops" />
  <FieldError match>Email is required.</FieldError>
</Field>`,
  anatomy: `import { Field, FieldDescription, FieldLabel, Input } from "@raft/ui";

<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" placeholder="you@example.com" />
  <FieldDescription>Use your work email.</FieldDescription>
</Field>`,
  structure: `<Field>
  <FieldLabel htmlFor="workspace" required>Workspace</FieldLabel>
  <Input id="workspace" defaultValue="raft-design" />
  <FieldDescription>Visible to everyone in this server.</FieldDescription>
</Field>

<Field>
  <FieldLabel htmlFor="middle-name" optional>Middle name</FieldLabel>
  <Input id="middle-name" placeholder="Alex" />
</Field>`,
  states: `<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" placeholder="you@example.com" />
  <FieldDescription>Use your work email.</FieldDescription>
</Field>

<Field invalid>
  <FieldLabel htmlFor="invalid-email">Email</FieldLabel>
  <Input id="invalid-email" aria-invalid defaultValue="oops" />
  <FieldError match>Email is required.</FieldError>
</Field>

<Field disabled>
  <FieldLabel htmlFor="disabled-email">Email</FieldLabel>
  <Input id="disabled-email" disabled placeholder="Disabled" />
  <FieldDescription>This field is locked.</FieldDescription>
</Field>`,
  controls: `import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Textarea,
  TextareaCounter,
  TextareaGroup,
} from "@raft/ui";

<div className="grid gap-5 sm:grid-cols-2">
  <Field>
    <FieldLabel htmlFor="project-name" required>Project name</FieldLabel>
    <Input id="project-name" defaultValue="Raft" />
    <FieldDescription>Visible in the project switcher.</FieldDescription>
  </Field>

  <Field invalid>
    <FieldLabel htmlFor="project-slug">Slug</FieldLabel>
    <InputGroup>
      <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
      <InputGroupInput id="project-slug" aria-invalid defaultValue="Draft Space" />
    </InputGroup>
    <FieldError match>Use lowercase letters, numbers, and hyphens.</FieldError>
  </Field>

  <Field className="sm:col-span-2">
    <FieldLabel htmlFor="release-notes" optional>Release notes</FieldLabel>
    <TextareaGroup>
      <Textarea id="release-notes" rows={4} placeholder="Write a note..." />
      <TextareaCounter value="" limit={160} />
    </TextareaGroup>
    <FieldDescription>Markdown is supported.</FieldDescription>
  </Field>

  <Field disabled>
    <FieldLabel htmlFor="owner">Owner</FieldLabel>
    <Input id="owner" disabled defaultValue="Design systems" />
    <FieldDescription>Managed by workspace settings.</FieldDescription>
  </Field>

  <Field>
    <FieldItem>
      <Checkbox id="notify" defaultChecked />
      <div>
        <FieldLabel htmlFor="notify">Notify teammates</FieldLabel>
        <FieldDescription>Send an update when this changes.</FieldDescription>
      </div>
    </FieldItem>
  </Field>

  <div className="flex justify-end gap-2 sm:col-span-2">
    <Button variant="outline">Cancel</Button>
    <Button>Save changes</Button>
  </div>
</div>`,
  migrationFormField: `// Source
<FormField label="Email" htmlFor="email" required hint="Use your work email.">
  <input id="email" className="input-brutal" />
</FormField>

// Current
<Field>
  <FieldLabel htmlFor="email" required>Email</FieldLabel>
  <Input id="email" type="email" />
  <FieldDescription>Use your work email.</FieldDescription>
</Field>`,
  migrationError: `// Source
<FormField label="Email" htmlFor="email" error="Email is required.">
  <input id="email" className="input-brutal" aria-invalid />
</FormField>

// Current
<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldError match>Email is required.</FieldError>
</Field>`,
  sourceField: `<FormField label="Email" htmlFor="source-email" required hint="Use your work email.">
  <input id="source-email" className="input-brutal" />
</FormField>`,
  currentField: `<Field>
  <FieldLabel htmlFor="email" required>Email</FieldLabel>
  <Input id="email" type="email" />
  <FieldDescription>Use your work email.</FieldDescription>
</Field>`,
  sourceError: `<FormField label="Email" htmlFor="source-email-error" error="Email is required.">
  <input id="source-email-error" className="input-brutal" aria-invalid />
</FormField>`,
  currentError: `<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldError match>Email is required.</FieldError>
</Field>`,
  sourceCompact: `<FormField label="Display name" htmlFor="source-display-name" size="compact">
  <input id="source-display-name" className="input-brutal" />
</FormField>`,
  currentCompact: `<Field>
  <FieldLabel htmlFor="display-name" size="sm">Display name</FieldLabel>
  <Input id="display-name" />
</Field>`,
} as const;

type PlaygroundValues = {
  invalid: boolean;
  required: boolean;
  optional: boolean;
  label: string;
  description: string;
};

const FIELD_PROPS: readonly PropRow[] = [
  {
    name: "Field",
    type: "Base UI Field.Root",
    description:
      "Stacks label, control, helper text, and error. Pass invalid for externally controlled errors.",
  },
  {
    name: "FieldLabel",
    type: "Base UI Field.Label",
    description: "Persistent field label. Supports required, optional, and size for dense labels.",
  },
  {
    name: "FieldDescription",
    type: "Base UI Field.Description",
    description: "Helper text below the control. It participates in aria-describedby.",
  },
  {
    name: "FieldError",
    type: "Base UI Field.Error",
    description:
      "Inline validation message. Use match for Base UI validity states, or match={true} for external state.",
  },
  {
    name: "FieldItem",
    type: "Base UI Field.Item",
    description: "Horizontal grouping for checkbox, radio, or switch rows inside a field.",
  },
  {
    name: "FieldControl",
    type: "Base UI Field.Control",
    description: "Optional native control primitive when you do not need Input or Textarea.",
  },
  {
    name: "FieldValidity",
    type: "Base UI Field.Validity",
    description: "Render-prop access to the current Base UI field validity state.",
  },
];

const FieldCurrent = FIELD_SOURCE_COMPARISON_COMPOSITION;

const FIELD_COMPOSITION_RAW_SOURCES = {
  CompactLabel: fieldCompactLabelCompositionSource,
  Error: fieldErrorCompositionSource,
  LabelControlHelper: fieldLabelControlHelperCompositionSource,
} as const;

const FIELD_COMPOSITION_SOURCES = createCompositionSourceMap(FIELD_COMPOSITION_RAW_SOURCES);

const FIELD_COMPOSITION_SNIPPET_IDS = {
  CompactLabel: "fieldCompactLabelComposition",
  Error: "fieldErrorComposition",
  LabelControlHelper: "fieldLabelControlHelperComposition",
} as const;

type FieldCompositionKey = keyof typeof FIELD_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/field")({
  component: FieldDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(FIELD_COMPOSITION_SOURCES, FIELD_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function FieldDoc() {
  const code = Route.useLoaderData();
  const fieldComposition = (key: FieldCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: FIELD_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: FIELD_COMPOSITION_SNIPPET_IDS,
      sources: FIELD_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Field"
      description="A composable form field pattern for labels, controls, descriptions, and errors."
      headerAction={
        <Button
          render={<a href="/components/field/matrix" target="_blank" rel="noreferrer" />}
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
            invalid: false,
            required: true,
            optional: false,
            label: "Email",
            description: "Use your work email.",
          }}
          controls={[
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "required", label: "Required", type: "boolean" },
            { name: "optional", label: "Optional", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
            { name: "description", label: "Description", type: "text" },
          ]}
          render={(values) => {
            const markerProps = values.required
              ? ({ required: true } as const)
              : values.optional
                ? ({ optional: true } as const)
                : {};

            return (
              <Field className="w-80" invalid={values.invalid}>
                <FieldLabel htmlFor="field-preview-email" {...markerProps}>
                  {values.label}
                </FieldLabel>
                <Input
                  id="field-preview-email"
                  type="email"
                  aria-invalid={values.invalid || undefined}
                  defaultValue={values.invalid ? "oops" : undefined}
                  placeholder="you@example.com"
                />
                {values.invalid ? (
                  <FieldError match>Email is required.</FieldError>
                ) : values.description ? (
                  <FieldDescription>{values.description}</FieldDescription>
                ) : null}
              </Field>
            );
          }}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Field.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="structure" title="Structure">
        <div className="space-y-4">
          <DocNote>
            Field owns the form copy structure. Keep the control itself narrow: use{" "}
            <Link to="/components/input">Input</Link>,{" "}
            <Link to="/components/textarea">Textarea</Link>, or another control inside it.
          </DocNote>
          <Example html={code.structure} previewClassName={PREVIEW_TOP_CLASS}>
            <div className="grid w-80 gap-6">
              <Field>
                <FieldLabel htmlFor="field-workspace" required>
                  Workspace
                </FieldLabel>
                <Input id="field-workspace" defaultValue="raft-design" />
                <FieldDescription>Visible to everyone in this server.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="field-middle-name" optional>
                  Middle name
                </FieldLabel>
                <Input id="field-middle-name" placeholder="Alex" />
              </Field>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states} previewClassName={PREVIEW_TOP_CLASS}>
          <div className="grid w-80 gap-6">
            <Field>
              <FieldLabel htmlFor="field-state-email">Email</FieldLabel>
              <Input id="field-state-email" placeholder="you@example.com" />
              <FieldDescription>Use your work email.</FieldDescription>
            </Field>
            <Field invalid>
              <FieldLabel htmlFor="field-state-invalid-email">Email</FieldLabel>
              <Input id="field-state-invalid-email" aria-invalid defaultValue="oops" />
              <FieldError match>Email is required.</FieldError>
            </Field>
            <Field disabled>
              <FieldLabel htmlFor="field-state-disabled-email">Email</FieldLabel>
              <Input id="field-state-disabled-email" disabled placeholder="Disabled" />
              <FieldDescription>This field is locked.</FieldDescription>
            </Field>
          </div>
        </Example>
      </DocSection>

      <DocSection id="controls" title="Controls">
        <div className="space-y-4">
          <DocNote>
            Use <InlineCode>FieldItem</InlineCode> for choice controls where the label and helper
            copy should sit beside the control instead of above it.
          </DocNote>
          <Example html={code.controls} previewClassName={PREVIEW_TOP_CLASS}>
            <div className="grid w-[min(40rem,100%)] gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="field-project-name" required>
                  Project name
                </FieldLabel>
                <Input id="field-project-name" defaultValue="Raft" />
                <FieldDescription>Visible in the project switcher.</FieldDescription>
              </Field>
              <Field invalid>
                <FieldLabel htmlFor="field-project-slug">Slug</FieldLabel>
                <InputGroup>
                  <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
                  <InputGroupInput
                    id="field-project-slug"
                    aria-invalid
                    defaultValue="Draft Space"
                  />
                </InputGroup>
                <FieldError match>Use lowercase letters, numbers, and hyphens.</FieldError>
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="field-release-notes" optional>
                  Release notes
                </FieldLabel>
                <TextareaGroup>
                  <Textarea id="field-release-notes" rows={4} placeholder="Write a note..." />
                  <TextareaCounter value="" limit={160} />
                </TextareaGroup>
                <FieldDescription>Markdown is supported.</FieldDescription>
              </Field>
              <Field disabled>
                <FieldLabel htmlFor="field-owner">Owner</FieldLabel>
                <Input id="field-owner" disabled defaultValue="Design systems" />
                <FieldDescription>Managed by workspace settings.</FieldDescription>
              </Field>
              <Field>
                <FieldItem>
                  <Checkbox id="field-notify" defaultChecked />
                  <div>
                    <FieldLabel htmlFor="field-notify">Notify teammates</FieldLabel>
                    <FieldDescription>Send an update when this changes.</FieldDescription>
                  </div>
                </FieldItem>
              </Field>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={FIELD_PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Label, control, helper",
              status: "difference",
              note: "Source FormField bundled label, control, and hint into one prop wrapper. Current keeps Field parts explicit.",
              source: (
                <LegacyFormField
                  label="Email"
                  htmlFor="source-field-email"
                  required
                  hint="Use your work email."
                >
                  <input id="source-field-email" aria-label="Email" className="input-brutal w-72" />
                </LegacyFormField>
              ),
              brutal: <FieldCurrent.LabelControlHelper />,
              elegant: <FieldCurrent.LabelControlHelper />,
              elegantDark: <FieldCurrent.LabelControlHelper />,
              ...fieldComposition("LabelControlHelper"),
            },
            {
              label: "Error",
              status: "difference",
              note: "Source error prop rendered a fixed message. Current marks the Field invalid and lets FieldError own the inline message.",
              source: (
                <LegacyFormField
                  label="Email"
                  htmlFor="source-field-error-email"
                  error="Email is required."
                >
                  <input
                    id="source-field-error-email"
                    aria-label="Email"
                    aria-invalid
                    className="input-brutal w-72 border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
                  />
                </LegacyFormField>
              ),
              brutal: <FieldCurrent.Error />,
              elegant: <FieldCurrent.Error />,
              elegantDark: <FieldCurrent.Error />,
              ...fieldComposition("Error"),
            },
            {
              label: "Compact label",
              status: "difference",
              note: 'Source used size="compact". Current keeps the Field wrapper unchanged and moves density to FieldLabel size.',
              source: (
                <LegacyFormField label="Display name" htmlFor="source-display-name" size="compact">
                  <input
                    id="source-display-name"
                    aria-label="Display name"
                    className="input-brutal w-72"
                  />
                </LegacyFormField>
              ),
              brutal: <FieldCurrent.CompactLabel />,
              elegant: <FieldCurrent.CompactLabel />,
              elegantDark: <FieldCurrent.CompactLabel />,
              ...fieldComposition("CompactLabel"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
