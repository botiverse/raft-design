import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { ScrollAreaTextarea } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const draft = Array.from(
  { length: 12 },
  (_, index) => `${index + 1}. Notes from the design review, line ${index + 1}.`,
).join("\n");

export function ScrollAreaTextareaContent() {
  const [value, setValue] = useState(draft);
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value),
    [],
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <ScrollAreaTextarea
        aria-label="Meeting notes"
        value={value}
        onChange={handleChange}
        wrapperClassName="w-full rounded-control border-[1.5px] border-line-field bg-layer-card has-focus-visible:shadow-focus"
        className="h-40 w-full border-0 bg-transparent px-3 py-2.5 text-field text-foreground outline-none"
      />
      <p className="font-mono text-mono-meta text-foreground-muted">
        {value.split("\n").length} lines
      </p>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaTextareaComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaTextareaContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
