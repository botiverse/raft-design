import { InputGroup, InputGroupAddon, InputGroupInput } from "raft-ui";
import { Search } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function InputGroupContent() {
  return (
    <InputGroup className="w-80 max-w-full min-w-0">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" aria-invalid defaultValue="oops" />
    </InputGroup>
  );
}

// @docs-source-strip-start
export function InputGroupInvalidStateComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <InputGroupContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
