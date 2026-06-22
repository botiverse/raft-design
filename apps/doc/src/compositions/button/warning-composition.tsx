import { Button } from "@slock/ui";

// @docs-source-strip-start
import { ButtonComparisonPreview } from "./preview.tsx";
// @docs-source-strip-end

export function ButtonContent() {
  return <Button variant="warning">Warning</Button>;
}

// @docs-source-strip-start
// Source-comparison display shell only. Use ButtonContent above for real usage.
export function ButtonWarningComposition({ className }: { className?: string }) {
  return (
    <ButtonComparisonPreview className={className}>
      <ButtonContent />
    </ButtonComparisonPreview>
  );
}
// @docs-source-strip-end
