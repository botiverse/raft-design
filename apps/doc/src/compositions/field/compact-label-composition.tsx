import { Input } from "cuvii-rui";
import { Field, FieldDescription, FieldLabel } from "cuvii-rui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function FieldContent() {
  return (
    <Field className="w-72">
      <FieldLabel htmlFor="display-name" size="sm">
        Display name
      </FieldLabel>
      <Input id="display-name" placeholder="you@example.com" />
      <FieldDescription>Use your work email.</FieldDescription>
    </Field>
  );
}

// @docs-source-strip-start
export function FieldCompactLabelComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <FieldContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
