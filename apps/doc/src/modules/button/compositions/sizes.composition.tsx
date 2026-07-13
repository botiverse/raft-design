import { Button } from "raft-ui";

// @docs-source-strip-start
import { ButtonComparisonPreview } from "./comparison-preview.tsx";
// @docs-source-strip-end

export function ButtonContent() {
  return (
    <>
      <Button variant="primary" size="xs">
        XS
      </Button>
      <Button variant="primary" size="sm">
        SM
      </Button>
      <Button variant="primary" size="md">
        MD
      </Button>
      <Button variant="primary" size="lg">
        LG
      </Button>
    </>
  );
}

// @docs-source-strip-start
// Source-comparison display shell only. Use ButtonContent above for real usage.
export function ButtonSizesComposition({ className }: { className?: string }) {
  return (
    <ButtonComparisonPreview className={className} gap="loose" layout="grid">
      <ButtonContent />
    </ButtonComparisonPreview>
  );
}
// @docs-source-strip-end
