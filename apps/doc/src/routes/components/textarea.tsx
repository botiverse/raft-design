import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldDescription, FieldError, FieldLabel, Textarea } from "@slock/ui";

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
import LegacyTextarea from "../../../../../packages/ui/src/legacy/Textarea.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "invalid", title: "Invalid" },
  { id: "counter", title: "Counter" },
  { id: "field", title: "With Field" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Textarea } from "@slock/ui";

<Textarea rows={4} placeholder="Type your message here." />`,
  invalid: `<Textarea aria-invalid rows={4} defaultValue="oops" />`,
  counter: `<Textarea.Counter value={message} limit={120} />`,
  field: `import { Field, FieldError, FieldLabel, Textarea } from "@slock/ui";

<Field invalid>
  <FieldLabel htmlFor="msg">Message</FieldLabel>
  <Textarea id="msg" rows={4} defaultValue="oops" />
  <div className="flex justify-between gap-3">
    <FieldError match>Message is required.</FieldError>
    <Textarea.Counter value="oops" limit={120} />
  </div>
</Field>`,
  sourceWrapper: `<Textarea
  className="w-80"
  rows={4}
  hint="Enter your message below."
  showCounter
  limit={120}
  defaultValue="Hello world."
/>`,
  currentComposition: `<Field className="w-80">
  <FieldLabel htmlFor="current-message">Message</FieldLabel>
  <Textarea id="current-message" rows={4} defaultValue="Hello world." />
  <div className="flex justify-between gap-3">
    <FieldDescription>Enter your message below.</FieldDescription>
    <Textarea.Counter value="Hello world." limit={120} />
  </div>
</Field>`,
  sourceError: `<Textarea
  className="w-80"
  rows={4}
  error="Message is required."
  showCounter
  limit={120}
  defaultValue="oops"
/>`,
  currentError: `<Field className="w-80" invalid>
  <Textarea rows={4} aria-invalid defaultValue="oops" />
  <div className="flex justify-between gap-3">
    <FieldError match>Message is required.</FieldError>
    <Textarea.Counter value="oops" limit={120} />
  </div>
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
    description:
      "Standalone invalid styling. Inside Field, prefer Field invalid and keep aria-invalid for native textarea styling.",
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
      "All native textarea attributes (value, onChange, rows, maxLength, placeholder, etc.).",
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
          <li>
            counter and messages are composed with <code>Field</code> instead of being owned by
            Textarea
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
            <em>message</em> lives in <code>FieldError</code>. When the textarea is inside{" "}
            <code>Field</code>, set <code>invalid</code> on the surrounding field so companion parts
            such as <code>Textarea.Counter</code> can follow the same state.
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
            <code>limit</code>. It turns red over the limit, or whenever its <code>Field</code> is
            invalid.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="field" title="With Field">
        <div className="space-y-4">
          <Example html={code.field}>
            <Field className="w-80" invalid>
              <FieldLabel htmlFor="msg">Message</FieldLabel>
              <Textarea id="msg" rows={4} defaultValue="oops" />
              <div className="flex justify-between gap-3">
                <FieldError match>Message is required.</FieldError>
                <Textarea.Counter value="oops" limit={120} />
              </div>
            </Field>
          </Example>
          <Callout>
            Label and message come from <a href="/components/field">Field</a>. Textarea stays a pure
            control; the counter is a composed companion part that reads the field state.
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Wrapper API to composition",
              status: "difference",
              note: "Source Textarea owned hint, error, and counter props. Current Textarea is only the native control skin; Field and Textarea.Counter own the surrounding form composition.",
              source: (
                <LegacyTextarea
                  aria-label="Message"
                  className="w-80"
                  rows={4}
                  hint="Enter your message below."
                  showCounter
                  limit={120}
                  defaultValue="Hello world."
                />
              ),
              current: (
                <Field className="w-80">
                  <FieldLabel htmlFor="current-message">Message</FieldLabel>
                  <Textarea id="current-message" rows={4} defaultValue="Hello world." />
                  <div className="flex justify-between gap-3">
                    <FieldDescription>Enter your message below.</FieldDescription>
                    <Textarea.Counter value="Hello world." limit={120} />
                  </div>
                </Field>
              ),
              sourceCode: code.sourceWrapper,
              currentCode: code.currentComposition,
            },
            {
              label: "Invalid state",
              status: "match",
              note: "Both versions use the same red border, tinted background, red ring, and no brutal black shadow while invalid. The current version moves the message and counter into composition.",
              source: (
                <LegacyTextarea
                  aria-label="Message"
                  className="w-80"
                  rows={4}
                  error="Message is required."
                  showCounter
                  limit={120}
                  defaultValue="oops"
                />
              ),
              current: (
                <Field className="w-80" invalid>
                  <Textarea rows={4} aria-label="Message" aria-invalid defaultValue="oops" />
                  <div className="flex justify-between gap-3">
                    <FieldError match>Message is required.</FieldError>
                    <Textarea.Counter value="oops" limit={120} />
                  </div>
                </Field>
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
