import { Field, FieldDescription, FieldLabel, Input } from "@botiverse/raft-ui";

export function FieldCompactLabelContent() {
  return (
    <Field className="w-80">
      <FieldLabel htmlFor="compact-label-display-name" size="sm">
        Display name
      </FieldLabel>
      <Input id="compact-label-display-name" aria-describedby="compact-label-description" />
      <FieldDescription id="compact-label-description">
        Shown to other workspace members.
      </FieldDescription>
    </Field>
  );
}
