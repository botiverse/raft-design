import { Field, FieldError, Textarea, TextareaCounter, TextareaGroup } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function TextareaContent() {
  return (
    <Field className="w-80" invalid>
      <TextareaGroup>
        <Textarea rows={4} aria-label="Message" aria-invalid maxLength={120} defaultValue="oops" />
        <TextareaCounter value="oops" limit={120} />
      </TextareaGroup>
      <FieldError match>Message is required.</FieldError>
    </Field>
  );
}

// @docs-source-strip-start
export function TextareaInvalidStateComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <TextareaContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
