import { Field, FieldDescription, FieldLabel, Input } from "@botiverse/raft-ui";

export function FieldPreviewContent() {
  return (
    <Field className="w-80">
      <FieldLabel htmlFor="field-preview-email">Email</FieldLabel>
      <Input id="field-preview-email" type="email" placeholder="you@example.com" aria-required />
      <FieldDescription>Use your work email.</FieldDescription>
    </Field>
  );
}
