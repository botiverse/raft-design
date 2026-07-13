import { Button } from "raft-ui";
import { Plus } from "lucide-react";

// @docs-source-strip-start
import { ButtonComparisonPreview } from "./comparison-preview.tsx";
// @docs-source-strip-end

export function ButtonContent() {
  return (
    <Button variant="primary" size="icon-sm" aria-label="Add">
      <Plus />
    </Button>
  );
}

// @docs-source-strip-start
// Source-comparison display shell only. Use ButtonContent above for real usage.
export function ButtonIconOnlyComposition({ className }: { className?: string }) {
  return (
    <ButtonComparisonPreview className={className}>
      <ButtonContent />
    </ButtonComparisonPreview>
  );
}
// @docs-source-strip-end
