import { createFileRoute } from "@tanstack/react-router";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Textarea,
  TextareaCounter,
  TextareaGroup,
} from "@slock/ui";

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
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyFormField from "../../../../../packages/ui/src/legacy/FormField.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "label", title: "Label" },
  { id: "invalid", title: "Invalid" },
  { id: "complete", title: "Complete field" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = [
  "Add elegant family styling",
  "Move Input/Textarea onto Field-aware controls",
] as const;

const TEXTAREA_PREVIEW_CLASS = "!items-start !pt-20";

const SNIPPETS = {
  anatomy: `import { Field, FieldLabel, FieldDescription, Textarea } from "@slock/ui";

<Field>
  <FieldLabel htmlFor="msg">Message</FieldLabel>
  <FieldDescription>Enter your message below.</FieldDescription>
  <Textarea id="msg" placeholder="Type your message here." />
</Field>`,
  invalid: `<Field invalid>
  <FieldLabel htmlFor="msg">Message</FieldLabel>
  <Textarea id="msg" aria-invalid />
  <FieldError match>Please enter a valid message.</FieldError>
</Field>`,
  label: `<Field><FieldLabel>Email address</FieldLabel></Field>
<Field><FieldLabel required>Email address</FieldLabel></Field>
<Field><FieldLabel optional>Email address</FieldLabel></Field>
<Field><FieldLabel size="sm">Email address</FieldLabel></Field>
<Field><FieldLabel className="uppercase tracking-wide">Email address</FieldLabel></Field>`,
  complete: `import {
  Field,
  FieldDescription,
  FieldLabel,
  Textarea,
  TextareaCounter,
  TextareaGroup,
} from "@slock/ui";

<Field>
  <FieldLabel htmlFor="bio" required>Bio</FieldLabel>
  <TextareaGroup>
    <Textarea id="bio" rows={3} maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} />
    <TextareaCounter value={bio} limit={160} />
  </TextareaGroup>
  <FieldDescription>A short blurb for your profile.</FieldDescription>
</Field>`,
  sourcePropWrapper: `<FormField label="Email" htmlFor="source-email" required hint="Use your work email.">
  <input id="source-email" className="input-brutal" />
</FormField>`,
  currentComposition: `<Field>
  <FieldLabel htmlFor="current-email" required>Email</FieldLabel>
  <input id="current-email" className="input-brutal" />
  <FieldDescription>Use your work email.</FieldDescription>
</Field>`,
  sourceError: `<FormField label="Email" htmlFor="source-email-error" error="Email is required.">
  <input id="source-email-error" className="input-brutal" aria-invalid />
</FormField>`,
  currentError: `<Field invalid>
  <FieldLabel htmlFor="current-email-error">Email</FieldLabel>
  <input id="current-email-error" className="input-brutal" aria-invalid />
  <FieldError match>Email is required.</FieldError>
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
    type: "Base UI Field.Root",
    description:
      "Wrapper that stacks label / control / message. Use invalid for externally controlled errors, or validate/validationMode for Base UI validation.",
  },
  {
    name: "FieldLabel",
    type: "Base UI Field.Label",
    description:
      "Bold label. Props: required (* marker), optional ((optional) tag), size (sm | md), nativeLabel. Uppercase via className.",
  },
  {
    name: "FieldDescription",
    type: "Base UI Field.Description",
    description: "Muted helper text below the control. Registers itself for aria-describedby.",
  },
  {
    name: "FieldError",
    type: "Base UI Field.Error",
    description:
      "Red error message. By default follows Base UI validity; pass match={true} to force an externally controlled message.",
  },
  {
    name: "FieldItem",
    type: "Base UI Field.Item",
    description: "Groups checkbox/radio items with a label and description.",
  },
  {
    name: "FieldControl",
    type: "Base UI Field.Control",
    description:
      "Optional Base UI native input control. Input/Textarea can still be composed manually.",
  },
  {
    name: "FieldValidity",
    type: "Base UI Field.Validity",
    description: "Render-prop access to Base UI validity state.",
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
            built on Base UI&rsquo;s <code>Field.Root</code> / <code>Label</code> /{" "}
            <code>Description</code> / <code>Error</code> primitives
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
          defaultValues={{
            invalid: false,
            label: "Message",
            description: "Enter your message below.",
          }}
          controls={[
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
            { name: "description", label: "Description", type: "text" },
          ]}
          render={(values) => (
            <Field className="w-80" invalid={values.invalid}>
              <FieldLabel htmlFor="pg">{values.label}</FieldLabel>
              <Textarea id="pg" rows={4} aria-invalid={values.invalid || undefined} />
              {values.invalid ? (
                <FieldError match>Please enter a valid message.</FieldError>
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
              <Field>
                <FieldLabel>Email address</FieldLabel>
              </Field>
              <Field>
                <FieldLabel required>Email address</FieldLabel>
              </Field>
              <Field>
                <FieldLabel optional>Email address</FieldLabel>
              </Field>
              <Field>
                <FieldLabel size="sm">Email address</FieldLabel>
              </Field>
              <Field>
                <FieldLabel className="uppercase tracking-wide">Email address</FieldLabel>
              </Field>
            </div>
          </Example>
          <Callout>
            Labels render as written. <code>required</code> adds a pink <code>*</code>;{" "}
            <code>optional</code> appends a muted <code>(optional)</code>; <code>size="sm"</code>{" "}
            dims and shrinks it for dense forms. For the brutal uppercase look, add{" "}
            <code>className="uppercase tracking-wide"</code> (last row).
          </Callout>
        </div>
      </DocSection>

      <DocSection id="invalid" title="Invalid">
        <div className="space-y-4">
          <Example html={code.invalid} previewClassName={TEXTAREA_PREVIEW_CLASS}>
            <Field className="w-80" invalid>
              <FieldLabel htmlFor="invalid-msg">Message</FieldLabel>
              <Textarea id="invalid-msg" rows={4} aria-invalid defaultValue="oops" />
              <FieldError match>Please enter a valid message.</FieldError>
            </Field>
          </Example>
          <Callout>
            <code>invalid</code> on <code>Field</code> drives Base UI field state and any{" "}
            <code>TextareaCounter</code> through the emitted <code>data-invalid</code> marker;{" "}
            <code>aria-invalid</code> on non-Base-UI controls still drives the control border.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="complete" title="Complete field">
        <div className="space-y-4">
          <Example html={code.complete} previewClassName={TEXTAREA_PREVIEW_CLASS}>
            <div className="flex w-80 flex-col gap-6">
              <Field>
                <FieldLabel htmlFor="bio" required>
                  Bio
                </FieldLabel>
                <TextareaGroup>
                  <Textarea id="bio" rows={3} maxLength={160} defaultValue="Frontend engineer." />
                  <TextareaCounter value="Frontend engineer." limit={160} />
                </TextareaGroup>
                <FieldDescription>A short blurb for your profile.</FieldDescription>
              </Field>
              <Field invalid>
                <FieldLabel htmlFor="bio-err" required>
                  Bio
                </FieldLabel>
                <TextareaGroup>
                  <Textarea id="bio-err" rows={3} aria-invalid maxLength={160} defaultValue="Hi." />
                  <TextareaCounter value="Hi." limit={160} />
                </TextareaGroup>
                <FieldError match>Tell us a bit more about yourself.</FieldError>
              </Field>
            </div>
          </Example>
          <Callout>
            The second field is <code>invalid</code>: the control border, the{" "}
            <code>FieldError</code>, and the <code>TextareaCounter</code> all turn red — the counter
            via Base UI&rsquo;s emitted <code>data-invalid</code> marker, even though it is under
            the limit.
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
              label: "Prop wrapper to composition",
              status: "difference",
              note: "Source FormField owned label, required, hint, and error props. Current Field exposes Base UI parts so layout and messages are composed explicitly.",
              source: (
                <LegacyFormField
                  label="Email"
                  htmlFor="source-email"
                  required
                  hint="Use your work email."
                >
                  <input
                    id="source-email"
                    aria-label="Email"
                    className="w-80 border-2 border-black bg-white px-3 py-2 font-display shadow-[var(--shadow)]"
                  />
                </LegacyFormField>
              ),
              current: (
                <Field>
                  <FieldLabel htmlFor="current-email" required>
                    Email
                  </FieldLabel>
                  <input
                    id="current-email"
                    aria-label="Email"
                    className="w-80 border-2 border-black bg-white px-3 py-2 font-display shadow-[var(--shadow)]"
                  />
                  <FieldDescription>Use your work email.</FieldDescription>
                </Field>
              ),
              sourceCode: code.sourcePropWrapper,
              currentCode: code.currentComposition,
            },
            {
              label: "Error",
              status: "difference",
              note: "Source error prop always rendered the message. Current Field marks root invalid and FieldError opts into a forced external message with match.",
              source: (
                <LegacyFormField
                  label="Email"
                  htmlFor="source-email-error"
                  error="Email is required."
                >
                  <input
                    id="source-email-error"
                    aria-label="Email"
                    aria-invalid
                    className="w-80 border-2 border-brutal-red bg-brutal-red/5 px-3 py-2 font-display shadow-[var(--shadow)] ring-2 ring-brutal-red/60"
                  />
                </LegacyFormField>
              ),
              current: (
                <Field invalid>
                  <FieldLabel htmlFor="current-email-error">Email</FieldLabel>
                  <input
                    id="current-email-error"
                    aria-label="Email"
                    aria-invalid
                    className="w-80 border-2 border-brutal-red bg-brutal-red/5 px-3 py-2 font-display shadow-[var(--shadow)] ring-2 ring-brutal-red/60"
                  />
                  <FieldError match>Email is required.</FieldError>
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
