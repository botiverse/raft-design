import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldDescription, FieldError, FieldLabel, Textarea } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
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
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { Field, FieldLabel, FieldDescription, Textarea } from "@slock-ui/ui";

<Field>
  <FieldLabel htmlFor="msg">Message</FieldLabel>
  <FieldDescription>Enter your message below.</FieldDescription>
  <Textarea id="msg" placeholder="Type your message here." />
</Field>`,
  invalid: `<Field data-invalid>
  <FieldLabel htmlFor="msg">Message</FieldLabel>
  <Textarea id="msg" aria-invalid />
  <FieldError>Please enter a valid message.</FieldError>
</Field>`,
} as const;

type PlaygroundValues = {
  invalid: boolean;
  label: string;
  description: string;
};

const PROPS: readonly PropRow[] = [
  {
    name: "Field",
    type: "div",
    description:
      "Wrapper that stacks label / control / message. Set data-invalid for the error look.",
  },
  {
    name: "FieldLabel",
    type: "label",
    description: "Bold uppercase label; pass htmlFor to tie it to the control.",
  },
  {
    name: "FieldDescription",
    type: "p",
    description: "Muted helper text below the control.",
  },
  {
    name: "FieldError",
    type: "p (role=alert)",
    description:
      "Red error message. Render in place of (or alongside) the description when invalid.",
  },
];

export const Route = createFileRoute("/components/field")({
  component: FieldDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function FieldDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Field"
      description="A composable form-field layout: label, control, description, and error."
      overview={
        <>
          A set of composable pieces — <code>Field</code>, <code>FieldLabel</code>,{" "}
          <code>FieldDescription</code>, <code>FieldError</code> — that wrap any control (Textarea,
          inputs, etc.) into a labelled row.
          <p className="mt-2">
            Mark <code>Field</code> with <code>data-invalid</code> (and the control with{" "}
            <code>aria-invalid</code>) to flip the whole field to the error look.
          </p>
        </>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ invalid: false, label: "Message", description: "Enter your message below." }}
          controls={[
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
            { name: "description", label: "Description", type: "text" },
          ]}
          render={(values) => (
            <Field className="w-80" data-invalid={values.invalid || undefined}>
              <FieldLabel htmlFor="pg">{values.label}</FieldLabel>
              <Textarea id="pg" rows={4} aria-invalid={values.invalid || undefined} />
              {values.invalid ? (
                <FieldError>Please enter a valid message.</FieldError>
              ) : values.description ? (
                <FieldDescription>{values.description}</FieldDescription>
              ) : null}
            </Field>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="invalid" title="Invalid">
        <div className="space-y-4">
          <Example html={code.invalid}>
            <Field className="w-80" data-invalid>
              <FieldLabel htmlFor="invalid-msg">Message</FieldLabel>
              <Textarea id="invalid-msg" rows={4} aria-invalid defaultValue="oops" />
              <FieldError>Please enter a valid message.</FieldError>
            </Field>
          </Example>
          <Callout>
            <code>data-invalid</code> on <code>Field</code> drives any <code>Textarea.Counter</code>{" "}
            to red via a <code>group</code> marker; <code>aria-invalid</code> on the control drives
            its border, and the message is a <code>FieldError</code>. Keep both flags in sync.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
