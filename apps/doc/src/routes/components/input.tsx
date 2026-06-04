import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldError, FieldLabel, Input } from "@slock/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "invalid", title: "Invalid" },
  { id: "field", title: "With Field" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Input } from "@slock/ui";

<Input placeholder="you@example.com" />`,
  invalid: `<Input aria-invalid defaultValue="oops" />`,
  field: `import { Field, FieldError, FieldLabel, Input } from "@slock/ui";

<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" defaultValue="oops" />
  <FieldError match>Email is required.</FieldError>
</Field>`,
  sourceShell: `<input className="input-brutal w-80" placeholder="you@example.com" />`,
  currentShell: `<Input className="w-80" placeholder="you@example.com" />`,
  sourceError: `<input
  className="input-brutal w-80 !border-brutal-red ring-2 ring-brutal-red/60 bg-brutal-red/5"
  defaultValue="oops"
/>`,
  currentError: `<Input className="w-80" aria-invalid defaultValue="oops" />`,
} as const;

type PlaygroundValues = {
  invalid: boolean;
  placeholder: string;
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
    name: "unstyled",
    type: "boolean",
    description:
      "Drops the brutal shell (border/shadow/invalid) so an InputGroup can own the look. Used by InputGroupInput.",
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

export const Route = createFileRoute("/components/input")({
  component: InputDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function InputDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Input"
      description="A brutal single-line text field."
      overview={
        <Differences from="input-brutal">
          <li>
            just the control — the label, hint, and error message are removed; use{" "}
            <a href="/components/field">Field</a> / <code>FieldLabel</code> /{" "}
            <code>FieldError</code>
          </li>
          <li>
            error state via <code>aria-invalid</code> instead of an <code>error</code> prop
          </li>
          <li>
            built on Base UI&rsquo;s <code>Input</code> so it can inherit <code>Field</code> state
            without extra wiring
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ invalid: false, placeholder: "you@example.com" }}
          controls={[
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "placeholder", label: "Placeholder", type: "text" },
          ]}
          render={(values) => (
            <Input
              className="w-80"
              placeholder={values.placeholder}
              aria-invalid={values.invalid || undefined}
            />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="invalid" title="Invalid">
        <div className="space-y-4">
          <Example html={code.invalid}>
            <Input className="w-80" aria-invalid defaultValue="oops" />
          </Example>
          <Callout>
            The control styles its own red border/ring off <code>aria-invalid</code>; the error{" "}
            <em>message</em> lives in <code>FieldError</code>. When the input is inside{" "}
            <code>Field</code>, set <code>invalid</code> on the surrounding field instead of
            duplicating state by hand.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="field" title="With Field">
        <div className="space-y-4">
          <Example html={code.field}>
            <Field className="w-80" invalid>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" defaultValue="oops" />
              <FieldError match>Email is required.</FieldError>
            </Field>
          </Example>
          <Callout>
            Label and message come from <a href="/components/field">Field</a>. Input stays a pure
            control, but Base UI lets it receive <code>data-invalid</code> /{" "}
            <code>aria-invalid</code> from the field root.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Brutal shell",
              status: "match",
              note: "Source used the global input-brutal CSS utility. Current Input moves that shell into a tv slot while preserving the same border, padding, display font, and shadow.",
              source: (
                <input
                  aria-label="Email"
                  className="input-brutal w-80"
                  placeholder="you@example.com"
                />
              ),
              current: <Input aria-label="Email" className="w-80" placeholder="you@example.com" />,
              sourceCode: code.sourceShell,
              currentCode: code.currentShell,
            },
            {
              label: "Invalid state",
              status: "match",
              note: "Source callers added red border/ring classes ad hoc. Current Input centralizes the same red border, tinted background, and ring behind aria-invalid, or receives it automatically from Field invalid.",
              source: (
                <input
                  aria-label="Email"
                  className="input-brutal w-80 !border-brutal-red ring-2 ring-brutal-red/60 bg-brutal-red/5"
                  defaultValue="oops"
                />
              ),
              current: (
                <Input aria-label="Email" className="w-80" aria-invalid defaultValue="oops" />
              ),
              sourceCode: code.sourceError,
              currentCode: code.currentError,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
