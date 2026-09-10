import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCode, Input, Field, FieldError, FieldLabel } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSnippetMap, createCompositionSourceMap } from "#/lib/composition-code.ts";
import { InputPlaygroundPreview } from "#/modules/input/input.preview.tsx";
import inputPreviewCompositionSource from "#/modules/input/compositions/preview.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { Input } from "raft-ui";

<Input />`,
  types: `<Input
  aria-label="Email"
  type="email"
  name="email"
  autoComplete="email"
  spellCheck={false}
  placeholder="you@example.com"
/>

<Input
  aria-label="Verification code"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="123456"
/>`,
  states: `<Input aria-label="Email" placeholder="you@example.com" />
<Input aria-label="Email" defaultValue="alex@example.com" />
<Input aria-label="Email" data-invalid defaultValue="oops" />
<Input aria-label="Email" disabled placeholder="Disabled" />
<Input aria-label="Email" data-invalid disabled defaultValue="Locked error" />`,
  field: `import { Field, FieldError, FieldLabel, Input } from "raft-ui";

<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" defaultValue="oops" />
  <FieldError match>Email is required.</FieldError>
</Field>`,
  passwordManagers: `<Input
  aria-label="Search"
  suppressPasswordManager
  placeholder="Search customers..."
/>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "data-invalid",
    type: "boolean",
    description:
      "Standalone invalid styling; the control mirrors it to aria-invalid. Inside Field, prefer Field invalid; Base UI passes invalid state to the control.",
  },
  {
    name: "onValueChange",
    type: "(value, eventDetails) => void",
    description: "Base UI change callback for controlled composition.",
  },
  {
    name: "suppressPasswordManager",
    type: "boolean",
    default: "false",
    description:
      "Adds common password-manager ignore hints for non-credential fields where extension overlays would obscure custom UI.",
  },
  {
    name: "ref",
    type: "Ref<HTMLInputElement>",
    description: "Forwarded to the underlying input (React 19 ref prop).",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Replace the rendered element or compose with another component (Base UI).",
  },
  {
    name: "...props",
    type: "Base UI Input.Props",
    description: "All native input attributes (value, onChange, type, placeholder, etc.).",
  },
];

const INPUT_COMPOSITION_RAW_SOURCES = {
  Preview: inputPreviewCompositionSource,
} as const;

const INPUT_COMPOSITION_SOURCES = createCompositionSourceMap(INPUT_COMPOSITION_RAW_SOURCES);

const INPUT_COMPOSITION_SNIPPET_IDS = {
  Preview: "inputPreviewComposition",
} as const;

export const Route = createFileRoute("/components/input")({
  component: InputDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(INPUT_COMPOSITION_SOURCES, INPUT_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function InputDoc() {
  const code = Route.useLoaderData();
  return (
    <DocPage
      title="Input"
      description="A single-line text control with theme-aware focus, invalid, and disabled states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <InputPlaygroundPreview code={code.inputPreviewComposition} />
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
          <DocSubsection parentId="usage" id="types" title="Types">
            <Preview>
              <Preview.Canvas>
                <Input
                  className="w-80"
                  aria-label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="you@example.com"
                />
                <Input
                  className="w-80"
                  aria-label="Verification code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456"
                />
              </Preview.Canvas>
              <Preview.Code html={code.types} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <DocNote>
              <InlineCode>disabled</InlineCode> wins over <InlineCode>data-invalid</InlineCode>. A
              disabled invalid input keeps the disabled border and removes the invalid ring because
              the user cannot edit it.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <div className="grid w-full max-w-96 gap-3">
                  <Input aria-label="Email" placeholder="you@example.com" />
                  <Input aria-label="Email" defaultValue="alex@example.com" />
                  <Input aria-label="Email" data-invalid defaultValue="oops" />
                  <Input aria-label="Email" disabled placeholder="Disabled" />
                  <Input aria-label="Email" data-invalid disabled defaultValue="Locked error" />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="field" title="With Field">
            <DocNote>
              Label and message come from{" "}
              <Link to="/components/field">
                <InlineCode>Field</InlineCode>
              </Link>
              . <InlineCode>Input</InlineCode> stays a pure control; set{" "}
              <InlineCode>invalid</InlineCode> on the field when the message belongs to the same
              validation state.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <Field className="w-80" invalid>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" defaultValue="oops" />
                  <FieldError match>Email is required.</FieldError>
                </Field>
              </Preview.Canvas>
              <Preview.Code html={code.field} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="password-managers" title="Password managers">
            <DocNote>
              Use <InlineCode>suppressPasswordManager</InlineCode> only for non-credential fields
              where extension overlays would cover custom UI. Credential fields should keep native
              browser and password-manager help.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <Input
                  className="w-80"
                  aria-label="Search"
                  suppressPasswordManager
                  placeholder="Search customers..."
                />
              </Preview.Canvas>
              <Preview.Code html={code.passwordManagers} />
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
