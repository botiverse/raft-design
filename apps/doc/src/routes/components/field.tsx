import { createFileRoute } from "@tanstack/react-router";
import { Field, FieldDescription, FieldError, FieldLabel, Textarea } from "@slock-ui/ui";

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
  { id: "label", title: "Label" },
  { id: "invalid", title: "Invalid" },
  { id: "complete", title: "Complete field" },
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
  label: `<FieldLabel>Email address</FieldLabel>
<FieldLabel requiredMark>Email address</FieldLabel>
<FieldLabel optional>Email address</FieldLabel>
<FieldLabel size="sm">Email address</FieldLabel>
<FieldLabel className="uppercase tracking-wide">Email address</FieldLabel>`,
  complete: `<Field>
  <FieldLabel htmlFor="bio" requiredMark>Bio</FieldLabel>
  <Textarea id="bio" rows={3} maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} />
  <div className="flex justify-between gap-3">
    <FieldDescription>A short blurb for your profile.</FieldDescription>
    <Textarea.Counter value={bio} limit={160} />
  </div>
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
    description:
      "Bold label (htmlFor ties it to the control). Props: requiredMark (* marker), optional ((optional) tag), size (sm | md). Uppercase via className.",
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
        <Differences from="FormField">
          <li>
            composable pieces (<code>Field</code> / <code>FieldLabel</code> /{" "}
            <code>FieldDescription</code> / <code>FieldError</code>) instead of one prop-based
            component
          </li>
          <li>
            <code>FieldLabel</code> is plain by default (was uppercase; opt in via{" "}
            <code>className</code>)
          </li>
          <li>
            size <code>sm</code> / <code>md</code> (was <code>default</code> / <code>compact</code>)
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

      <DocSection id="label" title="Label">
        <div className="space-y-4">
          <Example html={code.label}>
            <div className="flex w-full flex-col items-start gap-3">
              <FieldLabel>Email address</FieldLabel>
              <FieldLabel requiredMark>Email address</FieldLabel>
              <FieldLabel optional>Email address</FieldLabel>
              <FieldLabel size="sm">Email address</FieldLabel>
              <FieldLabel className="uppercase tracking-wide">Email address</FieldLabel>
            </div>
          </Example>
          <Callout>
            Labels render as written. <code>requiredMark</code> adds a pink <code>*</code>;{" "}
            <code>optional</code> appends a muted <code>(optional)</code>; <code>size="sm"</code>{" "}
            dims and shrinks it for dense forms. For the brutal uppercase look, add{" "}
            <code>className="uppercase tracking-wide"</code> (last row).
          </Callout>
        </div>
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

      <DocSection id="complete" title="Complete field">
        <div className="space-y-4">
          <Example html={code.complete}>
            <div className="flex w-80 flex-col gap-6">
              <Field>
                <FieldLabel htmlFor="bio" requiredMark>
                  Bio
                </FieldLabel>
                <Textarea id="bio" rows={3} maxLength={160} defaultValue="Frontend engineer." />
                <div className="flex justify-between gap-3">
                  <FieldDescription>A short blurb for your profile.</FieldDescription>
                  <Textarea.Counter value="Frontend engineer." limit={160} />
                </div>
              </Field>
              <Field data-invalid>
                <FieldLabel htmlFor="bio-err" requiredMark>
                  Bio
                </FieldLabel>
                <Textarea id="bio-err" rows={3} aria-invalid maxLength={160} defaultValue="Hi." />
                <div className="flex justify-between gap-3">
                  <FieldError>Tell us a bit more about yourself.</FieldError>
                  <Textarea.Counter value="Hi." limit={160} />
                </div>
              </Field>
            </div>
          </Example>
          <Callout>
            The second field is <code>data-invalid</code>: the control border, the{" "}
            <code>FieldError</code>, and the <code>Textarea.Counter</code> all turn red — the
            counter via the <code>group</code> marker, even though it is under the limit.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
