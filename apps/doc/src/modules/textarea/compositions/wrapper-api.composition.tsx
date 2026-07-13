import { Textarea, TextareaCounter, TextareaGroup } from "raft-ui";
import { Field, FieldDescription } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function TextareaContent() {
  return (
    <Field className="w-80">
      <TextareaGroup>
        <Textarea aria-label="Message" rows={4} maxLength={120} defaultValue="Hello world." />
        <TextareaCounter value="Hello world." limit={120} />
      </TextareaGroup>
      <FieldDescription>Enter your message below.</FieldDescription>
    </Field>
  );
}

// @docs-source-strip-start
export function TextareaWrapperApiComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <TextareaContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
