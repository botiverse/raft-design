import { createFileRoute, Link } from "@tanstack/react-router";
import { Field, FieldError, FieldLabel, InlineCode, Input } from "@slock/ui";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "types", title: "Types" },
  { id: "states", title: "States" },
  { id: "field", title: "With Field" },
  { id: "password-managers", title: "Password managers" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "migration", title: "Migration" },
] as const;

const TODOS = [
  { status: "done", label: "Move the input-brutal shell into the Input recipe." },
  { status: "done", label: "Add elegant hover, focus, invalid, and disabled states." },
  { status: "done", label: "Document password-manager suppression for non-credential fields." },
] as const;

const SNIPPETS = {
  anatomy: `import { Input } from "@slock/ui";

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
  field: `import { Field, FieldError, FieldLabel, Input } from "@slock/ui";

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

export const Route = createFileRoute("/components/input")({
  component: InputDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function InputDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Input"
      description="A single-line text control with theme-aware focus, invalid, and disabled states."
      toc={TOC}
      sectionDividers={false}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

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
        <CodeBlock html={code.anatomy} />
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
              brutal: <Input aria-label="Email" className="w-80" placeholder="you@example.com" />,
              elegant: <Input aria-label="Email" className="w-80" placeholder="you@example.com" />,
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
              brutal: (
                <Input aria-label="Email" className="w-80" aria-invalid defaultValue="oops" />
              ),
              elegant: (
                <Input aria-label="Email" className="w-80" aria-invalid defaultValue="oops" />
              ),
            },
            {
              label: "Disabled styling",
              status: "new",
              note: "Source input-brutal did not own a disabled visual state. Current Input adds one so unavailable fields remain readable without looking actionable.",
              source: <MissingSource />,
              brutal: <Input aria-label="Email" className="w-80" disabled placeholder="Disabled" />,
              elegant: (
                <Input aria-label="Email" className="w-80" disabled placeholder="Disabled" />
              ),
            },
            {
              label: "Invalid disabled priority",
              status: "new",
              note: "When invalid and disabled are both present, disabled wins because the user cannot edit the value in place.",
              source: <MissingSource />,
              brutal: (
                <Input
                  aria-label="Email"
                  className="w-80"
                  aria-invalid
                  disabled
                  defaultValue="Locked error"
                />
              ),
              elegant: (
                <Input
                  aria-label="Email"
                  className="w-80"
                  aria-invalid
                  disabled
                  defaultValue="Locked error"
                />
              ),
            },
            {
              label: "Password-manager suppression",
              status: "new",
              note: "A narrow escape hatch for non-credential fields where extension overlays obscure custom UI. It is intentionally opt-in.",
              source: <MissingSource />,
              brutal: (
                <Input
                  aria-label="Search"
                  className="w-80"
                  suppressPasswordManager
                  placeholder="Search customers..."
                />
              ),
              elegant: (
                <Input
                  aria-label="Search"
                  className="w-80"
                  suppressPasswordManager
                  placeholder="Search customers..."
                />
              ),
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Shell</h3>
            <p className="text-sm text-gray-500">
              Replace the global <InlineCode>input-brutal</InlineCode> class with the themed Input
              recipe.
            </p>
            <CodeBlock html={code.migrationShell} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Invalid</h3>
            <p className="text-sm text-gray-500">
              Move red border and ring overrides to <InlineCode>aria-invalid</InlineCode>.
            </p>
            <CodeBlock html={code.migrationInvalid} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Field</h3>
            <p className="text-sm text-gray-500">
              Move labels, descriptions, and errors to <Link to="/components/field">Field</Link>.
            </p>
            <CodeBlock html={code.migrationField} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
