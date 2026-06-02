import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldLabel, Input } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "invalid", title: "Invalid" },
  { id: "field", title: "With Field" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Input } from "@slock-ui/ui";

<Input placeholder="you@example.com" />`,
  invalid: `<Input aria-invalid defaultValue="oops" />`,
  field: `import { Field, FieldLabel, Input } from "@slock-ui/ui";

<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" placeholder="you@example.com" />
</Field>`,
} as const;

type PlaygroundValues = {
  invalid: boolean;
  placeholder: string;
};

const PROPS: readonly PropRow[] = [
  {
    name: "aria-invalid",
    type: "boolean",
    description: "Flips the field to the red error look. Set it alongside Field's data-invalid.",
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
    name: "...props",
    type: "InputHTMLAttributes",
    description: "All native input attributes (value, onChange, type, placeholder, …).",
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
            <em>message</em> lives in <code>FieldError</code>. Set <code>data-invalid</code> on the
            surrounding <code>Field</code> too so descendants turn red.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="field" title="With Field">
        <div className="space-y-4">
          <Example html={code.field}>
            <Field className="w-80">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="you@example.com" />
            </Field>
          </Example>
          <Callout>
            Label, description, and error message come from <a href="/components/field">Field</a> —
            Input stays a pure control.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
