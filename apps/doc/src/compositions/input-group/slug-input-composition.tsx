import { InputGroup, InputGroupAddon, InputGroupInput } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function InputGroupContent() {
  return (
    <InputGroup className="w-80 max-w-full min-w-0">
      <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
      <InputGroupInput aria-label="Server slug" placeholder="my-server" />
    </InputGroup>
  );
}

// @docs-source-strip-start
export function InputGroupSlugInputComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <InputGroupContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
