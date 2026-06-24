import { Input } from "raft-ui";
import { Field, FieldDescription, FieldLabel } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function FieldContent() {
  return (
    <Field className="w-72">
      <FieldLabel htmlFor="field-email" required>
        Email
      </FieldLabel>
      <Input id="field-email" type="email" placeholder="you@example.com" />
      <FieldDescription>Use your work email.</FieldDescription>
    </Field>
  );
}

// @docs-source-strip-start
export function FieldLabelControlHelperComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <FieldContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
