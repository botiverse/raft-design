import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldLabel, Textarea } from "@slock-ui/ui";

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
  { id: "counter", title: "Counter" },
  { id: "field", title: "With Field" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Textarea } from "@slock-ui/ui";

<Textarea rows={4} placeholder="Type your message here." />`,
  invalid: `<Textarea aria-invalid rows={4} defaultValue="oops" />`,
  counter: `<Textarea.Counter value={message} limit={120} />`,
  field: `import { Field, FieldLabel, Textarea } from "@slock-ui/ui";

<Field>
  <FieldLabel htmlFor="msg">Message</FieldLabel>
  <Textarea id="msg" rows={4} />
  <Textarea.Counter value={message} limit={120} />
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
    name: "ref",
    type: "Ref<HTMLTextAreaElement>",
    description: "Forwarded to the underlying textarea (React 19 ref prop).",
  },
  {
    name: "...props",
    type: "TextareaHTMLAttributes",
    description:
      "All native textarea attributes (value, onChange, rows, maxLength, placeholder, …).",
  },
];

const COUNTER_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "string",
    description: "Text whose length is counted (ignored when count is set).",
  },
  {
    name: "limit",
    type: "number",
    description: "Shown after the slash; the counter turns red once length exceeds it.",
  },
  {
    name: "count / getLength",
    type: "number / (value: string) => number",
    description: "Override the counted length (e.g. Unicode code points) instead of value.length.",
  },
];

export const Route = createFileRoute("/components/textarea")({
  component: TextareaDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TextareaDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Textarea"
      description="A brutal multi-line text field."
      overview={
        <Differences from="Textarea">
          <li>
            just the control — the built-in error message, hint, and counter are removed; use{" "}
            <a href="/components/field">Field</a> / <code>FieldError</code> and{" "}
            <code>Textarea.Counter</code>
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
          initial={{ invalid: false, placeholder: "Type your message here." }}
          controls={[
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "placeholder", label: "Placeholder", type: "text" },
          ]}
          render={(values) => (
            <Textarea
              className="w-80"
              rows={4}
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
            <Textarea className="w-80" aria-invalid rows={4} defaultValue="oops" />
          </Example>
          <Callout>
            The control styles its own red border/ring off <code>aria-invalid</code>; the error{" "}
            <em>message</em> lives in <code>FieldError</code>. Set <code>data-invalid</code> on the
            surrounding <code>Field</code> too so the counter turns red.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="counter" title="Counter">
        <div className="space-y-4">
          <Example html={code.counter}>
            <Textarea.Counter value="The quick brown fox." limit={120} />
            <Textarea.Counter value={"x".repeat(130)} limit={120} />
          </Example>
          <Callout>
            <code>Textarea.Counter</code> is standalone — pass the current <code>value</code> (or a{" "}
            <code>count</code> / <code>getLength</code> for Unicode-correct counting) and a{" "}
            <code>limit</code>. It turns red over the limit, or whenever its <code>Field</code> is{" "}
            <code>data-invalid</code>.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="field" title="With Field">
        <div className="space-y-4">
          <Example html={code.field}>
            <Field className="w-80">
              <FieldLabel htmlFor="msg">Message</FieldLabel>
              <Textarea id="msg" rows={4} placeholder="Type your message here." />
              <Textarea.Counter value="" limit={120} />
            </Field>
          </Example>
          <Callout>
            Label, description, and error message come from <a href="/components/field">Field</a> —
            Textarea stays a pure control.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <PropsTable rows={PROPS} />
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Textarea.Counter</h3>
            <PropsTable rows={COUNTER_PROPS} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
