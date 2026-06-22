import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Field, FieldError, FieldLabel, InlineCode, Input } from "@raft/ui";
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
import inputDefaultCompositionSource from "#/compositions/input/default-composition.tsx?raw";
import inputDisabledStylingCompositionSource from "#/compositions/input/disabled-styling-composition.tsx?raw";
import inputInvalidDisabledPriorityCompositionSource from "#/compositions/input/invalid-disabled-priority-composition.tsx?raw";
import inputInvalidStateCompositionSource from "#/compositions/input/invalid-state-composition.tsx?raw";
import inputPasswordManagerSuppressionCompositionSource from "#/compositions/input/password-manager-suppression-composition.tsx?raw";
import {
  INPUT_SOURCE_COMPARISON_COMPOSITION,
  INPUT_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/input-source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "types", title: "Types" },
  { id: "states", title: "States" },
  { id: "field", title: "With Field" },
  { id: "password-managers", title: "Password managers" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import { Input } from "@raft/ui";

<Input aria-label="Email" placeholder="you@example.com" />`,
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
<Input aria-label="Email" aria-invalid defaultValue="oops" />
<Input aria-label="Email" disabled placeholder="Disabled" />
<Input aria-label="Email" aria-invalid disabled defaultValue="Locked error" />`,
  field: `import { Field, FieldError, FieldLabel, Input } from "@raft/ui";

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
  migrationShell: `// Source
<input className="input-brutal" placeholder="you@example.com" />

// Current
<Input aria-label="Email" placeholder="you@example.com" />`,
  migrationInvalid: `// Source
<input
  className="input-brutal !border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
  defaultValue="oops"
/>

// Current
<Input aria-label="Email" aria-invalid defaultValue="oops" />`,
  migrationField: `// Source
<FormField label="Email" error="Email is required.">
  <input className="input-brutal" defaultValue="oops" />
</FormField>

// Current
<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" defaultValue="oops" />
  <FieldError match>Email is required.</FieldError>
</Field>`,
} as const;

type PlaygroundValues = {
  disabled: boolean;
  invalid: boolean;
  placeholder: string;
  suppressPasswordManager: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "aria-invalid",
    type: "boolean",
    description:
      "Standalone invalid styling. Inside Field, prefer Field invalid; Base UI passes invalid state to the control.",
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

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

const InputCurrent = INPUT_SOURCE_COMPARISON_COMPOSITION;

const INPUT_COMPOSITION_RAW_SOURCES = {
  Default: inputDefaultCompositionSource,
  DisabledStyling: inputDisabledStylingCompositionSource,
  InvalidDisabledPriority: inputInvalidDisabledPriorityCompositionSource,
  InvalidState: inputInvalidStateCompositionSource,
  PasswordManagerSuppression: inputPasswordManagerSuppressionCompositionSource,
} as const;

const INPUT_COMPOSITION_SOURCES = createCompositionSourceMap(INPUT_COMPOSITION_RAW_SOURCES);

const INPUT_COMPOSITION_SNIPPET_IDS = {
  Default: "inputDefaultComposition",
  DisabledStyling: "inputDisabledStylingComposition",
  InvalidDisabledPriority: "inputInvalidDisabledPriorityComposition",
  InvalidState: "inputInvalidStateComposition",
  PasswordManagerSuppression: "inputPasswordManagerSuppressionComposition",
} as const;

type InputCompositionKey = keyof typeof INPUT_COMPOSITION_SOURCES;

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
  const inputComposition = (key: InputCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: INPUT_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: INPUT_COMPOSITION_SNIPPET_IDS,
      sources: INPUT_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Input"
      description="A single-line text control with theme-aware focus, invalid, and disabled states."
      headerAction={
        <Button
          render={<a href="/components/input/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <IconGridCircleOutline18 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            disabled: false,
            invalid: false,
            placeholder: "you@example.com",
            suppressPasswordManager: false,
          }}
          controls={[
            { name: "disabled", label: "Disabled", type: "boolean" },
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "placeholder", label: "Placeholder", type: "text" },
            {
              name: "suppressPasswordManager",
              label: "Suppress PM",
              type: "boolean",
            },
          ]}
          render={(values) => (
            <Input
              className="w-80"
              placeholder={values.placeholder}
              disabled={values.disabled}
              aria-invalid={values.invalid || undefined}
              suppressPasswordManager={values.suppressPasswordManager}
            />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Input.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="types" title="Types">
        <div className="space-y-4">
          <Example html={code.types}>
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
          </Example>
        </div>
      </DocSection>

      <DocSection id="states" title="States">
        <div className="space-y-4">
          <DocNote>
            <InlineCode>disabled</InlineCode> wins over <InlineCode>aria-invalid</InlineCode>. A
            disabled invalid input keeps the disabled border and removes the invalid ring because
            the user cannot edit it.
          </DocNote>
          <Example html={code.states}>
            <div className="grid w-full max-w-96 gap-3">
              <Input aria-label="Email" placeholder="you@example.com" />
              <Input aria-label="Email" defaultValue="alex@example.com" />
              <Input aria-label="Email" aria-invalid defaultValue="oops" />
              <Input aria-label="Email" disabled placeholder="Disabled" />
              <Input aria-label="Email" aria-invalid disabled defaultValue="Locked error" />
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="field" title="With Field">
        <div className="space-y-4">
          <DocNote>
            Label and message come from <Link to="/components/field">Field</Link>. Input stays a
            pure control; set <InlineCode>invalid</InlineCode> on the field when the message belongs
            to the same validation state.
          </DocNote>
          <Example html={code.field}>
            <Field className="w-80" invalid>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" defaultValue="oops" />
              <FieldError match>Email is required.</FieldError>
            </Field>
          </Example>
        </div>
      </DocSection>

      <DocSection id="password-managers" title="Password managers">
        <div className="space-y-4">
          <DocNote>
            Use <InlineCode>suppressPasswordManager</InlineCode> only for non-credential fields
            where extension overlays would cover custom UI. Credential fields should keep native
            browser and password-manager help.
          </DocNote>
          <Example html={code.passwordManagers}>
            <Input
              className="w-80"
              aria-label="Search"
              suppressPasswordManager
              placeholder="Search customers..."
            />
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Default",
              status: "match",
              note: "Source used the global input-brutal utility. Brutal keeps the same shell; Elegant remaps the same control API to the quieter input surface.",
              source: (
                <input
                  aria-label="Email"
                  className="input-brutal w-80"
                  placeholder="you@example.com"
                />
              ),
              brutal: <InputCurrent.Default />,
              elegant: <InputCurrent.Default />,
              elegantDark: <InputCurrent.Default />,
              ...inputComposition("Default"),
            },
            {
              label: "Invalid state",
              status: "match",
              note: "Source callers added red border/ring classes ad hoc. Current Input centralizes invalid styling behind aria-invalid or Field invalid.",
              source: (
                <input
                  aria-label="Email"
                  className="input-brutal w-80 !border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
                  defaultValue="oops"
                />
              ),
              brutal: <InputCurrent.InvalidState />,
              elegant: <InputCurrent.InvalidState />,
              elegantDark: <InputCurrent.InvalidState />,
              ...inputComposition("InvalidState"),
            },
            {
              label: "Disabled styling",
              status: "new",
              note: "Source input-brutal did not own a disabled visual state. Current Input adds one so unavailable fields remain readable without looking actionable.",
              source: <MissingSource />,
              brutal: <InputCurrent.DisabledStyling />,
              elegant: <InputCurrent.DisabledStyling />,
              elegantDark: <InputCurrent.DisabledStyling />,
              ...inputComposition("DisabledStyling"),
            },
            {
              label: "Invalid disabled priority",
              status: "new",
              note: "When invalid and disabled are both present, disabled wins because the user cannot edit the value in place.",
              source: <MissingSource />,
              brutal: <InputCurrent.InvalidDisabledPriority />,
              elegant: <InputCurrent.InvalidDisabledPriority />,
              elegantDark: <InputCurrent.InvalidDisabledPriority />,
              ...inputComposition("InvalidDisabledPriority"),
            },
            {
              label: "Password-manager suppression",
              status: "new",
              note: "A narrow escape hatch for non-credential fields where extension overlays obscure custom UI. It is intentionally opt-in.",
              source: <MissingSource />,
              brutal: <InputCurrent.PasswordManagerSuppression />,
              elegant: <InputCurrent.PasswordManagerSuppression />,
              elegantDark: <InputCurrent.PasswordManagerSuppression />,
              ...inputComposition("PasswordManagerSuppression"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
