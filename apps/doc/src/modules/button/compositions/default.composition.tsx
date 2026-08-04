import { Button } from "raft-ui";

// @docs-source-strip-start
import { ButtonComparisonPreview } from "./comparison-preview.tsx";
// @docs-source-strip-end

export function ButtonContent() {
  return <Button>Default</Button>;
}

// @docs-source-strip-start
// Preview display shell only. Use ButtonContent above for real usage.
export function ButtonDefaultComposition({ className }: { className?: string }) {
  return (
    <ButtonComparisonPreview className={className}>
      <ButtonContent />
    </ButtonComparisonPreview>
  );
}
// @docs-source-strip-end
