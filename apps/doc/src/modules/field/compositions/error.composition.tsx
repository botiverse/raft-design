import { Input } from "raft-ui";
import { Field, FieldError, FieldLabel } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function FieldContent() {
  return (
    <Field className="w-72" invalid>
      <FieldLabel htmlFor="field-error-email">Email</FieldLabel>
      <Input
        id="field-error-email"
        type="email"
        data-invalid
        defaultValue="oops"
        placeholder="you@example.com"
      />
      <FieldError match>Email is required.</FieldError>
    </Field>
  );
}

// @docs-source-strip-start
export function FieldErrorComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <FieldContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
