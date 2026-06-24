import { Input } from "cuvii-rui";
import { Field, FieldError, FieldLabel } from "cuvii-rui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function FieldContent() {
  return (
    <Field className="w-72" invalid>
      <FieldLabel htmlFor="field-error-email">Email</FieldLabel>
      <Input
        id="field-error-email"
        type="email"
        aria-invalid
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
    <SourceComparisonPreview className={className}>
      <FieldContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
