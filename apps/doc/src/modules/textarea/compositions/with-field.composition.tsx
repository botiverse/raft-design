import { Field, FieldDescription, FieldError, FieldLabel, Textarea } from "raft-ui";

export function TextareaWithFieldContent() {
  return (
    <div className="grid w-80 gap-6">
      <Field>
        <FieldLabel htmlFor="textarea-project-summary">Project summary</FieldLabel>
        <Textarea id="textarea-project-summary" rows={4} defaultValue="Weekly launch update" />
        <FieldDescription>Keep the summary under 120 characters.</FieldDescription>
      </Field>

      <Field invalid>
        <FieldLabel htmlFor="textarea-invalid-message">Message</FieldLabel>
        <Textarea id="textarea-invalid-message" rows={4} aria-invalid defaultValue="" />
        <FieldError match>Message is required.</FieldError>
      </Field>
    </div>
  );
}
