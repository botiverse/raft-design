import { Field, FieldDescription, FieldLabel, ScrollAreaTextarea } from "@botiverse/raft-ui";
import { textareaScrollAreaVariants } from "@botiverse/raft-ui/wip";

const draft = [
  "Review every pull request that touches the billing service.",
  "Check that each change has a test that fails without it.",
  "Read the migration first, then the code that depends on it.",
  "Flag any query that runs once per row.",
  "Leave one comment per finding, on the line it is about.",
  "Say which findings block the merge and which don't.",
  "Don't approve a change you haven't run.",
  "When the author disagrees, answer once, then ask a maintainer.",
].join("\n");

export function TextareaScrollingContent() {
  const { wrapper, textarea } = textareaScrollAreaVariants();

  return (
    <div className="w-80">
      <Field>
        <FieldLabel htmlFor="textarea-agent-instructions">Instructions</FieldLabel>
        <ScrollAreaTextarea
          id="textarea-agent-instructions"
          defaultValue={draft}
          wrapperClassName={wrapper({ className: "max-h-40" })}
          className={textarea({ className: "field-sizing-content" })}
        />
        <FieldDescription>The agent reads these before each review.</FieldDescription>
      </Field>
    </div>
  );
}
