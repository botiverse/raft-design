import { Field, FieldDescription, FieldLabel, Input } from "raft-ui";

export function FieldPreviewContent() {
  return (
    <Field className="w-80">
      <FieldLabel htmlFor="field-preview-email" required>
        Email
      </FieldLabel>
      <Input id="field-preview-email" type="email" placeholder="you@example.com" />
      <FieldDescription>Use your work email.</FieldDescription>
    </Field>
  );
}
