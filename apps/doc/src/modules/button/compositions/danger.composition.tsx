import { Button } from "raft-ui";

// @docs-source-strip-start
import { ButtonComparisonPreview } from "./comparison-preview.tsx";
// @docs-source-strip-end

export function ButtonContent() {
  return <Button variant="danger">Danger</Button>;
}

// @docs-source-strip-start
// Source-comparison display shell only. Use ButtonContent above for real usage.
export function ButtonDangerComposition({ className }: { className?: string }) {
  return (
    <ButtonComparisonPreview className={className}>
      <ButtonContent />
    </ButtonComparisonPreview>
  );
}
// @docs-source-strip-end
