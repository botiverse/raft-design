import { Button } from "raft-ui";

// @docs-source-strip-start
import { ButtonComparisonPreview } from "./preview.tsx";
// @docs-source-strip-end

export function ButtonContent() {
  return <Button variant="outline">Outline</Button>;
}

// @docs-source-strip-start
// Source-comparison display shell only. Use ButtonContent above for real usage.
export function ButtonOutlineComposition({ className }: { className?: string }) {
  return (
    <ButtonComparisonPreview className={className}>
      <ButtonContent />
    </ButtonComparisonPreview>
  );
}
// @docs-source-strip-end
