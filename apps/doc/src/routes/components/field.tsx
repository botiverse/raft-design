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
} from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { FieldCompactLabelContent } from "#/modules/field/compositions/compact-label.composition.tsx";
import fieldCompactLabelCompositionSource from "#/modules/field/compositions/compact-label.composition.tsx?raw";
import { FieldPlaygroundPreview } from "#/modules/field/field.preview.tsx";
import fieldPreviewCompositionSource from "#/modules/field/compositions/preview.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const PREVIEW_TOP_CLASS = "!items-start !pt-16";

const SNIPPETS = {
  anatomy: `import { Field, FieldDescription, FieldLabel, Input } from "raft-ui";

<Field>
  <FieldLabel />
  <Input />
  <FieldDescription />
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
  <Input id="invalid-email" data-invalid defaultValue="oops" />
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
} from "raft-ui";

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
      <InputGroupInput id="project-slug" data-invalid defaultValue="Draft Space" />
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
} as const;

const FIELD_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Field.Root",
    description:
      "Stacks label, control, helper text, and error. Pass invalid for externally controlled errors.",
  },
];

const FIELD_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Field.Label",
    description: "Persistent field label. Supports required, optional, and size for dense labels.",
  },
];

const FIELD_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Field.Description",
    description: "Helper text below the control. It participates in aria-describedby.",
  },
];

const FIELD_ERROR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Field.Error",
    description:
      "Inline validation message. Use match for Base UI validity states, or match={true} for external state.",
  },
];

const FIELD_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Field.Item",
    description: "Horizontal grouping for checkbox, radio, or switch rows inside a field.",
  },
];

const FIELD_CONTROL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Field.Control",
    description: "Optional native control primitive when you do not need Input or Textarea.",
  },
];

const FIELD_VALIDITY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Field.Validity",
    description: "Render-prop access to the current Base UI field validity state.",
  },
];

const FIELD_COMPOSITION_RAW_SOURCES = {
  Preview: fieldPreviewCompositionSource,
  CompactLabel: fieldCompactLabelCompositionSource,
} as const;

const FIELD_COMPOSITION_SOURCES = createCompositionSourceMap(FIELD_COMPOSITION_RAW_SOURCES);

const FIELD_COMPOSITION_SNIPPET_IDS = {
  Preview: "fieldPreviewComposition",
  CompactLabel: "fieldCompactLabelComposition",
} as const;

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
  return (
    <DocPage
      title="Field"
      description="A composable form field pattern for labels, controls, descriptions, and errors."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <FieldPlaygroundPreview code={code.fieldPreviewComposition} />
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
          <DocSubsection parentId="usage" id="structure" title="Structure">
            <DocNote>
              <InlineCode>Field</InlineCode> owns the form copy structure. Keep the control itself
              narrow: use{" "}
              <Link to="/components/input">
                <InlineCode>Input</InlineCode>
              </Link>
              ,{" "}
              <Link to="/components/textarea">
                <InlineCode>Textarea</InlineCode>
              </Link>
              , or another control inside it.
            </DocNote>
            <Preview previewClassName={PREVIEW_TOP_CLASS}>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.structure} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="compact-label" title="Compact label">
            <Preview previewClassName={PREVIEW_TOP_CLASS}>
              <Preview.Canvas>
                <FieldCompactLabelContent />
              </Preview.Canvas>
              <Preview.Code html={code.fieldCompactLabelComposition} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <Preview previewClassName={PREVIEW_TOP_CLASS}>
              <Preview.Canvas>
                <div className="grid w-80 gap-6">
                  <Field>
                    <FieldLabel htmlFor="field-state-email">Email</FieldLabel>
                    <Input id="field-state-email" placeholder="you@example.com" />
                    <FieldDescription>Use your work email.</FieldDescription>
                  </Field>
                  <Field invalid>
                    <FieldLabel htmlFor="field-state-invalid-email">Email</FieldLabel>
                    <Input id="field-state-invalid-email" data-invalid defaultValue="oops" />
                    <FieldError match>Email is required.</FieldError>
                  </Field>
                  <Field disabled>
                    <FieldLabel htmlFor="field-state-disabled-email">Email</FieldLabel>
                    <Input id="field-state-disabled-email" disabled placeholder="Disabled" />
                    <FieldDescription>This field is locked.</FieldDescription>
                  </Field>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="controls" title="Controls">
            <DocNote>
              Use <InlineCode>FieldItem</InlineCode> for choice controls where the label and helper
              copy should sit beside the control instead of above it.
            </DocNote>
            <Preview previewClassName={PREVIEW_TOP_CLASS}>
              <Preview.Canvas>
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
                        data-invalid
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
              </Preview.Canvas>
              <Preview.Code html={code.controls} collapsedHtml={code.controlsBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-field" title="Field">
            <PropsTable rows={FIELD_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-field-label" title="FieldLabel">
            <PropsTable rows={FIELD_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-field-description" title="FieldDescription">
            <PropsTable rows={FIELD_DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-field-error" title="FieldError">
            <PropsTable rows={FIELD_ERROR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-field-item" title="FieldItem">
            <PropsTable rows={FIELD_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-field-control" title="FieldControl">
            <PropsTable rows={FIELD_CONTROL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-field-validity" title="FieldValidity">
            <PropsTable rows={FIELD_VALIDITY_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
